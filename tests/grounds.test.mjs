import test from 'node:test';import assert from 'node:assert/strict';import {createRequire} from 'node:module';
import {TG,ARENA,GATE,GATE_DOOR,BUILDING,PROPS,SOLIDS,HATCHES,TARGETS,ROOM_NPCS,OBJECTS,START,TALK_RANGE,GADGET_TOPICS,AARON_ROOM_TOPICS,SHOP} from '../dist/grounds/data.js';
import {StudyModel,ROOM} from '../dist/study/model.js';import {Practice} from '../dist/study/practice.js';import {WAVES,BOT_HP,TYPES,HOLDOUT,botBlocked,waveMix} from '../dist/study/drill.js';
import {GUNS,PAINT} from '../dist/study/equipment.js';import {survivor} from '../dist/study/character.js';
import {readWallet,saveWallet,turnIn,buy,perks,mods,WALLET_KEY} from '../dist/study/wallet.js';
import {groundTiles,GROUND_TILE} from '../dist/grounds/art.js';
const require=createRequire(import.meta.url),{createCanvas}=require((process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES||'/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules')+'/@napi-rs/canvas');
// Every spot the survivor can stand on, flooded out from the bottom of the stairs.
function reach(m=new StudyModel()){const S=8,cols=Math.ceil(TG.w/S),rows=Math.ceil(TG.h/S),seen=new Uint8Array(cols*rows),q=[[Math.round(START.x/S),Math.round(START.y/S)]];seen[q[0][1]*cols+q[0][0]]=1;
 while(q.length){const [x,y]=q.pop();for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy,i=ny*cols+nx;if(nx<0||ny<0||nx>=cols||ny>=rows||seen[i]||m.blocked(nx*S,ny*S))continue;seen[i]=1;q.push([nx,ny]);}}
 return (x,y)=>{for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)if(seen[(Math.round(y/S)+dy)*cols+Math.round(x/S)+dx])return true;return false;};}
const inside=(o,b)=>o.x>=b.x&&o.x+o.w<=b.x+b.w&&o.y>=b.y&&o.y+o.h<=b.y+b.h;
test('the Training Grounds is a scrap building in a yard, a barricade with a gate, and the LEET AF post by the stairs',()=>{
 assert.ok(TG.w>=1900&&TG.h>=1900,'the cavern grew to fit the building');assert.ok(inside(BUILDING,ARENA),'the building stands in the yard');assert.ok(ROOM.bottom-GATE.y>300,'room for the post below the barricade');
 for(const o of PROPS){assert.ok(o.x>=0&&o.x+o.w<=TG.w&&o.y-o.z>=0&&o.y+o.h<=TG.h,o.id);}
 const ids=new Set(PROPS.map(o=>o.id));assert.equal(ids.size,PROPS.length,'prop ids are unique');
 for(let i=0;i<SOLIDS.length;i++)for(let j=i+1;j<SOLIDS.length;j++){const a=SOLIDS[i],b=SOLIDS[j];assert.ok(!(a.x<b.x+b.w&&b.x<a.x+a.w&&a.y<b.y+b.h&&b.y<a.y+a.h),a.id+' overlaps '+b.id);}
 for(const k of ['desk','server','counter','partscounter','botbench','pegboard','whiteboard','charger'])assert.ok(ids.has(k),k);
 // Walls of pallets, doors, sheet metal and plywood, with doorways and windows; five rooms.
 const walls=PROPS.filter(o=>o.wall&&inside(o,{x:BUILDING.x,y:BUILDING.y,w:BUILDING.w,h:BUILDING.h}));assert.ok(walls.length>30);for(const k of ['pallets','doors','sheet','plywood'])assert.ok(walls.some(o=>o.kind===k),k);
 assert.ok(PROPS.filter(o=>o.window).length>=8,'windows all round');assert.equal(BUILDING.rooms.length,5);
 // Aaron's shop and Gadget's parts counter stand side by side, facing the aisle up from the stairs.
 const shop=PROPS.find(o=>o.id==='counter'),parts=PROPS.find(o=>o.id==='partscounter');assert.equal(shop.y,parts.y);assert.ok(shop.x+shop.w<START.x&&parts.x>START.x,'the aisle runs between them');assert.ok(parts.x-(shop.x+shop.w)<=240);
 // The floor is cut into tiles small enough for a phone.
 const tiles=groundTiles();assert.ok(tiles.every(t=>t.w*2<=2048&&t.h*2<=2048));assert.equal(tiles.reduce((a,t)=>a+t.w*t.h,0),TG.w*TG.h);assert.equal(GROUND_TILE,1000);});
test('from the stairs you can walk to Aaron, Gadget, the gate, every room of the building and the hatches',()=>{const can=reach(),m=new StudyModel();assert.equal(m.blocked(START.x,START.y),false);
 for(const n of ROOM_NPCS){assert.ok(can(n.talk.x,n.talk.y),n.id);assert.ok(Math.hypot(n.talk.x-n.x,n.talk.y-n.y)<80,n.id+' talk spot is in front of them');}
 const [a,g]=ROOM_NPCS;assert.ok(Math.abs(a.x-g.x)<=420,'Aaron and Gadget work side by side');
 for(const o of OBJECTS)assert.ok(Math.hypot(o.x-START.x,o.y-START.y)<TALK_RANGE,'the stairs are right behind you when you arrive');
 for(const [,x,y] of BUILDING.rooms)assert.ok(can(x,y),'room at '+x+','+y);
 for(const [x,y] of [[GATE.x+GATE.w/2,GATE.y+9],[200,250],[1760,250],[200,1360],[1760,1360],...HATCHES.map(h=>[h.side==='n'?h.x:h.side==='w'?h.x+14:h.x-14,h.side==='n'?h.y+30:h.y])])assert.ok(can(x,y),x+','+y);});
test('windows stop your feet but not paint, and robots climb through them',()=>{const w=PROPS.find(o=>o.window),m=new StudyModel(),p=new Practice(m,{gun:'heavy-ar',grenade:'smoke'}),cx=w.x+w.w/2,cy=w.y+w.h/2;
 assert.equal(m.blocked(cx,cy),true);assert.equal(p.solid(cx,cy),false);assert.equal(botBlocked(cx,cy),false);});
test('Aaron and Gadget are LEET AF: Aaron runs the shop, Gadget the robots and the parts',()=>{const g=ROOM_NPCS.find(n=>n.id==='gadget'),a=ROOM_NPCS.find(n=>n.id==='aaron-room');assert.match(g.role,/LEET AF/);assert.match(a.role,/LEET AF/);assert.equal(g.look.body,1,'Gadget is a woman');
 assert.deepEqual(GADGET_TOPICS.filter(q=>q.act).map(q=>[q.act,q.when]),[['holdout','idle'],['drill','idle'],['stop','run'],['turnin','parts']]);assert.ok(GADGET_TOPICS.filter(q=>q.act!=='turnin').every(q=>q.a?.length));assert.ok(GADGET_TOPICS.some(q=>q.a.join(' ').includes('LZ-6')));
 assert.equal(AARON_ROOM_TOPICS[0].act,'shop');assert.ok(SHOP.length>=5&&SHOP.every(s=>s.price>0&&s.text));});
// A survivor who stands still and paints the nearest robot.
function drill(gun='heavy-ar',secs=240){const m=new StudyModel();m.x=980;m.y=1300;const p=new Practice(m,{gun,grenade:'smoke'}),d=p.drill;d.start();let maxY=0;
 for(let t=0;t<secs&&d.state==='run';t+=.02){const alive=d.bots.filter(b=>b.hp>0).sort((a,b)=>Math.hypot(a.x-m.x,a.y-m.y)-Math.hypot(b.x-m.x,b.y-m.y))[0];const aim=alive?{aimX:alive.x-m.x,aimY:alive.y-m.y,fire:Math.hypot(alive.x-m.x,alive.y-m.y)<260&&p.clear(m,alive)}:{};
  p.update(.02,aim);for(const b of d.bots)maxY=Math.max(maxY,b.y);}
 return {m,p,d,maxY};}
test('a drill sends three growing waves out of the hatches, the robots chase you but stay out of the post, and the result is timed',()=>{const {p,d,maxY}=drill();
 assert.equal(d.state,'done');assert.equal(d.bots.length,WAVES.reduce((a,b)=>a+b,0));assert.ok(d.bots.every(b=>b.hp<=0&&b.paint.length));assert.ok(maxY<GATE.y,'robots never cross the gate line');
 const s=d.summary;assert.equal(s.mode,'drill');assert.ok(s.time>10);assert.equal(s.shots,p.shots);assert.ok(s.hits>=Math.ceil(BOT_HP/GUNS['heavy-ar'].damage)*d.bots.length);assert.ok(s.accuracy>0&&s.accuracy<=1);
 assert.equal(d.pickups.length,0,'the drill drops no parts');d.stop();assert.equal(d.state,'idle');assert.equal(d.bots.length,0);});
test('drill robots that reach you bump and shove you, then back off; you can always step away',()=>{const m=new StudyModel();m.x=980;m.y=300;const p=new Practice(m,{gun:'none',grenade:'smoke'}),d=p.drill;d.start();let shoved=false;const x0=m.x,y0=m.y;
 for(let t=0;t<30&&d.bumps<2;t+=.02){p.update(.02,{});if(Math.hypot(m.x-x0,m.y-y0)>4)shoved=true;}
 assert.ok(d.bumps>=2);assert.ok(shoved,'a bump pushes you');assert.ok(d.drain().some(e=>e.type==='bump'));
 const b=d.bots.find(b=>b.hp>0&&Math.hypot(b.x-m.x,b.y-m.y)<40);if(b){const ux=(m.x-b.x)/Math.hypot(m.x-b.x,m.y-b.y),uy=(m.y-b.y)/Math.hypot(m.x-b.x,m.y-b.y);assert.equal(m.blocked(m.x+ux*2,m.y+uy*2),false,'stepping away from a robot is never blocked');}
 for(const h of HATCHES){const x=h.side==='n'?h.x:h.side==='w'?h.x+14:h.x-14,y=h.side==='n'?h.y+22:h.y;assert.equal(botBlocked(x,y),false,'hatches open onto clear floor');}});
test('paint lands where the ball stops: on the floor, on cover, on targets and on robots; reset cleans it all up',()=>{const m=new StudyModel();m.x=300;m.y=1000;m.direction=4;const p=new Practice(m,{gun:'light-pistol',grenade:'smoke'});
 p.fire();for(let i=0;i<40;i++)p.update(.02,{});assert.equal(p.marks.at(-1).kind,'floor');assert.equal(p.marks.at(-1).col,PAINT['light-pistol']);
 m.x=600;m.y=1298;m.direction=0;p.cooldown=0;p.fire();for(let i=0;i<20;i++)p.update(.02,{});assert.equal(p.marks.at(-1).kind,'prop');assert.match(p.marks.at(-1).id,/^yard-/);
 m.x=270;m.y=TARGETS[0].y;m.direction=4;p.cooldown=0;p.fire();for(let i=0;i<20;i++)p.update(.02,{});assert.equal(p.targets[0].paint.length,1);
 p.drill.start();const b={id:99,x:m.x+60,y:m.y,hp:BOT_HP,paint:[],flash:0,down:0};p.drill.bots.push(b);p.drill.queue=0;m.direction=0;p.cooldown=0;p.fire();assert.ok(b.hp<BOT_HP);for(let i=0;i<20;i++)p.update(.02,{});assert.equal(b.paint.length,1);
 const gen=p.markGen;p.reset();assert.equal(p.marks.length,0);assert.equal(p.markGen,gen+1);assert.equal(p.targets[0].paint.length,0);assert.equal(p.drill.state,'idle');});
test('every gun has a paintball twin: a hopper in its paint colour, only in the Training Grounds',()=>{assert.deepEqual(Object.keys(PAINT),Object.keys(GUNS));assert.equal(new Set(Object.values(PAINT)).size,5);
 for(const gun of Object.keys(GUNS)){const draw=paint=>{const c=createCanvas(160,192),g=c.getContext('2d');g.scale(2,2);survivor(g,1,0,true,{gun,paint});return g.getImageData(0,0,160,192).data;},plain=draw(undefined),painted=draw(PAINT[gun]);
  let diff=0,col=0;const [r,g,b]=[1,3,5].map(i=>parseInt(PAINT[gun].slice(i,i+2),16));for(let i=0;i<plain.length;i+=4){if(plain[i]!==painted[i]||plain[i+1]!==painted[i+1]||plain[i+2]!==painted[i+2])diff++;if(painted[i]===r&&painted[i+1]===g&&painted[i+2]===b)col++;}assert.ok(diff>10,gun);assert.ok(col>3,gun+' shows its paint');}});
// The Holdout.
function holdout(perks={},gun='heavy-ar'){const m=new StudyModel();m.x=980;m.y=1500;const p=new Practice(m,{gun,grenade:'smoke'}),d=p.drill;d.start('holdout',perks);return {m,p,d};}
test('a Holdout waits for you in the yard, locks the gate behind you, and mixes in a new robot each wave',()=>{const {m,p,d}=holdout();
 assert.equal(d.phase,'ready');assert.equal(d.gateClosed,false);p.update(.02,{});assert.equal(d.bots.length,0,'nothing comes until you go through');
 m.x=980;m.y=GATE.y-40;p.update(.02,{});assert.equal(d.gateClosed,true);assert.equal(m.gateClosed,true);assert.equal(m.blocked(GATE.x+GATE.w/2,GATE.y+8),true,'the gate is shut');
 assert.ok(d.drain().some(e=>e.type==='locked'));for(let i=0;i<HOLDOUT.startDelay/.02+2;i++)p.update(.02,{});assert.equal(d.phase,'wave');assert.equal(d.wave,1);
 const kinds=n=>waveMix(n).flatMap(g=>Array(g.pack||1).fill(g.kind));
 for(let n=1;n<=10;n++)assert.equal(kinds(n).length,5+2*n,'wave '+n);
 assert.deepEqual([...new Set(kinds(1))],['shambler']);assert.ok(kinds(2).includes('runner'));assert.ok(kinds(3).includes('husk'));assert.ok(kinds(4).includes('spitter'));assert.ok(kinds(5).includes('brute'));assert.ok(!kinds(4).includes('brute'));
 assert.ok(waveMix(2).find(g=>g.kind==='runner').pack>=3,'runners come in packs');assert.ok(kinds(10).filter(k=>k==='brute').length===2);
 d.stop();assert.equal(d.gateClosed,false);assert.equal(m.blocked(GATE.x+GATE.w/2,GATE.y+8),false);});
test('robots keep their weak spots: husks shrug off light guns unless you hit the head, and the brute only feels it in the back',()=>{const {d}=holdout(),husk={kind:'husk'},brute={kind:'brute',fx:1,fy:0,stun:0};d.mode='holdout';
 assert.equal(d.damage(husk,20,{gun:'light-pistol'}),7);assert.equal(d.damage(husk,20,{gun:'heavy-ar'}),20);assert.equal(d.damage(husk,20,{gun:'light-pistol',head:true}),40);assert.equal(d.damage({kind:'shambler'},20,{head:true}),40);
 // The brute faces east: a shot travelling west hits its padded front, one travelling east hits its back.
 assert.equal(d.damage(brute,30,{dx:-1,dy:0}),6);assert.equal(d.damage(brute,30,{dx:1,dy:0}),45);assert.equal(d.damage(brute,30,{dx:0,dy:1}),18);assert.equal(d.damage(brute,30,{dx:-1,dy:0,head:true}),6,'no headshots on the brute');
 assert.equal(d.damage(brute,30,{explosive:true}),30);assert.equal(d.damage({...brute,stun:1},30,{dx:-1,dy:0}),45,'a stunned brute is open');
 assert.ok(TYPES.brute.hp>=8*TYPES.shambler.hp);});
test('a dead-centre hit is a headshot',()=>{const {m,p,d}=holdout();d.phase='wave';m.x=120;m.y=700;m.direction=0;const b={id:1,kind:'husk',x:220,y:700,hp:70,max:70,paint:[],flash:0,down:0,fx:0,fy:1};d.bots.push(b);
 p.loadout.gun='light-pistol';p.ammo=5;p.fire();assert.equal(b.hp,70-44);const c={...b,id:2,y:800,hp:70};d.bots.push(c);m.y=810;p.cooldown=0;p.fire();assert.ok(Math.abs(c.hp-(70-22*.35))<1e-9,'off centre on a husk barely scratches');});
test('you go down, Gadget pulls you up once and shoves the robots back; the second time the run is over',()=>{const {m,p,d}=holdout();m.y=1300;p.update(.02,{});d.drain();d.phase='wave';d.groups=[{kind:'shambler'}];
 const b=d.make('shambler',m.x+30,m.y);d.hurtPlayer(d.maxHp,b);assert.equal(d.phase,'down');assert.equal(d.downed,true);assert.equal(d.revives,0);
 const x=m.x;p.update(.02,{x:1,fire:true});assert.equal(p.shots,0,'no shooting while down');d.hurtPlayer(50);assert.equal(d.hp,0,'no damage while down');
 for(let i=0;i<HOLDOUT.downTime/.02+3;i++)p.update(.02,{});assert.equal(d.phase,'wave');assert.equal(d.hp,HOLDOUT.revive);assert.ok(b.stun>0);assert.ok(Math.hypot(b.x-m.x,b.y-m.y)>30,'Gadget shoves them back');assert.ok(d.drain().some(e=>e.type==='revive'));
 d.hurtPlayer(999);assert.equal(d.state,'done');assert.equal(d.phase,'over');assert.equal(d.gateClosed,false,'the gate opens');assert.ok(d.bots.every(b=>b.hp<=0),'the robots power down');
 const s=d.summary;assert.equal(s.mode,'holdout');assert.equal(s.cleared,0);assert.ok(d.drain().some(e=>e.type==='over'));
 // A second wind buys one more pull; a padded vest adds health.
 const v=holdout({wind:true,vest:true}).d;assert.equal(v.revives,2);assert.equal(v.maxHp,HOLDOUT.hp+HOLDOUT.vest);});
test('robots drop broken parts where they fall; walk over them to pick them up',()=>{const {m,p,d}=holdout();m.y=1300;p.update(.02,{});d.phase='wave';d.groups=[{kind:'shambler'}];
 const b=d.make('husk',m.x+100,m.y);d.hurt(b,999,{explosive:true});assert.equal(d.pickups.length,TYPES.husk.parts);assert.equal(d.kills,1);
 for(let i=0;i<60;i++)p.update(.02,{});m.x=b.x;m.y=b.y;for(let i=0;i<60;i++)p.update(.02,{});assert.equal(d.pickups.length,0);assert.equal(d.parts,2);assert.equal(d.drain().filter(e=>e.type==='part').length,2);});
test('a spitter lobs paint from a distance; the puddle hurts while you stand in it',()=>{const {m,p,d}=holdout();m.y=1300;p.update(.02,{});d.phase='wave';d.groups=[{kind:'shambler'}];d.spawnIn=999;
 m.y=1380;const s=d.make('spitter',m.x+220,m.y);s.cool=0;let tell=false;for(let i=0;i<40&&!d.globs.length;i++){p.update(.02,{});if(s.frame===3)tell=true;}assert.ok(tell,'it shows its tell first');assert.equal(d.globs.length,1);
 const hp=d.hp;for(let i=0;i<80;i++)p.update(.02,{});assert.ok(d.puddles.length>=1);assert.ok(d.hp<hp,'standing still in the landing spot hurts');});
test('the brute paws, charges in a straight line, and stuns itself on a wall if you step aside',()=>{const {m,p,d}=holdout();m.x=150;m.y=1000;d.setGate(true);d.phase='wave';d.groups=[{kind:'shambler'}];d.spawnIn=999;
 const b=d.make('brute',360,1000);b.cool=0;p.update(.02,{});assert.equal(b.state,'wind');for(let i=0;i<HOLDOUT.charge.wind/.02+2;i++)p.update(.02,{});assert.equal(b.state,'charge');
 m.y=1080;let stunned=false;for(let i=0;i<80&&!stunned;i++){p.update(.02,{});if(b.stun>0)stunned=true;}assert.ok(stunned,'it hits the cave wall');assert.ok(b.x<200);});
test('the wallet: parts to Gadget for tokens, tokens to Aaron for gear that changes the run',()=>{let data=null;const storage={getItem:k=>{assert.equal(k,WALLET_KEY);return data;},setItem:(k,v)=>{data=v;}};
 const w=readWallet(storage);assert.deepEqual(w,{parts:0,chits:0,owned:[]});w.parts=75;assert.equal(turnIn(w),75);assert.equal(w.chits,75);assert.equal(w.parts,0);
 assert.equal(buy(w,'wind').reason,'short');assert.equal(buy(w,'hopper').ok,true);assert.equal(buy(w,'hopper').reason,'owned');assert.equal(w.chits,5);saveWallet(storage,w);
 const back=readWallet(storage);assert.deepEqual(back,{parts:0,chits:5,owned:['hopper']});data='{"parts":-3,"chits":"x","owned":["hopper","fake"]}';assert.deepEqual(readWallet(storage),{parts:0,chits:0,owned:['hopper']});
 assert.deepEqual(mods(back),{mag:1.3,reload:1});back.owned.push('loader','vest','wind');assert.deepEqual(perks(back),{vest:true,medkit:false,wind:true});
 const p=new Practice(new StudyModel(),{gun:'heavy-ar',grenade:'smoke'});p.setMods(mods(back));p.equip(p.loadout);assert.equal(p.mag,26);assert.equal(p.ammo,26);assert.ok(Math.abs(p.reloadFull-GUNS['heavy-ar'].reload*.75)<1e-9);});
test('holding out: a survivor who keeps shooting clears the first waves, the robots never reach the post, and the run ends with a score',()=>{const {m,p,d}=holdout();m.y=1300;let maxY=0;
 for(let t=0;t<600&&d.state==='run';t+=.02){const alive=d.bots.filter(b=>b.hp>0).sort((a,b)=>Math.hypot(a.x-m.x,a.y-m.y)-Math.hypot(b.x-m.x,b.y-m.y))[0];const aim=alive?{aimX:alive.x-m.x,aimY:alive.y-m.y,fire:Math.hypot(alive.x-m.x,alive.y-m.y)<300&&p.clear(m,alive)}:{};
  if(alive&&Math.hypot(alive.x-m.x,alive.y-m.y)<60){const dx=m.x-alive.x,dy=m.y-alive.y,l=Math.hypot(dx,dy);aim.x=dx/l;aim.y=dy/l;}m.update(.02,aim);p.update(.02,aim);for(const b of d.bots)maxY=Math.max(maxY,b.y);}
 assert.equal(d.state,'done');assert.ok(d.summary.cleared>=3,'cleared '+d.summary.cleared);assert.ok(maxY<GATE.y);assert.ok(d.kills>=30);});
