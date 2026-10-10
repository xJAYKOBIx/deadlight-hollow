// The room is the Training Grounds: the building and the yard, the LEET AF post and the stairs up to camp. The layout lives in grounds/data.js.
import {ROOM,SOLIDS,START,ROOM_NPCS,TALK_RANGE,OBJECTS,GATE_DOOR} from '../grounds/data.js';
import {facingOf} from './equipment.js';
export {ROOM,SOLIDS,START,ROOM_NPCS,TALK_RANGE,OBJECTS};
const inRect=(x,y,r,b)=>{const dx=x-Math.max(b.x,Math.min(x,b.x+b.w)),dy=y-Math.max(b.y,Math.min(y,b.y+b.h));return dx*dx+dy*dy<r*r;};
export class StudyModel{
 constructor(){this.radius=10;this.zombie=false;this.reset();}
 blocked(x,y){let r=this.radius;if(x-r<ROOM.left||x+r>ROOM.right||y-r<ROOM.top||y+r>ROOM.bottom)return true;if(ROOM_NPCS.some(n=>Math.hypot(x-n.x,(y-n.y)*1.6)<r+9))return true;// Gadget's robots: you cannot walk through one, but you can always step away from one that rolled into you.
 if(this.bots?.some(b=>{if(b.hp<=0)return false;const d=Math.hypot(x-b.x,(y-b.y)*1.4);return d<r+8&&d<Math.hypot(this.x-b.x,(this.y-b.y)*1.4);}))return true;// While a Holdout runs, the gate is shut behind you.
 if(this.gateClosed&&inRect(x,y,r,GATE_DOOR))return true;return SOLIDS.some(b=>inRect(x,y,r,b));}
 reset(){this.x=START.x;this.y=START.y;this.direction=START.direction;this.phase=0;this.frame=0;this.moving=false;this.running=false;this.face(null,null);}
 // Twin-stick facing. The body turns to the nearest of the eight facings toward the aim (or the way you walk, when you are not
 // aiming) and aim keeps the exact angle for the gun. The legs walk the way you move; heading more than a quarter turn away from
 // where you aim, they face the aim side and step backwards instead, so you backpedal rather than twist round.
 face(aim,move){if(aim!==null){this.aim=aim;this.direction=facingOf(aim);}else{if(move!==null)this.direction=move;this.aim=this.direction*Math.PI/4;}
  const turn=move===null?0:((move-this.direction+12)%8)-4;this.backpedal=Math.abs(turn)>2;this.legDir=move===null?this.direction:this.backpedal?(move+4)%8:move;}
 // With a stamina pool attached (camp and arena share one), running spends it; run it dry and you walk until it is partly back.
 update(dt,input={}){const st=this.stamina;if(!st)return this.walk(dt,input);this.walk(dt,{...input,run:!!input.run&&st.canRun()});st.update(Math.max(0,Math.min(.05,Number(dt)||0)),this.running&&this.moving,this.burden?.drain||1);}
 walk(dt,input={}){dt=Math.max(0,Math.min(.05,Number(dt)||0));let mx=Number(input.x)||0,my=Number(input.y)||0,d=Math.hypot(mx,my);this.running=!!input.run;this.moving=false;
 const ax=Number(input.aimX),ay=Number(input.aimY),aim=Number.isFinite(ax)&&Number.isFinite(ay)&&Math.hypot(ax,ay)>.1?Math.atan2(ay,ax):null;
 if(d<.12){this.frame=0;this.phase=0;this.face(aim,null);return;}mx/=Math.max(1,d);my/=Math.max(1,d);this.face(aim,(Math.round(Math.atan2(my,mx)/(Math.PI/4))+8)%8);// Zombies shamble and lurch: slower, with a shorter step per animation cycle.
 let z=this.zombie,speed=(this.running?(z?150:215):(z?70:126))*(this.burden?.speed||1),dx=mx*speed*dt,dy=my*speed*dt,oldX=this.x,oldY=this.y;
 // Small substeps prevent thin-wall tunnelling while independent axes allow sliding.
 let n=Math.max(1,Math.ceil(Math.max(Math.abs(dx),Math.abs(dy))/4));for(let i=0;i<n;i++){if(!this.blocked(this.x+dx/n,this.y))this.x+=dx/n;if(!this.blocked(this.x,this.y+dy/n))this.y+=dy/n;}let dist=Math.hypot(this.x-oldX,this.y-oldY);this.moving=dist>.001;if(this.moving){this.phase=(this.phase+dist/(this.running?(z?64:72):(z?40:54)))%1;const step=Math.floor(this.phase*8);this.frame=(this.running?9:1)+(this.backpedal?(8-step)%8:step);}else{this.frame=0;this.phase=0;this.legDir=this.direction;}}
}
