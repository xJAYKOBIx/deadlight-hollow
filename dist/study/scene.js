import {Practice} from './practice.js';import {targetArt,practiceEffects} from './practice-art.js';
import {survivor,FRAME,FRAME_COUNT} from './character.js';import {ROOM,SOLIDS} from './model.js';import {roomFloor,roomProp} from './room.js';import {addPet,placePet,petSheet} from '../companion/sprite.js';
export function makeStudyScene(model,bridge){return class CharacterRoom extends Phaser.Scene{
 constructor(){super('CharacterRoom');this.model=model;this.practice=new Practice(model,bridge.loadout());}
 texture(key,w,h,draw){let t=this.textures.createCanvas(key,w,h);draw(t.context);t.refresh();return t;}
 create(){this.texture('study-floor',ROOM.w,ROOM.h,roomFloor);this.add.image(0,0,'study-floor').setOrigin(0).setDepth(-1);
 for(let o of SOLIDS){this.texture(o.id,o.w+20,o.h+o.height+14,c=>roomProp(c,o));this.add.image(o.x,o.y-o.height,o.id).setOrigin(0).setDepth(o.y+o.h);}
 this.texture('practice-target',48,66,targetArt);this.targetSprites=this.practice.targets.map(t=>this.add.image(t.x-24,t.y-60,'practice-target').setOrigin(0).setDepth(t.y));this.fx=this.add.graphics().setDepth(2000);
 this.texture('survivor-01',FRAME.w*8,FRAME.h*FRAME_COUNT,()=>{});let t=this.textures.get('survivor-01');for(let f=0;f<FRAME_COUNT;f++)for(let d=0;d<8;d++)t.add(f*8+d,0,d*FRAME.w,f*FRAME.h,FRAME.w,FRAME.h);this.setAppearance(bridge.appearance());
 this.pet=bridge.pet?addPet(this,bridge.petLook()):null;
 this.actor=this.add.image(model.x,model.y,'survivor-01',1).setOrigin(.5,85/96).setScale(.5);this.cameras.main.setBackgroundColor('#242630').setBounds(0,0,ROOM.w,ROOM.h).setZoom(bridge.zoom()).centerOn(model.x,model.y-20);this.game.canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();bridge.contextLost();});this.game.canvas.addEventListener('webglcontextrestored',()=>bridge.contextRestored());bridge.ready(this);}
 setPetLook(look){if(this.pet)petSheet(this,look);}
 setAppearance(look){const t=this.textures.get('survivor-01'),c=t.context;c.clearRect(0,0,FRAME.w*8,FRAME.h*FRAME_COUNT);c.imageSmoothingEnabled=false;for(let f=0;f<FRAME_COUNT;f++)for(let d=0;d<8;d++){c.save();c.translate(d*FRAME.w,f*FRAME.h);c.scale(2,2);survivor(c,d,f,true,{...look,...this.practice.loadout});c.restore();}t.refresh();}
 update(now,delta){if(!bridge.paused()){const input=bridge.input();model.update(delta/1000,input);this.practice.update(delta/1000,input);}this.actor.setPosition(model.x,model.y).setDepth(model.y).setFrame(model.direction+model.frame*8);if(this.pet){bridge.petStep(delta/1000);placePet(this.pet,bridge.pet());}let cam=this.cameras.main;cam.setZoom(bridge.zoom());cam.centerOn(model.x,model.y-20);practiceEffects(this.fx,this.practice);for(let i=0;i<this.targetSprites.length;i++)this.targetSprites[i].setAlpha(this.practice.targets[i].hp>0?1:.3);bridge.tick(now);}
};}
