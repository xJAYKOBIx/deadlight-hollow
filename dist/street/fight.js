// The first fight, out on the street. Real guns now: the one in your hands, the rounds in it, and for the shotgun the shells in
// your bag. The feel is Helldivers: few enemies but each one dangerous, guns that shove what they hit, reloads you commit to
// (you move slower while reloading or firing), and bites you can see coming. A zombie about to bite stops and shows a tell;
// step out of reach or knock it back with the shotgun and the bite misses.
// The rest of the neighbourhood is out there too: wanderers in every other block, who drift round their yards until they see you
// or hear a shot, and give up once you are well away. Far from you they are only thought about twice a second.
// It changes the kit (ammo, shells, the street stage) only through the setKit it is given, so the game saves as it goes.
import {GUNS,muzzle} from '../study/equipment.js';
import {count,remove,add} from '../home/bag.js';
import {ammoOf,advance,loot,scavenge,alarmed,DROPS} from '../home/kit.js';
import {MAP,WAVES,ROAMERS,NOTICE,HEAR,WALK,ROADS,CROSSES,solidAt,coverAt} from './data.js';
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
// How the dead come apart, with gore on: a shotgun blast this close cuts one in two, and further out sometimes does; a pistol round
// sometimes takes the head. Half the top halves keep coming.
export const GORE_KILL={near:80,far:140,chance:.4,head:.22,crawl:.5};
// A crawler: the top half of one, or one that lost its legs before tonight. Slow and low; it grabs your ankle instead of biting, which
// hurts less but holds you nearly still for a moment (a dive tears you free). A top half takes a moment to land before it moves.
// Scavenging: a search takes this long standing still (moving, shooting, diving or getting hurt stops it), and a car alarm is heard
// this far. What the dead drop lies where they fell until you walk over it.
export const SEARCH={time:1.1,alarm:900,pick:18};
// Heat: how much noise you have made lately, 0 to 100. Shots, alarms and kills raise it; a while of quiet lets it fall. Once the
// tutorial's fight is over it brings the dead to you: patrols of a few drift through, more often the hotter it is, and at the top
// a horde comes from one side, already hunting. levels are where Stirring, Hunted and Swarming start; patrol is seconds between
// patrols at each level. Extra dead are capped, and the ones well away that have not seen you are let go.
export const HEAT={shot:{'light-pistol':3,'pump-shotgun':6},kill:1,alarm:30,quiet:8,fall:2.5,levels:[0,25,50,80],names:['Quiet','Stirring','Hunted','Swarming'],
 patrol:[90,50,30,20],size:[3,5],horde:{every:45,size:[10,14]},cap:40,spawn:{near:620,far:820},gone:1500,walk:26};
const LOOKS=['neighbour','jogger','robe','worker','neighbour2'];
// Runners: fast and frail. Once they have you they sprint; close in, with a clear line, they crouch for an instant (the tell) and
// leap. Dive or step aside: a leap that misses leaves them sprawled for a moment. A shotgun blast breaks the crouch.
export const RUNNER={hp:40,speed:150,walk:30,lunge:{at:90,tell:.3,speed:340,time:.26,damage:16,range:28,recover:.9,cool:1.4}};
// Brutes: big, slow and hard to put down, and a shotgun barely moves one. With a clear run at you from a distance it sets its feet
// (the tell) and charges in a straight line: dive out of the way. If it runs into something solid it is stunned and takes half as
// much again from every hit. Close in it swings, slowly and hard; both throw you back.
export const BRUTE={hp:420,speed:30,shove:.2,scale:1.45,tellY:116,charge:{min:110,max:330,tell:.6,speed:210,time:1.4,damage:30,knock:220,stun:1.8,cool:4,weak:1.5},swing:{tell:.75,damage:32,range:38,knock:180,cool:1.6}};
export const CRAWLER={hp:25,speed:22,reach:16,windup:.55,damage:9,hold:.9,slow:.3,rise:.6,cool:1.4};
export class Fight{
 constructor(model,{kit,setKit,grid}){Object.assign(this,{model,kit,setKit,grid,traces:[],fields:[],events:[],zombies:[],hp:PLAYER_HP,maxHp:PLAYER_HP,down:0,cooldown:0,reloadTime:0,throwCooldown:0,sinceShot:9,sinceHurt:9,dive:null,diveCool:0,alert:false,wave:-1,seed:1,held:null,grab:0,gore:true,searching:null,drops:[],heat:0,quiet:99,level:0,patrolT:30,hordeT:0});
  this.drill={bots:this.zombies,holdout:false,downed:false};this.flow=new Flow();}
 // Sets the street up for where the kit says you are: the cop waiting at the cruiser, the second wave coming, or nothing.
 start(){const k=this.kit();this.snapshot=k;this.hp=PLAYER_HP;this.down=0;this.dive=null;this.grab=0;this.searching=null;this.drops=[];this.heat=0;this.quiet=99;this.level=0;this.patrolT=30;this.hordeT=0;this.diveCool=0;this.alert=false;this.traces=[];this.reloadTime=0;this.cooldown=0;this.held=k.held;this.zombies.length=0;
  if(k.street==='start')this.spawn(0);else if(k.street==='looted'){this.spawn(1);this.alert=true;}else{this.wave=-1;this.zombies.length=0;this.zombies.push(...this.roamers());}}
 // The ones you already put down stay where they fell when the next wave comes.
 spawn(i){this.wave=i;const fell=i>0?this.zombies.filter(z=>z.roam===undefined&&z.hp<=0):[];this.zombies.length=0;this.zombies.push(...fell);for(const s of WAVES[i]){const kind=s.kind||'shambler',hp=this.hpOf(kind,s.look);this.zombies.push({kind,...(kind==='brute'?{tellY:BRUTE.tellY}:{}),look:s.look,x:s.x,y:s.y,sx:s.x,sy:s.y,direction:s.direction??4,frame:0,phase:0,hp,max:hp,idle:!!s.idle,delay:s.delay||0,state:'chase',t:0,vx:0,vy:0,stagger:0,tell:0,cool:0,flash:0,groan:1+this.rand()*2});}
  this.zombies.push(...this.roamers());}
 // The wanderers, back where they started; the ones you put down stay down for the night.
 roamers(){this.fallen??=new Set();const R=this.roamList??=ROAMERS.map((s,i)=>({i,s,z:null}));
  return R.filter(r=>!this.fallen.has(r.i)||r.z).map(r=>{if(this.fallen.has(r.i))return r.z;const s=r.s,hp=ZOMBIE.hp[s.look]||60;
   return r.z=Object.assign(r.z||{},{kind:'shambler',roam:r.i,look:s.look,x:s.x,y:s.y,sx:s.x,sy:s.y,direction:Math.floor(this.rand()*8),frame:0,phase:0,hp,max:hp,idle:false,delay:0,state:'wander',hunt:false,t:0,vx:0,vy:0,stagger:0,tell:0,cool:0,flash:0,groan:2+this.rand()*4,wt:this.rand()*3,wx:s.x,wy:s.y,acc:0,laid:false,fall:0});});}
 // How much one takes, by kind and look.
 hpOf(kind,look){return kind==='crawler'?CRAWLER.hp:kind==='runner'?RUNNER.hp:kind==='brute'?BRUTE.hp:ZOMBIE.hp[look]||60;}
 rand(){this.seed=(this.seed*1103515245+12345)&0x7fffffff;return this.seed/0x7fffffff;}
 emit(type,o={}){this.events.push({type,...o});}
 drain(){return this.events.splice(0);}
 // A zombie is out once it is past its delay; until then it is somewhere off in the dark.
 out(z){return z.hp>0&&!(z.delay>0&&!z.idle)&&!(z.hatch>0);}
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
  this.setAmmo(this.ammo-1);this.cooldown=g.interval;this.sinceShot=0;this.heard(m.x,m.y);this.noise(HEAT.shot[this.gunId]||4);
  const angle=this.aimAngle??m.direction*Math.PI/4,n=g.pellets||1;
  for(let k=0;k<n;k++){const off=n>1?((k/(n-1))-.5)*g.spread+(this.rand()-.5)*g.spread/(n*1.5):(this.rand()-.5)*.025;this.ray(angle+off,g,k>0);}
  this.emit('shot',{gun:this.gunId,angle});return true;}
 // One bullet or pellet along a line: it stops at the first zombie or the first thing tall enough to hide behind.
 ray(angle,g,pellet){const m=this.model,dx=Math.cos(angle),dy=Math.sin(angle),reach=g.range+20,near=this.zombies.filter(z=>this.out(z)&&Math.abs(z.x-m.x)<reach&&Math.abs(z.y-m.y)<reach);let end={x:m.x,y:m.y},onto={kind:'floor'};
  for(let d=6;d<=g.range;d+=3){const x=m.x+dx*d,y=m.y+dy*d;if(x<0||x>MAP.w||y<0||y>MAP.h)break;if(coverAt(x,y)){onto={kind:'prop'};break;}end={x,y};
   const z=near.find(z=>Math.hypot(z.x-x,(z.y-y)*1.2)<(z.kind==='brute'?17:12));if(z){this.hit(z,g.damage*(pellet||g.pellets?(d>150?.55:1):1),dx,dy);onto={kind:'zombie',ref:z};break;}}
  const mz=muzzle(angle,this.gunId),dist=Math.hypot(end.x-m.x,end.y-m.y),dur=dist/BULLET_SPEED;
  this.traces.push({x:m.x,y:m.y,ex:end.x,ey:end.y,ox:mz.x,oy:mz.y,age:0,dur,life:dur+.07,col:onto.kind==='zombie'?'#7a1a16':'#b8ab88',onto,done:false,pellet});}
 // A hit: damage, a shove along the shot and a stagger. The shotgun's shove breaks a bite that is winding up.
 hit(z,dmg,dx,dy){const s=SHOVE[this.gunId]||SHOVE['light-pistol'],m=this.model,big=z.kind==='brute';if(big&&z.stun>0)dmg*=BRUTE.charge.weak;z.hp=Math.max(0,z.hp-dmg);z.flash=.07;
  const push=s.push*(this.gun?.pellets&&Math.hypot(z.x-m.x,z.y-m.y)<SHOVE.close.range?SHOVE.close.push:1)*(z.hp<=0?SHOVE.kill:1)*(big?BRUTE.shove:1);z.vx+=dx*push;z.vy+=dy*push;if(!big)z.stagger=Math.max(z.stagger,s.stagger);z.idle=false;if(z.roam!==undefined)z.hunt=true;
  if((z.state==='windup'||z.state==='crouch')&&this.gun?.pellets&&!big){z.state='chase';z.tell=0;z.cool=.5;}
  if(z.hp<=0){if(z.roam!==undefined)this.fallen.add(z.roam);z.state='dead';z.tell=0;z.frame=0;z._popped=true;z.fall=dx>=0?1:-1;
   this.drop(z,dx,dy);this.noise(HEAT.kill);const gore=z.gore=this.goreOf(z),crawler=gore==='half'&&this.rand()<GORE_KILL.crawl?this.crawler(z,dx,dy):null;this.emit('kill',{z,dx,dy,gore,crawler});this.check();}else this.emit('hit',{z,dx,dy});}
 // Noise raises the heat and resets the quiet.
 noise(n){this.heat=Math.min(100,this.heat+n);this.quiet=0;}
 // Sometimes something falls out of a pocket.
 drop(z,dx,dy){if(z.kind==='crawler')return;for(const [id,p,a,b] of DROPS[z.look]||DROPS.any)if(this.rand()<p){this.drops.push({id,n:a+Math.floor(this.rand()*(b-a+1)),x:z.x+dx*10+(this.rand()-.5)*8,y:z.y+dy*6+(this.rand()-.5)*6,age:0});return;}}
 // Starts searching a spot; the search finishes in update, if you stay put.
 scavenge(t){if(this.down||this.dive||this.searching||!t?.loot||this.kit().looted?.includes(t.id))return false;this.searching={t,time:0};this.emit('search',{t});return true;}
 // A car alarm: every wanderer in earshot comes to see, and keeps coming.
 alarm(x,y){this.emit('alarm',{x,y});this.noise(HEAT.alarm);for(const z of this.zombies)if(z.roam!==undefined&&z.hp>0&&Math.hypot(z.x-x,z.y-y)<SEARCH.alarm)this.notice(z);this.heard(x,y);}
 // What a killing hit does to the body: nothing more, 'half' (in two at the waist) or 'head' (the head comes off).
 goreOf(z){if(!this.gore||z.kind==='crawler'||z.kind==='brute')return null;const m=this.model,d=Math.hypot(z.x-m.x,z.y-m.y),G=GORE_KILL;
  if(this.gun?.pellets)return d<G.near||d<G.far&&this.rand()<G.chance?'half':null;return this.rand()<G.head?'head':null;}
 // The top half lands a little way along the shot and starts to crawl. It counts as one of the wave it came from.
 crawler(z,dx,dy){let x=z.x,y=z.y;for(const t of [28,20,12])if(!this.blockedZ(z,z.x+dx*t,z.y+dy*t*.7)){x=z.x+dx*t;y=z.y+dy*t*.7;break;}
  const c={kind:'crawler',look:z.look,x,y,sx:x,sy:y,from:{x:z.x,y:z.y},direction:facing(-dx,-dy),frame:0,phase:0,hp:CRAWLER.hp,max:CRAWLER.hp,idle:false,delay:0,hatch:CRAWLER.rise,state:'chase',t:0,vx:0,vy:0,stagger:0,tell:0,cool:.4,flash:0,groan:1.5,
   ...(z.roam!==undefined?{roam:-1,hunt:true,acc:0,sx:x,sy:y,wt:0,wx:x,wy:y}:{})};this.zombies.push(c);return c;}
 // In the air in a dive: bites miss.
 get air(){return !!this.dive&&this.dive.t<DIVE.time;}
 // Starts a dive the way you are moving, or the way you aim standing still. Too little stamina and you stumble instead.
 diveFrom(input){const m=this.model,st=m.stamina;if(this.down||this.dive||this.diveCool>0)return false;if(st&&st.value<DIVE.cost*.5){this.emit('winded');return false;}
  let x=Number(input.x)||0,y=Number(input.y)||0,d=Math.hypot(x,y);if(d<.12){const a=this.aimAngle??m.aim??m.direction*Math.PI/4;x=Math.cos(a);y=Math.sin(a);d=1;}
  if(st){st.value=Math.max(0,st.value-DIVE.cost);st.rest=0;}if(this.grab){this.grab=0;this.emit('free');}this.dive={t:0,dx:x/d,dy:y/d,landed:false};this.emit('dive',{dx:x/d,dy:y/d});return true;}
 // Flying, landing, getting up. You face the way you dived and your feet stop answering the stick until you are up.
 diving(dt){const v=this.dive,m=this.model,T=DIVE.time;v.t+=dt;const a=Math.atan2(v.dy,v.dx);m.aim=a;m.direction=m.legDir=facing(v.dx,v.dy);m.frame=0;m.moving=false;
  if(v.t<T){const sp=DIVE.speed*Math.pow(1-v.t/T,1.1),step=sp*dt,n=Math.max(1,Math.ceil(step/4));for(let i=0;i<n;i++){const sx=v.dx*step/n,sy=v.dy*step/n;if(!m.blocked(m.x+sx,m.y))m.x+=sx;if(!m.blocked(m.x,m.y+sy))m.y+=sy;}}
  if(!v.landed&&v.t>=T*.55){v.landed=true;this.emit('land',{x:m.x,y:m.y,dx:v.dx,dy:v.dy});}
  if(v.t>=T+DIVE.rise){this.dive=null;this.diveCool=DIVE.cool;}}
 // You, bitten.
 hurt(n,from,shove=true){if(this.down)return;this.dive=null;if(this.searching){this.searching=null;this.emit('searchstop');}this.hp=Math.max(0,this.hp-n);this.sinceHurt=0;const m=this.model,dx=m.x-from.x,dy=m.y-from.y,d=Math.hypot(dx,dy)||1;if(shove)this.shove={x:dx/d*ZOMBIE.bite.shove,y:dy/d*ZOMBIE.bite.shove};
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
  this.grab=Math.max(0,this.grab-dt);m.slow=this.dive?0:this.grab?CRAWLER.slow:this.reloadTime?SLOW.reload:this.sinceShot<SLOW.after?SLOW.shot:1;
  if(this.shove){const k=Math.min(1,dt*10);const sx=this.shove.x*k,sy=this.shove.y*k;if(!m.blocked(m.x+sx,m.y))m.x+=sx;if(!m.blocked(m.x,m.y+sy))m.y+=sy;this.shove.x-=sx;this.shove.y-=sy;if(Math.hypot(this.shove.x,this.shove.y)<1)this.shove=null;}
  this.aimAngle=!this.down&&Number.isFinite(input.aimX)&&Number.isFinite(input.aimY)&&Math.hypot(input.aimX,input.aimY)>.1?Math.atan2(input.aimY,input.aimX):null;
  this.diveCool=Math.max(0,this.diveCool-dt);if(input.dive)this.diveFrom(input);if(this.dive)this.diving(dt);
  if(input.fire&&!this.down)this.fire();
  // A search under way: stop if you move, shoot or dive; otherwise, once it is done, what was there goes in your bag.
  const S=this.searching;if(S){if(Math.hypot(Number(input.x)||0,Number(input.y)||0)>.25||input.fire||this.dive||this.down){this.searching=null;this.emit('searchstop');}
   else if((S.time+=dt)>=SEARCH.time){this.searching=null;const r=scavenge(this.kit(),S.t,this.grid()),alarm=alarmed(S.t);this.setKit(r.k);this.emit('found',{t:S.t,items:r.items,alarm});if(alarm)this.alarm(S.t.x,S.t.y);}}
  // The heat cools once it has been quiet a while; out on a quiet street, it sends patrols, and at the top, hordes.
  this.quiet+=dt;if(this.quiet>HEAT.quiet)this.heat=Math.max(0,this.heat-HEAT.fall*dt);const lv=HEAT.levels.filter(v=>this.heat>=v).length-1;if(lv!==this.level){const up=lv>this.level;this.level=lv;this.emit('heat',{level:lv,up});if(up&&lv===3)this.hordeT=Math.min(this.hordeT,4);}
  if(this.kit().street==='done'&&!this.down){if((this.patrolT-=dt)<=0){this.patrolT=HEAT.patrol[this.level]*(.8+this.rand()*.4);this.patrol(false);}if(this.level===3&&(this.hordeT-=dt)<=0){this.hordeT=HEAT.horde.every;this.patrol(true);}}
  // Extra dead well away from you that are not after you are let go, and so are their bodies.
  if(this.zombies.some(z=>z.extra&&(z.hp<=0||!z.hunt)&&Math.hypot(z.x-m.x,z.y-m.y)>HEAT.gone)){const keep=this.zombies.filter(z=>!(z.extra&&(z.hp<=0||!z.hunt)&&Math.hypot(z.x-m.x,z.y-m.y)>HEAT.gone));this.zombies.length=0;this.zombies.push(...keep);}
  // Walking over something the dead dropped picks it up.
  for(const d of this.drops){d.age+=dt;if(Math.hypot(d.x-m.x,(d.y-m.y)*1.3)<SEARCH.pick){const k=this.kit();this.setKit({...k,bag:add(k.bag,this.grid(),d.id,d.n)});d.taken=true;this.emit('pickup',{id:d.id,n:d.n});}}
  if(this.drops.some(d=>d.taken))this.drops=this.drops.filter(d=>!d.taken);
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
  if(z.delay>0&&!z.idle){if(this.alert||z.extra)z.delay-=dt;if(z.delay>0)return;this.emit('groan',{z});}
  if(z.kind==='crawler')return this.crawl(z,dt);
  z.cool=Math.max(0,z.cool-dt);if(z.stagger>0){z.stagger-=dt;z.frame=0;return;}
  if(z.idle){z.frame=0;return;}
  const dx=m.x-z.x,dy=m.y-z.y,d=Math.hypot(dx,dy)||1;
  z.groan-=dt;if(z.groan<=0){z.groan=2.5+this.rand()*3;if(d<ROAM.hear)this.emit('groan',{z});}
  if(z.roam!==undefined&&!z.hunt){if(!this.down&&(d<NOTICE||this.lit(z,d)))this.notice(z);else{this.wander(z,dt);return;}}
  if(z.roam!==undefined&&d>ROAM.lose){z.hunt=false;z.state='wander';z.sx=z.x;z.sy=z.y;z.wt=0;return;}
  z.direction=facing(dx,dy);
  if(this.down){z.frame=0;return;}
  if(z.kind==='brute')return this.brute(z,dt,d,dx,dy);
  if(z.state==='windup'){z.t-=dt;z.tell=Math.max(0,z.t);z.frame=0;if(z.t<=0){z.state='chase';z.cool=B.cooldown;z.tell=0;if(d<B.range&&!this.air)this.hurt(B.damage,z);else this.emit('miss',{z});}return;}
  if(z.kind==='runner'&&this.runner(z,dt,d,dx,dy))return;
  if(d<ZOMBIE.reach+2&&!z.cool){z.state='windup';z.t=B.windup;z.tell=B.windup;this.emit('windup',{z});return;}
  if(z.kind==='runner'){this.chase(z,dt,Math.min(Math.max(0,d-ZOMBIE.reach+4),RUNNER.speed*dt),d,dx,dy,70);return;}
  // Shamble toward you; close in, they lurch.
  // Stuck on a fence or a car, it picks a side and walks along it for a moment.
  const speed=(d<ZOMBIE.lurchAt?ZOMBIE.lurch:ZOMBIE.walk)*(z.look==='jogger'?1.25:1);this.chase(z,dt,Math.min(Math.max(0,d-ZOMBIE.reach+4),speed*dt),d,dx,dy);}
 // Moving at you by go this step: straight, or round what is between by the flow, sidestepping when stuck. stride is how far one
 // walk cycle carries it.
 chase(z,dt,go,d,dx,dy,stride=40){const m=this.model;let ax=dx/d,ay=dy/d;
  // A clear line: straight at you. Otherwise round whatever is between, by the flow (checked a few times a second).
  if(d>28){z.seeT=(z.seeT||0)-dt;if(z.seeT<=0){z.seeT=.2;z.clear=clearLine(z.x,z.y,m.x,m.y);}if(!z.clear){const w=this.flow.way(z.x,z.y);if(w){ax=w.x;ay=w.y;}}}
  if(z.detour>0){z.detour-=dt;const s=z.side;[ax,ay]=[-ay*s*.9+ax*.1,ax*s*.9+ay*.1];}
  const moved=go?this.step(z,ax,ay,go):0;if(go&&!moved){z.stuck=(z.stuck||0)+dt;if(z.stuck>.35){z.stuck=0;z.side=z.side===1?-1:1;z.detour=.9;}}else z.stuck=0;
  if(moved){z.phase=(z.phase+moved/stride)%1;z.frame=1+Math.floor(z.phase*8);}else{z.frame=0;z.phase=0;}return moved;}
 // A runner: the crouch, the leap, and the sprawl after a miss. Returns true while it is busy with one.
 runner(z,dt,d,dx,dy){const L=RUNNER.lunge,m=this.model;
  if(z.state==='crouch'){z.t-=dt;z.tell=Math.max(0,z.t);z.frame=0;if(z.t<=0){z.state='leap';z.t=L.time;z.tell=0;z.hitDone=false;this.emit('lunge',{z});}return true;}
  if(z.state==='leap'){z.t-=dt;const s=L.speed*dt;for(let i=0;i<3;i++){const nx=z.x+z.lx*s/3,ny=z.y+z.ly*s/3;if(this.blockedZ(z,nx,ny))break;z.x=nx;z.y=ny;}z.frame=3;z.direction=facing(z.lx,z.ly);
   if(!z.hitDone&&Math.hypot(m.x-z.x,(m.y-z.y)*1.2)<L.range&&!this.air){z.hitDone=true;this.hurt(L.damage,z);}
   if(z.t<=0){z.state='chase';z.cool=L.cool;if(!z.hitDone){z.stagger=L.recover;this.emit('miss',{z});}}return true;}
  if((z.hunt||z.roam===undefined)&&d<L.at&&d>26&&!z.cool&&clearLine(z.x,z.y,m.x,m.y)){z.state='crouch';z.t=L.tell;z.tell=L.tell;z.lx=dx/d;z.ly=dy/d;this.emit('windup',{z});return true;}
  return false;}
 // A brute: setting its feet and charging, stunned against a wall, the slow swing, and the plod in between.
 brute(z,dt,d,dx,dy){const B=BRUTE,C=B.charge,S=B.swing,m=this.model;z.stagger=0;if(z.stun>0){z.stun-=dt;z.frame=0;return;}z.ccool=Math.max(0,(z.ccool||0)-dt);
  if(z.state==='set'){z.t-=dt;z.tell=Math.max(0,z.t);z.frame=0;if(z.t<=0){z.state='charge';z.t=C.time;z.tell=0;z.hitDone=false;this.emit('charge',{z});}return;}
  if(z.state==='charge'){z.t-=dt;const s=C.speed*dt;let wall=false;for(let i=0;i<4;i++){const nx=z.x+z.cx*s/4,ny=z.y+z.cy*s/4;if(this.blockedZ(z,nx,ny)){wall=true;break;}z.x=nx;z.y=ny;}
   z.direction=facing(z.cx,z.cy);z.phase=(z.phase+s/60)%1;z.frame=1+Math.floor(z.phase*8);
   if(!z.hitDone&&Math.hypot(m.x-z.x,(m.y-z.y)*1.2)<28&&!this.air){z.hitDone=true;this.hurt(C.damage,z);this.knock(z,C.knock);}
   if(wall){z.state='chase';z.stun=C.stun;z.ccool=C.cool;this.emit('stun',{z});}else if(z.t<=0){z.state='chase';z.ccool=C.cool;}return;}
  if(z.state==='windup'){z.t-=dt;z.tell=Math.max(0,z.t);z.frame=0;if(z.t<=0){z.state='chase';z.cool=S.cool;z.tell=0;if(d<S.range+8&&!this.air){this.hurt(S.damage,z);this.knock(z,S.knock);}else this.emit('miss',{z});}return;}
  if(!z.ccool&&d>C.min&&d<C.max&&clearLine(z.x,z.y,m.x,m.y)){z.state='set';z.t=C.tell;z.tell=C.tell;z.cx=dx/d;z.cy=dy/d;this.emit('windup',{z,big:true});return;}
  if(d<S.range&&!z.cool){z.state='windup';z.t=S.tell;z.tell=S.tell;this.emit('windup',{z,big:true});return;}
  this.chase(z,dt,Math.min(Math.max(0,d-S.range+10),B.speed*dt),d,dx,dy,55);}
 // Thrown back from a heavy hit.
 knock(z,n){const m=this.model,dx=m.x-z.x,dy=m.y-z.y,d=Math.hypot(dx,dy)||1;this.shove={x:dx/d*n,y:dy/d*n};}
 // A crawler drags itself at you, round what is in the way, and reaches for your ankle.
 crawl(z,dt){const m=this.model,C=CRAWLER;if(z.hatch>0){z.hatch-=dt;return;}z.cool=Math.max(0,z.cool-dt);if(z.stagger>0){z.stagger-=dt;return;}
  const dx=m.x-z.x,dy=m.y-z.y,d=Math.hypot(dx,dy)||1;if(d>ROAM.lose||this.down){z.frame=0;return;}if(z.roam!==undefined)z.hunt=true;z.direction=facing(dx,dy);
  z.groan-=dt;if(z.groan<=0){z.groan=3+this.rand()*3;if(d<ROAM.hear)this.emit('groan',{z});}
  if(z.state==='windup'){z.t-=dt;z.tell=Math.max(0,z.t);if(z.t<=0){z.state='chase';z.cool=C.cool;z.tell=0;if(d<C.reach+10&&!this.air){this.hurt(C.damage,z,false);if(!this.down){this.grab=C.hold;this.emit('grab',{z});}}else this.emit('miss',{z});}return;}
  if(d<C.reach+4&&!z.cool){z.state='windup';z.t=C.windup;z.tell=C.windup;this.emit('windup',{z});return;}
  let ax=dx/d,ay=dy/d;if(d>28){z.seeT=(z.seeT||0)-dt;if(z.seeT<=0){z.seeT=.25;z.clear=clearLine(z.x,z.y,m.x,m.y);}if(!z.clear){const w=this.flow.way(z.x,z.y);if(w){ax=w.x;ay=w.y;}}}
  const go=Math.min(Math.max(0,d-C.reach),C.speed*dt),moved=go?this.step(z,ax,ay,go):0;if(moved){z.phase=(z.phase+moved/14)%1;z.frame=Math.floor(z.phase*4);}}
 // A patrol: a few of the dead come down a street from somewhere out of sight, heading to where you are now, and pick up on you
 // as wanderers do. A horde is bigger, comes from one side and already knows where you are.
 patrol(horde){const m=this.model,H=HEAT,live=this.zombies.filter(z=>z.extra&&z.hp>0).length,[a,b]=horde?H.horde.size:H.size,n=Math.min(a+Math.floor(this.rand()*(b-a+1)),H.cap-live);if(n<=0)return false;
  let at=null;for(let t=0;t<30&&!at;t++){const ang=this.rand()*Math.PI*2,d=H.spawn.near+this.rand()*(H.spawn.far-H.spawn.near),px=m.x+Math.cos(ang)*d,py=m.y+Math.sin(ang)*d;
   // Onto the nearest street or side street, so they come down a road.
   const rd=ROADS.reduce((q,r)=>Math.abs(r.y+r.h/2-py)<Math.abs(q.y+q.h/2-py)?r:q),cr=CROSSES.reduce((q,c)=>Math.abs(c.x+c.w/2-px)<Math.abs(q.x+q.w/2-px)?c:q);
   const p=Math.abs(rd.y+rd.h/2-py)<Math.abs(cr.x+cr.w/2-px)?{x:px,y:rd.y+rd.h/2,along:'x'}:{x:cr.x+cr.w/2,y:py,along:'y'};
   if(p.x>WALK.left+40&&p.x<WALK.right-40&&p.y>WALK.top+40&&p.y<WALK.bottom-40&&Math.hypot(p.x-m.x,p.y-m.y)>H.spawn.near*.9&&!solidAt(p.x,p.y,10))at=p;}
  if(!at)return false;const goal={x:m.x+(this.rand()-.5)*160,y:m.y+(this.rand()-.5)*100},pts=[at.along==='x'?{x:goal.x,y:at.y}:{x:at.x,y:goal.y},goal];
  const lv=this.level,brute=horde&&lv===3||!horde&&lv>=2&&this.rand()<.15?Math.floor(this.rand()*n):-1;
  for(let i=0;i<n;i++){const kind=i===brute?'brute':this.rand()<[0,.12,.2,.25][lv]?'runner':'shambler',look=kind==='shambler'?LOOKS[Math.floor(this.rand()*LOOKS.length)]:kind,hp=this.hpOf(kind,look),sp=horde?90:30,x=at.x+(this.rand()-.5)*sp+(at.along==='x'?(i%3)*14:0),y=at.y+(this.rand()-.5)*sp*.7+(at.along==='y'?(i%3)*14:0);
   this.zombies.push({kind,...(kind==='brute'?{tellY:BRUTE.tellY}:{}),extra:true,roam:-1,look,x,y,sx:x,sy:y,direction:facing(goal.x-x,goal.y-y),frame:0,phase:0,hp,max:hp,idle:false,delay:i*.35,state:horde?'chase':'wander',hunt:horde,t:0,vx:0,vy:0,stagger:0,tell:0,cool:0,flash:0,groan:1+this.rand()*4,wt:0,wx:x,wy:y,acc:0,
    route:horde?null:pts.map(p=>({x:p.x+(this.rand()-.5)*24,y:p.y+(this.rand()-.5)*16}))});}
  this.emit(horde?'horde':'patrol',{x:at.x,y:at.y,n});return true;}
 // Not seen you yet: stand a while, shuffle somewhere nearby, stand again. Bumping into something just ends the walk.
 wander(z,dt){if(z.route?.length){const p=z.route[0],dx=p.x-z.x,dy=p.y-z.y,d=Math.hypot(dx,dy);if(d<12){z.route.shift();if(!z.route.length){z.sx=z.x;z.sy=z.y;}return;}
   const moved=this.step(z,dx/d,dy/d,Math.min(d,HEAT.walk*dt));z.direction=facing(dx,dy);if(moved){z.phase=(z.phase+moved/40)%1;z.frame=1+Math.floor(z.phase*8);}else{z.stuck=(z.stuck||0)+dt;if(z.stuck>2){z.route=null;z.sx=z.x;z.sy=z.y;}}return;}
  z.wt-=dt;if(z.wt<=0){const S=ROAM.stroll;z.wx=z.sx+(this.rand()*2-1)*S.x;z.wy=z.sy+(this.rand()*2-1)*S.y;z.wt=4+this.rand()*5;}
  const dx=z.wx-z.x,dy=z.wy-z.y,d=Math.hypot(dx,dy);if(d<4){z.frame=0;z.phase=0;return;}
  const moved=this.step(z,dx/d,dy/d,Math.min(d,ROAM.walk*dt));z.direction=facing(dx,dy);
  if(moved){z.phase=(z.phase+moved/40)%1;z.frame=1+Math.floor(z.phase*8);}else{z.wx=z.x;z.wy=z.y;z.frame=0;z.phase=0;}}
}
