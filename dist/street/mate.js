// Aaron on the ground (v0.68): your partner out of the truck, a second soldier the fight moves for you. He keeps near you, a little
// behind and off to one side, runs to catch up when you get ahead, and shoots what is coming for you: short bursts at whichever of
// the dead hunting you is nearest you, once he has a clear line to it (never through cover, never through you) and has had a moment
// to bring the rifle round. He is not hurt yet and nothing goes for him; the next part brings that, and him getting you back up.
// His feet are a StreetModel's, so he walks round what is solid just as you do; round anything bigger he follows the flow the dead
// use, and if he is left far behind or stuck out of sight he catches up behind you.
import {StreetModel} from './model.js';
import {GUNS,muzzle} from '../study/equipment.js';
import {clearLine} from './paths.js';
import {coverAt,solidAt,MAP} from './data.js';
// keep: where he stands, behind you and off to one side, and how far off that he lets himself be before he moves. run: he runs once
// you are this far away; catch: further than this (or stuck lost seconds) and he catches up out of sight. see: how far he shoots.
// react: how long he takes to bring the rifle round onto a new target. burst and gap: rounds a burst and the pause after one; every
// stretches the rifle's own rate a little. miss: how far off his aim can be (radians). slow: his pace while he shoots. yield: how
// close you come, walking at him, before he steps out of your way.
export const MATE={gun:'tactical-ar',keep:{back:42,side:28,slack:20},run:170,catch:820,lost:2.5,see:420,react:.3,burst:[3,5],gap:[.35,.7],every:1.35,miss:.06,reload:1.9,slow:.55,noise:1.5,bullet:1600,yield:30};
const free=(x,y)=>x>40&&y>40&&x<MAP.w-40&&y<MAP.h-40&&!solidAt(x,y,9);
export class Mate{
 constructor(f){this.f=f;this.m=new StreetModel();this.reset(null);}
 // Out of the truck beside you (at), or wherever he last was.
 reset(at){const m=this.m;if(at){m.spawn=at;m.reset();}m.slow=1;Object.assign(this,{target:null,aimT:0,pickT:0,cool:0,burst:0,gapT:0,ammo:GUNS[MATE.gun].mag,reloadT:0,sinceShot:9,shotA:null,stuck:0,side:1,px:null,py:null});}
 get x(){return this.m.x;}get y(){return this.m.y;}
 // A point behind you, to one side of the way you are heading (or facing), and the other side if that one is solid; with nowhere
 // behind you to stand (your back to a wall or the truck), beside you; and failing that, where he is.
 spot(){const p=this.f.model,v=this.f.pv,go=Math.hypot(v.x,v.y)>30,h=go?Math.atan2(v.y,v.x):p.aim??p.direction*Math.PI/4,K=MATE.keep,c=Math.cos(h),s=Math.sin(h);
  for(const side of [this.side,-this.side,0]){const x=p.x-c*K.back-s*K.side*side,y=p.y-(s*K.back-c*K.side*side)*.8;if(free(x,y)){this.side=side||this.side;return {x,y};}}
  for(const side of [this.side,-this.side]){const x=p.x-s*K.side*1.4*side,y=p.y+c*K.side*1.4*side*.8;if(free(x,y))return {x,y};}return {x:this.m.x,y:this.m.y};}
 // Out of sight behind you, when he has fallen too far back.
 catchUp(){const p=this.f.model,h=p.aim??p.direction*Math.PI/4;for(const r of [110,80,140,60])for(const da of [0,.6,-.6,1.2,-1.2]){const a=h+Math.PI+da,x=p.x+Math.cos(a)*r,y=p.y+Math.sin(a)*r*.8;
  if(free(x,y)&&clearLine(x,y,p.x,p.y)){Object.assign(this.m,{x,y,frame:0,phase:0,moving:false});this.stuck=0;return true;}}return false;}
 // Each step: where to go, what to shoot, and the shooting.
 update(dt){const f=this.f,a=this.m,p=f.model;this.sinceShot+=dt;this.cool=Math.max(0,this.cool-dt);this.gapT=Math.max(0,this.gapT-dt);
  if(this.reloadT&&(this.reloadT=Math.max(0,this.reloadT-dt))===0){this.ammo=GUNS[MATE.gun].mag;f.emit('mateloaded',{x:a.x,y:a.y});}
  const dp=Math.hypot(a.x-p.x,a.y-p.y);if(dp>MATE.catch||this.stuck>MATE.lost&&!this.seen())this.catchUp();
  // Who to shoot: checked a few times a second; a new one takes a moment to bring the rifle onto.
  if((this.pickT-=dt)<=0){this.pickT=.25;const t=f.down?null:this.pick();if(t!==this.target){this.target=t;this.aimT=0;}}
  const z=this.target&&f.out(this.target)?this.target:null;if(!z)this.target=null;
  // Where to stand: his spot behind you, straight there if nothing is in the way, otherwise round it by the flow.
  const S=this.spot(),dx=S.x-a.x,dy=S.y-a.y,d=Math.hypot(dx,dy);let mx=0,my=0;
  if(d>MATE.keep.slack&&!f.down){let ux=dx/d,uy=dy/d;if(!clearLine(a.x,a.y,S.x,S.y)){f.flow.update(dt,[p]);const w=f.flow.way(a.x,a.y);if(w){ux=w.x;uy=w.y;}}const k=Math.min(1,(d-MATE.keep.slack*.5)/40);mx=ux*k;my=uy*k;}
  // Out of your way: when you come at him he steps across your path, to whichever side he is already on, and quickly.
  const v=f.pv,sp=Math.hypot(v.x,v.y),ex=a.x-p.x,ey=a.y-p.y,yd=Math.hypot(ex,ey*1.4);let dodge=false;
  if(sp>30&&yd<MATE.yield&&(ex*v.x+ey*v.y)>0&&!f.down){const s=Math.sign(ex*v.y-ey*v.x)||this.side;mx=-v.y/sp*s;my=v.x/sp*s;dodge=true;}
  const ox=a.x,oy=a.y,aim=z?Math.atan2(z.y-a.y,z.x-a.x):null;a.slow=z&&!dodge?MATE.slow:1;
  a.walk(dt,{x:mx,y:my,run:(dp>MATE.run||dodge)&&!z,aimX:aim===null?undefined:Math.cos(aim),aimY:aim===null?undefined:Math.sin(aim)});
  this.stuck=(mx||my)&&Math.hypot(a.x-ox,a.y-oy)<dt*20?this.stuck+dt:0;
  if(!z||f.down)return;this.aimT+=dt;
  // The rifle: bursts, a breath between them, a fresh magazine when it runs dry.
  if(this.reloadT||this.aimT<MATE.react||this.cool>0)return;if(!this.burst){if(this.gapT>0)return;this.burst=MATE.burst[0]+Math.floor(f.rand()*(MATE.burst[1]-MATE.burst[0]+1));}
  this.shoot(z);if(--this.burst===0)this.gapT=MATE.gap[0]+f.rand()*(MATE.gap[1]-MATE.gap[0]);
  if(!this.ammo){this.burst=0;this.reloadT=MATE.reload;f.emit('matereload',{x:a.x,y:a.y});}}
 // On screen (or near enough to it): he only catches up where you cannot see him do it.
 seen(){const p=this.f.model;return Math.abs(this.m.x-p.x)<420&&Math.abs(this.m.y-p.y)<300;}
 // The one to shoot: hunting you (or awake in a wave), within reach, a clear line to it; the nearest to you counts most.
 pick(){const f=this.f,a=this.m,p=f.model;let best=null,bs=Infinity;
  for(const z of f.zombies){if(!f.out(z)||!(z.roam!==undefined?z.hunt:f.alert))continue;const da=Math.hypot(z.x-a.x,z.y-a.y);if(da>MATE.see)continue;
   const s=Math.hypot(z.x-p.x,z.y-p.y)*.65+da*.35;if(s<bs&&this.ray(Math.atan2(z.y-a.y,z.x-a.x),da+20).z===z){bs=s;best=z;}}return best;}
 // A line from him: it stops at the first of the dead on it or the first cover, and never goes through you (nothing is hit then).
 ray(angle,range){const f=this.f,a=this.m,p=f.model,dx=Math.cos(angle),dy=Math.sin(angle);let end={x:a.x,y:a.y};
  for(let d=6;d<=range;d+=3){const x=a.x+dx*d,y=a.y+dy*d;if(x<0||y<0||x>MAP.w||y>MAP.h)break;if(coverAt(x,y))return {end,onto:{kind:'prop'},d};end={x,y};
   if(Math.hypot(p.x-x,(p.y-y)*1.2)<11&&!f.down)return {end,onto:{kind:'you'},d,you:true};
   const z=f.zombies.find(z=>f.out(z)&&Math.abs(z.x-x)<20&&Math.abs(z.y-y)<20&&Math.hypot(z.x-x,(z.y-y)*1.2)<(z.kind==='brute'?17:12));if(z)return {end,onto:{kind:'zombie',ref:z},z,d};}
  return {end,onto:{kind:'floor'},d:range};}
 shoot(z){const f=this.f,a=this.m,g=GUNS[MATE.gun],ang=Math.atan2(z.y-a.y,z.x-a.x)+(f.rand()-.5)*2*MATE.miss,L=this.ray(ang,g.range);if(L.you){this.burst=0;return;}
  this.ammo--;this.sinceShot=0;this.shotA=ang;this.cool=g.interval*MATE.every;f.stats.mateShots=(f.stats.mateShots||0)+1;
  if(L.z)f.hit(L.z,g.damage,Math.cos(ang),Math.sin(ang),'mate');
  const mz=muzzle(ang,MATE.gun),dur=Math.hypot(L.end.x-a.x,L.end.y-a.y)/MATE.bullet;
  f.traces.push({x:a.x,y:a.y,ex:L.end.x,ey:L.end.y,ox:mz.x,oy:mz.y,age:0,dur,life:dur+.07,col:L.onto.kind==='zombie'?'#7a1a16':'#b8ab88',onto:L.onto,done:false,mate:true});
  f.noise(MATE.noise);f.heard(a.x,a.y);f.emit('mateshot',{x:a.x,y:a.y,angle:ang});}}
