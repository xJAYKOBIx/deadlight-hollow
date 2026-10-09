import {WORLD,OBSTACLES,ENEMIES,CHARACTERS,WEAPONS,clamp} from './sim.js';
const Y=.72;
function rect(c,x,y,w,h,color){c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),w,h);}
function ellipse(c,x,y,rx,ry,color){c.fillStyle=color;c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fill();}
function poly(c,pts,color){c.fillStyle=color;c.beginPath();c.moveTo(...pts[0]);for(let p of pts.slice(1))c.lineTo(...p);c.closePath();c.fill();}
export function drawPerson(c,x,y,kind='ivy',scale=1,frame=0,angle=0,hit=false){
 c.save();c.translate(Math.round(x),Math.round(y));c.scale(scale,scale);c.imageSmoothingEnabled=false;
 let ch=CHARACTERS.find(q=>q.id===kind),e=ENEMIES[kind],coat=ch?ch.accent:e?.color||'#9eb188',skin=ch?'#e7bd9b':kind==='volatile'?'#b7bb81':'#b6c397',hat=ch?ch.color:'#778061',s=frame?2:-2;
 ellipse(c,0,1,14,5,'#070d164d');
 if(kind==='boss'){rect(c,-18,-54,36,39,'#4d4159');rect(c,-27,-63,54,12,'#504451');rect(c,-18,-77,36,18,'#75657a');rect(c,-14,-51,28,21,'#d3b791');rect(c,-11,-46,5,4,'#f1a96c');rect(c,7,-46,5,4,'#f1a96c');rect(c,-7,-34,14,2,'#48383d');rect(c,-18,-28,36,22,'#62546f');rect(c,-30,-30,14,8,'#82778d');rect(c,16,-31,14,8,'#82778d');rect(c,-15,-8,11,12,'#393348');rect(c,6,-8,11,12,'#393348');rect(c,30,-53,5,54,'#bca477');rect(c,22,-63,20,15,'#b8b9b3');c.restore();return;}
 if(kind==='brute'){c.scale(1.35,1.25);coat='#887594';skin='#c0a6bc';}
 rect(c,-9,-9+s,6,10,'#282d38');rect(c,3,-9-s,6,10,'#282d38');rect(c,-10,0+s,8,3,'#bbb39e');rect(c,2,0-s,8,3,'#bbb39e');
 rect(c,-11,-27,22,20,hit?'#fbf0d7':coat);rect(c,-13,-25,4,14,coat);rect(c,9,-25,4,14,coat);rect(c,-13,-13,4,5,skin);rect(c,9,-13,4,5,skin);
 rect(c,-9,-42,18,17,hit?'#fff4da':skin);rect(c,-12,-42,24,6,hat);rect(c,-10,-38,4,10,hat);rect(c,7,-38,4,10,hat);
 let side=Math.cos(angle)>0?2:-2;rect(c,-5+side,-34,3,3,ch?'#333340':'#ecdb9b');rect(c,3+side,-34,3,3,ch?'#333340':'#ecdb9b');rect(c,-3+side,-28,6,2,'#806f66');rect(c,-7,-24,14,4,hat);
 if(kind==='ivy'){rect(c,-13,-45,26,4,'#596a59');rect(c,-7,-49,16,6,'#8d9974');rect(c,8,-50,3,8,'#d3ed9e');}
 if(kind==='rook'){rect(c,-10,-45,20,5,'#6c625f');rect(c,-7,-43,14,4,'#dfab81');rect(c,-8,-16,16,3,'#dda878');}
 if(kind==='wren'){rect(c,-10,-45,20,7,'#d6e9d6');rect(c,-2,-44,4,7,'#75afa6');rect(c,-5,-42,10,3,'#75afa6');rect(c,2,-20,6,7,'#e0e0c1');}
 if(kind==='hex'){rect(c,-12,-45,24,9,'#554b70');rect(c,-10,-40,8,6,'#c5b4eb');rect(c,2,-40,8,6,'#c5b4eb');rect(c,-8,-39,4,3,'#594d78');rect(c,4,-39,4,3,'#594d78');}
 if(kind==='runner'){rect(c,-10,-44,20,5,'#b07268');rect(c,-3,-22,5,10,'#d6bc98');}
 if(kind==='spitter'){rect(c,-12,-23,24,5,'#6f9660');rect(c,-4,-31,8,7,'#d6dc89');}
 if(kind==='volatile'){rect(c,-13,-39,26,14,'#d0ac68');rect(c,-7,-37,14,8,'#4b5550');rect(c,-10,-20,20,8,'#d1af6e');rect(c,-3,-19,6,6,'#494c42');}
 if(kind==='keeper'){rect(c,-13,-29,26,24,'#729d97');rect(c,-3,-22,6,12,'#d9eac9');rect(c,-6,-19,12,5,'#d9eac9');rect(c,-8,-46,16,7,'#bfd9bd');}
 c.restore();
}
export class Renderer{
 constructor(canvas){this.canvas=canvas;this.ctx=canvas.getContext('2d',{alpha:false});this.width=800;this.height=600;this.scale=1;this.camera={x:1100,y:1050};this.shake=0;this.low=false;this.makeGround();}
 resize(w,h){this.width=w;this.height=h;let ratio=Math.min(window.devicePixelRatio||1,this.low?1:1.7);this.ratio=ratio;this.canvas.width=Math.round(w*ratio);this.canvas.height=Math.round(h*ratio);this.scale=clamp(Math.min(w/1000,h/570),.56,1.65);if(h>w)this.scale=clamp(w/650,.53,1);}
 makeGround(){let cv=document.createElement('canvas');cv.width=WORLD.w;cv.height=Math.ceil(WORLD.h*Y);let c=cv.getContext('2d');rect(c,0,0,cv.width,cv.height,'#293b38');let seed=4623;const r=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
  for(let i=0;i<12000;i++){let x=r()*WORLD.w,y=r()*WORLD.h*Y;rect(c,x,y,2+r()*5,2,['#30443e','#34453e','#233832','#3a4b3e','#2c4039'][Math.floor(r()*5)]);}
  const path=(x,y,w,h)=>{rect(c,x,y*Y,w,h*Y,'#53574c');for(let yy=y;yy<y+h;yy+=30)for(let xx=x;xx<x+w;xx+=42)rect(c,xx+2,yy*Y+2,38,18,['#636557','#5c6051','#585d50'][Math.floor(r()*3)]);};
  path(290,1080,1900,110);path(1390,200,120,1370);path(290,1080,140,580);path(950,975,130,200);path(1390,710,820,90);
  rect(c,690,410*Y,620,590*Y,'#5b514e');for(let y=410;y<1000;y+=26)for(let x=690;x<1310;x+=85){rect(c,x+1,y*Y+1,82,16,['#625754','#675c57','#594f4d'][Math.floor(r()*3)]);}
  rect(c,920,475*Y,180,135*Y,'#806065');rect(c,930,485*Y,160,115*Y,'#946d70');rect(c,940,495*Y,140,95*Y,'#756369');
  rect(c,925,790*Y,150,130*Y,'#546b68');rect(c,934,799*Y,132,112*Y,'#6d8378');
  rect(c,1600,225*Y,550,480*Y,'#3a423d');for(let y=250;y<700;y+=35)for(let x=1610;x<2150;x+=40)rect(c,x+4,y*Y,25,3,'#465046');
  for(let i=0;i<130;i++){let x=1580+r()*600,y=920+r()*650;rect(c,x,y*Y,4,3,i%3?'#6b7250':'#a9a16d');}
  for(let i=0;i<50;i++){let x=150+r()*450,y=150+r()*800;rect(c,x,y*Y,3,6,'#61624b');rect(c,x-2,y*Y,6,2,'#9b9293');}
  // Low boundary stonework gives the arena an unmistakable edge.
  for(let x=30;x<WORLD.w-30;x+=40){rect(c,x,30,37,20,'#434c49');rect(c,x,WORLD.h*Y-50,37,20,'#434c49');}
  for(let y=50;y<WORLD.h*Y-40;y+=30){rect(c,30,y,25,28,'#434c49');rect(c,WORLD.w-55,y,25,28,'#434c49');}
  c.font='bold 14px monospace';c.fillStyle='#a2ad9960';c.textAlign='center';c.fillText('H O L L O W   H O U S E',990,1090*Y);c.fillText('T H E   O L D   G R O U N D S',1870,860*Y);
  this.ground=cv;
 }
 screenToWorld(x,y){return {x:(x-this.width/2)/this.scale+this.camera.x,y:((y-this.height*.52)/this.scale+this.camera.y*Y)/Y};}
 project(x,y){return {x:(x-this.camera.x)*this.scale+this.width/2,y:(y-this.camera.y)*Y*this.scale+this.height*.52};}
 box(c,o,h,top,front,side){let x=o.x,y=o.y*Y,w=o.w,d=o.h*Y;poly(c,[[x+8,y+d],[x+w+18,y+d+9],[x+w+18,y-h+12],[x+w,y-h]],'#0f17232d');rect(c,x,y-h,w,d,top);rect(c,x,y+d-h,w,h,front);rect(c,x+w-6,y-h,6,d+h,side);rect(c,x,y-h,w,3,'#ffffff13');}
 object(c,o){let x=o.x,y=o.y*Y;
  if(o.kind==='wall'){this.box(c,o,53,'#797681','#464956','#545464');for(let xx=x+15;xx<x+o.w;xx+=55)rect(c,xx,y+o.h*Y-35,2,22,'#363d47');}
  if(o.kind==='table'){this.box(c,o,23,'#a58a69','#695e52','#7b6a57');rect(c,x+18,y-16,22,13,'#cfbf98');rect(c,x+50,y-13,9,10,'#d2b695');}
  if(o.kind==='shelf'){this.box(c,o,44,'#7b6861','#4e494c','#60545a');for(let xx=x+5;xx<x+o.w-10;xx+=11)rect(c,xx,y-37,7,23,['#9a7f76','#aca283','#818a81'][Math.floor(xx)%3]);}
  if(o.kind==='sofa'){this.box(c,o,24,'#746575','#504958','#5c5063');rect(c,x,y-35,o.w,15,'#847588');rect(c,x+8,y-18,4,34,'#9a8791');}
  if(o.kind==='crate'){this.box(c,o,28,'#9a825e','#79634d','#675547');c.strokeStyle='#c0a175';c.lineWidth=3;c.strokeRect(x+5,y-24,o.w-12,o.h*Y-5);c.beginPath();c.moveTo(x+5,y-24);c.lineTo(x+o.w-7,y+o.h*Y-29);c.stroke();}
  if(o.kind==='grave'){ellipse(c,x+20,y+25,33,12,'#202a2d');rect(c,x-6,y-2,55,29,'#545c58');rect(c,x+3,y-34,34,49,'#91968b');rect(c,x+9,y-40,22,8,'#a6aa98');rect(c,x+15,y-30,9,27,'#69766b');rect(c,x+8,y-21,23,6,'#69766b');rect(c,x+2,y+12,36,6,'#a1a795');}
  if(o.kind==='fountain'){ellipse(c,x+50,y+34,74,44,'#1c2d30');ellipse(c,x+50,y+27,62,36,'#7a8d86');ellipse(c,x+50,y+24,51,29,'#3f666a');ellipse(c,x+50,y+20,36,20,'#5c8583');rect(c,x+42,y-25,17,46,'#9eafa0');ellipse(c,x+50,y-28,30,12,'#9fac9d');ellipse(c,x+50,y-32,23,8,'#567977');}
  if(o.kind==='tree'){ellipse(c,x+25,y+20,68,28,'#11262870');rect(c,x+16,y-55,18,72,'#5a5046');rect(c,x+20,y-54,5,61,'#7c6e55');poly(c,[[x-40,y-55],[x-10,y-107],[x+26,y-130],[x+68,y-95],[x+87,y-51],[x+59,y-30],[x+8,y-24]],'#344d43');poly(c,[[x-28,y-63],[x+3,y-104],[x+31,y-120],[x+64,y-84],[x+66,y-48],[x+22,y-43]],'#49614b');rect(c,x-8,y-89,28,7,'#617151');rect(c,x+25,y-68,28,9,'#617151');}
 }
 draw(game,now,menu=false){let c=this.ctx,w=this.width,h=this.height,p=game.player;let target=menu?{x:1160+Math.sin(now*.00007)*80,y:930+Math.cos(now*.00007)*40}:p;this.camera.x+=(target.x-this.camera.x)*.12;this.camera.y+=(target.y-this.camera.y)*.12;let halfW=w/(2*this.scale),halfH=h/(2*this.scale*Y);this.camera.x=halfW>WORLD.w/2?WORLD.w/2:clamp(this.camera.x,halfW-20,WORLD.w-halfW+20);this.camera.y=halfH>WORLD.h/2?WORLD.h/2:clamp(this.camera.y,halfH-20,WORLD.h-halfH+20);
  c.setTransform(this.ratio,0,0,this.ratio,0,0);rect(c,0,0,w,h,'#1c2b30');c.save();let sx=this.shake?(Math.random()-.5)*this.shake:0,sy=this.shake?(Math.random()-.5)*this.shake:0;this.shake*=.85;c.translate(w/2+sx,h*.52+sy);c.scale(this.scale,this.scale);c.translate(-this.camera.x,-this.camera.y*Y);c.imageSmoothingEnabled=false;c.drawImage(this.ground,0,0);
  const inView=(x,y,pad=160)=>Math.abs(x-this.camera.x)<w/(2*this.scale)+pad&&Math.abs((y-this.camera.y)*Y)<h/(2*this.scale)+pad;
  for(let q of game.pickups){if(!inView(q.x,q.y))continue;let yy=q.y*Y-5-Math.sin(now*.004+q.x)*3;ellipse(c,q.x,q.y*Y+3,8,3,'#17232555');if(q.kind==='cash'){rect(c,q.x-5,yy-5,10,9,'#eac885');rect(c,q.x-3,yy-3,6,5,'#a68852');}if(q.kind==='ammo'){rect(c,q.x-7,yy-6,14,10,'#bcb2db');rect(c,q.x-4,yy-4,2,6,'#544d6d');rect(c,q.x+2,yy-4,2,6,'#544d6d');}if(q.kind==='health'){rect(c,q.x-7,yy-6,14,12,'#c2dfc7');rect(c,q.x-2,yy-4,4,8,'#5c9a86');rect(c,q.x-4,yy-2,8,4,'#5c9a86');}}
  for(let z of game.hazards){c.save();c.globalAlpha=z.warn>0?.35+.15*Math.sin(now*.02):.7;ellipse(c,z.x,z.y*Y,z.r,z.r*Y,z.type==='slam'?'#d28d6b':'#869945');c.strokeStyle=z.type==='slam'?'#ffb986':'#b4d57d';c.lineWidth=3;c.beginPath();c.ellipse(z.x,z.y*Y,z.r,z.r*Y,0,0,Math.PI*2);c.stroke();c.restore();}
  let things=OBSTACLES.filter(o=>inView(o.x+o.w/2,o.y+o.h/2)).map(o=>({y:o.y+o.h,draw:()=>{c.save();if(o.kind==='wall'&&p.y<o.y+o.h&&p.y>o.y-90&&p.x>o.x-20&&p.x<o.x+o.w+20)c.globalAlpha=.42;this.object(c,o);c.restore();}}));
  for(let e of game.enemies){if(!inView(e.x,e.y))continue;things.push({y:e.y,draw:()=>{if(e.active>0){c.save();c.globalAlpha=clamp(1.2-e.active,.15,.85);ellipse(c,e.x,e.y*Y,e.r+15,(e.r+15)*Y,'#d6a6dd');c.restore();return;}if(e.slow>0)ellipse(c,e.x,e.y*Y,e.r+4,(e.r+4)*.4,'#8ae1f066');drawPerson(c,e.x,e.y*Y,e.type,e.type==='brute'?1.15:1,Math.floor(now*.009+e.id)%2,e.angle,e.hit>0);if(e.hp<e.maxHp){rect(c,e.x-17,e.y*Y-(e.type==='boss'?91:54),34,4,'#1a2331');rect(c,e.x-17,e.y*Y-(e.type==='boss'?91:54),34*e.hp/e.maxHp,4,e.type==='boss'?'#d7b0ef':'#d1c59d');}if(e.burn>0){rect(c,e.x-12,e.y*Y-22,5,10,'#e8ae64');rect(c,e.x+7,e.y*Y-30,4,7,'#f6cd86');}}});}
  for(let t of game.sentries)things.push({y:t.y,draw:()=>{ellipse(c,t.x,t.y*Y,15,7,'#222934');rect(c,t.x-10,t.y*Y-20,20,16,'#9585b7');c.save();c.translate(t.x,t.y*Y-17);c.rotate(t.angle);rect(c,-4,-4,25,8,'#d1c3ec');c.restore();}});
  things.push({y:p.y,draw:()=>{ellipse(c,p.x,p.y*Y+2,21,11,'#c9b4ea28');c.strokeStyle=this.charColor(game);c.lineWidth=2;c.beginPath();c.ellipse(p.x,p.y*Y,20,10,0,0,Math.PI*2);c.stroke();c.save();if(p.invuln>0&&Math.floor(now*.02)%2===0&&!menu)c.globalAlpha=.6;drawPerson(c,p.x,p.y*Y,game.character,1.15,Math.floor(now*.008)%2,p.angle);if(!game.weapon.melee){c.save();c.translate(p.x,p.y*Y-20);c.rotate(Math.atan2(Math.sin(p.angle)*Y,Math.cos(p.angle)));rect(c,4,-4,23,8,'#303742');rect(c,21,-3,10,6,'#c3c4b3');if(game.gun.cooldown>game.weapon.rate*.65&&!menu){poly(c,[[31,-6],[47,0],[31,6],[35,0]],'#ffe5a2');}c.restore();}c.restore();}});
  things.sort((a,b)=>a.y-b.y);for(let o of things)o.draw();
  for(let b of game.bullets){if(!inView(b.x,b.y))continue;c.strokeStyle=b.color;c.lineWidth=b.r*1.5;c.lineCap='round';c.beginPath();c.moveTo(b.x-b.vx*.012,b.y*Y-20-b.vy*.012*Y);c.lineTo(b.x,b.y*Y-20);c.stroke();if(b.blast){ellipse(c,b.x,b.y*Y-20,7,7,'#f4d184');}}
  for(let f of game.effects){c.save();c.globalAlpha=clamp(f.life/f.max,0,1);let t=1-f.life/f.max;if(f.kind==='explosion'){ellipse(c,f.x,f.y*Y-12,f.r*(.3+t),f.r*(.3+t)*Y,'#eab47c');ellipse(c,f.x,f.y*Y-12,f.r*(.2+t*.6),f.r*(.2+t*.6)*Y,'#fbe4ac');}if(f.kind==='burst'){for(let i=0;i<6;i++){let a=i*Math.PI/3;rect(c,f.x+Math.cos(a)*t*f.r,f.y*Y-10+Math.sin(a)*t*f.r*Y,4,4,f.color);}}if(f.kind==='swing'){c.strokeStyle='#e9dac7';c.lineWidth=7;c.beginPath();c.ellipse(f.x,f.y*Y-20,f.r,f.r*Y,0,f.angle-1,f.angle+1);c.stroke();}if(f.kind==='heal'){c.strokeStyle='#a9e9c4';c.lineWidth=3;c.beginPath();c.ellipse(f.x,f.y*Y,f.r*t,f.r*t*Y,0,0,Math.PI*2);c.stroke();}if(f.kind==='arc'){c.strokeStyle='#d1c0ff';c.lineWidth=3;c.beginPath();c.moveTo(f.x,f.y*Y-20);c.lineTo((f.x+f.x2)/2+10,(f.y+f.y2)/2*Y-30);c.lineTo(f.x2,f.y2*Y-20);c.stroke();}c.restore();}
  // Warm pools of light tie the cold manor and grounds together.
  for(let t of [[675,1030],[1320,1030],[1540,720],[2140,720],[420,1450]]){if(!inView(...t))continue;let x=t[0],y=t[1]*Y;rect(c,x-3,y-50,6,50,'#333b3d');rect(c,x-8,y-62,16,16,'#bba17a');rect(c,x-5,y-59,10,10,'#f4d79c');if(!this.low){let g=c.createRadialGradient(x,y-50,2,x,y-50,120);g.addColorStop(0,'#ffd99327');g.addColorStop(1,'#ffd99300');c.fillStyle=g;c.fillRect(x-120,y-170,240,240);}}
  c.restore();let vg=c.createRadialGradient(w/2,h/2,Math.min(w,h)*.24,w/2,h/2,Math.max(w,h)*.67);vg.addColorStop(0,'#11121e00');vg.addColorStop(1,'#0c102570');c.fillStyle=vg;c.fillRect(0,0,w,h);
  if(p.hp<p.maxHp*.3&&!menu){c.strokeStyle='#e29b8c55';c.lineWidth=12;c.strokeRect(0,0,w,h);}
  if(!menu){for(let e of game.enemies){if(e.type!=='boss'||e.active>0)continue;let q=this.project(e.x,e.y);if(q.x>30&&q.x<w-30&&q.y>70&&q.y<h-40)continue;let dx=q.x-w/2,dy=q.y-h/2,k=Math.min((w/2-30)/Math.abs(dx),(h/2-55)/Math.abs(dy));c.save();c.translate(w/2+dx*k,h/2+dy*k);c.rotate(Math.atan2(dy,dx));poly(c,[[9,0],[-6,-6],[-6,6]],'#e6b3f4');c.restore();}}
 }
 charColor(g){return CHARACTERS.find(c=>c.id===g.character).color;}
}
