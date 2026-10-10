// Training Grounds art: the cave chamber, the arena built from scrap, Gadget's office and her robots.
// Same half-unit pixel grid and palettes as the camp, drawn on 2x canvases.
import {TG,ARENA,GATE,GATE_DOOR,BUILDING,STAIRS,FLOORS,PROPS,HATCHES,WORKLIGHTS,LIGHTS,LANE,START} from './data.js';
import {painter,hash,fbm,bayer,boulder,rgb,box,EDGE,SHADOW,BONE,EMBER,EMBER_HI,W,M,R,RUST,GLASS,GLASS_HI} from '../camp/art.js';
const prop=id=>PROPS.find(o=>o.id===id);
// Rock edges around the chamber.
export const wallBottom=x=>156+6*Math.sin(x*.029)+4*Math.sin(x*.077+1);
export const wallTop=x=>52+10*Math.sin(x*.023)+6*Math.sin(x*.067);
export const westEdge=y=>62+6*Math.sin(y*.043)+3*Math.sin(y*.12);
export const eastEdge=y=>TG.w-62-6*Math.sin(y*.039+2)-3*Math.sin(y*.11);
const inStairs=(x,y)=>x>STAIRS.x&&x<STAIRS.x+STAIRS.w&&y>STAIRS.y;
export const southEdge=x=>TG.h-84+6*Math.sin(x*.037)+3*Math.sin(x*.1);
const ROCK=R.map(rgb),CEIL=['#101116','#15161c','#1a1c23'].map(rgb);
const FLOOR=['#3b3833','#433f39','#4b463f','#534d45','#5c554b'].map(rgb),GRIT=rgb('#5e574e'),DUST=rgb('#2e2b28');
// Paint colors, the spray-paint font and splats, the workshop props and Gadget's robots now live in the Master Creator.
import {PAINTS,fade,text,textWidth,splat,propArt,PROP_PAD,DESK,SERVER_LEDS} from '../mc/assets/props/workshop.js';
import {BOT,BOT_ROW,BRUTE,SPIT,botArt,bruteArt} from '../mc/assets/characters/bots.js';
export {text,textWidth,splat,propArt,PROP_PAD,DESK,SERVER_LEDS,BOT,BOT_ROW,BRUTE,SPIT,botArt,bruteArt};
// The cords: one trunk down the stairs, up the aisle between the counters and out through the gate; a ring around the yard; a run into the building.
const AISLE=STAIRS.x+STAIRS.w/2-16,MID=1342;
export const CORDS=[
 {col:'#c9622a',pts:[[AISLE,TG.h-130],[AISLE+2,1700],[AISLE,1532]]},
 {col:'#c9a23a',pts:[[AISLE,1532],[700,1534],[560,1536],[536,1640]]},
 {col:'#2a2a2e',pts:[[700,1534],[740,1488]]},
 {col:'#c9a23a',pts:[[AISLE,1532],[1160,1530],[1276,1486]]},
 {col:'#2a2a2e',pts:[[1160,1530],[1150,1500]]},
 {col:'#3f6a3a',pts:[[1276,1486],[1340,1490]]},
 {col:'#c9622a',pts:[[1160,1530],[1420,1532],[1500,1640],[1530,1700]]},
 {col:'#2a2a2e',pts:[[1500,1640],[1420,1700],[1406,1760]]},
 {col:'#c9622a',pts:[[AISLE,1532],[AISLE-2,1446],[AISLE,MID]]},
 {col:'#c9a23a',pts:[[AISLE,MID],[640,MID+2],[110,MID],[96,1130]]},
 {col:'#c9a23a',pts:[[96,1110],[104,860],[96,630]]},
 {col:'#c9a23a',pts:[[96,610],[110,400],[150,216]]},
 {col:'#2a2a2e',pts:[[160,200],[400,194],[640,200]]},
 {col:'#c9a23a',pts:[[AISLE,MID],[1320,MID+2],[1850,MID],[1864,1130]]},
 {col:'#c9a23a',pts:[[1864,1110],[1856,860],[1864,630]]},
 {col:'#c9a23a',pts:[[1864,610],[1850,400],[1810,216]]},
 {col:'#2a2a2e',pts:[[1800,200],[1560,194],[1320,200]]},
 {col:'#c9622a',pts:[[AISLE,MID],[AISLE+4,1180],[976,1130]]},
 {col:'#c9622a',pts:[[976,1130],[700,1132],[476,1130]]},
 {col:'#c9622a',pts:[[976,1130],[1250,1132],[1484,1130]]},
 {col:'#c9a23a',pts:[[976,1130],[990,880],[984,660],[1170,640],[1176,604]]},
 {col:'#c9a23a',pts:[[984,660],[790,648],[790,436]]},
 {col:'#2a2a2e',pts:[[984,700],[690,690],[686,684]]},
 {col:'#2a2a2e',pts:[[990,700],[1290,694],[1296,684]]}];
const STRIPS=[[AISLE,1532],[1160,1530],[700,1534],[AISLE,MID],[976,1130],[984,660],[96,1120],[1864,1120],[96,620],[1864,620]];
function cord(g,pts,col,seed){const {l,r}=g,dark='#141416';for(let i=1;i<pts.length;i++){const [ax,ay]=pts[i-1],[bx,by]=pts[i],n=Math.max(1,Math.ceil(Math.hypot(bx-ax,by-ay)/14));let px=ax,py=ay;
  for(let k=1;k<=n;k++){const t=k/n,wob=k===n?0:(hash(seed*31+i,k)-.5)*3,nx=ax+(bx-ax)*t+(by-ay?wob:0),ny=ay+(by-ay)*t+(bx-ax?wob:0);l(px,py+.5,nx,ny+.5,1.6,dark);l(px,py,nx,ny,1,col);px=nx;py=ny;
   // Tape holds the cord down every so often.
   if(hash(seed+i,k*7)>.86){r(nx-1.5,ny-1.5,3,3,'#6b6e72');r(nx-1.5,ny-1.5,3,.5,'#9a9ea2');}}}}
function powerStrip(g,x,y){const {r}=g;r(x-5.5,y-2,11,4,EDGE);r(x-5,y-1.5,10,3,'#d6d0c2');for(let k=0;k<3;k++)r(x-3.5+k*3,y-.5,1.5,1,'#3a3a3e');r(x+3.5,y-1,1,1,'#d0452c');}
function groundColor(x,y){
 const wb=wallBottom(x),n=fbm(x/38,y/38),g=hash(x,y),dith=bayer(x,y);
 if(y<wb){const wt=wallTop(x);if(y<wt)return CEIL[Math.min(2,Math.floor(y/wt*2.2+dith*.8))];
  if(y>wb-4)return ROCK[0];if(y>wb-8)return ROCK[1];
  // Stacked stone: tall facets split by joints, bedding planes that break at each joint.
  const jx=Math.floor((x+6*Math.sin(y*.07))/46),jd=((x+6*Math.sin(y*.07))%46+46)%46,tone=(hash(jx,3)-.5)*.22;if(jd<1)return ROCK[0];if(jd<2)return ROCK[3];
  const by=y+hash(jx,5)*9+jd*(hash(jx,6)-.5)*.16,edge=(by%9+9)%9;if(edge<1)return ROCK[1];if(edge>8.2&&g>.3)return ROCK[3];
  const v=n*.5+g*.25+(Math.floor(by/9)%2?.1:0)+(y-wt)/(wb-wt)*.2+tone-jd/46*.14;return ROCK[v>.78?4:v>.52?3:v>.2?2:1];}
 const we=westEdge(y),ee=eastEdge(y);
 if(x<we||x>ee){const d=x<we?we-x:x-ee;if(d<2)return ROCK[3];if(d<4)return ROCK[2];const b=boulder(x,y);if(b.seam<1.1)return ROCK[0];if(b.lit<2.2)return ROCK[b.lit<1?3:2];return ROCK[n*.6+g*.4+b.tone>.62?2:1];}
 const se=southEdge(x);if(y>se&&!inStairs(x,y))return ROCK[y-se<3?2:n>.6?2:1];
 if(x-we<6||y-wb<6||(ee-x)<6)return DUST;
 if(g>.992)return GRIT;
 const v=n*.7+g*.3;return FLOOR[v>.82?4:v>.62?3:v>.4?2:v>.2?1:0];}
// Salvaged floors. Lino in the building, cut from a dozen kitchens and laid edge to edge, torn where the rock shows through.
const LINO=[['#6a6456','#575c52'],['#6e6452','#5c5244'],['#62645e','#4f5458'],['#6a5e50','#58604c']];
function lino(g,f){const {r}=g,S=16;
 for(let py=f.y;py<f.y+f.h;py+=96)for(let px=f.x;px<f.x+f.w;px+=128){const [a,b]=LINO[Math.floor(hash(px,py)*LINO.length)],pw=Math.min(128,f.x+f.w-px),ph=Math.min(96,f.y+f.h-py);
  for(let j=0;j*S<ph;j++)for(let i=0;i*S<pw;i++){const tx=px+i*S,ty=py+j*S,tw=Math.min(S,px+pw-tx),th=Math.min(S,py+ph-ty),h=hash(tx,ty);if(h>.985)continue;r(tx,ty,tw,th,(i+j)%2?a:b);if(h>.93)r(tx+1,ty+1,tw-2,th-2,(i+j)%2?b:a);r(tx,ty,tw,.5,'#00000022');}
  // A seam where one kitchen's floor meets the next, and scuffs where people walk.
  r(px,py,pw,1,'#2a2622');r(px,py,1,ph,'#2a2622');for(let k=0;k<5;k++)r(px+hash(k,px)*pw,py+hash(py,k)*ph,6+hash(k,py)*16,.5,'#2e2a2488');}}
function ply(g,f){const {r}=g;for(let x=f.x;x<f.x+f.w;x+=64)for(let y=f.y;y<f.y+f.h;y+=48){const ww=Math.min(64,f.x+f.w-x),hh=Math.min(48,f.y+f.h-y),tone=hash(x,y);r(x,y,ww,hh,'#1c1915');r(x+.5,y+.5,ww-1,hh-1,tone>.6?'#5d4c38':tone>.3?'#56462f':'#4f402c');
  for(let k=0;k<4;k++){r(x+2+hash(x+k,y)*(ww-8),y+3+hash(y,x+k)*(hh-6),4+hash(k,x)*10,.5,'#4a3b28');}for(const [cx,cy] of [[x+2,y+2],[x+ww-2.5,y+2],[x+2,y+hh-2.5],[x+ww-2.5,y+hh-2.5]])r(cx,cy,.5,.5,'#8a8c8e');}}
function rug(g,x,y,w,h,c0,c1,c2){const {r}=g;r(x,y,w,h,'#2a1716');r(x+1,y+1,w-2,h-2,c0);r(x+5,y+5,w-10,h-10,c1);r(x+9,y+9,w-18,h-18,c0);for(let k=0;k*14<w-30;k++){r(x+16+k*14,y+h/2-3,6,6,c2);r(x+18+k*14,y+h/2-1,2,2,'#2e3a52');}for(let k=0;k<w;k+=3){r(x+k,y+h,1,2,'#8a7a5a');r(x+k,y-2,1,2,'#8a7a5a');}}
// A robot hatch: a hole hacked through the rock, framed in plywood, a tarp across it, a red bulb above and BOTS sprayed beside it.
function hatch(g,hh){const {p,r,l}=g;
 if(hh.side==='n'){const x=hh.x,y=wallBottom(x);p([[x-34,y],[x-30,y-44],[x-18,y-58],[x+18,y-58],[x+30,y-44],[x+34,y]],R[0]);p([[x-28,y],[x-25,y-40],[x-16,y-52],[x+16,y-52],[x+25,y-40],[x+28,y]],'#08090c');
  for(const s of [-1,1]){r(x+s*30-2,y-50,4,50,EDGE);r(x+s*30-1.5,y-49.5,3,49,W[2]);r(x+s*30-1.5,y-49.5,1,49,W[3]);}r(x-33,y-52,66,4,EDGE);r(x-32.5,y-51.5,65,3,W[3]);r(x-32.5,y-49,65,.5,W[1]);
  for(let k=0;k<6;k++){const sx=x-26+k*9;r(sx,y-48,8.5,46-hash(k,x)*4,k%2?'#3a4a3f':'#435646');r(sx,y-48,.5,44,'#26302a');r(sx+1,y-48,7,1,'#56705c');}
  r(x-5,y-58,10,4,EDGE);r(x-4,y-57.5,8,3,'#5a1f1a');r(x-2,y-57,4,2,'#9a3a2c');
  const tw=textWidth('BOTS',1.5);text(g,'BOTS',x-tw/2,y-74,1.5,'#d9792f');for(let k=0;k<3;k++)r(x-tw/2+hash(k,x)*tw,y-66+hash(x,k)*2,.5,2+hash(k,9)*3,'#d9792f');
  for(let k=0;k<5;k++)tracks(g,x+(k-2)*6,y+2,Math.PI/2+(k-2)*.22,k*13+x);return;}
 // In a side wall you look along the opening: the frame's edge, the dark hole and the tarp strips hanging in it.
 const s=hh.side==='w'?1:-1,y0=hh.y-34,y1=hh.y+34,edge=s>0?westEdge(hh.y):eastEdge(hh.y),x0=edge-s*30;
 p([[x0-s*4,y0-6],[edge+s*4,y0-4],[edge+s*4,y1+4],[x0-s*4,y1+6]],R[0]);p([[x0,y0],[edge,y0+2],[edge,y1-2],[x0,y1]],'#08090c');
 for(const yy of [y0,y1-3]){r(Math.min(x0,edge)-1,yy-1,Math.abs(edge-x0)+2,5,EDGE);r(Math.min(x0,edge),yy-.5,Math.abs(edge-x0),4,W[2]);r(Math.min(x0,edge),yy-.5,Math.abs(edge-x0),1,W[3]);}
 r(edge-2,y0-1,4,y1-y0+2,EDGE);r(edge-1.5,y0,3,y1-y0,W[3]);
 for(let k=0;k<6;k++){const sy=y0+4+k*10;r(Math.min(edge,edge-s*16),sy,16,9,k%2?'#3a4a3f':'#435646');r(Math.min(edge,edge-s*16),sy,16,.5,'#56705c');}
 r(edge+s*6-3,y0-12,6,6,EDGE);r(edge+s*6-2,y0-11,4,4,'#5a1f1a');
 const tw=textWidth('BOTS',1.5),tx=s>0?edge+12:edge-12-tw;text(g,'BOTS',tx,y0-14,1.5,'#d9792f');
 for(let k=0;k<5;k++)tracks(g,edge+s*4,hh.y+(k-2)*7,s>0?(k-2)*.22:Math.PI-(k-2)*.22,k*17+hh.y);}
function tracks(g,px,py,a,seed){for(let s=0;s<60;s++){a+=(hash(seed,s)-.5)*.12;const nx=px+Math.cos(a)*4,ny=py+Math.sin(a)*4;if(s%2){g.r(nx,ny,1,.5,'#2c2925');g.r(nx-Math.sin(a)*3,ny+Math.cos(a)*3,1,.5,'#2c2925');}px=nx;py=ny;}}
// One piece of the chamber floor: rock, the floors laid over it, cords and old paint. Big rooms are cut into tiles so no texture is too big for a phone.
export const GROUND_TILE=1000;
export function groundTiles(){const out=[];for(let y=0;y<TG.h;y+=GROUND_TILE)for(let x=0;x<TG.w;x+=GROUND_TILE)out.push({x,y,w:Math.min(GROUND_TILE,TG.w-x),h:Math.min(GROUND_TILE,TG.h-y)});return out;}
export function groundArt(c,t={x:0,y:0,w:TG.w,h:TG.h}){
 const img=c.createImageData(t.w*2,t.h*2),d=img.data;
 for(let y=0;y<t.h;y++)for(let x=0;x<t.w;x++){const col=groundColor(x+t.x,y+t.y);
  for(let k=0;k<4;k++){const i=((y*2+(k>>1))*t.w*2+x*2+(k&1))*4;d[i]=col[0];d[i+1]=col[1];d[i+2]=col[2];d[i+3]=255;}}
 c.putImageData(img,0,0);c.save();c.scale(2,2);c.translate(-t.x,-t.y);c.beginPath();c.rect(t.x,t.y,t.w,t.h);c.clip();const g=painter(c),{r,e,p,l}=g,w=TG.w,h=TG.h;
 // Only draw what can reach this tile.
 const near=(x,y,m=80)=>x>t.x-m&&x<t.x+t.w+m&&y>t.y-m&&y<t.y+t.h+m;
 // Stalactites and damp streaks on the back wall, rubble along every edge.
 if(t.y<200){for(let x=10;x<w-20;x+=14+Math.floor(hash(x,1)*22)){const y=wallTop(x),len=8+hash(x,2)*24,wd=4+hash(x,3)*6;p([[x-wd/2,y-2],[x+wd/2,y-2],[x+1,y+len]],R[0]);p([[x-wd/2+1,y-1],[x,y-1],[x+.5,y+len-3]],R[1]);}
  for(let x=20;x<w-20;x+=34+Math.floor(hash(x,4)*40)){const y=wallTop(x)+12+hash(x,5)*20,len=wallBottom(x)-y-12;r(x,y,1,len,'#2a3335');if(hash(x,6)>.5)r(x,y+len-2,1,1,'#7f9494');}
  for(let i=0;i<180;i++){const x=40+hash(i,21)*(w-80),y=wallBottom(x)+2+hash(i,22)*8,s=1.5+hash(i,23)*3;e(x,y,s+.5,s*.7+.5,R[0]);e(x,y-.5,s,s*.6,R[2]);r(x-s*.5,y-s*.5,s*.6,.5,R[3]);}
  // A seep of water at the foot of the back wall, with a puddle.
  for(const x of [640,1110,1480]){const y=wallBottom(x)+10;e(x,y,16,4,'#262a2c');e(x,y-.5,13,3,'#323a40');r(x-6,y-1.5,6,.5,'#5d7680');r(x+3,y,3,.5,'#4c626b');}}
 for(let i=0;i<220;i++){const y=180+hash(i,31)*(h-260),west=i%2===0,x=west?westEdge(y)+3+hash(i,32)*6:eastEdge(y)-3-hash(i,32)*6,s=1.5+hash(i,33)*2.5;if(near(x,y))e(x,y,s+.5,s*.7+.5,R[0]),e(x,y-.5,s,s*.6,R[2]);}
 // Floors laid over the rock, and a mat in front of each counter.
 for(const f of FLOORS)if(near(f.x,f.y,f.w+f.h))(f.kind==='lino'?lino:ply)(g,f);
 {const o=PROPS.find(o=>o.kind==='carseat');if(o)rug(g,o.x-24,o.y-14,o.w+48,o.h+34,'#5e2a26','#7a3a30','#a8763e');}
 rug(g,BUILDING.x+460,BUILDING.y+440,160,84,'#2e3a52','#3d4f63','#a8763e');rug(g,BUILDING.x+40,BUILDING.y+30,100,60,'#3b4a38','#4b5b45','#c9a24a');
 // Old paint all over the yard, dried and dusty, and drips across the floors inside.
 for(let i=0;i<620;i++){const x=ARENA.x+30+hash(i,61)*(ARENA.w-60),y=ARENA.y+30+hash(i,62)*(ARENA.h-50);if(!near(x,y,10))continue;const col=fade(PAINTS[i%PAINTS.length],.35+hash(i,63)*.4);splat(g,x,y,1.2+hash(i,64)*3.5,col,i);}
 // Scuffs and robot tire tracks looping around the building.
 for(let k=0;k<36;k++){let px=ARENA.x+100+hash(k,71)*(ARENA.w-200),py=ARENA.y+100+hash(k,72)*(ARENA.h-200),a=hash(k,73)*6.28;if(!near(px,py,300))continue;for(let s=0;s<70;s++){a+=(hash(k,s+100)-.5)*.3;px+=Math.cos(a)*4;py+=Math.sin(a)*4;if(s%3)r(px,py,1,.5,'#2a2724');if(s%3)r(px+Math.sin(a)*4,py-Math.cos(a)*4,1,.5,'#2a2724');}}
 for(const hh of HATCHES)if(near(hh.x,hh.y,120))hatch(g,hh);
 // Room names stencilled on the floor, so Gadget can call out where the robots are.
 for(const [name,x,y] of BUILDING.rooms){const tw=textWidth(name,2);text(g,name,x-tw/2,y-5,2,'#c9c3b566');}
 // Chalk: the gate box, the lane's firing line, and the unit's name in the aisle.
 const gx=GATE.x+GATE.w/2;for(let x=gx-60;x<gx+60;x+=3)r(x,GATE.y-60,2,.5,'#a8a49a88');for(let y=GATE.y-60;y<GATE.y;y+=3){r(gx-60,y,.5,2,'#a8a49a88');r(gx+60,y,.5,2,'#a8a49a88');}
 for(let y=LANE.y0;y<LANE.y1;y+=3)r(LANE.x,y,1,2,'#c9c3b5aa');text(g,'LANE',LANE.x-textWidth('LANE',1.5)-8,LANE.y0+8,1.5,'#c9c3b588');
 {const s='LEET AF',tw=textWidth(s,3);text(g,s,gx-tw/2,1500,3,'#b33a2a99');}
 // The stairs up to camp: concrete steps rising toward you, a rail, and the light from above.
 {const x=STAIRS.x,y=STAIRS.y;r(x-6,y,6,TG.h-y,'#4b4e52');r(x+STAIRS.w,y,6,TG.h-y,'#3b3d42');r(x-6,y,.5,TG.h-y,'#6a6d71');
  for(let k=0;k<11;k++){const sy=y+k*12,t=k/10,shade=['#3a3b3f','#424448','#4b4d52','#55575c','#5f6166','#6a6c70'][Math.min(5,Math.floor(t*6))];r(x,sy,STAIRS.w,12,shade);r(x,sy,STAIRS.w,1.5,'#7a7c80');r(x,sy+11,STAIRS.w,1,'#2a2b2f');
   for(let i=0;i<3;i++)r(x+8+hash(k,i)*(STAIRS.w-16),sy+4+hash(i,k)*5,2+hash(i,k+9)*4,.5,'#2f3034');}
  l(x+STAIRS.w-8,y-6,x+STAIRS.w-8,TG.h,1.5,EDGE);r(x+STAIRS.w-8.5,y-6,1,TG.h-y+6,'#8a8f94');for(let k=0;k<5;k++)r(x+STAIRS.w-10,y+k*26,5,2,'#5c636b');
  r(x+STAIRS.w/2-14,y+6,28,8,'#1b1c20');text(g,'CAMP',x+STAIRS.w/2-textWidth('CAMP',1.5)/2,y+7.5,1.5,'#d9792f');}
 // Extension cords, with power strips where they split.
 CORDS.forEach((cd,i)=>cord(g,cd.pts,cd.col,i+1));for(const [x,y] of STRIPS)powerStrip(g,x,y);
 c.restore();}
// The south lip of the chamber, drawn in front of everyone. The stairs break through it.
export const FRONT_Y=TG.h-110;
export function frontArt(c){c.save();c.scale(2,2);c.translate(0,-FRONT_Y);const {e,r}=painter(c);const S=TG.h-84,rocks=[];
 for(let x=-30;x<TG.w+30;x+=24+Math.floor(hash(x,91)*40)){if(x>STAIRS.x-14&&x<STAIRS.x+STAIRS.w+14)continue;rocks.push([x,S+8+hash(x,92)*28,14+hash(x,93)*30,10+hash(x,94)*14]);if(hash(x,95)>.55)rocks.push([x+18,S+34+hash(x,96)*16,8+hash(x,97)*12,6+hash(x,98)*8]);}
 rocks.sort((a,b)=>a[1]-b[1]);for(const [x,cy,rx,ry] of rocks){const cut=Math.min(rx,Math.max(4,Math.abs(x-(STAIRS.x+STAIRS.w/2))-STAIRS.w/2-6));e(x,cy+ry*.5,cut+2,ry,EDGE);e(x,cy,cut,ry,R[1]);e(x-cut*.15,cy-ry*.3,cut*.75,ry*.6,R[2]);e(x-cut*.3,cy-ry*.45,cut*.35,ry*.28,R[3]);}
 for(let x=0;x<TG.w;x+=6)if(x<STAIRS.x-4||x>STAIRS.x+STAIRS.w+4)r(x,TG.h-8,6,8,R[0]);c.restore();}
// Lighting: a cold, dark cave lit by work lights, Gadget's screens and the string lights along the wall.
export const LIGHT_SCALE=2,AMBIENT=[.42,.48,.64];
export function lightArt(c){const w=Math.ceil(TG.w/LIGHT_SCALE),h=Math.ceil(TG.h/LIGHT_SCALE),img=c.createImageData(w,h),d=img.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const wx=x*LIGHT_SCALE+1,wy=y*LIGHT_SCALE+1,th=bayer(x,y);let F=0,acc=[0,0,0];
  for(const [lx,ly,rad,lr,lg,lb] of LIGHTS){const dx=wx-lx,dy=(wy-ly)*1.25;if(Math.abs(dx)>rad||Math.abs(dy)>rad)continue;const dist=Math.hypot(dx,dy)/rad;if(dist>=1)continue;let f=(1-dist)**1.2;f=Math.min(1,Math.floor(f*6+th)/6);F+=f;acc[0]+=f*lr;acc[1]+=f*lg;acc[2]+=f*lb;}
  const k=Math.min(1,F),dim=wy<wallTop(wx)?.5:wy<wallBottom(wx)?.8:1,i=(y*w+x)*4;
  for(let ch=0;ch<3;ch++){const lit=F>0?acc[ch]/F:0;d[i+ch]=Math.round(255*Math.min(1,(AMBIENT[ch]*(1-k)+lit*k)*dim));}d[i+3]=255;}
 c.putImageData(img,0,0);}
export function glowArt(c,[r,g,b]){const gr=c.createRadialGradient(64,64,0,64,64,64);gr.addColorStop(0,`rgba(${r},${g},${b},.7)`);gr.addColorStop(.4,`rgba(${r},${g},${b},.26)`);gr.addColorStop(1,`rgba(${r},${g},${b},0)`);c.fillStyle=gr;c.fillRect(0,0,128,128);}
// World positions of every blinking light: server LEDs, the hatch bulbs and the parked robots' antennas.
export function ledSpots(){const s=prop('server'),out=SERVER_LEDS.map(([x,y],i)=>({x:s.x+x,y:s.y+y,kind:i>=5&&i<19?'port':'srv'}));
 for(const hh of HATCHES)out.push(hh.side==='n'?{x:hh.x,y:wallBottom(hh.x)-56,kind:'hatch'}:{x:(hh.side==='w'?westEdge(hh.y)+6:eastEdge(hh.y)-6),y:hh.y-43,kind:'hatch'});
 for(const o of PROPS.filter(o=>o.kind==='botparked'))out.push({x:o.x+o.w/2+BOT.led[0],y:o.y+o.h-2+BOT.led[1],kind:'park'});
 const ch=prop('charger');for(let i=0;i<5;i++)out.push({x:ch.x+6+i*5,y:ch.y-12,kind:'charge'});return out;}
export function screenRects(){const d=prop('desk');return Object.entries(DESK).filter(([k])=>k!=='T').map(([k,[x,y,w,h]])=>({x:d.x+x,y:d.y+y,w,h,kind:k}));}
