// CH 9, MTNN: archive footage of the live Lazarus trial, nine weeks ago. A dying volunteer on a studio stage flatlines, Dr. Varga gives
// him LZ-6, the monitor starts beeping again and he sits up as the audience leaps to its feet. Archive footage is faded and grainy.
import {R,hash,clamp,ease} from './kit.js';
import {text,width} from './font.js';
import {captions,lowerThird,bug} from './overlay.js';
export const TRIAL={dur:10,inject:[2.3,4],beat:5.5,sit:6.6,cheer:7.5,
 captions:[[.4,'HIS HEART HAS STOPPED.'],[1.9,'DR. VARGA IS ADMINISTERING'],[2.9,'LZ-6 NOW...'],[4.3,'[FLATLINE]'],[5.6,'[MONITOR BEEPING]'],[7.5,'[CHEERING]']],speech:[[.4,1.6],[1.9,3.8]]};
// When the heart beats: nothing until the injection takes, then faster and faster.
export const BEATS=(()=>{const out=[];let t=TRIAL.beat,gap=.62;while(t<TRIAL.dur){out.push(t);t+=gap;gap=Math.max(.32,gap*.9);}return out;})();
function stage(c,lt){R(c,0,0,240,135,'#0c0c12');
 // Spotlights from the rig, and the stage floor.
 c.globalAlpha=.16;for(const [x,w] of [[120,60],[70,34],[176,34]]){c.fillStyle='#fff2d0';c.beginPath();c.moveTo(x-6,0);c.lineTo(x+6,0);c.lineTo(x+w,100);c.lineTo(x-w,100);c.fill();}c.globalAlpha=1;
 for(let x=10;x<240;x+=28){R(c,x,0,8,3,'#2a2a30');R(c,x+3,3,2,1,'#fff2d0');}R(c,0,96,240,40,'#1a1820');R(c,0,96,240,1,'#3a3640');
 // A big screen behind the stage with the program's name.
 R(c,84,30,72,30,'#14203a');R(c,86,32,68,26,'#1e3460');text(c,'MARROW',120-Math.round(width('MARROW')/2),36,'#cfe0ff');text(c,'LZ-6',120-Math.round(width('LZ-6')/2),46,'#7ab4ff');}
function monitor(c,lt){const x=34,y=46;R(c,x+10,y+28,3,40,'#3a3a42');R(c,x+2,y+66,20,3,'#3a3a42');R(c,x-4,y,32,28,'#26262c');R(c,x-2,y+2,28,22,'#020a04');
 // The trace scrolls right to left; each beat is a spike.
 for(let i=0;i<28;i++){const tt=lt-(27-i)*.04;let v=0;for(const b of BEATS){const d=tt-b;if(d>=0&&d<.12)v=d<.04?-8:d<.08?5:0;}if(lt<TRIAL.cheer+3&&tt<TRIAL.beat)v=0;R(c,x-2+i,y+13+v,1,1,'#3aff6a');}
 const live=BEATS.some(b=>lt>=b&&lt<b+.12);R(c,x+20,y+4,3,3,live?'#ff4a3a':'#3a0e0a');text(c,lt<TRIAL.beat?'0':String(Math.min(118,60+Math.round((lt-TRIAL.beat)*24))),x,y+3,'#3aff6a');}
function bed(c,lt){const sit=ease(clamp((lt-TRIAL.sit)/.6));R(c,84,74,84,10,'#d8dce4');R(c,84,84,84,4,'#8a8e98');R(c,88,88,3,12,'#6a6e78');R(c,160,88,3,12,'#6a6e78');R(c,84,70,16,6,'#f2f2f4');
 // The volunteer: gaunt, in a gown, lying back; when he wakes he sits up.
 R(c,100,70,60,6,'#9ab0bc');R(c,150,72,14,4,'#c8a890');const hx=Math.round(88+sit*20),hy=Math.round(62-sit*22);
 if(sit>0){for(let i=0;i<Math.round(sit*22);i++)R(c,108+Math.round(i*.1),70-i,14,1,'#9ab0bc');}
 R(c,hx,hy,11,10,'#d4b49c');R(c,hx,hy,11,3,'#6a5a4a');R(c,hx+2,hy+5,2,1,sit>.5?'#1a1a1a':'#8a6a5a');R(c,hx+7,hy+5,2,1,sit>.5?'#1a1a1a':'#8a6a5a');R(c,hx+3,hy+8,5,1,'#8a5a50');}
function varga(c,lt){const lean=lt>=TRIAL.inject[0]&&lt<TRIAL.inject[1]?1:0,back=lt>=TRIAL.inject[1]?Math.min(8,(lt-TRIAL.inject[1])*20):0,x=Math.round(176+back-lean*6),y=36+lean*4;
 R(c,x-8,y+16,16,34,'#eceef2');R(c,x-8,y+16,2,34,'#c8ccd4');R(c,x-2,y+16,4,10,'#2a3a5a');R(c,x-6,y+50,5,14,'#2a2a32');R(c,x+1,y+50,5,14,'#2a2a32');
 R(c,x-5,y,10,12,'#e0b896');R(c,x-6,y-2,12,5,'#1a1210');R(c,x+2,y-5,6,5,'#1a1210');R(c,x-3,y+5,2,1,'#2a1a14');R(c,x+2,y+5,2,1,'#2a1a14');R(c,x-2,y+9,4,1,'#a0605a');R(c,x-2,y+12,4,4,'#d0a886');
 if(lean){for(let i=0;i<16;i++)R(c,x-8-i,y+22+Math.round(i*.4),3,3,'#eceef2');R(c,x-26,y+27,4,3,'#e0b896');R(c,x-34,y+28,8,1,'#d8e0e8');R(c,x-31,y+27,3,1,'#3a7aff');}
 else if(lt>=TRIAL.cheer){R(c,x-12,y+2,4,16,'#eceef2');R(c,x+8,y+2,4,16,'#eceef2');R(c,x-12,y-1,4,3,'#e0b896');R(c,x+8,y-1,4,3,'#e0b896');}}
function audience(c,lt){const up=lt>=TRIAL.cheer;for(let i=0;i<16;i++){const x=i*16-6+(hash(i)*6|0),jump=up?Math.round(Math.abs(Math.sin(lt*7+i))*4)+3:0,h=24+(hash(i*3)*6|0);
  R(c,x,135-h+8-jump,14,h,'#050507');R(c,x+3,135-h-2-jump,8,10,'#050507');if(up&&hash(i*11)<.5){R(c,x+1,135-h-12-jump,2,10,'#050507');R(c,x+11,135-h-12-jump,2,10,'#050507');}}
 if(up)for(let i=0;i<3;i++){const f=Math.floor(lt*10)+i*7;if(hash(f)<.25){const x=hash(f*3)*240,y=96+hash(f*5)*20;R(c,x-1,y-1,3,3,'#ffffff');}}}
// Archive footage: faded colour, a warm cast, grain and a soft roll.
function archive(c,lt){const img=c.getImageData(0,0,240,135),d=img.data,fr=Math.floor(lt*24);for(let i=0;i<d.length;i+=4){const l=d[i]*.3+d[i+1]*.55+d[i+2]*.15,g=(hash(i+fr*7919)-.5)*26;
  d[i]=Math.min(255,l*.55+d[i]*.45+14+g);d[i+1]=Math.min(255,l*.6+d[i+1]*.4+6+g);d[i+2]=Math.min(255,l*.6+d[i+2]*.4-6+g);}c.putImageData(img,0,0);
 const band=((lt*30)%170)-20;c.globalAlpha=.06;R(c,0,band,240,6,'#ffffff');c.globalAlpha=1;}
export function trial(c,lt){stage(c,lt);monitor(c,lt);bed(c,lt);varga(c,lt);audience(c,lt);archive(c,lt);
 R(c,6,5,width('NINE WEEKS AGO')+6,9,'#f2c200');text(c,'NINE WEEKS AGO',9,6,'#05070d');bug(c,'LIVE ON MTNN',240-6-width('LIVE ON MTNN')-6,5,'#8a2a2a');
 lowerThird(c,{tag:'ARCHIVE',tagColor:'#5a6274',headline:'THE LAZARUS TRIAL',y:99});captions(c,TRIAL.captions,lt,17);}
