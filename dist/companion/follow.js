// Your companion's feet: it trots after you, keeps a step behind, sits when you stop and lies down if you stay put.
import {PET_ANIM} from './pet.js';
export const FOLLOW={behind:26,side:9,near:10,walk:136,run:232,runFrom:70,teleport:320,stuck:2.2,sit:.9,lie:9,stride:{walk:30,run:58},radius:7};
const facing=(dx,dy)=>(Math.round(Math.atan2(dy,dx)/(Math.PI/4))+8)%8;
export class Follower{
 // blocked(x, y) answers whether a companion-sized body fits there.
 constructor(blocked){this.blocked=blocked;Object.assign(this,{x:0,y:0,direction:2,state:'idle',frame:0,phase:0,still:0,stuck:0,clock:0,happy:0,side:1});}
 place(x,y,direction=2){Object.assign(this,{x,y,direction,state:'idle',phase:0,still:0,stuck:0});this.frame=PET_ANIM.idle[0];}
 // A spot near (x, y) that is free, searched in rings, for arriving and catching up.
 spotNear(x,y){if(!this.blocked(x,y))return {x,y};for(let r=8;r<=80;r+=8)for(let i=0;i<12;i++){const a=i/12*Math.PI*2,px=x+Math.cos(a)*r,py=y+Math.sin(a)*r;if(!this.blocked(px,py))return {x:px,y:py};}return {x,y};}
 // Where it wants to be: a step behind you and a little to one side.
 goal(o){const a=o.direction*Math.PI/4,fx=Math.cos(a),fy=Math.sin(a);return {x:o.x-fx*FOLLOW.behind-fy*FOLLOW.side*this.side,y:o.y-fy*FOLLOW.behind+fx*FOLLOW.side*this.side};}
 pet(){this.happy=1.6;this.still=Math.max(this.still,FOLLOW.sit);}
 update(dt,o){dt=Math.max(0,Math.min(.05,dt||0));this.clock+=dt;this.happy=Math.max(0,this.happy-dt);
  const g=this.goal(o),dx=g.x-this.x,dy=g.y-this.y,d=Math.hypot(dx,dy),far=Math.hypot(o.x-this.x,o.y-this.y);
  if(far>FOLLOW.teleport||this.stuck>FOLLOW.stuck){const s=this.spotNear(g.x,g.y);this.place(s.x,s.y,o.direction);return;}
  // Once settled near you it stays put while you turn on the spot, so you can face it and give it a pat.
  const settled=!o.moving&&far<FOLLOW.behind+16&&this.state!=='walk'&&this.state!=='run';
  let speed=0;if(d>FOLLOW.near&&!this.happy&&!settled){speed=(o.running||d>FOLLOW.runFrom)?FOLLOW.run:Math.min(FOLLOW.walk,40+d*3);}
  let moved=0;
  if(speed){// Head for the goal; if something is in the way, try angles either side of it.
   const step=speed*dt,base=Math.atan2(dy,dx);
   for(const turn of [0,.5,-.5,1,-1,1.5,-1.5]){const a=base+turn,nx=this.x+Math.cos(a)*Math.min(step,d),ny=this.y+Math.sin(a)*Math.min(step,d);
    if(!this.blocked(nx,ny)){moved=Math.hypot(nx-this.x,ny-this.y);this.x=nx;this.y=ny;this.direction=facing(Math.cos(a),Math.sin(a));break;}}
   this.stuck=moved<step*.2?this.stuck+dt:0;}
  else this.stuck=0;
  if(moved>.01){const run=speed>=FOLLOW.run-1,list=run?PET_ANIM.run:PET_ANIM.walk;this.state=run?'run':'walk';this.still=0;
   this.phase=(this.phase+moved/FOLLOW.stride[run?'run':'walk'])%1;this.frame=list[Math.floor(this.phase*list.length)];return;}
  // Standing still: look at you, then sit, then settle down.
  if(!o.moving)this.still+=dt;else this.still=Math.min(this.still,.3);
  if(far>4)this.direction=facing(o.x-this.x,o.y-this.y);
  if(this.still>FOLLOW.lie&&!this.happy){this.state='lie';this.frame=PET_ANIM.lie[0];}
  else if(this.still>FOLLOW.sit){this.state='sit';const wag=this.happy?8:2.2;this.frame=PET_ANIM.sit[Math.floor(this.clock*wag)%2];}
  else{this.state='idle';this.frame=PET_ANIM.idle[Math.floor(this.clock*(this.happy?10:4))%4];}
}
}
