import {survivor,FRAME,FRAME_COUNT} from '../study/character.js';
import {CAMP,PROPS,RESIDENTS,LIGHTS} from './data.js';
import {groundArt,frontArt,FRONT_Y,propArt,PROP_PAD,flameArt,FLAME,lightArt,LIGHT_SCALE,glowArt,iconArt,ICON,ICONS,shoreX,hash,fishArt} from './art.js';
import {PIER_END} from './play.js';
import {CaveLife} from './life.js';
import {addPet,placePet,petSheet,drawHearts} from '../companion/sprite.js';
// Residents turn to face you when you come close.
const FACE_RANGE=130;
const mixColor=(a,b,k)=>[16,8,0].reduce((n,sh)=>n|Math.round(((a>>sh)&255)+(((b>>sh)&255)-((a>>sh)&255))*k)<<sh,0);
const facing=(dx,dy)=>(Math.round(Math.atan2(dy,dx)/(Math.PI/4))+8)%8;
export function makeCampScene(model,bridge){return class Camp extends Phaser.Scene{
 constructor(){super('Camp');}
 texture(key,w,h,draw){if(this.textures.exists(key))return this.textures.get(key);const t=this.textures.createCanvas(key,w,h);draw(t.context);t.refresh();return t;}
 create(){
  this.texture('camp-ground',CAMP.w*2,CAMP.h*2,groundArt);this.add.image(0,0,'camp-ground').setOrigin(0).setScale(.5).setDepth(-10);
  this.water=this.add.graphics().setDepth(-5);
  this.rackFish=bridge.rackFish?.()||0;for(const o of PROPS){this.texture('camp-'+o.id,(o.w+PROP_PAD*2)*2,(o.h+o.z+PROP_PAD*2)*2,c=>propArt(c,o.id==='rack'?{...o,fish:this.rackFish}:o));this.add.image(o.x-PROP_PAD,o.y-o.z-PROP_PAD,'camp-'+o.id).setOrigin(0).setScale(.5).setDepth(o.flat?0:o.y+o.h);}
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
  // Your companion, a step behind you.
  this.pet=addPet(this,bridge.petLook());this.petFx=this.add.graphics().setDepth(7003);
  this.actor=this.add.image(model.x,model.y,'survivor-01',model.direction).setOrigin(.5,FRAME.footY/FRAME.displayH).setScale(.5);
  // Lighting multiplies everything below it. Glows, embers and markers sit above it, so they stay bright.
  this.texture('camp-light',Math.ceil(CAMP.w/LIGHT_SCALE),Math.ceil(CAMP.h/LIGHT_SCALE),lightArt);this.add.image(0,0,'camp-light').setOrigin(0).setScale(LIGHT_SCALE).setDepth(6000).setBlendMode(Phaser.BlendModes.MULTIPLY);
  this.texture('camp-glow',128,128,glowArt);this.textures.get('camp-glow').setFilter(Phaser.Textures.FilterMode.LINEAR);
  this.glow=this.add.image(fire.x+fire.w/2,fire.y+6,'camp-glow').setScale(3.2,2.2).setDepth(6001).setBlendMode(Phaser.BlendModes.ADD);
  this.lampGlows=LIGHTS.slice(1,6).map(([x,y],i)=>this.add.image(x,y+(i?0:-20),'camp-glow').setScale(i?.55:1.1,i?.45:.8).setDepth(6001).setBlendMode(Phaser.BlendModes.ADD).setAlpha(.18));
  this.fx=this.add.graphics().setDepth(6002);this.smoke=this.add.graphics().setDepth(5600);this.embers=[];this.puffs=[];this.nextEmber=0;this.nextPuff=0;this.nextWater=0;this.life=new CaveLife(this);
  const icons=this.texture('camp-icons',ICON.w*2*ICONS.length,ICON.h*2,iconArt);ICONS.forEach((k,i)=>{if(!icons.has(k))icons.add(k,0,i*ICON.w*2,0,ICON.w*2,ICON.h*2);});
  this.badges=this.residents.map(r=>this.add.image(r.data.x,r.data.y-92,'camp-icons',r.data.icon).setScale(.5).setOrigin(.5,1).setDepth(7000));
  this.marker=this.add.image(0,0,'camp-icons','chevron').setScale(.5).setOrigin(.5,1).setDepth(7001).setVisible(false);
  this.sparkles=Array.from({length:64},(_,i)=>{const y=236+hash(i,201)*560;return {x:shoreX(y)+14+hash(i,202)*320,y,phase:hash(i,203)*6.28,speed:.0015+hash(i,204)*.002};}).filter(s=>s.x<CAMP.w-4);
  // Fishing: ripples and the fish under the water, the rod and line in the survivor's hands, cues above the lighting.
  this.fishWater=this.add.graphics().setDepth(-4);this.rod=this.add.graphics();this.cues=this.add.graphics().setDepth(7002);this.drops=[];this.camOff=0;this.landedAt=0;this.lastPull=null;this.pullOff={x:0,y:0};
  this.dangle=this.add.image(0,0,'__DEFAULT').setVisible(false).setScale(.5);
  // Grilling: a fish on a spit over the fire.
  this.texture('camp-spit',80,40,()=>{});this.spit=this.add.image(fire.x+fire.w/2,fire.y-6,'camp-spit').setScale(.5).setDepth(fire.y+fire.h+3).setVisible(false);this.spitG=this.add.graphics().setDepth(fire.y+fire.h+2);this.spitShown=-1;
  this.cameras.main.setBackgroundColor('#0b0c10').setBounds(0,0,CAMP.w,CAMP.h).setZoom(this.zoom()).centerOn(model.x,model.y-20);
  this.events.on('wake',()=>{this.setPlayerLook(bridge.look());this.setPetLook(bridge.petLook());bridge.ready(this);});
  bridge.ready(this);}
 setPlayerLook(look){const t=this.textures.get('survivor-01'),c=t.context;c.clearRect(0,0,FRAME.w*8,FRAME.h*FRAME_COUNT);c.imageSmoothingEnabled=false;for(let f=0;f<FRAME_COUNT;f++)for(let d=0;d<8;d++){c.save();c.translate(d*FRAME.w,f*FRAME.h);c.scale(2,2);survivor(c,d,f,true,{...look,zombie:0,gun:'none',grenade:null});c.restore();}t.refresh();}
 update(now,delta){const dt=Math.min(.05,delta/1000);
  if(!bridge.paused())model.update(dt,bridge.input());bridge.step?.(dt);bridge.petStep?.(dt);const fishing=bridge.fishing?.(),pal=bridge.pet();placePet(this.pet,pal);
  this.actor.setPosition(model.x,model.y).setDepth(model.y).setFrame(model.direction+model.frame*8);
  for(const r of this.residents){const dx=model.x-r.data.x,dy=model.y-r.data.y;r.sprite.setFrame(Math.hypot(dx,dy)<FACE_RANGE?facing(dx,dy):r.data.direction);}
  const target=bridge.busy?.()?null:bridge.paused()&&this.target?this.target:model.target(pal.happy?[]:[bridge.petTarget()]);this.target=target;
  this.badges.forEach((b,i)=>b.setY(this.residents[i].data.y-92+Math.round(Math.sin(now/600+i)*1.5*2)/2));
  if(target){const bob=Math.round(Math.sin(now/180)*2*2)/2,x=target.mx??target.x,y=target.kind==='resident'?target.y-116:target.my;this.marker.setVisible(true).setPosition(x,y+bob);}else this.marker.setVisible(false);
  this.flame.setFrame(Math.floor(now/90)%FLAME.frames);this.potFlame.setFrame((Math.floor(now/110)+3)%FLAME.frames);
  this.glow.setAlpha(.34+.05*Math.sin(now*.013)+.03*Math.sin(now*.037));this.lampGlows.forEach((g,i)=>g.setAlpha(.16+.03*Math.sin(now*.005+i*2)));
  this.effects(now,dt);this.life.update(now,dt,[model,pal]);this.petFx.clear();drawHearts(this.petFx,pal,bridge.petTarget().my+6,now);this.drawFishing(fishing,now,dt);this.drawSpit(bridge.cooking?.(),now);
  // While fishing, the camera moves in close and leans out over the water so the bobber and the fish stay in view.
  this.camOff+=((fishing?1:0)-this.camOff)*Math.min(1,dt*3);this.cookOff=(this.cookOff||0)+((bridge.busy?.()&&!fishing?1:0)-(this.cookOff||0))*Math.min(1,dt*3);const cam=this.cameras.main,z=this.zoom(),fz=Math.max(z,Math.min(2.4,this.scale.height/220,this.scale.width/220)),k=this.camOff;
  cam.setZoom(z+(fz-z)*k);cam.centerOn(model.x+44*k+30*this.cookOff,model.y-20-42*k+56*this.cookOff);bridge.tick(now,this);}
 setPetLook(look){petSheet(this,look);}
 setRackFish(n){n=Math.min(9,n);if(n===this.rackFish)return;this.rackFish=n;const o=PROPS.find(p=>p.id==='rack'),t=this.textures.get('camp-rack'),c=t.context;c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,t.width,t.height);propArt(c,{...o,fish:n});t.refresh();}
 fishTexture(id){const key='camp-fish-'+id;this.texture(key,80,40,c=>{c.imageSmoothingEnabled=false;c.save();c.scale(2,2);c.translate(22.5,10);fishArt(c,id);c.restore();});return key;}
 drawSpit(v,now){const g=this.spitG;g.clear();this.spit.setVisible(!!v);if(!v)return;const fire=PROPS.find(o=>o.id==='fire'),cx=fire.x+fire.w/2,y=fire.y-6;
  const step=Math.floor(v.p*40);if(step!==this.spitShown||this.spitId!==v.id){this.spitShown=step;this.spitId=v.id;const t=this.textures.get('camp-spit'),c=t.context;c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,80,40);c.imageSmoothingEnabled=false;c.save();c.scale(2,2);c.translate(22.5,10);fishArt(c,v.id,v.p);c.restore();t.refresh();}
  // Turned now and then, so both sides cook.
  this.spit.setPosition(cx+2.5,y).setFlipY(Math.floor(now/1400)%2===1);
  for(const x of [cx-24,cx+24]){g.fillStyle(0x191b21);g.fillRect(x-1,y-3,2,fire.y+22-y);g.fillRect(x-3,y-4,2,3);g.fillRect(x+1,y-4,2,3);g.fillStyle(0x6b5233);g.fillRect(x-.5,y-2.5,1,fire.y+21-y);}
  g.fillStyle(0x191b21);g.fillRect(cx-27,y-1,54,2);g.fillStyle(0x8a6a44);g.fillRect(cx-26.5,y-.5,53,1);}
 // The rod bends toward the fish and the line reddens under strain. The fish's pull and the way to hold are drawn above the lighting.
 drawFishing(v,now,dt){const W=this.fishWater,R=this.rod,X=this.cues;W.clear();R.clear();X.clear();if(!v){this.dangle.setVisible(false);this.drops.length=0;return;}
  const px=model.x,py=model.y,hand={x:px+7,y:py-30},rest={x:hand.x+24,y:hand.y-27},T=v.target||{x:PIER_END+50,y:py},t=now/1000,s=v.state;let hook,tip=rest,sag=6,under=false;
  const unit=(a,b)=>{const dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy)||1;return {x:dx/d,y:dy/d};},lerp=(a,b,k)=>({x:a.x+(b.x-a.x)*k,y:a.y+(b.y-a.y)*k});
  if(s==='fight'||s==='slack'){const base=lerp({x:PIER_END+4,y:py+2},T,Math.max(.12,v.line)),want=s==='fight'&&v.pull?{x:v.pull.x*14,y:v.pull.y*9}:{x:0,y:0};this.pullOff.x+=(want.x-this.pullOff.x)*Math.min(1,dt*2.5);this.pullOff.y+=(want.y-this.pullOff.y)*Math.min(1,dt*2.5);
   hook={x:base.x+this.pullOff.x+Math.sin(t*7)*(s==='fight'?1.5:.5),y:base.y+this.pullOff.y+Math.cos(t*5)*(s==='fight'?1:.4)};under=true;const k=s==='fight'?.3+.55*v.tension:.15;tip=lerp(rest,{x:hand.x+unit(hand,hook).x*34,y:hand.y+unit(hand,hook).y*34},k);sag=s==='fight'?0:4;
   if(s==='fight'&&v.pull!==this.lastPull){this.lastPull=v.pull;this.splash(hook.x,hook.y,10);}if(Math.random()<dt*(s==='fight'?3+v.tension*6:.8))this.splash(hook.x,hook.y,s==='fight'?3:1);}
  else if(s==='cast'){const k=Math.min(1,v.t/.7);hook={x:rest.x+(T.x-rest.x)*k,y:rest.y+(T.y-rest.y)*k-Math.sin(k*Math.PI)*36};tip=lerp(rest,{x:hand.x+20,y:hand.y-30},1-k);sag=0;}
  else if(s==='wait'||s==='early'||s==='bite'||s==='lost'){hook={x:T.x,y:T.y};if(s==='bite'){under=true;tip=lerp(rest,{x:hand.x+30,y:hand.y-14},.3+.2*Math.sin(t*30));}}
  else if(s==='landed'){if(!this.landedAt)this.landedAt=now;const k=Math.min(1,(now-this.landedAt)/450);tip=lerp(rest,{x:hand.x+30,y:hand.y-30},k);hook={x:tip.x+Math.sin(t*4)*3,y:tip.y+14};sag=0;}
  else {tip=rest;hook={x:rest.x+3,y:rest.y+(s==='snapped'?10:16)};sag=0;}
  if(s!=='landed')this.landedAt=0;
  // Bobber, ripples and the fish's shadow.
  if(s==='wait'||s==='early'||s==='lost'||(s==='cast'&&v.t>.66)){const bob=Math.sin(t*3)*.4+(v.nibble||0)*5,b={x:T.x,y:T.y+bob};hook=b;
   const ring=(t*.7)%1;W.lineStyle(.5,0xb9c7c1,.5*(1-ring));W.strokeEllipse(b.x,b.y+1.5,4+ring*14,2+ring*6);if(v.nibble>.1){W.lineStyle(.5,0xd8e2dd,.8);W.strokeEllipse(b.x,b.y+1.5,7,3);}
   W.fillStyle(0x191b21);W.fillCircle(b.x,b.y,2.3);W.fillStyle(0xc8452f);W.fillCircle(b.x,b.y,1.7);W.fillStyle(0xe8e0d1);W.fillRect(b.x-1.5,b.y-1.8,3,1.4);W.fillStyle(0x191b21);W.fillRect(b.x-.25,b.y-4,.5,2.2);}
  if(s==='bite'){for(let i=0;i<3;i++){const r=((t*1.6+i/3)%1);W.lineStyle(.75,0xd8e2dd,.8*(1-r));W.strokeEllipse(T.x,T.y+1,4+r*22,2+r*9);}if(Math.random()<dt*14)this.splash(T.x,T.y,2);}
  if(under&&s!=='bite'){W.fillStyle(0x0a1820,.55);W.fillEllipse(hook.x+(this.pullOff.x>0?2:-2),hook.y+2,14,4.5);W.lineStyle(.5,0xb9c7c1,.45);W.strokeEllipse(hook.x,hook.y+1.5,12+Math.sin(t*9)*2,5);}
  this.drops=this.drops.filter(d=>(d.life-=dt)>0);for(const d of this.drops){d.vy+=60*dt;d.x+=d.vx*dt;d.y+=d.vy*dt;W.fillStyle(0xe2ece8,Math.min(1,d.life*3));W.fillRect(Math.round(d.x*2)/2,Math.round(d.y*2)/2,.5+(d.big?.5:0),.5+(d.big?.5:0));}
  // Rod and line.
  const ctrl=lerp(hand,rest,.55),pts=[];for(let i=0;i<=8;i++){const k=i/8,a=lerp(hand,ctrl,k),b=lerp(ctrl,tip,k);pts.push(lerp(a,b,k));}
  R.setDepth(model.y+1);R.lineStyle(2,0x191b21,1);R.strokePoints(pts);R.lineStyle(1,0x8a6a44,1);R.strokePoints(pts.slice(0,6));R.lineStyle(.6,0x6b5233,1);R.strokePoints(pts.slice(5));
  if(hook){const strain=s==='fight'?Math.max(0,(v.tension-.45)/.55):0,c=mixColor(0xd8d4c8,0xff5a3a,strain);
   const mid=lerp(tip,hook,.5),line=[];mid.y+=sag;for(let i=0;i<=10;i++){const k=i/10,a=lerp(tip,mid,k),b=lerp(mid,hook,k);line.push(lerp(a,b,k));}if(s==='fight'&&v.tension>.75)for(const p of line.slice(1,-1))p.y+=(Math.random()-.5)*.8;
   R.lineStyle(.5,c,.9);R.strokePoints(line);R.fillStyle(0xffd2a0,1);R.fillRect(Math.round(tip.x*2)/2-.25,Math.round(tip.y*2)/2-.25,.5,.5);}
  // The catch, swinging from the line.
  if(s==='landed'&&v.catch){this.dangle.setTexture(this.fishTexture(v.catch.id)).setOrigin(.83,.5).setRotation(-Math.PI/2+Math.sin(t*4)*.15).setPosition(hook.x,hook.y).setDepth(model.y+2).setVisible(true);}else this.dangle.setVisible(false);
  // Cues: "!" on a bite, the fish's pull, and which way to hold.
  if(s==='bite'&&Math.floor(t*8)%2===0)this.glyph(X,T.x,T.y-22,'!',0xff9a52);
  if(s==='bite')this.arrow(X,px-30,py-42,{x:-1,y:0},0xff9a52,1);
  if(s==='fight'&&v.pull){this.arrow(X,hook.x+v.pull.x*12,hook.y-14+v.pull.y*8,v.pull,0xe0503a,.95);const good=v.stance==='counter';this.arrow(X,px-30,py-42,{x:-v.pull.x,y:-v.pull.y},good?0xff9a52:0xe8e0d1,good?1:(Math.floor(t*6)%2?.9:.35));}}
 splash(x,y,n){for(let i=0;i<n;i++)this.drops.push({x:x+(Math.random()-.5)*6,y,vx:(Math.random()-.5)*30,vy:-20-Math.random()*30,life:.35+Math.random()*.3,big:Math.random()<.3});}
 // A chunky pixel arrow, outlined in ink so it reads on water and sand.
 arrow(g,x,y,d,color,alpha){const P=(u,v)=>({x:x+u*d.x-v*d.y,y:y+u*d.y+v*d.x}),shape=(o)=>[P(-7-o,-1.5-o),P(1,-1.5-o),P(1,-5-o*1.6),P(7+o*1.6,0),P(1,5+o*1.6),P(1,1.5+o),P(-7-o,1.5+o)];
  g.fillStyle(0x111319,alpha);g.fillPoints(shape(1),true);g.fillStyle(color,alpha);g.fillPoints(shape(0),true);}
 glyph(g,x,y,ch,color){g.fillStyle(0x111319);g.fillRect(x-2.5,y-10,5,11);g.fillRect(x-2.5,y+2,5,5);g.fillStyle(color);g.fillRect(x-1.5,y-9,3,9);g.fillRect(x-1.5,y+3,3,3);}
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
