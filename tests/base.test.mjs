import test from 'node:test';import assert from 'node:assert/strict';import {createRequire} from 'node:module';import fs from 'node:fs';
import {BASE,HANGAR,DOOR_Y,PROPS,CHAIRS,SEATED,SEAT_OF,YOUR_SEAT,GEAR_START,AT_RAMP,GEAR,PEOPLE,OPERATORS,OBJECTS,BRIEF_STAFF,PODIUM_AT,STAGE_SIDE} from '../dist/base/data.js';
import {BaseModel,TARGETS} from '../dist/base/model.js';
import {Brief,BRIEF} from '../dist/base/brief.js';
import {OP,OP_SPEAKERS,OP_TALK} from '../dist/story/op.js';
import {groundArt,lightArt,dimArt,LIGHT_SCALE,propArt,PROP_PAD} from '../dist/base/art.js';
import {normalizeAppearance} from '../dist/study/appearance.js';
const require=createRequire(import.meta.url);let createCanvas;try{({createCanvas}=require((process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES||'/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules')+'/@napi-rs/canvas'));}catch{}
const overlap=(a,b)=>a.x<b.x+b.w&&b.x<a.x+a.w&&a.y<b.y+b.h&&b.y<a.y+a.h;
test('Hangar 3 holds its props inside the world, one chair to each of the unit and yours left empty beside an empty seat',()=>{
 for(const o of PROPS)assert.ok(o.x>=0&&o.y>=0&&o.x+o.w<=BASE.w&&o.y+o.h<=BASE.h,o.id);
 for(const o of PROPS.filter(o=>!o.deco&&!/^wall|^col/.test(o.id)))for(const p of PROPS.filter(p=>p!==o&&!p.deco&&!/^wall|^col/.test(p.id)&&p.id!=='stage'&&o.id!=='stage'))assert.ok(!overlap(o,p),`${o.id} overlaps ${p.id}`);
 const taken=Object.values(SEAT_OF);assert.equal(new Set(taken).size,taken.length,'no two share a chair');assert.ok(!taken.includes(YOUR_SEAT),'your chair is free');
 assert.equal(Object.keys(SEATED).length,OPERATORS.length);for(const o of OPERATORS)assert.ok(SEAT_OF[o.id],`${o.id} has a seat`);
 assert.ok(!taken.includes(CHAIRS[CHAIRS.indexOf(YOUR_SEAT)-1]),'the seat beside yours waits for your partner');
 assert.ok(DOOR_Y===HANGAR.y+HANGAR.h,'the door is the hangar\'s south side');});
test('in Hangar 3 everyone and everything can be walked up to and used',()=>{
 const m=new BaseModel();assert.equal(m.blocked(GEAR_START.x,GEAR_START.y),false);assert.equal(m.blocked(AT_RAMP.x,AT_RAMP.y),false);
 m.x=AT_RAMP.x;m.y=AT_RAMP.y;m.direction=AT_RAMP.direction;assert.equal(m.target()?.id,'ramp','back on the apron, the ramp is right there');
 for(const o of OBJECTS){assert.equal(m.blocked(o.x,o.y),false,`${o.id} use spot is blocked`);m.x=o.x;m.y=o.y;m.direction=6;assert.equal(m.target()?.id,o.id,`${o.id} is the target from its spot`);assert.ok(OP.look[o.say],`${o.id} has words`);assert.ok(o.verb&&o.name&&Number.isFinite(o.my));}
 for(const p of PEOPLE){const s=GEAR[p.id],spot=[s.x,s.y+26];assert.ok(s,`${p.id} has a gear-up spot`);assert.equal(m.blocked(...spot),false,`can stand in front of ${p.id}`);m.x=spot[0];m.y=spot[1];m.direction=6;assert.equal(m.target()?.id,p.id,`${p.id} is the target from the front`);
  assert.deepEqual(normalizeAppearance(p.look),{...normalizeAppearance({}),...p.look},`${p.id} look uses valid creator options`);}
 for(const o of OPERATORS)assert.ok(OP_TALK[o.id]?.length,`${o.id} has something to say`);for(const id of ['calloway','hale'])assert.ok(OP_TALK[id].gear.length&&OP_TALK[id].armed.length);
 assert.equal(new Set(TARGETS.map(t=>t.id)).size,TARGETS.length);});
test('walking the hangar slides along its props and people and keeps inside the walls, out of the door onto the apron',()=>{
 const m=new BaseModel();let seed=11;const rand=()=>(seed=(seed*16807)%2147483647)/2147483647;let out=false;
 for(let i=0;i<5000;i++){const a=rand()*Math.PI*2;m.update(1/30,{x:Math.cos(a),y:Math.sin(a)*(i%600<300?1:1.6)+(i%1200<600?0:.4),run:rand()<.5});
  assert.ok(m.x>0&&m.x<BASE.w&&m.y>HANGAR.y&&m.y<BASE.h,'stays in the world');if(m.y<DOOR_Y)assert.ok(m.x>HANGAR.x&&m.x<HANGAR.x+HANGAR.w,'inside the side walls');out||=m.y>DOOR_Y+20;
  for(const o of PROPS.filter(o=>!o.deco))assert.ok(!(m.x>o.x&&m.x<o.x+o.w&&m.y>o.y&&m.y<o.y+o.h),`inside ${o.id}`);
  for(const p of PEOPLE){const s=GEAR[p.id];assert.ok(Math.hypot(m.x-s.x,m.y-s.y)>8,`walked into ${p.id}`);}}
 assert.ok(out,'got out onto the apron');});
test('the briefing plays through: every line has a speaker, the slides run in order, the stage swaps and everyone stands',()=>{
 const named=new Set([...Object.keys(OP_SPEAKERS),'you']);for(const b of BRIEF)for(const [who,text] of b.line||[]){assert.ok(named.has(who),`${who} speaks`);assert.ok(text.length>3&&text.length<140,text);}
 assert.deepEqual([...new Set(BRIEF.filter(b=>b.slide!==undefined).map(b=>b.slide))],[0,1,2,3,4,5]);assert.ok(BRIEF.flatMap(b=>b.line||[]).some(([w])=>w==='you'),'you get a line');
 const B=new Brief();let steps=0,swapped=false;assert.equal(B.fade,1);assert.deepEqual(B.title,OP.title);
 while(!B.done&&steps<20000){B.update(1/60);if(B.line&&!B.heard)B.ack();steps++;if(B.i===5)swapped||=Math.hypot(B.staff.hale.x-PODIUM_AT.x,B.staff.hale.y-PODIUM_AT.y)<1;}
 assert.ok(B.done,'the briefing ends');assert.ok(swapped,'Hale took the podium');assert.ok(steps/60<120,`runs ${(steps/60)|0}s with every line tapped`);
 assert.ok(Math.hypot(B.staff.calloway.x-PODIUM_AT.x,B.staff.calloway.y-PODIUM_AT.y)<1&&Math.hypot(B.staff.hale.x-STAGE_SIDE.x,B.staff.hale.y-STAGE_SIDE.y)<1,'they end where they began');
 assert.equal(B.stand,true);assert.equal(B.dim,0);assert.equal(B.fade,0);assert.equal(B.cam,null);
 const S=new Brief();S.skip();assert.ok(S.done&&S.stand&&S.line===null&&S.fade===0,'skipping lands on its feet');
 for(const id of ['calloway','hale'])assert.ok(BRIEF_STAFF[id].lift>0,`${id} is on the stage`);});
test('the hangar art paints the floor, every prop, the working light and the briefing dimmer',{skip:!createCanvas},()=>{
 const g=createCanvas(BASE.w*2,BASE.h*2);groundArt(g.getContext('2d'));const d=g.getContext('2d').getImageData(0,0,g.width,g.height).data;let opaque=0;for(let i=3;i<d.length;i+=4000)opaque+=d[i]===255;assert.equal(opaque,Math.ceil(d.length/4000));
 for(const o of PROPS){const c=createCanvas((o.w+PROP_PAD*2)*2,(o.h+o.z+PROP_PAD*2)*2);propArt(c.getContext('2d'),o);const px=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let n=0;for(let i=3;i<px.length;i+=4)n+=px[i]>0;assert.ok(n>200,`${o.id} paints pixels`);}
 const lum=(draw,x,y)=>{const c=createCanvas(Math.ceil(BASE.w/LIGHT_SCALE),Math.ceil(BASE.h/LIGHT_SCALE));draw(c.getContext('2d'));const p=c.getContext('2d').getImageData(x/LIGHT_SCALE|0,y/LIGHT_SCALE|0,1,1).data;return p[0]+p[1]+p[2];};
 assert.ok(lum(lightArt,440,206)>lum(lightArt,440,640)+60,'the hangar is lit brighter than the apron');assert.ok(lum(dimArt,440,96)>lum(dimArt,760,400)+120,'the dimmer leaves the screen lit and the floor down');});
test('the page offers Harlan Field and the title offers the operation and Marcus\'s night apart',()=>{
 const app=fs.readFileSync(new URL('../dist/study/app.js',import.meta.url),'utf8'),title=fs.readFileSync(new URL('../dist/title/title.js',import.meta.url),'utf8');
 assert.match(app,/HARLAN FIELD \/ \d+\.\d+\.\d+/);assert.match(app,/onNew:\(\)=>enterOp\(true\)/);assert.match(app,/onMarcus:/);
 for(const id of ['continue','new','marcus','survivor','settings','credits'])assert.match(title,new RegExp(`\\['${id}'`));});
