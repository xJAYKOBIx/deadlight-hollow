// The survivor's feet on the street: the same walking as everywhere else, along the sidewalks, across the lawns and the road,
// round the cars and fences. Zombies that are up block you too, but you can always step away from one that walked into you.
import {StudyModel} from '../study/model.js';
import {WALK,SOLIDS,START,OBJECTS} from './data.js';
const inRect=(x,y,r,b)=>{const dx=x-Math.max(b.x,Math.min(x,b.x+b.w)),dy=y-Math.max(b.y,Math.min(y,b.y+b.h));return dx*dx+dy*dy<r*r;};
export const TARGETS=OBJECTS.map(o=>({...o,kind:'object',range:o.range||40}));
export class StreetModel extends StudyModel{
 constructor(){super();this.reset();}
 reset(){Object.assign(this,{x:START.x,y:START.y,direction:START.direction,phase:0,frame:0,moving:false,running:false,slow:1});this.face?.(null,null);}
 blocked(x,y){const r=this.radius;if(x-r<WALK.left||x+r>WALK.right||y-r*.6<WALK.top||y+r*.4>WALK.bottom)return true;
  if(this.zombies?.some(z=>{if(z.hp<=0||(z.delay>0&&!z.idle))return false;const d=Math.hypot(x-z.x,(y-z.y)*1.4);return d<r+4&&d<Math.hypot(this.x-z.x,(this.y-z.y)*1.4);}))return true;
  return SOLIDS.some(b=>inRect(x,y,r*.85,b));}
 // The closest thing within reach, preferring what you are facing. ok says which targets can be used right now.
 target(ok=()=>true){let best=null,score=Infinity;const a=this.direction*Math.PI/4,fx=Math.cos(a),fy=Math.sin(a);
  for(const t of TARGETS){if(!ok(t))continue;const dx=t.x-this.x,dy=t.y-this.y,d=Math.hypot(dx,dy);if(d>t.range)continue;if(t.facing&&d&&(dx*fx+dy*fy)/d<.35)continue;const s=d-(d?((dx*fx+dy*fy)/d)*12:0);if(s<score){score=s;best=t;}}
  return best;}
}
