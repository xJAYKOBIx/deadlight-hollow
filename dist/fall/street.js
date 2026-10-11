// Act two, 3:41 AM, your street, drawn with the game's own ground, houses, cars and dead. One of the neighbours stands in the road. Red
// and blue light comes up the street; a cruiser tears in from the west, swerves round the figure, jumps the curb and folds itself round a
// pole a few houses down. Its light bar keeps turning. The camera drifts back west along the houses to yours, where the dog's head comes
// up in the front window.
// The street is painted once, in slices while the broadcast plays (paint), so nothing stalls when the shot comes up; everything that
// moves is drawn over it every frame, then the night light is multiplied over the lot, with the light bar and headlights added into it.
import {clamp,ease,lerp,hash,canvas} from '../intro/kit.js';
import {groundArt,lightArt,LIGHT_SCALE,propArt,PROP_PAD} from '../street/art.js';
import {HOME,PROPS,LIGHTS} from '../street/data.js';
import {survivor} from '../mc/assets/characters/character.js';
import {DEFAULT_APPEARANCE} from '../mc/assets/characters/appearance.js';
import {FW,FH,smooth,shake,caption} from './film.js';
const H=(x,y)=>({x:HOME.x+x,y:HOME.y+y});
export const AREA={x:HOME.x+120,y:HOME.y-80,w:1560,h:500};
// The moments of the shot, in seconds from its start.
export const STREET={dur:15.5,lights:2.6,turn:3.6,enter:4.5,swerve:4.85,hit:5.65,pan:8.4,house:11.4,dog:11.9,fade:14.4};
const CR={w:140,h:52,z:46},SPEED=720,SWERVE=[760,1320];
// Where the cruiser's back wheels are at time s: straight up the near lane, then the arc its skid marks make, into the pole.
function wheels(s){const S=STREET,x0=HOME.x+SWERVE[0]-(S.swerve-S.enter)*SPEED*0+0;if(s<S.swerve){const x=HOME.x+SWERVE[0]-(S.swerve-s)*SPEED;return {x,y:HOME.y+346,a:0};}
 const k=clamp((s-S.swerve)/(S.hit-S.swerve)),x=HOME.x+lerp(SWERVE[0],SWERVE[1],k),y=HOME.y+346-k*k*96,a=Math.atan2(-2*k*96,560);return {x,y,a};}
// The dead: the one in the road, and one shuffling along the far sidewalk.
const DEAD=[{look:{...DEFAULT_APPEARANCE,zombie:1,pack:1,rot:1,decay:1,wounds:2,top:3,coat:2,bottom:1,pants:1,shoes:1,hair:0,color:1,skin:1},x:HOME.x+1206,y:HOME.y+334},
 {look:{...DEFAULT_APPEARANCE,zombie:1,pack:1,rot:2,decay:2,wounds:3,top:2,shirt:1,bottom:3,pants:2,shoes:2,hair:3,beard:6,color:3,skin:0},x:HOME.x+560,y:HOME.y+396}];
const frameOf=(dist)=>1+Math.floor(((dist/54)%1+1)%1*8);
function deadAt(i,s){const S=STREET;if(i===0){
  // Facing away up the street, turning to the light, staggering back as the car goes by, then off toward the wreck.
  if(s<S.turn)return {x:DEAD[0].x,y:DEAD[0].y,dir:6,frame:0};if(s<S.hit-.25)return {x:DEAD[0].x,y:DEAD[0].y,dir:4,frame:0};
  if(s<S.hit+.9){const k=clamp((s-S.hit+.25)/.5);return {x:DEAD[0].x+k*10,y:DEAD[0].y+k*8,dir:3,frame:0};}
  const d=(s-S.hit-.9)*26;return {x:DEAD[0].x+10+d*.8,y:DEAD[0].y+8-d*.6,dir:7,frame:frameOf(d)};}
 const d=s*22;return {x:DEAD[1].x+d,y:DEAD[1].y,dir:0,frame:frameOf(d)};}
const sheet=new Map();
function deadArt(i,dir,frame){const key=`${i}-${dir}-${frame}`;if(!sheet.has(key)){const k=canvas(160,192),c=k.getContext('2d');c.scale(2,2);survivor(c,dir,frame,false,DEAD[i].look);sheet.set(key,k);}return sheet.get(key);}
const pic=(o,extra={})=>{const k=canvas((o.w+PROP_PAD*2)*2,(o.h+o.z+PROP_PAD*2)*2);propArt(k.getContext('2d'),{...o,...extra});return k;};
// Everything that gets painted ahead of time, as a list of small jobs.
export function streetAssets(){const A={ready:false,jobs:[],ground:canvas(AREA.w*2,AREA.h*2),light:canvas(AREA.w/LIGHT_SCALE,AREA.h/LIGHT_SCALE),L:canvas(AREA.w/LIGHT_SCALE,AREA.h/LIGHT_SCALE),props:[],cruiser:{},poles:[]};
 const R=AREA,g=A.ground.getContext('2d'),inside=o=>o.x<R.x+R.w&&o.x+o.w>R.x&&o.y<R.y+R.h+60&&o.y+o.h>R.y-20;
 for(let y=R.y;y<R.y+R.h;y+=40)A.jobs.push(()=>groundArt(g,R,{x:R.x,y,w:R.w,h:Math.min(40,R.y+R.h-y)},false));
 const list=PROPS.filter(o=>inside(o)&&o.id!=='cruiser'&&o.id!=='pole');
 for(const o of list.filter(o=>o.flat))A.jobs.push(()=>{g.save();g.translate((o.x-PROP_PAD-R.x)*2,(o.y-o.z-PROP_PAD-R.y)*2);propArt(g,o);g.restore();});
 for(const o of list.filter(o=>!o.flat))A.jobs.push(()=>A.props.push({o,k:pic(o),base:o.y+o.h}));
 const cr=PROPS.find(o=>o.id==='cruiser'),pole=PROPS.find(o=>o.id==='pole');A.cr=cr;A.pole=pole;
 for(const crashed of [0,1])for(const lit of [1,2])A.jobs.push(()=>{A.cruiser[`${crashed}${lit}`]=pic({...CR,kind:'policecar'},{crashed:!!crashed,lit});});
 for(let lean=0;lean<=16;lean+=2)A.jobs.push(()=>{A.poles[lean/2]=pic(pole,{lean});});
 // The night light, without the wrecked cruiser's headlight (it is not there yet).
 A.jobs.push(()=>{const keep=LIGHTS.slice(),i=LIGHTS.findIndex(l=>l[0]===HOME.x+1490&&l[1]===HOME.y+236);if(i>=0)LIGHTS.splice(i,2);try{lightArt(A.light.getContext('2d'),R);}finally{LIGHTS.length=0;LIGHTS.push(...keep);}});
 for(const d of [0,1])for(const dir of [0,3,4,6,7])for(let f=0;f<9;f++)A.jobs.push(()=>deadArt(d,dir,f));
 A.jobs.push(()=>{A.props.sort((a,b)=>a.base-b.base);A.ready=true;});return A;}
// Run jobs for up to ms milliseconds; true once everything is painted.
export function paint(A,ms=6){const end=performance.now()+ms;while(A.jobs.length&&(ms===Infinity||performance.now()<end))A.jobs.shift()();return A.ready;}
// A soft round light added into the light picture (world units).
function stamp(L,x,y,rad,col,a){if(a<=0)return;const S=LIGHT_SCALE,X=(x-AREA.x)/S,Y=(y-AREA.y)/S,r=rad/S,g=L.createRadialGradient(X,Y,0,X,Y,r);g.addColorStop(0,col.replace('A',a));g.addColorStop(1,col.replace('A',0));L.fillStyle=g;L.fillRect(X-r,Y-r,r*2,r*2);}
// A headlight's beam: a cone from (x, y) pointing along angle a.
function beam(L,x,y,a,len,a0){const S=LIGHT_SCALE,X=(x-AREA.x)/S,Y=(y-AREA.y)/S,l=len/S;L.save();L.translate(X,Y);L.rotate(a);const g=L.createLinearGradient(0,0,l,0);g.addColorStop(0,`rgba(255,244,214,${a0})`);g.addColorStop(1,'rgba(255,244,214,0)');
 L.fillStyle=g;L.beginPath();L.moveTo(0,-2);L.lineTo(l,-l*.32);L.lineTo(l,l*.32);L.lineTo(0,2);L.fill();L.restore();}
// The camera: centre and width of the view in world units.
function camera(s){const S=STREET,k1=smooth((s-S.enter)/(S.hit-S.enter+.2)),k2=smooth((s-S.hit)/(S.pan-S.hit)),k3=smooth((s-S.pan)/(S.house-S.pan)),k4=smooth((s-S.house)/(S.dur-S.house));
 let cx=lerp(HOME.x+930,HOME.x+1010,smooth(s/S.enter)),cy=HOME.y+292,w=600;cx=lerp(cx,HOME.x+1215,k1);cx=lerp(cx,HOME.x+1265,k2);w=lerp(w,560,k2);cy=lerp(cy,HOME.y+238,k2);
 cx=lerp(cx,HOME.x+500,k3);cy=lerp(cy,HOME.y+120,k3);w=lerp(w,440,k3);cx=lerp(cx,HOME.x+420,k4);cy=lerp(cy,HOME.y+102,k4);w=lerp(w,330,k4);return {cx,cy,w};}
export function streetShot(c,s,A){paint(A,Infinity);const S=STREET,{cx,cy,w}=camera(s),h=w*FH/FW,[sx,sy]=shake(s,S.hit,7,.7),sc=FW/w;
 const lit=Math.floor(s/.19)%2?1:2,crashed=s>=S.hit,wh=wheels(Math.min(s,S.hit)),R=AREA;
 c.save();c.translate(sx,sy);c.scale(sc,sc);c.translate(-(cx-w/2),-(cy-h/2));c.imageSmoothingEnabled=sc*2<1.6;
 c.drawImage(A.ground,R.x,R.y,R.w,R.h);
 // Skid marks, laid down as the back wheels go, and glass on the sidewalk after the hit.
 if(s>S.swerve){const upto=crashed?1:clamp((s-S.swerve)/(S.hit-S.swerve));c.lineCap='round';for(const off of [0,15]){c.beginPath();for(let i=0;i<=60*upto;i++){const k=i/60,x=HOME.x+760+k*560,y=HOME.y+346-off*.4-k*k*(96-off*.6);i?c.lineTo(x,y):c.moveTo(x,y);}c.strokeStyle='rgba(8,8,10,.5)';c.lineWidth=2.5;c.stroke();}}
 if(crashed)for(let i=0;i<40;i++){const k=clamp((s-S.hit)/.5),x=HOME.x+1430+hash(i*5+1)*50*k+(1-k)*20,y=HOME.y+232+hash(i*7+3)*36*k;c.fillStyle=i%3?'#a9c0cc':'#e2eef4';c.fillRect(x,y,hash(i*9)>.5?1:.5,.5);}
 // Everything standing, back to front, with the cruiser, the pole it hits and the dead.
 const items=A.props.map(p=>({base:p.base,draw:()=>c.drawImage(p.k,p.o.x-PROP_PAD,p.o.y-p.o.z-PROP_PAD,p.o.w+PROP_PAD*2,p.o.h+p.o.z+PROP_PAD*2)}));
 const P=A.pole,lean=crashed?Math.min(8,Math.round(Math.min(1,(s-S.hit)/.12)*8+Math.sin((s-S.hit)*20)*Math.max(0,1-(s-S.hit)*2.5)*1.5)):0;
 items.push({base:P.y+P.h,draw:()=>c.drawImage(A.poles[clamp(lean,0,8)],P.x-PROP_PAD,P.y-P.z-PROP_PAD,P.w+PROP_PAD*2,P.h+P.z+PROP_PAD*2)});
 const car=A.cruiser[`${crashed?1:0}${lit}`],cw=CR.w+PROP_PAD*2,ch=CR.h+CR.z+PROP_PAD*2;
 if(s>=S.enter-.2){if(crashed){const o=A.cr;items.push({base:o.y+o.h,draw:()=>c.drawImage(car,o.x-PROP_PAD,o.y-o.z-PROP_PAD,cw,ch)});}
  else{const x=wh.x-20,y=wh.y-46,ox=x+CR.w/2,oy=y+CR.h/2;items.push({base:wh.y,draw:()=>{c.save();c.translate(ox,oy);c.rotate(wh.a*.7);c.drawImage(car,-CR.w/2-PROP_PAD,-CR.h/2-CR.z-PROP_PAD,cw,ch);c.restore();}});}}
 for(let i=0;i<DEAD.length;i++){const d=deadAt(i,s);items.push({base:d.y,draw:()=>c.drawImage(deadArt(i,d.dir,d.frame),d.x-40,d.y-85,80,96)});}
 items.sort((a,b)=>a.base-b.base);for(const it of items)it.draw();
 // The dog in your front window, up on the back of the couch, once the noise has woken it.
 const dog=clamp((s-S.dog)/.5);if(dog>0){const wx=HOME.x+381,wy=HOME.y+120,hh=Math.round(dog*10);c.fillStyle='#07060a';c.fillRect(wx+6,wy-hh,12,hh);c.fillRect(wx+4,wy-hh+1,3,6);c.fillRect(wx+17,wy-hh+1,3,6);if(dog>.8){c.fillStyle='#9aff9a';c.fillRect(wx+9,wy-hh+4,1,.5);c.fillRect(wx+14,wy-hh+4,1,.5);}}
 // Steam from the crumpled hood.
 if(crashed)for(let i=0;i<14;i++){const age=((s-S.hit)*.8+i/14)%1,x=HOME.x+1428+age*20+Math.sin(i+age*4)*4,y=HOME.y+214-age*40;c.globalAlpha=(1-age)*.25*clamp((s-S.hit)*2);c.fillStyle='#b8bcc4';c.beginPath();c.arc(x,y,3+age*9,0,7);c.fill();}c.globalAlpha=1;
 // The night over all of it: the moon, plus the light bar, the headlights and the window candle added in.
 const L=A.L.getContext('2d');L.globalCompositeOperation='source-over';L.drawImage(A.light,0,0);L.globalCompositeOperation='lighter';L.fillStyle='rgb(26,30,44)';L.fillRect(0,0,A.L.width,A.L.height);
 const near=clamp((s-S.lights)/(S.enter-S.lights)),bar=crashed?{x:A.cr.x+70,y:A.cr.y-22}:{x:wh.x+50,y:wh.y-68},wash=crashed?{x:A.cr.x+70,y:A.cr.y+26}:{x:wh.x+50,y:wh.y-20};
 if(s<S.enter)stamp(L,HOME.x+500+near*300,HOME.y+300,260+near*200,lit===1?'rgba(255,40,30,A)':'rgba(40,90,255,A)',near*.55);
 else{const wa=crashed?.5:.6,wi=crashed?.22:.6;stamp(L,wash.x,wash.y+(crashed?30:0),360,lit===1?'rgba(255,40,30,A)':'rgba(50,100,255,A)',wa);stamp(L,wash.x,wash.y,90,lit===1?'rgba(255,90,70,A)':'rgba(110,150,255,A)',wi);}
 if(s>=S.enter-.2&&!crashed){const hx=wh.x+122;beam(L,hx,wh.y-36,wh.a*.7,320,.75);beam(L,hx,wh.y-12,wh.a*.7,320,.75);}
 if(crashed){stamp(L,HOME.x+1490,HOME.y+236,120,'rgba(255,240,190,A)',.85);beam(L,HOME.x+1450,HOME.y+232,-.15,240,.5);stamp(L,HOME.x+1446,HOME.y+80,130,'rgba(255,200,120,A)',Math.max(0,1-(s-S.hit)*2.5));}
 stamp(L,HOME.x+392,HOME.y+112,40,'rgba(255,170,90,A)',.9);
 // Once it has stopped, the light bar's turning beams sweep back along the house fronts.
 if(crashed){const sw=(s-S.hit)*1.3%1,x=A.cr.x+70-sw*1300;stamp(L,x,HOME.y+110,170,lit===1?'rgba(255,40,30,A)':'rgba(50,100,255,A)',.45*(1-sw*.5));}
 c.globalCompositeOperation='multiply';c.imageSmoothingEnabled=true;c.drawImage(A.L,R.x,R.y,R.w,R.h);c.globalCompositeOperation='lighter';
 // What glows on its own: the light bar, the headlights, the sparks off the pole.
 const glow=(x,y,r,col)=>{const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,col);g.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2);};
 if(s>=S.enter-.2){glow(bar.x,bar.y,11,lit===1?'rgba(255,60,40,.7)':'rgba(70,120,255,.7)');if(!crashed){glow(wh.x+122,wh.y-36,12,'rgba(255,250,230,.8)');glow(wh.x+122,wh.y-12,12,'rgba(255,250,230,.8)');}else glow(HOME.x+1446,HOME.y+228,10,'rgba(255,250,230,.8)');}
 if(crashed&&s<S.hit+1.2)for(let i=0;i<26;i++){const age=(s-S.hit)-hash(i*3)*.3;if(age<0||age>.9)continue;const a=hash(i*11)*Math.PI*2,sp=40+hash(i*13)*120,x=HOME.x+1448+Math.cos(a)*sp*age,y=HOME.y+90+Math.sin(a)*sp*age*.6+140*age*age;c.fillStyle=`rgba(255,${190+hash(i)*60|0},110,${1-age/.9})`;c.fillRect(x,y,1.5,1.5);}
 c.globalCompositeOperation='source-over';c.restore();
 // The impact's flash.
 if(s>=S.hit&&s<S.hit+.12){c.fillStyle=`rgba(255,250,240,${1-(s-S.hit)/.12})`;c.fillRect(0,0,FW,FH);}
 caption(c,'3:41 AM',24,FH-46,{size:11,track:3,color:'#d8d0c0',alpha:Math.min(clamp((s-.6)/.6),clamp((3.8-s)/.6))});
 return {bloom:.55,grade:['#2a5a7a',.28,'soft-light'],vignette:.85,grain:.16,bars:1,fade:Math.max(1-clamp(s/.8),clamp((s-S.fade)/(S.dur-S.fade)))};}
