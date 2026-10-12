// Small, gesture-unlocked audio layer. No speech synthesis or external audio requests.
export class Sound {
 constructor(){this.ctx=null;this.muted=false;this.nodes=new Set();}
 async unlock(){
  if(!this.ctx){const A=globalThis.AudioContext||globalThis.webkitAudioContext;if(!A)return;this.ctx=new A();}
  if(this.ctx.state==='suspended')try{await this.ctx.resume();}catch{}
 }
 pulse(){
  if(this.muted||this.ctx?.state!=='running')return;
  const c=this.ctx,o=c.createOscillator(),g=c.createGain(),t=c.currentTime;
  o.type='sine';o.frequency.setValueAtTime(760,t);o.connect(g);g.connect(c.destination);
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.055,t+.012);g.gain.exponentialRampToValueAtTime(.001,t+.15);
  o.start(t);o.stop(t+.17);this.nodes.add(o);o.onended=()=>{this.nodes.delete(o);o.disconnect();g.disconnect();};
 }
 stop(){for(const n of this.nodes)try{n.stop();}catch{}this.nodes.clear();}
 close(){this.stop();this.ctx?.close();}
}
