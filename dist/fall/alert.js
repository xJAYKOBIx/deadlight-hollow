// Segment 6: the emergency broadcast. The viewer flips channel after channel and every one carries the same thing: the black and red
// EMERGENCY ALERT screen, its message paging through slowly in the middle and crawling along the bottom. The alert runs on its own clock,
// so flipping does not restart it; the flips themselves are laid over it by the program (fall/tv.js).
import {R,clamp,ease} from '../intro/kit.js';
import {text,width} from '../intro/font.js';
import {bigText} from '../intro/ad.js';
export const ALERT={dur:13,flips:[[0,7],[.75,11],[1.45,4],[2.2,2],[3,9],[3.9,13]],
 pages:[[1.2,['BITES ARE INFECTIOUS.','ANYONE BITTEN MAY BECOME','VIOLENT WITHIN HOURS.']],[4.4,['STAY INDOORS.','LOCK YOUR DOORS.']],
  [6.8,['DO NOT OPEN YOUR DOOR','TO ANYONE,','INCLUDING FAMILY.']],[9.6,['IF YOU HAVE TAKEN LZ-6','AND DEVELOP A FEVER,','ISOLATE YOURSELF NOW.']]],
 crawl:'BITES ARE INFECTIOUS. ANYONE BITTEN MAY BECOME VIOLENT WITHIN HOURS. STAY INDOORS. LOCK YOUR DOORS. DO NOT OPEN YOUR DOOR TO ANYONE, INCLUDING FAMILY. IF YOU HAVE TAKEN LZ-6 AND DEVELOP A FEVER, ISOLATE YOURSELF NOW. '};
const centre=(c,s,y,col)=>text(c,s,Math.round((240-width(s))/2),y,col);
// The alert's warning sign: a red triangle with a black bar and dot.
function sign(c,x,y){for(let i=0;i<14;i++)R(c,x+7-Math.floor(i/2),y+i,Math.floor(i/2)*2+1,1,'#ffd400');R(c,x+6,y+4,2,6,'#000');R(c,x+6,y+11,2,2,'#000');}
export function alert(c,lt){R(c,0,0,240,135,'#050505');
 // The header band, pulsing as the tone sounds.
 const pulse=.75+.25*Math.max(0,Math.sin(lt*Math.PI*1.6));R(c,0,8,240,26,'#7a0710');c.globalAlpha=pulse;R(c,0,8,240,26,'#c8102e');c.globalAlpha=1;R(c,0,8,240,1,'#ff5a5a');R(c,0,33,240,1,'#3a0206');
 sign(c,12,14);sign(c,214,14);bigText(c,'EMERGENCY ALERT',120-width('EMERGENCY ALERT'),15,'#ffffff');
 centre(c,'CIVIL EMERGENCY MESSAGE',38,'#ff6a6a');if(Math.floor(lt*1.5)%3!==2)centre(c,'THIS IS NOT A TEST',47,'#ffd400');
 // The message, a page at a time, fading between pages.
 const pg=ALERT.pages.filter(([s])=>lt>=s).pop();if(pg){const [s,lines]=pg,k=clamp((lt-s)/.35);c.globalAlpha=ease(k);lines.forEach((l,i)=>centre(c,l,62+i*10+(3-lines.length)*5,'#ffffff'));c.globalAlpha=1;}
 R(c,20,96,200,1,'#3a0a0e');centre(c,'STATE EMERGENCY MANAGEMENT · 11:54 PM',100,'#8a8a8a');
 // The crawl along the bottom, slow.
 R(c,0,114,240,14,'#3a0206');R(c,0,114,240,1,'#c8102e');c.save();c.beginPath();c.rect(0,114,240,14);c.clip();const off=(lt*26)%(width(ALERT.crawl)+6);text(c,ALERT.crawl+ALERT.crawl,240-off-60,118,'#ffe8a0');c.restore();}
