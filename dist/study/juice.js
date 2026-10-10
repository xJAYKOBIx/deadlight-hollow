// Combat feel for the Training Grounds (v0.28). Everything here is decoration read off the practice state: it never changes the fight.
// Shots light the room for a moment, paint balls burst, robots pop in sparks and smoke when they fall, the camera shakes a little and
// the game holds for a few hundredths of a second on a kill. Robots about to act show a tell above their heads. Haze drifts through the
// lamp light. Low effects quality keeps the flashes, shakes and tells and drops the haze and half the particles.
const GRAVITY=260,hex=c=>typeof c==='number'?c:parseInt(String(c).slice(1,7),16);
export const STOP={down:.045,brute:.11,boom:.07};
export const SHAKE={down:[90,.0018],brute:[260,.006],stun:[200,.0045],hurt:[140,.0035],boom:[300,.008]};
const TELL={brute:0xff4a3a,spitter:0x8fd14f,runner:0xff9a52,husk:0xffe27a,shambler:0xffe27a};
export class Juice{
 constructor(scene,{quality,world,reduced=false}={}){this.scene=scene;this.quality=quality;this.reduced=reduced;this.parts=[];this.rings=[];this.stopUntil=0;this.lastHp=null;
  const ADD=Phaser.BlendModes.ADD,tx=scene.textures;
  if(!tx.exists('tg-puff')){const t=tx.createCanvas('tg-puff',32,32),c=t.context,g=c.createRadialGradient(16,16,0,16,16,16);g.addColorStop(0,'rgba(255,255,255,.9)');g.addColorStop(.55,'rgba(255,255,255,.35)');g.addColorStop(1,'rgba(255,255,255,0)');c.fillStyle=g;c.fillRect(0,0,32,32);t.refresh();t.setFilter?.(Phaser.Textures.FilterMode.LINEAR);}
  if(!tx.exists('tg-haze')){const S=128,t=tx.createCanvas('tg-haze',S,S),c=t.context,img=c.createImageData(S,S),d=img.data;
   // Tileable soft noise: a few wrapped sine octaves, so the haze repeats without a seam.
   for(let y=0;y<S;y++)for(let x=0;x<S;x++){const u=x/S*Math.PI*2,v=y/S*Math.PI*2,n=.5+.22*Math.sin(u+2*Math.sin(v))+.16*Math.sin(2*v+Math.sin(2*u)+1)+.12*Math.sin(3*u+3*v+2)*Math.sin(v*2),i=(y*S+x)*4;
    d[i]=d[i+1]=d[i+2]=255;d[i+3]=Math.max(0,Math.min(255,(n-.35)*1.6*255));}
   c.putImageData(img,0,0);t.refresh();t.setFilter?.(Phaser.Textures.FilterMode.LINEAR);}
  // Haze sits under the lighting, so it glows in the lamp pools and vanishes in the dark between them.
  this.haze=world&&scene.add.tileSprite?scene.add.tileSprite(0,0,world.w,world.h,'tg-haze').setOrigin(0).setDepth(5900).setAlpha(.075):null;this.haze?.setTint?.(0xc8d6ec);this.haze?.setTileScale?.(4,3);
  this.flashes=[];this.flashPool=[];this.puffs=[];this.puffPool=[];this.add=(key,blend)=>{const img=scene.add.image(0,0,key);if(blend)img.setBlendMode(blend);return img;};this.ADD=ADD;
  this.g=scene.add.graphics().setDepth(6003);this.apply();quality?.onChange?.(()=>this.apply());}
 get low(){return !!this.quality?.low;}
 apply(){this.haze?.setVisible(!this.low);}
 // True while the game holds still on a hit.
 stopped(now){return now<this.stopUntil;}
 hold(now,s){this.stopUntil=Math.max(this.stopUntil,now+s*1000);}
 shake(kind){if(this.reduced)return;const [ms,k]=SHAKE[kind];this.scene.cameras.main.shake?.(ms,k);}
 flash(x,y,scale,alpha,life,warm=true){const img=this.flashPool.pop()||this.add(warm?'tg-glow-warm':'tg-glow',this.ADD).setDepth(6001);img.setTexture?.(warm?'tg-glow-warm':'tg-glow');img.setVisible(true).setPosition(x,y).setScale(scale).setAlpha(alpha);this.flashes.push({img,alpha,life,age:0});}
 puff(x,y,size,tint,life,vy=-14){const img=this.puffPool.pop()||this.add('tg-puff').setDepth(5600);img.setVisible(true).setPosition(x,y).setScale(size*.4);img.setTint?.(tint);this.puffs.push({img,size,life,age:0,vy,vx:(Math.random()-.5)*10});}
 bits(n,x,y,o){if(this.low)n=Math.ceil(n/2);for(let i=0;i<n;i++){const a=(o.dir??-Math.PI/2)+(Math.random()-.5)*(o.spread??Math.PI*2),v=o.speed*(.5+Math.random()*.7);
  this.parts.push({x,y,z:o.z??0,vx:Math.cos(a)*v,vy:Math.sin(a)*v*.6,vz:(o.lift??60)*(.5+Math.random()),col:o.col,life:o.life*(.7+Math.random()*.6),age:0,kind:o.kind,len:o.len||0});}}
 ring(x,y,r,col,life,width=1){this.rings.push({x,y,r,col,life,age:0,width});}
 // Read the practice state once a frame: new shots, landed balls, fallen robots, stuns, hits on you and grenades going off.
 watch(now,p){const d=p.drill;
  for(const t of p.traces){if(!t._seen){t._seen=true;const dx=t.ex-t.x,dy=t.ey-t.y,mx=t.x+(t.ox??0),my=t.y+(t.oy??-34);
    this.flash(mx,my,.4,.5,.07);this.flash(t.x,t.y-24,1.15,.13,.09);this.bits(2,mx,my,{dir:Math.atan2(dy,dx),spread:.6,speed:40,lift:8,z:0,col:0xf4efe2,life:.18,kind:'mist'});}
   if(t.done&&!t._burst){t._burst=true;const h=t.onto?.kind==='floor'?0:30,col=hex(t.col);this.bits(9,t.ex,t.ey,{speed:70,lift:70,z:h,col,life:.45,kind:'drop'});this.ring(t.ex,t.ey-h,9,col,.18);}}
  for(const b of d.bots){const big=b.kind==='brute';
   if(b.hp<=0&&!b._popped){b._popped=true;const y=b.y-(big?30:18);this.flash(b.x,y,big?1.1:.6,.6,.14);this.bits(big?22:12,b.x,b.y,{speed:big?120:90,lift:90,z:big?30:18,col:0xffe9a8,life:.35,kind:'spark',len:3});
    this.bits(big?8:4,b.x,b.y,{speed:60,lift:110,z:big?28:16,col:0x5f646b,life:.9,kind:'debris'});this.puff(b.x,y,big?1.6:1,0x7a7d82,1.1);this.puff(b.x+6,y-4,big?1.2:.7,0x9a9ca0,.9);
    if(!b.off){this.hold(now,big?STOP.brute:STOP.down);this.shake(big?'brute':'down');}}
   if(b.stun>0&&!b._stunned){b._stunned=true;this.shake('stun');this.ring(b.x,b.y,30,0xffe27a,.35,2);}else if(!(b.stun>0))b._stunned=false;}
  if(d.holdout&&d.state==='run'){if(this.lastHp!=null&&d.hp<this.lastHp-.01)this.shake('hurt');this.lastHp=d.hp;}else this.lastHp=null;
  for(const f of p.fields){if(!f._seen){f._seen=true;if(f.kind!=='smoke'&&f.kind!=='incendiary'){this.flash(f.x,f.y-16,1.8,.7,.22);this.bits(16,f.x,f.y,{speed:150,lift:100,z:10,col:0xffd995,life:.4,kind:'spark',len:3});this.puff(f.x,f.y-14,2,0x8a8c90,1.4);this.hold(now,STOP.boom);this.shake('boom');}}}}
 update(now,dt,p){this.watch(now,p);const g=this.g;g.clear();
  if(this.haze&&!this.low){this.haze.tilePositionX+=dt*6;this.haze.tilePositionY+=dt*2.2;}
  this.flashes=this.flashes.filter(f=>{f.age+=dt;const k=f.age/f.life;if(k>=1){f.img.setVisible(false);this.flashPool.push(f.img);return false;}f.img.setAlpha(f.alpha*(1-k)*(1-k));return true;});
  this.puffs=this.puffs.filter(f=>{f.age+=dt;const k=f.age/f.life;if(k>=1){f.img.setVisible(false);this.puffPool.push(f.img);return false;}f.img.setPosition(f.img.x+f.vx*dt,f.img.y+f.vy*dt);f.img.setScale(f.size*(.4+k*.9)).setAlpha(.45*(1-k)*Math.min(1,k*6));return true;});
  // Sparks streak, drops and debris arc and land; all of it is drawn above the lighting so it reads in the dark.
  this.parts=this.parts.filter(q=>{q.age+=dt;if(q.age>=q.life)return false;q.x+=q.vx*dt;q.y+=q.vy*dt;q.vz-=GRAVITY*dt;q.z+=q.vz*dt;if(q.z<0){if(q.kind==='debris'&&q.vz<-40){q.z=0;q.vz*=-.35;q.vx*=.5;q.vy*=.5;}else if(q.kind!=='mist'){q.z=0;q.vx=q.vy=q.vz=0;}}
   const a=1-q.age/q.life,x=Math.round(q.x*2)/2,y=Math.round((q.y-q.z)*2)/2;
   if(q.kind==='spark'){g.lineStyle(1,q.col,a);g.lineBetween(x,y,x-q.vx*.03*q.len,y-(q.vy-q.vz)*.03*q.len);}
   else if(q.kind==='debris'){g.fillStyle(0x16181c,a).fillRect(x-1,y-1,2.5,2);g.fillStyle(q.col,a).fillRect(x-.5,y-.5,1.5,1);}
   else if(q.kind==='mist'){g.fillStyle(q.col,a*.5).fillRect(x,y,1,1);}
   else{g.fillStyle(q.col,Math.min(1,a*1.6)).fillRect(x-.5,y-.5,q.z>0?1:1.5,q.z>0?1.5:1);}return true;});
  this.rings=this.rings.filter(r=>{r.age+=dt;const k=r.age/r.life;if(k>=1)return false;g.lineStyle(r.width,r.col,.8*(1-k));g.strokeEllipse(r.x,r.y,r.r*2*(.3+k),r.r*1.3*(.3+k));return true;});
  // Tells: a pip above anything about to act, in its colour. A brute winding up also marks the floor it is about to hit.
  const t=now/1000;for(const b of p.drill.bots){if(!(b.tell>0)||b.hp<=0)continue;const big=b.kind==='brute',col=TELL[b.kind]||0xffe27a,y=b.y-(big?92:60)+Math.sin(t*14)*1.5;
   g.fillStyle(0x111319,1).fillRect(b.x-2.5,y-9,5,11).fillRect(b.x-2.5,y+3,5,5);g.fillStyle(col,1).fillRect(b.x-1.5,y-8,3,9).fillRect(b.x-1.5,y+4,3,3);
   if(big){const k=(t*3)%1;g.lineStyle(1.5,0xff4a3a,.5+.3*Math.sin(t*20));g.strokeEllipse(b.x,b.y,96,48);g.lineStyle(1,0xff4a3a,.6*(1-k));g.strokeEllipse(b.x,b.y,96*k,48*k);}
   else if(b.kind==='runner'){const k=(t*2.5)%1;g.lineStyle(1,col,.6*(1-k));g.strokeEllipse(b.x,b.y-20,20+k*40,12+k*24);}}}
}
