// What the set shows, start to finish: standby, the VESPERA logo, then the channels in the script's order. Each segment draws itself at
// its own local time; the set lays its own things over them (channel flips, the channel number, NO SIGNAL). One function of t, so any
// frame can be shown on its own.
import {R,clamp,canvas} from '../intro/kit.js';
import {logo,osd,flip,noSignal} from '../intro/tv.js';
import {ad,AD} from '../intro/ad.js';import {trial,TRIAL} from '../intro/trial.js';import {montage,MONTAGE} from '../intro/montage.js';
import {assets as newsAssets,frame as oldFrame,T as OLD} from '../intro/timeline.js';
import {field,FIELD,fieldAssets} from './field.js';
import {alert,ALERT} from './alert.js';
import {antidote,VARGA,vargaAssets} from './varga.js';
export const PW=240,PH=135,FLIP=.12;
// The anchor's piece is the old timeline's news segment, drawn at its own time.
const news=(c,lt,A)=>oldFrame(c,OLD.news+lt,A.news);
// [id, length, channel, name shown under it, flips in]
const LIST=[['ad',AD.dur,2,'',true],['trial',TRIAL.dur,9,'MTNN',true],['montage',MONTAGE.dur,6,'CH6 NEWS',true],['news',13,6,'',false],['field',FIELD.dur,6,'',false],
 ['alert',ALERT.dur,0,'',false],['varga',VARGA.dur,9,'MTNN',true],['nosignal',4.6,0,'',false]];
export const ON={click:1.5,logo:1.8,first:4.2};
export const SEGMENTS=(()=>{let t=ON.first;return LIST.map(([id,dur,ch,name,flips])=>{const s={id,start:t,dur,ch,name,flips};t+=dur;return s;});})();
const S=Object.fromEntries(SEGMENTS.map(s=>[s.id,s]));
export const TV={...ON,end:S.nosignal.start+S.nosignal.dur,field:S.field.start,alert:S.alert.start,varga:S.varga.start,nosignal:S.nosignal.start,
 // Moments the room reacts to: the scream on the forecourt, the alert tone, the banging in the lab.
 jolts:[S.field.start+FIELD.run,S.alert.start,...VARGA.bang.map(b=>S.varga.start+b)]};
const DRAW={ad:(c,lt)=>ad(c,lt),trial:(c,lt)=>trial(c,lt),montage:(c,lt)=>montage(c,lt),news,field:(c,lt,A)=>field(c,lt,A.field),alert:(c,lt)=>alert(c,lt),varga:(c,lt,A)=>antidote(c,lt,A.varga),
 nosignal:(c,lt)=>noSignal(c,PW,PH,lt+3)};
export function tvAssets(){const k=()=>{const e=canvas(PW,PH);return e;};return {news:newsAssets(),field:fieldAssets(),varga:vargaAssets(),a:k(),b:k()};}
// The picture at time t. Returns {on: the panel is lit, led: the standby light}.
export function picture(c,t,A){const fr=Math.floor(t*30);
 if(t<ON.click){R(c,0,0,PW,PH,'#000');return {on:false,led:true};}
 if(t<ON.first-FLIP){const k=t<ON.logo?0:clamp(Math.min((t-ON.logo)/.5,(ON.first-FLIP-t)/.5));logo(c,PW,PH,k);return {on:true,led:false};}
 for(let i=0;i<SEGMENTS.length;i++){const s=SEGMENTS[i],prev=SEGMENTS[i-1];
  // Flipping in: blocks of the last channel and this one mix. The first channel flips in from the logo's black.
  if((s.flips||i===0)&&t>=s.start-FLIP&&t<s.start){const a=A.a.getContext('2d'),b=A.b.getContext('2d');if(prev)DRAW[prev.id](a,prev.dur-.001,A);else R(a,0,0,PW,PH,'#000');DRAW[s.id](b,0,A);flip(c,A.a,A.b,(t-(s.start-FLIP))/FLIP,fr,PW,PH);return {on:true,led:false};}
  if(t>=s.start-(s.flips?FLIP:0)&&t<s.start+s.dur){const lt=t-s.start;
   // The alert: the viewer flipping through channel after channel, every one of them carrying it.
   if(s.id==='alert'){for(const [ft,ch] of ALERT.flips){if(lt>=ft-FLIP&&lt<ft){const a=A.a.getContext('2d'),b=A.b.getContext('2d');if(ft===0)R(a,0,0,PW,PH,'#000');else alert(a,ft-FLIP);alert(b,ft);flip(c,A.a,A.b,(lt-(ft-FLIP))/FLIP,fr,PW,PH);return {on:true,led:false};}}
    alert(c,lt);const last=ALERT.flips.filter(([ft])=>lt>=ft).pop();if(last)osd(c,last[1],'',clamp((last[0]+1.6-lt)/.4),PW);return {on:true,led:false};}
   DRAW[s.id](c,lt,A);if(s.flips)osd(c,s.ch,s.name,clamp((2.4-lt)/.5),PW);return {on:true,led:false};}}
 R(c,0,0,PW,PH,'#000');return {on:true,led:false};}
