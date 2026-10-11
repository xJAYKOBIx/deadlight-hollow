// Act one, in the room: the flatscreen filling most of the view, the dark wall and the console at its edges taking the colour of whatever
// is on, and a slow push in across the whole broadcast. When the signal dies the lamp flickers, the power goes, and in the black glass a
// match flares: the survivor lighting a candle, the dog at their feet and the cat on the armrest.
import {R,clamp,ease,lerp,hash,canvas} from '../intro/kit.js';
import {FW,FH,smooth} from './film.js';
import {picture,tvAssets,TV,PW,PH} from './tv.js';
import {ROOM,roomAssets,reflectionAssets,reflection} from './room.js';
// When things happen after the broadcast, from the moment the power cuts.
export const DARK={match:2.4,light:3.5,out:4.3,end:10.5};
export const SET={cut:TV.end,end:TV.end+DARK.end};
export function setAssets(look,pets){const pic=canvas(PW,PH);pic.getContext('2d',{willReadFrequently:false});
 const probe=canvas(4,2);return {tv:tvAssets(),room:roomAssets(),ref:reflectionAssets(look,pets),pic,probe,pc:probe.getContext('2d',{willReadFrequently:true})};}
// The screen's average colour and how bright it is.
function average(A){A.pc.imageSmoothingEnabled=true;A.pc.drawImage(A.pic,0,0,4,2);const d=A.pc.getImageData(0,0,4,2).data;let r=0,g=0,b=0;for(let i=0;i<d.length;i+=4){r+=d[i];g+=d[i+1];b+=d[i+2];}r/=8;g/=8;b/=8;
 const m=Math.max(r,g,b,1);return {col:`rgb(${r/m*255|0},${g/m*255|0},${b/m*255|0})`,lum:(r*.3+g*.55+b*.15)/255};}
// The lamp: steady, then stuttering as the power fails in the last seconds of NO SIGNAL.
function lampAt(t){const fail=SET.cut-2.2;if(t<fail)return 1;if(t>=SET.cut)return 0;const f=Math.floor(t*18);return hash(f*7)<.5+(t-fail)*.18?(hash(f)<.5?.25:0):1;}
// Where the camera looks (in room pixels): width of the view and its centre.
function camera(t){const k=smooth(t/SET.cut),vw=t<SET.cut?lerp(290,252,k):lerp(252,232,smooth((t-SET.cut)/DARK.end));
 const drift=Math.sin(t*.37)*.8+Math.sin(t*.91)*.4;return {vw,cx:(t<SET.cut?lerp(224,212,k):210)+drift,cy:t<SET.cut?lerp(119,110,k):lerp(110,107,smooth((t-SET.cut)/DARK.end))};}
export function setShot(c,t,A){const S=ROOM.screen,{vw,cx,cy}=camera(t),vh=vw*FH/FW,s=FW/vw;
 // The picture, unless the power is gone; the panel dims and wavers as the power fails.
 const p=A.pic.getContext('2d');let info={on:false,led:false};const lamp=lampAt(t),power=t<SET.cut;
 if(power){info=picture(p,t,A.tv);if(lamp<1&&t>SET.cut-2.2){p.globalAlpha=1-lamp*.5;p.fillStyle='#000';p.fillRect(0,0,PW,PH);p.globalAlpha=1;}}
 const av=power&&info.on?average(A):{col:'#000',lum:0};
 c.save();c.scale(s,s);c.translate(-(cx-vw/2),-(cy-vh/2));c.imageSmoothingEnabled=false;
 c.drawImage(A.room.dark,0,0);c.globalCompositeOperation='lighter';
 // The screen's light, tinted with what is on it.
 if(av.lum>0){const tc=A.room.tint.c;tc.globalCompositeOperation='source-over';tc.drawImage(A.room.screen,0,0);tc.globalCompositeOperation='multiply';tc.fillStyle=av.col;tc.fillRect(0,0,ROOM.w,ROOM.h);
  c.globalAlpha=Math.min(1,.3+av.lum*2.2);c.drawImage(A.room.tint.k,0,0);}
 if(lamp>0){c.globalAlpha=.8*lamp;c.drawImage(A.room.lamp,0,0);}
 // After the cut, the candle behind you.
 const lt=t-SET.cut,k=clamp((lt-DARK.light)/.9),m=lt<DARK.match?0:lt<DARK.match+.15?(lt-DARK.match)/.15:lt<DARK.out?Math.max(.45,1-(lt-DARK.match-.15)*.8):Math.max(0,.45-(lt-DARK.out)*2);
 const candle=power?0:clamp(k*.9+m*.6)*(1+Math.sin(t*13)*.06);if(candle>0){c.globalAlpha=.35*candle;c.drawImage(A.room.front,0,0);}
 c.globalAlpha=1;c.globalCompositeOperation='source-over';
 // The panel: the picture, or black glass holding the reflection.
 if(power&&info.on){c.drawImage(A.pic,S.x,S.y);}
 else{R(c,S.x,S.y,S.w,S.h,'#020203');if(!power){const img=reflection(A.ref,t,k,m);c.globalCompositeOperation='lighter';c.globalAlpha=.62;c.imageSmoothingEnabled=true;c.drawImage(img,S.x,S.y,S.w,S.h);c.globalAlpha=1;c.globalCompositeOperation='source-over';}}
 // Glass: a faint sheen across the top left, a lighter line along the top edge.
 const g=c.createLinearGradient(S.x,S.y,S.x+S.w*.6,S.y+S.h);g.addColorStop(0,'rgba(255,255,255,.07)');g.addColorStop(.45,'rgba(255,255,255,.015)');g.addColorStop(.46,'rgba(255,255,255,0)');c.fillStyle=g;c.fillRect(S.x,S.y,S.w,S.h);
 if(info.led){R(c,ROOM.led.x,ROOM.led.y,2,1,'#ff2a1a');c.globalCompositeOperation='lighter';c.globalAlpha=.5;R(c,ROOM.led.x-1,ROOM.led.y-1,4,3,'#ff2a1a');c.globalAlpha=1;c.globalCompositeOperation='source-over';}
 c.restore();
 return {bloom:info.led?1.4:power?.18+av.lum*.25:.9,grade:power?null:['#ff9a40',.12,'soft-light'],vignette:.75,grain:.1,led:info.led};}
