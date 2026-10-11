// CH 6, earlier this week: LZ-6 fever. A queue of umbrellas round a clinic in the rain, a man showing off his bandage, and a dose
// counter that won't stop climbing. The report is cut short by the BREAKING NEWS sting that brings in tonight's anchor.
import {R,hash,clamp,ease} from './kit.js';
import {text,width} from './font.js';
import {captions,lowerThird,ticker,bug} from './overlay.js';
import {bigText} from './ad.js';
export const MONTAGE={dur:9.4,shots:[3.1,5.9],sting:8.6,captions:[[3.5,"I'M NEVER DYING. EVER."]],speech:[[3.5,4.6]],
 ticker:'MARROW STOCK UP 900% · CLINICS OPEN 24 HOURS · WAITS OF UP TO THREE DAYS · 48 MILLION DOSES AND COUNTING · '};
function rain(c,lt,a=.35){c.globalAlpha=a;for(let i=0;i<70;i++){const x=(hash(i*17)*260+lt*40)%260-10,y=(hash(i*29)*150+lt*260)%150-10;R(c,x,y,1,4,'#c8d4e8');}c.globalAlpha=1;}
// Shot 1: the queue round the block, from the clinic's glowing door right up to the camera.
function queue(c,lt){for(let y=0;y<80;y++)R(c,0,y,240,1,`rgb(${30+y*.3|0},${36+y*.3|0},${54+y*.2|0})`);
 for(let x=0;x<150;x+=18){const h=24+(hash(x)*30|0);R(c,x,80-h,16,h,'#181c28');for(let wy=80-h+4;wy<76;wy+=7)if(hash(x+wy)<.4)R(c,x+4,wy,3,3,'#4a4a3a');}
 R(c,140,8,100,72,'#1c2230');for(let wy=14;wy<52;wy+=9)for(let wx=146;wx<236;wx+=10)R(c,wx,wy,5,5,'#3a4a5a');R(c,150,52,80,9,'#0e1a34');text(c,'MARROW CLINIC',156,53,'#7ab4ff');
 c.globalAlpha=.2;c.fillStyle='#4a8aff';c.beginPath();c.arc(187,72,18,0,7);c.fill();c.globalAlpha=1;R(c,177,62,20,18,'#d8e8ff');
 // Wet pavement, with the door's light and the street lamps smeared across it.
 for(let y=80;y<135;y++)R(c,0,y,240,1,`rgb(${34-(y-80)*.2|0},${38-(y-80)*.2|0},${50-(y-80)*.2|0})`);R(c,0,80,240,1,'#4a5266');
 c.globalAlpha=.25;for(let y=82;y<135;y+=2)R(c,180-(y-82)*.3,y,14,1,'#a8c8ff');c.globalAlpha=1;
 for(let i=0;i<=13;i++){const k=i/13,x=Math.round(184-k*164+Math.sin(i*1.7)*4),y=Math.round(84+k*k*56),s=.7+k*k*2,col=['#4a5a7a','#7a4a3a','#4a6a4a','#5a5a6a','#6a5a3a'][i%5],um=['#2a4a8a','#8a2a2a','#2a6a4a','#3a3a46','#8a7a2a'][(i*3)%5];
  const h=Math.round(18*s),w=Math.max(3,Math.round(7*s)),leg=Math.round(5*s);
  R(c,x-Math.round(w*.35),y-leg,Math.max(1,Math.round(w*.25)),leg,'#14141a');R(c,x+Math.round(w*.1),y-leg,Math.max(1,Math.round(w*.25)),leg,'#14141a');
  R(c,x-Math.round(w/2),y-h,w,h-leg,col);R(c,x-Math.round(w/2),y-h,1,h-leg,'#00000040');
  const hd=Math.max(2,Math.round(4*s));R(c,x-Math.round(hd/2),y-h-hd,hd,hd,'#c8a088');
  const uw=Math.round(16*s),ud=Math.max(2,Math.round(5*s)),top=y-h-hd-Math.round(3*s);R(c,x,top,1,Math.round(hd+3*s+h*.4),'#0a0b10');
  for(let j=0;j<ud;j++){const rw=Math.round(uw*(.35+.65*Math.sqrt((j+1)/ud)));R(c,x-Math.round(rw/2),top-ud+j,rw,1,um);}R(c,x-Math.round(uw/2),top-1,uw,1,'#c8d4e8');}
 rain(c,lt);}
// Shot 2: the man in line, grinning, sleeve rolled up over the bandage.
function man(c,lt){for(let y=0;y<135;y++)R(c,0,y,240,1,`rgb(${24+y*.15|0},${30+y*.15|0},${44+y*.1|0})`);c.globalAlpha=.3;for(let i=0;i<10;i++){const x=hash(i*7)*240;R(c,x,40+hash(i)*20,10,60,'#3a4250');R(c,x-6,30+hash(i)*20,22,8,['#3a5a8a','#8a3a3a'][i%2]);}c.globalAlpha=1;
 const mx=100,b=Math.round(Math.sin(lt*5)*1);R(c,mx-30,80,62,55,'#2a4a6a');R(c,mx-30,80,62,4,'#1a3450');R(c,mx-8,78,16,8,'#c89070');
 R(c,mx-14,34+b,28,42,'#c89070');R(c,mx-16,42+b,32,26,'#c89070');R(c,mx+8,38+b,6,36,'#a87050');R(c,mx-16,28+b,32,12,'#1a1a1e');R(c,mx-18,34+b,6,12,'#1a1a1e');R(c,mx+12,34+b,6,10,'#1a1a1e');
 R(c,mx-10,52+b,6,3,'#ffffff');R(c,mx+4,52+b,6,3,'#ffffff');R(c,mx-8,52+b,3,3,'#2a1a14');R(c,mx+6,52+b,3,3,'#2a1a14');R(c,mx-11,49+b,8,2,'#1a1a1e');R(c,mx+3,49+b,8,2,'#1a1a1e');
 R(c,mx-9,64+b,18,5,'#6a2a24');R(c,mx-8,64+b,16,2,'#ffffff');R(c,mx-2,57+b,4,6,'#b07858');
 // His arm up beside his face: rolled sleeve, bare upper arm, the bandage, and a thumbs-up.
 R(c,mx+34,58,14,24,'#2a4a6a');R(c,mx+36,30,12,30,'#c89070');R(c,mx+38,40,8,7,'#f2f2f2');R(c,mx+39,41,6,5,'#e4e4e4');R(c,mx+40,43,4,1,'#c8102e');R(c,mx+35,18,14,13,'#c89070');R(c,mx+40,10,5,9,'#c89070');R(c,mx+35,22,14,1,'#a87050');
 rain(c,lt,.2);}
// Shot 3: the counter.
function counter(c,lt){R(c,0,0,240,135,'#0a1428');for(let y=8;y<92;y+=6)for(let x=10;x<230;x+=6){const n=hash(x*31+y*7);if(n<.45){const on=hash(Math.floor(lt*8)+x+y)<.2;R(c,x,y,2,2,on?'#7ab4ff':'#1a2a4a');}}
 const n=48201377+Math.floor((lt-MONTAGE.shots[1])*48211),s=n.toLocaleString('en-US');R(c,40,32,160,40,'#05070dd0');text(c,'DOSES GIVEN',120-Math.round(width('DOSES GIVEN')/2),38,'#7ab4ff');bigText(c,s,120-width(s),50,'#ffffff');}
// The sting: a red band sweeps the picture and BREAKING NEWS slams in.
function sting(c,k){const w=Math.round(240*ease(clamp(k*2)));R(c,0,0,w,135,'#8a0a1e');R(c,0,52,w,30,'#c8102e');if(k>.35){bigText(c,'BREAKING NEWS',120-width('BREAKING NEWS'),60,'#ffffff');}}
export function montage(c,lt){if(lt<MONTAGE.shots[0])queue(c,lt);else if(lt<MONTAGE.shots[1])man(c,lt);else counter(c,lt);
 if(lt<MONTAGE.sting){if(lt>=MONTAGE.shots[0])lowerThird(c,{tag:'SPECIAL REPORT',tagColor:'#1a5ad8',headline:'MILLIONS LINE UP FOR LZ-6',y:96,wipe:(lt-MONTAGE.shots[0])/.4});ticker(c,MONTAGE.ticker,lt,{station:'6 NEWS',color:'#1a5ad8'});bug(c,'6',240-6-12,5,'#1a5ad8');captions(c,MONTAGE.captions,lt);}
 else sting(c,(lt-MONTAGE.sting)/(MONTAGE.dur-MONTAGE.sting));}
