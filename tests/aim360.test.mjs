import test from 'node:test';import assert from 'node:assert/strict';import {createRequire} from 'node:module';
import {StudyModel} from '../dist/study/model.js';import {survivor} from '../dist/study/character.js';
import {LAYERS,ORDER,AIM_ANGLES,sheetSize,paintLayers,drawLayers,pose,aimIndex} from '../dist/study/layers.js';
const require=createRequire(import.meta.url),{createCanvas}=require((process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES||'/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules')+'/@napi-rs/canvas');
const walk=(m,input,n=12)=>{for(let i=0;i<n;i++)m.update(1/60,input);};
test('the body faces the aim, the legs walk the way you move and backpedal when you move away from the aim',()=>{const m=new StudyModel();m.x=400;m.y=300;
 walk(m,{x:0,y:1});assert.deepEqual([m.direction,m.legDir,m.backpedal],[2,2,false]);
 // Strafe: aiming right while walking down keeps the body right and turns the legs down.
 walk(m,{x:0,y:1,aimX:1,aimY:0});assert.deepEqual([m.direction,m.legDir,m.backpedal],[0,2,false]);
 // Walking left while aiming right: legs face right and step backwards through the cycle.
 const frames=[];for(let i=0;i<40;i++){m.update(1/60,{x:-1,y:0,aimX:1,aimY:.02});frames.push(m.frame);}assert.deepEqual([m.direction,m.legDir,m.backpedal],[0,0,true]);
 const steps=frames.filter((f,i)=>i&&f!==frames[i-1]).map((f,i,a)=>i?(a[i-1]-f+8)%8:0).slice(1);assert.ok(steps.length>2&&steps.every(s=>s===1),'walk cycle runs backwards: '+frames);
 walk(m,{x:-1,y:1,aimX:1,aimY:0});assert.deepEqual([m.direction,m.legDir,m.backpedal],[0,7,true]);
 // The gun keeps the exact angle; standing still with no aim keeps the last facing.
 walk(m,{aimX:1,aimY:1.3});assert.ok(Math.abs(m.aim-Math.atan2(1.3,1))<1e-9);assert.equal(m.direction,1);assert.equal(m.legDir,1);assert.equal(pose(m).arms,aimIndex(Math.atan2(1.3,1)));walk(m,{});assert.equal(m.direction,1);assert.equal(pose(m).arms,aimIndex(Math.atan2(1.3,1)),'and keeps pointing where it was');
 // Walking with no aim faces the stick's own angle, not the nearest of eight.
 walk(m,{x:1,y:.4});assert.ok(Math.abs(m.aim-Math.atan2(.4,1))<1e-9);assert.equal(m.direction,0);
assert.equal(aimIndex(-.001),0);assert.equal(aimIndex(Math.PI),AIM_ANGLES/2);});
test('armed, the body and head turn at 64 angles: the drawn facings exactly, and something new between them',()=>{
 const look={gun:'light-pistol',hair:3,beard:1},ctx={};for(const k of ORDER){const c=createCanvas(...sheetSize(LAYERS[k]));ctx[k]=c.getContext('2d');}paintLayers(ctx,look);
 const shot=(aim,turn)=>{const c=createCanvas(160,192),g=c.getContext('2d'),d=((Math.round(aim/(Math.PI/4))%8)+8)%8;drawLayers(g,ctx,{direction:d,frame:0,legDir:d,aim},80,170,1,true,turn);return g.getImageData(0,0,160,192).data;};
 const same=(A,B)=>A.every((v,i)=>v===B[i]);
 for(let d=0;d<8;d++)assert.ok(same(shot(d*Math.PI/4,true),shot(d*Math.PI/4,false)),'facing '+d+' is the drawn art');
 for(const a of [3,13,21,45])assert.ok(!same(shot(a*Math.PI/32,true),shot(a*Math.PI/32,false)),'angle '+a+' is turned');
 assert.equal(pose({direction:2,frame:3,aim:Math.PI/2},true).head,8+16);assert.equal(pose({direction:2,frame:3,aim:Math.PI/2},true).body,8*17+16);});
test('the layers stack back into the same survivor and fit phone texture limits',()=>{
 for(const k of ORDER){const [w,h]=sheetSize(LAYERS[k]);assert.ok(w<=2048&&h<=2048,k+' '+w+'x'+h);}
 for(const look of [{gun:'heavy-ar',grenade:'smoke'},{gun:'light-pistol',body:1,hair:7,hat:5,pack:1},{gun:'none'},{zombie:1,hair:2},{gun:'hand-cannon',top:3,vest:2}]){
  const ctx={};for(const k of ORDER){const c=createCanvas(...sheetSize(LAYERS[k]));ctx[k]=c.getContext('2d');}paintLayers(ctx,look);
  for(let d=0;d<8;d++){const a=createCanvas(160,192),ag=a.getContext('2d');ag.scale(2,2);survivor(ag,d,0,true,look);const b=createCanvas(160,192),bg=b.getContext('2d');drawLayers(bg,ctx,{direction:d,frame:0,legDir:d,aim:d*Math.PI/4},80,170,1,look.zombie!==1&&look.gun!=='none');
   const A=ag.getImageData(0,0,160,192).data,B=bg.getImageData(0,0,160,192).data;let diff=0;for(let i=0;i<A.length;i++)if(A[i]!==B[i])diff++;assert.equal(diff,0,JSON.stringify(look)+' facing '+d);}}});
