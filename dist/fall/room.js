// The apartment in front of the set, in the set's own pixels (the screen is 240 × 135 of them): the wall it hangs on, its thin bezel and
// standby light, the console under it with a soundbar, a plant, a games console and a lamp. The room is painted once in plain colours and
// then lit three ways, each kept as its own picture: by the screen (grey, tinted every frame with what is on it), by the lamp (warm), and
// from behind the viewer (the candle later on). Shots add those lights up over the dark room.
// The reflection is what the black glass shows once the power dies: the couch, the survivor lighting a candle, the dog at their feet and
// the cat on the armrest, drawn with the game's own survivor and pets.
import {R,rng,hash,clamp,canvas} from '../intro/kit.js';
import {survivor} from '../mc/assets/characters/character.js';
import {pet} from '../mc/assets/animals/pet.js';
export const ROOM={w:420,h:236,screen:{x:90,y:40,w:240,h:135},led:{x:321,y:178},lamp:{x:364,y:150}};
const mk=(w,h)=>{const k=canvas(w,h);return {k,c:k.getContext('2d')};};
// The room in plain colours, as if evenly lit.
function albedo(){const {k,c}=mk(ROOM.w,ROOM.h),r=rng(41),S=ROOM.screen;
 R(c,0,0,ROOM.w,ROOM.h,'#8a8478');for(let i=0;i<2600;i++)R(c,r()*ROOM.w,r()*196,1,1,r()<.5?'#827c70':'#928c80');
 // A picture frame and a light switch either side; the wall-mount's shadow behind the set.
 R(c,40,66,40,30,'#3a2a1c');R(c,42,68,36,26,'#d8d0c0');R(c,44,70,32,22,'#6a7a88');for(const [px,ph] of [[50,14],[60,12]]){R(c,px,92-ph,5,ph,'#2a2a2e');R(c,px+1,92-ph-4,3,4,'#c8a088');}R(c,68,86,7,6,'#8a6a40');
 R(c,368,96,8,12,'#d8d4cc');R(c,371,99,2,5,'#a8a49c');
 R(c,S.x+6,S.y+6,S.w,S.h+4,'#6a645a');
 // The set: a hairline bezel, a slightly deeper chin with the maker's mark, and the standby light.
 R(c,S.x-3,S.y-3,S.w+6,S.h+9,'#141416');R(c,S.x-3,S.y-3,S.w+6,1,'#3a3a40');R(c,S.x-3,S.y-3,1,S.h+9,'#2a2a2e');R(c,S.x,S.y,S.w,S.h,'#08090b');R(c,S.x+S.w/2-7,S.y+S.h+3,14,1,'#5a5a62');
 // The console, the soundbar and what sits on top.
 R(c,40,196,340,40,'#5a3e2a');R(c,40,196,340,3,'#7a5a40');R(c,40,199,340,1,'#3a2618');for(const x of [125,210,295])R(c,x,202,1,34,'#3a2618');for(const x of [118,202,288,372])R(c,x-14,214,6,1,'#c8b8a0');
 R(c,140,189,140,7,'#1c1c20');R(c,140,189,140,1,'#4a4a52');for(let x=144;x<276;x+=2)R(c,x,192,1,2,'#101014');
 R(c,292,186,30,10,'#202024');R(c,292,186,30,1,'#4a4a52');R(c,296,190,6,1,'#1a1a1e');
 R(c,62,182,16,14,'#7a4a30');R(c,62,182,16,2,'#9a6a48');for(const [lx,ly,lw,lh] of [[56,170,10,4],[66,160,8,4],[60,152,12,3],[72,166,12,4],[50,162,8,3],[70,146,8,3],[64,176,14,4],[76,156,8,3],[54,178,8,3]])R(c,lx,ly,lw,lh,'#4a6a3a');
 // The lamp: a ceramic base and a linen shade.
 const L=ROOM.lamp;R(c,L.x-5,L.y+20,10,26,'#c8c0b0');R(c,L.x-3,L.y+18,6,3,'#a8a090');R(c,L.x-7,L.y+44,14,2,'#a8a090');for(let y=0;y<20;y++){const w=12+y*.4;R(c,L.x-w,L.y+y,w*2,1,y<2?'#f2e8d0':'#e8dcc0');}
 R(c,0,196,40,40,'#4a4440');R(c,380,196,40,40,'#4a4440');
 return k;}
// A light: the room multiplied by a mask (a canvas of light), as its own picture.
function lit(base,paint){const {k,c}=mk(ROOM.w,ROOM.h);paint(c);c.globalCompositeOperation='multiply';c.drawImage(base,0,0);c.globalCompositeOperation='destination-in';c.drawImage(base,0,0);return k;}
export function roomAssets(){const base=albedo(),S=ROOM.screen,cx=S.x+S.w/2,cy=S.y+S.h/2,L=ROOM.lamp;
 const dark=lit(base,c=>{R(c,0,0,ROOM.w,ROOM.h,'#1a1c26');});
 // The screen's light: strongest right round the set, falling away over the wall and along the console top.
 const screen=lit(base,c=>{const g=c.createRadialGradient(cx,cy+20,60,cx,cy+20,250);g.addColorStop(0,'#ffffff');g.addColorStop(.35,'#9a9a9a');g.addColorStop(1,'#000000');c.fillStyle=g;c.fillRect(0,0,ROOM.w,ROOM.h);
  c.fillStyle='#000';c.fillRect(S.x+6,S.y+6,S.w,S.h+3);});
 // The lamp: a warm pool on the wall above and below the shade, and the shade glowing.
 const lamp=lit(base,c=>{R(c,0,0,ROOM.w,ROOM.h,'#000');const g=c.createRadialGradient(L.x,L.y+10,4,L.x,L.y+10,110);g.addColorStop(0,'#ffd8a0');g.addColorStop(.4,'#8a5a28');g.addColorStop(1,'#000000');c.fillStyle=g;c.fillRect(0,0,ROOM.w,ROOM.h);
  c.fillStyle='#fff0d0';for(let y=0;y<20;y++){const w=12+y*.4;c.fillRect(L.x-w,L.y+y,w*2,1);}});
 // From behind and below the viewer: the candle.
 const front=lit(base,c=>{const g=c.createRadialGradient(cx-30,ROOM.h+60,40,cx-30,ROOM.h+60,330);g.addColorStop(0,'#ffffff');g.addColorStop(1,'#000000');c.fillStyle=g;c.fillRect(0,0,ROOM.w,ROOM.h);});
 return {dark,screen,lamp,front,tint:mk(ROOM.w,ROOM.h)};}
// The reflection, 240 × 135, as the glass would show it lit by a candle of strength k (0 to 1), at time t (for the flame).
const REF={w:240,h:135},CAT_EYES=[201,51];
export function reflectionAssets(look,pets){const {k,c}=mk(REF.w,REF.h),r=rng(5);
 // The far wall and the window behind the couch, blinds down, a little cold light and a far-off orange glow between the slats.
 R(c,0,0,REF.w,REF.h,'#2a2a30');R(c,150,8,62,50,'#1a1c22');for(let y=0;y<48;y+=3){R(c,151,9+y,60,2,y>36?'#6a4a3a':'#4a5468');R(c,151,11+y,60,1,'#121418');}
 R(c,20,10,26,40,'#3a3438');R(c,28,50,10,40,'#2a2628');
 // The couch, square on: back cushions, arms, the seat's front edge.
 const couch='#5a4e48',dk='#3a322e';R(c,34,56,172,30,couch);for(const x of [36,92,148])R(c,x+1,58,54,26,'#665a52');R(c,26,66,18,40,dk);R(c,196,66,18,40,dk);R(c,26,66,18,3,couch);R(c,196,66,18,3,couch);R(c,40,86,160,18,dk);R(c,40,86,160,2,couch);
 // The survivor on the couch, from the front (the game's sprite, cut off by the seat), knees toward the set.
 const sv=mk(160,192);sv.c.scale(2,2);survivor(sv.c,2,0,false,{...look,zombie:0,gun:'none',grenade:null});
 c.save();c.beginPath();c.rect(0,0,REF.w,92);c.clip();c.imageSmoothingEnabled=true;c.drawImage(sv.k,120-40,92-58,80,96);c.restore();R(c,104,88,14,10,'#2a3240');R(c,122,88,14,10,'#2a3240');
 // The dog lying at their feet, the cat sitting up on the armrest.
 const [dog,cat]=pets,pd=mk(160,160);pd.c.scale(2,2);pet(pd.c,2,18,dog);c.drawImage(pd.k,58-40,124-58,80,80);
 const pc=mk(160,160);pc.c.scale(2,2);pet(pc.c,2,16,cat);c.drawImage(pc.k,204-40,70-58,80,80);
 // The coffee table between them and the set, the candle on it.
 R(c,62,104,116,5,'#4a3a2a');R(c,62,104,116,1,'#6a5440');R(c,66,109,4,22,'#3a2a1e');R(c,170,109,4,22,'#3a2a1e');R(c,117,97,6,7,'#e8e0cc');R(c,119,95,1,2,'#2a2a2a');
 return {albedo:k,light:mk(REF.w,REF.h),out:mk(REF.w,REF.h)};}
// k: how much the candle has caught (0 dark, 1 burning); m: the match (0 to 1 while it flares); t for the flicker.
export function reflection(A,t,k,m){const {c}=A.out,L=A.light.c,fl=1+Math.sin(t*13)*.05+Math.sin(t*29)*.04,cx=120,cy=93,mx=126-m*4,my=96+(1-m)*-4;
 L.globalCompositeOperation='source-over';L.fillStyle='#07080e';L.fillRect(0,0,REF.w,REF.h);L.globalCompositeOperation='lighter';{const g=L.createRadialGradient(182,30,0,182,30,90);g.addColorStop(0,'rgba(70,90,130,.55)');g.addColorStop(1,'rgba(0,0,0,0)');L.fillStyle=g;L.fillRect(0,0,REF.w,REF.h);}
 const glow=(x,y,rad,a)=>{if(a<=0)return;const g=L.createRadialGradient(x,y,0,x,y,rad);g.addColorStop(0,`rgba(255,196,120,${a})`);g.addColorStop(.45,`rgba(200,110,50,${a*.45})`);g.addColorStop(1,'rgba(0,0,0,0)');L.fillStyle=g;L.fillRect(0,0,REF.w,REF.h);};
 glow(cx,cy,150*fl,.95*k);glow(mx,my,90,m*1.1);
 c.globalCompositeOperation='source-over';c.drawImage(A.albedo.k??A.albedo,0,0);c.globalCompositeOperation='multiply';c.drawImage(A.light.k,0,0);c.globalCompositeOperation='lighter';
 // The flames themselves, and the animals' eyes catching the light.
 const flame=(x,y,s,a)=>{if(a<=0)return;c.globalAlpha=a;R(c,x,y-3*s,1,3*s,'#ffd890');R(c,x,y-1,1,1,'#fff8e0');c.globalAlpha=1;};
 flame(cx,cy,1,k);if(m>0){c.globalAlpha=m;R(c,mx-1,my-2,3,3,'#fff0c0');c.globalAlpha=1;}
 const eyes=clamp(k*1.2+m*.6);if(eyes>0){c.globalAlpha=eyes*.7;R(c,55,111,1,1,'#9aff9a');R(c,61,111,1,1,'#9aff9a');R(c,CAT_EYES[0],CAT_EYES[1],1,1,'#c8ff6a');R(c,CAT_EYES[0]+4,CAT_EYES[1],1,1,'#c8ff6a');c.globalAlpha=1;}
 c.globalCompositeOperation='source-over';return A.out.k;}
