import test from 'node:test';import assert from 'node:assert/strict';
import {HOME,HOUSE,ROOMS,DOORS,PETS,INSIDE,SOLIDS,PROPS,START,OBJECTS,Z} from '../dist/home/data.js';
import {HousePet,HOUSE_PET} from '../dist/companion/house.js';
import {HomeModel} from '../dist/home/model.js';
const seeded=(seed=7)=>()=>(seed=(seed*16807)%2147483647)/2147483647;
const inRect=(x,y,r,b)=>{const dx=x-Math.max(b.x,Math.min(x,b.x+b.w)),dy=y-Math.max(b.y,Math.min(y,b.y+b.h));return dx*dx+dy*dy<r*r;};
const blocked=(x,y,p)=>{const r=p.def.radius;if(x-r<INSIDE.left||x+r>INSIDE.right||y-r*.6<INSIDE.top||y+r*.4>INSIDE.bottom)return true;return SOLIDS.some(b=>inRect(x,y,r,b));};
// Horizontal walls hide the 48 units of floor north of them, so nothing a player should see may sit there.
const bands=PROPS.filter(o=>['wall','window','doorway','frontdoor'].includes(o.kind)).map(o=>({x:o.x,y:o.y-Z,w:o.w,h:Z}));
test('every pet spot is on open floor in its room and out from behind the walls',()=>{
 for(const def of PETS)for(const s of def.spots){const room=ROOMS.find(r=>r.id===s.room),name=`${def.id} ${s.pose} at ${s.x},${s.y}`;
  assert.ok(room,`${name} names a room`);assert.ok(s.x>=room.x&&s.x<=room.x+room.w&&s.y>=room.y&&s.y<=room.y+room.h,`${name} is in the ${room.id}`);
  assert.ok(!blocked(s.x,s.y,{def}),`${name} is not inside furniture`);
  assert.ok(!bands.some(b=>s.x>b.x&&s.x<b.x+b.w&&s.y>b.y&&s.y<b.y+b.h),`${name} is not hidden behind a wall`);}});
test('every room can be reached from every other through the doorways',()=>{
 for(const a of ROOMS){const seen=new Set([a.id]),q=[a.id];while(q.length){const r=q.shift();for(const d of DOORS){const n=d.a===r?d.b:d.b===r?d.a:null;if(n&&!seen.has(n)){seen.add(n);q.push(n);}}}
  assert.equal(seen.size,ROOMS.length,`from the ${a.id}`);}});
test('the dog and the cat keep their own routine round the house and never follow you',()=>{
 for(const def of PETS){const pet=new HousePet(def,{rooms:ROOMS,blocked,rand:seeded(def.id.length*31)}),you={x:START.x,y:START.y,moving:false};
  const visited=new Set(),rooms=new Set();let walked=0,last={x:pet.x,y:pet.y},close=0,stuck=0;
  for(let i=0;i<20*60*10;i++){pet.update(.1,you);
   // You wander about too, so the test sees how it reacts; it should not come after you.
   // (Never standing on one of its spots, so only coming after you could bring it close.)
   if(i%600===0){const k=i/600;you.x=INSIDE.left+40+(k*97)%(INSIDE.right-INSIDE.left-80);you.y=k%2?200:400;
    while(def.spots.some(s=>Math.hypot(s.x-you.x,s.y-you.y)<50))you.x=INSIDE.left+40+(you.x-INSIDE.left-40+37)%(INSIDE.right-INSIDE.left-80);}
   if(!pet.path.length&&!pet.hop)visited.add(pet.spot);rooms.add(pet.roomAt(pet.x,pet.y));
   walked+=Math.hypot(pet.x-last.x,pet.y-last.y);last={x:pet.x,y:pet.y};if(Math.hypot(pet.x-you.x,pet.y-you.y)<24)close++;if(pet.stuck>1)stuck++;
   assert.ok(pet.x>INSIDE.left&&pet.x<INSIDE.right&&pet.y>INSIDE.top&&pet.y<INSIDE.bottom,`${def.id} stays inside (${pet.x|0},${pet.y|0})`);
   if(!pet.hop&&!pet.perched)assert.ok(!SOLIDS.some(b=>inRect(pet.x,pet.y,def.radius*.5,b)),`${def.id} does not walk through furniture at ${pet.x|0},${pet.y|0}`);}
  assert.ok(visited.size>=def.spots.length-1,`${def.id} used ${visited.size} of ${def.spots.length} spots`);
  assert.ok(rooms.size>=3,`${def.id} went into ${[...rooms].join(', ')}`);assert.ok(walked>400,`${def.id} walked ${walked|0}`);
  assert.equal(stuck,0,`${def.id} always finds its way round the furniture`);
  assert.ok(close<20*60*10*.05,`${def.id} spent ${close} ticks right next to you`);}});
test('a pat makes it happy and it stays put a moment, facing you',()=>{
 const def=PETS[0],pet=new HousePet(def,{rooms:ROOMS,blocked,rand:seeded(3)}),you={x:pet.x+30,y:pet.y,moving:false};
 pet.pet(you);assert.equal(pet.happy,1.6);assert.equal(pet.direction,0);const at={x:pet.x,y:pet.y};
 for(let i=0;i<10;i++)pet.update(.1,you);assert.equal(pet.state,'sit');assert.deepEqual({x:pet.x,y:pet.y},at);
 assert.ok(HOUSE_PET.near<HOUSE_PET.glance);});
test('the survivor starts on open floor and can reach every object in the house',()=>{
 const m=new HomeModel();assert.ok(!m.blocked(START.x,START.y),'start is clear');
 for(const o of OBJECTS){assert.ok(o.x>INSIDE.left&&o.x<INSIDE.right&&o.y>INSIDE.top&&o.y<INSIDE.bottom,`${o.id} is inside`);
  assert.ok(o.lines?.length,`${o.id} has something to say`);}
 // Flood the floor from the start on a 4 unit grid; each object needs a reachable spot within its use range.
 const G=4,seen=new Set(),key=(x,y)=>x+','+y,q=[[START.x,START.y]];seen.add(key(START.x,START.y));
 while(q.length){const [x,y]=q.shift();for(const [dx,dy] of [[G,0],[-G,0],[0,G],[0,-G]]){const nx=x+dx,ny=y+dy,k=key(nx,ny);if(!seen.has(k)&&!m.blocked(nx,ny)){seen.add(k);q.push([nx,ny]);}}}
 const cells=[...seen].map(k=>k.split(',').map(Number));
 for(const o of OBJECTS)assert.ok(cells.some(([x,y])=>Math.hypot(o.x-x,o.y-y)<=(o.range||40)),`${o.id} can be reached`);
 for(const rm of ROOMS)assert.ok(cells.some(([x,y])=>x>rm.x&&x<rm.x+rm.w&&y>rm.y&&y<rm.y+rm.h),`the ${rm.id} can be walked into`);
 assert.ok(HOUSE.x>0&&HOUSE.x+HOUSE.w<HOME.w&&HOUSE.y+HOUSE.h<HOME.h);});
test('walking speed follows real time from the first step, not a smoothed 60 fps frame',async()=>{const fs=await import('node:fs');
 const app=fs.readFileSync(new URL('../dist/study/app.js',import.meta.url),'utf8');assert.match(app,/fps:\{smoothStep:false\}/);
 for(const f of ['home','camp'])assert.match(fs.readFileSync(new URL(`../dist/${f}/scene.js`,import.meta.url),'utf8'),/Math\.min\(\.05,delta\/1000\)/,`${f} caps a long frame`);
 assert.match(fs.readFileSync(new URL('../dist/study/scene.js',import.meta.url),'utf8'),/delta=Math\.min\(50,delta\)/);});
test('the first night: you wake, find the pistol and the shotgun with their rounds, and it is saved',async()=>{
 const {readHome,saveHome,normalizeHome,take,swap,goal,useLines,rounds,verbFor,spare,FINDS}=await import('../dist/home/kit.js');
 let k=normalizeHome();assert.deepEqual(k,{woke:false,guns:{},held:null,bag:{items:[],spill:[]},searched:[],street:'start'});assert.equal(goal(k),'');k={...k,woke:true};assert.match(goal(k),/protect yourself/);
 assert.equal(useLines(k,'frontdoor').act,undefined);assert.equal(useLines(k,'nightstand').act,'take:light-pistol');
 k=take(k,'light-pistol');assert.equal(k.held,'light-pistol');assert.equal(rounds(k),'15 / ∞','a pistol never runs out of spare rounds');assert.equal(spare(k,'light-pistol'),Infinity);assert.match(goal(k),/crashed down the street/,'one gun is enough to go and look');assert.equal(useLines(k,'frontdoor').act,'leave');assert.match(useLines(k,'frontdoor').lines.at(-1),/shotgun is still in the closet/);assert.equal(verbFor(k,'nightstand'),'Look');assert.equal(useLines(k,'nightstand').act,undefined);
 k=take(k,'pump-shotgun');assert.equal(k.held,'pump-shotgun');assert.equal(rounds(k),'8 / 16','the shotgun starts at 8 and 16');assert.match(goal(k),/crashed down the street/);
 assert.equal(take(k,'pump-shotgun'),k,'taking twice changes nothing');assert.equal(swap(k).held,'light-pistol');assert.equal(swap(swap(k)).held,'pump-shotgun');
 assert.equal(FINDS['pump-shotgun'].ammo,8);assert.deepEqual(FINDS['pump-shotgun'].bag,[['shells',16],['gun-oil',1]],'the shotgun comes with a box of 16 shells and gun oil');
 const store=new Map(),mem={getItem:x=>store.get(x)??null,setItem:(x,v)=>store.set(x,v)};assert.ok(saveHome(mem,k));assert.deepEqual(readHome(mem,undefined,false),k);assert.deepEqual(readHome(mem),normalizeHome(),'while the tutorial is built, every visit starts fresh');
 store.set('deadlight-home-v1','{"woke":true,"guns":{"pump-shotgun":{"ammo":99,"reserve":-3},"bazooka":{}},"held":"bazooka"}');assert.deepEqual(readHome(mem,undefined,false),{woke:true,guns:{'pump-shotgun':{ammo:8}},held:'pump-shotgun',bag:{items:[],spill:[]},searched:[],street:'start'});
 store.set('deadlight-home-v1','{"woke":true,"guns":{"pump-shotgun":{"ammo":5,"reserve":16}},"held":"pump-shotgun"}');assert.equal(rounds(readHome(mem,undefined,false)),'5 / 16','an older save moves its spare shells into the bag');
 assert.deepEqual(readHome({getItem(){throw new Error('blocked');}},undefined,false),normalizeHome());});
test('waking up on the couch plays through, brings both pets over for a pat, and hands control back',async()=>{
 const {Wake,WAKE_END,DOG_AT,CAT_AT,BEATS}=await import('../dist/home/wake.js');
 const you={x:0,y:0},blk=(x,y,p,plan)=>blocked(x,y,p)||(!plan&&Math.hypot(x-you.x,(y-you.y)*1.4)<p.def.radius+9);
 const [dog,cat]=PETS.map(def=>new HousePet(def,{rooms:ROOMS,blocked:blk,rand:seeded(5)}));cat.place(PETS[1].spots.find(s=>s.perch&&s.room==='living'&&s.perch.h<20));
 const w=new Wake({dog,cat,you});let t=0,petted=new Set(),said=new Set();
 while(!w.done&&t<60){you.x=w.x;you.y=w.y;w.update(.05);dog.update(.05,you);cat.update(.05,you);t+=.05;if(dog.happy)petted.add('dog');if(cat.happy)petted.add('cat');if(w.say)said.add(w.say);}
 assert.ok(w.done&&t<55,`it ends (${t.toFixed(1)} s)`);assert.deepEqual(w.cues,['distant-siren','car-pass','car-crash'],'the sirens, the cruiser going past and the crash');assert.equal(w.police,'parked');assert.equal(w.shook,1);assert.deepEqual([...petted].sort(),['cat','dog']);assert.equal(said.size,BEATS.filter(b=>b.say).length,'every line is shown');
 assert.ok(Math.hypot(dog.x-DOG_AT.x,dog.y-DOG_AT.y)<6&&Math.hypot(cat.x-CAT_AT.x,cat.y-CAT_AT.y)<6,'both pets came over');
 assert.deepEqual({x:you.x,y:you.y},{x:WAKE_END.x,y:WAKE_END.y});assert.ok(!new HomeModel().blocked(WAKE_END.x,WAKE_END.y),'you end on open floor');
 // Released, they go back to their own routine.
 for(let i=0;i<20*30;i++){dog.update(.05,you);cat.update(.05,you);}assert.ok(!dog.spot.called&&!cat.spot.called);});
test('skipping the wake-up puts everyone where the scene ends',async()=>{
 const {Wake,WAKE_END,DOG_AT}=await import('../dist/home/wake.js');const you={x:0,y:0};
 const [dog,cat]=PETS.map(def=>new HousePet(def,{rooms:ROOMS,blocked,rand:seeded(9)}));const w=new Wake({dog,cat,you});for(let i=0;i<40;i++)w.update(.05);w.skip();
 assert.ok(w.done);assert.equal(you.x,WAKE_END.x);assert.equal(you.direction,WAKE_END.direction);assert.deepEqual({x:dog.x,y:dog.y},DOG_AT);assert.equal(cat.perched,false);});
