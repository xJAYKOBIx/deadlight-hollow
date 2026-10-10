import{ROOM,SOLIDS}from'./model.js';import{TARGETS}from'../grounds/data.js';import{GUNS,GRENADES,PAINT,normalizeLoadout,muzzle}from'./equipment.js';import{Drill}from'./drill.js';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
// Every gun in the Training Grounds fires paint. Whether a shot hits is decided at once; the ball and its splat follow at paintball speed.
export const BALL_SPEED=900,MAX_MARKS=14;
export class Practice{
 constructor(model,loadout){this.model=model;this.mods={mag:1,reload:1};this.targets=TARGETS.map(t=>({...t,hp:100,reset:0,flash:0,paint:[]}));this.traces=[];this.throws=[];this.fields=[];this.marks=[];this.markGen=0;this.seed=1;this.hits=0;this.shots=0;this.damage=0;this.drill=new Drill(this);this.equip(loadout);}
 // Aaron's shop: a bigger hopper holds more paint, a speed loader reloads faster.
 setMods(mods={}){this.mods={mag:mods.mag||1,reload:mods.reload||1};this.ammo=Math.min(this.ammo,this.mag);}
 get mag(){return Math.round((GUNS[this.loadout.gun]?.mag||0)*this.mods.mag);}
 get reloadFull(){return (GUNS[this.loadout.gun]?.reload||0)*this.mods.reload;}
 equip(value){this.loadout=normalizeLoadout(value);this.ammo=this.mag;this.cooldown=0;this.reloadTime=0;this.throwCooldown=0;this.aimAngle=null;}
 get paint(){return PAINT[this.loadout.gun]||'#e0457b';}
 // Paint flies through windows.
 solidAt(x,y){return SOLIDS.find(b=>!b.window&&x>=b.x&&x<=b.x+b.w&&y>=b.y&&y<=b.y+b.h);}
 solid(x,y){return x<ROOM.left||x>ROOM.right||y<ROOM.top||y>ROOM.bottom||!!this.solidAt(x,y);}
 clear(a,b){let n=Math.ceil(Math.hypot(b.x-a.x,b.y-a.y)/3);for(let i=1;i<=n;i++)if(this.solid(a.x+(b.x-a.x)*i/n,a.y+(b.y-a.y)*i/n))return false;return true;}
 reload(){const gun=GUNS[this.loadout.gun];if(gun&&!this.reloadTime&&this.ammo<this.mag)this.reloadTime=this.reloadFull;}
 hurt(t,amount){if(t.hp<=0)return;const n=Math.min(t.hp,amount);t.hp-=n;t.flash=.14;this.damage+=n;if(t.hp<=0)t.reset=2;}
 // A shotgun can fire while it is loading shells (that stops the loading); everything else waits for the reload.
 fire(){const gun=GUNS[this.loadout.gun];if(!gun||this.cooldown>0)return false;if(this.reloadTime>0){if(!gun.shells||!this.ammo)return false;this.reloadTime=0;}if(!this.ammo){this.reload();return false;}this.ammo--;this.shots++;this.cooldown=gun.interval;
  const angle=this.aimAngle??this.model.direction*Math.PI/4,n=gun.pellets||1;let hit=false;
  // Pellets fan out evenly across the spread, each with a little jitter, so a shotgun blast covers the same cone every time.
  for(let k=0;k<n;k++){const off=n>1?((k/(n-1))-.5)*gun.spread+(((this.seed*(k*53+11))%13)/13-.5)*gun.spread/(n*1.5):0;hit=this.ball(angle+off,gun,k>0)||hit;}this.seed++;
  if(hit)this.hits++;return true;}
 // One ball (or pellet) along a line: it stops at the first target, robot or piece of cover.
 ball(angle,gun,pellet=false){const dx=Math.cos(angle),dy=Math.sin(angle),m=this.model;let end={x:m.x,y:m.y},hit=false,onto=null;
 for(let distance=2;distance<=gun.range;distance+=2){const x=m.x+dx*distance,y=m.y+dy*distance;if(x<ROOM.left||x>ROOM.right||y<ROOM.top||y>ROOM.bottom){onto={kind:'floor'};break;}const b=this.solidAt(x,y);if(b){onto={kind:'prop',ref:b};break;}end={x,y};
  const t=this.targets.find(t=>t.hp>0&&Math.hypot(t.x-x,t.y-y)<14);if(t){this.hurt(t,gun.damage);hit=true;onto={kind:'target',ref:t};break;}
  const bot=this.drill.hit(x,y);if(bot){// Dead centre is a headshot.
   const head=Math.abs(dx*(bot.y-m.y)-dy*(bot.x-m.x))<4.5;this.drill.hurt(bot,gun.damage,{gun:this.loadout.gun,dx,dy,head});hit=true;onto={kind:'bot',ref:bot};break;}}
 const dur=Math.hypot(end.x-m.x,end.y-m.y)/BALL_SPEED;// The ball leaves the end of the barrel you see (ox, oy from the feet) and meets the line of fire where it lands.
 const mz=muzzle(angle,this.loadout.gun);this.traces.push({x:m.x,y:m.y,ex:end.x,ey:end.y,ox:mz.x,oy:mz.y,age:0,dur,life:dur+.14,hit,col:this.paint,onto:onto||{kind:'floor'},done:false,pellet});return hit;
 }
 // Where a ball lands it leaves paint: on the robot, the target, the cover it hit, or the floor.
 land(t){t.done=true;const seed=this.seed++,s=1.6+(seed*37%10)/10,j=k=>((seed*(k*131+7))%17)/17-.5,o=t.onto;
  if(o.kind==='bot'||o.kind==='target'){const list=o.ref.paint,big=o.ref.kind==='brute';list.push({x:j(1)*(big?36:16),y:big?-44+j(2)*40:-30+j(2)*18,s,col:t.col,seed});if(list.length>MAX_MARKS)list.shift();return;}
  this.marks.push({kind:o.kind,id:o.ref?.id,x:t.ex,y:t.ey,fx:t.x,fy:t.y,s:o.kind==='floor'?s+.6:s,col:t.col,seed});}
 throwGrenade(){if(this.throwCooldown>0)return false;const m=this.model,a=this.aimAngle??m.direction*Math.PI/4;let end={x:m.x,y:m.y};for(let d=4;d<=240;d+=4){let x=m.x+Math.cos(a)*d,y=m.y+Math.sin(a)*d;if(this.solid(x,y))break;end={x,y};}this.throws.push({sx:m.x,sy:m.y,x:m.x,y:m.y,ex:end.x,ey:end.y,age:0,kind:this.loadout.grenade});this.throwCooldown=1.5;return true;}
 detonate(g){let data=GRENADES[g.kind];this.fields.push({x:g.ex,y:g.ey,kind:g.kind,age:0,life:data.duration,radius:data.radius});if(g.kind==='explosive'){const blast=(t,hurt)=>{let dist=Math.hypot(t.x-g.ex,t.y-g.ey);if(dist<data.radius&&this.clear(g,t))hurt(t,120*(1-dist/data.radius*.6));};for(const t of this.targets)blast(t,(t,n)=>this.hurt(t,n));for(const b of this.drill.bots)blast(b,(b,n)=>this.drill.hurt(b,n,{explosive:true}));}}
 reset(){this.traces=[];this.throws=[];this.fields=[];this.marks=[];this.markGen++;this.hits=0;this.shots=0;this.damage=0;this.drill.stop();for(const t of this.targets){t.hp=100;t.reset=0;t.flash=0;t.paint=[];}this.equip(this.loadout);}
 update(dt,input={}){dt=clamp(Number(dt)||0,0,.05);this.cooldown=Math.max(0,this.cooldown-dt);this.throwCooldown=Math.max(0,this.throwCooldown-dt);if(this.reloadTime){this.reloadTime=Math.max(0,this.reloadTime-dt);if(!this.reloadTime){// A shotgun loads a shell at a time and keeps going until the tube is full.
 if(GUNS[this.loadout.gun]?.shells){this.ammo=Math.min(this.mag,this.ammo+1);if(this.ammo<this.mag)this.reloadTime=this.reloadFull;}else this.ammo=this.mag;}}
 // Down and waiting for Gadget: no moving, no shooting.
 if(this.drill.downed)input={};
 this.aimAngle=Number.isFinite(input.aimX)&&Number.isFinite(input.aimY)&&Math.hypot(input.aimX,input.aimY)>.1?Math.atan2(input.aimY,input.aimX):null;if(this.aimAngle!==null)this.model.direction=(Math.round(this.aimAngle/(Math.PI/4))+8)%8;
 if(input.fire)this.fire();for(const t of this.targets){t.flash=Math.max(0,t.flash-dt);if(t.reset){t.reset=Math.max(0,t.reset-dt);if(!t.reset)t.hp=100;}}
 for(const t of this.traces){t.age+=dt;t.life-=dt;if(!t.done&&t.age>=t.dur)this.land(t);}this.traces=this.traces.filter(t=>t.life>0);
 for(const g of this.throws){g.age+=dt;let a=Math.min(1,g.age/.7);g.x=g.sx+(g.ex-g.sx)*a;g.y=g.sy+(g.ey-g.sy)*a;if(g.age>=1)this.detonate(g);}this.throws=this.throws.filter(g=>g.age<1);
 for(const f of this.fields){f.age+=dt;f.life-=dt;if(f.kind==='incendiary'){for(const t of this.targets)if(Math.hypot(t.x-f.x,t.y-f.y)<f.radius&&this.clear(f,t))this.hurt(t,32*dt);for(const b of this.drill.bots)if(Math.hypot(b.x-f.x,b.y-f.y)<f.radius&&this.clear(f,b))this.drill.hurt(b,32*dt);}}this.fields=this.fields.filter(f=>f.life>0);
 this.drill.update(dt,this.model);
 }
}
