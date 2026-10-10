// The survivor's feet in the starter house: the same walking as everywhere else, inside the house's walls and around its furniture.
import {StudyModel} from '../study/model.js';
import {INSIDE,SOLIDS,START,OBJECTS} from './data.js';
const inRect=(x,y,r,b)=>{const dx=x-Math.max(b.x,Math.min(x,b.x+b.w)),dy=y-Math.max(b.y,Math.min(y,b.y+b.h));return dx*dx+dy*dy<r*r;};
export const TARGETS=OBJECTS.map(o=>({...o,kind:'object',range:o.range||40}));
export class HomeModel extends StudyModel{
 constructor(){super();this.reset();}
 reset(){Object.assign(this,{x:START.x,y:START.y,direction:START.direction,phase:0,frame:0,moving:false,running:false});this.face?.(null,null);}
 // Feet are a little narrower than in the yard, so doorways feel roomy.
 blocked(x,y){const r=this.radius;if(x-r<INSIDE.left||x+r>INSIDE.right||y-r*.6<INSIDE.top||y+r*.4>INSIDE.bottom)return true;return SOLIDS.some(b=>inRect(x,y,r*.85,b));}
 // The closest thing within reach, preferring what the survivor is facing. Pets come in as extra targets.
 target(extra=[]){let best=null,score=Infinity;const a=this.direction*Math.PI/4,fx=Math.cos(a),fy=Math.sin(a);
  for(const t of [...TARGETS,...extra]){const dx=t.x-this.x,dy=t.y-this.y,d=Math.hypot(dx,dy);if(d>t.range)continue;if(t.facing&&d&&(dx*fx+dy*fy)/d<.35)continue;const s=d-(d?((dx*fx+dy*fy)/d)*12:0);if(s<score){score=s;best=t;}}
  return best;}
}
