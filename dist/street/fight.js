// The first fight, out on the street. Real guns now: the one in your hands, the rounds in it, and for the shotgun the shells in
// your bag. The feel is Helldivers: few enemies but each one dangerous, guns that shove what they hit, reloads you commit to
// (you move slower while reloading or firing), and bites you can see coming. A zombie about to bite stops and shows a tell;
// step out of reach or knock it back with the shotgun and the bite misses.
// The rest of the neighbourhood is out there too: wanderers in every other block, who drift round their yards until they see you
// or hear a shot, and give up once you are well away. Far from you they are only thought about twice a second.
// It changes the kit (ammo, shells, the street stage) only through the setKit it is given, so the game saves as it goes.
// ghost: nobody is out there (the title screen's backdrop): the dead go about their night and nothing notices, wakes or comes.
import {GUNS,muzzle} from '../study/equipment.js';import {pick,AIM} from '../study/aimstick.js';
import {count,remove,add} from '../home/bag.js';
import {ammoOf,advance,loot,scavenge,alarmed,DROPS,jobsDone,board,reclaim,reclaimed} from '../home/kit.js';
import {MAP,WAVES,ROAMERS,NOTICE,HEAR,WALK,roadNear,EVAC,TRUCK,MOVING,OBJECTS,BREACHES,solidAt,coverAt,vary} from './data.js';
import {Flow,clearLine} from './paths.js';
import {Jobs,CARRY} from './jobs.js';
import {Bell,OP_DROPS} from './op.js';import {MATE} from './mate.js';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),facing=(dx,dy)=>(Math.round(Math.atan2(dy,dx)/(Math.PI/4))+8)%8;
// Wanderers: how far they stroll from where they started and how slowly, when they give up on you, and how far off they stop
// being thought about every frame. Groans only carry so far. A horde (which comes from further off) gives up half as far again away.
// Bodies left in the street: past keep of them, the oldest fade out over fade seconds and are gone, so a long fight does not keep
// every body it ever made (each one is drawn and walked past every frame).
export const BODIES={keep:40,fade:1.5};
export const ROAM={stroll:{x:140,y:80},walk:16,lose:900,far:800,every:.5,hear:600};
// Your flashlight shows you more, and shows you to them: a wanderer the beam falls on sees you from this far.
export const BEAM_SEEN={range:300,half:26*Math.PI/180};
export const BULLET_SPEED=1600,PLAYER_HP=100;
// The dead: how much they take, how fast they shamble and lurch, and their bite.
export const ZOMBIE={hp:{cop:80,neighbour:60,jogger:55,robe:60,worker:70,neighbour2:60},walk:48,lurch:100,lurchAt:110,reach:24,bite:{windup:.36,damage:22,range:32,cooldown:.9,shove:70}};
// A bite that lands takes hold: you are held nearly still for hold seconds and it bites again chew seconds later, until you shove it off,
// put a round in it, or pull free when the hold runs out. A runner's leap that lands pins you (RUNNER). While one has you, the
// others' bites do not throw you clear of it.
export const GRAB={hold:1.1,slow:.15,chew:.6};
// How hard each gun shoves what it hits (per pellet for the shotgun), and for how long a hit stops a zombie in its tracks. A
// killing hit throws the body further, and a shotgun blast from close up hits harder still.
export const SHOVE={'light-pistol':{push:80,stagger:.22},'pump-shotgun':{push:58,stagger:.4},'tactical-ar':{push:44,stagger:.16},kill:1.8,close:{range:70,push:1.6}};
// How much a shot and a reload slow you down: a little, so you stand and fight but can still back off while you do.
export const SLOW={shot:.9,after:.2,reload:.82};
// The shove (it took the dive's place): both hands out the way you aim (or move, or face), costing stamina. Everything in front of you
// within range and half either side of that line is thrown back and staggered, a wind-up, crouch, spit or scream is broken, and a hold
// on you is broken whatever its side. A brute barely moves (brute is how much of the push it takes) and does not stagger. You cannot
// shoot while your hands are out.
export const BASH={cost:14,cool:.55,time:.22,range:50,half:.96,push:230,stagger:.75,brute:.12};
// How the dead come apart, with gore on: a shotgun blast this close cuts one in two, and further out sometimes does; a pistol round
// sometimes takes the head. Half the top halves keep coming.
export const GORE_KILL={near:80,far:140,chance:.4,head:.22,crawl:.5};
// A crawler: the top half of one, or one that lost its legs before tonight. Slow and low; it grabs your ankle instead of biting, which
// hurts less but holds you nearly still for a moment (a shove kicks it off). A top half takes a moment to land before it moves.
// Scavenging: a search takes this long standing still (moving, shooting, shoving or getting hurt stops it), and a car alarm is heard
// this far. What the dead drop lies where they fell until you come near it.
export const SEARCH={time:1.1,alarm:900,pick:18};
// Loot (v0.66): what the dead drop pops out of them, settles for a moment (pop), and then, once you are within reach of it, flies to
// you, starting slow and speeding up (pull, accel) so it always catches you, and goes in your bag at pick.
export const LOOT={pop:.4,reach:60,pull:60,accel:900,max:520};
// Heat: how much noise you have made lately, 0 to 100. Shots, alarms and kills raise it; a while of quiet lets it fall. Once the
// tutorial's fight is over it brings the dead to you: patrols of a few drift through, more often the hotter it is, and at the top
// a horde comes from one side, already hunting. levels are where Stirring, Hunted and Swarming start; patrol is seconds between
// patrols at each level. Extra dead are capped, and the ones well away that have not seen you are let go.
export const HEAT={shot:{'light-pistol':3,'pump-shotgun':6,'tactical-ar':1.5},kill:1,alarm:30,quiet:8,fall:2.5,levels:[0,25,50,80],names:['Quiet','Stirring','Hunted','Swarming'],
 patrol:[90,50,30,20],size:[3,5],horde:{every:45,size:[10,14]},after:40,cap:40,spawn:{near:620,far:820},gone:1500,walk:26};
const LOOKS=['neighbour','jogger','robe','worker','neighbour2'],SPECIALS=new Set(['runner','brute','screamer','bloater','spitter']);
// Runners: fast and frail. Once they have you they sprint; close in, with a clear line, they crouch for an instant (the tell) and
// leap. Step aside: a leap that misses leaves them sprawled for a moment, and one that lands pins you to the ground and mauls you
// every so often until you shove it off or shoot it off; it never lets go on its own. A shotgun blast or a shove breaks the crouch.
// Nearly as fast as you can run, so you cannot simply leave one behind.
export const RUNNER={hp:40,speed:200,walk:30,lunge:{at:115,tell:.3,speed:380,time:.26,damage:22,range:28,recover:.9,cool:1.4,maul:{every:.45,damage:5}}};
// Brutes: big, slow and hard to put down, and a shotgun barely moves one. With a clear run at you from a distance it sets its feet
// (the tell) and charges in a straight line, faster than you run: get out of its line. A charge that catches you carries you along
// in front of it (carry ahead), and slams you into whatever it reaches (slam, and you are dazed a moment), or drops you when it runs
// out. If it runs into something solid it is stunned and takes half as much again from every hit. Close in it swings, slowly and
// hard, and throws you back.
export const BRUTE={hp:420,speed:40,shove:.2,scale:1.45,tellY:116,charge:{min:110,max:330,tell:.6,speed:250,time:1.4,damage:28,slam:24,daze:.7,carry:18,knock:220,stun:1.8,cool:4,weak:1.5},swing:{tell:.75,damage:36,range:38,knock:180,cool:1.6}};
// Climbing: push into a low fence (a picket, a wooden or chain-link fence round a yard) for a moment and you go over it, in a hop
// you cannot shoot from but bites miss. The farm fence round the edge of town is too high. The dead cannot climb; they go round.
export const VAULT={kinds:['picket','woodfence','woodfenceV','chainlink'],push:.18,time:.45,lift:.55};
// The first job: three things to do anywhere in town, in any order (the radio, the generator, the go-bag), then the truck out. Each
// is a chain of steps (street/jobs.js). The generator is loud: once it catches, a horde comes a few seconds later. Calling the
// truck starts the hold-out: hordes from every side until it comes; then it pulls up at the east end with the tailgate down and
// waits for you to get in.
export const JOB={power:{noise:45,horde:5},evac:{hold:60,every:13,heat:85,drive:4.5}};
// The hold-out in the bus lot: the dead come in through its breaches (street/data.js BREACHES) one after another, at these seconds
// into it and then every so often, each called out this long before it gives. What comes through each: runners and shamblers
// through the fence, crawlers up out of the drain, a crowd out of the gym.
// The shot's own pull, for every way of aiming: a miss by less than this bends onto the zombie.
export const MAGNET={cone:5*Math.PI/180};
// A 'special' in a pack is one of the special dead if the director has room for one (SPECIAL.cap), and an ordinary one if not.
export const BREACH={at:[3,13,24,33],every:11,warn:3,packs:{'gap-e':[['shambler',4],['special',1]],drain:[['crawler',5]],gym:[['shambler',7]],'gap-w':[['shambler',5],['special',1]]},specials:{runner:2,spitter:1,bloater:1}};
// The special dead, the Left 4 Dead way: few of them, each one a problem you have to deal with now. Patrols and hordes are only the
// ordinary dead; a director lets one special in on its own every gap seconds or so (sooner the hotter the street is, first after
// first seconds out), from the edge of the dark and already after you, and never while cap of them are after you already. Which one
// is picked by weight (no brute while the street is quiet). Each calls out as it comes and every few seconds while it hunts you,
// each its own sound, so you hear what it is before you see it.
export const SPECIAL={kinds:['runner','brute','screamer','bloater','spitter'],cap:[1,2,2,3],gap:[55,40,30,22],first:25,retry:6,pick:{runner:3,brute:1,screamer:1.5,bloater:2,spitter:2},call:{every:[3.5,6],far:700}};
// Screamers: frail, and they keep their distance. One that sees you with a clear line stops, throws its head back and screams (the
// tell): if it finishes, the heat jumps, every wanderer in range comes, and a horde comes up the road from behind it (behind it,
// horde of them), already hunting. Any hit breaks the scream for a moment; kill it first.
export const SCREAMER={hp:45,speed:34,keep:230,scream:{tell:1.5,heat:30,cool:16,range:520,again:4,behind:180,horde:[8,11]}};
// Bloaters: slow and swollen. Close to you it swells (the tell) and bursts; shot dead it bursts too. The burst throws you back and
// hurts, and leaves a cloud of gas that hangs a while and hurts anything in it, the dead included: shoot one when it is among others.
// Caught in the burst, you are covered: you can hardly see for blind seconds, the dead within call of you smell it and come, and a
// small horde follows. Shoot it before it reaches you.
export const BLOATER={hp:110,speed:26,scale:1.12,tellY:68,swell:{at:36,tell:.8},burst:{radius:64,damage:14,knock:150,dead:30,time:7,every:.5,gas:12,hurt:4,blind:5,call:700,horde:[6,9]}};
// Spitters: they keep their distance and lob acid at where you are going, over fences and cars. Where it will land is marked on
// the ground while it flies: be out of the mark when it lands. The pool it leaves burns for a while and drags at your feet.
export const SPITTER={hp:55,speed:36,keep:[150,280],spit:{tell:.55,flight:.95,cool:3.4,damage:12,radius:22,lead:.55,pool:{time:7,radius:24,every:.5,hurt:8,slow:.6}}};
// The end of the tutorial. In the hold-out the man you started as cannot make it: a while into it the truck is held up and the dead
// come from every side at once (the overrun), their bites land harder, and if he is somehow still standing at the end of it, one of
// them gets him. Going down in the hold-out is the end of him, with no checkpoint. Then, as seen from a window across the street
// (the game draws that): the dead close in and feed, then drift off; he twitches, gets up, and turns toward the window; then the
// picture goes and you make the survivor who was watching. Times are seconds from when he went down. lines are what the watcher says are in story/night1.js (SCRIPT.window).
export const DEATH={overrun:38,ring:[170,300],shamblers:14,runners:4,hurt:1.5,doom:26,feeders:6,
 cine:{leave:6.5,twitch:8.6,rise:10,up:11.4,walk:12.6,end:15.6}};
// Him, after: tougher than most, standing where he got up until you come close or shoot him. Taking your gear back off him is a search.
export const RISEN={hp:150,notice:230,search:2};
export const CRAWLER={hp:25,speed:22,reach:16,windup:.55,damage:11,hold:.9,slow:.3,rise:.6,cool:1.4};
export class Fight{
 constructor(model,{kit,setKit,grid}){Object.assign(this,{model,kit,setKit,grid,traces:[],fields:[],events:[],zombies:[],hp:PLAYER_HP,maxHp:PLAYER_HP,down:0,cooldown:0,reloadTime:0,throwCooldown:0,sinceShot:9,sinceHurt:9,bash:null,bashCool:0,alert:false,wave:-1,seed:1,held:null,grab:0,grabber:null,grabSlow:1,carried:null,daze:0,blind:0,inAcid:false,specialT:SPECIAL.first,gore:true,searching:null,drops:[],heat:0,quiet:99,level:0,patrolT:30,hordeT:0,vault:null,push:0,evac:null,powerT:0,globs:[],pools:[],clouds:[],burnT:0,pv:{x:0,y:0},stats:{kills:0,shots:0,found:0,downs:0,time:0}});
  this.drill={bots:this.zombies,holdout:false,downed:false};this.flow=new Flow();this.jobs=new Jobs(this);this.bell=new Bell(this);}
 // Sets the street up for where the kit says you are: the cop waiting at the cruiser, the second wave coming, or nothing.
 start(){const k=this.kit();this.snapshot=k;this.hp=PLAYER_HP;this.down=0;this.bash=null;this.grab=0;this.grabber=null;this.carried=null;this.daze=0;this.blind=0;this.inAcid=false;this.specialT=SPECIAL.first;this.searching=null;this.drops=[];this.heat=0;this.quiet=99;this.level=0;this.patrolT=30;this.hordeT=0;this.vault=null;this.push=0;this.evac=null;this.powerT=0;this.globs=[];this.pools=[];this.clouds=[];this.burnT=0;MOVING.length=0;this.bashCool=0;this.alert=false;this.traces=[];this.reloadTime=0;this.cooldown=0;this.held=k.held;this.zombies.length=0;
  this.overrun=null;this.dead=null;this.remains=null;this.warn=null;this.opened=new Set(k.phase==='own'?BREACHES.map(b=>b.prop).filter(Boolean):[]);this.torch=k.phase==='own'&&k.corpse&&!k.corpse.taken?this.torch:null;const fromOp=!!this.model.spawn?.op;this.model.spawn=k.phase==='own'&&!fromOp?this.model.spawn:null;if(fromOp)this.model.reset();
  // A different night (or the operation) is a different street: the wanderers you put down are back on their feet.
  if(this.night!==k.phase){this.night=k.phase;this.fallen=new Set();this.roamList=null;}
  this.jobs.start();this.bell.start();if(k.phase==='own'){this.own(k);return;}if(k.phase==='op'){this.wave=-1;this.alert=true;this.zombies.push(...this.roamers());return;}
  if(k.street==='start')this.spawn(0);else if(k.street==='looted'){this.spawn(1);this.alert=true;}else{this.wave=-1;this.zombies.length=0;this.zombies.push(...this.roamers());}}
 // Your own survivor's street: the wanderers, him standing where he got up (until you have your gear back off him), and the truck,
 // held up until then and on its way after.
 own(k){this.wave=-1;this.alert=true;this.zombies.push(...this.roamers());const c=k.corpse;
  if(c&&!c.taken){const b=this.risenAt(c.x,c.y);b.hp=b.max;b.state='chase';b.lurk=true;b.direction=c.dir??2;this.zombies.push(b);this.evac={state:'hold',t:0,h:0,paused:true};}
  else this.evac={state:'drive',t:JOB.evac.drive,h:0};}
 // Him, as one of the dead: whole (he never comes apart, so there is something to search), with his own look.
 risenAt(x,y){return {kind:'risen',look:'you',x,y,sx:x,sy:y,direction:2,frame:0,phase:0,hp:0,max:RISEN.hp,idle:false,delay:0,state:'dead',t:0,vx:0,vy:0,stagger:0,tell:0,cool:0,flash:0,groan:2};}
 // The ones you already put down stay where they fell when the next wave comes.
 spawn(i){this.wave=i;const fell=i>0?this.zombies.filter(z=>z.roam===undefined&&z.hp<=0):[];this.zombies.length=0;this.zombies.push(...fell);for(const s of WAVES[i]){const kind=s.kind||'shambler',hp=this.hpOf(kind,s.look);this.zombies.push({kind,...(kind==='brute'?{tellY:BRUTE.tellY}:{}),look:s.look,x:s.x,y:s.y,sx:s.x,sy:s.y,direction:s.direction??4,frame:0,phase:0,hp,max:hp,idle:!!s.idle,delay:s.delay||0,state:'chase',t:0,vx:0,vy:0,stagger:0,tell:0,cool:0,flash:0,groan:1+this.rand()*2});}
  this.zombies.push(...this.roamers());}
 // The wanderers, back where they started; the ones you put down stay down for the night.
 roamers(){this.fallen??=new Set();const R=this.roamList??=ROAMERS.map((s,i)=>({i,s,z:null}));
  return R.filter(r=>!this.fallen.has(r.i)||r.z).map(r=>{if(this.fallen.has(r.i))return r.z;const s=r.s,kind=s.kind||'shambler',hp=this.hpOf(kind,s.look);
   return r.z=Object.assign(r.z||{},{kind,who:s.who,...(kind==='bloater'?{tellY:BLOATER.tellY}:{}),roam:r.i,look:s.look,x:s.x,y:s.y,sx:s.x,sy:s.y,direction:Math.floor(this.rand()*8),frame:0,phase:0,hp,max:hp,idle:false,delay:0,state:'wander',hunt:false,t:0,vx:0,vy:0,stagger:0,tell:0,cool:0,flash:0,groan:2+this.rand()*4,wt:this.rand()*3,wx:s.x,wy:s.y,acc:0,laid:false,fall:0});});}
 // How much one takes, by kind and look.
 hpOf(kind,look){return {risen:RISEN.hp,crawler:CRAWLER.hp,runner:RUNNER.hp,brute:BRUTE.hp,screamer:SCREAMER.hp,bloater:BLOATER.hp,spitter:SPITTER.hp}[kind]||ZOMBIE.hp[look]||60;}
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
 fire(){const g=this.gun,m=this.model;if(!g||this.down||this.bash||this.vault||this.carried||this.cooldown>0)return false;
  if(this.reloadTime>0){if(!g.shells||!this.ammo)return false;this.reloadTime=0;}
  if(!this.ammo){this.cooldown=.3;this.emit('empty');this.reload();return false;}
  // A gun that takes both hands: whatever you were carrying goes down first.
  if(ammoOf(this.gunId))this.jobs.putDown();
  this.setAmmo(this.ammo-1);this.cooldown=g.interval;this.sinceShot=0;this.stats.shots++;this.heard(m.x,m.y);this.noise(HEAT.shot[this.gunId]||4);
  const angle=this.magnet(this.aimAngle??m.direction*Math.PI/4),n=g.pellets||1;
  for(let k=0;k<n;k++){const off=n>1?((k/(n-1))-.5)*g.spread+(this.rand()-.5)*g.spread/(n*1.5):(this.rand()-.5)*.025;this.ray(angle+off,g,k>0);}
  this.emit('shot',{gun:this.gunId,angle});return true;}
 // One bullet or pellet along a line: it stops at the first zombie or the first thing tall enough to hide behind.
 ray(angle,g,pellet){const m=this.model,L=this.lineOf(angle,g.range),end=L.end,onto=L.onto,dx=Math.cos(angle),dy=Math.sin(angle);
  if(L.z)this.hit(L.z,g.damage*(pellet||g.pellets?(L.d>150?.55:1):1),dx,dy);
  const mz=muzzle(angle,this.gunId),dist=Math.hypot(end.x-m.x,end.y-m.y),dur=dist/BULLET_SPEED;
  this.traces.push({x:m.x,y:m.y,ex:end.x,ey:end.y,ox:mz.x,oy:mz.y,age:0,dur,life:dur+.07,col:onto.kind==='zombie'?'#7a1a16':'#b8ab88',onto,done:false,pellet});}
 // Where a line from you stops, up to range: the first zombie on it or the first cover. The laser and the crosshair show the line at
 // the gun's height, and a standing body is hit where they cross it; a crawler is too low for that, so it is hit wherever the laser
 // crosses it as well as where the line runs under it (its ghost: the crawler moved the gun's height down, square to the line).
 lineOf(angle,range){const m=this.model,dx=Math.cos(angle),dy=Math.sin(angle),h=-muzzle(angle,this.gunId).y-4,gx=-h*dy*dx,gy=h*dx*dx,reach=range+h+20,
   near=this.zombies.filter(z=>this.out(z)&&Math.abs(z.x-m.x)<reach&&Math.abs(z.y-m.y)<reach);let end={x:m.x,y:m.y};
  for(let d=6;d<=range;d+=3){const x=m.x+dx*d,y=m.y+dy*d;if(x<0||x>MAP.w||y<0||y>MAP.h)break;if(coverAt(x,y))return {end,onto:{kind:'prop'},d};end={x,y};
   const z=near.find(z=>Math.hypot(z.x-x,(z.y-y)*1.2)<(z.kind==='brute'?17:12)||z.kind==='crawler'&&Math.hypot(z.x+gx-x,(z.y+gy-y)*1.2)<13);if(z)return {end,onto:{kind:'zombie',ref:z},z,d};}
  return {end,onto:{kind:'floor'},d:range};}
 // Where to point to hit a zombie, as an offset from you: at its feet, or for a crawler at its ghost, so the laser lies across it.
 aimAt(z){const m=this.model,x=z.x-m.x,y=z.y-m.y;if(z.kind!=='crawler')return {x,y,ref:z};const a=Math.atan2(y,x),c=Math.cos(a),s=Math.sin(a),h=-muzzle(a,this.gunId).y-4;return {x:x-h*s*c,y:y+h*c*c,ref:z};}
 // A shot that just misses one of the dead bends onto it: a few degrees at most, whatever you aim with.
 magnet(angle){const g=this.gun;if(!g)return angle;const t=this.zombies.filter(z=>this.out(z)).map(z=>this.aimAt(z));return pick(angle,t,{...AIM,cone:MAGNET.cone,lock:.6,range:g.range}).a;}
 // A hit: damage, a shove along the shot and a stagger. The shotgun's shove breaks a bite that is winding up.
 // by: Aaron's rifle ('mate') or the truck ('truck') rather than your gun.
 hit(z,dmg,dx,dy,by=null){const id=by==='mate'?MATE.gun:this.gunId,g=by?GUNS[id]:this.gun,s=SHOVE[id]||SHOVE['light-pistol'],m=this.model,big=z.kind==='brute';if(big&&z.stun>0)dmg*=BRUTE.charge.weak;z.hp=Math.max(0,z.hp-dmg);z.flash=.07;
  const push=(by==='truck'?260:s.push)*(g?.pellets&&Math.hypot(z.x-m.x,z.y-m.y)<SHOVE.close.range?SHOVE.close.push:1)*(z.hp<=0?SHOVE.kill:1)*(big?BRUTE.shove:1);z.vx+=dx*push;z.vy+=dy*push;if(!big)z.stagger=Math.max(z.stagger,s.stagger);z.idle=false;if(z.roam!==undefined)z.hunt=true;
  if((z.state==='windup'||z.state==='crouch'||z.state==='spit')&&(g?.pellets||by==='truck')&&!big){z.state='chase';z.tell=0;z.cool=.5;}
  if(z.state==='scream'&&z.hp>0){z.state='chase';z.tell=0;z.scool=SCREAMER.scream.again;this.emit('miss',{z});}
  if(z.hp<=0){if(by)this.stats[by]=(this.stats[by]||0)+1;else this.stats.kills++;z.died=this.deaths=(this.deaths||0)+1;if(z.roam!==undefined)this.fallen.add(z.roam);z.state='dead';z.tell=0;z.frame=0;z._popped=true;z.fall=dx>=0?1:-1;
   if(z.kind==='risen'){this.remains={x:z.x,y:z.y};this.emit('fallen',{z});}
   this.drop(z,dx,dy);this.noise(HEAT.kill);if(z.kind==='bloater')this.pop(z);const gore=z.gore=this.goreOf(z),crawler=gore==='half'&&this.rand()<GORE_KILL.crawl?this.crawler(z,dx,dy):null;this.emit('kill',{z,dx,dy,gore,crawler});this.check();}else this.emit('hit',{z,dx,dy});}
 // Too many bodies: the oldest ordinary ones start to fade (never a named one, or him, who the story still needs), and once faded
 // they leave the street; a roamer's body goes from the roamers too, so it is not brought back.
 bodies(dt){let n=0;for(const z of this.zombies)if(z.hp<=0&&!z.who&&z.kind!=='risen'&&!z.gone)n++;
  if(n>BODIES.keep){const old=this.zombies.filter(z=>z.hp<=0&&!z.who&&z.kind!=='risen'&&!z.gone).sort((a,b)=>(a.died||0)-(b.died||0));for(let i=0;i<n-BODIES.keep;i++)old[i].gone=1e-6;}
  let out=false;for(const z of this.zombies)if(z.gone&&z.hp<=0){z.gone=Math.min(1,z.gone+dt/BODIES.fade);if(z.gone>=1)out=true;}else if(z.gone)z.gone=0;
  if(out){for(const z of this.zombies)if(z.gone>=1&&z.roam>=0&&this.roamList?.[z.roam])this.roamList[z.roam].z=null;const keep=this.zombies.filter(z=>!(z.gone>=1));this.zombies.length=0;this.zombies.push(...keep);}}
 // Noise raises the heat and resets the quiet.
 // Noise heats the street up, except while a swarm is on you: what you make fighting it never queues up the next one.
 noise(n){if(!this.swarmLeft())this.heat=Math.min(100,this.heat+n);this.quiet=0;}
 swarmLeft(){let n=0;for(const z of this.zombies)if(z.swarm&&z.hp>0)n++;return n;}
 // Sometimes something falls out of a pocket.
 drop(z,dx,dy){if(z.kind==='crawler'||z.kind==='risen')return;for(const [id,p,a,b] of this.kit().phase==='op'?OP_DROPS:DROPS[z.look]||DROPS[z.kind]||DROPS.any)if(this.rand()<p){this.drops.push({id,n:a+Math.floor(this.rand()*(b-a+1)),x:z.x+dx*10+(this.rand()-.5)*8,y:z.y+dy*6+(this.rand()-.5)*6,age:0});return;}}
 // Starts searching a spot; the search finishes in update, if you stay put.
 scavenge(t){if(this.down||this.vault||this.searching||this.jobs.carry||!t?.loot||this.kit().looted?.includes(t.id))return false;this.searching={t,time:0,need:SEARCH.time};this.emit('search',{t});return true;}
 // A job spot: the radio, the generator, the go-bag, the call for the truck, the truck itself.
 work(t){if(t.remains){if(this.down||this.vault||this.searching||!this.remains)return false;this.searching={t,time:0,need:RISEN.search};this.emit('search',{t});return true;}
  if(t.op)return this.bell.use(t);if(t.use)return this.jobs.use(t);if(this.down||this.vault||this.searching||!this.can(t))return false;
  if(t.job==='evac'){this.call();return true;}if(t.job==='board'){this.setKit(board(this.kit()));this.emit('extract',{stats:{...this.stats}});return true;}return false;}
 // Which job spots can be used now: the three until each is done, then the call, then the truck once it is waiting.
 can(t){if(t.op)return this.bell.can(t);if(t.use)return this.jobs.can(t);const k=this.kit();if(k.phase==='op'||k.street!=='done'||!k.mission||k.mission.out)return false;if(t.job==='evac')return jobsDone(k)&&!this.evac;if(t.job==='board')return this.evac?.state==='wait';return false;}
 // A job finished: from here, going down puts you back on your step with what you have now.
 done(id){const k=this.kit();this.snapshot=this.jobs.safe(k);this.emit('job',{job:id,all:jobsDone(k)});}
 // The generator catches: everything for a mile heard it, and a horde is on its way.
 started(t){this.noise(JOB.power.noise);this.powerT=JOB.power.horde;this.heard(t.x,t.y);this.emit('started',{x:t.x,y:t.y});}
 // The call: the truck is on its way, and everything in town heard the flare.
 call(){this.evac={state:'hold',t:JOB.evac.hold,h:3};this.noise(JOB.evac.heat);this.heard(EVAC.x,EVAC.y);this.emit('evac',{x:EVAC.x,y:EVAC.y});}
 // The hold-out, the truck driving in, and the truck waiting. x is where its back end is while it drives in.
 holding(dt){const v=this.evac,E=JOB.evac;if(v.paused)return;this.heat=Math.max(this.heat,E.heat);this.quiet=0;
  // The tutorial's hold-out: a while in, the overrun; from then the truck is held up, and the end comes for him.
  if(this.kit().phase!=='own'&&v.state==='hold'){v.el=(v.el||0)+dt;if(!this.overrun&&v.el>=DEATH.overrun)this.overrunStart();}
  if(this.overrun){const o=this.overrun;o.t+=dt;if(o.t>=DEATH.doom&&!o.doomed){o.doomed=true;const m=this.model,z=this.zombies.filter(z=>this.out(z)).sort((a,b)=>Math.hypot(a.x-m.x,a.y-m.y)-Math.hypot(b.x-m.x,b.y-m.y))[0];this.hurt(this.hp/DEATH.hurt+1,z||{x:m.x+10,y:m.y});}}
  if(v.state==='hold'){if(!this.overrun){v.t-=dt;this.breaches(v,dt);}if(v.t<=0){v.state='drive';v.t=E.drive;this.emit('truck');}}
  else if(v.state==='drive'){v.t-=dt;if(v.t<=0){v.state='wait';this.park();this.emit('truckin');}}
  v.x=v.state==='drive'?TRUCK.x+(TRUCK.from-TRUCK.x)*Math.pow(Math.max(0,v.t/E.drive),1.6):v.state==='wait'?TRUCK.x:TRUCK.from;}
 // The breaches, in turn: each is called out a moment before it gives, then the dead come through it.
 breaches(v,dt){const B=BREACH,n=B.at.length,i=v.bi||0,at=i<n?B.at[i]:B.at[n-1]+(i-n+1)*B.every,b=BREACHES[i%BREACHES.length];v.bt=(v.bt||0)+dt;
  if(v.bt>=at-B.warn&&this.warn?.b!==b){this.warn={b,at,t:0};this.emit('breaching',{b});}if(this.warn)this.warn.t+=dt;if(v.bt>=at){v.bi=i+1;this.breach(b);}}
 // One gives way: it is painted open, and what was behind it comes for you, already hunting (out of the drain, crawling up first).
 breach(b){if(b.prop)this.opened.add(b.prop);const m=this.model;let k=0;
  for(const [pk,n] of BREACH.packs[b.id]||[])for(let j=0;j<n;j++,k++){const kind=pk!=='special'?pk:this.specialsOn()<SPECIAL.cap[this.level]?this.pickSpecial(BREACH.specials):'shambler',x=b.x+(this.rand()-.5)*(kind==='crawler'?10:50),y=b.y+(this.rand()-.5)*(kind==='crawler'?6:24),look=kind==='shambler'||kind==='crawler'?LOOKS[Math.floor(this.rand()*LOOKS.length)]:vary(kind,this.rand()),hp=this.hpOf(kind,look);
   this.zombies.push({kind,extra:true,roam:-1,look,x,y,sx:x,sy:y,direction:facing(m.x-x,m.y-y),frame:0,phase:0,hp,max:hp,idle:false,delay:k*.45,...(kind==='crawler'?{hatch:CRAWLER.rise}:{}),state:'chase',hunt:true,t:0,vx:0,vy:0,stagger:0,tell:0,cool:0,flash:0,groan:.5+this.rand()*2,wt:0,wx:x,wy:y,acc:0});}
  this.emit('breach',{b,n:k});}
 // The overrun: the dead out of the dark on every side at once, already coming for you, a few of them running.
 overrunStart(){const m=this.model,D=DEATH,n=D.shamblers+D.runners;this.overrun={t:0};
  for(let i=0;i<n;i++){let x=m.x,y=m.y;for(let k=0;k<20;k++){const a=(i/n)*Math.PI*2+(this.rand()-.5)*.5,r=D.ring[0]+this.rand()*(D.ring[1]-D.ring[0]);x=m.x+Math.cos(a)*r;y=m.y+Math.sin(a)*r*.75;if(x>WALK.left+20&&x<WALK.right-20&&y>WALK.top+20&&y<WALK.bottom-20&&!solidAt(x,y,10))break;}
   const kind=i<D.runners?'runner':'shambler',look=kind==='runner'?vary('runner',this.rand()):LOOKS[Math.floor(this.rand()*LOOKS.length)],hp=this.hpOf(kind,look);
   this.zombies.push({kind,extra:true,roam:-1,look,x,y,sx:x,sy:y,direction:facing(m.x-x,m.y-y),frame:0,phase:0,hp,max:hp,idle:false,delay:i*.12,state:'chase',hunt:true,t:0,vx:0,vy:0,stagger:0,tell:0,cool:0,flash:0,groan:.5+this.rand()*2,wt:0,wx:x,wy:y,acc:0});}
  for(const b of BREACHES)if(b.prop)this.opened.add(b.prop);this.warn=null;this.emit('overrun',{n});}
 // He goes down for the last time. His body stays where he fell; the nearest of the dead come to it, the rest wander off.
 die(){const m=this.model;this.down=1e9;this.reloadTime=0;this.bash=null;this.vault=null;this.free();this.carried=null;this.shove=null;if(this.searching){this.searching=null;this.emit('searchstop');}
  const b=this.risenAt(m.x,m.y);b.fall=this.rand()<.5?1:-1;b._pool=true;this.zombies.push(b);
  const a=this.aimAngle??m.aim??m.direction*Math.PI/4;this.torch={x:m.x+Math.cos(a)*10,y:m.y+3,a:a+(this.rand()-.5)*.8};
  // The one watching: whoever is behind the nearest neighbour's door, across the street from him if there is one.
  const doors=OBJECTS.filter(o=>o.id.startsWith('door-')),watch=doors.reduce((q,o)=>{const d=Math.hypot(o.x-m.x,(o.y-m.y)*1.2);return d>80&&d<q.d?{o,d}:q;},{o:doors[0],d:Infinity}).o;
  this.dead={t:0,x:m.x,y:m.y,body:b,watch:{x:watch.x,y:watch.y,id:watch.id}};
  const near=this.zombies.filter(z=>z!==b&&this.out(z)).sort((a,c)=>Math.hypot(a.x-m.x,a.y-m.y)-Math.hypot(c.x-m.x,c.y-m.y));
  near.forEach((z,i)=>{if(i<DEATH.feeders&&Math.hypot(z.x-m.x,z.y-m.y)<320){const a=i/DEATH.feeders*Math.PI*2+.3;z.feed={x:m.x+Math.cos(a)*(15+i%2*5),y:m.y+Math.sin(a)*9};}else z.leave=Math.atan2(z.y-m.y,z.x-m.x);z.state='chase';z.tell=0;});
  this.emit('death',{x:m.x,y:m.y});}
 // The dead while he lies there: the ones feeding go to him and crouch over him; after a while they all drift away from him.
 mourn(z,dt){const D=this.dead,C=DEATH.cine,b=D.body;z.tell=0;
  if(z.feed&&D.t<C.leave){const dx=z.feed.x-z.x,dy=z.feed.y-z.y,d=Math.hypot(dx,dy);if(d>2){const mv=this.step(z,dx/d,dy/d,Math.min(d,ZOMBIE.lurch*dt));z.direction=facing(dx,dy);if(mv){z.phase=(z.phase+mv/40)%1;z.frame=1+Math.floor(z.phase*8);}else z.frame=0;}
   else{z.direction=facing(b.x-z.x,b.y-z.y);z.frame=0;z.feeding=true;}return;}
  z.feeding=false;if(D.t<C.leave&&!z.feed){z.frame=0;return;}const a=z.leave??Math.atan2(z.y-b.y,z.x-b.x)+(z.feed?0:.4);z.leave=a;const mv=this.step(z,Math.cos(a),Math.sin(a),ROAM.walk*1.4*dt);z.direction=facing(Math.cos(a),Math.sin(a));
  if(mv){z.phase=(z.phase+mv/40)%1;z.frame=1+Math.floor(z.phase*8);}else z.frame=0;}
 // His body: still, then a twitch, then up, turned toward the window, and a few steps.
 dying(dt){const D=this.dead,C=DEATH.cine,b=D.body,t=(D.t+=dt);
  b.twitch=t>=C.twitch&&t<C.rise?(Math.floor(t*9)%5===0?1:0):0;
  if(t>=C.rise&&t<C.up)b.rise=(t-C.rise)/(C.up-C.rise);
  else if(t>=C.up&&b.state==='dead'){b.rise=null;b.hp=b.max;b.state='up';b.direction=facing(D.watch.x-b.x,D.watch.y-b.y);b.frame=0;this.emit('groan',{z:b,loud:true});this.emit('rose',{z:b});}
  if(b.state==='up'&&t>=C.walk&&t<C.walk+1.6){const dx=D.watch.x-b.x,dy=D.watch.y-b.y,d=Math.hypot(dx,dy)||1,mv=this.step(b,dx/d,dy/d,ZOMBIE.walk*.5*dt);if(mv){b.phase=(b.phase+mv/40)%1;b.frame=1+Math.floor(b.phase*8);}}else if(b.state==='up')b.frame=0;
  if(t>=C.end&&!D.over){D.over=true;this.emit('watched',{x:b.x,y:b.y});}}
 // You, the one who was watching: out of the door across the street with your own pistol. The dead that fed on him have gone on
 // after the noise; he is still out there, standing where he got up.
 reborn(){const D=this.dead;if(!D)return;const b=D.body,w=D.watch,m=this.model;
  const keep=this.zombies.filter(z=>z===b||z.hp<=0&&!z.extra||z.roam!==undefined&&z.roam>=0);this.zombies.length=0;this.zombies.push(...keep);for(const z of keep){z.feed=null;z.leave=undefined;z.feeding=false;}
  Object.assign(b,{hp:b.max,state:'chase',lurk:true,rise:null,twitch:0,frame:0,sx:b.x,sy:b.y});
  m.spawn={x:w.x,y:w.y,direction:facing(b.x-w.x,b.y-w.y)};m.reset();this.dead=null;this.overrun=null;this.down=0;this.hp=PLAYER_HP;this.drill.downed=false;this.alert=true;this.heat=0;this.level=0;this.quiet=99;this.hordeT=0;this.powerT=0;
  this.evac={state:'hold',t:0,h:0,paused:true};this.snapshot=this.kit();this.held=this.kit().held;this.emit('reborn');}
 // Your gear back off him; and the truck, which was waiting on you, comes in. So does everything that heard you.
 reclaim(){const k=this.kit(),c=k.corpse;if(!c||c.taken)return;this.setKit(reclaim(k,this.grid()));this.snapshot=this.kit();this.remains=null;this.torch=null;this.stats.found++;
  this.emit('reclaimed',{text:reclaimed(c)});this.evac={state:'drive',t:JOB.evac.drive,h:0};this.emit('truck');this.noise(60);this.patrol(true);}
 // Pulled up: the truck is solid, and anything standing where it stopped is pushed out of the way.
 park(){const b={x:TRUCK.x,y:TRUCK.y,w:TRUCK.w,h:TRUCK.h,z:TRUCK.z,see:false,id:'truck',kind:'truck'};MOVING.length=0;MOVING.push(b);
  const m=this.model,inside=(x,y,r)=>x>b.x-r&&x<b.x+b.w+r&&y>b.y-r&&y<b.y+b.h+r;if(inside(m.x,m.y,m.radius))m.y=b.y-m.radius-2;for(const z of this.zombies)if(z.hp>0&&inside(z.x,z.y,8))z.y=z.y<b.y+b.h/2?b.y-10:b.y+b.h+10;}
 // A car alarm: every wanderer in earshot comes to see, and keeps coming.
 alarm(x,y){this.emit('alarm',{x,y});this.noise(HEAT.alarm);for(const z of this.zombies)if(z.roam!==undefined&&z.hp>0&&Math.hypot(z.x-x,z.y-y)<SEARCH.alarm)this.notice(z);this.heard(x,y);}
 // What a killing hit does to the body: nothing more, 'half' (in two at the waist) or 'head' (the head comes off).
 goreOf(z){if(!this.gore||this.gassing||z.who||z.kind==='risen'||z.kind==='crawler'||z.kind==='brute'||z.kind==='bloater')return null;const m=this.model,d=Math.hypot(z.x-m.x,z.y-m.y),G=GORE_KILL;
  if(this.gun?.pellets)return d<G.near||d<G.far&&this.rand()<G.chance?'half':null;return this.rand()<G.head?'head':null;}
 // The top half lands a little way along the shot and starts to crawl. It counts as one of the wave it came from.
 crawler(z,dx,dy){let x=z.x,y=z.y;for(const t of [28,20,12])if(!this.blockedZ(z,z.x+dx*t,z.y+dy*t*.7)){x=z.x+dx*t;y=z.y+dy*t*.7;break;}
  const c={kind:'crawler',look:z.look,x,y,sx:x,sy:y,from:{x:z.x,y:z.y},direction:facing(-dx,-dy),frame:0,phase:0,hp:CRAWLER.hp,max:CRAWLER.hp,idle:false,delay:0,hatch:CRAWLER.rise,state:'chase',t:0,vx:0,vy:0,stagger:0,tell:0,cool:.4,flash:0,groan:1.5,
   ...(z.roam!==undefined?{roam:-1,hunt:true,acc:0,sx:x,sy:y,wt:0,wx:x,wy:y}:{})};this.zombies.push(c);return c;}
 // In the air going over a fence: bites miss.
 get air(){return !!this.vault;}
 // Taken hold of by z for t seconds, held to slow; let go when it ends (free), when z goes down or is staggered, or when you shove.
 hold(z,t,slow=GRAB.slow){if(this.down)return;this.grab=t;this.grabber=z;this.grabSlow=slow;this.emit('grab',{z});}
 free(){if(!this.grab&&!this.grabber)return;const g=this.grabber;if(g?.state==='pin'){g.state='chase';g.cool=RUNNER.lunge.cool;}this.grab=0;this.grabber=null;this.emit('free');}
 // A shove the way you aim, or the way you move, or the way you face. Too little stamina and nothing happens but a gasp, unless
 // something has hold of you: getting it off you always works.
 shoveOut(input){const m=this.model,st=m.stamina,B=BASH;if(this.down||this.bash||this.vault||this.bashCool>0)return false;if(st&&st.value<B.cost*.5&&!this.grabber){this.emit('winded');return false;}
  // Which way: where you aim; else at whatever has hold of you; else the way you move; else at the nearest one in reach; else ahead.
  let x=Number(input.x)||0,y=Number(input.y)||0,a=this.aimAngle;const G=this.grabber,near=()=>{let b=null,bd=B.range+12;for(const z of this.zombies){if(z.hp<=0||!this.out(z))continue;const d=Math.hypot(z.x-m.x,z.y-m.y);if(d<bd){bd=d;b=z;}}return b;};
  if(a==null&&G)a=Math.atan2(G.y-m.y,G.x-m.x);if(a==null&&Math.hypot(x,y)>.12)a=Math.atan2(y,x);if(a==null){const n=near();a=n?Math.atan2(n.y-m.y,n.x-m.x):m.aim??m.direction*Math.PI/4;}x=Math.cos(a);y=Math.sin(a);
  if(st){st.value=Math.max(0,st.value-B.cost);st.rest=0;}this.jobs.putDown();if(this.searching){this.searching=null;this.emit('searchstop');}
  const held=this.grabber;this.free();let n=0;
  for(const z of this.zombies){if(z.hp<=0||!this.out(z)||z.hatch>0)continue;const dx=z.x-m.x,dy=(z.y-m.y),d=Math.hypot(dx,dy*1.2)||1,big=z.kind==='brute';
   let off=Math.atan2(dy,dx)-a;off=Math.atan2(Math.sin(off),Math.cos(off));if(z!==held&&(d>B.range+(big?10:0)||Math.abs(off)>B.half))continue;
   const k=B.push*(big?B.brute:1);z.vx+=dx/d*k;z.vy+=dy/d*k;z.flinch=.12;z.flinchX=dx;n++;if(z.roam!==undefined)z.hunt=true;z.idle=false;
   if(!big){z.stagger=Math.max(z.stagger||0,B.stagger);if(['windup','crouch','spit','scream'].includes(z.state)){z.state='chase';z.tell=0;z.cool=Math.max(z.cool||0,.5);}}}
  this.bash={t:0,a,dx:x,dy:y,n};this.bashCool=B.cool;this.cooldown=Math.max(this.cooldown,B.time);m.aim=a;this.emit('shove',{a,hit:n});return true;}
 // Pushing into a low fence: after a moment, over it, if there is room on the other side. A fence running east-west is climbed
 // north or south, one running north-south east or west.
 climb(dt,input){const m=this.model,x=Number(input.x)||0,y=Number(input.y)||0,d=Math.hypot(x,y);let go=null;
  if(d>.5&&!this.searching&&!this.jobs.carry){const ux=x/d,uy=y/d,s=solidAt(m.x+ux*5,m.y+uy*5,m.radius*.85);if(s&&VAULT.kinds.includes(s.kind)&&!s.id.startsWith('farm')){const across=s.w>=s.h;
   if(across?Math.abs(uy)>.45:Math.abs(ux)>.45){const r=m.radius*.85+2,to=across?{x:m.x,y:uy>0?s.y+s.h+r:s.y-r}:{x:ux>0?s.x+s.w+r:s.x-r,y:m.y};if(!m.blocked(to.x,to.y))go={s,to};}}}
  if(!go||go.s!==this.pushOn){this.push=0;this.pushOn=go?.s||null;return;}
  if((this.push+=dt)<VAULT.push)return;this.push=0;this.pushOn=null;this.vault={t:0,from:{x:m.x,y:m.y},to:go.to,z:go.s.z};if(this.shove)this.shove=null;this.emit('vault',{x:m.x,y:m.y});}
 // Over: a hop along the line, highest in the middle. Where you are in it, 0 to 1, is vault.k; how high, vault.h.
 vaulting(dt){const v=this.vault,m=this.model;v.t+=dt;const k=Math.min(1,v.t/VAULT.time),e=k<.5?2*k*k:1-2*(1-k)*(1-k);m.x=v.from.x+(v.to.x-v.from.x)*e;m.y=v.from.y+(v.to.y-v.from.y)*e;
  v.k=k;v.h=Math.sin(k*Math.PI)*v.z*VAULT.lift;m.moving=false;if(k>=1){this.vault=null;this.emit('over',{x:m.x,y:m.y});}}
 // You, bitten.
 hurt(n,from,shove=true,kind='bite'){if(this.down||this.dead)return;if(this.overrun)n*=DEATH.hurt;if(this.grab)shove=false;this.jobs.bitten();if(this.searching){this.searching=null;this.emit('searchstop');}this.hp=Math.max(0,this.hp-n);this.sinceHurt=0;const m=this.model,dx=m.x-from.x,dy=m.y-from.y,d=Math.hypot(dx,dy)||1;if(shove)this.shove={x:dx/d*ZOMBIE.bite.shove,y:dy/d*ZOMBIE.bite.shove};
  this.emit('hurt',{n,hp:this.hp,kind});if(!this.hp){if(this.kit().phase!=='own'&&this.evac){this.die();return;}this.down=3;this.reloadTime=0;this.free();this.carried=null;this.daze=0;this.drill.downed=true;this.emit('down');}}
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
 restart(){this.stats.downs++;this.setKit(this.snapshot);this.model.reset();this.start();this.drill.downed=false;this.emit('restart');}
 blockedZ(z,x,y){if(x<WALK.left||x>WALK.right||y<WALK.top||y>WALK.bottom)return true;return !!solidAt(x,y,6);}
 // Moves a zombie, sliding round what is in the way: straight at you if it can, otherwise a little to either side.
 step(z,ax,ay,dist){if(!dist)return 0;for(const turn of [0,.6,-.6,1.2,-1.2]){const c=Math.cos(turn),s=Math.sin(turn),dx=(ax*c-ay*s)*dist,dy=(ax*s+ay*c)*dist,nx=z.x+dx,ny=z.y+dy;if(!this.blockedZ(z,nx,ny)&&!this.touchingPlayer(nx,ny)){z.x=nx;z.y=ny;return dist;}}return 0;}
 // Whether you would fit at x, y (the edge of the map and anything solid; the dead do not count).
 walled(x,y){const r=this.model.radius;return x-r<WALK.left||x+r>WALK.right||y-r*.6<WALK.top||y+r*.4>WALK.bottom||!!solidAt(x,y,r*.85);}
 touchingPlayer(x,y){const m=this.model;return Math.hypot(x-m.x,(y-m.y)*1.4)<14;}
 update(dt,input={}){dt=clamp(Number(dt)||0,0,.05);const m=this.model,g=this.gun;if(dt){this.pv={x:(m.x-(this.px??m.x))/dt,y:(m.y-(this.py??m.y))/dt};}this.px=m.x;this.py=m.y;
  if(this.held!==this.gunId){this.held=this.gunId;this.reloadTime=0;this.cooldown=Math.max(this.cooldown,.35);this.emit('swap');}
  this.cooldown=Math.max(0,this.cooldown-dt);this.sinceShot+=dt;this.sinceHurt+=dt;
  // He is gone: only his body and the dead near him move, until you have made the survivor who watched.
  if(this.dead){this.dying(dt);const b=this.dead.body;for(const z of this.zombies)if(z!==b&&Math.abs(z.x-b.x)+Math.abs(z.y-b.y)<900)this.think(z,dt);for(const t of this.traces){t.age+=dt;t.life-=dt;t.done=t.done||t.age>=t.dur;}this.traces=this.traces.filter(t=>t.life>0);return;}
  if(this.down){this.down=Math.max(0,this.down-dt);if(!this.down)this.restart();}
  if(this.reloadTime){this.reloadTime=Math.max(0,this.reloadTime-dt);if(!this.reloadTime&&g)this.loaded();}
  // Back on your feet slowly once nothing has touched you for a while (a few minutes from nearly gone).
  if(!this.down&&this.sinceHurt>8)this.hp=Math.min(PLAYER_HP,this.hp+2*dt);
  // You slow down while reloading and for a moment after each shot, so where you stand to shoot matters.
  if(this.grab&&(this.grab=Math.max(0,this.grab-dt))===0)this.free();if(this.grabber&&(this.grabber.hp<=0||this.grabber.stagger>0))this.free();
  // Carried by a brute's charge, or dazed from the slam: you go where it takes you. Bile in your eyes wears off.
  if(this.carried&&(this.carried.hp<=0||this.carried.state!=='charge'))this.carried=null;this.daze=Math.max(0,this.daze-dt);if(this.blind&&!(this.blind=Math.max(0,this.blind-dt)))this.emit('sight');
  m.slow=(this.vault||this.carried||this.daze?0:this.grab?this.grabSlow:this.reloadTime?SLOW.reload:this.sinceShot<SLOW.after?SLOW.shot:1)*(this.jobs.carry?CARRY.slow:1)*(this.inAcid?SPITTER.spit.pool.slow:1);
  if(this.shove&&!this.vault){const k=Math.min(1,dt*10);const sx=this.shove.x*k,sy=this.shove.y*k;if(!m.blocked(m.x+sx,m.y))m.x+=sx;if(!m.blocked(m.x,m.y+sy))m.y+=sy;this.shove.x-=sx;this.shove.y-=sy;if(Math.hypot(this.shove.x,this.shove.y)<1)this.shove=null;}
  this.aimAngle=!this.down&&Number.isFinite(input.aimX)&&Number.isFinite(input.aimY)&&Math.hypot(input.aimX,input.aimY)>.1?Math.atan2(input.aimY,input.aimX):null;
  this.bashCool=Math.max(0,this.bashCool-dt);if(this.bash&&(this.bash.t+=dt)>=BASH.time)this.bash=null;if(input.shove)this.shoveOut(input);
  if(this.vault)this.vaulting(dt);else if(!this.down)this.climb(dt,input);
  if(input.fire&&!this.down)this.fire();
  // A search under way: stop if you move, shoot or shove; otherwise, once it is done, what was there goes in your bag.
  const S=this.searching;if(S){if(Math.hypot(Number(input.x)||0,Number(input.y)||0)>.25||input.fire||this.down){this.searching=null;this.emit('searchstop');}
   else if((S.time+=dt)>=S.need&&S.t.remains){this.searching=null;this.reclaim();}
   else if(S.time>=S.need&&S.t.op){this.searching=null;this.bell.finish(S.t);}
   else if(S.time>=S.need&&S.t.use){this.searching=null;this.jobs.finish(S.t);}
   else if(S.time>=S.need){this.searching=null;this.stats.found++;const r=scavenge(this.kit(),S.t,this.grid()),alarm=alarmed(S.t);this.setKit(r.k);this.emit('found',{t:S.t,items:r.items,alarm});if(alarm)this.alarm(S.t.x,S.t.y);}}
  this.jobs.update(dt,input);this.bell.update(dt);
  // The heat cools once it has been quiet a while; out on a quiet street, it sends patrols, and at the top, hordes.
  // A swarm cleared: the street drops back to Stirring and the next swarm is a full wait away.
  const sw=this.swarmLeft();if(this.inSwarm&&!sw){this.heat=Math.min(this.heat,HEAT.after);this.quiet=0;this.hordeT=HEAT.horde.every;this.emit('swarm-over',{});}this.inSwarm=sw>0;
  this.quiet+=dt;if(this.quiet>HEAT.quiet)this.heat=Math.max(0,this.heat-HEAT.fall*dt);const lv=HEAT.levels.filter(v=>this.heat>=v).length-1;if(lv!==this.level){const up=lv>this.level;this.level=lv;this.emit('heat',{level:lv,up});if(up&&lv===3)this.hordeT=Math.min(this.hordeT,4);}
  this.hazards(dt);
  // The job: the clock, the generator's horde, the hold-out and the truck.
  const K=this.kit();if(K.street==='done'&&!K.mission?.out){this.stats.time+=dt;if(this.powerT>0&&(this.powerT-=dt)<=0&&!this.down)this.patrol(true);if(this.evac&&!this.down)this.holding(dt);}
  if(this.kit().street==='done'&&!this.down&&!this.kit().mission?.out&&!(this.evac?.state==='hold'&&!this.evac.paused)&&!this.bell.holding){if((this.patrolT-=dt)<=0){this.patrolT=HEAT.patrol[this.level]*(.8+this.rand()*.4);this.patrol(false);}if((this.specialT-=dt)<=0)this.specialT=this.lone()?SPECIAL.gap[this.level]*(.8+this.rand()*.4):SPECIAL.retry;if(this.level===3&&!sw&&(this.hordeT-=dt)<=0){this.hordeT=HEAT.horde.every;this.patrol(true);}}
  // Extra dead well away from you that are not after you are let go, and so are their bodies.
  if(this.zombies.some(z=>z.extra&&(z.hp<=0||!z.hunt)&&Math.hypot(z.x-m.x,z.y-m.y)>HEAT.gone)){const keep=this.zombies.filter(z=>!(z.extra&&(z.hp<=0||!z.hunt)&&Math.hypot(z.x-m.x,z.y-m.y)>HEAT.gone));this.zombies.length=0;this.zombies.push(...keep);}
  this.bodies(dt);
  // Something the dead dropped flies to you once you are near it, and goes in your bag when it reaches you.
  for(const d of this.drops){d.age+=dt;const dx=m.x-d.x,dy=m.y-d.y,far=Math.hypot(dx,dy);
   if(!d.pull&&!this.down&&d.age>=LOOT.pop&&far<LOOT.reach){d.pull=true;d.v=LOOT.pull;}
   if(d.pull&&!this.down&&far>.01){d.v=Math.min(LOOT.max,d.v+LOOT.accel*dt);const s=Math.min(far,d.v*dt);d.x+=dx/far*s;d.y+=dy/far*s;}
   if(Math.hypot(d.x-m.x,(d.y-m.y)*1.3)<SEARCH.pick){const k=this.kit();this.setKit({...k,bag:add(k.bag,this.grid(),d.id,d.n)});d.taken=true;this.emit('pickup',{id:d.id,n:d.n});}}
  if(this.drops.some(d=>d.taken))this.drops=this.drops.filter(d=>!d.taken);
  // The officer, the first time: just before he would notice you, a line to him. The game holds the street while it is read and
  // wakes him after it (study/app.js), so the line comes before the lunge.
  const cop=!this.alert&&!this.ghost&&this.wave===0&&this.zombies.find(z=>z.idle&&z.look==='cop'),near=cop&&Math.hypot(cop.x-m.x,cop.y-m.y);this.told??=new Set();
  if(cop&&near<NOTICE+30&&!this.told.has('him')){this.told.add('him');this.emit('story',{beat:'him'});}
  else if(!this.alert&&!this.ghost&&this.zombies.some(z=>z.idle&&Math.hypot(z.x-m.x,z.y-m.y)<NOTICE))this.wake();
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
  if(this.dead){if(z.delay>0)z.delay=0;this.mourn(z,dt);return;}
  if(z.delay>0&&!z.idle){if(this.alert||z.extra)z.delay-=dt;if(z.delay>0)return;this.emit('groan',{z});}
  if(z.kind==='crawler')return this.crawl(z,dt);
  z.cool=Math.max(0,z.cool-dt);if(z.stagger>0){z.stagger-=dt;z.frame=0;return;}
  if(z.idle){z.frame=0;return;}
  const dx=m.x-z.x,dy=m.y-z.y,d=Math.hypot(dx,dy)||1;
  // Him, standing where he got up, swaying, until you come close or put a round in him.
  if(z.lurk){if(d<RISEN.notice||z.hp<z.max){z.lurk=false;this.emit('groan',{z,loud:true});this.emit('lurch',{z});}else{z.frame=0;return;}}
  z.groan-=dt;if(z.groan<=0){const C=SPECIAL.call;if(SPECIALS.has(z.kind)&&(z.hunt||z.roam===undefined&&this.alert)){z.groan=C.every[0]+this.rand()*(C.every[1]-C.every[0]);if(d<C.far&&!z.tell)this.emit('call',{z});}
   else{z.groan=2.5+this.rand()*3;if(d<ROAM.hear)this.emit('groan',{z});}}
  if(z.roam!==undefined&&!z.hunt){if(!this.down&&!this.ghost&&(d<NOTICE||this.lit(z,d)))this.notice(z);else{this.wander(z,dt);return;}}
  if(z.roam!==undefined&&d>ROAM.lose*(z.swarm?1.6:1)){z.hunt=false;z.state='wander';z.sx=z.x;z.sy=z.y;z.wt=0;return;}
  z.direction=facing(dx,dy);
  if(this.down){z.frame=0;return;}
  if(z.kind==='brute')return this.brute(z,dt,d,dx,dy);
  if(z.kind==='bloater')return this.bloater(z,dt,d,dx,dy);
  if(z.kind==='screamer'&&this.screamer(z,dt,d,dx,dy))return;
  if(z.kind==='spitter'&&this.spitter(z,dt,d,dx,dy))return;
  if(z.state==='windup'){z.t-=dt;z.tell=Math.max(0,z.t);z.frame=0;if(z.t<=0){z.state='chase';z.cool=B.cooldown;z.tell=0;if(d<B.range&&!this.air){const mine=!this.grabber||this.grabber===z;this.hurt(B.damage,z,!mine);if(mine&&!this.down){z.cool=GRAB.chew;this.hold(z,GRAB.hold);}}else this.emit('miss',{z});}return;}
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
  // On you: on top of you, clawing, until it is shoved or shot off you (and then it sprawls a moment).
  if(z.state==='pin'){if(this.grabber!==z){z.state='chase';z.cool=L.cool;z.stagger=Math.max(z.stagger,L.recover*.5);return true;}
   const px=m.x-z.lx*10,py=m.y-z.ly*7;if(!this.blockedZ(z,px,py)){z.x+=(px-z.x)*Math.min(1,dt*20);z.y+=(py-z.y)*Math.min(1,dt*20);}z.direction=facing(z.lx,z.ly);z.frame=Math.floor((z.t/L.maul.every)*2)%2?3:7;
   if((z.t-=dt)<=0){z.t=L.maul.every;this.hurt(L.maul.damage,z,false,'maul');}return true;}
  if(z.state==='crouch'){z.t-=dt;z.tell=Math.max(0,z.t);z.frame=0;if(z.t<=0){z.state='leap';z.t=L.time;z.tell=0;z.hitDone=false;this.emit('lunge',{z});}return true;}
  if(z.state==='leap'){z.t-=dt;const s=L.speed*dt;for(let i=0;i<3;i++){const nx=z.x+z.lx*s/3,ny=z.y+z.ly*s/3;if(this.blockedZ(z,nx,ny))break;z.x=nx;z.y=ny;}z.frame=3;z.direction=facing(z.lx,z.ly);
   if(!z.hitDone&&Math.hypot(m.x-z.x,(m.y-z.y)*1.2)<L.range&&!this.air&&!this.carried){z.hitDone=true;const mine=!this.grabber;this.hurt(L.damage,z,!mine);if(mine&&!this.down){this.hold(z,Infinity,0);z.state='pin';z.t=L.maul.every;this.emit('pinned',{z});return true;}}
   if(z.t<=0){z.state='chase';z.cool=L.cool;if(!z.hitDone){z.stagger=L.recover;this.emit('miss',{z});}}return true;}
  if((z.hunt||z.roam===undefined)&&d<L.at&&d>26&&!z.cool&&clearLine(z.x,z.y,m.x,m.y)){z.state='crouch';z.t=L.tell;z.tell=L.tell;z.lx=dx/d;z.ly=dy/d;this.emit('windup',{z});return true;}
  return false;}
 // A brute: setting its feet and charging, stunned against a wall, the slow swing, and the plod in between.
 brute(z,dt,d,dx,dy){const B=BRUTE,C=B.charge,S=B.swing,m=this.model;z.stagger=0;if(z.stun>0){z.stun-=dt;z.frame=0;return;}z.ccool=Math.max(0,(z.ccool||0)-dt);
  if(z.state==='set'){z.t-=dt;z.tell=Math.max(0,z.t);z.frame=0;if(z.t<=0){z.state='charge';z.t=C.time;z.tell=0;z.hitDone=false;this.emit('charge',{z});}return;}
  if(z.state==='charge'){z.t-=dt;const s=C.speed*dt,mine=this.carried===z;let wall=false;
   // You, if it has you, go just ahead of it; you hit the wall first.
   for(let i=0;i<4;i++){const nx=z.x+z.cx*s/4,ny=z.y+z.cy*s/4;if(this.blockedZ(z,nx,ny)){wall=true;break;}if(mine){const px=nx+z.cx*C.carry,py=ny+z.cy*C.carry*.7;if(this.walled(px,py)){wall=true;break;}m.x=px;m.y=py;}z.x=nx;z.y=ny;}
   z.direction=facing(z.cx,z.cy);z.phase=(z.phase+s/60)%1;z.frame=1+Math.floor(z.phase*8);
   if(!z.hitDone&&Math.hypot(m.x-z.x,(m.y-z.y)*1.2)<28&&!this.air){z.hitDone=true;this.hurt(C.damage,z,false,'charge');if(!this.down&&!this.grabber&&!this.carried){this.carried=z;this.shove=null;this.emit('carried',{z});}else this.knock(z,C.knock);}
   if(wall){if(this.carried===z){this.carried=null;this.hurt(C.slam,z,false,'slam');this.daze=this.down?0:C.daze;this.emit('slam',{z,x:m.x,y:m.y});}z.state='chase';z.stun=C.stun;z.ccool=C.cool;this.emit('stun',{z});}
   else if(z.t<=0){if(this.carried===z){this.carried=null;this.shove={x:z.cx*C.knock*.5,y:z.cy*C.knock*.5};this.emit('dropped',{z});}z.state='chase';z.ccool=C.cool;}return;}
  if(z.state==='windup'){z.t-=dt;z.tell=Math.max(0,z.t);z.frame=0;if(z.t<=0){z.state='chase';z.cool=S.cool;z.tell=0;if(d<S.range+8&&!this.air){this.hurt(S.damage,z);this.knock(z,S.knock);}else this.emit('miss',{z});}return;}
  if(!z.ccool&&d>C.min&&d<C.max&&clearLine(z.x,z.y,m.x,m.y)){z.state='set';z.t=C.tell;z.tell=C.tell;z.cx=dx/d;z.cy=dy/d;this.emit('windup',{z,big:true});return;}
  if(d<S.range&&!z.cool){z.state='windup';z.t=S.tell;z.tell=S.tell;this.emit('windup',{z,big:true});return;}
  this.chase(z,dt,Math.min(Math.max(0,d-S.range+10),B.speed*dt),d,dx,dy,55);}
 // A screamer: the scream, and keeping its distance in between. Returns false to fight like any other up close.
 screamer(z,dt,d,dx,dy){const S=SCREAMER,C=S.scream,m=this.model;z.scool=Math.max(0,(z.scool??2)-dt);
  if(z.state==='scream'){z.t-=dt;z.tell=Math.max(0,z.t);z.frame=9;if(z.t<=0){z.state='chase';z.tell=0;z.scool=C.cool;this.screamed(z);}return true;}
  if(z.state==='windup'||d<ZOMBIE.reach+12)return false;
  if(!z.scool&&d<C.range&&(z.hunt||z.roam===undefined)&&clearLine(z.x,z.y,m.x,m.y)){z.state='scream';z.t=C.tell;z.tell=C.tell;this.emit('scream',{z});return true;}
  this.keep(z,dt,d,dx,dy,S.keep-30,S.keep+60,S.speed);return true;}
 // The scream lands: the heat jumps, everything near it comes, and a horde is on its way (unless one is already on you).
 screamed(z){const C=SCREAMER.scream,m=this.model,dx=z.x-m.x,dy=z.y-m.y,d=Math.hypot(dx,dy)||1;this.noise(C.heat);for(const o of this.zombies)if(o.roam!==undefined&&o.hp>0&&!o.hunt&&Math.hypot(o.x-z.x,o.y-z.y)<C.range)this.notice(o);this.emit('screamed',{z});
  if(this.kit().street==='done'&&!this.evac&&!this.swarmLeft())this.patrol(true,{size:C.horde,from:{x:z.x+dx/d*C.behind,y:z.y+dy/d*C.behind}});}
 // A spitter: winding up, lobbing, and keeping its distance.
 spitter(z,dt,d,dx,dy){const S=SPITTER,P=S.spit;
  if(z.state==='spit'){z.t-=dt;z.tell=Math.max(0,z.t);z.frame=9;if(z.t<=0){z.state='chase';z.tell=0;z.cool=P.cool;this.lob(z);}return true;}
  if(z.state==='windup'||d<ZOMBIE.reach+12)return false;
  if(!z.cool&&d<S.keep[1]+40&&(z.hunt||z.roam===undefined)){z.state='spit';z.t=P.tell;z.tell=P.tell;this.emit('windup',{z});return true;}
  this.keep(z,dt,d,dx,dy,S.keep[0],S.keep[1],S.speed);return true;}
 // Holding a distance from you: back off inside near, come on past far, and stand in between.
 keep(z,dt,d,dx,dy,near,far,speed){if(d>far){this.chase(z,dt,speed*dt,d,dx,dy);return;}if(d>near){z.frame=0;z.phase=0;return;}
  const moved=this.step(z,-dx/d,-dy/d,speed*1.1*dt);if(moved){z.phase=(z.phase+moved/40)%1;z.frame=1+Math.floor(z.phase*8);}else{z.frame=0;z.phase=0;}}
 // A glob of acid, lobbed at where you will be: it flies for a moment and lands where it was aimed.
 lob(z){const m=this.model,P=SPITTER.spit,tx=m.x+clamp(this.pv.x*P.lead,-60,60),ty=m.y+clamp(this.pv.y*P.lead,-40,40),g={x0:z.x,y0:z.y,x1:tx,y1:ty,x:z.x,y:z.y,h:24,t:0,T:P.flight,arc:30+Math.hypot(tx-z.x,ty-z.y)*.18};
  this.globs.push(g);this.emit('spit',{z,g});}
 // A bloater: plodding at you, and swelling up to burst once it is close.
 bloater(z,dt,d,dx,dy){const B=BLOATER;if(z.state==='swell'){z.t-=dt;z.tell=Math.max(0,z.t);z.frame=9;if(z.t<=0){z.tell=0;this.hit(z,z.hp+1,0,0);}return;}
  if(d<B.swell.at){z.state='swell';z.t=B.swell.tell;z.tell=B.swell.tell;this.emit('swell',{z});return;}
  this.chase(z,dt,Math.min(Math.max(0,d-B.swell.at+8),B.speed*dt),d,dx,dy,44);}
 // A bloater bursts: you are thrown back and hurt if you are close and on your feet, the dead round it are hurt too (and any other
 // bloater caught in it goes off), and its gas hangs where it was.
 pop(z){const B=BLOATER.burst,m=this.model;this.clouds.push({x:z.x,y:z.y-2,t:0,T:B.time,tick:B.every,seed:Math.floor(this.rand()*1e4)});this.emit('burst',{z,x:z.x,y:z.y});
  if(Math.hypot(m.x-z.x,(m.y-z.y)*1.3)<B.radius&&!this.air&&!this.down){this.hurt(B.damage,z,false,'burst');this.knock(z,B.knock);if(!this.down)this.bile();}
  this.gassing=true;for(const o of this.zombies)if(o!==z&&o.hp>0&&this.out(o)&&Math.hypot(o.x-z.x,(o.y-z.y)*1.3)<B.radius)this.hit(o,B.dead,(o.x-z.x)/(Math.hypot(o.x-z.x,o.y-z.y)||1)*.4,(o.y-z.y)/(Math.hypot(o.x-z.x,o.y-z.y)||1)*.4);this.gassing=false;}
 // Covered in a bloater: half blind for a while, everything near comes, and a small horde (out on the job, if none is on you yet and you are not holding the bus lot).
 bile(){const B=BLOATER.burst,m=this.model;this.blind=B.blind;this.noise(15);for(const o of this.zombies)if(o.roam!==undefined&&o.hp>0&&!o.hunt&&Math.hypot(o.x-m.x,o.y-m.y)<B.call)this.notice(o);
  this.emit('blind',{t:B.blind});if(this.kit().street==='done'&&!this.evac&&!this.swarmLeft())this.patrol(true,{size:B.horde});}
 // Acid in the air and on the ground, and gas hanging: globs land, pools and clouds burn what stands in them and fade.
 hazards(dt){const m=this.model,P=SPITTER.spit,B=BLOATER.burst;
  for(const g of this.globs){g.t+=dt;const k=Math.min(1,g.t/g.T);g.x=g.x0+(g.x1-g.x0)*k;g.y=g.y0+(g.y1-g.y0)*k;g.h=Math.sin(Math.PI*k)*g.arc+(1-k)*24;
   if(k>=1){g.done=true;if(Math.hypot(m.x-g.x1,(m.y-g.y1)*1.3)<P.radius&&!this.air&&!this.down)this.hurt(P.damage,{x:g.x1,y:g.y1-1},false,'acid');this.pools.push({x:g.x1,y:g.y1,t:0,T:P.pool.time,seed:Math.floor(this.rand()*1e4)});if(this.pools.length>14)this.pools.shift();this.emit('splash',{x:g.x1,y:g.y1});}}
  if(this.globs.some(g=>g.done))this.globs=this.globs.filter(g=>!g.done);
  for(const p of this.pools)p.t+=dt;if(this.pools.some(p=>p.t>=p.T))this.pools=this.pools.filter(p=>p.t<p.T);
  for(const c of this.clouds){c.t+=dt;if((c.tick-=dt)<=0){c.tick=B.every;const r=B.radius*Math.min(1,.7+c.t*.3);this.gassing=true;for(const o of this.zombies)if(o.hp>0&&this.out(o)&&o.kind!=='bloater'&&Math.hypot(o.x-c.x,(o.y-c.y)*1.3)<r)this.hit(o,B.gas,0,0);this.gassing=false;}}
  if(this.clouds.some(c=>c.t>=c.T))this.clouds=this.clouds.filter(c=>c.t<c.T);
  // Standing in acid or gas: a burn every so often, unless you are in the air.
  const inPool=this.inAcid=!this.air&&this.pools.some(p=>p.t<p.T-.6&&Math.hypot(m.x-p.x,(m.y-p.y)*1.6)<P.pool.radius),inGas=this.clouds.some(c=>c.t<c.T-.8&&Math.hypot(m.x-c.x,(m.y-c.y)*1.3)<B.radius*.85);
  if((inPool||inGas)&&!this.air&&!this.down){if((this.burnT-=dt)<=0){this.burnT=P.pool.every;this.hurt(inPool?P.pool.hurt:B.hurt,{x:m.x,y:m.y+1},false,inPool?'acid':'gas');this.emit('burn',{acid:inPool});}}else this.burnT=Math.min(this.burnT,.15);}
 // Thrown back from a heavy hit.
 knock(z,n){const m=this.model,dx=m.x-z.x,dy=m.y-z.y,d=Math.hypot(dx,dy)||1;this.shove={x:dx/d*n,y:dy/d*n};}
 // A crawler drags itself at you, round what is in the way, and reaches for your ankle.
 crawl(z,dt){const m=this.model,C=CRAWLER;if(z.hatch>0){z.hatch-=dt;return;}z.cool=Math.max(0,z.cool-dt);if(z.stagger>0){z.stagger-=dt;return;}
  const dx=m.x-z.x,dy=m.y-z.y,d=Math.hypot(dx,dy)||1;if(d>ROAM.lose||this.down){z.frame=0;return;}if(z.roam!==undefined)z.hunt=true;z.direction=facing(dx,dy);
  z.groan-=dt;if(z.groan<=0){z.groan=3+this.rand()*3;if(d<ROAM.hear)this.emit('groan',{z});}
  if(z.state==='windup'){z.t-=dt;z.tell=Math.max(0,z.t);if(z.t<=0){z.state='chase';z.cool=C.cool;z.tell=0;if(d<C.reach+10&&!this.air){this.hurt(C.damage,z,false);if(!this.down&&!this.grabber)this.hold(z,C.hold,C.slow);}else this.emit('miss',{z});}return;}
  if(d<C.reach+4&&!z.cool){z.state='windup';z.t=C.windup;z.tell=C.windup;this.emit('windup',{z});return;}
  let ax=dx/d,ay=dy/d;if(d>28){z.seeT=(z.seeT||0)-dt;if(z.seeT<=0){z.seeT=.25;z.clear=clearLine(z.x,z.y,m.x,m.y);}if(!z.clear){const w=this.flow.way(z.x,z.y);if(w){ax=w.x;ay=w.y;}}}
  const go=Math.min(Math.max(0,d-C.reach),C.speed*dt),moved=go?this.step(z,ax,ay,go):0;if(moved){z.phase=(z.phase+moved/14)%1;z.frame=Math.floor(z.phase*4);}}
 // A patrol: a few of the dead come down a street from somewhere out of sight, heading to where you are now, and pick up on you
 // as wanderers do. A horde is bigger, comes from one side and already knows where you are.
 // A place at the edge of the dark to come from: on the nearest street or side street to a point out of sight, so they come down a
 // road, and near enough that the ones after you do not give up on the way. from: near there instead (the road behind a screamer),
 // if it will do.
 edge(from){const m=this.model,H=HEAT,ok=p=>p.x>WALK.left+40&&p.x<WALK.right-40&&p.y>WALK.top+40&&p.y<WALK.bottom-40&&!solidAt(p.x,p.y,10);
  if(from){const p=roadNear(from.x,from.y);if(ok(p)&&Math.hypot(p.x-m.x,p.y-m.y)<H.spawn.far)return p;}
  for(let t=0;t<30;t++){const ang=this.rand()*Math.PI*2,d=H.spawn.near+this.rand()*(H.spawn.far-H.spawn.near),p=roadNear(m.x+Math.cos(ang)*d,m.y+Math.sin(ang)*d);const e=Math.hypot(p.x-m.x,p.y-m.y);if(ok(p)&&e>H.spawn.near*.9&&e<ROAM.lose-60)return p;}return null;}
 // The special dead after you now (or waiting for you in the first fight), and one picked by weight.
 specialsOn(){let n=0;for(const z of this.zombies)if(SPECIALS.has(z.kind)&&z.hp>0&&(z.hunt||z.roam===undefined&&this.alert))n++;return n;}
 pickSpecial(w){const ks=Object.keys(w).filter(k=>k!=='brute'||this.level>=1),sum=ks.reduce((a,k)=>a+w[k],0);let r=this.rand()*sum;for(const k of ks)if((r-=w[k])<0)return k;return ks[0];}
 // The director lets one in: from the edge of the dark, already after you, calling out as it comes.
 lone(){if(this.specialsOn()>=SPECIAL.cap[this.level])return false;const at=this.edge();if(!at)return false;const m=this.model,kind=this.pickSpecial(SPECIAL.pick),look=vary(kind,this.rand()),hp=this.hpOf(kind,look);
  const z={kind,...(kind==='brute'?{tellY:BRUTE.tellY}:kind==='bloater'?{tellY:BLOATER.tellY}:{}),extra:true,roam:-1,look,x:at.x,y:at.y,sx:at.x,sy:at.y,direction:facing(m.x-at.x,m.y-at.y),frame:0,phase:0,hp,max:hp,idle:false,delay:0,state:'chase',hunt:true,t:0,vx:0,vy:0,stagger:0,tell:0,cool:0,flash:0,groan:SPECIAL.call.every[0],wt:0,wx:at.x,wy:at.y,acc:0};
  this.zombies.push(z);this.emit('special',{z});this.emit('call',{z,first:true});return true;}
 // A patrol, or a horde: only the ordinary dead (the specials come on their own, above), with a brute in a horde at the top if there
 // is room for one. size and from: a horde called up by a screamer or a bloater.
 patrol(horde,o={}){const m=this.model,H=HEAT,live=this.zombies.filter(z=>z.extra&&z.hp>0).length,[a,b]=o.size||(horde?H.horde.size:H.size),n=Math.min(a+Math.floor(this.rand()*(b-a+1)),H.cap-live);if(n<=0)return false;
  const at=this.edge(o.from);if(!at)return false;const goal={x:m.x+(this.rand()-.5)*160,y:m.y+(this.rand()-.5)*100},pts=[at.along==='x'?{x:goal.x,y:at.y}:{x:at.x,y:goal.y},goal];
  const brute=horde&&!o.size&&this.level===3&&this.specialsOn()<SPECIAL.cap[3]?Math.floor(this.rand()*n):-1,kinds=Array.from({length:n},(_,i)=>i===brute?'brute':'shambler');
  for(let i=0;i<n;i++){const kind=kinds[i],look=kind==='shambler'?LOOKS[Math.floor(this.rand()*LOOKS.length)]:vary(kind,this.rand()),hp=this.hpOf(kind,look),sp=horde?90:30,x=at.x+(this.rand()-.5)*sp+(at.along==='x'?(i%3)*14:0),y=at.y+(this.rand()-.5)*sp*.7+(at.along==='y'?(i%3)*14:0);
   this.zombies.push({kind,...(kind==='brute'?{tellY:BRUTE.tellY}:kind==='bloater'?{tellY:BLOATER.tellY}:{}),extra:true,roam:-1,look,x,y,sx:x,sy:y,direction:facing(goal.x-x,goal.y-y),frame:0,phase:0,hp,max:hp,idle:false,delay:i*.35,state:horde?'chase':'wander',hunt:horde,swarm:horde,t:0,vx:0,vy:0,stagger:0,tell:0,cool:0,flash:0,groan:1+this.rand()*4,wt:0,wx:x,wy:y,acc:0,
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
