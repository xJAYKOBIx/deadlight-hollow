import test from 'node:test';import assert from 'node:assert/strict';
import {CineCam,BACK} from '../dist/study/camera.js';
test('the cutscene camera glides to a focus, eased, and back to following you',()=>{const c=new CineCam(),you={x:0,y:0,z:2};
 assert.deepEqual(c.step(.1,you,null),you,'with nothing to look at it is on you');
 const p={x:100,y:50,z:1.5,secs:1};let a=c.step(.1,you,p);assert.ok(a.x>0&&a.x<10,'it starts slowly');
 for(let i=0;i<4;i++)a=c.step(.1,you,p);assert.ok(Math.abs(a.x-50)<1,'halfway at half the time');for(let i=0;i<6;i++)a=c.step(.1,you,p);assert.deepEqual(a,{x:100,y:50,z:3});
 for(let i=0;i<Math.round(BACK*10)-1;i++)a=c.step(.1,you,null);assert.ok(a.x>0);a=c.step(.2,you,null);assert.deepEqual(a,you,'and then follows you again');
 assert.deepEqual(new CineCam().step(.1,you,{x:9,y:9,secs:0}),{x:9,y:9,z:2},'a cut is instant');});
