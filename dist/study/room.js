import {ROOM,SOLIDS} from './model.js';
export function roomFloor(c){const r=(x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(x,y,w,h);};r(0,0,ROOM.w,ROOM.h,'#222632');r(44,105,952,604,'#303039');r(64,120,912,568,'#65636b');
 c.save();c.beginPath();c.rect(64,166,912,522);c.clip();
 for(let y=166;y<688;y+=44)for(let x=64;x<976;x+=64){let hash=((x*31+y*19)%97)/97;r(x+1,y+1,62,42,hash>.6?'#6b6870':hash>.3?'#67656c':'#636169');r(x+2,y+2,60,1,'#77737a');for(let k=0;k<4;k++){let xx=x+5+(k*19+y*3)%50,yy=y+8+(k*13+x)%28;r(xx,yy,2+k%2*4,1,'#56545e55');}}
 c.restore();
 // Low, simple walls and a broad doorway keep the character readable.
 r(54,112,932,54,'#85828a');r(64,119,912,35,'#77757f');r(64,151,912,8,'#565660');r(54,107,932,7,'#b0a8a6');r(64,166,912,12,'#37394745');
 for(let x=72;x<970;x+=64){r(x,121,1,24,'#555864');r(x+2,119,56,1,'#929099');}
 r(48,166,16,528,'#7e7a83');r(48,112,7,582,'#aaa0a0');r(64,178,12,510,'#252b3525');r(976,166,16,528,'#54525e');r(985,112,7,582,'#88818a');
 r(54,688,932,10,'#bbb0a4');r(48,698,944,9,'#514c56');
 c.fillStyle='#c2b9ad66';c.font='12px monospace';c.fillText('01 / MOVEMENT',355,594);c.fillText('02 / EQUIPMENT RANGE',736,594);
 c.strokeStyle='#c8b99744';c.lineWidth=2;for(let y=330;y<565;y+=45){c.beginPath();c.moveTo(766,y);c.lineTo(901,y);c.stroke();}
 c.strokeStyle='#bfb4a330';c.lineWidth=1;c.beginPath();c.ellipse(460,430,64,28,0,0,Math.PI*2);c.stroke();c.beginPath();c.moveTo(450,430);c.lineTo(470,430);c.moveTo(460,424);c.lineTo(460,436);c.stroke();
 // Baked lantern light is contained to the room, with no dynamic full-screen filter.
 for(let x of [400,888]){let light=c.createRadialGradient(x,162,1,x,162,92);light.addColorStop(0,'#f1c98c35');light.addColorStop(1,'#f1c98c00');c.fillStyle=light;c.fillRect(x-92,114,184,140);r(x-8,132,16,24,'#292c33');r(x-4,137,8,14,'#dfbd85');r(x-3,138,2,12,'#f2dba2');}
}
export function roomProp(c,o){const r=(x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(x,y,w,h);};let {w,h,height:z}=o;r(5,z+h-4,w+8,10,'#26283444');
 if(o.kind==='wall'){r(0,0,w,h+z,'#353743');r(2,4,w-4,h+z-4,'#676671');r(2,0,w-4,5,'#aaa1a2');r(w-5,5,3,h+z-5,'#4b4c58');for(let y=17;y<h+z;y+=25)r(3,y,w-6,1,'#85828c');return;}
 if(o.kind==='bench'){r(8,z-3,8,h+3,'#393039');r(w-17,z-3,8,h+3,'#393039');r(0,0,w,h,'#2a2932');r(2,1,w-4,h-5,'#8b7564');r(2,h-5,w-4,9,'#615048');r(3,2,w-6,2,'#b09a7b');for(let y=9;y<h-5;y+=9)r(3,y,w-6,2,'#6c5b52');r(16,7,14,1,'#b09a7b');}
 if(o.kind==='crate'){r(0,0,w,h+z,'#302930');r(2,2,w-4,h+z-4,'#6d5746');r(3,3,w-6,h-5,'#8a7055');for(let x=8;x<w;x+=15)r(x,4,2,h+z-7,'#463a34');r(3,h,w-6,3,'#b2936c');r(6,h+6,6,z-9,'#9b805d');r(w-12,h+6,6,z-9,'#9b805d');r(4,h+z-9,w-8,5,'#84694d');}
}
export {SOLIDS};
