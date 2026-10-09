import {StudyModel} from '../study/model.js';
import {WALK,PROPS,RESIDENTS,OBJECTS,CAMP_START,USE_RANGE} from './data.js';
export function insidePolygon(pts,x,y){let inside=false;for(let i=0,j=pts.length-1;i<pts.length;j=i++){const [xi,yi]=pts[i],[xj,yj]=pts[j];if((yi>y)!==(yj>y)&&x<(xj-xi)*(y-yi)/(yj-yi)+xi)inside=!inside;}return inside;}
const SOLID=PROPS.filter(o=>!o.flat);
export const TARGETS=[...RESIDENTS.map(p=>({...p,kind:'resident',range:USE_RANGE+8})),...OBJECTS.map(o=>({...o,kind:'object',range:USE_RANGE}))];
// Same walking and animation as the room; only the ground and obstacles change.
export class CampModel extends StudyModel{
 constructor(){super();this.reset();}
 reset(){Object.assign(this,{x:CAMP_START.x,y:CAMP_START.y,direction:CAMP_START.direction,phase:0,frame:0,moving:false,running:false});}
 blocked(x,y){const r=this.radius;for(const [px,py] of [[x,y],[x-r,y],[x+r,y],[x,y-r*.6],[x,y+r*.6]])if(!insidePolygon(WALK,px,py))return true;
  if(SOLID.some(b=>{const dx=x-Math.max(b.x,Math.min(x,b.x+b.w)),dy=y-Math.max(b.y,Math.min(y,b.y+b.h));return dx*dx+dy*dy<r*r;}))return true;
  return RESIDENTS.some(p=>Math.hypot((x-p.x)*.55,(y-p.y)*1.3)<r+9);}
 // The closest person or thing within reach, preferring what the survivor is facing.
 target(){let best=null,score=Infinity;const a=this.direction*Math.PI/4,fx=Math.cos(a),fy=Math.sin(a);
  for(const t of TARGETS){const dx=t.x-this.x,dy=t.y-this.y,d=Math.hypot(dx,dy);if(d>t.range)continue;const s=d-(d?((dx*fx+dy*fy)/d)*12:0);if(s<score){score=s;best=t;}}
  return best;}
}
