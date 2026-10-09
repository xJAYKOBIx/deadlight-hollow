import {WORLD,BUILDINGS,COVERS,STATIONS,CRATES,NPCS,YARD,WATER} from './data.js';
import {ground,building,prop,person,PROPS,pixelFinish} from './art.js';
import {inside} from './sim.js';
const SY=WORLD.sy,TILE=512;
export function makeScene(model,bridge){return class Village extends Phaser.Scene{
 constructor(){super('Hollow');this.model=model;this.groundTiles=new Map();this.actors=new Map();this.staticItems=[];this.elapsed=0;this.lastFrame=0;}
 canvasTexture(key,w,h,draw){if(this.textures.exists(key))return this.textures.get(key);let t=this.textures.createCanvas(key,w,h);draw(t.context);if(!key.startsWith('player-')&&!key.startsWith('npc')&&!['brute','runner','shambler'].includes(key))pixelFinish(t.context,w,h);t.refresh();return t;}
 sheet(key,look,enemy=null){if(this.textures.exists(key))return;let t=this.canvasTexture(key,1280,768,c=>{c.save();c.scale(2,2);for(let f=0;f<4;f++)for(let a=0;a<8;a++){c.save();c.translate(a*80,f*96);person(c,look,a/8*Math.PI*2,f,enemy);c.restore();}c.restore();});for(let f=0;f<4;f++)for(let a=0;a<8;a++)t.add(f*8+a,0,a*160,f*192,160,192);}
 create(){this.cameras.main.setBackgroundColor('#171e30');this.cameras.main.setBounds(0,0,WORLD.w,WORLD.h*SY);this.cameras.main.centerOn(model.p.x,model.p.y*SY);this.cameras.main.setZoom(bridge.zoom());
 for(let kind of ['rock','fern','lamp','crate','garden','boat','fire','target','cover','sail','barrel','bench']){for(let v=0;v<(kind==='rock'?4:1);v++)this.canvasTexture(kind+v,120,120,c=>prop(c,kind,v));}
 for(let b of BUILDINGS){this.canvasTexture(b.id,b.w+90,Math.ceil(b.h*SY+b.z+55),c=>building(c,b));let img=this.add.image(b.x-24,b.y*SY-b.z-24,b.id).setOrigin(0).setDepth(b.y+b.h);this.staticItems.push({img,x:b.x,y:b.y*SY,w:b.w+90,h:b.h*SY+b.z+55});}
 for(let o of PROPS){let img=this.add.image(o.x,o.y*SY,o.kind+(o.kind==='rock'?(o.seed||0)%4:0)).setOrigin(.5,.9).setScale(o.scale||1).setDepth(o.y+8);this.staticItems.push({img,x:o.x-100,y:o.y*SY-160,w:250,h:220});}
 this.crateImages=new Map();for(let o of CRATES){let img=this.add.image(o.x,o.y*SY,'crate0').setOrigin(.5,.9).setScale(.65).setDepth(o.y);this.crateImages.set(o.id,img);}
 for(let c of COVERS)this.add.image(c.x+c.w/2,(c.y+c.h)*SY,'cover0').setOrigin(.5,.9).setDisplaySize(c.w+20,70).setDepth(c.y+c.h);
 this.targetImages=model.dummies.map(d=>this.add.image(d.x,d.y*SY,'target0').setOrigin(.5,.9).setScale(.75).setDepth(d.y));
 this.npcImages=[];for(let i=0;i<8;i++)this.sheet('npc'+i,{coat:i%6,skin:i%4,hair:i%8,hairColor:i%8,outfit:i%6,pack:i%3,body:i%2,headwear:i%4,beard:i%3===0?4:0,nose:i%4,trousers:i%6});for(let n of NPCS){let img=this.add.image(n.a[0],n.a[1]*SY,'npc'+n.id%8,0).setOrigin(.5,85/96).setScale(.5);this.npcImages.push({n,img});}
 for(let s of STATIONS){let i=STATIONS.indexOf(s);let npc=this.add.image(s.x+32,(s.y-12)*SY,'npc'+i%8,2).setOrigin(.5,85/96).setScale(.5).setDepth(s.y-12);this.npcImages.push({station:s,img:npc});}
 // Enemy sheets are created only when their first drill opponent appears.
 this.player=this.add.image(model.p.x,model.p.y*SY,'npc0',0).setOrigin(.5,85/96).setScale(.5);this.updateLook();
 this.waterFX=this.add.graphics().setDepth(-9999);this.ripples=Array.from({length:48},(_,i)=>({x:2420+(i*193)%1450,y:700+(i*137)%1400,phase:i*.61})).filter(r=>inside(r.x,r.y,WATER));this.markers=this.add.graphics().setDepth(9900);this.effects=this.add.graphics().setDepth(10000);this.floatLabels=[];
 this.stationLabels=STATIONS.map(s=>this.add.text(s.x,s.y*SY-82,s.label.toUpperCase(),{fontFamily:'Arial',fontSize:11,color:'#ddd9bf',backgroundColor:'#1b2134dd',padding:{x:8,y:5}}).setOrigin(.5).setDepth(9000));
 this.cameras.main.centerOn(model.p.x,model.p.y*SY);this.game.canvas.addEventListener('webglcontextlost',()=>bridge.pause());bridge.ready(this);}
 updateLook(){let key='player-'+Object.values(model.look).join('-')+'-'+model.armor+'-'+model.weapon+'-'+Number(model.inYard);if(this.lookKey===key)return;let old=this.lookKey;this.sheet(key,{...model.look,armor:model.armor,weapon:model.weapon,armed:model.inYard});this.player.setTexture(key,2);this.lookKey=key;if(old)this.textures.remove(old);}
 update(now,delta){if(bridge.low()&&now-this.lastFrame<32)return;let dt=Math.min(.05,(now-this.lastFrame||delta)/1000);this.lastFrame=now;this.elapsed+=dt;if(!bridge.paused()){model.update(dt,bridge.input(this));bridge.events();}this.updateLook();let cam=this.cameras.main,p=model.p;cam.setZoom(bridge.zoom());let targetX=p.x-cam.width/2,targetY=p.y*SY-cam.height/2;cam.setScroll(cam.scrollX+(targetX-cam.scrollX)*.15,cam.scrollY+(targetY-cam.scrollY)*.15);
 let v={x:cam.scrollX+cam.width/2-cam.width/(2*cam.zoom)-250,y:cam.scrollY+cam.height/2-cam.height/(2*cam.zoom)-250,w:cam.width/cam.zoom+500,h:cam.height/cam.zoom+500};let desired=new Set();let made=0;for(let yy=Math.max(0,Math.floor(v.y/TILE));yy<=Math.min(Math.ceil(WORLD.h*SY/TILE)-1,Math.floor((v.y+v.h)/TILE));yy++)for(let xx=Math.max(0,Math.floor(v.x/TILE));xx<=Math.min(Math.ceil(WORLD.w/TILE)-1,Math.floor((v.x+v.w)/TILE));xx++){let key='ground-'+xx+'-'+yy;desired.add(key);if(!this.groundTiles.has(key)&&made<3){this.canvasTexture(key,TILE,TILE,c=>ground(c,xx*TILE,yy*TILE));this.groundTiles.set(key,this.add.image(xx*TILE,yy*TILE,key).setOrigin(0).setDepth(-10000));made++;}}
 for(let [key,img]of this.groundTiles)if(!desired.has(key)){img.destroy();this.textures.remove(key);this.groundTiles.delete(key);}
 for(let o of this.staticItems)o.img.setVisible(o.x+o.w>v.x&&o.x<v.x+v.w&&o.y+o.h>v.y&&o.y<v.y+v.h);
 for(let [id,img]of this.crateImages)img.setVisible(!model.collected.includes(id));
 let dir=Math.round((p.angle+Math.PI*2)/(Math.PI*2)*8)%8,frame=model.moving&&!bridge.paused()?Math.floor(model.time*9)%4:0;this.player.setPosition(p.x,p.y*SY).setDepth(p.y+5).setFrame(frame*8+dir).setAlpha(p.invuln>.1&&Math.floor(now/90)%2?.6:1);
 for(let a of this.npcImages){if(a.station)continue;let {n,img}=a,t=(Math.sin(this.elapsed*.11+n.id)+1)/2;let x=n.a[0]+(n.b[0]-n.a[0])*t,y=n.a[1]+(n.b[1]-n.a[1])*t;let angle=Math.atan2((n.b[1]-n.a[1])*Math.cos(this.elapsed*.11+n.id),(n.b[0]-n.a[0])*Math.cos(this.elapsed*.11+n.id));let facing=(Math.round(angle/(Math.PI*2)*8)+8)%8;img.setPosition(x,y*SY).setDepth(y).setFrame(Math.floor(this.elapsed*5+n.id)%4*8+facing).setVisible(Math.abs(x-p.x)<1100&&Math.abs(y-p.y)<850);}
 let live=new Set();for(let e of model.enemies){live.add(e.id);let img=this.actors.get(e.id);if(!img){this.sheet(e.type,{},e.type);img=this.add.image(e.x,e.y*SY,e.type,0).setOrigin(.5,85/96).setScale(.5);this.actors.set(e.id,img);}let a=Math.atan2(p.y-e.y,p.x-e.x),f=(Math.round(a/(Math.PI*2)*8)+8)%8;img.setPosition(e.x,e.y*SY).setDepth(e.y).setFrame(Math.floor(model.time*6)%4*8+f).setTint(e.flash>0?0xffdda4:0xffffff);}
 for(let [id,img]of this.actors)if(!live.has(id)){img.destroy();this.actors.delete(id);}
 // Targets are hidden during encounter drills; free practice targets reset automatically.
 model.dummies.forEach((d,i)=>this.targetImages[i].setAlpha(model.drill?0:d.hp>0?1:.28).setTint(d.flash>0?0xffd47a:0xffffff));
 this.waterFX.clear();for(let r of this.ripples){if(Math.abs(r.x-p.x)>1000||Math.abs(r.y-p.y)>800)continue;let t=(this.elapsed*.35+r.phase)%1;this.waterFX.lineStyle(2,0x91aac1,Math.sin(t*Math.PI)*.22);this.waterFX.lineBetween(r.x-8-t*12,r.y*SY-t*5,r.x+8+t*12,r.y*SY-t*5);}
 this.effects.clear();for(let b of model.bullets){this.effects.lineStyle(2,0xf5dfa0,.9);this.effects.lineBetween(b.x,b.y*SY,b.x-b.vx*.014,b.y*SY-b.vy*.014);}
 for(let e of model.enemies){this.effects.fillStyle(0x16272d,.8);this.effects.fillRect(e.x-18,e.y*SY-70,36,3);this.effects.fillStyle(0xc6aa8e,1);this.effects.fillRect(e.x-18,e.y*SY-70,36*Math.max(0,e.hp/e.max),3);}
 if(!model.drill&&model.inYard)for(let e of model.dummies){this.effects.fillStyle(0xc2b1df,.8);this.effects.fillRect(e.x-18,e.y*SY-84,36*Math.max(0,e.hp/200),3);}
 // Reuse a small label pool for damage readouts.
 while(this.floatLabels.length<model.effects.length)this.floatLabels.push(this.add.text(0,0,'',{fontFamily:'Arial',fontSize:14,fontStyle:'bold',color:'#fff0b8',stroke:'#29363c',strokeThickness:3}).setOrigin(.5).setDepth(11000));this.floatLabels.forEach((txt,i)=>{let e=model.effects[i];txt.setVisible(!!e);if(e)txt.setText(e.value).setPosition(e.x,e.y*SY-70-(.65-e.life)*30).setAlpha(Math.min(1,e.life*3));});
 this.markers.clear();let near=model.nearest();STATIONS.forEach((s,i)=>{let dist=Math.hypot(s.x-p.x,s.y-p.y);this.stationLabels[i].setVisible(dist<540).setAlpha(dist<180?1:.65);if(dist<300){this.markers.lineStyle(1,near?.id===s.id?0xd0b7ec:0xd5c994,near?.id===s.id ? .8 : .3);this.markers.strokeEllipse(s.x,s.y*SY,38,24);}});
 if(bridge.waypoint){let s=bridge.waypoint;this.markers.lineStyle(2,0xd2bcec,.8);this.markers.strokeEllipse(s.x,s.y*SY,42+Math.sin(now/300)*5,26);}
 bridge.hud(now,this);
 }
};}
