// The clip's sound, made in the browser: the set clicking on, the tube's hum and whine, a news sting, the anchor's voice as a murmur
// through a small TV speaker (there are no words, the captions carry them), the crash, a groan, the signal tearing, static, the stand-by
// tone and the set switching off. Everything is scheduled against the audio clock when Watch is pressed.
import {T,SYLLABLES} from './news.js';
export function playSound(ctx){const t0=ctx.currentTime+.05,at=s=>t0+s;
 const out=ctx.createDynamicsCompressor();out.threshold.value=-18;out.ratio.value=4;const master=ctx.createGain();master.gain.value=.9;out.connect(master).connect(ctx.destination);
 // The TV speaker: no lows, no highs.
 const tv=ctx.createBiquadFilter();tv.type='bandpass';tv.frequency.value=1400;tv.Q.value=.45;const tvg=ctx.createGain();tvg.gain.value=1.4;tv.connect(tvg).connect(out);
 const len=ctx.sampleRate*2,buf=ctx.createBuffer(1,len,ctx.sampleRate),d=buf.getChannelData(0);for(let i=0;i<len;i++)d[i]=Math.random()*2-1;
 const noise=(start,dur,dest,{type='lowpass',f=2000,q=.7,gain=.3,attack=.005,decay=null,sweep=null}={})=>{const s=ctx.createBufferSource();s.buffer=buf;s.loop=true;const fl=ctx.createBiquadFilter();fl.type=type;fl.frequency.setValueAtTime(f,at(start));fl.Q.value=q;if(sweep)fl.frequency.exponentialRampToValueAtTime(sweep,at(start+dur));
  const g=ctx.createGain();g.gain.setValueAtTime(0,at(start));g.gain.linearRampToValueAtTime(gain,at(start+attack));if(decay)g.gain.exponentialRampToValueAtTime(.0005,at(start+dur));else{g.gain.setValueAtTime(gain,at(start+dur-.01));g.gain.linearRampToValueAtTime(0,at(start+dur));}
  s.connect(fl).connect(g).connect(dest);s.start(at(start),Math.random());s.stop(at(start+dur+.05));};
 const tone=(start,dur,dest,{type='sine',f=440,to=null,gain=.1,attack=.005,release=.05}={})=>{const o=ctx.createOscillator();o.type=type;o.frequency.setValueAtTime(f,at(start));if(to)o.frequency.exponentialRampToValueAtTime(to,at(start+dur));
  const g=ctx.createGain();g.gain.setValueAtTime(0,at(start));g.gain.linearRampToValueAtTime(gain,at(start+attack));g.gain.setValueAtTime(gain,at(start+Math.max(attack,dur-release)));g.gain.linearRampToValueAtTime(0,at(start+dur));o.connect(g).connect(dest);o.start(at(start));o.stop(at(start+dur+.02));};
 // Click on, the tube thumps awake, then the hum and the faint high whine of an old set.
 noise(T.click,.03,out,{type:'highpass',f:1500,gain:.5,decay:true});tone(T.click,.02,out,{type:'square',f:180,gain:.12});
 tone(T.warm,.3,out,{f:110,to:45,gain:.25,release:.2});
 tone(T.warm,T.off-T.warm+.05,out,{type:'sawtooth',f:60,gain:.018,attack:.15,release:.02});tone(T.warm,T.off-T.warm+.6,out,{f:15734,gain:.004,attack:.3,release:.5});
 // The news sting.
 for(const [s,f,l] of [[.56,392,.1],[.68,392,.1],[.8,587,.32]]){tone(s,l,tv,{type:'square',f,gain:.05,release:.08});tone(s,l,tv,{type:'triangle',f:f/2,gain:.08,release:.08});}
 // Her voice: a buzz at speaking pitch through two moving vowel formants, with a breath of noise on each syllable.
 const voice=ctx.createGain();voice.gain.value=0;voice.connect(tv);const saw=ctx.createOscillator();saw.type='sawtooth';saw.frequency.value=205;const f1=ctx.createBiquadFilter(),f2=ctx.createBiquadFilter();f1.type=f2.type='bandpass';f1.Q.value=5;f2.Q.value=8;
 const mix=ctx.createGain();mix.gain.value=.5;saw.connect(f1).connect(mix);saw.connect(f2).connect(mix);mix.connect(voice);saw.start(at(.9));saw.stop(at(4.3));
 for(const [s,dd,v] of SYLLABLES){voice.gain.setValueAtTime(0,at(s));voice.gain.linearRampToValueAtTime(.85+.35*v,at(s+.02));voice.gain.linearRampToValueAtTime(0,at(s+dd));f1.frequency.setValueAtTime(450+v*450,at(s));f2.frequency.setValueAtTime(1300+v*900,at(s));saw.frequency.setValueAtTime(190+v*40+(s>T.crash?60:0),at(s));
  if(v<.45)noise(s,.04,tv,{type:'highpass',f:3500,gain:.06});}
 // The crash off camera, her gasp, and the Saved's groan.
 noise(T.crash,.6,tv,{f:2400,sweep:300,gain:.6,decay:true});tone(T.crash,.35,tv,{f:95,to:38,gain:.5,release:.25});tone(T.crash+.02,.25,tv,{type:'square',f:310,to:180,gain:.05});
 noise(T.turn+.03,.22,tv,{type:'bandpass',f:1600,q:2,gain:.18,attack:.12});
 const groan=ctx.createOscillator();groan.type='sawtooth';groan.frequency.setValueAtTime(78,at(3.8));groan.frequency.linearRampToValueAtTime(58,at(4.3));const gf=ctx.createBiquadFilter();gf.type='bandpass';gf.frequency.value=420;gf.Q.value=3;
 const gg=ctx.createGain();gg.gain.setValueAtTime(0,at(3.8));gg.gain.linearRampToValueAtTime(.35,at(3.95));gg.gain.setValueAtTime(.35,at(4.28));gg.gain.linearRampToValueAtTime(0,at(4.32));groan.connect(gf).connect(gg).connect(tv);groan.start(at(3.8));groan.stop(at(4.35));
 // The signal tears, breaks into static, the stand-by tone, and off.
 for(let i=0;i<6;i++)tone(T.tear+i*.025,.02,out,{type:'square',f:200+Math.random()*1800,gain:.06});
 noise(T.tear,T.stat-T.tear,out,{type:'highpass',f:800,gain:.12});noise(T.stat,T.card-T.stat,out,{type:'highpass',f:400,gain:.32,attack:.002});
 tone(T.card,T.off-T.card,tv,{f:1000,gain:.04,attack:.002,release:.005});
 tone(T.off,.25,out,{f:140,to:40,gain:.2,release:.2});noise(T.off,.02,out,{type:'highpass',f:2000,gain:.3,decay:true});
 return t0;}
