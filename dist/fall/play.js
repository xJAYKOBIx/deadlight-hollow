// The intro inside the game: a full-screen layer over everything, the game waiting underneath. It plays from the start; Skip shows in
// the corner after a tap once you have seen it through before (Esc always works). onDone runs when it ends or is skipped.
import {Film} from './film.js';
import {frame,fallAssets,LENGTH,CUES} from './fall.js';
export const SEEN_KEY='deadlight-intro-seen-v1';
export function seen(storage){try{return storage?.getItem(SEEN_KEY)==='1';}catch{return false;}}
export function playFall({look,pets,storage,sound=()=>{},onDone=()=>{}}){const root=document.getElementById('fall'),cv=document.getElementById('fallFilm'),skip=document.getElementById('fallSkip');
 const film=new Film(cv),A=fallAssets(look,pets),canSkip=seen(storage);let t=0,last=performance.now(),cue=0,raf=0,done=false,shown=0;root.hidden=false;skip.hidden=true;
 const end=()=>{if(done)return;done=true;cancelAnimationFrame(raf);root.hidden=true;removeEventListener('keydown',key,true);root.removeEventListener('pointerdown',tap);try{storage?.setItem(SEEN_KEY,'1');}catch{}onDone();};
 const key=e=>{if(e.key==='Escape'){e.preventDefault();e.stopPropagation();end();}else e.stopPropagation();},tap=e=>{if(e.target===skip)return;if(canSkip){skip.hidden=false;shown=t;}};
 addEventListener('keydown',key,true);root.addEventListener('pointerdown',tap);skip.onclick=e=>{e.stopPropagation();end();};
 // The clock stops while the page is hidden, so nothing is missed.
 const step=now=>{if(done)return;const dt=Math.max(0,Math.min(.1,(now-last)/1000));last=now;if(!document.hidden)t+=dt;
  while(cue<CUES.length&&CUES[cue][0]<=t){if(t-CUES[cue][0]<.5)sound(CUES[cue][1]);cue++;}
  if(!skip.hidden&&t-shown>3)skip.hidden=true;
  film.fit();frame(film,Math.min(t,LENGTH-.001),A);if(t>=LENGTH){end();return;}raf=requestAnimationFrame(step);};
 raf=requestAnimationFrame(step);return {stop:end,get t(){return t;}};}
