// Channel 6, 11:47 PM, on a widescreen picture (240 × 135): the newsroom, the anchor and her poses, the graphics the control room lays
// over her, and the first frame of the live feed from St. Agnes.
import {R,rng,sprite,clamp,ease,hash} from './kit.js';
import {text,width} from './font.js';
export const PW=240,PH=135;
// The anchor. Key light from the front left, a cool rim light from the studio behind her.
const PAL={d:'#160c08',h:'#2c1a11',H:'#4a2c1c',s:'#dcae8a',S:'#b9876a',l:'#f0caa6',e:'#24140e',w:'#f2ece4',b:'#3a2216',m:'#a8574e',o:'#3a1210',n:'#c4906f',g:'#d8b24a',r:'#7b9ad8',k:'#1a1a1e'};
const HEAD=[
 '....ddhhhhdd....',
 '..dhhhHHHhhhhd..',
 '.dhhHHHhhhhhhhd.',
 '.dhHHhhhhhhhhhhr',
 'dhhHhhhhhhhdhhhr',
 'dhhhhssslllhhhhr',
 'dhhhsssllllshhhr',
 'dhhsbbsslsbbshhd',
 'dhhseesslsseeShd',
 'dhhssssslsssSShd',
 'dhhsssssnssssShd',
 'dhhSsssssssssShd',
 'dhhSsssmmmsssShd',
 'dhgSssssssssSShd',
 'dhhhSSssssSSShhd',
 'dhhh.SSSSSSS.hhd',
 '.dhh..SsssS..hhd',
 '..dd..SsssS..dd.',
 '......SsssS.....',
 '......SSssS.....'];
function headRows({mouth=0,blink=false,turn=false,worry=false,down=false}){const rows=HEAD.map(r=>r.split(''));const put=(y,x,s)=>{for(let i=0;i<s.length;i++)rows[y][x+i]=s[i];};
 if(turn){put(6,4,'bb');put(6,10,'bb');put(7,4,'ss');put(7,10,'ss');put(8,4,'we');put(8,11,'we');for(let y=9;y<15;y++)rows[y][3]='h';}
 else if(worry){put(7,4,'sb');put(6,5,'b');put(7,11,'bs');put(6,10,'b');put(7,5,'s');put(7,10,'s');}
 if(down&&!turn){put(8,4,'SS');put(8,11,'SS');put(9,4,'ee');put(9,11,'ee');}
 if(mouth===1)put(12,7,'mom');if(mouth===2){put(12,7,'ooo');put(13,7,'mmm');}if(blink&&!down){put(8,4,'SS');put(8,11,'SS');}
 return rows.map(r=>r.join(''));}
// (x, y) is the top of her head, centred. ear: her hand is up at her earpiece.
export function anchor(c,x,y,pose={}){const hx=Math.round(x)-8,hy=Math.round(y);
 for(let dy=0;dy<60;dy++){const half=Math.min(19,6+13*Math.sqrt(Math.min(1,dy/10))),yy=hy+19+dy,H=Math.floor(half);for(let dx=-H;dx<=H;dx++){const xx=hx+8+dx,f=(dx+half)/(half*2),arm=Math.abs(dx)>=12;
   let col=dx<-12?'#8b2a37':dx>12?'#4a121c':f<.38?'#7a2330':'#6c1d2a';if(Math.abs(dx)===12&&dy>8)col='#3d0f17';if(dy<3&&Math.abs(dx)>=H-1)col=dx<0?'#9c3442':'#5a1722';
   const v=Math.max(0,3.5-dy*.32);if(!arm&&Math.abs(dx+.5)<v)col=dy<2?'#c9a588':'#e8dccb';else if(!arm&&Math.abs(Math.abs(dx+.5)-v)<1&&dy<12)col='#3d0f17';
   if(dx===H&&dy>2)col=PAL.r;R(c,xx,yy,1,1,col);}}
 R(c,hx+8,hy+36,1,1,'#d8b24a');R(c,hx+8,hy+43,1,1,'#d8b24a');R(c,hx+2,hy+27,2,2,'#d8b24a');
 sprite(c,headRows(pose),PAL,hx+(pose.turn?1:0),hy);
 // The earpiece, a tiny dark curl at her right ear; when she presses it, her forearm comes up from the desk.
 R(c,hx+13,hy+12,1,2,PAL.k);
 if(pose.ear){for(let i=0;i<20;i++){const ax=hx+20-Math.round(i*.25),ay=hy+40-i;R(c,ax,ay,4,1,i<16?'#5a1722':PAL.S);}R(c,hx+14,hy+12,3,4,PAL.s);R(c,hx+16,hy+13,1,3,PAL.S);}}
// The newsroom: the city through the glass on the left, half of it dark and burning; a video wall on the right.
export function studio(c){const r=rng(66),roofs=[];
 for(let y=0;y<PH;y++){const k=y/PH;R(c,0,y,PW,1,`rgb(${11+k*10|0},${20+k*14|0},${44+k*24|0})`);}
 for(let y=8;y<84;y++){const k=(y-8)/76,haze=Math.max(0,(k-.55)/.45);R(c,0,y,128,1,`rgb(${14+haze*48|0},${22+haze*16|0},${44-haze*14|0})`);}
 for(const [fx,top] of [[30,26],[96,20]])for(let y=top;y<78;y++){const w=3+(78-y)*.18+Math.sin(y*.3)*1.5;c.globalAlpha=.35;R(c,fx-w/2+Math.sin(y*.15)*3,y,w,1,'#2a2a30');c.globalAlpha=1;}
 for(const [base,col,lit] of [[64,'#0b1022',.05],[54,'#070b18',.1]])for(let x=-4;x<128;){const w=8+r()*16|0,h=12+r()*(base-24)|0,top=84-h;R(c,x,top,w,h,col);if(base===54)roofs.push([x,w,top]);
   for(let wy=top+3;wy<82;wy+=4)for(let wx=x+2;wx<x+w-2;wx+=3)if(r()<lit)R(c,wx,wy,1,2,r()<.7?'#c9a24a':'#e6d8a0');if(r()<.2)R(c,x+w/2,top-4,1,1,'#d03a2a');x+=w+(r()*3|0);}
 for(let x=0;x<=128;x+=42)R(c,x-1,8,3,76,'#0a0f1e');R(c,0,7,128,2,'#1f2c4c');R(c,0,83,128,2,'#1f2c4c');
 // Video wall frame.
 R(c,128,6,112,84,'#0a0f1e');R(c,131,9,106,78,'#101830');
 for(let x=16;x<PW;x+=40){R(c,x-3,0,7,2,'#2a3654');R(c,x-1,2,3,1,'#9fb4e0');}
 return [30,96].map(fx=>{const b=roofs.reduce((a,o)=>Math.abs(o[0]+o[1]/2-fx)<Math.abs(a[0]+a[1]/2-fx)?o:a);return {x:b[0],w:b[1],top:b[2]};});}
export function fire(c,f,t){const fr=Math.floor(t*12),cx=f.x+f.w/2,g=c.createRadialGradient(cx,f.top,0,cx,f.top,16);g.addColorStop(0,'#ff8a3a55');g.addColorStop(1,'#ff8a3a00');c.fillStyle=g;c.fillRect(cx-16,f.top-16,32,32);
 for(let i=0;i<f.w;i++){const h=1+((Math.sin(i*1.7+fr*2.3)+Math.sin(i*.6-fr*1.1))*1.2+2.4|0);for(let j=0;j<h;j++)R(c,f.x+i,f.top-1-j,1,1,j>=h-1?'#7a2e14':j>h/2?'#d0602a':'#f2b25a');}}
// What the video wall shows: the Saved program's logo, then the live feed from the hospital.
export function wall(c,mode,t){const x=131,y=9,w=106,h=78;
 if(mode==='saved'){for(let j=0;j<h;j++)R(c,x,y+j,w,1,`rgb(${24+j*.5|0},${52+j*.8|0},${108+j*.8|0})`);const cx=x+w/2,cy=y+30;
  for(let a=0;a<64;a++){const q=a/64*Math.PI*2;R(c,cx+Math.cos(q)*11,cy-12+Math.sin(q)*3,1,1,'#f4e6a0');}sprite(c,['.ww.ww.','wwwwwww','wwwwwww','.wwwww.','..www..','...w...'],{w:'#f6f2ea'},cx-3,cy-5);
  text(c,'THE SAVED',cx-26,y+52,'#f6f2ea');text(c,'LZ-6',cx-11,y+62,'#9fc0f0');return;}
 // Live: the hospital at night, its sign, and police lights.
 R(c,x,y,w,h,'#0a0c14');R(c,x+14,y+18,78,52,'#1a1e2a');for(let wy=y+24;wy<y+62;wy+=7)for(let wx=x+18;wx<x+88;wx+=8)R(c,wx,wy,4,3,hash(wx*7+wy)<.4?'#c9b47a':'#0e1018');
 R(c,x+30,y+10,46,7,'#2a0606');text(c,'ST.AGNES',x+29,y+10,'#ff4a3a');const flash=Math.floor(t*6)%2;R(c,x,y+h-10,w,10,'#06070a');R(c,x+8,y+h-14,22,6,'#20232c');R(c,x+12,y+h-16,4,2,flash?'#ff2a2a':'#2a50ff');R(c,x+20,y+h-16,4,2,flash?'#2a50ff':'#ff2a2a');
 R(c,x+2,y+2,22,8,'#c8102e');text(c,'LIVE',x+3,y+2,'#fff');}
export function desk(c){R(c,0,90,PW,2,'#8fb0e8');R(c,0,92,PW,5,'#2a3a64');for(let y=97;y<PH;y++)R(c,0,y,PW,1,y%9===0?'#141c34':'#18223e');R(c,0,97,PW,1,'#0c1226');}
// The live feed from outside St. Agnes, as it first comes up: Alex Park with his microphone, the ER doors, police lights.
export function field(c,t){R(c,0,0,PW,PH,'#07080d');R(c,40,10,200,80,'#151925');for(let wy=18;wy<70;wy+=8)for(let wx=48;wx<236;wx+=10)R(c,wx,wy,5,4,hash(wx*13+wy)<.35?'#a89a6a':'#0b0d14');
 R(c,120,58,64,32,'#0d1018');R(c,124,62,26,28,'#2a3a4a');R(c,154,62,26,28,'#2a3a4a');R(c,118,50,68,8,'#3a0808');text(c,'EMERGENCY',125,50,'#ff4a3a');
 R(c,0,90,PW,45,'#0b0b0e');const f=Math.floor(t*6)%2;for(const [px,py] of [[196,84],[214,86]]){R(c,px,py,16,8,'#1c1e26');R(c,px+3,py-2,4,2,f?'#ff2a2a':'#2a50ff');R(c,px+9,py-2,4,2,f?'#2a50ff':'#ff2a2a');}
 c.globalAlpha=.18;R(c,0,0,PW,PH,f?'#ff2020':'#2040ff');c.globalAlpha=1;
 for(let i=0;i<14;i++){const px=100+hash(i*31)*120,ph=16+hash(i*7)*8;R(c,px,104-ph,5,ph,'#040406');R(c,px+1,100-ph,3,4,'#040406');}
 // Alex: dark jacket, mic in hand, half turned to the camera.
 R(c,16,52,30,83,'#1c2230');R(c,22,30,16,20,'#c08868');R(c,22,28,16,6,'#1a120c');R(c,26,38,2,2,'#1a120c');R(c,33,38,2,2,'#1a120c');R(c,28,44,5,1,'#7a4a40');R(c,44,60,10,5,'#c08868');R(c,52,54,4,12,'#2a2a2e');R(c,51,52,6,4,'#5a5a62');
 R(c,4,100,150,12,'#f2f2f2');text(c,'ALEX PARK',8,102,'#0d1a3a');R(c,4,112,150,9,'#c8102e');text(c,'LIVE · ST. AGNES',8,113,'#ffffff');}
