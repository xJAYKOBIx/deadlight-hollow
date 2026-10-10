import {bake} from './memory.js';import {Practice} from './practice.js';import {Juice} from './juice.js';import {targetArt,practiceEffects,graphicsPainter,blob} from './practice-art.js';
import {survivor,FRAME} from './character.js';import {LAYERS,ORDER,origin,sheetSize,paintLayers,pose,drawLayers,armed} from './layers.js';import {ROOM,ROOM_NPCS,TALK_RANGE,OBJECTS} from './model.js';import {PAINT} from './equipment.js';
import {TG,PROPS,GATE_DOOR} from '../grounds/data.js';
import {groundArt,groundTiles,frontArt,FRONT_Y,lightArt,LIGHT_SCALE,glowArt,propArt,PROP_PAD,botArt,BOT,BOT_ROW,bruteArt,BRUTE,SPIT,ledSpots,screenRects,splat} from '../grounds/art.js';
import {painter} from '../camp/art.js';
import {addPet,placePet,petSheet} from '../companion/sprite.js';
const facing=(dx,dy)=>(Math.round(Math.atan2(dy,dx)/(Math.PI/4))+8)%8;
// Paint on the floor is redrawn from scratch past this many splats, keeping only the newest.
const FLOOR_MARKS=320;
export function makeStudyScene(model,bridge){return class CharacterRoom extends Phaser.Scene{
 constructor(){super('CharacterRoom');this.model=model;this.practice=new Practice(model,bridge.loadout());}
 // once: painted a single time, so only the graphics card keeps it (memory.js).
 texture(key,w,h,draw,once){if(this.textures.exists(key))return this.textures.get(key);let t=this.textures.createCanvas(key,w,h);draw(t.context);t.refresh();return once?bake(this,t,draw):t;}
 create(){
 // The chamber: rock, floor, cords and old paint in one canvas, then every piece of scrap as its own sprite so you walk behind it.
 // The floor comes in tiles, so no single texture is too big for a phone.
 // The front wall and the light map are just as big, so all three wait until you first come into the room: a night that starts at home never holds them.
 const paintRoom=()=>{for(const [i,t] of groundTiles().entries()){const key='tg-ground-'+i;this.texture(key,t.w*2,t.h*2,c=>groundArt(c,t),true);this.add.image(t.x,t.y,key).setOrigin(0).setScale(.5).setDepth(-10);}this.texture('tg-front',TG.w*2,(TG.h-FRONT_Y)*2,frontArt,true);this.add.image(0,FRONT_Y,'tg-front').setOrigin(0).setScale(.5).setDepth(5000);this.texture('tg-light',Math.ceil(TG.w/LIGHT_SCALE),Math.ceil(TG.h/LIGHT_SCALE),lightArt,true);this.add.image(0,0,'tg-light').setOrigin(0).setScale(LIGHT_SCALE).setDepth(6000).setBlendMode(Phaser.BlendModes.MULTIPLY);};if(bridge.here?.()===false)this.events.once('wake',paintRoom);else paintRoom();
 // Paint puddles from the spitters and the parts robots drop lie on the floor.
 this.floorFx=this.add.graphics().setDepth(-4);
 this.floorPaint=this.add.graphics().setDepth(-5);this.floorMarks=[];this.markGen=this.practice.markGen;
 this.props=new Map();for(const o of PROPS){const key='tg-'+o.id,t=this.texture(key,(o.w+PROP_PAD*2)*2,(o.h+o.z+PROP_PAD*2)*2,c=>propArt(c,o));this.props.set(o.id,{o,t,painted:false});this.add.image(o.x-PROP_PAD,o.y-o.z-PROP_PAD,key).setOrigin(0).setScale(.5).setDepth(o.y+o.h);}
 // Paper targets in the lane.
 this.texture('practice-target',48,66,targetArt);this.targetSprites=this.practice.targets.map(t=>this.add.image(t.x-24,t.y-60,'practice-target').setOrigin(0).setDepth(t.y));this.targetPaint=this.practice.targets.map(t=>({g:this.add.graphics().setDepth(t.y+.5),n:-1}));
 // Gadget's robots: one sheet of variants and frames, a sprite and a paint layer for each robot on the floor.
 const bots=this.texture('tg-bots',BOT.w*2*BOT.frames,BOT.h*2*BOT.rows,botArt);for(let v=0;v<BOT.rows;v++)for(let f=0;f<BOT.frames;f++){const id=v*BOT.frames+f;if(!bots.has?.(id))bots.add(id,0,f*BOT.w*2,v*BOT.h*2,BOT.w*2,BOT.h*2);}
 const brute=this.texture('tg-brute',BRUTE.w*2*BRUTE.frames,BRUTE.h*2,bruteArt);for(let f=0;f<BRUTE.frames;f++)if(!brute.has?.(f))brute.add(f,0,f*BRUTE.w*2,0,BRUTE.w*2,BRUTE.h*2);this.botSprites=new Map();
 // The gate Gadget shuts behind you for a Holdout.
 const gd={...GATE_DOOR,id:'gatedoor',kind:'gatedoor'};this.texture('tg-gatedoor',(gd.w+PROP_PAD*2)*2,(gd.h+gd.z+PROP_PAD*2)*2,c=>propArt(c,gd));this.gateDoor=this.add.image(gd.x-PROP_PAD,gd.y-gd.z-PROP_PAD,'tg-gatedoor').setOrigin(0).setScale(.5).setDepth(gd.y+gd.h).setVisible(false);
 this.fx=this.add.graphics().setDepth(6002);
 // You, in layers: legs, body, arms and gun, then neck and head. See layers.js.
 this.layers={};for(const k of ORDER){const L=LAYERS[k],t=this.texture(L.key,...sheetSize(L),()=>{});for(let i=0;i<L.count;i++)if(!t.has?.(i))t.add(i,0,(i%L.cols)*L.w,Math.floor(i/L.cols)*L.h,L.w,L.h);this.layers[k]=t;}this.setAppearance(bridge.appearance());
 // Aaron and Gadget: the eight idle facings, drawn once. They turn to you when you come close.
 this.npcs=ROOM_NPCS.map(n=>{const key='camp-res-'+n.id;if(!this.textures.exists(key)){const t=this.texture(key,FRAME.w*8,FRAME.h,c=>{c.imageSmoothingEnabled=false;for(let d=0;d<8;d++){c.save();c.translate(d*FRAME.w,0);c.scale(2,2);survivor(c,d,0,true,{...n.look,gun:'none',grenade:null});c.restore();}});for(let d=0;d<8;d++)t.add(d,0,d*FRAME.w,0,FRAME.w,FRAME.h);}
  return {data:n,sprite:this.add.image(n.x,n.y,key,n.direction).setOrigin(.5,85/96).setScale(.5).setDepth(n.y)};});this.target=null;
 this.pet=bridge.pet?addPet(this,bridge.petLook()):null;
 this.parts={};for(const k of ORDER){const L=LAYERS[k];this.parts[k]=this.add.image(model.x,model.y,L.key,0).setOrigin(...origin(L)).setScale(.5);}this.actor=this.parts.body;
 // Lighting multiplies everything below it (painted with the floor above); lamp glows, screens and LEDs sit above it so they stay bright.
 this.texture('tg-glow',128,128,c=>glowArt(c,[235,240,255]));this.texture('tg-glow-warm',128,128,c=>glowArt(c,[255,214,150]));for(const k of ['tg-glow','tg-glow-warm'])this.textures.get(k).setFilter?.(Phaser.Textures.FilterMode.LINEAR);
 this.glows=PROPS.filter(o=>o.kind==='worklight').map((o,i)=>this.add.image(o.x+6,o.y-70,o.id==='officelight'?'tg-glow-warm':'tg-glow').setScale(.9,.7).setDepth(6001).setBlendMode(Phaser.BlendModes.ADD).setAlpha(.32));
 this.juice=new Juice(this,{quality:bridge.quality,world:TG,reduced:!!globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches});
 this.leds=ledSpots();this.screens=screenRects();this.blink=this.add.graphics().setDepth(6001);
 this.cameras.main.setBackgroundColor('#0b0c10').setBounds(0,0,ROOM.w,ROOM.h).setZoom(bridge.zoom()).centerOn(model.x,model.y-20);this.game.canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();bridge.contextLost();});this.game.canvas.addEventListener('webglcontextrestored',()=>bridge.contextRestored());bridge.ready(this);}
 setPetLook(look){if(this.pet)petSheet(this,look);}
 // In the Training Grounds every gun is its paintball twin, hopper and all.
 setAppearance(look){const gear=this.practice.loadout;this.look={...look,...gear,paint:PAINT[gear.gun]};const ctx={};for(const k of ORDER)ctx[k]=this.layers[k].context;paintLayers(ctx,this.look);for(const k of ORDER)this.layers[k].refresh();}
 // The character creator's preview, stacked from the same layers you play with.
 portrait(c,direction,frame,x,y,scale){const ctx={};for(const k of ORDER)ctx[k]=this.layers[k].context;drawLayers(c,ctx,{direction,frame,legDir:direction,aim:direction*Math.PI/4},x,y,scale,armed(this.look));}
 placeActor(){const p=pose(model),gun=armed(this.look),down=!!this.practice.drill.downed;
  for(const k of ORDER){const s=this.parts[k],ride=k==='arms'||k==='head';s.setFrame(p[k]);s.setPosition(model.x+(ride&&!down?p.dx:0),model.y+(ride&&!down?p.dy:0));}
  // The gun sits between the coat and the head; arms and head ride the body's bob. Layer depths stay a hair apart at your feet.
  const y=model.y;this.parts.legs.setDepth(y);this.parts.body.setDepth(y+.01);this.parts.arms.setDepth(y+.02).setVisible(gun);this.parts.head.setDepth(y+.03);}
 // Paint that lands on cover is drawn into that prop's own canvas, so it sits on the right face and behind whatever is in front.
 paintProp(m){const p=this.props.get(m.id);if(!p)return;const {o,t}=p,c=t.context,top=o.z<30||m.fy<o.y,lx=Math.max(2,Math.min(o.w-2,m.x-o.x)),ly=top?Math.max(-o.z+1,Math.min(o.h-o.z-1,m.y-o.y-o.z)):o.h-Math.min(30,o.z-3)+((m.seed%7)-3);
  c.save();c.scale(2,2);c.translate(PROP_PAD,o.z+PROP_PAD);splat(painter(c),lx,ly,m.s,m.col,m.seed,top);c.restore();t.refresh();p.painted=true;}
 floorSplat(m){splat(graphicsPainter(this.floorPaint),m.x,m.y,m.s,m.col,m.seed,true);}
 paintMarks(){const p=this.practice;
  if(p.markGen!==this.markGen){this.markGen=p.markGen;this.floorPaint.clear();this.floorMarks=[];for(const v of this.props.values())if(v.painted){const c=v.t.context;c.clearRect(0,0,v.t.width??c.canvas.width,v.t.height??c.canvas.height);propArt(c,v.o);v.t.refresh();v.painted=false;}for(const tp of this.targetPaint)tp.n=-1;}
  if(!p.marks.length)return;for(const m of p.marks){if(m.kind==='prop')this.paintProp(m);else{this.floorMarks.push(m);this.floorSplat(m);}}p.marks.length=0;
  if(this.floorMarks.length>FLOOR_MARKS){this.floorMarks=this.floorMarks.slice(-FLOOR_MARKS+60);this.floorPaint.clear();for(const m of this.floorMarks)this.floorSplat(m);}}
 drawPaint(g,list,x,y,squash=1,spread=1){g.clear();for(const s of list)blob(g,x+s.x*spread,y+s.y*squash,s.s,s.col,s.seed);}
 drawBots(){const bots=this.practice.drill.bots,seen=new Set();
  for(const b of bots){seen.add(b.id);const big=b.kind==='brute';let s=this.botSprites.get(b.id);if(!s){const A=big?BRUTE:BOT;s={img:this.add.image(b.x,b.y,big?'tg-brute':'tg-bots',0).setOrigin(A.ax/A.w,A.ay/A.h).setScale(.5),g:this.add.graphics(),n:-1};this.botSprites.set(b.id,s);}
   const down=b.hp<=0,f=down?2:b.frame,row=b.kind&&b.kind!=='shambler'?BOT_ROW[b.kind]:b.variant;s.img.setPosition(b.x,b.y).setFrame(big?f:row*BOT.frames+f).setFlipX(!!b.flip).setDepth(b.y).setAlpha(b.off?.8:1);
   if(s.n!==b.paint.length||s.x!==b.x||s.y!==b.y||s.down!==down){s.n=b.paint.length;s.x=b.x;s.y=b.y;s.down=down;s.g.setDepth(b.y+.5);this.drawPaint(s.g,b.paint,b.x+(down?(b.flip?4:-4):0),down?b.y+1:b.y,down?.28:1,down?1.5:1);}}
  for(const [id,s] of this.botSprites)if(!seen.has(id)){s.img.destroy();s.g.destroy();this.botSprites.delete(id);}}
 // Spitter paint pooling on the floor, and the parts waiting to be picked up, each with a glint above the lighting so you can find them in the dark.
 drawFloorFx(now){const g=this.floorFx,d=this.practice.drill,sp=parseInt(SPIT.slice(1),16);g.clear();
  for(const u of d.puddles){const a=Math.min(1,u.age*4,u.life/.6);g.fillStyle(0x3d6a24,.55*a).fillEllipse(u.x,u.y,u.r*2+4,u.r*1.5+3);g.fillStyle(sp,.75*a).fillEllipse(u.x,u.y,u.r*2,u.r*1.5);g.fillStyle(0xd8ff9a,.6*a).fillEllipse(u.x-u.r*.3,u.y-u.r*.25,u.r*.5,u.r*.25);}
  for(const k of d.pickups){const t=k.seed%3;g.fillStyle(0x10151c,.45).fillEllipse(k.x,k.y+2,9,3);if(t===0){g.fillStyle(0x1c1d21,1).fillCircle(k.x,k.y-2,3.5);g.fillStyle(0x8a9096,1).fillCircle(k.x,k.y-2,1.3);}else if(t===1){g.fillStyle(0x1c1d21,1).fillRect(k.x-4,k.y-5,8,6);g.fillStyle(0x2a2c31,1).fillRect(k.x-3.5,k.y-4.5,7,5);g.fillStyle(0xc0392b,1).fillRect(k.x-3,k.y-6,2,1.5);g.fillStyle(0xc9a23a,1).fillRect(k.x-2.5,k.y-2,5,1);}else{g.fillStyle(0x1c1d21,1).fillRect(k.x-4.5,k.y-4,9,5);g.fillStyle(0x6582a0,1).fillRect(k.x-4,k.y-3.5,8,4);g.fillStyle(0xc9a24a,1).fillRect(k.x+1,k.y-3,2,3);}}}
 drawBlink(now){const g=this.blink;g.clear();for(const [i,l] of this.leds.entries()){const on=l.kind==='port'?((Math.floor(now/90)+i*7)%5)>1:l.kind==='hatch'?(this.practice.drill.state==='run'?Math.floor(now/250)%2===0:true):l.kind==='charge'?((Math.floor(now/400)+i)%6)>i%3:((Math.floor(now/700)+i*3)%4)>0;if(!on)continue;
   const col=l.kind==='hatch'?0xff4a3a:l.kind==='charge'?0x7cf08a:l.kind==='park'?0xff6a4a:i%4===1?0xf0c040:0x6cf08a;g.fillStyle(col,1).fillRect(l.x-.5,l.y-.5,1,1);g.fillStyle(col,.25).fillCircle(l.x,l.y,l.kind==='hatch'?4:2);}
  for(const k of this.practice.drill.pickups){const tw=.5+.5*Math.sin(now/160+k.seed);g.fillStyle(0xfff0c0,.5+.5*tw).fillRect(k.x-.5,k.y-7,1,1);g.fillStyle(0xfff0c0,.18*tw).fillCircle(k.x,k.y-3,5);g.lineStyle(1,0xfff0c0,.3+.3*tw).strokeEllipse(k.x,k.y+1,11+5*tw,4.5+2*tw);}
  // The screens: a faint flicker and a scan line rolling down each one.
  for(const [i,s] of this.screens.entries()){const k=(now/1400+i*.37)%1;g.fillStyle(s.kind==='crt'?0x8cffd0:0x7ad8ff,.08+.04*Math.sin(now/90+i)).fillRect(s.x,s.y,s.w,s.h);g.fillStyle(0xffffff,.12).fillRect(s.x,s.y+k*s.h,s.w,1);}}
 update(now,delta){delta=Math.min(50,delta);const drill=this.practice.drill,held=this.juice.stopped(now);if(!bridge.paused()&&!held){const input=drill.downed?{}:bridge.input();model.update(delta/1000,input);this.practice.update(delta/1000,input);}this.placeActor();
 // Down in a Holdout: you lie on the floor until Gadget pulls you up.
 if(drill.downed!==this.wasDown){this.wasDown=drill.downed;for(const s of Object.values(this.parts)){s.setAngle?.(drill.downed?-90:0);if(drill.downed)s.setTint?.(0x9aa0c8);else s.clearTint?.();}}this.gateDoor.setVisible(!!drill.gateClosed);
 // The nearest person or thing you can use, by where you stand to use it.
 this.target=null;let best=TALK_RANGE;for(const n of this.npcs){const dx=model.x-n.data.x,dy=model.y-n.data.y,d=Math.hypot(dx,dy);n.sprite.setFrame(d<130?facing(dx,dy):n.data.direction);const s=n.data.talk||n.data,td=Math.hypot(model.x-s.x,model.y-s.y);if(td<best){best=td;this.target=n.data;}}
 for(const o of OBJECTS){const td=Math.hypot(model.x-o.x,model.y-o.y);if(td<best){best=td;this.target=o;}}
 if(this.pet){bridge.petStep(delta/1000);placePet(this.pet,bridge.pet());}let cam=this.cameras.main;cam.setZoom(bridge.zoom());const lead=bridge.lead?.(delta/1000)||{x:0,y:0};// When the view is bigger than the room, the room sits in the middle of it.
 const vw=cam.width/cam.zoom,vh=cam.height/cam.zoom,bx=Math.min(0,(ROOM.w-vw)/2),by=Math.min(0,(ROOM.h-vh)/2);cam.setBounds(bx,by,ROOM.w-2*bx,ROOM.h-2*by);cam.centerOn(model.x+lead.x,model.y-20+lead.y);
 this.paintMarks();this.drawBots();practiceEffects(this.fx,this.practice);this.juice.update(now,held?0:delta/1000,this.practice);this.drawFloorFx(now);
 for(let i=0;i<this.targetSprites.length;i++){const t=this.practice.targets[i],tp=this.targetPaint[i];this.targetSprites[i].setAlpha(t.hp>0?1:.3);if(tp.n!==t.paint.length){tp.n=t.paint.length;this.drawPaint(tp.g,t.paint,t.x,t.y);}tp.g.setAlpha(t.hp>0?1:.3);}
 this.glows.forEach((g,i)=>g.setAlpha(.3+.03*Math.sin(now*.004+i*1.7)));this.drawBlink(now);bridge.tick(now);}
};}
