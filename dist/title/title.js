// The title screen: the first thing you see, and where Quit to title comes back to. Behind it is the real street at night (street/
// scene.js showcase), the camera drifting down the road past the houses to the crashed cruiser and back, with rain falling over it and
// now and then lightning a long way off. Over it, the name, and a menu: Continue (if there is something going to go back to), New
// Game, Marcus's Night, Survivor (the creator), Settings and Credits, worked by touch, mouse, keys or a controller. The game wires
// what each one does.
import {bus} from '../mc/assets/sounds/kit.js';

// The camera's path down the street, in world units, with how close it is (times the game's zoom) at each point: from up the road,
// past your house, to the cruiser in the pole with its lights still going, a little beyond, and back. A whole way takes secs, easing
// in and out at the ends. The extra dead stand about along it, so something is always moving in the picture.
export const TITLE_PATH={secs:62,pts:[[2600,3060,1.02],[2920,3075,1.04],[3300,3088,1.06],[3560,3092,1.16],[3820,3078,1.08]],
 extras:[[2700,3150],[2985,3168],[3180,3050],[3385,3170],[3660,3165],[3880,3105],[3460,3040]]};
// Where the camera is at t seconds: back and forth along the path by distance travelled, so it moves at an even pace between the ends.
export function cameraAt(t,P=TITLE_PATH){const pts=P.pts,lens=[0];for(let i=1;i<pts.length;i++)lens.push(lens[i-1]+Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]));
 const L=lens[lens.length-1],ph=(t/P.secs)%2,u=ph<1?ph:2-ph,s=(1-Math.cos(Math.PI*u))/2*L;let i=1;while(i<pts.length-1&&lens[i]<s)i++;
 const a=pts[i-1],b=pts[i],k=(s-lens[i-1])/((lens[i]-lens[i-1])||1);return {x:a[0]+(b[0]-a[0])*k,y:a[1]+(b[1]-a[1])*k,z:a[2]+(b[2]-a[2])*k};}

const LETTERS='DEADLIGHT';
// The menu, top to bottom. sub is the line under each; Continue's comes from the save, and Marcus's Night shows his night when one
// is going. New Game is the operation from the briefing (v0.66), or from any part of it you have reached (v0.70); Marcus's night in
// the house is its own story now.
const ITEMS=[['continue','Continue'],['new','New Game','Operation Bell Jar, from the briefing'],['marcus','Marcus\'s Night','The night it all went wrong'],['survivor','Survivor','Who you are out there'],['settings','Settings','Sound, effects, gore, camera'],['credits','Credits']];
const CREDITS=[['Deadlight Hollow',''],['Created by','Jaykobi'],['Art, sound and code','Made in the Master Creator library, with Claude'],['Engine','Phaser'],['Type','Saira Stencil One, Barlow Condensed'],['Thanks for playing','Stay off the main roads.']];

// o: version, audio (study/audio.js), device() ('touch', 'keys' or 'pad'), save() (null, or {label, detail} for Continue),
// opSave() (the operation going, if any: New Game asks first), marcusSave() (his night going, if any), parts() (null, or the parts of
// the operation New Game can start at, [{id, label, sub, off}]), newLine() (New Game's line, when not its own), onContinue, onNew,
// onPart(id), onMarcus, onSurvivor, settings ([{label(), press()}]), controls() (the controls list's HTML), dialogOpen() (a game dialog
// over the title takes the keys), buzz(ms).
export function mountTitle(o){
 const el=document.createElement('div');el.id='title';el.hidden=true;el.setAttribute('role','dialog');el.setAttribute('aria-label','Deadlight Hollow');
 el.innerHTML=`<div class="ti-veil" aria-hidden="true"></div><canvas class="ti-rain" aria-hidden="true"></canvas><div class="ti-shade" aria-hidden="true"></div><div class="ti-flash" aria-hidden="true"></div><div class="ti-grain" aria-hidden="true"></div>
 <div class="ti-col"><header class="ti-logo"><span class="ti-kick">Welcome to</span><h1 class="ti-dead" aria-label="Deadlight">${[...LETTERS].map((c,i)=>`<span class="l${i}">${c}</span>`).join('')}</h1>
 <div class="ti-hollow"><b></b><span>Hollow</span><b></b></div><p class="ti-tag">This game is in active development!</p></header>
 <div class="ti-press" aria-live="polite"></div><nav class="ti-menu" aria-label="Main menu"></nav><section class="ti-panel" hidden></section></div>
 <footer class="ti-foot"><span class="ti-hints"></span><span class="ti-ver"></span></footer><div class="ti-black" aria-hidden="true"></div>`;
 document.body.append(el);const q=s=>el.querySelector(s),menu=q('.ti-menu'),panel=q('.ti-panel'),press=q('.ti-press');q('.ti-ver').textContent='v'+o.version;
 let state='off',from=null,downOn=null,shown=false,bed=null,bedT=0,raf=0,last=0,flashAt=0,stickAt=0,leaving=false,opened=0;
 const sound=id=>o.audio.play(id,{},.03);
 // The rain: a few hundred thin streaks falling on a slant, drawn at the screen's own size.
 const rain=q('.ti-rain'),rc=rain.getContext('2d');let drops=[];
 function size(){const w=innerWidth,h=innerHeight;rain.width=w;rain.height=h;const n=Math.min(280,Math.round(w*h/4200));drops=Array.from({length:n},()=>({x:Math.random()*w*1.2,y:Math.random()*h,v:700+Math.random()*500,l:8+Math.random()*12,a:.08+Math.random()*.22}));}
 function rainStep(dt){const w=rain.width,h=rain.height;rc.clearRect(0,0,w,h);rc.lineWidth=1;for(const d of drops){d.y+=d.v*dt;d.x-=d.v*dt*.16;if(d.y>h+20||d.x<-20){d.y=-20-Math.random()*h*.3;d.x=Math.random()*w*1.2;}
  rc.strokeStyle=`rgba(186,198,214,${d.a})`;rc.beginPath();rc.moveTo(d.x,d.y);rc.lineTo(d.x+d.l*.16,d.y-d.l);rc.stroke();}}
 // Lightning far off: the sky flickers twice, and the thunder comes a moment later.
 function lightning(now){if(!flashAt)flashAt=now+9000+Math.random()*8000;if(now<flashAt)return;flashAt=now+16000+Math.random()*14000;const f=q('.ti-flash');f.classList.remove('on');void f.offsetWidth;f.classList.add('on');
  setTimeout(()=>{if(state!=='off')sound('thunder');},700+Math.random()*900);}
 // The night under it all: the bed of rain and drone, one every six and a half seconds, through a volume of its own so it can fade.
 function night(now){const c=o.audio.ctx;if(!c||!o.audio.on)return;if(!bed){bed=bus(c);bed.gain.setValueAtTime(0,c.currentTime);bed.gain.linearRampToValueAtTime(.9,c.currentTime+2);}if(now<bedT)return;bedT=now+6500;o.audio.play('title-night',{bus:bed});}
 function hush(){const b=bed,c=o.audio.ctx;bed=null;bedT=0;if(!b||!c)return;b.gain.cancelScheduledValues(c.currentTime);b.gain.setValueAtTime(b.gain.value,c.currentTime);b.gain.linearRampToValueAtTime(0,c.currentTime+1.4);setTimeout(()=>b.disconnect(),1600);}
 function loop(now){raf=requestAnimationFrame(loop);const dt=Math.min(.05,(now-(last||now))/1000);last=now;if(document.hidden)return;rainStep(dt);lightning(now);if(state!=='splash')night(now);}
 // Hints for the way you are playing.
 function hints(){const d=o.device();q('.ti-hints').innerHTML=d==='pad'?'<kbd>Ⓐ</kbd> Choose <kbd>Ⓑ</kbd> Back':d==='keys'?'<kbd>↑</kbd><kbd>↓</kbd> Move <kbd>Enter</kbd> Choose <kbd>Esc</kbd> Back':'';
  press.textContent=d==='touch'?'Tap to start':d==='pad'?'Press any button':'Press any key';}
 // A list of choices (the menu, or a panel's): buttons, each with its line under it; moving onto one ticks. A press counts only if
 // it began on that button (or came from the keys or a controller, which click with no pointer): the tap that wakes the title
 // brings the menu up under a finger still on the glass, and lifting it must not choose whatever is there (v0.70.1).
 function list(box,rows,pick){box.innerHTML='';downOn=null;for(const r of rows){const b=document.createElement('button');b.type='button';b.className='ti-item';b.dataset.id=r.id;b.disabled=!!r.off;
   b.innerHTML=`<span class="ti-mark" aria-hidden="true"></span><span class="ti-text"><b>${r.label}</b>${r.sub?`<small>${r.sub}</small>`:''}</span>`;
   b.addEventListener('pointerenter',()=>{if(!b.disabled&&document.activeElement!==b&&state!=='off'){b.focus({preventScroll:true});sound('menu-move');}});
   b.addEventListener('pointerdown',()=>{downOn=b;});
   b.addEventListener('click',e=>{const mine=e.detail===0||downOn===b;downOn=null;if(!b.disabled&&!leaving&&mine)pick(r.id,b);});box.append(b);}
  const first=[...box.querySelectorAll('.ti-item')].find(b=>!b.disabled);first?.focus({preventScroll:true});}
 function showMenu(focus){state='menu';panel.hidden=true;menu.hidden=false;el.classList.add('ti-menuing');el.classList.remove('ti-paneled');const s=o.save();
  const m=o.marcusSave?.();list(menu,ITEMS.map(([id,label,sub])=>id==='continue'?{id,label,sub:s?`${s.label} · ${s.detail}`:'Nothing in progress',off:!s}:id==='marcus'&&m?{id,label,sub:`${m.label} · ${m.detail}`}:
   id==='new'?{id,label,sub:o.newLine?.()||sub}:{id,label,sub}),choose);
  if(focus)menu.querySelector(`[data-id="${focus}"]`)?.focus({preventScroll:true});}
 function showPanel(kind,title,rows,pick,html=''){state=kind;menu.hidden=true;panel.hidden=false;el.classList.add('ti-menuing','ti-paneled');panel.innerHTML=`<h2>${title}</h2>${html}<div class="ti-list"></div>`;
  list(panel.querySelector('.ti-list'),rows,pick);}
 function settings(focus){showPanel('settings','Settings',[...o.settings.map((s,i)=>({id:'s'+i,label:s.label()})),{id:'controls',label:'Controls'},{id:'back',label:'Back'}],id=>{
   sound('menu-select');if(id==='back')return showMenu('settings');if(id==='controls')return controls();const s=o.settings[+id.slice(1)];s.press();settings(id);});
  if(focus)panel.querySelector(`[data-id="${focus}"]`)?.focus({preventScroll:true});}
 function controls(){showPanel('controls','Controls',[{id:'back',label:'Back'}],()=>{sound('menu-select');settings('controls');},`<div class="ti-scroll">${o.controls()}</div>`);}
 function credits(){showPanel('credits','Credits',[{id:'back',label:'Back'}],()=>{sound('menu-select');showMenu('credits');},`<dl class="ti-credits">${CREDITS.map(([a,b])=>`<dt>${a}</dt><dd>${b}</dd>`).join('')}</dl>`);}
 // New Game once you have got on the truck (v0.70): the operation from the start or from a part you have reached, asking first when
 // that would lose an operation you have going.
 function parts(focus){const P=o.parts?.();if(!P)return showMenu('new');showPanel('parts','Operation Bell Jar',[...P,{id:'back',label:'Back'}],id=>{sound('menu-select');if(id==='back')return showMenu('new');
   const p=P.find(r=>r.id===id);if(o.opSave?.())confirmNew(p);else leave(()=>o.onPart(id));});if(focus)panel.querySelector(`[data-id="${focus}"]`)?.focus({preventScroll:true});}
 function confirmNew(p=null){from=p;showPanel('confirm',p?p.label:'Start over?',[{id:'yes',label:p?'Start over':'Start the operation',sub:'The operation you have going will be lost'},{id:'back',label:'Back'}],
  id=>{sound('menu-select');if(id==='back')return p?parts(p.id):showMenu('new');leave(p?()=>o.onPart(p.id):o.onNew);});}
 function choose(id){sound('menu-select');o.buzz?.(18);
  if(id==='continue')return leave(o.onContinue);if(id==='new')return o.parts?.()?parts():o.opSave?.()?confirmNew():leave(o.onNew);if(id==='marcus')return leave(o.onMarcus);
  if(id==='survivor')return o.onSurvivor();if(id==='settings')return settings();if(id==='credits')return credits();}
 // Going in: the menu goes, the screen goes black, the game is set up behind it, and the black lifts on the place.
 function leave(fn){leaving=true;state='leaving';el.classList.add('ti-leaving');hush();setTimeout(()=>{fn();setTimeout(close,250);},760);}
 function back(){if(state==='menu'||state==='splash'||state==='leaving')return;sound('menu-move');if(state==='controls')settings('controls');else if(state==='confirm'&&from)parts(from.id);
  else showMenu(state==='confirm'||state==='parts'?'new':state);}
 // The first touch, click, key or button: the sound can start, the title hits, and the menu comes up.
 function wake(){if(state!=='splash')return;state='waking';setTimeout(()=>{sound('title-hit');o.buzz?.(40);el.classList.add('ti-lit');showMenu();},60);}
 function step(dir){const items=[...el.querySelectorAll(state==='menu'?'.ti-menu .ti-item':'.ti-panel .ti-item')].filter(b=>!b.disabled);if(!items.length)return;
  const i=items.indexOf(document.activeElement),n=items[i<0?0:(i+dir+items.length)%items.length];n.focus({preventScroll:true});sound('menu-move');}
 function onKey(e){if(state==='off'||o.dialogOpen())return;e.stopImmediatePropagation();const k=e.key.toLowerCase();hints();if(state==='splash'){e.preventDefault();wake();return;}if(state==='waking'||leaving)return;
  if(['arrowup','w'].includes(k)){e.preventDefault();step(-1);}else if(['arrowdown','s'].includes(k)){e.preventDefault();step(1);}
  else if(['escape','backspace'].includes(k)){e.preventDefault();back();}else if(['enter',' ','e'].includes(k)){e.preventDefault();if(!e.repeat)document.activeElement?.closest?.('#title .ti-item')?.click();}}
 addEventListener('keydown',onKey,true);el.addEventListener('pointerdown',()=>{hints();if(state==='splash')wake();});addEventListener('resize',()=>{if(state!=='off')size();});
 // A controller: the d-pad or left stick moves (repeating while held), A chooses, B goes back; any button wakes the title.
 function pad(P,st){if(state==='off')return;hints();if(state==='splash'){if(Object.values(P).some(Boolean))wake();return;}if(state==='waking'||leaving)return;
  const y=st?.left?.y||0,now=performance.now();let dir=P.up?-1:P.down?1:0;if(!dir&&Math.abs(y)>.6&&now>stickAt){dir=y<0?-1:1;stickAt=now+(stickAt&&now-stickAt<300?140:320);}else if(Math.abs(y)<.3)stickAt=0;
  if(dir)step(dir);if(P.a)document.activeElement?.closest?.('#title .ti-item')?.click();if(P.b)back();}
 function open({splash=true}={}){if(state!=='off')return;opened=performance.now();leaving=false;el.hidden=false;el.className='ti-on'+(shown?' ti-ready':'');document.body.classList.add('titled');size();hints();cancelAnimationFrame(raf);last=0;raf=requestAnimationFrame(loop);
  if(splash){state='splash';menu.hidden=true;panel.hidden=true;}else{el.classList.add('ti-lit');showMenu();}}
 function close(){state='off';hush();el.classList.add('ti-gone');document.body.classList.remove('titled');setTimeout(()=>{if(state!=='off')return;el.hidden=true;el.className='';cancelAnimationFrame(raf);},900);}
 // The street behind is ready: the dark lifts off it.
 function ready(){shown=true;if(state!=='off')el.classList.add('ti-ready');}
 return {open,close,pad,ready,isOpen:()=>state!=='off',showcase:()=>state==='off'?null:{at:t=>cameraAt(t),extras:TITLE_PATH.extras},refresh:()=>{if(state==='menu')showMenu(document.activeElement?.dataset?.id);}};}
