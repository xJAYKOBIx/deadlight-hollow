import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {Hollow} from '../dist/hub/sim.js';
import {LOOK_DEFAULTS,LOOK_LIMITS} from '../dist/hub/data.js';
import {person,pixelFinish} from '../dist/hub/art.js';
const require=createRequire(import.meta.url);
let createCanvas;try{({createCanvas}=require((process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES||'/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules')+'/@napi-rs/canvas'));}catch{}
test('older village saves gain appearance defaults without losing gear or materials',()=>{
 const h=new Hollow();h.craft('plated');h.equip('marksman');h.setLook('coat',4);const old=h.snapshot();old.look={coat:4,skin:2,hair:1};
 const restored=Hollow.restore(old);assert.deepEqual(restored.look,{...LOOK_DEFAULTS,coat:4,skin:2,hair:1});assert.equal(restored.armor,'plated');assert.equal(restored.weapon,'marksman');assert.deepEqual(restored.materials,h.materials);
 for(const [key,value] of Object.entries({hair:4,hairColor:3,outfit:2,pack:2}))assert.equal(restored.setLook(key,value),true);
 assert.deepEqual(Hollow.restore(restored.snapshot()).look,restored.look);
 for(const [key,value] of [['hair',8],['pack',-1],['outfit',NaN],['hairColor',9],['unknown',1]])assert.equal(restored.setLook(key,value),false);
});
test('outfits, packs, armor and weapon silhouettes produce distinct visible sprites',{skip:!createCanvas},()=>{
 function render(look,angle=Math.PI/2){const canvas=createCanvas(160,192),ctx=canvas.getContext('2d');ctx.scale(2,2);person(ctx,look,angle,0);return canvas;}
 const base={coat:0,skin:0,hair:0,hairColor:0,outfit:0,pack:0};
 for(const key of ['hair','hairColor','outfit','pack']){
   let a=render(base,key==='pack'?-Math.PI/2:Math.PI/2),b=render({...base,[key]:1},key==='pack'?-Math.PI/2:Math.PI/2);assert.notDeepEqual(a.toBuffer('image/png'),b.toBuffer('image/png'),key+' changes the sprite');
 }
 const armor=['scout','woven','plated'].map(armor=>render({...base,armor}).toBuffer('image/png').toString('base64'));assert.equal(new Set(armor).size,3);
 const guns=['pistol','carbine','shotgun','marksman'].map(weapon=>render({...base,weapon,armed:true},0).toBuffer('image/png').toString('base64'));assert.equal(new Set(guns).size,4);
 for(let dir=0;dir<8;dir++){const c=render({...base,weapon:'marksman',armed:true,pack:2,hair:4},dir*Math.PI/4).getContext('2d');const d=c.getImageData(0,0,160,192).data;for(let y=0;y<192;y++)assert.equal(d[(y*160+159)*4+3],0,'right atlas border stays clear');for(let x=0;x<160;x++)assert.equal(d[x*4+3],0,'top atlas border stays clear');}
});

test('legacy headwear migrates once and all new appearance fields round-trip',()=>{
 for(let hair=2;hair<=4;hair++){let d=new Hollow().snapshot();delete d.appearanceVersion;d.look={coat:3,skin:1,hair,hairColor:2,outfit:1,pack:2};let h=Hollow.restore(d);assert.equal(h.look.hair,0);assert.equal(h.look.headwear,hair-1);assert.equal(h.look.coat,3);assert.deepEqual(Hollow.restore(h.snapshot()).look,h.look);}
 let h=new Hollow();for(const [key,count]of Object.entries(LOOK_LIMITS))assert.equal(h.setLook(key,count-1),true);assert.deepEqual(Hollow.restore(h.snapshot()).look,h.look);
});
test('every cosmetic choice changes its visible view and combinations fit the existing atlas',{skip:!createCanvas},()=>{
 function render(look,angle,frame=0){let canvas=createCanvas(160,192),c=canvas.getContext('2d');c.scale(2,2);person(c,{...LOOK_DEFAULTS,pack:0,...look},angle,frame);return canvas;}
 for(let key of ['body','hair','headwear','beard','nose','outfit','trousers'])for(let angle of [Math.PI/2,0]){let variants=Array.from({length:LOOK_LIMITS[key]},(_,i)=>render({[key]:i},angle).toBuffer('image/png').toString('base64'));assert.equal(new Set(variants).size,LOOK_LIMITS[key],`${key} variants visible at ${angle}`);}
 for(let hair=0;hair<8;hair++)for(let dir=0;dir<8;dir++)for(let frame=0;frame<4;frame++){
  let canvas=render({hair,body:1,headwear:hair%4,beard:5,nose:3,outfit:hair%6,pack:2,weapon:'marksman',armed:true},dir*Math.PI/4,frame),d=canvas.getContext('2d').getImageData(0,0,160,192).data;
  for(let x=0;x<160;x++){assert.equal(d[x*4+3],0,'top');assert.equal(d[((191*160)+x)*4+3],0,'bottom');}for(let y=0;y<192;y++){assert.equal(d[(y*160)*4+3],0,'left');assert.equal(d[(y*160+159)*4+3],0,'right');}
 }
});
