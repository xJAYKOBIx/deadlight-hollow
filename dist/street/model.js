// The survivor's feet in the neighbourhood: the same walking as everywhere else, along the sidewalks, across the lawns and the
// roads, round the houses, cars and fences. Zombies that are up block you too, but you can always step away from one that walked into you.
import {StudyModel} from '../study/model.js';
import {WALK,START,OBJECTS,solidAt} from './data.js';
export const TARGETS=OBJECTS.map(o=>({...o,kind:'object',range:o.range||40}));
export class StreetModel extends StudyModel{
 constructor(){super();this.reset();}
 // spawn: where you come out instead of your own step (your own survivor, out of the house across the street).
 reset(){const S=this.spawn||START;Object.assign(this,{x:S.x,y:S.y,direction:S.direction,phase:0,frame:0,moving:false,running:false,slow:1});this.face?.(null,null);}
 blocked(x,y){const r=this.radius;if(x-r<WALK.left||x+r>WALK.right||y-r*.6<WALK.top||y+r*.4>WALK.bottom)return true;
  if(this.zombies?.some(z=>{if(z.hp<=0||Math.abs(x-z.x)>40||Math.abs(y-z.y)>40||(z.delay>0&&!z.idle)||z.hatch>0)return false;const d=Math.hypot(x-z.x,(y-z.y)*1.4);return d<r+4&&d<Math.hypot(this.x-z.x,(this.y-z.y)*1.4);}))return true;
  return !!solidAt(x,y,r*.85);}
 // The closest thing within reach, preferring what you are facing. ok says which targets can be used right now.
 target(ok=()=>true){let best=null,score=Infinity;const a=this.direction*Math.PI/4,fx=Math.cos(a),fy=Math.sin(a);
  for(const t of TARGETS){if(!ok(t))continue;const dx=t.x-this.x,dy=t.y-this.y,d=Math.hypot(dx,dy);if(d>t.range)continue;if(t.facing&&d&&(dx*fx+dy*fy)/d<.35)continue;const s=d-(d?((dx*fx+dy*fy)/d)*12:0);if(s<score){score=s;best=t;}}
  return best;}
}
