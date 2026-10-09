import {CAMP,SHORE,AMBIENT,LIGHTS} from './data.js';
// Camp art follows the character painter: world units, edges snapped to a half-unit grid, drawn on 2x canvases.
// Readability rules: people have the darkest outlines and strongest color; scenery is muted and low contrast;
// solid props get a softer edge; things you own or can use carry ember orange; markers sit above the lighting.
const snap=v=>Math.round(v*2)/2;
export function painter(c){
 const r=(x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(snap(x),snap(y),snap(w),snap(h));};
 const p=(pts,col)=>{let top=Math.floor(Math.min(...pts.map(v=>v[1]))*2)/2,bottom=Math.ceil(Math.max(...pts.map(v=>v[1]))*2)/2;c.fillStyle=col;for(let y=top;y<bottom;y+=.5){let hits=[];for(let i=0;i<pts.length;i++){let a=pts[i],b=pts[(i+1)%pts.length],scan=y+.25;if((a[1]<=scan&&b[1]>scan)||(b[1]<=scan&&a[1]>scan))hits.push(a[0]+(scan-a[1])*(b[0]-a[0])/(b[1]-a[1]));}hits.sort((a,b)=>a-b);for(let i=0;i+1<hits.length;i+=2){let x=snap(hits[i]),end=snap(hits[i+1]);if(end>x)c.fillRect(x,y,end-x,.5);}}};
 const e=(cx,cy,rx,ry,col)=>{const pts=[];for(let i=0;i<28;i++){const a=i/28*Math.PI*2;pts.push([cx+Math.cos(a)*rx,cy+Math.sin(a)*ry]);}p(pts,col);};
 // A line of the given width, for ropes, sticks and handles.
 const l=(x1,y1,x2,y2,w,col)=>{const dx=x2-x1,dy=y2-y1,d=Math.hypot(dx,dy)||1,nx=-dy/d*w/2,ny=dx/d*w/2;p([[x1+nx,y1+ny],[x2+nx,y2+ny],[x2-nx,y2-ny],[x1-nx,y1-ny]],col);};
 return {r,p,e,l};
}
export const EDGE='#191b21',SHADOW='#100e0c66',EMBER='#dd6f2c',EMBER_HI='#ff9a52',BONE='#e8e0d1';
const W=['#2b2320','#4a3a2e','#6b5440','#8d7255','#a88a66'],CV=['#3a362e','#5f584a','#857c69','#a39a84','#bdb39b'],M=['#23262c','#3e434b','#5c636b','#838a8f'],R=['#1d1f27','#2b2e38','#3a3e4b','#4b5060','#5f6575'];
const RUST='#7a4a30',GLASS='#e8b45a',GLASS_HI='#ffe4a0',TEAL='#2f6f69',TEAL_HI='#4b9a91';
// Deterministic noise, so the camp paints the same every time.
export const hash=(x,y)=>{let h=Math.imul(x|0,374761393)+Math.imul(y|0,668265263)|0;h=Math.imul(h^(h>>>13),1274126177);return ((h^(h>>>16))>>>0)/4294967296;};
const smooth=(x,y)=>{const ix=Math.floor(x),iy=Math.floor(y),fx=x-ix,fy=y-iy,u=fx*fx*(3-2*fx),v=fy*fy*(3-2*fy),a=hash(ix,iy),b=hash(ix+1,iy),c=hash(ix,iy+1),d=hash(ix+1,iy+1);return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v;};
const fbm=(x,y)=>smooth(x,y)*.65+smooth(x*2.3+7,y*2.3+3)*.35;
const BAYER=[0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5].map(v=>(v+.5)/16);
const bayer=(x,y)=>BAYER[(y&3)*4+(x&3)];
// The cave's shape.
export const wallBottom=x=>210+6*Math.sin(x*.031)+4*Math.sin(x*.083+1);
export const wallTop=x=>72+12*Math.sin(x*.021)+6*Math.sin(x*.07);
export const westEdge=y=>86+7*Math.sin(y*.045)+3*Math.sin(y*.13);
export const southEdge=x=>806+8*Math.sin(x*.04)+4*Math.sin(x*.11);
export function shoreX(y){if(y<=SHORE[0][1])return SHORE[0][0];for(let i=1;i<SHORE.length;i++){const [x0,y0]=SHORE[i-1],[x1,y1]=SHORE[i];if(y<=y1){const t=(y-y0)/(y1-y0),s=t*t*(3-2*t);return x0+(x1-x0)*(t*.5+s*.5)+3*Math.sin(y*.09);}}return SHORE.at(-1)[0];}
export const inMouth=(x,y)=>((x-1160)/300)**2+((y-40)/200)**2<1;
const inMouthRim=(x,y)=>((x-1160)/306)**2+((y-40)/204)**2<1;
const HORIZON=118;
// Worn paths from the fire to every station help players read where to go.
const PATHS=[[[560,500],[560,330]],[[540,480],[300,420],[170,270]],[[590,480],[780,410]],[[590,500],[740,620]],[[530,510],[320,640],[230,680]],[[590,490],[900,486]],[[300,420],[200,450]]];
function pathDist(x,y){let best=1e9;for(const line of PATHS)for(let i=1;i<line.length;i++){const [ax,ay]=line[i-1],[bx,by]=line[i],dx=bx-ax,dy=by-ay,t=Math.max(0,Math.min(1,((x-ax)*dx+(y-ay)*dy)/(dx*dx+dy*dy)));best=Math.min(best,Math.hypot(x-ax-dx*t,y-ay-dy*t));}return best+5*Math.sin(x*.06+y*.04)+3*Math.sin(y*.11);}
const rgb=h=>[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];
const SAND=['#5f5444','#6c604d','#766a55','#80735d','#8b7e66'].map(rgb),PATH=['#7d715b','#857862','#8c806a'].map(rgb),WET=['#4c483f','#545046','#5c574b'].map(rgb),FOAM=rgb('#9fb0ab');
const SEA=['#2c5664','#22485a','#1a3a4b','#14303f','#0f2532'].map(rgb),ROCK=R.map(rgb),CEIL=['#121319','#17181f','#1d1f27'].map(rgb),SKY=['#141b2c','#1b2539','#243149'].map(rgb);
function groundColor(x,y){
 const wb=wallBottom(x),n=fbm(x/38,y/38),g=hash(x,y),dith=bayer(x,y);
 const mouth=inMouth(x,y);
 if(y<wb&&!mouth){
  const wt=wallTop(x);if(inMouthRim(x,y))return y<wt?ROCK[2]:ROCK[4];
  if(y<wt){const t=y/wt;return CEIL[Math.min(2,Math.floor(t*2.2+dith*.8))];}
  // Rock face: strata bands, rougher near the base, a dark contact line at the foot.
  if(y>wb-4)return ROCK[0];if(y>wb-9)return ROCK[1];
  const band=Math.floor((y+5*Math.sin(x*.05)+3*Math.sin(x*.13))/10),edge=((y+5*Math.sin(x*.05)+3*Math.sin(x*.13))%10+10)%10;
  if(edge<1.2)return ROCK[1];const v=n*.55+g*.25+(band%2?.12:0)+(y-wt)/(wb-wt)*.2;return ROCK[v>.78?4:v>.52?3:2];}
 if(mouth&&y<HORIZON){const t=y/HORIZON;if(g<.004)return rgb('#9aa4b8');return SKY[Math.min(2,Math.floor(t*2.4+dith*.7))];}
 if(x<westEdge(y)){const d=westEdge(y)-x;if(d<2)return ROCK[3];if(d<4)return ROCK[2];return ROCK[n*.6+g*.4>.62?2:1];}
 const se=southEdge(x);if(y>se){return ROCK[y-se<3?2:n>.6?2:1];}
 const sx=shoreX(y);
 if(x>sx){const d=x-sx;if(d<2.5)return FOAM;const t=d/110+n*.18+dith*.12;if(y>HORIZON&&y<HORIZON+2&&mouth)return SEA[0];if(g<.01&&d>8)return rgb('#3a6573');return SEA[Math.min(4,Math.floor(t*4))];}
 const ds=sx-x;if(ds<24){const t=ds/24+n*.25;if(ds<3)return WET[0];return t<.55?WET[0]:t<.85?WET[1]:WET[2];}
 if(x-westEdge(y)<6||y-wb<6||se-y<5)return SAND[0];
 const pd=pathDist(x,y);if(pd<7+n*7){const v=g*.6+n*.4;return v>.8?PATH[1]:v>.3?PATH[0]:SAND[2];}
 const v=n*.7+g*.3;return SAND[v>.82?4:v>.62?3:v>.4?2:v>.2?1:0];}
// The whole floor in one canvas: sand, rock walls, the inlet and a glimpse of night sky through the cave mouth.
export function groundArt(c){
 const w=CAMP.w,h=CAMP.h,img=c.createImageData(w*2,h*2),d=img.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const col=groundColor(x,y);
  for(let k=0;k<4;k++){const i=((y*2+(k>>1))*w*2+x*2+(k&1))*4;d[i]=col[0];d[i+1]=col[1];d[i+2]=col[2];d[i+3]=255;}}
 c.putImageData(img,0,0);c.save();c.scale(2,2);const g=painter(c),{r,e,p,l}=g;
 // Moon over the sea, its broken reflection on the water.
 e(1098,54,11,11,'#c9cbbd');e(1096,52,9,9,'#dcdccc');r(1100,50,3,2,'#c2c3b4');r(1093,57,2,2,'#c7c8b9');
 for(let i=0;i<14;i++){const y=HORIZON+6+i*6,wd=24-i*1.2+hash(i,3)*8;if(inMouth(1098,y)||y<200)r(1098-wd/2+hash(i,9)*6,y,wd,1,i<5?'#8b98a6':'#5d7484');}
 // Stalactites hang from the ceiling edge; damp streaks run down the wall.
 for(let x=10;x<1180;x+=14+Math.floor(hash(x,1)*22)){if(inMouth(x,wallTop(x)+6))continue;const y=wallTop(x),len=10+hash(x,2)*26,wd=4+hash(x,3)*6;p([[x-wd/2,y-2],[x+wd/2,y-2],[x+1,y+len]],R[0]);p([[x-wd/2+1,y-1],[x,y-1],[x+.5,y+len-3]],R[1]);}
 for(let x=20;x<900;x+=30+Math.floor(hash(x,4)*40)){const y=wallTop(x)+12+hash(x,5)*20,len=wallBottom(x)-y-12;r(x,y,1,len,'#2f3b3d');r(x+1,y+len*.3,.5,len*.5,'#3d4a4a');if(hash(x,6)>.5)r(x,y+len-2,1,1,'#8fa6a6');}
 for(let i=0;i<60;i++){const x=hash(i,11)*900,y=wallTop(x)+20+hash(i,12)*(wallBottom(x)-wallTop(x)-34);r(x,y,2+hash(i,13)*6,.5,R[1]);r(x+1,y+.5,1+hash(i,13)*4,.5,R[4]);}
 // Tunnel behind the barred gate, cut into the back wall.
 const gx=164,gy=wallBottom(gx);p([[gx-50,gy],[gx-46,gy-60],[gx-34,gy-82],[gx,gy-92],[gx+34,gy-82],[gx+46,gy-60],[gx+50,gy]],R[0]);p([[gx-44,gy],[gx-40,gy-58],[gx-30,gy-77],[gx,gy-86],[gx+30,gy-77],[gx+40,gy-58],[gx+44,gy]],'#0b0c10');
 r(gx-50,gy-1,100,2,R[0]);
 // Rubble along the foot of the walls.
 for(let i=0;i<70;i++){const x=40+hash(i,21)*900,y=wallBottom(x)+2+hash(i,22)*8,s=1.5+hash(i,23)*3;e(x,y,s+.5,s*.7+.5,R[0]);e(x,y-.5,s,s*.6,R[2]);r(x-s*.5,y-s*.5,s*.6,.5,R[3]);}
 for(let i=0;i<40;i++){const y=230+hash(i,31)*560,x=westEdge(y)+3+hash(i,32)*6,s=1.5+hash(i,33)*2.5;e(x,y,s+.5,s*.7+.5,R[0]);e(x,y-.5,s,s*.6,R[2]);}
 // Pebbles, shells and kelp on the sand.
 for(let i=0;i<520;i++){const x=110+hash(i,41)*880,y=236+hash(i,42)*540,sx=shoreX(y);if(x>sx-2)continue;const t=hash(i,43);
  if(t<.62){const s=.8+hash(i,44)*1.4;r(x,y+s*.5,s*2,.5,'#4e4538');r(x,y,s*2,s,'#968970');r(x+.5,y,s,.5,'#a89b80');}
  else if(t<.8){r(x,y,1.5,1,'#c9c0aa');r(x+.5,y,.5,.5,'#e1d9c4');}
  else if(sx-x<40){l(x,y,x+4+t*6,y+2-t*4,1,'#34412f');r(x+2,y,1,1,'#45553c');}}
 // Kelp along the tideline.
 for(let y=240;y<800;y+=5){const x=shoreX(y)-4-hash(y,51)*6;if(hash(y,52)<.4)l(x,y,x-3-hash(y,53)*5,y+2,1,'#2f3a2c');}
 // A scorched ring around the fire pit, ash scattered by the wind.
 e(560,474,44,20,'#4c443a55');e(560,474,34,15,'#3c362f66');for(let i=0;i<40;i++){const a=hash(i,61)*Math.PI*2,d=24+hash(i,62)*26;r(560+Math.cos(a)*d,474+Math.sin(a)*d*.45,1,.5,'#3a3530');}
 e(762,612,20,9,'#3c362f55');
 // Footprints between the stations.
 for(let i=0;i<46;i++){const line=PATHS[i%PATHS.length],t=hash(i,71),a=line[0],b=line.at(-1),x=a[0]+(b[0]-a[0])*t+(hash(i,72)-.5)*10,y=a[1]+(b[1]-a[1])*t+(hash(i,73)-.5)*8;r(x,y,2,1,'#6a5e4b');r(x+3,y+2,2,1,'#6a5e4b');}
 // Ripples and glints on the water.
 for(let i=0;i<160;i++){const y=230+hash(i,81)*650,sx=shoreX(y),x=sx+12+hash(i,82)*240;if(x>1200)continue;r(x,y,3+hash(i,83)*8,.5,hash(i,84)>.7?'#4a7584':'#2f5a69');}
 c.restore();
}
// The south edge of the cave, drawn in front of everyone.
export const FRONT_Y=740;
export function frontArt(c){c.save();c.scale(2,2);c.translate(0,-FRONT_Y);const {e,p,r}=painter(c);
 const rocks=[];for(let x=-30;x<1230;x+=26+Math.floor(hash(x,91)*46)){rocks.push([x,812+hash(x,92)*30,14+hash(x,93)*34,10+hash(x,94)*16]);if(hash(x,95)>.55)rocks.push([x+20,840+hash(x,96)*16,8+hash(x,97)*12,6+hash(x,98)*8]);}
 rocks.sort((a,b)=>a[1]-b[1]);for(const [x,cy,rx,ry] of rocks){const wet=x>shoreX(cy)-10;
  e(x,cy+ry*.5,rx+2,ry,EDGE);e(x,cy,rx,ry,R[1]);e(x-rx*.15,cy-ry*.3,rx*.75,ry*.6,R[2]);e(x-rx*.3,cy-ry*.45,rx*.35,ry*.28,R[3]);r(x-rx*.4,cy-ry*.6,rx*.3,.5,R[4]);
  if(wet){e(x,cy+ry*.7,rx+3,2,'#9fb0ab66');}}
 for(let x=0;x<1200;x+=6)r(x,872,6,8,R[0]);c.restore();}
// Props. Each draws with the footprint's top left corner at (0, 0); height rises into negative y.
function box(g,w,h,z,top,front,edge=EDGE){const {r}=g;r(-.5,-z-.5,w+1,h+z+1,edge);r(.5,-z+.5,w-1,h-1,top);r(.5,h-z+.5,w-1,z-1,front);r(.5,h-z,w-1,.5,'#ffffff22');}
const ART={
 fire(g,o){const {e,r,p,l}=g,cx=28,cy=14,stones=[];for(let i=0;i<14;i++){const a=i/14*Math.PI*2;stones.push([cx+Math.cos(a)*24,cy+Math.sin(a)*10,i]);}
  const stone=([x,y,i])=>{e(x,y+.5,4.5,3.3,EDGE);e(x,y,3.6,2.5,i%3?R[3]:R[4]);r(x-2,y-1.5,2.5,.5,'#808796');};
  stones.filter(s=>s[1]<cy).forEach(stone);e(cx,cy,20,8,'#2e2a27');e(cx,cy+1,13,5,'#5a2416');
  for(let i=0;i<16;i++)r(cx-11+hash(i,1)*22,cy-3+hash(i,2)*7,1,.5,i%3?'#c94f1f':'#f28a2e');
  l(cx-15,cy+4,cx+13,cy-5,4.5,EDGE);l(cx-14,cy+3.5,cx+12,cy-5,3,W[1]);l(cx-14,cy-4,cx+15,cy+4,4.5,EDGE);l(cx-13,cy-4,cx+14,cy+3.5,3,W[2]);r(cx-14,cy-5,3,2,'#1e1a18');r(cx+12,cy+3,3,2,'#1e1a18');
  stones.filter(s=>s[1]>=cy).forEach(stone);},
 logH(g,o){const {e,r,p}=g,w=o.w,s=o.x;e(w/2,10,w/2+4,6,SHADOW);p([[3,-10],[w-3,-10],[w,-6],[w,5],[w-3,8],[3,8],[0,5],[0,-6]],EDGE);r(2,-9,w-4,6,W[3]);r(2,-3,w-4,8,W[2]);r(2,5,w-4,2,W[1]);
  for(let i=0;i<w/8;i++){const x=6+hash(i,s)*(w-16);r(x,-7+hash(i,s+1)*10,6+hash(i,s+2)*10,.5,W[1]);}r(10,-8,w*.3,.5,W[4]);r(w*.6,-8,w*.22,.5,W[4]);e(w*.3,0,2.5,1.5,W[1]);r(1,-7,1.5,12,W[4]);r(w-2,-7,1,12,W[4]);},
 board(g,o){const {e,r,p}=g;e(50,10,54,5,SHADOW);
  for(const x of [6,88]){r(x,-71,6,81,EDGE);r(x+1,-70,4,79,W[2]);r(x+1,-70,1.5,79,W[3]);r(x+1,6,4,2,W[1]);}
  r(0,-68,100,46,EDGE);r(1,-67,98,44,W[2]);r(1,-67,98,1,W[3]);r(4,-63,92,37,'#7d6044');
  for(let i=0;i<70;i++)r(5+hash(i,14)*90,-62+hash(i,15)*35,1,.5,i%2?'#6a5039':'#93744f');
  const notes=[[9,-60,16,20,'#cfc6b0'],[30,-58,14,17,'#b8ae95'],[50,-61,18,14,'#d6cdb8'],[73,-57,15,19,'#c3b9a1'],[48,-44,12,13,'#a9a089']];
  notes.forEach(([x,y,w,h,col],k)=>{r(x+1,y+1,w,h,'#3d2f22');r(x,y,w,h,col);for(let j=0;j<Math.floor(h/3)-1;j++)r(x+2,y+3+j*3,w-4-((j+k)%2)*3,.5,'#6c6556');r(x+w/2-.5,y+.5,1.5,1.5,k===2?EMBER:'#a33b2e');});
  r(52,-49,10,.5,EMBER);
  p([[-5,-75],[105,-75],[101,-68],[-1,-68]],EDGE);p([[-4,-74],[104,-74],[100.5,-69],[-.5,-69]],W[3]);r(-3,-74,106,1,W[4]);
  // A lantern hangs from the corner: the board's namesake.
  r(-2.5,-68,.5,6,M[1]);r(-6,-62,7,9,EDGE);r(-5,-61,5,7,GLASS);r(-4,-60,2,5,GLASS_HI);r(-6.5,-63,8,1.5,M[1]);r(-6,-53.5,7,1,M[1]);},
 cart(g,o){const {e,r,p,l}=g;e(70,42,76,9,SHADOW);
  l(-16,14,10,14,2.5,EDGE);l(-15,14,10,14,1.5,W[2]);l(-16,28,10,28,2.5,EDGE);l(-15,28,10,28,1.5,W[2]);
  r(4,-26,132,50,EDGE);r(5,-25,130,34,W[3]);for(let i=1;i<6;i++)r(5,-25+i*6,130,.5,W[2]);r(5,-25,130,1,W[4]);r(5,9,130,14,W[2]);r(5,9,130,1,W[1]);for(let x=30;x<135;x+=26)r(x,9,.5,14,W[1]);r(5,15,130,1.5,M[1]);
  for(const x of [22,118]){e(x,22,14,14,EDGE);e(x,22,12.5,12.5,W[1]);e(x,22,10,10,EDGE);for(let k=0;k<6;k++){const a=k/6*Math.PI;l(x+Math.cos(a)*10,22+Math.sin(a)*10,x-Math.cos(a)*10,22-Math.sin(a)*10,1.5,W[2]);}e(x,22,3,3,M[1]);r(x-1,21,1,1,M[3]);r(x-11,14,3,.5,W[3]);}
  // Workbench clutter: vise, sheet metal, a hammer, a wrench and a coil of wire.
  r(14,-28,20,14,EDGE);r(15,-27,18,12,M[1]);r(15,-27,18,2,M[2]);r(20,-31,8,4,EDGE);r(21,-30,6,3,M[2]);r(33,-23,6,2,M[3]);
  p([[46,-22],[78,-24],[80,-8],[48,-6]],EDGE);p([[47,-21],[77,-23],[79,-9],[49,-7]],M[2]);r(55,-19,6,4,RUST);r(68,-14,5,3,RUST);r(50,-20,20,.5,M[3]);
  l(88,-10,106,-18,2,EDGE);l(88,-10,105,-17.5,1,W[4]);r(104,-21,5,6,EDGE);r(104.5,-20.5,4,5,M[2]);
  l(90,-2,110,0,2,EDGE);l(90,-2,110,0,1,M[3]);e(111,0,2.5,2,M[3]);e(111,0,1,1,W[3]);
  e(124,-14,7,4.5,'#5a4128');e(124,-14,4,2.5,W[3]);e(124,-14,2,1,'#5a4128');},
 scrap(g,o){const {e,r,p,l}=g;e(26,22,28,7,SHADOW);e(14,10,12,7,EDGE);e(14,9,10.5,5.8,'#2a2b2f');e(14,9,5,2.6,'#16171a');r(6,5,8,.5,'#4a4c52');
  p([[16,20],[22,-12],[34,-18],[46,-6],[52,20]],EDGE);p([[18,19],[23,-10],[33,-16],[44,-5],[50,19]],M[1]);
  p([[20,8],[38,-8],[46,4],[30,16]],M[2]);r(30,0,5,3,RUST);r(24,10,4,2,RUST);p([[34,-15],[42,-12],[40,-4],[33,-6]],M[3]);
  l(26,-8,50,-2,3,EDGE);l(26,-8,50,-2,1.8,M[3]);r(48,-4,2,3,M[0]);r(22,14,10,.5,M[3]);r(40,12,8,.5,RUST);},
 tent(g,o){const {e,r,p,l}=g,w=o.w,h=o.h,z=o.z,D=h*.75,m=w/2;e(m+4,h-2,m+6,h/3,SHADOW);
  p([[2,h+1],[2,h-D],[m,h-z-D-2],[w-2,h-D],[w-2,h+1]],EDGE);
  p([[3.5,h],[3.5,h-D+.5],[m,h-z-D],[m,h-z]],CV[1]);p([[w-3.5,h],[w-3.5,h-D+.5],[m,h-z-D],[m,h-z]],CV[3]);
  p([[3.5,h],[w-3.5,h],[m,h-z]],EDGE);p([[5,h-.5],[w-5,h-.5],[m,h-z+2]],CV[2]);
  for(let i=1;i<4;i++){const t=i/4;l(3.5+(m-3.5)*t,h-(z)*t,3.5+(m-3.5)*t,h-z*t-D,.5,CV[0]);l(w-3.5-(w-3.5-m)*t,h-z*t,w-3.5-(w-3.5-m)*t,h-z*t-D,.5,CV[2]);}
  l(m,h-z,m,h-z-D,1,CV[4]);
  p([[m+8,h-z*.55-D*.4],[m+20,h-z*.4-D*.45],[m+20,h-z*.4-D*.15],[m+8,h-z*.55-D*.1]],'#6f6a55');r(m+10,h-z*.48-D*.28,8,.5,CV[1]);
  p([[m-11,h],[m+11,h],[m,h-z*.62]],'#14120f');p([[m-6,h],[m+6,h],[m,h-z*.3]],'#2a241e');r(m-4,h-3,8,3,'#4d3d30');
  p([[m-14,h-.5],[m-11,h],[m-1,h-z*.6],[m-3,h-z*.62]],CV[3]);p([[m+14,h-.5],[m+11,h],[m+1,h-z*.6],[m+3,h-z*.62]],CV[1]);
  l(3.5,h-D+2,-8,h-4,.5,'#5b5446');l(w-3.5,h-D+2,w+8,h-4,.5,'#5b5446');r(-9,h-5,2,3,W[1]);r(w+7,h-5,2,3,W[1]);},
 medtent(g,o){const {e,r,p,l}=g,w=o.w,h=o.h,D=h*.7,m=w/2,wall=44,top=80,C=['#6e6c61','#8b887a','#a7a493','#bdbaa7','#cfccb9'];e(m+4,h-2,m+8,h/3,SHADOW);
  p([[4,h+1],[4,h-wall-D],[m,h-top-D-2],[w-4,h-wall-D],[w-4,h+1]],EDGE);
  p([[5.5,h-wall],[5.5,h-wall-D],[m,h-top-D],[m,h-top]],C[1]);p([[w-5.5,h-wall],[w-5.5,h-wall-D],[m,h-top-D],[m,h-top]],C[3]);
  r(5.5,h-wall-.5,w-11,wall,EDGE);r(6.5,h-wall+.5,w-13,wall-1.5,C[2]);p([[5.5,h-wall],[w-5.5,h-wall],[m,h-top]],EDGE);p([[7,h-wall-.5],[w-7,h-wall-.5],[m,h-top+2]],C[2]);
  l(m,h-top,m,h-top-D,1,C[4]);for(let x=24;x<w-10;x+=24)r(x,h-wall+1,.5,wall-2,C[1]);r(6.5,h-wall+.5,w-13,1,C[4]);
  // A teal plus marks the medic. Teal stays reserved for care across the camp.
  r(22,h-38,9,24,EDGE);r(14.5,h-30.5,24,9,EDGE);r(23,h-37,7,22,TEAL);r(15.5,h-29.5,22,7,TEAL);r(24,h-36,2,20,TEAL_HI);r(16.5,h-28.5,20,1.5,TEAL_HI);
  r(92,h-41,34,41,EDGE);r(93,h-40,32,40,'#1a1916');e(109,h-16,13,10,'#e8b45a33');r(107,h-27,4,6,EDGE);r(107.5,h-26.5,3,5,GLASS_HI);r(96,h-8,26,8,'#2a2622');r(98,h-12,10,6,'#6e5a44');r(110,h-10,9,5,'#8b887a');
  p([[88,h-40],[93,h-40],[93,h],[86,h-6]],C[3]);p([[125,h-40],[130,h-40],[132,h-6],[125,h]],C[1]);
  r(128,h-14,16,14,EDGE);r(129,h-13,14,6,'#8d7255');r(129,h-7,14,6,'#6b5440');r(129,h-10,14,1.5,TEAL);
  l(5.5,h-wall-D+4,-8,h-6,.5,'#6b685c');l(w-5.5,h-wall-D+4,w+8,h-6,.5,'#6b685c');},
 cot(g,o){const {e,r,l}=g;e(36,22,38,5,SHADOW);l(4,0,12,14,1.5,EDGE);l(12,0,4,14,1.5,EDGE);l(60,0,68,14,1.5,EDGE);l(68,0,60,14,1.5,EDGE);
  r(1,-11,70,20,EDGE);r(2,-10,68,18,CV[3]);r(2,4,68,4,CV[2]);r(1,6,70,2,M[1]);r(4,-9,13,11,CV[4]);r(4,-1,13,3,CV[2]);r(19,-10,50,18,'#4d5a6b');r(19,-10,50,3,'#61708a');r(19,4,50,4,'#3d4858');r(40,-7,.5,12,'#3d4858');},
 pot(g,o){const {e,r,l}=g;e(22,22,24,6,SHADOW);l(22,-48,22,8,2,EDGE);l(22,-48,22,8,1,W[1]);
  e(22,18,11,4.5,'#3c2a20');e(22,18,7,3,'#5a2416');for(let i=0;i<6;i++)r(16+hash(i,3)*12,16+hash(i,4)*4,1,.5,'#f28a2e');for(let i=0;i<7;i++){const a=i/7*Math.PI*2;e(22+Math.cos(a)*11,19+Math.sin(a)*4.5,2.4,1.6,R[3]);}
  l(22,-47,22,-24,.5,M[3]);e(22,-11,12.5,10.5,EDGE);e(22,-11.5,11.5,9.5,M[1]);r(13,-14,2,8,M[2]);e(22,-20,12,3.8,EDGE);e(22,-20,11,3,M[2]);e(22,-19.5,9,2,'#8a6a3c');r(18,-20,2,1,'#b58a4e');r(25,-19.5,2,1,'#6b8a4a');
  l(22,-48,2,22,2,EDGE);l(22,-48,2,22,1,W[2]);l(22,-48,42,22,2,EDGE);l(22,-48,42,22,1,W[3]);r(20,-50,4,3,'#5b4030');},
 crate(g,o){const {e,r}=g,w=o.w,h=o.h,z=o.z;e(w/2+3,h,w/2+5,5,SHADOW);box(g,w,h,z,'#3a2c22','#6d5746');r(.5,h-z+.5,w-1,1.5,'#8a7055');for(let x=8;x<w-2;x+=12)r(x,h-z+1,1.5,z-2,'#463a34');
  for(let i=0;i<5;i++){const x=3+i*7,y=-z+3+(i%2)*6;e(x+4,y+2,4.5,2.2,EDGE);e(x+4,y+1.8,3.6,1.5,i%2?'#9aa3a6':'#b9c1c3');r(x+1,y+1.5,1,1,'#2b3134');}r(1,-z+.5,w-2,1,'#b2936c');},
 barrel(g,o){const {e,r}=g;e(15,18,15,5,SHADOW);r(1,-24,26,38,EDGE);e(14,14,13,4,EDGE);r(2,-24,24,38,W[2]);e(14,14,12,3.2,W[2]);r(2,-24,5,38,W[3]);r(21,-24,5,38,W[1]);for(let x=9;x<22;x+=5)r(x,-22,.5,36,W[1]);
  for(const y of [-17,4]){r(1,y,26,2.5,EDGE);r(2,y+.5,24,1.5,M[2]);}e(14,-24,13,4.5,EDGE);e(14,-24,12,3.6,W[3]);e(14,-24,9,2.4,'#2b2320');r(9,-25,6,.5,'#6a7f84');},
 leanto(g,o){const {e,r,p,l}=g;e(62,44,66,7,SHADOW);r(4,0,116,42,'#14120f99');r(14,26,22,14,EDGE);r(15,27,20,12,'#5c4a37');r(15,27,20,3,'#76614a');r(84,20,12,18,EDGE);r(85,21,10,16,'#7a3a2a');r(87,18,5,3,EDGE);
  for(const x of [3,117]){r(x,-4,4,50,EDGE);r(x+1,-3,2,48,W[2]);}
  p([[-2,-60],[126,-60],[126,1],[-2,1]],EDGE);p([[-1,-59],[125,-59],[125,0],[-1,0]],'#4f5a46');r(-1,-59,126,6,'#66725a');r(-1,-6,126,6,'#3e4738');
  for(let x=20;x<120;x+=26)r(x,-58,1,57,'#45503e');for(const x of [2,40,84,121])r(x,-3,2,2,CV[3]);r(30,-40,22,10,'#5d6950');r(31,-39,20,.5,'#3e4738');},
 bedroll(g,o){const {e,r}=g;e(36,14,38,6,SHADOW);r(0,-2,72,18,EDGE);r(1,-1,70,16,'#6b4f3a');r(1,-1,70,4,'#8a6a4a');for(let x=18;x<70;x+=10)r(x,0,.5,14,'#5a4130');r(2,0,15,12,CV[3]);r(2,8,15,4,CV[2]);r(60,-1,11,16,'#5a4130');r(62,-1,.5,16,'#8a6a4a');},
 stash(g,o){const {e,r}=g,w=o.w,h=o.h,z=o.z;e(w/2+3,h+1,w/2+6,5,SHADOW);box(g,w,h,z,'#5d4a38','#4a3a2e');for(let x=10;x<w-4;x+=12)r(x,-z+1,.5,h-2,'#4a3a2e');
  // Ember stripe and stencil: this one is yours.
  r(.5,h-z+4,w-1,5,EMBER);for(let x=1;x<w-1;x+=6)r(x+3,h-z+4,2.5,5,'#1b0f07');r(.5,h-z+3.5,w-1,.5,EMBER_HI);
  for(const [x,y] of [[.5,-z+.5],[w-4.5,-z+.5],[.5,h-4.5],[w-4.5,h-4.5]])r(x,y,4,4,M[2]);r(w/2-3,h-z+12,6,7,EDGE);r(w/2-2,h-z+13,4,5,M[3]);r(w/2-1,h-z+10,2,3,M[3]);r(w/2-1,h-z+15,1,2,EDGE);},
 gate(g,o){const {e,r,p,l}=g;
  for(const [y,x0,x1,col] of [[-82,-6,112,W[2]],[-70,0,108,W[3]],[-58,-4,104,W[2]],[-46,2,110,W[3]],[-34,-2,106,W[2]],[-22,4,102,W[3]]]){const t=(hash(y,1)-.5)*4;p([[x0,y+t],[x1,y-t],[x1,y+9-t],[x0,y+9+t]],EDGE);p([[x0+1,y+1+t],[x1-1,y+1-t],[x1-1,y+8-t],[x0+1,y+8+t]],col);r(x0+2,y+1.5+t,x1-x0-4,.5,W[4]);r(x0+3,y+4+t,1,1,M[0]);r(x1-5,y+4-t,1,1,M[0]);}
  // A car door wedged into the middle.
  p([[30,-66],[72,-68],[74,-14],[32,-12]],EDGE);p([[31.5,-64.5],[70.5,-66.5],[72.5,-15.5],[33.5,-13.5]],'#4c5c64');p([[35,-62],[68,-63.5],[68,-44],[35,-43]],'#1a262e');l(40,-60,60,-46,.5,'#6c7f88');r(36,-40,34,.5,'#6c7f88');r(60,-36,7,2,M[3]);r(44,-28,6,4,RUST);
  // Sandbags along the foot, and a warning plank.
  for(let i=0;i<7;i++){const x=4+i*15;e(x+7,4,9,6,EDGE);e(x+7,3,8,5,i%2?'#8a7f62':'#7a7057');r(x+2,1,6,.5,'#a39a7a');}
  p([[76,-56],[100,-58],[100,-44],[76,-42]],EDGE);p([[77,-55],[99,-57],[99,-45],[77,-43]],'#c9c0aa');l(80,-53,96,-46,2,'#a33b2e');l(80,-46,96,-53,2,'#a33b2e');
  l(-4,-30,110,-38,1,M[3]);r(50,-38,5,6,EDGE);r(50.5,-37.5,4,5,M[3]);},
 boat(g,o){const {e,r,p,l}=g,cx=26;e(cx+4,98,32,14,SHADOW);
  const hull=(dy,sx)=>[[cx,-12+dy],[cx+14*sx,0+dy],[cx+24*sx,26+dy],[cx+25*sx,70+dy],[cx+20*sx,104+dy],[cx-20*sx,104+dy],[cx-25*sx,70+dy],[cx-24*sx,26+dy],[cx-14*sx,0+dy]];
  p(hull(8,1.04),EDGE);p(hull(7,1),'#3f5f5c');p(hull(0,1.04),EDGE);p(hull(0,1),'#55706a');p(hull(0,.84).map(([x,y])=>[x,y+3]),W[1]);
  for(let y=16;y<100;y+=10)r(cx-19,y,38,.5,W[0]);for(const y of [34,72])r(cx-22,y,44,6,EDGE),r(cx-21,y+.5,42,4.5,W[3]),r(cx-21,y+.5,42,1,W[4]);
  r(cx-6,50,9,7,'#1f1d1c');r(cx+9,86,6,5,'#1f1d1c');for(let y=8;y<100;y+=18)r(cx+22,y,2,4,'#7a6a52');
  l(cx-30,58,cx+18,18,2.5,EDGE);l(cx-30,58,cx+18,18,1.5,W[3]);p([[cx+14,14],[cx+22,10],[cx+26,18],[cx+18,22]],EDGE);p([[cx+15,15],[cx+22,11.5],[cx+24.5,17.5],[cx+18,20.5]],W[3]);},
 rack(g,o){const {e,r,l}=g;e(31,8,34,4,SHADOW);for(const x of [2,56]){r(x,-56,5,64,EDGE);r(x+1,-55,3,62,W[2]);}r(-2,-56,66,3.5,EDGE);r(-1,-55.5,64,2.5,W[3]);
  for(let i=0;i<9;i++){const x=6+i*6;l(x,-53,x+3,-26+Math.sin(i)*3,.5,'#3b4044');l(x+6,-53,x+3,-26+Math.sin(i)*3,.5,'#3b4044');}
  for(let y=-48;y<-28;y+=5)r(6,y,50,.5,'#3b404488');for(const x of [16,30,44]){r(x,-52,.5,6,M[3]);r(x-1.5,-46,4,10,EDGE);r(x-1,-45.5,3,9,'#9aa3a6');r(x-1,-45.5,1,9,'#c3cacc');r(x-2,-36,5,2,'#6f7a7e');}},
 lantern(g,o){const {e,r}=g;e(5,6,8,3,SHADOW);e(5,5,5,2.5,R[2]);r(3.5,-70,3,76,EDGE);r(4,-69,2,74,W[2]);r(4,-69,.5,74,W[3]);r(4,-71,10,2,EDGE);r(4,-70.5,9,1,W[2]);r(11.5,-69,.5,3,M[1]);
  r(8.5,-66.5,7,1.5,M[1]);r(9,-65,6,9,EDGE);r(10,-64,4,7,GLASS);r(11,-63,2,5,GLASS_HI);r(9,-56.5,6,1,M[1]);},
 rock(g,o){const {e,p,r}=g,w=o.w,h=o.h,z=o.z;e(w/2+2,h-1,w/2+3,h/3,SHADOW);const pts=[[1,h-2],[2,h-z*.5-4],[w*.3,-z+h*.4],[w*.68,-z+h*.3],[w-2,h-z*.55],[w,h-3],[w*.6,h],[w*.2,h]];
  p(pts,EDGE);p(pts.map(([x,y])=>[x+(x<w/2?1:-1),y+(y<h/2?1:-1)]),R[2]);p([[3,h-z*.5-3],[w*.3,-z+h*.4+1],[w*.68,-z+h*.3+1],[w-3,h-z*.55],[w*.6,h-z*.3],[w*.2,h-z*.25]],R[3]);r(w*.3,-z+h*.4+1.5,w*.3,.5,R[4]);r(w*.5,h-z*.3,.5,z*.4,R[1]);},
 driftwood(g,o){const {l,r}=g;l(2,8,78,4,4,EDGE);l(2,7.5,78,3.5,2.8,'#8f8576');l(4,6.5,76,2.5,.8,'#a9a090');l(40,6,52,-2,2.5,EDGE);l(40,6,52,-2,1.5,'#8f8576');for(const x of [16,34,60])r(x,5,.5,2,'#6d665b');}
};
export const PROP_PAD=14;
export function propArt(c,o){c.save();c.scale(2,2);c.translate(PROP_PAD,o.z+PROP_PAD);ART[o.kind](painter(c),o);c.restore();}
// Six flame frames, 48 x 60 units each, anchored at the bottom center (24, 56).
export const FLAME={w:48,h:60,ax:24,ay:56,frames:6};
export function flameArt(c){c.save();c.scale(2,2);const {p,r}=painter(c);
 for(let f=0;f<FLAME.frames;f++){c.save();c.translate(f*FLAME.w,0);const tongue=(k,hgt,wid,col)=>{const sway=Math.sin(f/FLAME.frames*Math.PI*2+k*1.7)*3,x=24+(k-1)*wid*.55;p([[x-wid,56],[x+wid,56],[x+wid*.55,56-hgt*.45],[x+sway,56-hgt],[x-wid*.55,56-hgt*.5]],col);};
  const s=1+.12*Math.sin(f*2.1);tongue(0,26*s,8,'#c94f1f');tongue(2,24/s,8,'#c94f1f');tongue(1,40*s,11,'#c94f1f');tongue(1,32*s,9,'#f28a2e');tongue(0,18/s,6,'#f28a2e');tongue(2,20*s,6,'#f28a2e');tongue(1,20*s,6,'#ffc456');tongue(1,10,4,'#ffe9a8');
  r(22+Math.sin(f)*4,56-44*s-hashF(f)*6,1.5,1.5,'#ffc456');r(27-Math.sin(f)*3,56-36*s,1,1,'#f28a2e');c.restore();}
 c.restore();}
const hashF=f=>hash(f,77);
// The light map multiplies the world: cool cave dark, warm pools under the fire and lanterns, moonlight at the cave mouth.
// It is banded with an ordered dither so light falls off in pixel steps, like the art.
export const LIGHT_SCALE=2;
export function lightArt(c){const w=Math.ceil(CAMP.w/LIGHT_SCALE),h=Math.ceil(CAMP.h/LIGHT_SCALE),img=c.createImageData(w,h),d=img.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const wx=x*LIGHT_SCALE+2,wy=y*LIGHT_SCALE+2,th=bayer(x,y);let F=0,acc=[0,0,0];
  for(const [lx,ly,rad,lr,lg,lb] of LIGHTS){const dist=Math.hypot(wx-lx,(wy-ly)*1.25)/rad;if(dist>=1)continue;let f=(1-dist)**1.5;f=Math.min(1,Math.floor(f*6+th)/6);F+=f;acc[0]+=f*lr;acc[1]+=f*lg;acc[2]+=f*lb;}
  let k=Math.min(1,F),dim=wy<wallTop(wx)?.55:wy<wallBottom(wx)?.82:1;if(inMouth(wx,wy))dim=1;const i=(y*w+x)*4;
  for(let ch=0;ch<3;ch++){const lit=F>0?acc[ch]/F:0;d[i+ch]=Math.round(255*Math.min(1,(AMBIENT[ch]*(1-k)+lit*k)*dim));}d[i+3]=255;}
 c.putImageData(img,0,0);}
export function glowArt(c){const g=c.createRadialGradient(64,64,0,64,64,64);g.addColorStop(0,'rgba(255,170,90,.75)');g.addColorStop(.4,'rgba(255,130,60,.3)');g.addColorStop(1,'rgba(255,120,50,0)');c.fillStyle=g;c.fillRect(0,0,128,128);}
// Badges float over residents and above the lighting: a role icon on a dark plate with an ember rim.
export const ICON={w:20,h:24};
export const ICONS=['hammer','cross','bowl','lantern','chevron'];
export function iconArt(c){c.save();c.scale(2,2);const {r,p,l,e}=painter(c);
 ICONS.forEach((kind,i)=>{c.save();c.translate(i*ICON.w,0);
  if(kind==='chevron'){p([[3,6],[17,6],[10,15]],EDGE);p([[5,7.5],[15,7.5],[10,13]],EMBER);p([[7,7.5],[13,7.5],[10,10.5]],EMBER_HI);c.restore();return;}
  r(2,1,16,16,EMBER);r(3,2,14,14,'#1c1a17');p([[7,17],[13,17],[10,21]],EMBER);p([[8.5,17],[11.5,17],[10,19.5]],'#1c1a17');
  if(kind==='hammer'){l(6,14,13,6,2,BONE);r(9,3.5,8,4,BONE);r(9,6.5,8,1,'#a2998a');}
  if(kind==='cross'){r(8.5,4,3,10,TEAL_HI);r(5,7.5,10,3,TEAL_HI);}
  if(kind==='bowl'){p([[4.5,9],[15.5,9],[13,13.5],[7,13.5]],BONE);r(4.5,9,11,1,'#a2998a');l(8,8,7,4,.8,'#a2998a');l(11,8,12,4,.8,'#a2998a');}
  if(kind==='lantern'){r(9.5,3,1,2,BONE);r(7,5,6,1,BONE);r(7,6,6,7,BONE);r(8,7,4,5,GLASS);r(9,8,2,3,GLASS_HI);r(7,13,6,1,BONE);}
  c.restore();});c.restore();}
