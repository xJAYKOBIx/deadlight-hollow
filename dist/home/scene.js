// The starter house scene: the floors, every prop, the survivor, the dog and the cat, the night light and the candle.
// Same walking, prompts and camera as the camp; nothing to shoot here. The first time in, it opens on the wake-up scene (wake.js).
import {survivor,FRAME,FRAME_COUNT} from '../study/character.js';
import {HOME,PROPS,SOLIDS,ROOMS,DOORS,PETS,INSIDE,CANDLE} from './data.js';
import {groundArt,lightArt,LIGHT_SCALE,glowArt,propArt,PROP_PAD,HOME_DECOR} from './art.js';
import {iconArt,ICON,ICONS} from '../camp/art.js';
import {PET_FRAME,PET_FRAME_COUNT,paintPetSheet} from '../companion/pet.js';
import {drawHearts} from '../companion/sprite.js';
import {HousePet} from '../companion/house.js';
import {Wake,COUCH} from './wake.js';
const inRect=(x,y,r,b)=>{const dx=x-Math.max(b.x,Math.min(x,b.x+b.w)),dy=y-Math.max(b.y,Math.min(y,b.y+b.h));return dx*dx+dy*dy<r*r;};
// Horizontal walls you can be behind. They thin out while you are, so you never lose yourself or a pet behind one.
const FADES=new Set(['wall','window','doorway','frontdoor']);
export function makeHomeScene(model,bridge){return class Home extends Phaser.Scene{
 constructor(){super('Home');}
 texture(key,w,h,draw){if(this.textures.exists(key))return this.textures.get(key);const t=this.textures.createCanvas(key,w,h);draw(t.context);t.refresh();return t;}
 create(){
  this.texture('home-ground',HOME.w*2,HOME.h*2,groundArt);this.add.image(0,0,'home-ground').setOrigin(0).setScale(.5).setDepth(-10);
  // Props. Walls keep their order so the vertical runs sit under the horizontal walls they meet; decorations go just above their wall.
  this.opts={};const kit=bridge.kit?.();if(kit?.guns['light-pistol'])this.opts.nightstand={open:true};if(kit?.guns['pump-shotgun'])this.opts.closet={open:true,box:'empty'};
  this.walls=[];PROPS.forEach((o,i)=>{const key='home-'+o.id;this.texture(key,(o.w+PROP_PAD*2)*2,(o.h+o.z+PROP_PAD*2)*2,c=>propArt(c,{...o,...this.opts[o.id]}));
   const img=this.add.image(o.x-PROP_PAD,o.y-o.z-PROP_PAD,key).setOrigin(0).setScale(.5).setDepth(o.flat?0:o.y+o.h+(o.deco?.02:0)+i*1e-5);
   if(FADES.has(o.kind)||(o.deco&&HOME_DECOR.has(o.kind)))this.walls.push({o,img,alpha:1});});
  for(const id of ['nightstand','closet'])this.setProp(id,{});
  // The survivor on the shared sheet the camp also uses, holding whichever gun you have out (none until you find one).
  if(!this.textures.exists('survivor-01')){const t=this.textures.createCanvas('survivor-01',FRAME.w*8,FRAME.h*FRAME_COUNT);for(let f=0;f<FRAME_COUNT;f++)for(let d=0;d<8;d++)t.add(f*8+d,0,d*FRAME.w,f*FRAME.h,FRAME.w,FRAME.h);}
  this.setPlayerLook(bridge.look());
  this.actor=this.add.image(model.x,model.y,'survivor-01',model.direction).setOrigin(.5,FRAME.footY/FRAME.displayH).setScale(.5);
  // The dog and the cat, each on its own sheet.
  const blocked=(x,y,p,plan)=>{const r=p.def.radius;if(x-r<INSIDE.left||x+r>INSIDE.right||y-r*.6<INSIDE.top||y+r*.4>INSIDE.bottom)return true;if(!plan&&Math.hypot(x-model.x,(y-model.y)*1.4)<r+9)return true;return SOLIDS.some(b=>inRect(x,y,r,b));};
  this.pets=PETS.map(def=>{const key='home-pet-'+def.id,t=this.texture(key,PET_FRAME.w*8,PET_FRAME.h*PET_FRAME_COUNT,c=>paintPetSheet(c,def.look));for(let f=0;f<PET_FRAME_COUNT;f++)for(let d=0;d<8;d++)if(!t.has(f*8+d))t.add(f*8+d,0,d*PET_FRAME.w,f*PET_FRAME.h,PET_FRAME.w,PET_FRAME.h);
   const pet=new HousePet(def,{rooms:ROOMS,blocked});return {pet,def,sprite:this.add.image(pet.x,pet.y,key,0).setOrigin(.5,PET_FRAME.footY/PET_FRAME.displayH).setScale(.5),target:{id:'pet-'+def.id,kind:'pet',name:def.name,role:def.role,range:40,facing:true,ref:pet}};});
  bridge.pets?.(this.pets.map(p=>p.pet));
  // First night: the cat is curled up on the couch beside you, and the scene plays before you can move.
  if(bridge.woke&&!bridge.woke()){const [dog,cat]=this.pets.map(p=>p.pet);cat.place(cat.def.spots.find(s=>s.perch&&s.room==='living'&&s.perch.h<20));this.wake=new Wake({dog,cat,you:model});}
  this.zzz=this.add.graphics().setDepth(7002);this.fade=this.add.rectangle(-200,-200,HOME.w+400,HOME.h+400,0x000000,1).setOrigin(0).setDepth(9000).setVisible(!!this.wake);
  // Night: the light map multiplies everything under it; the candle's glow, the hearts and the markers sit above it.
  this.texture('home-light',Math.ceil(HOME.w/LIGHT_SCALE),Math.ceil(HOME.h/LIGHT_SCALE),lightArt);this.add.image(0,0,'home-light').setOrigin(0).setScale(LIGHT_SCALE).setDepth(6000).setBlendMode(Phaser.BlendModes.MULTIPLY);
  this.texture('home-glow',128,128,glowArt);this.textures.get('home-glow').setFilter(Phaser.Textures.FilterMode.LINEAR);
  this.glow=this.add.image(CANDLE.x,CANDLE.y+8,'home-glow').setScale(1.4,1).setDepth(6001).setBlendMode(Phaser.BlendModes.ADD);
  this.flame=this.add.graphics().setDepth(6002);this.petFx=this.add.graphics().setDepth(7003);
  const icons=this.texture('camp-icons',ICON.w*2*ICONS.length,ICON.h*2,iconArt);ICONS.forEach((k,i)=>{if(!icons.has(k))icons.add(k,0,i*ICON.w*2,0,ICON.w*2,ICON.h*2);});
  this.marker=this.add.image(0,0,'camp-icons','chevron').setScale(.5).setOrigin(.5,1).setDepth(7001).setVisible(false);
  this.cameras.main.setBackgroundColor('#0b0c10').setBounds(0,0,HOME.w,HOME.h).setZoom(this.zoom()).centerOn(model.x,model.y-20);
  this.events.on('wake',()=>{this.setPlayerLook(bridge.look());bridge.ready(this);});
  bridge.ready(this);}
 // Open the nightstand or the closet (and show what is in it), and keep it that way.
 setProp(id,patch){const o=PROPS.find(p=>p.id===id);if(!o)return;this.opts[id]={...this.opts[id],...patch};const t=this.textures.get('home-'+id),c=t.context;c.clearRect(0,0,t.width,t.height);propArt(c,{...o,...this.opts[id]});t.refresh();}
 skipWake(){this.wake?.skip();}
 setPlayerLook(look){const t=this.textures.get('survivor-01'),c=t.context;c.clearRect(0,0,FRAME.w*8,FRAME.h*FRAME_COUNT);c.imageSmoothingEnabled=false;for(let f=0;f<FRAME_COUNT;f++)for(let d=0;d<8;d++){c.save();c.translate(d*FRAME.w,f*FRAME.h);c.scale(2,2);survivor(c,d,f,true,{...look,zombie:0,gun:bridge.held?.()||'none',grenade:null});c.restore();}t.refresh();}
 setPetLook(){}
 // Never show past the yard: on a wide screen the camera zooms in until the house and yard fill it.
 zoom(){const s=this.scale;return Math.max(bridge.zoom(),s.width/HOME.w,s.height/HOME.h);}
 update(now,delta){const dt=Math.min(.05,delta/1000),paused=bridge.paused();
  const w=this.wake;
  if(w){if(!paused)w.update(dt);Object.assign(model,{x:w.x,y:w.y,direction:w.direction,frame:w.frame,moving:!!w.path.length});bridge.cine?.(w);
   if(w.done){this.wake=null;bridge.cine?.(null);bridge.wokeUp?.();}}
  else if(!paused)model.update(dt,bridge.input());bridge.step?.(dt);
  this.actor.setPosition(model.x,model.y).setDepth(model.y).setFrame(model.direction+model.frame*8);
  if(w?.onCouch){this.actor.setDepth(COUCH.depth).setCrop(0,0,FRAME.w,Math.max(0,(COUCH.cut-(w.y-FRAME.footY))*2));}else if(this.actor.isCropped)this.actor.setCrop();
  this.fade.setVisible(!!w&&w.fade>0).setAlpha(w?.fade||0);
  // Asleep: three small z's drift up off the couch.
  const z=this.zzz;z.clear();if(w?.zzz)for(let k=0;k<3;k++){const a=((now/1400)+k/3)%1,x=w.x+8+a*12+Math.sin(a*6)*2,y=162-a*26,s=2+a*2;z.fillStyle(0xe8e0d1,.9*(1-a));z.fillRect(x,y,s*2,.5);z.fillRect(x,y+s*2-.5,s*2,.5);for(let i=0;i<4;i++)z.fillRect(x+s*2-(i+1)*s/2,y+i*s/2,.5+s/4,.5);}
  const owner={x:model.x,y:model.y,moving:model.moving};
  for(const p of this.pets){if(!paused)p.pet.update(dt,owner);const f=p.pet;p.sprite.setPosition(f.x,f.y-f.h).setDepth(f.depth??f.y).setFrame(f.frame*8+f.direction);
   Object.assign(p.target,{x:f.x,y:f.y,my:f.y-f.h-(p.def.look.species?28:44)+(f.state==='lie'?10:0)});}
  // Walls you are behind fade; so do the pictures on them.
  for(const w of this.walls){const o=w.o,behind=model.y<o.y+2&&model.y>o.y-o.z-10&&model.x>o.x-12&&model.x<o.x+o.w+12,want=behind?.42:1;w.alpha+=(want-w.alpha)*Math.min(1,dt*10);w.img.setAlpha(w.alpha);}
  const target=w?null:paused&&this.target?this.target:model.target(this.pets.filter(p=>!p.pet.happy&&!p.pet.hop).map(p=>p.target));this.target=target;
  if(target){const bob=Math.round(Math.sin(now/180)*2*2)/2;this.marker.setVisible(true).setPosition(target.mx??target.x,target.my+bob);}else this.marker.setVisible(false);
  // The candle flickers, and its glow breathes with it.
  const t=now/1000,fl=.5+.28*Math.sin(t*11.3)+.16*Math.sin(t*31.7+1)+.06*Math.sin(t*67+2);this.glow.setAlpha(.32+.16*fl).setScale(1.3+.12*fl,.95+.08*fl);
  const g=this.flame;g.clear();g.fillStyle(0xff9a52,1);g.fillRect(CANDLE.x,CANDLE.y-(fl>.6?.5:0),1.5,2.5);g.fillStyle(0xffe4a0,1);g.fillRect(CANDLE.x+.5,CANDLE.y-.5-(fl>.6?.5:0),.5,1);
  this.petFx.clear();for(const p of this.pets)drawHearts(this.petFx,p.pet,p.target.my+6,now);
  const cam=this.cameras.main;cam.setZoom(this.zoom());cam.centerOn(model.x,model.y-20);bridge.tick(now,this);}
};}
