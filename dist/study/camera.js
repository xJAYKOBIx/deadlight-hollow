// The camera in a cutscene (v0.54): a scene can point it somewhere else (focus) and it glides there, eased in and out, then
// glides back and follows you again. Used by the house (wake.js beats set cam) and the street (the cruiser, the officer).
// focus: {x, y, z (times the normal zoom), secs (how long the move takes)} or null to follow.
const smooth=k=>k*k*(3-2*k);
export const BACK=1.6;
export class CineCam{
 // follow: where the camera would be on its own, {x, y, z}. Returns where it is this frame.
 step(dt,follow,focus){const key=focus?[focus.x,focus.y,focus.z??1].join():'';
  if(key!==this.key){this.key=key;this.from=this.at?{...this.at}:null;this.t=0;this.dur=focus?focus.secs??1.4:BACK;}
  const want=focus?{x:focus.x,y:focus.y,z:follow.z*(focus.z??1)}:follow;this.t+=Math.max(0,dt||0);
  if(!this.from||this.t>=this.dur){this.at={...want};return this.at;}
  const s=smooth(this.t/this.dur),f=this.from;this.at={x:f.x+(want.x-f.x)*s,y:f.y+(want.y-f.y)*s,z:f.z+(want.z-f.z)*s};return this.at;}}
