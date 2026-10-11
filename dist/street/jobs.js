// The first job, a step at a time. Each of the three jobs is a chain of steps (home/kit.js CHAINS), each done at a spot (street/
// data.js): find the part, carry it across town, get in, fix it, hold on while it works. The fight owns one of these (fight.jobs)
// and hands it every spot with a use; the steps are saved in the kit as they are done, a fix's progress only for the night. Each
// step is simple on its own; the noise it makes, the hands it takes and the ground it makes you cross are what make it hard.
import {stepOf,stepOn,stepTo,give,spend,lift,setDown,delivered,PARTS} from '../home/kit.js';
import {HOLD_AT} from './data.js';
import {TARGETS} from './model.js';
// What each use is for (its job and step), how long it takes standing still (as a search does) or which fix it opens, and what else
// it needs. While a part is in your hands the only thing you can do is deliver it.
export const USES={keys:{job:'radio',step:'battery',time:2.4,need:j=>!j.has('keys')},smash:{job:'radio',step:'battery',time:1.6,need:j=>!j.has('keys')},
 open:{job:'radio',step:'battery',time:2,need:j=>j.has('keys')},set:{job:'radio',step:'carry',time:.8,need:j=>j.carry==='battery'},
 wire:{job:'radio',step:'wire',fix:'wire'},tune:{job:'radio',step:'tune',fix:'tune'},
 check:{job:'power',step:'fuel',time:1,need:j=>!j.has('can')},siphon:{job:'power',step:'fuel',time:3,need:j=>j.has('can')},store:{job:'power',step:'fuel',time:1.4,need:j=>j.has('can')},
 fill:{job:'power',step:'carry',time:2,need:j=>j.carry==='fuel'},start:{job:'power',step:'start',fix:'pull'},
 note:{job:'supplies',step:'note',time:.6},body:{job:'supplies',step:'hunt',time:1.5,need:j=>!!j.body()},pry:{job:'supplies',step:'hunt',time:4},
 unlock:{job:'supplies',step:'shed',time:1},bag:{job:'supplies',step:'bag',time:1.6},drop:{time:.4}};
// Noise. Smashing a window sets off the car's alarm (fight.js alarm), and a siphon does half the time. Prying the shed, every pull
// of the cord, a spark off the radio and the radio's static are this loud, and wake the dead this far off.
export const NOISE={siphon:.5,pry:{heat:15,far:420},pull:{heat:12,far:420},spark:{heat:6,far:220},static:{heat:3,far:360,every:.8}};
// The fixes, all done with the Use button. wire: a spark runs back and forth along the radio's terminal strip; tap as it crosses
// the next post, three times. A miss sparks, and a bite starts the wiring over. tune: the needle sweeps the dial; tap as it crosses
// each band the Guard is on (the second narrower) while the static carries. pull: prime the bulb three times, then tap at the top of
// each pull of the cord; every pull is loud, and the third always catches. Walking off stops a fix, and it picks up where you left it.
export const FIX={wire:{speed:.9,posts:[.72,.28,.55],half:.08},tune:{speed:.42,bands:[[.68,.06],[.31,.035]]},pull:{prime:3,time:.75,zone:[.72,.94],most:3}};
// The hold: the light has to burn this long with you near it, and the time runs back at half speed while you are away.
export const HOLD={time:30,r:240,decay:.5};
// A part in your hands: slower on your feet, and only the pistol in the other one.
export const CARRY={slow:.72};
const AWAY=-1e4;
export class Jobs{
 constructor(f){this.f=f;this.prog={};this.fix=null;this.hold=0;this.near=false;this.liftAt=null;this.T=Object.fromEntries(TARGETS.filter(t=>t.use==='drop'||t.use==='body').map(t=>[t.item||'body',t]));}
 get kit(){return this.f.kit();}
 get carry(){return this.kit.mission?.carry||null;}
 has(h){return !!this.kit.mission?.have.includes(h);}
 on(){const k=this.kit;return k.street==='done'&&!!k.mission&&!k.mission.out;}
 // Mrs. Hargrove: walking about the park, or down.
 her(){return this.f.zombies.find(z=>z.who==='hargrove'&&z.hp>0)||null;}
 body(){return this.f.zombies.find(z=>z.who==='hargrove'&&z.hp<=0)||null;}
 start(){this.fix=null;this.place();}
 // Whether a spot can be used now.
 can(t){const k=this.kit,U=USES[t.use];if(!U||!this.on())return false;
  if(t.use==='drop')return !this.carry&&k.mission.drops.some(d=>d.item===t.item);
  if(stepOf(k,U.job)!==U.step||this.carry&&t.use!=='set'&&t.use!=='fill')return false;return !U.need||U.need(this);}
 // Using a spot: a fix opens, anything else is a moment standing still that the fight finishes (finish, below).
 use(t){const f=this.f;if(f.down||f.vault||f.searching||this.fix||!this.can(t))return false;const U=USES[t.use];
  if(U.fix){const first=!this.prog[U.fix];this.fix={t,kind:U.fix,g:this.prog[U.fix]??=this.fresh(U.fix),st:0};f.emit('fix',{t,kind:U.fix,first});return true;}
  if(t.use==='smash')f.alarm(t.x,t.y);if(t.use==='pry')this.loud(NOISE.pry,t);
  f.searching={t,time:0,need:U.time};f.emit('search',{t,job:U.job});return true;}
 fresh(kind){return kind==='pull'?{prime:0,pulls:0,c:0}:{k:0,c:0,dir:1};}
 // A noise: the heat, and every wanderer in earshot comes to see.
 loud(n,at){const f=this.f;f.noise(n.heat);for(const z of f.zombies)if(z.roam!==undefined&&z.hp>0&&!z.hunt&&Math.hypot(z.x-at.x,z.y-at.y)<n.far)f.notice(z);}
 // A use done: what it gives you, and the next step. A part you lift goes in your hands.
 finish(t){const f=this.f,u=t.use,U=USES[u];let k=this.kit,item=null;
  if(u==='drop'){this.liftAt={x:t.x,y:t.y};f.setKit(lift(k,t.item));this.place();f.emit('lift',{item:t.item,again:true});return;}
  if(u==='keys')k=give(k,'keys');else if(u==='check')k=give(k,'can');else if(u==='body')k=give(k,'shedkey');else if(u==='unlock')k=spend(k,'shedkey');
  else if(u==='set')k=delivered(k);else if(u==='fill')k=spend(delivered(k),'can');
  else{item=u==='smash'||u==='open'?'battery':u==='store'||u==='siphon'?'fuel':null;if(item){this.liftAt={x:t.x,y:t.y};k=lift(k,item);}}
  f.setKit(k);f.emit('chain',{line:u});if(item)f.emit('lift',{item});if(u==='siphon'&&f.rand()<NOISE.siphon)f.alarm(t.x,t.y);
  if(u!=='keys'&&u!=='check')this.next(U.job,u==='pry'?'bag':null);}
 // On to the next step (or a later one), and the job done after its last. Going down from here puts you back with the step done, and
 // a part in your hands back where you picked it up.
 next(id,to){const f=this.f,k=to?stepTo(this.kit,id,to):stepOn(this.kit,id,f.grid());f.setKit(k);
  if(k.mission.done.includes(id)){f.done(id);return;}f.snapshot=this.safe(k);f.emit('step',{job:id,step:stepOf(k,id)});}
 safe(k){return k.mission?.carry&&this.liftAt?setDown(k,this.liftAt.x,this.liftAt.y):k;}
 // Setting the part in your hands down where you stand (the swap button, a shove, firing the shotgun).
 putDown(){const f=this.f,m=f.model,item=this.carry;if(!item)return false;f.setKit(setDown(this.kit,Math.round(m.x),Math.round(m.y)));this.place();f.emit('setdown',{item});return true;}
 // The Use button during a fix.
 tap(){const x=this.fix,f=this.f,m=f.model;if(!x)return false;const g=x.g,F=FIX[x.kind];
  if(x.kind==='wire'){if(Math.abs(g.c-F.posts[g.k])<=F.half){g.k++;f.emit('fixhit',{kind:'wire',n:g.k});if(g.k>=F.posts.length)this.fixed();}else{f.emit('fixmiss',{kind:'wire'});this.loud(NOISE.spark,m);}return true;}
  if(x.kind==='tune'){const [c,h]=F.bands[g.k];if(Math.abs(g.c-c)<=h){g.k++;f.emit('fixhit',{kind:'tune',n:g.k});if(g.k>=F.bands.length)this.fixed();}else f.emit('fixmiss',{kind:'tune'});return true;}
  if(g.prime<F.prime){g.prime++;f.emit('prime',{n:g.prime});return true;}
  g.pulls++;this.loud(NOISE.pull,m);if(g.c>=F.zone[0]&&g.c<=F.zone[1]||g.pulls>=F.most)this.fixed();else f.emit('sputter',{n:g.pulls});g.c=0;return true;}
 fixed(){const x=this.fix;this.fix=null;delete this.prog[x.kind];if(x.kind==='pull'){this.hold=0;this.f.started(x.t);}this.f.emit('fixed',{kind:x.kind});this.next(USES[x.t.use].job);}
 stop(){if(!this.fix)return;this.fix=null;this.f.emit('fixstop');}
 // Bitten: the fix stops, and the wiring has to be started over.
 bitten(){const x=this.fix;if(!x)return;if(x.kind==='wire')x.g.k=0;this.stop();}
 // Each step of the fight's clock: the moving spots, a fix under way (walking off, shooting, diving or going down stops it), and the
 // hold under the light.
 update(dt,input={}){const f=this.f,m=f.model;this.place();if(!this.on())return;
  const x=this.fix;if(x){if(Math.hypot(Number(input.x)||0,Number(input.y)||0)>.25||input.fire||input.shove||f.down||f.vault||!this.can(x.t))this.stop();else this.run(x,dt);}
  if(stepOf(this.kit,'power')==='hold'&&!f.down){this.near=Math.hypot(m.x-HOLD_AT.x,(m.y-HOLD_AT.y)*1.2)<HOLD.r;this.hold=this.near?this.hold+dt:Math.max(0,this.hold-dt*HOLD.decay);if(this.hold>=HOLD.time){this.hold=0;this.next('power');}}}
 // A fix's cursor: the spark and the needle bounce end to end; the cord's pull runs bottom to top, over and over, once it is primed.
 run(x,dt){const g=x.g,F=FIX[x.kind];if(x.kind==='pull'){if(g.prime>=F.prime)g.c=(g.c+dt/F.time)%1;return;}
  g.c+=g.dir*F.speed*dt;if(g.c>1){g.c=2-g.c;g.dir=-1;}else if(g.c<0){g.c=-g.c;g.dir=1;}
  if(x.kind==='tune'&&(x.st-=dt)<=0){x.st=NOISE.static.every;this.loud(NOISE.static,this.f.model);this.f.emit('static');}}
 // The spots that move: her body, and each part where you set it down.
 place(){const k=this.kit,b=this.body(),T=this.T,put=(t,x,y,up)=>{t.x=x;t.y=y;t.mx=x;t.my=y-up;};
  if(T.body){if(b)put(T.body,b.x,b.y+8,34);else put(T.body,AWAY,AWAY,0);}
  for(const it of PARTS){const d=k.mission?.drops?.find(d=>d.item===it);if(T[it])if(d)put(T[it],d.x,d.y,16);else put(T[it],AWAY,AWAY,0);}}
 // Where to go that is not a spot: her, while she still walks about, and the light while you are away from it.
 marks(){const out=[];if(!this.on())return out;const k=this.kit,h=this.her();
  if(h&&stepOf(k,'supplies')==='hunt')out.push({mark:'Mrs. Hargrove',job:'supplies',x:h.x,y:h.y,mx:h.x,my:h.y-62});
  if(stepOf(k,'power')==='hold'&&!this.near)out.push({mark:'Light',job:'power',x:HOLD_AT.x,y:HOLD_AT.y,mx:HOLD_AT.x,my:HOLD_AT.y-50});return out;}
 // What the readout shows for a fix: its name, what to do, the zone to hit and the cursor (0 to 1), and how many of how many.
 view(){const x=this.fix;if(!x)return null;const g=x.g,F=FIX[x.kind];
  if(x.kind==='wire'){const p=F.posts[Math.min(g.k,F.posts.length-1)];return {kind:'wire',title:'Wiring',hint:'Tap as the spark crosses the post',zone:[p-F.half,p+F.half],cur:g.c,done:g.k,of:F.posts.length};}
  if(x.kind==='tune'){const [c,h]=F.bands[Math.min(g.k,F.bands.length-1)];return {kind:'tune',title:'Tuning',hint:'Tap as the needle finds the voice',zone:[c-h,c+h],cur:g.c,done:g.k,of:F.bands.length};}
  if(g.prime<F.prime)return {kind:'pull',title:'Priming',hint:'Tap to prime the bulb',zone:null,cur:g.prime/F.prime,done:g.prime,of:F.prime};
  return {kind:'pull',title:'Pull',hint:'Tap at the top of the pull',zone:F.zone,cur:g.c,done:g.pulls,of:F.most};}}
