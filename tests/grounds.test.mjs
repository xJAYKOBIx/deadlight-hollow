import test from 'node:test';import assert from 'node:assert/strict';import {createRequire} from 'node:module';
import {TG,ARENA,GATE,PROPS,SOLIDS,HATCHES,TARGETS,ROOM_NPCS,OBJECTS,START,TALK_RANGE,GADGET_TOPICS} from '../dist/grounds/data.js';
import {StudyModel,ROOM} from '../dist/study/model.js';import {Practice} from '../dist/study/practice.js';import {WAVES,BOT_HP,botBlocked} from '../dist/study/drill.js';
import {GUNS,PAINT} from '../dist/study/equipment.js';import {survivor} from '../dist/study/character.js';
const require=createRequire(import.meta.url),{createCanvas}=require((process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES||'/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules')+'/@napi-rs/canvas');
// Every spot the survivor can stand on, flooded out from the bottom of the stairs.
function reach(){const m=new StudyModel(),S=8,cols=Math.ceil(TG.w/S),rows=Math.ceil(TG.h/S),seen=new Uint8Array(cols*rows),q=[[Math.round(START.x/S),Math.round(START.y/S)]];seen[q[0][1]*cols+q[0][0]]=1;
 while(q.length){const [x,y]=q.pop();for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy,i=ny*cols+nx;if(nx<0||ny<0||nx>=cols||ny>=rows||seen[i]||m.blocked(nx*S,ny*S))continue;seen[i]=1;q.push([nx,ny]);}}
 return (x,y)=>{for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)if(seen[(Math.round(y/S)+dy)*cols+Math.round(x/S)+dx])return true;return false;};}
test('the Training Grounds arena is two thirds of the old wave map, with an office strip and every prop inside the chamber',()=>{
 assert.deepEqual([ARENA.w,ARENA.h],[1600,1200]);assert.ok(ROOM.bottom-GATE.y>200,'room for the office below the barricade');
 for(const o of PROPS){assert.ok(o.x>=0&&o.x+o.w<=TG.w&&o.y-o.z>=0&&o.y+o.h<=TG.h,o.id);}
 const ids=new Set(PROPS.map(o=>o.id));assert.equal(ids.size,PROPS.length,'prop ids are unique');
 for(let i=0;i<SOLIDS.length;i++)for(let j=i+1;j<SOLIDS.length;j++){const a=SOLIDS[i],b=SOLIDS[j];assert.ok(!(a.x<b.x+b.w&&b.x<a.x+a.w&&a.y<b.y+b.h&&b.y<a.y+a.h),a.id+' overlaps '+b.id);}
 for(const k of ['desk','server','counter','botbench','pegboard','whiteboard','charger'])assert.ok(ids.has(k),k);});
test('from the stairs you can walk to Aaron, Gadget, the gate, the arena, the lane and the hatches',()=>{const can=reach(),m=new StudyModel();assert.equal(m.blocked(START.x,START.y),false);
 for(const n of ROOM_NPCS){assert.ok(can(n.talk.x,n.talk.y),n.id);assert.ok(Math.hypot(n.talk.x-n.x,n.talk.y-n.y)<80,n.id+' talk spot is in front of them');}
 for(const o of OBJECTS)assert.ok(Math.hypot(o.x-START.x,o.y-START.y)<TALK_RANGE,'the stairs are right behind you when you arrive');
 for(const [x,y] of [[GATE.x+GATE.w/2,GATE.y+9],[860,700],[200,250],[1560,250],[1500,1200],...HATCHES.map(h=>[h.x,h.y+30])])assert.ok(can(x,y),x+','+y);});
test('Aaron and Gadget are LEET AF, and Gadget runs the drill from her topics',()=>{const g=ROOM_NPCS.find(n=>n.id==='gadget'),a=ROOM_NPCS.find(n=>n.id==='aaron-room');assert.match(g.role,/LEET AF/);assert.match(a.role,/LEET AF/);assert.equal(g.look.body,1,'Gadget is a woman');
 assert.deepEqual(GADGET_TOPICS.filter(q=>q.act).map(q=>[q.act,q.when]),[['drill','idle'],['stop','run']]);assert.ok(GADGET_TOPICS.every(q=>q.a?.length));assert.ok(GADGET_TOPICS.some(q=>q.a.join(' ').includes('LZ-6')));});
// A survivor who stands in the middle of the arena and paints the nearest robot.
function drill(gun='heavy-ar',secs=240){const m=new StudyModel();m.x=860;m.y=880;const p=new Practice(m,{gun,grenade:'smoke'}),d=p.drill;d.start();let maxY=0,bumped=false;
 for(let t=0;t<secs&&d.state==='run';t+=.02){const alive=d.bots.filter(b=>b.hp>0).sort((a,b)=>Math.hypot(a.x-m.x,a.y-m.y)-Math.hypot(b.x-m.x,b.y-m.y))[0];const aim=alive?{aimX:alive.x-m.x,aimY:alive.y-m.y,fire:Math.hypot(alive.x-m.x,alive.y-m.y)<260&&p.clear(m,alive)}:{};
  p.update(.02,aim);for(const b of d.bots)maxY=Math.max(maxY,b.y);if(d.bumps)bumped=true;}
 return {m,p,d,maxY,bumped};}
test('a drill sends three growing waves out of the hatches, the robots chase you but stay out of the office, and the result is timed',()=>{const {p,d,maxY}=drill();
 assert.equal(d.state,'done');assert.equal(d.bots.length,WAVES.reduce((a,b)=>a+b,0));assert.ok(d.bots.every(b=>b.hp<=0&&b.paint.length));assert.ok(maxY<GATE.y,'robots never cross the gate line');
 const s=d.summary;assert.ok(s.time>10);assert.equal(s.shots,p.shots);assert.ok(s.hits>=Math.ceil(BOT_HP/GUNS['heavy-ar'].damage)*d.bots.length);assert.ok(s.accuracy>0&&s.accuracy<=1);
 // Gadget resets them: a new drill or calling it off clears the floor.
 d.stop();assert.equal(d.state,'idle');assert.equal(d.bots.length,0);});
test('robots that reach you bump and shove you, then back off; you can always step away',()=>{const m=new StudyModel();m.x=400;m.y=420;const p=new Practice(m,{gun:'none',grenade:'smoke'}),d=p.drill;d.start();let shoved=false;const x0=m.x,y0=m.y;
 for(let t=0;t<30&&d.bumps<2;t+=.02){p.update(.02,{});if(Math.hypot(m.x-x0,m.y-y0)>4)shoved=true;}
 assert.ok(d.bumps>=2);assert.ok(shoved,'a bump pushes you');assert.ok(d.drain().some(e=>e.type==='bump'));
 const b=d.bots.find(b=>b.hp>0&&Math.hypot(b.x-m.x,b.y-m.y)<40);if(b){const ux=(m.x-b.x)/Math.hypot(m.x-b.x,m.y-b.y),uy=(m.y-b.y)/Math.hypot(m.x-b.x,m.y-b.y);assert.equal(m.blocked(m.x+ux*2,m.y+uy*2),false,'stepping away from a robot is never blocked');}
 for(const h of HATCHES)assert.equal(botBlocked(h.x,h.y+22),false,'hatches open onto clear floor');});
test('paint lands where the ball stops: on the floor, on cover, on targets and on robots; reset cleans it all up',()=>{const m=new StudyModel();m.x=300;m.y=450;m.direction=0;const p=new Practice(m,{gun:'light-pistol',grenade:'smoke'});
 m.direction=4;p.fire();for(let i=0;i<40;i++)p.update(.02,{});assert.equal(p.marks.at(-1).kind,'floor');assert.equal(p.marks.at(-1).col,PAINT['light-pistol']);
 m.x=700;m.y=525;m.direction=0;p.cooldown=0;p.fire();for(let i=0;i<20;i++)p.update(.02,{});assert.equal(p.marks.at(-1).kind,'prop');assert.match(p.marks.at(-1).id,/^cover-/);
 m.x=1480;m.y=TARGETS[0].y;p.cooldown=0;p.fire();for(let i=0;i<20;i++)p.update(.02,{});assert.equal(p.targets[0].paint.length,1);
 p.drill.start();const b={id:99,x:m.x+60,y:m.y,hp:BOT_HP,paint:[],flash:0,down:0};p.drill.bots.push(b);p.drill.queue=0;p.cooldown=0;p.fire();assert.ok(b.hp<BOT_HP);for(let i=0;i<20;i++)p.update(.02,{});assert.equal(b.paint.length,1);
 const gen=p.markGen;p.reset();assert.equal(p.marks.length,0);assert.equal(p.markGen,gen+1);assert.equal(p.targets[0].paint.length,0);assert.equal(p.drill.state,'idle');});
test('every gun has a paintball twin: a hopper in its paint colour, only in the Training Grounds',()=>{assert.deepEqual(Object.keys(PAINT),Object.keys(GUNS));assert.equal(new Set(Object.values(PAINT)).size,5);
 for(const gun of Object.keys(GUNS)){const draw=paint=>{const c=createCanvas(160,192),g=c.getContext('2d');g.scale(2,2);survivor(g,1,0,true,{gun,paint});return g.getImageData(0,0,160,192).data;},plain=draw(undefined),painted=draw(PAINT[gun]);
  let diff=0,col=0;const [r,g,b]=[1,3,5].map(i=>parseInt(PAINT[gun].slice(i,i+2),16));for(let i=0;i<plain.length;i+=4){if(plain[i]!==painted[i]||plain[i+1]!==painted[i+1]||plain[i+2]!==painted[i+2])diff++;if(painted[i]===r&&painted[i+1]===g&&painted[i+2]===b)col++;}assert.ok(diff>10,gun);assert.ok(col>3,gun+' shows its paint');}});
