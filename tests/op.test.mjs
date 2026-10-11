import test from 'node:test';import assert from 'node:assert/strict';import {createRequire} from 'node:module';import fs from 'node:fs';
// Operation Bell Jar on the ground (v0.68, v0.69): the kit, the steps, Aaron (fighting, hurt, down, getting you up), the drone, the
// truck, and a bot playing it through.
const {Fight}=await import('../dist/street/fight.js');const {StreetModel,TARGETS}=await import('../dist/street/model.js');
const K=await import('../dist/home/kit.js');const {count}=await import('../dist/home/bag.js');const {carrying}=await import('../dist/mc/assets/gear/bags.js');
const {OP_SPOTS,OP_WRECK,OP_BEACON,OP_APC,OP_CANS,OP_DROP,OP_PICKUP,MOVING,solidAt,MAP}=await import('../dist/street/data.js');
const {OP:BELL,beaconAt,wreckAt}=await import('../dist/street/op.js');const ZBITE=(await import('../dist/street/fight.js')).ZOMBIE.bite.damage;const {MATE}=await import('../dist/street/mate.js');
const {OP,OP_SPEAKERS}=await import('../dist/story/op.js');const {AARON,LEFT}=await import('../dist/street/opview.js');
const require=createRequire(import.meta.url);let createCanvas;try{({createCanvas}=require((process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES||'/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules')+'/@napi-rs/canvas'));}catch{}
const grid=carrying({pack:2}),T=Object.fromEntries(TARGETS.filter(t=>t.op).map(t=>[t.op,t]));
function setup(k=K.opKit(grid)){const box={k},m=new StreetModel(),f=new Fight(m,{kit:()=>box.k,setKit:v=>box.k=v,grid:()=>grid});m.zombies=f.zombies;f.start();return {box,m,f};}
const store=()=>{const d=new Map();return {getItem:k=>d.has(k)?d.get(k):null,setItem:(k,v)=>d.set(k,String(v)),removeItem:k=>d.delete(k),d};};
const rounds=k=>(k.guns['tactical-ar']?.ammo||0)+count(k.bag,'rounds');
// The bot: walks the route, shoots the nearest of the dead hunting it, reloads, falls back on the pistol and back to the rifle.
function bot({box,m,f},most=60*240){const ev=[],step=(input={})=>{m.update(1/60,input);f.update(1/60,input);for(const e of f.drain()){ev.push(e);if(e.type==='pickup'&&e.id==='rounds')box.k={...box.k,held:'tactical-ar'};}};
 const hands=()=>{const t=f.threat(280).filter(z=>Math.hypot(z.x-m.x,z.y-m.y)<260).sort((a,b)=>Math.hypot(a.x-m.x,a.y-m.y)-Math.hypot(b.x-m.x,b.y-m.y))[0];
  if(!f.ammo&&!f.reloadTime&&!f.reload()&&box.k.held==='tactical-ar')box.k={...box.k,held:'light-pistol'};return t?{aimX:t.x-m.x,aimY:t.y-m.y,fire:true}:{};};
 let n=0;const go=(x,y)=>{while(Math.hypot(m.x-x,m.y-y)>14&&n<most&&!f.down){const d=Math.hypot(x-m.x,y-m.y),h=hands();step({x:(x-m.x)/d,y:(y-m.y)/d,run:!h.fire,...h});n++;}};
 const wait=s=>{for(let i=0;i<s*60&&n<most;i++,n++){let h=hands();if(f.inAcid)h={...h,x:1,y:0};step(h);}},route=[[5720,3300],[5720,4700],[5700,4940],[5420,4930]];
 const back=(all=false)=>{const was=f.stats.downs;while(f.down&&n<most){step();n++;}if(all||f.stats.downs>was)for(const [x,y] of route)go(x,y);};
 back(true);for(const op of ['samples','beacon'])for(let i=0;i<20&&K.bellStep(box.k)===op&&n<most;i++){if(f.down)back();go(T[op].x,T[op].y);wait(.5);f.work(T[op]);wait(BELL.use[op]+.3);}
 while(K.bellStep(box.k)==='uplink'&&n<most){if(f.down){back();continue;}const d=Math.hypot(beaconAt.x-m.x,beaconAt.y-m.y);let h=hands();if(d>90)h={...h,x:(beaconAt.x-m.x)/d,y:(beaconAt.y-m.y)/d};else if(f.inAcid)h={...h,x:1,y:0};step(h);n++;}
 while(f.bell.truck?.state!=='wait'&&n<most)wait(1/60);if(K.bellStep(box.k)==='truck'){go(T.board.x,T.board.y);f.work(T.board);step();}
 return {ev,secs:n/60,types:ev.map(e=>e.type)};}

test('the operation\'s kit: the rifle, four magazines and the sidearm, saved apart from Marcus\'s night',()=>{
 const k=K.opKit(grid);assert.equal(k.phase,'op');assert.equal(k.held,'tactical-ar');assert.equal(k.guns['tactical-ar'].ammo,30);assert.equal(k.guns['light-pistol'].ammo,15);assert.equal(count(k.bag,'rounds'),90,'three more magazines in the pack');
 assert.equal(K.bellStep(k),'crash');assert.equal(K.goal(k),K.BELL_GOALS.crash);
 const s=store(),night={...K.normalizeHome(null),woke:true};K.saveHome(s,night);const before=s.getItem(K.HOME_KEY);K.saveHome(s,K.bellOn(k,'crash'));
 assert.equal(s.getItem(K.HOME_KEY),before,'Marcus\'s night is untouched');assert.equal(K.bellStep(K.readOpKit(s,grid)),'samples','the operation picks up where it was');
 let w=k;for(const st of K.BELL)w=K.bellOn(w,st);assert.equal(K.bellStep(w),'out');assert.equal(w.mission.out,true);
 assert.equal(K.bellStep(K.normalizeHome({...k,bell:{step:'nonsense'}},grid)),'crash','a bad save starts it over');});

test('the spots: each one only when its step comes, none of them on Marcus\'s night, and all of them reachable',()=>{
 for(const t of OP_SPOTS){assert.ok(TARGETS.some(x=>x.id===t.id),t.id);assert.ok(!solidAt(t.x,t.y,9),`${t.id} stands clear`);}
 const {box,f}=setup();assert.equal(f.bell.can(T.samples),false,'not before you reach the crash');assert.equal(f.bell.can(T.ammo),false,'the pack is full');
 box.k=K.bellOn(box.k,'crash');assert.equal(f.bell.can(T.samples),true);assert.equal(f.bell.can(T.beacon),false);assert.equal(f.bell.can(T.board),false);
 box.k={...box.k,bag:{items:[],spill:[]}};assert.equal(f.bell.can(T.ammo),true,'the cans when you are low');
 const night=setup({...K.normalizeHome(null),woke:true,light:true});for(const t of Object.values(T))assert.equal(night.f.bell.can(t),false,t.id);assert.equal(night.f.bell.truck,null);
 assert.ok(Math.hypot(OP_WRECK.x-OP_PICKUP.x,OP_WRECK.y-OP_PICKUP.y)<400,'the truck comes back for you at the crash');
 for(const [x,y] of [[OP_DROP.x,OP_DROP.y],[OP_PICKUP.x,OP_PICKUP.y],[OP_WRECK.x,OP_WRECK.y],[OP_BEACON.x,OP_BEACON.y]])assert.ok(x>0&&y>0&&x<MAP.w&&y<MAP.h);});

test('out of the truck: you and Aaron at the ramp, the truck and the wreck solid, and the dead out wandering',()=>{
 const {m,f}=setup(),A=f.bell.mate.m;assert.ok(Math.hypot(m.x-A.x,m.y-A.y)<40,'side by side');assert.ok(!m.blocked(m.x,m.y)&&!A.blocked(A.x,A.y),'neither stuck');
 assert.ok(MOVING.some(o=>o.id==='op-apc')&&MOVING.some(o=>o.id===OP_WRECK.id),'both solid');assert.ok(f.zombies.some(z=>z.roam!==undefined),'wanderers');
 assert.equal(m.others,null,'you never wait on Aaron');assert.deepEqual(A.others,[m],'he never walks through you');});

test('Aaron keeps up, shoots what hunts you, and never through you',()=>{
 const {m,f}=setup(),M=f.bell.mate;for(let i=0;i<60*4;i++){m.update(1/60,{x:0,y:1});f.update(1/60,{x:0,y:1});}
 assert.ok(Math.hypot(M.x-m.x,M.y-m.y)<MATE.run+40,`he follows (${Math.hypot(M.x-m.x,M.y-m.y)|0})`);
 // One of the dead straight ahead of him with you in between: he holds his fire.
 f.zombies.length=0;Object.assign(M.m,{x:m.x,y:m.y-60});const hp=60,z={kind:'shambler',look:'neighbour',x:m.x,y:m.y+60,hp,max:hp,state:'chase',roam:0,hunt:true,direction:6,frame:0,phase:0,t:0,vx:0,vy:0,stagger:0,tell:0,cool:0,flash:0,groan:9,delay:0};f.zombies.push(z);
 assert.equal(M.ray(Math.PI/2,200).you,true);const shots=f.stats.mateShots||0;M.shoot(z);assert.equal(f.stats.mateShots||0,shots,'no shot through you');assert.equal(z.hp,hp);
 // From the side, with a clear line, he takes it down.
 Object.assign(M.m,{x:m.x+80,y:m.y+60});M.target=null;M.pickT=0;for(let i=0;i<60*4&&z.hp>0;i++){m.update(1/60,{});f.update(1/60,{});}
 assert.ok(z.hp<=0,'he put it down');assert.ok(f.stats.mate>=1);assert.ok(f.traces.some(t=>t.mate)||f.stats.mateShots>0);});

test('walk into Aaron and he steps aside; you are never held up by him',()=>{
 const {m,f}=setup(),M=f.bell.mate;f.zombies.length=0;Object.assign(m,{x:5720,y:3600});Object.assign(M.m,{x:5720,y:3630});const y0=m.y;
 for(let i=0;i<60;i++){m.update(1/60,{x:0,y:1});f.update(1/60,{x:0,y:1});}assert.ok(m.y>y0+90,`you walked on (${(m.y-y0)|0})`);assert.ok(Math.abs(M.x-m.x)>8||Math.abs(M.y-m.y)>20,'he moved out of the way');});

test('the operation plays through: crash, samples, beacon, uplink, the truck in along Route 9, and aboard',()=>{
 for(const seed of [1,2,3]){const s=setup();s.f.seed=seed;s.f.start();const r=bot(s),k=s.box.k;
  assert.equal(K.bellStep(k),'out',`seed ${seed}: got out (stuck at ${K.bellStep(k)})`);assert.equal(k.mission.out,true);
  const order=['crash','samples','planted','uplinked','truckstop','truckwait','aboard'].map(t=>r.types.indexOf(t));assert.ok(order.every((i,j)=>i>=0&&(j===0||i>order[j-1])),`in order (${order})`);
  for(const q of BELL.uplink.air)assert.ok(r.ev.some(e=>e.type==='linking'&&e.k===q),`Gadget calls ${q}`);
  assert.ok(r.types.includes('horde'),'the strobe brings them');assert.ok(s.f.stats.mate>0,'Aaron put some down');assert.ok(r.secs<200,`${r.secs|0}s`);
  assert.ok(r.ev.find(e=>e.type==='aboard').stats.kills>=0);}});

// Ten seconds of the uplink with nothing about, standing by the beacon; returns how far the link got.
const linking=({box,m,f})=>{box.k=K.bellOn(K.bellOn(K.bellOn(box.k,'crash'),'samples'),'beacon');f.start();assert.equal(f.bell.step,'uplink');
 Object.assign(m,{x:beaconAt.x,y:beaconAt.y+20});f.zombies.length=0;for(let i=0;i<60*10;i++){m.update(1/60,{});f.update(1/60,{});}const was=f.bell.link;assert.ok(was>9&&was<=10.1,`linking (${was})`);return was;};
const run=({m,f},secs,until=()=>false,ev=[])=>{for(let i=0;i<secs*60&&!until();i++){m.update(1/60,{});f.update(1/60,{});ev.push(...f.drain());}return ev;};

test('down during the uplink: Aaron comes, gets you up where you fell, and the link holds while you are down',()=>{
 const S=setup(),{m,f}=S,was=linking(S);f.drain();
 f.hurt(999,{x:m.x+10,y:m.y});assert.ok(f.down>=BELL.revive.bleed-.01,'down for as long as you can lie there');assert.ok(f.bell.bleeding);run(S,.5);const at={x:m.x,y:m.y};
 const ev=run(S,BELL.revive.bleed,()=>!f.down);assert.ok(!f.down,'back up');assert.ok(ev.some(e=>e.type==='revived'));
 assert.ok(Math.hypot(m.x-at.x,m.y-at.y)<4,'where you fell');assert.equal(f.hp,BELL.revive.hp);assert.ok(f.safe>0,'a moment nothing can touch you');
 assert.ok(f.bell.link>=was-.05&&f.bell.link<=was+.1,`the link as it was (${f.bell.link.toFixed(2)} of ${was.toFixed(2)})`);assert.equal(f.stats.downs,0,'not back at the truck');
 const before=f.hp;f.hurt(30,{x:m.x+10,y:m.y});assert.equal(f.hp,before,'nothing bites through the moment after');
 const secs=ev.findIndex(e=>e.type==='revived');assert.ok(secs>=0);});

test('both down: back at the truck with the link as it was, slipping while you are away',()=>{
 const S=setup(),{m,f}=S,was=linking(S);f.bell.mate.hurt(999,{x:f.bell.mate.x+10,y:f.bell.mate.y});assert.ok(f.bell.mate.down,'Aaron down first');
 f.hurt(999,{x:m.x+10,y:m.y});assert.ok(f.down&&f.down<=3,'nobody to get you up');assert.ok(!f.bell.bleeding);for(let i=0;i<60*5&&f.down;i++){m.update(1/60,{});f.update(1/60,{});}
 assert.ok(!f.down,'back up');assert.ok(Math.hypot(m.x-OP_DROP.x,m.y-OP_DROP.y)<120,'at the truck');assert.ok(f.bell.link>0&&f.bell.link<was,`kept, a little slipped (${f.bell.link.toFixed(1)})`);
 assert.equal(f.bell.step,'uplink');assert.ok(!f.bell.mate.down,'Aaron back on his feet too');assert.equal(f.bell.mate.hp,MATE.hp);
 // And Aaron going down while you are: the same.
 const S2=setup(),was2=linking(S2);S2.f.hurt(999,{x:S2.m.x+10,y:S2.m.y});assert.ok(S2.f.bell.bleeding);const ev=[];S2.f.bell.mate.hurt(999,{x:S2.f.bell.mate.x+10,y:S2.f.bell.mate.y});ev.push(...S2.f.drain());
 assert.ok(ev.some(e=>e.type==='bothdown'));assert.ok(S2.f.down<=BELL.revive.both);run(S2,4,()=>!S2.f.down);assert.ok(Math.hypot(S2.m.x-OP_DROP.x,S2.m.y-OP_DROP.y)<120,'at the truck');assert.equal(S2.f.stats.downs,1);assert.ok(was2>0);});

test('Aaron hurt and down: the ordinary dead go for him, he waits on you, and you get him up',()=>{
 const S=setup(),{box,m,f}=S,M=f.bell.mate;f.zombies.length=0;Object.assign(m,{x:5720,y:3500,direction:2});run(S,1);const P=M.spot();Object.assign(M.m,{x:P.x,y:P.y});f.drain();
 // One of the ordinary dead much nearer him than you goes for him; a special just as near him still comes for you.
 f.patrol(true,{size:[1,1]});const z=f.zombies[0];const ux=(M.x-m.x)/Math.hypot(M.x-m.x,M.y-m.y),uy=(M.y-m.y)/Math.hypot(M.x-m.x,M.y-m.y);Object.assign(z,{x:M.x+ux*50,y:M.y+uy*50,delay:0,hunt:true,state:'chase'});
 f.lone('runner');const r=f.zombies.find(q=>q.kind==='runner');Object.assign(r,{x:M.x-ux*40+uy*40,y:M.y-uy*40-ux*40,delay:0});M.target=null;M.pickT=99;
 const hp=M.hp;const ev=run(S,3,()=>M.hp<hp);assert.ok(M.hp<hp,'bitten');assert.ok(z.prey,'it went for Aaron');assert.ok(!r.prey,'the special wants you');assert.ok(ev.some(e=>e.type==='matehurt'));
 assert.ok(hp-M.hp<=ZBITE*MATE.armor+.01,'his plate takes some of it');
 M.hurt(999,{x:M.x+10,y:M.y});assert.ok(M.down);f.zombies.length=0;run(S,1);
 const H=TARGETS.find(t=>t.id==='op-aaron');assert.ok(Math.hypot(H.x-M.x,H.y-M.y)<6,'the spot is on him');assert.ok(f.bell.can(H));
 const spot={x:M.x,y:M.y};run(S,2);assert.ok(Math.hypot(M.x-spot.x,M.y-spot.y)<1,'he stays where he fell');
 Object.assign(m,{x:M.x+20,y:M.y+6});assert.ok(f.work(H),'Help up');const ev2=run(S,BELL.use.revive+.3,()=>!M.down);
 assert.ok(!M.down,'up');assert.equal(M.hp,MATE.hp*.5);assert.ok(ev2.some(e=>e.type==='mateup'));assert.equal(f.stats.lifted,1);assert.ok(!f.bell.can(H),'nothing left to do there');assert.ok(H.x<0,'the spot gone again');});

test('the truck waits for Aaron: no boarding with him down',()=>{
 const {box,m,f}=setup();let k=box.k;for(const st of ['crash','samples','beacon','uplink'])k=K.bellOn(k,st);box.k=k;f.start();f.bell.truck.state='wait';
 assert.ok(f.bell.can(T.board));f.bell.mate.hurt(999,{x:0,y:0});assert.ok(!f.bell.can(T.board),'not without him');f.bell.mate.up();assert.ok(f.bell.can(T.board));});

test('the uplink brings a runner, a spitter and a brute, one at a time, and Aaron names each as it comes into sight',()=>{
 const S=setup(),{m,f}=S;linking(S);f.bell.ut=0;f.bell.specials=[...BELL.uplink.specials];f.bell.hordeT=999;const ev=[];
 for(let i=0;i<60*45;i++){m.update(1/60,{});f.update(1/60,{});f.bell.hordeT=999;for(const z of f.zombies)if(z.kind==='runner'||z.kind==='spitter'||z.kind==='brute')if(Math.hypot(z.x-m.x,z.y-m.y)>300)Object.assign(z,{x:m.x+200,y:m.y-80});ev.push(...f.drain());const named=new Set(ev.filter(e=>e.type==='matecall').map(e=>e.kind));for(const z of f.zombies)if(z.hp>0&&(z.kind==='runner'||z.kind==='spitter')&&named.has(z.kind))z.hp=0;}
 const kinds=ev.filter(e=>e.type==='special').map(e=>e.z.kind);assert.deepEqual(kinds.slice(0,3),['runner','spitter','brute'],kinds.join());
 const calls=ev.filter(e=>e.type==='matecall'&&e.say==='special').map(e=>e.kind);for(const k of ['runner','spitter','brute'])assert.ok(calls.includes(k),`Aaron names the ${k}: ${calls}`);
 for(const k of calls)assert.ok(OP.mate.special[k],k);});

test('Aaron calls one behind you, and drives the dead off him with the stock',()=>{
 const S=setup(),{m,f}=S,M=f.bell.mate;f.zombies.length=0;Object.assign(m,{x:5720,y:3500,aim:0});M.reset({x:5600,y:3460,direction:0});
 f.patrol(true,{size:[1,1]});const z=f.zombies[0];Object.assign(z,{x:m.x-60,y:m.y+10,delay:0,hunt:true,state:'chase'});
 const ev=run(S,1,()=>false);assert.ok(ev.some(e=>e.type==='matecall'&&e.say==='behind'),ev.map(e=>e.type+':'+e.say).join());
 f.zombies.length=0;f.patrol(true,{size:[2,2]});const [a,b]=f.zombies;Object.assign(a,{x:M.x+14,y:M.y,delay:0,hunt:true,state:'chase'});Object.assign(b,{x:M.x+16,y:M.y+8,delay:0,hunt:true,state:'chase'});
 M.bashT=0;M.target=a;M.aimT=1;const ev2=run(S,.4);assert.ok(ev2.some(e=>e.type==='mateshove'&&e.hit>=1),'the stock');assert.ok(a.stagger>0||b.stagger>0);});

test('running low, Gadget\'s drone brings a can, and not another until that one is picked up',()=>{
 const {box,m,f}=setup();box.k={...box.k,guns:{...box.k.guns,'tactical-ar':{ammo:10}},bag:{items:[],spill:[]}};f.zombies.length=0;Object.assign(m,{x:5720,y:3600});const ev=[];
 for(let i=0;i<60*4;i++){m.update(1/60,{});f.update(1/60,{});ev.push(...f.drain().map(e=>e.type));}
 assert.ok(ev.includes('drone')&&ev.includes('dropped'),ev.join());const d=f.drops.find(x=>x.drone);assert.ok(!d||d.id==='rounds');
 for(let i=0;i<60*3;i++){m.update(1/60,{});f.update(1/60,{});ev.push(...f.drain().map(e=>e.type));}
 assert.equal(ev.filter(t=>t==='drone').length,1,'one at a time');assert.ok(count(box.k.bag,'rounds')>=BELL.drone.n,'it flew to you');});

test('every line has a speaker, and the radio has a line for each call',()=>{
 const named=new Set([...Object.keys(OP_SPEAKERS),'you']);for(const [k,v] of Object.entries(OP.ground)){if(k==='title')continue;for(const [w,t] of v){assert.ok(named.has(w),`${k}: ${w}`);assert.ok(t.length>1&&t.length<140,t);}}
 for(const k of ['quarter','half','most','away','ammo','coming','more','down','mdown','both'])assert.ok(OP.air[k]?.length<90,k);
 for(const [k,v] of Object.entries(OP.mate))for(const t of typeof v==='string'?[v]:Array.isArray(v)?v:Object.values(v))assert.ok(t.length>1&&t.length<70,`${k}: ${t}`);assert.equal(OP.end.length,2);});

test('the operation\'s art paints: the truck with its ramp, the wreck with its cases and without, the beacon, the cans and the drone',{skip:!createCanvas},async()=>{
 const {propArt,PROP_PAD}=await import('../dist/mc/assets/props/base.js');const paint=(o,left=0)=>{const c=createCanvas((o.w+PROP_PAD*2+left)*2,(o.h+o.z+PROP_PAD*2)*2),g=c.getContext('2d');g.translate(left*2,0);propArt(g,o);const d=g.getImageData(0,0,c.width,c.height).data;let n=0;for(let i=3;i<d.length;i+=4)n+=d[i]>0;return {n,d,w:c.width};};
 const open=paint({kind:'apc',...OP_APC,x:0,y:0,open:true},LEFT),shut=paint({kind:'apc',...OP_APC,x:0,y:0},LEFT);assert.ok(open.n>shut.n,'the ramp is down');
 let ramp=0;for(let y=0;y<open.d.length/4/open.w;y++)for(let x=0;x<(LEFT+PROP_PAD-1)*2;x++)ramp+=open.d[(y*open.w+x)*4+3]>0;assert.ok(ramp>200,'and it is in the picture');
 const a=paint({...OP_WRECK}),b=paint({...OP_WRECK,taken:true});assert.ok(a.n>3000&&b.n>3000);assert.notDeepEqual(a.d,b.d,'the cases come out');
 for(const o of [{...OP_BEACON,on:true},{...OP_CANS,open:true},{kind:'drone',x:0,y:0,w:24,h:12,z:20,can:true}])assert.ok(paint(o).n>40,o.kind);});

test('the game takes you from the truck onto the ground, and back to Harlan Field at the end',()=>{
 const app=fs.readFileSync(new URL('../dist/study/app.js',import.meta.url),'utf8'),scene=fs.readFileSync(new URL('../dist/street/scene.js',import.meta.url),'utf8');
 assert.match(app,/function enterGround\(fresh\)/);assert.match(app,/function opEvent\(e\)/);assert.match(app,/usable:t=>homeKit\.phase==='op'\?/);assert.match(app,/TITLE_SKIP=[^;]*\|op\)/);
 assert.match(app,/heroLook=\(\)=>homeKit\.phase==='op'\?groundLook\(\)/);assert.match(scene,/this\.op=new OpView\(this\)/);assert.equal(AARON.gun,'tactical-ar');
 // Aaron's voice, his row under your health, and the street going grey while you lie there waiting on him.
 const html=fs.readFileSync(new URL('../dist/index.html',import.meta.url),'utf8'),css=fs.readFileSync(new URL('../dist/study/style.css',import.meta.url),'utf8');
 for(const t of ['matecall','matedown','mateup','revived','bothdown'])assert.match(app,new RegExp(`t==='${t}'`),t);assert.match(html,/id="lifeMate"/);assert.match(css,/body\.downed #game canvas/);
 assert.match(app,/audio\.play\('heartbeat'/);assert.match(scene,/'matehurt','matedown','mateup','revived'\]/);});
