import test from 'node:test';
import assert from 'node:assert/strict';
import {PadInput,deadzone,BUTTONS,PAD} from '../dist/pad.js';
const pad=(axes=[0,0,0,0],held=[])=>({connected:true,mapping:'standard',axes,buttons:Array.from({length:17},(_,i)=>({pressed:held.includes(i),value:held.includes(i)?1:0}))});
test('stick dead zones ignore drift and still reach full tilt',()=>{
 assert.deepEqual(deadzone(.1,.12),{x:0,y:0,m:0});
 const full=deadzone(1,0);assert.equal(full.m,1);assert.equal(full.x,1);
 const half=deadzone(0,-.6);assert.ok(half.m>.45&&half.m<.55);assert.ok(half.y<0&&half.x===0);
 assert.ok(PAD.aim<PAD.fire,'the aim stick aims before it fires');});
test('controller buttons report presses once and releases once',()=>{
 let now=pad();const input=new PadInput(()=>[null,now]);
 assert.equal(input.poll().any,false);
 now=pad([0,0,.9,0],[BUTTONS.a]);let s=input.poll();assert.equal(s.pressed.a,true);assert.equal(s.down.a,true);assert.ok(s.right.m>.8);assert.equal(s.any,true);
 s=input.poll();assert.equal(s.pressed.a,false,'holding A is not a second press');assert.equal(s.down.a,true);
 now=pad();s=input.poll();assert.equal(s.released.a,true);assert.equal(s.down.a,false);
 now=null;assert.equal(input.poll(),null,'an unplugged controller reads as none');
 assert.equal(new PadInput(()=>{throw new Error('blocked');}).poll(),null,'a browser that refuses the Gamepad API reads as none');});
