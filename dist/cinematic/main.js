// The cold open as a Phaser scene: the room, the light the screen throws on it, the tube's picture (redrawn every frame from the
// timeline), its scanlines and glass. Press Watch to play with sound; ?t=3.6 shows a single frame.
import {room,ROOM,SW,SH,scanlines,glass,light} from './art.js';
import {T,assets,screen,roomLight,zoomAt,flinch} from './news.js';
import {playSound} from './sound.js';
const q=new URLSearchParams(location.search),fixed=q.has('t')?Number(q.get('t')):null,$=id=>document.getElementById(id);
let start=null,ctx=null,shown=false;
// The clock: the audio clock when there is sound, so picture and sound stay together.
const now=()=>fixed!=null?fixed:start==null?0:ctx?ctx.currentTime-start:(performance.now()-start)/1000;
function watch(){$('start').hidden=true;$('replay').hidden=true;shown=false;
 try{ctx=ctx||new (window.AudioContext||window.webkitAudioContext)();ctx.resume();start=playSound(ctx);}catch{ctx=null;start=performance.now();}}
$('watch').onclick=watch;$('again').onclick=watch;
class ColdOpen extends Phaser.Scene{
 constructor(){super('cold-open');}
 create(){const tex=(key,w,h,paint)=>{const t=this.textures.createCanvas(key,w,h);paint(t.context);t.refresh();return t;};
  tex('room-dark',ROOM.w,ROOM.h,c=>room(c,0));tex('room-lit',ROOM.w,ROOM.h,c=>room(c,1));tex('scan',SW,SH,scanlines);tex('glass',SW,SH,glass);tex('light',128,128,c=>light(c,128));
  this.tube=this.textures.createCanvas('tube',SW,SH);this.A=assets();
  const s=ROOM.screen;this.add.image(0,0,'room-dark').setOrigin(0);this.lit=this.add.image(0,0,'room-lit').setOrigin(0).setAlpha(0);
  this.glow=this.add.image(s.x+s.w/2,s.y+s.h/2,'light').setScale(3.4,3).setBlendMode(Phaser.BlendModes.ADD).setTint(0x6f8fd8).setAlpha(0);
  this.add.image(s.x,s.y,'tube').setOrigin(0);this.add.image(s.x,s.y,'scan').setOrigin(0).setAlpha(.2);this.add.image(s.x,s.y,'glass').setOrigin(0);
  this.cameras.main.centerOn(s.x+s.w/2,s.y+s.h/2);window.coldOpen={get t(){return now();},T};}
 update(){const t=now(),s=ROOM.screen;screen(this.tube.context,t,this.A);this.tube.refresh();
  const l=roomLight(t);this.lit.setAlpha(Math.min(1,l*1.1));this.glow.setAlpha(l*.55).setTint(t>=T.tear&&t<T.card?0xd8dce8:0x6f8fd8);
  const cam=this.cameras.main,f=flinch(t);cam.setZoom(zoomAt(t));cam.centerOn(s.x+s.w/2+f.x,s.y+s.h/2+f.y);
  if(fixed==null&&start!=null&&t>T.end+.5&&!shown){shown=true;$('replay').hidden=false;}}}
new Phaser.Game({type:Phaser.AUTO,parent:'stage',width:ROOM.w,height:ROOM.h,backgroundColor:'#07080c',pixelArt:true,roundPixels:true,antialias:false,
 scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},scene:[ColdOpen],audio:{noAudio:true},banner:false});
if(fixed!=null)$('start').hidden=true;
