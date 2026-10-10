import test from 'node:test';import assert from 'node:assert/strict';import {createRequire} from 'node:module';import fs from 'node:fs';
import {CAMP,CAMP_START,WALK,PROPS,RESIDENTS,OBJECTS} from '../dist/camp/data.js';
import {CampModel,TARGETS,insidePolygon} from '../dist/camp/model.js';
import {shoreX,westEdge,wallBottom,southEdge,groundArt,propArt,PROP_PAD,lightArt,LIGHT_SCALE,iconArt,ICON,ICONS,flameArt,FLAME} from '../dist/camp/art.js';
import {normalizeAppearance} from '../dist/study/appearance.js';
const require=createRequire(import.meta.url);let createCanvas;try{({createCanvas}=require((process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES||'/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules')+'/@napi-rs/canvas'));}catch{}
test('camp walk area sits on dry sand inside the cave walls',()=>{
 // The pier is the one walkway over the water.
 const pier=PROPS.find(o=>o.kind==='pier'),onPier=(x,y)=>x>=pier.x&&x<=pier.x+pier.w&&y>=pier.y&&y<=pier.y+pier.h;
 for(const [x,y] of WALK){if(onPier(x,y)){assert.ok(x>shoreX(y)-60,`walk point ${x},${y} starts the pier near the shore`);continue;}assert.ok(x<shoreX(y)-20,`walk point ${x},${y} is in the water`);assert.ok(x>westEdge(y)+4,`walk point ${x},${y} is in the west rock`);assert.ok(y>wallBottom(x)+4,`walk point ${x},${y} is in the back wall`);assert.ok(y<southEdge(x),`walk point ${x},${y} is in the south rock`);}
 for(const o of PROPS){assert.ok(o.x>=0&&o.y>=0&&o.x+o.w<=CAMP.w&&o.y+o.h<=CAMP.h,o.id);assert.ok(o.y-o.z-PROP_PAD>=0,`${o.id} art fits in the world`);}});
test('everyone and everything in camp can be reached and used',()=>{
 const m=new CampModel();assert.equal(m.blocked(CAMP_START.x,CAMP_START.y),false);
 for(const o of OBJECTS){assert.equal(m.blocked(o.x,o.y),false,`${o.id} use spot is blocked`);m.x=o.x;m.y=o.y;assert.equal(m.target()?.id,o.id,`${o.id} is the target from its spot`);assert.ok(o.lines.length&&o.verb&&o.name&&Number.isFinite(o.my));}
 for(const p of RESIDENTS){const spot=[p.x,p.y+26];assert.equal(m.blocked(...spot),false,`can stand in front of ${p.id}`);m.x=spot[0];m.y=spot[1];m.direction=6;assert.equal(m.target()?.id,p.id,`${p.id} is the target from the front`);assert.ok(p.lines.length>=2);assert.deepEqual(normalizeAppearance(p.look),{...normalizeAppearance({}),...p.look},`${p.id} look uses valid creator options`);}
 assert.equal(new Set(TARGETS.map(t=>t.id)).size,TARGETS.length);});
test('camp walking slides along solids and never enters a prop, the water or a resident',()=>{
 const m=new CampModel();let seed=7;const rand=()=>(seed=(seed*16807)%2147483647)/2147483647;
 for(let i=0;i<4000;i++){const a=rand()*Math.PI*2;m.update(1/30,{x:Math.cos(a),y:Math.sin(a),run:rand()<.5});
  assert.ok(insidePolygon(WALK,m.x,m.y),'stays in the walk area');for(const o of PROPS.filter(o=>!o.flat))assert.ok(!(m.x>o.x&&m.x<o.x+o.w&&m.y>o.y&&m.y<o.y+o.h),`inside ${o.id}`);
  for(const p of RESIDENTS)assert.ok(Math.hypot(m.x-p.x,m.y-p.y)>12,`walked into ${p.id}`);}
 m.reset();m.update(1/30,{x:0,y:-1});assert.equal(m.direction,6);assert.ok(m.frame>=1&&m.frame<=8);});
test('camp art paints every prop, the light map, the flame and the badges',{skip:!createCanvas},()=>{
 const g=createCanvas(CAMP.w*2,CAMP.h*2);groundArt(g.getContext('2d'));const d=g.getContext('2d').getImageData(0,0,g.width,g.height).data;let opaque=0;for(let i=3;i<d.length;i+=4000)opaque+=d[i]===255;assert.equal(opaque,Math.ceil(d.length/4000));
 for(const o of PROPS){const c=createCanvas((o.w+PROP_PAD*2)*2,(o.h+o.z+PROP_PAD*2)*2);propArt(c.getContext('2d'),o);const px=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let n=0;for(let i=3;i<px.length;i+=4)n+=px[i]>0;assert.ok(n>200,`${o.id} paints pixels`);}
 const l=createCanvas(Math.ceil(CAMP.w/LIGHT_SCALE),Math.ceil(CAMP.h/LIGHT_SCALE));lightArt(l.getContext('2d'));const fire=l.getContext('2d').getImageData(800/LIGHT_SCALE,640/LIGHT_SCALE,1,1).data,dark=l.getContext('2d').getImageData(1250/LIGHT_SCALE,560/LIGHT_SCALE,1,1).data;
 assert.ok(fire[0]>dark[0]+40&&fire[0]>fire[2],'fire light is brighter and warm');
 for(const [draw,w,h] of [[flameArt,FLAME.w*FLAME.frames,FLAME.h],[iconArt,ICON.w*ICONS.length,ICON.h]]){const c=createCanvas(w*2,h*2);draw(c.getContext('2d'));const px=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let n=0;for(let i=3;i<px.length;i+=4)n+=px[i]>0;assert.ok(n>500);}});
test('the page offers the camp and its talk controls',()=>{const html=fs.readFileSync(new URL('../dist/index.html',import.meta.url),'utf8');
 for(const id of ['travel','act','prompt','talk','talkFace','talkName','talkRole','talkLine','talkNext','placeName','drillHud','hitFlash'])assert.match(html,new RegExp(`id="${id}"`));assert.match(html,/0\.29\.0/);});
test('cave life keeps to the walls, the lanterns and the wet sand',async()=>{const {DRIPS,FUNGI,wallTop}=await import('../dist/camp/art.js'),{LAMP_GLASS,CRAB}=await import('../dist/camp/life.js');
 for(const d of DRIPS){assert.ok(d.top>wallTop(d.x)&&d.top<d.y,'drip falls down the wall');if(!d.into)assert.ok(d.y>wallBottom(d.x),'puddle at the wall foot');}
 assert.ok(DRIPS.some(d=>d.into),'one drip feeds the medic\'s water drum');assert.equal(LAMP_GLASS.length,PROPS.filter(o=>o.kind==='lantern'||o.glass).length+2);
 for(const [x,y] of FUNGI)assert.ok(x<westEdge(y)+60||y<=wallBottom(x)+2,'fungus grows on rock');assert.ok(CRAB.scare<CRAB.near&&CRAB.flee>CRAB.walk);
 const pass=OBJECTS.find(o=>o.id==='passage');assert.ok(pass&&PROPS.find(o=>o.id==='passage'),'the collapsed passage can be looked at');});
test('the shelter has four sleeping spots, each a bed with a chest at its foot, and only yours shows alone',()=>{const m=new CampModel();
 for(let slot=0;slot<4;slot++){const bed=PROPS.find(o=>o.id==='bed-'+slot),chest=PROPS.find(o=>o.id==='chest-'+slot);assert.ok(bed&&chest&&bed.flat&&!chest.flat);assert.equal(bed.x,chest.x);assert.ok(chest.y>=bed.y+bed.h-2,'chest at the foot');}
 const stash=OBJECTS.find(o=>o.id==='stash'),bed=OBJECTS.find(o=>o.id==='bedroll'),mine=PROPS.find(o=>o.id==='chest-0');assert.ok(Math.abs(stash.x-(mine.x+mine.w/2))<2,'your chest is your stash');assert.ok(Math.abs(bed.x-stash.x)<2);
 // An empty spot's chest is not there to bump into; once someone joins, it is.
 const c=PROPS.find(o=>o.id==='chest-3'),x=c.x+c.w/2,y=c.y+c.h/2;assert.equal(m.blocked(x,y),false);m.campers=4;assert.equal(m.blocked(x,y),true);
 for(let i=0;i<3;i++){const a=PROPS.find(o=>o.id==='chest-'+i),b=PROPS.find(o=>o.id==='chest-'+(i+1));assert.ok(a.x-(b.x+b.w)>=2*m.radius+1,'room to walk between chests');}});
