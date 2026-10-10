import test from 'node:test';import assert from 'node:assert/strict';import {createRequire} from 'node:module';import {StudyModel,ROOM,START} from '../dist/study/model.js';import {survivor,legLayout} from '../dist/study/character.js';
const require=createRequire(import.meta.url);const {createCanvas}=require((process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES||'/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules')+'/@napi-rs/canvas');
test('study movement normalizes diagonals, runs faster and stops at the arena walls and cover',()=>{const a=new StudyModel(),b=new StudyModel(),run=new StudyModel();for(const m of [a,b,run]){m.x=300;m.y=450;}for(let i=0;i<60;i++){a.update(1/60,{x:1});b.update(1/60,{x:1,y:1});run.update(1/60,{x:1,run:true});}assert.ok(Math.abs(a.x-300-126)<.001);assert.ok(Math.abs(Math.hypot(b.x-300,b.y-450)-126)<.001);assert.ok(run.x>a.x);
 // Plywood cover, the back wall of the cave and the barricade between the arena and the office stop you; the gate lets you through.
 a.x=700;a.y=525;for(let i=0;i<120;i++)a.update(1/30,{x:1,run:true});assert.ok(a.x<=810.001);assert.equal(a.blocked(a.x,a.y),false);a.x=200;a.y=250;for(let i=0;i<120;i++)a.update(1/30,{y:-1,run:true});assert.ok(a.y>=ROOM.top+a.radius-.01);
 a.x=500;a.y=1300;for(let i=0;i<60;i++)a.update(1/30,{y:1});assert.ok(a.y<=1340.001);a.x=860;a.y=1300;for(let i=0;i<60;i++)a.update(1/30,{y:1});assert.ok(a.y>1400);
 a.reset();assert.equal(a.x,START.x);assert.equal(a.y,START.y);for(let i=0;i<600;i++)a.update(1/30,{x:-1,run:true});assert.ok(a.x>=ROOM.left+a.radius);assert.equal(a.moving,false);assert.equal(a.frame,0);});
test('the arena is open ground, eight directions are reachable and reset is safe',()=>{let m=new StudyModel();m.x=620;m.y=395;for(let i=0;i<80;i++)m.update(1/60,{x:1});assert.ok(m.x>760);assert.equal(m.blocked(m.x,m.y),false);for(let d=0;d<8;d++){m.reset();m.update(1/60,{x:Math.cos(d*Math.PI/4),y:Math.sin(d*Math.PI/4)});assert.equal(m.direction,d);}m.reset();assert.equal(m.blocked(m.x,m.y),false);assert.equal(m.frame,0);});
test('survivor has eight distinct directions and walking frames within the unchanged atlas dimensions',()=>{let idle=[],walk=[];for(let d=0;d<8;d++)for(let f=0;f<17;f++){let c=createCanvas(160,192),g=c.getContext('2d');g.scale(2,2);survivor(g,d,f);if(f===0)idle.push(c.toBuffer('image/png').toString('base64'));if(d===1&&f>0&&f<9)walk.push(c.toBuffer('image/png').toString('base64'));let pixels=g.getImageData(0,0,160,192).data;for(let y=0;y<192;y++){assert.equal(pixels[y*160*4+3],0);assert.equal(pixels[(y*160+159)*4+3],0);}for(let x=0;x<160;x++){assert.equal(pixels[x*4+3],0);assert.equal(pixels[(191*160+x)*4+3],0);}}assert.equal(new Set(idle).size,8);assert.equal(new Set(walk).size,8);let run=[];for(let f=9;f<17;f++){let c=createCanvas(160,192),g=c.getContext("2d");g.scale(2,2);survivor(g,1,f);run.push(c.toBuffer("image/png").toString("base64"));}assert.equal(new Set(run).size,8);assert.ok(run.every(r=>!walk.includes(r)));});
test('both hands stay visible in front, back and quarter views throughout the gait',()=>{
 const skin=new Set(['217,155,115','236,177,138','174,115,86']);
 for(let dir of [1,2,3,5,6,7])for(let frame=0;frame<17;frame++)for(let pack of [true,false]){
  let canvas=createCanvas(160,192),c=canvas.getContext('2d');c.scale(2,2);survivor(c,dir,frame,pack);let pixels=c.getImageData(0,0,160,192).data;
  for(let [side,start,end]of [['left',36,76],['right',84,124]]){let count=0;for(let y=98;y<124;y++)for(let x=start;x<end;x++){let i=(y*160+x)*4;if(pixels[i+3]===255&&skin.has(`${pixels[i]},${pixels[i+1]},${pixels[i+2]}`))count++;}assert.ok(count>=12,`${side} hand visible: direction ${dir}, frame ${frame}, pack ${pack}, pixels ${count}`);}
 }
});
test('running advances its own longer-stride cycle and walking returns to the walk cycle',()=>{const m=new StudyModel(),seen=new Set();for(let i=0;i<60;i++){m.update(1/60,{x:1,run:true});seen.add(m.frame);}assert.ok([...seen].every(f=>f>=9&&f<=16));assert.ok(seen.size>=6);m.update(1/60,{x:1});assert.ok(m.frame>=1&&m.frame<=8);m.update(1/60,{});assert.equal(m.frame,0);});

test('diagonal feet travel separate parallel tracks and never cross',()=>{for(const d of [1,3,5,7])for(let f=0;f<17;f++){const L=legLayout(d,f),foot=l=>[l.x+l.foot.dx,-l.depth+l.foot.dy];const n=foot(L.near),r=foot(L.far),back=d>=5;
 // Screen-space track direction for the facing; the hips' offset across it must keep one sign and a clear gap.
 const t=[.65,back?-.5:.5],len=Math.hypot(...t),across=((r[0]-n[0])*-t[1]+(r[1]-n[1])*t[0])/len;assert.ok(Math.abs(across)>=4,`dir ${d} frame ${f} gap ${across}`);
 if(f===0)globalThis['sign'+d]=Math.sign(across);else assert.equal(Math.sign(across),globalThis['sign'+d],`dir ${d} frame ${f} crossed`);
 // The near leg is the lower one on screen, so it is correctly drawn on top.
 assert.ok(L.near.depth<=L.far.depth);}
});
