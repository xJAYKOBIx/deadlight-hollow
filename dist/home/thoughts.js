// What you think, in your own words. Short first-person lines that drift up under you while you play, apart from the talk box (which
// describes what you look at, in the second person). Each one is said once a night, when its moment has lasted long enough.
// The game hands over what it knows each frame (where you are, what you carry, the fight) and the events the fight sends; this only picks the line.
const DOOR={x:517,y:452},near=(s,p,r)=>Math.hypot(s.x-p.x,s.y-p.y)<r;
const gun=(s,id)=>!!s.kit?.guns?.[id],armed=s=>gun(s,'light-pistol')||gun(s,'pump-shotgun');
// In order: when two are ready together, the first one wins. delay is how long the moment must last first.
export const THOUGHTS=[
 // The house, after the crash. Find something, then go.
 {id:'door-empty',at:'home',delay:.4,when:s=>!armed(s)&&near(s,DOOR,70),say:'I\'m not opening that door empty-handed. The pistol\'s in the nightstand.'},
 {id:'wake',at:'home',delay:2.5,when:s=>!armed(s),say:'Okay. Breathe. Whatever that was, I\'m not walking out there with nothing.'},
 {id:'where',at:'home',delay:16,when:s=>!armed(s)&&s.said.has('wake'),say:'Think. Bedroom, nightstand, top drawer. The pistol\'s still in there.'},
 {id:'both',at:'home',delay:1.2,when:s=>gun(s,'light-pistol')&&gun(s,'pump-shotgun'),say:'That\'s everything. Front door.'},
 {id:'pistol',at:'home',delay:1.2,when:s=>gun(s,'light-pistol')&&!gun(s,'pump-shotgun'),say:'There\'s that shotgun in the hall closet, too. Heavier, but I\'d feel better with it.'},
 {id:'shotgun',at:'home',delay:1.2,when:s=>gun(s,'pump-shotgun')&&!gun(s,'light-pistol'),say:'Still loaded. The pistol\'s in the nightstand if I want a backup.'},
 {id:'dog',at:'home',delay:.3,when:s=>armed(s)&&s.pets?.some(p=>p.def?.id==='dog'&&near(s,p,46)),say:'Stay here, buddy. I\'ll be right back.'},
 {id:'go',at:'home',delay:40,when:s=>armed(s)&&s.kit.street==='start',say:'Whoever was in that car could be hurt. Go.'},
 // The street.
 {id:'out',at:'street',delay:1,when:s=>s.kit.street==='start'&&!s.fight?.alert,say:'Cold. Quiet. The lights are coming from past the Parks\' place.'},
 {id:'cruiser',at:'street',delay:.2,when:s=>s.kit.street==='start'&&!s.fight?.alert&&s.x>1010,say:'That\'s a police car. Straight into the pole.'},
 {id:'contact',at:'street',delay:.6,when:s=>s.kit.street==='start'&&s.fight?.alert,say:'He\'s walking. Why is he walking like that?'},
 {id:'bitten',at:'street',delay:.2,when:s=>s.seen.hurt>0,say:'It bit me. It actually bit me!'},
 {id:'kill',at:'street',delay:.5,when:s=>s.seen.kill>0,say:'He didn\'t stop. Not until… Don\'t think about it. Not yet.'},
 {id:'hurt',at:'street',delay:.2,when:s=>s.fight?.alert&&s.fight.hp>0&&s.fight.hp<=s.fight.maxHp*.35,say:'Back off. Get some distance.'},
 {id:'shells',at:'street',delay:.2,when:s=>s.seen.nospare>0,say:'Out of shells. The pistol, then.'},
 {id:'again',at:'street',delay:1,when:s=>s.seen.restart>0,say:'Not like that. Keep my distance this time.'},
 {id:'clear',at:'street',delay:2.2,when:s=>s.kit.street==='cleared',say:'Is that all of them? The cruiser. There might be something in it.'},
 {id:'more',at:'street',delay:2.2,when:s=>s.kit.street==='looted'&&s.fight?.alert,say:'That was too loud. Here come more of them.'},
 {id:'done',at:'street',delay:2.4,when:s=>s.kit.street==='done',say:'What is happening to everyone?'}];
// How long a line stays up: long enough to read twice.
export const showFor=say=>Math.min(6.5,Math.max(3,2+say.split(/\s+/).length*.3));
export class Thoughts{
 constructor(list=THOUGHTS){this.list=list;this.reset();}
 reset(){this.said=new Set();this.seen={};this.held={};this.line=null;this.left=0;this.gap=0;}
 // Things that happened, counted so a line can wait for the first of them.
 note(type){this.seen[type]=(this.seen[type]||0)+1;}
 // quiet: talking, paused or watching a scene; nothing new starts and the line on screen goes.
 update(dt,state,quiet=false){const s={...state,said:this.said,seen:this.seen};
  if(this.line){this.left-=dt;if(this.left<=0||quiet){this.line=null;this.gap=1.2;}}else this.gap=Math.max(0,this.gap-dt);
  // A moment that ends before its line gets said is forgotten; one still going waits its turn.
  for(const t of this.list){if(this.said.has(t.id))continue;if(t.at!==s.place||quiet||!t.when(s)){delete this.held[t.id];continue;}this.held[t.id]=(this.held[t.id]||0)+dt;}
  if(this.line||this.gap>0||quiet)return this.line;
  const t=this.list.find(t=>!this.said.has(t.id)&&(this.held[t.id]||0)>=t.delay);if(!t)return null;
  this.said.add(t.id);this.line=t.say;this.left=showFor(t.say);
  return this.line;}}
