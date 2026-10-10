// Gadget's robots. Two ways to run them:
// the drill, three waves of the old robots that only bump you, and a Holdout, endless waves that copy what is out there and hit with paint until you drop.
// Paint one enough and it falls over; it stays down, paint and all, until Gadget resets them.
import {SOLIDS} from './model.js';
import {TG,HATCHES,GATE,ROOM} from '../grounds/data.js';
export const WAVES=[4,6,8],BOT_HP=66,CELL=16,BUMP={range:21,push:16,cool:1.2};
// The Holdout roster. Each robot keeps the tell, the weak spot and the counter of the zombie it copies.
export const TYPES={
 shambler:{hp:40,speed:[44,56],hit:12,cool:1.1,parts:1,r:13},
 runner:{hp:30,speed:[58,66],sprint:150,hit:10,cool:1,parts:1,r:12},
 husk:{hp:70,speed:[40,50],hit:14,cool:1.2,parts:2,r:13},
 spitter:{hp:60,speed:[50,60],hit:0,cool:3,parts:2,r:13},
 brute:{hp:400,speed:[38,38],hit:40,cool:4,parts:5,r:24}};
export const HOLDOUT={hp:100,vest:25,revive:60,downTime:2.5,breakTime:10,startDelay:3,cap:24,medkit:40,stun:1.5,tell:.35,spitTell:.6,spitRange:[170,260],puddle:{r:24,life:4,dps:10,hit:8},
 charge:{wind:1,speed:300,time:1.2,stun:1.6,push:40,range:220},runner:{sight:420,shriek:.5},magnet:50,collect:22,lie:9};
// Pistols and the Tactical AR barely scratch a husk unless you hit the head.
const LIGHT_GUNS=new Set(['light-pistol','tactical-ar']);
const COLS=Math.ceil(TG.w/CELL),ROWS=Math.ceil(TG.h/CELL),BOT_R=11,NB=[[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]];
// The robots keep to the arena: Gadget's geofence stops them at the gate line, so the post is safe.
const FENCE=GATE.y-4;
// Windows are open to robots: they climb through, slowly.
const WALLS=SOLIDS.filter(o=>!o.window),WINDOWS=SOLIDS.filter(o=>o.window);
export function botBlocked(x,y,r=BOT_R-3){if(x-r<ROOM.left||x+r>ROOM.right||y-r<ROOM.top||y+r>FENCE)return true;return WALLS.some(b=>{const dx=x-Math.max(b.x,Math.min(x,b.x+b.w)),dy=y-Math.max(b.y,Math.min(y,b.y+b.h));return dx*dx+dy*dy<r*r;});}
const inWindow=(x,y)=>WINDOWS.some(o=>x>o.x-4&&x<o.x+o.w+4&&y>o.y-4&&y<o.y+o.h+4);
const OPEN=new Uint8Array(COLS*ROWS);for(let j=0;j<ROWS;j++)for(let i=0;i<COLS;i++)OPEN[j*COLS+i]=botBlocked(i*CELL+CELL/2,j*CELL+CELL/2,BOT_R-1)?0:1;
const cellOf=(x,y)=>Math.max(0,Math.min(ROWS-1,Math.floor(y/CELL)))*COLS+Math.max(0,Math.min(COLS-1,Math.floor(x/CELL)));
function nearestOpen(x,y){const c=cellOf(x,y);if(OPEN[c])return c;const cx=c%COLS,cy=(c/COLS)|0;let best=-1,bd=1e9;
 for(let r=1;r<40&&best<0;r++)for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++){if(Math.max(Math.abs(dx),Math.abs(dy))!==r)continue;const nx=cx+dx,ny=cy+dy;if(nx<0||ny<0||nx>=COLS||ny>=ROWS)continue;const j=ny*COLS+nx;if(OPEN[j]){const d=dx*dx+dy*dy;if(d<bd){bd=d;best=j;}}}return best;}
// Breadth-first distance from the survivor over the open cells. Each robot rolls downhill on it.
function flowFrom(start){const dist=new Int32Array(COLS*ROWS).fill(-1),q=new Int32Array(COLS*ROWS);let h=0,t=0;if(start<0)return dist;dist[start]=0;q[t++]=start;
 while(h<t){const i=q[h++],cx=i%COLS,cy=(i/COLS)|0,d=dist[i]+1;for(const [dx,dy] of NB){const nx=cx+dx,ny=cy+dy;if(nx<0||ny<0||nx>=COLS||ny>=ROWS)continue;const j=ny*COLS+nx;if(!OPEN[j]||dist[j]>=0)continue;if(dx&&dy&&(!OPEN[cy*COLS+nx]||!OPEN[ny*COLS+cx]))continue;dist[j]=d;q[t++]=j;}}return dist;}
// A small seeded random, so a run plays the same way in tests.
function rng(seed){let s=seed>>>0||1;return()=>{s^=s<<13;s^=s>>>17;s^=s<<5;return (s>>>0)/4294967296;};}
// What a Holdout wave sends: shamblers first, then a new kind mixed in each wave until the brute shows up in wave 5.
export function waveMix(n){const out=[],total=5+2*n,brutes=Math.floor(n/5),spitters=n===4?1:n>4?Math.floor((n-2)/2):0,husks=n>=3?Math.max(1,Math.floor(n*.6)):0;
 // Runners come in packs of three to five.
 let runners=n>=2?Math.max(3,Math.round(total*.25)):0;while(runners>0){const size=runners<=5?runners:runners>=8?4:3;out.push({kind:'runner',pack:size});runners-=size;}
 for(let i=0;i<husks;i++)out.push({kind:'husk'});for(let i=0;i<spitters;i++)out.push({kind:'spitter'});for(let i=0;i<brutes;i++)out.push({kind:'brute'});
 const used=out.reduce((a,g)=>a+(g.pack||1),0);for(let i=used;i<total;i++)out.push({kind:'shambler'});
 // Shuffle the specials into the shamblers, the same way every time.
 return out.map((g,i)=>[((i*7919+n*31)%97)/97,g]).sort((a,b)=>a[0]-b[0]).map(x=>x[1]);}
export class Drill{
 constructor(practice){this.p=practice;this.mode='drill';this.state='idle';this.phase='';this.bots=[];this.wave=0;this.time=0;this.bumps=0;this.summary=null;this.events=[];this.queue=0;this.groups=[];this.spawnIn=0;this.nextWave=0;this.flow=null;this.flowCell=-1;this.flowAge=0;this.seed=1;this.id=0;this.rand=rng(1);
  this.hp=0;this.maxHp=0;this.revives=0;this.downT=0;this.gateClosed=false;this.pickups=[];this.globs=[];this.puddles=[];this.parts=0;this.kills=0;this.cleared=0;this.perks={};}
 get left(){return this.queue+this.groups.reduce((a,g)=>a+(g.pack||1),0)+this.bots.filter(b=>b.hp>0).length;}
 get holdout(){return this.mode==='holdout';}
 get downed(){return this.holdout&&this.phase==='down';}
 // perks: what you bought from Aaron (vest, medkit, wind).
 start(mode='drill',perks={}){this.mode=mode;this.state='run';this.bots=[];this.wave=0;this.time=0;this.bumps=0;this.summary=null;this.events=[];this.queue=0;this.groups=[];this.nextWave=0;this.pickups=[];this.globs=[];this.puddles=[];this.parts=0;this.kills=0;this.cleared=0;
  this.shots0=this.p.shots;this.hits0=this.p.hits;this.rand=rng(this.seed++);this.p.model.bots=this.bots;this.perks={...perks};
  if(mode==='holdout'){this.maxHp=HOLDOUT.hp+(perks.vest?HOLDOUT.vest:0);this.hp=this.maxHp;this.revives=1+(perks.wind?1:0);this.downT=0;this.phase='ready';this.setGate(false);this.events.push({type:'ready'});}
  else{this.phase='';this.beginWave(0);}}
 stop(){this.state='idle';this.phase='';this.bots=[];this.queue=0;this.groups=[];this.pickups=[];this.globs=[];this.puddles=[];this.p.model.bots=this.bots;this.setGate(false);}
 setGate(closed){if(this.gateClosed===closed){this.p.model.gateClosed=closed;return;}this.gateClosed=closed;this.p.model.gateClosed=closed;this.events.push({type:'gate',closed});}
 beginWave(i){this.wave=i;if(this.holdout){this.groups=waveMix(i);this.queue=0;this.spawnIn=.4;this.phase='wave';this.events.push({type:'wave',wave:i});return;}this.queue=WAVES[i];this.spawnIn=.4;this.events.push({type:'wave',wave:i+1});}
 hatch(){return HATCHES[(this.id+this.wave)%HATCHES.length];}
 place(h,spread=40){const j=(this.rand()-.5)*spread;return h.side==='n'?{x:h.x+j,y:h.y+22}:h.side==='w'?{x:h.x+14,y:h.y+j}:{x:h.x-14,y:h.y+j};}
 make(kind,x,y){const T=TYPES[kind],hp=this.holdout?T.hp:BOT_HP,speed=this.holdout?T.speed[0]+this.rand()*(T.speed[1]-T.speed[0])+this.wave*1.5:58+this.wave*10+this.rand()*14;
  const b={id:this.id++,kind,x,y,hp,max:hp,variant:Math.floor(this.rand()*4),frame:0,phase:this.rand(),flip:this.rand()<.5,fx:0,fy:1,cool:.6,flash:0,paint:[],down:0,speed,stuck:0,tell:0,stun:0,state:kind==='runner'?'roam':'',act:0,dir:null};
  this.bots.push(b);return b;}
 spawn(){if(!this.holdout){const h=this.hatch(),{x,y}=this.place(h);this.make('shambler',x,y);this.queue--;return;}
  const g=this.groups.shift(),h=this.hatch();if(g.pack){for(let k=0;k<g.pack;k++){const {x,y}=this.place(h,56);this.make('runner',x,y);}}else{const {x,y}=this.place(h);this.make(g.kind,x,y);}}
 // A ball hits a robot where it lands: true when it counts as a hit.
 hit(x,y){return this.bots.find(b=>b.hp>0&&Math.hypot(b.x-x,b.y-y)<(b.kind==='brute'?24:13));}
 // How much a hit does: husks shrug off light guns unless it is a headshot; the brute only feels it in the back, or when it is stunned.
 damage(b,amount,how={}){if(!this.holdout)return amount;let k=how.head&&b.kind!=='brute'?2:1;
  if(b.kind==='husk'&&!how.head&&!how.explosive&&LIGHT_GUNS.has(how.gun))k*=.35;
  if(b.kind==='brute'&&!how.explosive){if(b.stun>0)k*=1.5;else if(how.dx===undefined)k*=.6;else{const l=Math.hypot(how.dx,how.dy)||1,dot=(how.dx*b.fx+how.dy*b.fy)/l;k*=dot<-.5?.2:dot>.5?1.5:.6;}}
  return amount*k;}
 hurt(b,amount,how={}){if(b.hp<=0)return 0;const n=Math.min(b.hp,this.damage(b,amount,how));b.hp-=n;b.flash=.14;this.p.damage+=n;if(how.head)b.headFlash=.25;
  if(b.hp<=0){b.down=.001;b.frame=2;b.tell=0;this.kills++;this.events.push({type:'down',x:b.x,y:b.y,kind:b.kind});if(this.holdout&&!b.off)this.drop(b);}return n;}
 // Broken parts scatter where a robot falls. Walk over them to pick them up for Gadget.
 drop(b){const n=TYPES[b.kind].parts;for(let k=0;k<n;k++){const a=this.rand()*6.28,s=40+this.rand()*50;this.pickups.push({x:b.x,y:b.y,vx:Math.cos(a)*s,vy:Math.sin(a)*s*.7,age:0,kind:b.kind,seed:Math.floor(this.rand()*1e6)});}}
 // You get hit. Gadget pulls you up once (twice with a second wind); after that the run is over.
 hurtPlayer(n,src){if(!this.holdout||this.state!=='run'||this.phase==='down'||this.phase==='ready'||n<=0)return;this.hp=Math.max(0,this.hp-n);this.events.push({type:'hurt',n,x:src?.x,y:src?.y});
  if(this.hp>0)return;if(this.revives>0){this.revives--;this.phase='down';this.downT=HOLDOUT.downTime;this.events.push({type:'downed'});}else this.over();}
 revive(m){this.hp=HOLDOUT.revive;this.phase=this.groups.length||this.queue||this.bots.some(b=>b.hp>0)?'wave':'break';if(this.phase==='break'&&!this.nextWave)this.nextWave=HOLDOUT.breakTime;
  // Gadget's shove: every robot close by is knocked back and stunned for a moment.
  for(const b of this.bots){if(b.hp<=0)continue;const dx=b.x-m.x,dy=b.y-m.y,d=Math.hypot(dx,dy)||1;if(d<90){this.roll(b,dx/d*40,dy/d*40);b.stun=HOLDOUT.stun;b.tell=0;b.state=b.kind==='runner'?'roam':'';b.act=0;}}
  this.events.push({type:'revive'});}
 over(){this.state='done';this.phase='over';this.setGate(false);for(const b of this.bots)if(b.hp>0){b.off=true;b.hp=0;b.down=.001;b.frame=2;}this.globs=[];
  this.summary={mode:'holdout',wave:this.wave,cleared:this.cleared,time:this.time,parts:this.parts,kills:this.kills,shots:this.p.shots-this.shots0,hits:this.p.hits-this.hits0};this.events.push({type:'over',summary:this.summary});}
 update(dt,m){if(this.state!=='run')return;this.time+=dt;for(const b of this.bots){b.flash=Math.max(0,b.flash-dt);b.headFlash=Math.max(0,(b.headFlash||0)-dt);if(b.down)b.down+=dt;}
  if(this.holdout){if(this.holdoutStep(dt,m))return;}
  else if(this.queue>0){this.spawnIn-=dt;if(this.spawnIn<=0){this.spawn();this.spawnIn=.55;}}
  else if(!this.bots.some(b=>b.hp>0)){if(this.wave<WAVES.length-1){if(!this.nextWave)this.nextWave=2.2;this.nextWave-=dt;if(this.nextWave<=0){this.nextWave=0;this.beginWave(this.wave+1);}}else{this.finish();return;}}
  // Out of the arena (at the post or the lane), they crowd the nearest open floor to you.
  const post=m.y>FENCE-8,pc=nearestOpen(post?Math.max(GATE.x+12,Math.min(GATE.x+GATE.w-12,m.x)):m.x,post?FENCE-12:m.y);
  this.flowAge+=dt;if(pc!==this.flowCell||this.flowAge>.3||!this.flow){this.flow=flowFrom(pc);this.flowCell=pc;this.flowAge=0;}
  const alive=this.bots.filter(b=>b.hp>0);for(const b of alive)this.holdout?this.act(b,dt,m,alive):this.steer(b,dt,m,alive);
  if(this.holdout)this.effects(dt,m);}
 // The Holdout's clock: wait for you in the yard, lock the gate, run the waves and the breaks between them, and pull you up when you drop.
 holdoutStep(dt,m){
  if(this.phase==='ready'){if(m.y<GATE.y-24){this.setGate(true);this.phase='start';this.nextWave=HOLDOUT.startDelay;this.events.push({type:'locked'});}return true;}
  if(this.phase==='start'){this.nextWave-=dt;if(this.nextWave<=0){this.nextWave=0;this.beginWave(1);}return false;}
  if(this.phase==='down'){this.downT-=dt;if(this.downT<=0)this.revive(m);}
  if(this.groups.length){const alive=this.bots.filter(b=>b.hp>0).length;this.spawnIn-=dt;if(this.spawnIn<=0&&alive<HOLDOUT.cap){this.spawn();this.spawnIn=Math.max(.35,.9-this.wave*.05);}}
  else if(this.phase==='wave'&&!this.bots.some(b=>b.hp>0)){this.cleared=this.wave;this.phase='break';this.nextWave=HOLDOUT.breakTime;this.events.push({type:'clear',wave:this.wave});
   if(this.perks.medkit&&this.hp<this.maxHp){const n=Math.min(HOLDOUT.medkit,this.maxHp-this.hp);this.hp+=n;this.events.push({type:'heal',n});}}
  if(this.phase==='break'){this.nextWave-=dt;if(this.nextWave<=0){this.nextWave=0;this.beginWave(this.wave+1);}}
  // Robots that have been down a while are cleared off so the floor does not fill up.
  this.bots=this.bots.filter(b=>!(b.hp<=0&&b.down>HOLDOUT.lie));this.p.model.bots=this.bots;return false;}
 // Spit, puddles and parts.
 effects(dt,m){const P=HOLDOUT.puddle,live=this.phase!=='down';
  for(const g of this.globs){g.age+=dt;if(g.age>=g.dur){this.puddles.push({x:g.ex,y:g.ey,r:P.r,life:P.life,age:0,seed:g.seed});if(live&&Math.hypot(m.x-g.ex,m.y-g.ey)<P.r)this.hurtPlayer(P.hit,g);}}this.globs=this.globs.filter(g=>g.age<g.dur);
  let inPaint=false;for(const u of this.puddles){u.age+=dt;u.life-=dt;if(Math.hypot(m.x-u.x,(m.y-u.y)*1.3)<u.r)inPaint=true;}this.puddles=this.puddles.filter(u=>u.life>0);
  if(inPaint&&live){this.paintTick=(this.paintTick||0)+dt;if(this.paintTick>=.25){this.paintTick-=.25;this.hurtPlayer(P.dps*.25);}}else this.paintTick=0;
  for(const k of this.pickups){k.age+=dt;const d=Math.hypot(m.x-k.x,m.y-k.y);
   if(k.age>.5&&d<HOLDOUT.magnet&&this.phase!=='down'){const s=Math.min(d,240*dt);k.x+=(m.x-k.x)/(d||1)*s;k.y+=(m.y-k.y)/(d||1)*s;}
   else{const f=Math.max(0,1-dt*4);if(!botBlocked(k.x+k.vx*dt,k.y+k.vy*dt,2)){k.x+=k.vx*dt;k.y+=k.vy*dt;}k.vx*=f;k.vy*=f;}
   if(k.age>.5&&d<HOLDOUT.collect&&this.phase!=='down'){k.taken=true;this.parts++;this.events.push({type:'part',n:1,kind:k.kind});}}
  this.pickups=this.pickups.filter(k=>!k.taken);}
 // Head toward a point by the flow field, or straight at it when it is close and in the open.
 heading(b,m,d,dx,dy){if(d<90&&this.p.clear(b,m))return [dx/d,dy/d];const c=cellOf(b.x,b.y),cx=c%COLS,cy=(c/COLS)|0,here=this.flow[c];let best=-1,bv=here>=0?here:1e9;
  for(const [ox,oy] of NB){const nx=cx+ox,ny=cy+oy;if(nx<0||ny<0||nx>=COLS||ny>=ROWS)continue;const j=ny*COLS+nx,v=this.flow[j];if(v>=0&&v<bv){bv=v;best=j;}}
  if(best>=0){const gx=(best%COLS)*CELL+CELL/2-b.x,gy=((best/COLS)|0)*CELL+CELL/2-b.y,gl=Math.hypot(gx,gy)||1;return [gx/gl,gy/gl];}return [dx/d,dy/d];}
 separate(b,alive,tx,ty){const sp=b.kind==='brute'?40:24;for(const o of alive){if(o===b)continue;const ox=b.x-o.x,oy=b.y-o.y,od=Math.hypot(ox,oy),lim=Math.max(sp,o.kind==='brute'?40:24);if(od>0&&od<lim){tx+=ox/od*(lim-od)/lim*1.4;ty+=oy/od*(lim-od)/lim*1.4;}}const tl=Math.hypot(tx,ty)||1;return [tx/tl,ty/tl];}
 move(b,tx,ty,speed,dt){const step=speed*dt*(inWindow(b.x,b.y)?.3:1),ox=b.x,oy=b.y;this.roll(b,tx*step,ty*step);const moved=Math.hypot(b.x-ox,b.y-oy);
  if(moved<step*.2){b.stuck+=dt;if(b.stuck>.6){b.stuck=0;const a=this.rand()*6.28;this.roll(b,Math.cos(a)*8,Math.sin(a)*8);}}else b.stuck=0;
  b.phase=(b.phase+moved/22)%1;if(!b.tell)b.frame=b.phase<.5?0:1;if(moved>.01){b.fx=(b.x-ox)/moved;b.fy=(b.y-oy)/moved;if(Math.abs(b.fx)>.3)b.flip=b.fx<0;}return moved;}
 face(b,dx,dy){const l=Math.hypot(dx,dy)||1;b.fx=dx/l;b.fy=dy/l;if(Math.abs(b.fx)>.3)b.flip=b.fx<0;}
 // Holdout behaviour, robot by robot.
 act(b,dt,m,alive){b.cool=Math.max(0,b.cool-dt);if(b.stun>0){b.stun-=dt;b.frame=0;return;}
  const T=TYPES[b.kind],dx=m.x-b.x,dy=m.y-b.y,d=Math.hypot(dx,dy)||1,reach=b.kind==='brute'?30:BUMP.range,downed=this.phase==='down';
  // While you are down the robots mill around; Gadget is on her way.
  if(downed){if(d<70){this.move(b,-dx/d,-dy/d,b.speed*.4,dt);}return;}
  if(b.kind==='spitter')return this.spitter(b,dt,m,alive,d,dx,dy);
  if(b.kind==='brute')return this.brute(b,dt,m,alive,d,dx,dy);
  if(b.kind==='runner'&&b.state!=='sprint'){
   if(b.state==='shriek'){b.act-=dt;b.frame=3;b.tell=1;this.face(b,dx,dy);if(b.act<=0){b.state='sprint';b.tell=0;}return;}
   if(d<HOLDOUT.runner.sight&&this.p.clear(b,m)){b.state='shriek';b.act=HOLDOUT.runner.shriek;b.frame=3;b.tell=1;this.events.push({type:'shriek',x:b.x,y:b.y});return;}}
  // The grab: a tell (arms up for a shambler or a husk), then the hit lands if you are still there.
  if(b.tell){b.act-=dt;b.frame=3;if(b.act<=0){b.tell=0;if(d<reach+8){this.hurtPlayer(T.hit,b);this.shove(m,dx/d,dy/d);this.roll(b,-dx/d*6,-dy/d*6);}b.cool=T.cool;}return;}
  if(d<reach){if(b.cool<=0){b.tell=1;b.act=HOLDOUT.tell;b.frame=3;this.face(b,dx,dy);}return;}
  if(b.cool>T.cool-.35)return;
  const [hx,hy]=this.heading(b,m,d,dx,dy),[tx,ty]=this.separate(b,alive,hx,hy);this.move(b,tx,ty,b.kind==='runner'&&b.state==='sprint'?T.sprint:b.speed,dt);}
 // A spitter keeps its distance and lobs paint: it jerks back and glows green, then the glob arcs at where you were standing.
 spitter(b,dt,m,alive,d,dx,dy){const [lo,hi]=HOLDOUT.spitRange,see=this.p.clear(b,m);
  if(b.tell){b.act-=dt;b.frame=3;this.face(b,dx,dy);if(b.act<=0){b.tell=0;b.cool=TYPES.spitter.cool;const dur=.5+d/600;this.globs.push({sx:b.x,sy:b.y,ex:b.aimX,ey:b.aimY,age:0,dur,seed:Math.floor(this.rand()*1e6)});this.events.push({type:'spit',x:b.x,y:b.y});}return;}
  if(see&&d<=hi+20&&b.cool<=0&&d>=lo*.6){b.tell=1;b.act=HOLDOUT.spitTell;b.aimX=m.x;b.aimY=m.y;b.frame=3;return;}
  let tx,ty;if(see&&d<lo){tx=-dx/d;ty=-dy/d;}else if(see&&d<=hi){const s=b.id%2?1:-1;tx=-dy/d*s*.6;ty=dx/d*s*.6;}else[tx,ty]=this.heading(b,m,d,dx,dy);
  [tx,ty]=this.separate(b,alive,tx,ty);this.move(b,tx,ty,b.speed,dt);if(see)this.face(b,dx,dy);}
 // The brute paws the floor for a second, then charges in a straight line. Step aside and it hits a wall and stuns itself; that is when its back is open.
 brute(b,dt,m,alive,d,dx,dy){const C=HOLDOUT.charge;
  if(b.state==='wind'){b.act-=dt;b.frame=3;b.tell=1;this.face(b,dx,dy);if(b.act<=0){b.state='charge';b.act=C.time;b.tell=0;b.dir=[dx/d,dy/d];}return;}
  if(b.state==='charge'){b.act-=dt;const [ux,uy]=b.dir,step=C.speed*dt,ox=b.x,oy=b.y;this.roll(b,ux*step,uy*step,14);const moved=Math.hypot(b.x-ox,b.y-oy);b.fx=ux;b.fy=uy;b.flip=ux<0;b.phase=(b.phase+moved/22)%1;b.frame=b.phase<.5?0:1;
   if(Math.hypot(m.x-b.x,m.y-b.y)<32){this.hurtPlayer(TYPES.brute.hit,b);this.shove(m,ux,uy,C.push/BUMP.push);b.state='';b.cool=TYPES.brute.cool;return;}
   if(moved<step*.5){b.state='';b.stun=C.stun;b.cool=TYPES.brute.cool;this.events.push({type:'stun',x:b.x,y:b.y});return;}
   if(b.act<=0){b.state='';b.cool=TYPES.brute.cool;}return;}
  if(b.cool<=0&&d<C.range&&this.p.clear(b,m)){b.state='wind';b.act=C.wind;b.frame=3;b.tell=1;this.events.push({type:'paw',x:b.x,y:b.y});return;}
  if(d<30)return;const [hx,hy]=this.heading(b,m,d,dx,dy),[tx,ty]=this.separate(b,alive,hx,hy);this.move(b,tx,ty,b.speed,dt);}
 // The drill: the old robots roll at you and bump you, but never hurt.
 steer(b,dt,m,alive){b.cool=Math.max(0,b.cool-dt);const dx=m.x-b.x,dy=m.y-b.y,d=Math.hypot(dx,dy)||1;let [tx,ty]=this.heading(b,m,d,dx,dy);
  // Keep a little space between robots so they do not stack.
  for(const o of alive){if(o===b)continue;const ox=b.x-o.x,oy=b.y-o.y,od=Math.hypot(ox,oy);if(od>0&&od<24){tx+=ox/od*(24-od)/24*1.4;ty+=oy/od*(24-od)/24*1.4;}}
  const tl=Math.hypot(tx,ty)||1;tx/=tl;ty/=tl;
  // Contact: a bump, a shove, and the robot backs off for a moment.
  if(d<BUMP.range){if(b.cool<=0){b.cool=BUMP.cool;this.bumps++;this.events.push({type:'bump',x:b.x,y:b.y});this.shove(m,dx/d,dy/d);this.roll(b,-dx/d*6,-dy/d*6);}return;}
  if(b.cool>BUMP.cool-.35)return;
  this.move(b,tx,ty,b.speed,dt);}
 roll(b,dx,dy,r){const n=Math.max(1,Math.ceil(Math.max(Math.abs(dx),Math.abs(dy))/4));r=r??(b.kind==='brute'?14:undefined);for(let i=0;i<n;i++){if(!botBlocked(b.x+dx/n,b.y,r))b.x+=dx/n;if(!botBlocked(b.x,b.y+dy/n,r))b.y+=dy/n;}}
 shove(m,ux,uy,k=1){const n=8;for(let i=0;i<n;i++){const s=BUMP.push*k/n;if(!m.blocked(m.x+ux*s,m.y))m.x+=ux*s;if(!m.blocked(m.x,m.y+uy*s))m.y+=uy*s;}}
 finish(){this.state='done';const shots=this.p.shots-this.shots0,hits=this.p.hits-this.hits0;this.summary={mode:'drill',time:this.time,shots,hits,bumps:this.bumps,accuracy:shots?hits/shots:0};this.events.push({type:'done',summary:this.summary});}
 // Events since the last call, for the HUD.
 drain(){const e=this.events;this.events=[];return e;}
}
