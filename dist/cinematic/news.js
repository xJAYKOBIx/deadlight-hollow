// The cold open's timeline and the picture on the TV at any moment t (seconds). Everything is a function of t, so the clip plays the
// same every time and any frame can be shown on its own (?t=3.6).
import {SW,SH,anchor,saved,studio,graphic,desk,bars,noise,fire,rng} from './art.js';
import {text,width} from './font.js';
export const T={click:.1,warm:.2,on:.55,third:.75,crash:3.5,turn:3.58,enter:3.72,tear:4.3,stat:4.45,card:4.75,off:4.95,end:5.25};
export const SPEECH=[[1.0,3.42],[3.95,4.22]];
// Closed captions roll up two lines at a time, the way broadcast captions do.
export const CAPTIONS=[[1.0,'...PATIENTS FROM THE SAVED'],[1.5,'PROGRAM HAVE LEFT THEIR'],[2.0,'RECOVERY WARDS. POLICE ARE'],[2.5,'URGING EVERYONE TO STAY'],[2.95,'INDOORS AND REMAIN CA—'],[3.5,'[CRASH]'],[3.95,'SIR? SIR—']];
export const HEADLINE='THE SAVED: MIRACLE OR WARNING?';
export const TICKER='STAY INDOORS · LOCK YOUR DOORS · DO NOT APPROACH THE SAVED · HOSPITALS IN THREE STATES REPORT MISSING PATIENTS · ';
// Her speech as syllables: start, length and a vowel brightness the sound uses. The mouth opens on the same beats.
export const SYLLABLES=(()=>{const r=rng(11),out=[];for(const [a,b] of SPEECH){let t=a;while(t<b-.06){const words=1+(r()*3|0);for(let i=0;i<words&&t<b-.06;i++){const d=.07+r()*.08;out.push([t,d,.3+r()*.7]);t+=d+.015;}t+=.04+r()*.06;}}return out;})();
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v)),ease=k=>k*k*(3-2*k),hash=n=>{n=Math.imul(n^n>>>15,2246822507);n=Math.imul(n^n>>>13,3266489909);return((n^n>>>16)>>>0)/4294967296;};
export function mouthAt(t){for(const [s,d] of SYLLABLES)if(t>=s&&t<s+d){const o=Math.sin((t-s)/d*Math.PI);return o>.6?2:o>.2?1:0;}return 0;}
const blinkAt=t=>[1.32,2.64].some(b=>t>=b&&t<b+.08);
// The Saved staggers in from the right in lurches, then lunges.
export function savedAt(t){if(t<T.enter)return null;const k=clamp((t-T.enter)/(T.tear-T.enter)),steps=k*4,step=Math.floor(steps),f=steps-step,lurch=(step+ease(Math.min(1,f*1.6)))/4;
 return {x:214-48*lurch-(k>.8?(k-.8)*40:0),y:38+(f<.5?0:1),reach:clamp(k*1.6)};}
function make(w,h){const c=typeof OffscreenCanvas!=='undefined'?new OffscreenCanvas(w,h):Object.assign(document.createElement('canvas'),{width:w,height:h});return c;}
export function assets(){const back=make(SW,SH),b=back.getContext('2d'),fires=studio(b);graphic(b,120,24,text);
 const card=make(SW,SH),k=card.getContext('2d');bars(k);k.fillStyle='#000';k.fillRect(36,56,128,34);k.fillStyle='#f2f2f2';k.fillRect(36,56,128,1);k.fillRect(36,89,128,1);
 text(k,'PLEASE STAND BY',Math.round((SW-width('PLEASE STAND BY'))/2),62,'#f2f2f2');text(k,'CHANNEL 6',Math.round((SW-width('CHANNEL 6'))/2),75,'#9aa2b4');
 const statics=[0,1,2,3].map(i=>{const s=make(SW,SH);noise(s.getContext('2d'),100+i);return s;});
 return {back,fires,card,statics,live:make(SW,SH)};}
// The graphic sits in front of the window, so a fire behind it stays behind it.
function graphicCover(c,A){c.drawImage(A.back,119,23,74,50,119,23,74,50);}
// The broadcast itself: studio, anchor, the Saved, desk, then the graphics the control room lays over it.
function live(c,t,A){c.clearRect(0,0,SW,SH);c.save();const jolt=t>=T.crash&&t<T.crash+.3?1-(t-T.crash)/.3:0,fr=Math.floor(t*30);
 if(jolt){c.translate(Math.round((hash(fr)-.5)*5*jolt),Math.round((hash(fr+99)-.5)*4*jolt));}
 c.drawImage(A.back,0,0);c.save();c.beginPath();c.rect(0,10,SW,82);c.clip();for(const f of A.fires)fire(c,f,t);c.restore();graphicCover(c,A);const z=savedAt(t);if(z)saved(c,z.x,z.y,z.reach);
 const turned=t>=T.turn,recoil=turned?Math.min(3,(t-T.turn)*14):0;anchor(c,70-recoil,36,{turn:turned,mouth:mouthAt(t),blink:!turned&&blinkAt(t)});
 desk(c);c.restore();
 if(t>=T.on){c.fillStyle='#c8102e';c.fillRect(171,4,25,9);text(c,'LIVE',173,5,'#ffffff');}
 // Lower third wipes in from the left.
 const wipe=clamp((t-T.third)/.25);if(wipe>0){c.save();c.beginPath();c.rect(0,0,4+192*ease(wipe),SH);c.clip();
  c.fillStyle='#c8102e';c.fillRect(4,95,82,9);text(c,'BREAKING NEWS',6,96,'#ffffff');c.fillStyle='#f2f2f2';c.fillRect(4,104,192,12);text(c,HEADLINE,10,106,'#0d1a3a');c.fillStyle='#c8102e';c.fillRect(4,116,192,2);c.restore();}
 // The ticker.
 if(t>=T.third+.1){c.fillStyle='#05070d';c.fillRect(0,135,SW,11);c.fillStyle='#c8102e';c.fillRect(0,135,SW,1);c.save();c.beginPath();c.rect(36,135,SW-36,11);c.clip();
  const span=width(TICKER)+6,off=((t-.85)*46)%span;text(c,TICKER+TICKER,60-off,137,'#f2e6b0');c.restore();c.fillStyle='#f2c200';c.fillRect(0,135,36,11);text(c,'11:47',3,137,'#05070d');}
 // Captions: the last two lines, in black boxes.
 const shown=CAPTIONS.filter(([s])=>t>=s).slice(-2);shown.forEach(([,line],i)=>{const y=4+i*9+(shown.length===1?9:0);c.fillStyle='#000';c.fillRect(5,y-1,width(line)+2,9);text(c,line,6,y,'#ffffff');});}
// What the tube shows: warming up, the broadcast with the tube's roll and flicker, the signal tearing, static, the card, switching off.
export function screen(c,t,A){c.fillStyle='#000';c.fillRect(0,0,SW,SH);const fr=Math.floor(t*30);
 if(t<T.warm)return;
 if(t<T.on){const k=(t-T.warm)/(T.on-T.warm);live(A.live.getContext('2d'),T.on,A);
  if(k<.35){const w=SW*(.4+.6*k/.35);c.fillStyle='#e8f0ff';c.globalAlpha=.6+.4*k/.35;c.fillRect((SW-w)/2,SH/2-1,w,2);c.globalAlpha=1;return;}
  const e=ease((k-.35)/.65),h=Math.max(2,SH*e);c.drawImage(A.live,0,(SH-h)/2,SW,h);c.fillStyle='#e8f0ff';c.globalAlpha=(1-e)*.85;c.fillRect(0,(SH-h)/2,SW,h);c.globalAlpha=1;return;}
 if(t<T.stat){live(A.live.getContext('2d'),t,A);
  if(t<T.tear){c.drawImage(A.live,0,0);
   // A brighter band rolls slowly down the tube, and now and then the picture dips.
   const band=((t*38)%(SH+30))-15;c.fillStyle='#ffffff';c.globalAlpha=.05;c.fillRect(0,band,SW,10);c.globalAlpha=hash(fr)<.07?.12:0;c.fillStyle='#000';c.fillRect(0,0,SW,SH);c.globalAlpha=1;return;}
  // The signal tears: bands slide sideways, the picture rolls and static breaks through.
  const k=(t-T.tear)/(T.stat-T.tear),roll=Math.round(k*k*40);
  for(let y=0;y<SH;){const h=3+(hash(y*31+fr)*7|0),dx=Math.round((hash(y+fr*7)-.5)*60*k);c.drawImage(A.live,0,(y+roll)%SH,SW,h,dx,y,SW,h);if(hash(y+fr*3)<.3*k)c.drawImage(A.statics[fr%4],0,y,SW,h,0,y,SW,h);y+=h;}
  return;}
 if(t<T.card){c.drawImage(A.statics[fr%4],0,0);c.fillStyle='#000';c.globalAlpha=hash(fr)*.25;c.fillRect(0,0,SW,SH);c.globalAlpha=1;return;}
 if(t<T.off){c.drawImage(A.card,0,0);return;}
 // Switching off: the picture squeezes to a line, the line to a dot, and the dot fades.
 const k=(t-T.off)/(T.end-T.off);if(k>=1){const g=clamp(1-(t-T.end)/.4);if(g>0){c.fillStyle='#e8f0ff';c.globalAlpha=g*.5;c.fillRect(SW/2-1,SH/2-1,2,2);c.globalAlpha=1;}return;}
 if(k<.5){const e=ease(k/.5),h=Math.max(1,SH*(1-e));c.drawImage(A.card,0,(SH-h)/2,SW,h);c.fillStyle='#ffffff';c.globalAlpha=e*.9;c.fillRect(0,(SH-h)/2,SW,h);c.globalAlpha=1;return;}
 const e=ease((k-.5)/.5),w=Math.max(2,SW*(1-e));c.fillStyle='#ffffff';c.fillRect((SW-w)/2,SH/2-1,w,2);}
// How strongly the screen lights the room, and how much the viewer's eye drifts toward the TV.
export function roomLight(t){const fr=Math.floor(t*30);if(t<T.warm)return 0;if(t<T.on)return .25*((t-T.warm)/(T.on-T.warm));
 if(t<T.tear)return .5+.08*Math.sin(t*9)+(hash(fr)<.07?-.1:0);if(t<T.card)return .75+hash(fr)*.2;if(t<T.off)return .6;if(t<T.end)return .6*(1-(t-T.off)/(T.end-T.off));return 0;}
export const zoomAt=t=>1+.06*ease(clamp((t-T.on)/(T.tear-T.on)));
export function flinch(t){const fr=Math.floor(t*30),k=t>=T.crash&&t<T.crash+.25?1-(t-T.crash)/.25:t>=T.stat&&t<T.stat+.15?.6*(1-(t-T.stat)/.15):0;return k?{x:(hash(fr*5)-.5)*3*k,y:(hash(fr*5+1)-.5)*3*k}:{x:0,y:0};}
