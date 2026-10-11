// The briefing (v0.66), played like the house's wake-up scene (home/wake.js): a short script of beats, each running until its time is
// up, its lines are tapped past and anyone it walks has arrived. You sit in the second row; Calloway opens at the podium, hands
// over to Hale, who takes the unit through the slides (the screen shows them, SLIDES in the Master Creator's base.js), and takes it
// back for the sectors. Then everyone stands, the house lights come up, and the hangar is yours to gear up in.
// A beat can set: fade [from, to] (black over the scene), title (the card), line (lines from story/op.js), cam (the camera, as in
// study/camera.js, until a later beat sets it back), slide (the screen), dim (1 house lights down, 0 up), walk ({who: [[x, y]...]})
// and face ({who: direction}) for the two on the stage, and stand (everyone on their feet).
import {OP} from '../story/op.js';import {PODIUM_AT,STAGE_SIDE,STAGE_AWAY,BRIEF_STAFF} from './data.js';
const WALK=46,STRIDE=54,B=OP.brief;
const facing=(dx,dy)=>(Math.round(Math.atan2(dy,dx)/(Math.PI/4))+8)%8;
const WIDE={x:440,y:206,z:1.15},STAGE={x:420,y:120,z:1.45},SCREEN={x:440,y:96,z:1.6},CROWD={x:440,y:236,z:1.35};
const cam=(at,secs=1.4)=>({...at,secs});
export const BRIEF=[
 // Black and the title; the room fades up on the unit in their seats, the screen lit with the crest and the house lights down.
 {t:3.4,fade:[1,1],title:OP.title,slide:0,dim:1,cam:cam(WIDE,0)},{t:2.6,fade:[1,0]},
 {t:.4,cam:cam(STAGE,1.8),line:B.settle},{t:.3,line:B.intro},
 // Calloway steps away from the podium and Hale takes it.
 {t:.4,walk:{calloway:[[392,150],[STAGE_AWAY.x,STAGE_AWAY.y]],hale:[[470,134],[PODIUM_AT.x,PODIUM_AT.y]]},face:{calloway:3,hale:2}},
 {t:.3,slide:1,cam:cam(SCREEN,1.2),line:B.quiet},{t:.3,slide:2,line:B.lz6},{t:.3,slide:3,line:B.crash},{t:.3,slide:4,line:B.beacon},
 {t:.2,cam:cam(CROWD,.9),line:B.yes},
 // Back to the Colonel for the who and where.
 {t:.4,cam:cam(STAGE,1.2),walk:{hale:[[470,134],[STAGE_SIDE.x,STAGE_SIDE.y]],calloway:[[392,150],[PODIUM_AT.x,PODIUM_AT.y]]},face:{calloway:2,hale:3}},
 {t:.3,slide:5,cam:cam(SCREEN,1.2),line:B.sectors},{t:.3,cam:cam(STAGE,1.2),line:B.roe},{t:.3,line:B.dismissed},
 // Everyone up; the lights come up while it is dark.
 {t:1.1,fade:[0,1]},{t:1.4,fade:[1,0],stand:true,dim:0,cam:null}];
export class Brief{
 constructor(){Object.assign(this,{i:-1,t:0,done:false,fade:1,cam:null,title:null,line:null,heard:true,slide:0,dim:1,stand:false,cues:[]});
  this.staff={};for(const id of ['calloway','hale']){const s=BRIEF_STAFF[id];this.staff[id]={x:s.x,y:s.y,direction:s.direction,frame:0,phase:0,path:[]};}this.next();}
 get beat(){return BRIEF[this.i];}
 next(){this.i++;this.t=0;const b=this.beat;if(!b){this.finish();return;}if(b.cam!==undefined)this.cam=b.cam;this.title=b.title||null;this.line=b.line||null;this.heard=!b.line;
  if(b.slide!==undefined)this.slide=b.slide;if(b.dim!==undefined)this.dim=b.dim;if(b.stand)this.stand=true;
  if(b.walk)for(const [id,pts] of Object.entries(b.walk))this.staff[id].path=pts.map(([x,y])=>({x,y}));}
 update(dt){if(this.done)return;dt=Math.max(0,Math.min(.05,dt||0));this.t+=dt;const b=this.beat,k=Math.min(1,this.t/b.t);
  this.fade=b.fade?b.fade[0]+(b.fade[1]-b.fade[0])*k:0;let walking=false;
  for(const [id,a] of Object.entries(this.staff)){if(!a.path.length)continue;walking=true;const p=a.path[0],dx=p.x-a.x,dy=p.y-a.y,d=Math.hypot(dx,dy),s=Math.min(d,WALK*dt);
   if(d>.01){a.x+=dx/d*s;a.y+=dy/d*s;a.direction=facing(dx,dy);a.phase=(a.phase+s/STRIDE)%1;a.frame=1+Math.floor(a.phase*8);}
   if(d<=s+.01){a.path.shift();if(!a.path.length){a.frame=0;a.direction=b.face?.[id]??a.direction;}}}
  if(this.heard&&!walking&&this.t>=b.t)this.next();}
 // The dialog box tapped past this beat's last line.
 ack(){this.heard=true;}
 skip(){if(this.done)return;this.finish();}
 finish(){if(this.done)return;this.done=true;Object.assign(this,{line:null,heard:true,fade:0,cam:null,title:null,slide:5,dim:0,stand:true});
  for(const [id,a] of Object.entries(this.staff))Object.assign(a,{path:[],frame:0});}
}
