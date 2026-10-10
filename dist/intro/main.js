// The intro as a Phaser scene: the apartment, the light the screen throws into it (tinted with whatever is on screen), the picture on
// the flatscreen (redrawn every frame from the timeline) and its glass. Press Watch to play with sound; ?t=12 shows a single frame.
import {room,ROOM,glass,light} from './room.js';
import {T,assets,frame,zoomAt} from './timeline.js';
import {PW,PH} from './news.js';
import {playSound} from './sound.js';
const q=new URLSearchParams(location.search),fixed=q.has('t')?Number(q.get('t')):null,$=id=>document.getElementById(id);
let start=null,ctx=null,shown=false;
const now=()=>fixed!=null?fixed:start==null?0:ctx?ctx.currentTime-start:(performance.now()-start)/1000;
function watch(){$('start').hidden=true;$('replay').hidden=true;shown=false;
 try{ctx=ctx||new (window.AudioContext||window.webkitAudioContext)();ctx.resume();start=playSound(ctx);}catch{ctx=null;start=performance.now();}}
$('watch').onclick=watch;$('again').onclick=watch;
// The screen's average colour, from a tiny copy of the picture.
const probe=Object.assign(document.createElement('canvas'),{width:4,height:2}),pc=probe.getContext('2d',{willReadFrequently:true});
function average(src){pc.drawImage(src,0,0,4,2);const d=pc.getImageData(0,0,4,2).data;let r=0,g=0,b=0;for(let i=0;i<d.length;i+=4){r+=d[i];g+=d[i+1];b+=d[i+2];}return [r/8,g/8,b/8];}
class Intro extends Phaser.Scene{
 constructor(){super('intro');}
 create(){const tex=(key,w,h,paint)=>{const t=this.textures.createCanvas(key,w,h);paint(t.context);t.refresh();return t;},S=ROOM.screen;
  tex('room-dark',ROOM.w,ROOM.h,c=>room(c,false));tex('room-lit',ROOM.w,ROOM.h,c=>room(c,true));tex('glass',PW,PH,c=>glass(c,PW,PH));tex('light',128,128,c=>light(c,128));tex('led',2,1,c=>{c.fillStyle='#ff2a1a';c.fillRect(0,0,2,1);});
  const pc2=Object.assign(document.createElement('canvas'),{width:PW,height:PH});pc2.getContext('2d',{willReadFrequently:true});this.pic=this.textures.addCanvas('picture',pc2);this.A=assets();
  this.add.image(0,0,'room-dark').setOrigin(0);this.lit=this.add.image(0,0,'room-lit').setOrigin(0).setAlpha(0);
  this.glow=this.add.image(S.x+S.w/2,S.y+S.h/2,'light').setScale(3.6,2.6).setBlendMode(Phaser.BlendModes.ADD).setAlpha(0);
  this.add.image(S.x,S.y,'picture').setOrigin(0);this.add.image(S.x,S.y,'glass').setOrigin(0);this.led=this.add.image(ROOM.led.x,ROOM.led.y,'led').setOrigin(0);
  this.cameras.main.centerOn(S.x+S.w/2,S.y+S.h/2+20);window.intro={get t(){return now();},T};}
 update(){const t=now(),S=ROOM.screen,info=frame(this.pic.context,t,this.A);this.pic.refresh();this.led.setVisible(info.led);
  const [r,g,b]=average(this.pic.canvas),lum=(r*.3+g*.55+b*.15)/255,m=Math.max(r,g,b,1),tint=(Math.round(r/m*255)<<16)|(Math.round(g/m*255)<<8)|Math.round(b/m*255);
  this.lit.setTint(tint).setAlpha(Math.min(.7,lum*1.3));this.glow.setTint(tint).setAlpha(Math.min(.35,lum*.8));
  this.cameras.main.setZoom(zoomAt(t)).centerOn(S.x+S.w/2,S.y+S.h/2+20*(1-(zoomAt(t)-1)/.03));
  if(fixed==null&&start!=null&&t>T.end&&!shown){shown=true;$('replay').hidden=false;}}}
new Phaser.Game({type:Phaser.AUTO,parent:'stage',width:ROOM.w,height:ROOM.h,backgroundColor:'#08090d',pixelArt:true,roundPixels:true,antialias:false,
 scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},scene:[Intro],audio:{noAudio:true},banner:false});
if(fixed!=null)$('start').hidden=true;
