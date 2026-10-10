// The first fight, out on the street. Real guns now: the one in your hands, the rounds in it, and for the shotgun the shells in
// your bag. The feel is Helldivers: few enemies but each one dangerous, guns that shove what they hit, reloads you commit to
// (you move slower while reloading or firing), and bites you can see coming. A zombie about to bite stops and shows a tell;
// step out of reach or knock it back with the shotgun and the bite misses.
// It changes the kit (ammo, shells, the street stage) only through the setKit it is given, so the game saves as it goes.
import {GUNS,muzzle} from '../study/equipment.js';
import {count,remove} from '../home/bag.js';
import {ammoOf,advance,loot} from '../home/kit.js';
import {STREET,SOLIDS,WAVES,NOTICE,WALK} from './data.js';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),facing=(dx,dy)=>(Math.round(Math.atan2(dy,dx)/(Math.PI/4))+8)%8;
const inRect=(x,y,r,b)=>{const dx=x-Math.max(b.x,Math.min(x,b.x+b.w)),dy=y-Math.max(b.y,Math.min(y,b.y+b.h));return dx*dx+dy*dy<r*r;};
// Low things (the hydrant, the steps) do not stop a bullet; everything taller does.
const COVER=SOLIDS.filter(o=>o.z>=20);
export const BULLET_SPEED=1600,PLAYER_HP=100;
// The dead: how much they take, how fast they shamble and lurch, and their bite.
export const ZOMBIE={hp:{cop:80,neighbour:60,jogger:55,robe:60,worker:70,neighbour2:60},walk:40,lurch:64,lurchAt:80,reach:24,bite:{windup:.45,damage:14,range:32,cooldown:1.1,shove:70}};
// How hard each gun shoves what it hits, and for how long a hit stops a zombie in its tracks.
const SHOVE={'light-pistol':{push:55,stagger:.16},'pump-shotgun':{push:42,stagger:.32}};
export class Fight{
 constructor(model,{kit,setKit,grid}){Object.assign(this,{model,kit,setKit,grid,traces:[],fields:[],events:[],zombies:[],hp:PLAYER_HP,maxHp:PLAYER_HP,down:0,cooldown:0,reloadTime:0,throwCooldown:0,sinceShot:9,sinceHurt:9,alert:false,wave:-1,seed:1,held:null});
  this.drill={bots:this.zombies,holdout:false,downed:false};}
 // Sets the street up for where the kit says you are: the cop waiting at the cruiser, the second wave coming, or nothing.
 start(){const k=this.kit();this.snapshot=k;this.hp=PLAYER_HP;this.down=0;this.alert=false;this.traces=[];this.reloadTime=0;this.cooldown=0;this.held=k.held;
  if(k.street==='start')this.spawn(0);else if(k.street==='looted'){this.spawn(1);this.alert=true;}else{this.wave=-1;this.zombies.length=0;}}
 spawn(i){this.wave=i;this.zombies.length=0;for(const s of WAVES[i]){const hp=ZOMBIE.hp[s.look]||60;this.zombies.push({kind:'shambler',look:s.look,x:s.x,y:s.y,sx:s.x,sy:s.y,direction:s.direction??4,frame:0,phase:0,hp,max:hp,idle:!!s.idle,delay:s.delay||0,state:'chase',t:0,vx:0,vy:0,stagger:0,tell:0,cool:0,flash:0,groan:1+this.rand()*2});}}
 rand(){this.seed=(this.seed*1103515245+12345)&0x7fffffff;return this.seed/0x7fffffff;}
 emit(type,o={}){this.events.push({type,...o});}
 drain(){return this.events.splice(0);}
 // A zombie is out once it is past its delay; until then it is somewhere off in the dark.
 out(z){return z.hp>0&&!(z.delay>0&&!z.idle);}
 get live(){return this.zombies.filter(z=>z.hp>0);}
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
 fire(){const g=this.gun,m=this.model;if(!g||this.down||this.cooldown>0)return false;
  if(this.reloadTime>0){if(!g.shells||!this.ammo)return false;this.reloadTime=0;}
  if(!this.ammo){this.cooldown=.3;this.emit('empty');this.reload();return false;}
  this.setAmmo(this.ammo-1);this.cooldown=g.interval;this.sinceShot=0;if(!this.alert)this.wake();
  const angle=this.aimAngle??m.direction*Math.PI/4,n=g.pellets||1;
  for(let k=0;k<n;k++){const off=n>1?((k/(n-1))-.5)*g.spread+(this.rand()-.5)*g.spread/(n*1.5):(this.rand()-.5)*.025;this.ray(angle+off,g,k>0);}
  this.emit('shot',{gun:this.gunId,angle});return true;}
 // One bullet or pellet along a line: it stops at the first zombie or the first thing tall enough to hide behind.
 ray(angle,g,pellet){const m=this.model,dx=Math.cos(angle),dy=Math.sin(angle);let end={x:m.x,y:m.y},onto={kind:'floor'};
  for(let d=6;d<=g.range;d+=3){const x=m.x+dx*d,y=m.y+dy*d;if(x<0||x>STREET.w||y<0||y>STREET.h)break;if(COVER.some(b=>x>=b.x&&x<=b.x+b.w&&y>=b.y&&y<=b.y+b.h)){onto={kind:'prop'};break;}end={x,y};
   const z=this.zombies.find(z=>this.out(z)&&Math.hypot(z.x-x,(z.y-y)*1.2)<12);if(z){this.hit(z,g.damage*(pellet||g.pellets?(d>150?.55:1):1),dx,dy);onto={kind:'zombie',ref:z};break;}}
  const mz=muzzle(angle,this.gunId),dist=Math.hypot(end.x-m.x,end.y-m.y),dur=dist/BULLET_SPEED;
  this.traces.push({x:m.x,y:m.y,ex:end.x,ey:end.y,ox:mz.x,oy:mz.y,age:0,dur,life:dur+.07,col:onto.kind==='zombie'?'#7a1a16':'#b8ab88',onto,done:false,pellet});}
 // A hit: damage, a shove along the shot and a stagger. The shotgun's shove breaks a bite that is winding up.
 hit(z,dmg,dx,dy){const s=SHOVE[this.gunId]||SHOVE['light-pistol'];z.hp=Math.max(0,z.hp-dmg);z.flash=.08;z.vx+=dx*s.push;z.vy+=dy*s.push;z.stagger=Math.max(z.stagger,s.stagger);z.idle=false;
  if(z.state==='windup'&&this.gun?.pellets){z.state='chase';z.tell=0;z.cool=.5;}
  if(z.hp<=0){z.state='dead';z.tell=0;z.frame=0;z._popped=true;z.fall=dx>=0?1:-1;this.emit('kill',{z,dx,dy});this.check();}else this.emit('hit',{z,dx,dy});}
 // You, bitten.
 hurt(n,from){if(this.down)return;this.hp=Math.max(0,this.hp-n);this.sinceHurt=0;const m=this.model,dx=m.x-from.x,dy=m.y-from.y,d=Math.hypot(dx,dy)||1;this.shove={x:dx/d*ZOMBIE.bite.shove,y:dy/d*ZOMBIE.bite.shove};
  this.emit('hurt',{n,hp:this.hp});if(!this.hp){this.down=3;this.reloadTime=0;this.drill.downed=true;this.emit('down');}}
 // The cop turns round and the others come out of the dark.
 wake(){this.alert=true;for(const z of this.zombies)if(z.idle){z.idle=false;this.emit('groan',{z,loud:true});}}
 check(){if(this.live.length)return;const k=this.kit();if(this.wave===0){this.setKit(advance(k,'cleared'));this.emit('stage',{stage:'cleared'});}else if(this.wave===1){this.setKit(advance(k,'done'));this.emit('stage',{stage:'done'});}this.wave=-1;}
 // Opening the trunk: its boxes go in your bag and the noise brings the second wave.
 search(){const k=this.kit();if(k.street!=='cleared')return false;this.setKit(loot(k,this.grid()));this.snapshot=this.kit();this.spawn(1);this.alert=true;this.emit('stage',{stage:'looted'});return true;}
 // Going down: after a moment you are back on your step, the street as it was when you came out (the same rounds and shells).
 restart(){this.setKit(this.snapshot);this.model.reset();this.start();this.drill.downed=false;this.emit('restart');}
 blockedZ(z,x,y){if(x<4||x>STREET.w-4||y<WALK.top||y>STREET.h+30)return true;return SOLIDS.some(b=>inRect(x,y,6,b));}
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
  m.slow=this.reloadTime?.72:this.sinceShot<.3?.8:1;
  if(this.shove){const k=Math.min(1,dt*10);const sx=this.shove.x*k,sy=this.shove.y*k;if(!m.blocked(m.x+sx,m.y))m.x+=sx;if(!m.blocked(m.x,m.y+sy))m.y+=sy;this.shove.x-=sx;this.shove.y-=sy;if(Math.hypot(this.shove.x,this.shove.y)<1)this.shove=null;}
  this.aimAngle=!this.down&&Number.isFinite(input.aimX)&&Number.isFinite(input.aimY)&&Math.hypot(input.aimX,input.aimY)>.1?Math.atan2(input.aimY,input.aimX):null;
  if(input.fire&&!this.down)this.fire();
  if(!this.alert&&this.zombies.some(z=>z.idle&&Math.hypot(z.x-m.x,z.y-m.y)<NOTICE))this.wake();
  for(const z of this.zombies)this.think(z,dt);
  // They keep a little apart, so a crowd spreads into a line you can see.
  const out=this.zombies.filter(z=>this.out(z));for(let i=0;i<out.length;i++)for(let j=i+1;j<out.length;j++){const a=out[i],b=out[j],dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy);if(d>0&&d<15){const p=(15-d)/2/d;if(!this.blockedZ(a,a.x-dx*p,a.y-dy*p)){a.x-=dx*p;a.y-=dy*p;}if(!this.blockedZ(b,b.x+dx*p,b.y+dy*p)){b.x+=dx*p;b.y+=dy*p;}}}
  for(const t of this.traces){t.age+=dt;t.life-=dt;if(!t.done&&t.age>=t.dur)t.done=true;}this.traces=this.traces.filter(t=>t.life>0);}
 think(z,dt){const m=this.model,B=ZOMBIE.bite;z.flash=Math.max(0,z.flash-dt);if(z.hp<=0)return;
  if(z.delay>0&&!z.idle){if(this.alert)z.delay-=dt;if(z.delay>0)return;this.emit('groan',{z});}
  // Shoved: slide back along the hit, slowing fast.
  if(z.vx||z.vy){const k=Math.exp(-9*dt),mx=z.vx*dt,my=z.vy*dt;if(!this.blockedZ(z,z.x+mx,z.y))z.x+=mx;if(!this.blockedZ(z,z.x,z.y+my))z.y+=my;z.vx*=k;z.vy*=k;if(Math.hypot(z.vx,z.vy)<2)z.vx=z.vy=0;}
  z.cool=Math.max(0,z.cool-dt);if(z.stagger>0){z.stagger-=dt;z.frame=0;return;}
  if(z.idle){z.frame=0;return;}
  z.groan-=dt;if(z.groan<=0){z.groan=2.5+this.rand()*3;this.emit('groan',{z});}
  const dx=m.x-z.x,dy=m.y-z.y,d=Math.hypot(dx,dy)||1;z.direction=facing(dx,dy);
  if(this.down){z.frame=0;return;}
  if(z.state==='windup'){z.t-=dt;z.tell=Math.max(0,z.t);z.frame=0;if(z.t<=0){z.state='chase';z.cool=B.cooldown;z.tell=0;if(d<B.range)this.hurt(B.damage,z);else this.emit('miss',{z});}return;}
  if(d<ZOMBIE.reach+2&&!z.cool){z.state='windup';z.t=B.windup;z.tell=B.windup;this.emit('windup',{z});return;}
  // Shamble toward you; close in, they lurch.
  // Stuck on a fence or a car, it picks a side and walks along it for a moment.
  const speed=(d<ZOMBIE.lurchAt?ZOMBIE.lurch:ZOMBIE.walk)*(z.look==='jogger'?1.25:1),go=Math.min(Math.max(0,d-ZOMBIE.reach+4),speed*dt);let ax=dx/d,ay=dy/d;
  if(z.detour>0){z.detour-=dt;const s=z.side;[ax,ay]=[-ay*s*.9+ax*.1,ax*s*.9+ay*.1];}
  const moved=go?this.step(z,ax,ay,go):0;if(go&&!moved){z.stuck=(z.stuck||0)+dt;if(z.stuck>.35){z.stuck=0;z.side=z.side===1?-1:1;z.detour=.9;}}else z.stuck=0;
  if(moved){z.phase=(z.phase+moved/40)%1;z.frame=1+Math.floor(z.phase*8);}else{z.frame=0;z.phase=0;}}
}
