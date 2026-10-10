// The intro's sound, made in the browser and scheduled on the audio clock when Watch is pressed. Two places sound comes from: the TV's
// speakers (a bandpass, so it sounds like a set in the room) and the apartment itself (the remote, the chime, the hum, sirens outside).
import {T,NEWS,SYLLABLES,SEGMENTS} from './timeline.js';
import {AD} from './ad.js';import {TRIAL,BEATS} from './trial.js';import {MONTAGE} from './montage.js';import {rng} from './kit.js';
export function kit(ctx,t0){const at=s=>t0+s;
 const out=ctx.createDynamicsCompressor();out.threshold.value=-18;out.ratio.value=4;const master=ctx.createGain();master.gain.value=.9;out.connect(master).connect(ctx.destination);
 const tv=ctx.createBiquadFilter();tv.type='bandpass';tv.frequency.value=1300;tv.Q.value=.35;const tvg=ctx.createGain();tvg.gain.value=1.5;tv.connect(tvg).connect(out);
 const len=ctx.sampleRate*2,buf=ctx.createBuffer(1,len,ctx.sampleRate),d=buf.getChannelData(0);for(let i=0;i<len;i++)d[i]=Math.random()*2-1;
 const noise=(start,dur,dest,{type='lowpass',f=2000,q=.7,gain=.3,attack=.005,decay=false,sweep=null}={})=>{const s=ctx.createBufferSource();s.buffer=buf;s.loop=true;const fl=ctx.createBiquadFilter();fl.type=type;fl.frequency.setValueAtTime(f,at(start));fl.Q.value=q;if(sweep)fl.frequency.exponentialRampToValueAtTime(sweep,at(start+dur));
  const g=ctx.createGain();g.gain.setValueAtTime(0,at(start));g.gain.linearRampToValueAtTime(gain,at(start+attack));if(decay)g.gain.exponentialRampToValueAtTime(.0005,at(start+dur));else{g.gain.setValueAtTime(gain,at(start+Math.max(attack,dur-.02)));g.gain.linearRampToValueAtTime(0,at(start+dur));}
  s.connect(fl).connect(g).connect(dest);s.start(at(start),Math.random());s.stop(at(start+dur+.05));return g;};
 const tone=(start,dur,dest,{type='sine',f=440,to=null,gain=.1,attack=.005,release=.05,detune=0}={})=>{const o=ctx.createOscillator();o.type=type;o.detune.value=detune;o.frequency.setValueAtTime(f,at(start));if(to)o.frequency.exponentialRampToValueAtTime(to,at(start+dur));
  const g=ctx.createGain();g.gain.setValueAtTime(0,at(start));g.gain.linearRampToValueAtTime(gain,at(start+attack));g.gain.setValueAtTime(gain,at(start+Math.max(attack,dur-release)));g.gain.linearRampToValueAtTime(0,at(start+dur));o.connect(g).connect(dest);o.start(at(start));o.stop(at(start+dur+.02));return o;};
 return {ctx,at,out,tv,noise,tone};}
// A voice through the speaker: a buzz at speaking pitch through two moving vowel formants, a breath of noise on some syllables.
// Syllables for a stretch of speech: start, length and a vowel brightness.
export function syllables(spans,seed){const r=rng(seed),out=[];for(const [a,b] of spans){let t=a;while(t<b-.06){const words=1+(r()*3|0);for(let i=0;i<words&&t<b-.06;i++){const d=.07+r()*.08;out.push([t,d,.3+r()*.7]);t+=d+.015;}t+=.04+r()*.06;}}return out;}
function voice(k,start,syllables,pitch=205,stop){const {ctx,at,tv,noise}=k,g=ctx.createGain();g.gain.value=0;g.connect(tv);const saw=ctx.createOscillator();saw.type='sawtooth';saw.frequency.value=pitch;
 const f1=ctx.createBiquadFilter(),f2=ctx.createBiquadFilter();f1.type=f2.type='bandpass';f1.Q.value=5;f2.Q.value=8;const mix=ctx.createGain();mix.gain.value=.5;saw.connect(f1).connect(mix);saw.connect(f2).connect(mix);mix.connect(g);saw.start(at(start));saw.stop(at(stop));
 for(const [s,dd,v] of syllables){const a=start+s;g.gain.setValueAtTime(0,at(a));g.gain.linearRampToValueAtTime(.85+.35*v,at(a+.02));g.gain.linearRampToValueAtTime(0,at(a+dd));f1.frequency.setValueAtTime(450+v*450,at(a));f2.frequency.setValueAtTime(1300+v*900,at(a));saw.frequency.setValueAtTime(pitch-15+v*40,at(a));if(v<.45)noise(a,.04,tv,{type:'highpass',f:3500,gain:.06});}}
// A siren: a tone swept up and down.
function siren(k,start,dur,dest,{gain=.05,f=650,span=300,rate=.5}={}){const {ctx,at}=k,o=ctx.createOscillator();o.type='triangle';for(let s=0;s<dur;s+=rate){o.frequency.setValueAtTime(f,at(start+s));o.frequency.linearRampToValueAtTime(f+span,at(start+s+rate*.5));o.frequency.linearRampToValueAtTime(f,at(start+s+rate));}
 const g=ctx.createGain();g.gain.setValueAtTime(0,at(start));g.gain.linearRampToValueAtTime(gain,at(start+.4));g.gain.setValueAtTime(gain,at(start+dur-.4));g.gain.linearRampToValueAtTime(0,at(start+dur));o.connect(g).connect(dest);o.start(at(start));o.stop(at(start+dur+.05));}
export function playSound(ctx){const t0=ctx.currentTime+.05,k=kit(ctx,t0),{out,tv,noise,tone}=k;
 // The remote, the set's chime and the faint hum of the panel.
 noise(T.click,.02,out,{type:'highpass',f:2500,gain:.35,decay:true});tone(T.back,.5,out,{f:659,gain:.06,release:.4});tone(T.back+.12,.7,out,{f:988,gain:.05,release:.6});
 noise(T.logoIn,.8,out,{type:'bandpass',f:900,q:1.5,gain:.04,attack:.4});tone(T.back,T.lost-T.back,out,{f:15600,gain:.002,attack:.4});
 // Each flip: the remote's click and a chirp of digital audio.
 for(const sg of SEGMENTS)if(sg.flips){const f=sg.start-.1;noise(f-.05,.02,out,{type:'highpass',f:2500,gain:.3,decay:true});for(let i=0;i<4;i++)tone(f+i*.025,.02,tv,{type:'square',f:300+i*420,gain:.04});}
 const at=id=>SEGMENTS.find(g=>g.id===id).start;
 // CH 2, the ad: soft piano, a warm narrator, a shimmer when the logo blooms.
 const a=at('ad');[[0,523],[.35,659],[.7,784],[1.05,988],[1.6,880],[1.95,784],[2.3,659],[2.9,698],[3.25,880],[3.6,1047],[4.2,988],[4.6,784]].forEach(([s,f])=>{tone(a+s,1.1,tv,{type:'triangle',f,gain:.05,attack:.01,release:1});tone(a+s,1.1,tv,{f:f/2,gain:.03,attack:.01,release:1});});
 voice(k,a,syllables(AD.speech,21),120,a+AD.dur);for(let i=0;i<6;i++)tone(a+AD.shots[1]+i*.07,.5,tv,{f:1568+i*220,gain:.012,release:.45});
 // CH 9, the trial: the flatline, silence, the first beats, then the audience roars.
 const tr=at('trial');tone(tr,2.95,tv,{f:880,gain:.04,attack:.01,release:.01});voice(k,tr,syllables(TRIAL.speech,31),118,tr+2.8);
 for(const b of BEATS)tone(tr+b,.09,tv,{f:880,gain:.06,attack:.003,release:.02});
 noise(tr,TRIAL.cheer,tv,{type:'bandpass',f:500,q:.6,gain:.03,attack:.3});noise(tr+TRIAL.cheer,TRIAL.dur-TRIAL.cheer,tv,{type:'bandpass',f:1200,q:.5,gain:.28,attack:.15});
 for(let i=0;i<60;i++){const s=TRIAL.cheer+Math.random()*(TRIAL.dur-TRIAL.cheer);noise(tr+s,.015,tv,{type:'highpass',f:2000,gain:.12,decay:true});}
 // CH 6, the queues: bright news music in the rain, the man's boast, then the BREAKING sting.
 const m=at('montage');noise(m,MONTAGE.sting,tv,{type:'highpass',f:3000,gain:.05,attack:.2});
 for(let s=0,i=0;s<MONTAGE.sting;s+=.25,i++){const f=[392,523,587,659,784,659,587,523][i%8];tone(m+s,.18,tv,{type:'square',f,gain:.04,release:.15});if(i%2===0)tone(m+s,.2,tv,{f:98,gain:.05,release:.15});}
 voice(k,m,syllables(MONTAGE.speech,41),140,m+3.4);
 const st=m+MONTAGE.sting;for(const f of [146.8,220,293.7])tone(st,.7,tv,{type:'sawtooth',f,gain:.05,attack:.01,release:.4});tone(st,.6,tv,{f:60,to:35,gain:.4,release:.5});noise(st,.5,tv,{f:1800,sweep:200,gain:.25,decay:true});
 // Channel 6: a tense bed under her voice, a hit when the headline changes.
 const n=T.news,bed=T.live-n;for(const [f,det] of [[55,0],[82.4,7],[110,-5]])tone(n,bed,tv,{type:'sawtooth',f,gain:.035,attack:.6,release:.3,detune:det});
 for(let s=0;s<bed;s+=.5)noise(n+s,.03,tv,{type:'highpass',f:6000,gain:.05,decay:true});
 voice(k,n,SYLLABLES,205,T.live);
 tone(n+NEWS.swap,.6,tv,{f:70,to:40,gain:.35,release:.5});noise(n+NEWS.swap,.4,tv,{f:1500,sweep:200,gain:.25,decay:true});
 // Live from St. Agnes: sirens and a crowd, then the feed stutters and dies.
 siren(k,T.live,T.lost-T.live,tv,{gain:.06});noise(T.live,T.lost-T.live,tv,{type:'bandpass',f:700,q:.8,gain:.12,attack:.05});
 for(let s=T.crack,i=0;s<T.lost;s+=.045,i++){tone(s,.03,tv,{type:'square',f:420-i*14,gain:.05});noise(s,.03,tv,{type:'bandpass',f:900,gain:.12});}
 // The room afterwards: the fridge, and a siren far away outside.
 tone(T.lost,T.end+1-T.lost,out,{f:50,gain:.012,attack:.8});siren(k,T.lost+.6,T.end+.6-T.lost,(()=>{const f=ctx.createBiquadFilter();f.type='lowpass';f.frequency.value=700;f.connect(out);return f;})(),{gain:.035,f:600,span:250,rate:.9});
 return t0;}
