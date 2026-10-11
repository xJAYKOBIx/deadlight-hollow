// Segment 7, CH 9 · MTNN: the antidote. A split screen: MTNN's anchor in the studio on the left, Dr. Ilse Varga on a shaky satellite
// link from inside the Marrow lab on the right, the lights flickering behind her and a sealed door that something starts pounding on.
// She names Myrphol, says everyone who took LZ-6 will get the fever, and the link freezes and breaks up on "the samples are at".
import {R,hash,clamp,ease,rng} from '../intro/kit.js';
import {text,width} from '../intro/font.js';
import {captions,lowerThird,ticker,bug} from '../intro/overlay.js';
import {breakup} from '../intro/tv.js';
export const VARGA={dur:14.2,bang:[9.6,10.2,10.7,11.5,12.1],freeze:12.75,lost:13.9,
 captions:[[.8,"THERE'S A COMPOUND. MYRPHOL."],[2.5,'IT SLOWS THE INFECTION.'],[3.9,'WE WERE WEEKS AWAY.'],[5.7,'EVERYONE WHO TOOK LZ-6'],[6.9,'WILL GET THE FEVER.'],[8.4,'EVERYONE.'],[9.6,'[BANGING]'],[10.9,'IF ANYONE CAN HEAR THIS,'],[11.9,'THE SAMPLES ARE AT-']],
 speech:[[.8,4.9],[5.7,7.9],[8.4,8.9],[10.9,12.75]],
 ticker:'EMERGENCY ALERT IN EFFECT NATIONWIDE · STAY INDOORS · MARROW INDUSTRIES HAS NOT COMMENTED · LZ-6 CLINICS CLOSED · ALL FLIGHTS GROUNDED · '};
const banged=lt=>VARGA.bang.some(b=>lt>=b&&lt<b+.12);
// MTNN's studio and anchor: a grey-haired man in a dark suit, listening, his brow going up when the banging starts.
function anchorBox(c,lt,x,y,w,h){for(let j=0;j<h;j++)R(c,x,y+j,w,1,`rgb(${14+j*.2|0},${22+j*.3|0},${52+j*.5|0})`);
 for(let i=0;i<5;i++)R(c,x+6+i*22,y+8,14,24,'#1c2a5a');c.globalAlpha=.4;c.strokeStyle='#4a6ad8';c.beginPath();c.arc(x+w-22,y+24,16,0,7);c.stroke();c.beginPath();c.ellipse(x+w-22,y+24,7,16,0,0,7);c.stroke();c.globalAlpha=1;
 const ax=x+w/2-14,ay=y+16,shock=lt>VARGA.bang[0]+.3;
 for(let j=0;j<h-30;j++){const half=Math.min(24,10+j*1.4);R(c,ax+14-half,ay+30+j,half*2,1,'#1a1c26');}R(c,ax+10,ay+30,8,10,'#e8e8ee');R(c,ax+13,ay+31,2,10,'#8a1420');
 R(c,ax+6,ay+4,16,22,'#d4a888');R(c,ax+6,ay+20,16,6,'#c09070');R(c,ax+5,ay+1,18,6,'#b8b8be');R(c,ax+5,ay+5,2,8,'#b8b8be');R(c,ax+21,ay+5,2,8,'#b8b8be');R(c,ax+11,ay+26,6,4,'#c09070');
 R(c,ax+9,ay+12,2,shock?3:2,'#1a1210');R(c,ax+17,ay+12,2,shock?3:2,'#1a1210');R(c,ax+8,ay+(shock?9:10),4,1,'#7a7a80');R(c,ax+16,ay+(shock?9:10),4,1,'#7a7a80');R(c,ax+11,ay+21,6,1,'#7a4a40');
 bug(c,'NEW YORK',x+3,y+h-12,'#000000a0','#e8e8ec');}
// The lab, seen down the satellite link: pale walls, a strip light failing, shelves, and the sealed door with its red lamp.
function lab(c,lt,x,y,w,h){const fl=hash(Math.floor(lt*14))<(lt>VARGA.bang[0]?.4:.1)?.45:1;
 R(c,x,y,w,h,'#3a4844');R(c,x,y+h-26,w,26,'#2c3634');for(let i=0;i<3;i++){R(c,x+4,y+20+i*14,40,2,'#56625e');for(let b=0;b<5;b++)R(c,x+6+b*8,y+13+i*14,4,7,['#6a8aa0','#a06a5a','#e8e4d8','#5a9a7a','#3a7aff'][(b+i)%5]);}
 const d={x:x+w-38,y:y+8,w:30,h:h-8},jolt=banged(lt)?1:0;R(c,d.x-2+jolt,d.y-2,d.w+4,d.h+2,'#1e2624');R(c,d.x+jolt,d.y,d.w,d.h,'#6a7472');R(c,d.x+jolt,d.y,d.w,2,'#8a9492');
 for(let i=0;i<d.w;i+=6)R(c,d.x+jolt+i,d.y+d.h-8,3,8,'#e8b820');R(c,d.x+jolt+11,d.y+8,9,9,'#101414');R(c,d.x+jolt+12,d.y+9,7,7,'#1e2a2a');
 // A hand against the porthole after the first blows.
 if(lt>VARGA.bang[1]){R(c,d.x+jolt+13,d.y+10,4,4,'#9a8a78');R(c,d.x+jolt+13,d.y+9,1,2,'#9a8a78');R(c,d.x+jolt+15,d.y+9,1,2,'#9a8a78');R(c,d.x+jolt+14,d.y+13,2,1,'#5a1010');}
 R(c,d.x+jolt+d.w-6,d.y+20,3,6,'#3a3a3a');const lamp=Math.floor(lt*2.5)%2||lt>VARGA.bang[0];R(c,d.x+11,d.y-6,8,4,lamp?'#ff2a1a':'#5a0a08');
 R(c,x+8,y+2,w-50,2,fl>.5?'#f2fff4':'#6a7470');
 c.globalAlpha=1-fl;R(c,x,y,w,h,'#000');c.globalAlpha=1;}
// Dr. Varga, close: hair coming out of its bun, shadows under her eyes, her coat. She looks round at the door when the banging starts.
function varga(c,lt,x,y){const talk=VARGA.speech.some(([a,b])=>lt>=a&&lt<b),m=talk?(Math.sin(lt*21)>.2?2:Math.sin(lt*21+2)>0?1:0):0,look=lt>=VARGA.bang[0]+.1&&lt<VARGA.bang[0]+1.6,shake=banged(lt)?1:0;
 const X=x+shake,coat='#e2e4e6';for(let j=0;j<34;j++){const half=Math.min(30,12+j*2);R(c,X+16-half,y+40+j,half*2,1,j<2?'#c8ccd0':coat);}R(c,X+12,y+40,8,14,'#4a5a6a');R(c,X+15,y+40,2,12,'#2a3644');
 R(c,X-6,y+48,10,6,'#3a7aff');text(c,'M',X-5,y+48,'#ffffff');
 // Her hair down past her collar and pushed back off a narrow face, one grey streak; the neck in shadow under the jaw.
 R(c,X+3,y+8,26,34,'#1a1210');R(c,X+7,y+8,18,26,'#d8b8a0');R(c,X+9,y+34,14,2,'#d8b8a0');R(c,X+12,y+36,8,5,'#b89a86');R(c,X+7,y+31,2,3,'#c4a48e');R(c,X+23,y+31,2,3,'#c4a48e');
 R(c,X+4,y+3,24,7,'#1a1210');R(c,X+9,y,14,4,'#1a1210');R(c,X+7,y+8,9,3,'#1a1210');R(c,X+19,y+2,2,7,'#8a8480');R(c,X+2,y+30,3,12,'#1a1210');R(c,X+27,y+30,3,12,'#1a1210');
 if(!look){R(c,X+10,y+17,3,2,'#1a1210');R(c,X+19,y+17,3,2,'#1a1210');R(c,X+10,y+19,3,1,'#9a7a70');R(c,X+19,y+19,3,1,'#9a7a70');R(c,X+9,y+14,5,1,'#3a2a22');R(c,X+18,y+14,5,1,'#3a2a22');R(c,X+15,y+19,2,6,'#c09a86');
  R(c,X+12,y+29,8,1,'#a4565a');if(m)R(c,X+13,y+30,6,m,'#3a1210');}
 else{R(c,X+20,y+17,3,2,'#1a1210');R(c,X+24,y+17,2,2,'#1a1210');R(c,X+22,y+20,3,5,'#c09a86');R(c,X+18,y+29,6,1,'#a4565a');R(c,X+4,y+8,6,24,'#1a1210');}
 // The strip light is all that lights her: cold, from above.
 c.globalAlpha=.12;R(c,X+6,y+8,20,8,'#e8fff0');c.globalAlpha=1;}
// The satellite link: rows that slip, a block here and there that will not update, and a freeze before it dies.
function link(c,lt,x,y,w,h){const f=Math.floor(lt*24);if(hash(f*7)<.12){const ry=y+Math.floor(hash(f*3)*h),rh=2+Math.floor(hash(f*5)*5);c.drawImage(c.canvas,x,ry,w,rh,x+(hash(f)-.5)*8,ry,w,rh);}
 for(let i=0;i<3;i++)if(hash(f*13+i)<.15){const bx=x+Math.floor(hash(f*17+i)*(w/8))*8,by=y+Math.floor(hash(f*19+i)*(h/8))*8;c.drawImage(c.canvas,bx,by,1,1,bx,by,8,8);}}
export function vargaAssets(){const k=(w,h)=>{const e=document.createElement('canvas');e.width=w;e.height=h;e.getContext('2d',{willReadFrequently:false});return e;};return {frozen:k(240,135)};}
function live(c,lt){R(c,0,0,240,135,'#0a0e1e');for(let j=0;j<135;j++)if(j%3===0)R(c,0,j,240,1,'#0c1226');
 R(c,0,4,240,12,'#7a0a14');R(c,0,15,240,1,'#c8102e');text(c,'NATIONAL EMERGENCY',38,7,'#ffffff');R(c,4,5,30,10,'#ffffff');text(c,'MTNN',6,6,'#c8102e');R(c,206,5,30,10,'#c8102e');text(c,'LIVE',210,6,'#ffffff');
 const L={x:6,y:20,w:110,h:72},Rt={x:124,y:20,w:110,h:72};
 c.save();c.beginPath();c.rect(L.x,L.y,L.w,L.h);c.clip();anchorBox(c,lt,L.x,L.y,L.w,L.h);c.restore();
 c.save();c.beginPath();c.rect(Rt.x,Rt.y,Rt.w,Rt.h);c.clip();lab(c,lt,Rt.x,Rt.y,Rt.w,Rt.h);varga(c,lt,Rt.x+30,Rt.y+8);c.restore();link(c,lt,Rt.x,Rt.y,Rt.w,Rt.h);
 for(const b of [L,Rt]){R(c,b.x-1,b.y-1,b.w+2,1,'#3a5ad8');R(c,b.x-1,b.y+b.h,b.w+2,1,'#3a5ad8');}
 bug(c,'VIA SATELLITE',Rt.x+3,Rt.y+Rt.h-12,'#000000a0','#ffd400');
 lowerThird(c,{tag:'DR. ILSE VARGA',tagColor:'#c8102e',headline:'MARROW CHIEF SCIENTIST',y:96});
 ticker(c,VARGA.ticker,lt,{station:'MTNN',color:'#c8102e',clock:'11:58'});captions(c,VARGA.captions,lt,22);}
// The picture at local time lt: live until the freeze, then the frozen frame breaking up.
export function antidote(c,lt,A){if(lt<VARGA.freeze){live(c,lt);return;}
 const fz=A.frozen.getContext('2d');live(fz,VARGA.freeze-.001);breakup(c,A.frozen,ease(clamp((lt-VARGA.freeze)/(VARGA.lost-VARGA.freeze)))*.95,Math.floor(lt*30),240,135);
 if(lt>=VARGA.lost){R(c,0,0,240,135,'#000');}}
export const antidoteAssets=vargaAssets;
