// The intro's timeline, steps 1 and 2: the set wakes and lands on the Marrow ad, the viewer flips to MTNN's archive of the live trial,
// then to Channel 6's report on the queues, which the breaking news cuts into. The studio goes live to St. Agnes and the feed breaks up
// into NO SIGNAL. Each segment draws its own picture at its local time; the set's effects (flips, breakup, the channel number) are laid
// over the top. Everything is a function of t, so the clip plays the same every time and ?t= shows any frame.
import {canvas,R,rng,clamp,ease} from './kit.js';
import {text,width} from './font.js';
import {PW,PH,studio,fire,wall,anchor,desk,field} from './news.js';
import {logo,osd,breakup,flip,noSignal} from './tv.js';
import {ad,AD} from './ad.js';import {trial,TRIAL} from './trial.js';import {montage,MONTAGE} from './montage.js';
// Segments in order. A flip (the viewer changing channel) runs FLIP seconds before a segment starts; the news follows the sting directly.
const FLIP=.1,NEWS_DUR=13;
export const SEGMENTS=(()=>{const list=[['ad',AD.dur,2,'',true],['trial',TRIAL.dur,9,'MTNN',true],['montage',MONTAGE.dur,6,'CH6 NEWS',true],['news',NEWS_DUR,6,'',false]];let t=2.95;
 return list.map(([id,dur,ch,name,flips])=>{if(flips&&id!=='ad')t+=FLIP;const seg={id,start:t,dur,ch,name,flips};t+=dur;return seg;});})();
const seg=id=>SEGMENTS.find(s=>s.id===id),NEWS_AT=seg('news').start,LIVE_AT=NEWS_AT+NEWS_DUR;
export const T={click:.45,back:.5,logoIn:.8,logoOut:2.4,flip:2.85,first:2.95,news:NEWS_AT,live:LIVE_AT,crack:LIVE_AT+.4,lost:LIVE_AT+.95,end:LIVE_AT+3.45};
// Channel 6: captions roll up two lines at a time; speech spans drive the mouth and the voice.
export const NEWS={
 captions:[[.6,'...PATIENTS FROM THE FIRST WEEKS'],[1.8,'OF THE LZ-6 PROGRAM, ADMITTED'],[3,'THIS MORNING WITH A SUDDEN FEVER,'],[4.2,'DIED TONIGHT. AND THEY HAVE...'],[5.8,'...GOTTEN BACK UP.'],
  [7.8,"WE'RE NOW HEARING REPORTS OF"],[9,'ATTACKS. OF BITES.'],[10.6,"WE'RE GOING LIVE TO ALEX PARK"],[11.6,'AT ST. AGNES.']],
 speech:[[.6,5.2],[7.8,9.8],[10.6,12.2]],worry:5.8,ear:[6.5,7.6],turn:12.2,swap:9.3,live:10.6,
 headlines:['THE SAVED: MIRACLE OR WARNING?','ATTACKS REPORTED AT 3 HOSPITALS'],
 ticker:'HOSPITALS REPORT LZ-6 PATIENTS LEAVING WARDS · POLICE URGE CALM · DO NOT APPROACH THE SAVED · CLINICS CLOSED UNTIL FURTHER NOTICE · '};
export const SYLLABLES=(()=>{const r=rng(11),out=[];for(const [a,b] of NEWS.speech){let t=a;while(t<b-.06){const words=1+(r()*3|0);for(let i=0;i<words&&t<b-.06;i++){const d=.07+r()*.08;out.push([t,d,.3+r()*.7]);t+=d+.015;}t+=.04+r()*.06;}}return out;})();
function mouthAt(lt){for(const [s,d] of SYLLABLES)if(lt>=s&&lt<s+d){const o=Math.sin((lt-s)/d*Math.PI);return o>.6?2:o>.2?1:0;}return 0;}
const blinkAt=lt=>[1.6,3.3,6.6].some(b=>lt>=b&&lt<b+.08);
export function assets(){const back=canvas(PW,PH),fires=studio(back.getContext('2d'));const rw=()=>{const k=canvas(PW,PH);k.getContext('2d',{willReadFrequently:true});return k;};return {back,fires,a:rw(),b:rw(),frozen:canvas(PW,PH),hasFrozen:false};}
function news(c,lt,A){c.drawImage(A.back,0,0);c.save();c.beginPath();c.rect(0,8,128,76);c.clip();for(const f of A.fires)fire(c,f,lt);c.restore();
 wall(c,lt>=NEWS.live?'live':'saved',lt);
 const ear=lt>=NEWS.ear[0]&&lt<NEWS.ear[1];anchor(c,84,26,{mouth:mouthAt(lt),blink:blinkAt(lt),worry:lt>=NEWS.worry,ear,down:ear,turn:lt>=NEWS.turn});desk(c);
 R(c,207,4,27,9,'#c8102e');text(c,'LIVE',210,5,'#ffffff');
 // Lower third; the headline wipes over to the new one.
 const sw=clamp((lt-NEWS.swap)/.3);R(c,6,95,82,9,'#c8102e');text(c,'BREAKING NEWS',8,96,'#ffffff');R(c,6,104,228,12,'#f2f2f2');
 c.save();c.beginPath();c.rect(6,104,228,12);c.clip();text(c,NEWS.headlines[0],12,106,'#0d1a3a');if(sw>0){R(c,6,104,228*ease(sw),12,'#f2f2f2');c.beginPath();c.rect(6,104,228*ease(sw),12);c.clip();text(c,NEWS.headlines[1],12,106,'#8a0a1e');}c.restore();
 R(c,6,116,228,2,'#c8102e');
 // Ticker with the station's 6 and the clock.
 R(c,0,123,PW,12,'#05070d');R(c,0,123,PW,1,'#c8102e');c.save();c.beginPath();c.rect(36,123,170,12);c.clip();const span=width(NEWS.ticker)+6,off=(lt*40)%span;text(c,NEWS.ticker+NEWS.ticker,40-off,126,'#f2e6b0');c.restore();
 R(c,0,123,36,12,'#c8102e');text(c,'6',4,126,'#fff');text(c,'NEWS',11,126,'#fff');R(c,206,123,34,12,'#f2c200');text(c,'11:47',208,126,'#05070d');
 const shown=NEWS.captions.filter(([s])=>lt>=s).slice(-2);shown.forEach(([,line],i)=>{const y=5+i*9+(shown.length===1?9:0);R(c,5,y-1,width(line)+2,9,'#000');text(c,line,6,y,'#ffffff');});}
const DRAW={ad:(c,lt)=>ad(c,lt),trial:(c,lt)=>trial(c,lt),montage:(c,lt)=>montage(c,lt),news:(c,lt,A)=>news(c,lt,A)};
// The picture on the set at time t. Returns whether the standby light is on.
export function frame(c,t,A){const fr=Math.floor(t*30),a=A.a.getContext('2d'),b=A.b.getContext('2d');
 if(t<T.back){R(c,0,0,PW,PH,'#040506');return {led:t<T.click};}
 if(t<T.flip){const k=t<T.logoIn?0:t<T.logoIn+.4?(t-T.logoIn)/.4:t<T.logoOut-.4?1:Math.max(0,(T.logoOut-t)/.4);logo(c,PW,PH,k);if(t<T.logoIn){R(c,0,0,PW,PH,'#0b0d12');}return {led:false};}
 if(t<T.live){for(let i=0;i<SEGMENTS.length;i++){const s=SEGMENTS[i],prev=SEGMENTS[i-1];
   // Flipping in: blocks of the last channel and this one mix.
   if(s.flips&&t>=s.start-FLIP&&t<s.start){if(prev)DRAW[prev.id](a,prev.dur-.001,A);else R(a,0,0,PW,PH,'#000');DRAW[s.id](b,0,A);flip(c,A.a,A.b,(t-(s.start-FLIP))/FLIP,fr,PW,PH);return {led:false};}
   if(t>=s.start&&t<s.start+s.dur){DRAW[s.id](c,t-s.start,A);if(s.flips)osd(c,s.ch,s.name,clamp((s.start+2.2-t)/.5),PW);return {led:false};}}
  R(c,0,0,PW,PH,'#000');return {led:false};}
 if(t<T.crack){field(c,t);return {led:false};}
 // The feed freezes on its last good frame and cracks apart.
 if(t<T.lost){field(a,T.crack);breakup(c,A.a,ease((t-T.crack)/(T.lost-T.crack)),fr,PW,PH);return {led:false};}
 noSignal(c,PW,PH,t-T.lost);return {led:false};}
export const zoomAt=t=>1+.03*ease(clamp((t-T.back)/(T.end-T.back)));
