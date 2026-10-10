import test from 'node:test';import assert from 'node:assert/strict';
// A stand-in for Phaser's texture manager: just enough to see what memory.js keeps.
class Manager{createCanvas(key,w,h){const canvas={width:w,height:h,getContext:()=>({})};return {key,canvas,imageData:{data:new Uint8Array(w*h*4)},data:1,pixels:1,buffer:1,manager:this,refresh(){this.up=(this.up||0)+1;}};}exists(){return true;}}
globalThis.Phaser={WEBGL:2,Textures:{TextureManager:Manager}};
const {leanTextures,bake,worthBaking}=await import('../dist/study/memory.js');
test('canvas textures drop the read-back copy of their pixels',()=>{leanTextures();leanTextures();const t=new Manager().createCanvas('a',64,64);assert.equal(t.imageData,null);assert.equal(t.pixels,null);assert.equal(t.canvas.width,64);});
test('a baked picture empties its canvas, and is painted again when the graphics context comes back',()=>{let restored;const scene={game:{renderer:{gl:{},type:2},canvas:{addEventListener:(n,f)=>{if(n==='webglcontextrestored')restored=f;}}}};
 const t=new Manager().createCanvas('floor',400,300);let painted=0;bake(scene,t,()=>painted++);assert.deepEqual([t.canvas.width,t.canvas.height],[1,1]);
 restored();assert.equal(painted,1);assert.equal(t.up,1);assert.equal(t.canvas.width,1);
 // Without WebGL there is no other copy, so nothing is emptied.
 const u=new Manager().createCanvas('other',400,300);bake({game:{renderer:{type:1}}},u,()=>{});assert.equal(u.canvas.width,400);
 assert.ok(worthBaking(256,256)&&!worthBaking(128,128));});
