// Gadget's drill: three waves of RC robots out of the hatches in the back wall. They roll at you and bump you, but never bite.
// Paint one enough and it falls over; it stays down, paint and all, until Gadget resets them.
import {SOLIDS} from './model.js';
import {TG,HATCHES,GATE,ROOM} from '../grounds/data.js';
export const WAVES=[4,6,8],BOT_HP=66,CELL=16,BUMP={range:21,push:16,cool:1.2};
const COLS=Math.ceil(TG.w/CELL),ROWS=Math.ceil(TG.h/CELL),BOT_R=11,NB=[[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]];
// The robots keep to the arena: Gadget's geofence stops them at the gate line, so the office is safe.
const FENCE=GATE.y-4;
export function botBlocked(x,y,r=BOT_R-3){if(x-r<ROOM.left||x+r>ROOM.right||y-r<ROOM.top||y+r>FENCE)return true;return SOLIDS.some(b=>{const dx=x-Math.max(b.x,Math.min(x,b.x+b.w)),dy=y-Math.max(b.y,Math.min(y,b.y+b.h));return dx*dx+dy*dy<r*r;});}
const OPEN=new Uint8Array(COLS*ROWS);for(let j=0;j<ROWS;j++)for(let i=0;i<COLS;i++)OPEN[j*COLS+i]=botBlocked(i*CELL+CELL/2,j*CELL+CELL/2,BOT_R-1)?0:1;
const cellOf=(x,y)=>Math.max(0,Math.min(ROWS-1,Math.floor(y/CELL)))*COLS+Math.max(0,Math.min(COLS-1,Math.floor(x/CELL)));
function nearestOpen(x,y){const c=cellOf(x,y);if(OPEN[c])return c;const cx=c%COLS,cy=(c/COLS)|0;let best=-1,bd=1e9;
 for(let r=1;r<40&&best<0;r++)for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++){if(Math.max(Math.abs(dx),Math.abs(dy))!==r)continue;const nx=cx+dx,ny=cy+dy;if(nx<0||ny<0||nx>=COLS||ny>=ROWS)continue;const j=ny*COLS+nx;if(OPEN[j]){const d=dx*dx+dy*dy;if(d<bd){bd=d;best=j;}}}return best;}
// Breadth-first distance from the survivor over the open cells. Each robot rolls downhill on it.
function flowFrom(start){const dist=new Int32Array(COLS*ROWS).fill(-1),q=new Int32Array(COLS*ROWS);let h=0,t=0;if(start<0)return dist;dist[start]=0;q[t++]=start;
 while(h<t){const i=q[h++],cx=i%COLS,cy=(i/COLS)|0,d=dist[i]+1;for(const [dx,dy] of NB){const nx=cx+dx,ny=cy+dy;if(nx<0||ny<0||nx>=COLS||ny>=ROWS)continue;const j=ny*COLS+nx;if(!OPEN[j]||dist[j]>=0)continue;if(dx&&dy&&(!OPEN[cy*COLS+nx]||!OPEN[ny*COLS+cx]))continue;dist[j]=d;q[t++]=j;}}return dist;}
// A small seeded random, so a drill plays the same way in tests.
function rng(seed){let s=seed>>>0||1;return()=>{s^=s<<13;s^=s>>>17;s^=s<<5;return (s>>>0)/4294967296;};}
export class Drill{
 constructor(practice){this.p=practice;this.state='idle';this.bots=[];this.wave=0;this.time=0;this.bumps=0;this.summary=null;this.events=[];this.queue=0;this.spawnIn=0;this.nextWave=0;this.flow=null;this.flowCell=-1;this.flowAge=0;this.seed=1;this.id=0;this.rand=rng(1);}
 get left(){return this.queue+this.bots.filter(b=>b.hp>0).length;}
 start(){this.state='run';this.bots=[];this.wave=0;this.time=0;this.bumps=0;this.summary=null;this.events=[];this.shots0=this.p.shots;this.hits0=this.p.hits;this.rand=rng(this.seed++);this.p.model.bots=this.bots;this.beginWave(0);}
 stop(){this.state='idle';this.bots=[];this.queue=0;this.p.model.bots=this.bots;}
 beginWave(i){this.wave=i;this.queue=WAVES[i];this.spawnIn=.4;this.events.push({type:'wave',wave:i+1});}
 spawn(){const h=HATCHES[(this.id+this.wave)%HATCHES.length],x=h.x+(this.rand()-.5)*40,y=h.y+22;
  this.bots.push({id:this.id++,x,y,hp:BOT_HP,variant:Math.floor(this.rand()*4),frame:0,phase:this.rand(),flip:this.rand()<.5,cool:.6,flash:0,paint:[],down:0,speed:58+this.wave*10+this.rand()*14,stuck:0});this.queue--;}
 // Paint lands on a robot: true when it counts as a hit.
 hit(x,y){return this.bots.find(b=>b.hp>0&&Math.hypot(b.x-x,b.y-y)<13);}
 hurt(b,amount){if(b.hp<=0)return;const n=Math.min(b.hp,amount);b.hp-=n;b.flash=.14;this.p.damage+=n;if(b.hp<=0){b.down=.001;b.frame=2;this.events.push({type:'down',x:b.x,y:b.y});}}
 update(dt,m){if(this.state!=='run')return;this.time+=dt;for(const b of this.bots){b.flash=Math.max(0,b.flash-dt);if(b.down)b.down+=dt;}
  if(this.queue>0){this.spawnIn-=dt;if(this.spawnIn<=0){this.spawn();this.spawnIn=.55;}}
  else if(!this.bots.some(b=>b.hp>0)){if(this.wave<WAVES.length-1){if(!this.nextWave)this.nextWave=2.2;this.nextWave-=dt;if(this.nextWave<=0){this.nextWave=0;this.beginWave(this.wave+1);}}else{this.finish();return;}}
  // Out of the arena (in the office or the lane), they crowd the nearest open floor to you.
  const office=m.y>FENCE-8,pc=nearestOpen(office?Math.max(GATE.x+12,Math.min(GATE.x+GATE.w-12,m.x)):m.x,office?FENCE-12:m.y);
  this.flowAge+=dt;if(pc!==this.flowCell||this.flowAge>.3||!this.flow){this.flow=flowFrom(pc);this.flowCell=pc;this.flowAge=0;}
  const alive=this.bots.filter(b=>b.hp>0);for(const b of alive)this.steer(b,dt,m,alive);}
 steer(b,dt,m,alive){b.cool=Math.max(0,b.cool-dt);const dx=m.x-b.x,dy=m.y-b.y,d=Math.hypot(dx,dy)||1;let tx=0,ty=0;
  // Close and in the open: straight at you. Otherwise follow the flow around the cover.
  if(d<90&&this.p.clear(b,m)){tx=dx/d;ty=dy/d;}else{const c=cellOf(b.x,b.y),cx=c%COLS,cy=(c/COLS)|0,here=this.flow[c];let best=-1,bv=here>=0?here:1e9;
   for(const [ox,oy] of NB){const nx=cx+ox,ny=cy+oy;if(nx<0||ny<0||nx>=COLS||ny>=ROWS)continue;const j=ny*COLS+nx,v=this.flow[j];if(v>=0&&v<bv){bv=v;best=j;}}
   if(best>=0){const gx=(best%COLS)*CELL+CELL/2-b.x,gy=((best/COLS)|0)*CELL+CELL/2-b.y,gl=Math.hypot(gx,gy)||1;tx=gx/gl;ty=gy/gl;}else{tx=dx/d;ty=dy/d;}}
  // Keep a little space between robots so they do not stack.
  for(const o of alive){if(o===b)continue;const ox=b.x-o.x,oy=b.y-o.y,od=Math.hypot(ox,oy);if(od>0&&od<24){tx+=ox/od*(24-od)/24*1.4;ty+=oy/od*(24-od)/24*1.4;}}
  const tl=Math.hypot(tx,ty)||1;tx/=tl;ty/=tl;
  // Contact: a bump, a shove, and the robot backs off for a moment.
  if(d<BUMP.range){if(b.cool<=0){b.cool=BUMP.cool;this.bumps++;this.events.push({type:'bump',x:b.x,y:b.y});this.shove(m,dx/d,dy/d);this.roll(b,-dx/d*6,-dy/d*6);}return;}
  if(b.cool>BUMP.cool-.35)return;
  const step=b.speed*dt,ox=b.x,oy=b.y;this.roll(b,tx*step,ty*step);const moved=Math.hypot(b.x-ox,b.y-oy);
  if(moved<step*.2){b.stuck+=dt;if(b.stuck>.6){b.stuck=0;const a=this.rand()*6.28;this.roll(b,Math.cos(a)*8,Math.sin(a)*8);}}else b.stuck=0;
  b.phase=(b.phase+moved/22)%1;b.frame=b.phase<.5?0:1;if(Math.abs(tx)>.3)b.flip=tx<0;}
 roll(b,dx,dy){const n=Math.max(1,Math.ceil(Math.max(Math.abs(dx),Math.abs(dy))/4));for(let i=0;i<n;i++){if(!botBlocked(b.x+dx/n,b.y))b.x+=dx/n;if(!botBlocked(b.x,b.y+dy/n))b.y+=dy/n;}}
 shove(m,ux,uy){const n=8;for(let i=0;i<n;i++){const s=BUMP.push/n;if(!m.blocked(m.x+ux*s,m.y))m.x+=ux*s;if(!m.blocked(m.x,m.y+uy*s))m.y+=uy*s;}}
 finish(){this.state='done';const shots=this.p.shots-this.shots0,hits=this.p.hits-this.hits0;this.summary={time:this.time,shots,hits,bumps:this.bumps,accuracy:shots?hits/shots:0};this.events.push({type:'done',summary:this.summary});}
 // Events since the last call, for the HUD.
 drain(){const e=this.events;this.events=[];return e;}
}
