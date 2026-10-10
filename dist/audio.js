// The game's sound: the Master Creator's synthesised sounds, played on one AudioContext. Browsers only let sound start after you
// touch, click or press something, so the context is made on the first gesture; until then sounds are skipped, not queued.
// Sound can be switched off in the menu; the choice stays on this device.
import {SOUNDS,playSound} from './mc/assets/sounds/library.js';
const BY_ID=Object.fromEntries(SOUNDS.map(s=>[s.id,s])),KEY='deadlight-sound-v1';
export class Audio{
 constructor(storage){this.storage=storage;this.ctx=null;this.last={};this.gestured=false;try{this.on=storage?.getItem(KEY)!=='off';}catch{this.on=true;}
  const start=()=>{this.gestured=true;this.unlock();};for(const n of ['pointerdown','keydown','touchend'])globalThis.addEventListener?.(n,start,{capture:true});}
 unlock(){if(this.ctx||!this.on)return this.ctx?.resume?.();const AC=globalThis.AudioContext||globalThis.webkitAudioContext;if(!AC)return;try{this.ctx=new AC();}catch{this.ctx=null;}}
 set(on){this.on=!!on;try{this.storage?.setItem(KEY,on?'on':'off');}catch{}if(on)this.unlock();else this.ctx?.suspend?.();if(on)this.ctx?.resume?.();}
 // Plays a sound now. gap stops the same sound stacking up when it is asked for every frame (footsteps, groans).
 play(id,options={},gap=0){const s=BY_ID[id],c=this.ctx;if(!s||!c||!this.on||c.state==='closed')return false;const now=c.currentTime;if(gap&&now-(this.last[id]??-1e9)<gap)return false;this.last[id]=now;
  try{playSound(c,s,options);return true;}catch{return false;}}
}
