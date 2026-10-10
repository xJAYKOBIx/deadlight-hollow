// Fishing, cooking and stamina for Firelight Camp. Pure rules with no drawing, so they can be tested and tuned.
export const FISH=[
 {id:'perch',name:'Sand perch',weight:[.3,.9],power:.8,reel:1.25,tier:.8,chance:.42},
 {id:'mackerel',name:'Inlet mackerel',weight:[.5,1.4],power:1,reel:1.05,tier:1,chance:.33},
 {id:'cod',name:'Rock cod',weight:[1.2,3.2],power:1.25,reel:.85,tier:1.2,chance:.19},
 {id:'moonfin',name:'Moonfin',weight:[1.8,4.2],power:1.5,reel:.75,tier:1.5,chance:.06,rare:true}];
export const FISH_BY_ID=Object.fromEntries(FISH.map(f=>[f.id,f]));
export const BASKET_SIZE=12;
export function pickFish(rand=Math.random){let r=rand(),fish=FISH[0];for(const f of FISH){if(r<f.chance){fish=f;break;}r-=f.chance;}const [lo,hi]=fish.weight,t=rand();return {id:fish.id,w:Math.round((lo+(hi-lo)*t*t*.6+(hi-lo)*t*.4)*100)/100};}
export function sizeLabel(c){const f=FISH_BY_ID[c.id],t=(c.w-f.weight[0])/(f.weight[1]-f.weight[0]);return t<.35?'Small':t<.75?'Good size':'Trophy';}
// The rod's "back" is away from the water. The pier faces east, so pulling back means pulling west.
export const CAST_DIR={x:1,y:0};
const PULLS=[{x:1,y:0,name:'away'},{x:0,y:-1,name:'up'},{x:0,y:1,name:'down'}];
export const RULES={wait:[2.5,6],bite:1,hookPull:.55,deadzone:.4,pull:[1,2],slack:[2.2,3.4],reel:.2,
 tension:{counter:-.45,neutral:.18,against:.6,reelFight:.8,slack:-.5},tire:.34};
// Is the stick holding against the fish, going with it, or neither?
export function stance(input,pull){const m=Math.hypot(input.x,input.y);if(m<RULES.deadzone)return 'neutral';const d=-(input.x*pull.x+input.y*pull.y)/m;return d>.55?'counter':d<-.2?'with':'neutral';}
export class Fishing{
 constructor(rand=Math.random){this.rand=rand;this.reset();}
 reset(){Object.assign(this,{state:'ready',t:0,tension:0,line:1,fight:0,pull:null,timer:0,catch:null,events:[],nibble:0});}
 between(a,b){return a+(b-a)*this.rand();}
 emit(e){this.events.push(e);}
 cast(){if(!['ready','landed','snapped','lost','early'].includes(this.state))return false;this.reset();this.state='cast';this.timer=.7;this.emit('cast');return true;}
 get fish(){return this.catch&&FISH_BY_ID[this.catch.id];}
 update(dt,input={x:0,y:0,reel:false}){dt=Math.max(0,Math.min(.1,dt));this.t+=dt;const s=this.state,f=this.fish,back=-(input.x*CAST_DIR.x+input.y*CAST_DIR.y);
  if(s==='cast'){if((this.timer-=dt)<=0){this.state='wait';this.timer=this.between(...RULES.wait);this.emit('splash');}return;}
  if(s==='wait'){this.nibble=Math.max(0,this.nibble-dt);if(this.rand()<dt*.35&&this.timer>.8)this.nibble=.35;
   // Yanking before the bite spooks the fish: the wait starts over.
   if(back>RULES.hookPull){this.state='early';this.timer=1.2;this.emit('early');return;}
   if((this.timer-=dt)<=0){this.catch=pickFish(this.rand);this.state='bite';this.timer=RULES.bite/Math.pow(this.fish.power,.3);this.emit('bite');}return;}
  if(s==='early'){if((this.timer-=dt)<=0){this.state='wait';this.timer=this.between(...RULES.wait);}return;}
  if(s==='bite'){if(back>RULES.hookPull){this.state='fight';this.fight=1;this.newPull();this.emit('hooked');return;}if((this.timer-=dt)<=0){this.state='lost';this.emit('stole');}return;}
  if(s==='fight'){if((this.timer-=dt)<=0)this.newPull();const st=stance(input,this.pull),T=RULES.tension;
   this.tension+=(st==='counter'?T.counter:(st==='with'?T.against:T.neutral)*f.power)*dt;if(input.reel)this.tension+=T.reelFight*dt;
   if(st==='counter')this.fight-=RULES.tire*dt/Math.sqrt(f.power);this.tension=Math.max(0,this.tension);this.stance=st;
   if(this.tension>=1){this.tension=1;this.state='snapped';this.emit('snap');return;}
   if(this.fight<=0){this.state='slack';this.pull=null;this.timer=this.between(...RULES.slack);this.emit('tired');}return;}
  if(s==='slack'){this.tension=Math.max(0,this.tension+RULES.tension.slack*dt);
   if(input.reel){const typical=(f.weight[0]+f.weight[1])/2;this.line-=RULES.reel*f.reel*Math.pow(typical/this.catch.w,.3)*dt;}
   if(this.line<=0){this.line=0;this.state='landed';this.emit('landed');return;}
   if((this.timer-=dt)<=0){this.state='fight';this.fight=this.between(.55,.9);this.newPull();this.emit('fights');}return;}}
 newPull(){const options=PULLS.filter(p=>p!==this.pull);this.pull=options[Math.floor(this.rand()*options.length)];this.timer=this.between(...RULES.pull)/Math.pow(this.fish.power,.3);this.emit('pull');}
}
// Grilling: the fish browns on the spit; take it off in the right window.
export const COOK={rate:.2,done:.55,perfect:.72,burnt:.84};
export const QUALITY={raw:{name:'Underdone',q:.35},done:{name:'Well done',q:.8},perfect:{name:'Perfect',q:1.15},burnt:{name:'Burnt',q:.45}};
export function cookQuality(p){return p<COOK.done?'raw':p<COOK.perfect?'done':p<COOK.burnt?'perfect':'burnt';}
// A grilled fish raises stamina until the next mission. Bigger fish, better fish and better cooking give more.
export function grilledBuff(c,quality){const f=FISH_BY_ID[c.id],typical=(f.weight[0]+f.weight[1])/2,s=Math.max(.5,Math.min(1.8,c.w/typical*f.tier)),q=QUALITY[quality].q;
 return {fish:c.id,w:c.w,quality,max:Math.round(Math.max(8,Math.min(70,12+30*q*s))),regen:Math.round((1+.45*q*s)*100)/100};}
// Stamina: running drains it; it refills after a short rest. Run it dry and you are winded until it is partly back.
export const STAMINA={base:100,drain:22,regen:15,delay:.7,recover:.3};
export class Stamina{
 constructor(){this.buff=null;this.value=STAMINA.base;this.rest=0;this.winded=false;}
 get max(){return STAMINA.base+(this.buff?.max||0);}
 setBuff(b){const full=this.value>=this.max-.01;this.buff=b||null;if(full||this.value>this.max)this.value=this.max;}
 canRun(){return !this.winded&&this.value>0;}
 update(dt,running,drain=1){dt=Math.max(0,Math.min(.1,dt));if(running){this.value-=STAMINA.drain*drain*dt;this.rest=0;if(this.value<=0){this.value=0;this.winded=true;}}
  else if((this.rest+=dt)>STAMINA.delay)this.value+=STAMINA.regen*(this.buff?.regen||1)*dt;
  this.value=Math.min(this.max,this.value);if(this.winded&&this.value>=this.max*STAMINA.recover)this.winded=false;}
}
// What camp remembers between visits: the basket, the current meal, and a tally of catches.
export const CAMP_KEY='deadlight-camp-v1';
export function normalizeCamp(v){const basket=Array.isArray(v?.basket)?v.basket.filter(c=>FISH_BY_ID[c?.id]&&Number.isFinite(c.w)&&c.w>0).slice(0,BASKET_SIZE).map(c=>({id:c.id,w:Math.round(c.w*100)/100})):[];
 const b=v?.buff,buff=b&&FISH_BY_ID[b.fish]&&QUALITY[b.quality]&&Number.isFinite(b.w)?grilledBuff({id:b.fish,w:b.w},b.quality):null;
 const caught={};for(const f of FISH){const n=v?.caught?.[f.id];if(Number.isInteger(n)&&n>0)caught[f.id]=n;}return {basket,buff,caught};}
export function readCamp(storage){try{return normalizeCamp(JSON.parse(storage.getItem(CAMP_KEY)));}catch{return normalizeCamp();}}
export function saveCamp(storage,v){try{storage.setItem(CAMP_KEY,JSON.stringify(normalizeCamp(v)));return true;}catch{return false;}}
export function addToBasket(camp,c){camp.caught[c.id]=(camp.caught[c.id]||0)+1;if(camp.basket.length>=BASKET_SIZE)return false;camp.basket.push(c);return true;}
// Cooking takes the biggest fish of the chosen kind, so the player never has to sort the basket.
export function takeFromBasket(camp,id){let best=-1;camp.basket.forEach((c,i)=>{if(c.id===id&&(best<0||c.w>camp.basket[best].w))best=i;});return best<0?null:camp.basket.splice(best,1)[0];}
export function basketSummary(camp){return FISH.map(f=>({...f,count:camp.basket.filter(c=>c.id===f.id).length})).filter(f=>f.count);}
