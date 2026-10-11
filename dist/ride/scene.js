// The ride in (v0.67): Hollow Six's truck from above with its roof cut away, the three of you in it, and the wet road running by under
// it: lamps going over, the Guard's checkpoint, then the dark of the Hollow. It plays its script (script.js) from the ramp shutting to
// the ramp coming down, and there is nothing to walk; bridge.arrived() when it is over or skipped.
import {survivor,FRAME} from '../study/character.js';
import {RIDE,TRUCK,SEATS,DRIVER_BACK,CARGO,ROAD,LAMP_GAP,LAMP,CHECKPOINT,REF,LOOKS} from './data.js';
import {roadArt,armArt,ARM,lightArt,LIGHT_SCALE,glowArt,propArt,PROP_PAD,DOME,INSIDE,rampArt,RAMP} from './art.js';
import {Ride as Script,WIDE} from './script.js';import {CineCam} from '../study/camera.js';import {bake} from '../study/memory.js';
// Seated: a body is cut at the hips (HIP, in the frame's units) and set on its cushion. Aaron faces you, so his legs show: the thighs
// (THIGH) are taken out and his boots rest on the floor in front of the bench.
const HIP=58,THIGH=8,FOOT=FRAME.footY,ADD=()=>Phaser.BlendModes.ADD,MUL=()=>Phaser.BlendModes.MULTIPLY;
// Which way each of you looks: the frames drawn, and who looks where while someone speaks.
const DIRS={you:[6,7],aaron:[2,1,3],gadget:[0,1]};
const looks=(who,speaker)=>who==='aaron'?(speaker==='gadget'||speaker==='guard'?1:speaker==='you'?3:0):who==='you'?(speaker==='gadget'||speaker==='guard'?1:0):speaker==='guard'?1:0;
export function makeRideScene(bridge){return class Ride extends Phaser.Scene{
 constructor(){super('Ride');}
 texture(key,w,h,draw,once){if(this.textures.exists(key))return this.textures.get(key);const t=this.textures.createCanvas(key,w,h);draw(t.context);t.refresh();return once?bake(this,t,draw):t;}
 // A sheet of one person's frames, side by side, in the order of dirs.
 sheet(key,look,dirs,gun){const t=this.textures.exists(key)?this.textures.get(key):this.textures.createCanvas(key,FRAME.w*dirs.length,FRAME.h),c=t.context;c.clearRect(0,0,t.width,t.height);c.imageSmoothingEnabled=false;
  dirs.forEach((d,i)=>{c.save();c.translate(i*FRAME.w,0);c.scale(2,2);survivor(c,d,0,true,{...look,zombie:0,gun,grenade:null});c.restore();if(!t.has(i))t.add(i,0,i*FRAME.w,0,FRAME.w,FRAME.h);});t.refresh();return t;}
 seated(key,x,y,top,bottom){return this.add.image(x,y,key,0).setOrigin(.5,FOOT/FRAME.displayH).setScale(.5).setCrop(0,top*2,FRAME.w,(bottom-top)*2);}
 create(){
  // A prop of the library's, drawn once; and placed with its footprint's corner at (x, y).
  const pic=(key,o)=>this.texture(key,(o.w+PROP_PAD*2)*2,(o.h+o.z+PROP_PAD*2)*2,c=>propArt(c,o),true),at=(img,o)=>img.setPosition(o.x-PROP_PAD,o.y-o.z-PROP_PAD).setOrigin(0).setScale(.5);
  this.place=at;
  // The road, repeating under the truck; the lamps along it, their heads lit and their light on the road, and the checkpoint, moved
  // as the road goes by.
  this.texture('ride-road',ROAD.period*2,RIDE.h*2,roadArt);this.road=this.add.tileSprite(-RIDE.w*.5,0,RIDE.w*4,RIDE.h*2,'ride-road').setOrigin(0).setScale(.5).setDepth(-10);
  this.texture('ride-glow',128,128,c=>glowArt(c,[255,236,196]));this.texture('ride-cold',128,128,c=>glowArt(c,[200,220,255]));
  for(const k of ['ride-glow','ride-cold'])this.textures.get(k).setFilter(Phaser.Textures.FilterMode.LINEAR);
  pic('ride-lamp',LAMP);this.lamps=[0,1,2,3].map(()=>({post:at(this.add.image(0,0,'ride-lamp'),LAMP).setDepth(-5),
   head:this.add.image(0,0,'ride-glow').setScale(.3,.16).setDepth(5001).setBlendMode(ADD()),pool:this.add.image(0,0,'ride-glow').setScale(2.4,1.6).setDepth(5001).setBlendMode(ADD())}));
  this.check=CHECKPOINT.map((o,i)=>{const on=pic('ride-cp-'+i,{...o,x:0}),off=o.lit?pic('ride-cp-'+i+'-off',{...o,x:0,lit:false}):null;
   return {o,off,img:at(this.add.image(0,0,on.key),{...o,x:0}).setDepth(o.front?4:-4),flash:o.lit?this.add.image(0,0,'ride-glow').setTint(0xffb030).setScale(.7,.45).setDepth(5001).setBlendMode(ADD()):null};});
  this.texture('ride-arm',(ARM+4)*2,8,armArt,true);this.arm=this.add.image(0,0,'ride-arm').setOrigin(2/((ARM+4)*2),.5).setScale(.5).setDepth(3.5);
  this.texture('ride-guard',FRAME.w,FRAME.h,c=>{c.imageSmoothingEnabled=false;c.scale(2,2);survivor(c,4,0,true,{...LOOKS.guard,gun:'tactical-ar',grenade:null});},true);
  this.guard=this.add.image(0,0,'ride-guard').setOrigin(.5,FOOT/FRAME.displayH).setScale(.5).setDepth(3.9);
  this.flood=this.add.image(0,0,'ride-glow').setScale(3,2.2).setDepth(5001).setBlendMode(ADD());this.floodHead=this.add.image(0,0,'ride-glow').setScale(.5,.3).setDepth(5001).setBlendMode(ADD());
  // The truck, its seats and what is in the aisle; the three of you.
  pic('ride-truck',TRUCK);this.truck=at(this.add.image(0,0,'ride-truck'),TRUCK).setDepth(0);
  this.texture('ride-ramp',RAMP.len*2,RAMP.w*2,rampArt,true);this.rampPlate=this.add.image(RAMP.x,RAMP.y,'ride-ramp').setOrigin(1,0).setScale(0,.5).setDepth(5000.8).setVisible(false);
  this.sheet('ride-aaron',LOOKS.aaron,DIRS.aaron,'tactical-ar');this.sheet('ride-gadget',LOOKS.gadget,DIRS.gadget,'none');this.setPlayerLook(bridge.look());
  const A=SEATS.aaron,G=SEATS.gadget,Y=SEATS.you;
  this.aaron=[this.seated('ride-aaron',A.x,A.feet+THIGH,0,HIP),this.seated('ride-aaron',A.x,A.feet,HIP+THIGH,FRAME.displayH)].map(s=>s.setDepth(1));
  this.gadget=this.seated('ride-gadget',G.x,G.hip+FOOT-HIP,0,HIP).setDepth(1.5);pic('ride-seat',DRIVER_BACK);at(this.add.image(0,0,'ride-seat'),DRIVER_BACK).setDepth(1.6);
  CARGO.forEach((o,i)=>{pic('ride-'+o.id,o);at(this.add.image(0,0,'ride-'+o.id),o).setDepth(2+i*.1);});
  this.you=this.seated('ride-you',Y.x,Y.hip+FOOT-HIP,0,HIP).setDepth(3);
  // Light: the night and the dome light multiplied over it all; the Hollow's dark laid over that once the power is out; the dome
  // light failing for a moment when something hits; the headlights ahead, and the light from inside spilling out down the ramp.
  this.texture('ride-light',Math.ceil(RIDE.w/LIGHT_SCALE),Math.ceil(RIDE.h/LIGHT_SCALE),lightArt,true);this.add.image(0,0,'ride-light').setOrigin(0).setScale(LIGHT_SCALE).setDepth(5000).setBlendMode(MUL());
  const I=INSIDE,X0=-RIDE.w,Y0=-RIDE.h,W0=RIDE.w*3,H0=RIDE.h*3;this.darkK=0;
  this.dark=[[X0,Y0,W0,I.y-Y0],[X0,I.y+I.h,W0,Y0+H0-I.y-I.h],[X0,I.y,I.x-X0,I.h],[I.x+I.w,I.y,X0+W0-I.x-I.w,I.h]].map(([x,y,w,h])=>this.add.rectangle(x,y,w,h,0x6c7690).setOrigin(0).setDepth(5000.5).setBlendMode(MUL()).setAlpha(0));
  this.flicker=this.add.rectangle(TRUCK.x,TRUCK.y-TRUCK.z,TRUCK.w,TRUCK.h+TRUCK.z,0x302830).setOrigin(0).setDepth(5000.6).setBlendMode(MUL()).setAlpha(0);
  this.domeGlow=this.add.image(DOME.x,DOME.y+10,'ride-cold').setTint(0xff6a50).setScale(.9,.5).setDepth(5001).setBlendMode(ADD()).setAlpha(.35);
  this.heads=[TRUCK.y+14,TRUCK.y+62].map(y=>this.add.image(REF+70,y-6,'ride-glow').setScale(2.6,.8).setDepth(5001).setBlendMode(ADD()).setAlpha(.35));
  this.open=this.add.image(RAMP.x-26,RAMP.y+RAMP.w/2,'ride-glow').setTint(0xffc0a0).setScale(1,.8).setDepth(5001).setBlendMode(ADD()).setAlpha(0);
  this.rain=this.add.graphics().setDepth(5002);this.fade=this.add.rectangle(-RIDE.w,-RIDE.h,RIDE.w*3,RIDE.h*3,0x000000,1).setOrigin(0).setDepth(9000);
  this.cameras.main.setBackgroundColor('#07080b').setZoom(this.zoom()).centerOn(WIDE.x,WIDE.y+this.lift(this.zoom()));
  this.events.on('wake',()=>{this.setPlayerLook(bridge.look());this.enter();bridge.ready(this);});this.enter();bridge.ready(this);}
 // Each time you get in: the ride from the start.
 enter(){this.ride=new Script();this.arrived=false;this.cineCam=null;this.engineAt=0;this.darkK=0;}
 setPlayerLook(look){this.sheet('ride-you',look,DIRS.you,'tactical-ar');}
 skip(){this.ride?.skip();}
 // The action the ride is waiting for (loading your rifle), done.
 act(){const r=this.ride;if(!r?.act)return false;r.doAct();return true;}
 get waitingFor(){return this.ride?.act||null;}
 // The truck with the road above and below it on a wide screen; on a phone it fills the screen across, with road and field above
 // and below. lift() puts what the camera looks at a little above the middle, clear of the dialog box.
 zoom(){const s=this.scale;return Math.max(.5,Math.min(s.width/330,s.height*.76/250));}
 lift(z){return this.scale.height*.055/z;}
 update(now,delta){const dt=Math.min(.05,delta/1000),paused=bridge.paused(),r=this.ride,waiting=bridge.started&&!bridge.started();
  if(!r.done){if(!paused&&!waiting)r.update(dt);bridge.cine?.(waiting?{say:'Tap anywhere, or press any key, to begin.',waiting:true}:r);}
  for(const id of r.cues.splice(0))bridge.sound?.(id);
  if(r.done&&!this.arrived){this.arrived=true;bridge.cine?.(null);bridge.arrived?.();}
  // The engine, played again before the last one ends, idling when the truck is stopped.
  if(!waiting&&!paused&&!r.done&&now>=this.engineAt){this.engineAt=now+2550;bridge.sound?.('apc-engine',{idle:r.speed<20?1:0,vol:.7});}
  // The road under the truck, the lamps going over (lit until the cordon), the checkpoint and its gate.
  this.road.tilePositionX=(r.pos*2)%(ROAD.period*2);
  const first=Math.floor((r.pos-500)/LAMP_GAP);this.lamps.forEach((L,i)=>{const x=REF+(first+i)*LAMP_GAP-r.pos-140;this.place(L.post,{...LAMP,x});
   L.head.setPosition(x+22,LAMP.y-109).setVisible(!!r.lamps).setAlpha(.9);L.pool.setPosition(x+22,ROAD.top+34).setVisible(!!r.lamps).setAlpha(.5);});
  const gx=r.gateX,cp=gx!==null&&gx<RIDE.w+260,blink=Math.floor(now/320)%2;for(const k of [this.arm,this.guard,this.flood,this.floodHead])k.setVisible(cp);
  this.check.forEach((c,i)=>{c.img.setVisible(cp);c.flash?.setVisible(cp);if(!cp)return;this.place(c.img,{...c.o,x:gx+c.o.dx});
   if(c.o.lit){const on=(blink+i)%2;c.img.setTexture(on?'ride-cp-'+i:'ride-cp-'+i+'-off');c.flash.setPosition(gx+c.o.dx+6,c.o.y-21.5).setAlpha(on?.85:0);}});
  if(cp){const fl=CHECKPOINT.find(o=>o.kind==='floodlight');this.arm.setPosition(gx,ROAD.bottom-25).setAngle(-90+90*r.gateArm);this.guard.setPosition(gx+16,ROAD.bottom-2).setFlipX(false);
   this.floodHead.setPosition(gx+fl.dx+8,fl.y-40).setAlpha(.9);this.flood.setPosition(gx+fl.dx-10,ROAD.line+40).setAlpha(.5);}
  // Who is looking where while someone speaks.
  const speaker=bridge.speaker?.()||null;for(const s of this.aaron)s.setFrame(looks('aaron',speaker));this.you.setFrame(looks('you',speaker));this.gadget.setFrame(looks('gadget',speaker));
  // The Hollow's dark, the dome light catching when something hits, the ramp's light.
  this.darkK+=((r.lamps?0:1)-this.darkK)*Math.min(1,dt*.8);for(const d of this.dark)d.setAlpha(this.darkK*.85);
  const fl=r.hit>.05&&Math.sin(now/38)>-.2?r.hit:0;this.flicker.setAlpha(fl*.9);this.domeGlow.setAlpha(.35*(1-fl));
  this.heads.forEach(h=>h.setAlpha(.3+.12*this.darkK));this.open.setAlpha(r.ramp*.45).setScale(.8+r.ramp*1.2,.7+r.ramp*.5);
  // The ramp coming down: seen from above it grows out from the hinge, out in the night (drawn over its dark, so its own shade is
  // the night's) and lighter as it lies down flat.
  const k=Math.sin(r.ramp*Math.PI/2),gr=Math.round(60+90*r.ramp);this.rampPlate.setVisible(r.ramp>0).setScale(.5*k,.5).setTint(gr<<16|Math.round(gr*1.05)<<8|Math.round(gr*1.2));
  // Rain, blown back past the truck by its speed, kept off the inside.
  const rg=this.rain;rg.clear();const sx=-(1+r.speed/60);for(let i=0;i<160;i++){const fall=((now/700)+i*.137)%1,x=((i*97.3+Math.sin(i)*40)%RIDE.w+RIDE.w-((r.pos*.4)%RIDE.w))%RIDE.w,y=fall*RIDE.h;
   if(x>TRUCK.x-4&&x<TRUCK.x+TRUCK.w+2&&y>TRUCK.y-TRUCK.z-6&&y<TRUCK.y+TRUCK.h)continue;rg.fillStyle(0xb8c8e0,.22).fillRect(x+sx*fall*4,y,.5,3.5);rg.fillStyle(0xb8c8e0,.12).fillRect(x+sx*fall*4+sx,y+3.5,.5,1.5);}
  this.fade.setAlpha(r.fade).setVisible(r.fade>0);
  // The camera: on the truck, or on whoever the beat wants, shaken a little by the road and hard when something hits.
  const cam=this.cameras.main,at=(this.cineCam??=new (CineCam)()).step(dt,{x:WIDE.x,y:WIDE.y,z:this.zoom()},r.cam),rough=(r.speed>1?.18:0)+r.hit*2.2;
  cam.setZoom(at.z);cam.centerOn(at.x+Math.sin(now/53)*rough*.6,at.y+this.lift(at.z)+Math.sin(now/71+1)*rough);bridge.tick?.(now,this);}
};}
