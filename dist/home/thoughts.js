// What you think, in your own words. Short first-person lines that drift up under you while you play, apart from the talk box (which
// describes what you look at, in the second person). Each one is said once a night, when its moment has lasted long enough.
// The game hands over what it knows each frame (where you are, what you carry, the fight) and the events the fight sends; this only picks the line.
import {THOUGHT_LINES} from '../story/night1.js';
const gun=(s,id)=>!!s.kit?.guns?.[id],armed=s=>gun(s,'light-pistol')||gun(s,'pump-shotgun');
// In order: when two are ready together, the first one wins. delay is how long the moment must last first. The words are in the
// script (story/night1.js); story moments that need you to read them are in the dialog box instead, so these stay few and short.
const T=THOUGHT_LINES;
export const THOUGHTS=[
 // The house in the dark: a nudge only after a minute without the flashlight, and one for the second gun.
 {id:'dark',at:'home',delay:60,when:s=>!s.kit.light,say:T.dark},
 {id:'other',at:'home',delay:30,when:s=>armed(s)&&!(gun(s,'light-pistol')&&gun(s,'pump-shotgun')),say:T.other},
 // The street.
 {id:'out',at:'street',delay:1,when:s=>s.kit.street==='start'&&!s.fight?.alert&&s.kit.phase!=='own',say:T.out},
 {id:'bitten',at:'street',delay:.2,when:s=>s.seen.hurt>0,say:T.bitten},
 {id:'hurt',at:'street',delay:.2,when:s=>s.fight?.alert&&s.fight.hp>0&&s.fight.hp<=s.fight.maxHp*.35,say:T.hurt},
 {id:'shells',at:'street',delay:.2,when:s=>s.seen.nospare>0,say:T.shells},
 {id:'again',at:'street',delay:1,when:s=>s.seen.restart>0,say:T.again},
 {id:'loud',at:'street',delay:2.2,when:s=>s.kit.street==='looted'&&s.fight?.alert,say:T.loud},
 {id:'flare',at:'street',delay:.6,when:s=>!!s.fight?.evac&&s.kit.phase!=='own',say:T.flare},
 {id:'overrun',at:'street',delay:.5,when:s=>s.seen.overrun>0&&s.kit.phase!=='own',say:T.overrun},
 // Your own survivor, after watching him die and get up.
 {id:'coming',at:'street',delay:.3,when:s=>s.kit.phase==='own'&&!s.kit.corpse?.taken&&!!s.fight?.zombies?.some(z=>z.kind==='risen'&&z.hunt),say:T.coming},
 {id:'run',at:'street',delay:4.5,when:s=>s.kit.phase==='own'&&s.kit.corpse?.taken,say:T.run}];
// How long a line stays up: long enough to read twice.
export const showFor=say=>Math.min(6.5,Math.max(3,2+say.split(/\s+/).length*.3));
export class Thoughts{
 constructor(list=THOUGHTS){this.list=list;this.reset();}
 reset(){this.said=new Set();this.seen={};this.held={};this.line=null;this.left=0;this.gap=0;}
 // Things that happened, counted so a line can wait for the first of them.
 note(type){this.seen[type]=(this.seen[type]||0)+1;}
 // A line said now, out of turn (petting, a radio reply): it takes the place of whatever is up.
 push(say){this.line=say;this.left=showFor(say);this.gap=0;}
 // quiet: talking, paused or watching a scene; nothing new starts and the line on screen goes.
 update(dt,state,quiet=false){const s={...state,said:this.said,seen:this.seen};
  if(this.line){this.left-=dt;if(this.left<=0||quiet){this.line=null;this.gap=1.2;}}else this.gap=Math.max(0,this.gap-dt);
  // A moment that ends before its line gets said is forgotten; one still going waits its turn.
  for(const t of this.list){if(this.said.has(t.id))continue;if(t.at!==s.place||quiet||!t.when(s)){delete this.held[t.id];continue;}this.held[t.id]=(this.held[t.id]||0)+dt;}
  if(this.line||this.gap>0||quiet)return this.line;
  const t=this.list.find(t=>!this.said.has(t.id)&&(this.held[t.id]||0)>=t.delay);if(!t)return null;
  this.said.add(t.id);this.line=t.say;this.left=showFor(t.say);
  return this.line;}}
