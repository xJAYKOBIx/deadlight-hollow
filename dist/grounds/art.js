// Training Grounds art: the cave chamber, the arena built from scrap, Gadget's office and her robots.
// Same half-unit pixel grid and palettes as the camp, drawn on 2x canvases.
import {TG,ARENA,GATE,GATE_DOOR,BUILDING,STAIRS,FLOORS,PROPS,HATCHES,WORKLIGHTS,LIGHTS,LANE,START} from './data.js';
import {painter,hash,fbm,bayer,boulder,rgb,box,EDGE,SHADOW,BONE,EMBER,EMBER_HI,W,M,R,RUST,GLASS,GLASS_HI,propArt as campPropArt,PROP_PAD} from '../camp/art.js';
import {PAINT} from '../study/equipment.js';
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
// Paint colors, gun by gun, and a dried-out version of each for old splats on the floor.
const PAINTS=Object.values(PAINT);
const fade=(h,k)=>{const [r,g,b]=rgb(h),m=(r+g+b)/3;return '#'+[r,g,b].map(v=>Math.round(v+(m-v)*k)*.62|0).map(v=>v.toString(16).padStart(2,'0')).join('');};
// A tiny block font for spray paint and signs: 3 to 5 pixels wide, 5 tall.
const FONT={A:['010','101','111','101','101'],B:['110','101','110','101','110'],C:['111','100','100','100','111'],D:['110','101','101','101','110'],E:['111','100','110','100','111'],F:['111','100','110','100','100'],G:['111','100','101','101','111'],H:['101','101','111','101','101'],I:['111','010','010','010','111'],K:['101','110','100','110','101'],L:['100','100','100','100','111'],M:['10001','11011','10101','10001','10001'],N:['1001','1101','1011','1001','1001'],O:['111','101','101','101','111'],P:['110','101','110','100','100'],R:['110','101','110','101','101'],S:['111','100','111','001','111'],T:['111','010','010','010','010'],U:['101','101','101','101','111'],V:['101','101','101','101','010'],W:['10001','10001','10101','11011','10001'],X:['101','101','010','101','101'],Y:['101','101','010','010','010'],'!':['1','1','1','0','1'],'-':['000','000','111','000','000'],' ':['00','00','00','00','00'],'0':['111','101','101','101','111'],'1':['01','11','01','01','01'],'2':['111','001','111','100','111'],'3':['111','001','111','001','111'],'4':['101','101','111','001','001'],'5':['111','100','111','001','111'],'6':['111','100','111','101','111'],'7':['111','001','010','010','010'],'8':['111','101','111','101','111'],'9':['111','101','111','001','111'],':':['0','1','0','1','0']};
export function text(g,s,x,y,px,col){let cx=x;for(const ch of s){const f=FONT[ch]||FONT[' '];for(let j=0;j<5;j++)for(let i=0;i<f[j].length;i++)if(f[j][i]==='1')g.r(cx+i*px,y+j*px,px,px,col);cx+=(f[0].length+1)*px;}return cx-x-px;}
export const textWidth=(s,px)=>[...s].reduce((n,ch)=>n+((FONT[ch]||FONT[' '])[0].length+1)*px,0)-px;
// A paint splat: a blob with a few droplets and a run or two.
export function splat(g,x,y,s,col,seed,flat=true){const {e,r}=g;e(x,y,s,s*(flat?.6:.9),col);for(let k=0;k<5;k++){const a=hash(seed,k)*6.28,d=s*(.7+hash(k,seed)*.7);e(x+Math.cos(a)*d,y+Math.sin(a)*d*(flat?.6:.9),.5+hash(seed+k,3)*s*.35,.4+hash(seed+k,4)*s*.25,col);}
 if(!flat)for(let k=0;k<2;k++)r(x-s*.4+hash(seed,9+k)*s*.8,y,.5,1+hash(seed,11+k)*s,col);}
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
export const LIGHT_SCALE=2,AMBIENT=[.64,.67,.78];
export function lightArt(c){const w=Math.ceil(TG.w/LIGHT_SCALE),h=Math.ceil(TG.h/LIGHT_SCALE),img=c.createImageData(w,h),d=img.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const wx=x*LIGHT_SCALE+1,wy=y*LIGHT_SCALE+1,th=bayer(x,y);let F=0,acc=[0,0,0];
  for(const [lx,ly,rad,lr,lg,lb] of LIGHTS){const dx=wx-lx,dy=(wy-ly)*1.25;if(Math.abs(dx)>rad||Math.abs(dy)>rad)continue;const dist=Math.hypot(dx,dy)/rad;if(dist>=1)continue;let f=(1-dist)**1.2;f=Math.min(1,Math.floor(f*6+th)/6);F+=f;acc[0]+=f*lr;acc[1]+=f*lg;acc[2]+=f*lb;}
  const k=Math.min(1,F),dim=wy<wallTop(wx)?.5:wy<wallBottom(wx)?.8:1,i=(y*w+x)*4;
  for(let ch=0;ch<3;ch++){const lit=F>0?acc[ch]/F:0;d[i+ch]=Math.round(255*Math.min(1,(AMBIENT[ch]*(1-k)+lit*k)*dim));}d[i+3]=255;}
 c.putImageData(img,0,0);}
export function glowArt(c,[r,g,b]){const gr=c.createRadialGradient(64,64,0,64,64,64);gr.addColorStop(0,`rgba(${r},${g},${b},.7)`);gr.addColorStop(.4,`rgba(${r},${g},${b},.26)`);gr.addColorStop(1,`rgba(${r},${g},${b},0)`);c.fillStyle=gr;c.fillRect(0,0,128,128);}
// Props. Each draws with the footprint's top left corner at (0, 0); height rises into negative y.
const PLY=['#3d3226','#5a4a36','#7a6548','#937c5a','#a8916c'],OLIVE=['#232a1c','#323b27','#424d33','#56623f'];
const DOORS=[['#7d7a70','#9a968a','#b3afa2'],['#3b4a38','#4b5b45','#5f7058'],['#5a2e2a','#6a3530','#82443c'],['#33414f','#3d4f63','#4f6479'],['#5a4630','#6d5638','#856a46']];
const TIRE=['#141518','#1f2024','#2b2c31','#3a3b41'],BAG=['#3d372b','#4d4535','#655b45','#7d7257','#948a6c'];
// A block with its footprint's top left at (x, y), depth d and height z: top face, then the face toward you.
const blk=(g,x,y,w,d,z,top,front,hi='#ffffff22')=>{const {r}=g;r(x-.5,y-z-.5,w+1,d+z+1,EDGE);r(x+.5,y-z+.5,w-1,d-1,top);r(x+.5,y+d-z+.5,w-1,z-1,front);r(x+.5,y+d-z,w-1,.5,hi);};
const ring=(g,cx,cy,rx,ry,col,bg)=>{g.e(cx,cy,rx,ry,col);g.e(cx,cy,rx-.6,ry-.6,bg);};
// Where the little lights are, so the scene can blink them above the lighting.
export const DESK={T:26,crt:[13,-41,22,15],lcd:[48,-43,28,17],lap:[88,-36,20,11],cam:[120,-41,24,15]};
const SRV={F:-64};
export const SERVER_LEDS=[[6,SRV.F+17],[9,SRV.F+17],[12,SRV.F+17],[7,SRV.F+29],[24,SRV.F+29],...Array.from({length:14},(_,i)=>[5+i*3,SRV.F+61]),[23,SRV.F+51]];
const TG_ART={
 pallets(g,o){const {e,r}=g,w=o.w,h=o.h,z=o.z,n=Math.max(1,Math.round(w/40)),U=w/n;e(w/2,h,w/2+4,5,SHADOW);
  for(let i=0;i<n;i++){const x0=i*U,dz=Math.floor(hash(o.x+i,o.y)*3),top=-z+dz,F0=top+h,F1=h;
   // The top edges of two pallets standing back to back.
   r(x0,top,U,h,EDGE);r(x0+.5,top+.5,U-1,h-1,'#1d1712');for(const sx of [x0+2,x0+U/2-2,x0+U-6])r(sx,top+1,4,h-2,W[2]);for(const yy of [top+1,top+h-4]){r(x0+.5,yy,U-1,2.5,W[3]);r(x0+.5,yy,U-1,.5,W[4]);}
   // The deck facing you: slats over three stringers, a missing board here and there.
   r(x0,F0,U,F1-F0,EDGE);r(x0+.5,F0,U-1,F1-F0-.5,'#1a140f');for(const sx of [x0+2,x0+U/2-2,x0+U-6])r(sx,F0,4,F1-F0-.5,W[1]);
   const sh=(F1-F0-1)/5;for(let k=0;k<5;k++){if(hash(o.x+i*7,k)>.9)continue;const y=F0+.5+k*sh,col=[W[2],W[3],W[2]][(k+i)%3];r(x0+.5,y,U-1,sh-1.5,col);r(x0+.5,y,U-1,.5,W[4]);r(x0+2.5,y+1,.5,.5,'#2a2b2f');r(x0+U-3,y+1,.5,.5,'#2a2b2f');if(hash(k,i+o.y)>.7)r(x0+4+hash(k,i)*(U-12),y+sh*.4,4+hash(i,k)*6,.5,W[1]);}
   if(hash(i,o.x+o.y)>.55)splat(g,x0+6+hash(i,3)*(U-12),F0+5+hash(3,i)*(F1-F0-12),1.5+hash(i,4)*2,PAINTS[Math.floor(hash(i,o.y)*5)],i+o.x,false);}},
 palletsV(g,o){const {e,r}=g,w=o.w,h=o.h,z=o.z;e(w/2+2,h,w/2+6,4,SHADOW);r(-.5,-z-.5,w+1,h+z+1,EDGE);r(0,-z,w,h,'#1d1712');
  for(let y=-z+1;y<h-z-2;y+=8){r(.5,y,w-1,6,W[3]);r(.5,y,w-1,.5,W[4]);r(3,y+2,.5,.5,'#2a2b2f');}r(.5,-z+.5,2.5,h-1,W[2]);r(w-3,-z+.5,2.5,h-1,W[1]);
  r(.5,h-z,w-1,z-.5,'#1a140f');for(let k=0;k<5;k++){r(.5,h-z+1+k*6.5,w-1,5,k%2?W[2]:W[3]);r(.5,h-z+1+k*6.5,w-1,.5,W[4]);}r(w/2-2,h-z+1,4,z-2,W[1]);},
 doors(g,o){const {e,r}=g,w=o.w,h=o.h,z=o.z,n=Math.max(1,Math.round(w/72)),U=w/n;e(w/2,h,w/2+4,5,SHADOW);
  for(let i=0;i<n;i++){const x0=i*U,[c0,c1,c2]=DOORS[Math.floor(hash(o.x+i,o.y+3)*DOORS.length)],F0=h-z;
   // The top edge, and a 2x4 brace behind it.
   r(x0,-z,U,h,EDGE);r(x0+.5,-z+.5,U-1,3,c2);r(x0+.5,-z+3.5,U-1,h-4,'#1a1714');r(x0+4,-z+5,U-8,3,W[2]);r(x0+4,-z+5,U-8,.5,W[3]);
   r(x0,F0,U,z,EDGE);r(x0+.5,F0+.5,U-1,z-1,c1);r(x0+.5,F0+.5,U-1,1,c2);r(x0+.5,h-2,U-1,1.5,c0);
   // Six panels, the door lying on its side; a knob at one end, hinges at the other, paint peeling.
   const pw=(U-14)/3,ph=(z-10)/2-1;for(let k=0;k<3;k++)for(let j=0;j<2;j++){const px=x0+5+k*(pw+2),py=F0+4+j*(ph+2);r(px,py,pw,ph,c0);r(px+.5,py+.5,pw-1,ph-1,c1);r(px+.5,py+ph-1,pw-1,.5,c2);r(px+.5,py+.5,.5,ph-1,c2);}
   const left=hash(i,o.x)>.5,kx=left?x0+3.5:x0+U-5.5;e(kx,F0+z*.55,1.6,1.6,EDGE);e(kx,F0+z*.55-.3,1.1,1.1,'#c9a24a');for(const hy of [F0+5,h-8])r(left?x0+U-2.5:x0+1,hy,1.5,3,'#8a8f94');
   for(let k=0;k<4;k++){const px=x0+4+hash(k,o.x+i)*(U-10),py=F0+3+hash(o.y+i,k)*(z-8);r(px,py,2+hash(k,i)*4,1+hash(i,k)*1.5,c0);r(px+.5,py,1,.5,W[2]);}
   if(hash(o.y,i)>.5)splat(g,x0+10+hash(i,8)*(U-20),F0+8+hash(8,i)*(z-16),2+hash(i,9)*2,PAINTS[Math.floor(hash(o.x,i)*5)],i+o.y,false);}},
 sheet(g,o){const {e,r}=g,w=o.w,h=o.h,z=o.z,F0=h-z,posts=[2,w/2-2,w-6];e(w/2,h,w/2+4,5,SHADOW);
  for(const x of posts){r(x-.5,-z-4.5,5,z+h+4,EDGE);r(x,-z-4,4,z+h+3,W[2]);r(x,-z-4,1,z+h+3,W[3]);}
  r(0,-z,w,h,EDGE);r(.5,-z+.5,w-1,h-1,'#15171b');for(let x=1;x<w-1;x+=3)r(x,-z+.5,1.5,1,M[3]);
  r(0,F0,w,z,EDGE);for(let x=.5;x<w-.5;x+=3){r(x,F0+.5,1.5,z-1,M[2]);r(x+1.5,F0+.5,Math.min(1.5,w-.5-x-1.5),z-1,M[1]);}
  // Rust runs down from the bolts.
  for(let k=0;k<7;k++){const x=4+hash(k,o.x)*(w-10),y=F0+2+hash(o.y,k)*z*.4;r(x,y,1.5,z*.3+hash(k,9)*z*.4,RUST);r(x,y,.5,.5,'#c9874f');}
  for(const x of posts)for(const y of [F0+4,h-6]){r(x+1,y,1.5,1.5,'#1a1b1f');r(x+1,y,.5,.5,'#a9aeb3');}
  for(let k=0;k<3;k++)splat(g,6+hash(k,o.x+2)*(w-12),F0+5+hash(o.y+2,k)*(z-12),1.5+hash(k,6)*2,PAINTS[(k+Math.floor(o.y))%5],k+o.y,false);},
 plywood(g,o){const {e,r,l}=g,w=o.w,h=o.h,z=o.z,F0=h-z,n=Math.max(1,Math.round(w/46)),U=w/n;e(w/2,h,w/2+4,5,SHADOW);
  r(0,-z,w,h,EDGE);r(.5,-z+.5,w-1,h-1,'#1c1712');r(.5,-z+.5,w-1,2,PLY[4]);r(2,-z+3,w-4,h-5,W[2]);r(0,F0,w,z,EDGE);
  for(let i=0;i<n;i++){const x0=i*U+.5,uw=U-1;r(x0,F0+.5,uw,z-1,PLY[2+(i%2)]);r(x0,F0+.5,uw,.5,PLY[4]);r(x0+uw-.5,F0+.5,.5,z-1,PLY[1]);
   for(let k=0;k<6;k++){const y=F0+3+hash(k,o.x+i)*(z-6);r(x0+2,y,uw-4,.5,PLY[1]);r(x0+2+hash(i,k)*uw*.5,y+.5,uw*.3,.5,PLY[3]);}
   for(const nx of [x0+2,x0+uw-3])for(let y=F0+3;y<h-2;y+=9)r(nx,y,.5,.5,'#2a2b2f');}
  // Spray paint: a zombie to aim at, a big X, or the unit's name.
  const tag=Math.floor(hash(o.x,o.y)*3),cx=w/2,cy=F0+z/2,zz=Math.min(z,w*.9);
  if(tag===0){const col='#c96a2c';e(cx,cy-zz*.28,zz*.11,zz*.12,col);r(cx-zz*.12,cy-zz*.16,zz*.24,zz*.34,col);l(cx-zz*.1,cy-zz*.12,cx-zz*.32,cy-zz*.02,1.5,col);l(cx+zz*.1,cy-zz*.12,cx+zz*.3,cy-zz*.04,1.5,col);l(cx-zz*.06,cy+zz*.17,cx-zz*.1,cy+zz*.36,1.6,col);l(cx+zz*.06,cy+zz*.17,cx+zz*.1,cy+zz*.36,1.6,col);e(cx,cy-zz*.02,3,3,BONE);e(cx,cy-zz*.02,1.5,1.5,col);}
  else if(tag===1){l(cx-10,cy-10,cx+10,cy+10,2,'#b94a3a');l(cx-10,cy+10,cx+10,cy-10,2,'#b94a3a');}
  else{const s='LEET AF',tw=textWidth(s,1.5);r(cx-tw/2-2,cy-5,tw+4,10.5,'#1a1b1e');text(g,s,cx-tw/2,cy-3.5,1.5,'#d6d0c2');}
  for(let k=0;k<5;k++)splat(g,4+hash(k,o.x+5)*(w-8),F0+4+hash(o.y,k+5)*(z-10),1.5+hash(k,7)*2.5,PAINTS[(k+Math.floor(o.x))%5],k+o.x,false);},
 plywoodV(g,o){const {e,r}=g,w=o.w,h=o.h,z=o.z;e(w/2+3,h,w/2+6,4,SHADOW);r(-.5,-z-.5,w+1,h+z+1,EDGE);r(0,-z,w,h,'#1c1712');r(0,-z,2.5,h,PLY[4]);r(w-2.5,-z,2.5,h,PLY[3]);r(3,-z+1,w-6,h-2,W[2]);for(let y=-z+6;y<h-z;y+=16)r(3,y,w-6,2,W[3]);
  r(0,h-z,w,z,PLY[2]);r(0,h-z,w,.5,PLY[4]);r(w/2-.25,h-z,.5,z,PLY[1]);for(let y=h-z+4;y<h;y+=9)r(1.5,y,.5,.5,'#2a2b2f');splat(g,w/2,h-z+12,2,PAINTS[Math.floor(hash(o.x,1)*5)],o.x,false);},
 tires(g,o){const {e,r}=g,w=o.w,h=o.h,z=o.z,cx=w/2,base=h-6,th=z/3;e(cx+2,h-2,cx+3,6,SHADOW);
  for(let k=0;k<3;k++){const y=base-k*th,dx=(hash(k,o.x)-.5)*3;e(cx+dx,y,cx-.5,7,EDGE);r(dx+.5,y-th,w-1,th,EDGE);e(cx+dx,y-.5,cx-1,6.4,TIRE[1]);r(dx+1,y-th,w-2,th,TIRE[1]);for(let x=2;x<w-2;x+=3)r(dx+x,y-th+1.5,1.5,th-3,TIRE[2]);
   e(cx+dx,y-th,cx-.5,7,EDGE);e(cx+dx,y-th,cx-1,6.4,TIRE[2]);e(cx+dx,y-th,cx-6,3.4,TIRE[0]);e(cx+dx,y-th-.3,cx-6.5,2.8,'#0b0b0d');r(dx+4,y-th-4,6,.5,TIRE[3]);}
  splat(g,cx+4,base-th*1.5,1.8,PAINTS[Math.floor(hash(o.x,o.y)*5)],o.y,false);},
 spool(g,o){const {e,r}=g,w=o.w,h=o.h,z=o.z,cx=w/2,cy=h/2,top=cy-z;e(cx+2,h-1,cx+4,7,SHADOW);
  e(cx,cy,cx,9,EDGE);r(0,cy-4,w,4,EDGE);e(cx,cy-4,cx-.5,8.5,W[1]);
  r(cx-12,top+4,24,cy-8-top,EDGE);r(cx-11.5,top+4,23,cy-8-top,'#7a3a22');for(let y=top+6;y<cy-5;y+=2.5){r(cx-11.5,y,23,1,'#b5582c');r(cx-11.5,y+1,23,.5,'#4a2416');}r(cx-11.5,top+4,3,cy-8-top,'#00000033');
  e(cx,top+4,cx,9,EDGE);r(0,top,w,4.5,EDGE);r(.5,top+.5,w-1,3.5,W[2]);e(cx,top,cx,9,EDGE);e(cx,top,cx-.5,8.5,W[3]);
  for(let k=-2;k<=2;k++)r(cx+k*7-3,top-7,.5,14,W[2]);e(cx,top,4,2.4,EDGE);e(cx,top,3,1.6,'#2a2420');for(let k=0;k<6;k++){const a=k/6*6.28;r(cx+Math.cos(a)*6.5,top+Math.sin(a)*3.6,1,.5,'#8a8f94');}
  text(g,'LEET',cx-textWidth('LEET',1)/2,top-7,1,'#232428');splat(g,cx-10,top+1,2,PAINTS[Math.floor(hash(o.x,o.y)*5)],o.x,true);},
 sandbags(g,o){const {e,r}=g,w=o.w,h=o.h;e(w/2,h,w/2+4,5,SHADOW);const bw=16;
  for(let j=0;j<2;j++){const y=h-4-j*9,off=j%2?bw/2:0;for(let x=-off+2;x<w-4;x+=bw){const x0=Math.max(1,x),x1=Math.min(w-1,x+bw-1),cx=(x0+x1)/2,rx=(x1-x0)/2,tone=hash(x,j+o.x)>.5;
   e(cx,y,rx+.5,5.5,EDGE);e(cx,y-.5,rx,4.8,BAG[tone?2:1]);e(cx-1,y-2,Math.max(1,rx-2),2.6,BAG[tone?3:2]);r(cx-rx*.6,y-4,rx*.6,.5,BAG[4]);for(let s=0;s<3;s++)r(cx-rx+1.5,y-2+s*1.5,.5,.5,BAG[0]);}}},
 cartpile(g,o){const {e,r:r0,l:l0,p:p0}=g,w=o.w,h=o.h,oy=h-16,r=(x,y,a,b,c)=>r0(x,y+oy,a,b,c),l=(a,b,c,d,k,col)=>l0(a,b+oy,c,d+oy,k,col),p=(pts,col)=>p0(pts.map(([x,y])=>[x,y+oy]),col);e(w/2,h-2,w/2+4,6,SHADOW);const wire=M[3],dk=M[1];
  const basket=(x,y,bw,bh,lean)=>{p([[x,y],[x+bw,y+lean],[x+bw-3,y+bh+lean],[x+3,y+bh]],'#1a1c2033');
   for(let k=0;k<=bw;k+=3)l(x+k,y+k/bw*lean,x+3+k*(bw-6)/bw,y+bh+k/bw*lean,.5,wire);for(let k=0;k<=bh;k+=3)l(x+k/bh*3,y+k,x+bw-k/bh*3,y+k+lean,.5,wire);
   l(x,y,x+bw,y+lean,1,BONE);l(x+3,y+bh,x+bw-3,y+bh+lean,1,dk);};
  // The lower cart, frame bare where its wheels went to Gadget.
  basket(4,-14,40,22,-2);l(4,8,46,6,1.5,EDGE);l(4,8,46,6,.8,M[2]);for(const x of [8,40]){r(x,8,1.5,6,M[2]);r(x-1,13,3.5,1,EDGE);}
  l(42,-16,50,-22,1.5,EDGE);l(42,-16,50,-22,.8,M[2]);r(46,-25,8,3,EDGE);r(46.5,-24.5,7,2,'#b33a2a');r(47,-24.5,5,.5,'#d9604a');
  basket(10,-32,28,16,3);r(36,-36,3,8,EDGE);r(36.5,-35.5,2,7,'#b33a2a');},
 worklight(g,o){const {e,r,l}=g,cx=6;e(cx,8,12,4,SHADOW);
  for(const [fx,fy] of [[-6,10],[18,10],[cx,13]]){l(cx,-50,fx,fy,1.8,EDGE);l(cx,-50,fx,fy,.8,M[2]);}
  r(cx-1,-66,2,18,EDGE);r(cx-.5,-66,1,18,M[3]);
  // The lamp head: a yellow housing and a hot lens facing you.
  r(cx-9,-78,18,13,EDGE);r(cx-8.5,-77.5,17,12,'#c9a23a');r(cx-8.5,-77.5,17,1,'#e6c35a');r(cx-7,-76,14,9,'#2a2b2f');r(cx-6,-75,12,7,'#f4ecd2');r(cx-5,-74,6,2,'#ffffff');for(let x=cx-6;x<cx+6;x+=2)r(x,-75,.5,7,'#d8cfb0');
  r(cx-10.5,-72,1.5,4,EDGE);r(cx+9,-72,1.5,4,EDGE);l(cx+1,-64,cx+8,6,.8,'#c9622a');},
 gatepost(g,o){const {e,r}=g,w=o.w,h=o.h,z=o.z,cx=w/2;e(cx,h-2,cx+6,5,SHADOW);
  r(cx-3,-z,6,h+z-4,EDGE);r(cx-2.5,-z+.5,5,h+z-5,W[2]);r(cx-2.5,-z+.5,1.5,h+z-5,W[3]);for(let y=-z+16;y<-z+40;y+=6){r(cx-2.5,y,5,3,'#c9a23a');r(cx-2.5,y+3,5,3,'#1c1d21');}
  r(cx-4,-z-4,8,5,EDGE);r(cx-3.5,-z-3.5,7,4,'#5a1f1a');r(cx-2,-z-3,3,2,'#c0392b');
  for(const [x,y] of [[0,h-3],[w-2,h-3],[cx-1,h-8]]){e(x+1,y,6.5,4.5,EDGE);e(x+1,y-.5,6,4,BAG[2]);e(x,y-1.5,4,2,BAG[3]);}},
 banner(g,o){const {r,l}=g,w=o.w,y=-62;l(-6,y-6,w/2-26,y,.6,'#2a2b2f');l(w+6,y-6,w/2+26,y,.6,'#2a2b2f');
  for(let k=0;k<9;k++){const t=k/8,x=-6+t*(w+12),yy=y-6+Math.sin(t*Math.PI)*6;r(x-.75,yy,1.5,2,'#f2c46a');}
  r(w/2-27,y-1,54,15,EDGE);r(w/2-26.5,y-.5,53,14,PLY[3]);r(w/2-26.5,y-.5,53,1,PLY[4]);const tw=textWidth('ARENA',2);text(g,'ARENA',w/2-tw/2,y+2,2,'#b33a2a');
  for(let k=0;k<3;k++)splat(g,w/2-20+hash(k,4)*40,y+3+hash(4,k)*8,1.4,PAINTS[k+1],k+40,false);},
 pegboard(g,o){const {r,e}=g,w=o.w,h=o.h,z=o.z,F=h-z;r(-.5,-z-.5,w+1,h+z+1,EDGE);r(0,-z,w,h,'#2a2118');r(0,F,w,z,'#6b5236');r(0,F,w,.5,'#8a6c48');
  if(o.label){const tw=textWidth(o.label,1.5);r(w/2-tw/2-4.5,F-14.5,tw+9,12,EDGE);r(w/2-tw/2-4,F-14,tw+8,11,'#1a1b1e');text(g,o.label,w/2-tw/2,F-11,1.5,'#f2c46a');for(const x of [w/2-tw/2-1,w/2+tw/2+1])r(x-.5,F-3,1,3,'#8a8f94');}
  for(let y=F+3;y<h-2;y+=4)for(let x=3;x<w-2;x+=4)r(x,y,.5,.5,'#3a2c1e');
  // A paintball twin of every gun, each with its hopper of paint.
  Object.entries(PAINT).forEach(([id,col],i)=>{const x=8+i*28,y=F+16,rifle=id.endsWith('ar'),len=rifle?22:15;
   r(x+2,y-6,.5,6,'#8a8f94');r(x+14,y-6,.5,6,'#8a8f94');
   r(x,y,len,4,EDGE);r(x+.5,y+.5,len-1,3,'#3a3d44');r(x+.5,y+.5,len-1,.5,'#6a6f78');r(x+len-.5,y+1,3,2,EDGE);r(x+3,y+3.5,3.5,5,EDGE);r(x+3.5,y+4,2.5,4,'#2a2c31');
   if(rifle){r(x-4,y,5,3.5,EDGE);r(x-3.5,y+.5,4,2.5,'#3a3d44');}e(x+8,y-3,4,3.5,EDGE);e(x+8,y-3.2,3.3,2.9,col);e(x+7,y-4.2,1.3,1,'#ffffff88');r(x+7,y-.5,2,1,EDGE);r(x+len-3,y+1,2,1,col);});
  // Goggle masks and paint pods hang underneath.
  for(let k=0;k<4;k++){const x=12+k*36,y=F+36;r(x,y-6,.5,6,'#8a8f94');r(x-6,y,12,7,EDGE);r(x-5.5,y+.5,11,6,'#2a2c31');r(x-4.5,y+1.5,9,2.5,'#6fa8b8');r(x-4.5,y+1.5,3,1,'#c4e2ea');r(x-2,y+4.5,4,2,'#1a1b1f');}
  for(let k=0;k<6;k++){const x=18+k*22,y=F+50;r(x,y,4,9,EDGE);r(x+.5,y+.5,3,8,'#d6d0c2');r(x+.5,y+2,3,5,PAINTS[k%5]);r(x+.5,y+.5,3,1,'#2a2b2f');}},
 counter(g,o){const {e,r,l}=g,w=o.w,h=o.h,top=28;e(w/2,h,w/2+6,6,SHADOW);
  // A plywood slab across two ammo crates, an open shelf between them.
  r(-.5,-top-.5,w+1,h+4,EDGE);r(.5,-top+.5,w-1,h-1,PLY[3]);r(.5,-top+.5,w-1,.5,PLY[4]);for(let k=0;k<5;k++)r(4+hash(k,2)*(w-30),-top+3+hash(2,k)*(h-6),12+hash(k,5)*14,.5,PLY[2]);
  r(.5,h-top,w-1,3,PLY[2]);r(.5,h-top+2.5,w-1,.5,PLY[1]);const F=h-top+3;r(56,F,w-112,top-3.5,'#14120f');r(60,F+10,w-120,1.5,PLY[1]);
  for(let k=0;k<5;k++){r(64+k*10,F+4,6,6,PAINTS[k]);r(64+k*10,F+4,6,1,'#ffffff44');}
  for(const x of [6,w-50]){r(x-.5,F,45,top-3.5,EDGE);r(x,F,44,top-4,OLIVE[1]);r(x,F,44,.5,OLIVE[2]);r(x+2,F+3,40,.5,OLIVE[3]);text(g,'AMMO',x+22-textWidth('AMMO',1.5)/2,F+9,1.5,'#c9c3a0');r(x+2,F+5,4,1.5,'#1a1b1e');r(x+38,F+5,4,1.5,'#1a1b1e');}
  // On top: a radio, a desk lamp, a clipboard, paint pods, a hopper and a mug.
  blk(g,8,-24,14,6,7,'#2a2c31','#1c1d21');l(19,-31,22,-42,.5,EDGE);r(10,-22,4,1,'#c0392b');
  l(36,-12,40,-30,1,EDGE);l(40,-30,46,-36,1,EDGE);r(43,-40,9,5,EDGE);r(43.5,-39.5,8,4,'#c9a23a');r(44,-36,7,1,'#fff0c0');e(36,-12,4,1.5,EDGE);
  r(60,-22,14,12,EDGE);r(60.5,-21.5,13,11,'#d6d0c2');r(64,-23,6,2,'#8a8f94');for(let k=0;k<4;k++)r(62,-18+k*2.2,9,.5,'#6a6f78');
  for(let k=0;k<5;k++){const x=86+k*9,y=-18+(k%2)*3;r(x,y,8,3,EDGE);r(x+.5,y+.5,7,2,PAINTS[k]);r(x+.5,y+.5,1.5,2,'#d6d0c2');}
  e(142,-16,6,5,EDGE);e(142,-16.3,5.3,4.3,'#26272b');e(142,-17,4,2.5,'#3f8fe0');e(141,-18,1.2,.8,'#ffffff88');r(140,-12,4,2,EDGE);
  r(156,-24,6,7,EDGE);r(156.5,-23.5,5,6,'#d6cfbf');r(162,-22,1.5,3,EDGE);},
 paintcrate(g,o){const {e,r}=g,w=o.w,h=o.h,z=o.z;e(w/2+2,h,w/2+5,5,SHADOW);r(-.5,-z-.5,w+1,h+z+1,EDGE);r(.5,-z+.5,w-1,h-1,'#1e1812');r(.5,h-z+.5,w-1,z-1,W[2]);r(.5,h-z,w-1,1,W[3]);for(let x=8;x<w-2;x+=9)r(x,h-z+1,1,z-2,W[1]);
  for(let k=0;k<14;k++){const x=2+hash(k,1)*(w-9),y=-z+2+hash(1,k)*(h-6);r(x,y,6,2.5,EDGE);r(x+.5,y+.5,5,1.5,PAINTS[k%5]);r(x+.5,y+.5,1,1.5,'#d6d0c2');}
  for(let k=0;k<10;k++)e(1.5+hash(k,2)*(w-3),-z+2+hash(2,k)*(h-4),1,1,PAINTS[(k+2)%5]);r(4,h-z+5,w-8,8,'#1a1b1e');text(g,'PAINT',w/2-textWidth('PAINT',1.5)/2,h-z+6.5,1.5,BONE);},
 desk(g,o){const {e,r,l}=g,w=o.w,h=o.h,T=DESK.T;e(w/2,h,w/2+6,6,SHADOW);
  // Two old doors laid flat on sawhorses, cables looping underneath.
  for(const x of [14,w-14]){l(x-8,h,x-2,h-T+4,1.6,EDGE);l(x+8,h,x+2,h-T+4,1.6,EDGE);l(x-8,h,x-2,h-T+4,.8,W[3]);l(x+8,h,x+2,h-T+4,.8,W[3]);r(x-10,h-T+3,20,2,EDGE);r(x-9.5,h-T+3.5,19,1,W[2]);}
  for(let k=0;k<5;k++){const x=34+k*22;l(x,h-T+3,x+6,h-7+hash(k,1)*4,.6,'#141416');l(x+6,h-7+hash(k,1)*4,x+12,h-T+3,.6,k%2?'#c9622a':'#141416');}
  r(-.5,-T-.5,w+1,h+4,EDGE);r(.5,-T+.5,w/2-1,h-1,'#9a968a');r(w/2+.5,-T+.5,w/2-1,h-1,'#6d5638');r(w/2,-T,.5,h,EDGE);r(6,-T+4,w/2-12,h-10,'#8f8b7f');r(w/2+4,-T+3,w/2-8,.5,'#856a46');
  r(.5,h-T,w/2-1,3,'#7d7a70');r(w/2+.5,h-T,w/2-1,3,'#5a4630');r(.5,h-T+2.5,w-1,.5,'#3a3630');
  // Cables up the back to everything.
  for(const x of [24,62,98,132])l(x,-T+2,x+(hash(x,1)-.5)*8,-T+6,.8,'#141416');
  // A beige CRT, a flat screen on a stack of books, a laptop and a camera monitor, all facing her.
  {const [x,y,sw,sh]=DESK.crt;r(x-3.5,y-3.5,sw+7,sh+9,EDGE);r(x-3,y-3,sw+6,sh+8,'#b8b09a');r(x-3,y-3,sw+6,1,'#d0c8b0');r(x-1,y-1,sw+2,sh+2,'#5a5648');r(x,y,sw,sh,'#0d1a1c');for(let k=0;k<6;k++)r(x+2,y+2+k*2.2,4+hash(k,11)*14,1,k%3?'#3fa8b0':'#9fe0d8');r(x+sw-5,y+sh+2,3,1.5,'#3a3d44');r(x+5,y+sh+5,sw-10,3,EDGE);r(x+5.5,y+sh+5,sw-11,2.5,'#a39a84');r(x+sw-1,y-5,5,4,'#e6c35a');}
  {const [x,y,sw,sh]=DESK.lcd;for(let k=0;k<3;k++){r(x-2,-T+1+k*2.5-4,sw+4,2.5,EDGE);r(x-1.5,-T+1.5+k*2.5-4,sw+3,1.5,['#7a3a30','#3d4f63','#5f7058'][k]);}r(x+sw/2-2,y+sh,4,3,EDGE);
   r(x-1.5,y-1.5,sw+3,sh+3,EDGE);r(x-1,y-1,sw+2,sh+2,'#1c1d21');r(x,y,sw,sh,'#08140e');const cx=x+sw/2,cy=y+sh/2;ring(g,cx,cy,8,6,'#2f7a4a','#08140e');ring(g,cx,cy,4.5,3.4,'#2f7a4a','#08140e');r(cx-9,cy-.25,18,.5,'#2f7a4a');r(cx-.25,cy-7,.5,14,'#2f7a4a');for(const [dx,dy] of [[-5,-3],[3,2],[6,-4],[-2,4]])r(cx+dx,cy+dy,1,1,'#e0503a');}
  {const [x,y,sw,sh]=DESK.lap;r(x-1.5,y-1.5,sw+3,sh+3,EDGE);r(x-1,y-1,sw+2,sh+2,'#2a2c31');r(x,y,sw,sh,'#123a46');for(let k=0;k<4;k++)r(x+2,y+2+k*2.4,3+hash(k,21)*12,.8,'#5ac0d0');p8(g,x,y,sw,sh);}
  {const [x,y,sw,sh]=DESK.cam;r(x-2.5,y-2.5,sw+5,sh+5,EDGE);r(x-2,y-2,sw+4,sh+4,'#26272b');r(x,y,sw,sh,'#38403f');for(let k=0;k<sh;k+=2)r(x,y+k,sw,.5,'#2c3332');r(x+3,y+sh-4,sw-6,2,'#4a524f');r(x+sw/2-2,y+4,4,6,'#1c1f20');r(x+sw/2-1.5,y+2.5,3,2.5,'#1c1f20');text(g,'CAM2',x+1.5,y+1.5,.5,'#c9e0d8');r(x+sw-3,y+1.5,1.5,1.5,'#e0503a');r(x+sw/2-2,y+sh+2.5,4,2,EDGE);}
  // Keyboard, mouse, cans, a soldering iron and a spare robot head.
  r(26,-15,32,7,EDGE);r(26.5,-14.5,31,6,'#2a2c31');for(let y=-13.5;y<-9;y+=1.5)for(let x=27.5;x<57;x+=2)r(x,y,1,.75,'#4a4d54');e(64,-11,2,1.5,EDGE);e(64,-11.3,1.4,1,'#3a3d44');
  for(const [x,y,c] of [[76,-12,'#3f6a3a'],[81,-9,'#1c1d21'],[150,-6,'#3f6a3a']]){r(x,y-5,3.5,6,EDGE);r(x+.5,y-4.5,2.5,5,c);r(x+.5,y-4.5,2.5,1,'#c4c9ce');}
  r(112,-12,8,4,EDGE);r(112.5,-11.5,7,3,'#3a3d44');l(114,-12,120,-20,.8,'#c4c9ce');l(120,-20,126,-24,1.2,'#c9622a');
  e(138,-8,7,5,EDGE);e(138,-8.3,6.3,4.4,'#b5ad9c');for(const x of [135.5,140.5]){l(x-1,-9.5,x+1,-7.5,.6,'#1c1d22');l(x-1,-7.5,x+1,-9.5,.6,'#1c1d22');}r(135,-5.5,6,.5,'#1c1d22');},
 server(g,o){const {e,r,l}=g,w=o.w,h=o.h,z=o.z,F=SRV.F;e(w/2,h,w/2+5,5,SHADOW);
  // The top shelf from above, with a desk fan clamped on.
  r(-.5,-z-.5,w+1,h+1,EDGE);r(.5,-z+.5,w-1,h-1,'#1c1d21');for(let x=2;x<w-1;x+=3)r(x,-z+1,.5,h-2,M[2]);for(let y=-z+2;y<F-1;y+=3)r(1,y,w-2,.5,M[2]);
  e(30,-z+2,8,8,EDGE);e(30,-z+2,7,7,'#3a3d44');for(let k=-6;k<=6;k+=2)r(30+k-.25,-z-5,.5,14,'#5c636b');e(30,-z+2,2,2,'#c9a23a');r(28,-z+9,4,4,EDGE);
  // Four bays on a chrome wire shelf.
  r(-.5,F-.5,w+1,h-F+.5,EDGE);r(0,F,w,h-F,'#121316');for(const x of [0,w-2.5]){r(x,F,2.5,h-F,M[3]);r(x+.5,F,.5,h-F,'#c4c9ce');}
  for(const y of [F,F+22,F+44,F+66,h-3]){r(0,y,w,1.5,M[3]);r(0,y+1.5,w,.5,M[1]);}
  // Bay 1: a router with three antennas, a modem and a taped note.
  r(4,F+15,16,6,EDGE);r(4.5,F+15.5,15,5,'#2a2c31');for(const x of [6,12,18])l(x,F+15,x+(x-12)*.3,F+4,.6,EDGE);r(24,F+8,10,13,EDGE);r(24.5,F+8.5,9,12,'#d6d0c2');r(26,F+11,6,.5,'#8a8f94');r(37,F+6,9,11,'#e8e0d1');r(38,F+8,7,.5,'#b33a2a');r(38,F+10,5,.5,'#b33a2a');r(38,F+12,6,.5,'#b33a2a');r(39,F+5,5,1.5,'#8d9196');
  // Bay 2: two PC towers, one beige, one black.
  r(4,F+24,14,20,EDGE);r(4.5,F+24.5,13,19,'#b8b09a');r(6,F+27,9,2,'#8a8270');r(6,F+30,9,2,'#8a8270');r(21,F+24,13,20,EDGE);r(21.5,F+24.5,12,19,'#26272b');r(23,F+27,8,1,'#3a3d44');for(let y=F+33;y<F+42;y+=1.5)r(23,y,8,.5,'#3a3d44');r(36,F+36,11,8,EDGE);r(36.5,F+36.5,10,7,'#5c636b');
  // Bay 3: a battery backup box and a network switch.
  r(5,F+47,20,10,EDGE);r(5.5,F+47.5,19,9,'#3e434b');r(7,F+50,10,1,'#5c636b');r(3,F+58,44,7,EDGE);r(3.5,F+58.5,43,6,'#1c1d21');for(let i=0;i<14;i++)r(4.5+i*3,F+62,1.5,1.5,'#0b0b0d');
  // Bay 4: a car battery and coils of cord.
  r(6,F+73,14,10,EDGE);r(6.5,F+73.5,13,9,'#2a2c31');r(8,F+72,2,1.5,'#c0392b');r(15,F+72,2,1.5,'#141416');for(let k=0;k<3;k++){e(34,F+79-k*1.5,9-k,3.5,EDGE);e(34,F+79-k*1.5,8-k,2.8,k%2?'#c9622a':'#c9a23a');e(34,F+79-k*1.5,6-k,1.6,'#121316');}},
 batteries(g,o){const {e,r,l}=g,w=o.w,h=o.h;e(w/2,h,w/2+4,4,SHADOW);r(-.5,h-5.5,w+1,6,EDGE);r(0,h-5,w,2,W[2]);r(0,h-3,w,2.5,W[1]);
  for(let k=0;k<4;k++){const x=2+k*12;blk(g,x,1,11,9,10,'#2a2c31','#1c1d21');r(x+1.5,-9,2,1.5,'#c0392b');r(x+7.5,-9,2,1.5,'#141416');r(x+1,4,9,2,'#c9a23a');}
  for(let k=0;k<3;k++)l(2+k*12+8.5,-8.5,2+(k+1)*12+2.5,-8.5,.8,'#141416');
  blk(g,50,1,14,9,9,'#8a8f94','#6a6f78');for(let x=52;x<62;x+=1.5)r(x,2,.5,5,'#3a3d44');},
 whiteboard(g,o){const {e,r,l}=g,w=o.w,h=o.h,z=o.z,B='#2e4a8a',RED='#b33a2a';e(w/2,h,w/2+3,3,SHADOW);
  for(const x of [6,w-6]){const lean=x<w/2?2:-2;l(x,h,x+lean,-z+30,1.5,EDGE);l(x,h,x+lean,-z+30,.7,M[3]);}
  r(-.5,-z-.5,w+1,36,EDGE);r(.5,-z+.5,w-1,34,'#d8d6ce');r(.5,-z+.5,w-1,.5,'#f2f0e8');r(.5,-z+33,w-1,1.5,'#8a8f94');
  text(g,'HOLDOUT',3,-z+3,1,B);for(let k=0;k<3;k++){const y=-z+13+k*6;text(g,String(k+1),4,y,1,B);r(9,y+2,10+hash(k,3)*14,.6,B);r(33,y+2,6,.6,RED);}
  r(w-17,-z+5,12,11,B);r(w-16,-z+6,10,9,'#d8d6ce');for(const x of [w-13,w-8]){l(x-1,-z+8,x+1,-z+10,.5,B);l(x+1,-z+8,x-1,-z+10,.5,B);}r(w-14,-z+13,6,.5,B);r(w-15,-z+16,1,3,B);r(w-8,-z+16,1,3,B);
  r(4,-z+31,6,1.5,RED);r(12,-z+31,6,1.5,B);},
 chair(g,o){const {e,r,l}=g,w=o.w,h=o.h,cx=w/2;e(cx,h-2,11,4,SHADOW);
  for(const [x,y] of [[-3,h-1],[w+3,h-1],[cx-6,h+2],[cx+6,h+2],[cx,h-5]]){l(cx,h-4,x,y,1.4,EDGE);r(x-1,y-1,2,2,'#141416');}
  r(cx-1,-6,2,h+2,EDGE);r(cx-.5,-6,1,h+2,M[3]);e(cx,-6,9,4,EDGE);e(cx,-6.5,8.3,3.4,'#26272b');
  r(cx-7,-26,14,18,EDGE);r(cx-6.5,-25.5,13,17,'#2c2d32');r(cx-6.5,-25.5,13,1,'#44464c');r(cx-3,-20,7,3,'#8d9196');r(cx-3,-20,7,.5,'#b5b9bd');r(cx-1,-8,2,3,EDGE);},
 carseat(g,o){const {e,r}=g,w=o.w,h=o.h,UP=['#2b2f38','#363b46','#424856','#525a6a'];e(w/2,h,w/2+6,6,SHADOW);
  r(-.5,-26.5,w+1,h+17,EDGE);r(.5,-26,w-1,h+5,UP[2]);for(let x=6;x<w-4;x+=8)r(x,-24,.5,h+2,UP[1]);r(.5,-26,w-1,1,UP[3]);
  for(const x of [18,w-30]){r(x-.5,-36.5,13,11,EDGE);r(x,-36,12,10,UP[2]);r(x,-36,12,1,UP[3]);r(x+3,-27,1,2,M[2]);r(x+8,-27,1,2,M[2]);}
  r(-.5,h-12.5,w+1,13,EDGE);r(.5,h-12,w-1,12,UP[1]);r(.5,h-12,w-1,4,UP[2]);for(let x=w/3;x<w-2;x+=w/3)r(x,h-12,.5,12,UP[0]);
  r(w-34,-22,30,h+14,'#5e2a26');for(let k=0;k<6;k++)r(w-34,-18+k*6,30,1,'#7a3a30');r(w-34,h-14,30,4,'#4a201d');
  e(14,h-14,10,5,EDGE);e(14,h-14.5,9,4.3,'#b5ad9c');r(8,h-17,10,.5,'#d6cfbf');},
 stove(g,o){const {e,r}=g,w=o.w,h=o.h,cz=16;e(w/2,h,w/2+3,4,SHADOW);blk(g,0,4,w,h-4,cz,'#3a2c22','#6d5746');
  // A green two-burner stove on the crate, a dented percolator, two mugs.
  const t=4-cz;blk(g,2,t+2,26,8,4,'#3a5a3a','#2e4a2e');r(5,t-1,8,.5,'#141416');r(17,t-1,8,.5,'#141416');r(17,t-3,6,1.5,'#3a78c8');r(18,t-4,4,1,'#8ac0ff');
  r(6,t-14,7,13,EDGE);r(6.5,t-13.5,6,12,'#9aa0a6');r(6.5,t-13.5,1.5,12,'#c4c9ce');r(8,t-16,3,2,EDGE);r(12.5,t-10,2.5,1,EDGE);
  for(const x of [19,24]){r(x,t-9,4,5,EDGE);r(x+.5,t-8.5,3,4,'#d6cfbf');r(x+4,t-8,1,2,EDGE);}},
 cordreel(g,o){const {e,r,l}=g,w=o.w,h=o.h,cx=w/2;e(cx,h,w/2+3,4,SHADOW);
  r(cx-11,-14,2,h+12,EDGE);r(cx+9,-14,2,h+12,EDGE);r(cx-10.5,-13.5,1,h+11,M[3]);r(cx+9.5,-13.5,1,h+11,M[3]);
  e(cx,0,9,9,EDGE);for(let k=0;k<5;k++)e(cx,0,8-k*1.4,8-k*1.4,k%2?'#a54e22':'#c9622a');e(cx,0,2,2,'#3a3d44');l(cx,0,cx+5,-6,1,'#3a3d44');r(cx+4,-8,3,2,EDGE);
  l(cx+8,4,cx+14,h-2,1,'#c9622a');r(-2,h-4,11,4,EDGE);r(-1.5,h-3.5,10,3,'#d6d0c2');r(0,h-2.5,1.5,1,'#3a3a3e');r(3,h-2.5,1.5,1,'#3a3a3e');},
 botbench(g,o){const {e,r,l}=g,w=o.w,h=o.h,T=28;e(w/2,h,w/2+6,6,SHADOW);
  for(const x of [4,w-8]){r(x-.5,h-T,5,T,EDGE);r(x,h-T,4,T-.5,W[2]);r(x,h-T,1,T-.5,W[3]);}r(8,h-8,w-16,3,EDGE);r(8.5,h-7.5,w-17,2,W[1]);
  r(-.5,-T-.5,w+1,h+4,EDGE);r(.5,-T+.5,w-1,h-1,PLY[2]);r(.5,-T+.5,w-1,.5,PLY[4]);r(.5,h-T,w-1,3,PLY[1]);
  // A robot in pieces: the pillow body half wrapped, the battery open, the wheels off.
  e(46,-14,22,9,EDGE);e(46,-14.5,21,8.3,'#b5ad9c');e(42,-17,12,4,'#d6cfbf');e(58,-13,12,7,'#46607c');r(52,-18,10,.5,'#6582a0');for(let k=0;k<5;k++)r(50+hash(k,1)*14,-16+hash(1,k)*6,1,1,'#c9b9a0');
  r(24,-16,46,2,EDGE);r(24.5,-15.5,45,1,'#8d9196');l(66,-10,96,-6,1.6,EDGE);l(66,-10,96,-6,.8,W[3]);
  blk(g,78,-18,14,8,7,'#2a2c31','#1c1d21');r(80,-27,2,1.5,'#c0392b');r(87,-27,2,1.5,'#141416');l(80,-26,72,-20,.6,'#c0392b');l(88,-26,74,-18,.6,'#141416');
  for(const [x,y] of [[104,-14],[114,-10]]){e(x,y,3.5,3.5,EDGE);e(x,y,2.6,2.6,'#1f2024');e(x,y,1,1,'#8a9096');}
  e(126,-18,5,3,EDGE);e(126,-18,4,2.3,'#8d9196');e(126,-18,2,1.2,PLY[2]);r(16,-12,10,3,EDGE);r(16.5,-11.5,6,2,'#c9a23a');r(22.5,-11.5,3,2,'#1c1d21');
  // A clamp lamp over the work.
  l(132,-T,128,-T-12,1,EDGE);r(122,-T-15,10,5,EDGE);r(122.5,-T-14.5,9,4,'#5c636b');r(123,-T-11,8,1,'#fff0c0');},
 parts(g,o){const {e,r,l}=g,w=o.w,h=o.h;e(w/2,h-2,w/2+4,6,SHADOW);
  r(28,-10,22,h+6,EDGE);r(28.5,-9.5,21,h+5,'#5a8ab0');for(let x=30;x<49;x+=3)r(x,-6,1.5,h,'#3e6a8c');r(28.5,-9.5,21,1.5,'#7aa8c8');e(39,-10,9,3,'#d6cfbf');e(36,-12,6,3,'#c08a9a');
  e(14,h-8,13,7,EDGE);e(14,h-8.5,12,6.2,'#b5ad9c');e(11,h-10,7,3,'#d6cfbf');e(18,h-14,10,5,EDGE);e(18,h-14.5,9,4.3,'#7d97b0');r(12,h-16,10,.5,'#c9b9a0');
  l(2,h-2,20,-8,1.5,EDGE);l(2,h-2,20,-8,.8,W[3]);r(17,-14,9,6,EDGE);r(17.5,-13.5,8,5,'#c9a24a');for(let x=18;x<25;x+=1.5)r(x,-9,.5,3,'#a0803a');
  for(const [x,y] of [[6,h-2],[46,h],[40,h-4]]){e(x,y,3,3,EDGE);e(x,y,2.2,2.2,'#1f2024');e(x,y,.9,.9,'#8a9096');}},
 botparked(g,o){drawBot(g,o.w/2,o.h-2,o.variant||0,0);},
 charger(g,o){const {e,r}=g,w=o.w,h=o.h;e(w/2,h,w/2+4,4,SHADOW);blk(g,0,2,w,h-2,18,OLIVE[2],OLIVE[1]);
  for(let k=0;k<2;k++){const y=-14+k*5;r(3,y,26,4,EDGE);r(3.5,y+.5,25,3,'#d6d0c2');for(let i=0;i<5;i++)r(5+i*5,y+1.5,2,1,'#3a3a3e');}
  text(g,'CHARGE',w/2-textWidth('CHARGE',1)/2,4,1,'#c9c3a0');},
 sheetV(g,o){const {e,r}=g,w=o.w,h=o.h,z=o.z;e(w/2+2,h,w/2+6,4,SHADOW);r(-.5,-z-.5,w+1,h+z+1,EDGE);r(0,-z,w,h,M[1]);
  // The top edges of two sheets on a 2x4 frame, seen from above, and the end of the panel facing you.
  for(const x of [.5,w-2.5]){r(x,-z,2,h,M[3]);r(x,-z,2,.5,'#c4c9ce');}for(let y=-z+2;y<h-z-1;y+=3)r(3,y,w-6,1,M[2]);for(let y=-z+10;y<h-z;y+=40){r(3,y,w-6,3,W[2]);r(3,y,w-6,.5,W[3]);}
  r(0,h-z,w,z,EDGE);for(let x=.5;x<w-.5;x+=3){r(x,h-z+.5,1.5,z-1,M[2]);r(x+1.5,h-z+.5,Math.min(1.5,w-.5-x-1.5),z-1,M[1]);}
  for(let k=0;k<3;k++){const x=2+hash(k,o.y)*(w-4),y=h-z+2+hash(o.x,k)*z*.4;r(x,y,1,z*.3+hash(k,9)*z*.3,RUST);}
  for(let k=0;k<4;k++){const y=-z+6+hash(k,o.y+1)*(h-14);r(-.5,y,1.5,4+hash(o.x,k)*6,RUST);}splat(g,w/2,h-z+10,1.8,PAINTS[Math.floor(hash(o.y,2)*5)],o.y,false);},
 // A window: a sill of planks you can shoot over, the wall's uprights either side and a 2x4 header. Robots climb through.
 window(g,o){const {e,r,l}=g,w=o.w,h=o.h,z=o.z,H=50;e(w/2,h,w/2+3,4,SHADOW);
  blk(g,0,0,w,h,z,W[2],W[1]);for(let k=0;k<3;k++){r(.5,h-z+1+k*5.5,w-1,4.5,[W[2],W[3],W[2]][k]);r(.5,h-z+1+k*5.5,w-1,.5,W[4]);}r(.5,-z+.5,w-1,1,W[3]);
  for(let k=0;k<5;k++){const x=4+hash(k,o.x)*(w-10);p3(g,x,-z+3+hash(o.x,k)*(h-6));}
  for(const x of [0,w-4]){r(x-.5,-H-.5,5,h+H+1,EDGE);r(x,-H,4,h,W[3]);r(x,h-H,4,H,W[2]);r(x,h-H,1,H,W[3]);}
  r(-.5,-H-.5,w+1,h+6.5,EDGE);r(0,-H,w,h,W[2]);r(0,-H,w,.5,W[4]);r(0,h-H,w,5.5,W[1]);r(0,h-H,w,.5,W[3]);
  // A torn tarp still nailed to the header on one side.
  const s=hash(o.x,o.y)>.5,tx=s?4:w-22;r(tx,h-H+5,18,10+hash(o.x,3)*8,'#435646');for(let k=0;k<4;k++)r(tx+k*4.5,h-H+5,.5,10+hash(k,o.x)*10,'#26302a');r(tx,h-H+5,18,1,'#56705c');
  splat(g,w*.6,h-z+6,1.6,PAINTS[Math.floor(hash(o.x,8)*5)],o.x,false);},
 windowV(g,o){const {e,r}=g,w=o.w,h=o.h,z=o.z,H=50;e(w/2+2,h,w/2+5,4,SHADOW);
  blk(g,0,0,w,h,z,W[2],W[1]);for(let y=-z+2;y<h-z-1;y+=6){r(.5,y,w-1,5,W[3]);r(.5,y,w-1,.5,W[4]);}for(let k=0;k<3;k++)r(.5,h-z+1+k*5.5,w-1,4.5,[W[2],W[3],W[2]][k]);
  for(let k=0;k<4;k++)p3(g,3+hash(k,o.y)*(w-6),-z+4+hash(o.y,k)*(h-8));
  // The uprights either side of the opening.
  r(-.5,-H-.5,w+1,H+4.5,EDGE);r(0,-H,w,3,W[3]);r(0,3-H,w,H-.5,W[2]);r(0,3-H,1,H-.5,W[3]);
  r(-.5,h-3-H-.5,w+1,H+4,EDGE);r(0,h-3-H,w,3,W[3]);r(0,h-H,w,H,W[2]);r(0,h-H,1,H,W[3]);},
 cot(g,o){const {e,r,l}=g,w=o.w,h=o.h,z=o.z;e(w/2,h,w/2+3,4,SHADOW);
  // An army cot: X legs, two wooden rails and olive canvas, with a pillow and a folded blanket.
  for(const x of [4,w-12]){l(x,h-z,x+8,h,1.4,EDGE);l(x+8,h-z,x,h,1.4,EDGE);l(x,h-z,x+8,h,.7,W[2]);l(x+8,h-z,x,h,.7,W[2]);}
  r(-.5,-z-.5,w+1,h+3,EDGE);r(0,-z,w,h,OLIVE[2]);r(2,-z+3,w-4,h-6,OLIVE[1]);for(const y of [-z,h-z-2]){r(0,y,w,2,W[2]);r(0,y,w,.5,W[3]);}r(0,h-z,w,2,OLIVE[1]);
  r(3,-z+3,14,h-6,'#b5ad9c');r(3,-z+3,14,1,'#d6cfbf');r(4,h-z-4,12,1,'#8a8270');
  const c=hash(o.x,o.y)>.5?['#5a2e2a','#7a3a30']:['#33414f','#4f6479'];r(w-26,-z+1.5,22,h-3,c[0]);for(let y=-z+3;y<h-z-2;y+=4)r(w-26,y,22,1,c[1]);r(w-26,h-z-2,22,2,'#1a1714');},
 shelf(g,o){const {e,r}=g,w=o.w,h=o.h,z=o.z,F=h-z;e(w/2,h,w/2+5,5,SHADOW);
  // Wire shelving from a supermarket stockroom, loaded with what LEET AF could carry.
  r(-.5,-z-.5,w+1,h+1,EDGE);r(.5,-z+.5,w-1,h-1,'#1c1d21');for(let x=2;x<w-1;x+=3)r(x,-z+1,.5,h-2,M[2]);
  r(-.5,F-.5,w+1,z+.5,EDGE);r(0,F,w,z,'#121316');for(const x of [0,w-2.5]){r(x,F,2.5,z,M[3]);r(x+.5,F,.5,z,'#c4c9ce');}
  const rows=[F+1,F+20,F+40,h-3];for(const y of rows){r(0,y,w,1.5,M[3]);r(0,y+1.5,w,.5,M[1]);}
  for(let j=0;j<3;j++){let x=4;const y=rows[j+1];while(x<w-10){const kind=Math.floor(hash(x+o.x,j+o.y)*5),k=hash(j,x);
   if(kind===0){for(let i=0;i<3;i++){r(x+i*5,y-7,4,7,EDGE);r(x+i*5+.5,y-6.5,3,6,['#b33a2a','#c9a23a','#3f6a3a'][(i+j)%3]);r(x+i*5+.5,y-6.5,3,1,'#c4c9ce');}x+=17;}
   else if(kind===1){const bw=12+k*8,bh=9+k*6;r(x,y-bh,bw,bh,EDGE);r(x+.5,y-bh+.5,bw-1,bh-1,'#8a7258');r(x+.5,y-bh+.5,bw-1,1,'#a88e6c');r(x+bw/2-.5,y-bh+.5,1,bh-1,'#c9b9a0');x+=bw+2;}
   else if(kind===2){r(x,y-13,9,13,EDGE);r(x+.5,y-12.5,8,12,'#d6d0c2');r(x+2.5,y-15,4,2.5,EDGE);r(x+3,y-14.5,3,2,'#3f8fe0');r(x+.5,y-8,8,3,'#3f8fe0');x+=11;}
   else if(kind===3){r(x,y-9,14,9,EDGE);r(x+.5,y-8.5,13,8,'#e8e0d1');r(x+5.5,y-7.5,3,6,'#c0392b');r(x+4,y-6,6,3,'#c0392b');x+=16;}
   else{e(x+7,y-5,7,5,EDGE);e(x+7,y-5.3,6.3,4.4,'#435646');e(x+7,y-6,4,2.4,'#56705c');x+=16;}}}},
 table(g,o){const {e,r,l}=g,w=o.w,h=o.h,z=o.z,T=z;e(w/2,h,w/2+5,5,SHADOW);
  // A door on two crates, with whatever was being done when the robots came.
  for(const x of [4,w-26]){r(x-.5,h-T,23,T,EDGE);r(x,h-T,22,T-.5,OLIVE[1]);r(x,h-T,22,.5,OLIVE[2]);r(x+2,h-T+4,18,.5,OLIVE[3]);}
  r(-.5,-T-.5,w+1,h+4,EDGE);const [c0,c1,c2]=DOORS[Math.floor(hash(o.x,o.y)*DOORS.length)];r(.5,-T+.5,w-1,h-1,c1);r(4,-T+4,w-8,h-8,c2);r(6,-T+6,w-12,h-12,c1);r(.5,h-T,w-1,3,c0);r(.5,h-T+2.5,w-1,.5,'#1a1714');
  const kind=Math.floor(hash(o.y,o.x)*3);
  if(kind===0){// Cards, mugs and a lantern.
   for(let k=0;k<6;k++){const x=16+hash(k,o.x)*40,y=-T+6+hash(o.x,k)*(h-14);r(x,y,4,5.5,EDGE);r(x+.5,y+.5,3,4.5,'#e8e0d1');r(x+1,y+1.5,1,1,k%2?'#b33a2a':'#1c1d22');}
   for(const x of [w-20,w-30]){r(x,-T+8,5,6,EDGE);r(x+.5,-T+8.5,4,5,'#d6cfbf');r(x+5,-T+9.5,1,2.5,EDGE);}
   r(w-14,-T-6,8,12,EDGE);r(w-13.5,-T-5.5,7,11,'#3a3d44');r(w-12.5,-T-3.5,5,6,'#f2c46a');r(w-11.5,-T-2.5,2,3,'#fff0c0');}
  else if(kind===1){// A map of the county, pinned flat, with red marks.
   r(10,-T+4,46,h-8,EDGE);r(10.5,-T+4.5,45,h-9,'#c9bfa0');for(let k=0;k<4;k++)l(12,-T+8+k*5,54,-T+6+k*6,.5,'#7a9a7a');l(20,-T+5,30,-T+h-5,.5,'#3a6a9a');for(let k=0;k<5;k++){const x=14+hash(k,3)*38,y=-T+7+hash(3,k)*(h-14);r(x,y,1.5,1.5,'#b33a2a');}
   r(62,-T+6,12,8,EDGE);r(62.5,-T+6.5,11,7,'#2a2c31');r(64,-T+8,4,1,'#c0392b');}
  else{// A robot arm half built, with tools.
   e(30,-T+12,14,6,EDGE);e(30,-T+11.5,13,5.3,'#b5ad9c');l(42,-T+12,62,-T+6,1.6,EDGE);l(42,-T+12,62,-T+6,.8,W[3]);r(60,-T+3,6,6,EDGE);r(60.5,-T+3.5,5,5,'#c9a24a');
   for(const [x,y] of [[12,-T+18],[20,-T+20]]){e(x,y,3,3,EDGE);e(x,y,2.2,2.2,'#1f2024');}l(66,-T+16,76,-T+20,1,'#c9622a');r(70,-T+8,6,2,'#8a8f94');}},
 // Gadget's parts counter: a slab across two crates, bins of sorted parts on the shelf, and the chit tin on top.
 partscounter(g,o){const {e,r,l}=g,w=o.w,h=o.h,top=28;e(w/2,h,w/2+6,6,SHADOW);
  r(-.5,-top-.5,w+1,h+4,EDGE);r(.5,-top+.5,w-1,h-1,'#8f8b7f');r(.5,-top+.5,w-1,.5,'#b3afa2');for(let k=0;k<5;k++)r(4+hash(k,7)*(w-30),-top+3+hash(7,k)*(h-6),12+hash(k,8)*14,.5,'#7d7a70');
  r(.5,h-top,w-1,3,'#7d7a70');r(.5,h-top+2.5,w-1,.5,'#3a3630');const F=h-top+3;r(56,F,w-112,top-3.5,'#14120f');r(60,F+10,w-120,1.5,'#3a3630');
  // Bins: wheels, batteries, sheet scraps, broom heads.
  for(let k=0;k<4;k++){const x=60+k*16;r(x,F+3,14,7,EDGE);r(x+.5,F+3.5,13,6,['#3a5a8a','#b33a2a','#c9a23a','#3f6a3a'][k]);r(x+.5,F+3.5,13,1,'#ffffff44');}
  for(let k=0;k<4;k++){const x=62+k*16;if(k===0){e(x+3,F+3,2,2,'#1f2024');e(x+8,F+3,2,2,'#1f2024');}else if(k===1){r(x+1,F+1,4,3,'#2a2c31');r(x+6,F+1,4,3,'#2a2c31');}else if(k===2){r(x,F+1,10,2,'#46607c');}else{r(x+1,F,8,3,'#a0803a');}}
  for(const x of [6,w-50]){r(x-.5,F,45,top-3.5,EDGE);r(x,F,44,top-4,OLIVE[1]);r(x,F,44,.5,OLIVE[2]);r(x+2,F+3,40,.5,OLIVE[3]);const s=x<w/2?'PARTS':'CHITS';text(g,s,x+22-textWidth(s,1.5)/2,F+9,1.5,'#c9c3a0');r(x+2,F+5,4,1.5,'#1a1b1e');r(x+38,F+5,4,1.5,'#1a1b1e');}
  // On top: a bathroom scale, the chit tin and a roll of tickets, a bell, a clipboard and a robot head with its eyes crossed out.
  r(10,-22,22,14,EDGE);r(10.5,-21.5,21,13,'#d6d0c2');r(14,-19,14,5,'#2a2c31');r(16,-18,10,3,'#9fe0d8');r(20,-18,.5,3,'#b33a2a');
  r(42,-20,26,12,EDGE);r(42.5,-19.5,25,11,'#5c636b');r(42.5,-19.5,25,1,'#8a8f94');for(let k=0;k<6;k++){r(45+k*3.5,-17,3,6,'#e07a2c');r(45+k*3.5,-17,3,.5,'#f2c46a');}e(80,-12,6,3,EDGE);e(80,-12.5,5.3,2.4,'#e07a2c');e(80,-12.5,2,1,'#c4c9ce');
  e(100,-12,5,2.5,EDGE);e(100,-14,3.5,3,EDGE);e(100,-14.3,3,2.5,'#c9a24a');r(99.5,-18,1,2,EDGE);
  r(114,-22,14,16,EDGE);r(114.5,-21.5,13,15,'#d6cfbf');r(118,-23,6,2,'#8a8f94');for(let k=0;k<5;k++)r(116,-18+k*2.4,8+hash(k,2)*2,.5,k%2?'#b33a2a':'#6a6f78');
  e(150,-12,9,7,EDGE);e(150,-12.3,8.3,6.3,'#b5ad9c');e(148,-14,5,3,'#d6cfbf');for(const x of [147,153]){l(x-1.2,-13.7,x+1.2,-11.3,.6,'#1c1d22');l(x-1.2,-11.3,x+1.2,-13.7,.6,'#1c1d22');}r(146,-8,8,.5,'#1c1d22');l(156,-16,160,-26,.6,EDGE);e(160,-26.5,1.2,1.2,'#5a1f1a');},
 // The gate: a chain-link panel on a pipe frame, padlocked while a Holdout runs.
 gatedoor(g,o){const {e,r,l}=g,w=o.w,h=o.h,z=o.z,F=h-z;e(w/2,h,w/2+2,3,SHADOW);
  r(-.5,-z-.5,w+1,3,EDGE);r(0,-z,w,2,M[3]);r(0,-z,w,.5,'#c4c9ce');
  for(const x of [0,w/2-1.5,w-3]){r(x-.5,F-.5,4,z+1,EDGE);r(x,F,3,z,M[2]);r(x,F,1,z,'#c4c9ce');}for(const y of [F,F+z/2,h-3]){r(0,y-.5,w,3,EDGE);r(0,y,w,2,M[2]);r(0,y,w,.5,'#c4c9ce');}
  for(let k=-z;k<w;k+=4){l(Math.max(0,k),F+Math.max(0,-k),Math.min(w,k+z),F+Math.min(z,w-k),.5,'#9aa0a688');l(Math.min(w,k+z),F+Math.max(0,k+z-w),Math.max(0,k),F+Math.min(z,z+k),.5,'#7a808688');}
  r(w/2-4,F+z/2+1,8,7,EDGE);r(w/2-3.5,F+z/2+1.5,7,6,'#c9a24a');r(w/2-2,F+z/2-2,4,3.5,EDGE);r(w/2-.5,F+z/2+3,1,2,'#3a3a3e');
  r(12,F+6,20,10,'#e8e0d1');r(12,F+6,20,2,'#b33a2a');text(g,'HOT',14,F+9,1.5,'#b33a2a');},
 crate(g,o){const {e,r}=g,w=o.w,h=o.h,z=o.z;e(w/2+3,h,w/2+5,5,SHADOW);blk(g,0,0,w,h,z,OLIVE[2],OLIVE[1]);
  r(.5,-z+.5,w-1,1,OLIVE[3]);for(let x=w/3;x<w-2;x+=w/3)r(x,-z+1,.5,h-2,OLIVE[0]);r(2,h-z+2,w-4,.5,OLIVE[3]);r(2,h-3,w-4,.5,OLIVE[0]);for(const x of [3,w-6])r(x,h-z+3,3,z-6,OLIVE[0]);
  const s=hash(o.x,o.y)>.5?'LEET':'AMMO';if(z>=20)text(g,s,w/2-textWidth(s,1.5)/2,h-z/2-3.5,1.5,'#c9c3a0');splat(g,w*.3,h-z+5,1.8,PAINTS[Math.floor(hash(o.y,o.x)*5)],o.x+1,false);},
 drum(g,o){const {e,r}=g,cols=hash(o.x,o.y)>.5?['#2a3a5a','#34496e','#435b84']:['#5a2a24','#6e342c','#84443a'];e(14,16,16,5,SHADOW);r(1,-27,24,40,EDGE);e(13,13,12,4,EDGE);r(2,-27,22,40,cols[1]);e(13,13,11,3.2,cols[1]);r(2,-27,5,40,cols[2]);r(19,-27,5,40,cols[0]);
  for(const y of [-16,-2])r(1.5,y,23,1.5,cols[0]);e(13,-27,12,4.5,EDGE);e(13,-27,11,3.6,cols[2]);e(16,-27.5,2,1,EDGE);
  for(let k=0;k<4;k++)r(3+hash(k,o.x)*18,-24+hash(o.y,k)*30,1.5,2+hash(k,3)*5,RUST);r(9,-10,8,6,'#c9a23a');r(10,-9,6,4,'#1c1d21');splat(g,6+hash(o.x,2)*14,-12+hash(2,o.y)*16,2,PAINTS[Math.floor(hash(o.x,5)*5)],o.x,false);}};
// Broken glass left on a sill.
function p3(g,x,y){g.p([[x,y],[x+2.5,y-.5],[x+1,y+1.5]],'#9fc4cc');g.r(x+.5,y,.5,.5,'#e0f0f4');}
// A lit laptop also gets a sticker or two.
function p8(g,x,y,sw,sh){g.r(x+sw-5,y+sh+1,4,2,'#2a2c31');g.r(x-2,y+sh+1.5,sw+4,3,EDGE);g.r(x-1.5,y+sh+2,sw+3,2,'#3a3d44');}
export function propArt(c,o){if(!TG_ART[o.kind])return campPropArt(c,o);c.save();c.scale(2,2);c.translate(PROP_PAD,o.z+PROP_PAD);TG_ART[o.kind](painter(c),o);c.restore();}
export {PROP_PAD};
// Gadget's robots: a bedsheet over a stuffed pillow, broom-handle arms, a car battery and four shopping-cart wheels.
// The newer ones copy what is out there. One sheet holds them all: a row per robot, and four frames a row (rolling, rolling, down, and the tell).
export const BOT={w:56,h:56,ax:28,ay:52,frames:4,variants:4,rows:7,led:[9,-48.5]};
export const BOT_ROW={shambler:0,runner:4,husk:5,spitter:6};
export const BRUTE={w:96,h:88,ax:48,ay:82,frames:4};
const SHEETS=[{c:['#24303f','#33435a','#46607c','#6582a0'],dot:'#c9b9a0',arms:['broom','broom']},{c:['#3f2430','#5a3345','#7a4a60','#9c6a82'],dot:'#e2cfc6',arms:['broom','plunger']},
 {c:['#24392f','#33524a','#477368','#64968a'],dot:'#c9d6c0',arms:['mop','broom']},{c:['#3f3624','#5a4d33','#7a6a4a','#9c8a64'],dot:'#2e2418',arms:['plunger','mop']}];
const KIND_SHEET={runner:{c:['#4a2a14','#6e3e1c','#9a5a28','#c07a3a'],dot:'#f2c46a',arms:['noodle','noodle']},husk:{c:['#2e2e2a','#45443c','#5e5c50','#7a786a'],dot:'#9a968a',arms:['broom','broom']},
 spitter:{c:['#22341e','#2f4a2a','#41663a','#5a8a50'],dot:'#c9e07a',arms:['mop','plunger']}};
export const SPIT='#8fd14f';
function drawBot(g,cx,gy,v,frame,kind='shambler'){const {e,r,l,p}=g,S=KIND_SHEET[kind]||SHEETS[v%4];if(frame===2)return downBot(g,cx,gy,S,kind);
 const tell=frame===3,b=frame===1?-.5:tell?-1:0,up=frame===1?-1:0;
 e(cx,gy-1,14,4,SHADOW);
 // The chassis: a cart's bottom rack for most, a toy car for a runner.
 if(kind==='runner'){r(cx-14,gy-10,28,6,EDGE);r(cx-13.5,gy-9.5,27,5,'#b33a2a');r(cx-13.5,gy-9.5,27,1,'#d9604a');r(cx-6,gy-12,12,2.5,EDGE);r(cx-5.5,gy-11.5,11,1.5,'#2a2c31');
  for(const s of [-1,1]){const x=cx+s*9;e(x,gy-3,4.5,4.5,EDGE);e(x,gy-3,3.6,3.6,'#1f2024');e(x,gy-3,1.4,1.4,frame===1?'#c4c9ce':'#8a9096');}}
 else{r(cx-12,gy-9,24,4,EDGE);r(cx-11.5,gy-8.5,23,3,W[2]);r(cx-11.5,gy-8.5,23,.5,W[3]);
  for(const s of [-1,1]){const x=cx+s*9;r(x-1.5,gy-6,3,2,'#8a9096');r(x-1.5,gy-5,3,5,EDGE);r(x-1,gy-4.5,2,4,'#1f2024');r(x-.5,frame===1?gy-2.5:gy-4,1,1.5,'#8a9096');}}
 const lean=kind==='runner'?3:0,body=[[cx-10,gy-9],[cx-11,gy-16],[cx-10+lean,gy-26+b],[cx-7+lean,gy-31+b],[cx+7+lean,gy-31+b],[cx+10+lean,gy-26+b],[cx+11,gy-16],[cx+10,gy-9],[cx+7,gy-7],[cx+4,gy-9.5],[cx+1,gy-7],[cx-2,gy-9.5],[cx-5,gy-7],[cx-8,gy-9.5]];
 // A spitter carries its paint on its back: a jug of green and a hose to the launcher.
 if(kind==='spitter'){r(cx-16,gy-30+b,9,16,EDGE);r(cx-15.5,gy-29.5+b,8,15,'#d6d0c2');r(cx-15.5,gy-24+b,8,8,SPIT);r(cx-14,gy-32+b,4,2.5,EDGE);l(cx-11,gy-30+b,cx-4,gy-36+b,.8,'#2a2c31');}
 p(body.map(([x,y])=>[x+(x<cx?-.6:.6),y+(y<gy-20?-.6:.6)]),EDGE);p(body,S.c[2]);
 p([[cx-10+lean,gy-26+b],[cx-7+lean,gy-31+b],[cx-3+lean,gy-31+b],[cx-6,gy-9]],S.c[3]);p([[cx+5+lean,gy-31+b],[cx+7+lean,gy-31+b],[cx+10+lean,gy-26+b],[cx+11,gy-16],[cx+10,gy-9],[cx+6,gy-8]],S.c[1]);
 for(const x of [-4,2,7])r(cx+x+lean*.5,gy-24+b,.5,13,S.c[1]);for(let k=0;k<8;k++)r(cx-8+hash(k,v)*15,gy-28+b+hash(v,k)*17,1,1,S.dot);
 r(cx-11,gy-18,22,2.5,EDGE);r(cx-10.5,gy-17.5,21,1.5,'#8d9196');r(cx-10.5,gy-17.5,21,.5,'#b5b9bd');
 // Arms: up high when a shambler or a husk is about to grab you.
 const grab=tell&&(kind==='shambler'||kind==='husk');
 S.arms.forEach((a,i)=>{const s=i?1:-1,sx=cx+s*9+lean,sy=gy-25+b,hx=kind==='runner'?cx+s*8-12:grab?cx+s*15:cx+s*20,hy=kind==='runner'?gy-22+up:grab?gy-46:gy-30+up;l(sx,sy,hx,hy,2,EDGE);l(sx,sy,hx,hy,1,a==='noodle'?'#e0457b':W[3]);
  if(a==='broom'){r(hx-3,hy-6,6,7,EDGE);r(hx-2.5,hy-5.5,5,3,'#a0803a');r(hx-2.5,hy-2.5,5,3,'#c9a24a');r(hx-3,hy-3,6,.5,'#c0392b');}
  else if(a==='plunger'){e(hx+s,hy-1,3.5,3,EDGE);e(hx+s,hy-1.3,2.8,2.3,'#b33a2a');r(hx+s-1.5,hy-3,2,.5,'#d9604a');}
  else if(a==='mop')for(let k=0;k<5;k++)l(hx,hy,hx+s*(1+k*.6),hy+5+k%2,.8,k%2?'#8d9196':'#b5b9bd');});
 // The head: a pillowcase face, Xs for eyes and a stitched mouth.
 const jerk=tell&&kind==='spitter'?-3:0,hx=cx+lean+(kind==='runner'?3:0)+jerk,hy=gy-37+b+(tell&&kind==='runner'?-2:0)+(kind==='runner'?3:0);
 e(hx,hy,8.5,6.5,EDGE);e(hx,hy-.3,7.8,5.8,'#b5ad9c');e(hx-1.5,hy-2,5,3,'#d6cfbf');for(const s of [-1,1])p([[hx+s*7,hy-5],[hx+s*9.5,hy-6.5],[hx+s*8.5,hy-3.5]],'#b5ad9c');
 for(const x of [hx-3,hx+3]){l(x-1.2,hy-1.7,x+1.2,hy+.7,.6,'#1c1d22');l(x-1.2,hy+.7,x+1.2,hy-1.7,.6,'#1c1d22');}
 if(tell&&kind==='runner'){e(hx,hy+3,3.5,2.6,EDGE);e(hx,hy+3,2.8,2,'#5a1f1a');r(hx-1.5,hy+2,3,.5,'#d6cfbf');for(const s of [-1,1])for(let k=0;k<3;k++)l(hx+s*(10+k*2.5),hy-6+k*4,hx+s*(13+k*2.5),hy-7+k*4,.6,'#f2c46a');}
 else{for(let k=0;k<5;k++)r(hx-3.5+k*1.75,hy+2.5+(k%2?.5:0),1.25,.5,'#1c1d22');r(hx-4,hy+3,8,.5,'#1c1d22');}r(hx-6,hy+5,12,1.5,'#8d9196');
 // A husk wears a stock pot for a helmet and a trash-can lid strapped on as a chest plate.
 if(kind==='husk'){r(hx-9,hy-10,18,7,EDGE);r(hx-8.5,hy-9.5,17,6,'#8a8f94');r(hx-8.5,hy-9.5,17,1,'#c4c9ce');r(hx-8.5,hy-4.5,17,1,'#5c636b');r(hx-11,hy-8,2.5,2,EDGE);r(hx+8.5,hy-8,2.5,2,EDGE);
  e(cx+2,gy-19+b,9,8,EDGE);e(cx+2,gy-19.3+b,8.3,7.3,'#7a808a');ring(g,cx+2,gy-19.3+b,6,5.2,'#9aa0a6','#7a808a');ring(g,cx+2,gy-19.3+b,3.5,3,'#9aa0a6','#7a808a');e(cx+2,gy-20+b,1.5,1.2,'#c4c9ce');r(cx-6,gy-26+b,16,1,'#2a2420');}
 // A spitter's launcher: a length of drain pipe on its shoulder, glowing green just before it fires.
 if(kind==='spitter'){const tx=cx+6,ty=gy-31+b;l(tx,ty,tx+14,ty-6,3.4,EDGE);l(tx,ty,tx+14,ty-6,2.2,'#c4c9ce');e(tx+14,ty-6,2,2,EDGE);e(tx+14,ty-6,1.3,1.3,tell?'#d8ff9a':'#2a3a22');
  if(tell){e(tx+15,ty-7,4.5,4.5,'#8fd14f55');e(hx,hy+3,3,2,'#8fd14f');}}
 if(kind==='runner'){r(cx-5.5,gy-15,11,6,EDGE);r(cx-5,gy-14.5,10,5,'#2a2c31');}
 else{r(cx-5.5,gy-15,11,7,EDGE);r(cx-5,gy-14.5,10,6,'#2a2c31');r(cx-5,gy-14.5,10,.5,'#44464c');r(cx-4,gy-16,2,1.5,'#c0392b');r(cx+2,gy-16,2,1.5,'#141416');r(cx-3,gy-11.5,6,1.5,'#c9a23a');}
 l(cx+6,gy-30+b,cx+9,gy-48+b,.6,EDGE);e(cx+9,gy-48.5+b,1.2,1.2,'#5a1f1a');}
function downBot(g,cx,gy,S,kind){const {e,r,l}=g;e(cx,gy-2,20,5,SHADOW);
 r(cx+2,gy-12,20,4,EDGE);r(cx+2.5,gy-11.5,19,3,kind==='runner'?'#b33a2a':W[2]);for(const x of [cx+5,cx+17]){r(x-1.5,gy-17,3,5,EDGE);r(x-1,gy-16.5,2,4,'#1f2024');}
 e(cx-2,gy-6,15,6.5,EDGE);e(cx-2,gy-6.5,14,5.8,S.c[2]);e(cx-5,gy-8,8,3,S.c[3]);e(cx+3,gy-5,7,3,S.c[1]);for(let k=0;k<5;k++)r(cx-12+hash(k,4)*20,gy-10+hash(4,k)*6,1,1,S.dot);
 const hx=cx-19,hy=gy-5;e(hx,hy,6.5,5,EDGE);e(hx,hy-.3,5.8,4.4,'#b5ad9c');for(const x of [hx-2,hx+2]){l(x-1,hy-1.5,x+1,hy+.5,.6,'#1c1d22');l(x-1,hy+.5,x+1,hy-1.5,.6,'#1c1d22');}
 l(cx+4,gy-2,cx+24,gy-6,1.6,EDGE);l(cx+4,gy-2,cx+24,gy-6,.8,W[3]);r(cx+22,gy-10,5,6,EDGE);r(cx+22.5,gy-9.5,4,5,'#c9a24a');
 if(kind==='husk'){e(cx-22,gy+1,7,3.5,EDGE);e(cx-22,gy+.7,6.3,2.9,'#8a8f94');e(cx-22,gy,4,1.6,'#5c636b');}
 if(kind==='spitter'){e(cx+10,gy,9,3,'#5a8a3a');e(cx+10,gy-.4,7,2.2,SPIT);}}
// The brute: a laundry cart on four big casters, a stuffed mattress for a body, punching bags for arms and a bucket for a head.
// Its front is a folded mattress strapped on; its back, where the battery sits, is bare. Unflipped, it faces right.
function drawBrute(g,cx,gy,frame){const {e,r,l,p}=g,b=frame===1?-1:0,wind=frame===3,low=wind?4:0;
 if(frame===2){e(cx,gy-3,40,8,SHADOW);r(cx-30,gy-20,60,14,EDGE);r(cx-29.5,gy-19.5,59,13,'#5e5c50');r(cx-29.5,gy-19.5,59,2,'#7a786a');for(let k=0;k<5;k++)r(cx-24+k*12,gy-18,1,10,'#45443c');
  r(cx-34,gy-14,14,10,EDGE);r(cx-33.5,gy-13.5,13,9,'#2a2c31');r(cx+18,gy-26,22,18,EDGE);r(cx+18.5,gy-25.5,21,17,'#b5ad9c');for(let k=0;k<3;k++)e(cx+23+k*6,gy-17,1.2,1.2,'#8a8270');
  for(const x of [cx-24,cx+24]){e(x,gy-24,5,5,EDGE);e(x,gy-24,4,4,'#1f2024');}e(cx-42,gy-4,8,5,EDGE);e(cx-42,gy-4.5,7,4.2,'#c9622a');return;}
 e(cx,gy-2,34,7,SHADOW);
 // Casters and the cart's frame.
 for(const x of [cx-24,cx-8,cx+8,cx+24]){r(x-2,gy-12,4,4,'#8a9096');e(x,gy-4,4.5,4.5,EDGE);e(x,gy-4,3.5,3.5,'#1f2024');e(x,frame===1?gy-5:gy-3,1.2,1.2,'#8a9096');}
 r(cx-30,gy-16,60,6,EDGE);r(cx-29.5,gy-15.5,59,5,M[2]);r(cx-29.5,gy-15.5,59,1,'#c4c9ce');for(let x=cx-28;x<cx+28;x+=4)r(x,gy-14,.5,3,M[1]);
 // The mattress body, stitched and buttoned.
 const top=gy-58+b+low;r(cx-26,top,52,44-low,EDGE);r(cx-25.5,top+.5,51,43-low,'#5e5c50');r(cx-25.5,top+.5,51,2,'#7a786a');r(cx-25.5,top+.5,8,43-low,'#6e6c5e');
 for(let j=0;j<3;j++)for(let i=0;i<4;i++)e(cx-18+i*11,top+9+j*11,1.3,1,'#3a3930');for(let k=0;k<4;k++)r(cx-24+k*14,top+2,.5,40-low,'#45443c');
 // The bare back: the battery and its leads, the place to shoot.
 r(cx-34,top+16,12,16,EDGE);r(cx-33.5,top+16.5,11,15,'#2a2c31');r(cx-33.5,top+16.5,11,1,'#44464c');r(cx-32,top+14.5,3,2,'#c0392b');r(cx-26,top+14.5,3,2,'#141416');r(cx-32,top+24,8,2,'#c9a23a');l(cx-30,top+15,cx-22,top+8,.8,'#c0392b');
 // The padded front: a folded mattress strapped over the face it pushes with.
 r(cx+20,top-4,16,50-low,EDGE);r(cx+20.5,top-3.5,15,49-low,'#b5ad9c');r(cx+20.5,top-3.5,15,2,'#d6cfbf');r(cx+33,top-3.5,2.5,49-low,'#8a8270');for(let k=0;k<4;k++)e(cx+28,top+5+k*10,1.2,1.2,'#8a8270');
 for(const y of [top+8,top+30-low]){r(cx+18,y,20,3,EDGE);r(cx+18.5,y+.5,19,2,'#3a3d44');r(cx+26,y,3,3,'#c4c9ce');}
 // Punching-bag arms, low and swinging when it rolls, braced back when it paws the floor before a charge.
 for(const [sx,sy,ax,ay] of wind?[[cx-16,top+16,cx-30,top+40],[cx+12,top+16,cx+30,top+44]]:[[cx-16,top+14,cx-26,top+38+b],[cx+12,top+14,cx+38,top+30-b]]){l(sx,sy,ax,ay-8,2.4,EDGE);l(sx,sy,ax,ay-8,1.2,'#8a8f94');r(ax-5,ay-10,10,14,EDGE);r(ax-4.5,ay-9.5,9,13,'#b33a2a');r(ax-4.5,ay-9.5,9,2,'#d9604a');r(ax-4.5,ay-3,9,1,'#5a1f1a');}
 // A bucket for a head, eyes painted on; they go red when it is about to charge.
 const hx=cx+6,hy=top-6;p([[hx-11,hy-10],[hx+11,hy-10],[hx+9,hy+6],[hx-9,hy+6]],EDGE);p([[hx-10.5,hy-9.5],[hx+10.5,hy-9.5],[hx+8.5,hy+5.5],[hx-8.5,hy+5.5]],'#c9622a');r(hx-10.5,hy-9.5,21,2,'#e07a3a');r(hx-9,hy+3,18,1,'#a54e22');
 l(hx-11,hy-6,hx-14,hy+2,.8,'#8a8f94');l(hx+11,hy-6,hx+14,hy+2,.8,'#8a8f94');
 for(const x of [hx-4,hx+5]){r(x-2,hy-4,4,3,EDGE);r(x-1.5,hy-3.5,3,2,wind?'#ff4a3a':'#1c1d22');}r(hx-5,hy+1,12,1,'#1c1d22');
 if(wind)for(let k=0;k<4;k++){const x=cx-30+k*20;r(x,gy-1+(k%2),6,.8,'#8a7a5a');r(x+2,gy+1,3,.6,'#8a7a5a');}
 l(cx-12,top,cx-16,top-18,.8,EDGE);e(cx-16,top-18.5,1.5,1.5,'#5a1f1a');}
const ROW_KIND=['shambler','shambler','shambler','shambler','runner','husk','spitter'];
export function botArt(c){c.save();c.scale(2,2);const g=painter(c);for(let v=0;v<BOT.rows;v++)for(let f=0;f<BOT.frames;f++){c.save();c.translate(f*BOT.w,v*BOT.h);
  // Runners are smaller: a toy car under a cut-down sheet.
  if(ROW_KIND[v]==='runner'){c.translate(BOT.ax,BOT.ay);c.scale(.85,.85);c.translate(-BOT.ax,-BOT.ay);}drawBot(g,BOT.ax,BOT.ay,v,f,ROW_KIND[v]);c.restore();}c.restore();}
export function bruteArt(c){c.save();c.scale(2,2);const g=painter(c);for(let f=0;f<BRUTE.frames;f++){c.save();c.translate(f*BRUTE.w,0);drawBrute(g,BRUTE.ax,BRUTE.ay,f);c.restore();}c.restore();}
// World positions of every blinking light: server LEDs, the hatch bulbs and the parked robots' antennas.
export function ledSpots(){const s=prop('server'),out=SERVER_LEDS.map(([x,y],i)=>({x:s.x+x,y:s.y+y,kind:i>=5&&i<19?'port':'srv'}));
 for(const hh of HATCHES)out.push(hh.side==='n'?{x:hh.x,y:wallBottom(hh.x)-56,kind:'hatch'}:{x:(hh.side==='w'?westEdge(hh.y)+6:eastEdge(hh.y)-6),y:hh.y-43,kind:'hatch'});
 for(const o of PROPS.filter(o=>o.kind==='botparked'))out.push({x:o.x+o.w/2+BOT.led[0],y:o.y+o.h-2+BOT.led[1],kind:'park'});
 const ch=prop('charger');for(let i=0;i<5;i++)out.push({x:ch.x+6+i*5,y:ch.y-12,kind:'charge'});return out;}
export function screenRects(){const d=prop('desk');return Object.entries(DESK).filter(([k])=>k!=='T').map(([k,[x,y,w,h]])=>({x:d.x+x,y:d.y+y,w,h,kind:k}));}
