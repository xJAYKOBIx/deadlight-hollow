// The starter house scene: the floors, every prop, the survivor, the dog and the cat, the night light and the candle.
// Same walking, prompts and camera as the camp; nothing to shoot here. The first time in, it opens on the wake-up scene (wake.js).
import {bake} from '../study/memory.js';import {survivor,FRAME,FRAME_COUNT} from '../study/character.js';
import {HOME,HOUSE,PROPS,SOLIDS,ROOMS,DOORS,PETS,INSIDE,CANDLE} from './data.js';
import {groundArt,lightArt,LIGHT_SCALE,glowArt,propArt,PROP_PAD,HOME_DECOR} from './art.js';
import {iconArt,ICON,ICONS} from '../camp/art.js';
import {PET_FRAME,PET_FRAME_COUNT,paintPetSheet} from '../companion/pet.js';
import {drawHearts} from '../companion/sprite.js';
import {HousePet} from '../companion/house.js';
import {Wake,COUCH,CRASH} from './wake.js';
// The flashlight: how far its beam reaches, how wide it is, and how fast it swings round to where you face.
const TORCH={len:150,half:22*Math.PI/180,turn:12};
const inRect=(x,y,r,b)=>{const dx=x-Math.max(b.x,Math.min(x,b.x+b.w)),dy=y-Math.max(b.y,Math.min(y,b.y+b.h));return dx*dx+dy*dy<r*r;};
// Horizontal walls you can be behind. They thin out while you are, so you never lose yourself or a pet behind one.
const FADES=new Set(['wall','window','doorway','frontdoor']);
export function makeHomeScene(model,bridge){return class Home extends Phaser.Scene{
 constructor(){super('Home');}
 // once: painted a single time, so only the graphics card keeps it (memory.js).
 texture(key,w,h,draw,once){if(this.textures.exists(key))return this.textures.get(key);const t=this.textures.createCanvas(key,w,h);draw(t.context);t.refresh();return once?bake(this,t,draw):t;}
 create(){
  this.texture('home-ground',HOME.w*2,HOME.h*2,groundArt,true);this.add.image(0,0,'home-ground').setOrigin(0).setScale(.5).setDepth(-10);
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
  this.pets=PETS.map(def=>{const key='home-pet-'+def.id,t=this.texture(key,PET_FRAME.w*8,PET_FRAME.h*PET_FRAME_COUNT,c=>paintPetSheet(c,def.look),true);for(let f=0;f<PET_FRAME_COUNT;f++)for(let d=0;d<8;d++)if(!t.has(f*8+d))t.add(f*8+d,0,d*PET_FRAME.w,f*PET_FRAME.h,PET_FRAME.w,PET_FRAME.h);
   const pet=new HousePet(def,{rooms:ROOMS,blocked});return {pet,def,sprite:this.add.image(pet.x,pet.y,key,0).setOrigin(.5,PET_FRAME.footY/PET_FRAME.displayH).setScale(.5),target:{id:'pet-'+def.id,kind:'pet',name:def.name,role:def.role,range:40,facing:true,ref:pet}};});
  bridge.pets?.(this.pets.map(p=>p.pet));
  // First night: the cat is curled up on the couch beside you, and the scene plays before you can move.
  if(bridge.woke&&!bridge.woke()){const [dog,cat]=this.pets.map(p=>p.pet);cat.place(cat.def.spots.find(s=>s.perch&&s.room==='living'&&s.perch.h<20));this.wake=new Wake({dog,cat,you:model});}
  this.zzz=this.add.graphics().setDepth(7002);this.fade=this.add.rectangle(-200,-200,HOME.w+400,HOME.h+400,0x000000,1).setOrigin(0).setDepth(9000).setVisible(!!this.wake);
  // Night: the light map multiplies everything under it; the candle's glow, the hearts and the markers sit above it.
  this.texture('home-light',Math.ceil(HOME.w/LIGHT_SCALE),Math.ceil(HOME.h/LIGHT_SCALE),lightArt,true);this.add.image(0,0,'home-light').setOrigin(0).setScale(LIGHT_SCALE).setDepth(6000).setBlendMode(Phaser.BlendModes.MULTIPLY);
  // The power cut: the whole house goes dark except round the candle. Before the flashlight it is near black; after, your eyes have
  // adjusted and the rooms read again, but only the beam really lights anything.
  this.texture('home-dark',Math.ceil(HOME.w/8),Math.ceil(HOME.h/8),c=>{const W=c.canvas.width,H=c.canvas.height,x=CANDLE.x/8,y=(CANDLE.y+8)/8,g=c.createRadialGradient(x,y,0,x,y,150/8);
   c.fillStyle='rgb(52,58,84)';c.fillRect(0,0,W,H);g.addColorStop(0,'rgba(255,236,206,1)');g.addColorStop(.3,'rgba(214,190,166,.9)');g.addColorStop(1,'rgba(52,58,84,0)');c.fillStyle=g;c.fillRect(0,0,W,H);});
  this.textures.get('home-dark').setFilter(Phaser.Textures.FilterMode.LINEAR);this.dark=this.add.image(0,0,'home-dark').setOrigin(0).setScale(8).setDepth(6000).setBlendMode(Phaser.BlendModes.MULTIPLY);
  this.texture('home-glow',128,128,glowArt);this.textures.get('home-glow').setFilter(Phaser.Textures.FilterMode.LINEAR);
  this.glow=this.add.image(CANDLE.x,CANDLE.y+8,'home-glow').setScale(1.4,1).setDepth(6001).setBlendMode(Phaser.BlendModes.ADD);
  // The police car's light bar: a red and a blue glow that sweep past the front windows as it passes, then keep turning down the street.
  this.texture('home-glow-w',128,128,c=>{const gr=c.createRadialGradient(64,64,0,64,64,64);gr.addColorStop(0,'rgba(255,255,255,.8)');gr.addColorStop(.45,'rgba(255,255,255,.22)');gr.addColorStop(1,'rgba(255,255,255,0)');c.fillStyle=gr;c.fillRect(0,0,128,128);});this.textures.get('home-glow-w').setFilter(Phaser.Textures.FilterMode.LINEAR);
  this.police=[0xff3a3a,0x3a6aff].map(col=>this.add.image(0,0,'home-glow-w').setDepth(6001).setBlendMode(Phaser.BlendModes.ADD).setTint(col).setVisible(false));this.pm=null;this.passT=0;this.shook=0;
  // The flashlight, once you have it: a cone of white light ahead of you over the dark, and a little spill round your feet.
  this.texture('home-beam',256,128,c=>{const g=c.createRadialGradient(0,64,0,0,64,256);g.addColorStop(0,'rgba(255,240,205,.7)');g.addColorStop(.45,'rgba(255,232,190,.3)');g.addColorStop(1,'rgba(255,226,180,0)');
   c.beginPath();c.moveTo(0,64);c.lineTo(256*Math.cos(TORCH.half),64-256*Math.sin(TORCH.half));c.arc(0,64,256,-TORCH.half,TORCH.half);c.closePath();c.fillStyle=g;c.fill();});this.textures.get('home-beam').setFilter(Phaser.Textures.FilterMode.LINEAR);
  this.beam=this.add.image(0,0,'home-beam').setOrigin(0,.5).setScale(TORCH.len/256).setDepth(6001).setBlendMode(Phaser.BlendModes.ADD).setVisible(false);this.beamA=null;
  this.spill=this.add.image(0,0,'home-glow-w').setScale(.5,.35).setDepth(6001).setBlendMode(Phaser.BlendModes.ADD).setAlpha(.25).setVisible(false);
  this.flame=this.add.graphics().setDepth(6002);this.petFx=this.add.graphics().setDepth(7003);
  const icons=this.texture('camp-icons',ICON.w*2*ICONS.length,ICON.h*2,iconArt);ICONS.forEach((k,i)=>{if(!icons.has(k))icons.add(k,0,i*ICON.w*2,0,ICON.w*2,ICON.h*2);});
  this.marker=this.add.image(0,0,'camp-icons','chevron').setScale(.5).setOrigin(.5,1).setDepth(7001).setVisible(false);
  this.cameras.main.setBackgroundColor('#0b0c10').setBounds(0,0,HOME.w,HOME.h).setZoom(this.zoom()).centerOn(model.x,model.y-20);
  this.events.on('wake',()=>{this.setPlayerLook(bridge.look());bridge.ready(this);});
  bridge.ready(this);}
 // Open the nightstand or the closet (and show what is in it), and keep it that way.
 setProp(id,patch){const o=PROPS.find(p=>p.id===id);if(!o)return;this.opts[id]={...this.opts[id],...patch};const t=this.textures.get('home-'+id),c=t.context;c.clearRect(0,0,t.width,t.height);propArt(c,{...o,...this.opts[id]});t.refresh();}
 skipWake(){this.wake?.skip();}
 // The flashlight is on: sirens, and the police car down the street (wake.js CRASH), where you stand.
 crash(){if(this.wake)return;const [dog,cat]=this.pets.map(p=>p.pet);this.wake=new Wake({dog,cat,you:model,beats:CRASH});}
 setPlayerLook(look){const t=this.textures.get('survivor-01'),c=t.context;c.clearRect(0,0,FRAME.w*8,FRAME.h*FRAME_COUNT);c.imageSmoothingEnabled=false;for(let f=0;f<FRAME_COUNT;f++)for(let d=0;d<8;d++){c.save();c.translate(d*FRAME.w,f*FRAME.h);c.scale(2,2);survivor(c,d,f,true,{...look,zombie:0,gun:bridge.held?.()||'none',grenade:null});c.restore();}t.refresh();}
 setPetLook(){}
 // Never show past the yard: on a wide screen the camera zooms in until the house and yard fill it.
 zoom(){const s=this.scale;return Math.max(bridge.zoom(),s.width/HOME.w,s.height/HOME.h);}
 update(now,delta){const dt=Math.min(.05,delta/1000),paused=bridge.paused();
  const w=this.wake;
  // The night waits in the dark for a first tap or key, so its sounds can play (browsers only start sound after one).
  const waiting=w&&!w.beats&&bridge.started&&!bridge.started();
  if(w){if(!paused&&!waiting)w.update(dt);Object.assign(model,{x:w.x,y:w.y,direction:w.direction,frame:w.frame,moving:!!w.path.length});bridge.cine?.(waiting?{say:'Tap anywhere, or press any key, to begin.',waiting:true}:w);
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
  // The light bar: during the pass it runs along the front of the house; parked, it turns at the east end of the street.
  const kit=bridge.kit?.(),pm=w?w.police:kit?.light?'parked':null;
  // The flashlight swings round to where you face, and goes where you go.
  if(kit?.light){const want=model.direction*Math.PI/4;if(this.beamA===null)this.beamA=want;let d=want-this.beamA;d=Math.atan2(Math.sin(d),Math.cos(d));this.beamA+=d*Math.min(1,dt*TORCH.turn);
   const bx=model.x+Math.cos(this.beamA)*4,by=model.y-14+Math.sin(this.beamA)*2;this.beam.setVisible(true).setPosition(bx,by).setRotation(this.beamA).setAlpha(.62+.04*Math.sin(now/130));this.spill.setVisible(true).setPosition(model.x+Math.cos(this.beamA)*16,model.y-4+Math.sin(this.beamA)*10);}
  else{this.beam.setVisible(false);this.spill.setVisible(false);}this.dark.setAlpha(kit?.light?.62:1);if(pm!==this.pm){this.pm=pm;this.passT=0;}if(!paused)this.passT+=dt;
  this.police.forEach((img,i)=>{if(!pm){img.setVisible(false);return;}const on=Math.floor(now/(pm==='pass'?90:260))%2===i;
   if(pm==='pass'){const k=Math.min(1,this.passT/2.6);img.setVisible(k<1).setPosition(HOUSE.x-120+k*(HOUSE.w+260),HOUSE.y+HOUSE.h-70).setScale(5.5,2.6).setAlpha(on?.55*Math.sin(Math.PI*k):.06);}
   else img.setVisible(true).setPosition(HOUSE.x+HOUSE.w+40,HOUSE.y+HOUSE.h+20).setScale(2.8,1.8).setAlpha(on?.34:.05);});
  // Sounds and the shake the wake-up scene asks for.
  if(w){for(const id of w.cues.splice(0))bridge.sound?.(id);if(w.shook>this.shook){this.shook=w.shook;this.cameras.main.shake(520,.009);bridge.buzz?.(160);}}
  const t=now/1000,fl=.5+.28*Math.sin(t*11.3)+.16*Math.sin(t*31.7+1)+.06*Math.sin(t*67+2);this.glow.setAlpha(.2+.14*fl).setScale(1.05+.12*fl,.78+.08*fl);
  const g=this.flame;g.clear();g.fillStyle(0xff9a52,1);g.fillRect(CANDLE.x,CANDLE.y-(fl>.6?.5:0),1.5,2.5);g.fillStyle(0xffe4a0,1);g.fillRect(CANDLE.x+.5,CANDLE.y-.5-(fl>.6?.5:0),.5,1);
  this.petFx.clear();for(const p of this.pets)drawHearts(this.petFx,p.pet,p.target.my+6,now);
  const cam=this.cameras.main;cam.setZoom(this.zoom());cam.centerOn(model.x,model.y-20);bridge.tick(now,this);}
};}
