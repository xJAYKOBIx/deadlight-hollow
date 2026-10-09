// Controller support through the Gamepad API (standard mapping, as on Xbox and PlayStation pads).
// Sticks get a radial dead zone; buttons report held, just pressed and just released.
export const PAD={dead:.2,aim:.3,fire:.55};
export const BUTTONS={a:0,b:1,x:2,y:3,lb:4,rb:5,lt:6,rt:7,back:8,start:9,l3:10,r3:11,up:12,down:13,left:14,right:15};
export function deadzone(x,y,dead=PAD.dead){const m=Math.hypot(x,y);if(m<dead)return {x:0,y:0,m:0};const s=Math.min(1,(m-dead)/(1-dead));return {x:x/m*s,y:y/m*s,m:s};}
export class PadInput{
 constructor(source=()=>globalThis.navigator?.getGamepads?.()||[]){this.source=source;this.prev={};this.state=null;}
 // Reads the first connected controller, or returns null when there is none.
 poll(){let list=[];try{list=[...this.source()].filter(p=>p&&p.connected!==false);}catch{}const g=list.find(p=>p.mapping==='standard')||list[0];if(!g){this.state=null;this.prev={};return null;}
  const down={},pressed={},released={};for(const [n,i] of Object.entries(BUTTONS)){const b=g.buttons?.[i];down[n]=!!b&&(b.pressed||b.value>.4);pressed[n]=down[n]&&!this.prev[n];released[n]=!down[n]&&!!this.prev[n];}
  this.prev=down;const ax=i=>Number(g.axes?.[i])||0,left=deadzone(ax(0),ax(1)),right=deadzone(ax(2),ax(3));
  this.state={pad:g,left,right,down,pressed,released,any:left.m>0||right.m>0||Object.values(down).some(Boolean)};return this.state;}
 rumble(strong=.2,weak=.4,ms=50){try{this.state?.pad?.vibrationActuator?.playEffect?.('dual-rumble',{duration:ms,strongMagnitude:strong,weakMagnitude:weak});}catch{}}
}
