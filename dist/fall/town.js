// 11:58 PM, from above: the whole neighbourhood the game is played in, every window and street lamp still lit, two houses burning on the
// far side and a helicopter's searchlight crawling over the roofs. Then the grid goes, a block at a time, rolling in from the north-east
// with a blue-white flash off a transformer as each block dies, until the last lights left are on your street, and then they go too.
// The town is the game's own map and props, painted small once ahead of time; the lights are added over it every frame.
import {clamp,lerp,hash,canvas,rng} from '../intro/kit.js';
import {propArt,PROP_PAD} from '../street/art.js';
import {HOME,HOME_BLOCK,PROPS,BLOCKS,ROADS,CROSSES,CROSS,TOWN,STREET,BLOCK,BAND,BACK,FRONT,LIGHTS} from '../street/data.js';
import {FW,FH,smooth,caption} from './film.js';
export const AERIAL={dur:9.5,first:2.6,home:8.2,cut:8.9};
const AR={x:HOME.x-1500,y:HOME.y-1300,w:4800,h:2700},SC=.3;
// When each block's power dies: by distance from the far corner, with a little chance in it; yours goes last.
const START={x:STREET.w,y:0},far=Math.max(...BLOCKS.map(b=>Math.hypot(b.x-START.x,b.y-START.y)));
const OFF=new Map(BLOCKS.map(b=>[b,b.i===HOME_BLOCK.i&&b.j===HOME_BLOCK.j?AERIAL.home:AERIAL.first+Math.hypot(b.x-START.x,b.y-START.y)/far*4.4+(hash(b.i*7+b.j*13)-.5)*.5]));
const FIRES=[BLOCKS.find(b=>b.i===0&&b.j===2),BLOCKS.find(b=>b.i===1&&b.j===3)].map(b=>{const h=b.houses[b.houses.length-1];return {x:h.x+h.w/2,y:h.y+h.h/2,b};});
// The town in plain colours: fields, lawns, streets and sidewalks, then every prop drawn small, back to front.
export function townAssets(){const A={ready:false,jobs:[],map:canvas(AR.w*SC,AR.h*SC),lights:canvas(AR.w/8,AR.h/8),night:canvas(AR.w/16,AR.h/16)},c=A.map.getContext('2d');
 A.jobs.push(()=>{c.save();c.scale(SC,SC);c.translate(-AR.x,-AR.y);const F=(x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(x,y,w,h);};
  F(AR.x,AR.y,AR.w,AR.h,'#3c4a2e');F(TOWN.x,TOWN.y,TOWN.w,TOWN.h,'#33502c');const r=rng(3);for(let i=0;i<9000;i++)F(AR.x+r()*AR.w,AR.y+r()*AR.h,6,6,r()<.5?'#2c4426':'#3a5832');
  // Each district's own ground in flat colour: car parks, gravel, dirt, the creek, the infield.
  const FLAT={asphalt:'#2e3034',concrete:'#6a6a64',gravel:'#4a4a46',dirt:'#4a3f30',water:'#16242a',lawn:'#33502c',field:'#3c4a2e'};
  for(const b of BLOCKS)for(const q of b.ground){if(FLAT[q.kind])F(q.x,q.y,q.w,q.h,FLAT[q.kind]);else if(q.kind==='poly'){c.fillStyle=q.col;c.beginPath();q.pts.forEach(([x,y],k)=>c[k?'lineTo':'moveTo'](x+q.ox,y+q.oy));c.fill();}}
  for(const b of BLOCKS){for(const px of b.paths)F(px,b.y+FRONT+36,30,82,'#6a6a64');for(const d of b.drives)F(d.x,b.y+FRONT+12,d.w,106,'#6a6a64');}
  for(const rd of ROADS){F(rd.x,rd.sn,rd.w,20,'#6e6e68');F(rd.x,rd.ss,rd.w,20,'#6e6e68');}for(const cr of CROSSES){F(cr.x,TOWN.y,20,TOWN.h,'#6e6e68');F(cr.x+CROSS-20,TOWN.y,20,TOWN.h,'#6e6e68');}
  for(const rd of ROADS)F(rd.x,rd.y,rd.w,rd.h,'#2e3034');for(const cr of CROSSES)F(cr.x+20,AR.y,CROSS-40,AR.h,'#2e3034');
  for(const rd of ROADS)for(let x=Math.max(AR.x,rd.x);x<Math.min(AR.x+AR.w,rd.x+rd.w-24);x+=48)F(x,rd.y+rd.h/2-1,24,2,'#7a7044');c.restore();});
 const list=PROPS.filter(o=>!o.flat&&o.id!=='cruiser'&&o.x<AR.x+AR.w&&o.x+o.w>AR.x&&o.y<AR.y+AR.h+40&&o.y+o.h>AR.y-160).sort((a,b)=>a.y+a.h-(b.y+b.h));
 for(let i=0;i<list.length;i+=24)A.jobs.push(()=>{for(const o of list.slice(i,i+24)){c.save();c.scale(SC,SC);c.translate(o.x-PROP_PAD-AR.x,o.y-o.z-PROP_PAD-AR.y);c.scale(.5,.5);propArt(c,o.id==='pole'?{...o,lean:0}:o);c.restore();}});
 // Night: the moon in patches, very dark between them.
 A.jobs.push(()=>{const n=A.night.getContext('2d'),s=1/16;n.fillStyle='rgb(84,92,132)';n.fillRect(0,0,A.night.width,A.night.height);n.globalCompositeOperation='lighter';
  for(const [x,y,rad] of LIGHTS.filter(l=>l[2]>200)){const X=(x-AR.x)*s,Y=(y-AR.y)*s,r=rad*s*1.3,g=n.createRadialGradient(X,Y,0,X,Y,r);g.addColorStop(0,'rgba(60,70,100,.8)');g.addColorStop(1,'rgba(0,0,0,0)');n.fillStyle=g;n.fillRect(X-r,Y-r,r*2,r*2);}});
 // Every window and street lamp lit, at an eighth of a unit a pixel, grouped by block so a block can be switched off.
 A.jobs.push(()=>{const l=A.lights.getContext('2d'),s=1/8;l.globalCompositeOperation='lighter';const dot=(x,y,rad,col)=>{const X=(x-AR.x)*s,Y=(y-AR.y)*s,r=rad*s,g=l.createRadialGradient(X,Y,0,X,Y,r);g.addColorStop(0,col);g.addColorStop(1,'rgba(0,0,0,0)');l.fillStyle=g;l.fillRect(X-r,Y-r,r*2,r*2);};
  for(const b of BLOCKS)for(const o of b.props){if(o.kind==='house')for(const [a,z] of o.windows)if(hash(o.x+a)<.75)dot(o.x+(a+z)/2,o.y+o.h-34,46,'rgba(255,190,110,1)');if(o.kind==='streetlamp')dot(o.x+5,o.y+4,150,'rgba(255,170,80,.8)');}
  A.ready=true;});return A;}
export function paintTown(A,ms=6){const end=performance.now()+ms;while(A.jobs.length&&(ms===Infinity||performance.now()<end))A.jobs.shift()();return A.ready;}
// The camera: high over the town, sinking toward your street as the dark comes in.
function camera(s){const k=smooth(s/AERIAL.cut);return {cx:lerp(HOME.x+1300,HOME.x+600,k),cy:lerp(HOME.y-120,HOME.y+150,k),w:lerp(4000,1500,k)};}
export function aerialShot(c,s,A){paintTown(A,Infinity);const {cx,cy,w}=camera(s),h=w*FH/FW,sc=FW/w,X=v=>v-AR.x,Y=v=>v-AR.y;
 c.save();c.scale(sc,sc);c.translate(-(cx-w/2),-(cy-h/2));c.imageSmoothingEnabled=true;c.drawImage(A.map,AR.x,AR.y,AR.w,AR.h);
 c.globalCompositeOperation='multiply';c.drawImage(A.night,AR.x,AR.y,AR.w,AR.h);c.globalCompositeOperation='lighter';
 // The lights, minus every block whose power has gone; a block flickers for a moment before it dies.
 c.save();for(const b of BLOCKS){const off=OFF.get(b),dead=s>=off||(s>off-.35&&hash(Math.floor(s*20)+b.i*31+b.j*17)<.5);if(!dead)continue;c.beginPath();c.rect(b.x-90,b.y+BACK-60,BLOCK+180,BAND+60);c.rect(AR.x+AR.w*4,AR.y,-AR.w*9,AR.h);c.clip('evenodd');}
 c.drawImage(A.lights,AR.x,AR.y,AR.w,AR.h);c.restore();
 // The transformer flash as each block goes: a blue-white burst over one of its poles.
 for(const b of BLOCKS){const d=s-OFF.get(b);if(d<0||d>.35)continue;const pole=b.props.find(o=>o.kind==='pole')||b.props[0],a=(1-d/.35)**2,g=c.createRadialGradient(pole.x,pole.y-100,0,pole.x,pole.y-100,260);
  g.addColorStop(0,`rgba(200,225,255,${a})`);g.addColorStop(.2,`rgba(120,160,255,${a*.5})`);g.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=g;c.fillRect(pole.x-260,pole.y-360,520,520);}
 // The fires, and their smoke drifting south-west over the roofs.
 for(const f of FIRES){const fl=.8+.2*Math.sin(s*9+f.x)*Math.sin(s*23),g=c.createRadialGradient(f.x,f.y,0,f.x,f.y,320*fl);g.addColorStop(0,'rgba(255,150,60,.85)');g.addColorStop(.3,'rgba(220,80,20,.35)');g.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=g;c.fillRect(f.x-340,f.y-340,680,680);}
 c.globalCompositeOperation='source-over';
 for(const f of FIRES)for(let i=0;i<22;i++){const age=(s*.12+i/22)%1,x=f.x-age*900+Math.sin(i*1.3+s*.5)*40,y=f.y-60+age*500;c.globalAlpha=(1-age)*.32;c.fillStyle='#16151a';c.beginPath();c.arc(x,y,60+age*260,0,7);c.fill();}
 c.globalAlpha=1;
 // The helicopter: its searchlight on the ground, and the machine itself, higher up and so further across.
 const hx=lerp(HOME.x+2600,HOME.x-900,s/AERIAL.dur),hy=lerp(HOME.y-900,HOME.y+500,s/AERIAL.dur),sx=hx+Math.sin(s*.8)*160,sy=hy+500+Math.cos(s*.6)*90;
 c.globalCompositeOperation='lighter';const g=c.createRadialGradient(sx,sy,0,sx,sy,170);g.addColorStop(0,'rgba(235,242,255,.55)');g.addColorStop(.7,'rgba(200,215,255,.2)');g.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=g;c.save();c.translate(sx,sy);c.scale(1,.7);c.translate(-sx,-sy);c.fillRect(sx-170,sy-170,340,340);c.restore();
 c.globalCompositeOperation='source-over';c.fillStyle='#08090c';c.save();c.translate(hx,hy);c.rotate(-.5);c.fillRect(-60,-14,120,28);c.fillRect(40,-5,110,10);c.globalAlpha=.25;c.beginPath();c.arc(0,0,150,0,7);c.fill();c.globalAlpha=1;
 if(Math.floor(s*2.5)%2){c.fillStyle='#ff3a2a';c.fillRect(-6,-6,12,12);}c.restore();
 c.restore();
 caption(c,'11:58 PM',24,FH-46,{size:11,track:3,color:'#d8d0c0',alpha:Math.min(clamp((s-.5)/.6),clamp((3.6-s)/.6))});
 return {bloom:.7,grade:['#2a4a7a',.3,'soft-light'],vignette:.9,grain:.16,bars:1,fade:Math.max(1-clamp(s/.5),s>AERIAL.cut?1:0)};}
