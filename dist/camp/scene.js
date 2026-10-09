import {survivor,FRAME,FRAME_COUNT} from '../study/character.js';
import {CAMP,PROPS,RESIDENTS,LIGHTS} from './data.js';
import {groundArt,frontArt,FRONT_Y,propArt,PROP_PAD,flameArt,FLAME,lightArt,LIGHT_SCALE,glowArt,iconArt,ICON,ICONS,shoreX,hash} from './art.js';
// Residents turn to face you when you come close.
const FACE_RANGE=130;
const facing=(dx,dy)=>(Math.round(Math.atan2(dy,dx)/(Math.PI/4))+8)%8;
export function makeCampScene(model,bridge){return class Camp extends Phaser.Scene{
 constructor(){super('Camp');}
 texture(key,w,h,draw){if(this.textures.exists(key))return this.textures.get(key);const t=this.textures.createCanvas(key,w,h);draw(t.context);t.refresh();return t;}
 create(){
  this.texture('camp-ground',CAMP.w*2,CAMP.h*2,groundArt);this.add.image(0,0,'camp-ground').setOrigin(0).setScale(.5).setDepth(-10);
  this.water=this.add.graphics().setDepth(-5);
  for(const o of PROPS){this.texture('camp-'+o.id,(o.w+PROP_PAD*2)*2,(o.h+o.z+PROP_PAD*2)*2,c=>propArt(c,o));this.add.image(o.x-PROP_PAD,o.y-o.z-PROP_PAD,'camp-'+o.id).setOrigin(0).setScale(.5).setDepth(o.flat?0:o.y+o.h);}
  const flames=this.texture('camp-flame',FLAME.w*2*FLAME.frames,FLAME.h*2,flameArt);for(let f=0;f<FLAME.frames;f++)if(!flames.has(f))flames.add(f,0,f*FLAME.w*2,0,FLAME.w*2,FLAME.h*2);
  const fire=PROPS.find(o=>o.id==='fire'),pot=PROPS.find(o=>o.id==='pot');
  this.flame=this.add.image(fire.x+fire.w/2,fire.y+16,'camp-flame',0).setOrigin(FLAME.ax/FLAME.w,FLAME.ay/FLAME.h).setScale(.5).setDepth(fire.y+fire.h+1);
  this.potFlame=this.add.image(pot.x+pot.w/2,pot.y+20,'camp-flame',2).setOrigin(FLAME.ax/FLAME.w,FLAME.ay/FLAME.h).setScale(.16).setDepth(pot.y+pot.h-1);
  this.texture('camp-front',CAMP.w*2,(CAMP.h-FRONT_Y)*2,frontArt);this.add.image(0,FRONT_Y,'camp-front').setOrigin(0).setScale(.5).setDepth(5000);
  // Residents: the eight idle facings, drawn once with the character painter.
  this.residents=RESIDENTS.map(p=>{const key='camp-res-'+p.id,t=this.texture(key,FRAME.w*8,FRAME.h,c=>{c.imageSmoothingEnabled=false;for(let d=0;d<8;d++){c.save();c.translate(d*FRAME.w,0);c.scale(2,2);survivor(c,d,0,true,{...p.look,gun:'none',grenade:null});c.restore();}});
   for(let d=0;d<8;d++)if(!t.has(d))t.add(d,0,d*FRAME.w,0,FRAME.w,FRAME.h);return {data:p,sprite:this.add.image(p.x,p.y,key,p.direction).setOrigin(.5,FRAME.footY/FRAME.displayH).setScale(.5).setDepth(p.y)};});
  if(!this.textures.exists('survivor-01')){const t=this.textures.createCanvas('survivor-01',FRAME.w*8,FRAME.h*FRAME_COUNT);for(let f=0;f<FRAME_COUNT;f++)for(let d=0;d<8;d++)t.add(f*8+d,0,d*FRAME.w,f*FRAME.h,FRAME.w,FRAME.h);}
  this.setPlayerLook(bridge.look());
  this.actor=this.add.image(model.x,model.y,'survivor-01',model.direction).setOrigin(.5,FRAME.footY/FRAME.displayH).setScale(.5);
  // Lighting multiplies everything below it. Glows, embers and markers sit above it, so they stay bright.
  this.texture('camp-light',Math.ceil(CAMP.w/LIGHT_SCALE),Math.ceil(CAMP.h/LIGHT_SCALE),lightArt);this.add.image(0,0,'camp-light').setOrigin(0).setScale(LIGHT_SCALE).setDepth(6000).setBlendMode(Phaser.BlendModes.MULTIPLY);
  this.texture('camp-glow',128,128,glowArt);this.textures.get('camp-glow').setFilter(Phaser.Textures.FilterMode.LINEAR);
  this.glow=this.add.image(fire.x+fire.w/2,fire.y+6,'camp-glow').setScale(3.2,2.2).setDepth(6001).setBlendMode(Phaser.BlendModes.ADD);
  this.lampGlows=LIGHTS.slice(1,6).map(([x,y],i)=>this.add.image(x,y+(i?0:-20),'camp-glow').setScale(i?.55:1.1,i?.45:.8).setDepth(6001).setBlendMode(Phaser.BlendModes.ADD).setAlpha(.18));
  this.fx=this.add.graphics().setDepth(6002);this.smoke=this.add.graphics().setDepth(5600);this.embers=[];this.puffs=[];this.nextEmber=0;this.nextPuff=0;this.nextWater=0;
  const icons=this.texture('camp-icons',ICON.w*2*ICONS.length,ICON.h*2,iconArt);ICONS.forEach((k,i)=>{if(!icons.has(k))icons.add(k,0,i*ICON.w*2,0,ICON.w*2,ICON.h*2);});
  this.badges=this.residents.map(r=>this.add.image(r.data.x,r.data.y-92,'camp-icons',r.data.icon).setScale(.5).setOrigin(.5,1).setDepth(7000));
  this.marker=this.add.image(0,0,'camp-icons','chevron').setScale(.5).setOrigin(.5,1).setDepth(7001).setVisible(false);
  this.sparkles=Array.from({length:46},(_,i)=>{const y=236+hash(i,201)*560;return {x:shoreX(y)+14+hash(i,202)*220,y,phase:hash(i,203)*6.28,speed:.0015+hash(i,204)*.002};}).filter(s=>s.x<CAMP.w-4);
  this.cameras.main.setBackgroundColor('#0b0c10').setBounds(0,0,CAMP.w,CAMP.h).setZoom(this.zoom()).centerOn(model.x,model.y-20);
  this.events.on('wake',()=>{this.setPlayerLook(bridge.look());bridge.ready(this);});
  bridge.ready(this);}
 setPlayerLook(look){const t=this.textures.get('survivor-01'),c=t.context;c.clearRect(0,0,FRAME.w*8,FRAME.h*FRAME_COUNT);c.imageSmoothingEnabled=false;for(let f=0;f<FRAME_COUNT;f++)for(let d=0;d<8;d++){c.save();c.translate(d*FRAME.w,f*FRAME.h);c.scale(2,2);survivor(c,d,f,true,{...look,zombie:0,gun:'none',grenade:null});c.restore();}t.refresh();}
 update(now,delta){const dt=Math.min(.05,delta/1000);
  if(!bridge.paused())model.update(dt,bridge.input());
  this.actor.setPosition(model.x,model.y).setDepth(model.y).setFrame(model.direction+model.frame*8);
  for(const r of this.residents){const dx=model.x-r.data.x,dy=model.y-r.data.y;r.sprite.setFrame(Math.hypot(dx,dy)<FACE_RANGE?facing(dx,dy):r.data.direction);}
  const target=bridge.paused()&&this.target?this.target:model.target();this.target=target;
  this.badges.forEach((b,i)=>b.setY(this.residents[i].data.y-92+Math.round(Math.sin(now/600+i)*1.5*2)/2));
  if(target){const bob=Math.round(Math.sin(now/180)*2*2)/2,x=target.mx??target.x,y=target.kind==='resident'?target.y-116:target.my;this.marker.setVisible(true).setPosition(x,y+bob);}else this.marker.setVisible(false);
  this.flame.setFrame(Math.floor(now/90)%FLAME.frames);this.potFlame.setFrame((Math.floor(now/110)+3)%FLAME.frames);
  this.glow.setAlpha(.34+.05*Math.sin(now*.013)+.03*Math.sin(now*.037));this.lampGlows.forEach((g,i)=>g.setAlpha(.16+.03*Math.sin(now*.005+i*2)));
  this.effects(now,dt);
  const cam=this.cameras.main;cam.setZoom(this.zoom());cam.centerOn(model.x,model.y-20);bridge.tick(now,this);}
 // Never show past the cave: on a wide screen the camera zooms in until the camp fills it.
 zoom(){const s=this.scale;return Math.max(bridge.zoom(),s.width/CAMP.w,s.height/CAMP.h);}
 effects(now,dt){const fx=this.fx,s=this.smoke,w=this.water;fx.clear();s.clear();
  if(now>this.nextEmber){this.nextEmber=now+90+Math.random()*160;this.embers.push({x:560+(Math.random()-.5)*18,y:466,vx:(Math.random()-.5)*8,vy:-24-Math.random()*20,life:1.4+Math.random()});}
  this.embers=this.embers.filter(e=>(e.life-=dt)>0);for(const e of this.embers){e.x+=(e.vx+Math.sin(now/300+e.y*.1)*6)*dt;e.y+=e.vy*dt;fx.fillStyle(e.life>1?0xffc456:e.life>.5?0xf28a2e:0xc94f1f,Math.min(1,e.life));fx.fillRect(Math.round(e.x*2)/2,Math.round(e.y*2)/2,1,1);}
  if(now>this.nextPuff){this.nextPuff=now+380+Math.random()*300;this.puffs.push({x:762+(Math.random()-.5)*6,y:574,life:2.6,size:2});}
  this.puffs=this.puffs.filter(p=>(p.life-=dt)>0);for(const p of this.puffs){p.y-=9*dt;p.x+=Math.sin(now/500+p.life)*4*dt;p.size+=1.4*dt;s.fillStyle(0xb5b0a6,Math.min(.35,p.life*.14));const z=Math.round(p.size*2)/2;s.fillRect(Math.round(p.x*2)/2-z/2,Math.round(p.y*2)/2-z/2,z,z);}
  // Foam breathes along the waterline; glints twinkle on the inlet. Redrawn a few times a second, which is all it needs.
  if(now<this.nextWater)return;this.nextWater=now+120;w.clear();
  for(let y=230;y<870;y+=2){const x=shoreX(y)+2.5+1.5*Math.sin(now*.0018+y*.045);w.fillStyle(0xb9c7c1,.55+.25*Math.sin(now*.0018+y*.045));w.fillRect(Math.round(x*2)/2,y,1.5+(y%6===0?1:0),1);}
  for(const g of this.sparkles){const v=Math.sin(now*g.speed+g.phase);if(v>.72){w.fillStyle(0x9cc0c8,(v-.72)*3);w.fillRect(Math.round(g.x),Math.round(g.y),v>.9?3:2,.5);}}}
};}
