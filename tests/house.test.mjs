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
