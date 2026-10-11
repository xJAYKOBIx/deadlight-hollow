// Shot 01: deterministic seconds, independent of Phaser and wall-clock time.
export const DURATION = 18;
export const LINE = 'His heart had stopped. Marrow brought him back. For one family, it meant another morning together.';
export const SUBTITLES = [
 {from:1.2,to:3.65,text:'His heart had stopped.'},
 {from:4.1,to:9.8,text:'Marrow brought him back.'},
 {from:11,to:17.2,text:'For one family, it meant another morning together.'}
];
export const BEATS = Array.from({length:15}, (_,i) => 3.05+i);
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const ease = v => { v = clamp(v); return v * v * (3 - 2 * v); };
export function frameAt(seconds, reduced = false) {
 const t=clamp(Number.isFinite(seconds)?seconds:0,0,DURATION);
 // Every story action gets its own composition before the next cut.
 const shot=t<3.65?'monitor':t<7.6?'patient':t<10.6?'hands':'family';
 const pull=ease((t-10.6)/3.2);
 let zoom,focusX,focusY;
 if(shot==='monitor'){zoom=2.14;focusX=246;focusY=238;}
 else if(shot==='patient'){zoom=3.4;focusX=581;focusY=250;}
 else if(shot==='hands'){zoom=3.3;focusX=552;focusY=347;}
 else{zoom=3.3-(3.3-1.13)*pull;focusX=552-52*pull;focusY=347-53*pull;}
 if(reduced&&shot==='family'){zoom=1.13;focusX=500;focusY=294;}
 const clasp=ease((t-8.1)/1.5);
 const gasp=ease((t-4.3)/.45)*(1-ease((t-4.9)/.75));
 const awake=ease((t-5.2)/1.1);
 return {t,shot,zoom,focusX,focusY,fade:1-ease((t-.45)/.75),
  clasp,fingerFrame:Math.round(clasp*16),gasp,awake,faceFrame:Math.round(clamp((t-4.2)/2.4)*32),
  breath:-gasp*2.5+(t>5.7?Math.sin((t-5.7)*1.65)*.65:0),
  relief:ease((t-14)/1.2),warm:ease((t-6.4)/7),
  subtitle:SUBTITLES.find(c=>t>=c.from&&t<c.to)?.text||'',
  alive:t>=3.05,done:t>=DURATION};
}
export function crossedBeats(from, to) { return to > from ? BEATS.filter(t => t > from && t <= to) : []; }
export class Playback {
  constructor() { this.t = 0; this.state = 'ready'; }
  play() { if (this.state === 'ended') this.t = 0; this.state = 'playing'; }
  pause() { if (this.state === 'playing') this.state = 'paused'; }
  seek(t) { this.t = frameAt(t).t; if (this.t === DURATION) this.state = 'ended'; else if (this.state === 'ended') this.state = 'paused'; }
  advance(dt) {
    if (this.state !== 'playing') return [];
    const previous = this.t;
    this.t = Math.min(DURATION, this.t + Math.max(0, Number.isFinite(dt) ? dt : 0));
    if (this.t === DURATION) this.state = 'ended';
    return crossedBeats(previous, this.t);
  }
}
// A trace sample at elapsed seconds. One clear rhythm after the first returned beat.
export function ecg(t) {
  if (t < 3) return Math.sin(t * 15) * .12;
  const p = (t - 3) % 1;
  const bump = (c,w,h) => h * Math.exp(-(((p-c)/w)**2));
  return bump(.055,.012,-5) + bump(.085,.014,25) + bump(.115,.018,-12) + bump(.32,.08,5) + bump(.84,.04,2);
}
