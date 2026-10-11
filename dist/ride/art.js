// The ride's art: the road, painted one stretch long so it can repeat under the truck; the arm of the Guard's gate; the ramp; and the
// light: the night outside, the truck's dome light and the glow of the dash. The truck, the cases, the lamps and the checkpoint are
// the Master Creator's props; the road surfaces are its floors.
import {painter,bayer,hash2 as hash} from '../mc/assets/core/paint.js';
import {floorArt} from '../mc/assets/scenery/floors.js';
import {apcFrame} from '../mc/assets/props/base.js';
import {RIDE,ROAD,TRUCK} from './data.js';
export {propArt,PROP_PAD} from '../mc/assets/props/base.js';
// One stretch of road, ROAD.period long: the field and the gravel shoulder to the north, the two lanes with their edge lines and the
// dashed centre line, the south shoulder with a reflector post, and the wet: everything darker, a sheen down the lanes, puddles.
export function roadArt(c){c.save();c.scale(2,2);const g=painter(c),{r,e}=g,W=ROAD.period,H=RIDE.h;
 floorArt(g,{kind:'field',x:0,y:0,w:W,h:ROAD.top-6});floorArt(g,{kind:'gravel',x:0,y:ROAD.top-6,w:W,h:6});
 floorArt(g,{kind:'asphalt',x:0,y:ROAD.top,w:W,h:ROAD.bottom-ROAD.top});floorArt(g,{kind:'gravel',x:0,y:ROAD.bottom,w:W,h:8});floorArt(g,{kind:'field',x:0,y:ROAD.bottom+8,w:W,h:H-ROAD.bottom-8});
 r(0,0,W,H,'#0a0f1a40');r(0,ROAD.top,W,ROAD.bottom-ROAD.top,'#0c121c38');
 r(0,ROAD.top+2,W,1,'#b8b4a8');r(0,ROAD.bottom-3,W,1,'#b8b4a8');for(let x=0;x<W;x+=48)r(x+4,ROAD.line,24,1.5,'#c8a42a');
 for(let i=0;i<5;i++){const x=hash(i,61)*W,y=ROAD.top+10+hash(61,i)*(ROAD.bottom-ROAD.top-20),w=12+hash(i,63)*26;e(x,y,w/2,2+hash(63,i)*2,'#0b0f16b0');r(x-w*.3,y-1,w*.6,.5,'#33405a');}
 for(let y=ROAD.top+6;y<ROAD.bottom-4;y+=7)for(let x=(y*13)%11;x<W;x+=23)r(x,y,4+hash(x|0,y)*6,.5,'#1e2633');
 r(W*.5-1,ROAD.bottom+1,2,5,'#d8d4c8');r(W*.5-1,ROAD.bottom+1,2,1.5,'#c03a2a');
 c.restore();}
// The gate's arm: red and white, ARM long, drawn pointing east; the scene swings it about its post, from across the lane to open.
export const ARM=124;
export function armArt(c){c.save();c.scale(2,2);const {r}=painter(c);r(0,0,ARM+4,4,'#191b21');for(let x=.5;x<ARM+3;x+=8){r(x,.5,4,3,'#d23a2a');r(x+4,.5,4,3,'#f0ece2');}r(ARM-1,.5,3,3,'#ff5a3a');c.restore();}
// The light, multiplied over everything: night outside, deep blue; in the truck the dome light, warm and touched with its red,
// brightest round the dome and falling off to the ends, and the dash's green and blue glow round the driver. Kept bright enough
// that faces read.
export const LIGHT_SCALE=2;
const F=apcFrame(TRUCK),dome=[TRUCK.x+(F.T+F.xp)/2,TRUCK.y-20];
const LIGHTS=[[...dome,165,1,.76,.66],[TRUCK.x+F.xf-16,TRUCK.y+14,50,.66,1,.78],[TRUCK.x+F.xf-16,TRUCK.y+52,34,.62,.76,1]];
// The inside of the truck, in the world: its own light falls here and the night's does not.
export const INSIDE={x:TRUCK.x,y:TRUCK.y-TRUCK.z,w:F.xf+F.T,h:TRUCK.h+TRUCK.z};
const inTruck=(x,y)=>x>INSIDE.x&&x<INSIDE.x+INSIDE.w&&y>INSIDE.y&&y<INSIDE.y+INSIDE.h;
export const DOME={x:dome[0],y:TRUCK.y+F.T-TRUCK.z+3};
export function lightArt(c){const w=Math.ceil(RIDE.w/LIGHT_SCALE),h=Math.ceil(RIDE.h/LIGHT_SCALE),img=c.createImageData(w,h),d=img.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const wx=x*LIGHT_SCALE+1,wy=y*LIGHT_SCALE+1,th=bayer(x,y),inside=inTruck(wx,wy),A=inside?[.5,.47,.54]:[.4,.44,.6];let F=0;const acc=[0,0,0];
  if(inside)for(const [lx,ly,rad,lr,lg,lb] of LIGHTS){const dist=Math.hypot(wx-lx,(wy-ly)*1.3)/rad;if(dist>=1)continue;let f=(1-dist)**1.3;f=Math.min(1,Math.floor(f*6+th)/6);F+=f;acc[0]+=f*lr;acc[1]+=f*lg;acc[2]+=f*lb;}
  const k=Math.min(1,F),i=(y*w+x)*4;for(let ch=0;ch<3;ch++){const lit=F>0?acc[ch]/F:0;d[i+ch]=Math.round(255*Math.min(1,A[ch]*(1-k)+lit*k));}d[i+3]=255;}
 c.putImageData(img,0,0);}
// The ramp, let down onto the road: a tread plate as wide as the floor, a rail down each side, the lip at its foot and the hinge at
// the truck. Drawn flat, RAMP.len long, hinged at (x, y); the scene squeezes it toward the hinge while it comes down.
export const RAMP={len:44,w:TRUCK.h-2*F.T,x:TRUCK.x+F.T,y:TRUCK.y+F.T};
export function rampArt(c){c.save();c.scale(2,2);const {r}=painter(c),L=RAMP.len,W=RAMP.w,E='#191b21';
 r(0,0,L,W,E);r(.5,.5,L-.5,W-1,'#33383d');for(let y=3,row=0;y<W-3;y+=3,row++)for(let x=1.5+(row%2)*3;x<L-3;x+=6){r(x,y,2,.5,'#41474d');r(x+.5,y+.5,1.5,.5,'#272b2f');}
 for(const y of [.5,W-3])r(.5,y,L-.5,2.5,'#3c443b'),r(.5,y,L-.5,.5,'#5f6a5c');r(.5,.5,2.5,W-1,'#535a61');r(.5,.5,.5,W-1,'#78836f');
 r(L-3,.5,3,W-1,'#272b2f');for(let y=6;y<W-6;y+=12)r(L-2.5,y,2,4,'#535a61');c.restore();}
export {glowArt} from '../base/art.js';
