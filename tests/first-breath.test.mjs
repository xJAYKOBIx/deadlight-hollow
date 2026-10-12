import test from 'node:test';import assert from 'node:assert/strict';
import {Playback,frameAt,crossedBeats,DURATION,ecg,SUBTITLES} from '../dist/first-breath/model.js';
test('revival actions occur while their subject is on screen',()=>{
 assert.equal(frameAt(0).fade,1);assert.equal(frameAt(1.2).fade,0);
 assert.equal(frameAt(2).alive,false);assert.equal(frameAt(3.1).alive,true);
 assert.equal(frameAt(3.1).shot,'monitor');
 assert.equal(frameAt(4.7).shot,'patient');assert.ok(frameAt(4.7).gasp>.9);
 assert.equal(frameAt(5.2).awake,0);assert.equal(frameAt(6.4).awake,1);assert.equal(frameAt(6.4).shot,'patient');
 assert.equal(frameAt(8.1).fingerFrame,0);assert.equal(frameAt(9.7).fingerFrame,16);assert.equal(frameAt(9.7).shot,'hands');
 assert.equal(frameAt(14).relief,0);assert.equal(frameAt(15.3).relief,1);assert.equal(frameAt(15.3).shot,'family');
 assert.equal(frameAt(DURATION).awake,1);assert.equal(frameAt(DURATION).gasp,0);assert.equal(frameAt(DURATION).done,true);
 for(const cue of SUBTITLES){assert.equal(frameAt(cue.from).subtitle,cue.text);assert.equal(frameAt(cue.to).subtitle,'');}
 assert.equal(frameAt(Infinity).t,0);
});
test('camera remains within the painted room and reduced motion has no pullback',()=>{
 for(let t=0;t<=DURATION;t+=.02){const f=frameAt(t);assert.ok(f.focusX-480/f.zoom>=0);assert.ok(f.focusX+480/f.zoom<=960);assert.ok(f.focusY-270/f.zoom>=0);assert.ok(f.focusY+270/f.zoom<=540);assert.ok(f.fingerFrame>=0&&f.fingerFrame<=16);}
 const a=frameAt(10.6,true),b=frameAt(DURATION,true);assert.equal(a.zoom,b.zoom);assert.equal(a.focusX,b.focusX);assert.equal(a.focusY,b.focusY);
});
test('pause and seek never emit missed sounds; replay resets at completion',()=>{
 const p=new Playback();assert.deepEqual(p.advance(5),[]);assert.equal(p.t,0);
 p.play();assert.deepEqual(p.advance(3.1),[3.05]);p.pause();p.advance(5);assert.equal(p.t,3.1);
 p.seek(7);assert.equal(p.state,'paused');p.play();assert.deepEqual(p.advance(.1),[7.05]);
 assert.deepEqual(p.advance(20),[8.05,9.05,10.05,11.05,12.05,13.05,14.05,15.05,16.05,17.05]);assert.equal(p.t,DURATION);assert.equal(p.state,'ended');
 p.play();assert.equal(p.t,0);assert.equal(p.state,'playing');
});
test('cue crossings are once only and ECG stays finite over the shot',()=>{
 assert.deepEqual(crossedBeats(3.05,4.05),[4.05]);assert.deepEqual(crossedBeats(8,1),[]);
 for(let t=-4;t<16;t+=.01)assert.ok(Number.isFinite(ecg(t)));
 assert.ok(ecg(3.085)>20);assert.ok(Math.abs(ecg(2))<.2);
});
