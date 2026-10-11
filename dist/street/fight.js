// The first fight, out on the street. Real guns now: the one in your hands, the rounds in it, and for the shotgun the shells in
// your bag. The feel is Helldivers: few enemies but each one dangerous, guns that shove what they hit, reloads you commit to
// (you move slower while reloading or firing), and bites you can see coming. A zombie about to bite stops and shows a tell;
// step out of reach or knock it back with the shotgun and the bite misses.
// The rest of the neighbourhood is out there too: wanderers in every other block, who drift round their yards until they see you
// or hear a shot, and give up once you are well away. Far from you they are only thought about twice a second.
// It changes the kit (ammo, shells, the street stage) only through the setKit it is given, so the game saves as it goes.
import {GUNS,muzzle} from '../study/equipment.js';
import {count,remove} from '../home/bag.js';
import {ammoOf,advance,loot} from '../home/kit.js';
import {MAP,WAVES,ROAMERS,NOTICE,HEAR,WALK,solidAt,coverAt} from './data.js';
import {Flow,clearLine} from './paths.js';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),facing=(dx,dy)=>(Math.round(Math.atan2(dy,dx)/(Math.PI/4))+8)%8;
// Wanderers: how far they stroll from where they started and how slowly, when they give up on you, and how far off they stop
// being thought about every frame. Groans only carry so far.
export const ROAM={stroll:{x:140,y:80},walk:16,lose:900,far:800,every:.5,hear:600};
// Your flashlight shows you more, and shows you to them: a wanderer the beam falls on sees you from this far.
export const BEAM_SEEN={range:300,half:26*Math.PI/180};
export const BULLET_SPEED=1600,PLAYER_HP=100;
// The dead: how much they take, how fast they shamble and lurch, and their bite.
export const ZOMBIE={hp:{cop:80,neighbour:60,jogger:55,robe:60,worker:70,neighbour2:60},walk:40,lurch:64,lurchAt:80,reach:24,bite:{windup:.45,damage:14,range:32,cooldown:1.1,shove:70}};
// How hard each gun shoves what it hits (per pellet for the shotgun), and for how long a hit stops a zombie in its tracks. A
// killing hit throws the body further, and a shotgun blast from close up hits harder still.
export const SHOVE={'light-pistol':{push:80,stagger:.22},'pump-shotgun':{push:58,stagger:.4},kill:1.8,close:{range:70,push:1.6}};
// How much a shot and a reload slow you down: a little, so you stand and fight but can still back off while you do.
export const SLOW={shot:.9,after:.2,reload:.82};
// The dive: a burst along the way you are going (or aiming, standing still) that costs stamina, puts you on the ground for a
// moment and gets you out from under a bite: one that lands while you are in the air misses. You cannot shoot until you are up.
export const DIVE={speed:390,time:.42,rise:.24,cost:24,cool:.25};
export class Fight{
 constructor(model,{kit,setKit,grid}){Object.assign(this,{model,kit,setKit,grid,traces:[],fields:[],events:[],zombies:[],hp:PLAYER_HP,maxHp:PLAYER_HP,down:0,cooldown:0,reloadTime:0,throwCooldown:0,sinceShot:9,sinceHurt:9,dive:null,diveCool:0,alert:false,wave:-1,seed:1,held:null});
  this.drill={bots:this.zombies,holdout:false,downed:false};this.flow=new Flow();}
 // Sets the street up for where the kit says you are: the cop waiting at the cruiser, the second wave coming, or nothing.
 start(){const k=this.kit();this.snapshot=k;this.hp=PLAYER_HP;this.down=0;this.dive=null;this.diveCool=0;this.alert=false;this.traces=[];this.reloadTime=0;this.cooldown=0;this.held=k.held;this.zombies.length=0;
  if(k.street==='start')this.spawn(0);else if(k.street==='looted'){this.spawn(1);this.alert=true;}else{this.wave=-1;this.zombies.length=0;this.zombies.push(...this.roamers());}}
 // The ones you already put down stay where they fell when the next wave comes.
 spawn(i){this.wave=i;const fell=i>0?this.zombies.filter(z=>z.roam===undefined&&z.hp<=0):[];this.zombies.length=0;this.zombies.push(...fell);for(const s of WAVES[i]){const hp=ZOMBIE.hp[s.look]||60;this.zombies.push({kind:'shambler',look:s.look,x:s.x,y:s.y,sx:s.x,sy:s.y,direction:s.direction??4,frame:0,phase:0,hp,max:hp,idle:!!s.idle,delay:s.delay||0,state:'chase',t:0,vx:0,vy:0,stagger:0,tell:0,cool:0,flash:0,groan:1+this.rand()*2});}
  this.zombies.push(...this.roamers());}
 // The wanderers, back where they started; the ones you put down stay down for the night.
 roamers(){this.fallen??=new Set();const R=this.roamList??=ROAMERS.map((s,i)=>({i,s,z:null}));
  return R.filter(r=>!this.fallen.has(r.i)||r.z).map(r=>{if(this.fallen.has(r.i))return r.z;const s=r.s,hp=ZOMBIE.hp[s.look]||60;
   return r.z=Object.assign(r.z||{},{kind:'shambler',roam:r.i,look:s.look,x:s.x,y:s.y,sx:s.x,sy:s.y,direction:Math.floor(this.rand()*8),frame:0,phase:0,hp,max:hp,idle:false,delay:0,state:'wander',hunt:false,t:0,vx:0,vy:0,stagger:0,tell:0,cool:0,flash:0,groan:2+this.rand()*4,wt:this.rand()*3,wx:s.x,wy:s.y,acc:0,laid:false,fall:0});});}
 rand(){this.seed=(this.seed*1103515245+12345)&0x7fffffff;return this.seed/0x7fffffff;}
 emit(type,o={}){this.events.push({type,...o});}
 drain(){return this.events.splice(0);}
 // A zombie is out once it is past its delay; until then it is somewhere off in the dark.
 out(z){return z.hp>0&&!(z.delay>0&&!z.idle);}
 // The ones the street's story counts: the waves, not the wanderers.
 get live(){return this.zombies.filter(z=>z.roam===undefined&&z.hp>0);}
 // What is coming for you right now and close enough to matter: the waves once they are awake, and wanderers that have seen you.
 threat(r=520){const m=this.model;return this.zombies.filter(z=>this.out(z)&&(z.roam!==undefined?z.hunt:this.alert)&&Math.abs(z.x-m.x)<r&&Math.abs(z.y-m.y)<r);}
 // The gun: what is in your hands, its magazine and its spare rounds (unlimited for a pistol, the bag for the rest).
 get gunId(){return this.kit().held;}
 get gun(){return GUNS[this.gunId]||null;}
 get ammo(){return this.kit().guns[this.gunId]?.ammo??0;}
 get mag(){return this.gun?.mag||0;}
 get reloadFull(){return this.gun?.reload||1;}
 get spare(){const a=ammoOf(this.gunId);return a?count(this.kit().bag,a):Infinity;}
 setAmmo(n,bag){const k=this.kit(),id=this.gunId;this.setKit({...k,guns:{...k.guns,[id]:{...k.guns[id],ammo:n}},...(bag?{bag}:{})});}
 reload(){const g=this.gun;if(!g||this.down||this.reloadTime||this.ammo>=this.mag)return false;if(!this.spare){this.emit('nospare');return false;}this.reloadTime=this.reloadFull;this.emit('reload',{shells:!!g.shells});return true;}
 // A reload step finishes: a shotgun takes one shell from the bag and keeps going; anything else fills the magazine.
 loaded(){const g=this.gun,k=this.kit(),a=ammoOf(this.gunId);
  if(g.shells){if(!count(k.bag,a))return;this.setAmmo(this.ammo+1,remove(k.bag,a,1));this.emit('shell');if(this.ammo<this.mag&&this.spare)this.reloadTime=this.reloadFull;return;}
  const need=this.mag-this.ammo,n=a?Math.min(need,count(k.bag,a)):need;this.setAmmo(this.ammo+n,a?remove(k.bag,a,n):null);this.emit('loaded');}
 fire(){const g=this.gun,m=this.model;if(!g||this.down||this.dive||this.cooldown>0)return false;
  if(this.reloadTime>0){if(!g.shells||!this.ammo)return false;this.reloadTime=0;}
  if(!this.ammo){this.cooldown=.3;this.emit('empty');this.reload();return false;}
  this.setAmmo(this.ammo-1);this.cooldown=g.interval;this.sinceShot=0;this.heard(m.x,m.y);
  const angle=this.aimAngle??m.direction*Math.PI/4,n=g.pellets||1;
  for(let k=0;k<n;k++){const off=n>1?((k/(n-1))-.5)*g.spread+(this.rand()-.5)*g.spread/(n*1.5):(this.rand()-.5)*.025;this.ray(angle+off,g,k>0);}
  this.emit('shot',{gun:this.gunId,angle});return true;}
 // One bullet or pellet along a line: it stops at the first zombie or the first thing tall enough to hide behind.
 ray(angle,g,pellet){const m=this.model,dx=Math.cos(angle),dy=Math.sin(angle),reach=g.range+20,near=this.zombies.filter(z=>this.out(z)&&Math.abs(z.x-m.x)<reach&&Math.abs(z.y-m.y)<reach);let end={x:m.x,y:m.y},onto={kind:'floor'};
  for(let d=6;d<=g.range;d+=3){const x=m.x+dx*d,y=m.y+dy*d;if(x<0||x>MAP.w||y<0||y>MAP.h)break;if(coverAt(x,y)){onto={kind:'prop'};break;}end={x,y};
   const z=near.find(z=>Math.hypot(z.x-x,(z.y-y)*1.2)<12);if(z){this.hit(z,g.damage*(pellet||g.pellets?(d>150?.55:1):1),dx,dy);onto={kind:'zombie',ref:z};break;}}
  const mz=muzzle(angle,this.gunId),dist=Math.hypot(end.x-m.x,end.y-m.y),dur=dist/BULLET_SPEED;
  this.traces.push({x:m.x,y:m.y,ex:end.x,ey:end.y,ox:mz.x,oy:mz.y,age:0,dur,life:dur+.07,col:onto.kind==='zombie'?'#7a1a16':'#b8ab88',onto,done:false,pellet});}
 // A hit: damage, a shove along the shot and a stagger. The shotgun's shove breaks a bite that is winding up.
 hit(z,dmg,dx,dy){const s=SHOVE[this.gunId]||SHOVE['light-pistol'],m=this.model;z.hp=Math.max(0,z.hp-dmg);z.flash=.07;
  const push=s.push*(this.gun?.pellets&&Math.hypot(z.x-m.x,z.y-m.y)<SHOVE.close.range?SHOVE.close.push:1)*(z.hp<=0?SHOVE.kill:1);z.vx+=dx*push;z.vy+=dy*push;z.stagger=Math.max(z.stagger,s.stagger);z.idle=false;if(z.roam!==undefined)z.hunt=true;
  if(z.state==='windup'&&this.gun?.pellets){z.state='chase';z.tell=0;z.cool=.5;}
  if(z.hp<=0){if(z.roam!==undefined)this.fallen.add(z.roam);z.state='dead';z.tell=0;z.frame=0;z._popped=true;z.fall=dx>=0?1:-1;this.emit('kill',{z,dx,dy});this.check();}else this.emit('hit',{z,dx,dy});}
 // In the air in a dive: bites miss.
 get air(){return !!this.dive&&this.dive.t<DIVE.time;}
 // Starts a dive the way you are moving, or the way you aim standing still. Too little stamina and you stumble instead.
 diveFrom(input){const m=this.model,st=m.stamina;if(this.down||this.dive||this.diveCool>0)return false;if(st&&st.value<DIVE.cost*.5){this.emit('winded');return false;}
  let x=Number(input.x)||0,y=Number(input.y)||0,d=Math.hypot(x,y);if(d<.12){const a=this.aimAngle??m.aim??m.direction*Math.PI/4;x=Math.cos(a);y=Math.sin(a);d=1;}
  if(st){st.value=Math.max(0,st.value-DIVE.cost);st.rest=0;}this.dive={t:0,dx:x/d,dy:y/d,landed:false};this.emit('dive',{dx:x/d,dy:y/d});return true;}
 // Flying, landing, getting up. You face the way you dived and your feet stop answering the stick until you are up.
 diving(dt){const v=this.dive,m=this.model,T=DIVE.time;v.t+=dt;const a=Math.atan2(v.dy,v.dx);m.aim=a;m.direction=m.legDir=facing(v.dx,v.dy);m.frame=0;m.moving=false;
  if(v.t<T){const sp=DIVE.speed*Math.pow(1-v.t/T,1.1),step=sp*dt,n=Math.max(1,Math.ceil(step/4));for(let i=0;i<n;i++){const sx=v.dx*step/n,sy=v.dy*step/n;if(!m.blocked(m.x+sx,m.y))m.x+=sx;if(!m.blocked(m.x,m.y+sy))m.y+=sy;}}
  if(!v.landed&&v.t>=T*.55){v.landed=true;this.emit('land',{x:m.x,y:m.y,dx:v.dx,dy:v.dy});}
  if(v.t>=T+DIVE.rise){this.dive=null;this.diveCool=DIVE.cool;}}
 // You, bitten.
 hurt(n,from){if(this.down)return;this.dive=null;this.hp=Math.max(0,this.hp-n);this.sinceHurt=0;const m=this.model,dx=m.x-from.x,dy=m.y-from.y,d=Math.hypot(dx,dy)||1;this.shove={x:dx/d*ZOMBIE.bite.shove,y:dy/d*ZOMBIE.bite.shove};
  this.emit('hurt',{n,hp:this.hp});if(!this.hp){this.down=3;this.reloadTime=0;this.drill.downed=true;this.emit('down');}}
 // The cop turns round and the others come out of the dark.
 wake(){this.alert=true;for(const z of this.zombies)if(z.idle){z.idle=false;this.emit('groan',{z,loud:true});}}
 // A shot: the cop wakes if it is near enough to hear, and so does every wanderer in earshot.
 heard(x,y){if(!this.alert&&this.zombies.some(z=>z.idle&&Math.hypot(z.x-x,z.y-y)<HEAR*2))this.wake();
  for(const z of this.zombies)if(z.roam!==undefined&&z.hp>0&&!z.hunt&&Math.hypot(z.x-x,z.y-y)<HEAR)this.notice(z);}
 // In the beam (set by the scene each frame while your light is on), near enough, and nothing in the way.
 lit(z,d){const b=this.beam;if(!b||d>BEAM_SEEN.range)return false;let off=Math.atan2(z.y-b.y,z.x-b.x)-b.a;off=Math.atan2(Math.sin(off),Math.cos(off));return Math.abs(off)<BEAM_SEEN.half&&clearLine(b.x,b.y,z.x,z.y);}
 notice(z){z.hunt=true;z.state='chase';z.acc=0;if(Math.hypot(z.x-this.model.x,z.y-this.model.y)<ROAM.hear)this.emit('groan',{z,loud:true});}
 check(){if(this.live.length)return;const k=this.kit();if(this.wave===0){this.setKit(advance(k,'cleared'));this.emit('stage',{stage:'cleared'});}else if(this.wave===1){this.setKit(advance(k,'done'));this.emit('stage',{stage:'done'});}this.wave=-1;}
 // Opening the trunk: its boxes go in your bag and the noise brings the second wave.
 search(){const k=this.kit();if(k.street!=='cleared')return false;this.setKit(loot(k,this.grid()));this.snapshot=this.kit();this.spawn(1);this.alert=true;this.emit('stage',{stage:'looted'});return true;}
 // Going down: after a moment you are back on your step, the street as it was when you came out (the same rounds and shells).
 restart(){this.setKit(this.snapshot);this.model.reset();this.start();this.drill.downed=false;this.emit('restart');}
 blockedZ(z,x,y){if(x<WALK.left||x>WALK.right||y<WALK.top||y>WALK.bottom)return true;return !!solidAt(x,y,6);}
 // Moves a zombie, sliding round what is in the way: straight at you if it can, otherwise a little to either side.
 step(z,ax,ay,dist){if(!dist)return 0;for(const turn of [0,.6,-.6,1.2,-1.2]){const c=Math.cos(turn),s=Math.sin(turn),dx=(ax*c-ay*s)*dist,dy=(ax*s+ay*c)*dist,nx=z.x+dx,ny=z.y+dy;if(!this.blockedZ(z,nx,ny)&&!this.touchingPlayer(nx,ny)){z.x=nx;z.y=ny;return dist;}}return 0;}
 touchingPlayer(x,y){const m=this.model;return Math.hypot(x-m.x,(y-m.y)*1.4)<14;}
 update(dt,input={}){dt=clamp(Number(dt)||0,0,.05);const m=this.model,g=this.gun;
  if(this.held!==this.gunId){this.held=this.gunId;this.reloadTime=0;this.cooldown=Math.max(this.cooldown,.35);this.emit('swap');}
  this.cooldown=Math.max(0,this.cooldown-dt);this.sinceShot+=dt;this.sinceHurt+=dt;
  if(this.down){this.down=Math.max(0,this.down-dt);if(!this.down)this.restart();}
  if(this.reloadTime){this.reloadTime=Math.max(0,this.reloadTime-dt);if(!this.reloadTime&&g)this.loaded();}
  // Back on your feet slowly once nothing has touched you for a while.
  if(!this.down&&this.sinceHurt>5)this.hp=Math.min(PLAYER_HP,this.hp+5*dt);
  // You slow down while reloading and for a moment after each shot, so where you stand to shoot matters.
  m.slow=this.dive?0:this.reloadTime?SLOW.reload:this.sinceShot<SLOW.after?SLOW.shot:1;
  if(this.shove){const k=Math.min(1,dt*10);const sx=this.shove.x*k,sy=this.shove.y*k;if(!m.blocked(m.x+sx,m.y))m.x+=sx;if(!m.blocked(m.x,m.y+sy))m.y+=sy;this.shove.x-=sx;this.shove.y-=sy;if(Math.hypot(this.shove.x,this.shove.y)<1)this.shove=null;}
  this.aimAngle=!this.down&&Number.isFinite(input.aimX)&&Number.isFinite(input.aimY)&&Math.hypot(input.aimX,input.aimY)>.1?Math.atan2(input.aimY,input.aimX):null;
  this.diveCool=Math.max(0,this.diveCool-dt);if(input.dive)this.diveFrom(input);if(this.dive)this.diving(dt);
  if(input.fire&&!this.down)this.fire();
  if(!this.alert&&this.zombies.some(z=>z.idle&&Math.hypot(z.x-m.x,z.y-m.y)<NOTICE))this.wake();
  // The way to you, spread again while anything is coming.
  if(this.zombies.some(z=>this.out(z)&&(z.roam!==undefined?z.hunt:this.alert)))this.flow.update(dt,[m]);
  // Near ones every frame; far wanderers that have not seen you, twice a second.
  for(const z of this.zombies){if(z.roam!==undefined&&!z.hunt&&z.hp>0&&Math.abs(z.x-m.x)+Math.abs(z.y-m.y)>ROAM.far){z.acc+=dt;if(z.acc<ROAM.every)continue;this.think(z,z.acc);z.acc=0;}else this.think(z,dt);}
  // They keep a little apart, so a crowd spreads into a line you can see.
  const out=this.zombies.filter(z=>this.out(z)&&Math.abs(z.x-m.x)<600&&Math.abs(z.y-m.y)<600);for(let i=0;i<out.length;i++)for(let j=i+1;j<out.length;j++){const a=out[i],b=out[j],dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy);if(d>0&&d<15){const p=(15-d)/2/d;if(!this.blockedZ(a,a.x-dx*p,a.y-dy*p)){a.x-=dx*p;a.y-=dy*p;}if(!this.blockedZ(b,b.x+dx*p,b.y+dy*p)){b.x+=dx*p;b.y+=dy*p;}}}
  for(const t of this.traces){t.age+=dt;t.life-=dt;if(!t.done&&t.age>=t.dur)t.done=true;}this.traces=this.traces.filter(t=>t.life>0);}
 think(z,dt){const m=this.model,B=ZOMBIE.bite;z.flash=Math.max(0,z.flash-dt);
  // Shoved: slide back along the hit, slowing fast. The dead slide too, a little further, and stop where they hit something.
  if(z.vx||z.vy){const k=Math.exp((z.hp>0?-9:-7)*dt),mx=z.vx*dt,my=z.vy*dt;if(!this.blockedZ(z,z.x+mx,z.y))z.x+=mx;else z.vx*=-.2;if(!this.blockedZ(z,z.x,z.y+my))z.y+=my;else z.vy*=-.2;z.vx*=k;z.vy*=k;if(Math.hypot(z.vx,z.vy)<2)z.vx=z.vy=0;}
  if(z.hp<=0)return;
  if(z.delay>0&&!z.idle){if(this.alert)z.delay-=dt;if(z.delay>0)return;this.emit('groan',{z});}
  z.cool=Math.max(0,z.cool-dt);if(z.stagger>0){z.stagger-=dt;z.frame=0;return;}
  if(z.idle){z.frame=0;return;}
  const dx=m.x-z.x,dy=m.y-z.y,d=Math.hypot(dx,dy)||1;
  z.groan-=dt;if(z.groan<=0){z.groan=2.5+this.rand()*3;if(d<ROAM.hear)this.emit('groan',{z});}
  if(z.roam!==undefined&&!z.hunt){if(!this.down&&(d<NOTICE||this.lit(z,d)))this.notice(z);else{this.wander(z,dt);return;}}
  if(z.roam!==undefined&&d>ROAM.lose){z.hunt=false;z.state='wander';z.sx=z.x;z.sy=z.y;z.wt=0;return;}
  z.direction=facing(dx,dy);
  if(this.down){z.frame=0;return;}
  if(z.state==='windup'){z.t-=dt;z.tell=Math.max(0,z.t);z.frame=0;if(z.t<=0){z.state='chase';z.cool=B.cooldown;z.tell=0;if(d<B.range&&!this.air)this.hurt(B.damage,z);else this.emit('miss',{z});}return;}
  if(d<ZOMBIE.reach+2&&!z.cool){z.state='windup';z.t=B.windup;z.tell=B.windup;this.emit('windup',{z});return;}
  // Shamble toward you; close in, they lurch.
  // Stuck on a fence or a car, it picks a side and walks along it for a moment.
  const speed=(d<ZOMBIE.lurchAt?ZOMBIE.lurch:ZOMBIE.walk)*(z.look==='jogger'?1.25:1),go=Math.min(Math.max(0,d-ZOMBIE.reach+4),speed*dt);let ax=dx/d,ay=dy/d;
  // A clear line: straight at you. Otherwise round whatever is between, by the flow (checked a few times a second).
  if(d>28){z.seeT=(z.seeT||0)-dt;if(z.seeT<=0){z.seeT=.2;z.clear=clearLine(z.x,z.y,m.x,m.y);}if(!z.clear){const w=this.flow.way(z.x,z.y);if(w){ax=w.x;ay=w.y;}}}
  if(z.detour>0){z.detour-=dt;const s=z.side;[ax,ay]=[-ay*s*.9+ax*.1,ax*s*.9+ay*.1];}
  const moved=go?this.step(z,ax,ay,go):0;if(go&&!moved){z.stuck=(z.stuck||0)+dt;if(z.stuck>.35){z.stuck=0;z.side=z.side===1?-1:1;z.detour=.9;}}else z.stuck=0;
  if(moved){z.phase=(z.phase+moved/40)%1;z.frame=1+Math.floor(z.phase*8);}else{z.frame=0;z.phase=0;}}
 // Not seen you yet: stand a while, shuffle somewhere nearby, stand again. Bumping into something just ends the walk.
 wander(z,dt){z.wt-=dt;if(z.wt<=0){const S=ROAM.stroll;z.wx=z.sx+(this.rand()*2-1)*S.x;z.wy=z.sy+(this.rand()*2-1)*S.y;z.wt=4+this.rand()*5;}
  const dx=z.wx-z.x,dy=z.wy-z.y,d=Math.hypot(dx,dy);if(d<4){z.frame=0;z.phase=0;return;}
  const moved=this.step(z,dx/d,dy/d,Math.min(d,ROAM.walk*dt));z.direction=facing(dx,dy);
  if(moved){z.phase=(z.phase+moved/40)%1;z.frame=1+Math.floor(z.phase*8);}else{z.wx=z.x;z.wy=z.y;z.frame=0;z.phase=0;}}
}
