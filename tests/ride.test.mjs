import test from 'node:test';import assert from 'node:assert/strict';import {createRequire} from 'node:module';import fs from 'node:fs';
import {RIDE,TRUCK,SEATS,DRIVER_BACK,CARGO,ROAD,LAMP,LAMP_GAP,CHECKPOINT,DRIVE,REF,GATE_GAP,LOOKS} from '../dist/ride/data.js';
import {Ride,RIDE_BEATS} from '../dist/ride/script.js';
import {roadArt,armArt,ARM,rampArt,RAMP,lightArt,LIGHT_SCALE,INSIDE,propArt,PROP_PAD} from '../dist/ride/art.js';
import {apcFrame} from '../dist/mc/assets/props/base.js';
import {OP,OP_SPEAKERS} from '../dist/story/op.js';
import {normalizeAppearance} from '../dist/study/appearance.js';
const require=createRequire(import.meta.url);let createCanvas;try{({createCanvas}=require((process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES||'/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules')+'/@napi-rs/canvas'));}catch{}
const F=apcFrame(TRUCK),bay={x0:TRUCK.x+F.T,x1:TRUCK.x+F.xp,y0:TRUCK.y+F.T+13,y1:TRUCK.y+TRUCK.h-F.T-13};
const play=(tap=true,most=60*120)=>{const r=new Ride();let n=0;while(!r.done&&n<most){if(tap&&r.line)r.ack();if(r.act)r.doAct();r.update(1/60);n++;}return {r,secs:n/60};};
test('the three of you sit inside the truck: you and Aaron across the bay from each other, Gadget at the wheel, the cases in the aisle',()=>{
 for(const id of ['you','aaron'])assert.ok(SEATS[id].x>bay.x0&&SEATS[id].x<bay.x1,`${id} sits in the bay`);
 assert.ok(SEATS.aaron.y<bay.y0&&SEATS.you.y>bay.y1,'Aaron on the north bench, you on the south one');assert.ok(SEATS.aaron.feet>SEATS.aaron.hip&&SEATS.aaron.feet<bay.y1,'Aaron\'s boots on the floor in front of him');
 assert.ok(SEATS.gadget.x>TRUCK.x+F.xp&&SEATS.gadget.x<TRUCK.x+F.xf,'Gadget in the cab');assert.ok(DRIVER_BACK.x<SEATS.gadget.x,'her seat back is behind her');
 for(const o of CARGO){assert.ok(o.x>=bay.x0&&o.x+o.w<=bay.x1&&o.y>=bay.y0&&o.y+o.h<=bay.y1,`${o.id} sits on the floor between the benches`);}
 assert.ok(CARGO[0].x+CARGO[0].w<CARGO[1].x,'the cases do not overlap');assert.equal(new Set(CARGO.map(o=>o.id)).size,CARGO.length);
 for(const id of ['aaron','gadget','guard'])assert.deepEqual(normalizeAppearance(LOOKS[id]),{...normalizeAppearance({}),...LOOKS[id]},`${id} uses valid creator options`);
 assert.ok(TRUCK.y-TRUCK.z>ROAD.line&&TRUCK.y+TRUCK.h<ROAD.bottom,'the truck is in the eastbound lane');assert.ok(TRUCK.x>0&&REF<RIDE.w,'and in the world');});
test('the ride plays through: every line has a speaker, it waits for you to load, pulls up at the gate and stops only past the checkpoint',()=>{
 const named=new Set([...Object.keys(OP_SPEAKERS),'you']);for(const b of RIDE_BEATS)for(const [who,text] of b.line||[]){assert.ok(named.has(who),`${who} speaks`);assert.ok(text.length>1&&text.length<140,text);}
 for(const [k,v] of Object.entries(OP.ride))if(k!=='title')assert.ok(RIDE_BEATS.some(b=>b.line===v),`${k} is said`);assert.ok(RIDE_BEATS.flatMap(b=>b.line||[]).some(([w])=>w==='aaron'),'Aaron talks');
 const r=new Ride();assert.equal(r.fade,1);assert.deepEqual(r.title,OP.ride.title);let atGate=null,stopGate='never',waited=0,n=0;
 while(!r.done&&n<60*120){if(r.line)r.ack();if(r.act&&waited<120){waited++;r.update(1/60);n++;continue;}if(r.act)assert.equal(r.doAct(),true);
  r.update(1/60);n++;if(r.drive==='gate'&&r.speed<1&&atGate===null)atGate=r.gateX;if(r.drive==='stop'&&r.speed<1&&stopGate==='never')stopGate=r.gate;}
 assert.ok(r.done,'the ride ends');assert.ok(n/60<60,`runs ${(n/60)|0}s with every line tapped`);assert.equal(waited,120,'it waited for you to load');
 assert.ok(Math.abs(atGate-(REF+GATE_GAP))<2,`the cab pulls up at the arm (${atGate})`);assert.equal(stopGate,null,'the checkpoint is behind you when the truck stops');
 assert.ok(r.ramp===1&&r.fade===1&&r.speed===0,'the ramp is down, the screen gone to black');
 const q=new Ride();for(let i=0;i<60*20;i++)q.update(1/60);assert.ok(!q.done&&q.line,'nothing goes by while a line is unread');
 const s=new Ride();s.skip();assert.ok(s.done&&s.line===null&&s.act===null&&s.fade===1,'skipping ends it');assert.equal(s.doAct(),false);
 const c=new Ride();while(!c.act&&!c.done){if(c.line)c.ack();c.update(1/60);}assert.ok(c.doAct(),'loading');assert.ok(c.cues.includes('mag-in'));for(let i=0;i<40;i++)c.update(1/60);assert.ok(c.cues.includes('loaded'),'the rifle chambers a beat later');});
test('the road scrolls at the beat\'s speed and the lamps go out at the cordon',()=>{
 const r=new Ride();for(let i=0;i<60*4;i++)r.update(1/60);assert.ok(r.pos>DRIVE.cruise*3,'already on the highway');assert.equal(r.lamps,1);
 const {r:e}=play();assert.equal(e.lamps,0,'the Hollow is dark');assert.ok(DRIVE.hollow<DRIVE.cruise);
 const lit=RIDE_BEATS.findIndex(b=>b.lamps===0),gate=RIDE_BEATS.findIndex(b=>b.gate==='up');assert.ok(lit>gate,'the power is out past the gate');
 assert.ok(LAMP_GAP<RIDE.w&&LAMP.y+LAMP.h<=ROAD.top,'lamps on the shoulder, close enough that one is always going by');
 const ids=CHECKPOINT.map(o=>o.kind);for(const k of ['barrier','gatepost','floodlight','sandbags'])assert.ok(ids.includes(k),k);
 for(const o of CHECKPOINT)if(o.front)assert.ok(o.y>=TRUCK.y+TRUCK.h,`${o.kind} stands in front of the truck`);else assert.ok(o.y+o.h<=ROAD.line,`${o.kind} stands in the far lane, behind it`);});
test('the ride\'s art paints: the road, the gate\'s arm, the ramp, the lamps and checkpoint, and light brighter in the truck than outside',{skip:!createCanvas},()=>{
 const paint=(w,h,draw)=>{const c=createCanvas(w,h);draw(c.getContext('2d'));const d=c.getContext('2d').getImageData(0,0,w,h).data;let n=0;for(let i=3;i<d.length;i+=4)n+=d[i]>0;return {n,all:w*h,d,w};};
 const road=paint(ROAD.period*2,RIDE.h*2,roadArt);assert.equal(road.n,road.all,'the road is solid');
 assert.ok(paint((ARM+4)*2,8,armArt).n>ARM*6);assert.ok(paint(RAMP.len*2,RAMP.w*2,rampArt).n===RAMP.len*RAMP.w*4,'the ramp is a solid plate');
 for(const o of [TRUCK,LAMP,DRIVER_BACK,...CARGO,...CHECKPOINT]){const p=paint((o.w+PROP_PAD*2)*2,(o.h+o.z+PROP_PAD*2)*2,c=>propArt(c,{...o,x:0}));assert.ok(p.n>150,`${o.kind} paints pixels`);}
 const L=paint(Math.ceil(RIDE.w/LIGHT_SCALE),Math.ceil(RIDE.h/LIGHT_SCALE),lightArt),lum=(x,y)=>{const i=((y/LIGHT_SCALE|0)*L.w+(x/LIGHT_SCALE|0))*4;return L.d[i]+L.d[i+1]+L.d[i+2];};
 assert.ok(lum(INSIDE.x+INSIDE.w/2,INSIDE.y+INSIDE.h/2)>lum(INSIDE.x+INSIDE.w/2,ROAD.bottom+20)+80,'the truck is lit and the night is not');});
test('the page boards the truck into the ride and the ride lets you off on the ground',()=>{
 const app=fs.readFileSync(new URL('../dist/study/app.js',import.meta.url),'utf8'),page=fs.readFileSync(new URL('../dist/index.html',import.meta.url),'utf8');
 assert.match(app,/ROUTE 9 \/ \d+\.\d+\.\d+/);assert.match(app,/makeRideScene\(rideBridge\)/);assert.match(app,/baseScene\?\.leave\(\(\)=>travel\('ride'\)\)/);
 assert.match(app,/OP_STAGES=\[[^\]]*'boarded','arrived','op','done'\]/);assert.match(app,/arrived:\(\)=>\{setOp\(\{stage:'arrived'\}\);enterGround\(true\);\}/);assert.match(page,/<button id="cineAct"/);assert.match(app,/function rideAct\(\)/);});
