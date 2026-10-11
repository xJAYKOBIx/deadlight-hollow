// Aaron on the ground (v0.68, v0.69): your partner out of the truck, a second soldier the fight moves for you. He keeps near you, a
// little behind and off to one side, runs to catch up when you get ahead, and shoots what is coming for you: short bursts at whichever
// of the dead hunting you is nearest you, once he has a clear line to it (never through cover, never through you) and has had a moment
// to bring the rifle round. At the beacon he stands across it from you, so between you nothing comes in unseen, and he looks hardest
// at what is behind you. The ordinary dead go for him too (street/op.js says which): he can be hurt, and he goes down. Down, he waits
// for you to get him up. You down, he comes for you: he gets you back on your feet, stopping to shoot anything that comes at either
// of you first. He calls out what you need to know (matecall): the special dead as each comes into sight, one behind you, his own
// reload, and being hurt; the game says the words (story/op.js).
// His feet are a StreetModel's, so he walks round what is solid just as you do; round anything bigger he follows the flow the dead
// use, and if he is left far behind or stuck out of sight he catches up behind you.
import {StreetModel} from './model.js';
import {GUNS,muzzle} from '../study/equipment.js';
import {clearLine} from './paths.js';
import {coverAt,solidAt,MAP} from './data.js';
// keep: where he stands, behind you and off to one side, and how far off that he lets himself be before he moves. run: he runs once
// you are this far away; catch: further than this (or stuck lost seconds) and he catches up out of sight. see: how far he shoots.
// react: how long he takes to bring the rifle round onto a new target. burst and gap: rounds a burst and the pause after one; every
// stretches the rifle's own rate a little. miss: how far off his aim can be (radians). slow: his pace while he shoots. yield: how
// close you come, walking at him, before he steps out of your way. hp, armor, heal: how much he takes, how much of a bite gets
// through his plate carrier, and how fast it closes once nothing has touched him for a while. lift: getting you up, from this close, this long; guard: anything this near either of you is shot
// first. call: how far behind you one has to be, and how often he says so; and how hurt he has to be to say that, and how often.
// stick: how much better another target has to look before he leaves the one he is on. close: one this near him he snaps onto and
// fires at without a breath between bursts. bash: the dead on top of him get the stock, as you shove them (fight.js BASH).
export const MATE={gun:'tactical-ar',keep:{back:42,side:28,slack:20},run:170,catch:820,lost:2.5,see:420,react:.3,burst:[3,5],gap:[.35,.7],every:1.35,miss:.06,reload:1.9,slow:.55,noise:1.5,bullet:1600,yield:30,
 hp:150,armor:.55,heal:{after:6,rate:4},lift:{reach:26,time:3,guard:70},call:{behind:[100,16],hurt:[.5,20],reload:22},stick:40,close:48,bash:{range:30,half:1.1,push:210,stagger:.6,cool:2.4,time:.22}};
const free=(x,y)=>x>40&&y>40&&x<MAP.w-40&&y<MAP.h-40&&!solidAt(x,y,9);
export class Mate{
 constructor(f){this.f=f;this.m=new StreetModel();this.reset(null);}
 // Out of the truck beside you (at), or wherever he last was; whole, and with a full magazine.
 reset(at){const m=this.m;if(at){m.spawn=at;m.reset();}m.slow=1;Object.assign(this,{target:null,aimT:0,pickT:0,cool:0,burst:0,gapT:0,ammo:GUNS[MATE.gun].mag,reloadT:0,sinceShot:9,shotA:null,stuck:0,side:1,px:null,py:null,
  hp:MATE.hp,down:false,downT:0,sinceHurt:9,shove:null,lift:0,lifting:false,bash:null,bashT:0,callT:0,behindAt:-99,hurtAt:-99,reloadAt:-99,clock:0,called:new Set()});}
 get x(){return this.m.x;}get y(){return this.m.y;}
 // A point behind you, to one side of the way you are heading (or facing), and the other side if that one is solid; with nowhere
 // behind you to stand (your back to a wall or the truck), beside you; and failing that, where he is. At the beacon, across it.
 spot(){const post=this.f.bell.post?.();if(post&&free(post.x,post.y))return post;
  const p=this.f.model,v=this.f.pv,go=Math.hypot(v.x,v.y)>30,h=go?Math.atan2(v.y,v.x):p.aim??p.direction*Math.PI/4,K=MATE.keep,c=Math.cos(h),s=Math.sin(h);
  for(const side of [this.side,-this.side,0]){const x=p.x-c*K.back-s*K.side*side,y=p.y-(s*K.back-c*K.side*side)*.8;if(free(x,y)){this.side=side||this.side;return {x,y};}}
  for(const side of [this.side,-this.side]){const x=p.x-s*K.side*1.4*side,y=p.y+c*K.side*1.4*side*.8;if(free(x,y))return {x,y};}return {x:this.m.x,y:this.m.y};}
 // Where he kneels to get you up: just behind you at your chest (you went over the way you faced, street/opview.js fallen), so you
 // are not hidden under him; in front of you, or at your feet, if that is solid.
 beside(){const p=this.f.model,s=[3,4,5].includes(p.direction)?-1:1;for(const [dx,dy] of [[14,-14],[14,15],[-22,-12]]){const x=p.x+s*dx,y=p.y+dy;if(free(x,y))return {x,y};}return {x:p.x,y:p.y+16};}
 // Out of sight behind you, when he has fallen too far back.
 catchUp(){const p=this.f.model,h=p.aim??p.direction*Math.PI/4;for(const r of [110,80,140,60])for(const da of [0,.6,-.6,1.2,-1.2]){const a=h+Math.PI+da,x=p.x+Math.cos(a)*r,y=p.y+Math.sin(a)*r*.8;
  if(free(x,y)&&clearLine(x,y,p.x,p.y)){Object.assign(this.m,{x,y,frame:0,phase:0,moving:false});this.stuck=0;return true;}}return false;}
 // Bitten: knocked back a step, and down once there is nothing left. Nothing else touches him (the special dead want you).
 hurt(n,from){if(this.down)return;const f=this.f,a=this.m,was=this.hp/MATE.hp;this.hp=Math.max(0,this.hp-n*MATE.armor);this.sinceHurt=0;
  const dx=a.x-from.x,dy=a.y-from.y,d=Math.hypot(dx,dy)||1;this.shove={x:dx/d*36,y:dy/d*36};f.emit('matehurt',{x:a.x,y:a.y,hp:this.hp});
  const H=MATE.call.hurt;if(this.hp&&was>H[0]&&this.hp/MATE.hp<=H[0]&&this.clock-this.hurtAt>H[1]){this.hurtAt=this.clock;this.call('hurt');}
  if(!this.hp){Object.assign(this,{down:true,downT:0,target:null,burst:0,reloadT:0,lift:0,lifting:false,shove:null});a.moving=false;f.stats.mateDowns=(f.stats.mateDowns||0)+1;f.emit('matedown',{x:a.x,y:a.y});f.bell.mateDown?.();}}
 // On his feet again (you got him up): half his health back and a fresh magazine.
 up(){Object.assign(this,{down:false,hp:MATE.hp*.5,sinceHurt:0,ammo:GUNS[MATE.gun].mag,reloadT:0,aimT:0,cool:.4});}
 // Something to say: the game turns it into his words, one at a time.
 call(say,o={}){this.f.emit('matecall',{say,x:this.m.x,y:this.m.y,...o});}
 // Each step: where to go, what to shoot, and the shooting.
 update(dt){const f=this.f,a=this.m,p=f.model;this.clock+=dt;this.sinceShot+=dt;this.sinceHurt+=dt;this.cool=Math.max(0,this.cool-dt);this.gapT=Math.max(0,this.gapT-dt);
  if(this.down){this.downT+=dt;a.moving=false;a.frame=0;return;}
  this.bashT=Math.max(0,this.bashT-dt);if(this.bash&&(this.bash.t+=dt)>=MATE.bash.time)this.bash=null;
  if(this.sinceHurt>MATE.heal.after)this.hp=Math.min(MATE.hp,this.hp+MATE.heal.rate*dt);
  if(this.shove){const k=Math.min(1,dt*10),sx=this.shove.x*k,sy=this.shove.y*k;if(!a.blocked(a.x+sx,a.y))a.x+=sx;if(!a.blocked(a.x,a.y+sy))a.y+=sy;this.shove.x-=sx;this.shove.y-=sy;if(Math.hypot(this.shove.x,this.shove.y)<1)this.shove=null;}
  if(this.reloadT&&(this.reloadT=Math.max(0,this.reloadT-dt))===0){this.ammo=GUNS[MATE.gun].mag;f.emit('mateloaded',{x:a.x,y:a.y});}
  const lift=f.down&&f.bell.bleeding,dp=Math.hypot(a.x-p.x,a.y-p.y);if(dp>MATE.catch||this.stuck>MATE.lost&&!this.seen())this.catchUp();
  this.watch(dt,lift);
  // Who to shoot: checked a few times a second; a new one takes a moment to bring the rifle onto. Getting you up, only what is on
  // top of one of you.
  if((this.pickT-=dt)<=0){this.pickT=.25;const t=f.down&&!lift?null:this.pick(lift?MATE.lift.guard:0);if(t!==this.target){this.target=t;this.aimT=t&&Math.hypot(t.x-a.x,t.y-a.y)<MATE.close?MATE.react*.6:0;}}
  const z=this.target&&f.out(this.target)?this.target:null;if(!z)this.target=null;
  // Where to stand: his spot behind you, straight there if nothing is in the way, otherwise round it by the flow; beside you, when
  // you are down.
  const S=lift?this.beside():this.spot(),dx=S.x-a.x,dy=S.y-a.y,d=Math.hypot(dx,dy),slack=lift?4:MATE.keep.slack;let mx=0,my=0;
  if(d>slack&&(!f.down||lift)){let ux=dx/d,uy=dy/d;if(!clearLine(a.x,a.y,S.x,S.y)){f.flow.update(dt,[p]);const w=f.flow.way(a.x,a.y);if(w){ux=w.x;uy=w.y;}}const k=Math.min(1,(d-slack*.5)/(lift?14:40));mx=ux*k;my=uy*k;}
  // Out of your way: when you come at him he steps across your path, to whichever side he is already on, and quickly.
  const v=f.pv,sp=Math.hypot(v.x,v.y),ex=a.x-p.x,ey=a.y-p.y,yd=Math.hypot(ex,ey*1.4);let dodge=false;
  if(sp>30&&yd<MATE.yield&&(ex*v.x+ey*v.y)>0&&!f.down){const s=Math.sign(ex*v.y-ey*v.x)||this.side;mx=-v.y/sp*s;my=v.x/sp*s;dodge=true;}
  // At your side and nothing on top of either of you: he stops, gets down by you and works at getting you up, his rifle along the
  // street past your feet.
  const at=lift&&!z&&Math.hypot(a.x-p.x,(a.y-p.y)*1.2)<MATE.lift.reach;if(at){mx=my=0;}this.lifting=at;
  const ox=a.x,oy=a.y,aim=z?Math.atan2(z.y-a.y,z.x-a.x):at?([3,4,5].includes(p.direction)?0:Math.PI):null;a.slow=z&&!dodge?MATE.slow:1;
  a.walk(dt,{x:mx,y:my,run:(dp>MATE.run||dodge||lift)&&!z,aimX:aim===null?undefined:Math.cos(aim),aimY:aim===null?undefined:Math.sin(aim)});
  this.stuck=(mx||my)&&Math.hypot(a.x-ox,a.y-oy)<dt*20?this.stuck+dt:0;
  if(at&&(this.lift+=dt)>=MATE.lift.time){this.lift=0;this.lifting=false;f.bell.revived();}
  if(!z||f.down&&!lift)return;this.aimT+=dt;if(this.bashT<=0&&this.crowded())return this.stock();
  // The rifle: bursts, a breath between them (none with one on top of him), a fresh magazine when it runs dry.
  const close=Math.hypot(z.x-a.x,z.y-a.y)<MATE.close;if(close)this.gapT=0;
  if(this.reloadT||this.aimT<MATE.react||this.cool>0)return;if(!this.burst){if(this.gapT>0)return;this.burst=MATE.burst[0]+Math.floor(f.rand()*(MATE.burst[1]-MATE.burst[0]+1));}
  this.shoot(z);if(--this.burst===0)this.gapT=MATE.gap[0]+f.rand()*(MATE.gap[1]-MATE.gap[0]);
  if(!this.ammo){this.burst=0;this.reloadT=MATE.reload;f.emit('matereload',{x:a.x,y:a.y});if(this.clock-this.reloadAt>MATE.call.reload){this.reloadAt=this.clock;this.call('reload');}}}
 // What he calls out, a few times a second: each of the special dead the first time it is in sight, and one of the ordinary dead
 // close behind you that you are not looking at (not while he is busy getting you up).
 watch(dt,lift){if((this.callT-=dt)>0)return;this.callT=.25;const f=this.f,p=f.model,C=MATE.call.behind,h=p.aim??p.direction*Math.PI/4;
  for(const z of f.zombies){if(!f.out(z)||!(z.roam!==undefined?z.hunt:f.alert))continue;const dx=z.x-p.x,dy=z.y-p.y,d=Math.hypot(dx,dy);
   if(z.kind&&z.kind!=='shambler'&&z.kind!=='crawler'&&!this.called.has(z)&&d<MATE.see&&Math.abs(dy)<300){this.called.add(z);this.call('special',{kind:z.kind});return;}
   if(!lift&&!f.down&&d<C[0]&&(dx*Math.cos(h)+dy*Math.sin(h))/(d||1)<-.4&&this.clock-this.behindAt>C[1]&&z!==this.target){this.behindAt=this.clock;this.call('behind');return;}}}
 // On screen (or near enough to it): he only catches up where you cannot see him do it.
 seen(){const p=this.f.model;return Math.abs(this.m.x-p.x)<420&&Math.abs(this.m.y-p.y)<300;}
 // The one to shoot: hunting you (or awake in a wave), within reach, a clear line to it; the nearest to you counts most, then what
 // is behind you and what is coming for him. near: only what is that close to one of you.
 pick(near=0){const f=this.f,a=this.m,p=f.model,h=p.aim??p.direction*Math.PI/4,c=Math.cos(h),s0=Math.sin(h);let best=null,bs=Infinity;
  for(const z of f.zombies){if(!f.out(z)||!(z.roam!==undefined?z.hunt:f.alert))continue;const da=Math.hypot(z.x-a.x,z.y-a.y);if(da>MATE.see)continue;const dp=Math.hypot(z.x-p.x,z.y-p.y);
   if(near&&Math.min(da,dp)>near)continue;const behind=(z.x-p.x)*c+(z.y-p.y)*s0<0;
   const s=dp*.65+da*.35-(behind?50:0)-(z.prey&&da<140?40:0)-(da<MATE.close?60:0)-(z===this.target?MATE.stick:0);if(s<bs&&this.ray(Math.atan2(z.y-a.y,z.x-a.x),da+20).z===z){bs=s;best=z;}}return best;}
 // Two of the dead on top of him, or one about to bite him.
 crowded(){const f=this.f,a=this.m,R=MATE.bash.range;let n=0;for(const z of f.zombies){if(!f.out(z)||Math.hypot(z.x-a.x,(z.y-a.y)*1.2)>R)continue;if(z.prey&&z.state==='windup')return true;n++;}return n>=2;}
 // The stock: everything close in front of him knocked back and staggered, the brutes barely.
 stock(){const f=this.f,a=this.m,B=MATE.bash;let near=null,nd=B.range+12;for(const z of f.zombies){if(!f.out(z))continue;const d=Math.hypot(z.x-a.x,z.y-a.y);if(d<nd){nd=d;near=z;}}if(!near)return;
  const ang=Math.atan2(near.y-a.y,near.x-a.x);let n=0;for(const z of f.zombies){if(!f.out(z))continue;const dx=z.x-a.x,dy=z.y-a.y,d=Math.hypot(dx,dy*1.2)||1,big=z.kind==='brute';let off=Math.atan2(dy,dx)-ang;off=Math.atan2(Math.sin(off),Math.cos(off));
   if(d>B.range+(big?10:0)||Math.abs(off)>B.half)continue;const k=B.push*(big?.12:1);z.vx+=dx/d*k;z.vy+=dy/d*k;z.flinch=.12;z.flinchX=dx;n++;
   if(!big){z.stagger=Math.max(z.stagger||0,B.stagger);if(['windup','crouch','spit','scream'].includes(z.state)){z.state='chase';z.tell=0;z.cool=Math.max(z.cool||0,.5);}}}
  this.bash={t:0,a:ang};this.bashT=B.cool;this.cool=Math.max(this.cool,B.time);a.aim=ang;f.emit('mateshove',{x:a.x,y:a.y,a:ang,hit:n});}
 // A line from him: it stops at the first of the dead on it or the first cover, and never goes through you (nothing is hit then).
 ray(angle,range){const f=this.f,a=this.m,p=f.model,dx=Math.cos(angle),dy=Math.sin(angle);let end={x:a.x,y:a.y};
  for(let d=6;d<=range;d+=3){const x=a.x+dx*d,y=a.y+dy*d;if(x<0||y<0||x>MAP.w||y>MAP.h)break;if(coverAt(x,y))return {end,onto:{kind:'prop'},d};end={x,y};
   if(Math.hypot(p.x-x,(p.y-y)*1.2)<11&&!f.down)return {end,onto:{kind:'you'},d,you:true};
   const z=f.zombies.find(z=>f.out(z)&&Math.abs(z.x-x)<20&&Math.abs(z.y-y)<20&&Math.hypot(z.x-x,(z.y-y)*1.2)<(z.kind==='brute'?17:12));if(z)return {end,onto:{kind:'zombie',ref:z},z,d};}
  return {end,onto:{kind:'floor'},d:range};}
 shoot(z){const f=this.f,a=this.m,g=GUNS[MATE.gun],ang=Math.atan2(z.y-a.y,z.x-a.x)+(f.rand()-.5)*2*MATE.miss,L=this.ray(ang,g.range);if(L.you){this.burst=0;return;}
  this.ammo--;this.sinceShot=0;this.shotA=ang;this.cool=g.interval*MATE.every;f.stats.mateShots=(f.stats.mateShots||0)+1;
  if(L.z)f.hit(L.z,g.damage,Math.cos(ang),Math.sin(ang),'mate');
  const mz=muzzle(ang,MATE.gun),dur=Math.hypot(L.end.x-a.x,L.end.y-a.y)/MATE.bullet;
  f.traces.push({x:a.x,y:a.y,ex:L.end.x,ey:L.end.y,ox:mz.x,oy:mz.y,age:0,dur,life:dur+.07,col:L.onto.kind==='zombie'?'#7a1a16':'#b8ab88',onto:L.onto,done:false,mate:true});
  f.noise(MATE.noise);f.heard(a.x,a.y);f.emit('mateshot',{x:a.x,y:a.y,angle:ang});}}
