// The neighbourhood scene: the ground, the props, you (in the Training Grounds' layers, so the gun points exactly where you aim),
// the dead, the night light, the cruiser's light bar and the fight's effects. The map is far too big to hold as one picture, so it
// is kept in square chunks: the ground and light of the chunks round the screen are painted as you come near and let go once you
// are well past, and each prop is painted while any chunk its picture touches is held. The fight is street/fight.js; this draws it.
import {CineCam} from '../study/camera.js';import {bake,unbake,worthBaking} from '../study/memory.js';import {drawLaser} from '../study/aimstick.js';import {muzzle,lightAt} from '../study/equipment.js';
import {survivor,FRAME} from '../study/character.js';
import {LAYERS,ORDER,origin,sheetSize,paintLayers,paintRacked,paintDive,DIVE as DIVE_ART,pose,armed} from '../study/layers.js';
import {DEFAULT_APPEARANCE,UNIFORMS} from '../study/appearance.js';
import {Juice} from '../study/juice.js';
import {iconArt,ICON,ICONS} from '../camp/art.js';
import {MAP,CHUNK,PROPS,LIGHT_BAR,HOME,EVAC,TRUCK,coverAt} from './data.js';
import {groundArt,lightArt,LIGHT_SCALE,propArt,PROP_PAD} from './art.js';
import {Fight,DIVE,CRAWLER,SEARCH,BRUTE,JOB,SCREAMER,BLOATER,SPITTER} from './fight.js';
import {stepOf} from '../home/kit.js';
import {special,SPECIAL_LOOKS} from '../mc/assets/characters/specials.js';
import {ACID_BOX,acidArt,GLOB,globArt,GAS_BOX,gasArt} from '../mc/assets/effects/hazards.js';
import {ITEM_IDS,itemArt} from '../mc/assets/gear/items.js';
import {painter} from '../mc/assets/core/paint.js';
import {zombiePiece,GORE_PARTS,crawlArt,CRAWL,gibArt,GIBS,bloodArt,BLOOD_BOX} from '../mc/assets/effects/gore.js';
// The dead on this street. Everyone is a neighbour; the cop came with the cruiser.
const POLICE=UNIFORMS.find(u=>u.id==='police').look,Z={zombie:1,pack:1,rot:1,decay:1,eyes:0,wounds:1};
export const ZOMBIE_LOOKS={cop:{...DEFAULT_APPEARANCE,...POLICE,...Z,hair:1,skin:2,wounds:1},
 neighbour:{...DEFAULT_APPEARANCE,...Z,top:3,coat:2,bottom:1,pants:1,shoes:1,hair:0,color:1,skin:1,wounds:2},
 jogger:{...DEFAULT_APPEARANCE,...Z,body:1,top:6,shirt:3,bottom:4,shoes:1,hair:2,color:4,skin:3,decay:0,wounds:1},
 robe:{...DEFAULT_APPEARANCE,...Z,top:2,shirt:1,bottom:3,pants:2,shoes:2,hair:3,beard:6,color:3,skin:0,decay:2,wounds:3},
 worker:{...DEFAULT_APPEARANCE,...Z,top:0,coat:4,hat:1,bottom:2,pants:3,shoes:0,beard:3,skin:4,eyes:2,wounds:2},
 // A runner: out for a run when it happened, lean, with eyes that catch the light. A brute: a big man gone bad, drawn half as big again.
 runner:{...DEFAULT_APPEARANCE,...Z,body:1,top:6,shirt:5,bottom:4,shoes:1,hair:2,color:2,skin:1,decay:1,eyes:1,wounds:2,rot:3},
 brute:{...DEFAULT_APPEARANCE,...Z,top:3,coat:2,bottom:5,pants:3,shoes:0,hair:4,beard:3,color:0,skin:5,decay:1,eyes:2,wounds:3,rot:1},
 // The special dead, in the Master Creator's looks for them: a screamer in a nightgown, a bloater in a tank top, a spitter.
 // Mrs. Hargrove: silver hair up in a bun, a sage cardigan and grey slacks, out in her good shoes after her dog.
 hargrove:{...DEFAULT_APPEARANCE,...Z,body:1,top:2,shirt:5,bottom:3,pants:4,shoes:2,hair:9,color:3,skin:1,decay:1,eyes:0,wounds:1},
 screamer:{...DEFAULT_APPEARANCE,...Z,...SPECIAL_LOOKS.screamer},bloater:{...DEFAULT_APPEARANCE,...Z,...SPECIAL_LOOKS.bloater},spitter:{...DEFAULT_APPEARANCE,...Z,...SPECIAL_LOOKS.spitter},
 // The man you started as, after: his own clothes and pack, freshly dead (TUTORIAL_LOOK is how he looked alive).
 you:{...DEFAULT_APPEARANCE,zombie:1,rot:1,decay:0,eyes:0,wounds:2}};
export const TUTORIAL_LOOK=DEFAULT_APPEARANCE;
// Runners' sheets hold the lurching run in place of the walk; brutes never come apart, so they have no pieces.
const RUN_LOOKS=new Set(['runner']),WHOLE=new Set(['brute','bloater','you']);
// The special dead's sheets have one more row: the act (the scream, the swell, the spit), frame 9.
const SPECIAL=new Set(['screamer','bloater','spitter']),SCALE={brute:BRUTE.scale,bloater:BLOATER.scale};
const SHEET_OF={neighbour2:'neighbour'};
// Zombie sheets hold the standing frame and the eight walking frames, cropped to the part of the frame a body uses.
const ZF={x:16,y:8,w:128,h:176,rows:9};
// Gore: each look's pieces (top and bottom halves, head and headless, cropped like the walk) and its crawl; flying pieces and gibs
// fall, bounce and skid like the casings and lie where they stop; blood is stamped on the ground and up the walls as pictures. How
// many of each are kept (the oldest go first), and where on a piece it spins round (frame pixels) and how high that is off the ground.
export const GORE_FX={keep:240,pieces:70,gravity:540,gibs:{half:9,head:4,blast:4},spin:{upper:[80,82],head:[80,46]}};
const CRAWL_COL={0:0,1:1,2:2,6:3,7:4},CRAWL_FLIP={3:1,4:0,5:4};
// The blood stamps, one sheet: pools, splashes thrown each way, drops, drag marks and wall splatter, a few of each.
const STAINS=[...[0,1,2,3].map(s=>['pool',s,0]),...[0,1].flatMap(s=>[0,1,2,3,4,5,6,7].map(d=>['splash',s,d])),...[0,1,2,3].map(s=>['drops',s,0]),...[0,1,2,3,4,5,6,7].map(d=>['smear',0,d]),...[0,1,2,3].map(s=>['wall',s,0])];
const STAIN_AT=(k,s=0,d=0)=>STAINS.findIndex(([a,b,c])=>a===k&&b===s&&c===d);
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
// The first job's generator and work light (dark until the generator is running), and the truck out.
const GEN=PROPS.find(o=>o.id==='job-gen'),FLOOD=PROPS.find(o=>o.id==='job-light');
// The job's two parts, as the Master Creator's town set draws them: the Castillos' car battery and Ray's gas can.
const PART_ART={battery:{kind:'carbattery',w:14,h:8,z:10},fuel:{kind:'gascan',w:12,h:6,z:16}};
// The flashlight: a cone of warm white light from the gun, len long and half wide either side, and a small pool round you. Painted
// in the light map's own pixels (LIGHT_SCALE world units each), in six steps like the rest of the night's light.
export const BEAM={len:240,half:24*Math.PI/180,pool:36,col:[255,244,220]};
// The fight's clock: sixty steps a second whatever the screen manages (up to four a frame), so it plays the same on every phone.
export const STEP=1/60,MAX_STEPS=4;
// What a shot does to the picture: how long its flash lights the street and how far, how far the gun kicks back in your hands
// and the view jolts away from the shot, and how many casings stay on the ground.
export const KICK={'light-pistol':{light:.06,glow:3,arms:2,cam:2.4,flash:7},'heavy-pistol':{light:.07,glow:3.6,arms:3,cam:3.4,flash:9},'pump-shotgun':{light:.09,glow:4.6,arms:4,cam:6,flash:12}};
export const BRASS={keep:60,pump:.38};
// How the dead take a hit: a flinch for a moment, and a topple onto the ground (the hips drop this far as they go over).
export const TOPPLE={time:.32,hips:26.4,flinch:.14};
const step6=f=>Math.min(1,Math.round(f*6)/6);
function beamArt(c){const w=c.canvas.width,h=c.canvas.height,img=c.createImageData(w,h),d=img.data,L=BEAM.len/LIGHT_SCALE,[R,G,B]=BEAM.col;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const dx=x+.5,dy=y+.5-h/2,r=Math.hypot(dx,dy),a=Math.abs(Math.atan2(dy,dx)),i=(y*w+x)*4;if(r>=L||a>=BEAM.half)continue;
  const f=step6(Math.pow(1-r/L,.45)*Math.pow(1-(a/BEAM.half)**2,.6)*1.25);d[i]=R*f;d[i+1]=G*f;d[i+2]=B*f;d[i+3]=255;}c.putImageData(img,0,0);}
function poolArt(c){const n=c.canvas.width,img=c.createImageData(n,n),d=img.data,[R,G,B]=BEAM.col;for(let y=0;y<n;y++)for(let x=0;x<n;x++){const r=Math.hypot(x+.5-n/2,y+.5-n/2)/(n/2),i=(y*n+x)*4;if(r>=1)continue;const f=step6((1-r)*.55);d[i]=R*f;d[i+1]=G*f;d[i+2]=B*f;d[i+3]=255;}c.putImageData(img,0,0);}
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
  // Blood on the ground (under everything standing) and on the walls, and the pieces flying or lying about.
  this.stains=[];this.bits=[];this.lain=[];
  // You.
  this.parts={};this.gunSheets={};this.setPlayerLook(bridge.look());
  // The dead: one sheet per look.
  for(const [id,look] of Object.entries(ZOMBIE_LOOKS)){const sp=SPECIAL.has(id),rows=ZF.rows+(sp?1:0),t=this.texture('street-z-'+id,ZF.w*8,ZF.h*rows,c=>{c.imageSmoothingEnabled=false;for(let f=0;f<rows;f++)for(let d=0;d<8;d++){c.save();c.beginPath();c.rect(d*ZF.w,f*ZF.h,ZF.w,ZF.h);c.clip();c.translate(d*ZF.w-ZF.x,f*ZF.h-ZF.y);c.scale(2,2);
    if(sp)special(c,id,d,f<ZF.rows?f:0,look,f<ZF.rows?0:1);else survivor(c,d,RUN_LOOKS.has(id)&&f>0?f+8:f,false,look);c.restore();}});
   for(let f=0;f<rows;f++)for(let d=0;d<8;d++)if(!t.has(f*8+d))t.add(f*8+d,0,d*ZF.w,f*ZF.h,ZF.w,ZF.h);
   // Its pieces, a row each in the same crop, and its crawl: five facings (the rest are mirrored) by four frames.
   if(WHOLE.has(id))continue;
   const P=this.texture('street-zp-'+id,ZF.w*8,ZF.h*4,c=>{c.imageSmoothingEnabled=false;GORE_PARTS.forEach((part,r)=>{for(let d=0;d<8;d++){c.save();c.beginPath();c.rect(d*ZF.w,r*ZF.h,ZF.w,ZF.h);c.clip();c.translate(d*ZF.w-ZF.x,r*ZF.h-ZF.y);zombiePiece(c,look,d,part,0,d+r*8+1);c.restore();}});});
   for(let i=0;i<32;i++)if(!P.has(i))P.add(i,0,(i%8)*ZF.w,Math.floor(i/8)*ZF.h,ZF.w,ZF.h);
   const C=this.texture('street-zc-'+id,CRAWL.w*5,CRAWL.h*4,c=>{c.imageSmoothingEnabled=false;for(const [d,col] of Object.entries(CRAWL_COL))for(let f=0;f<4;f++){c.save();c.beginPath();c.rect(col*CRAWL.w,f*CRAWL.h,CRAWL.w,CRAWL.h);c.clip();c.translate(col*CRAWL.w,f*CRAWL.h);crawlArt(c,look,+d,f,3);c.restore();}});
   for(let i=0;i<20;i++)if(!C.has(i))C.add(i,0,(i%5)*CRAWL.w,Math.floor(i/5)*CRAWL.h,CRAWL.w,CRAWL.h);}
  const GB=this.texture('gore-gibs',20*GIBS.length,60,c=>{GIBS.forEach((k,i)=>{for(let v=0;v<3;v++){c.save();c.translate(i*20,v*20);gibArt(c,k,i*3+v,['#3a3f4a','#4a3b2e','#5a4a3a'][v]);c.restore();}});});
  for(let i=0;i<GIBS.length*3;i++)if(!GB.has(i))GB.add(i,0,Math.floor(i/3)*20,(i%3)*20,20,20);
  // What the dead drop, from the bag's own icons.
  const LI=this.texture('loot-icons',24*ITEM_IDS.length,24,c=>ITEM_IDS.forEach((id,i)=>{c.save();c.scale(2,2);c.translate(i*12+6,6);itemArt(painter(c),id);c.restore();}));ITEM_IDS.forEach((id,i)=>{if(!LI.has(id))LI.add(id,0,i*24,0,24,24);});this.dropImgs=new Map();
  this.parts=Object.entries(PART_ART).map(([item,o])=>{this.texture('part-'+item,(o.w+PROP_PAD*2)*2,(o.h+o.z+PROP_PAD*2)*2,c=>propArt(c,o));return {item,o,img:this.add.image(0,0,'part-'+item).setOrigin(0).setScale(.5).setVisible(false)};});
  const BW=BLOOD_BOX.w*2,BH=BLOOD_BOX.h*2,BS=this.texture('gore-blood',BW*8,BH*Math.ceil(STAINS.length/8),c=>STAINS.forEach(([k,sd,d],i)=>{c.save();c.translate((i%8)*BW,Math.floor(i/8)*BH);bloodArt(c,k,sd*17+i+3,d);c.restore();}));
  for(let i=0;i<STAINS.length;i++)if(!BS.has(i))BS.add(i,0,(i%8)*BW,Math.floor(i/8)*BH,BW,BH);
  // Acid pools (four frames of bubbling and a dried stain), the glob in flight, and three shades of the bloater's gas.
  const AW=ACID_BOX.w*2,AH=ACID_BOX.h*2,AC=this.texture('haz-acid',AW*5,AH,c=>{for(let f=0;f<5;f++){c.save();c.translate(f*AW,0);acidArt(c,7,f%4,f<4?0:.8);c.restore();}});for(let f=0;f<5;f++)if(!AC.has(f))AC.add(f,0,f*AW,0,AW,AH);
  const GL=this.texture('haz-glob',GLOB.w*2*2,GLOB.h*2,c=>{for(let f=0;f<2;f++){c.save();c.translate(f*GLOB.w*2,0);globArt(c,f,0);c.restore();}});for(let f=0;f<2;f++)if(!GL.has(f))GL.add(f,0,f*GLOB.w*2,0,GLOB.w*2,GLOB.h*2);
  const GW=GAS_BOX.w*2,GH=GAS_BOX.h*2,GS=this.texture('haz-gas',GW*3,GH,c=>{for(let k=0;k<3;k++){const t=document.createElement('canvas');t.width=GW;t.height=GH;gasArt(t.getContext('2d'),k*5+2,k);c.drawImage(t,k*GW,0);}});for(let k=0;k<3;k++)if(!GS.has(k))GS.add(k,0,k*GW,0,GW,GH);
  this.hz=new Map();
  this.zs=new Map();this.pool=[];
  this.fight=new Fight(model,{kit:bridge.kit,setKit:bridge.setKit,grid:bridge.grid});model.zombies=this.fight.zombies;
  // Night: the light maps of the chunks on screen, and your flashlight added on top, go into one picture each frame that multiplies
  // everything under it; the light bar, muzzle flashes and tracers sit above it.
  this.lit=this.add.renderTexture(0,0,16,16).setOrigin(0).setScale(LIGHT_SCALE).setDepth(6000).setBlendMode(Phaser.BlendModes.MULTIPLY);
  this.texture('nb-beam',BEAM.len/LIGHT_SCALE+2,Math.ceil(BEAM.len*Math.tan(BEAM.half)/LIGHT_SCALE)*2+2,beamArt);this.texture('nb-pool',BEAM.pool,BEAM.pool,poolArt);
  for(const k of ['nb-beam','nb-pool'])this.textures.get(k).setFilter(Phaser.Textures.FilterMode.LINEAR);
  this.texture('street-glow-w',128,128,c=>glow(c,[255,255,255]));this.texture('tg-glow',128,128,c=>glow(c,[235,240,255]));this.texture('tg-glow-warm',128,128,c=>glow(c,[255,214,150]));
  for(const k of ['street-glow-w','tg-glow','tg-glow-warm'])this.textures.get(k).setFilter(Phaser.Textures.FilterMode.LINEAR);
  this.bar=[0xff3a3a,0x3a6aff].map(col=>this.add.image(LIGHT_BAR.x,LIGHT_BAR.y+70,'street-glow-w').setDepth(6001).setBlendMode(Phaser.BlendModes.ADD).setTint(col).setScale(3.2,2));
  this.head=this.add.image(HOME.x+1500,HOME.y+238,'tg-glow-warm').setDepth(6001).setBlendMode(Phaser.BlendModes.ADD).setScale(1.6,.8).setAlpha(.35);
  this.juice=new Juice(this,{quality:bridge.quality,reduced:!!globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches});
  this.fx=this.add.graphics().setDepth(6004);
  // Casings in the air sit just under the night; the ones on the ground are painted with the blood.
  this.brass=[];this.lying=[];this.pumps=[];this.brassG=this.add.graphics().setDepth(5990);this.floorG=this.add.graphics().setDepth(.6);this.kick=null;this.jolt={x:0,y:0};this.acc=0;
  const icons=this.texture('camp-icons',ICON.w*2*ICONS.length,ICON.h*2,iconArt);ICONS.forEach((k,i)=>{if(!icons.has(k))icons.add(k,0,i*ICON.w*2,0,ICON.w*2,ICON.h*2);});
  // The truck, shut and with the tailgate down, nose to the west; its headlights; the flare you light to call it; the work light.
  for(const open of [0,1])this.texture('street-truck-'+open,(TRUCK.w+PROP_PAD*2)*2,(TRUCK.h+TRUCK.z+PROP_PAD*2)*2,c=>propArt(c,{kind:'truck',w:TRUCK.w,h:TRUCK.h,z:TRUCK.z,open:!!open}));
  this.truck=this.add.image(0,0,'street-truck-0').setOrigin(0).setScale(.5).setFlipX(true).setVisible(false);
  this.lamps=[0,1].map(()=>this.add.image(0,0,'tg-glow-warm').setDepth(6001).setBlendMode(Phaser.BlendModes.ADD).setScale(.5,.35).setVisible(false));
  this.flare=this.add.image(EVAC.x,EVAC.y,'street-glow-w').setDepth(6001).setBlendMode(Phaser.BlendModes.ADD).setTint(0xff3020).setVisible(false);
  this.flood=this.add.image(FLOOD.x+FLOOD.w/2,FLOOD.y-FLOOD.z+6,'tg-glow-warm').setDepth(6001).setBlendMode(Phaser.BlendModes.ADD).setScale(.7,.5).setAlpha(.8).setVisible(false);
  this.marker=this.add.image(0,0,'camp-icons','chevron').setScale(.5).setOrigin(.5,1).setDepth(7001).setVisible(false);
  this.cameras.main.setBackgroundColor('#07080b').setBounds(0,0,MAP.w,MAP.h).setZoom(this.zoom());
  this.events.on('wake',()=>this.enter());this.enter();bridge.ready(this);}
 // Each time you step out of the door: the street as the kit says it is, you on your step.
 enter(){model.reset();this.fight.start();for(const i of this.dropImgs.values())i.destroy();this.dropImgs.clear();for(const v of this.hz.values())for(const i of v)i.destroy();this.hz.clear();for(const i of [...this.stains,...this.bits.map(b=>b.img),...this.lain])i.destroy();this.stains.length=0;this.bits.length=0;this.lain.length=0;this.brass.length=0;this.lying.length=0;this.pumps.length=0;this.floorG.clear();this.kick=null;this.jolt={x:0,y:0};for(const z of [...this.zs.keys()])this.free(z);this.setPlayerLook(bridge.look());this.setTrunk(bridge.kit().street!=='start'&&bridge.kit().street!=='cleared');this.setPower(['hold','done'].includes(stepOf(bridge.kit(),'power')));this.cameras.main.centerOn(model.x,model.y-20);this.stream(true);}
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
  this.texture('nb-l-'+k,Math.ceil(R.w/LIGHT_SCALE),Math.ceil(R.h/LIGHT_SCALE),ctx=>lightArt(ctx,R));c.l=true;return true;}
 paintProp(i){const o=PROPS[i],p=this.held.get(i),on=o.job==='power'&&this.power,key=i===CRUISER_I?`street-cruiser-1-${this.trunk?1:0}`:'nb-p-'+o.id+(on?'-on':'');
  if(i!==CRUISER_I)this.texture(key,(o.w+PROP_PAD*2)*2,(o.h+o.z+PROP_PAD*2)*2,c=>propArt(c,on?{...o,on:true}:o));
  p.img=this.add.image(o.x-PROP_PAD,o.y-o.z-PROP_PAD,key).setOrigin(0).setScale(.5).setDepth(o.flat?0:o.y+o.h-(o.sink||0)+i*1e-5);if(o.fade)this.fades.add(i);}
 forget(key){unbake(key);if(this.textures.exists(key))this.textures.remove(key);}
 drop(k){const c=this.chunks.get(k);this.chunks.delete(k);this.todo.delete(k);c.g?.destroy();this.forget('nb-g-'+k);this.forget('nb-l-'+k);
  for(const i of BY_CHUNK[k]){const p=this.held.get(i);if(!p||--p.n>0)continue;this.held.delete(i);this.todo.delete(-1-i);this.fades.delete(i);if(p.img){p.img.destroy();if(i!==CRUISER_I)this.forget(p.img.texture.key);}}}
 // The generator and work light, painted again once the generator is running.
 setPower(on){if(this.power===on)return;this.power=on;for(const o of [GEN,FLOOD]){const i=PROPS.indexOf(o),p=this.held.get(i);if(!p?.img)continue;const old=p.img.texture.key;p.img.destroy();this.forget(old);this.paintProp(i);}}
 // The light over the screen: each chunk's light map, then the flashlight added where the gun points.
 light(){const V=grow(this.view(),24),L=LIGHT_SCALE,ox=Math.floor(V.x/L)*L,oy=Math.floor(V.y/L)*L,w=Math.ceil(V.w/L)+2,h=Math.ceil(V.h/L)+2,rt=this.lit;
  if(rt.width!==w||rt.height!==h)rt.resize(w,h);rt.setPosition(ox,oy);rt.clear();
  for(const [k,c] of this.chunks)if(c.l&&meets(c.R,V))rt.stamp('nb-l-'+k,undefined,(c.R.x-ox)/L,(c.R.y-oy)/L,{originX:0,originY:0});
  const b=this.fight.beam=bridge.flash?.()&&!this.fight.down&&armed(this.look)?{x:model.x,y:model.y,a:model.aim??model.direction*Math.PI/4}:null;
  if(b){const mz=lightAt(b.a,this.look.gun),add=Phaser.BlendModes.ADD;rt.stamp('nb-pool',undefined,(model.x-ox)/L,(model.y-14-oy)/L,{blendMode:add});
   rt.stamp('nb-beam',undefined,(model.x+mz.x-ox)/L,(model.y+mz.y-oy)/L,{originX:0,originY:.5,rotation:b.a,blendMode:add});}
  // His flashlight, where it fell with him, still on: it lights what happens to him, and lies there until you take his gear back.
  const T=this.fight.torch;if(T)rt.stamp('nb-beam',undefined,(T.x-ox)/L,(T.y-oy)/L,{originX:0,originY:.5,rotation:T.a,blendMode:Phaser.BlendModes.ADD,alpha:.75,scaleX:.8,scaleY:.8}),rt.stamp('nb-pool',undefined,(T.x-ox)/L,(T.y-4-oy)/L,{blendMode:Phaser.BlendModes.ADD,scale:1.6,alpha:.55});
  // The work light, once the generator runs: a wide warm pool in front of it. The flare: a red pool that flickers. The truck's
  // headlights: two beams ahead of it, to the west.
  const add=Phaser.BlendModes.ADD,f=this.fight,ev=f.evac,flick=.8+.2*Math.sin(this.time.now/47)*Math.sin(this.time.now/131);
  if(this.power&&meets(grow(V,200),{x:FLOOD.x,y:FLOOD.y,w:1,h:1}))rt.stamp('nb-pool',undefined,(FLOOD.x+8-ox)/L,(FLOOD.y+16-oy)/L,{blendMode:add,scale:6,alpha:.9,tint:0xfff0d0});
  if(ev&&meets(grow(V,200),{x:EVAC.x,y:EVAC.y,w:1,h:1}))rt.stamp('nb-pool',undefined,(EVAC.x-ox)/L,(EVAC.y-oy)/L,{blendMode:add,scale:4.2*flick,alpha:.95,tint:0xff5a40});
  if(ev&&ev.state!=='hold'){const tx=ev.x,ty=TRUCK.y+TRUCK.h*.5;for(const dy of [-16,14])rt.stamp('nb-beam',undefined,(tx-ox)/L,(ty+dy-oy)/L,{originX:0,originY:.5,rotation:Math.PI,blendMode:add,alpha:.8});}
  // Acid and gas give off a little sickly light of their own, so you can see them in the dark.
  for(const p of f.pools)if(meets(grow(V,60),{x:p.x,y:p.y,w:1,h:1}))rt.stamp('nb-pool',undefined,(p.x-ox)/L,(p.y-oy)/L,{blendMode:add,scale:1.5,alpha:.55*Math.min(1,(p.T-p.t)/1.2),tint:0x9ad13a});
  for(const c of f.clouds)if(meets(grow(V,120),{x:c.x,y:c.y,w:1,h:1}))rt.stamp('nb-pool',undefined,(c.x-ox)/L,(c.y-10-oy)/L,{blendMode:add,scale:3.4,alpha:.45*Math.min(1,(c.T-c.t)/1.6),tint:0x9ab83a});
  // A shot lights the street round you for an instant, warm and wide, the shotgun more.
  const K=KICK[this.fight.gunId],t=this.fight.sinceShot;if(K&&t<K.light&&this.shotA!==undefined){const mz=muzzle(this.shotA,this.look.gun),k=1-t/K.light;
   const x=(model.x+mz.x*.6-ox)/L,y=(model.y+mz.y*.4-oy)/L,add=Phaser.BlendModes.ADD;rt.stamp('nb-pool',undefined,x,y,{blendMode:add,scale:K.glow*(.8+.2*k),alpha:k,tint:0xffd49a});
   for(let i=0;i<2;i++)rt.stamp('nb-pool',undefined,x,y,{blendMode:add,scale:K.glow*.45,alpha:k,tint:0xfff0d0});}
  rt.render();}
 // A prop's picture for the talk box, painted fresh, since the one on screen may only live on the graphics card.
 face(id){const o=PROPS.find(p=>p.id===id);if(!o)return null;const c=document.createElement('canvas');c.width=(o.w+PROP_PAD*2)*2;c.height=(o.h+o.z+PROP_PAD*2)*2;propArt(c.getContext('2d'),o.id==='cruiser'?{...o,lit:1,trunk:this.trunk}:o);return c;}
 setTrunk(open){this.trunk=open;}
 // Your layers, painted once for each gun you hold, so swapping does not repaint.
 // With the flashlight found it rides under the barrel of whatever gun you hold, and the beam comes out of it.
 setPlayerLook(look){const gun=bridge.held?.()||'none',light=!!bridge.kit?.()?.light,key=JSON.stringify(look)+gun+light;this.look={...look,zombie:0,gun,grenade:null,light};
  if(!this.gunSheets[key]){const sheets={};for(const k of ORDER){const L=LAYERS[k],t=this.textures.createCanvas(`st-${Object.keys(this.gunSheets).length}-${k}`,...sheetSize(L));for(let i=0;i<L.count;i++)t.add(i,0,(i%L.cols)*L.w,Math.floor(i/L.cols)*L.h,L.w,L.h);sheets[k]=t;}
   const ctx={};for(const k of ORDER)ctx[k]=sheets[k].context;sheets.turned=paintLayers(ctx,this.look);for(const k of ORDER)sheets[k].refresh();
   // The gun mid-action (the arms layer with the slide or pump back) and the dive, both from the same layers.
   const n=Object.keys(this.gunSheets).length,A=LAYERS.arms,rk=this.textures.createCanvas(`st-${n}-racked`,...sheetSize(A));for(let i=0;i<A.count;i++)rk.add(i,0,(i%A.cols)*A.w,Math.floor(i/A.cols)*A.h,A.w,A.h);paintRacked(rk.context,this.look);rk.refresh();sheets.racked=rk;
   const D=DIVE_ART,dv=this.textures.createCanvas(`st-${n}-dive`,...sheetSize(D));for(let i=0;i<D.count;i++)dv.add(i,0,(i%D.cols)*D.w,Math.floor(i/D.cols)*D.h,D.w,D.h);paintDive(dv.context,ctx,this.look);dv.refresh();sheets.dive=dv;
   this.gunSheets[key]=sheets;}
  const sheets=this.gunSheets[key];this.sheets=sheets;this.racked=false;for(const k of ORDER){const L=LAYERS[k];if(!this.parts[k])this.parts[k]=this.add.image(model.x,model.y,sheets[k].key,0).setOrigin(...origin(L)).setScale(.5);else this.parts[k].setTexture(sheets[k].key,0);}
  if(!this.diveImg)this.diveImg=this.add.image(0,0,sheets.dive.key,0).setOrigin(DIVE_ART.x/DIVE_ART.w,DIVE_ART.y/DIVE_ART.h).setScale(.5).setVisible(false);else this.diveImg.setTexture(sheets.dive.key,0);}
 zoom(){const s=this.scale;return Math.max(bridge.zoom(),s.width/MAP.w,s.height/MAP.h);}
 // You: the layers in the pose the model is in. A shot kicks your arms and head back along the shot for a moment, and the gun
 // cycles (the pistol's slide snaps back as it fires; the shotgun's pump is worked a moment later). A dive swaps the layers for
 // the dive's own frames: the leap, the slide along the ground and the rise.
 placeActor(){const gun=armed(this.look),p=pose(model,gun&&!!this.sheets?.turned),down=!!this.fight.down,K=this.kick,v=this.fight.dive,half=n=>Math.round(n*2)/2,f=this.fight;
  // Gone: what is left of him is one of the dead now (the fight's body), so you are not drawn at all.
  if(f.dead){this.diveImg.setVisible(false);for(const k of ORDER)this.parts[k].setVisible(false);return;}
  let kx=0,ky=0;if(K){const k=Math.max(0,1-K.t/K.dur);kx=-Math.cos(K.a)*K.n*k*k;ky=-Math.sin(K.a)*K.n*k*k*.6;}
  const t=f.sinceShot,rk=gun&&!v&&(f.gunId==='pump-shotgun'?t>.22&&t<.5:t<.06);if(rk!==this.racked){this.racked=rk;this.parts.arms.setTexture((rk?this.sheets.racked:this.sheets.arms).key,p.arms);}
  if(v){const T=DIVE.time,ph=v.t<.1?0:v.t<T?1:2,hop=v.t<T*.55?Math.sin(v.t/(T*.55)*Math.PI)*5:0,d=(Math.round(Math.atan2(v.dy,v.dx)/(Math.PI/4))+8)%8;
   this.diveImg.setVisible(true).setFrame(d+ph*8).setPosition(half(model.x),half(model.y-hop)).setDepth(model.y+.02).setAlpha(down?.5:1);for(const k of ORDER)this.parts[k].setVisible(false);return;}
  this.diveImg.setVisible(false);for(const k of ORDER)this.parts[k].setVisible(true);
  // Going over a fence, all of you is lifted by the hop.
  const lift=f.vault?f.vault.h||0:0;
  for(const k of ORDER){const s=this.parts[k],ride=p.rides.includes(k)&&!down,body=k==='body'&&!ride;s.setFrame(p[k]);
   s.setPosition(half(model.x+(ride?p.dx+kx:body?kx*.35:0)),half(model.y-lift+(ride?p.dy+ky:body?ky*.35:0)));s.setAlpha(down?.5:1);}
  const y=model.y;this.parts.legs.setDepth(y);this.parts.body.setDepth(y+.01);this.parts.arms.setDepth(y+.02).setVisible(gun);this.parts.head.setDepth(y+.03);}
 // A zombie's sprite while it is near the screen, taken from a pool and handed back when it is not, so a whole neighbourhood of the
 // dead only ever needs as many as you can see.
 sprite(z){let s=this.zs.get(z);if(!s){s=this.pool.pop()||this.add.image(0,0,'street-z-cop',0).setScale(.5);const id=SHEET_OF[z.look]||z.look;
  if(z.kind==='crawler')s.setTexture('street-zc-'+id,0).setOrigin(CRAWL.x/CRAWL.w,CRAWL.y/CRAWL.h);else s.setTexture('street-z-'+id,0).setOrigin((FRAME.w/2-ZF.x)/ZF.w,(FRAME.footY*2-ZF.y)/ZF.h);
  s.setScale(.5*(SCALE[z.kind]||1)).setAngle(0).setFlipX(false).clearTint().setAlpha(1).setVisible(true);s.laid=false;s.white=false;s.grey=false;this.zs.set(z,s);}return s;}
 free(z){const s=this.zs.get(z);if(!s)return;s.setVisible(false);this.pool.push(s);this.zs.delete(z);}
 // A blood stamp at (x, y): on the ground under everything, or up a wall at the wall's depth. With gore reduced, fewer of them.
 stain(kind,x,y,{dir=0,depth=.5}={}){if(!this.goreOn&&kind!=='pool'&&Math.random()<.5)return;const d=((dir%8)+8)%8,v=Math.random()*4|0;
  const f=kind==='splash'?STAIN_AT(kind,v%2,d):kind==='smear'?STAIN_AT(kind,0,d):STAIN_AT(kind,v);if(f<0)return;
  const img=this.stains.length>=GORE_FX.keep?this.stains.shift():this.add.image(0,0,'gore-blood',0).setScale(.5);img.setFrame(f).setPosition(Math.round(x*2)/2,Math.round(y*2)/2).setDepth(depth).setAlpha(1).setVisible(true)
   .setFlipX(kind!=='splash'&&kind!=='smear'&&Math.random()<.5).setFlipY(kind==='pool'||kind==='drops'?Math.random()<.5:false);this.stains.push(img);}
 // Gore on: set from the options each frame (the fight cuts bodies only when it is on).
 get goreOn(){return bridge.gore?.()!=='reduced';}
 // A piece or a chunk thrown from a body: it flies, tumbles, bounces and skids along the ground, bleeding as it goes, and lies where
 // it stops. land, if given, is where it must come down and when (a top half that will crawl).
 throwBit(key,frame,x,y,z,{vx=0,vy=0,vz=0,spin=0,origin=[.5,.5],flat=90,land=null,depth=0}={}){const img=this.add.image(x,y-z,key,frame).setScale(.5).setOrigin(...origin).setDepth(y+depth);
  if(land){const T=land.t;vx=(land.x-x)/T;vy=(land.y-y)/T;vz=(-z+.5*GORE_FX.gravity*T*T)/T;}
  this.bits.push({img,x,y,z,vx,vy,vz,spin,a:0,flat,land,age:0,drip:0});}
 bitStep(dt){const G=GORE_FX.gravity,half=n=>Math.round(n*2)/2;
  this.bits=this.bits.filter(b=>{b.age+=dt;b.vz-=G*dt;b.x+=b.vx*dt;b.y+=b.vy*dt;b.z+=b.vz*dt;b.a+=b.spin*dt;
   if(b.z>2&&(b.drip-=dt)<=0){b.drip=.05;this.juice.bits(1,b.x,b.y,{dir:Math.atan2(b.vy,b.vx),spread:.8,speed:20,lift:10,z:b.z,col:0x7a1416,life:.4,kind:'drop'});}
   if(b.z<=0){b.z=0;if(b.land&&b.age>=b.land.t-.02){b.img.destroy();this.stain('drops',b.x,b.y);return false;}
    if(b.vz<-60){b.vz*=-.3;b.vx*=.5;b.vy*=.5;b.spin*=.5;this.stain('drops',b.x,b.y);}
    else{const k=Math.exp(-dt*8);b.vx*=k;b.vy*=k;b.vz=0;b.spin*=k;if(Math.hypot(b.vx,b.vy)<4){b.img.setAngle(b.flat?Math.round(b.a/b.flat)*b.flat:b.a).setPosition(half(b.x),half(b.y)).setDepth(b.y-8);this.lain.push(b.img);if(this.lain.length>GORE_FX.pieces)this.lain.shift().destroy();return false;}}}
   b.img.setAngle(b.a).setPosition(half(b.x),half(b.y-b.z)).setDepth(b.y+(b.z>0?2:-8));return true;});}
 // A body coming apart: the top half (thrown, or flying to where it will crawl from) or the head, gibs from the cut, and the blood.
 dismember(z,e,a){const id=SHEET_OF[z.look]||z.look,d=z.direction,c=Math.cos(a),s=Math.sin(a),r=()=>Math.random(),G=GORE_FX,key='street-zp-'+id;
  const at=([px,py])=>({origin:[(px-ZF.x)/ZF.w,(py-ZF.y)/ZF.h],z:(FRAME.footY*2-py)/2});
  if(e.gore==='half'){const U=at(G.spin.upper);if(e.crawler)this.throwBit(key,d,z.x,z.y,U.z,{origin:U.origin,spin:(e.dx>=0?1:-1)*(260+r()*160),land:{x:e.crawler.x,y:e.crawler.y,t:CRAWLER.rise}});
   else this.throwBit(key,d,z.x,z.y,U.z,{origin:U.origin,vx:c*(70+r()*50),vy:s*(45+r()*30),vz:80+r()*60,spin:(e.dx>=0?1:-1)*(300+r()*200)});}
  else{const H=at(G.spin.head);this.throwBit(key,d+16,z.x,z.y,H.z,{origin:H.origin,vx:c*(80+r()*60)+(r()-.5)*50,vy:s*(50+r()*40)+(r()-.5)*30,vz:130+r()*80,spin:(r()<.5?-1:1)*(500+r()*400),flat:0});}
  const n=this.goreOn?G.gibs[e.gore]:0,H=e.gore==='half'?40:62;for(let i=0;i<n;i++){const k=e.gore==='head'?[0,6,3][i%3]:i%GIBS.length,t=a+(r()-.5)*1.6,v=60+r()*150;
   this.throwBit('gore-gibs',k*3+(r()*3|0),z.x,z.y,H+(r()-.5)*10,{vx:Math.cos(t)*v,vy:Math.sin(t)*v*.7,vz:60+r()*160,spin:(r()-.5)*1400,flat:0});}
  this.juice.bits(this.goreOn?24:10,z.x,z.y,{dir:a,spread:1.3,speed:170,lift:70,z:H,col:0x8a1a16,life:.7,kind:'drop'});
  this.juice.bits(8,z.x,z.y,{dir:a,spread:.9,speed:70,lift:30,z:H,col:0x5a0e0c,life:.45,kind:'mist'});
  this.stain('splash',z.x+c*22,z.y+s*13,{dir:Math.round(a/(Math.PI/4))});this.stain('pool',z.x+c*8,z.y+s*5+2);}
 // Blood thrown past a hit onto a wall behind it, if there is one near enough and you can see its face.
 wallSplat(z,e){if(!this.goreOn||e.dy>.35)return;for(let t=8;t<=56;t+=4){const x=z.x+e.dx*t,y=z.y+e.dy*t,o=coverAt(x,y);if(!o)continue;if(o.w<24)return;
   const top=Math.min(30,o.z-8);if(top<10)return;this.stain('wall',Math.max(o.x+8,Math.min(o.x+o.w-8,x)),o.y+o.h-10-Math.random()*(top-10),{depth:o.y+o.h+.01});return;}}
 // What the fight just did, turned into sound, shake, blood and the HUD.
 react(now,e){const j=this.juice,z=e.z;
  // A shot: the gun kicks, the view jolts away from the shot, sparks leave the muzzle and a casing flies (the shotgun's hull waits
  // for the pump). The shotgun also shakes the view and holds the game for a breath.
  if(e.type==='shot'){const big=e.gun==='pump-shotgun',K=KICK[e.gun]||KICK['light-pistol'],a=e.angle,mz=muzzle(a,this.look.gun);this.shotA=a;
   this.kick={a,t:0,dur:big?.16:.09,n:K.arms};if(!j.reduced){this.jolt.x-=Math.cos(a)*K.cam;this.jolt.y-=Math.sin(a)*K.cam;}
   j.bits(big?7:3,model.x+mz.x,model.y,{dir:a,spread:big?.7:.4,speed:big?220:160,lift:6,z:-mz.y,col:0xffd27a,life:big?.12:.08,kind:'spark',len:2});
   if(big){j.shake('down');j.hold(now,.025);j.flash(model.x+mz.x,model.y+mz.y,.9,.75,.09);j.puff(model.x+mz.x+Math.cos(a)*8,model.y+mz.y+Math.sin(a)*5,.7,0x8a8a86,.7,-8);this.pumps.push(now+BRASS.pump*1000);}
   else this.eject(a,false);}
  // A hit: blood thrown out the far side along the shot, and a splash on the ground beyond. A kill throws more, holds the game for
  // an instant, and leaves a pool where the body comes to rest.
  else if(e.type==='hit'||e.type==='kill'){const a=Math.atan2(e.dy,e.dx),kill=e.type==='kill';j.bits(kill?18:8,z.x,z.y,{dir:a,spread:kill?.9:.7,speed:kill?150:105,lift:45,z:28,col:0x8a1a16,life:.55,kind:'drop'});
   j.bits(kill?6:3,z.x,z.y,{dir:a,spread:.5,speed:60,lift:20,z:30,col:0x5a0e0c,life:.35,kind:'mist'});if(!kill){z.flinch=TOPPLE.flinch;z.flinchX=e.dx;}
   const dir=Math.round(a/(Math.PI/4));this.stain(kill?'splash':'drops',z.x+e.dx*16,z.y+e.dy*10,{dir});this.wallSplat(z,e);
   if(kill){j.hold(now,e.gore?.07:.05);j.shake('down');this.stain('splash',z.x+e.dx*30,z.y+e.dy*18,{dir});z._pool=true;if(e.gore)this.dismember(z,e,a);}}
  else if(e.type==='land'){j.puff(e.x,e.y-2,.9,0x6a6458,.6,-4);j.bits(5,e.x,e.y,{dir:Math.atan2(e.dy,e.dx),spread:1.6,speed:50,lift:30,z:0,col:0x6a6458,life:.4,kind:'debris'});}
  // A brute's charge kicks up dust; one that runs into something shakes the ground.
  else if(e.type==='charge')j.puff(z.x,z.y-2,.8,0x6a6458,.5,-4);
  else if(e.type==='stun'){j.puff(z.x,z.y-30,1.1,0x8a8478,.7,-10);j.bits(10,z.x,z.y,{dir:0,spread:6.3,speed:90,lift:50,z:40,col:0x8a8478,life:.45,kind:'debris'});if(Math.hypot(z.x-model.x,z.y-model.y)<400)j.shake('brute');}
  else if(e.type==='lunge')j.puff(z.x,z.y-1,.5,0x6a6458,.4,-3);
  else if(e.type==='hurt')j.shake('hurt');
  else if(e.type==='down')j.shake('brute');
  else if(e.type==='stage'&&e.stage==='looted')this.setTrunk(true);
  else if(e.type==='restart')this.enter();
  // Over a fence: a little dust where you land. The generator coughs into life in a cloud of smoke.
  else if(e.type==='over')j.puff(e.x,e.y-2,.6,0x6a6458,.5,-4);
  // The special dead: a bloater bursting (a green blast, its insides and the street shaking), a glob landing in a hiss of acid, a
  // spitter's spit, and a scream that lands (rings off it and a shudder).
  else if(e.type==='burst'){const near=Math.hypot(e.x-model.x,e.y-model.y)<500;for(let k=0;k<5;k++)j.puff(e.x+(Math.random()-.5)*30,e.y-20+(Math.random()-.5)*16,1.4,[0x6f8a2a,0x8fa83a,0x4a5a1e][k%3],.9,-10);
   j.bits(16,e.x,e.y,{dir:0,spread:6.3,speed:140,lift:60,z:30,col:0x6f8a2a,life:.6,kind:'drop'});j.bits(10,e.x,e.y,{dir:0,spread:6.3,speed:110,lift:50,z:30,col:0x8a1a16,life:.55,kind:'drop'});j.flash(e.x,e.y-20,1.4,.6,.12,false);
   this.stain('splash',e.x,e.y+2,{dir:Math.floor(Math.random()*8)});this.stain('pool',e.x,e.y+4);if(near){j.shake('brute');j.hold(now,.06);}}
  else if(e.type==='splash'){j.bits(9,e.x,e.y,{dir:-Math.PI/2,spread:3,speed:70,lift:40,z:2,col:0x9ad13a,life:.4,kind:'drop'});j.puff(e.x,e.y-3,.6,0x8fa83a,.5,-10);}
  else if(e.type==='spit')j.bits(4,z.x,z.y,{dir:Math.atan2(e.g.y1-z.y,e.g.x1-z.x),spread:.6,speed:60,lift:20,z:44,col:0x9ad13a,life:.3,kind:'drop'});
  else if(e.type==='screamed'){for(let k=0;k<3;k++)j.ring(z.x,z.y-50,40+k*30,0xe0c8ff,.6+k*.2,2);if(Math.hypot(z.x-model.x,z.y-model.y)<500)j.shake('hurt');}
  else if(e.type==='started'){this.setPower(true);j.puff(GEN.x+4,GEN.y-12,1,0x6a6a66,.7,-12);j.puff(GEN.x+10,GEN.y-14,.8,0x5a5a58,.6,-16);}
  else if(e.type==='sputter')j.puff(GEN.x+4,GEN.y-10,.6,0x6a6a66,.5,-10);
  else if(e.type==='fixmiss'&&e.kind==='wire')j.bits(5,model.x,model.y,{dir:-Math.PI/2,spread:2.6,speed:70,lift:40,z:20,col:0xfff1a8,life:.25,kind:'spark',len:2});
  bridge.event?.(e);}
 // A casing out of the right side of the gun: brass from the pistol, a red hull from the shotgun.
 eject(a,hull){const side=a+Math.PI/2+(Math.random()-.5)*.5,v=48+Math.random()*24;
  this.brass.push({x:model.x+Math.cos(a)*5,y:model.y+Math.sin(a)*3,z:26,vx:Math.cos(side)*v-Math.cos(a)*14,vy:(Math.sin(side)*v-Math.sin(a)*14)*.6,vz:55+Math.random()*30,spin:Math.random()*4,hull});}
 // Casings arc, bounce twice or so and lie where they stop, oldest first to go.
 brassStep(dt){const g=this.brassG;g.clear();let landed=false;
  this.brass=this.brass.filter(c=>{c.vz-=320*dt;c.x+=c.vx*dt;c.y+=c.vy*dt;c.z+=c.vz*dt;c.spin+=dt*24;
   if(c.z<=0){c.z=0;if(c.vz<-30){c.vz*=-.38;c.vx*=.55;c.vy*=.55;bridge.event?.({type:'casing',hull:c.hull,x:c.x,y:c.y});}else{this.lying.push({x:Math.round(c.x*2)/2,y:Math.round(c.y*2)/2,up:(c.spin|0)%2,hull:c.hull});landed=true;return false;}}
   this.casing(g,c.x,c.y-c.z,(c.spin|0)%2,c.hull);return true;});
  if(landed){if(this.lying.length>BRASS.keep)this.lying.splice(0,this.lying.length-BRASS.keep);const f=this.floorG;f.clear();for(const c of this.lying)this.casing(f,c.x,c.y,c.up,c.hull,.8);}}
 casing(g,x,y,up,hull,a=1){x=Math.round(x*2)/2;y=Math.round(y*2)/2;const w=up?1:hull?2.5:2,h=up?(hull?2.5:2):1;
  g.fillStyle(hull?0xa3271f:0xc9a24a,a).fillRect(x,y,w,h);g.fillStyle(hull?0xd8b05a:0xf2d88e,a).fillRect(x,y,up?1:.5,up?.5:1);}
 // One step of the fight on its clock.
 tick(dt,input){const f=this.fight;model.update(dt,input);f.update(dt,input);}
 update(now,delta){const dt=Math.min(.05,delta/1000),paused=bridge.paused(),held=this.juice.stopped(now),f=this.fight;
  // A dive press is kept until a step takes it, since a fast screen can draw a frame between two steps.
  if(paused||held)this.acc=0;else{const input=f.down?{}:bridge.input();let dive=!!input.dive||this.diveWait;this.acc=Math.min(STEP*MAX_STEPS,this.acc+Math.min(.1,delta/1000));
   while(this.acc>=STEP-1e-6){this.acc-=STEP;this.tick(STEP,{...input,dive});dive=false;}this.diveWait=dive;}
  for(const e of f.drain())this.react(now,e);
  while(this.pumps.length&&now>=this.pumps[0]){this.pumps.shift();this.eject(this.shotA??0,true);}
  if(this.kick&&(this.kick.t+=dt)>this.kick.dur)this.kick=null;const jk=Math.exp(-dt*16);this.jolt.x*=jk;this.jolt.y*=jk;
  this.brassStep(dt);this.bitStep(held?0:dt);this.fight.gore=this.goreOn;
  // Dust kicked up along the ground as you slide.
  const dv=f.dive;if(dv&&dv.t>.1&&dv.t<DIVE.time){this.dustT=(this.dustT||0)-dt;if(this.dustT<=0){this.dustT=.05;this.juice.puff(model.x-dv.dx*6,model.y-1,.45,0x6a6458,.45,-3);}}
  this.placeActor();this.stream();this.light();
  // The dead near the screen: walking, winding up, or lying where they fell.
  const V=grow(this.view(),120);for(const z of this.zs.keys())if(!f.zombies.includes(z))this.free(z);
  for(const z of f.zombies){if(z.delay>0&&!z.idle||z.x<V.x||z.x>V.x+V.w||z.y<V.y||z.y>V.y+V.h+100){this.free(z);continue;}const s=this.sprite(z);
   // Hit: a white flash for a few frames, and a flinch back away from the shot. Down: it topples over (pivoting at the hips as
   // they drop), still sliding from the shot that dropped it, and greys once it lands.
   const white=z.flash>0,half=n=>Math.round(n*2)/2;if(white!==!!s.white){s.white=white;if(white)s.setTint(0xffffff).setTintMode(Phaser.TintModes.FILL);else if(s.grey)s.clearTint().setTint(0x9a8a8a);else s.clearTint();}
   if(z.kind==='crawler'){const col=CRAWL_COL[z.direction]??CRAWL_FLIP[z.direction];s.setVisible(!(z.hatch>0)).setFlipX(z.direction in CRAWL_FLIP).setFrame(col+(z.hp>0?z.frame:0)*5).setPosition(half(z.x),half(z.y)).setDepth(z.y-4);
    if(z.hp<=0&&!s.grey){s.grey=true;if(!white)s.setTint(0x9a8a8a);}if(z.hp>0){const m=Math.hypot(z.x-(z.tx??z.x),z.y-(z.ty??z.y));if(m>16||z.tx===undefined){if(z.tx!==undefined)this.stain('drops',z.x,z.y+1);z.tx=z.x;z.ty=z.y;}}continue;}
   // Him getting back up: the topple played backwards, the grey going out of him. Twitching first.
   if(z.kind==='risen'&&z.hp<=0&&(z.rise!=null||z.twitch)){const e=z.rise!=null?z.rise*z.rise*(3-2*z.rise):0,sc=1;if(!s.laid){s.laid=true;s.setFrame(z.direction).setOrigin(.5,.62);}if(s.grey&&e>.3){s.grey=false;if(!white)s.clearTint();}
    s.setAngle(90*(z.fall||1)*(1-e)+(z.twitch?(z.fall||1)*-4:0)).setPosition(half(z.x+(z.twitch?.5:0)),half(z.y-(6+(TOPPLE.hips-6)*e)*sc)).setDepth(z.y-10*(1-e));continue;}
   if(z.hp<=0){if(!s.laid){s.laid=true;if(z.gore)s.setTexture('street-zp-'+(SHEET_OF[z.look]||z.look),z.direction+(z.gore==='half'?8:24));else s.setFrame(z.direction);s.setOrigin(.5,.62);}z.fallT=Math.min(1,(z.fallT||0)+dt/TOPPLE.time);const k=z.fallT*z.fallT;
    const sc=SCALE[z.kind]||1;s.setAngle(90*z.fall*k).setPosition(half(z.x),half(z.y-(TOPPLE.hips+(6-TOPPLE.hips)*k)*sc)).setDepth(z.y-10*k);
    if(k>=1&&!s.grey){s.grey=true;if(!white)s.setTint(0x9a8a8a);if(!z.thud){z.thud=true;this.juice.puff(z.x+z.fall*14,z.y-2,.6,0x6a6458,.5,-4);}}
    if(z._pool&&!z.vx&&!z.vy&&k>=1){z._pool=false;this.stain('pool',z.x+z.fall*(z.gore==='half'?6:14),z.y+2);}continue;}
   if(s.laid){s.laid=false;s.grey=false;if(!white)s.clearTint();s.setTexture('street-z-'+(SHEET_OF[z.look]||z.look),0).setOrigin((FRAME.w/2-ZF.x)/ZF.w,(FRAME.footY*2-ZF.y)/ZF.h);}
   const fl=z.flinch>0?z.flinch/TOPPLE.flinch:0;if(fl)z.flinch-=dt;s.setAngle(fl?Math.sign(z.flinchX||1)*7*fl:0);
   s.setPosition(half(z.x+(z.flinchX||0)*1.5*fl),z.y).setDepth(z.y).setFrame(z.direction+z.frame*8);}
  // The light bar turns; the cruiser's own lamps swap with it.
  const on=Math.floor(now/260)%2,tex=`street-cruiser-${on+1}-${this.trunk?1:0}`,cr=this.held.get(CRUISER_I)?.img;if(cr&&cr.texture.key!==tex)cr.setTexture(tex);
  // Houses, trees and sheds you walk behind go see-through, so you never lose yourself or what is chasing you.
  for(const i of this.fades){const o=PROPS[i],img=this.held.get(i).img,behind=model.y<o.y+o.h&&model.y>o.y-o.z&&model.x>o.x-8&&model.x<o.x+o.w+8,a=img.alpha+((behind?.4:1)-img.alpha)*Math.min(1,dt*10);if(Math.abs(a-img.alpha)>.002)img.setAlpha(a);}
  // The job out here: smoke off the running generator, the flare spitting and smoking, and the truck driving in.
  const ev=f.evac,near=(x,y)=>Math.abs(x-model.x)<700&&Math.abs(y-model.y)<500;this.smokeT=(this.smokeT||0)-dt;
  if(this.smokeT<=0){this.smokeT=.35;if(this.power&&near(GEN.x,GEN.y))this.juice.puff(GEN.x+2,GEN.y-10,.5,0x5a5a58,.45,-14);if(ev&&near(EVAC.x,EVAC.y))this.juice.puff(EVAC.x+Math.random()*4-2,EVAC.y-6,.8,0x8a4a44,.55,-22);}
  const fl=.75+.25*Math.sin(now/41)*Math.sin(now/97);this.flare.setVisible(!!ev).setScale(1.1*fl,.8*fl).setAlpha(.5*fl);this.flood.setVisible(!!this.power);
  if(ev&&ev.state==='hold'&&near(EVAC.x,EVAC.y)&&Math.random()<dt*20)this.juice.bits(1,EVAC.x,EVAC.y,{dir:-Math.PI/2,spread:2.4,speed:40,lift:40,z:4,col:0xffb0a0,life:.3,kind:'spark',len:1});
  const tr=ev&&ev.state!=='hold',tx=tr?ev.x:0;this.truck.setVisible(!!tr);for(const l of this.lamps)l.setVisible(!!tr);
  if(tr){this.truck.setTexture('street-truck-'+(ev.state==='wait'?1:0)).setPosition(Math.round(tx*2)/2-PROP_PAD,TRUCK.y-TRUCK.z-PROP_PAD+(ev.state==='drive'?Math.round(Math.sin(now/40))*.5:0)).setDepth(TRUCK.y+TRUCK.h);
   this.lamps.forEach((l,i)=>l.setPosition(tx-4,TRUCK.y+TRUCK.h*.5-18+i*10));if(ev.state==='drive'){this.dustT2=(this.dustT2||0)-dt;if(this.dustT2<=0){this.dustT2=.08;this.juice.puff(tx+TRUCK.w-10,TRUCK.y+TRUCK.h,.9,0x5a5650,.5,-6);}}}
  this.bar[0].setAlpha(on?.05:.42);this.bar[1].setAlpha(on?.42:.05);this.head.setAlpha(.3+.04*Math.sin(now/90));
  this.juice.update(now,held?0:dt,f);
  // Tracers: a short bright streak running from the muzzle to where the shot stopped.
  const g=this.fx;g.clear();for(const t of f.traces){const k=Math.min(1,t.age/(t.dur||.001)),mx=t.x+t.ox,my=t.y+t.oy,ex=t.ex,ey=t.ey+t.oy,hx=mx+(ex-mx)*k,hy=my+(ey-my)*k,tx=mx+(ex-mx)*Math.max(0,k-.35),ty=my+(ey-my)*Math.max(0,k-.35),a=Math.max(0,t.life/(t.dur+.07));
   g.lineStyle(1,0xfff1c8,.85*a).lineBetween(tx,ty,hx,hy);if(t.done&&t.onto.kind!=='zombie'){g.fillStyle(0xffe2a0,a).fillRect(ex-.5,ey-.5-(t.onto.kind==='prop'?0:-t.oy),1.5,1.5);}}
  // Where a shot stops on something solid: sparks back toward you and a little dust off it.
  for(const t of f.traces)if(t.done&&!t._fx){t._fx=true;if(t.onto.kind!=='prop')continue;const a=Math.atan2(t.ey-t.y,t.ex-t.x)+Math.PI;
   this.juice.bits(t.pellet?2:5,t.ex,t.ey,{dir:a,spread:1.8,speed:120,lift:50,z:-t.oy,col:0xffe6a8,life:.22,kind:'spark',len:2});if(!t.pellet)this.juice.puff(t.ex,t.ey+t.oy,.35,0x8a8478,.5,-6);}
  // The muzzle flash itself: a hard little star of fire out of the barrel for the first frames of a shot.
  const K=KICK[f.gunId];if(K&&f.sinceShot<.045&&this.shotA!==undefined&&!f.down){const a=this.shotA,mz=muzzle(a,this.look.gun),x=model.x+mz.x,y=model.y+mz.y,c=Math.cos(a),s=Math.sin(a),n=K.flash*(1-f.sinceShot/.09);
   g.lineStyle(2,0xffb347,.9).lineBetween(x,y,x+c*n,y+s*n);g.lineStyle(1,0xfff6d8,1).lineBetween(x,y,x+c*n*.8,y+s*n*.8);g.lineStyle(1,0xffd27a,.85).lineBetween(x+c*2,y+s*2,x+c*2-s*n*.35,y+s*2+c*n*.35).lineBetween(x+c*2,y+s*2,x+c*2+s*n*.35,y+s*2-c*n*.35);}
  // The touch stick's laser, while your thumb is on it, stopping on the first thing it touches with a dot.
  const L=bridge.aimLine?.();if(L&&!f.down&&armed(this.look)){const mz=muzzle(L.a,this.look.gun),len=this.reach(L.a,150);drawLaser(g,model.x,model.y,mz,L.a,L.fire,len);
   const ex=Math.round((model.x+Math.cos(L.a)*len)*2)/2,ey=Math.round((model.y+Math.sin(L.a)*len+mz.y)*2)/2;g.fillStyle(0xff4a3a,L.fire?.95:.7).fillRect(ex-.5,ey-.5,1.5,1.5);}
  // The mouse's crosshair: four ticks round a dot, spreading for a moment after each shot.
  const X=bridge.reticle?.();if(X&&!f.down&&armed(this.look)){const big=f.gunId==='pump-shotgun',open=3+Math.max(0,1-f.sinceShot/(big?.3:.16))*(big?7:3),x=Math.round(X.x*2)/2,y=Math.round(X.y*2)/2;
   for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const x0=x+dx*open,y0=y+dy*open,w=dx?3:1,h=dy?3:1,rx=dx<0?x0-3:x0,ry=dy<0?y0-3:y0;g.fillStyle(0x111319,.8).fillRect(rx-.5,ry-.5,w+1,h+1);g.fillStyle(0xf2e6c8,.95).fillRect(rx,ry,w,h);}
   g.fillStyle(0x111319,.8).fillRect(x-1,y-1,2,2);g.fillStyle(0xff6a4a,1).fillRect(x-.5,y-.5,1,1);}
  // What the dead dropped, bobbing a little with a glint now and then, and gone once picked up.
  for(const [d,img] of this.dropImgs)if(!f.drops.includes(d)){img.destroy();this.dropImgs.delete(d);}
  for(const d of f.drops){let img=this.dropImgs.get(d);if(!img){img=this.add.image(d.x,d.y,'loot-icons',d.id).setScale(.5).setOrigin(.5,1);this.dropImgs.set(d,img);}const bob=Math.round(Math.sin(now/260+d.x)*1.5*2)/2;img.setPosition(Math.round(d.x*2)/2,Math.round(d.y*2)/2-2+bob).setDepth(d.y);
   if(Math.floor(now/700+d.x/37)%4===0)g.fillStyle(0xfff6d8,.9).fillRect(Math.round(d.x*2)/2+2,Math.round(d.y*2)/2-8+bob,1,1);}
  // The job's parts: the one in your hands at your side, the ones you set down where they lie, with a glint now and then.
  const M=bridge.kit().mission;for(const p of this.parts){const o=p.o,d=M?.drops?.find(q=>q.item===p.item),held=M?.carry===p.item&&!f.dead;p.img.setVisible(held||!!d);
   if(held){const back=[5,6,7].includes(model.direction),x=model.x+(back?-3:3)-o.w/2,y=model.y-o.h-10;p.img.setPosition(Math.round((x-PROP_PAD)*2)/2,Math.round((y-o.z-PROP_PAD)*2)/2).setDepth(model.y+(back?-1:1));}
   else if(d){p.img.setPosition(Math.round((d.x-o.w/2-PROP_PAD)*2)/2,Math.round((d.y-o.h/2-o.z-PROP_PAD)*2)/2).setDepth(d.y);if(Math.floor(now/700+d.x/37)%4===0)g.fillStyle(0xfff6d8,.9).fillRect(Math.round(d.x*2)/2+3,Math.round((d.y-o.z)*2)/2-2,1,1);}}
  this.hazardStep(now,g);
  // A search under way: a ring round the spot filling as it goes.
  const S=f.searching;if(S){const k=Math.min(1,S.time/(S.need||SEARCH.time)),x=S.t.mx??S.t.x,y=(S.t.my??S.t.y)-4,a0=-Math.PI/2;g.lineStyle(3,0x111319,.7).strokeCircle(x,y,7);g.lineStyle(1.5,0xf2e6c8,.35).strokeCircle(x,y,7);
   g.lineStyle(1.5,0xffb347,1).beginPath().arc(x,y,7,a0,a0+k*Math.PI*2,false).strokePath();}
  const target=f.down?null:paused&&this.target?this.target:model.target(t=>bridge.usable?.(t)!==false);this.target=target;
  if(target){const bob=Math.round(Math.sin(now/180)*2*2)/2;this.marker.setVisible(true).setPosition(target.mx??target.x,target.my+bob);}else this.marker.setVisible(false);
  const cam=this.cameras.main;
  // From the window across the street: closer in on him, held by a hand that is not quite steady.
  if(f.dead){const b=f.dead.body,t=f.dead.t,sw=Math.sin(t*.9)*3+Math.sin(t*2.3)*1.1,sy=Math.cos(t*.7)*1.8+Math.sin(t*3.1)*.6;cam.setZoom(this.zoom()*(1.75+Math.min(.25,t*.016)));cam.centerOn(b.x+sw,b.y-24+sy);}
  // Following you, unless the story points the camera somewhere (focus: the cruiser, the officer); it glides there and back.
  else{const at=(this.cineCam??=new CineCam()).step(dt,{x:model.x+this.jolt.x,y:model.y-20+this.jolt.y,z:this.zoom()},this.focus);cam.setZoom(at.z);cam.centerOn(at.x,at.y);}bridge.tick(now,this);}
 // Acid pools bubbling and drying, globs in the air with their shadow and the mark where they will land, gas hanging and drifting,
 // and the rings off a screamer mid-scream. Pictures are kept per hazard and let go when it is gone.
 hazardStep(now,g){const f=this.fight,half=n=>Math.round(n*2)/2,keep=new Set(),img=(o,n,make)=>{let a=this.hz.get(o);if(!a){a=Array.from({length:n},make);this.hz.set(o,a);}keep.add(o);return a;};
  for(const p of f.pools){const [i]=img(p,1,()=>this.add.image(0,0,'haz-acid',0).setScale(.5)),dry=p.t>p.T-1.2,k=dry?Math.max(0,(p.T-p.t)/1.2):1;
   i.setFrame(dry&&k<.5?4:Math.floor(now/170+p.seed)%4).setPosition(half(p.x),half(p.y)).setDepth(.55).setAlpha(Math.min(1,p.t*6)*(.35+.65*k));}
  for(const b of f.globs){const [i]=img(b,1,()=>this.add.image(0,0,'haz-glob',0).setScale(.5)),k=b.t/b.T,vx=b.x1-b.x0,vy=b.y1-b.y0-(Math.cos(Math.PI*k)*Math.PI*b.arc);
   i.setFrame(Math.floor(now/80)%2).setPosition(half(b.x),half(b.y-b.h)).setRotation(Math.atan2(vy,vx)).setDepth(b.y+40);
   g.fillStyle(0x111319,.35).fillEllipse(b.x,b.y,8,4);const R=SPITTER.spit.radius,pulse=.5+.5*Math.sin(now/60);
   g.fillStyle(0x9ad13a,.08+.14*k).fillEllipse(b.x1,b.y1,R*2*k,R*1.25*k);g.lineStyle(1.5,0x9ad13a,.45+.4*k*pulse).strokeEllipse(b.x1,b.y1,R*2,R*1.25);g.lineStyle(1,0xe2ff8a,.5*k).strokeEllipse(b.x1,b.y1,R*2*k,R*1.25*k);}
  for(const c of f.clouds){const a=img(c,6,(_,n)=>this.add.image(0,0,'haz-gas',n%3).setScale(.5)),fade=Math.min(1,c.t/.3)*Math.min(1,(c.T-c.t)/1.6),grow=Math.min(1,.65+c.t*.25);
   a.forEach((i,n)=>{const ang=n/6*Math.PI*2+c.seed,r=(n?BLOATER.burst.radius*.45:0)*grow+c.t*2,x=c.x+Math.cos(ang)*r,y=c.y+Math.sin(ang)*r*.6-6-c.t*1.5;i.setPosition(half(x),half(y)).setScale(.5*grow*(n?1:1.2)).setDepth(c.y+30+n).setAlpha(.5*fade);});}
  for(const [o,a] of this.hz)if(!keep.has(o)){for(const i of a)i.destroy();this.hz.delete(o);}
  // A scream: rings off its head, faster as it builds.
  for(const z of f.zombies)if(z.state==='scream'&&z.hp>0&&this.zs.has(z)){const C=SCREAMER.scream,k=1-z.t/C.tell;for(let q=0;q<3;q++){const ph=((now/(420-k*200))+q/3)%1;g.lineStyle(1.5,0xe0c8ff,.55*(1-ph)*(.4+.6*k)).strokeEllipse(z.x,z.y-52,16+ph*70,10+ph*40);}}}
 // How far a line from you goes before it meets something solid or one of the dead, up to max.
 reach(a,max){const c=Math.cos(a),s=Math.sin(a),f=this.fight,near=f.zombies.filter(z=>f.out(z)&&Math.abs(z.x-model.x)<max+20&&Math.abs(z.y-model.y)<max+20);
  for(let d=6;d<=max;d+=3){const x=model.x+c*d,y=model.y+s*d;if(coverAt(x,y)||near.some(z=>Math.hypot(z.x-x,(z.y-y)*1.2)<12))return d;}return max;}
};}
