import{GRENADES}from'./equipment.js';
export function targetArt(c){const r=(x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(x,y,w,h);};r(7,58,34,5,'#22263288');r(21,30,5,30,'#34353b');r(12,0,24,37,'#202732');r(7,9,34,32,'#252e3b');r(10,11,28,26,'#a89b82');r(15,3,18,10,'#b9ac91');r(17,18,14,13,'#725850');r(20,21,8,7,'#d9b584');r(22,23,4,3,'#785657');r(9,40,30,3,'#41444a');}
const hex=c=>parseInt(c.slice(1,7),16);
// A painter (the same e and r the pixel art uses) that draws into a Phaser Graphics.
export function graphicsPainter(g){return {e:(x,y,rx,ry,col)=>g.fillStyle(hex(col),1).fillEllipse(x,y,rx*2,ry*2),r:(x,y,w,h,col)=>g.fillStyle(hex(col),1).fillRect(x,y,w,h)};}
// A splat of paint standing on something: a few drops around a blob, with a darker run below it.
export function blob(g,x,y,s,col,seed){const h=hex(col),dk=((h>>1)&0x7f7f7f);g.fillStyle(dk,1).fillEllipse(x,y+.5,s*2+1,s*1.8+1);g.fillStyle(h,1).fillEllipse(x,y,s*2,s*1.8);
 for(let k=0;k<4;k++){const a=(seed*(k+3)*2.4)%6.28,d=s*(1+(seed*(k+5))%7/7*.6);g.fillCircle(x+Math.cos(a)*d,y+Math.sin(a)*d*.8,.5+((seed+k)%3)*.35);}
 g.fillRect(x-.5+((seed%5)-2)*.5,y,1,s+((seed*3)%4));g.fillStyle(0xffffff,.55).fillRect(x-s*.4,y-s*.5,1,1);}
export function practiceEffects(g,p){g.clear();for(const t of p.targets){g.fillStyle(0x222630,.85).fillRect(t.x-20,t.y-72,40,4);g.fillStyle(t.hp>0?0xc4ac86:0x71666e,1).fillRect(t.x-20,t.y-72,40*t.hp/100,4);if(t.flash)g.lineStyle(2,0xffdba0,t.flash/.14).strokeCircle(t.x,t.y-35,18);}
 for(const b of p.drill.bots){const big=b.kind==='brute';if(b.flash)g.lineStyle(2,0xffffff,b.flash/.14).strokeCircle(b.x,b.y-(big?36:24),big?30:15);if(b.headFlash)g.lineStyle(1.5,0xffe27a,b.headFlash/.25).strokeCircle(b.x,b.y-37,7);
  // A stunned brute sees stars.
  if(b.stun>0&&b.hp>0)for(let k=0;k<3;k++){const a=b.stun*5+k*2.1;g.fillStyle(0xffe27a,1).fillRect(b.x+Math.cos(a)*14-1,b.y-(big?78:50)+Math.sin(a)*4-1,2,2);}}
 // Spitter globs: a ball of green paint on a high arc, its shadow on the floor showing where it will land.
 for(const o of p.drill.globs){const k=Math.min(1,o.age/o.dur),x=o.sx+(o.ex-o.sx)*k,y=o.sy+(o.ey-o.sy)*k,h=Math.sin(k*Math.PI)*70+30*(1-k);g.fillStyle(0x10151c,.3).fillEllipse(x,y,8,4);g.fillStyle(0x3d6a24,.35*k).fillEllipse(o.ex,o.ey,30*k+6,20*k+4);g.fillStyle(0x2a3a22,1).fillCircle(x,y-h,4);g.fillStyle(0x8fd14f,1).fillCircle(x,y-h,3.2);g.fillStyle(0xd8ff9a,1).fillRect(x-1.5,y-h-2,1.5,1.5);}
 // Paint balls in flight, a pop at the muzzle and a burst of drops where they land.
 for(const t of p.traces){const col=hex(t.col),k=Math.min(1,t.age/Math.max(.001,t.dur)),sx=t.x+(t.ox??0),sy=t.y+(t.oy??-32),x=sx+(t.ex-sx)*k,y=sy+(t.ey-32-sy)*k;
  if(t.age<.06){g.fillStyle(0xf4efe2,.7*(1-t.age/.06)).fillCircle(sx,sy,3);}
  if(!t.done){g.fillStyle(0x10151c,.9).fillCircle(x,y,2.6);g.fillStyle(col,1).fillCircle(x,y,2);g.fillStyle(0xffffff,.8).fillRect(x-1,y-1.5,1,1);g.fillStyle(0x10151c,.25).fillEllipse(t.x+(t.ex-t.x)*k,t.y+(t.ey-t.y)*k,4,2);}
  else{const a=Math.max(0,t.life/.14),h=t.onto.kind==='floor'?0:30;for(let i=0;i<6;i++){const ang=i*1.05+t.ex,r=(1-a)*9+2;g.fillStyle(col,a).fillCircle(t.ex+Math.cos(ang)*r,t.ey-h+Math.sin(ang)*r*.7,1.3);}}}
 for(const t of p.throws){let h=Math.sin(Math.min(1,t.age/.7)*Math.PI)*45;g.fillStyle(0x1a1d25,.3).fillEllipse(t.x,t.y,9,4);g.fillStyle(parseInt(GRENADES[t.kind].color.slice(1),16),1).fillRect(t.x-3,t.y-8-h,6,8);g.fillStyle(0xd7cbb0,1).fillRect(t.x-3,t.y-5-h,6,2);}
 for(const f of p.fields){if(f.kind==='smoke'){let a=Math.min(1,f.age*2,f.life/1.5);for(let i=0;i<9;i++){let angle=i*2.4,r=(i%3)*19+8,x=f.x+Math.cos(angle)*r,y=f.y+Math.sin(angle)*r*.65-15-f.age*2;g.fillStyle(i%2?0x8d9da4:0xb6bec1,a*.32).fillCircle(x,y,20+Math.min(12,f.age*4));}}else if(f.kind==='incendiary'){g.fillStyle(0x743a23,.3).fillEllipse(f.x,f.y,f.radius*2,f.radius);for(let i=0;i<13;i++){let a=i*2.4,r=10+i%4*10,x=f.x+Math.cos(a)*r,y=f.y+Math.sin(a)*r*.65;let h=7+((Math.floor(f.age*12)+i*3)%6);g.fillStyle(0xe56b30,.85).fillTriangle(x-3,y,x+3,y,x+1,y-h);g.fillStyle(0xfac776,.9).fillRect(x-1,y-4,2,4);}}else{let a=f.life/.55;g.fillStyle(0xf7c27c,a*.35).fillCircle(f.x,f.y-16,f.radius*(1-a));g.lineStyle(3,0xffd995,a).strokeCircle(f.x,f.y-16,f.radius*(1-a));}}
}
