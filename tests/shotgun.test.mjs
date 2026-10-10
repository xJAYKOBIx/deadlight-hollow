import test from 'node:test';import assert from 'node:assert/strict';
import {GUNS,PAINT,muzzle,normalizeLoadout} from '../dist/study/equipment.js';
import {StudyModel} from '../dist/study/model.js';import {Practice} from '../dist/study/practice.js';
const step=(p,s,input={})=>{for(let t=0;t<s;t+=.05)p.update(.05,input);};
test('the pump shotgun is a saved choice like any other gun, with a paintball twin and a muzzle',()=>{
 const g=GUNS['pump-shotgun'];assert.ok(g&&g.rifle&&g.shells);assert.equal(g.mag,8);assert.ok(g.pellets>1&&g.spread>0);
 assert.equal(normalizeLoadout({gun:'pump-shotgun'}).gun,'pump-shotgun');assert.ok(PAINT['pump-shotgun']);
 assert.ok(muzzle(0,'pump-shotgun').x>muzzle(0,'tactical-ar').x,'the barrel is longer than the AR');
 assert.deepEqual(Object.keys(GUNS).slice(0,5),['light-pistol','heavy-pistol','hand-cannon','tactical-ar','heavy-ar'],'existing guns keep their places');});
test('one blast throws a fan of pellets for one shell, then it racks before the next',()=>{
 const p=new Practice(new StudyModel(),{gun:'pump-shotgun'});assert.equal(p.ammo,8);
 assert.equal(p.fire(),true);assert.equal(p.ammo,7);assert.equal(p.traces.length,GUNS['pump-shotgun'].pellets);assert.equal(p.shots,1);
 const a=p.traces.map(t=>Math.atan2(t.ey-t.y,t.ex-t.x)),spread=Math.max(...a)-Math.min(...a);assert.ok(spread>.1&&spread<.3,`spread ${spread}`);
 assert.equal(p.traces.filter(t=>!t.pellet).length,1,'one flash');assert.equal(p.fire(),false,'still racking');step(p,GUNS['pump-shotgun'].interval+.05);assert.equal(p.fire(),true);});
test('it loads one shell at a time, and you can fire part way through loading',()=>{
 const p=new Practice(new StudyModel(),{gun:'pump-shotgun'}),g=GUNS['pump-shotgun'];for(let i=0;i<3;i++){p.fire();step(p,g.interval+.05);}assert.equal(p.ammo,5);
 p.reload();step(p,g.reload+.06);assert.equal(p.ammo,6,'one shell in');step(p,g.reload);assert.equal(p.ammo,7);
 assert.equal(p.fire(),true,'fires while loading');assert.equal(p.reloadTime,0,'and stops loading');assert.equal(p.ammo,6);
 p.reload();step(p,g.reload*3);assert.equal(p.ammo,8);assert.equal(p.reloadTime,0,'stops when full');
 const pistol=new Practice(new StudyModel(),{gun:'light-pistol'});pistol.fire();pistol.reload();assert.equal(pistol.fire(),false,'a pistol still waits for its reload');step(pistol,GUNS['light-pistol'].reload+.06);assert.equal(pistol.ammo,15);});
