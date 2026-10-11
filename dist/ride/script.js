// The ride in (v0.67), played like the briefing (base/brief.js): beats, each running until its time is up, its lines are tapped past
// and anything it waits on is done. The truck drives the whole time: the road's speed eases toward what the beat asks for, and the
// truck's distance down the road (pos) is what scrolls the road and brings the lamps and the checkpoint past.
// A beat can set: fade [from, to], title, line (story/op.js), cam (study/camera.js), drive ('cruise', 'hollow', 'gate' to pull up at
// the checkpoint's gate, 'stop' to pull up where it is once the checkpoint is out of sight behind), lamps (the road lit, or the power
// out), gate (the checkpoint ahead, then its arm up), hit (something hits the hull), act (waits for you: 'load'), ramp (the ramp comes
// down) and cue (sounds to play).
import {OP} from '../story/op.js';import {TRUCK,SEATS,DRIVE,REF,GATE_GAP} from './data.js';
const R=OP.ride,GATE_AHEAD=420;
export const WIDE={x:TRUCK.x+150,y:TRUCK.y+8,z:1},AARON={x:SEATS.aaron.x-4,y:SEATS.aaron.hip-14,z:1.7},CAB={x:SEATS.gadget.x-14,y:SEATS.gadget.hip-12,z:1.6},REAR={x:TRUCK.x+92,y:TRUCK.y+10,z:1.25},GATE={x:REF-24,y:TRUCK.y+44,z:1.35};
const cam=(at,secs=1.2)=>({...at,secs});
export const RIDE_BEATS=[
 // Black: the ramp shuts on the hangar, the engine. The title; then the truck, already on the road, lamps going over.
 {t:3.6,fade:[1,1],title:R.title,drive:'cruise',lamps:1,cam:cam(WIDE,0),cue:['apc-ramp']},{t:2.4,fade:[1,0]},
 {t:.4,line:R.meet,cam:cam(AARON,1.6)},{t:.3,line:R.prep,cam:cam(WIDE)},{t:.3,line:R.gadget,cam:cam(CAB,1.4)},
 // Loading up: Aaron says, and the ride waits for you to do it.
 {t:.3,line:R.load,cam:cam(AARON)},{t:.2,act:'load'},{t:.8},{t:.3,line:R.loaded},{t:.4,line:R.plan,cam:cam(WIDE)},
 // The cordon: the checkpoint comes up out of the dark and the truck pulls up at its gate; the Guard waves you through.
 {t:.3,line:R.cordon,gate:'ahead',drive:'gate',cue:['radio-in']},{t:.8,cue:['air-brake']},{t:.3,line:R.guard,cam:cam(GATE)},{t:1.6,gate:'up',drive:'cruise',cam:cam(WIDE)},
 // Inside: the lamps are out. Something hits the hull.
 {t:2.4,lamps:0,drive:'hollow'},{t:.3,line:R.dark,cue:['radio-in']},{t:.8,hit:true,cue:['hull-thump'],cam:cam(REAR,.3)},{t:.3,line:R.hit},
 {t:.3,line:R.close,cam:cam(WIDE),cue:['radio-in']},
 // Juniper Lane: the truck stops, the ramp comes down, and out you go.
 {t:1.6,drive:'stop',cue:['air-brake']},{t:.3,line:R.ramp,cam:cam(REAR,1.2)},{t:2.4,ramp:true,cue:['apc-ramp']},{t:1.3,fade:[0,1]}];
export class Ride{
 constructor(){Object.assign(this,{i:-1,t:0,done:false,fade:1,cam:null,title:null,line:null,heard:true,act:null,acted:false,cues:[],
  pos:0,speed:DRIVE.cruise,drive:'cruise',lamps:1,gate:null,gateArm:0,hit:0,ramp:0,clock:0,later:[]});this.next();}
 get beat(){return RIDE_BEATS[this.i];}
 next(){this.i++;this.t=0;const b=this.beat;if(!b){this.finish();return;}if(b.cam!==undefined)this.cam=b.cam;this.title=b.title||null;this.line=b.line||null;this.heard=!b.line;
  if(b.drive)this.drive=b.drive;if(b.lamps!==undefined)this.lamps=b.lamps;if(b.gate==='ahead')this.gate=this.pos+GATE_AHEAD;if(b.hit){this.hit=1;this.speed*=.7;}if(b.cue)this.cues.push(...b.cue);
  this.act=b.act||null;this.acted=!b.act;}
 // Where the checkpoint's gate is against the truck (world x), while there is one in sight.
 get gateX(){return this.gate===null?null:REF+(this.gate-this.pos);}
 update(dt){if(this.done)return;dt=Math.max(0,Math.min(.05,dt||0));this.t+=dt;this.clock+=dt;
  while(this.later.length&&this.later[0].at<=this.clock)this.cues.push(this.later.shift().id);const b=this.beat,k=Math.min(1,this.t/b.t);
  this.fade=b.fade?b.fade[0]+(b.fade[1]-b.fade[0])*k:0;
  // The road: ease toward the speed the beat wants; pulling up at the gate brakes so the cab stops at its arm, and pulling up in the
  // Hollow waits until the checkpoint is behind you.
  const d=this.drive==='stop'&&this.gate!==null?'hollow':this.drive,want=d==='cruise'?DRIVE.cruise:d==='hollow'?DRIVE.hollow:d==='gate'?Math.min(DRIVE.cruise,Math.sqrt(2*DRIVE.brake*Math.max(0,this.gate-this.pos-GATE_GAP))):0;
  this.speed=want<this.speed?Math.max(want,this.speed-DRIVE.brake*1.6*dt):Math.min(want,this.speed+DRIVE.gas*dt);this.pos+=this.speed*dt;
  if(this.gate!==null&&b.gate==='up')this.gateArm=Math.min(1,this.gateArm+dt*1.2);if(this.gate!==null&&this.gateX<-200){this.gate=null;this.gateArm=0;}
  this.hit=Math.max(0,this.hit-dt*1.4);if(b.ramp)this.ramp=Math.min(1,this.ramp+dt/2.1);
  const settled=this.drive!=='gate'&&this.drive!=='stop'||this.speed<1;
  if(this.heard&&this.acted&&settled&&this.t>=b.t)this.next();}
 // The dialog box tapped past this beat's last line; the thing it waited for, done.
 ack(){this.heard=true;}
 doAct(){if(this.acted||!this.act)return false;this.acted=true;if(this.act==='load'){this.cues.push('mag-in');this.later.push({at:this.clock+.45,id:'loaded'});}this.act=null;return true;}
 skip(){this.finish();}
 finish(){if(this.done)return;this.done=true;Object.assign(this,{line:null,heard:true,act:null,acted:true,fade:1,cam:null,title:null,speed:0,ramp:1});}
}
