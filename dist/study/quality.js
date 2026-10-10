// Effects quality. 'high' and 'low' are fixed; 'auto' starts high and watches the frame rate: three slow seconds in a row
// (under 45 frames a second) turn the extra effects off, and ten smooth ones (55 or more) turn them back on.
// Low drops what costs the most for the least: haze, light shafts, the vignette, drifting dust and the thicker smoke.
export const QUALITY_KEY='deadlight-quality-v1',QUALITY_MODES=['auto','high','low'];
export const QUALITY_NAMES={auto:'Auto',high:'High',low:'Low'};
export const SLOW_FPS=45,SMOOTH_FPS=55,SLOW_SECONDS=3,SMOOTH_SECONDS=10;
export class Quality{
 constructor(storage){this.storage=storage;let m=null;try{m=storage?.getItem(QUALITY_KEY);}catch{}this.mode=QUALITY_MODES.includes(m)?m:'auto';this.autoLow=false;this.slow=0;this.smooth=0;this.listeners=[];}
 get low(){return this.mode==='low'||(this.mode==='auto'&&this.autoLow);}
 get label(){return QUALITY_NAMES[this.mode]+(this.mode==='auto'?' ('+(this.autoLow?'Low':'High')+')':'');}
 onChange(f){this.listeners.push(f);}
 emit(){for(const f of this.listeners)f(this.low);}
 set(mode){if(!QUALITY_MODES.includes(mode))return;const was=this.low;this.mode=mode;try{this.storage?.setItem(QUALITY_KEY,mode);}catch{}if(this.low!==was)this.emit();}
 cycle(){this.set(QUALITY_MODES[(QUALITY_MODES.indexOf(this.mode)+1)%QUALITY_MODES.length]);}
 // One reading a second, from the game loop's own frame rate. Hidden tabs and paused menus are skipped by the caller.
 sample(fps){if(!(fps>0))return;const was=this.low;
  if(fps<SLOW_FPS){this.slow++;this.smooth=0;}else if(fps>=SMOOTH_FPS){this.smooth++;this.slow=0;}else{this.slow=0;this.smooth=0;}
  if(this.slow>=SLOW_SECONDS)this.autoLow=true;if(this.smooth>=SMOOTH_SECONDS)this.autoLow=false;
  if(this.low!==was)this.emit();}
}
