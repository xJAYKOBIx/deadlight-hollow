// The watcher's window: the frame the tutorial death is seen through. Someone across the street is
// looking out between the blinds and a curtain, so the street shows through a cut-out pane. Painted
// at low resolution onto an overlay canvas each frame; noise is hashed so the wall never crawls.
import {hash2} from '../mc/assets/core/paint.js';

// Where the glass sits, as fractions of the canvas.
export const PANE={x0:.13,x1:.87,y0:.15,y1:.85};

// c: 2D context sized to the overlay. t: seconds since the death. open: 0 = black, 1 = fully seen.
export function paintWindow(c,t,open=1){
 const W=c.canvas.width,H=c.canvas.height,x0=PANE.x0*W|0,x1=PANE.x1*W|0,y0=PANE.y0*H|0,y1=PANE.y1*H|0,pw=x1-x0,ph=y1-y0;
 c.save();c.clearRect(0,0,W,H);
 // Wall: near-black plaster with a faint hashed mottle.
 c.fillStyle='#0b0c10';c.fillRect(0,0,W,H);
 for(let y=0;y<H;y+=2)for(let x=0;x<W;x+=2){const n=hash2(x,y);if(n>.82){c.fillStyle=`rgba(40,42,52,${(n-.82)*.9})`;c.fillRect(x,y,2,2);}}
 // Casing and sill around the glass.
 c.fillStyle='#17181e';c.fillRect(x0-6,y0-6,pw+12,ph+12);
 c.fillStyle='#22232b';c.fillRect(x0-10,y1+4,pw+20,5);
 c.fillStyle='#2c2d36';c.fillRect(x0-10,y1+4,pw+20,1);
 // Cut the pane out so the street below shows through.
 c.globalCompositeOperation='destination-out';c.fillStyle='#000';c.fillRect(x0,y0,pw,ph);
 c.globalCompositeOperation='source-over';
 if(open<1){c.fillStyle=`rgba(0,0,0,${1-open})`;c.fillRect(x0,y0,pw,ph);}
 // Glass: cold tint, a diagonal sheen, dust, and breath fogging the lower middle.
 c.fillStyle='rgba(40,60,80,.10)';c.fillRect(x0,y0,pw,ph);
 const sh=c.createLinearGradient(x0,y0,x0+pw*.6,y1);sh.addColorStop(0,'rgba(255,255,255,.07)');sh.addColorStop(.35,'rgba(255,255,255,0)');
 sh.addColorStop(.55,'rgba(255,255,255,.03)');sh.addColorStop(.7,'rgba(255,255,255,0)');c.fillStyle=sh;c.fillRect(x0,y0,pw,ph);
 for(let i=0;i<70;i++){const px=x0+hash2(i,3)*pw|0,py=y0+hash2(i,9)*ph|0;c.fillStyle=`rgba(200,200,190,${.04+hash2(i,5)*.06})`;c.fillRect(px,py,1,1);}
 const fx=x0+pw*.5,fy=y0+ph*.72,fr=Math.min(pw,ph)*.32,fog=c.createRadialGradient(fx,fy,0,fx,fy,fr);
 fog.addColorStop(0,`rgba(180,190,200,${.12*(.55+.45*Math.sin(1.3*t))})`);fog.addColorStop(1,'rgba(180,190,200,0)');c.fillStyle=fog;c.fillRect(x0,y0,pw,ph);
 // Vignette inside the pane so the eye sits in the middle.
 const vg=c.createRadialGradient(fx,y0+ph*.5,Math.min(pw,ph)*.3,fx,y0+ph*.5,Math.max(pw,ph)*.7);
 vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(0,0,0,.55)');c.fillStyle=vg;c.fillRect(x0,y0,pw,ph);
 // Meeting rail across the sash.
 const ry=y0+ph*.42|0;c.fillStyle='#15161c';c.fillRect(x0,ry,pw,4);c.fillStyle='#24252e';c.fillRect(x0,ry,pw,1);
 // Blinds pulled most of the way up: slats over the top fifth, with a cord.
 const by=y0+ph*.2|0;for(let y=y0;y<by;y+=4){c.fillStyle='#1d1e25';c.fillRect(x0,y,pw,3);c.fillStyle='#2a2b33';c.fillRect(x0,y,pw,1);}
 c.fillStyle='#101116';c.fillRect(x0,by,pw,2);
 c.fillStyle='#2a2b33';c.fillRect(x1-14,by,1,ph*.35|0);c.fillRect(x1-15,(by+ph*.35)|0,3,4);
 // Curtains: a wide drape held back on the left, a sliver on the right.
 const drape=(a,b,dark)=>{for(let x=a;x<b;x++){const f=.5+.5*Math.sin(x*.55);c.fillStyle=dark?`rgb(${18+f*8|0},${14+f*6|0},${16+f*6|0})`:`rgb(${24+f*12|0},${18+f*8|0},${20+f*8|0})`;c.fillRect(x,0,1,H);}};
 drape(0,x0+pw*.07|0,0);drape(x1-pw*.03|0,W,1);
 c.restore();
}
