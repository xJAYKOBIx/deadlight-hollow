// The fire stick on a touch screen. A light push turns you and shows the laser; pushing nearly all the way fires, but only once you
// face where the stick points, so a thumb landing off centre or a quick flick never sends a shot the wrong way. You turn fast but not
// instantly, and a little pull toward the nearest zombie in a narrow cone in front helps on a small screen. Mouse and controller aim as before.
const deg=Math.PI/180;
export const AIM={fireAt:.85,turn:720*deg,facing:8*deg,dead:.15,cone:12*deg,range:260};
// The signed turn from a to b, the short way round.
export const turnTo=(a,b)=>{let d=(b-a)%(Math.PI*2);if(d>Math.PI)d-=Math.PI*2;if(d<-Math.PI)d+=Math.PI*2;return d;};
// The pull: a zombie right on the line takes the whole aim, one at the edge of the cone none of it.
export function assist(want,targets=[],o=AIM){let best=null,bd=o.cone;
 for(const t of targets){const d=Math.hypot(t.x,t.y);if(!d||d>o.range)continue;const off=Math.abs(turnTo(want,Math.atan2(t.y,t.x)));if(off<bd){bd=off;best=t;}}
 if(!best)return want;const to=Math.atan2(best.y,best.x),w=1-bd/o.cone;return want+turnTo(want,to)*w;}
export class AimStick{
 constructor(o=AIM){this.o=o;this.on=false;this.a=0;this.want=null;this.push=0;}
 // Thumb down: you start turning from where you already face.
 down(face){this.on=true;this.a=Number.isFinite(face)?face:0;this.want=null;this.push=0;}
 // Where the thumb is, as a push of 0 to 1 and a direction.
 set(dx,dy,travel){const d=Math.hypot(dx,dy);this.push=Math.min(1,d/travel);if(this.push>this.o.dead)this.want=Math.atan2(dy,dx);}
 up(){this.on=false;this.push=0;this.want=null;}
 // Each frame: turn toward the stick (pulled toward a zombie when one is close to the line) and fire only when pushed far and facing.
 step(dt,targets){if(!this.on||this.want===null)return {a:this.on?this.a:null,fire:false,aiming:false};
  const want=assist(this.want,targets,this.o),d=turnTo(this.a,want),max=this.o.turn*Math.max(0,dt);this.a+=Math.abs(d)<=max?d:Math.sign(d)*max;
  const facing=Math.abs(turnTo(this.a,want))<=this.o.facing;return {a:this.a,fire:this.push>=this.o.fireAt&&facing,aiming:true};}}
// The laser: a faint red line from the muzzle that fades with distance, brighter while you fire. It sits above the lighting.
export function drawLaser(g,x,y,mz,a,fire,len=150){const c=Math.cos(a),s=Math.sin(a),sx=x+mz.x,sy=y+mz.y,ex=x+c*len,ey=y+s*len+mz.y;
 for(let i=0;i<6;i++){const k0=i/6,k1=(i+1)/6;g.lineStyle(1,0xff4a3a,(fire?.62:.36)*(1-k0*.85)).lineBetween(sx+(ex-sx)*k0,sy+(ey-sy)*k0,sx+(ex-sx)*k1,sy+(ey-sy)*k1);}}
