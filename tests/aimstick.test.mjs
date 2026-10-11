import test from 'node:test';import assert from 'node:assert/strict';
const {AimStick,AIM,assist,pick,turnTo}=await import('../dist/study/aimstick.js');
const deg=Math.PI/180,run=(s,secs,targets=[])=>{let r;for(let t=0;t<secs;t+=1/60)r=s.step(1/60,targets);return r;};
test('a light push turns you and never fires',()=>{const s=new AimStick();s.down(0);s.set(-20,0,40);const r=run(s,1);assert.ok(Math.abs(turnTo(r.a,Math.PI))<.01);assert.equal(r.fire,false);assert.equal(r.aiming,true);});
test('a full push fires only once you face where the stick points',()=>{const s=new AimStick();s.down(0);s.set(-40,0,40);
 // Half a turn at 900 degrees a second takes a fifth of a second; nothing fires until you are within a few degrees.
 let first=null;for(let t=0;t<.5;t+=1/60){const r=s.step(1/60,[]);if(r.fire&&first===null){first=t;assert.ok(Math.abs(turnTo(r.a,Math.PI))<=AIM.facing+1e-9);}}
 assert.ok(first>.15&&first<.25,String(first));});
test('the thumb near the middle keeps your aim and fires nothing',()=>{const s=new AimStick();s.down(1);s.set(3,2,40);const r=run(s,.2);assert.equal(r.a,1);assert.equal(r.fire,false);});
test('the pull: a zombie on the line takes the aim, one outside the cone or out of range does not',()=>{
 assert.ok(Math.abs(assist(0,[{x:100,y:Math.tan(2*deg)*100}])-2*deg)<.5*deg);
 assert.equal(assist(0,[{x:100,y:Math.tan(30*deg)*100}]),0);assert.equal(assist(0,[{x:400,y:0.1}]),0);
 const s=new AimStick();s.down(0);s.set(40,0,40);const r=run(s,.5,[{x:150,y:Math.tan(3*deg)*150}]);assert.ok(r.a>1.5*deg&&r.a<3.1*deg,String(r.a/deg));assert.equal(r.fire,true);});
test('letting go stops aiming',()=>{const s=new AimStick();s.down(0);s.set(40,0,40);s.up();const r=s.step(1/60,[]);assert.equal(r.a,null);assert.equal(r.fire,false);});
test('the fire stick shoots only at a full push by default, and as early as the menu says otherwise',()=>{assert.equal(AIM.fireAt,1);
 const s=new AimStick();s.down(0);s.set(36,0,40);assert.equal(run(s,.3).fire,false,'nine tenths of the way is not enough');s.set(40,0,40);assert.equal(run(s,.1).fire,true);
 const e=new AimStick({...AIM,fireAt:.5});e.down(0);e.set(22,0,40);assert.equal(run(e,.1).fire,true,'set to half, half a push fires');});
test('the pull sticks to the zombie it is on, and prefers the nearer of two on the line',()=>{
 const a={x:200,y:Math.tan(4*deg)*200,ref:'a'},b={x:120,y:-Math.tan(5*deg)*120,ref:'b'};
 assert.equal(pick(0,[a,b]).t.ref,'b','the nearer one, a degree further off, still wins');assert.equal(pick(0,[a,b],AIM,'a').t.ref,'a','held on the far one, it stays');
 assert.ok(Math.abs(assist(0,[{x:150,y:Math.tan(6*deg)*150}])-6*deg)<1e-9,'well inside the cone the aim goes all the way');});
