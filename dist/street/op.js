// Operation Bell Jar on the ground (v0.68): out of Hollow Six's truck at the top of Juniper Lane with Aaron, down to the Marrow
// courier on its roof at Route 9, the samples out of its torn hold into Aaron's cold case, the containment beacon planted in front of
// it and guarded while it uplinks to Gadget's drone (its strobe brings everything in earshot), and the truck back along Route 9 to
// take you out. The fight owns one of these (fight.bell) as it owns the jobs (street/jobs.js) and hands it every spot marked op;
// each step is saved in the kit as it is done (home/kit.js BELL), so going down puts you back at the truck with what is done still done.
import {bellStep,bellOn,BELL} from '../home/kit.js';
import {count,add} from '../home/bag.js';
import {OP_APC,OP_DROP,OP_PICKUP,OP_WRECK,OP_BEACON,OP_START,OP_MATE,MOVING,opRamp,solidAt} from './data.js';
import {Mate} from './mate.js';
// crash: how close to the wreck counts as there. use: how long each spot takes standing still (as a search does). restock: the ammo
// cans fill your pack back up to this many rounds. uplink: how long the beacon has to talk to the drone with you near it (r, the
// ground squashed as everywhere), how fast it slips back while you are away, and what its strobe brings: a horde first a few seconds
// in and then every so often, the special dead at these seconds, and the heat it holds the street at; air: where Gadget calls out
// how far along it is. truck: its run in along Route 9, its ramp, and what it does to anything in its way. drone: Gadget's resupply,
// once your rifle and your pack are down to low rounds between them: a can of n rounds on the ground near you wait seconds after
// she calls it, off (out) from you towards the beacon, and not again until that one is picked up and again seconds have gone by.
export const OP={crash:260,use:{samples:3.5,beacon:2.2},restock:90,drone:{low:30,n:60,wait:2.6,out:44,again:18},
 uplink:{time:50,r:190,slip:.35,first:4,every:[12,16],size:[6,9],specials:[16,34],heat:60,air:[.25,.5,.75],again:12},
 truck:{drive:6.5,ramp:2.2,plow:220}};
// What the dead drop out here: rifle rounds, now and then.
export const OP_DROPS=[['rounds',.28,5,12]];
export const beaconAt={x:OP_BEACON.x+OP_BEACON.w/2,y:OP_BEACON.y+OP_BEACON.h/2},wreckAt={x:OP_WRECK.x+OP_WRECK.w/2,y:OP_WRECK.y+OP_WRECK.h/2};
export const planted=k=>BELL.indexOf(bellStep(k))>BELL.indexOf('beacon');
export class Bell{
 constructor(f){this.f=f;this.mate=new Mate(f);this.truck=null;this.link=0;this.near=true;}
 get kit(){return this.f.kit();}
 on(){return this.kit.phase==='op';}
 get step(){return bellStep(this.kit);}
 // How far the uplink has got, 0 to 1.
 get linked(){return this.link/OP.uplink.time;}
 // The uplink under way: the director's own patrols wait while the beacon brings its hordes.
 get holding(){return this.on()&&this.step==='uplink';}
 // Sets the operation up for where the kit says you are: you and Aaron at the ramp of the truck, which is where it dropped you
 // until the uplink is done and on Route 9 after; the wreck and the truck solid. He never walks through you, and you never wait on
 // him: walk into him and he steps aside (street/mate.js).
 start(){const f=this.f;if(this.hid){f.ghost=false;this.hid=false;}Object.assign(this,{link:this.step==='uplink'?this.link:0,drone:null,droneT:0,near:true,was:true,awayAt:-99,hordeT:OP.uplink.first,specials:[...OP.uplink.specials],ut:0});
  if(!this.on()){this.truck=null;f.model.others=null;return;}
  const late=this.step==='truck'||this.step==='out',T=late?OP_PICKUP:OP_DROP;this.truck={state:late?'wait':'drop',x:T.x,y:T.y,t:0,ramp:1};if(this.step==='out')this.aboard();
  f.model.spawn={...(late?{...opRamp(OP_PICKUP,-8),direction:4}:OP_START),op:true};f.model.reset();this.mate.reset(late?{...opRamp(OP_PICKUP,-44),direction:4}:OP_MATE);
  f.model.others=null;this.mate.m.others=[f.model];this.park();}
 // What is solid out here tonight: the wreck, and the truck wherever it stands (not while it drives). Both stop bullets. Anything
 // standing where the truck pulls up is moved out of its way.
 park(){MOVING.length=0;if(!this.on())return;const W=OP_WRECK,v=this.truck,f=this.f;MOVING.push({x:W.x,y:W.y,w:W.w,h:W.h,z:W.z,see:false,cover:true,id:W.id,kind:W.kind});
  if(!v||v.state==='drive')return;const b={x:v.x,y:v.y,w:OP_APC.w,h:OP_APC.h,z:OP_APC.z,see:false,cover:true,id:'op-apc',kind:'apc'};MOVING.push(b);
  const inside=(x,y,r)=>x>b.x-r&&x<b.x+b.w+r&&y>b.y-r&&y<b.y+b.h+r,out=(y,r)=>y<b.y+b.h/2?b.y-r-2:b.y+b.h+r+2;
  for(const m of [f.model,this.mate.m])if(inside(m.x,m.y,m.radius))m.y=out(m.y,m.radius);for(const z of f.zombies)if(z.hp>0&&inside(z.x,z.y,8))z.y=out(z.y,8);}
 // Which of the operation's spots can be used now.
 can(t){if(!t?.op||!this.on())return false;const s=this.step,v=this.truck;
  if(t.op==='samples'||t.op==='beacon')return s===t.op;if(t.op==='ammo')return count(this.kit.bag,'rounds')<OP.restock;
  if(t.op==='board')return s==='truck'&&v?.state==='wait';return false;}
 // Using one: up the ramp at once; the cans at once; the samples and the beacon a moment standing still (the fight finishes it).
 use(t){const f=this.f;if(f.down||f.vault||f.searching||!this.can(t))return false;
  if(t.op==='board'){const k=bellOn(this.kit,'truck');f.setKit(k);f.snapshot=k;this.aboard();f.emit('aboard',{stats:{...f.stats}});return true;}
  if(t.op==='ammo'){const k=this.kit,n=OP.restock-count(k.bag,'rounds'),next={...k,bag:add(k.bag,f.grid(),'rounds',n)};f.setKit(next);f.snapshot=next;f.emit('restock',{n});return true;}
  f.searching={t,time:0,need:OP.use[t.op]};f.emit('search',{t,op:t.op});return true;}
 // Both of you inside and the ramp up: nothing out here sees you now.
 aboard(){const f=this.f;Object.assign(this.truck,{state:'aboard',ramp:0});f.ghost=true;f.alert=false;f.heat=0;for(const z of f.zombies)if(z.roam!==undefined)z.hunt=false;this.hid=true;}
 // A step done: the samples in Aaron's cold case; the beacon standing, its strobe going, and every wanderer for blocks seeing it.
 finish(t){const f=this.f;if(!this.can(t))return;const k=bellOn(this.kit,t.op);f.setKit(k);f.snapshot=k;
  if(t.op==='samples'){f.emit('samples',{});return;}
  const b=beaconAt;Object.assign(this,{link:0,ut:0,hordeT:OP.uplink.first,specials:[...OP.uplink.specials]});f.noise(40);
  for(const z of f.zombies)if(z.roam!==undefined&&z.hp>0&&!z.hunt&&Math.hypot(z.x-b.x,z.y-b.y)<900)f.notice(z);f.emit('planted',{x:b.x,y:b.y});}
 // Each step of the fight's clock: Aaron, getting to the crash, the uplink, and the truck.
 update(dt){if(!this.on())return;const f=this.f,m=f.model,s=this.step;if(s!=='out')this.mate.update(dt);
  if(s==='crash'&&!f.down&&Math.hypot(m.x-wreckAt.x,(m.y-wreckAt.y)*1.2)<OP.crash){const k=bellOn(this.kit,'crash');f.setKit(k);f.snapshot=k;f.emit('crash',{x:wreckAt.x,y:wreckAt.y});}
  if(s==='uplink'&&!f.down)this.uplink(dt);this.drive(dt);this.resupply(dt);}
 // Gadget's drone with a can of rounds when you are running low; it lands a little way off and flies to you like anything the dead
 // drop. The call goes out (drone), and the can comes down a moment later (dropped).
 resupply(dt){const f=this.f,D=OP.drone,m=f.model;this.droneT=Math.max(0,this.droneT-dt);
  if(this.drone){if((this.drone.t-=dt)<=0){const {x,y}=this.drone;this.drone=null;f.drops.push({id:'rounds',n:D.n,x,y,age:0,drone:true});f.emit('dropped',{x,y});}return;}
  if(f.down||this.droneT>0||f.drops.some(d=>d.drone)||this.step==='out')return;const k=this.kit;if((k.guns['tactical-ar']?.ammo||0)+count(k.bag,'rounds')>D.low)return;
  const b=this.step==='uplink'?beaconAt:null,h=b&&Math.hypot(b.x-m.x,b.y-m.y)>20?Math.atan2(b.y-m.y,b.x-m.x):(m.aim??m.direction*Math.PI/4)+Math.PI;
  for(const da of [0,.7,-.7,1.4,-1.4,Math.PI]){const x=m.x+Math.cos(h+da)*D.out,y=m.y+Math.sin(h+da)*D.out*.8;if(!solidAt(x,y,8)){this.drone={t:D.wait,x,y};this.droneT=D.again;f.emit('drone',{x,y});return;}}}
 // The beacon talking to the drone: on while you are near it, slipping back while you are not; the strobe keeps the street hot and
 // brings a horde every so often and the special dead now and then. Done: the truck is on its way.
 uplink(dt){const f=this.f,m=f.model,U=OP.uplink,b=beaconAt;this.ut+=dt;f.heat=Math.max(f.heat,U.heat);f.quiet=0;
  this.near=Math.hypot(m.x-b.x,(m.y-b.y)*1.2)<U.r;const was=this.link;this.link=this.near?Math.min(U.time,this.link+dt):Math.max(0,this.link-dt*U.slip);
  for(const a of U.air)if(was<a*U.time&&this.link>=a*U.time)f.emit('linking',{k:a});
  if(this.was&&!this.near&&this.ut-this.awayAt>U.again){this.awayAt=this.ut;f.emit('linkaway',{});}this.was=this.near;
  if((this.hordeT-=dt)<=0){this.hordeT=U.every[0]+f.rand()*(U.every[1]-U.every[0]);f.patrol(true,{size:U.size});}
  while(this.specials.length&&this.ut>=this.specials[0]){this.specials.shift();f.lone();}
  if(this.link>=U.time){const k=bellOn(this.kit,'uplink');f.setKit(k);f.snapshot=k;this.truck={state:'drive',x:OP_PICKUP.from,y:OP_PICKUP.y,t:OP.truck.drive,ramp:0};this.park();f.emit('uplinked',{});}}
 // The truck: in along Route 9 from the west, slowing to a stop past the crash, through whatever is in its way; then the ramp.
 drive(dt){const v=this.truck,f=this.f,T=OP.truck;if(!v)return;
  if(v.state==='drive'){v.t-=dt;v.x=OP_PICKUP.x+(OP_PICKUP.from-OP_PICKUP.x)*Math.pow(Math.max(0,v.t/T.drive),1.6);this.plow(v);if(v.t<=0){Object.assign(v,{state:'stop',t:T.ramp,x:OP_PICKUP.x});this.park();f.emit('truckstop',{});}}
  else if(v.state==='stop'){v.t-=dt;v.ramp=1-Math.max(0,v.t/T.ramp);if(v.t<=0){Object.assign(v,{state:'wait',ramp:1});f.emit('truckwait',{});}}}
 // What the truck runs into: the dead are thrown off it (and most of them do not get up), you and Aaron are shoved clear.
 plow(v){const f=this.f,b={x:v.x-4,y:v.y-4,w:OP_APC.w+8,h:OP_APC.h+8},inside=(x,y)=>x>b.x&&x<b.x+b.w&&y>b.y&&y<b.y+b.h,side=y=>y<v.y+OP_APC.h/2?-1:1;
  for(const z of f.zombies)if(z.hp>0&&f.out(z)&&inside(z.x,z.y)){const s=side(z.y);z.y=s<0?b.y-2:b.y+b.h+2;f.hit(z,OP.truck.plow,.8,s*.6,'truck');}
  for(const m of [f.model,this.mate.m])if(inside(m.x,m.y)){const s=side(m.y);m.y=s<0?b.y-m.radius-2:b.y+b.h+m.radius+2;}}
 // Where to go that is not a spot: the crash until you are there, the beacon while you are away from it, the truck on its way.
 marks(){if(!this.on()||this.f.down)return [];const s=this.step,v=this.truck;
  if(s==='crash')return [{mark:'Crash',x:wreckAt.x,y:wreckAt.y,mx:wreckAt.x,my:OP_WRECK.y-OP_WRECK.z+6}];
  if(s==='uplink'&&!this.near)return [{mark:'Beacon',x:beaconAt.x,y:beaconAt.y,mx:beaconAt.x,my:OP_BEACON.y-OP_BEACON.z-6}];
  if(s==='truck'&&v&&v.state!=='wait')return [{mark:'Truck',x:v.x+OP_APC.w/2,y:v.y+OP_APC.h/2,mx:v.x+OP_APC.w/2,my:v.y-OP_APC.z+8}];return [];}}
