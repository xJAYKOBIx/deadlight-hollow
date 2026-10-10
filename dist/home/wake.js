// The opening of the tutorial: you wake up on the couch in the dark, the dog and the cat come to you, you give them a pat, and
// then it is your turn to move. A short script of beats; each one runs until its time is up or what it waits for has happened.
// It drives the survivor itself (the couch is solid, so it does not walk through the model) and calls the pets over with goTo.
// The couch is seen from behind, so lying, sitting and standing on it are the same standing sprite lower or higher, drawn just
// behind the couch (depth) and cut off at its bottom edge (cut): the couch covers what is below its top edge, at about y 173.
export const COUCH={x:246,stand:184,sit:226,lie:254,depth:200,cut:221,west:224};
// Where you end up, beside the west end of the couch, and where each animal comes to.
export const WAKE_END={x:204,y:236,direction:2},DOG_AT={x:176,y:246},CAT_AT={x:240,y:246};
const WALK=80,STRIDE=54;
const facing=(dx,dy)=>(Math.round(Math.atan2(dy,dx)/(Math.PI/4))+8)%8;
export const BEATS=[
 {t:1.6,fade:[1,0],zzz:true},
 {t:5,zzz:true,start:c=>c.dog.goTo(204,214,{pose:'sniff',face:0,rush:1.8}),until:c=>c.dog.arrived},
 {t:2.4,zzz:true,say:'A cold nose pushes into your hand.'},
 {t:2.4,rise:['lie','sit'],say:'You fell asleep on the couch again.'},
 {t:2.2,dir:4,say:'"Hey, you. What time is it?"'},
 {t:2.6,rise:['sit','stand'],say:'The candle has burned down to a stub. The power is still out.',start:c=>c.dog.goTo(DOG_AT.x,DOG_AT.y,{pose:'sit',face:1,rush:1.4})},
 {t:6,walk:[[212,COUCH.stand],[WAKE_END.x,WAKE_END.y]]},
 {t:2.8,dir:4,start:c=>{c.dog.pet(c.you);c.cat.goTo(CAT_AT.x,CAT_AT.y,{pose:'sit',face:4,rush:1.6});},say:'You scratch behind its ears. Its tail thumps the floor.'},
 {t:6,until:c=>c.cat.arrived},
 {t:2.8,dir:0,start:c=>c.cat.pet(c.you),say:'The cat acts like it does not care, then leans into your hand anyway.'},
 {t:2.6,dir:2,say:'Outside, sirens. More of them than there should be.'},
 {t:2.6,say:'Find something to protect yourself with.'}];
export class Wake{
 // pets: {dog, cat} as HousePets. you: the survivor's model, moved to where the scene ends.
 constructor({dog,cat,you}){Object.assign(this,{dog,cat,you,i:-1,t:0,done:false,x:COUCH.x,y:COUCH.lie,direction:6,frame:0,phase:0,fade:1,zzz:true,say:'',pose:'lie',path:[]});this.next();}
 get beat(){return BEATS[this.i];}
 next(){this.i++;this.t=0;const b=this.beat;if(!b){this.finish();return;}if(b.say!==undefined)this.say=b.say;if(b.dir!==undefined)this.direction=b.dir;if(b.walk)this.path=b.walk.map(([x,y])=>({x,y}));b.start?.(this);}
 update(dt){if(this.done)return;dt=Math.max(0,Math.min(.05,dt||0));this.t+=dt;const b=this.beat,k=Math.min(1,this.t/(b.rise?.6:b.t));
  this.fade=b.fade?b.fade[0]+(b.fade[1]-b.fade[0])*k:0;this.zzz=!!b.zzz;
  if(b.rise){const [a,z]=b.rise;this.y=COUCH[a]+(COUCH[z]-COUCH[a])*k;this.pose=k<1?a:z;}
  if(this.path.length){const p=this.path[0],dx=p.x-this.x,dy=p.y-this.y,d=Math.hypot(dx,dy),s=Math.min(d,WALK*dt);if(d>.01){this.x+=dx/d*s;this.y+=dy/d*s;this.direction=facing(dx,dy);this.phase=(this.phase+s/STRIDE)%1;this.frame=1+Math.floor(this.phase*8);}
   if(d<=s+.01){this.path.shift();if(!this.path.length)this.frame=0;}this.pose='stand';}
  const waiting=this.path.length||(b.until&&!b.until(this));if(this.t>=b.t||(b.until&&!waiting&&this.t>.2)||(b.walk&&!this.path.length))this.next();}
 // On the couch the sprite is drawn behind it and cut at its foot; past its west end it is the survivor as usual.
 get onCouch(){return this.x>=COUCH.west;}
 skip(){if(this.done)return;this.dog.goTo(DOG_AT.x,DOG_AT.y,{pose:'sit',face:1});this.dog.teleport();this.cat.goTo(CAT_AT.x,CAT_AT.y,{pose:'sit',face:4});this.cat.teleport();this.finish();}
 finish(){if(this.done)return;this.done=true;this.say='';this.fade=0;this.zzz=false;Object.assign(this.you,{x:WAKE_END.x,y:WAKE_END.y,direction:WAKE_END.direction,frame:0,phase:0,moving:false});this.x=WAKE_END.x;this.y=WAKE_END.y;
  this.dog.release();this.cat.release();}
}
