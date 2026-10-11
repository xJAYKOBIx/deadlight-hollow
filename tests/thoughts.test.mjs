import test from 'node:test';import assert from 'node:assert/strict';
const {Thoughts,THOUGHTS,showFor}=await import('../dist/home/thoughts.js');const {THOUGHT_LINES}=await import('../dist/story/night1.js');
const lines=(t,s,secs,quiet=false)=>{const out=[];for(let i=0;i<secs*10;i++){const l=t.update(.1,typeof s==='function'?s(i/10):s,quiet);if(l&&out.at(-1)!==l)out.push(l);}return out;};
const home=(guns={},x=300,y=300,light=true)=>({place:'home',kit:{guns,street:'start',light},x,y,pets:[]});
test('every thought is first person, short, and has its own id',()=>{const ids=new Set();for(const t of THOUGHTS){assert.ok(!ids.has(t.id),t.id);ids.add(t.id);assert.ok(['home','street'].includes(t.at));assert.ok(t.say.length<=90,t.id);assert.ok(!/\byou\b/i.test(t.say),t.id);}
 assert.ok(showFor('Short.')>=3&&showFor(THOUGHTS.map(t=>t.say).join(' '))<=6.5);});
test('at home: the junk drawer only after a long while in the dark, then the second gun; each said once',()=>{const t=new Thoughts(),guns={};
 assert.deepEqual(lines(t,home({},300,300,false),50),[],'not before a minute');assert.match(lines(t,home({},300,300,false),20)[0],/junk drawer/);
 const said=lines(t,s=>(s>2&&(guns['light-pistol']={}),home(guns)),40);assert.deepEqual(said,[THOUGHT_LINES.other]);
 guns['pump-shotgun']={};assert.deepEqual(lines(t,home(guns),40),[]);assert.deepEqual(lines(t,home({},300,300,false),80),[],'said once a night');});
test('thoughts wait while you talk or watch, and a moment that passed is not said late',()=>{const t=new Thoughts();
 const s={place:'street',kit:{guns:{},street:'start'},x:717,y:170,fight:{alert:false,hp:100,maxHp:100}};
 assert.deepEqual(lines(t,s,10,true),[],'nothing while the dialog box is up');
 // The quiet moment ends (the fight starts) before it is said: it is dropped, not said in the middle of the fight.
 assert.deepEqual(lines(t,{...s,fight:{...s.fight,alert:true}},6),[]);assert.deepEqual(lines(t,s,3),[THOUGHT_LINES.out]);});
test('the fight\'s firsts wait for the event, a pushed line takes over, and reset starts the night over',()=>{const t=new Thoughts(),s={place:'street',kit:{guns:{},street:'start'},x:700,y:200,fight:{alert:true,hp:80,maxHp:100}};
 assert.deepEqual(lines(t,s,8),[]);t.note('hurt');assert.ok(lines(t,s,8).some(l=>/bit me/.test(l)));
 t.push('Good boy.');assert.equal(t.update(.1,s),'Good boy.');t.reset();assert.equal(t.said.size,0);});
test('once he is gone: him coming, then run once his gear is back',()=>{const t=new Thoughts();
 const own=(taken,hunt)=>({place:'street',kit:{guns:{},street:'done',phase:'own',corpse:{taken}},x:500,y:300,fight:{alert:true,hp:100,maxHp:100,zombies:[{kind:'risen',hunt}]}});
 assert.deepEqual(lines(t,own(false,false),6),[]);assert.deepEqual(lines(t,own(false,true),6),[THOUGHT_LINES.coming]);assert.deepEqual(lines(t,own(true,false),10),[THOUGHT_LINES.run]);});
