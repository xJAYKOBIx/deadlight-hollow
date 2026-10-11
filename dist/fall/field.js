// CH 6 live, segment 5 of the script: the field crew outside St. Agnes. Alex Park starts his piece to camera; over his shoulder a man in
// a hospital gown comes out of the ER and brings a nurse down. The camera zooms past Alex onto it. The man looks up into the lens, others
// in the crowd turn, and the crew runs: sky, asphalt and running feet, then the camera hits the ground on its side and keeps rolling on a
// sideways forecourt until something walks up to the lens and the feed cuts. The station's graphics stay level over all of it, and the
// ticker keeps promising clear skies.
// The forecourt is a picture wider than the screen (360 × 160) that the news camera pans, zooms and finally tips over, so the moves are
// real camera moves; people are drawn into it every frame.
import {R,hash,clamp,ease,lerp,canvas,rng} from '../intro/kit.js';
import {text,width} from '../intro/font.js';
import {captions,lowerThird,ticker,bug} from '../intro/overlay.js';
export const FIELD={dur:15.4,zoom:[3.9,5.7],fall:[5.9,6.25],look:8.3,turn:8.9,run:9.5,sky:[9.95,10.6],feet:[10.6,11.6],drop:11.6,step:13.4,cut:14.6,
 captions:[[.5,'ALEX PARK, LIVE OUTSIDE'],[1.5,'ST. AGNES, WHERE-'],[4.5,'OH MY GOD.'],[5.3,'ARE YOU GETTING THIS?'],[7,'IS HE... IS HE EATING HER?'],[9.4,'RUN! GO, GO!'],[10.3,'[SCREAMING]']],
 speech:[[.5,2.4],[4.5,6],[7,8.1],[9.4,10]],
 ticker:'WEATHER: CLEAR SKIES TONIGHT, LOW OF 54 · SCHOOL BOARD MEETS THURSDAY · MARROW STOCK CLOSES AT A RECORD HIGH · '};
const W=360,H=160,PW=240,PH=135,DOORS={x:176,w:48,y:84,h:34};
// A person at a distance, h pixels tall, standing on (x, y). pose: stand, walk, run, crouch (bent over something), down (lying, head
// left), dive. face: f, b, l or r. head turns the head alone. lit: a colour for the edge facing the ER doors.
function person(c,o){const {x,y,h,skin='#a87a5c',hair='#1a1412',top='#2a3040',bottom='#1a1c22',pose='stand',phase=0,face='f',lit=null}=o,head=o.head||face;
 const hd=Math.max(3,Math.round(h*.18)),tw=Math.max(3,Math.round(h*.24)),th=Math.round(h*.36),lg=h-hd-th,X=Math.round(x),Y=Math.round(y);
 if(pose==='down'){R(c,X-h/2,Y-tw,h-hd,tw,top);R(c,X-h/2+th,Y-tw+1,lg,tw-1,bottom);R(c,X-h/2-hd,Y-hd,hd,hd,skin);R(c,X-h/2-hd,Y-hd,hd,2,hair);return;}
 if(pose==='dive'){R(c,X-h/2,Y-h*.55,h-hd,tw,top);R(c,X-h/2+th,Y-h*.55+1,lg,tw-1,bottom);R(c,X+h/2-hd,Y-h*.55-1,hd,hd,skin);return;}
 if(pose==='crouch'){const bob=Math.round(Math.sin(phase*Math.PI*2)*1),bx=X-tw/2;R(c,bx,Y-lg*.6,tw,lg*.6,bottom);R(c,bx-th*.5,Y-lg*.6-tw+1,th+2,tw,top);
  R(c,bx-th*.5-hd+1,Y-lg*.6-tw+2+bob+(head==='f'?-3:0),hd,hd,skin);if(head==='f'){const fx=bx-th*.5-hd+1,fy=Y-lg*.6-tw+bob-1;R(c,fx,fy,hd,1,hair);R(c,fx+1,fy+1,1,1,'#0a0606');R(c,fx+3,fy+1,1,1,'#0a0606');R(c,fx+1,fy+3,3,1,'#5a0c0c');R(c,fx+1,fy+4,3,1,'#7a1414');R(c,fx+2,fy+5,1,2,'#7a1414');R(c,fx+hd,fy+5,3,2,'#6a1010');}
  else R(c,bx-th*.5-hd+1,Y-lg*.6-tw+2+bob,hd,2,hair);return;}
 // Legs: two columns, swinging when walking or running.
 const sw=pose==='walk'?Math.round(Math.sin(phase*Math.PI*2)*h*.06):pose==='run'?Math.round(Math.sin(phase*Math.PI*2)*h*.14):0,lean=pose==='run'?Math.round(h*.08)*(face==='l'?-1:face==='r'?1:0):0,lw=Math.max(1,Math.round(tw/2)-(tw>3?0:0));
 R(c,X-lw+sw,Y-lg,lw,lg,bottom);R(c,X-sw,Y-lg,lw,lg,bottom);
 // Body, with the arms as darker columns at its sides, and the lit edge.
 const bx=X-Math.round(tw/2)+lean,by=Y-lg-th;R(c,bx,by,tw,th,top);if(face!=='l'&&face!=='r'){R(c,bx-1,by+1,1,th-2,top);R(c,bx+tw,by+1,1,th-2,top);}
 if(pose==='run'){R(c,bx+(face==='l'?-2:tw),by+2-sw*.3,2,th*.6,top);}
 if(lit)R(c,bx+tw-1,by,1,th,lit);
 // Head and hair: the face shows unless they face away.
 const hx=bx+Math.round((tw-hd)/2)+(head==='l'?-1:head==='r'?1:0),hy=by-hd;R(c,hx,hy,hd,hd,head==='b'?hair:skin);R(c,hx,hy,hd,Math.max(1,Math.round(hd*.35)),hair);
 if(head==='l')R(c,hx+hd-1,hy,1,hd-1,hair);if(head==='r')R(c,hx,hy,1,hd-1,hair);if(head==='f'&&hd>=4){R(c,hx+1,hy+Math.round(hd*.5),1,1,'#120c0a');R(c,hx+hd-2,hy+Math.round(hd*.5),1,1,'#120c0a');}}
// The forecourt behind everything that moves: the hospital front, the ER doors and canopy, a cruiser and the ambulance, wet asphalt.
function forecourt(){const k=canvas(W,H),c=k.getContext('2d'),r=rng(612);
 for(let y=0;y<40;y++)R(c,0,y,W,1,`rgb(${6+y*.25|0},${8+y*.2|0},${16+y*.25|0})`);
 // Far off to the left, the sky over the city has a glow under it.
 for(let y=10;y<46;y++){const k2=(y-10)/36;c.globalAlpha=k2*.5;R(c,0,y,70,1,'#7a3418');c.globalAlpha=1;}
 // The hospital: a low wing on the left, the main block, rows of windows, the roofline lights.
 R(c,0,44,64,62,'#121620');R(c,58,6,W-58,100,'#1a1f2a');R(c,58,6,W-58,2,'#2a3242');for(let x=60;x<W;x+=40)R(c,x,8,1,96,'#151a24');
 for(let wy=14;wy<64;wy+=10)for(let wx=64;wx<W-4;wx+=10){const n=r();R(c,wx,wy,6,5,n<.22?'#c9b47a':n<.36?'#8fb2c8':n<.42?'#3a1a1a':'#0c0f16');if(n<.36)R(c,wx,wy+4,6,1,'#00000040');}
 for(let wy=52;wy<96;wy+=9)for(let wx=4;wx<60;wx+=9)R(c,wx,wy,5,4,r()<.3?'#a89a6a':'#0b0d14');
 for(let x=62;x<W;x+=16)R(c,x,5,1,1,'#ff3a2a');
 // The ER: sign, canopy on pillars, the lit doors with people moving behind the glass.
 R(c,168,66,62,11,'#2a0606');R(c,169,67,60,9,'#7a0a0a');text(c,'EMERGENCY',171,68,'#ffd8d0');
 R(c,146,78,150,5,'#2a2e38');R(c,146,78,150,1,'#4a505e');for(let x=152;x<292;x+=12)R(c,x,83,3,1,'#f2f6ff');R(c,154,83,3,36,'#22262e');R(c,284,83,3,36,'#22262e');
 const d=DOORS;R(c,d.x-3,d.y-2,d.w+6,d.h+2,'#2c323e');for(let y=0;y<d.h;y++)R(c,d.x,d.y+y,d.w,1,`rgb(${150+y*1.6|0},${200+y*.8|0},${212})`);R(c,d.x+d.w/2-1,d.y,2,d.h,'#5a6a7a');
 for(const [px,ph] of [[184,18],[206,20],[214,17]]){R(c,px,d.y+d.h-ph,4,ph,'#6a8a96');R(c,px,d.y+d.h-ph-4,4,4,'#7a9aa6');}
 // The doors' light spilling out over the ground, and the ground: kerb, forecourt, asphalt.
 R(c,0,104,W,14,'#20232a');R(c,0,104,W,1,'#30343c');for(let y=118;y<H;y++)R(c,0,y,W,1,y%7===0?'#14161b':'#111317');
 const g=c.createRadialGradient(d.x+d.w/2,d.y+d.h,4,d.x+d.w/2,d.y+d.h,70);g.addColorStop(0,'#9fd4e055');g.addColorStop(1,'#9fd4e000');c.fillStyle=g;c.fillRect(d.x-80,104,d.w+160,H-104);
 // The doors and the lights, smeared down the wet asphalt.
 c.globalAlpha=.12;for(let y=119;y<H;y+=1)if(hash(y*3)<.6)R(c,d.x+4+hash(y)*6,y,d.w-10,1,'#cfeaf0');c.globalAlpha=1;
 // The ambulance, back doors open, and a cruiser on the left.
 R(c,262,90,66,26,'#d8dcdf');R(c,262,90,66,2,'#f2f4f6');R(c,262,104,66,3,'#c8102e');R(c,316,96,18,20,'#c9cdd0');R(c,322,98,10,7,'#1a2230');R(c,262,116,72,4,'#0a0b0e');
 for(const wx of [272,322])R(c,wx-5,114,10,8,'#0a0a0c');R(c,256,92,6,22,'#e8ecef');R(c,264,93,24,10,'#2a3a48');
 R(c,16,108,52,12,'#0e1016');R(c,24,103,34,7,'#14161e');R(c,26,104,30,4,'#2a3446');R(c,16,118,52,3,'#060608');for(const wx of [24,58])R(c,wx-4,117,8,7,'#050506');
 // A gurney by the doors with a sheet over someone.
 R(c,226,113,30,3,'#c8ccd2');R(c,228,116,1,5,'#6a6e78');R(c,253,116,1,5,'#6a6e78');R(c,228,109,26,4,'#e8ecf0');R(c,228,108,6,2,'#e8ecf0');R(c,236,110,4,1,'#8a2a2a');
 return k;}
// Who is standing round outside: [x, y, height, top, bottom, face, turns (looks into the lens later)].
const CROWD=[[86,126,24,'#3a2e2a','#1a1a20','b',0],[98,128,25,'#2a3a4a','#22242a','r',0],[118,124,23,'#4a3a2a','#1c1e24','b',1],[134,127,26,'#30303a','#18181e','f',0],
 [150,122,22,'#5a4a3a','#202228','b',0],[166,125,24,'#2a4a3a','#1a1c22','r',1],[248,124,24,'#3a3a46','#1c1c22','l',0],[262,128,26,'#4a2a2a','#1a1a20','b',1],[290,126,25,'#2a3446','#16181e','l',0],[306,123,23,'#3a3a3a','#1a1a1e','f',0]];
const GOWN='#9fb4c4',PALE='#b8b4a2',SCRUBS='#2f8f8a';
// What happens on the forecourt at local time t: the gown man comes out of the doors, the nurse turns, he takes her down and feeds,
// then looks up; some of the crowd look round at the camera too.
function players(c,t,F){const strobe=Math.floor(t*6)%2;
 for(const [x,y,h,top,bottom,face,turns] of CROWD){const fled=t>F.run+.2&&!turns,dx=fled?(t-F.run-.2)*(x<200?-60:70):0;if(fled&&Math.abs(dx)>140)continue;
  person(c,{x:x+dx,y,h,top,bottom,face:fled?(dx<0?'l':'r'):face,head:turns&&t>F.turn?'f':undefined,pose:fled?'run':'stand',phase:t*3+x,skin:turns?PALE:'#9a7258',lit:x>160&&x<260?'#6a9aa6':null});
  if(turns&&t>F.turn)R(c,Math.round(x)-1,y-h+Math.round(h*.18*.5)+1,3,1,'#2a0a08');}
 const NX=214,NY=124;
 // The nurse beside the gurney, then on the ground.
 if(t<F.fall[0])person(c,{x:NX,y:NY,h:25,top:SCRUBS,bottom:'#26716c',skin:'#a87a5c',hair:'#2a1a12',face:t>F.zoom[0]+.6?'l':'r',lit:'#9fd4e0'});
 else person(c,{x:NX-2,y:NY+3,h:25,top:SCRUBS,bottom:'#26716c',skin:'#a87a5c',hair:'#2a1a12',pose:'down'});
 // The man in the gown: out of the doors at a stagger, faster as he nears her, a dive, then over her.
 const out=1.2,gx=t<out?204:t<F.fall[0]?lerp(204,NX+6,ease(clamp((t-out)/(F.fall[0]-out)))):NX+4,gy=t<out?118:lerp(118,NY,clamp((t-out)/(F.fall[0]-out)));
 if(t>=out-.4&&t<F.fall[0])person(c,{x:gx,y:gy,h:26,top:GOWN,bottom:PALE,skin:PALE,hair:'#6a6660',face:'l',pose:t>F.fall[0]-.9?'run':'walk',phase:t*(t>F.fall[0]-.9?3.4:1.6)});
 else if(t>=F.fall[0]&&t<F.fall[1])person(c,{x:NX,y:NY-2,h:26,top:GOWN,bottom:PALE,skin:PALE,pose:'dive'});
 else if(t>=F.fall[1])person(c,{x:NX+6,y:NY+2,h:26,top:GOWN,bottom:PALE,skin:PALE,hair:'#6a6660',pose:'crouch',head:t>F.look&&t<F.look+2.4?'f':'l',phase:t>F.look&&t<F.look+2.4?0:t*2.2});
 // Blood under them once he is on her.
 if(t>F.fall[1]+.6){const k=clamp((t-F.fall[1]-.6)/3);R(c,NX-10,NY+3,Math.round(6+k*12),2,'#3a0606');}
 // Police lights wash over the forecourt.
 c.globalAlpha=.16;R(c,0,0,W,H,strobe?'#ff2020':'#2040ff');c.globalAlpha=1;
 for(const [lx,ly] of [[30,102],[48,102]]){R(c,lx,ly,6,2,(lx===30)===!!strobe?'#ff3a2a':'#3a6aff');}
 R(c,270,88,6,2,strobe?'#ff3a2a':'#ffffff');R(c,282,88,6,2,strobe?'#ffffff':'#ff3a2a');}
// Alex, close to the camera on the left: waist up, mic in hand, talking until he turns to look over his shoulder.
function alex(c,t,F){const x=38,y=56,turn=t>F.zoom[0]-.5,talk=F.speech.some(([a,b])=>t>=a&&t<b&&a<3)&&!turn,m=talk&&Math.sin(t*23)>0?2:talk&&Math.sin(t*23+1)>.3?1:0;
 for(let yy=28;yy<104;yy++){const half=yy<34?20+(yy-28)*2.4:34,cx=x+30;for(let xx=-half;xx<half;xx+=1){const col=xx<-half+3?'#2a3650':xx>half-3?'#3a6a7a':xx<-6?'#1c2433':xx>6?'#18202e':'#1a2231';R(c,cx+xx,y+yy,1,1,col);}}
 R(c,x+24,y+28,12,10,'#cfe0f0');R(c,x+27,y+28,6,12,'#1a2231');R(c,x+29,y+28,2,8,'#7a1a24');
 R(c,x+24,y+20,12,9,'#a87050');
 // The head: front on while he talks, three-quarters away once he turns.
 const hx=x+19,hy=y;R(c,hx,hy,22,24,'#c49070');R(c,hx,hy+16,22,8,'#b07e60');R(c,hx-1,hy,24,7,'#141012');R(c,hx-1,hy+6,3,5,'#141012');R(c,hx+20,hy+6,3,5,'#141012');
 if(!turn){R(c,hx+5,hy+11,3,2,'#1a100c');R(c,hx+14,hy+11,3,2,'#1a100c');R(c,hx+4,hy+9,5,1,'#2a1812');R(c,hx+13,hy+9,5,1,'#2a1812');R(c,hx+10,hy+12,2,5,'#a87050');
  R(c,hx+7,hy+18,8,1,'#7a3a32');if(m)R(c,hx+8,hy+19,6,m,'#3a1210');R(c,hx-2,hy+9,2,6,'#b07e60');R(c,hx+22,hy+9,2,6,'#b07e60');}
 else{R(c,hx-1,hy,16,24,'#141012');R(c,hx+14,hy+8,8,12,'#c49070');R(c,hx+19,hy+11,2,2,'#1a100c');R(c,hx+12,hy+9,3,6,'#b07e60');}
 // The mic, with the station's 6 on its flag.
 const mx=x+8,my=y+30;R(c,mx+2,my+8,4,22,'#0c0c0e');R(c,mx,my,8,9,'#2a2a30');R(c,mx-2,my+8,12,9,'#1a5ad8');text(c,'6',mx+1,my+9,'#ffffff');R(c,mx-1,my+28,10,10,'#b07e60');R(c,mx-1,my+28,10,2,'#c49070');
 // The camera light on him, and the ER's cold light along his far edge.
 c.globalAlpha=.08;R(c,x+12,y,36,60,'#fff4e0');c.globalAlpha=1;}
// Looking up while running: night sky, the hospital's roofline swinging past, a helicopter's searchlight.
function sky(c,t,F){const k=(t-F.sky[0])/(F.sky[1]-F.sky[0]);R(c,0,0,PW,PH,'#070912');c.save();c.translate(PW/2,PH/2);c.rotate(-.5+k*1.1);
 for(let y=-160;y<160;y++)R(c,-200,y,400,1,y>40?'#1a1f2a':`rgb(${7+Math.max(0,y+160)*.03|0},${9+Math.max(0,y+160)*.03|0},${18+Math.max(0,y+160)*.05|0})`);
 for(let wx=-200;wx<200;wx+=10)R(c,wx,48,6,5,hash(wx)<.3?'#c9b47a':'#0c0f16');
 const hx=-60+k*90,hy=-30;R(c,hx,hy,8,3,'#2a2c34');R(c,hx-6,hy-1,20,1,'#4a4c54');R(c,hx+3,hy+3,1,1,Math.floor(t*4)%2?'#ff3a2a':'#2a0a08');
 c.globalAlpha=.22;c.fillStyle='#e8f0ff';c.beginPath();c.moveTo(hx+4,hy+3);c.lineTo(hx-30,hy+200);c.lineTo(hx+40,hy+200);c.fill();c.globalAlpha=1;c.restore();}
// The camera hanging at the operator's side as they run: asphalt rushing past, and legs.
function feet(c,t,F){const k=(t-F.feet[0])/(F.feet[1]-F.feet[0]),f=Math.floor(t*30);c.save();c.translate(PW/2,PH/2);c.rotate(.25+Math.sin(t*9)*.18);
 for(let y=-160;y<160;y+=2)R(c,-200,y,400,2,hash(y*7+f*3)<.2?'#1c1d22':'#131418');for(let i=0;i<40;i++){const px=(hash(i*13)*400+t*900)%400-200,py=hash(i*29)*300-150;R(c,px,py,8,1,'#2a2c32');}
 R(c,-200,-30,400,4,'#e8d890');R(c,-200,-26,400,1,'#8a7a40');
 // Running legs: the operator's own, and someone passing.
 for(const [ox,col,ph] of [[-60,'#1a1c24',0],[40,'#2a3a4a',.5]]){const s=Math.sin((t*7+ph)*Math.PI*2);R(c,ox+s*20,-80,12,70,col);R(c,ox-s*20+14,-80,12,70,col);R(c,ox+s*20-2,-12,16,8,'#d8d8dc');R(c,ox-s*20+12,-12,16,8,'#d8d8dc');}
 c.restore();c.globalAlpha=.25;R(c,0,0,PW,PH,Math.floor(t*6)%2?'#ff2020':'#2040ff');c.globalAlpha=1;}
// A crack across the lens once it has hit the ground.
function crack(c){c.save();c.strokeStyle='#e8f0ff';c.lineWidth=1;c.globalAlpha=.55;const ox=168,oy=40;
 for(let i=0;i<9;i++){let x=ox,y=oy,a=hash(i*17)*Math.PI*2;c.beginPath();c.moveTo(x,y);for(let s=0;s<6;s++){a+=(hash(i*31+s)-.5)*.8;const d=8+hash(i*7+s*3)*18;x+=Math.cos(a)*d;y+=Math.sin(a)*d;c.lineTo(x,y);}c.stroke();}
 c.globalAlpha=.3;c.beginPath();c.arc(ox,oy,10,0,7);c.stroke();c.restore();}
// The camera: where it points (cx, cy in the forecourt), how far it is zoomed and how far it has tipped, with the operator's hands in it.
function cam(t,F){const wob=(a,s=1)=>Math.sin(t*1.7*s+a)*.6+Math.sin(t*3.1*s+a*2)*.3;let cx=150,cy=92,z=1,rot=0;
 if(t>=F.zoom[0]){const k=ease(clamp((t-F.zoom[0])/(F.zoom[1]-F.zoom[0])));cx=lerp(150,214,k);cy=lerp(92,113,k);z=lerp(1,2.3,k);}
 if(t>=F.run){const k=clamp((t-F.run)/.45);cx=lerp(214,-20,k*k);z=lerp(2.3,1.2,k);}
 if(t>=F.drop){cx=222;cy=104;z=2.2;rot=-Math.PI/2+.07;const b=t-F.drop;if(b<.35){rot+=Math.sin(b*40)*.08*(1-b/.35);cy+=Math.sin(b*30)*3*(1-b/.35);}return {cx,cy,z,rot};}
 const hard=t>=F.run?3:t>=F.zoom[0]?1.3:1;return {cx:cx+wob(0)*hard,cy:cy+wob(2,1.3)*hard,z,rot};}
export function fieldAssets(){return {back:forecourt(),world:canvas(W,H)};}
export function field(c,t,A){const F=FIELD;R(c,0,0,PW,PH,'#000');
 if(t<F.cut){
  if(t>=F.sky[0]&&t<F.sky[1])sky(c,t,F);else if(t>=F.feet[0]&&t<F.feet[1])feet(c,t,F);
  else{const w=A.world.getContext('2d');w.drawImage(A.back,0,0);players(w,t,F);if(t<F.zoom[1]+.4)alex(w,t,F);
   // Something walks up to the lens and fills it.
   const {cx,cy,z,rot}=cam(t,F);c.save();c.imageSmoothingEnabled=false;c.translate(PW/2,PH/2);c.rotate(rot);c.scale(z,z);c.translate(-cx,-cy);c.drawImage(A.world,0,0);
   if(t>=F.step){const k=clamp((t-F.step)/(F.cut-F.step-.2)),s=lerp(.5,5,k*k);c.translate(cx-30+k*30,cy+10-k*4);c.scale(s,s);
    for(const [lx,ph] of [[-6,0],[3,.5]]){const sw=Math.round(Math.sin((t*1.6+ph)*Math.PI*2)*2);R(c,lx+sw,-26,5,26,'#7a7468');R(c,lx+sw+3,-26,2,26,'#5a554c');R(c,lx+sw,-30,5,5,'#8aa0b0');R(c,lx+sw-2,-2,8,3,'#4a4038');R(c,lx+sw+1,-14,2,3,'#4a0a08');}}
   c.restore();if(t>=F.step){c.globalAlpha=clamp((t-F.step)/(F.cut-F.step))**2;R(c,0,0,PW,PH,'#000');c.globalAlpha=1;}
   if(t>=F.drop){crack(c);c.globalAlpha=.35;R(c,0,0,PW,PH,'#000');c.globalAlpha=1;}}
  // A motion smear while the camera whips round.
  if(t>=F.run&&t<F.run+.5){c.globalAlpha=.5;for(let i=1;i<4;i++)c.drawImage(c.canvas,-i*6,0);c.globalAlpha=1;}
  if(t>=F.drop&&t<F.drop+.08){R(c,0,0,PW,PH,'#ffffff');}
  // The station's graphics, level over all of it.
  R(c,207,4,27,9,'#c8102e');text(c,'LIVE',210,5,'#ffffff');bug(c,'6',196,4,'#1a5ad8');
  if(t<F.zoom[0]+.8)lowerThird(c,{tag:'LIVE',headline:'ALEX PARK · ST. AGNES HOSPITAL',y:96,wipe:Math.min((t-.2)/.4,(F.zoom[0]+.8-t)/.3)});
  ticker(c,F.ticker,t,{station:'6 NEWS',color:'#1a5ad8',clock:'11:52'});captions(c,F.captions,t);}
 return t<F.cut;}
