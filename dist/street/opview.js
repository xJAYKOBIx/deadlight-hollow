// Operation Bell Jar on screen (v0.68, v0.69): what street/op.js and street/mate.js do, drawn into the street scene. Aaron in his own
// layers (painted by the same code as yours, so he walks and aims as you do) with his rifle's flash, brass and flashlight, the stock
// when he drives the dead off him, and down on his side when they get him (and you on yours, when they get you), with a ring on the
// ground round whoever is down filling as the other gets them up; Hollow Six's
// truck with its ramp down at the drop, driving in along Route 9 with its headlights on and dropping its ramp at the pickup; the
// courier on its roof, misting until the cases are out of it; the beacon once planted, its strobe throwing red over the crash, and
// the ring you hold it from with the uplink running round it; the ammo cans by the ramp; and Gadget's drone coming in low with a can.
// The scene owns one of these and calls it each frame; none of it shows outside the operation.
import {OP_APC,OP_WRECK,OP_BEACON,OP_CANS} from './data.js';
import {OP,beaconAt,wreckAt} from './op.js';
import {MATE} from './mate.js';
import {LOOKS} from '../ride/data.js';
import {BELL,bellStep} from '../home/kit.js';
import {propArt,PROP_PAD} from '../mc/assets/props/base.js';
import {LAYERS,ORDER,origin,pose,aimIndex} from '../study/layers.js';
import {muzzle,lightAt} from '../study/equipment.js';
// Aaron as he is out here: his look from the ride, the rifle, and the light under its barrel.
export const AARON={...LOOKS.aaron,zombie:0,gun:'tactical-ar',grenade:null,light:true};
// LEFT: the room the truck's picture keeps behind it for the ramp (it reaches OP_APC.ramp past the hull). ART: the hangar truck's
// place, so its grime is the same one you boarded. DRONE: its size, how high it flies, where it comes in from and goes, and how
// long it takes to leave. RING: the uplink's ring, in dashes, and its colours held, slipping and done.
export const LEFT=OP_APC.ramp-PROP_PAD+2;
const ART={x:360,y:560},DRONE={w:24,h:12,z:20,alt:44,from:{x:-240,y:-280},away:{x:300,y:-260},leave:1.6};
export const RING={dash:56,col:0x5fd3c6,lit:0xc8fff0,away:0xf2c46a,alpha:.26};
const half=n=>Math.round(n*2)/2,stepPast=(k,s)=>BELL.indexOf(bellStep(k))>BELL.indexOf(s);
// Down: all of someone's layers tipped over together onto one side, pivoting at the hips as they drop, as the dead fall (scene.js
// TOPPLE); e runs from 0 (on their feet) to 1 (flat out), and at 0 the layers stand on their feet again. Returns whether they are over.
export const FALL={hips:26.4,lie:6,down:.35,up:.5,arms:Math.PI/2};
// Kneeling by someone: his legs folded to this much of their height under him, and the rest of him lowered with his hips, getting
// down (and up again) over time.
export const KNEEL={dip:13,legs:.5,time:.22};
export function topple(parts,x,y,side,e){const over=e>0;for(const k of ORDER){const s=parts[k],L=LAYERS[k],o=origin(L);
  if(!over){if(s.toppled){s.toppled=false;s.setOrigin(...o).setAngle(0);}continue;}
  if(!s.toppled){s.toppled=true;s.setOrigin(o[0],o[1]-FALL.hips*2/L.h);}s.setAngle(90*side*e).setPosition(half(x),half(y-(FALL.hips+(FALL.lie-FALL.hips)*e)));}
 if(over){parts.arms.setFrame(aimIndex(FALL.arms));parts.legs.setScale(.5);const d=y-10*e;parts.legs.setDepth(d);parts.body.setDepth(d+.01);parts.arms.setDepth(d+.02);parts.head.setDepth(d+.03);}return over;}
// How far over someone is, kept in st: going down quickens like a fall, getting up eases in and out. They go over the way they face
// (forward, toward the camera, falls to the right).
export function fallen(st,down,dir,dt){const t=st.t||0;if(down&&!st.down)st.side=[3,4,5].includes(dir)?-1:1;st.down=down;st.t=down?Math.min(1,t+dt/FALL.down):Math.max(0,t-dt/FALL.up);return down?st.t*st.t:st.t*st.t*(3-2*st.t);}
export class OpView{
 constructor(s){this.s=s;const tex=(key,o,left=0)=>s.texture(key,(o.w+PROP_PAD*2+left)*2,(o.h+o.z+PROP_PAD*2)*2,c=>{c.translate(left*2,0);propArt(c,o);});
  // The truck shut and with its ramp down; the ramp is cut into its own picture that lies on the ground under anyone on it.
  for(const open of [0,1])tex('op-apc-'+open,{kind:'apc',...OP_APC,...ART,open:!!open},LEFT);const cut=(PROP_PAD+LEFT-1)*2;
  this.apc=s.add.image(0,0,'op-apc-0').setOrigin(0).setScale(.5);this.ramp=s.add.image(0,0,'op-apc-1').setOrigin(0).setScale(.5).setDepth(.8);this.ramp.setCrop(0,0,cut,this.ramp.height);this.cut=cut;
  this.lamps=[0,1].map(()=>s.add.image(0,0,'tg-glow-warm').setDepth(6001).setBlendMode(Phaser.BlendModes.ADD).setScale(.45,.3));
  // The courier, with its cases and with them gone; the beacon with its strobe dark and lit; the cans by the ramp.
  for(const taken of [0,1])tex('op-wreck-'+taken,{...OP_WRECK,taken:!!taken});this.wreck=s.add.image(OP_WRECK.x-PROP_PAD,OP_WRECK.y-OP_WRECK.z-PROP_PAD,'op-wreck-0').setOrigin(0).setScale(.5).setDepth(OP_WRECK.y+OP_WRECK.h);
  for(const on of [0,1])tex('op-beacon-'+on,{...OP_BEACON,on:!!on});this.beacon=s.add.image(OP_BEACON.x-PROP_PAD,OP_BEACON.y-OP_BEACON.z-PROP_PAD,'op-beacon-0').setOrigin(0).setScale(.5).setDepth(OP_BEACON.y+OP_BEACON.h);
  // The courier's hazard lights, still going: one at each end of its near side, amber, blinking together.
  this.hazards=[[8,OP_WRECK.h-12],[Math.round(OP_WRECK.w*.7),OP_WRECK.h-10]].map(([x,y])=>s.add.image(OP_WRECK.x+x,OP_WRECK.y+y,'tg-glow-warm').setDepth(6001).setBlendMode(Phaser.BlendModes.ADD).setTint(0xffa030).setScale(.22,.16));
  this.strobe=s.add.image(OP_BEACON.x+OP_BEACON.w/2,OP_BEACON.y+OP_BEACON.h/2-OP_BEACON.z+7,'street-glow-w').setDepth(6001).setBlendMode(Phaser.BlendModes.ADD).setTint(0xff3020);
  tex('op-cans',{...OP_CANS,open:true});this.cans=s.add.image(OP_CANS.x-PROP_PAD,OP_CANS.y-OP_CANS.z-PROP_PAD,'op-cans').setOrigin(0).setScale(.5).setDepth(OP_CANS.y+OP_CANS.h);
  // Gadget's drone, its rotors in two frames, with the can and without; its running lights over the night.
  for(const can of [0,1])for(const f of [0,1])tex(`op-drone-${can}${f}`,{kind:'drone',x:0,y:0,...DRONE,f,can:!!can});
  this.drone=s.add.image(0,0,'op-drone-00').setOrigin(.5,1).setScale(.5).setDepth(5995);this.navs=[0xff4a3a,0x5aff8a].map(col=>s.add.image(0,0,'street-glow-w').setDepth(6001).setBlendMode(Phaser.BlendModes.ADD).setTint(col).setScale(.09));
  this.out=null;this.mfall={};this.yfall={};
  // Aaron: a picture for each of his layers, from sheets painted once.
  this.sheets=s.layerSheets(AARON);this.parts={};for(const k of ORDER)this.parts[k]=s.add.image(0,0,this.sheets[k].key,0).setOrigin(...origin(LAYERS[k])).setScale(.5);this.racked=false;
  this.all=[this.apc,this.ramp,...this.lamps,...this.hazards,this.wreck,this.beacon,this.strobe,this.cans,this.drone,...this.navs,...Object.values(this.parts)];this.show(false);}
 get bell(){return this.s.fight.bell;}
 // Back in the truck: you and Aaron are not drawn.
 get inside(){return !!this.shown&&this.bell.step==='out';}
 show(on){if(this.shown===on)return;this.shown=on;for(const i of this.all)i.setVisible(on);}
 // Each frame: what is out there now and where.
 update(now,dt){const b=this.bell,f=this.s.fight,on=b.on()&&!this.s.sc;this.show(on);if(!on)return;const k=f.kit(),v=b.truck;
  // The truck: shut while it drives and until its ramp is half down, a little bounce on the move, dust off its wheels.
  const open=v&&(v.state==='drop'||v.state==='wait'||v.state==='stop'&&v.ramp>=.5),bob=v?.state==='drive'?Math.round(Math.sin(now/40))*.5:0,x=v?half(v.x):0;
  this.apc.setVisible(!!v);this.ramp.setVisible(!!open);for(const l of this.lamps)l.setVisible(!!v);
  if(v){const px=x-PROP_PAD-LEFT,py=v.y-OP_APC.z-PROP_PAD+bob;this.apc.setTexture('op-apc-'+(open?1:0)).setPosition(px,py).setDepth(v.y+OP_APC.h);
   if(open)this.apc.setCrop(this.cut,0,this.apc.width-this.cut,this.apc.height);else this.apc.setCrop();this.ramp.setPosition(px,py);
   this.lamps.forEach((l,i)=>l.setPosition(x+OP_APC.w-3,v.y+OP_APC.h*.5-22+i*12+bob));
   if(v.state==='drive'){this.dustT=(this.dustT||0)-dt;if(this.dustT<=0){this.dustT=.08;this.s.juice.puff(x+20,v.y+OP_APC.h,.9,0x5a5650,.5,-6);this.s.juice.puff(x+OP_APC.w*.7,v.y+OP_APC.h,.7,0x5a5650,.4,-6);}}}
  // The courier misting from its hold until the cases are out; the beacon's strobe, a double flash every so often.
  const taken=stepPast(k,'samples'),up=stepPast(k,'beacon');this.wreck.setTexture('op-wreck-'+(taken?1:0));
  if(!taken&&(this.mistT=(this.mistT||0)-dt)<=0&&Math.abs(OP_WRECK.x-f.model.x)<600){this.mistT=.55;this.s.juice.puff(OP_WRECK.x+18+Math.random()*10,OP_WRECK.y+20,.45,0xdfeaf0,.35,-5);}
  const blink=(now/1000)%.76<.38;this.blink=blink;for(const h of this.hazards)h.setAlpha(blink?.95:.08);
  const p=(now/1000)%.9,lit=up&&(p<.06||p>.14&&p<.2);this.beacon.setVisible(up).setTexture('op-beacon-'+(lit?1:0));this.strobe.setVisible(up).setAlpha(lit?.9:.12).setScale(lit?1.1:.5,lit?.8:.35);this.lit=lit;
  // The drone: in from behind you to above the can's mark, the can let go, and away again.
  const d=b.drone;let at=null;if(d){const w=OP.drone.wait,t=1-Math.max(0,d.t/w),e=1-Math.pow(1-t,2.2);at={x:d.x+DRONE.from.x*(1-e),y:d.y+DRONE.from.y*(1-e),can:true};this.out={x:d.x,y:d.y,t:0};}
  else if(this.out&&(this.out.t+=dt)<DRONE.leave){const e=Math.pow(this.out.t/DRONE.leave,1.6);at={x:this.out.x+DRONE.away.x*e,y:this.out.y+DRONE.away.y*e,can:false};}else this.out=null;
  this.drone.setVisible(!!at);for(const n of this.navs)n.setVisible(!!at);this.droneAt=at;
  if(at){const fr=Math.floor(now/45)%2,y=at.y-DRONE.alt;this.drone.setTexture(`op-drone-${at.can?1:0}${fr}`).setPosition(half(at.x),half(y+PROP_PAD+DRONE.h));
   const blink=Math.floor(now/400)%2;this.navs[0].setPosition(at.x-3,y-DRONE.z+6.5).setAlpha(blink?.9:.4);this.navs[1].setPosition(at.x+3,y-DRONE.z+6.5).setAlpha(blink?.4:.9);}
 this.mate(now,dt);
  // You, down: over on your side until Aaron has you up (the scene has just stood you where you are; this lays you down).
  const sp=this.s.parts,mm=f.model;if(!sp?.legs||this.inside)return;if(topple(sp,mm.x,mm.y,this.yfall.side||1,fallen(this.yfall,!!f.down,mm.direction,dt)))return;
  // You on one knee by Aaron while you get him up, as he kneels by you.
  const kn=this.ykn=Math.max(0,Math.min(1,(this.ykn||0)+(f.searching?.t?.op==='revive'?1:-1)*dt/KNEEL.time));sp.legs.setScale(.5,.5*(1-(1-KNEEL.legs)*kn));
  if(kn)for(const k of ['body','arms','head'])sp[k].y=half(sp[k].y+KNEEL.dip*kn);}
 // Aaron in the pose his feet are in, his arms racked for a moment after each shot; lunging behind the stock; down low over you
 // on one knee while he gets you up; over on his side when he is down.
 mate(now,dt){const M=this.bell.mate,m=M.m,P=pose(m,!!this.sheets.turned),rk=M.sinceShot<.06,in_=this.inside;for(const k of ORDER)this.parts[k].setVisible(!in_);if(in_)return;
  if(rk!==this.racked){this.racked=rk;this.parts.arms.setTexture((rk?this.sheets.racked:this.sheets.arms).key,P.arms);}
  for(const k of ORDER)this.parts[k].setFrame(P[k]);const kn=this.kn=Math.max(0,Math.min(1,(this.kn||0)+(M.lifting&&!M.down?1:-1)*dt/KNEEL.time));this.parts.legs.setScale(.5,.5*(1-(1-KNEEL.legs)*kn));if(topple(this.parts,m.x,m.y,this.mfall.side||1,fallen(this.mfall,M.down,m.direction,dt)))return;
  const B=M.bash,bk=B?Math.sin(Math.min(1,B.t/MATE.bash.time)*Math.PI):0,kx=B?Math.cos(B.a)*6*bk:0,ky=B?Math.sin(B.a)*6*bk*.6:0,dip=kn*(KNEEL.dip+(M.lifting?Math.sin(now/170)*.5:0));
  for(const k of ORDER){const s=this.parts[k],ride=P.rides.includes(k),body=k==='body'&&!ride;s.setPosition(half(m.x+(ride?P.dx+kx:body?kx*.35:0)),half(m.y+(ride?P.dy+ky+dip:body?ky*.35+dip:0)));}
  const y=m.y;this.parts.legs.setDepth(y);this.parts.body.setDepth(y+.01);this.parts.arms.setDepth(y+.02);this.parts.head.setDepth(y+.03);}
 // Over the night: Aaron's muzzle flash, and the ring round the beacon while it uplinks, filling as the link does (amber, pulsing,
 // while you are away from it).
 fx(g,now){if(!this.shown)return;const M=this.bell.mate;
  if(M.sinceShot<.045&&M.shotA!==null){const a=M.shotA,mz=muzzle(a,'tactical-ar'),x=M.x+mz.x,y=M.y+mz.y,c=Math.cos(a),s=Math.sin(a),n=8*(1-M.sinceShot/.09);
   g.lineStyle(2,0xffb347,.9).lineBetween(x,y,x+c*n,y+s*n);g.lineStyle(1,0xfff6d8,1).lineBetween(x,y,x+c*n*.8,y+s*n*.8);g.lineStyle(1,0xffd27a,.85).lineBetween(x+c*2,y+s*2,x+c*2-s*n*.35,y+s*2+c*n*.35).lineBetween(x+c*2,y+s*2,x+c*2+s*n*.35,y+s*2-c*n*.35);}
  this.lifting(g,now);const b=this.bell;if(b.step!=='uplink')return;const U=OP.uplink,R=RING,done=b.link/U.time,away=!b.near,pulse=away?.55+.45*Math.sin(now/160):1;
  for(let i=0;i<R.dash;i++){const a0=-Math.PI/2+i/R.dash*Math.PI*2,a1=a0+Math.PI*2/R.dash*.55,fill=i/R.dash<done,col=away?R.away:fill?R.lit:R.col;
   g.lineStyle(fill?2:1,col,(fill?.95:R.alpha)*pulse).lineBetween(beaconAt.x+Math.cos(a0)*U.r,beaconAt.y+Math.sin(a0)*U.r/1.2,beaconAt.x+Math.cos(a1)*U.r,beaconAt.y+Math.sin(a1)*U.r/1.2);}}
 // Whoever is down, a ring on the ground round them, over to the side they fell: filling as they are got up, and pulsing while
 // nobody is at it yet.
 lifting(g,now){const b=this.bell,M=b.mate,f=this.s.fight,S=f.searching;let r=null;
  if(f.down&&b.bleeding)r={x:f.model.x,y:f.model.y,side:this.yfall.side||1,k:M.lift/MATE.lift.time,on:M.lifting};
  else if(M.down&&!this.inside)r={x:M.x,y:M.y,side:this.mfall.side||1,k:S?.t?.op==='revive'?S.time/S.need:0,on:S?.t?.op==='revive'};if(!r)return;
  const n=28,cx=r.x+r.side*10,cy=r.y-3,rx=36,ry=15,pulse=r.on?1:.5+.5*Math.sin(now/200);
  for(let i=0;i<n;i++){const a0=-Math.PI/2+i/n*Math.PI*2,a1=a0+Math.PI*2/n*.6,fill=i/n<r.k;g.lineStyle(fill?2:1,fill?RING.lit:RING.col,(fill?.95:.45)*pulse).lineBetween(cx+Math.cos(a0)*rx,cy+Math.sin(a0)*ry,cx+Math.cos(a1)*rx,cy+Math.sin(a1)*ry);}}
 // The light: Aaron's flashlight and his rifle's flash, the beacon's strobe on the crash, the truck's headlights east, and the
 // drone's lamp on the ground under it.
 light(rt,ox,oy,L,V){if(!this.shown)return;const add=Phaser.BlendModes.ADD,M=this.bell.mate,m=M.m,a=m.aim??m.direction*Math.PI/4,mz=lightAt(a,'tactical-ar'),near=(x,y,r)=>x>V.x-r&&x<V.x+V.w+r&&y>V.y-r&&y<V.y+V.h+r;
  if(near(m.x,m.y,260)&&!M.down){rt.stamp('nb-pool',undefined,(m.x-ox)/L,(m.y-14-oy)/L,{blendMode:add,alpha:.7});rt.stamp('nb-beam',undefined,(m.x+mz.x-ox)/L,(m.y+mz.y-oy)/L,{originX:0,originY:.5,rotation:a,blendMode:add,alpha:.8});
   if(M.sinceShot<.05&&M.shotA!==null){const k=1-M.sinceShot/.05,f=muzzle(M.shotA,'tactical-ar');rt.stamp('nb-pool',undefined,(m.x+f.x*.6-ox)/L,(m.y+f.y*.4-oy)/L,{blendMode:add,scale:3*(.8+.2*k),alpha:k*.8,tint:0xffd49a});}}
  if(near(wreckAt.x,wreckAt.y,300))rt.stamp('nb-pool',undefined,(wreckAt.x-ox)/L,(OP_WRECK.y+OP_WRECK.h-oy)/L,{blendMode:add,scale:this.blink?3.2:2.4,alpha:this.blink?.4:.12,tint:0xffa040});
  if(this.beacon.visible&&near(beaconAt.x,beaconAt.y,300))rt.stamp('nb-pool',undefined,(beaconAt.x-ox)/L,(beaconAt.y-6-oy)/L,{blendMode:add,scale:this.lit?4.4:2.2,alpha:this.lit?.95:.35,tint:0xff4030});
  const v=this.bell.truck;if(v&&near(v.x,v.y,500)){const tx=v.x+OP_APC.w,ty=v.y+OP_APC.h*.5;for(const dy of [-14,12])rt.stamp('nb-beam',undefined,(tx-ox)/L,(ty+dy-oy)/L,{originX:0,originY:.5,rotation:0,blendMode:add,alpha:.8});
   rt.stamp('nb-pool',undefined,(v.x+OP_APC.w*.4-ox)/L,(v.y+OP_APC.h+4-oy)/L,{blendMode:add,scale:2.4,alpha:.3,tint:0xfff0d0});}
  const d=this.droneAt;if(d)rt.stamp('nb-pool',undefined,(d.x-ox)/L,(d.y-oy)/L,{blendMode:add,scale:1.4,alpha:.7,tint:0xe8f0ff});}
 // What the fight did that shows out here: Aaron's brass, sparks off his muzzle; the can landing; the beacon going up.
 react(now,e){const j=this.s.juice,M=this.bell.mate;
  if(e.type==='mateshot'){const mz=muzzle(e.angle,'tactical-ar');j.bits(3,M.x+mz.x,M.y,{dir:e.angle,spread:.4,speed:160,lift:6,z:-mz.y,col:0xffd27a,life:.08,kind:'spark',len:2});this.s.eject(e.angle,false,M.m);}
  else if(e.type==='dropped'){j.puff(e.x,e.y-2,.6,0x6a6458,.5,-4);j.ring(e.x,e.y-4,9,0xffd88a,.3);}
  else if(e.type==='planted'){j.ring(beaconAt.x,beaconAt.y-30,20,0xff6a4a,.5,2);j.puff(beaconAt.x,beaconAt.y,.6,0x6a6458,.5,-4);}
  else if(e.type==='truckstop'){const v=this.bell.truck;if(v)for(let i=0;i<3;i++)j.puff(v.x+20+i*70,v.y+OP_APC.h,1,0x5a5650,.55,-6);}
  else if(e.type==='truckwait'){const v=this.bell.truck;if(v)j.puff(v.x-14,v.y+OP_APC.h*.6,.9,0x6a6458,.55,-4);}
  // Aaron bitten, a little of him in the air; down, the dust where he lands; you or him back up, the dust shaken off.
  else if(e.type==='matehurt')j.bits(3,M.x,M.y-28,{dir:-Math.PI/2,spread:1.4,speed:50,lift:16,z:28,col:0x5a0e0c,life:.3,kind:'mist'});
  else if(e.type==='matedown')j.puff(M.x+(this.mfall.side||1)*16,M.y,.7,0x6a6458,.5,-4);
  else if(e.type==='down')j.puff(this.s.fight.model.x+(this.yfall.side||1)*16,this.s.fight.model.y,.7,0x6a6458,.5,-4);
  else if(e.type==='revived'||e.type==='mateup'){const o=e.type==='revived'?this.s.fight.model:M.m;j.puff(o.x,o.y,.6,0x6a6458,.45,-4);j.ring(o.x,o.y-4,12,RING.lit,.35);}}}
