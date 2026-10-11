// The title over black, in the game's own display face: DEADLIGHT HOLLOW comes up out of the dark, stutters once like a light about to fail, holds, and goes.
import {clamp,hash} from '../intro/kit.js';
import {FW,FH,caption,smooth} from './film.js';
export const TITLE={dur:8,in:1,hold:5.6,out:7.2};
export function titleShot(c,s){const T=TITLE,k=smooth((s-T.in)/1.8)*(1-smooth((s-T.hold)/(T.out-T.hold))),f=Math.floor(s*24),stutter=s>T.in+2.2&&s<T.in+2.6&&hash(f*7)<.6?.25:1;
 c.fillStyle='#000';c.fillRect(0,0,FW,FH);const a=k*stutter,track=lerpT(s);
 caption(c,'DEADLIGHT HOLLOW',FW/2,FH/2+6,{size:26,font:"'Saira Stencil One',Impact,'Arial Narrow',sans-serif",weight:400,track,align:'center',color:'#e8e0d1',alpha:a,glow:'rgba(255,120,60,.35)'});
 c.fillStyle=`rgba(221,111,44,${a*.8})`;const lw=60*smooth((s-T.in-.6)/1.4);c.fillRect(FW/2-lw,FH/2+18,lw*2,.6);
 caption(c,'NIGHT ONE',FW/2,FH/2+34,{size:8,track:4,font:"'Barlow Condensed','Arial Narrow',Arial,sans-serif",weight:600,align:'center',color:'#a2998a',alpha:smooth((s-T.in-1.4)/1)*(1-smooth((s-T.hold)/(T.out-T.hold)))});
 return {bloom:.6,vignette:.6,grain:.18,bars:1};}
const lerpT=s=>5+smooth(s/TITLE.dur)*2.5;
