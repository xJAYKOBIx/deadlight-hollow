import {StudyModel} from '../study/model.js';
import {WALK,PROPS,RESIDENTS,OBJECTS,CAMP_START,USE_RANGE} from './data.js';import {Stamina} from './fishing.js';
export function insidePolygon(pts,x,y){let inside=false;for(let i=0,j=pts.length-1;i<pts.length;j=i++){const [xi,yi]=pts[i],[xj,yj]=pts[j];if((yi>y)!==(yj>y)&&x<(xj-xi)*(y-yi)/(yj-yi)+xi)inside=!inside;}return inside;}
const SOLID=PROPS.filter(o=>!o.flat);
export const TARGETS=[...RESIDENTS.map(p=>({...p,kind:'resident',range:USE_RANGE+8})),...OBJECTS.map(o=>({...o,kind:'object',range:USE_RANGE}))];
// Same walking and animation as the room; only the ground and obstacles change.
export class CampModel extends StudyModel{
 // campers: how many sleeping spots are in use (1 to MAX_CAMPERS). Empty spots have no chest to bump into.
 constructor(){super();this.stamina=new Stamina();this.campers=1;this.reset();}
 reset(){Object.assign(this,{x:CAMP_START.x,y:CAMP_START.y,direction:CAMP_START.direction,phase:0,frame:0,moving:false,running:false});}
 blocked(x,y){const r=this.radius;for(const [px,py] of [[x,y],[x-r,y],[x+r,y],[x,y-r*.6],[x,y+r*.6]])if(!insidePolygon(WALK,px,py))return true;
  if(SOLID.some(b=>{if(b.slot>=this.campers)return false;const dx=x-Math.max(b.x,Math.min(x,b.x+b.w)),dy=y-Math.max(b.y,Math.min(y,b.y+b.h));return dx*dx+dy*dy<r*r;}))return true;
  return RESIDENTS.some(p=>Math.hypot((x-p.x)*.55,(y-p.y)*1.3)<r+9);}
 // Running spends stamina. Once it runs dry the survivor walks until it is partly back.
 update(dt,input={}){super.update(dt,{...input,run:!!input.run&&this.stamina.canRun()});this.stamina.update(Math.max(0,Math.min(.05,Number(dt)||0)),this.running&&this.moving);}
 // The closest person or thing within reach, preferring what the survivor is facing.
 target(extra=[]){let best=null,score=Infinity;const a=this.direction*Math.PI/4,fx=Math.cos(a),fy=Math.sin(a);
  for(const t of extra.length?[...TARGETS,...extra]:TARGETS){const dx=t.x-this.x,dy=t.y-this.y,d=Math.hypot(dx,dy);if(d>t.range)continue;
   // Some targets, like your companion at your heels, only count when you turn to them.
   if(t.facing&&d&&(dx*fx+dy*fy)/d<.35)continue;const s=d-(d?((dx*fx+dy*fy)/d)*12:0);if(s<score){score=s;best=t;}}
  return best;}
}
