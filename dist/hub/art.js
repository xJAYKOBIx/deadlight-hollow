import {WORLD,LAND,WATER,PIER,YARD,PATHS,BUILDINGS,COVERS,NPCS,PALETTES,SKINS,CRATES,HAIR_COLORS,TROUSER_COLORS} from './data.js';
const SY=WORLD.sy;
const poly=(c,pts,fill,stroke)=>{c.beginPath();pts.forEach((p,i)=>i?c.lineTo(...p):c.moveTo(...p));c.closePath();if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.stroke();}};
const ellipse=(c,x,y,rx,ry,col)=>{c.beginPath();c.ellipse(x,y,rx,ry,0,0,7);c.fillStyle=col;c.fill();};
const line=(c,x,y,xx,yy,col,w=1)=>{c.beginPath();c.moveTo(x,y);c.lineTo(xx,yy);c.strokeStyle=col;c.lineWidth=w;c.stroke();};
function rng(seed){return()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};}
export function ground(c,ox,oy,size=512){
 const hash=(x,y)=>{let n=Math.imul(x,374761393)^Math.imul(y,668265263);n=Math.imul(n^(n>>>13),1274126177);return ((n^(n>>>16))>>>0)/4294967296;};
 const stone=['#4c5266','#50566b','#53596f','#494f63','#575d71'];
 c.save();c.translate(-ox,-oy);c.fillStyle='#181e2e';c.fillRect(ox,oy,size,size);
 for(let y=Math.floor(oy/70)*70;y<oy+size+70;y+=70)for(let x=Math.floor(ox/90)*90;x<ox+size+90;x+=90){let n=hash(x,y);poly(c,[[x,y+20],[x+22,y-12],[x+70,y+5],[x+93,y+62],[x+40,y+78]],n>.5?'#222a3d':'#1c2435','#303a4c');}
 c.save();poly(c,WATER.map(([x,y])=>[x,y*SY]),'#182e43');c.clip();
 for(let y=Math.floor(oy/24)*24;y<oy+size;y+=24)for(let x=Math.floor(ox/80)*80;x<ox+size;x+=80){let n=hash(x,y);c.fillStyle=n>.65?'#355269':'#243e56';c.fillRect(x+n*32,y,12+n*28,2);if(n>.7){c.fillStyle='#4b6a7d';c.fillRect(x+8,y+4,10,2);}}c.restore();
 c.save();poly(c,LAND.map(([x,y])=>[x,y*SY]),'#4c5365');c.clip();
 // Global stone grid guarantees continuous texture where streamed chunks meet.
 for(let y=Math.floor(oy/32)*32;y<oy+size+32;y+=32)for(let x=Math.floor(ox/48)*48-48;x<ox+size+48;x+=48){let n=hash(x,y),xx=x+(Math.abs(y/32)%2)*24;poly(c,[[xx+2,y+5],[xx+32,y+2],[xx+46,y+12],[xx+41,y+29],[xx+8,y+30],[xx,y+18]],stone[Math.floor(n*stone.length)]);if(n>.6){c.fillStyle='#70778a44';c.fillRect(xx+8,y+5,16,2);}if(n<.12){c.fillStyle='#323d5155';c.fillRect(xx+18,y+23,8,3);}}
 for(let points of PATHS){c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y*SY):c.moveTo(x,y*SY));c.lineJoin='round';c.lineCap='round';c.lineWidth=98;c.strokeStyle='#373c50';c.stroke();c.lineWidth=87;c.strokeStyle='#737486';c.stroke();c.lineWidth=70;c.strokeStyle='#7d7d8d';c.stroke();}
 const segments=PATHS.flatMap(path=>path.slice(1).map((b,i)=>[path[i][0],path[i][1]*SY,b[0],b[1]*SY]));
 for(let y=Math.floor(oy/18)*18;y<oy+size+18;y+=18)for(let x=Math.floor(ox/30)*30-30;x<ox+size+30;x+=30){let xx=x+(Math.abs(y/18)%2)*15;let onPath=segments.some(([a,b,d,e])=>{let dx=d-a,dy=e-b,t=Math.max(0,Math.min(1,((xx-a)*dx+(y-b)*dy)/(dx*dx+dy*dy)));return Math.hypot(xx-a-t*dx,y-b-t*dy)<31;});if(onPath){let n=hash(x,y);c.fillStyle=['#91909c','#858694','#757989','#a29aa144'][Math.floor(n*4)];c.fillRect(xx+1,y+1,25,13);c.fillStyle='#b6afb42a';c.fillRect(xx+2,y+1,22,2);}}
 // Sand banks stay inside the walkable shore.
 c.beginPath();[[2800,980],[2750,1370],[2400,1560],[2440,1930],[2700,2170],[3000,2180]].forEach(([x,y],i)=>i?c.lineTo(x,y*SY):c.moveTo(x,y*SY));c.lineWidth=102;c.strokeStyle='#96909b';c.stroke();c.lineWidth=12;c.strokeStyle='#c0b5b4';c.stroke();ellipse(c,2290,1850*SY,180,110,'#a29ba1');
 for(let y=Math.floor(oy/14)*14;y<oy+size;y+=14)for(let x=Math.floor(ox/22)*22;x<ox+size;x+=22){let n=hash(x+7,y);if(n>.78){c.fillStyle='#bbb6c02a';c.fillRect(x+Math.floor(n*6)*2,y,4,2);}}
 for(let y of [560,925]){line(c,310,y*SY,2700,y*SY,'#2d3247',13);line(c,310,y*SY-8,2700,y*SY-8,'#8c8aa0',4);for(let x=340;x<2700;x+=30)line(c,x,y*SY-2,x+6,y*SY+8,'#5b617b',2);}
 for(let [x,y]of [[700,560],[1550,560],[2520,560],[630,925],[1500,925],[2100,925]]){c.fillStyle='#796d7a';c.fillRect(x-60,y*SY-42,120,84);for(let k=-35;k<40;k+=10){line(c,x-60,y*SY+k,x+60,y*SY+k,'#3d3749',2);line(c,x-57,y*SY+k+3,x+56,y*SY+k+3,'#aaa0a344',2);}}
 for(let yy=-130;yy<150;yy+=22)for(let xx=-185;xx<185;xx+=34)if((xx/185)**2+(yy/150)**2<1){let x=1530+xx+(Math.floor(yy/22)%2)*13,y=1480*SY+yy;c.fillStyle=['#898799','#73788d','#98909e'][Math.abs(Math.floor(xx+yy))%3];c.fillRect(x,y,29,17);c.fillStyle='#b1adbf55';c.fillRect(x+2,y,25,2);}
 c.restore();
 c.fillStyle='#242539';c.fillRect(PIER.x,PIER.y*SY+10,PIER.w,PIER.h*SY);
 for(let x=PIER.x;x<PIER.x+PIER.w;x+=16){c.fillStyle=['#6f6576','#7d707e','#766b78'][Math.floor(x/16)%3];c.fillRect(x,PIER.y*SY,14,PIER.h*SY);c.fillStyle='#a394a3';c.fillRect(x+2,PIER.y*SY+8,2,2);c.fillRect(x+2,(PIER.y+PIER.h)*SY-10,2,2);c.fillStyle='#393449';c.fillRect(x+8,PIER.y*SY+22,2,30);}
 for(let x=PIER.x;x<=PIER.x+PIER.w;x+=90){c.fillStyle='#393447';c.fillRect(x-4,PIER.y*SY-10,8,20);c.fillRect(x-4,(PIER.y+PIER.h)*SY-8,8,20);c.fillStyle='#998998';c.fillRect(x-4,PIER.y*SY-10,8,4);c.fillRect(x-4,(PIER.y+PIER.h)*SY-8,8,4);}
 c.fillStyle='#85818e';c.fillRect(3260,2130*SY,650,625*SY);
 for(let y=Math.floor(oy/16)*16;y<oy+size;y+=16)for(let x=Math.floor(ox/26)*26;x<ox+size;x+=26)if(x>3260&&x<3910&&y>2130*SY&&y<2755*SY){c.fillStyle='#b8adb833';c.fillRect(x,y,5,2);}
 for(let x of [3420,3570,3800]){line(c,x,2280*SY,x,2710*SY,'#d5c3c34f',2);for(let y=2320;y<2700;y+=110)line(c,x-30,y*SY,x+30,y*SY,'#ddd0c955',2);}
 c.font='bold 16px Arial';c.textAlign='center';c.fillStyle='#38374c';c.fillText('DEADLIGHT TRAINING GROUND',3590,2730*SY);c.restore();}
export function building(c,b){const w=b.w,h=b.h*SY,z=b.z,base=h+z+24,left=24;c.lineJoin='round';ellipse(c,left+w/2+18,base+5,w*.65,25,'#101d2850');
 // Raised foundation and timber facade.
 poly(c,[[left,base-h],[left+w,base-h],[left+w+18,base-h+14],[left+w+18,base+14],[left,base+14]],'#35374a');
 c.fillStyle=b.wall;c.fillRect(left,base-z,w,z);for(let y=base-z+8;y<base;y+=10){line(c,left,y,left+w,y,'#131d252d',2);line(c,left,y-2,left+w,y-2,'#e3d5a015');}
 for(let x=left+12;x<left+w;x+=65){c.fillStyle='#39313b';c.fillRect(x,base-z,6,z);}
 // Corrugated gable roof, using the same fixed projection as the world.
 let roof=[[left-12,base-z],[left+w*.47,base-z-h-25],[left+w+26,base-z-h*.2],[left+w+10,base-z+23]];poly(c,roof,b.roof,'#242737');
 c.save();poly(c,roof);c.clip();for(let x=-100;x<w+250;x+=12)line(c,x,base-z-h-30,x+110,base-z+45,'#d7d0b52a',3);for(let y=base-z-h;y<base-z+30;y+=28)line(c,0,y,w+80,y,'#192c3538');c.restore();
 // Patched sheet metal, rust, seams and timber end-grain are baked once.
 c.save();poly(c,roof);c.clip();let weather=rng(Math.floor(b.x+b.y));
 for(let i=0;i<Math.floor(w/18);i++){let x=left+weather()*w,y=base-z-h+weather()*(h+20);c.fillStyle=i%3?'#a77d722e':'#171b324d';c.fillRect(Math.floor(x/4)*4,Math.floor(y/4)*4,8+Math.floor(weather()*5)*4,4+Math.floor(weather()*3)*4);}
 for(let x=left+30;x<left+w;x+=76){line(c,x,base-z-h,x+65,base-z+30,'#282d4555',2);c.fillStyle='#9b98ac';c.fillRect(x+25,base-z-30,3,3);}c.restore();
 for(let y=base-z+20;y<base-8;y+=18)for(let x=left+20;x<left+w-10;x+=49){c.fillStyle='#c8b0a52a';c.fillRect(x,y,17,2);c.fillStyle='#24253966';c.fillRect(x+4,y+4,6,2);}
 line(c,left-13,base-z,left+w*.47,base-z-h-25,'#8c8da8',3);line(c,left-12,base-z,left+w+10,base-z+23,'#a89ca7',5);
 let door=left+w*.45;c.fillStyle='#202332';c.fillRect(door,base-70,35,70);c.fillStyle='#7b655e';c.fillRect(door+3,base-67,29,63);line(c,door+18,base-60,door+18,base-5,'#40323d',2);ellipse(c,door+27,base-30,2,2,'#f4d495');
 for(let x of [left+30,left+w-62]){let g=c.createRadialGradient(x+15,base-65,2,x+15,base-65,55);g.addColorStop(0,'#ffcb7655');g.addColorStop(1,'#ffb34900');c.fillStyle=g;c.fillRect(x-40,base-120,110,110);c.fillStyle='#302f2c';c.fillRect(x-3,base-89,41,43);c.fillStyle='#e5b875';c.fillRect(x,base-86,35,35);line(c,x+17,base-86,x+17,base-51,'#615241',3);line(c,x,base-69,x+35,base-69,'#615241',3);}
 c.fillStyle='#75694f';c.fillRect(door-12,base,60,9);c.fillStyle='#988669';c.fillRect(door-19,base+9,74,7);
 // Porch awnings, rail posts, drainpipe and small roof patches.
 line(c,left+w+5,base-z+30,left+w+5,base-4,'#34434a',5);
 if(b.type!=='house'){let aw=left+10;poly(c,[[aw,base-76],[aw+w-20,base-76],[aw+w-12,base-49],[aw-8,base-49]],b.type==='workshop'?'#4d626d':'#8c7987','#aaa0b4');for(let x=aw;x<aw+w;x+=22)line(c,x,base-73,x+5,base-50,'#e2d2a326',8);line(c,aw-5,base-49,aw-5,base+10,'#4a4438',4);line(c,aw+w-13,base-49,aw+w-13,base+10,'#4a4438',4);}
 if(b.name){c.fillStyle='#262638';c.fillRect(left+w*.15,base-108,w*.7,24);c.strokeStyle='#b19c70';c.lineWidth=1;c.strokeRect(left+w*.15,base-108,w*.7,24);c.font='bold '+Math.min(12,w/22)+'px Arial';c.textAlign='center';c.fillStyle='#ddd1ab';c.fillText(b.name,left+w*.5,base-92);}
 if(b.type==='clinic'){c.fillStyle='#eee0b9';c.fillRect(left+w-38,base-120,27,27);c.fillStyle='#b86f62';c.fillRect(left+w-27,base-116,5,19);c.fillRect(left+w-34,base-109,19,5);}
 // Porch clutter and plants give each module a lived-in edge.
 for(let i=0;i<3;i++){let x=left+8+i*17;c.fillStyle=['#82744f','#656c50','#9e8c62'][i];c.fillRect(x,base-16,14,16);line(c,x,base-10,x+14,base-10,'#414638',2);}
 if(b.type==='workshop'){c.fillStyle='#383344';c.fillRect(left+26,base-30,65,30);c.fillStyle='#ac8b73';c.fillRect(left+22,base-34,73,6);for(let i=0;i<4;i++){c.fillStyle='#a4afbc';c.fillRect(left+30+i*13,base-47,4,12);c.fillRect(left+27+i*13,base-49,10,4);}}
 if(b.type==='wardrobe'){line(c,left+25,base-55,left+100,base-55,'#a499ac',2);['#7f6a94','#779c9c','#bda58c'].forEach((col,i)=>{c.fillStyle=col;c.fillRect(left+31+i*23,base-53,17,22);c.fillRect(left+28+i*23,base-51,23,8);});}
 if(b.type==='kitchen'){c.fillStyle='#282939';c.fillRect(left+35,base-22,29,20);c.fillStyle='#a0a4b1';c.fillRect(left+33,base-24,33,5);}
 fern(c,left+w-10,base+4,.65);
}
function fern(c,x,y,s=1){c.save();c.translate(x,y);c.scale(s,s);for(let i=0;i<8;i++){let a=i*.7-2.5;let xx=Math.cos(a)*35,yy=-12+Math.sin(a)*23;line(c,0,0,xx,yy,'#405867',2);for(let t=.3;t<1;t+=.17){let bx=xx*t,by=yy*t;poly(c,[[bx,by],[bx-8,by-8],[bx+3,by-5]],i%2?'#6a807d':'#405863');}}c.restore();}
export function prop(c,kind,seed=0){let r=rng(seed+17);if(kind==='rock'){poly(c,[[12,98],[4,65],[21,20],[47,9],[89,25],[112,61],[98,100],[52,113]],'#30364c','#7b829d');poly(c,[[21,20],[47,9],[70,35],[49,67],[4,65]],'#505c79');poly(c,[[70,35],[89,25],[112,61],[98,100],[73,78]],'#242a40');line(c,49,67,52,113,'#65718e',2);poly(c,[[21,20],[47,9],[70,35],[56,32],[36,39]],'#717b9466');poly(c,[[49,67],[70,35],[73,78],[98,100],[52,113]],'#1d253b55');for(let i=0;i<9;i++){let x=24+r()*55,y=34+r()*48;c.fillStyle=i%2?'#8590a344':'#10182e66';c.fillRect(Math.floor(x/2)*2,Math.floor(y/2)*2,4+r()*8,2);}if(seed%2)fern(c,25,85,.8);}
 if(kind==='fern')fern(c,60,106,1.4);
 if(kind==='lamp'){let g=c.createRadialGradient(60,55,1,60,55,58);g.addColorStop(0,'#f6c87555');g.addColorStop(1,'#e7ac4900');c.fillStyle=g;c.fillRect(0,0,120,120);line(c,60,108,60,32,'#353c36',5);line(c,60,34,80,34,'#544d3e',3);c.fillStyle='#222e30';c.fillRect(70,36,18,22);c.fillStyle='#ffd792';c.fillRect(74,40,10,14);}
 if(kind==='crate'){ellipse(c,60,104,32,9,'#15263155');c.fillStyle='#6c5c41';c.fillRect(26,63,67,40);poly(c,[[26,63],[40,48],[105,48],[93,63]],'#a28c60');poly(c,[[93,63],[105,48],[105,88],[93,103]],'#4c4b38');for(let x of [32,55,82]){c.fillStyle='#b5a176';c.fillRect(x,65,5,34);}line(c,27,82,92,82,'#413e30',3);}
 if(kind==='garden'){c.fillStyle='#8f7c5d';c.fillRect(5,55,110,49);c.fillStyle='#434b39';c.fillRect(10,59,100,36);for(let i=0;i<12;i++)fern(c,18+i%6*16,66+Math.floor(i/6)*19,.24);}
 if(kind==='boat'){ellipse(c,60,90,56,15,'#09263555');poly(c,[[5,66],[20,32],[80,39],[115,75],[94,95],[38,87]],'#655e47','#b6a981');poly(c,[[16,65],[27,44],[75,49],[103,75],[90,85],[40,76]],'#263c43');for(let x=30;x<90;x+=20)line(c,x,51,x+7,82,'#98866a',6);line(c,51,25,87,101,'#bdab7d',3);}
 if(kind==='fire'){let g=c.createRadialGradient(60,88,1,60,88,55);g.addColorStop(0,'#ffb75488');g.addColorStop(1,'#efaa4a00');c.fillStyle=g;c.fillRect(0,30,120,90);ellipse(c,60,97,36,15,'#323c3c');for(let i=0;i<10;i++){let a=i/10*7;ellipse(c,60+Math.cos(a)*29,96+Math.sin(a)*12,8,5,'#969386');}line(c,39,101,79,83,'#634631',7);line(c,40,83,78,103,'#715135',7);poly(c,[[42,95],[47,69],[55,80],[64,46],[70,74],[81,87],[72,100]],'#e4a75f');poly(c,[[53,96],[61,75],[71,94]],'#ffe5a2');}
 if(kind==='target'){line(c,60,62,47,107,'#756248',5);line(c,60,62,76,107,'#756248',5);ellipse(c,60,54,25,31,'#a99670');ellipse(c,60,54,19,24,'#d2c8a5');ellipse(c,60,54,13,17,'#a75e59');ellipse(c,60,54,7,9,'#d9d1ad');ellipse(c,60,54,3,4,'#985352');}
 if(kind==='cover'){for(let y=0;y<3;y++)for(let x=0;x<4;x++){let xx=9+x*26+(y%2)*5,yy=62+y*13;c.fillStyle=['#827957','#9b8d65','#aaa079'][y];c.beginPath();c.roundRect(xx,yy,25,15,5);c.fill();c.strokeStyle='#635c43';c.stroke();}}
 if(kind==='barrel'){ellipse(c,60,102,22,9,'#1c2e344d');c.fillStyle='#817052';c.fillRect(39,55,42,44);ellipse(c,60,55,21,8,'#b09b70');ellipse(c,60,99,21,8,'#817052');for(let x=42;x<80;x+=8)line(c,x,60,x,97,'#4e4d3c',1);for(let y of [65,90])line(c,39,y,81,y,'#364448',4);}
 if(kind==='bench'){line(c,18,96,23,72,'#5c5845',5);line(c,94,96,90,72,'#5c5845',5);poly(c,[[10,65],[92,65],[110,81],[25,81]],'#9f8e68');for(let y of [68,74])line(c,15,y,99,y,'#544e3e',2);}
 if(kind==='sail'){line(c,20,107,20,30,'#695a43',4);line(c,100,107,100,30,'#695a43',4);poly(c,[[12,31],[60,9],[111,31],[100,55],[20,51]],'#a59775','#c1b693');}
}
// Quarter-unit detail becomes a half-world-pixel in 160 x 192 frames, displayed at 80 x 96.
const shade=(hex,n)=>'#'+hex.slice(1).match(/../g).map(v=>Math.max(0,Math.min(255,parseInt(v,16)+n)).toString(16).padStart(2,'0')).join('');
// Cosmetic layers share the same half-pixel grid and foot anchor in every direction.
function hairLayer(r,look,back=false,profile=false){
 const style=look.hair||0,h=HAIR_COLORS[look.hairColor||0],hi=shade(h,25),lo=shade(h,-12);
 if(style===7)return;
 if(profile){
  r(-4,-33.5,7,3,h);r(-4.5,-31,2.5,5.5,h);
  if(style===6){r(-4,-33,7,2,shade(h,18));r(-4,-31,1,4,shade(h,18));return;}
  if(style===0){r(-2.5,-34,4,1,h);r(1,-31.5,2,1,h);}
  if(style===1){r(-5,-31,3.5,10,h);r(-4.5,-21,2.5,1,h);}
  if(style===2){r(-3,-34,5.5,2,h);r(0,-32,3,2,h);r(-3,-33,5,.5,hi);}
  if(style===3){for(let [x,y] of [[-4,-33],[-2,-34],[0,-34],[2,-33],[-4.5,-30]]){r(x,y,2.5,2.5,h);r(x+.25,y+.25,1,.5,hi);}}
  if(style===4){r(-6,-31,2,3,h);r(-7,-29,2.5,7,h);r(-6.5,-22,1.5,2,h);r(-6,-30,1.5,1,'#c1a581');}
  if(style===5){r(-5,-30,2,9,h);for(let y=-29;y<-20;y+=2){r(-5.5,y,2,1,hi);r(-4,y+1,1.5,1,lo);}r(-5,-21,1.5,1,'#c1a581');}
  for(let x=-3.5;x<2;x+=1.5)r(x,-32.75,.5,1.5,hi);
  if(style===1||style===4)r(style===1?-4.5:-6.5,-28,.5,6,hi);
 }else{
  if(back){r(-4.5,-33,9,8,h);r(-3,-25,6,1,lo);}
  r(-4.5,-34,8.5,2,h);r(-5,-32,10,1.5,h);r(-4.5,-30.5,1.5,2,h);r(3.5,-31,1,2,h);
  if(style===6){r(-4.5,-33,9,2.5,shade(h,18));if(back)r(-4,-30.5,8,5,shade(h,12));return;}
  if(style===0){r(-3,-34.5,4,1,h);r(-4,-32.5,2,2,h);r(1,-32,2.5,1.5,h);}
  if(style===1){r(-5.5,-31,2,9,h);r(3.5,-31,2,9,h);r(-5,-22,1.5,1.5,h);r(4,-22,1,1,h);if(back)r(-4,-29,8,8,h);}
  if(style===2){r(-3.5,-34.5,7,2,h);r(-1,-32,5,2,h);r(1,-30.5,2,.5,h);r(-2,-33.5,.5,3,hi);}
  if(style===3){for(let [x,y] of [[-4.5,-33],[-2,-34.5],[.5,-34.5],[3,-33],[-5,-30],[3.5,-30]]){r(x,y,2.5,2.5,h);r(x+.25,y+.25,1,.5,hi);}}
  if(style===4){if(back){r(-1.5,-30,3,10,h);r(-1,-20,2,2,h);r(-1.5,-30,3,1,'#c1a581');r(-.5,-28,.5,7,hi);}else{r(4,-28,2,6,h);r(4.5,-22,1,2,h);}}
  if(style===5){for(let x of [-5,3.5]){r(x,-30,2,9,h);for(let y=-29;y<-21;y+=2){r(x-.5,y,2,1,hi);r(x+1,y+1,1.5,1,lo);}r(x,-21,2,1,'#c1a581');}}
  for(let x=-3.5;x<4;x+=1.5)r(x,-33+(x%2)*.25,.5,back?5:1.5,hi);
  if(style===1)for(let x of [-4.5,4])r(x,-29,.5,6,hi);
 }
}
function faceDetail(r,look,skin,profile=false){
 const n=look.nose||0,b=look.beard||0,h=HAIR_COLORS[look.hairColor||0],ss=shade(skin,-28),deep=shade(skin,-50);
 if(profile){
  // The nose changes the outer contour, not just a mark on a forward-facing face.
  const w=[1.5,1,2,2.25][n],height=[1.5,1,2,1][n];r(3,-28.5,w,height,skin);r(3+w-.5,-28,.75,.5,shade(skin,15));if(n===3)r(3,-29,1.5,1,ss);r(3,-26.5,.75,.5,ss);
  if(b===1){for(let x=-1;x<3;x+=1)r(x,-25.5,.5,.5,shade(skin,-40));}
  if(b===2||b===3||b>=4)r(2,-26.5,2,.75,h);
  if(b===3)r(2,-25,1.5,1.5,h);
  if(b>=4){r(-2,-26,1.5,2,h);r(-1.5,-25,5,1.5,h);if(b===5){r(-1,-24,4,2,h);r(0,-22,2.5,1,h);}r(-1,-24.75,3,.25,shade(h,25));}
 }else{
  r(-.25,-28.5,1.5,2.25,skin);
  if(n===0){r(0,-28.5,.5,2,ss);r(.5,-27,.5,.5,shade(skin,17));}
  if(n===1){r(-.25,-27.25,1.5,.75,ss);r(.25,-27.5,.75,.5,shade(skin,17));}
  if(n===2){r(-.5,-28,2,1.5,ss);r(0,-28,1,1,skin);r(-.5,-26.75,.5,.25,deep);r(1,-26.75,.5,.25,deep);}
  if(n===3){r(.25,-29,.5,2.5,ss);r(.75,-27,1,.5,ss);r(0,-28.5,.5,1.25,shade(skin,17));}
  if(b===1){for(let x=-3;x<=3;x++)r(x,-24.75+(Math.abs(x)>1?-.5:0),.5,.5,shade(skin,-40));}
  if(b===2||b===3||b>=4){r(-1.5,-26,4,.75,h);r(-2,-25.5,1,1,h);r(2,-25.5,1,1,h);}
  if(b===3){r(-1,-24.5,3,1.5,h);r(0,-24.25,1,.5,shade(h,25));}
  if(b>=4){r(-4,-27,1,3,h);r(3,-27,1,3,h);r(-3,-25,6,2,h);r(-2,-24.5,4,.5,shade(h,25));if(b===5){r(-3,-24,6,2,h);r(-2,-22,4,1,h);r(-1.5,-23.5,.5,1,shade(h,25));}r(-.5,-25.25,2,.5,deep);}
 }
}
function clothingDetail(r,look,coat,back=false,profile=false){
 const cut=look.outfit||0,hi=shade(coat,28),lo=shade(coat,-35),x=profile?-3.5:-6,w=profile?6.5:12;
 if(cut<3)return;
 r(x,-21,w,12,coat);r(x,-21,.5,11,hi);r(x+w-1,-20,1,11,lo);
 if(cut===3){r(profile?1:0,-20,.5,11,lo);for(let y=-18;y<-10;y+=2)r(profile?1:0,y,.5,.5,'#d4c4b1');if(!back){r(profile?1:-4,-17,profile?1.5:3,3,lo);r(profile?1:-4,-17,profile?1.5:3,.5,hi);}}
 if(cut===4){r(x,-21,profile?1.5:3,12,lo);r(x+w-3,-21,3,12,lo);for(let y=-17;y<-10;y+=4){r(x+.5,y,profile?1.5:3,2.5,hi);if(!profile)r(2.5,y,3,2.5,hi);}r(profile?1:0,-21,1,12,'#b9ada1');}
 if(cut===5){r(x,-21,w,2,lo);for(let y=-17;y<-9;y+=3){r(x+.5,y,w-1,.75,hi);r(x+.5,y+1,w-1,.25,shade(coat,-15));}r(x,-10,w,1,lo);}
}
// True lateral silhouette, shared by left/right via mirroring around the feet.
function profilePerson(c,look,frame,enemy){
 let skin=SKINS[look.skin||0],coat=PALETTES[look.coat||0],hair=HAIR_COLORS[look.hairColor||0],hat=look.headwear?look.headwear+1:(look.hair===1?1:0),outfit=look.outfit||0,pack=look.pack??1;
 if(enemy){skin=enemy==='brute'?'#89938a':'#9aa79b';coat=enemy==='runner'?'#896278':'#66747b';hat=0;pack=0;}
 const ink='#191e2c',dark=shade(coat,-35),light=shade(coat,28),ss=shade(skin,-28),hl=shade(hair,25),step=[0,2,0,-2][frame%4];
 const r=(x,y,w,h,color)=>{c.fillStyle=color;const narrow=!enemy&&look.body===1&&y>=-23&&y<-8?.9:1;c.fillRect(Math.round(x*narrow*4)/4,Math.round(y*4)/4,Math.max(.25,Math.round(w*narrow*4)/4),h);};
 r(-8,0,16,2,'#11182744');r(-5,0,10,1.5,'#11182766');
 // Far leg/arm sit behind the body; the feet point in the travel direction.
 r(-1+step,-9,3,9,ink);r(-.5+step,-8,2,7,shade(TROUSER_COLORS[look.trousers||0],-18));r(-1+step,-1,5,2.5,ink);r(1+step,-1,2,.5,'#7a7585');
 r(1,-21,3,9,dark);r(2,-12,2,2.5,ss);
 if(!enemy&&pack){let pw=pack===2?5:3.5;r(-4-pw,-21,pw+1,13,ink);r(-3.5-pw,-20.5,pw,11.5,pack===2?'#85716f':'#786882');r(-3.5-pw,-20.5,pw,2,'#ab94a0');r(-3-pw,-17.5,.5,6,'#c2aa92');r(-3-pw,-14,pw-1,4,'#5e536b');r(-3.25-pw,-18,pw-.5,.25,'#c0a9b5');r(-3-pw,-13.75,pw-1,.25,'#a792a6');for(let y=-13;y<-10;y++)r(-3-pw,y,.25,.25,'#c2aa92');if(pack===2){r(-9,-23,6,2.5,'#a0a1a9');r(-8,-23,.5,2.5,'#656376');r(-9,-15,2,5,'#707f94');}}
 if(!enemy&&!look.armed&&look.weapon&&look.weapon!=='pistol'){r(-6,-25,1.5,21,ink);r(-6,-25,.5,14,'#9da6b4');r(-6.5,-8,2.5,5,'#8d6d5d');}
 // Narrow chest profile, curved shoulder stair-step and rear hem.
 r(-3.5,-23,5.5,1.5,ink);r(-4.5,-21.5,8.5,13.5,ink);r(-3.5,-21,6.5,13,coat);r(2,-20,1,11,dark);r(-3.5,-20,1,10,light);r(-3,-22,4.5,2,coat);
 r(1,-22,1.5,2,ss);r(2,-19.5,.5,10,shade(coat,8));r(1.5,-11,1.5,.5,light);r(-3.25,-19.75,.25,8,shade(coat,40));r(2.25,-18.5,.25,6,shade(coat,-15));for(let y=-18;y<-10;y+=1.5)r(1.75,y,.25,.25,shade(coat,34));r(-2.5,-10,4,.25,shade(coat,-23));
 if(outfit===1){r(-4.5,-9,8.5,6,ink);r(-3.5,-9,6.5,5,coat);r(-3.5,-4.5,6.5,.5,dark);r(2,-8,.5,4,dark);}
 if(outfit===2){r(-4.5,-23,5,4,dark);r(-4,-22.5,4,.5,light);r(2,-19,.5,8,'#d4c4b1');}
 r(-3.5,-8.5,7,1.5,'#383342');r(2,-8,1,1,'#b7a084');
 if(!enemy)clothingDetail(r,look,coat,false,true);
 if(!enemy&&look.armor==='woven'){r(1,-20,2,10,'#9c8c94');r(1.5,-19,.5,8,'#c2b4b9');for(let y=-17;y<-10;y+=2)r(1,y,1,.5,'#5e5667');}
 if(!enemy&&look.armor==='plated'){r(1,-21,3,12,'#2a3044');r(1,-20,2.5,5,'#8a95a9');r(1,-14,2.5,4,'#65728c');r(1,-20,2.5,.5,'#c0c4ce');r(-2,-22,4,3,'#8992a4');}
 // Near leg swings horizontally past the far leg, keeping a consistent foot anchor.
 r(-3-step,-8,3.5,8.5,ink);r(-2.5-step,-7.5,2.5,7,TROUSER_COLORS[look.trousers||0]);r(-2.5-step,-7,.5,5,shade(TROUSER_COLORS[look.trousers||0],37));r(-3-step,-.5,6,2.5,ink);r(-2-step,-.5,3,.5,'#9c8a92');r(-1-step,1,3,.5,'#5a5365');
 // Profile skull, jaw and protruding nose. Only the near eye/ear are visible.
 r(-3.5,-33,6.5,1.5,ink);r(-4.5,-31.5,9,6.5,ink);r(-3,-25,6.5,2,ink);
 r(-3.5,-31.5,7,6.5,skin);r(-2,-25,5,1.5,ss);r(2.5,-30,1,5,ss);
 r(2,-25.5,1.5,.5,shade(skin,-50));r(.5,-24.5,2,.5,shade(skin,13));
 hairLayer(r,enemy?{hair:0,hairColor:0}:look,false,true);
 r(-1.5,-28.5,1.5,2.5,skin);r(-1,-28,.5,1,ss);
 r(1,-30,2,.5,shade(hair,8));r(1.5,-29,1.5,1,'#ddd7c9');r(2,-29,.5,1,ink);r(2,-29,.25,.25,'#f5e4d1');r(1.25,-30.25,1.25,.25,shade(hair,24));r(.5,-27.25,1.5,.25,shade(skin,9));r(2.5,-26.75,.5,.25,ss);r(3,-25.25,.5,.25,shade(skin,8));
 faceDetail(r,enemy?{}:look,skin,true);
 if(hat===2){r(-4,-35,7.5,4,dark);r(-3,-35.5,5.5,1,coat);r(-3.5,-34.5,6,.5,light);r(-1.5,-31,8,1.5,coat);r(.5,-30.5,5.5,.5,light);r(-2,-34,1.5,1.5,'#cbb8a3');}
 if(hat===3){r(-4,-35,8,4.5,'#a18a9c');r(-3,-36.5,6,1.5,'#877487');r(-4.5,-31.5,8.5,2,'#62546f');for(let x=-3.5;x<4;x+=1.5){r(x,-35,.5,3.5,'#c0a6b2');r(x,-31,.5,1,'#a68a9f');}}
 if(hat===4){r(-4,-35,6.5,2,dark);r(-5.5,-33,4,10,coat);r(-4.5,-34,6.5,2,coat);r(-5,-32,.5,8,light);r(-3.5,-34,5,.5,light);r(-2,-32,1,1,dark);r(-5,-24,4,2,dark);}
 // One near sleeve and hand, with the far sleeve behind the torso.
 const armed=!enemy&&look.weapon&&look.armed;
 if(armed){r(-1,-20,3,7,ink);r(-.5,-19.5,2,6,coat);r(0,-16,7,2.5,coat);r(5.5,-16,2.5,2.5,skin);const len={pistol:5,carbine:8,shotgun:10,marksman:11}[look.weapon]||5;r(6,-17,len+1,2.5,ink);r(6,-17,len,.5,'#a5afbd');r(6,-15,2,2,'#715c59');if(look.weapon==='shotgun')r(9,-15.5,5,1,'#a88972');if(look.weapon==='carbine')r(9,-15,2,2,'#465168');if(look.weapon==='marksman'){r(9,-19,5,1.5,ink);r(10,-19,3,.5,'#b2bfd1');}}
 else{let swing=step*.5;r(-1+swing,-21,3.5,10,ink);r(-.5+swing,-20.5,2.5,8.5,coat);r(-.5+swing,-20,.5,6,light);r(-.5+swing,-13,2.5,.5,dark);r(-.5+swing,-12,2.5,3,skin);r(.5+swing,-10.5,.5,1,ss);if(!enemy&&look.weapon==='pistol'){r(2,-8,2.5,4,'#272b3c');r(2,-8,2.5,.5,'#a8a3b0');}}
 if(!enemy&&!armed&&outfit===4){r(-.5+step*.5,-19,2.5,7,'#b9ada1');r(-.5+step*.5,-19,.5,6,'#e0cebb');}
 if(!enemy&&!armed&&outfit===3){r(-.5+step*.5,-15,2.5,3,skin);r(-.5+step*.5,-15,2.5,.5,light);}
}
export function person(c,look={},angle=1.57,frame=0,enemy=null){
 const back=Math.sin(angle)<-.3,side=Math.cos(angle),profile=Math.abs(side)>.72,step=[0,2,0,-2][frame%4];
 let skin=SKINS[look.skin||0],coat=PALETTES[look.coat||0],hair=HAIR_COLORS[look.hairColor||0],hat=look.headwear?look.headwear+1:(look.hair===1?1:0),outfit=look.outfit||0,pack=look.pack??1;
 if(enemy){skin=enemy==='brute'?'#89938a':'#9aa79b';coat=enemy==='runner'?'#896278':'#66747b';pack=0;hat=0;}
 const ink='#191e2c',dark=shade(coat,-35),light=shade(coat,28),facing=side<0?-1:1,hx=profile?facing:0;
 c.save();c.translate(40,85);c.scale(enemy==='brute'?2.25:2,enemy==='brute'?2.25:2);
 const r=(x,y,w,h,col)=>{c.fillStyle=col;const narrow=!enemy&&look.body===1&&y>=-23&&y<-8?.9:1;c.fillRect(Math.round(x*narrow*4)/4,Math.round(y*4)/4,Math.max(.25,Math.round(w*narrow*4)/4),h);};
 if(profile){c.scale(facing,1);profilePerson(c,look,frame,enemy);c.restore();return;}
 // Ground contact, boots and trousers.
 r(-8,0,16,2,'#11182766');r(-10,-1,20,2,'#11182744');
 for(let [x,dy]of [[-5,step],[1,-step]]){r(x-1,-9,5,10+dy,ink);r(x,-9,3,8+dy,TROUSER_COLORS[look.trousers||0]);r(x,-8,1,5,shade(TROUSER_COLORS[look.trousers||0],37));r(x-1,-1+dy,6,3,'#202330');r(x,-1+dy,4,.5,'#837684');r(x+.5,-7,1,3,shade(TROUSER_COLORS[look.trousers||0],17));r(x,-3+dy,3,.5,'#222a3e');r(x+.5,dy,2,.5,'#b0a1a1');}
 if(back&&hat===1){r(-5,-31,10,17,ink);r(-4,-30,8,14,hair);}
 // Coat shape, collar, cuffs, seams and pockets.
 r(-7,-22,14,outfit===1?19:16,ink);r(-6,-22,12,outfit===1?18:14,coat);r(-6,-22,3,13,light);r(4,-21,2,14,dark);r(-5.5,-20,.5,11,shade(coat,42));r(-5,-11,3,.5,shade(coat,-15));r(3,-19,.5,7,shade(coat,10));r(-6,-8.5,12,.5,shade(coat,-45));r(-5.25,-20.75,.25,10.5,shade(coat,48));r(4.25,-19.25,.25,8,shade(coat,-22));r(-4.5,-10.5,3,.25,shade(coat,-16));r(1.5,-10.75,2.5,.25,shade(coat,-18));
 if(outfit===1){r(-6,-8,5,5,coat);r(1,-8,5,5,dark);r(0,-11,1,9,ink);}
 if(outfit===2){r(-6,-22,12,4,dark);r(-4,-23,8,2,light);r(-1,-19,1,10,'#d4c4b1');r(2,-19,1,9,'#d4c4b1');}
 if(!back){r(-2,-23,5,3,'#d1b3a3');r(-3,-22,3,4,dark);r(2,-22,3,4,light);r(0,-19,1,12,dark);r(-5,-15,4,4,dark);r(2,-15,3,4,dark);r(-5,-15,4,1,light);r(2,-15,3,1,light);r(0,-18,1,1,'#d4c4b1');r(0,-14,.5,.5,'#d4c4b1');r(-4.5,-14.5,3,.5,shade(coat,15));r(2.5,-14.5,2,.5,shade(coat,15));r(-3,-21,.5,3,shade(coat,45));r(3,-21,.5,3,shade(coat,45));r(.5,-19,.5,11,shade(coat,-20));for(let yy=-18.5;yy<-9;yy+=1.5){r(.5,yy,.25,.5,shade(coat,26));}for(let xx=-4.5;xx<-1.5;xx+=.75)r(xx,-14.25,.25,.25,shade(coat,42));for(let xx=2.5;xx<4.5;xx+=.75)r(xx,-14.25,.25,.25,shade(coat,42));r(-2.75,-21.5,.25,2.5,shade(coat,54));}
 r(-6,-8,12,2,'#383342');r(0,-8,2,2,'#c0a07e');r(.5,-7.5,1,1,'#514451');r(.25,-7.75,1.5,.25,'#e4cf9f');r(1,-7.5,.25,1,'#b79d83');
 if(!enemy)clothingDetail(r,look,coat,back,false);
 // Armor is the actual equipped item, layered over the chosen clothing.
 if(!enemy&&look.armor==='woven'){r(-6,-19,3,10,'#9c8c94');r(3,-19,3,10,'#796d80');r(-5,-18,.5,8,'#cec0bb');for(let yy=-17;yy<-10;yy+=2){r(-4.5,yy,1,.5,'#645768');r(4,yy,1,.5,'#b1a0b0');}r(4,-17,1,7,'#b9a9b0');}
 if(!enemy&&look.armor==='plated'){r(-5,-21,10,13,'#242b3d');r(-4,-20,8,5,'#8a95a9');r(-4,-14,8,4,'#65728c');r(-4,-20,7,.5,'#c0c4ce');r(-3.5,-19,7,.5,'#9fa8b9');r(-3,-18,6,2,'#75829b');for(let xx=-3;xx<=3;xx+=6){r(xx,-19,.5,.5,'#d1cbd1');r(xx,-12,.5,.5,'#b6b9c7');}r(-3,-13,6,.5,'#a7aabc');r(-8,-22,3,5,'#8992a4');r(5,-22,3,5,'#65718a');}
 // Visible pack shapes and shoulder straps, without implying inventory bonuses.
 if(!enemy&&pack){if(back){let w=pack===2?12:9; r(-w/2-1,-21,w+2,14,ink);r(-w/2,-21,w,12,pack===2?'#85716f':'#786882');r(-w/2,-21,w,3,'#aa93a0');r(-w/2+1,-16,w-2,6,'#5e536b');r(-2,-19,1,8,'#c2aa92');r(2,-19,1,8,'#c2aa92');r(-3,-15,6,.5,'#b7a2b0');r(-3,-14.5,.5,4,'#8c7c91');r(2.5,-14.5,.5,4,'#443b53');r(-2,-13.5,4,3,'#78677f');r(-1,-12.5,2,.5,'#d0b5a0');r(-.75,-12.25,1.5,.25,'#514457');for(let xx=-2.5;xx<3;xx+=.75)r(xx,-14.75,.25,.25,'#dac3c8');r(-2.75,-13.5,.25,2.5,'#b79aad');r(-2,-18,1,1,'#ded0b1');r(2,-18,1,1,'#ded0b1');if(pack===2){r(-8,-18,2,8,'#6b788d');r(6,-18,2,8,'#a2927d');r(-5,-24,10,3,'#a0a1a9');}}else{r(-5,-22,2,13,'#b09b91');r(4,-22,2,13,'#6a5973');if(profile)r(-facing*8-1,-20,3,12,'#8f7d91');}}
 // Tapered head, cheek planes, brows, nose, mouth and hair clusters.
 const skinShadow=shade(skin,-28),skinDeep=shade(skin,-50),skinLight=shade(skin,17);
 r(hx-4.5,-33,9,2,ink);r(hx-5,-31,10,7,ink);r(hx-3.5,-24,7,1.5,ink);
 r(hx-4,-32,8,7,skin);r(hx-3,-25,6,2,skinShadow);r(hx-3.5,-31,6,4,skinLight);r(hx+3,-31,1,6,skinShadow);
 r(hx-5.5,-29,1.5,3,skin);r(hx+4,-29,1.5,3,skin);r(hx-5,-28,.5,1,skinDeep);r(hx+4.5,-28,.5,1,skinDeep);
 if(back){r(-4,-32,8,7,skin);r(-3,-25,6,1,skinShadow);}
 else{
   if(profile){r(hx+facing*3,-30,1.5,.5,shade(hair,8));r(hx+facing*3,-29,1,1,ink);r(hx+facing*4,-28,1.5,1.5,skinLight);r(hx+facing*3,-26,1,.5,skinDeep);}
   else{r(hx-3.5,-30,2,.5,shade(hair,12));r(hx+1.5,-30,2,.5,shade(hair,12));r(hx-3,-29,1.5,1,'#e4d9cc');r(hx+1.5,-29,1.5,1,'#e4d9cc');r(hx-2.5,-29,.5,1,ink);r(hx+2,-29,.5,1,ink);r(hx-2.5,-29,.25,.25,'#f5e4d1');r(hx+2,-29,.25,.25,'#f5e4d1');r(hx-3.25,-28,1.75,.25,shade(skin,-15));r(hx+1.25,-28,1.75,.25,shade(skin,-15));r(hx,-28.5,.5,2,skinShadow);r(hx+.5,-27,.5,.5,skinLight);}
   r(hx-.5,-25.5,2,.5,skinDeep);r(hx,-24.5,1.5,.5,skinLight);r(hx-2.5,-26.75,1.5,.25,shade(skin,9));r(hx+1.5,-26.5,1,.25,shade(skin,-9));r(hx,-25.25,1.25,.25,shade(skin,-16));
 }
 if(!enemy&&!back)faceDetail(r,look,skin,false);
 hairLayer(r,enemy?{hair:0,hairColor:0}:look,back,false);
 if(hat===2){r(hx-4.5,-35,9,4,dark);r(hx-3.5,-36,7,1,coat);r(hx-4,-34.5,7,.5,light);r(hx,-35,.5,3,shade(coat,15));r(hx-6+(profile?facing*2:0),-31,13,1.5,coat);r(hx-5+(profile?facing*2:0),-30.5,11,.5,light);r(hx-1,-34,2,1.5,'#cbb8a3');r(hx-.5,-33.5,1,.5,'#6f657c');}
 if(hat===3){r(hx-4.5,-35,9,5,'#a18a9c');r(hx-3.5,-36.5,7,1.5,'#877487');r(hx-5,-31,10,2,'#62546f');for(let x=-4;x<5;x+=1.5){r(hx+x,-35,.5,4,'#c0a6b2');r(hx+x,-30.5,.5,1,'#a68a9f');}}
 if(hat===4){r(hx-4.5,-35.5,9,2,dark);r(hx-6,-33.5,12,3,dark);r(hx-6,-30.5,2,7.5,coat);r(hx+4,-30.5,2,7.5,light);r(hx-5.5,-33,.5,7,light);r(hx+4.5,-32,.5,6,dark);r(hx-3.5,-35,6,.5,light);if(back){r(hx-5,-33,10,9,coat);r(hx-4.5,-32,.5,6,light);r(hx+3.5,-30,.5,5,dark);r(hx-2,-24,5,.5,dark);}}
 const armed=!enemy&&look.weapon&&look.armed;
 // Relaxed arms in the hub; directed hands and distinct weapon silhouettes in the yard.
 for(let sign of [-1,1]){r(sign<0?-9:6,-21,3,10,ink);r(sign<0?-8:6,-20,2,8,coat);r(sign<0?-8:6,-12,2,3,skin);r(sign<0?-8:6,-14,2,.5,shade(coat,-40));r(sign<0?-8:6,-19,.5,5,light);r(sign<0?-7.5:6.5,-10.5,.5,1,skinShadow);}
 if(!enemy&&(outfit===3||outfit===4))for(let x of [-8,6]){r(x,outfit===3?-15:-20,2,outfit===3?3:8,outfit===3?skin:'#b9ada1');r(x,-15,2,.5,light);}
 if(armed){let ax=Math.round(Math.cos(angle)*5),ay=Math.round(Math.sin(angle)*5),wx=ax,wy=-16+ay;
 r(Math.min(0,ax),-18+ay,Math.abs(ax)+3,3,coat);r(wx,wy,3,3,skin);
 c.save();c.translate(wx+1,wy);c.rotate(Math.atan2(Math.sin(angle)*.65,Math.cos(angle)));
 const len={pistol:5,carbine:8,shotgun:10,marksman:12}[look.weapon]||7;
 r(-2,-2,len+3,4,ink);r(0,-2,len,2,'#9ca5b3');r(0,0,4,3,'#715c59');
 if(look.weapon==='shotgun')r(4,0,6,2,'#a88972');if(look.weapon==='marksman'){r(3,-4,6,2,'#252b3d');r(4,-4,4,1,'#a6b8cc');}if(look.weapon==='carbine')r(5,1,3,3,'#465168');c.restore();
 }else if(!enemy&&look.weapon&&look.weapon!=='pistol'){// Slung long gun remains recognizable in the village.
 r(back?5:7,-26,2,21,ink);r(back?5:7,-26,1,14,'#a0a4b3');r(back?4:6,-9,3,7,'#8d6d5d');
 }else if(!enemy&&look.weapon){r(6,-9,3,5,'#272b3c');r(6,-10,3,1,'#a8a3b0');}
 c.restore();
}
// Reduce only at texture creation: pixel edges without per-frame filters or extra textures.
export function pixelFinish(c,w,h){const sw=Math.ceil(w/2),sh=Math.ceil(h/2);c.save();c.imageSmoothingEnabled=false;c.globalCompositeOperation='copy';c.drawImage(c.canvas,0,0,w,h,0,0,sw,sh);c.drawImage(c.canvas,0,0,sw,sh,0,0,sw*2,sh*2);c.restore();}

export const PROPS=[];
for(let j=0;j<LAND.length;j++){if(j>=4&&j<=12)continue;let a=LAND[j],b=LAND[(j+1)%LAND.length],n=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/85);for(let i=0;i<n;i++)PROPS.push({kind:'rock',x:a[0]+(b[0]-a[0])*i/n,y:a[1]+(b[1]-a[1])*i/n,scale:1.2+(i%3)*.25,seed:j*30+i});}
for(let path of PATHS)for(let i=0;i<path.length;i++){let [x,y]=path[i];PROPS.push({kind:'lamp',x:x+65,y:y+20,scale:1,seed:i});}
for(let [x,y]of [[470,1980],[1030,1450],[1480,1910],[2040,1110],[2040,1540],[2440,2070],[3000,2400],[1720,600],[1280,450],[2170,750]])PROPS.push({kind:'fern',x,y,scale:1.2});
for(let [x,y]of [[540,1900],[1420,2040],[1180,810],[2200,480]])PROPS.push({kind:'garden',x,y,scale:1.5});
PROPS.push({kind:'fire',x:1590,y:1500,scale:1.6},{kind:'fire',x:2280,y:1860,scale:1.2},{kind:'boat',x:2880,y:1510,scale:2.2},{kind:'boat',x:2660,y:1580,scale:1.7},{kind:'sail',x:2350,y:1860,scale:1.6},{kind:'sail',x:3190,y:2590,scale:1.5});
for(let [x,y]of [[1460,1450],[1700,1480],[1540,1650],[2210,1820],[2290,1920]])PROPS.push({kind:'bench',x,y,scale:1});
for(let b of BUILDINGS){PROPS.push({kind:'barrel',x:b.x+b.w+36,y:b.y+b.h+4,scale:.6},{kind:'crate',x:b.x+b.w+60,y:b.y+b.h+35,scale:.48});}
export function drawOverview(c,w,h,state){c.fillStyle='#171d2d';c.fillRect(0,0,w,h);let scale=Math.min(w/WORLD.w,h/(WORLD.h*SY));c.save();c.translate((w-WORLD.w*scale)/2,(h-WORLD.h*SY*scale)/2);c.scale(scale,scale);poly(c,LAND.map(([x,y])=>[x,y*SY]),'#656c82','#9e99b2');c.fillStyle='#a69673';c.fillRect(PIER.x,PIER.y*SY,PIER.w,PIER.h*SY);for(let p of PATHS){c.beginPath();p.forEach(([x,y],i)=>i?c.lineTo(x,y*SY):c.moveTo(x,y*SY));c.strokeStyle='#b5aa85';c.lineWidth=25;c.stroke();}for(let b of BUILDINGS){c.fillStyle=b.roof;c.fillRect(b.x,b.y*SY,b.w,b.h*SY);c.strokeStyle='#d1bd9755';c.lineWidth=4;c.strokeRect(b.x,b.y*SY,b.w,b.h*SY);}c.fillStyle='#b4a787';c.fillRect(YARD.x,YARD.y*SY,YARD.w,YARD.h*SY);if(state){ellipse(c,state.p.x,state.p.y*SY,35,35,'#e7d4ff');ellipse(c,state.p.x,state.p.y*SY,15,15,'#65567d');}c.restore();}
