import test from 'node:test';import assert from 'node:assert/strict';
import {layout,plateFor,normalizeConsole,SLOTS,DEFAULT_CONSOLE} from '../dist/study/console.js';
// Circle and box overlap tests in deck pixels; a box is stored by its centre like the controls, or by its corner like the readouts.
const box=o=>o.round?null:{x0:o.x-o.w/2,x1:o.x+o.w/2,y0:o.y-o.h/2,y1:o.y+o.h/2};
const corner=r=>({x0:r.x,x1:r.x+r.w,y0:r.y,y1:r.y+r.h});
const circleHitsBox=(c,b)=>{const dx=c.x-Math.max(b.x0,Math.min(c.x,b.x1)),dy=c.y-Math.max(b.y0,Math.min(c.y,b.y1));return dx*dx+dy*dy<(c.w/2-1)**2;};
const boxesHit=(a,b)=>a.x0<b.x1-1&&b.x0<a.x1-1&&a.y0<b.y1-1&&b.y0<a.y1-1;
const WIDTHS=[320,360,375,390,414,430,480];
test('no two controls overlap on any phone width, either hand',()=>{
 for(const W of WIDTHS)for(const mode of Object.keys(SLOTS))for(const hand of ['right','left'])for(const scale of [.8,1,1.3]){
  const L=layout(W,{mode,set:{...DEFAULT_CONSOLE,hand,scale}}),it=Object.entries(L.items).filter(([id,o])=>!o.pill),tag=`${W} ${mode} ${hand} ${scale}`;
  assert.deepEqual(Object.keys(L.items).sort(),[...SLOTS[mode]].sort(),tag);
  for(const [id,o] of it){assert.ok(o.x-o.w/2>=-1&&o.x+o.w/2<=W+1,`${id} fits across ${tag}`);assert.ok(o.y-o.h/2>=-1&&o.y+o.h/2<=L.dk+1,`${id} fits down ${tag}`);}
  for(let i=0;i<it.length;i++)for(let j=i+1;j<it.length;j++){const [a,A]=it[i],[b,B]=it[j],ba=box(A),bb=box(B),n=`${a} and ${b} at ${tag}`;
   if(!ba&&!bb)assert.ok(Math.hypot(A.x-B.x,A.y-B.y)>=(A.w+B.w)/2-1,n);else if(ba&&bb)assert.ok(!boxesHit(ba,bb),n);else assert.ok(!circleHitsBox(ba?B:A,ba||bb),n);}
  // The place or goal readout stays clear of every round control and of the right-hand readout.
  for(const [id,o] of it)if(o.round)assert.ok(!circleHitsBox(o,corner(L.status)),`status and ${id} at ${tag}`);
  const r=L.items.weapon||L.right;assert.ok(!boxesHit(corner(L.status),box({...r,round:false})),`readouts at ${tag}`);}});
test('the left-handed deck is the right-handed one mirrored',()=>{
 for(const W of WIDTHS)for(const mode of Object.keys(SLOTS)){const R=layout(W,{mode}),Lh=layout(W,{mode,set:{...DEFAULT_CONSOLE,hand:'left'}});
  for(const [id,o] of Object.entries(R.items)){assert.ok(Math.abs(Lh.items[id].x-(W-o.x))<1e-6,`${id} ${W} ${mode}`);assert.equal(Lh.items[id].y,o.y);}
  // The move stick is always on the side the left-hand setting says, and fight buttons are on the other.
  assert.ok(R.items.move.x<W/2&&Lh.items.move.x>W/2);if(R.items.shove)assert.ok(R.items.shove.x>R.split&&Lh.items.shove.x<Lh.split);}});
test('Use sits in the game view above the fire stick in a fight and in its place when calm',()=>{
 const F=layout(390,{mode:'fight'}),C=layout(390,{mode:'calm'});
 assert.ok(F.items.act.pill&&F.items.act.y<0&&F.items.act.x+F.items.act.w/2<=390-F.sr+1);
 assert.ok(C.items.act.round&&C.items.act.y>0&&C.items.act.x>C.split);});
test('console settings are clamped and moved controls stay on the deck',()=>{
 assert.deepEqual(normalizeConsole(null),DEFAULT_CONSOLE);
 const s=normalizeConsole({scale:9,opacity:0,accent:'pink',hand:'up',moved:{dive:{dx:9999,dy:-2},bad:{dx:'x'}}});
 // A Dive button moved before v0.62 keeps its place as the Shove button.
 assert.equal(s.scale,1.3);assert.equal(s.opacity,1);assert.equal(s.accent,'ember');assert.equal(s.hand,'right');assert.deepEqual(s.moved,{shove:{dx:500,dy:-2}});
 assert.equal(normalizeConsole({opacity:.1}).opacity,.35);
 const L=layout(390,{mode:'fight',set:{...DEFAULT_CONSOLE,moved:{shove:{dx:500,dy:500}}}}),d=L.items.shove;
 assert.ok(d.x+d.w/2<=390+1e-6&&d.y+d.h/2<=L.dk+1e-6);});
test('the plate has a well per stick, a socket per button and names inside the band',()=>{
 for(const mode of Object.keys(SLOTS)){const L=layout(390,{mode}),P=plateFor(L,20),it=L.items;
  assert.equal(P.wells.length,it.aim?2:1,mode);assert.equal(P.sockets.length,Object.entries(it).filter(([id,o])=>!['move','aim','weapon'].includes(id)&&!o.pill).length,mode);
  assert.ok(P.names.y+7<=P.h&&P.names.y>=P.h-P.band,mode);}});
