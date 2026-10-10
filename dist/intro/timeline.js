// The intro's timeline, step 1: the set wakes, flips to Channel 6's breaking news, the studio goes live to St. Agnes, and the feed breaks
// up into NO SIGNAL. Each segment draws its own picture at its local time; the set's effects (flips, breakup, the channel number) are
// laid over the top. Everything is a function of t, so the clip plays the same every time and ?t= shows any frame.
import {canvas,R,rng,clamp,ease} from './kit.js';
import {text,width} from './font.js';
import {PW,PH,studio,fire,wall,anchor,desk,field} from './news.js';
import {logo,osd,breakup,flip,noSignal} from './tv.js';
export const T={click:.45,back:.5,logoIn:.8,logoOut:2.4,flip:2.85,news:2.95,live:11.55,crack:11.95,lost:12.5,end:15};
// Channel 6: captions roll up two lines at a time; speech spans drive the mouth and the voice.
export const NEWS={
 captions:[[.5,'...PATIENTS FROM THE FIRST WEEKS'],[1.3,'OF THE LZ-6 PROGRAM, ADMITTED'],[2.1,'THIS MORNING WITH A SUDDEN FEVER,'],[2.9,'DIED TONIGHT. AND THEY HAVE...'],[3.9,'...GOTTEN BACK UP.'],
  [5.3,"WE'RE NOW HEARING REPORTS OF"],[6.1,'ATTACKS. OF BITES.'],[7.2,"WE'RE GOING LIVE TO ALEX PARK"],[7.9,'AT ST. AGNES.']],
 speech:[[.5,4.5],[5.3,6.8],[7.2,8.4]],worry:3.9,ear:[4.6,5.3],turn:8.1,swap:6.3,live:7.2,
 headlines:['THE SAVED: MIRACLE OR WARNING?','ATTACKS REPORTED AT 3 HOSPITALS'],
 ticker:'HOSPITALS REPORT LZ-6 PATIENTS LEAVING WARDS · POLICE URGE CALM · DO NOT APPROACH THE SAVED · CLINICS CLOSED UNTIL FURTHER NOTICE · '};
export const SYLLABLES=(()=>{const r=rng(11),out=[];for(const [a,b] of NEWS.speech){let t=a;while(t<b-.06){const words=1+(r()*3|0);for(let i=0;i<words&&t<b-.06;i++){const d=.07+r()*.08;out.push([t,d,.3+r()*.7]);t+=d+.015;}t+=.04+r()*.06;}}return out;})();
function mouthAt(lt){for(const [s,d] of SYLLABLES)if(lt>=s&&lt<s+d){const o=Math.sin((lt-s)/d*Math.PI);return o>.6?2:o>.2?1:0;}return 0;}
const blinkAt=lt=>[1.6,3.3,6.6].some(b=>lt>=b&&lt<b+.08);
export function assets(){const back=canvas(PW,PH),fires=studio(back.getContext('2d'));return {back,fires,a:canvas(PW,PH),b:canvas(PW,PH),frozen:canvas(PW,PH),hasFrozen:false};}
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
// The picture on the set at time t. Returns whether the standby light is on.
export function frame(c,t,A){const fr=Math.floor(t*30),a=A.a.getContext('2d');
 if(t<T.back){R(c,0,0,PW,PH,'#040506');return {led:t<T.click};}
 if(t<T.flip){const k=t<T.logoIn?0:t<T.logoIn+.4?(t-T.logoIn)/.4:t<T.logoOut-.4?1:Math.max(0,(T.logoOut-t)/.4);logo(c,PW,PH,k);if(t<T.logoIn){R(c,0,0,PW,PH,'#0b0d12');}return {led:false};}
 if(t<T.news){R(a,0,0,PW,PH,'#000');news(A.b.getContext('2d'),0,A);flip(c,A.a,A.b,(t-T.flip)/(T.news-T.flip),fr,PW,PH);return {led:false};}
 if(t<T.live){news(c,t-T.news,A);osd(c,6,'CH6 NEWS',clamp((T.news+2.6-t)/.5),PW);return {led:false};}
 if(t<T.crack){field(c,t);return {led:false};}
 // The feed freezes on its last good frame and cracks apart.
 if(t<T.lost){field(a,T.crack);breakup(c,A.a,ease((t-T.crack)/(T.lost-T.crack)),fr,PW,PH);return {led:false};}
 noSignal(c,PW,PH,t-T.lost);return {led:false};}
export const zoomAt=t=>1+.03*ease(clamp((t-T.back)/(T.end-T.back)));
