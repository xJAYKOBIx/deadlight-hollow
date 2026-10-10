// A pet that lives in a house and keeps its own routine: it naps, eats, watches the window and wanders room to room by the
// doorways. It does not follow you. Walk up and it looks round at you; give it a pat and it sits up, happy, then gets on with its day.
// rooms name where it is, blocked(x,y,pet,plan) says where it cannot stand, and spots are where this animal likes to be (see home/data.js).
import {PET_ANIM} from './pet.js';
export const HOUSE_PET={near:58,glance:96,hop:.32,stuck:2.4,grid:6,stride:{walk:30,run:58}};
const facing=(dx,dy)=>(Math.round(Math.atan2(dy,dx)/(Math.PI/4))+8)%8;
export class HousePet{
 constructor(def,{rooms,blocked,rand=Math.random}){Object.assign(this,{def,id:def.id,name:def.name,rooms,blocked,rand,x:0,y:0,h:0,depth:null,direction:2,frame:PET_ANIM.idle[0],state:'idle',phase:0,clock:0,happy:0,
  spot:null,path:[],rest:0,stuck:0,hop:null,perched:false,looking:0,open:new Map()});const s=def.spots[0];this.place(s);}
 // Start at a spot, already settled.
 place(s){Object.assign(this,{x:s.perch?s.perch.x:s.x,y:s.perch?s.perch.y:s.y,h:s.perch?s.perch.h:0,depth:s.perch?s.perch.d:null,perched:!!s.perch,spot:s,path:[],rest:s.time[0]+this.rand()*(s.time[1]-s.time[0]),direction:s.face??2,state:s.pose});this.pose();}
 roomAt(x,y){return this.rooms.find(r=>x>=r.x-1&&x<=r.x+r.w+1&&y>=r.y-1&&y<=r.y+r.h+1)?.id;}
 // The way somewhere: a search over a coarse grid of the floor, so it goes round tables and through doorways like a real
 // animal, then cut down to the corners it needs. blocked(x,y,pet,true) asks about the furniture only, never about you.
 route(to){const G=HOUSE_PET.grid,free=(x,y)=>{const k=x+','+y;let v=this.open.get(k);if(v===undefined){v=!this.blocked(x,y,this,true);this.open.set(k,v);}return v;},
  // The nearest open grid point, in case the exact one is up against a wall or under a chair.
  snap=(x,y)=>{const cx=Math.round(x/G)*G,cy=Math.round(y/G)*G;let best=null,bd=Infinity;for(let j=-2;j<=2;j++)for(let i=-2;i<=2;i++){const p=[cx+i*G,cy+j*G],d=Math.hypot(p[0]-x,p[1]-y);if(d<bd&&free(...p)){bd=d;best=p;}}return best;},
  start=snap(this.x,this.y),goal=snap(to.x,to.y),key=([x,y])=>x+','+y;if(!start||!goal)return [{x:to.x,y:to.y}];const gk=key(goal);
  const prev=new Map([[key(start),null]]),queue=[start];let found=gk===key(start)?start:null;
  for(let i=0;i<queue.length&&!found;i++){const c=queue[i];for(const [dx,dy] of [[G,0],[-G,0],[0,G],[0,-G],[G,G],[G,-G],[-G,G],[-G,-G]]){const n=[c[0]+dx,c[1]+dy],k=key(n);
    if(prev.has(k)||!free(...n)||(dx&&dy&&(!free(c[0]+dx,c[1])||!free(c[0],c[1]+dy))))continue;prev.set(k,c);if(k===gk){found=n;break;}queue.push(n);}}
  if(!found)return [{x:to.x,y:to.y}];const cells=[];for(let c=found;c;c=prev.get(key(c)))cells.unshift({x:c[0],y:c[1]});
  // Keep only the turns it cannot see past.
  const clear=(a,b)=>{const n=Math.ceil(Math.hypot(b.x-a.x,b.y-a.y)/(G/2));for(let i=1;i<n;i++){const t=i/n;if(this.blocked(a.x+(b.x-a.x)*t,a.y+(b.y-a.y)*t,this,true))return false;}return true;};
  const pts=[];let from={x:this.x,y:this.y};for(let i=1;i<cells.length;i++)if(!clear(from,cells[i])){pts.push(cells[i-1]);from=cells[i-1];}
  pts.push({x:to.x,y:to.y});return pts;}
 // Pick somewhere else to be, weighted by how much it likes each spot, never the one it is at.
 choose(){const list=this.def.spots.filter(s=>s!==this.spot),total=list.reduce((n,s)=>n+(s.weight||1),0);let k=this.rand()*total,next=list[0];for(const s of list){k-=s.weight||1;if(k<=0){next=s;break;}}
  this.spot=next;this.path=this.route(next);this.stuck=0;}
 // A pat: hearts, it sits up and looks at you, and stays put a few seconds longer.
 pet(o){this.happy=1.6;this.rest=Math.max(this.rest,3);if(o)this.direction=facing(o.x-this.x,o.y-this.y);}
 pose(){const P=PET_ANIM[this.state]||PET_ANIM.idle,speed=this.state==='sniff'?3.4:this.state==='stretch'?1.6:this.state==='sit'?(this.happy?8:2.2):(this.happy?10:4);this.frame=P[Math.floor(this.clock*speed)%P.length];}
 step(tx,ty,dt){const dx=tx-this.x,dy=ty-this.y,d=Math.hypot(dx,dy),step=Math.min(this.def.speed*dt,d);if(step<=0)return 0;const base=Math.atan2(dy,dx);
  for(const turn of [0,.5,-.5,1,-1,1.5,-1.5]){const a=base+turn,nx=this.x+Math.cos(a)*step,ny=this.y+Math.sin(a)*step;if(!this.blocked(nx,ny,this)){this.x=nx;this.y=ny;this.direction=facing(Math.cos(a),Math.sin(a));this.stuck=0;return step;}}
  this.stuck+=dt;return 0;}
 update(dt,o){dt=Math.max(0,Math.min(.05,dt||0));if(!dt)return;this.clock+=dt;this.happy=Math.max(0,this.happy-dt);
  const far=Math.hypot(o.x-this.x,o.y-this.y);
  // Hopping up onto (or down off) a perch.
  if(this.hop){const H=this.hop;H.t+=dt/HOUSE_PET.hop;const k=Math.min(1,H.t);this.x=H.a.x+(H.b.x-H.a.x)*k;this.y=H.a.y+(H.b.y-H.a.y)*k;this.h=H.a.h+(H.b.h-H.a.h)*k+Math.sin(k*Math.PI)*8;this.depth=H.d;this.state='run';this.frame=PET_ANIM.run[2];
   if(k>=1){this.hop=null;this.h=H.b.h;this.perched=H.b.h>0;this.depth=this.perched?this.spot.perch.d:null;if(H.then)H.then();}return;}
  if(this.path.length){// On the way somewhere. Off a perch first.
   if(this.perched){const from={x:this.x,y:this.y,h:this.h},to=this.downTo||{x:this.x,y:this.y+20};this.hop={a:from,b:{...to,h:0},t:0,d:this.depth,then:()=>{this.path=this.route(this.spot);}};this.downTo=null;return;}
   const p=this.path[0],moved=this.step(p.x,p.y,dt);
   if(Math.hypot(p.x-this.x,p.y-this.y)<2.5)this.path.shift();
   if(this.stuck>HOUSE_PET.stuck){this.path=[];this.stuck=0;this.arrive(false);return;}
   if(moved>0){this.state='walk';this.phase=(this.phase+moved/HOUSE_PET.stride.walk)%1;this.frame=PET_ANIM.walk[Math.floor(this.phase*PET_ANIM.walk.length)];}
   if(!this.path.length)this.arrive(true);return;}
  // Settled. It glances round when you come close and holds still while you are near, then moves on when its time is up.
  this.rest-=dt*(far<HOUSE_PET.near?.35:1);
  if(far<HOUSE_PET.glance&&!this.perched&&(this.def.id==='dog'||far<HOUSE_PET.near)){this.looking=Math.min(1,this.looking+dt*2);if(this.looking>.5)this.direction=facing(o.x-this.x,o.y-this.y);}else this.looking=Math.max(0,this.looking-dt);
  const was=this.state;if(this.happy||(this.def.id==='dog'&&far<HOUSE_PET.near&&this.spot.pose!=='sniff'&&!this.perched))this.state='sit';else this.state=this.spot.pose;if(this.state!==was&&this.state==='stretch')this.clock=0;
  this.pose();if(this.rest<=0&&!this.happy){const s=this.spot;this.downTo=s.perch?{x:s.x,y:s.y}:null;this.choose();}}
 // At a spot: hop up if it is a perch, face the way it likes, and stay a while.
 arrive(ok){const s=this.spot;this.rest=s.time[0]+this.rand()*(s.time[1]-s.time[0]);if(!ok){this.rest=Math.min(this.rest,3);this.state='idle';return;}
  if(s.face!==undefined)this.direction=s.face;this.state=s.pose;this.clock=0;
  if(s.perch){const p=s.perch;this.hop={a:{x:this.x,y:this.y,h:0},b:{x:p.x,y:p.y,h:p.h},t:0,d:p.d,then:()=>{this.direction=s.face??(this.rand()<.5?1:3);}};}}
}
