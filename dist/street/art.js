// Neighbourhood art: the ground (fields round the edge, lawns, paths and driveways, sidewalks, the streets with their dashed lines,
// and the cruiser's skid marks) and the night light over it, both painted one chunk at a time so only the part near you is held.
// The props are the Master Creator's street set, which falls back to its house set for shrubs, steps and fences.
import {painter,bayer,hash2 as hash} from '../mc/assets/core/paint.js';
import {floorArt} from '../mc/assets/scenery/floors.js';
import {STREET,TOWN,BLOCKS,ROADS,CROSSES,CROSS,FRONT,WALL_T,SIDEWALK_N,BACK,BLOCK,BAND,HOME,LIGHTS} from './data.js';
export {propArt,PROP_PAD} from '../mc/assets/props/street.js';
const cut=(a,R)=>{const x=Math.max(a.x,R.x),y=Math.max(a.y,R.y),x1=Math.min(a.x+a.w,R.x+R.w),y1=Math.min(a.y+a.h,R.y+R.h);return x1>x&&y1>y?{x,y,w:x1-x,h:y1-y}:null;};
const SIDE={top:TOWN.y,bottom:ROADS[ROADS.length-1].ss+20};
// One chunk of ground, R in world units, painted onto a canvas twice R's size. wreck false leaves off the skid marks and glass (the
// intro paints those as the cruiser makes them). Every pattern is tied to world position, so chunks
// painted separately meet without a seam. S, a strip of R, paints only that part, so a chunk can be painted over a few frames.
export function groundArt(c,R,S=R,wreck=true){c.save();c.scale(2,2);c.translate(-R.x,-R.y);if(S!==R){c.beginPath();c.rect(S.x,S.y,S.w,S.h);c.clip();}R=S;const g=painter(c),{r,l}=g,W=STREET.w,H=STREET.h;
 const F=(kind,a)=>{const q=cut(a,R);if(q)floorArt(g,{kind,...q});},Q=(x,y,w,h,col)=>{if(cut({x,y,w,h},R))r(x,y,w,h,col);};
 // A worn patch: dirt in a rough oval, a half-unit row at a time, its edge broken up so it fades into the grass.
 const worn=(x,y,w,h)=>{if(!cut({x,y,w,h},R))return;const cx=x+w/2,cy=y+h/2;for(let yy=y;yy<y+h;yy+=.5){const k=1-((yy+.25-cy)/(h/2))**2;if(k<=0)continue;const half=w/2*Math.sqrt(k),j=(hash(yy*2|0,x|0)-.5)*6;F('dirt',{x:Math.round((cx-half+j)*2)/2,y:yy,w:Math.max(0,Math.round((half*2-j*1.5)*2)/2),h:.5});}};
 // Long grass round the edge of town, lawns inside it.
 for(const a of [{x:0,y:0,w:W,h:TOWN.y},{x:0,y:TOWN.y+TOWN.h,w:W,h:H-TOWN.y-TOWN.h},{x:0,y:TOWN.y,w:TOWN.x,h:TOWN.h},{x:TOWN.x+TOWN.w,y:TOWN.y,w:W-TOWN.x-TOWN.w,h:TOWN.h}])F('field',a);
 F('lawn',TOWN);
 // In each block: worn dirt in some back yards, the path from each step to the sidewalk, and a driveway from each garage.
 for(const b of BLOCKS){if(!cut({x:b.x-20,y:b.y+BACK,w:BLOCK+40,h:BAND},R))continue;
  for(const [k,h] of b.houses.entries())if(hash(b.i*7+k,b.j*13)<.35)worn(Math.round(h.x+20+hash(k,b.i)*(h.w-110)),b.y+BACK+24+Math.round(hash(b.j,k)*40),70+Math.round(hash(k,9)*40),30+Math.round(hash(9,k)*20));
  for(const px of b.paths)F('concrete',{x:px,y:b.y+FRONT+36,w:30,h:SIDEWALK_N.y-FRONT-36});
  for(const d of b.drives)F('concrete',{x:d.x,y:b.y+FRONT+WALL_T,w:d.w,h:SIDEWALK_N.y-FRONT-WALL_T});}
 // Sidewalks along every street and down every side street, with their joints.
 const x0=CROSSES[0].x,x1=CROSSES[CROSSES.length-1].x+CROSS;
 for(const rd of ROADS)for(const y of [rd.sn,rd.ss]){F('concrete',{x:x0,y,w:x1-x0,h:20});if(cut({x:x0,y,w:x1-x0,h:20},R))for(let x=Math.ceil(Math.max(x0,R.x)/40)*40;x<Math.min(x1,R.x+R.w);x+=40)r(x,y,.5,20,'#2a2c30');}
 for(const cr of CROSSES)for(const x of [cr.x,cr.x+CROSS-20]){F('concrete',{x,y:SIDE.top,w:20,h:SIDE.bottom-SIDE.top});if(cut({x,y:SIDE.top,w:20,h:SIDE.bottom-SIDE.top},R))for(let y=Math.ceil(Math.max(SIDE.top,R.y)/40)*40;y<Math.min(SIDE.bottom,R.y+R.h);y+=40)r(x,y,20,.5,'#2a2c30');}
 // Curbs, then the asphalt over them, so the curbs stop where the streets cross.
 for(const rd of ROADS){Q(0,rd.y-2,W,2,'#55585e');Q(0,rd.y-.5,W,.5,'#26282c');Q(0,rd.y+rd.h,W,2,'#55585e');Q(0,rd.y+rd.h+1.5,W,.5,'#26282c');}
 for(const cr of CROSSES){const a=cr.x+20,b=cr.x+CROSS-20;Q(a-2,0,2,H,'#55585e');Q(a-.5,0,.5,H,'#26282c');Q(b,0,2,H,'#55585e');Q(b+1.5,0,.5,H,'#26282c');}
 for(const rd of ROADS)F('asphalt',{x:0,y:rd.y,w:W,h:rd.h});for(const cr of CROSSES)F('asphalt',{x:cr.x+20,y:0,w:CROSS-40,h:H});
 // Dashed centre lines, broken where the streets cross.
 const inCross=x=>CROSSES.some(cr=>x+24>cr.x+20&&x<cr.x+CROSS-20),inRoad=y=>ROADS.some(rd=>y+24>rd.y&&y<rd.y+rd.h);
 for(const rd of ROADS){const cy=rd.y+rd.h/2;if(cut({x:0,y:cy-1,w:W,h:2},R))for(let x=Math.floor((R.x-10)/48)*48+10;x<R.x+R.w;x+=48)if(!inCross(x))r(x,cy-1,24,1.5,'#8a7f4a');}
 for(const cr of CROSSES){const cx=cr.x+CROSS/2;if(cut({x:cx-1,y:0,w:2,h:H},R))for(let y=Math.floor((R.y-10)/48)*48+10;y<R.y+R.h;y+=48)if(!inRoad(y))r(cx-.75,y,1.5,24,'#8a7f4a');}
 // The cruiser's skid marks: two dark arcs from the middle of the road up onto the curb, and glass on the sidewalk by the pole.
 if(wreck&&cut({x:HOME.x+740,y:HOME.y+220,w:760,h:150},R)){for(const off of [0,15]){let px=HOME.x+760,py=HOME.y+346-off*.4;for(let i=1;i<=60;i++){const k=i/60,x=HOME.x+760+k*560,y=HOME.y+346-off*.4-k*k*(96-off*.6),a=Math.min(.55,.15+k*.6);l(px,py,x,y,2.5,`rgba(8,8,10,${a})`);px=x;py=y;}}
  for(let i=0;i<40;i++){const x=HOME.x+1430+hash(i,5)*50,y=HOME.y+232+hash(7,i)*36;r(x,y,hash(i,9)>.5?1:.5,.5,i%3?'#a9c0cc':'#e2eef4');}}
 c.restore();}
// Night with the power out: the moon in patches, a candle in a window here and there and one headlight still on. One chunk at a time,
// at a quarter of the ground's pixels; the light multiplies everything under it.
export const LIGHT_SCALE=2,AMBIENT=[.28,.32,.48];
// Each light only visits the pixels it reaches, and its falloff comes from a table, which keeps a chunk quick to paint.
const FALL=Float32Array.from({length:4097},(_,i)=>(1-Math.sqrt(i/4096))**1.3);
export function lightArt(c,R){const w=Math.ceil(R.w/LIGHT_SCALE),h=Math.ceil(R.h/LIGHT_SCALE),img=c.createImageData(w,h),d=img.data,ox=R.x/LIGHT_SCALE|0,oy=R.y/LIGHT_SCALE|0,n=w*h;
 const F=new Float32Array(n),A=[new Float32Array(n),new Float32Array(n),new Float32Array(n)],L=LIGHT_SCALE;
 for(const [lx,ly,rad,lr,lg,lb] of LIGHTS){const x0=Math.max(0,Math.floor((lx-rad-R.x-1)/L)),x1=Math.min(w-1,Math.ceil((lx+rad-R.x-1)/L)),y0=Math.max(0,Math.floor((ly-rad/1.25-R.y-1)/L)),y1=Math.min(h-1,Math.ceil((ly+rad/1.25-R.y-1)/L));if(x0>x1||y0>y1)continue;const s=rad>200?.45:1,r2=1/(rad*rad);
  for(let y=y0;y<=y1;y++){const dy=(R.y+y*L+1-ly)*1.25;for(let x=x0;x<=x1;x++){const dx=R.x+x*L+1-lx,q=(dx*dx+dy*dy)*r2;if(q>=1)continue;const f=Math.min(1,Math.floor(FALL[q*4096|0]*s*6+bayer(ox+x,oy+y))/6),i=y*w+x;F[i]+=f;A[0][i]+=f*lr;A[1][i]+=f*lg;A[2][i]+=f*lb;}}}
 for(let i=0;i<n;i++){const f=F[i],k=Math.min(1,f);for(let ch=0;ch<3;ch++){const lit=f>0?A[ch][i]/f:0;d[i*4+ch]=Math.round(255*Math.min(1,AMBIENT[ch]*(1-k)+lit*k));}d[i*4+3]=255;}
 c.putImageData(img,0,0);}
