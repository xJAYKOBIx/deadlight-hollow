import{ROOM,SOLIDS}from'./model.js';import{GUNS,GRENADES,normalizeLoadout}from'./equipment.js';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export class Practice{
 constructor(model,loadout){this.model=model;this.targets=[350,450,550].map((y,i)=>({id:i,x:904,y,hp:100,reset:0,flash:0}));this.traces=[];this.throws=[];this.fields=[];this.hits=0;this.damage=0;this.equip(loadout);}
 equip(value){this.loadout=normalizeLoadout(value);this.ammo=GUNS[this.loadout.gun]?.mag||0;this.cooldown=0;this.reloadTime=0;this.throwCooldown=0;this.aimAngle=null;}
 solid(x,y){return x<ROOM.left||x>ROOM.right||y<ROOM.top||y>ROOM.bottom||SOLIDS.some(b=>x>=b.x&&x<=b.x+b.w&&y>=b.y&&y<=b.y+b.h);}
 clear(a,b){let n=Math.ceil(Math.hypot(b.x-a.x,b.y-a.y)/3);for(let i=1;i<=n;i++)if(this.solid(a.x+(b.x-a.x)*i/n,a.y+(b.y-a.y)*i/n))return false;return true;}
 reload(){const gun=GUNS[this.loadout.gun];if(gun&&!this.reloadTime&&this.ammo<gun.mag)this.reloadTime=gun.reload;}
 hurt(t,amount){if(t.hp<=0)return;const n=Math.min(t.hp,amount);t.hp-=n;t.flash=.14;this.damage+=n;if(t.hp<=0)t.reset=2;}
 fire(){const gun=GUNS[this.loadout.gun];if(!gun||this.cooldown>0||this.reloadTime>0)return false;if(!this.ammo){this.reload();return false;}this.ammo--;this.cooldown=gun.interval;const angle=this.aimAngle??this.model.direction*Math.PI/4,dx=Math.cos(angle),dy=Math.sin(angle),m=this.model;let end={x:m.x,y:m.y},hit=false;
 for(let distance=2;distance<=gun.range;distance+=2){const x=m.x+dx*distance,y=m.y+dy*distance;if(this.solid(x,y))break;end={x,y};const t=this.targets.find(t=>t.hp>0&&Math.hypot(t.x-x,t.y-y)<14);if(t){this.hurt(t,gun.damage);this.hits++;hit=true;break;}}
 this.traces.push({x:m.x,y:m.y,ex:end.x,ey:end.y,life:.12,hit});return true;
 }
 throwGrenade(){if(this.throwCooldown>0)return false;const m=this.model,a=this.aimAngle??m.direction*Math.PI/4;let end={x:m.x,y:m.y};for(let d=4;d<=240;d+=4){let x=m.x+Math.cos(a)*d,y=m.y+Math.sin(a)*d;if(this.solid(x,y))break;end={x,y};}this.throws.push({sx:m.x,sy:m.y,x:m.x,y:m.y,ex:end.x,ey:end.y,age:0,kind:this.loadout.grenade});this.throwCooldown=1.5;return true;}
 detonate(g){let data=GRENADES[g.kind];this.fields.push({x:g.ex,y:g.ey,kind:g.kind,age:0,life:data.duration,radius:data.radius});if(g.kind==='explosive')for(const t of this.targets){let dist=Math.hypot(t.x-g.ex,t.y-g.ey);if(dist<data.radius&&this.clear(g,t))this.hurt(t,120*(1-dist/data.radius*.6));}}
 reset(){this.traces=[];this.throws=[];this.fields=[];this.hits=0;this.damage=0;for(const t of this.targets){t.hp=100;t.reset=0;t.flash=0;}this.equip(this.loadout);}
 update(dt,input={}){dt=clamp(Number(dt)||0,0,.05);this.cooldown=Math.max(0,this.cooldown-dt);this.throwCooldown=Math.max(0,this.throwCooldown-dt);if(this.reloadTime){this.reloadTime=Math.max(0,this.reloadTime-dt);if(!this.reloadTime)this.ammo=GUNS[this.loadout.gun]?.mag||0;}
 this.aimAngle=Number.isFinite(input.aimX)&&Number.isFinite(input.aimY)&&Math.hypot(input.aimX,input.aimY)>.1?Math.atan2(input.aimY,input.aimX):null;if(this.aimAngle!==null)this.model.direction=(Math.round(this.aimAngle/(Math.PI/4))+8)%8;
 if(input.fire)this.fire();for(const t of this.targets){t.flash=Math.max(0,t.flash-dt);if(t.reset){t.reset=Math.max(0,t.reset-dt);if(!t.reset)t.hp=100;}}
 for(const t of this.traces)t.life-=dt;this.traces=this.traces.filter(t=>t.life>0);
 for(const g of this.throws){g.age+=dt;let a=Math.min(1,g.age/.7);g.x=g.sx+(g.ex-g.sx)*a;g.y=g.sy+(g.ey-g.sy)*a;if(g.age>=1)this.detonate(g);}this.throws=this.throws.filter(g=>g.age<1);
 for(const f of this.fields){f.age+=dt;f.life-=dt;if(f.kind==='incendiary')for(const t of this.targets)if(Math.hypot(t.x-f.x,t.y-f.y)<f.radius&&this.clear(f,t))this.hurt(t,32*dt);}this.fields=this.fields.filter(f=>f.life>0);
 }
}
