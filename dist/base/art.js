// Hangar 3's art: the floor and the apron, painted once, and its two lights: the working light of the hangar (high-bay lamps
// inside, floodlights on the wet apron) and the briefing's dimmer that is laid over it while the projector is on. The props are
// the Master Creator's base set; the floors are its floor tiles.
import {painter,bayer,hash2 as hash} from '../mc/assets/core/paint.js';
import {floorArt} from '../mc/assets/scenery/floors.js';
import {crest} from '../mc/assets/props/base.js';
import {BASE,HANGAR,DOOR_Y} from './data.js';
export {propArt,PROP_PAD} from '../mc/assets/props/base.js';
// The ground: the hangar's sealed concrete, the unit's crest painted on it, hazard stripes across the door, and outside the apron in
// the rain, darker and wet, with puddles, a painted taxi line and tie-down rings.
export function groundArt(c){c.save();c.scale(2,2);const g=painter(c),{r,e}=g;
 r(0,0,BASE.w,BASE.h,'#0b0c0f');
 floorArt(g,{kind:'concrete',x:0,y:DOOR_Y,w:BASE.w,h:BASE.h-DOOR_Y});
 // Wet: the apron darker and bluer, puddles lying in the low spots with the light caught on their far edges.
 r(0,DOOR_Y,BASE.w,BASE.h-DOOR_Y,'#0a0f1a5c');
 for(let i=0;i<26;i++){const x=hash(i,41)*BASE.w,y=DOOR_Y+18+hash(43,i)*(BASE.h-DOOR_Y-24),w=10+hash(i,47)*34,h=3+hash(47,i)*5;e(x,y,w/2+1,h/2+.5,'#0b0e14a0');e(x,y,w/2,h/2,'#121a26');r(x-w*.3,y-h/2+.5,w*.6,.5,'#3a4a62');r(x-w*.15,y-h/2+1.5,w*.3,.5,'#26344a');}
 for(let x=6;x<BASE.w;x+=26)r(x,BASE.h-34,14,1.5,'#8a7a3a');for(const x of [120,300,640,820])for(const y of [520,660]){e(x,y,2.5,1.2,'#1a1c20');e(x,y-.3,1.6,.6,'#55585e');}
 // Inside: the floor, its crest, the hazard band at the door, and the shadow along the foot of each wall.
 floorArt(g,{kind:'hangar',x:HANGAR.x,y:HANGAR.y,w:HANGAR.w,h:DOOR_Y-HANGAR.y});
 c.save();c.translate(440,330);c.scale(1,.62);c.translate(-440,-330);crest(g,440,286,88,{rim:'#b8923a3a',field:'#1e28402e',mark:'#dcb85a36',star:'#f6f5f030',edge:'#14151826'});c.restore();
 for(let x=HANGAR.x;x<HANGAR.x+HANGAR.w;x+=8){r(x,DOOR_Y-8,8,8,'#c8a42a');for(let k=0;k<8;k++)r(x+k,DOOR_Y-8+k,4,1,'#18191c');}r(HANGAR.x,DOOR_Y-8.5,HANGAR.w,.5,'#0e0f12');r(HANGAR.x,DOOR_Y,HANGAR.w,1,'#0e0f12');
 for(let k=0;k<6;k++){r(HANGAR.x,HANGAR.y+k,HANGAR.w,1,`rgba(8,9,12,${.4-k*.06})`);r(HANGAR.x+k,HANGAR.y,1,DOOR_Y-HANGAR.y-8,`rgba(8,9,12,${.3-k*.05})`);r(HANGAR.x+HANGAR.w-1-k,HANGAR.y,1,DOOR_Y-HANGAR.y-8,`rgba(8,9,12,${.3-k*.05})`);}
 // A keep-clear box painted in front of the armory window, and the aisle's two yellow guide lines down to the door.
 r(70,154,70,.75,'#c8a42a');r(70,176,70,.75,'#c8a42a');r(70,154,.75,22.75,'#c8a42a');r(139.25,154,.75,22.75,'#c8a42a');for(let x=72;x<138;x+=6)g.l(x,175.5,x+5,154.5,.5,'#c8a42a99');
 for(const x of [424,455])for(let y=196;y<DOOR_Y-14;y+=12)r(x,y,1,7,'#c8a42a66');
 c.restore();}
// The hangar's working light: high-bay lamps over the floor in two rows, the screen lit by the projector, and outside two
// floodlights over the trucks in the rain. Each light is [x, y, radius, r, g, b]; the ambient is what reaches between them.
export const LIGHT_SCALE=2;
const LAMPS=[...[110,280,440,600,770].flatMap(x=>[[x,206,170,1,.95,.84],[x,390,170,1,.95,.84]]),[440,70,110,.95,.98,1],[210,560,210,.82,.88,1],[720,560,210,.82,.88,1]];
const AMB_IN=[.46,.46,.5],AMB_OUT=[.26,.3,.42];
function lightMap(c,lights,amb){const w=Math.ceil(BASE.w/LIGHT_SCALE),h=Math.ceil(BASE.h/LIGHT_SCALE),img=c.createImageData(w,h),d=img.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const wx=x*LIGHT_SCALE+1,wy=y*LIGHT_SCALE+1,th=bayer(x,y),A=amb(wx,wy);let F=0;const acc=[0,0,0];
  for(const [lx,ly,rad,lr,lg,lb] of lights){const dx=wx-lx,dy=(wy-ly)*1.25;if(Math.abs(dx)>rad||Math.abs(dy)>rad)continue;const dist=Math.hypot(dx,dy)/rad;if(dist>=1)continue;let f=(1-dist)**1.2;f=Math.min(1,Math.floor(f*6+th)/6);F+=f;acc[0]+=f*lr;acc[1]+=f*lg;acc[2]+=f*lb;}
  const k=Math.min(1,F),i=(y*w+x)*4;for(let ch=0;ch<3;ch++){const lit=F>0?acc[ch]/F:0;d[i+ch]=Math.round(255*Math.min(1,A[ch]*(1-k)+lit*k));}d[i+3]=255;}
 c.putImageData(img,0,0);}
export function lightArt(c){lightMap(c,LAMPS,(x,y)=>y<DOOR_Y?AMB_IN:AMB_OUT);}
// The briefing's dimmer, multiplied over the working light: the house lights down to a third, except the stage, the screen and the
// podium in the projector's spill, and a little light down the aisle from the projector itself.
const SPILL=[[440,96,150,1,1,1],[365,150,46,1,.96,.88],[440,150,110,.9,.92,1],[440,318,40,.75,.78,.9]];
export function dimArt(c){lightMap(c,SPILL,()=>[.52,.53,.6]);}
export function glowArt(c,[R,G,B]=[255,244,220]){const gr=c.createRadialGradient(64,64,0,64,64,64);gr.addColorStop(0,`rgba(${R},${G},${B},.8)`);gr.addColorStop(.45,`rgba(${R},${G},${B},.22)`);gr.addColorStop(1,`rgba(${R},${G},${B},0)`);c.fillStyle=gr;c.fillRect(0,0,128,128);}
