// Starter house art: the floors and the yard, painted once, and the night light that falls over them. The props are the
// Master Creator's house set; the floors are its floor tiles.
import {painter,bayer} from '../mc/assets/core/paint.js';
import {floorArt} from '../mc/assets/scenery/floors.js';
import {HOME,HOUSE,ROOMS,DOORS,PATH,LIGHTS,INSIDE,T,IT} from './data.js';
export {propArt,PROP_PAD,HOME_WALLS,HOME_DECOR} from '../mc/assets/props/home.js';
// The whole ground: lawn round the house, the path to the street, the floor of every room and a strip of floor under each doorway.
export function groundArt(c){c.save();c.scale(2,2);const g=painter(c),{r}=g;
 floorArt(g,{kind:'lawn',x:0,y:0,w:HOME.w,h:HOME.h});floorArt(g,{kind:'concrete',x:PATH.x,y:PATH.y,w:PATH.w,h:PATH.h});
 // The street beyond the fence: dark asphalt and a curb.
 r(0,HOME.h-10,HOME.w,10,'#1b1d21');r(0,HOME.h-11,HOME.w,1.5,'#3b3e43');for(let x=8;x<HOME.w;x+=40)r(x,HOME.h-5,16,1,'#5a5a4a');
 // The house's footprint is a dark slab under the walls, so nothing shows between pieces.
 r(HOUSE.x-1,HOUSE.y-1,HOUSE.w+2,HOUSE.h+2,'#141210');
 for(const rm of ROOMS)floorArt(g,{kind:rm.floor,x:rm.x,y:rm.y,w:rm.w,h:rm.h});
 for(const d of DOORS){const room=ROOMS.find(rm=>rm.id===d.a);if(d.axis==='h')floorArt(g,{kind:room.floor==='tile'?'tile':'wood',x:d.from,y:d.y-IT/2,w:d.to-d.from,h:IT});else{// Through a wall that runs away from you the gap is mostly hidden, so a threshold board runs out into both rooms and a little
  // of each room's light falls through it.
  const x=d.x-IT/2-14,w=IT+28,y=d.from+4,h=d.to-d.from-8;r(x-.5,y-.5,w+1,h+1,'#1a1410');floorArt(g,{kind:'wood',x,y,w,h});r(x,y,w,.5,'#8a6a4a');r(x,y+h-.5,w,.5,'#2a1e14');for(const e of [x,x+w-.5])r(e,y,.5,h,'#2a1e14');}}
 // A soft shadow where the floor meets the back wall of each room, and down the west side.
 for(const rm of ROOMS){for(let k=0;k<4;k++)r(rm.x,rm.y+k,rm.w,1,`rgba(10,8,6,${.32-k*.07})`);for(let k=0;k<3;k++)r(rm.x+k,rm.y,1,rm.h,`rgba(10,8,6,${.2-k*.06})`);}
 // The house throws a shadow on the lawn behind it, and the step is worn where feet land.
 for(let k=0;k<6;k++)r(HOUSE.x,HOUSE.y+HOUSE.h+k,HOUSE.w,1,`rgba(6,10,8,${.35-k*.05})`);
 c.restore();}
// Night with the power out. Inside is dim and cool, outside a little brighter under the moon; the windows let it in and the
// candle on the coffee table makes a warm pool. Quantised and dithered like the rest of the game's light.
export const LIGHT_SCALE=2,AMBIENT_IN=[.34,.38,.52],AMBIENT_OUT=[.46,.52,.68];
export function lightArt(c){const w=Math.ceil(HOME.w/LIGHT_SCALE),h=Math.ceil(HOME.h/LIGHT_SCALE),img=c.createImageData(w,h),d=img.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const wx=x*LIGHT_SCALE+1,wy=y*LIGHT_SCALE+1,th=bayer(x,y),inside=wx>INSIDE.left-T&&wx<INSIDE.right+T&&wy>INSIDE.top-T-48&&wy<INSIDE.bottom+T;let F=0;const acc=[0,0,0];
  if(inside)for(const [lx,ly,rad,lr,lg,lb] of LIGHTS){const dx=wx-lx,dy=(wy-ly)*1.25;if(Math.abs(dx)>rad||Math.abs(dy)>rad)continue;const dist=Math.hypot(dx,dy)/rad;if(dist>=1)continue;let f=(1-dist)**1.3;f=Math.min(1,Math.floor(f*6+th)/6);F+=f;acc[0]+=f*lr;acc[1]+=f*lg;acc[2]+=f*lb;}
  const A=inside?AMBIENT_IN:AMBIENT_OUT,k=Math.min(1,F),i=(y*w+x)*4;for(let ch=0;ch<3;ch++){const lit=F>0?acc[ch]/F:0;d[i+ch]=Math.round(255*Math.min(1,A[ch]*(1-k)+lit*k));}d[i+3]=255;}
 c.putImageData(img,0,0);}
export function glowArt(c){const gr=c.createRadialGradient(64,64,0,64,64,64);gr.addColorStop(0,'rgba(255,190,120,.75)');gr.addColorStop(.4,'rgba(255,170,100,.25)');gr.addColorStop(1,'rgba(255,160,90,0)');c.fillStyle=gr;c.fillRect(0,0,128,128);}
