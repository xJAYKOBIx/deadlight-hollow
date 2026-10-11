// The fire stick on a touch screen. A light push turns you and shows the laser; pushing all the way (or as far as the menu says) fires, but only once you
// face where the stick points, so a thumb landing off centre or a quick flick never sends a shot the wrong way. You turn fast but not
// instantly, and a pull toward the zombie nearest the line in a cone in front helps on a small screen. Controllers get a narrower pull.
const deg=Math.PI/180;
export const AIM={fireAt:1,turn:900*deg,facing:8*deg,dead:.15,cone:22*deg,lock:.45,near:.3,stick:.7,range:340};
// The signed turn from a to b, the short way round.
export const turnTo=(a,b)=>{let d=(b-a)%(Math.PI*2);if(d>Math.PI)d-=Math.PI*2;if(d<-Math.PI)d+=Math.PI*2;return d;};
// Which zombie the pull goes to: the one nearest the line, with closer ones counting a little nearer still, and the one you were
// already on (held) counting nearer again, so the aim does not flick between two that stand together.
export function pick(want,targets=[],o=AIM,held=null){let best=null,bs=Infinity,bo=0;
 for(const t of targets){const d=Math.hypot(t.x,t.y);if(!d||d>o.range)continue;const off=Math.abs(turnTo(want,Math.atan2(t.y,t.x)));if(off>=o.cone)continue;
  const sc=(off+o.cone*o.near*d/o.range)*(held&&t.ref===held?o.stick:1);if(sc<bs){bs=sc;best=t;bo=off;}}
 if(!best)return {a:want,t:null};
 // A zombie well inside the cone takes the whole aim; toward the edge of the cone the pull fades to nothing.
 const to=Math.atan2(best.y,best.x),w=Math.min(1,(1-bo/o.cone)/(1-o.lock));return {a:want+turnTo(want,to)*w,t:best};}
export const assist=(want,targets,o=AIM)=>pick(want,targets,o).a;
export class AimStick{
 constructor(o=AIM){this.o=o;this.on=false;this.a=0;this.want=null;this.push=0;this.held=null;}
 // Thumb down: you start turning from where you already face.
 down(face){this.on=true;this.a=Number.isFinite(face)?face:0;this.want=null;this.push=0;}
 // Where the thumb is, as a push of 0 to 1 and a direction.
 set(dx,dy,travel){const d=Math.hypot(dx,dy);this.push=Math.min(1,d/travel);if(this.push>this.o.dead)this.want=Math.atan2(dy,dx);}
 up(){this.on=false;this.push=0;this.want=null;this.held=null;}
 // Each frame: turn toward the stick (pulled toward a zombie when one is close to the line) and fire only when pushed far and facing.
 step(dt,targets){if(!this.on||this.want===null)return {a:this.on?this.a:null,fire:false,aiming:false};
  const p=pick(this.want,targets,this.o,this.held),want=p.a,d=turnTo(this.a,want),max=this.o.turn*Math.max(0,dt);this.a+=Math.abs(d)<=max?d:Math.sign(d)*max;
  this.held=p.t?.ref??null;const facing=Math.abs(turnTo(this.a,want))<=this.o.facing;return {a:this.a,fire:this.push>=this.o.fireAt-1e-6&&facing,aiming:true,lock:!!p.t};}}
// The laser: a bright core in a soft glow from the muzzle, fading a little with distance, brighter while you fire or while it is on
// one of the dead. It stops on what it would hit with a dot (a ring round it when that is one of the dead). col is the beam's colour,
// so lasers can be tinted later; spread (radians) adds a faint fan for a gun that throws pellets; end, when given, is where the beam
// lands instead of at the gun's height (on a crawler, down on the ground). It sits above the lighting.
export const LASER={col:0xff4a3a,len:190};
export function drawLaser(g,x,y,mz,a,fire,len=LASER.len,lock=false,col=LASER.col,spread=0,end=null){const c=Math.cos(a),s=Math.sin(a),sx=x+mz.x,sy=y+mz.y,ex=end?end.x:x+c*len,ey=end?end.y:y+s*len+mz.y,k=fire?1:lock?.85:.7;
 if(spread){const e=d=>[x+Math.cos(a+d)*len,y+Math.sin(a+d)*len+mz.y],[ax,ay]=e(-spread/2),[bx,by]=e(spread/2);g.fillStyle(col,.07*k).fillTriangle(sx,sy,ax,ay,bx,by);g.lineStyle(1,col,.24*k).lineBetween(sx,sy,ax,ay).lineBetween(sx,sy,bx,by);}
 for(let i=0;i<8;i++){const k0=i/8,k1=(i+1)/8,f=1-k0*.55,x0=sx+(ex-sx)*k0,y0=sy+(ey-sy)*k0,x1=sx+(ex-sx)*k1,y1=sy+(ey-sy)*k1;
  g.lineStyle(3,col,.16*k*f).lineBetween(x0,y0,x1,y1);g.lineStyle(1,col,.9*k*f).lineBetween(x0,y0,x1,y1);}
 const dx=Math.round(ex*2)/2,dy=Math.round(ey*2)/2;g.fillStyle(col,.35*k).fillRect(dx-1.5,dy-1.5,3.5,3.5);g.fillStyle(0xfff0e8,.95*k).fillRect(dx-.5,dy-.5,1.5,1.5);
 if(lock)g.lineStyle(1,col,.8).strokeEllipse(dx+.25,dy+.25,9,7);}
