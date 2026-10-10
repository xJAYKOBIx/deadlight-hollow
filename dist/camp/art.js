import {CAMP,SHORE,AMBIENT,LIGHTS,PROPS,GARDEN} from './data.js';
const prop=id=>PROPS.find(o=>o.id===id);
const inGarden=(x,y)=>x>GARDEN.x&&x<GARDEN.x+GARDEN.w&&y>GARDEN.y&&y<GARDEN.y+GARDEN.h;
// Camp art follows the character painter: world units, edges snapped to a half-unit grid, drawn on 2x canvases.
// Readability rules: people have the darkest outlines and strongest color; scenery is muted and low contrast;
// solid props get a softer edge; things you own or can use carry ember orange; markers sit above the lighting.
import {painter,snap,hash2 as hash,smooth,fbm,bayer,rgb} from '../mc/assets/core/paint.js';
import {EDGE,SHADOW,EMBER,EMBER_HI,BONE,BED_COLORS,W,CV,M,R,RUST,GLASS,GLASS_HI,TEAL,TEAL_HI,box,PROP_PAD,propArt,FLAME,flameArt,ICON,ICONS,iconArt,FISH_COLORS,fishArt} from '../mc/assets/props/camp.js';
export {painter,hash,EDGE,SHADOW,EMBER,EMBER_HI,BONE,BED_COLORS,PROP_PAD,propArt,FLAME,flameArt,ICON,ICONS,iconArt,FISH_COLORS,fishArt};
// Deterministic noise, so the camp paints the same every time (the Master Creator's core/paint.js).
// The cave's shape.
export const wallBottom=x=>210+6*Math.sin(x*.031)+4*Math.sin(x*.083+1);
export const wallTop=x=>72+12*Math.sin(x*.021)+6*Math.sin(x*.07);
export const westEdge=y=>86+7*Math.sin(y*.045)+3*Math.sin(y*.13);
export const southEdge=x=>CAMP.h-74+8*Math.sin(x*.04)+4*Math.sin(x*.11);
export function shoreX(y){if(y<=SHORE[0][1])return SHORE[0][0];for(let i=1;i<SHORE.length;i++){const [x0,y0]=SHORE[i-1],[x1,y1]=SHORE[i];if(y<=y1){const t=(y-y0)/(y1-y0),s=t*t*(3-2*t);return x0+(x1-x0)*(t*.5+s*.5)+3*Math.sin(y*.09);}}return SHORE.at(-1)[0];}
// The cave mouth opens to the night sky in the north-east corner.
const MOUTH_X=CAMP.w-160,MOON_X=MOUTH_X-62;
export const inMouth=(x,y)=>((x-MOUTH_X)/300)**2+((y-40)/200)**2<1;
const inMouthRim=(x,y)=>((x-MOUTH_X)/306)**2+((y-40)/204)**2<1;
const HORIZON=118;
// Worn paths from the fire to every station help players read where to go.
const PATHS=[[[800,660],[810,330]],[[780,630],[520,520],[386,262]],[[520,520],[170,270]],[[830,630],[1150,420]],[[830,670],[1000,800]],[[840,650],[1400,486]],[[770,650],[330,620]],[[330,620],[230,560]],[[770,680],[560,840],[300,1040]],[[560,840],[385,1090],[385,1240],[860,1236]],[[640,1236],[640,1150]],[[1000,800],[1090,900]]];
function pathDist(x,y){let best=1e9;for(const line of PATHS)for(let i=1;i<line.length;i++){const [ax,ay]=line[i-1],[bx,by]=line[i],dx=bx-ax,dy=by-ay,t=Math.max(0,Math.min(1,((x-ax)*dx+(y-ay)*dy)/(dx*dx+dy*dy)));best=Math.min(best,Math.hypot(x-ax-dx*t,y-ay-dy*t));}return best+5*Math.sin(x*.06+y*.04)+3*Math.sin(y*.11);}
const SAND=['#615343','#6e5f4b','#796953','#84735b','#8f7e64'].map(rgb),PATH=['#7d715b','#857862','#8c806a'].map(rgb),WET=['#4c483f','#545046','#5c574b'].map(rgb),FOAM=rgb('#9fb0ab');
const MOSS_HEX=['#34422c','#435437','#566a40'],MOSS=MOSS_HEX.map(rgb),EARTH=['#4a3d30','#524436','#5a4b3b','#64543f'].map(rgb),STRAW=rgb('#9a8a5c');
// Where the ground is worn, per kind: [x, y, rx, ry] from the prop's corner.
const WORN={tent:o=>[o.w/2,o.h+6,o.w/2+4,12],logH:o=>[o.w/2,o.h/2+4,o.w/2+14,15],table:o=>[o.w/2,o.h/2,o.w/2+16,o.h/2+14],forge:o=>[o.w/2,o.h+4,o.w/2+18,16],range:o=>[o.w/2,o.h+6,o.w/2+10,14],
 pot:o=>[o.w/2,o.h/2+4,o.w/2+12,12],board:o=>[o.w/2,o.h+10,o.w/2+8,14],medtent:o=>[o.w/2,o.h+8,o.w/2-20,14],rack:o=>[o.w/2,o.h+4,o.w/2+6,10],woodpile:o=>[o.w/2,o.h/2,o.w/2+10,10],
 cart:o=>[o.w/2,o.h/2,o.w/2+8,12],shed:o=>[o.w/2,o.h+6,o.w/2,12],generator:o=>[o.w/2,o.h/2,o.w/2+10,10],shelter:o=>[o.w/2,o.h+4,o.w/2-10,14]};
const NO_AO=new Set(['fence','plot','tidepool','pier','boat','gencords','drum','gate','laundry','trellis']);
const ROOTS=[[204,26],[520,40],[652,18],[900,34],[1060,22],[1230,30],[1370,26]];
// Where water drips from the ceiling (the scene animates the drops) and where the glowing fungus grows.
const DRUM_X=prop('drum').x+13;
export const DRIPS=[...[504,872,1094].map(x=>({x,top:wallTop(x)+8,y:wallBottom(x)+7})),{x:DRUM_X,top:wallTop(DRUM_X)+8,y:224,into:true}];
export const FUNGI=[[520,wallBottom(520)-1],[1062,wallBottom(1062)-1],[DRUM_X-5,wallBottom(DRUM_X-5)],[80,326],[84,1000],[134,792],[88,1330]];
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
 // Inside the garden fence the sand gives way to packed, darker earth with bits of straw.
 if(inGarden(x,y)){const v=n*.6+g*.4;if(g>.985)return STRAW;return EARTH[v>.78?3:v>.5?2:v>.25?1:0];}
 const pd=pathDist(x,y);if(pd<7+n*7){const v=g*.6+n*.4;return v>.8?PATH[1]:v>.3?PATH[0]:SAND[2];}
 const v=n*.48+smooth(x/7,y/5)*.27+g*.25,i=v>.8?4:v>.62?3:v>.42?2:v>.24?1:0;
 // Wind ripples: thin lighter ridges across the open sand, broken up by the noise.
 if(pd>18&&Math.sin(x*.23+y*.61+n*9)>.94&&g>.3)return SAND[Math.min(4,i+1)];return SAND[i];}
// The whole floor in one canvas: sand, rock walls, the inlet and a glimpse of night sky through the cave mouth.
export function groundArt(c){
 const w=CAMP.w,h=CAMP.h,img=c.createImageData(w*2,h*2),d=img.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const col=groundColor(x,y);
  for(let k=0;k<4;k++){const i=((y*2+(k>>1))*w*2+x*2+(k&1))*4;d[i]=col[0];d[i+1]=col[1];d[i+2]=col[2];d[i+3]=255;}}
 c.putImageData(img,0,0);c.save();c.scale(2,2);const g=painter(c),{r,e,p,l}=g;
 // Moon over the sea, its broken reflection on the water.
 e(MOON_X,54,11,11,'#c9cbbd');e(MOON_X-2,52,9,9,'#dcdccc');r(MOON_X+2,50,3,2,'#c2c3b4');r(MOON_X-5,57,2,2,'#c7c8b9');
 for(let i=0;i<14;i++){const y=HORIZON+6+i*6,wd=24-i*1.2+hash(i,3)*8;if(inMouth(MOON_X,y)||y<200)r(MOON_X-wd/2+hash(i,9)*6,y,wd,1,i<5?'#8b98a6':'#5d7484');}
 // Stalactites hang from the ceiling edge; damp streaks run down the wall.
 for(let x=10;x<CAMP.w-20;x+=14+Math.floor(hash(x,1)*22)){if(inMouth(x,wallTop(x)+6))continue;const y=wallTop(x),len=10+hash(x,2)*26,wd=4+hash(x,3)*6;p([[x-wd/2,y-2],[x+wd/2,y-2],[x+1,y+len]],R[0]);p([[x-wd/2+1,y-1],[x,y-1],[x+.5,y+len-3]],R[1]);}
 const EAST=SHORE[1][0]-60;
 for(let x=20;x<EAST;x+=30+Math.floor(hash(x,4)*40)){const y=wallTop(x)+12+hash(x,5)*20,len=wallBottom(x)-y-12;r(x,y,1,len,'#2f3b3d');r(x+1,y+len*.3,.5,len*.5,'#3d4a4a');if(hash(x,6)>.5)r(x,y+len-2,1,1,'#8fa6a6');}
 for(let i=0;i<100;i++){const x=hash(i,11)*EAST,y=wallTop(x)+20+hash(i,12)*(wallBottom(x)-wallTop(x)-34);r(x,y,2+hash(i,13)*6,.5,R[1]);r(x+1,y+.5,1+hash(i,13)*4,.5,R[4]);}
 // Roots push through the ceiling and hang down the face.
 for(const [x,len] of ROOTS){let px=x,py=wallTop(x)-6;for(let k=0;k<len;k+=3){const nx=px+Math.sin(k*.4+x)*1.2,ny=py+3;l(px,py,nx,ny,k<len*.5?2:1.5,'#241d18');l(px,py,nx,ny,k<len*.5?1:.5,'#5a4836');px=nx;py=ny;
  if(hash(x,k)>.8){const s=hash(k,x)>.5?1:-1;l(px,py,px+s*4,py+5,1,'#4a3a2c');}}}
 // Drips: a wet streak down the wall into a little puddle at its foot.
 for(const d of DRIPS){r(d.x-.5,d.top,1.5,(d.into?wallBottom(d.x):d.y)-d.top-6,'#2b3639');if(d.into)continue;r(d.x+1,d.top+8,.5,(d.y-d.top)*.6,'#3d4a4a');e(d.x,d.y,9,3,'#2b3233');e(d.x,d.y-.5,7.5,2.2,'#3b4a52');r(d.x-4,d.y-1.5,4,.5,'#6f8790');r(d.x+2,d.y,2,.5,'#55707a');}
 // Moss at the foot of the walls, thicker where water runs.
 for(let i=0;i<70;i++){const x=40+hash(i,141)*(EAST-20),y=wallBottom(x)-2-hash(i,142)*5,s=2+hash(i,143)*4;if(inMouth(x,y))continue;e(x,y,s+1.5,s*.55+.5,MOSS_HEX[0]);e(x-.5,y-.5,s,s*.4,MOSS_HEX[1]);r(x-s*.6,y-s*.4,s*.7,.5,MOSS_HEX[2]);}
 for(const d of DRIPS.filter(d=>!d.into))for(let k=0;k<4;k++){const x=d.x-8+k*5+hash(k,d.x)*3,y=d.y-5-hash(d.x,k)*3;e(x,y,3,1.6,MOSS_HEX[1]);r(x-1.5,y-1,2.5,.5,MOSS_HEX[2]);}
 for(let i=0;i<46;i++){const y=240+hash(i,151)*(CAMP.h-340),x=westEdge(y)-3-hash(i,152)*14,s=2+hash(i,153)*3;e(x,y,s+1,s*.6+.5,MOSS_HEX[0]);e(x,y-.5,s,s*.45,MOSS_HEX[1]);}
 // Pale glowing fungus in a few damp corners. Their glow is drawn above the lighting.
 for(const [fx,fy] of FUNGI)for(let k=0;k<5;k++){const x=fx+(hash(k,fx)-.5)*9,y=fy+(hash(fy,k)-.5)*4,s=.8+hash(k,fy)*1.3;r(x-.25,y,.5,s+1,'#8a8f6e');e(x,y,s+.5,s*.6+.3,'#3d4232');e(x,y-.3,s,s*.5,'#c9d68a');r(x-s*.5,y-.6,s*.6,.5,'#eef5c0');}
 // Tunnel behind the barred gate, cut into the back wall.
 const gx=prop('gate').x+52,gy=wallBottom(gx);p([[gx-50,gy],[gx-46,gy-60],[gx-34,gy-82],[gx,gy-92],[gx+34,gy-82],[gx+46,gy-60],[gx+50,gy]],R[0]);p([[gx-44,gy],[gx-40,gy-58],[gx-30,gy-77],[gx,gy-86],[gx+30,gy-77],[gx+40,gy-58],[gx+44,gy]],'#0b0c10');
 r(gx-50,gy-1,100,2,R[0]);
 // Rubble along the foot of the walls.
 for(let i=0;i<110;i++){const x=40+hash(i,21)*EAST,y=wallBottom(x)+2+hash(i,22)*8,s=1.5+hash(i,23)*3;e(x,y,s+.5,s*.7+.5,R[0]);e(x,y-.5,s,s*.6,R[2]);r(x-s*.5,y-s*.5,s*.6,.5,R[3]);}
 for(let i=0;i<70;i++){const y=230+hash(i,31)*(CAMP.h-320),x=westEdge(y)+3+hash(i,32)*6,s=1.5+hash(i,33)*2.5;e(x,y,s+.5,s*.7+.5,R[0]);e(x,y-.5,s,s*.6,R[2]);}
 // v0.28 lived-in ground. Packed, darker earth where people stand, sit and work, and a soft dark pool under everything standing on the sand.
 for(const o of PROPS){const wk=WORN[o.kind];if(wk){const [ox,oy,rx,ry]=wk(o);for(let k=0;k<4;k++)e(o.x+ox,o.y+oy,rx*(1-k*.2),ry*(1-k*.2),'#2a20171a');}
  if(!o.flat&&!NO_AO.has(o.kind)&&o.y>232){const cx=o.x+o.w/2,cy=o.y+o.h-1;e(cx,cy,o.w/2+7,Math.max(4,o.h/2+3),'#120e0a14');e(cx,cy,o.w/2+3,Math.max(3,o.h/2+1),'#120e0a1a');}}
 // Scraps of camp life near where people work: cans, rope, offcuts, paper and bottle caps.
 const BUSY=PROPS.filter(o=>WORN[o.kind]);for(let i=0;i<140;i++){const o=BUSY[Math.floor(hash(i,301)*BUSY.length)],a=hash(i,302)*6.28,d=o.w/2+8+hash(i,303)*34,x=o.x+o.w/2+Math.cos(a)*d,y=o.y+o.h/2+Math.sin(a)*d*.6,t=hash(i,304);
  if(x>shoreX(y)-6||inGarden(x,y)||y<wallBottom(x)+4)continue;
  if(t<.22){r(x-.5,y,2.5,2,EDGE);r(x,y,1.5,1.5,'#8a8f94');r(x,y,1.5,.5,'#b9bec2');}
  else if(t<.38){r(x-.5,y-.5,7,2,EDGE);r(x,y,6,1,W[2]);r(x,y,6,.5,W[3]);}
  else if(t<.52){r(x,y,2.5,1.5,'#c9c0aa');r(x+.5,y+.5,1.5,.5,'#a39a84');}
  else if(t<.64){e(x,y,3,1.6,'#3a2f22');e(x,y,2,1,'#8a7a55');e(x,y,1,.5,'#3a2f22');}
  else if(t<.76){r(x,y,1,1,hash(i,305)>.5?'#b33a2a':'#c9a23a');}
  else{r(x,y,1.5,.5,'#4e4538');r(x+2,y+1,1,.5,'#4e4538');}}
 // Pale cave grass where the damp collects: along the foot of the walls, round the drips and under the moonlight by the mouth.
 const tuft=(x,y,s)=>{const c=hash(x|0,y|0)>.5?'#5f6a41':'#4a5236';l(x,y,x-1.2*s,y-3*s,.5,c);l(x+.5,y,x+.5,y-3.8*s,.5,'#7a8450');l(x+1,y,x+2.2*s,y-2.6*s,.5,c);};
 for(let i=0;i<150;i++){const x=60+hash(i,311)*(EAST-40),y=wallBottom(x)+4+hash(i,312)*12;if(inMouth(x,y)||x>shoreX(y)-4)continue;if(fbm(x/40,3)>.45)tuft(x,y,.7+hash(i,313)*.6);}
 for(let i=0;i<80;i++){const y=240+hash(i,321)*(CAMP.h-360),x=westEdge(y)+6+hash(i,322)*12;if(fbm(y/50,9)>.5)tuft(x,y,.6+hash(i,323)*.6);}
 for(const d of DRIPS.filter(d=>!d.into))for(let k=0;k<6;k++)tuft(d.x-12+hash(k,d.x+1)*24,d.y+3+hash(d.x,k+1)*6,.8);
 // Pebbles, shells and kelp on the sand.
 for(let i=0;i<1300;i++){const x=110+hash(i,41)*(EAST+60),y=236+hash(i,42)*(CAMP.h-340),sx=shoreX(y);if(x>sx-2||inGarden(x,y))continue;const t=hash(i,43);
  if(t<.62){const s=.8+hash(i,44)*1.4;r(x,y+s*.5,s*2,.5,'#4e4538');r(x,y,s*2,s,'#968970');r(x+.5,y,s,.5,'#a89b80');}
  else if(t<.8){r(x,y,1.5,1,'#c9c0aa');r(x+.5,y,.5,.5,'#e1d9c4');}
  else if(sx-x<40){l(x,y,x+4+t*6,y+2-t*4,1,'#34412f');r(x+2,y,1,1,'#45553c');}}
 // Kelp along the tideline.
 for(let y=240;y<CAMP.h-80;y+=5){const x=shoreX(y)-4-hash(y,51)*6;if(hash(y,52)<.4)l(x,y,x-3-hash(y,53)*5,y+2,1,'#2f3a2c');}
 // Shade under the sleeping shelter.
 {const sh=prop('shelter'),cx=sh.x+95,cy=sh.y+16;e(cx,cy,90,13,'#14120f44');e(cx,cy-2,80,9,'#14120f33');}
 // A scorched ring around the fire pit, ash scattered by the wind.
 {const f=prop('fire'),fx=f.x+28,fy=f.y+16;e(fx,fy,44,20,'#4c443a55');e(fx,fy,34,15,'#3c362f66');for(let i=0;i<40;i++){const a=hash(i,61)*Math.PI*2,d=24+hash(i,62)*26;r(fx+Math.cos(a)*d,fy+Math.sin(a)*d*.45,1,.5,'#3a3530');}
  const pt=prop('pot');e(pt.x+22,pt.y+22,20,9,'#3c362f55');}
 // Footprints between the stations.
 for(let i=0;i<90;i++){const line=PATHS[i%PATHS.length],t=hash(i,71),a=line[0],b=line.at(-1),x=a[0]+(b[0]-a[0])*t+(hash(i,72)-.5)*10,y=a[1]+(b[1]-a[1])*t+(hash(i,73)-.5)*8;r(x,y,2,1,'#6a5e4b');r(x+3,y+2,2,1,'#6a5e4b');}
 // The rowboat was dragged up from the water: a keel groove runs back to the tideline.
 const bt=prop('boat');for(let t=0;t<=1;t+=.01){const x=bt.x+30+t*66,y=bt.y+110+t*42+Math.sin(t*3)*3;r(x-1.5,y,3,1,'#4e483d');r(x-2.5,y-1,1,1,'#857862');r(x+1.5,y+1,1,1,'#857862');if(hash(Math.floor(t*100),7)>.8)r(x+4,y+3,2,1,'#6a5e4b');}
 // Crab holes along the wet sand, each with a little spray of dug-out grains.
 for(let i=0;i<16;i++){const y=520+hash(i,161)*(CAMP.h-760),x=shoreX(y)-8-hash(i,162)*22;e(x,y,1.6,1,'#2c2a25');for(let k=0;k<4;k++)r(x-3+hash(k,i)*6,y-2+hash(i,k)*4,.5,.5,'#8b7e66');}
 // A rusted anchor, half sunk in the sand, its chain trailing off.
 {const ax=1160,ay=1010;l(ax,ay-14,ax,ay+4,2.5,EDGE);l(ax,ay-14,ax,ay+4,1.4,RUST);e(ax,ay-15,2.5,2,EDGE);e(ax,ay-15,1.4,1,'#3b3530');l(ax-6,ay-10,ax+6,ay-10,2,EDGE);l(ax-6,ay-10,ax+6,ay-10,1,RUST);
  p([[ax-9,ay+1],[ax,ay+6],[ax+9,ay+1],[ax+8,ay+3.5],[ax,ay+8],[ax-8,ay+3.5]],EDGE);p([[ax-8,ay+2],[ax,ay+6],[ax+8,ay+2],[ax,ay+7]],'#8a5236');e(ax,ay+7,12,2,'#5f544455');
  for(let k=0;k<9;k++){const x=ax+3+k*3.2,y=ay-15-Math.sin(k*.5)*3+k*.4;e(x,y,1.4,1,EDGE);r(x-.5,y-.5,1,.5,'#8a5236');}}
 // A starfish and a few more shells near the water.
 {const sx=1250,sy=1170;for(let k=0;k<5;k++){const a=k/5*Math.PI*2-Math.PI/2;l(sx,sy,sx+Math.cos(a)*4,sy+Math.sin(a)*3,1.6,'#8a4a35');}e(sx,sy,1.4,1,'#b0654a');}
 // Ripples and glints on the water.
 for(let i=0;i<300;i++){const y=230+hash(i,81)*(CAMP.h-230),sx=shoreX(y),x=sx+12+hash(i,82)*340;if(x>CAMP.w)continue;r(x,y,3+hash(i,83)*8,.5,hash(i,84)>.7?'#4a7584':'#2f5a69');}
 c.restore();
}
// The south edge of the cave, drawn in front of everyone.
export const FRONT_Y=CAMP.h-140;
export function frontArt(c){c.save();c.scale(2,2);c.translate(0,-FRONT_Y);const {e,p,r}=painter(c);
 const S=CAMP.h-74,rocks=[];for(let x=-30;x<CAMP.w+30;x+=26+Math.floor(hash(x,91)*46)){rocks.push([x,S+6+hash(x,92)*30,14+hash(x,93)*34,10+hash(x,94)*16]);if(hash(x,95)>.55)rocks.push([x+20,S+34+hash(x,96)*16,8+hash(x,97)*12,6+hash(x,98)*8]);}
 rocks.sort((a,b)=>a[1]-b[1]);for(const [x,cy,rx,ry] of rocks){const wet=x>shoreX(cy)-10;
  e(x,cy+ry*.5,rx+2,ry,EDGE);e(x,cy,rx,ry,R[1]);e(x-rx*.15,cy-ry*.3,rx*.75,ry*.6,R[2]);e(x-rx*.3,cy-ry*.45,rx*.35,ry*.28,R[3]);r(x-rx*.4,cy-ry*.6,rx*.3,.5,R[4]);
  if(wet){e(x,cy+ry*.7,rx+3,2,'#9fb0ab66');}}
 for(let x=0;x<CAMP.w;x+=6)r(x,CAMP.h-8,6,8,R[0]);c.restore();}
// Props, the fire's flame frames, map markers and fish come from the Master Creator (props/camp.js).
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
// Map markers and fish come from the Master Creator (props/camp.js).
export {fbm,bayer,boulder,rgb,box,W,CV,M,R,RUST,GLASS,GLASS_HI,TEAL,TEAL_HI};
