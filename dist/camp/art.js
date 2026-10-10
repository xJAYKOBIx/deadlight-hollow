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
// Bedding colors per sleeping spot, dark to light. Spot 0 is yours.
export const BED_COLORS=[['#5e3a26','#7d5236','#9a6a48','#71492f'],['#2d3d52','#3f5670','#56708c','#384d66'],['#34402c','#4b5b3e','#62744f','#435237'],['#4a3550','#664a6c','#80628a','#5c4262']];
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
const PATHS=[[[560,500],[560,330]],[[540,480],[300,420],[170,270]],[[590,480],[780,410]],[[590,500],[740,620]],[[530,510],[320,640],[290,700]],[[590,490],[900,486]],[[300,420],[200,450]]];
function pathDist(x,y){let best=1e9;for(const line of PATHS)for(let i=1;i<line.length;i++){const [ax,ay]=line[i-1],[bx,by]=line[i],dx=bx-ax,dy=by-ay,t=Math.max(0,Math.min(1,((x-ax)*dx+(y-ay)*dy)/(dx*dx+dy*dy)));best=Math.min(best,Math.hypot(x-ax-dx*t,y-ay-dy*t));}return best+5*Math.sin(x*.06+y*.04)+3*Math.sin(y*.11);}
const rgb=h=>[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];
const SAND=['#5f5444','#6c604d','#766a55','#80735d','#8b7e66'].map(rgb),PATH=['#7d715b','#857862','#8c806a'].map(rgb),WET=['#4c483f','#545046','#5c574b'].map(rgb),FOAM=rgb('#9fb0ab');
const MOSS_HEX=['#34422c','#435437','#566a40'],MOSS=MOSS_HEX.map(rgb);
const ROOTS=[[204,26],[330,40],[452,18],[700,34],[776,22],[870,30]];
// Where water drips from the ceiling (the scene animates the drops) and where the glowing fungus grows.
export const DRIPS=[...[292,488,624].map(x=>({x,top:wallTop(x)+8,y:wallBottom(x)+7})),{x:917,top:wallTop(917)+8,y:224,into:true}];
export const FUNGI=[[300,wallBottom(300)-1],[617,wallBottom(617)-1],[912,wallBottom(912)],[80,326],[84,700],[134,486]];
// Jittered cells for the boulder field: distance to the nearest two centers.
function boulder(x,y){const S=17,cx=Math.floor(x/S),cy=Math.floor(y/S);let d1=1e9,d2=1e9,best=null;
 for(let j=-1;j<=1;j++)for(let i=-1;i<=1;i++){const gx=cx+i,gy=cy+j,px=(gx+.2+hash(gx,gy*3+1)*.6)*S,py=(gy+.2+hash(gx*5+2,gy)*.6)*S,d=Math.hypot((x-px)*1.1,y-py);if(d<d1){d2=d1;d1=d;best=[px,py,gx,gy];}else if(d<d2)d2=d;}
 const [px,py,gx,gy]=best,r=d2-d1;return {seam:r,lit:y<py&&x<px+4?r:9,tone:(hash(gx,gy)-.5)*.3};}
// Wall joints: x positions with a wobble down the face; some stop partway down.
const JOINTS=[];for(let x=8;x<CAMP.w;x+=30+Math.floor(hash(x,7)*46))JOINTS.push({x,end:hash(x,9)<.4?.55+hash(x,10)*.3:1.1,tone:(hash(x,8)-.5)*.22,shift:hash(x,11)*9,slope:(hash(x,12)-.5)*.16});
function joint(x,y,wt,wb){let best={d:30,w:60,tone:0,shift:0,slope:0,crack:false};const k=(y-wt)/(wb-wt);
 for(let i=0;i<JOINTS.length;i++){const J=JOINTS[i],sy=y/13,f=Math.floor(sy),t=sy-f,d=x-J.x-((hash(i,f)*(1-t)+hash(i,f+1)*t)-.5)*9;if(d<0)break;best={d,w:(JOINTS[i+1]?.x??CAMP.w)-J.x,tone:J.tone,shift:J.shift,slope:J.slope,crack:k<J.end};}
 return best;}
const SEA=['#2c5664','#22485a','#1a3a4b','#14303f','#0f2532'].map(rgb),ROCK=R.map(rgb),CEIL=['#121319','#17181f','#1d1f27'].map(rgb),SKY=['#141b2c','#1b2539','#243149'].map(rgb);
function groundColor(x,y){
 const wb=wallBottom(x),n=fbm(x/38,y/38),g=hash(x,y),dith=bayer(x,y);
 const mouth=inMouth(x,y);
 if(y<wb&&!mouth){
  const wt=wallTop(x);if(inMouthRim(x,y))return y<wt?ROCK[2]:ROCK[4];
  if(y<wt){const t=y/wt;return CEIL[Math.min(2,Math.floor(t*2.2+dith*.8))];}
  // Rock face: strata bands, rougher near the base, a dark contact line at the foot.
  if(y>wb-4)return ROCK[0];if(y>wb-9)return y>wb-7&&fbm(x/7,3)>.62?MOSS[0]:ROCK[1];
  // Moss creeps up from the damp foot of the wall.
  const mossy=fbm(x/9,y/6)+(y-wb+26)/60;if(y>wb-26&&mossy>.98)return MOSS[mossy>1.12?2:g>.5?1:0];
  // Joints split the wall into tall facets, each its own shade: a dark crack with a lit lip beside it.
  const j=joint(x,y,wt,wb);if(j.crack&&j.d<1)return ROCK[0];if(j.crack&&j.d<2)return ROCK[3];
  // Bedding planes tilt a little differently in each block, so they break at the joints like stacked stone.
  const by=y+j.shift+j.d*j.slope+1.5*Math.sin(x*.13),band=Math.floor(by/9),edge=(by%9+9)%9;
  if(edge<1)return ROCK[1];if(edge>8.2&&g>.3)return ROCK[3];const v=n*.5+g*.25+(band%2?.1:0)+(y-wt)/(wb-wt)*.2+j.tone-j.d/j.w*.14;return ROCK[v>.78?4:v>.52?3:v>.2?2:1];}
 if(mouth&&y<HORIZON){const t=y/HORIZON;if(g<.004)return rgb('#9aa4b8');return SKY[Math.min(2,Math.floor(t*2.4+dith*.7))];}
 if(x<westEdge(y)){const d=westEdge(y)-x;if(d<2)return ROCK[3];if(d<4)return ROCK[2];const m=fbm(x/11,y/11);if(d<16&&m>.7)return MOSS[m>.8?1:0];
  // The west rock is a jumble of boulders: dark seams between them, each lit along its upper edge.
  const b=boulder(x,y);if(b.seam<1.1)return ROCK[0];if(b.lit<2.2)return ROCK[b.lit<1?3:2];return ROCK[n*.6+g*.4+b.tone>.62?2:1];}
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
 for(let x=10;x<CAMP.w-20;x+=14+Math.floor(hash(x,1)*22)){if(inMouth(x,wallTop(x)+6))continue;const y=wallTop(x),len=10+hash(x,2)*26,wd=4+hash(x,3)*6;p([[x-wd/2,y-2],[x+wd/2,y-2],[x+1,y+len]],R[0]);p([[x-wd/2+1,y-1],[x,y-1],[x+.5,y+len-3]],R[1]);}
 for(let x=20;x<900;x+=30+Math.floor(hash(x,4)*40)){const y=wallTop(x)+12+hash(x,5)*20,len=wallBottom(x)-y-12;r(x,y,1,len,'#2f3b3d');r(x+1,y+len*.3,.5,len*.5,'#3d4a4a');if(hash(x,6)>.5)r(x,y+len-2,1,1,'#8fa6a6');}
 for(let i=0;i<60;i++){const x=hash(i,11)*900,y=wallTop(x)+20+hash(i,12)*(wallBottom(x)-wallTop(x)-34);r(x,y,2+hash(i,13)*6,.5,R[1]);r(x+1,y+.5,1+hash(i,13)*4,.5,R[4]);}
 // Roots push through the ceiling and hang down the face.
 for(const [x,len] of ROOTS){let px=x,py=wallTop(x)-6;for(let k=0;k<len;k+=3){const nx=px+Math.sin(k*.4+x)*1.2,ny=py+3;l(px,py,nx,ny,k<len*.5?2:1.5,'#241d18');l(px,py,nx,ny,k<len*.5?1:.5,'#5a4836');px=nx;py=ny;
  if(hash(x,k)>.8){const s=hash(k,x)>.5?1:-1;l(px,py,px+s*4,py+5,1,'#4a3a2c');}}}
 // Drips: a wet streak down the wall into a little puddle at its foot.
 for(const d of DRIPS){r(d.x-.5,d.top,1.5,(d.into?wallBottom(d.x):d.y)-d.top-6,'#2b3639');if(d.into)continue;r(d.x+1,d.top+8,.5,(d.y-d.top)*.6,'#3d4a4a');e(d.x,d.y,9,3,'#2b3233');e(d.x,d.y-.5,7.5,2.2,'#3b4a52');r(d.x-4,d.y-1.5,4,.5,'#6f8790');r(d.x+2,d.y,2,.5,'#55707a');}
 // Moss at the foot of the walls, thicker where water runs.
 for(let i=0;i<46;i++){const x=40+hash(i,141)*880,y=wallBottom(x)-2-hash(i,142)*5,s=2+hash(i,143)*4;if(inMouth(x,y))continue;e(x,y,s+1.5,s*.55+.5,MOSS_HEX[0]);e(x-.5,y-.5,s,s*.4,MOSS_HEX[1]);r(x-s*.6,y-s*.4,s*.7,.5,MOSS_HEX[2]);}
 for(const d of DRIPS.filter(d=>!d.into))for(let k=0;k<4;k++){const x=d.x-8+k*5+hash(k,d.x)*3,y=d.y-5-hash(d.x,k)*3;e(x,y,3,1.6,MOSS_HEX[1]);r(x-1.5,y-1,2.5,.5,MOSS_HEX[2]);}
 for(let i=0;i<26;i++){const y=240+hash(i,151)*540,x=westEdge(y)-3-hash(i,152)*14,s=2+hash(i,153)*3;e(x,y,s+1,s*.6+.5,MOSS_HEX[0]);e(x,y-.5,s,s*.45,MOSS_HEX[1]);}
 // Pale glowing fungus in a few damp corners. Their glow is drawn above the lighting.
 for(const [fx,fy] of FUNGI)for(let k=0;k<5;k++){const x=fx+(hash(k,fx)-.5)*9,y=fy+(hash(fy,k)-.5)*4,s=.8+hash(k,fy)*1.3;r(x-.25,y,.5,s+1,'#8a8f6e');e(x,y,s+.5,s*.6+.3,'#3d4232');e(x,y-.3,s,s*.5,'#c9d68a');r(x-s*.5,y-.6,s*.6,.5,'#eef5c0');}
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
 // Shade under the sleeping shelter.
 e(219,612,90,13,'#14120f44');e(219,610,80,9,'#14120f33');
 // A scorched ring around the fire pit, ash scattered by the wind.
 e(560,474,44,20,'#4c443a55');e(560,474,34,15,'#3c362f66');for(let i=0;i<40;i++){const a=hash(i,61)*Math.PI*2,d=24+hash(i,62)*26;r(560+Math.cos(a)*d,474+Math.sin(a)*d*.45,1,.5,'#3a3530');}
 e(762,612,20,9,'#3c362f55');
 // Footprints between the stations.
 for(let i=0;i<46;i++){const line=PATHS[i%PATHS.length],t=hash(i,71),a=line[0],b=line.at(-1),x=a[0]+(b[0]-a[0])*t+(hash(i,72)-.5)*10,y=a[1]+(b[1]-a[1])*t+(hash(i,73)-.5)*8;r(x,y,2,1,'#6a5e4b');r(x+3,y+2,2,1,'#6a5e4b');}
 // The rowboat was dragged up from the water: a keel groove runs back to the tideline.
 for(let t=0;t<=1;t+=.01){const x=944+t*66,y=540+t*42+Math.sin(t*3)*3;r(x-1.5,y,3,1,'#4e483d');r(x-2.5,y-1,1,1,'#857862');r(x+1.5,y+1,1,1,'#857862');if(hash(Math.floor(t*100),7)>.8)r(x+4,y+3,2,1,'#6a5e4b');}
 // Crab holes along the wet sand, each with a little spray of dug-out grains.
 for(let i=0;i<9;i++){const y=470+hash(i,161)*280,x=shoreX(y)-8-hash(i,162)*22;e(x,y,1.6,1,'#2c2a25');for(let k=0;k<4;k++)r(x-3+hash(k,i)*6,y-2+hash(i,k)*4,.5,.5,'#8b7e66');}
 // A rusted anchor, half sunk in the sand, its chain trailing off.
 {const ax=640,ay=690;l(ax,ay-14,ax,ay+4,2.5,EDGE);l(ax,ay-14,ax,ay+4,1.4,RUST);e(ax,ay-15,2.5,2,EDGE);e(ax,ay-15,1.4,1,'#3b3530');l(ax-6,ay-10,ax+6,ay-10,2,EDGE);l(ax-6,ay-10,ax+6,ay-10,1,RUST);
  p([[ax-9,ay+1],[ax,ay+6],[ax+9,ay+1],[ax+8,ay+3.5],[ax,ay+8],[ax-8,ay+3.5]],EDGE);p([[ax-8,ay+2],[ax,ay+6],[ax+8,ay+2],[ax,ay+7]],'#8a5236');e(ax,ay+7,12,2,'#5f544455');
  for(let k=0;k<9;k++){const x=ax+3+k*3.2,y=ay-15-Math.sin(k*.5)*3+k*.4;e(x,y,1.4,1,EDGE);r(x-.5,y-.5,1,.5,'#8a5236');}}
 // A starfish and a few more shells near the water.
 {const sx=868,sy=716;for(let k=0;k<5;k++){const a=k/5*Math.PI*2-Math.PI/2;l(sx,sy,sx+Math.cos(a)*4,sy+Math.sin(a)*3,1.6,'#8a4a35');}e(sx,sy,1.4,1,'#b0654a');}
 // Ripples and glints on the water.
 for(let i=0;i<160;i++){const y=230+hash(i,81)*650,sx=shoreX(y),x=sx+12+hash(i,82)*340;if(x>CAMP.w)continue;r(x,y,3+hash(i,83)*8,.5,hash(i,84)>.7?'#4a7584':'#2f5a69');}
 c.restore();
}
// The south edge of the cave, drawn in front of everyone.
export const FRONT_Y=740;
export function frontArt(c){c.save();c.scale(2,2);c.translate(0,-FRONT_Y);const {e,p,r}=painter(c);
 const rocks=[];for(let x=-30;x<CAMP.w+30;x+=26+Math.floor(hash(x,91)*46)){rocks.push([x,812+hash(x,92)*30,14+hash(x,93)*34,10+hash(x,94)*16]);if(hash(x,95)>.55)rocks.push([x+20,840+hash(x,96)*16,8+hash(x,97)*12,6+hash(x,98)*8]);}
 rocks.sort((a,b)=>a[1]-b[1]);for(const [x,cy,rx,ry] of rocks){const wet=x>shoreX(cy)-10;
  e(x,cy+ry*.5,rx+2,ry,EDGE);e(x,cy,rx,ry,R[1]);e(x-rx*.15,cy-ry*.3,rx*.75,ry*.6,R[2]);e(x-rx*.3,cy-ry*.45,rx*.35,ry*.28,R[3]);r(x-rx*.4,cy-ry*.6,rx*.3,.5,R[4]);
  if(wet){e(x,cy+ry*.7,rx+3,2,'#9fb0ab66');}}
 for(let x=0;x<CAMP.w;x+=6)r(x,872,6,8,R[0]);c.restore();}
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
 // The shared shelter: a patched tarp pitched from a ridge pole, room for four sleepers underneath.
 shelter(g,o){const {e,r,p,l}=g,w=o.w,h=o.h,T=['#2f3629','#3e4738','#4f5a46','#66725a','#7a8668'],posts=[-2,w/2-2,w-2];
  // (Its shade on the sand is painted with the ground, so it never darkens the beds.)
  // The back wall, seen under the front edge of the roof, with a coat and a pack hung on it.
  r(.5,-26,w-1,27,EDGE);r(1.5,-25,w-3,25,'#2e2c25');for(let x=12;x<w-4;x+=20)r(x,-25,.5,25,'#24231e');r(1.5,-2.5,w-3,2.5,'#201f1a');
  r(40,-24,1,1.5,M[3]);p([[37,-23],[44,-23],[45,-10],[36,-10]],EDGE);p([[38,-22.5],[43,-22.5],[44,-11],[37,-11]],'#5a4a3c');r(40.25,-22,.5,10,'#4a3c30');
  r(128,-24,1,1.5,M[3]);r(124,-22,10,11,EDGE);r(125,-21,8,9,'#5f6844');r(125,-21,8,2.5,'#4b5236');r(127,-16,4,2,'#4b5236');
  for(const x of posts){r(x-.5,-21,5,h+22,EDGE);r(x+.5,-20,3,h+20,W[2]);r(x+.5,-20,1,h+20,W[3]);r(x,h-1,4,2,W[1]);}
  // The tarp sags between the posts along its front edge; tension folds run up to the ridge.
  const sag=x=>{const k=x<w/2?(x+11)/(w/2+11):(x-w/2)/(w/2+11);return -18+Math.sin(Math.max(0,Math.min(1,k))*Math.PI)*3.5;},front=[];for(let x=w+11;x>=-11;x-=4)front.push([x,sag(x)]);front.push([-11,sag(-11)]);
  p([[-8,-55],[w+8,-55],...front],EDGE);p([[-7,-54],[w+7,-54],...front.map(([x,y])=>[x+(x>w/2?-1:1),y-1])],T[2]);
  p([[-7,-54],[w+7,-54],[w+7.6,-47],[-7.6,-47]],T[1]);p(front.map(([x,y])=>[x*.997,y-1]).concat([[-10,-26],[w+10,-26]].reverse()),T[3]);
  for(let x=-10;x<w+10;x+=2)r(x,sag(x)-2.5,2,1.2,T[4]);
  for(const x of posts){const px=x+2;l(px,-20,px-14,-50,.6,T[1]);l(px,-20,px+14,-50,.6,T[1]);l(px+1,-21,px+5,-40,.5,T[4]);}
  for(const [x,y,pw,ph,col] of [[24,-46,14,9,'#5d6950'],[104,-40,13,10,'#6b5f48'],[146,-50,11,7,'#5d6950']]){r(x-.5,y-.5,pw+1,ph+1,T[0]);r(x,y,pw,ph,col);r(x,y,pw,1,'#ffffff14');for(let s=1;s<pw;s+=2){r(x+s,y-.5,.5,.5,'#a39a84');r(x+s,y+ph,.5,.5,'#a39a84');}}
  r(-11,-58,w+22,4,EDGE);r(-10,-57,w+20,2,W[2]);r(-10,-57,w+20,.5,W[3]);e(-11,-56,2.2,2.2,EDGE);e(-11,-56,1.5,1.5,W[4]);e(w+11,-56,2.2,2.2,EDGE);e(w+11,-56,1.5,1.5,W[4]);
  // Guy ropes to stakes out front.
  l(-10,-18,-13,h+10,.5,'#7a735f');l(w+10,-18,w+13,h+10,.5,'#7a735f');r(-14,h+8,2,3,W[1]);r(w+12,h+8,2,3,W[1]);
  // A lantern hangs from the front corner.
  r(w-3.5,-17,.5,5,M[1]);r(w-7,-12.5,7,1.5,M[1]);r(w-6.5,-11,6,9,EDGE);r(w-5.5,-10,4,7,GLASS);r(w-4.5,-9,2,5,GLASS_HI);r(w-6.5,-2.5,6,1,M[1]);},
 // A sleeping pad, a plump pillow and a patchwork quilt with its corner turned back. The colors are the sleeper's; an ember band marks yours.
 bed(g,o){const {e,r,p,l}=g,w=o.w,h=o.h,[c0,c1,c2,c3]=BED_COLORS[o.slot||0],round=(x,y,a,b,k)=>[[x+k,y],[x+a-k,y],[x+a,y+k],[x+a,y+b-k],[x+a-k,y+b],[x+k,y+b],[x,y+b-k],[x,y+k]];
  e(w/2+1.5,h,w/2+3,3.5,SHADOW);p(round(-.5,-.5,w+1,h+1,2.5),EDGE);p(round(.5,.5,w-1,h-1,2),'#75664e');r(2,1,w-4,.5,'#8f7f63');
  // Pillow: soft corners, a lit top, a dent where a head goes.
  p(round(3,2,w-6,11,3),'#57503f');p(round(3.5,2.5,w-7,10,2.5),'#b3aa94');p(round(4,2.5,w-8,7,2.5),'#cfc6b0');e(w/2-3,5,4,1.6,'#e0d8c4');e(w/2+1,8,4,1.8,'#b3aa94');r(5,11.5,w-10,.5,'#8f8774');
  // Quilt: drapes a little past the pad, patchwork squares with stitching.
  const top=15,qb=h-1;p(round(-1.5,top-.5,w+3,qb-top+1,2.5),EDGE);p(round(-1,top,w+2,qb-top,2),c1);
  for(let row=0;row<5;row++)for(let col=0;col<3;col++){const pw=(w+2)/3,ph=(qb-top-6)/5,x=-1+col*pw,y=top+5+row*ph;if((row+col)%2)r(x,y,pw,ph,c3);r(x,y,pw,.5,c0);r(x,y,.5,ph,c0);}
  r(-1,top+3,1.5,qb-top-5,c2);r(w-.5,top+3,1.5,qb-top-5,c0);
  for(const [x0,y0,x1,y1] of [[4,26,7,40],[16,30,19,46],[9,46,12,54]]){l(x0,y0,x1,y1,.6,c2);l(x0+1,y0+.5,x1+1,y1+.5,.5,c0);}
  // The turned-down sheet along the top, and the top corner folded back to show the lining.
  r(-1,top,w+2,5,'#d8d0bc');r(-1,top,w+2,1,'#ece5d4');for(let x=0;x<w;x+=3)r(x,top+4.5,2,.5,'#a89f8a');r(-1,top+5,w+2,.5,c0);
  const fold=(o.slot||0)%2?-1:1,fx=fold>0?w+1:-1,F=x=>fold>0?x:w-x;p([[F(w-7),top+5.5],[fx,top+5.5],[fx,top+13]],EDGE);p([[F(w-5.5),top+6],[fx-fold*.5,top+6],[fx-fold*.5,top+11.5]],'#d8d0bc');l(F(w-5.5),top+6,fx-fold*.5,top+11.5,.5,'#a89f8a');
  if(o.slot===0){r(-7,4,5,6,EDGE);r(-6.5,4.5,4,5,'#8fa6a6');r(-5.5,5.5,2,3,'#e8dcc0');r(-4.75,3.5,.5,2,'#2a2320');r(-8,12,6,4,EDGE);r(-7.5,12.5,5,3,'#6e3b2c');r(-7.5,12.5,5,.5,'#d8d0bc');}
  const band=top+24;if(o.slot===0){r(-1,band,w+2,3,EMBER);r(-1,band,w+2,.5,EMBER_HI);for(let x=1;x<w;x+=4)r(x,band+2,1,.5,'#8a3d1a');}else{r(-1,band,w+2,2,'#cfc6b055');}},
 // A footlocker at the end of each bed: a plank lid with a rounded top, iron straps and corners, a lock. Yours is your stash.
 chest(g,o){const {e,r}=g,w=o.w,h=o.h,z=o.z,mine=o.slot===0,[c0,c1]=BED_COLORS[o.slot||0];e(w/2+2,h+1,w/2+5,4.5,SHADOW);
  r(-.5,-z-1.5,w+1,h+z+2,EDGE);r(.5,-z-.5,w-1,h-.5,'#7a6250');r(.5,-z-.5,w-1,2,'#8f7660');r(.5,-z+h-3,w-1,2,'#5f4c3c');for(const y of [-z+3,-z+6.5])r(.5,y,w-1,.5,'#5a4636');
  r(.5,h-z,w-1,4,'#5d4a38');r(.5,h-z,w-1,.5,'#7a6250');r(.5,h-z+4,w-1,.5,EDGE);r(.5,h-z+4.5,w-1,z-5,'#4e3d30');for(const x of [9,17])r(x,h-z+4.5,.5,z-5,'#3d3027');
  r(.5,h-z+8,w-1,3,mine?EMBER:c1);r(.5,h-z+8,w-1,.5,mine?EMBER_HI:c0);
  for(const x of [3.5,w-5.5]){r(x,-z-.5,2,h+z,'#3b2c22');r(x+.5,-z-.5,.5,h+z,'#5a4434');r(x+.5,h-z+1,1,1,M[3]);}
  for(const [x,y] of [[.5,-z-.5],[w-3.5,-z-.5],[.5,h-3],[w-3.5,h-3],[.5,h-z],[w-3.5,h-z]])r(x,y,3,2.5,M[2]);
  r(w/2-2.5,h-z+2,5,6,EDGE);r(w/2-2,h-z+2.5,4,5,mine?'#c99a4e':'#8a8f94');r(w/2-.25,h-z+4,.5,2,EDGE);r(w/2-1.5,h-z+2.5,3,.5,mine?'#e8c27a':'#b0b5b9');
  r(-1.5,h-z+6,1.5,3,M[1]);r(w,h-z+6,1.5,3,M[1]);},
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
  for(let y=-48;y<-28;y+=5)r(6,y,50,.5,'#3b404488');
  // One drying fish per basket fish, up to nine: the camp shows its own food stock.
  for(let i=0;i<Math.min(9,o.fish||0);i++){const x=8.5+i*5.6,y=-49,len=9+hash(i,5)*3,col=i%3===2?'#8a5a43':i%3===1?'#5f8a8a':'#b9a77d';r(x,-53,.5,4,M[3]);
   // Hung by the tail: a forked tail at the top, the body widening, the head at the bottom.
   const {p}=g;p([[x-2,y],[x+.25,y+2],[x+2.5,y],[x+1.5,y+3],[x+2.5,y+6],[x+2,y+len-1],[x+.25,y+len+.5],[x-1.5,y+len-1],[x-2,y+6],[x-1,y+3]],EDGE);
   p([[x-1.5,y+.8],[x+.25,y+2.6],[x+2,y+.8],[x+1,y+3.2],[x+2,y+6],[x+1.5,y+len-1.2],[x+.25,y+len-.2],[x-1,y+len-1.2],[x-1.5,y+6],[x-.5,y+3.2]],col);r(x-1,y+5,1,len-6,'#d8d4c855');r(x-.5,y+len-2.5,1,1,'#14161a');}},
 pier(g,o){const {e,r,p,l}=g,w=o.w,h=o.h,z=o.z,top=-z,deck=h-z;
  for(let x=10;x<w;x+=30){r(x,deck-2,5,z+12,EDGE);r(x+1,deck,3,z+10,W[1]);e(x+2.5,h+10,6,2,'#9fb0ab66');}
  r(-.5,top-.5,w+1,h+1,EDGE);for(let x=0,i=0;x<w;x+=6,i++){const miss=i===19;if(miss){r(x,top,6,deck-top,'#0f2532');continue;}r(x+.5,top+.5,5,deck-top-1,i%3?W[2]:W[3]);r(x+.5,top+.5,5,.5,W[4]);r(x+1.5,top+3,1,1,M[1]);r(x+1.5,deck-4,1,1,M[1]);if(hash(i,3)>.6)r(x+2,top+8+hash(i,4)*14,.5,6,W[1]);}
  r(0,deck,w,z,W[1]);r(0,deck,w,1,W[0]);for(let x=4;x<w;x+=12)r(x,deck+1,.5,z-2,W[0]);
  // Bait bucket, a coil of rope and the pier lantern at the end.
  r(w-30,top+2,10,9,EDGE);r(w-29.5,top+2.5,9,8,M[2]);e(w-25,top+3,4.5,1.6,'#3b3530');r(w-29.5,top+5,9,1,M[1]);
  e(20,top+10,7,4,'#5a4128');e(20,top+10,4,2.2,W[3]);e(20,top+10,1.5,.8,'#5a4128');
  r(w-8,top-58,3.5,60,EDGE);r(w-7.5,top-57,2.5,58,W[2]);r(w-14,top-58,9,2,EDGE);r(w-13.5,top-57.5,8,1,W[2]);r(w-13,top-56,.5,3,M[1]);r(w-16,top-53,6,8,EDGE);r(w-15,top-52,4,6,GLASS);r(w-14.5,top-51,2,4,GLASS_HI);r(w-16.5,top-54,7,1.5,M[1]);},
 // The Training Grounds: a storm-bunker portal poured into the back wall. Steel doors with one leaf ajar and warm light behind it,
 // a bullseye sign, sandbag walls, a gun rack and a shot-up paper target, and a floodlight on the corner.
 range(g,o){const {e,r,p,l}=g,C=['#3d3f44','#55585e','#6d7076','#868990','#a0a3a8'],OLIVE=['#2b3122','#3c4430','#4e5840','#626d50'];
  e(56,15,64,5,SHADOW);
  // The concrete portal, set into the rock: a heavy lintel and two piers, stained and chipped.
  p([[-4,14],[-6,-80],[4,-92],[108,-92],[118,-80],[116,14]],EDGE);p([[-3,13],[-5,-79],[4.5,-90.5],[107.5,-90.5],[116.5,-79],[115,13]],C[1]);
  r(2,-86,108,16,C[2]);r(2,-86,108,1,C[3]);r(2,-71,108,1,C[0]);
  for(let i=0;i<14;i++){const x=hash(i,41)*104+4,y=-84+hash(i,42)*90,w=2+hash(i,43)*6;r(x,y,w,.5,hash(i,44)>.5?C[0]:C[3]);}
  for(const x of [6,98])r(x,-70,8,84,C[2]),r(x,-70,1,84,C[3]),r(x+7,-70,1,84,C[0]);
  r(14,-70,84,84,'#16171b');
  // The sign: a bullseye between stencil bars, on a plate bolted to the lintel.
  r(24,-84,64,12,EDGE);r(25,-83,62,10,'#c9c0aa');r(25,-83,62,1,'#e2dccb');for(const x of [28,72])r(x,-80,12,1.5,'#3a3630'),r(x,-77,9,1.5,'#3a3630');
  e(56,-78,6,4.5,EDGE);e(56,-78,5,3.6,'#a33b2e');e(56,-78,3.4,2.4,'#e8e0d1');e(56,-78,1.8,1.3,'#a33b2e');
  for(const x of [26,85])r(x,-82.5,1,1,M[1]),r(x,-75.5,1,1,M[1]);
  // Two steel doors; the right one stands open a hand's width and the range's light spills out.
  r(30,-62,52,74,EDGE);r(31,-61,24.5,72,OLIVE[2]);r(57,-61,24,72,OLIVE[1]);r(55.5,-61,1.5,72,GLASS);r(55.5,-61,.5,72,GLASS_HI);
  p([[56,12],[46,22],[64,22],[57,12]],'#ffb36a33');
  for(const [x,w,c] of [[31,24.5,OLIVE[3]],[57,24,OLIVE[2]]]){r(x+2,-58,w-4,22,c);r(x+2,-34,w-4,40,c);r(x+2,-58,w-4,.5,'#ffffff22');r(x+2,-36,w-4,1,OLIVE[0]);for(const y of [-56,-38,-32,4])for(const dx of [3,w-4])r(x+dx,y,1,1,OLIVE[0]);}
  r(50,-26,3,8,EDGE);r(50.5,-25.5,2,7,M[3]);r(59,-26,3,8,EDGE);r(59.5,-25.5,2,7,M[3]);
  for(let x=31;x<81;x+=6){p([[x,6],[x+3,6],[x+6,11],[x+3,11]],'#d9b23a');p([[x+3,6],[x+6,6],[x+9,11],[x+6,11]],EDGE);}r(31,5.5,50,.5,EDGE);
  // The lamp over the door is lit: this door is open to you.
  r(50,-68,12,5,EDGE);r(51,-67,10,3.5,M[2]);r(52,-64,8,3,EDGE);r(53,-63.5,6,2,EMBER_HI);r(54,-63.5,3,1,GLASS_HI);
  // Floodlight on the right corner, angled down at the doorstep.
  l(108,-88,114,-96,2,EDGE);r(110,-102,12,8,EDGE);r(111,-101,10,6,M[2]);r(112,-99,8,3,'#dfe7ea');r(113,-98.5,4,1,'#ffffff');
  // Sandbag walls either side of the doorstep.
  for(const [x0,n] of [[-10,3],[84,3]])for(let row=0;row<2;row++)for(let i=0;i<n-row;i++){const x=x0+i*13+row*6.5,y=6-row*7;e(x+6.5,y+1,8,5,EDGE);e(x+6.5,y,7,4.2,(i+row)%2?'#8a7f62':'#7a7057');r(x+2,y-2,6,.5,'#a39a7a');r(x+6,y-3.5,1,7,'#6b6250');}
  // A rifle rack on the left pier.
  r(-2,-46,14,30,EDGE);r(-1,-45,12,28,W[1]);r(-1,-45,12,1,W[3]);r(-1,-32,12,1.5,W[2]);for(const x of [1.5,5.5]){r(x,-44,2,24,EDGE);r(x+.5,-43,1,22,M[2]);r(x-.5,-28,3,6,EDGE);r(x,-27.5,2,5,W[2]);}
  // A paper target on a stand by the right pier, shot through.
  l(98,-4,102,-48,1.5,EDGE);l(110,-4,104,-48,1.5,EDGE);r(94,-52,20,26,EDGE);r(95,-51,18,24,'#d8d0bc');e(104,-40,6.5,7.5,'#3a3630');e(104,-40,4.5,5.5,'#d8d0bc');e(104,-40,2.5,3,'#a33b2e');
  for(const [x,y] of [[101,-44],[106,-37],[103,-40],[108,-46],[99,-33]])r(x,y,1,1,'#16171b');},
 // The garden: a fenced plot of tilled rows under its own lamp. Potatoes, staked beans, squash and seedlings, a scarecrow in a hard hat,
 // and the rain barrel, watering can and tools on the west side. The fence's north and sides are drawn first, the crops, then the south rail.
 farm(g,o){const {e,r,p,l}=g,LEAF=['#2c3b22','#3f5a2e','#567a3a','#6f9446','#8bb05a'],SOIL=['#2e2219','#3d2c20','#4d3a2a','#5d4834','#6e5840'];
  const X0=24,X1=174,Y0=4,Y1=82;
  // Tilled bed with its rows.
  r(X0,Y0,X1-X0,Y1-Y0,SOIL[1]);for(let y=Y0;y<Y1;y+=2)for(let x=X0;x<X1;x+=3)if(hash(x,y)>.82)r(x,y,1,.5,SOIL[hash(y,x)>.5?0:2]);
  const rows=[16,34,52,70];for(const y of rows){r(X0+4,y-3,X1-X0-8,7,EDGE);r(X0+4,y-2.5,X1-X0-8,6,SOIL[3]);r(X0+4,y-2.5,X1-X0-8,1,SOIL[4]);r(X0+4,y+3,X1-X0-8,.5,SOIL[0]);}
  // Fence: north rail (with the gap for the gate) and the two sides.
  const post=(x,y,h=15)=>{r(x-1.5,y-h,3.5,h+1.5,EDGE);r(x-1,y-h+.5,2.5,h,W[2]);r(x-1,y-h+.5,1,h,W[3]);r(x-1.5,y-h-.5,3.5,1,W[1]);};
  const rail=(x0,x1,y)=>{r(x0,y-11,x1-x0,2.5,EDGE);r(x0,y-10.5,x1-x0,1.5,W[3]);r(x0,y-5,x1-x0,2.5,EDGE);r(x0,y-4.5,x1-x0,1.5,W[2]);};
  rail(X0,88,Y0);rail(108,X1,Y0);for(const x of [X0,46,68,88,108,130,152,X1])post(x,Y0);
  // The little gate, swung open into the plot.
  l(88,Y0-2,96,Y0+10,2.5,EDGE);l(88,Y0-2,96,Y0+10,1.5,W[3]);l(88,Y0-8,96,Y0+4,2.5,EDGE);l(88,Y0-8,96,Y0+4,1.5,W[3]);
  for(const x of [X0,X1])for(let y=Y0+20;y<Y1;y+=20)post(x,y,13);for(const x of [X0,X1])r(x-1,Y0,2,Y1-Y0,W[1]),r(x-.5,Y0,1,Y1-Y0,W[2]);
  // Row 2, beans climbing stakes tied with twine, along the back where they shade nothing.
  for(let x=X0+12;x<X1-6;x+=14){const y=rows[0];l(x-3,y+1,x,y-22,1.5,EDGE);l(x+3,y+1,x,y-22,1.5,EDGE);l(x-3,y+1,x,y-22,.6,W[3]);l(x+3,y+1,x,y-22,.6,W[3]);r(x-1,y-21,2,1,'#c9c0aa');
   for(let k=0;k<5;k++){const ly=y-2-k*4,lx=x+(k%2?2.5:-2.5);e(lx,ly,2.6,1.8,EDGE);e(lx,ly-.3,2,1.3,LEAF[k%2?2:3]);}r(x+1,y-9,.5,3,'#9ab05a');r(x-1.5,y-14,.5,3,'#9ab05a');}
  // Row 1, potatoes: low leafy clumps with a few pale flowers.
  for(let x=X0+10;x<X1-26;x+=12){const y=rows[1];e(x,y-1,6,4.5,EDGE);e(x,y-1.5,5,3.8,LEAF[1]);e(x-1.5,y-2.5,3,2.2,LEAF[2]);e(x+1.5,y-3,2,1.5,LEAF[3]);if(hash(x,7)>.5)r(x,y-5,1,1,'#e8e0d1'),r(x+.5,y-4.5,.5,.5,'#d9b23a');}
  // The scarecrow stands at the east end of the potato row.
  {const x=156,y=rows[1]+4;r(x-1,y-40,2.5,42,EDGE);r(x-.5,y-39,1.5,40,W[2]);r(x-13,y-31,26,2.5,EDGE);r(x-12.5,y-30.5,25,1.5,W[3]);
   p([[x-9,y-30],[x+9,y-30],[x+7,y-12],[x-7,y-12]],EDGE);p([[x-8,y-29.5],[x+8,y-29.5],[x+6.3,y-12.5],[x-6.3,y-12.5]],'#4a4238');r(x-.5,y-29,1,16,'#3a342c');r(x-8,y-29.5,3,2,'#5a5246');r(x+5,y-29.5,3,2,'#5a5246');
   for(const s of [-1,1])l(x+s*12,y-30,x+s*15,y-25,1.5,'#b9a77d');r(x-8,y-30,16,2,'#7a3a2a');
   e(x,y-35,5,5,EDGE);e(x,y-35,4.2,4.2,'#b9a77d');r(x-2.5,y-36.5,1.5,.5,EDGE);r(x-2,y-37,.5,1.5,EDGE);r(x+1,y-36.5,1.5,.5,EDGE);r(x+1.5,y-37,.5,1.5,EDGE);r(x-1.5,y-33,3,.5,'#6b5d40');
   p([[x-6.5,y-38],[x-4.5,y-43],[x+4.5,y-43],[x+6.5,y-38]],EDGE);p([[x-5.5,y-38.5],[x-4,y-42.3],[x+4,y-42.3],[x+5.5,y-38.5]],'#c9a23a');r(x-7.5,y-38.5,15,1.5,EDGE);r(x-7,y-38,14,.5,'#e0bc4a');
   // A crow, unimpressed, on the left arm.
   e(x-11,y-34,2.5,2,'#111319');r(x-13.5,y-35,1.5,.5,'#5a5040');r(x-10,y-35,.5,.5,'#e8e0d1');r(x-11,y-32.5,.5,1.5,'#111319');}
  // Row 3, squash under broad leaves.
  for(let x=X0+12;x<X1-8;x+=18){const y=rows[2];for(const [dx,dy,s] of [[-4,-2,4.2],[4,-1.5,4],[0,-4,3.6]]){e(x+dx,y+dy,s+1,s*.75+1,EDGE);e(x+dx,y+dy-.4,s,s*.75,LEAF[2]);r(x+dx-s*.5,y+dy-.5,s,.5,LEAF[1]);}
   if(hash(x,9)>.35){const sx=x+(hash(x,10)>.5?5:-5);e(sx,y+2.5,4,3,EDGE);e(sx,y+2,3.2,2.3,'#b8743a');e(sx-1,y+1.3,1.4,1,'#d0904c');r(sx-.25,y-1,.5,1.5,LEAF[0]);}}
  // Row 4, seedlings, and the east end freshly turned and waiting.
  for(let x=X0+10;x<X1-46;x+=8){const y=rows[3];r(x,y-3,.5,3,LEAF[3]);e(x-1.2,y-3.5,1.5,.8,LEAF[4]);e(x+1.6,y-4,1.5,.8,LEAF[3]);}
  for(let x=X1-42;x<X1-8;x+=4)r(x,rows[3]-1,2.5,1,SOIL[0]);l(X1-38,rows[3]+5,X1-14,rows[3]-6,1.5,EDGE);l(X1-38,rows[3]+5,X1-14,rows[3]-6,.8,W[3]);r(X1-16,rows[3]-9,6,3,EDGE);r(X1-15.5,rows[3]-8.5,5,2,M[2]);
  // The south rail, in front of everything.
  rail(X0,X1,Y1);for(const x of [X0,46,68,90,112,134,156,X1])post(x,Y1);
  // West side, outside the fence: rain barrel with a tap, the watering can, and a rake leaning on the fence.
  e(11,62,11,3.5,SHADOW);r(1,30,20,30,EDGE);r(2,31,18,28,W[2]);e(11,31,9.5,3,EDGE);e(11,31,8.5,2.4,'#24414c');r(5,33,10,.5,'#6c8f99');for(const y of [38,52])r(1.5,y,19,2,M[1]);r(2,31,4,28,W[3]);r(17,31,3,28,W[1]);
  r(19,48,4,2,EDGE);r(20,48.5,2.5,1,M[3]);r(21,50,.5,2,'#6c8f99');
  e(9,77,7,2.5,SHADOW);r(4,68,10,9,EDGE);r(5,69,8,7,M[2]);r(5,69,8,1,M[3]);l(13,71,19,66,1.5,EDGE);l(13,71,19,66,.7,M[2]);r(18,64.5,3,2.5,EDGE);r(5.5,66,7,1.5,EDGE);
  l(21,27,15,2,2,EDGE);l(21,27,15,2,1,W[3]);r(10,0,10,2.5,EDGE);r(10.5,.5,9,1.5,M[2]);for(let i=0;i<5;i++)r(10.5+i*2,2.5,1,2.5,EDGE),r(10.75+i*2,2.5,.5,2,M[3]);},
 laundry(g,o){const {e,r,l,p}=g;e(50,6,52,4,SHADOW);for(const x of [0,94]){r(x,-62,5,70,EDGE);r(x+1,-61,3,68,W[2]);r(x+1,-61,1,68,W[3]);}
  const sag=x=>-58+Math.sin(x/96*Math.PI)*7;for(let x=4;x<94;x+=1)r(x,sag(x),1,.5,'#a39a84');
  const cloth=(x,w,h,col,hi)=>{const y=sag(x+w/2)+.5;p([[x,y],[x+w,y],[x+w-.5,y+h],[x+.5,y+h]],EDGE);r(x+.5,y+.5,w-1,h-1,col);r(x+.5,y+.5,w-1,1.5,hi);r(x+1,y-1,1,2,'#c9c0aa');r(x+w-2,y-1,1,2,'#c9c0aa');};
  cloth(10,16,18,'#5f6f80','#73859a');r(14,-30,8,.5,'#4c5a6a');cloth(32,12,24,'#5a4a3c','#6e5c4b');r(37.5,-36,1,13,'#4a3c30');cloth(50,18,14,'#a39a84','#bdb39b');cloth(74,6,9,'#7a3a2a','#8f4a38');cloth(82,6,9,'#7a3a2a','#8f4a38');},
 sacks(g,o){const {e,r,p}=g;e(15,20,17,4,SHADOW);for(const [x,y,col] of [[2,-6,'#8a7a5a'],[14,-4,'#a08f6a'],[7,-16,'#968563']]){p([[x,y+18],[x+1,y+4],[x+3,y],[x+11,y],[x+13,y+4],[x+14,y+18]],EDGE);p([[x+1,y+17],[x+2,y+4.5],[x+4,y+1],[x+10,y+1],[x+12,y+4.5],[x+13,y+17]],col);r(x+5,y-2,4,3,EDGE);r(x+5.5,y-1.5,3,2,'#6b5d40');r(x+3,y+8,8,.5,'#6b5d40');r(x+3,y+12,8,.5,'#6b5d40');r(x+2,y+5,1,10,'#ffffff18');}},
 tidepool(g,o){const {e,r}=g,w=o.w,h=o.h;e(w/2,h/2,w/2+2,h/2+2,R[1]);e(w/2,h/2-.5,w/2,h/2,R[3]);e(w/2,h/2,w/2-3,h/2-2.5,'#1a3a4b');e(w/2-2,h/2-1,w/2-7,h/2-5,'#22485a');r(w*.3,h*.3,4,.5,'#7fa3ad');r(w*.55,h*.55,3,.5,'#5d8693');
  r(w*.62,h*.35,1.5,1.5,'#c46a4a');r(w*.62-1.5,h*.35+.5,4.5,.5,'#c46a4a');r(w*.3,h*.6,1.5,1,'#6b8a5a');r(w*.3+2,h*.62,1,1,'#7f9f6a');for(let i=0;i<6;i++){const a=i/6*6.28;r(w/2+Math.cos(a)*(w/2+1),h/2+Math.sin(a)*(h/2+1)-1,2,1,R[4]);}},
 lantern(g,o){const {e,r}=g;e(5,6,8,3,SHADOW);e(5,5,5,2.5,R[2]);r(3.5,-70,3,76,EDGE);r(4,-69,2,74,W[2]);r(4,-69,.5,74,W[3]);r(4,-71,10,2,EDGE);r(4,-70.5,9,1,W[2]);r(11.5,-69,.5,3,M[1]);
  r(8.5,-66.5,7,1.5,M[1]);r(9,-65,6,9,EDGE);r(10,-64,4,7,GLASS);r(11,-63,2,5,GLASS_HI);r(9,-56.5,6,1,M[1]);},
 rock(g,o){const {e,p,r}=g,w=o.w,h=o.h,z=o.z;e(w/2+2,h-1,w/2+3,h/3,SHADOW);const pts=[[1,h-2],[2,h-z*.5-4],[w*.3,-z+h*.4],[w*.68,-z+h*.3],[w-2,h-z*.55],[w,h-3],[w*.6,h],[w*.2,h]];
  p(pts,EDGE);p(pts.map(([x,y])=>[x+(x<w/2?1:-1),y+(y<h/2?1:-1)]),R[2]);p([[3,h-z*.5-3],[w*.3,-z+h*.4+1],[w*.68,-z+h*.3+1],[w-3,h-z*.55],[w*.6,h-z*.3],[w*.2,h-z*.25]],R[3]);r(w*.3,-z+h*.4+1.5,w*.3,.5,R[4]);r(w*.5,h-z*.3,.5,z*.4,R[1]);},
 // Split logs stacked between two stakes, cut ends out, and a chopping stump with the axe left in it.
 woodpile(g,o){const {e,r,l,p}=g;e(30,18,32,5,SHADOW);for(const x of [1,37]){r(x,-27,4,44,EDGE);r(x+1,-26,2,42,W[2]);r(x+1,-26,.5,42,W[3]);}
  const rows=[[13,[8,16,24,32]],[6,[12,20,28]],[-1,[8,16,24,32]],[-8,[12,20,28]],[-15,[16,24]]];
  for(const [y,xs] of rows)for(const x of xs){e(x,y+.5,4.6,4,EDGE);e(x,y,3.8,3.2,hash(x,y)>.5?W[3]:'#9a7c5a');e(x,y,2.2,1.8,W[4]);r(x-.25,y-.25,.5,.5,W[1]);r(x-3,y+2.2,4,.5,W[1]);}
  e(51,15,7,3.4,EDGE);r(44.5,7,13,8,EDGE);r(45.5,8,11,7,W[1]);r(46,8,1.5,7,W[2]);e(51,7.5,6,2.6,EDGE);e(51,7.3,5.2,2,'#9a7c5a');e(51,7.3,3,1.1,W[4]);
  l(50,7,57,-6,2,EDGE);l(50,7,57,-6,1,W[3]);p([[54,-8],[60,-9],[61,-4],[56,-2]],EDGE);p([[55,-7.5],[59.5,-8],[60,-4.5],[56.5,-3]],M[2]);r(55.5,-7.5,4,.5,M[3]);
  for(let i=0;i<7;i++)r(42+hash(i,3)*18,14+hash(i,4)*5,1.5,.5,'#a88a66');},
 // A blue drum under the drip by the medic tent, with a tarp funnel. Clean water is scarce.
 drum(g,o){const {e,r,l,p}=g;e(14,16,16,5,SHADOW);r(1,-27,24,40,EDGE);e(13,13,12,4,EDGE);r(2,-27,22,40,'#34495a');e(13,13,11,3.2,'#34495a');r(2,-27,5,40,'#435b6e');r(19,-27,5,40,'#2a3a48');
  for(const y of [-18,-2,9])r(1.5,y,23,1.5,'#2a3a48');e(13,-27,12,4.5,EDGE);e(13,-27,11,3.6,'#435b6e');e(13,-27,8,2.5,'#1c2a35');e(13,-27.3,6,1.6,'#3b5a66');r(10,-28,4,.5,'#8fb0b8');
  p([[4,-38],[22,-38],[15,-29],[11,-29]],EDGE);p([[5.5,-37.5],[20.5,-37.5],[14.5,-30],[11.5,-30]],'#5d6950');r(6,-37.5,14,1,'#6f7d5f');l(4,-38,-2,-44,.5,'#5b5446');l(22,-38,28,-44,.5,'#5b5446');
  e(32,12,5,2.5,EDGE);r(27.5,4,9,8,EDGE);r(28.5,5,7,7,M[2]);e(32,5,4,1.5,EDGE);e(32,5,3.2,1,'#1c2a35');r(28.5,5,1.5,7,M[3]);l(28,5,32,1,.5,M[3]);l(32,1,36,5,.5,M[3]);},
 // A heap of net with cork floats and a faded buoy, by the pier steps.
 nets(g,o){const {e,r,l,p}=g,w=o.w;e(w/2,11,w/2+3,5,SHADOW);const lumps=[[11,7,10,5],[23,5,12,6.5],[34,8,9,5]];
  for(const [x,y,a,b] of lumps)e(x,y+1,a+1,b+1,EDGE);for(const [x,y,a,b] of lumps){e(x,y,a,b,'#4a4538');e(x-1,y-1.5,a*.75,b*.55,'#5d5747');}
  for(let i=0;i<26;i++){const x=3+hash(i,1)*(w-6),y=1+hash(i,2)*11,s=hash(i,3)>.5?1:-1;l(x,y,x+2.5,y+2.5*s,.5,'#7a735f');}
  for(const [x,y] of [[6,8],[17,2],[29,3],[38,10],[24,11]]){e(x,y,2.4,1.6,EDGE);e(x,y-.2,1.8,1.1,'#b8a27a');r(x-1,y-.8,1,.5,'#d4c39a');}
  l(-6,14,40,-4,2.5,EDGE);l(-6,14,40,-4,1.4,W[3]);p([[36,-2],[46,-7],[48,-4],[39,1]],EDGE);p([[37,-2],[45.5,-6],[47,-4.2],[39,0]],W[3]);
  e(w-3,4,5,4.4,EDGE);e(w-3,3.6,4.2,3.6,'#8a4a3e');r(w-7,2.5,8.4,1.6,'#c4bca8');r(w-5.5,.5,2,1,'#b06a5a');},
 // A stack of salvage by Hollis's cart: crates, an ammo can and a coil of hose.
 salvage(g,o){const {e,r,l}=g;e(22,16,24,5,SHADOW);box(g,26,12,18,'#5a4a38','#3d3027');r(.5,-17.5,25,1,'#76614a');for(const x of [8,17])r(x,-5.5,1,17,'#33281f');
  r(4,-24,16,8,EDGE);r(5,-23,14,7,'#5a4a38');r(5,-23,14,3,'#76614a');r(5,-20,14,.5,'#33281f');r(10,-18,4,2,M[1]);
  r(28,-2,14,14,EDGE);r(29,-1,12,5,'#5f6844');r(29,4,12,7,'#4b5236');r(33,-3,4,2,EDGE);r(33.5,-2.5,3,1,M[2]);r(30,7,10,.5,'#3a3f2a');
  e(36,15,7,3,EDGE);e(36,14.5,6,2.4,'#2a2b2f');e(36,14.5,3.6,1.3,'#3f4247');e(36,14.5,2,.6,'#2a2b2f');l(30,14,24,17,1,'#2a2b2f');},
 // The way deeper in: a mine frame in a rock outcrop, choked with fallen stone. Green things push through the gaps.
 passage(g,o){const {e,r,l,p}=g,h=o.h;e(40,h,50,7,SHADOW);
  const rock=[[-12,h+2],[-14,h-24],[-8,-22],[6,-46],[26,-58],[52,-58],[72,-46],[86,-22],[90,h-20],[88,h+2]];
  p(rock,EDGE);p(rock.map(([x,y])=>[x+(x<40?1.2:-1.2),y+1.2]),R[1]);p([[-6,h-26],[-2,-20],[10,-42],[28,-54],[50,-54],[66,-44],[78,-24],[60,-30],[40,-38],[20,-32]],R[2]);
  p([[10,-42],[28,-54],[50,-54],[40,-46],[24,-44]],R[3]);r(26,-54,18,.5,R[4]);r(12,-40,8,.5,R[4]);for(const [x,y,w] of [[0,-6,10],[70,-12,12],[64,6,10],[-8,10,8]])r(x,y,w,.5,R[0]);
  for(let i=0;i<8;i++){const x=8+hash(i,7)*64,y=-50+hash(i,8)*12;e(x,y,2.5+hash(i,9)*2,1.2,MOSS_HEX[hash(i,10)>.5?1:0]);}
  // The opening, its timbers and the rubble filling it.
  p([[18,h],[19,-18],[24,-26],[56,-26],[61,-18],[62,h]],'#0b0c10');
  for(const x of [16,58]){r(x,-24,6,h+25,EDGE);r(x+1,-23,4,h+23,W[1]);r(x+1,-23,1.2,h+23,W[2]);}
  p([[12,-31],[68,-27],[68,-21],[12,-25]],EDGE);p([[13,-30],[67,-26],[67,-22],[13,-26]],W[2]);r(14,-29.5,52,.5,W[3]);p([[36,-28.5],[40,-28],[38,-23],[35,-24]],EDGE);
  const stones=[[24,h-2,8],[36,h-1,9],[50,h-3,8],[28,h-11,7],[42,h-12,8],[54,h-13,6],[32,h-21,6],[46,h-22,6],[38,h-30,5],[26,h-28,4]];
  for(const [x,y,s] of stones){e(x,y+1,s+1,s*.7+1,EDGE);e(x,y,s,s*.7,R[hash(x,y)>.5?2:3]);r(x-s*.5,y-s*.45,s*.6,.5,R[4]);}
  l(20,h-36,60,h-14,3,EDGE);l(20,h-36,60,h-14,1.8,W[1]);r(30,-12,1,4,M[1]);
  // Sprouts through the rubble: the only green thing in camp that is not moss.
  for(const [x,y] of [[30,h-26],[48,h-31],[41,h-17]]){l(x,y,x,y-5,.8,'#4f6b34');e(x-1.6,y-5,1.8,1,'#6f9a45');e(x+1.6,y-6,1.8,1,'#86b356');}
  // A pick leans on the frame for whoever clears it someday.
  l(66,h+1,74,h-24,1.5,EDGE);l(66,h+1,74,h-24,.8,W[3]);p([[66,-26],[80,-22],[81,-20],[74,-21],[67,-24]],EDGE);r(68,-24.5,10,1,M[3]);},
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
export const ICONS=['hammer','cross','bowl','lantern','chevron','target'];
export function iconArt(c){c.save();c.scale(2,2);const {r,p,l,e}=painter(c);
 ICONS.forEach((kind,i)=>{c.save();c.translate(i*ICON.w,0);
  if(kind==='chevron'){p([[3,6],[17,6],[10,15]],EDGE);p([[5,7.5],[15,7.5],[10,13]],EMBER);p([[7,7.5],[13,7.5],[10,10.5]],EMBER_HI);c.restore();return;}
  r(2,1,16,16,EMBER);r(3,2,14,14,'#1c1a17');p([[7,17],[13,17],[10,21]],EMBER);p([[8.5,17],[11.5,17],[10,19.5]],'#1c1a17');
  if(kind==='hammer'){l(6,14,13,6,2,BONE);r(9,3.5,8,4,BONE);r(9,6.5,8,1,'#a2998a');}
  if(kind==='cross'){r(8.5,4,3,10,TEAL_HI);r(5,7.5,10,3,TEAL_HI);}
  if(kind==='bowl'){p([[4.5,9],[15.5,9],[13,13.5],[7,13.5]],BONE);r(4.5,9,11,1,'#a2998a');l(8,8,7,4,.8,'#a2998a');l(11,8,12,4,.8,'#a2998a');}
  if(kind==='target'){e(10,9,5.5,5.5,BONE);e(10,9,4.5,4.5,'#1c1a17');e(10,9,2.5,2.5,BONE);e(10,9,1.5,1.5,EMBER_HI);r(9.5,2,1,3,BONE);r(9.5,13,1,3,BONE);r(3,8.5,3,1,BONE);r(14,8.5,3,1,BONE);}
  if(kind==='lantern'){r(9.5,3,1,2,BONE);r(7,5,6,1,BONE);r(7,6,6,7,BONE);r(8,7,4,5,GLASS);r(9,8,2,3,GLASS_HI);r(7,13,6,1,BONE);}
  c.restore();});c.restore();}
// Fish for the basket, the catch card and the spit. Facing right, about 26 x 12 units, centered on (0, 0).
// cook (0..1) browns the fish; past the burn mark it chars.
const mix=(a,b,t)=>{const A=rgb(a),B=rgb(b);return '#'+A.map((v,i)=>Math.round(v+(B[i]-v)*t).toString(16).padStart(2,'0')).join('');};
export const FISH_COLORS={perch:['#8a7a55','#b9a77d','#d8cfb4','#6b5d40','#9a8a60'],mackerel:['#2f5a5f','#5f8a8a','#c9d0cc','#1f3d40','#4a7072'],cod:['#6b4030','#8a5a43','#c9a98a','#5a3424','#7a4a35'],moonfin:['#8aa0bf','#b9c8dc','#e6eef5','#7088a8','#8fd3ff']};
export function fishArt(c,id,cook=null,scale=1){const {p,r,e}=painter(c);let [back,body,belly,mark,fin]=FISH_COLORS[id]||FISH_COLORS.perch;
 if(cook!==null){const t=cook<.55?cook/.55*.55:cook<.84?.55+(cook-.55)/.29*.45:1,burn=Math.max(0,(cook-.84)/.16);const tone=(col)=>mix(mix(col,'#c08a46',Math.min(1,t)),'#2a2220',Math.min(1,burn));back=tone(back);body=tone(body);belly=tone(belly);mark=tone(mark);fin=tone(fin);}
 const s=scale,P=pts=>pts.map(([x,y])=>[x*s,y*s]);
 p(P([[-13,0],[-9,-4.5],[0,-6],[8,-4.5],[13,-1],[13,1.5],[8,5],[0,6],[-9,4.5]]),EDGE);p(P([[-13,0],[-18,-6],[-16.5,0],[-18,6]]),EDGE);
 p(P([[-12,0],[-9,-3.8],[0,-5],[8,-3.8],[12,-.5],[12,1],[8,4],[0,5],[-9,3.8]]),body);p(P([[-12,0],[-9,-3.8],[0,-5],[8,-3.8],[11,-1.5],[0,-2.2],[-9,-1.5]]),back);p(P([[-9,2],[0,2.8],[8,2.5],[11,1.2],[8,4],[0,5],[-9,3.8]]),belly);
 p(P([[-12.5,0],[-17,-5],[-15.5,0],[-17,5]]),fin);p(P([[-4,-5],[2,-8.5],[5,-5]]),EDGE);p(P([[-3,-5],[2,-7.5],[4,-5]]),fin);
 if(id==='perch')for(const x of [-6,-2,2,6])r(x*s,-4*s,1*s,6*s,mark);
 if(id==='mackerel')for(let x=-8;x<8;x+=3)r(x*s,(-4+(x%2?1:0))*s,2*s,1*s,mark);
 if(id==='cod')for(const [x,y] of [[-6,-2],[-2,-3],[3,-1.5],[6,-3],[-4,1]])r(x*s,y*s,1.5*s,1*s,mark);
 if(id==='moonfin'&&cook===null){r(-4*s,-1*s,12*s,.5*s,'#d9f3ff');p(P([[-12.5,0],[-17,-5],[-15.5,0],[-17,5]]),'#8fd3ffcc');}
 r(8*s,-2*s,2*s,2*s,'#14161a');r(8.5*s,-2*s,.6*s,.6*s,'#e8e0d1');r(10.5*s,1*s,2*s,.5*s,mark);}
