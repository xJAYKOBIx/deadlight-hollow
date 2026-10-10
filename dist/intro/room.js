// The apartment, 256 × 400, seen from the couch: a wall-mounted flatscreen over a low console, a window with the blinds down, a plant,
// a photo, and the tips of a dog's ears and a cat's ears in the foreground. It is painted twice: dark, and lit in neutral greys that the
// scene tints with whatever colour the screen is showing.
import {R,rng} from './kit.js';
export const ROOM={w:256,h:400,screen:{x:8,y:128,w:240,h:135},led:{x:239,y:266},window:{x:10,y:40,w:46,h:62}};
export function room(c,lit=false){const r=rng(9),L=(dark,light)=>lit?light:dark,S=ROOM.screen,W=ROOM.window;
 R(c,0,0,256,400,L('#08090d','#5a5c62'));
 // Plaster with a faint texture.
 for(let i=0;i<900;i++)R(c,r()*256,r()*340,1,1,L('#0a0b10','#626468'));
 // The window: blinds down, a little city light between the slats.
 R(c,W.x-2,W.y-2,W.w+4,W.h+4,L('#0d0e12','#76787e'));for(let y=0;y<W.h;y+=3){R(c,W.x,W.y+y,W.w,2,L('#11131a','#8a8c92'));R(c,W.x,W.y+y+2,W.w,1,L('#05060a','#2a2c32'));}
 if(!lit)for(let i=0;i<10;i++)R(c,W.x+2+r()*(W.w-4),W.y+2+(r()*20|0)*3,1,1,r()<.5?'#3a3420':'#24283a');
 R(c,W.x-4,W.y+W.h+2,W.w+8,3,L('#121318','#909298'));
 // A framed photo above the console: two people, a dog and a cat.
 R(c,196,48,40,30,L('#120f0c','#7a746c'));R(c,198,50,36,26,L('#0c0e12','#5a5e66'));for(const [px,ph] of [[205,15],[216,13]]){R(c,px,76-ph,6,ph,L('#07080a','#3a3c42'));R(c,px+1,76-ph-5,4,5,L('#07080a','#3a3c42'));}R(c,224,70,7,6,L('#07080a','#3a3c42'));R(c,224,68,2,2,L('#07080a','#3a3c42'));R(c,229,68,2,2,L('#07080a','#3a3c42'));R(c,199,71,5,5,L('#07080a','#3a3c42'));R(c,199,69,1,2,L('#07080a','#3a3c42'));R(c,203,69,1,2,L('#07080a','#3a3c42'));
 // The flatscreen: a thin black bezel, a slightly deeper chin with the maker's mark, and its shadow on the wall.
 R(c,S.x-2,S.y-4,S.w+8,S.h+12,L('#050507','#3a3c42'));R(c,S.x-4,S.y-4,S.w+8,S.h+10,'#0a0a0c');R(c,S.x-4,S.y-4,S.w+8,1,L('#1c1d22','#9a9ca4'));R(c,S.x-4,S.y-4,1,S.h+10,L('#141519','#6a6c72'));
 R(c,S.x,S.y,S.w,S.h,'#040506');R(c,S.x+S.w/2-6,S.y+S.h+3,12,1,L('#1a1b20','#6a6c72'));
 // The soundbar under it, and the console.
 R(c,62,282,132,7,L('#0b0b0e','#4a4c52'));R(c,62,282,132,1,L('#17181c','#8a8c92'));for(let x=66;x<190;x+=2)R(c,x,285,1,2,L('#060608','#2a2c32'));
 R(c,26,318,204,34,L('#120d0a','#6e6258'));R(c,26,318,204,2,L('#1d1611','#a2958a'));R(c,128,322,1,28,L('#0a0705','#4a4038'));for(const x of [70,186])R(c,x,334,6,1,L('#2a2420','#c2b8ac'));
 // On the console: a plant, a game console, a remote's empty dock.
 R(c,38,304,10,14,L('#1a120c','#6e5a48'));for(const [lx,ly,lw] of [[30,294,10],[42,290,8],[36,300,12],[46,296,9],[32,286,6]])R(c,lx,ly,lw,3,L('#0b120c','#48604a'));
 R(c,150,308,28,10,L('#0c0c0e','#4a4c52'));R(c,152,309,2,1,'#2a6aff');
 // The floor and a rug.
 R(c,0,352,256,48,L('#060607','#3a3a3e'));R(c,40,362,176,38,L('#0b0a0c','#4a464a'));
 // The pets' ears at the bottom of the view, rimmed by the screen.
 for(const [ex,lean] of [[34,-1],[58,1]])for(let y=0;y<30;y++){const w=Math.max(1,Math.round(y*.42)),x0=ex+lean*(30-y)*.18-w/2;R(c,x0,370+y,w,1,'#030304');if(lit&&w>1)R(c,x0,370+y,1,1,'#9a9ca4');}
 for(const ex of [200,214])for(let y=0;y<10;y++){const w=Math.max(1,Math.round(y*.9));R(c,ex-w/2,388+y,w,1,'#030304');if(lit&&y>1)R(c,ex-w/2,388+y,1,1,'#9a9ca4');}
 R(c,188,396,40,4,'#030304');
 // Darken toward the edges of the view; the lit version also falls off with distance from the screen.
 const g=c.createRadialGradient(128,196,110,128,196,270);g.addColorStop(0,'#08090d00');g.addColorStop(1,lit?'#000000':'#08090dff');c.fillStyle=g;c.fillRect(0,0,256,400);
 if(lit){const f=c.createRadialGradient(S.x+S.w/2,S.y+S.h/2,40,S.x+S.w/2,S.y+S.h/2,230);f.addColorStop(0,'#00000000');f.addColorStop(1,'#000000f0');c.fillStyle=f;c.fillRect(0,0,256,400);}}
// The screen's own surface: a faint sheen across the glass.
export function glass(c,w,h){const g=c.createLinearGradient(0,0,w*.7,h);g.addColorStop(0,'#ffffff10');g.addColorStop(.42,'#ffffff04');g.addColorStop(.43,'#ffffff00');c.fillStyle=g;c.fillRect(0,0,w,h);}
export function light(c,s){const g=c.createRadialGradient(s/2,s/2,0,s/2,s/2,s/2);g.addColorStop(0,'#ffffffff');g.addColorStop(.35,'#ffffff70');g.addColorStop(1,'#ffffff00');c.fillStyle=g;c.fillRect(0,0,s,s);}
