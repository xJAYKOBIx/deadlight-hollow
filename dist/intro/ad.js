// CH 2: the Marrow Industries ad. Three shots: a grandfather lifting his granddaughter in a sunlit room, a nurse with the blue vial,
// and the Marrow logo blooming on white, with the small print running too fast to read.
import {R,hash,clamp,ease,canvas} from './kit.js';
import {text,width} from './font.js';
import {captions} from './overlay.js';
export const AD={dur:9,shots:[3.8,6.1],captions:[[.5,'WHAT IF GOODBYE'],[1.8,"DIDN'T HAVE TO BE FOREVER?"],[7.1,'BE SAVED.']],
 speech:[[.5,3.3],[7.1,7.8]],fine:'SIDE EFFECTS MAY INCLUDE HEADACHE, NAUSEA, FEVER, CHANGES IN APPETITE, CONFUSION AND AGGRESSION. ASK YOUR DOCTOR IF LZ-6 IS RIGHT FOR YOU. '};
// Text at twice the size, crisp: drawn small, then scaled up whole pixels.
const big=canvas(240,8);export function bigText(c,s,x,y,col,scale=2){const b=big.getContext('2d');b.clearRect(0,0,240,8);text(b,s,0,0,col);c.imageSmoothingEnabled=false;c.drawImage(big,0,0,width(s),7,Math.round(x),Math.round(y),width(s)*scale,7*scale);}
const ell=(c,cx,cy,rx,ry,col)=>{for(let y=-ry;y<=ry;y++){const w=Math.round(rx*Math.sqrt(Math.max(0,1-(y/ry)**2)));R(c,cx-w,cy+y,w*2+1,1,col);}};
// Shot 1: the warm room.
function room(c,lt){for(let y=0;y<100;y++)R(c,0,y,240,1,`rgb(${242-y*.2|0},${220-y*.35|0},${180-y*.5|0})`);
 R(c,14,8,70,84,'#fff7e0');for(const x of [37,60])R(c,x,8,2,84,'#e8d2a8');R(c,14,48,70,2,'#e8d2a8');for(let x=10;x<92;x+=4)R(c,x,4,2,92,'#fbf0d8');R(c,8,2,90,4,'#c9a072');
 // Light falling across the room.
 c.globalAlpha=.13;for(let i=0;i<4;i++){c.fillStyle='#fffbe8';c.beginPath();c.moveTo(20+i*16,10);c.lineTo(34+i*16,10);c.lineTo(150+i*22,135);c.lineTo(120+i*22,135);c.fill();}c.globalAlpha=1;
 for(let y=100;y<135;y++)R(c,0,y,240,1,y%6===0?'#9a6a3c':'#b07a48');R(c,0,100,240,1,'#8a5a32');
 R(c,186,64,54,40,'#c9a27a');R(c,190,56,50,14,'#d8b48c');R(c,186,100,54,4,'#a8805a');R(c,96,70,10,30,'#8a5a32');ell(c,101,64,9,8,'#6a8a4a');ell(c,98,60,5,4,'#7aa05a');
 for(let i=0;i<14;i++){const x=(hash(i*7)*200+lt*6)%220+10,y=(hash(i*13)*90+Math.sin(lt+i)*4);R(c,x,y+10,1,1,'#ffffffb0');}}
function grandpa(c,lt){const sway=Math.sin(lt*2.6),gx=146,lean=Math.round(sway*2);
 // Legs and shoes.
 R(c,gx-10,98,8,28,'#4a5466');R(c,gx+2,98,8,28,'#4a5466');R(c,gx-2,98,1,26,'#38404e');R(c,gx-12,126,11,4,'#2a2420');R(c,gx+1,126,11,4,'#2a2420');
 // Cardigan over a shirt, arms raised to hold her up.
 for(let y=0;y<34;y++){const half=y<4?9+y:13;R(c,gx-half+lean,64+y,half*2,1,y<4?'#9a7a58':'#8a6a4a');}R(c,gx-3+lean,64,6,18,'#ece4d0');R(c,gx-1+lean,66,2,16,'#d8ceb6');for(const by of [72,80,88])R(c,gx+lean,by,1,1,'#3a2a1c');R(c,gx+10+lean,66,3,32,'#6a4e36');
 const hy=26+Math.round(Math.cos(lt*2.6)*2);for(const s of [-1,1]){for(let i=0;i<34;i++){const k=i/34,x=gx+lean+s*(12-k*4),y=66-k*(66-hy-8);R(c,x-2,y,5,1,i<28?(s<0?'#9a7a58':'#7a5e40'):'#e2b48e');}}
 // Head: white hair, glasses, eyes shut with laughing.
 const hx=gx-7+lean,hy2=46;R(c,hx+1,hy2,13,15,'#e2b48e');R(c,hx,hy2+3,15,8,'#e2b48e');R(c,hx+10,hy2+2,4,12,'#c0906c');R(c,hx-1,hy2+1,4,9,'#e8e4dc');R(c,hx+12,hy2+1,4,9,'#e8e4dc');R(c,hx+2,hy2-1,11,3,'#e8e4dc');R(c,hx+4,hy2-2,7,1,'#bdb6aa');
 R(c,hx+2,hy2+6,4,3,'#5a4a3a');R(c,hx+8,hy2+6,4,3,'#5a4a3a');R(c,hx+3,hy2+7,2,1,'#e2b48e');R(c,hx+9,hy2+7,2,1,'#e2b48e');R(c,hx+6,hy2+7,2,1,'#5a4a3a');
 R(c,hx+4,hy2+11,7,2,'#7a3a30');R(c,hx+5,hy2+11,5,1,'#f2ece4');R(c,hx+3,hy2+14,9,2,'#c0906c');R(c,hx+5,hy2+15,5,3,'#c0906c');
 // His granddaughter, lifted up over his head: arms out wide, legs kicking, pigtails swinging.
 const cx=gx+lean+Math.round(sway*3),cy=hy-4,kick=Math.round(Math.sin(lt*9));
 R(c,cx-5,cy+14,3,9+kick,'#f0c8a4');R(c,cx+2,cy+14,3,9-kick,'#f0c8a4');R(c,cx-5,cy+22+kick,3,2,'#e05a5a');R(c,cx+2,cy+22-kick,3,2,'#e05a5a');
 for(let y=0;y<12;y++){const w=4+Math.round(y*.5);R(c,cx-w,cy+3+y,w*2,1,y>9?'#d8a830':'#f2c440');}R(c,cx-1,cy+4,2,1,'#ffffff');
 for(let i=0;i<9;i++){R(c,cx-6-i,cy+4-Math.round(i*.7),2,2,'#f0c8a4');R(c,cx+5+i,cy+4-Math.round(i*.7),2,2,'#f0c8a4');}
 R(c,cx-4,cy-8,9,10,'#f0c8a4');R(c,cx-5,cy-9,11,4,'#6a3a1c');R(c,cx-6,cy-7,2,5,'#6a3a1c');R(c,cx+5,cy-7,2,5,'#6a3a1c');R(c,cx-9+Math.round(sway),cy-7,3,6,'#6a3a1c');R(c,cx+7+Math.round(sway),cy-7,3,6,'#6a3a1c');R(c,cx-8,cy-8,2,2,'#e05a5a');R(c,cx+7,cy-8,2,2,'#e05a5a');
 R(c,cx-2,cy-4,1,1,'#3a2a20');R(c,cx+2,cy-4,1,1,'#3a2a20');R(c,cx-1,cy-1,3,2,'#b04a40');R(c,cx-3,cy-2,1,1,'#f0a090');R(c,cx+3,cy-2,1,1,'#f0a090');
 // His hands at her waist.
 R(c,cx-8,cy+8,4,4,'#e2b48e');R(c,cx+4,cy+8,4,4,'#e2b48e');}
// Shot 2: the nurse and the vial, soft and bright.
function nurse(c,lt){for(let y=0;y<135;y++)R(c,0,y,240,1,`rgb(${214+y*.2|0},${232+y*.1|0},${244})`);
 for(let i=0;i<9;i++){const x=hash(i*5)*240,y=hash(i*9)*100,r=6+hash(i*3)*10;c.globalAlpha=.25;c.fillStyle='#ffffff';c.beginPath();c.arc(x,y,r,0,7);c.fill();}c.globalAlpha=1;
 const nx=96;R(c,nx-34,96,68,39,'#3aa6a0');R(c,nx-10,96,20,12,'#2c8c86');R(c,nx-8,96,16,8,'#f2d6be');
 R(c,nx-16,40,32,46,'#f2d6be');R(c,nx-18,48,36,30,'#f2d6be');R(c,nx+10,44,6,40,'#dcb89c');R(c,nx-18,34,36,14,'#2a1a14');R(c,nx-20,40,6,26,'#2a1a14');R(c,nx+14,40,6,24,'#2a1a14');R(c,nx-10,30,22,6,'#3a2418');R(c,nx-6,84,12,12,'#e8c8ae');
 R(c,nx-11,58,7,3,'#ffffff');R(c,nx+4,58,7,3,'#ffffff');R(c,nx-9,58,4,3,'#2a3a5a');R(c,nx+6,58,4,3,'#2a3a5a');R(c,nx-12,55,8,1,'#2a1a14');R(c,nx+4,55,8,1,'#2a1a14');R(c,nx-2,62,3,8,'#e2c0a4');
 R(c,nx-7,74,14,2,'#c05a5a');R(c,nx-5,75,10,2,'#ffffff');R(c,nx-15,68,4,3,'#f2b8b0');R(c,nx+11,68,4,3,'#f2b8b0');
 // Her gloved hand and the syringe, the blue vial catching the light.
 const sx=150,sy=34;R(c,sx-6,sy+50,16,14,'#e4eef4');R(c,sx-2,sy+46,8,6,'#e4eef4');R(c,sx,sy,4,40,'#e8f0f4');R(c,sx,sy+8,4,22,'#3a7aff');R(c,sx+1,sy+9,1,20,'#8ab4ff');R(c,sx+1,sy-8,2,8,'#c8d0d8');R(c,sx-4,sy+40,12,2,'#c8d0d8');
 const glint=(lt*1.4)%1;if(glint<.3){R(c,sx+1,sy+8+glint*70,2,3,'#ffffff');}c.globalAlpha=.25;c.fillStyle='#4a8aff';c.beginPath();c.arc(sx+2,sy+20,14,0,7);c.fill();c.globalAlpha=1;
 const k=clamp((lt-AD.shots[0]-.3)/.4);if(k>0){c.globalAlpha=k;R(c,0,108,240,16,'#ffffffd0');const s='LZ-6 BY MARROW INDUSTRIES';text(c,s,Math.round((240-width(s))/2),113,'#1a4a8a');c.globalAlpha=1;}}
// Shot 3: the logo on white.
export function marrowLogo(c,cx,cy,k=1){c.globalAlpha=k;c.strokeStyle='#1a5ad8';c.lineWidth=2;c.beginPath();c.arc(cx,cy,11,0,7);c.stroke();
 for(let y=-6;y<=6;y++){const w=Math.round(4*Math.sqrt(Math.max(0,1-((y-1)/6)**2))*(y<-2?(y+7)/5:1));R(c,cx-w,cy+y,w*2+1,1,'#2a6aff');}R(c,cx-2,cy-1,1,3,'#cfe0ff');
 c.strokeStyle='#e8b830';c.lineWidth=1;c.beginPath();c.ellipse(cx,cy-16,8,2,0,0,7);c.stroke();c.globalAlpha=1;}
function logoShot(c,lt){R(c,0,0,240,135,'#ffffff');const k=ease(clamp((lt-AD.shots[1])/.6));
 c.globalAlpha=.15*k;c.fillStyle='#8ab4ff';c.beginPath();c.arc(120,48,60*k,0,7);c.fill();c.globalAlpha=1;marrowLogo(c,120,44,k);
 if(k>.3){c.globalAlpha=clamp((k-.3)/.4);bigText(c,'MARROW',120-width('MARROW'),66,'#1a2a4a');const s='DEATH IS NO LONGER THE END.';text(c,s,Math.round((240-width(s))/2),88,'#4a5a7a');c.globalAlpha=1;}
 const off=((lt-AD.shots[1])*150)%(width(AD.fine)+40);c.globalAlpha=.55;text(c,AD.fine,240-off,124,'#8a92a2');c.globalAlpha=1;}
export function ad(c,lt){if(lt<AD.shots[0]){room(c,lt);grandpa(c,lt);}else if(lt<AD.shots[1])nurse(c,lt);else logoShot(c,lt);captions(c,AD.captions,lt);}
