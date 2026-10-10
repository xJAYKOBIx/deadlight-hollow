// Street art: the ground (lawns, roofs, sidewalks, the road and the cruiser's skid marks), painted once, and the night light over
// it. The props are the Master Creator's street set, which falls back to its house set for walls, shrubs and fences.
import {painter,bayer,hash2 as hash} from '../mc/assets/core/paint.js';
import {floorArt} from '../mc/assets/scenery/floors.js';
import {STREET,HOUSES,FRONT,Z,SIDEWALK_N,ROAD,SIDEWALK_S,CENTER,LIGHTS} from './data.js';
export {propArt,PROP_PAD} from '../mc/assets/props/street.js';
const ROOF=['#1c1e23','#24272d','#2c3037','#363a42'];
export function groundArt(c){c.save();c.scale(2,2);const g=painter(c),{r,l}=g,W=STREET.w;
 floorArt(g,{kind:'lawn',x:0,y:0,w:W,h:STREET.h});
 // Roofs above each front wall: shingle rows running back from the eave, darker toward the ridge.
 for(const h of HOUSES){const x0=Math.max(0,h.x0),x1=Math.min(W,h.x1),top=0,eave=FRONT-Z+2;r(x0-2,top,x1-x0+4,eave-top+2,'#111319');
  for(let y=top,k=0;y<eave;y+=5,k++){const col=ROOF[Math.min(3,Math.floor((y-top)/(eave-top)*4))];r(x0,y,x1-x0,5,col);r(x0,y+4.5,x1-x0,.5,ROOF[0]);for(let x=x0+(k%2)*6;x<x1;x+=12)r(x,y,.5,4.5,ROOF[0]);}
  r(x0,eave-1.5,x1-x0,1.5,ROOF[3]);r(x0,eave,x1-x0,2,'#0d0e11');}
 // Paths from each step to the sidewalk.
 for(const h of HOUSES){const px=h.door+2;if(px+30>0&&px<W)floorArt(g,{kind:'concrete',x:px,y:FRONT+36,w:30,h:SIDEWALK_N.y-FRONT-36});}
 // Sidewalks with their joints, then the curbs and the road with its dashed centre line.
 for(const s of [SIDEWALK_N,SIDEWALK_S]){floorArt(g,{kind:'concrete',x:0,y:s.y,w:W,h:s.h});for(let x=0;x<W;x+=40)r(x,s.y,.5,s.h,'#2a2c30');}
 r(0,ROAD.y-2,W,2,'#55585e');r(0,ROAD.y-.5,W,.5,'#26282c');r(0,ROAD.y+ROAD.h,W,2,'#55585e');r(0,ROAD.y+ROAD.h+1.5,W,.5,'#26282c');
 floorArt(g,{kind:'asphalt',x:0,y:ROAD.y,w:W,h:ROAD.h});for(let x=10;x<W;x+=48)r(x,CENTER-1,24,1.5,'#8a7f4a');
 // The cruiser's skid marks: two dark arcs from the middle of the road up onto the curb, and glass on the sidewalk by the pole.
 for(const off of [0,15]){let px=760,py=346-off*.4;for(let i=1;i<=60;i++){const k=i/60,x=760+k*560,y=346-off*.4-k*k*(96-off*.6),a=Math.min(.55,.15+k*.6);l(px,py,x,y,2.5,`rgba(8,8,10,${a})`);px=x;py=y;}}
 for(let i=0;i<40;i++){const x=1430+hash(i,5)*50,y=232+hash(7,i)*36;r(x,y,hash(i,9)>.5?1:.5,.5,i%3?'#a9c0cc':'#e2eef4');}
 c.restore();}
// Night with the power out: darker than the house, the moon on the road, a candle in one window and one headlight still on.
export const LIGHT_SCALE=2,AMBIENT=[.28,.32,.48];
export function lightArt(c){const w=Math.ceil(STREET.w/LIGHT_SCALE),h=Math.ceil(STREET.h/LIGHT_SCALE),img=c.createImageData(w,h),d=img.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const wx=x*LIGHT_SCALE+1,wy=y*LIGHT_SCALE+1,th=bayer(x,y);let F=0;const acc=[0,0,0];
  for(const [lx,ly,rad,lr,lg,lb] of LIGHTS){const dx=wx-lx,dy=(wy-ly)*1.25;if(Math.abs(dx)>rad||Math.abs(dy)>rad)continue;const dist=Math.hypot(dx,dy)/rad;if(dist>=1)continue;let f=(1-dist)**1.3*(rad>200?.45:1);f=Math.min(1,Math.floor(f*6+th)/6);F+=f;acc[0]+=f*lr;acc[1]+=f*lg;acc[2]+=f*lb;}
  const k=Math.min(1,F),i=(y*w+x)*4;for(let ch=0;ch<3;ch++){const lit=F>0?acc[ch]/F:0;d[i+ch]=Math.round(255*Math.min(1,AMBIENT[ch]*(1-k)+lit*k));}d[i+3]=255;}
 c.putImageData(img,0,0);}
