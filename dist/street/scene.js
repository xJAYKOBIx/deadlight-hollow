// The neighbourhood scene: the ground, the props, you (in the Training Grounds' layers, so the gun points exactly where you aim),
// the dead, the night light, the cruiser's light bar and the fight's effects. The map is far too big to hold as one picture, so it
// is kept in square chunks: the ground and light of the chunks round the screen are painted as you come near and let go once you
// are well past, and each prop is painted while any chunk its picture touches is held. The fight is street/fight.js; this draws it.
import {bake,unbake,worthBaking} from '../study/memory.js';import {drawLaser} from '../study/aimstick.js';import {muzzle} from '../study/equipment.js';
import {survivor,FRAME} from '../study/character.js';
import {LAYERS,ORDER,origin,sheetSize,paintLayers,pose,armed} from '../study/layers.js';
import {DEFAULT_APPEARANCE,UNIFORMS} from '../study/appearance.js';
import {Juice} from '../study/juice.js';
import {iconArt,ICON,ICONS} from '../camp/art.js';
import {MAP,CHUNK,PROPS,LIGHT_BAR,HOME} from './data.js';
import {groundArt,lightArt,LIGHT_SCALE,propArt,PROP_PAD} from './art.js';
import {Fight} from './fight.js';
// The dead on this street. Everyone is a neighbour; the cop came with the cruiser.
const POLICE=UNIFORMS.find(u=>u.id==='police').look,Z={zombie:1,pack:1,rot:1,decay:1,eyes:0,wounds:1};
export const ZOMBIE_LOOKS={cop:{...DEFAULT_APPEARANCE,...POLICE,...Z,hair:1,skin:2,wounds:1},
 neighbour:{...DEFAULT_APPEARANCE,...Z,top:3,coat:2,bottom:1,pants:1,shoes:1,hair:0,color:1,skin:1,wounds:2},
 jogger:{...DEFAULT_APPEARANCE,...Z,body:1,top:6,shirt:3,bottom:4,shoes:1,hair:2,color:4,skin:3,decay:0,wounds:1},
 robe:{...DEFAULT_APPEARANCE,...Z,top:2,shirt:1,bottom:3,pants:2,shoes:2,hair:3,beard:6,color:3,skin:0,decay:2,wounds:3},
 worker:{...DEFAULT_APPEARANCE,...Z,top:0,coat:4,hat:1,bottom:2,pants:3,shoes:0,beard:3,skin:4,eyes:2,wounds:2}};
const SHEET_OF={neighbour2:'neighbour'};
// Zombie sheets hold the standing frame and the eight walking frames, cropped to the part of the frame a body uses.
const ZF={x:16,y:8,w:128,h:176,rows:9};
// The chunks, and which props' pictures touch each one.
const CX=Math.ceil(MAP.w/CHUNK),CY=Math.ceil(MAP.h/CHUNK),chunkRect=k=>{const x=k%CX*CHUNK,y=Math.floor(k/CX)*CHUNK;return {x,y,w:Math.min(CHUNK,MAP.w-x),h:Math.min(CHUNK,MAP.h-y)};};
const picture=o=>({x:o.x-PROP_PAD,y:o.y-o.z-PROP_PAD,w:o.w+PROP_PAD*2,h:o.h+o.z+PROP_PAD*2}),PICS=PROPS.map(picture);
const span=(b,f)=>{for(let cy=Math.max(0,Math.floor(b.y/CHUNK));cy<=Math.min(CY-1,Math.floor((b.y+b.h)/CHUNK));cy++)for(let cx=Math.max(0,Math.floor(b.x/CHUNK));cx<=Math.min(CX-1,Math.floor((b.x+b.w)/CHUNK));cx++)f(cx+cy*CX);};
const BY_CHUNK=Array.from({length:CX*CY},()=>[]);PICS.forEach((b,i)=>span(b,k=>BY_CHUNK[k].push(i)));
const meets=(a,b)=>a.x<b.x+b.w&&b.x<a.x+a.w&&a.y<b.y+b.h&&b.y<a.y+a.h,grow=(v,n)=>({x:v.x-n,y:v.y-n,w:v.w+n*2,h:v.h+n*2});
// How far past the screen's edge the map is painted ahead of you, how far you go before it is let go, and how long a frame may
// spend painting what is not on screen yet (anything already on screen is painted at once).
// Each chunk's ground is painted a strip at a time, so no one frame does much of it.
export const AHEAD=224,KEEP=480,BUDGET=4,STRIPS=8;
const CRUISER_I=PROPS.findIndex(o=>o.id==='cruiser');
const glow=(c,[r,g,b])=>{const gr=c.createRadialGradient(64,64,0,64,64,64);gr.addColorStop(0,`rgba(${r},${g},${b},.8)`);gr.addColorStop(.45,`rgba(${r},${g},${b},.22)`);gr.addColorStop(1,`rgba(${r},${g},${b},0)`);c.fillStyle=gr;c.fillRect(0,0,128,128);};
export function makeStreetScene(model,bridge){return class Street extends Phaser.Scene{
 constructor(){super('Street');}
 // Everything here is painted once, so the big ones keep only the graphics card's copy (memory.js).
 texture(key,w,h,draw){if(this.textures.exists(key))return this.textures.get(key);const t=this.textures.createCanvas(key,w,h);draw(t.context);t.refresh();return worthBaking(w,h)?bake(this,t,draw):t;}
 create(){
  // The chunks held (ground, light and whether they are painted yet) and the props held (their picture and how many held chunks they touch).
  this.chunks=new Map();this.held=new Map();this.todo=new Set();this.fades=new Set();
  // The cruiser in each state its light bar turns through, with the trunk shut and open.
  const cr=PROPS[CRUISER_I];for(const lit of [1,2])for(const trunk of [0,1])this.texture(`street-cruiser-${lit}-${trunk}`,(cr.w+PROP_PAD*2)*2,(cr.h+cr.z+PROP_PAD*2)*2,c=>propArt(c,{...cr,lit,trunk:!!trunk}));
  // Blood on the ground, under everything standing.
  this.blood=[];this.bloodG=this.add.graphics().setDepth(.5);
  // You.
  this.parts={};this.gunSheets={};this.setPlayerLook(bridge.look());
  // The dead: one sheet per look.
  for(const [id,look] of Object.entries(ZOMBIE_LOOKS)){const t=this.texture('street-z-'+id,ZF.w*8,ZF.h*ZF.rows,c=>{c.imageSmoothingEnabled=false;for(let f=0;f<ZF.rows;f++)for(let d=0;d<8;d++){c.save();c.beginPath();c.rect(d*ZF.w,f*ZF.h,ZF.w,ZF.h);c.clip();c.translate(d*ZF.w-ZF.x,f*ZF.h-ZF.y);c.scale(2,2);survivor(c,d,f,false,look);c.restore();}});
   for(let f=0;f<ZF.rows;f++)for(let d=0;d<8;d++)if(!t.has(f*8+d))t.add(f*8+d,0,d*ZF.w,f*ZF.h,ZF.w,ZF.h);}
  this.zs=new Map();this.pool=[];
  this.fight=new Fight(model,{kit:bridge.kit,setKit:bridge.setKit,grid:bridge.grid});model.zombies=this.fight.zombies;
  // Night: each chunk's light map multiplies everything under it; the light bar, muzzle flashes and tracers sit above it.
  this.texture('street-glow-w',128,128,c=>glow(c,[255,255,255]));this.texture('tg-glow',128,128,c=>glow(c,[235,240,255]));this.texture('tg-glow-warm',128,128,c=>glow(c,[255,214,150]));
  for(const k of ['street-glow-w','tg-glow','tg-glow-warm'])this.textures.get(k).setFilter(Phaser.Textures.FilterMode.LINEAR);
  this.bar=[0xff3a3a,0x3a6aff].map(col=>this.add.image(LIGHT_BAR.x,LIGHT_BAR.y+70,'street-glow-w').setDepth(6001).setBlendMode(Phaser.BlendModes.ADD).setTint(col).setScale(3.2,2));
  this.head=this.add.image(HOME.x+1500,HOME.y+238,'tg-glow-warm').setDepth(6001).setBlendMode(Phaser.BlendModes.ADD).setScale(1.6,.8).setAlpha(.35);
  this.juice=new Juice(this,{quality:bridge.quality,reduced:!!globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches});
  this.fx=this.add.graphics().setDepth(6004);
  const icons=this.texture('camp-icons',ICON.w*2*ICONS.length,ICON.h*2,iconArt);ICONS.forEach((k,i)=>{if(!icons.has(k))icons.add(k,0,i*ICON.w*2,0,ICON.w*2,ICON.h*2);});
  this.marker=this.add.image(0,0,'camp-icons','chevron').setScale(.5).setOrigin(.5,1).setDepth(7001).setVisible(false);
  this.cameras.main.setBackgroundColor('#07080b').setBounds(0,0,MAP.w,MAP.h).setZoom(this.zoom());
  this.events.on('wake',()=>this.enter());this.enter();bridge.ready(this);}
 // Each time you step out of the door: the street as the kit says it is, you on your step.
 enter(){model.reset();this.fight.start();this.blood.length=0;this.bloodG.clear();for(const z of [...this.zs.keys()])this.free(z);this.setPlayerLook(bridge.look());this.setTrunk(bridge.kit().street!=='start'&&bridge.kit().street!=='cleared');this.cameras.main.centerOn(model.x,model.y-20);this.stream(true);}
 // What the camera shows, in world units.
 view(){const s=this.scale,z=this.zoom(),w=s.width/z,h=s.height/z,x=Math.max(0,Math.min(MAP.w-w,model.x-w/2)),y=Math.max(0,Math.min(MAP.h-h,model.y-20-h/2));return {x,y,w,h};}
 // Takes hold of the chunks near the screen and lets go of the ones well past it, then paints: everything on screen now, the rest
 // a little each frame. all paints everything held at once (stepping out of the door).
 stream(all=false){const V=this.view(),A=grow(V,AHEAD),K=grow(V,KEEP);
  for(const [k,c] of this.chunks)if(!meets(c.R,K))this.drop(k);
  span(A,k=>{if(this.chunks.has(k))return;this.chunks.set(k,{R:chunkRect(k),g:null,l:null});this.todo.add(k);for(const i of BY_CHUNK[k]){const p=this.held.get(i);if(p)p.n++;else{this.held.set(i,{n:1,img:null});this.todo.add(-1-i);}}});
  // On screen: all of it now. Ahead: at least one step a frame, more while there is time.
  let t0=performance.now(),did=false;
  for(const j of this.todo){const on=j>=0?meets(this.chunks.get(j).R,V):meets(PICS[-1-j],V);if(!all&&!on&&did&&performance.now()-t0>BUDGET)continue;
   if(j<0){this.todo.delete(j);this.paintProp(-1-j);}else{while(!this.stepChunk(j)&&(all||on));if(this.chunks.get(j).g)this.todo.delete(j);}if(!on)did=true;}}
 // One step of a chunk: a strip of its ground, then sending the ground to the graphics card, then its light and both pictures.
 stepChunk(k){const c=this.chunks.get(k),R=c.R,key='nb-g-'+k;
  if(!c.t){c.t=this.textures.createCanvas(key,R.w*2,R.h*2);c.s=0;}
  if(c.s<STRIPS){const h=Math.ceil(R.h/STRIPS/8)*8,y=R.y+c.s*h;if(y<R.y+R.h)groundArt(c.t.context,R,{x:R.x,y,w:R.w,h:Math.min(h,R.y+R.h-y)});c.s++;return false;}
  if(c.s===STRIPS){c.t.refresh();if(worthBaking(R.w*2,R.h*2))bake(this,c.t,ctx=>groundArt(ctx,R));c.s++;return false;}
  c.t=null;c.g=this.add.image(R.x,R.y,key).setOrigin(0).setScale(.5).setDepth(-10);
  this.texture('nb-l-'+k,Math.ceil(R.w/LIGHT_SCALE),Math.ceil(R.h/LIGHT_SCALE),ctx=>lightArt(ctx,R));c.l=this.add.image(R.x,R.y,'nb-l-'+k).setOrigin(0).setScale(LIGHT_SCALE).setDepth(6000).setBlendMode(Phaser.BlendModes.MULTIPLY);return true;}
 paintProp(i){const o=PROPS[i],p=this.held.get(i),key=i===CRUISER_I?`street-cruiser-1-${this.trunk?1:0}`:'nb-p-'+o.id;
  if(i!==CRUISER_I)this.texture(key,(o.w+PROP_PAD*2)*2,(o.h+o.z+PROP_PAD*2)*2,c=>propArt(c,o));
  p.img=this.add.image(o.x-PROP_PAD,o.y-o.z-PROP_PAD,key).setOrigin(0).setScale(.5).setDepth(o.flat?0:o.y+o.h+i*1e-5);if(o.fade)this.fades.add(i);}
 forget(key){unbake(key);if(this.textures.exists(key))this.textures.remove(key);}
 drop(k){const c=this.chunks.get(k);this.chunks.delete(k);this.todo.delete(k);c.g?.destroy();c.l?.destroy();this.forget('nb-g-'+k);this.forget('nb-l-'+k);
  for(const i of BY_CHUNK[k]){const p=this.held.get(i);if(!p||--p.n>0)continue;this.held.delete(i);this.todo.delete(-1-i);this.fades.delete(i);if(p.img){p.img.destroy();if(i!==CRUISER_I)this.forget('nb-p-'+PROPS[i].id);}}}
 // A prop's picture for the talk box, painted fresh, since the one on screen may only live on the graphics card.
 face(id){const o=PROPS.find(p=>p.id===id);if(!o)return null;const c=document.createElement('canvas');c.width=(o.w+PROP_PAD*2)*2;c.height=(o.h+o.z+PROP_PAD*2)*2;propArt(c.getContext('2d'),o.id==='cruiser'?{...o,lit:1,trunk:this.trunk}:o);return c;}
 setTrunk(open){this.trunk=open;}
 // Your layers, painted once for each gun you hold, so swapping does not repaint.
 setPlayerLook(look){const gun=bridge.held?.()||'none',key=JSON.stringify(look)+gun;this.look={...look,zombie:0,gun,grenade:null};
  if(!this.gunSheets[key]){const sheets={};for(const k of ORDER){const L=LAYERS[k],t=this.textures.createCanvas(`st-${Object.keys(this.gunSheets).length}-${k}`,...sheetSize(L));for(let i=0;i<L.count;i++)t.add(i,0,(i%L.cols)*L.w,Math.floor(i/L.cols)*L.h,L.w,L.h);sheets[k]=t;}
   const ctx={};for(const k of ORDER)ctx[k]=sheets[k].context;paintLayers(ctx,this.look);for(const k of ORDER)sheets[k].refresh();this.gunSheets[key]=sheets;}
  const sheets=this.gunSheets[key];for(const k of ORDER){const L=LAYERS[k];if(!this.parts[k])this.parts[k]=this.add.image(model.x,model.y,sheets[k].key,0).setOrigin(...origin(L)).setScale(.5);else this.parts[k].setTexture(sheets[k].key,0);}}
 zoom(){const s=this.scale;return Math.max(bridge.zoom(),s.width/MAP.w,s.height/MAP.h);}
 placeActor(){const p=pose(model),gun=armed(this.look),down=!!this.fight.down;
  for(const k of ORDER){const s=this.parts[k],ride=k==='arms'||k==='head';s.setFrame(p[k]);s.setPosition(model.x+(ride&&!down?p.dx:0),model.y+(ride&&!down?p.dy:0));s.setAlpha(down?.5:1);}
  const y=model.y;this.parts.legs.setDepth(y);this.parts.body.setDepth(y+.01);this.parts.arms.setDepth(y+.02).setVisible(gun);this.parts.head.setDepth(y+.03);}
 // A zombie's sprite while it is near the screen, taken from a pool and handed back when it is not, so a whole neighbourhood of the
 // dead only ever needs as many as you can see.
 sprite(z){let s=this.zs.get(z);if(!s){s=this.pool.pop()||this.add.image(0,0,'street-z-cop',0).setScale(.5);s.setTexture('street-z-'+(SHEET_OF[z.look]||z.look),0).setOrigin((FRAME.w/2-ZF.x)/ZF.w,(FRAME.footY*2-ZF.y)/ZF.h).setAngle(0).clearTint().setAlpha(1).setVisible(true);s.laid=false;this.zs.set(z,s);}return s;}
 free(z){const s=this.zs.get(z);if(!s)return;s.setVisible(false);this.pool.push(s);this.zs.delete(z);}
 splat(x,y,n,seed){this.blood.push({x,y,n,seed});if(this.blood.length>160)this.blood.shift();const g=this.bloodG;g.clear();
  for(const b of this.blood)for(let i=0;i<b.n;i++){const a=((b.seed*(i*37+11))%97)/97*Math.PI*2,r=((b.seed*(i*53+7))%89)/89*b.n*1.6,s=1+((b.seed+i)%3)*.5;g.fillStyle(i%3?0x4a0c0c:0x6a1412,.9).fillRect(Math.round((b.x+Math.cos(a)*r)*2)/2,Math.round((b.y+Math.sin(a)*r*.6)*2)/2,s,s*.6);}}
 // What the fight just did, turned into sound, shake, blood and the HUD.
 react(now,e){const j=this.juice,z=e.z;
  if(e.type==='shot'){const big=e.gun==='pump-shotgun';j.shake(big?'hurt':'down');if(big)j.hold(now,.025);}
  else if(e.type==='hit'||e.type==='kill'){const a=Math.atan2(e.dy,e.dx);j.bits(e.type==='kill'?14:6,z.x,z.y,{dir:a,spread:1.1,speed:e.type==='kill'?90:60,lift:50,z:28,col:0x8a1a16,life:.55,kind:'drop'});this.splat(z.x+e.dx*10,z.y+e.dy*6,e.type==='kill'?7:3,(this.blood.length*31+7)|0);
   if(e.type==='kill'){j.hold(now,.06);j.shake('down');this.splat(z.x,z.y+2,9,(this.blood.length*17+3)|0);}}
  else if(e.type==='hurt')j.shake('hurt');
  else if(e.type==='down')j.shake('brute');
  else if(e.type==='stage'&&e.stage==='looted')this.setTrunk(true);
  else if(e.type==='restart')this.enter();
  bridge.event?.(e);}
 update(now,delta){const dt=Math.min(.05,delta/1000),paused=bridge.paused(),held=this.juice.stopped(now),f=this.fight;
  if(!paused&&!held){const input=f.down?{}:bridge.input();model.update(dt,input);f.update(dt,input);}
  for(const e of f.drain())this.react(now,e);
  this.placeActor();this.stream();
  // The dead near the screen: walking, winding up, or lying where they fell.
  const V=grow(this.view(),120);for(const z of this.zs.keys())if(!f.zombies.includes(z))this.free(z);
  for(const z of f.zombies){if(z.delay>0&&!z.idle||z.x<V.x||z.x>V.x+V.w||z.y<V.y||z.y>V.y+V.h+100){this.free(z);continue;}const s=this.sprite(z);
   if(z.hp<=0){if(!s.laid){s.laid=true;s.setFrame(z.direction).setAngle(90*z.fall).setOrigin(.5,.62).setDepth(z.y-10).setTint(0x9a8a8a);s.setPosition(z.x,z.y-6);}continue;}
   s.setPosition(z.x,z.y).setDepth(z.y).setFrame(z.direction+z.frame*8).setAlpha(z.flash>0?.55:1);}
  // The light bar turns; the cruiser's own lamps swap with it.
  const on=Math.floor(now/260)%2,tex=`street-cruiser-${on+1}-${this.trunk?1:0}`,cr=this.held.get(CRUISER_I)?.img;if(cr&&cr.texture.key!==tex)cr.setTexture(tex);
  // Houses, trees and sheds you walk behind go see-through, so you never lose yourself or what is chasing you.
  for(const i of this.fades){const o=PROPS[i],img=this.held.get(i).img,behind=model.y<o.y+o.h&&model.y>o.y-o.z&&model.x>o.x-8&&model.x<o.x+o.w+8,a=img.alpha+((behind?.4:1)-img.alpha)*Math.min(1,dt*10);if(Math.abs(a-img.alpha)>.002)img.setAlpha(a);}
  this.bar[0].setAlpha(on?.05:.42);this.bar[1].setAlpha(on?.42:.05);this.head.setAlpha(.3+.04*Math.sin(now/90));
  this.juice.update(now,held?0:dt,f);
  // Tracers: a short bright streak running from the muzzle to where the shot stopped.
  const g=this.fx;g.clear();for(const t of f.traces){const k=Math.min(1,t.age/(t.dur||.001)),mx=t.x+t.ox,my=t.y+t.oy,ex=t.ex,ey=t.ey+t.oy,hx=mx+(ex-mx)*k,hy=my+(ey-my)*k,tx=mx+(ex-mx)*Math.max(0,k-.35),ty=my+(ey-my)*Math.max(0,k-.35),a=Math.max(0,t.life/(t.dur+.07));
   g.lineStyle(1,0xfff1c8,.85*a).lineBetween(tx,ty,hx,hy);if(t.done&&t.onto.kind!=='zombie'){g.fillStyle(0xffe2a0,a).fillRect(ex-.5,ey-.5-(t.onto.kind==='prop'?0:-t.oy),1.5,1.5);}}
  // The touch stick's laser, while your thumb is on it.
  const L=bridge.aimLine?.();if(L&&!f.down&&armed(this.look))drawLaser(g,model.x,model.y,muzzle(L.a,this.look.gun),L.a,L.fire);
  const target=f.down?null:paused&&this.target?this.target:model.target(t=>bridge.usable?.(t)!==false);this.target=target;
  if(target){const bob=Math.round(Math.sin(now/180)*2*2)/2;this.marker.setVisible(true).setPosition(target.mx??target.x,target.my+bob);}else this.marker.setVisible(false);
  const cam=this.cameras.main;cam.setZoom(this.zoom());cam.centerOn(model.x,model.y-20);bridge.tick(now,this);}
};}
