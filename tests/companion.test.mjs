import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import {COMPANION_KEY,SPECIES,BREEDS,MARKINGS,COATS,EYES,COLLARS,DEFAULT_PET,PET_OPTIONS,normalizeCompanion,cleanName,petLook,withLook,readCompanion,saveCompanion,randomPet,displayName} from '../dist/companion/look.js';
import {PET_FRAME,PET_ANIM,PET_FRAME_COUNT,paintPetSheet} from '../dist/companion/pet.js';
import {Follower,FOLLOW} from '../dist/companion/follow.js';
const seeded=(seed=7)=>()=>(seed=(seed*16807)%2147483647)/2147483647;
const memory=()=>{const store=new Map();return {store,getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,v)};};
// Paints a whole sheet into plain pixels so each cell can be checked.
function sheet(look){let out;const ctx={createImageData:(w,h)=>({width:w,height:h,data:new Uint8ClampedArray(w*h*4)}),putImageData:img=>{out=img;}};paintPetSheet(ctx,look);return out;}
function cell(img,d,f){const {w,h}=PET_FRAME;let n=0,minX=w,maxX=-1,minY=h,maxY=-1;for(let y=0;y<h;y++)for(let x=0;x<w;x++){const a=img.data[((f*h+y)*img.width+d*w+x)*4+3];if(a){n++;minX=Math.min(minX,x);maxX=Math.max(maxX,x);minY=Math.min(minY,y);maxY=Math.max(maxY,y);}}return {n,minX,maxX,minY,maxY};}
test('a companion is a dog or a cat with its own saved look and a short name',()=>{
 assert.deepEqual(SPECIES,['Dog','Cat']);assert.equal(BREEDS[0].length,4);assert.equal(BREEDS[1].length,2);
 const c=normalizeCompanion();assert.equal(c.species,0);assert.deepEqual(c.dog,DEFAULT_PET.dog);assert.deepEqual(c.cat,DEFAULT_PET.cat);assert.equal(c.name,'');assert.equal(displayName(c),'Your dog');assert.equal(displayName({...c,species:1}),'Your cat');
 for(const s of [0,1]){const o=PET_OPTIONS(s);assert.equal(o.breed,BREEDS[s]);assert.equal(o.marking,MARKINGS[s]);assert.equal(o.coat.length,COATS.length);assert.equal(o.eyes.length,EYES.length);assert.equal(o.collar.length,COLLARS.length);
  const rand=seeded(s+3);for(let i=0;i<200;i++){const r=randomPet(s,rand);for(const [k,list] of Object.entries(o))assert.ok(r[k]>=0&&r[k]<list.length,`${k} ${r[k]}`);}}
 assert.equal(cleanName('  Mochi\n the   very good dog'),'Mochi the very g');assert.equal(cleanName(null),'');
 const bad=normalizeCompanion({species:7,dog:{breed:9,coat:-1,marking:1.5,eyes:3,collar:6},cat:'x',name:'  Biscuit  '});
 assert.equal(bad.species,0);assert.deepEqual(bad.dog,{...DEFAULT_PET.dog,eyes:3,collar:6});assert.deepEqual(bad.cat,DEFAULT_PET.cat);assert.equal(bad.name,'Biscuit');});
test('switching between dog and cat keeps each look, and the choice survives a reload',()=>{
 let c=normalizeCompanion({name:'Mochi'});c=withLook(c,{...petLook(c),breed:3,coat:5});assert.deepEqual(petLook(c),{species:0,breed:3,coat:5,marking:DEFAULT_PET.dog.marking,eyes:0,collar:0});
 c={...c,species:1};assert.deepEqual(petLook(c),{species:1,...DEFAULT_PET.cat});c=withLook(c,{...petLook(c),breed:1});c={...c,species:0};assert.equal(petLook(c).breed,3,'the dog is still a husky');assert.equal(c.cat.breed,1,'and the cat is still a longhair');
 const s=memory();assert.equal(saveCompanion(s,c),true);assert.deepEqual(readCompanion(s),c);s.store.set(COMPANION_KEY,'{nope');assert.deepEqual(readCompanion(s),normalizeCompanion());assert.deepEqual(readCompanion(null),normalizeCompanion());
 assert.equal(saveCompanion({setItem(){throw new Error('full');}},c),false);});
test('every breed paints every facing and frame inside its cell',()=>{
 assert.equal(PET_FRAME_COUNT,Object.values(PET_ANIM).flat().length);
 for(const species of [0,1])for(let breed=0;breed<BREEDS[species].length;breed++){const look={species,...DEFAULT_PET[species?'cat':'dog'],breed},img=sheet(look);
  assert.equal(img.width,PET_FRAME.w*8);assert.equal(img.height,PET_FRAME.h*PET_FRAME_COUNT);
  for(let f=0;f<PET_FRAME_COUNT;f++)for(let d=0;d<8;d++){const b=cell(img,d,f),name=`${BREEDS[species][breed]} facing ${d} frame ${f}`;
   assert.ok(b.n>300,`${name} has a body (${b.n})`);assert.ok(b.minX>0&&b.minY>0&&b.maxX<PET_FRAME.w-1&&b.maxY<PET_FRAME.h-1,`${name} is not cut off`);
   assert.ok(b.maxY>=PET_FRAME.footY*2,`${name} reaches the ground (${b.maxY})`);}}});
test('coat, markings, eyes and collar each change the picture',()=>{
 const base={species:0,...DEFAULT_PET.dog},key=look=>Buffer.from(sheet(look).data).toString('base64'),plain=key(base);
 for(const k of ['coat','marking','eyes','collar'])assert.notEqual(key({...base,[k]:(base[k]+1)%PET_OPTIONS(0)[k].length}),plain,k);});
test('the companion trots after you, sits when you stop, lies down, and catches up when left behind',()=>{
 const p=new Follower(()=>false),you={x:0,y:0,direction:0,moving:true,running:false};p.place(-30,0);
 for(let i=0;i<120;i++){you.x+=1.5;p.update(1/60,you);}assert.ok(Math.hypot(you.x-p.x,you.y-p.y)<FOLLOW.behind+20,'keeps up');assert.ok(p.x<you.x,'stays behind');assert.equal(p.direction,0);assert.ok(PET_ANIM.walk.includes(p.frame)||PET_ANIM.run.includes(p.frame));
 you.moving=false;for(let i=0;i<120;i++)p.update(1/60,you);assert.equal(p.state,'sit');for(let i=0;i<60*FOLLOW.lie;i++)p.update(1/60,you);assert.equal(p.state,'lie');assert.equal(p.frame,PET_ANIM.lie[0]);
 p.pet();p.update(1/60,you);assert.equal(p.state,'sit','petting wakes it up');assert.ok(p.happy>0);
 const x=p.x,y=p.y;for(const d of [2,4,6]){you.direction=d;for(let i=0;i<30;i++)p.update(1/60,you);}assert.deepEqual([p.x,p.y],[x,y],'turning on the spot to face it does not chase it away');
 you.x+=1000;p.update(1/60,you);assert.ok(Math.hypot(you.x-p.x,you.y-p.y)<FOLLOW.behind+20,'a long way behind, it simply arrives');});
test('the companion steps around things and comes free if it gets stuck',()=>{
 const wall=(x,y)=>x>-6&&x<6&&y>-40&&y<40,p=new Follower(wall),you={x:40,y:0,direction:0,moving:true};p.place(-40,0);
 for(let i=0;i<600;i++)p.update(1/60,you);assert.ok(!wall(p.x,p.y));assert.ok(p.x>0,'it gets to your side of the wall');
 const box=new Follower((x,y)=>Math.hypot(x,y)>3);box.place(0,0);const far={x:60,y:0,direction:0,moving:true};for(let i=0;i<60*(FOLLOW.stuck+.5);i++)box.update(1/60,far);assert.ok(box.x>20,'stuck too long, it hops to you');});
test('the page offers the companion pages, the sit pose and the pet action',()=>{
 const html=fs.readFileSync(new URL('../dist/index.html',import.meta.url),'utf8');assert.match(html,/data-kind="companion"/);assert.match(html,/data-pose="sit"/);for(const id of ['pkind','pcoat','pdetail'])assert.match(html,new RegExp(`data-section="${id}"`),id);
 const app=fs.readFileSync(new URL('../dist/study/app.js',import.meta.url),'utf8');assert.match(app,/'Pet'/);});
