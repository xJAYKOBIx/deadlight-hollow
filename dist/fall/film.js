// The camera the intro is shot through. Every shot draws into a 480 × 270 film frame (16:9) that is fitted to the screen at its full
// resolution, then gets the same finish: bloom off the bright parts, a grade, a vignette, moving film grain, the letterbox bars and a
// fade. All of it is canvas compositing on the whole frame (no per-pixel loops at screen size), so a phone keeps up. Grain and shake come
// from the frame number, so a frame looks the same every time it is drawn.
import {hash,clamp,canvas} from '../intro/kit.js';
export const FW=480,FH=270,BAR=(FH-FW/2.39)/2;
const mk=(w,h)=>{const k=canvas(w,h);return {k,c:k.getContext('2d')};};
// Grain: four tiles of grey noise around mid grey, drawn with overlay so they only move the tones they sit on. Made on first use, so the
// timing can be loaded where there is no canvas.
let GRAIN,VIG;const grain=()=>GRAIN??=Array.from({length:4},(_,n)=>{const {k,c}=mk(128,128),img=c.createImageData(128,128),d=img.data;
 for(let i=0;i<d.length;i+=4){const v=128+(hash(i*7+n*7919)-.5)*190|0;d[i]=d[i+1]=d[i+2]=v;d[i+3]=255;}c.putImageData(img,0,0);return k;});
// The vignette, drawn once at film size.
const vig=()=>VIG??=(()=>{const {k,c}=mk(FW,FH),g=c.createRadialGradient(FW/2,FH/2,FH*.38,FW/2,FH/2,FW*.62);g.addColorStop(0,'#00000000');g.addColorStop(.6,'#00000040');g.addColorStop(1,'#000000d8');c.fillStyle=g;c.fillRect(0,0,FW,FH);return k;})();
export class Film{
 constructor(el){this.el=el;this.c=el.getContext('2d',{alpha:false});this.b1=mk(120,68);this.b2=mk(40,23);this.s=1;this.ox=0;this.oy=0;}
 // Fit the film frame to the canvas's box on the page, at the device's pixel density (capped so a big screen does not cost too much).
 fit(){const r=this.el.getBoundingClientRect(),dpr=Math.min(globalThis.devicePixelRatio||1,2),w=Math.max(2,Math.round(r.width*dpr)),h=Math.max(2,Math.round(r.height*dpr)),cap=Math.min(1,2400/w);
  const W=Math.round(w*cap),H=Math.round(h*cap);if(this.el.width!==W||this.el.height!==H){this.el.width=W;this.el.height=H;}
  this.s=Math.min(W/FW,H/FH);this.ox=Math.round((W-FW*this.s)/2);this.oy=Math.round((H-FH*this.s)/2);}
 // Start a frame: black everywhere, then film units with the frame clipped. shake moves the whole picture (film units).
 begin(sx=0,sy=0){const c=this.c;c.setTransform(1,0,0,1,0,0);c.globalAlpha=1;c.globalCompositeOperation='source-over';c.fillStyle='#000';c.fillRect(0,0,this.el.width,this.el.height);
  c.setTransform(this.s,0,0,this.s,this.ox+sx*this.s,this.oy+sy*this.s);c.save();c.beginPath();c.rect(-sx,-sy,FW,FH);c.clip();return c;}
 // The finish. f: {bloom, grade:[col, alpha, mode], lift, vignette, grain, bars (0 to 1), fade (0 to 1), fr}.
 end(f={}){const c=this.c;c.restore();const {s,ox,oy}=this,W=FW*s,H=FH*s,dev=()=>c.setTransform(1,0,0,1,0,0),film=()=>c.setTransform(s,0,0,s,ox,oy);
  // Bloom: a small copy of the frame, multiplied by itself twice so only the bright parts survive, spread wide and added back.
  if(f.bloom>0){const a=this.b1.c,b=this.b2.c;a.globalCompositeOperation='source-over';a.imageSmoothingEnabled=true;a.drawImage(this.el,ox,oy,W,H,0,0,120,68);
   a.globalCompositeOperation='multiply';a.drawImage(this.b1.k,0,0);a.drawImage(this.b1.k,0,0);a.globalCompositeOperation='source-over';
   b.imageSmoothingEnabled=true;b.drawImage(this.b1.k,0,0,40,23);dev();c.imageSmoothingEnabled=true;c.globalCompositeOperation='lighter';
   c.globalAlpha=Math.min(1,f.bloom*.55);c.drawImage(this.b1.k,ox,oy,W,H);c.globalAlpha=Math.min(1,f.bloom);c.drawImage(this.b2.k,ox,oy,W,H);c.globalAlpha=1;c.globalCompositeOperation='source-over';}
  film();
  if(f.grade){const [col,a,mode='soft-light']=f.grade;c.globalCompositeOperation=mode;c.globalAlpha=a;c.fillStyle=col;c.fillRect(0,0,FW,FH);c.globalAlpha=1;c.globalCompositeOperation='source-over';}
  if(f.lift){c.globalCompositeOperation='lighter';c.fillStyle=f.lift;c.fillRect(0,0,FW,FH);c.globalCompositeOperation='source-over';}
  if(f.vignette>0){c.globalAlpha=f.vignette;c.imageSmoothingEnabled=true;c.drawImage(vig(),0,0);c.globalAlpha=1;}
  // Grain at about two screen pixels a grain, a different tile and offset every frame.
  if(f.grain>0){dev();const fr=f.fr|0,tile=grain()[(fr%4+4)%4],g=Math.max(1,Math.round(s/2.2)),T=128*g,dx=-Math.floor(hash(fr*31)*T),dy=-Math.floor(hash(fr*57)*T);c.save();c.beginPath();c.rect(ox,oy,W,H);c.clip();
   c.imageSmoothingEnabled=false;c.globalCompositeOperation='overlay';c.globalAlpha=f.grain;for(let y=oy+dy;y<oy+H;y+=T)for(let x=ox+dx;x<ox+W;x+=T)c.drawImage(tile,x,y,T,T);c.restore();c.globalAlpha=1;c.globalCompositeOperation='source-over';film();}
  if(f.bars>0){const h=BAR*clamp(f.bars);c.fillStyle='#000';c.fillRect(-1,-1,FW+2,h+1);c.fillRect(-1,FH-h,FW+2,h+1);}
  if(f.fade>0){c.globalAlpha=clamp(f.fade);c.fillStyle='#000';c.fillRect(-1,-1,FW+2,FH+2);c.globalAlpha=1;}
  // Anything outside the film frame (a tall phone) stays black.
  dev();c.fillStyle='#000';if(oy>0){c.fillRect(0,0,this.el.width,oy);c.fillRect(0,oy+H,this.el.width,this.el.height);}if(ox>0){c.fillRect(0,0,ox,this.el.height);c.fillRect(ox+W,0,this.el.width,this.el.height);}
  film();}
}
// Draw part of a picture (sx, sy, sw, sh in its pixels) over the whole film frame. Pixel art stays crisp when it is being blown up and is
// smoothed when it is shrunk, so a slow move does not shimmer.
export function view(c,img,sx,sy,sw,sh,x=0,y=0,w=FW,h=FH){const up=w/sw;c.imageSmoothingEnabled=up<1.6;c.drawImage(img,sx,sy,sw,sh,x,y,w,h);}
// Text in film units, for the times and the title, in the game's faces (Barlow Condensed; the title uses Saira Stencil One).
export function caption(c,s,x,y,{size=9,font="'Barlow Condensed','Arial Narrow',Arial,sans-serif",weight=600,color='#e8e0d1',align='left',track=0,alpha=1,glow=null}={}){if(alpha<=0)return;c.save();c.globalAlpha=clamp(alpha);c.font=`${weight} ${size}px ${font}`;c.textBaseline='alphabetic';
 if('letterSpacing' in c){c.letterSpacing=`${track}px`;c.textAlign=align;if(glow){c.shadowColor=glow;c.shadowBlur=size*.8;}c.fillStyle=color;c.fillText(s,x+(align==='center'?track/2:0),y);}
 else{const ws=[...s].map(ch=>c.measureText(ch).width+track),tw=ws.reduce((a,b)=>a+b,0)-track;let px=align==='center'?x-tw/2:align==='right'?x-tw:x;c.textAlign='left';if(glow){c.shadowColor=glow;c.shadowBlur=size*.8;}c.fillStyle=color;[...s].forEach((ch,i)=>{c.fillText(ch,px,y);px+=ws[i];});}
 c.restore();}
// Ease helpers the shots share.
export const smooth=k=>{k=clamp(k);return k*k*k*(k*(k*6-15)+10);},inOut=(t,a,b)=>smooth((t-a)/(b-a));
// A camera shake that dies away: amplitude a, from time t0, over dur seconds.
export function shake(t,t0,a,dur=.6){const k=t-t0;if(k<0||k>dur)return [0,0];const d=a*(1-k/dur)**2,f=Math.floor(t*40);return [(hash(f*13+1)-.5)*2*d,(hash(f*29+7)-.5)*2*d];}
