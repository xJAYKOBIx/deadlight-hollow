// The intro's sound, made in the browser and scheduled on the audio clock when Watch is pressed. Two places sound comes from: the TV's
// speakers (a bandpass, so it sounds like a set in the room) and the apartment itself (the remote, the chime, the hum, sirens outside).
import {T,NEWS,SYLLABLES} from './timeline.js';
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
 // The flip.
 noise(T.flip-.05,.02,out,{type:'highpass',f:2500,gain:.3,decay:true});for(let i=0;i<4;i++)tone(T.flip+i*.025,.02,tv,{type:'square',f:300+i*420,gain:.04});
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
