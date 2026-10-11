// Hangar 3 (v0.66): the floor and apron, every prop, the unit and you, the hangar's light and the briefing's dimmer, the projector's
// beam and the rain outside the door. It opens on the briefing (brief.js) with you in your seat; once it is over the hangar is
// yours to walk: Talk and Use as in camp, nothing to shoot. The camera and walking are the house's.
import {survivor,FRAME,FRAME_COUNT} from '../study/character.js';
import {BASE,DOOR_Y,PROPS,PEOPLE,GEAR,GEAR_START,SEAT_OF,YOUR_SEAT,BRIEF_STAFF,LIFT} from './data.js';
import {groundArt,lightArt,dimArt,LIGHT_SCALE,glowArt,propArt,PROP_PAD} from './art.js';
import {iconArt,ICON,ICONS} from '../camp/art.js';
import {Brief} from './brief.js';import {CineCam} from '../study/camera.js';import {bake} from '../study/memory.js';
const facing=(dx,dy)=>(Math.round(Math.atan2(dy,dx)/(Math.PI/4))+8)%8,FACE_RANGE=90;
// Sitting: the back-facing standing frame lowered so the head clears the backrest, cut off where the backrest ends and drawn just
// under the chair, so all you see is head and shoulders over it. SIT is how far below the chair's back edge the feet go; CUT is
// how much of the frame (in frame pixels) is kept.
const SIT=22,CUT=118;
// Hale and the Colonel walk on the stage, east and west only: idle and the eight walking frames, two facings.
const WALKERS=['calloway','hale'],WALK_N=9;
export function makeBaseScene(model,bridge){return class Base extends Phaser.Scene{
 constructor(){super('Base');}
 texture(key,w,h,draw,once){if(this.textures.exists(key))return this.textures.get(key);const t=this.textures.createCanvas(key,w,h);draw(t.context);t.refresh();return once?bake(this,t,draw):t;}
 create(){
  this.texture('base-ground',BASE.w*2,BASE.h*2,groundArt,true);this.add.image(0,0,'base-ground').setOrigin(0).setScale(.5).setDepth(-10);
  // Props, each its own picture; the screen has one for each slide. Things on the stage are lifted onto it.
  this.props={};PROPS.forEach((o,i)=>{const pic=(key,p)=>this.texture(key,(o.w+PROP_PAD*2)*2,(o.h+o.z+PROP_PAD*2)*2,c=>propArt(c,p));
   const key=o.kind==='screen'?'base-screen-0':'base-'+o.id;if(o.kind==='screen')for(let s=0;s<6;s++)pic('base-screen-'+s,{...o,slide:s});else pic(key,o);
   this.props[o.id]=this.add.image(o.x-PROP_PAD,o.y-o.z-PROP_PAD-(o.lift||0),key).setOrigin(0).setScale(.5).setDepth(o.y+o.h+(o.deco?.01:0)+i*1e-5);});
  // The people: eight standing facings each, drawn once. Their sheets are the camp's kind, so the talk box can show their faces.
  this.people=PEOPLE.map(p=>{const key='camp-res-'+p.id,t=this.texture(key,FRAME.w*8,FRAME.h,c=>{c.imageSmoothingEnabled=false;for(let d=0;d<8;d++){c.save();c.translate(d*FRAME.w,0);c.scale(2,2);survivor(c,d,0,true,{...p.look,gun:'none',grenade:null});c.restore();}});
   for(let d=0;d<8;d++)if(!t.has(d))t.add(d,0,d*FRAME.w,0,FRAME.w,FRAME.h);return {data:p,sprite:this.add.image(0,0,key,2).setOrigin(.5,FRAME.footY/FRAME.displayH).setScale(.5)};});
  for(const id of WALKERS){const p=PEOPLE.find(q=>q.id===id),key='base-walk-'+id,t=this.texture(key,FRAME.w*2,FRAME.h*WALK_N,c=>{c.imageSmoothingEnabled=false;for(let f=0;f<WALK_N;f++)[0,4].forEach((d,k)=>{c.save();c.translate(k*FRAME.w,f*FRAME.h);c.scale(2,2);survivor(c,d,f,true,{...p.look,gun:'none',grenade:null});c.restore();});});
   for(let f=0;f<WALK_N;f++)for(let k=0;k<2;k++)if(!t.has(f*2+k))t.add(f*2+k,0,k*FRAME.w,f*FRAME.h,FRAME.w,FRAME.h);}
  if(!this.textures.exists('survivor-01')){const t=this.textures.createCanvas('survivor-01',FRAME.w*8,FRAME.h*FRAME_COUNT);for(let f=0;f<FRAME_COUNT;f++)for(let d=0;d<8;d++)t.add(f*8+d,0,d*FRAME.w,f*FRAME.h,FRAME.w,FRAME.h);}
  this.setPlayerLook(bridge.look());
  this.actor=this.add.image(model.x,model.y,'survivor-01',model.direction).setOrigin(.5,FRAME.footY/FRAME.displayH).setScale(.5);
  // Light: the hangar's own, and the briefing's dimmer over it, faded out as the house lights come up.
  this.texture('base-light',Math.ceil(BASE.w/LIGHT_SCALE),Math.ceil(BASE.h/LIGHT_SCALE),lightArt,true);this.add.image(0,0,'base-light').setOrigin(0).setScale(LIGHT_SCALE).setDepth(6000).setBlendMode(Phaser.BlendModes.MULTIPLY);
  this.texture('base-dim',Math.ceil(BASE.w/LIGHT_SCALE),Math.ceil(BASE.h/LIGHT_SCALE),dimArt,true);this.dim=this.add.image(0,0,'base-dim').setOrigin(0).setScale(LIGHT_SCALE).setDepth(6000.5).setBlendMode(Phaser.BlendModes.MULTIPLY);this.dimK=1;
  this.texture('base-glow',128,128,c=>glowArt(c,[200,220,255]));this.textures.get('base-glow').setFilter(Phaser.Textures.FilterMode.LINEAR);
  this.screenGlow=this.add.image(440,60,'base-glow').setScale(2.2,1.1).setDepth(6001).setBlendMode(Phaser.BlendModes.ADD).setAlpha(.12);
  this.floods=[[210,486],[720,486]].map(([x,y])=>this.add.image(x,y,'base-glow').setScale(1.4,.9).setDepth(6001).setBlendMode(Phaser.BlendModes.ADD).setAlpha(.2));
  this.beam=this.add.graphics().setDepth(6001).setBlendMode(Phaser.BlendModes.ADD);this.rain=this.add.graphics().setDepth(6002);
  const icons=this.texture('camp-icons',ICON.w*2*ICONS.length,ICON.h*2,iconArt);ICONS.forEach((k,i)=>{if(!icons.has(k))icons.add(k,0,i*ICON.w*2,0,ICON.w*2,ICON.h*2);});
  this.marker=this.add.image(0,0,'camp-icons','chevron').setScale(.5).setOrigin(.5,1).setDepth(7001).setVisible(false);
  this.badge=this.add.image(GEAR.okafor.x,GEAR.okafor.y-92,'camp-icons','target').setScale(.5).setOrigin(.5,1).setDepth(7000).setVisible(false);
  this.fade=this.add.rectangle(-200,-200,BASE.w+400,BASE.h+400,0x000000,1).setOrigin(0).setDepth(9000).setVisible(false);
  this.cameras.main.setBackgroundColor('#07080b').setBounds(0,0,BASE.w,BASE.h).setZoom(this.zoom()).centerOn(model.x,model.y-20);
  this.events.on('wake',()=>{this.setPlayerLook(bridge.look());this.enter();bridge.ready(this);});this.enter();bridge.ready(this);}
 // Each time you come in: the briefing from the start, or the hangar as you left it.
 enter(){const stage=bridge.stage();this.out=null;this.brief=stage==='brief'?new Brief():null;this.stood=!this.brief;this.slide=-1;this.showSlide(this.brief?0:5);this.dimK=this.brief?1:0;this.cineCam=null;
  if(this.brief)Object.assign(model,{x:YOUR_SEAT.x+YOUR_SEAT.w/2,y:YOUR_SEAT.y+SIT,direction:6,frame:0,moving:false});}
 showSlide(s){if(s===this.slide)return;this.slide=s;this.props.screen.setTexture('base-screen-'+s);}
 setPlayerLook(look){const t=this.textures.get('survivor-01'),c=t.context;c.clearRect(0,0,FRAME.w*8,FRAME.h*FRAME_COUNT);c.imageSmoothingEnabled=false;
  for(let f=0;f<FRAME_COUNT;f++)for(let d=0;d<8;d++){c.save();c.translate(d*FRAME.w,f*FRAME.h);c.scale(2,2);survivor(c,d,f,true,{...look,zombie:0,gun:bridge.held?.()||'none',grenade:null});c.restore();}t.refresh();}
 skipBrief(){this.brief?.skip();}
 // Onto the truck: the hangar fades to black, then cb.
 leave(cb){if(!this.out)this.out={t:0,cb};}
 // The hangar fills a wide screen; on a phone the camera follows you.
 zoom(){const s=this.scale;return Math.max(bridge.zoom(),s.width/BASE.w,s.height/BASE.h);}
 // Someone seated: lowered into the chair and cut at its backrest.
 sit(sprite,chair,frame){sprite.setPosition(chair.x+chair.w/2,chair.y+SIT).setFrame(frame).setDepth(chair.y+chair.h-.05).setCrop(0,0,FRAME.w,CUT);}
 update(now,delta){const dt=Math.min(.05,delta/1000),paused=bridge.paused(),b=this.brief,waiting=b&&bridge.started&&!bridge.started();
  if(b){if(!paused&&!waiting)b.update(dt);bridge.cine?.(waiting?{say:'Tap anywhere, or press any key, to begin.',waiting:true}:b);for(const id of b.cues.splice(0))bridge.sound?.(id);
   this.showSlide(b.slide);if(b.stand&&!this.stood){this.stood=true;Object.assign(model,{...GEAR_START,frame:0,moving:false});}
   if(b.done){this.brief=null;bridge.cine?.(null);bridge.briefed?.();}}
  else if(this.out){this.out.t+=dt;if(this.out.t>=1.2&&this.out.cb){const cb=this.out.cb;this.out.cb=null;cb();}}
  else if(!paused)model.update(dt,bridge.input());
  // You: in your seat through the briefing, on your feet after.
  const seated=!this.stood;if(seated)this.sit(this.actor,YOUR_SEAT,6);else{if(this.actor.isCropped)this.actor.setCrop();this.actor.setPosition(model.x,model.y).setDepth(model.y).setFrame(model.direction+model.frame*8);}
  // Everyone else: seated, or on stage, through the briefing; round the hangar after, turning to you when you come close.
  for(const p of this.people){const id=p.data.id,s=p.sprite;
   if(!this.stood&&SEAT_OF[id]){this.sit(s,SEAT_OF[id],6);continue;}if(s.isCropped)s.setCrop();
   const walk=!this.stood&&b?.staff[id];if(walk){const lift=walk.y<175?LIFT:0;if(walk.frame){s.setTexture('base-walk-'+id,walk.frame*2+(Math.cos(walk.direction*Math.PI/4)>=0?0:1));}else s.setTexture('camp-res-'+id,walk.direction);s.setPosition(walk.x,walk.y-lift).setDepth(walk.y);continue;}
   if(s.texture.key!=='camp-res-'+id)s.setTexture('camp-res-'+id,2);
   const at=this.stood?GEAR[id]:BRIEF_STAFF[id];if(!at){s.setVisible(false);continue;}s.setVisible(true);const dx=model.x-at.x,dy=model.y-at.y;
   s.setPosition(at.x,at.y-(at.lift||0)).setDepth(at.y).setFrame(this.stood&&Math.hypot(dx,dy)<FACE_RANGE?facing(dx,dy):at.direction);}
  // The house lights, the projector's beam with dust turning in it, and the screen's glow.
  const want=b?b.dim:0;this.dimK+=(want-this.dimK)*Math.min(1,dt*1.6);this.dim.setAlpha(this.dimK).setVisible(this.dimK>.01);
  const g=this.beam;g.clear();if(this.dimK>.02){const a=this.dimK,lx=440,ly=298;g.fillStyle(0xcfe0ff,.05*a).fillTriangle(lx,ly,362,26,518,26).fillTriangle(lx,ly,518,26,518,90);g.fillStyle(0xcfe0ff,.035*a).fillTriangle(lx,ly,362,26,362,90);
   for(let i=0;i<18;i++){const k=((now/9000)+i*.37)%1,t=(i*.61)%1,x=lx+(362+t*156-lx)*k,y=ly+(26+((i*.29)%1)*64-ly)*k+Math.sin(now/700+i)*2;g.fillStyle(0xfff6e0,.35*a*Math.sin(Math.PI*k)).fillRect(x,y,.5,.5);}}
  this.screenGlow.setAlpha(.06+.08*this.dimK);
  // Rain past the door, lit where the floodlights catch it.
  const rg=this.rain;rg.clear();for(let i=0;i<70;i++){const x=(i*97.3+Math.sin(i)*40)%BASE.w,fall=((now/520)+i*.137)%1,y=DOOR_Y-30+fall*(BASE.h-DOOR_Y+30);if(y<DOOR_Y+2)continue;const lit=Math.abs(x-210)<180||Math.abs(x-720)<180;rg.fillStyle(0xb8c8e0,lit?.32:.14).fillRect(x-fall*3,y,.5,4);}
  const black=this.out?Math.min(1,this.out.t/1.2):b?.fade||0;this.fade.setVisible(black>0).setAlpha(black);
  // What you can use: the marker floats over it; Okafor's badge shows while your rifle is waiting.
  const target=b||this.out?null:paused&&this.target?this.target:model.target(t=>bridge.usable?.(t)!==false);this.target=target;
  if(target){const bob=Math.round(Math.sin(now/180)*2*2)/2,my=target.kind==='resident'?target.y-92:target.my;this.marker.setVisible(true).setPosition(target.mx??target.x,my+bob);}else this.marker.setVisible(false);
  this.badge.setVisible(!b&&bridge.stage()==='gear'&&target?.id!=='okafor');
  const cam=this.cameras.main,top=b?-90:0;if(this.top!==top){this.top=top;cam.setBounds(0,top,BASE.w,BASE.h-top);}const at=(this.cineCam??=new CineCam()).step(dt,{x:model.x,y:model.y-20,z:this.zoom()},b?.cam);cam.setZoom(at.z);cam.centerOn(at.x,at.y);bridge.tick(now,this);}
};}
