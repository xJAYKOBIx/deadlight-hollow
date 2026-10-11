import test from 'node:test';import assert from 'node:assert/strict';
import {Playback,frameAt,crossedBeats,DURATION,ecg} from '../dist/first-breath/model.js';
test('script boundaries: black opening, 2–8s caption, clasp and final held frame',()=>{
 assert.equal(frameAt(0).fade,1);assert.equal(frameAt(1).fade,1);assert.equal(frameAt(2.3).fade,0);
 assert.equal(frameAt(1.99).subtitle,false);assert.equal(frameAt(2).subtitle,true);assert.equal(frameAt(8).subtitle,false);
 assert.equal(frameAt(4).clasp,0);assert.equal(frameAt(6.1).clasp,1);assert.equal(frameAt(10).done,true);
 assert.equal(frameAt(10).zoom,1);assert.equal(frameAt(2,true).zoom,1);assert.equal(frameAt(Infinity).t,0);
});
test('pause and seek never emit missed sounds; replay resets at completion',()=>{
 const p=new Playback();assert.deepEqual(p.advance(5),[]);assert.equal(p.t,0);
 p.play();assert.deepEqual(p.advance(3.1),[3.05]);p.pause();p.advance(5);assert.equal(p.t,3.1);
 p.seek(7);assert.equal(p.state,'paused');p.play();assert.deepEqual(p.advance(.1),[7.05]);
 assert.deepEqual(p.advance(10),[8.05,9.05]);assert.equal(p.t,DURATION);assert.equal(p.state,'ended');
 p.play();assert.equal(p.t,0);assert.equal(p.state,'playing');
});
test('cue crossings are once only and ECG stays finite over the shot',()=>{
 assert.deepEqual(crossedBeats(3.05,4.05),[4.05]);assert.deepEqual(crossedBeats(8,1),[]);
 for(let t=-4;t<12;t+=.01)assert.ok(Number.isFinite(ecg(t)));
 assert.ok(ecg(3.085)>20);assert.ok(Math.abs(ecg(2))<.2);
});
