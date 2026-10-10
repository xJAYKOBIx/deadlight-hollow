import test from 'node:test';import assert from 'node:assert/strict';
const {Thoughts,THOUGHTS,showFor}=await import('../dist/home/thoughts.js');
const lines=(t,s,secs,quiet=false)=>{const out=[];for(let i=0;i<secs*10;i++){const l=t.update(.1,typeof s==='function'?s(i/10):s,quiet);if(l&&out.at(-1)!==l)out.push(l);}return out;};
const home=(guns={},x=300,y=300)=>({place:'home',kit:{guns,street:'start'},x,y,pets:[]});
test('every thought is first person, short, and has its own id',()=>{const ids=new Set();for(const t of THOUGHTS){assert.ok(!ids.has(t.id),t.id);ids.add(t.id);assert.ok(['home','street'].includes(t.at));assert.ok(t.say.length<=90,t.id);assert.ok(!/\byou\b/i.test(t.say),t.id);}
 assert.ok(showFor('Short.')>=3&&showFor(THOUGHTS.map(t=>t.say).join(' '))<=6.5);});
test('at home: no gun, then the pistol, then the shotgun in the closet; each said once',()=>{const t=new Thoughts(),guns={};
 const said=lines(t,s=>(s>12&&(guns['light-pistol']={}),home(guns)),24);
 assert.match(said[0],/not walking out there with nothing/);assert.match(said[1],/shotgun in the hall closet/);assert.equal(said.length,2);
 guns['pump-shotgun']={};assert.deepEqual(lines(t,home(guns),8),['That\'s everything. Front door.']);assert.deepEqual(lines(t,home(guns),8),[]);});
test('the front door without a gun is the first thing you think there',()=>{const t=new Thoughts();assert.match(lines(t,home({},517,440),2)[0],/empty-handed/);});
test('thoughts wait while you talk or watch, and a moment that passed is not said late',()=>{const t=new Thoughts();assert.deepEqual(lines(t,home(),10,true),[]);
 const s={place:'street',kit:{guns:{},street:'start'},x:717,y:170,fight:{alert:false,hp:100,maxHp:100}};
 // Walk past the cruiser while the first line is up, then the fight starts: the cruiser line is dropped, the fight's is said.
 const said=lines(t,x=>x<1.5?s:x<4?{...s,cruiser:200}:{...s,cruiser:200,fight:{...s.fight,alert:true}},14);assert.ok(said.some(l=>/Cold/.test(l)));assert.ok(said.some(l=>/walking like that/.test(l)));assert.ok(!said.some(l=>/police car/.test(l)));});
test('the fight\'s firsts: bitten and the first kill wait for the event, and reset starts the night over',()=>{const t=new Thoughts(),s={place:'street',kit:{guns:{},street:'start'},x:700,y:200,fight:{alert:true,hp:80,maxHp:100}};
 lines(t,s,12);t.note('hurt');assert.ok(lines(t,s,8).some(l=>/bit me/.test(l)));t.note('kill');assert.ok(lines(t,s,8).some(l=>/didn't stop/.test(l)));
 t.reset();assert.equal(t.said.size,0);});
