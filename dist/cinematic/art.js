// Pixel art for the cold open: the Channel 6 newsroom, the anchor, one of the Saved, and the living room around the TV.
// Sprites are written as rows of palette letters so each pixel is placed by hand; backgrounds are drawn with shapes from a fixed seed.
export const SW=200,SH=150;
const R=(c,x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(Math.round(x),Math.round(y),w,h);};
export function rng(seed){let a=seed>>>0;return()=>{a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
function sprite(c,rows,pal,x,y,flip=false){const w=Math.max(...rows.map(r=>r.length));rows.forEach((row,j)=>{for(let i=0;i<row.length;i++){const col=pal[row[i]];if(col)R(c,x+(flip?w-1-i:i),y+j,1,1,col);}});}

// The anchor. Key light from the front left, a cool rim light from the studio behind her.
const ANCHOR_PAL={d:'#160c08',h:'#2c1a11',H:'#4a2c1c',s:'#dcae8a',S:'#b9876a',l:'#f0caa6',e:'#24140e',w:'#f2ece4',b:'#3a2216',m:'#a8574e',o:'#3a1210',n:'#c4906f',g:'#d8b24a',r:'#7b9ad8'};
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
function headRows({mouth=0,blink=false,turn=0}){const rows=HEAD.map(r=>r.split(''));const put=(y,x,s)=>{for(let i=0;i<s.length;i++)rows[y][x+i]=s[i];};
 if(turn){ // Looking right, off camera: eyes to the side and wide, brows up, mouth dropped open, more hair on the near side.
  put(6,4,'bb');put(6,10,'bb');put(7,4,'ss');put(7,10,'ss');put(8,4,'we');put(8,11,'we');for(let y=9;y<15;y++)rows[y][3]='h';put(12,7,'mom');put(13,7,'sos');}
 else{if(mouth===1)put(12,7,'mom');if(mouth===2){put(12,7,'ooo');put(13,7,'mmm');}if(blink){put(8,4,'SS');put(8,11,'SS');}}
 return rows.map(r=>r.join(''));}
export function anchor(c,x,y,pose={}){const hx=Math.round(x)-8,hy=Math.round(y);
 // Blazer and blouse from the shoulders down to the desk: rounded shoulders, the arms set apart by a seam, a cool rim on the far side.
 for(let dy=0;dy<56;dy++){const half=Math.min(19,6+13*Math.sqrt(Math.min(1,dy/10))),yy=hy+19+dy,H=Math.floor(half);for(let dx=-H;dx<=H;dx++){const xx=hx+8+dx,f=(dx+half)/(half*2),arm=Math.abs(dx)>=12;
   let col=dx<-12?'#8b2a37':dx>12?'#4a121c':f<.38?'#7a2330':'#6c1d2a';if(Math.abs(dx)===12&&dy>8)col='#3d0f17';if(dy<3&&Math.abs(dx)>=H-1)col=dx<0?'#9c3442':'#5a1722';
   const v=Math.max(0,3.5-dy*.32);if(!arm&&Math.abs(dx+.5)<v)col=dy<2?'#c9a588':'#e8dccb';else if(!arm&&Math.abs(Math.abs(dx+.5)-v)<1&&dy<12)col='#3d0f17';
   if(dx===H&&dy>2)col=ANCHOR_PAL.r;R(c,xx,yy,1,1,col);}}
 R(c,hx+8,hy+36,1,1,'#d8b24a');R(c,hx+8,hy+43,1,1,'#d8b24a');
 // A lapel pin, the network's little 6.
 R(c,hx+2,hy+27,2,2,'#d8b24a');
 sprite(c,headRows(pose),ANCHOR_PAL,hx+(pose.turn?1:0),hy);}

// One of the Saved, still in the hospital gown, reaching for the desk.
const SAVED_PAL={r:'#1c1a14',z:'#8d977c',Z:'#687158',k:'#16140e',y:'#c9c074',x:'#5a1a14',g:'#93aab4',G:'#6f8893',q:'#4c616a',w:'#e6e2d8'};
const SAVED_HEAD=[
 '...rrrrrr.....',
 '..rrzzrrzrr...',
 '.rrzzzzzzzrr..',
 '.rzzzzzzzzzZr.',
 '.rzzzzzzzzzZr.',
 '.zkkzzzzkkzZZ.',
 '.zkyzzzzykzZZ.',
 '.zzkzzzzkzzZZ.',
 '.zzzzzZzzzzZZ.',
 '.zzzzZZZzzzZ..',
 '.zzkkkkkkzzZ..',
 '.zzkxkkxkzZZ..',
 '..zkkkkkkzZ...',
 '..zzzzzzzZZ...',
 '...ZzzzzZZ....',
 '....ZzzZ......',
 '....ZzzZ......'];
export function saved(c,x,y,reach=1){x=Math.round(x);y=Math.round(y);
 // Gown: slumped shoulders, a faded print, the ties at the neck and a dark fold under the arm.
 for(let dy=0;dy<54;dy++){const half=Math.min(16,5+11*Math.sqrt(Math.min(1,dy/9))),yy=y+17+dy,H=Math.floor(half);for(let dx=-H;dx<=H;dx++){const f=(dx+half)/(half*2);let col=f<.25?SAVED_PAL.g:f>.78?SAVED_PAL.q:SAVED_PAL.G;
   if(((dx+40)%5===0)&&(dy%5===2))col=f>.78?'#3e5058':SAVED_PAL.q;if(dx===-10&&dy>6&&dy<16)col=SAVED_PAL.q;if(dy<2&&Math.abs(dx)>=H-1)col=SAVED_PAL.q;R(c,x+7+dx,yy+(dx>6?1:0),1,1,col);}}
 R(c,x+5,y+17,4,1,SAVED_PAL.w);
 // The near arm reaches out toward the anchor; the hand is open.
 const ax=x-2,ay=y+24,len=Math.round(10+16*reach);
 for(let i=0;i<len;i++){const yy=ay+Math.round(i*.18);R(c,ax-i,yy,1,4,i<9?SAVED_PAL.G:SAVED_PAL.z);R(c,ax-i,yy+4,1,1,i<9?SAVED_PAL.q:SAVED_PAL.Z);}
 const hx=ax-len,hy=ay+Math.round(len*.18);R(c,hx-3,hy-1,4,5,SAVED_PAL.z);R(c,hx-5,hy-1,2,1,SAVED_PAL.Z);R(c,hx-5,hy+1,2,1,SAVED_PAL.Z);R(c,hx-5,hy+3,2,1,SAVED_PAL.Z);R(c,hx+1,hy+4,3,1,SAVED_PAL.w);
 sprite(c,SAVED_HEAD,SAVED_PAL,x-1,y+1);}

// The studio behind the desk: the city at night through the glass, half of it dark, fires on the skyline.
export function studio(c){const r=rng(66),roofs=[];
 for(let y=0;y<SH;y++){const k=y/SH;R(c,0,y,SW,1,`rgb(${11+k*10|0},${20+k*14|0},${44+k*24|0})`);}
 // Window: sky with an orange haze low down.
 for(let y=10;y<92;y++){const k=(y-10)/82,haze=Math.max(0,(k-.55)/.45);R(c,0,y,SW,1,`rgb(${14+haze*48|0},${22+haze*16|0},${44-haze*14|0})`);}
 // Smoke from the fires.
 for(const [fx,top] of [[38,30],[108,24]])for(let y=top;y<84;y++){const w=3+(84-y)*.18+Math.sin(y*.3)*1.5;c.globalAlpha=.35;R(c,fx-w/2+Math.sin(y*.15)*3,y,w,1,'#2a2a30');c.globalAlpha=1;}
 // Far buildings, then near ones; most windows are out.
 for(const [base,col,lit] of [[70,'#0b1022',.05],[60,'#070b18',.1]])for(let x=-4;x<SW;){const w=8+r()*16|0,h=12+r()*(base-24)|0,top=92-h;R(c,x,top,w,h,col);if(base===60)roofs.push([x,w,top]);
   for(let wy=top+3;wy<90;wy+=4)for(let wx=x+2;wx<x+w-2;wx+=3)if(r()<lit)R(c,wx,wy,1,2,r()<.7?'#c9a24a':'#e6d8a0');
   if(r()<.25)R(c,x+w/2,top-3,1,3,col);if(r()<.2)R(c,x+w/2,top-4,1,1,'#d03a2a');x+=w+(r()*3|0);}
 // Mullions and the window frame.
 for(let x=0;x<=SW;x+=50)R(c,x-1,10,3,82,'#0a0f1e');R(c,0,9,SW,2,'#1f2c4c');R(c,0,91,SW,2,'#1f2c4c');
 // Studio lights along the ceiling.
 for(let x=20;x<SW;x+=40){R(c,x-3,1,7,2,'#2a3654');R(c,x-1,3,3,1,'#9fb4e0');}
 // Two roofs on fire, the ones under the smoke.
 return [38,108].map(fx=>{const b=roofs.reduce((a,o)=>Math.abs(o[0]+o[1]/2-fx)<Math.abs(a[0]+a[1]/2-fx)?o:a);return {x:b[0],w:b[1],top:b[2]};});}
// A roof fire: a glow on the smoke and flames that change every frame.
export function fire(c,f,t){const fr=Math.floor(t*12),cx=f.x+f.w/2,g=c.createRadialGradient(cx,f.top,0,cx,f.top,16);g.addColorStop(0,'#ff8a3a55');g.addColorStop(1,'#ff8a3a00');c.fillStyle=g;c.fillRect(cx-16,f.top-16,32,32);
 for(let i=0;i<f.w;i++){const h=1+((Math.sin(i*1.7+fr*2.3)+Math.sin(i*.6-fr*1.1))*1.2+2.4|0);for(let j=0;j<h;j++)R(c,f.x+i,f.top-1-j,1,1,j>=h-1?'#7a2e14':j>h/2?'#d0602a':'#f2b25a');}
 for(let i=1;i<f.w-1;i+=3)R(c,f.x+i,f.top+3,1,2,'#e07a2a');}

// The over-the-shoulder graphic: the Saved program's logo, a heart under a halo.
export function graphic(c,x,y,text){R(c,x-1,y-1,74,50,'#e8ecf4');for(let j=0;j<48;j++)R(c,x,y+j,72,1,`rgb(${30+j*.6|0},${62+j*.9|0},${120+j*.8|0})`);
 const cx=x+36,cy=y+18;for(let a=0;a<64;a++){const t=a/64*Math.PI*2;R(c,cx+Math.cos(t)*8,cy-9+Math.sin(t)*2.2,1,1,'#f4e6a0');}
 const HEART=['.ww.ww.','wwwwwww','wwwwwww','.wwwww.','..www..','...w...'];sprite(c,HEART,{w:'#f6f2ea'},cx-3,cy-4);
 text(c,'THE SAVED',x+9,y+34,'#f6f2ea');}
// The desk, with the station's 6 on the front.
export function desk(c){R(c,0,106,SW,2,'#8fb0e8');R(c,0,108,SW,5,'#2a3a64');for(let y=113;y<SH;y++)R(c,0,y,SW,1,y%9===0?'#141c34':'#18223e');R(c,0,113,SW,1,'#0c1226');}

// SMPTE colour bars for the stand-by card.
export function bars(c){const top=['#c0c0c0','#c0c000','#00c0c0','#00c000','#c000c0','#c00000','#0000c0'],w=SW/7;top.forEach((col,i)=>R(c,i*w,0,Math.ceil(w),100,col));
 ['#0000c0','#131313','#c000c0','#131313','#00c0c0','#131313','#c0c0c0'].forEach((col,i)=>R(c,i*w,100,Math.ceil(w),12,col));
 ['#00214c','#ffffff','#32006a','#131313','#090909','#131313','#1d1d1d'].forEach((col,i)=>R(c,i*w,112,Math.ceil(w),38,col));}

// Static: a few frames of grey noise to cycle through.
export function noise(c,seed){const r=rng(seed),img=c.createImageData(SW,SH);for(let i=0;i<SW*SH;i++){const v=r()<.5?r()*90:120+r()*135;const k=i*4;img.data[k]=img.data[k+1]=img.data[k+2]=v;img.data[k+3]=255;}c.putImageData(img,0,0);}

// The living room, 240 × 360, seen from the couch. lit is how much the screen lights it (0 to 1): the same room is painted dark and lit
// and the scene fades between them.
export const ROOM={w:240,h:360,screen:{x:20,y:104,w:SW,h:SH}};
export function room(c,lit=0){const r=rng(5),L=(dark,light)=>lit?light:dark;
 R(c,0,0,240,360,L('#07080c','#10141e'));
 // Wallpaper stripes.
 for(let x=0;x<240;x+=6)R(c,x,0,1,300,L('#0a0b11','#161b28'));
 // A family photo on the wall: two people and a dog.
 R(c,22,22,40,32,L('#120d09','#2a2018'));R(c,25,25,34,26,L('#0c0f14','#2a3446'));for(const [px,ph] of [[33,14],[45,12]]){R(c,px,51-ph,6,ph,L('#07080b','#151a24'));R(c,px+1,51-ph-5,4,5,L('#07080b','#151a24'));}R(c,52,45,6,4,L('#07080b','#151a24'));R(c,53,43,2,2,L('#07080b','#151a24'));
 // Rabbit ears on top of the set.
 c.lineWidth=1;for(const [tx,ty] of [[68,26],[178,20]]){const n=60;for(let i=0;i<n;i++){const k=i/n;R(c,120+(tx-120)*k,86+(ty-86)*k,1,1,L('#3a3c42','#9aa2b4'));}R(c,tx-1,ty-1,3,3,L('#4a4c52','#c4cad6'));}
 R(c,110,82,20,6,L('#141416','#30343e'));R(c,114,80,12,2,L('#1a1a1e','#3c414c'));
 // Wood-grain cabinet.
 R(c,6,88,228,214,L('#1f140c','#3a281a'));for(let y=90;y<300;y+=3)for(let x=8;x<232;x+=1)if(r()<.08)R(c,x,y,r()*6|0,1,L('#170f09','#2c1e13'));
 R(c,6,88,228,1,L('#2c1e13','#5a4430'));R(c,6,88,1,214,L('#2c1e13','#4a3626'));R(c,233,88,1,214,'#0c0805');
 // Plastic bezel round the screen.
 R(c,13,97,214,164,L('#0e0f12','#1e2128'));R(c,14,98,212,1,L('#16171b','#3a3e48'));R(c,14,259,212,1,'#060608');
 // Speaker grille, the channel display and the knobs.
 for(let y=268;y<294;y+=3)R(c,20,y,130,1,L('#0b0705','#1a120c'));
 R(c,164,270,24,12,'#120606');for(const [d,dx] of [[0,0],[6,7]])ledDigit(c,166+dx,272,d);
 for(const kx of [200,220]){R(c,kx-6,268,12,12,L('#141414','#2c2e34'));R(c,kx-4,270,8,8,L('#1c1c1c','#3c3f46'));R(c,kx-1,268,2,4,L('#3a3a3a','#8a8e98'));}
 R(c,190,288,2,2,'#c02010');R(c,190,288,1,1,'#ff5030');
 // The stand, a tape on it, and the floor.
 R(c,0,302,240,58,L('#090807','#14110e'));R(c,0,302,240,3,L('#17120d','#2e2418'));R(c,150,296,44,6,L('#0d0d10','#22252c'));R(c,154,297,36,3,L('#151519','#30343e'));
 // The dog's ears in the foreground, rimmed by the screen.
 for(const [ex,lean] of [[30,-1],[54,1]])for(let y=0;y<34;y++){const w=Math.max(1,Math.round(y*.42)),x0=ex+lean*(34-y)*.18-w/2;R(c,x0,326+y,w,1,'#040405');if(lit&&w>1)R(c,x0,326+y,1,1,'#3a4a6a');}
 R(c,18,348,52,12,'#040405');if(lit)R(c,18,348,52,1,'#2a3650');
 // Fall-off to the page's colour at the edges.
 const g=c.createRadialGradient(120,180,90,120,180,250);g.addColorStop(0,'#07080c00');g.addColorStop(1,'#07080cff');c.fillStyle=g;c.fillRect(0,0,240,360);
 for(const [y0,y1] of [[0,46],[360,300]]){const v=c.createLinearGradient(0,y0,0,y1);v.addColorStop(0,'#07080cff');v.addColorStop(1,'#07080c00');c.fillStyle=v;c.fillRect(0,Math.min(y0,y1),240,Math.abs(y1-y0));}
 for(const [x0,x1] of [[0,20],[240,220]]){const v=c.createLinearGradient(x0,0,x1,0);v.addColorStop(0,'#07080cff');v.addColorStop(1,'#07080c00');c.fillStyle=v;c.fillRect(Math.min(x0,x1),0,20,360);}}
const SEG={0:'abcdef',6:'acdefg'};
function ledDigit(c,x,y,d){const on=SEG[d]||'',col='#ff3a20',off='#2a0a06';const seg={a:[1,0,3,1],b:[4,1,1,3],c:[4,5,1,3],d:[1,8,3,1],e:[0,5,1,3],f:[0,1,1,3],g:[1,4,3,1]};
 for(const [k,[sx,sy,w,h]] of Object.entries(seg))R(c,x+sx,y+sy,w,h,on.includes(k)?col:off);}
// Scanlines, the glass, and a radial light for the room.
export function scanlines(c){for(let y=0;y<SH;y+=2)R(c,0,y,SW,1,'#000');}
export function glass(c){const g=c.createRadialGradient(SW/2,SH/2,40,SW/2,SH/2,130);g.addColorStop(0,'#00000000');g.addColorStop(1,'#000000c0');c.fillStyle=g;c.fillRect(0,0,SW,SH);
 const h=c.createLinearGradient(0,0,SW*.6,SH*.6);h.addColorStop(0,'#ffffff1c');h.addColorStop(.35,'#ffffff08');h.addColorStop(.36,'#ffffff00');c.fillStyle=h;c.fillRect(0,0,SW,SH);
 // Rounded corners of the tube.
 c.fillStyle='#0e0f12';for(const [cx,cy,sx,sy] of [[0,0,1,1],[SW,0,-1,1],[0,SH,1,-1],[SW,SH,-1,-1]])for(let j=0;j<7;j++)for(let i=0;i<7;i++)if(Math.hypot(6.5-i,6.5-j)>6.5)c.fillRect(sx>0?cx+i:cx-1-i,sy>0?cy+j:cy-1-j,1,1);}
export function light(c,s){const g=c.createRadialGradient(s/2,s/2,0,s/2,s/2,s/2);g.addColorStop(0,'#ffffffff');g.addColorStop(.4,'#ffffff66');g.addColorStop(1,'#ffffff00');c.fillStyle=g;c.fillRect(0,0,s,s);}
