// The control center editor (v0.50): the game stops, every control gets a labelled frame over the deck, and the player drags them
// where their thumbs want them. A panel along the top changes size, see-through, the glow colour and the hand, or resets it all.
// Changes show at once and are saved when the editor closes. Frames that overlap another turn red so a bad spot is easy to see.
import {ACCENTS,ACCENT_NAMES,DEFAULT_CONSOLE,NAMES,layout,normalizeConsole} from './console.js';
// ctl: get() the settings, set(s) to show them (relaid out at once), done(s) to close and save, view() the deck's
// rect and current layout {rect, L}.
export function mountEditor(doc,ctl){
 const $=id=>doc.getElementById(id),root=$('ccEdit'),frames=root.querySelector('.cc-frames');let s=null,drag=null,raf=0;
 // The glow swatches, one per accent.
 $('ccAccents').innerHTML=Object.keys(ACCENTS).map(k=>`<button type="button" data-accent="${k}" aria-label="${ACCENT_NAMES[k]}" style="--sw:${ACCENTS[k][0]};--sg:${ACCENTS[k][1]}"></button>`).join('');
 const pct=v=>Math.round(v*100)+'%';
 function paintPanel(){$('ccSize').value=String(Math.round(s.scale*100));$('ccSizeOut').textContent=pct(s.scale);
  $('ccOp').value=String(Math.round((1-s.opacity)*100));$('ccOpOut').textContent=pct(1-s.opacity);
  for(const b of $('ccAccents').children)b.setAttribute('aria-pressed',String(b.dataset.accent===s.accent));
  $('ccHand').setAttribute('aria-pressed',String(s.hand==='left'));$('ccHand').textContent='Left-handed: '+(s.hand==='left'?'On':'Off');}
 // A frame per control, in screen pixels from the deck's corner; Use's frame sits in the game view above the deck.
 function paintFrames(){const {rect,L}=ctl.view();if(!L){frames.innerHTML='';return;}const it=Object.entries(L.items),boxes=it.map(([id,o])=>[id,o,{x0:o.x-o.w/2,x1:o.x+o.w/2,y0:o.y-o.h/2,y1:o.y+o.h/2}]);
  const hit=(a,b)=>{if(a[1].round&&b[1].round)return Math.hypot(a[1].x-b[1].x,a[1].y-b[1].y)<(a[1].w+b[1].w)/2-2;const p=a[2],q=b[2];return p.x0<q.x1-2&&q.x0<p.x1-2&&p.y0<q.y1-2&&q.y0<p.y1-2;};
  if(frames.children.length!==it.length)frames.innerHTML=it.map(([id])=>`<div class="cc-frame" data-id="${id}"><span>${NAMES[id]||id}</span></div>`).join('');
  boxes.forEach(([id,o],i)=>{const f=frames.querySelector(`[data-id="${id}"]`)||frames.children[i];if(f.dataset.id!==id){f.dataset.id=id;f.firstChild.textContent=NAMES[id]||id;}
   Object.assign(f.style,{left:rect.left+o.x-o.w/2+'px',top:rect.top+o.y-o.h/2+'px',width:o.w+'px',height:o.h+'px'});f.style.setProperty('--fw',o.w+'px');
   f.classList.toggle('round',!!o.round);f.classList.toggle('held',drag?.id===id);f.classList.toggle('clash',boxes.some((b,j)=>j!==i&&hit(boxes[i],b)));});}
 function show(next){s=normalizeConsole(next);ctl.set(s);paintPanel();cancelAnimationFrame(raf);raf=requestAnimationFrame(paintFrames);}
 // Dragging: the offset is kept as far as the control really went, so dragging back never has a dead zone at the deck's edge.
 frames.addEventListener('pointerdown',e=>{const f=e.target.closest('.cc-frame');if(!f)return;e.preventDefault();f.setPointerCapture(e.pointerId);
  const id=f.dataset.id,m=s.moved[id]||{dx:0,dy:0};drag={id,pid:e.pointerId,x:e.clientX,y:e.clientY,dx:m.dx,dy:m.dy};paintFrames();});
 frames.addEventListener('pointermove',e=>{if(!drag||e.pointerId!==drag.pid)return;const d=drag;
  show({...s,moved:{...s.moved,[d.id]:{dx:d.dx+e.clientX-d.x,dy:d.dy+e.clientY-d.y}}});});
 const drop=e=>{if(!drag||e.pointerId!==drag.pid)return;const {L}=ctl.view(),id=drag.id;drag=null;
  if(L){const home=layout(L.W,{sl:L.sl,sr:L.sr,mode:L.mode,set:{...s,moved:{}}}).items[id],o=L.items[id];
   const dx=Math.round(o.x-home.x),dy=Math.round(o.y-home.y),moved={...s.moved};if(Math.abs(dx)<2&&Math.abs(dy)<2)delete moved[id];else moved[id]={dx,dy};s={...s,moved};}
  show(s);};
 frames.addEventListener('pointerup',drop);frames.addEventListener('pointercancel',drop);
 $('ccSize').addEventListener('input',e=>show({...s,scale:Number(e.target.value)/100}));
 $('ccOp').addEventListener('input',e=>show({...s,opacity:1-Number(e.target.value)/100}));
 $('ccAccents').addEventListener('click',e=>{const b=e.target.closest('[data-accent]');if(b)show({...s,accent:b.dataset.accent});});
 // Switching hands mirrors the moves too, so a custom spot stays under the same finger.
 $('ccHand').addEventListener('click',()=>show({...s,hand:s.hand==='left'?'right':'left',moved:Object.fromEntries(Object.entries(s.moved).map(([id,m])=>[id,{dx:-m.dx,dy:m.dy}]))}));
 $('ccReset').addEventListener('click',()=>show({...DEFAULT_CONSOLE,moved:{}}));
 const close=()=>{if(root.hidden)return;root.hidden=true;doc.body.classList.remove('cc-editing');drag=null;ctl.done(s);};
 $('ccDone').addEventListener('click',close);
 doc.addEventListener('keydown',e=>{if(!root.hidden&&e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();close();}},true);
 return {open(){root.hidden=false;doc.body.classList.add('cc-editing');show(ctl.get());},close,isOpen:()=>!root.hidden,refresh(){if(!root.hidden){cancelAnimationFrame(raf);raf=requestAnimationFrame(paintFrames);}}};}
