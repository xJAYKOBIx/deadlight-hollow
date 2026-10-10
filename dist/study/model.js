// The room is the Training Grounds: the arena, Gadget's office and the stairs up to camp. The layout lives in grounds/data.js.
import {ROOM,SOLIDS,START,ROOM_NPCS,TALK_RANGE,OBJECTS} from '../grounds/data.js';
export {ROOM,SOLIDS,START,ROOM_NPCS,TALK_RANGE,OBJECTS};
export class StudyModel{
 constructor(){this.x=START.x;this.y=START.y;this.radius=10;this.direction=START.direction;this.phase=0;this.frame=0;this.moving=false;this.running=false;this.zombie=false;}
 blocked(x,y){let r=this.radius;if(x-r<ROOM.left||x+r>ROOM.right||y-r<ROOM.top||y+r>ROOM.bottom)return true;if(ROOM_NPCS.some(n=>Math.hypot(x-n.x,(y-n.y)*1.6)<r+9))return true;// Gadget's robots: you cannot walk through one, but you can always step away from one that rolled into you.
 if(this.bots?.some(b=>{if(b.hp<=0)return false;const d=Math.hypot(x-b.x,(y-b.y)*1.4);return d<r+8&&d<Math.hypot(this.x-b.x,(this.y-b.y)*1.4);}))return true;return SOLIDS.some(b=>{let dx=x-Math.max(b.x,Math.min(x,b.x+b.w)),dy=y-Math.max(b.y,Math.min(y,b.y+b.h));return dx*dx+dy*dy<r*r;});}
 reset(){this.x=START.x;this.y=START.y;this.direction=START.direction;this.phase=0;this.frame=0;this.moving=false;this.running=false;}
 update(dt,input={}){dt=Math.max(0,Math.min(.05,Number(dt)||0));let mx=Number(input.x)||0,my=Number(input.y)||0,d=Math.hypot(mx,my);this.running=!!input.run;this.moving=false;if(d<.12){this.frame=0;this.phase=0;return;}mx/=Math.max(1,d);my/=Math.max(1,d);this.direction=(Math.round(Math.atan2(my,mx)/(Math.PI/4))+8)%8;// Zombies shamble and lurch: slower, with a shorter step per animation cycle.
 let z=this.zombie,speed=this.running?(z?150:215):(z?70:126),dx=mx*speed*dt,dy=my*speed*dt,oldX=this.x,oldY=this.y;
 // Small substeps prevent thin-wall tunnelling while independent axes allow sliding.
 let n=Math.max(1,Math.ceil(Math.max(Math.abs(dx),Math.abs(dy))/4));for(let i=0;i<n;i++){if(!this.blocked(this.x+dx/n,this.y))this.x+=dx/n;if(!this.blocked(this.x,this.y+dy/n))this.y+=dy/n;}let dist=Math.hypot(this.x-oldX,this.y-oldY);this.moving=dist>.001;if(this.moving){this.phase=(this.phase+dist/(this.running?(z?64:72):(z?40:54)))%1;this.frame=(this.running?9:1)+Math.floor(this.phase*8);}else{this.frame=0;this.phase=0;}}
}
