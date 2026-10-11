// Your feet in Hangar 3: the same walking as everywhere else, inside the hangar's walls (the door side is open onto the apron),
// round the props, the chairs and the people standing about. Talk and Use as in camp.
import {StudyModel} from '../study/model.js';
import {BASE,HANGAR,DOOR_Y,SOLIDS,GEAR_START,OBJECTS,PEOPLE,GEAR} from './data.js';
const inRect=(x,y,r,b)=>{const dx=x-Math.max(b.x,Math.min(x,b.x+b.w)),dy=y-Math.max(b.y,Math.min(y,b.y+b.h));return dx*dx+dy*dy<r*r;};
export const TARGETS=[...PEOPLE.map(p=>({...p,...GEAR[p.id],kind:'resident',range:44})),...OBJECTS.map(o=>({...o,kind:'object'}))];
export class BaseModel extends StudyModel{
 constructor(){super();this.reset();}
 reset(){Object.assign(this,{x:GEAR_START.x,y:GEAR_START.y,direction:GEAR_START.direction,phase:0,frame:0,moving:false,running:false});this.face?.(null,null);}
 blocked(x,y){const r=this.radius;if(y-r*.6<HANGAR.y+4||y+r*.4>BASE.h-2)return true;if(y<DOOR_Y?x-r<HANGAR.x||x+r>HANGAR.x+HANGAR.w:x-r<0||x+r>BASE.w)return true;
  if(SOLIDS.some(b=>inRect(x,y,r*.85,b)))return true;return PEOPLE.some(p=>{const s=GEAR[p.id];return s&&Math.hypot((x-s.x)*.6,(y-s.y)*1.4)<r+7;});}
 // The closest person or thing in reach, preferring what you face.
 target(usable=()=>true){let best=null,score=Infinity;const a=this.direction*Math.PI/4,fx=Math.cos(a),fy=Math.sin(a);
  for(const t of TARGETS){if(!usable(t))continue;const dx=t.x-this.x,dy=t.y-this.y,d=Math.hypot(dx,dy);if(d>t.range)continue;const s=d-(d?((dx*fx+dy*fy)/d)*12:0);if(s<score){score=s;best=t;}}
  return best;}
}
