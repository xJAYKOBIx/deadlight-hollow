import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import {FISH,FISH_BY_ID,BASKET_SIZE,pickFish,sizeLabel,RULES,stance,Fishing,COOK,cookQuality,grilledBuff,STAMINA,Stamina,CAMP_KEY,normalizeCamp,readCamp,saveCamp,addToBasket,takeFromBasket,basketSummary} from '../dist/camp/fishing.js';
import {CampModel} from '../dist/camp/model.js';
import {OBJECTS} from '../dist/camp/data.js';
const seeded=(seed=11)=>()=>(seed=(seed*16807)%2147483647)/2147483647;
const COUNTER={away:{x:-1,y:0},up:{x:0,y:1},down:{x:0,y:-1}};
// Plays one cast with a strategy and returns how it ended.
function play(strategy,seed=3){const rand=seeded(seed),f=new Fishing(rand);f.cast();const ends=['landed','snapped','lost'];let t=0;
 while(!ends.includes(f.state)&&t<120){t+=1/30;f.update(1/30,strategy(f,t));}return {f,t};}
const perfect=f=>f.state==='bite'?{x:-1,y:0}:f.state==='fight'?{...COUNTER[f.pull.name],reel:false}:f.state==='slack'?{x:0,y:0,reel:true}:{x:0,y:0};
test('fish odds, weights and size labels stay in their ranges',()=>{
 assert.ok(Math.abs(FISH.reduce((s,f)=>s+f.chance,0)-1)<1e-9);const rand=seeded(5),seen={};
 for(let i=0;i<4000;i++){const c=pickFish(rand),f=FISH_BY_ID[c.id];seen[c.id]=(seen[c.id]||0)+1;assert.ok(c.w>=f.weight[0]-.01&&c.w<=f.weight[1]+.01,`${c.id} ${c.w}`);assert.ok(['Small','Good size','Trophy'].includes(sizeLabel(c)));}
 for(const f of FISH)assert.ok(Math.abs(seen[f.id]/4000-f.chance)<.03,`${f.id} turns up about as often as its chance`);
 assert.ok(seen.moonfin<seen.cod&&seen.cod<seen.perch,'the rare fish is rare');});
test('the stick counters a pull by pointing the opposite way',()=>{
 for(const [name,v] of Object.entries(COUNTER)){const pull={x:-v.x,y:-v.y,name};assert.equal(stance(v,pull),'counter');assert.equal(stance({x:-v.x,y:-v.y},pull),'with');assert.equal(stance({x:0,y:0},pull),'neutral');assert.equal(stance({x:v.x*.2,y:v.y*.2},pull),'neutral','a resting thumb does nothing');}});
test('a steady hand lands the fish; reeling through every fight snaps the line',()=>{
 for(let seed=1;seed<=30;seed++){const {f,t}=play(perfect,seed);assert.equal(f.state,'landed',`seed ${seed}`);assert.ok(t<45,`seed ${seed} took ${t.toFixed(1)}s`);assert.equal(f.line,0);}
 let snapped=0;for(let seed=1;seed<=30;seed++){const {f}=play(f=>f.state==='bite'?{x:-1,y:0}:{x:0,y:0,reel:true},seed);snapped+=f.state==='snapped';}assert.equal(snapped,30,'reeling while the fish fights always snaps');
 let pulledWith=0;for(let seed=1;seed<=10;seed++){const {f}=play(f=>f.state==='bite'?{x:-1,y:0}:f.state==='fight'?{x:f.pull.x,y:f.pull.y}:{x:0,y:0,reel:true},seed);pulledWith+=f.state==='snapped';}assert.equal(pulledWith,10,'pulling the same way as the fish snaps the line');});
test('the bite must be hooked in time, and pulling early spooks the fish',()=>{
 const {f}=play(()=>({x:0,y:0}),4);assert.equal(f.state,'lost');
 const g=new Fishing(seeded(2));g.cast();for(let i=0;i<30;i++)g.update(1/30,{x:0,y:0});assert.equal(g.state,'wait');g.update(1/30,{x:-1,y:0});assert.equal(g.state,'early');assert.ok(g.events.includes('early'));
 for(let i=0;i<40;i++)g.update(1/30,{x:0,y:0});assert.equal(g.state,'wait','the wait starts over');
 const h=new Fishing(seeded(2));assert.equal(h.cast(),true);assert.equal(h.cast(),false,'no recasting mid-cast');});
test('the line only shortens while the fish is tired and you reel',()=>{
 const f=new Fishing(seeded(9));f.cast();let t=0;while(f.state!=='slack'&&t<60){t+=1/30;f.update(1/30,perfect(f));}assert.equal(f.state,'slack');
 const line=f.line;f.update(.1,{x:0,y:0});assert.equal(f.line,line,'no reel, no progress');f.update(.1,{x:0,y:0,reel:true});assert.ok(f.line<line);assert.equal(f.tension,0,'a tired fish puts no strain on the line');});
test('grilling rewards timing, size and species, and never health',()=>{
 assert.equal(cookQuality(0),'raw');assert.equal(cookQuality(COOK.done),'done');assert.equal(cookQuality(COOK.perfect),'perfect');assert.equal(cookQuality(COOK.burnt),'burnt');assert.equal(cookQuality(1),'burnt');
 const c={id:'mackerel',w:1},q=['raw','burnt','done','perfect'].map(k=>grilledBuff(c,k));for(let i=1;i<q.length;i++){assert.ok(q[i].max>=q[i-1].max);assert.ok(q[i].regen>=q[i-1].regen);}
 assert.ok(grilledBuff({id:'cod',w:3},'perfect').max>grilledBuff({id:'perch',w:.4},'perfect').max,'a big cod beats a small perch');
 for(const f of FISH)for(const k of ['raw','done','perfect','burnt'])for(const w of f.weight){const b=grilledBuff({id:f.id,w},k);assert.ok(b.max>=8&&b.max<=70);assert.ok(b.regen>=1&&b.regen<2);assert.deepEqual(Object.keys(b).sort(),['fish','max','quality','regen','w']);}
 assert.ok(Math.abs(COOK.perfect/COOK.rate-3.6)<1e-9,'the perfect window opens 3.6 seconds in');});
test('stamina drains while running, winds you when empty and comes back after a rest',()=>{
 const s=new Stamina();assert.equal(s.max,STAMINA.base);let t=0;while(s.canRun()&&t<20){s.update(.05,true);t+=.05;}
 assert.ok(Math.abs(t-STAMINA.base/STAMINA.drain)<.1,`about ${(STAMINA.base/STAMINA.drain).toFixed(1)}s of running`);assert.equal(s.winded,true);
 s.update(.05,false);s.update(.05,false);assert.equal(s.canRun(),false);for(let i=0;i<200&&s.winded;i++)s.update(.05,false);assert.equal(s.winded,false);assert.ok(s.value>=s.max*STAMINA.recover-.01);
 for(let i=0;i<400;i++)s.update(.05,false);assert.equal(s.value,s.max);
 s.setBuff(grilledBuff({id:'cod',w:2.5},'perfect'));assert.ok(s.max>STAMINA.base+30);assert.equal(s.value,s.max,'a full bar stays full when the maximum grows');
 const fed=new Stamina();fed.setBuff(grilledBuff({id:'cod',w:2.5},'perfect'));let u=0;while(fed.canRun()&&u<20){fed.update(.05,true);u+=.05;}assert.ok(u>t*1.3,'a meal means a longer run');
 const m=new CampModel();m.stamina.value=1;m.update(.05,{x:1,y:0,run:true});m.update(.05,{x:1,y:0,run:true});assert.equal(m.stamina.winded,true);m.update(.05,{x:1,y:0,run:true});assert.equal(m.running,false,'a winded survivor walks');});
test('the basket holds twelve fish, cooks the biggest first and survives a reload',()=>{
 const camp=normalizeCamp();for(let i=0;i<BASKET_SIZE;i++)assert.equal(addToBasket(camp,{id:i%2?'perch':'cod',w:1+i/10}),true);
 assert.equal(addToBasket(camp,{id:'moonfin',w:3}),false,'a full basket turns the fish away');assert.equal(camp.caught.moonfin,1,'but the catch is remembered');
 assert.deepEqual(basketSummary(camp).map(f=>[f.id,f.count]),[['perch',6],['cod',6]]);
 assert.equal(takeFromBasket(camp,'cod').w,2,'the heaviest cod goes on the fire');assert.equal(takeFromBasket(camp,'mackerel'),null);
 camp.buff=grilledBuff({id:'perch',w:.8},'perfect');const store=new Map(),storage={getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,v)};
 assert.equal(saveCamp(storage,camp),true);const back=readCamp(storage);assert.equal(back.basket.length,BASKET_SIZE-1);assert.deepEqual(back.buff,camp.buff);assert.deepEqual(back.caught,camp.caught);
 store.set(CAMP_KEY,JSON.stringify({basket:[{id:'shark',w:9},{id:'cod',w:-1},{id:'cod',w:'x'},{id:'perch',w:.512}],buff:{fish:'cod',w:2,quality:'legendary'},caught:{cod:2.5,perch:3,moonfin:-1}}));
 assert.deepEqual(readCamp(storage),{basket:[{id:'perch',w:.51}],buff:null,caught:{perch:3}});store.set(CAMP_KEY,'{oops');assert.deepEqual(readCamp(storage),normalizeCamp());
 assert.equal(saveCamp({setItem(){throw new Error('full');}},camp),false);});
test('the pier and the basket are in camp, and the page has the fishing and grilling panels',()=>{
 assert.ok(OBJECTS.find(o=>o.id==='pier')&&OBJECTS.find(o=>o.id==='basket'));const html=fs.readFileSync(new URL('../dist/index.html',import.meta.url),'utf8');
 for(const id of ['vitals','staminaFill','mealChip','fishChip','fishPanel','fishStatus','fishHint','fishTension','fishLine','fishStop','fishCatch','fishCard','catchName','catchInfo','cookPanel','cookTitle','cookClose','cookPick','cookFish','cookMeal','cookGrill','cookSpit','cookMark','cookState','cookTake','cookDone','cookResult','cookQuality','cookBuff','cookAgain','cookOk'])assert.match(html,new RegExp(`id="${id}"`),id);
 assert.match(html,/Pike's meals/);});
