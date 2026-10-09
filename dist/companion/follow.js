// Your companion's feet: it walks at your side, sits and stays when you stop, and potters about if you stand around.
import {PET_ANIM} from './pet.js';
export const FOLLOW={behind:26,side:17,back:3,near:6,walk:136,run:250,runFrom:70,lead:0,leash:72,watch:52,teleport:320,stuck:2.2,settle:.9,lie:9,
 wander:{first:7,again:30,roam:58,speed:38,sniff:[1.2,2.6],legs:[2,3]},stride:{walk:30,run:58},radius:7};
const facing=(dx,dy)=>(Math.round(Math.atan2(dy,dx)/(Math.PI/4))+8)%8;
export class Follower{
 // blocked(x, y) answers whether a companion-sized body fits there; rand picks wander spots.
 constructor(blocked,rand=Math.random){this.blocked=blocked;this.rand=rand;this.place(0,0);Object.assign(this,{clock:0,happy:0,side:1});}
 place(x,y,direction=2){Object.assign(this,{x,y,direction,mode:'heel',state:'idle',phase:0,stuck:0,still:0,stay:0,wanders:0,route:null,ownerStill:0,ov:{x:0,y:0},last:null});this.frame=PET_ANIM.idle[0];}
 // A spot near (x, y) that is free, searched in rings, for arriving and catching up.
 spotNear(x,y){if(!this.blocked(x,y))return {x,y};for(let r=8;r<=80;r+=8)for(let i=0;i<12;i++){const a=i/12*Math.PI*2,px=x+Math.cos(a)*r,py=y+Math.sin(a)*r;if(!this.blocked(px,py))return {x:px,y:py};}return {x,y};}
 // Where it wants to be while you walk: at your side, the side it is already on, or behind you if both sides are blocked.
 goal(o){const a=o.direction*Math.PI/4,fx=Math.cos(a),fy=Math.sin(a),at=s=>({x:o.x-fx*FOLLOW.back-fy*FOLLOW.side*s,y:o.y-fy*FOLLOW.back+fx*FOLLOW.side*s,s});
  const near=at(this.side),far=at(-this.side),dist=p=>Math.hypot(p.x-this.x,p.y-this.y);
  const order=dist(far)+12<dist(near)?[far,near]:[near,far];
  for(const p of order)if(!this.blocked(p.x,p.y)){this.side=p.s;return p;}
  return {x:o.x-fx*FOLLOW.behind,y:o.y-fy*FOLLOW.behind};}
 // A pat makes it sit up where it is and stay a while.
 pet(){this.happy=1.6;this.toStay();this.stay=Math.min(this.stay,4);}
 toStay(){this.mode='stay';this.route=null;this.stuck=0;}
 // Moves toward (tx, ty) at speed, sidestepping obstacles. Returns the distance covered.
 step(tx,ty,speed,dt){const dx=tx-this.x,dy=ty-this.y,d=Math.hypot(dx,dy),step=Math.min(speed*dt,d);if(step<=0)return 0;const base=Math.atan2(dy,dx);
  for(const turn of [0,.5,-.5,1,-1,1.5,-1.5]){const a=base+turn,nx=this.x+Math.cos(a)*step,ny=this.y+Math.sin(a)*step;
   if(!this.blocked(nx,ny)){this.x=nx;this.y=ny;this.direction=facing(Math.cos(a),Math.sin(a));this.stuck=0;return step;}}
  this.stuck+=dt;return 0;}
 animate(moved,run){const list=run?PET_ANIM.run:PET_ANIM.walk;this.state=run?'run':'walk';this.phase=(this.phase+moved/FOLLOW.stride[run?'run':'walk'])%1;this.frame=list[Math.floor(this.phase*list.length)];}
 // It keeps whatever way it settled; only when you start to walk off does it sit up and look round at you.
 rest(o,watch=false){if(watch)this.direction=facing(o.x-this.x,o.y-this.y);
  if(this.mode==='stay'&&this.stay>FOLLOW.lie&&!this.happy&&!watch){this.state='lie';this.frame=PET_ANIM.lie[0];}
  else if(this.mode==='stay'){this.state='sit';this.frame=PET_ANIM.sit[Math.floor(this.clock*(this.happy?8:2.2))%2];}
  else{this.state='idle';this.frame=PET_ANIM.idle[Math.floor(this.clock*(this.happy?10:4))%4];}}
 // A few slow legs to spots around you, sniffing at each, then back to your side.
 nextLeg(o){const w=FOLLOW.wander,r=this.route;if(r.left<=0){const g=this.goal(o);r.to={x:g.x,y:g.y,home:true};return;}
  for(let i=0;i<8;i++){const a=this.rand()*Math.PI*2,d=24+this.rand()*(w.roam-24),x=o.x+Math.cos(a)*d,y=o.y+Math.sin(a)*d;
   if(!this.blocked(x,y)&&Math.hypot(x-this.x,y-this.y)>14){r.to={x,y};r.left--;return;}}
  r.left=0;this.nextLeg(o);}
 update(dt,o){dt=Math.max(0,Math.min(.05,dt||0));if(!dt)return;this.clock+=dt;this.happy=Math.max(0,this.happy-dt);
  // Your pace, so it can keep level with you rather than trail behind.
  if(this.last){const k=Math.min(1,dt*10);this.ov.x+=((o.x-this.last.x)/dt-this.ov.x)*k;this.ov.y+=((o.y-this.last.y)/dt-this.ov.y)*k;}this.last={x:o.x,y:o.y};
  this.ownerStill=o.moving?0:this.ownerStill+dt;
  const far=Math.hypot(o.x-this.x,o.y-this.y);
  if(far>FOLLOW.teleport||this.stuck>FOLLOW.stuck){const g=this.goal(o),s=this.spotNear(g.x,g.y);this.place(s.x,s.y,o.direction);this.last={x:o.x,y:o.y};return;}
  if(this.mode==='stay'){
   // Sitting tight: you can walk around it and give it a pat. It only gets up when you walk off.
   if(far>FOLLOW.leash){this.mode='heel';}
   else{this.stay+=dt;const w=FOLLOW.wander;
    if(!o.busy&&!this.happy&&this.ownerStill>w.first&&this.stay>(this.wanders?w.again:w.first)){this.mode='wander';this.wanders++;this.route={left:w.legs[0]+Math.floor(this.rand()*(w.legs[1]-w.legs[0]+1)),to:null,sniff:0};this.nextLeg(o);}
    else{this.rest(o,far>FOLLOW.watch);return;}}}
  if(this.mode==='wander'){
   if(o.moving){this.mode='heel';this.route=null;}
   else{const r=this.route;
    if(r.sniff>0){r.sniff-=dt;this.rest(o,false);if(r.sniff<=0)this.nextLeg(o);return;}
    const moved=this.step(r.to.x,r.to.y,FOLLOW.wander.speed,dt);
    if(Math.hypot(r.to.x-this.x,r.to.y-this.y)<2||this.stuck>1){this.stuck=0;if(r.to.home){this.toStay();this.stay=0;this.rest(o);return;}const s=FOLLOW.wander.sniff;r.sniff=s[0]+this.rand()*(s[1]-s[0]);}
    if(moved>0)this.animate(moved,false);else this.rest(o,false);return;}}
  // Heel: keep level with you while you move; once you have stood still a moment, sit and stay.
  const g=this.goal(o),pace=Math.hypot(this.ov.x,this.ov.y),tx=g.x+(o.moving?this.ov.x*FOLLOW.lead:0),ty=g.y+(o.moving?this.ov.y*FOLLOW.lead:0),d=Math.hypot(tx-this.x,ty-this.y);
  // Once you stop, it does not fuss to get to the perfect spot: close enough is close enough.
  let speed=0;if(o.moving?d>1:d>FOLLOW.near&&far>=36){speed=Math.min(FOLLOW.run,(o.moving?pace:0)+(d>FOLLOW.runFrom?FOLLOW.run:30+d*4));}
  const moved=speed?this.step(tx,ty,speed,dt):0;
  if(moved>.01){const v=moved/dt;this.animate(moved,this.state==='run'?v>145:v>165);return;}
  if(!o.moving&&this.ownerStill>FOLLOW.settle&&(d<=FOLLOW.near+4||far<36)){this.toStay();this.stay=0;}
  this.rest(o);}
}
