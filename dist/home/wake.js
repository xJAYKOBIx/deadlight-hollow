// The opening of the tutorial: Owen wakes on the couch in the dark when the dog noses his hand, sits up, stands, and then it is your
// turn to move: the candle is nearly out, so first the flashlight in the kitchen (CRASH plays once you have it). Petting is yours to do. A short script of beats; each one runs until its time is up or what it waits for has happened.
// Beats can also cue a sound, move the police car's light (pass sweeps it past the front windows, parked leaves it turning down the
// street) and shake the camera; the scene reads those off the Wake. It drives the survivor itself (the couch is solid, so it does not walk through the model) and calls the pets over with goTo.
// The couch is seen from behind, so lying, sitting and standing on it are the same standing sprite lower or higher, drawn just
// behind the couch (depth) and cut off at its bottom edge (cut): the couch covers what is below its top edge, at about y 173.
export const COUCH={x:246,stand:184,sit:226,lie:254,depth:200,cut:221,west:224};
// Where you end up, beside the west end of the couch, and where each animal comes to.
export const WAKE_END={x:204,y:236,direction:2},DOG_AT={x:176,y:246},CAT_AT={x:240,y:246};
import {SCRIPT} from '../story/night1.js';import {HOUSE} from './data.js';
const WALK=80,STRIDE=54;
const facing=(dx,dy)=>(Math.round(Math.atan2(dy,dx)/(Math.PI/4))+8)%8;
// Lines (line) come from the script and wait in the dialog box: the beat does not end until the last one is tapped past (ack).
// cam points the camera (study/camera.js) until a later beat sets it back to null; title shows the night's title card.
export const BEATS=[
 // Black and the title, then the room fades up slowly on him asleep on the couch, the camera in close.
 {t:3.6,fade:[1,1],zzz:true,title:['Night one','Deadlight Hollow'],cam:{x:COUCH.x-8,y:198,z:1.6,secs:0}},{t:3,fade:[1,0],zzz:true},
 // Duke comes in and pushes his nose under Owen's hand. He wakes, sits up, and the camera eases back as he stands.
 {t:5,zzz:true,start:c=>c.dog.goTo(204,214,{pose:'sniff',face:0,rush:1.8}),until:c=>c.dog.arrived},{t:1.2,zzz:true},
 {t:.8,rise:['lie','sit'],dir:4},{t:.3,line:SCRIPT.wake.up},
 {t:.5,dir:2,line:SCRIPT.wake.power,start:c=>c.dog.goTo(DOG_AT.x,DOG_AT.y,{pose:'sit',face:1,rush:1.4})},
 {t:.8,rise:['sit','stand'],cam:null},{t:6,walk:[[212,COUCH.stand],[WAKE_END.x,WAKE_END.y]]},
 {t:.4,dir:2,line:SCRIPT.wake.go}];
// Then, once the flashlight is on: sirens, and one of them comes down your street. The camera follows the light bar past the
// front rooms to the corner where it stops; Duke runs barking to the front door and the cat bolts for the bedroom. Played wherever you are standing.
const FRONT={x:HOUSE.x+HOUSE.w/2,y:HOUSE.y+HOUSE.h-50},CORNER={x:HOUSE.x+HOUSE.w-40,y:HOUSE.y+HOUSE.h-10};
export const DOOR_AT={x:517,y:436},HIDE_AT={x:172,y:396};
export const CRASH=[
 {t:1.2},{t:.4,dir:2,cue:'distant-siren',line:SCRIPT.crash.sirens},{t:.2,line:SCRIPT.crash.close},
 {t:2.6,dir:2,cue:'car-pass',police:'pass',cam:{...FRONT,z:.85,secs:1.1}},
 {t:.5,cue:'car-crash',police:'parked',shake:true,cam:{...CORNER,z:1.1,secs:.5},start:c=>{c.dog.goTo(DOOR_AT.x,DOOR_AT.y,{pose:'sit',face:2,rush:2.4});c.cat.goTo(HIDE_AT.x,HIDE_AT.y,{pose:'lie',face:2,rush:2.8});}},
 {t:1.7,cue:'dog-bark'},
 // The siren chokes off; only the light bar keeps turning. Hold on it, then back to him before he speaks.
 {t:1.6,cue:'dog-bark'},{t:1.4,cam:null},{t:.2,line:SCRIPT.crash.after}];
export class Wake{
 // pets: {dog, cat} as HousePets. you: the survivor's model, moved to where the scene ends.
 // beats: another script (CRASH), played where you stand instead of from the couch.
 constructor({dog,cat,you,beats=null}){Object.assign(this,{dog,cat,you,beats,i:-1,t:0,done:false,cues:[],police:null,cam:null,title:null,shook:0,x:COUCH.x,y:COUCH.lie,direction:6,frame:0,phase:0,fade:1,zzz:true,say:'',pose:'lie',path:[]});
  if(beats)Object.assign(this,{x:you.x,y:you.y,direction:you.direction??2,fade:0,zzz:false,pose:'stand'});this.next();}
 get beat(){return (this.beats||BEATS)[this.i];}
 next(){this.i++;this.t=0;const b=this.beat;if(!b){this.finish();return;}if(b.say!==undefined)this.say=b.say;if(b.cam!==undefined)this.cam=b.cam;this.title=b.title||null;this.line=b.line||null;this.heard=!b.line;if(b.dir!==undefined)this.direction=b.dir;if(b.walk)this.path=b.walk.map(([x,y])=>({x,y}));if(b.cue)this.cues.push(b.cue);if(b.police)this.police=b.police;if(b.shake)this.shook++;b.start?.(this);}
 update(dt){if(this.done)return;dt=Math.max(0,Math.min(.05,dt||0));this.t+=dt;const b=this.beat,k=Math.min(1,this.t/(b.rise?.6:b.t));
  this.fade=b.fade?b.fade[0]+(b.fade[1]-b.fade[0])*k:0;this.zzz=!!b.zzz;
  if(b.rise){const [a,z]=b.rise;this.y=COUCH[a]+(COUCH[z]-COUCH[a])*k;this.pose=k<1?a:z;}
  if(this.path.length){const p=this.path[0],dx=p.x-this.x,dy=p.y-this.y,d=Math.hypot(dx,dy),s=Math.min(d,WALK*dt);if(d>.01){this.x+=dx/d*s;this.y+=dy/d*s;this.direction=facing(dx,dy);this.phase=(this.phase+s/STRIDE)%1;this.frame=1+Math.floor(this.phase*8);}
   if(d<=s+.01){this.path.shift();if(!this.path.length)this.frame=0;}this.pose='stand';}
  const waiting=this.path.length||(b.until&&!b.until(this));if(this.heard&&(this.t>=b.t||(b.until&&!waiting&&this.t>.2)||(b.walk&&!this.path.length)))this.next();}
 // The dialog box tapped past this beat's last line.
 ack(){this.heard=true;}
 // On the couch the sprite is drawn behind it and cut at its foot; past its west end it is the survivor as usual.
 get onCouch(){return !this.beats&&this.x>=COUCH.west;}
 skip(){if(this.done)return;if(this.beats){this.police='parked';this.finish();return;}this.dog.goTo(DOG_AT.x,DOG_AT.y,{pose:'sit',face:1});this.dog.teleport();this.cat.goTo(CAT_AT.x,CAT_AT.y,{pose:'sit',face:4});this.cat.teleport();this.finish();}
 finish(){if(this.done)return;this.done=true;this.say='';this.line=null;this.heard=true;this.fade=0;this.zzz=false;this.cam=null;this.title=null;if(this.beats){Object.assign(this.you,{direction:this.direction,frame:0,moving:false});this.dog.release();this.cat.release();return;}Object.assign(this.you,{x:WAKE_END.x,y:WAKE_END.y,direction:WAKE_END.direction,frame:0,phase:0,moving:false});this.x=WAKE_END.x;this.y=WAKE_END.y;
  this.dog.release();this.cat.release();}
}
