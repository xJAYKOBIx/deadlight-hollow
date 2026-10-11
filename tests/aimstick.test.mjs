import test from 'node:test';import assert from 'node:assert/strict';
const {AimStick,AIM,assist,turnTo}=await import('../dist/study/aimstick.js');
const deg=Math.PI/180,run=(s,secs,targets=[])=>{let r;for(let t=0;t<secs;t+=1/60)r=s.step(1/60,targets);return r;};
test('a light push turns you and never fires',()=>{const s=new AimStick();s.down(0);s.set(-20,0,40);const r=run(s,1);assert.ok(Math.abs(turnTo(r.a,Math.PI))<.01);assert.equal(r.fire,false);assert.equal(r.aiming,true);});
test('a full push fires only once you face where the stick points',()=>{const s=new AimStick();s.down(0);s.set(-40,0,40);
 // Half a turn at 900 degrees a second takes a fifth of a second; nothing fires until you are within a few degrees.
 let first=null;for(let t=0;t<.5;t+=1/60){const r=s.step(1/60,[]);if(r.fire&&first===null){first=t;assert.ok(Math.abs(turnTo(r.a,Math.PI))<=AIM.facing+1e-9);}}
 assert.ok(first>.15&&first<.25,String(first));});
test('the thumb near the middle keeps your aim and fires nothing',()=>{const s=new AimStick();s.down(1);s.set(3,2,40);const r=run(s,.2);assert.equal(r.a,1);assert.equal(r.fire,false);});
test('the pull: a zombie on the line takes the aim, one outside the cone or out of range does not',()=>{
 assert.ok(Math.abs(assist(0,[{x:100,y:Math.tan(2*deg)*100}])-2*deg)<.5*deg);
 assert.equal(assist(0,[{x:100,y:Math.tan(20*deg)*100}]),0);assert.equal(assist(0,[{x:400,y:0.1}]),0);
 const s=new AimStick();s.down(0);s.set(40,0,40);const r=run(s,.5,[{x:150,y:Math.tan(3*deg)*150}]);assert.ok(r.a>1.5*deg&&r.a<3.1*deg,String(r.a/deg));assert.equal(r.fire,true);});
test('letting go stops aiming',()=>{const s=new AimStick();s.down(0);s.set(40,0,40);s.up();const r=s.step(1/60,[]);assert.equal(r.a,null);assert.equal(r.fire,false);});
