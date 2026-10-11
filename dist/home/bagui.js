// The inventory screen: your pack's grid with everything in it, the two guns you have equipped, and how much you are carrying.
// Every cell is a button, so mouse, touch, keys and a controller all work the same way: pick an item, then pick where it goes
// (or drag it there). Items are drawn over the cells and let taps through to them.
import {GUNS,gunArt} from '../study/equipment.js';
import {painter} from '../mc/assets/core/paint.js';
import {itemArt,itemInfo,weightOf} from '../mc/assets/gear/items.js';
import {packArt} from '../mc/assets/characters/character.js';
import {dims,move,rotate,sort,unspill,canPlace,weight,burden,count} from './bag.js';
import {spare,ammoOf} from './kit.js';
const PX=32;// canvas pixels per cell: 16 units at 2 pixels a unit
const el=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text!=null)e.textContent=text;return e;};
const kg=n=>(Math.round(n*10)/10).toFixed(1);
// A gun drawn on a scratch canvas, trimmed to its pixels, then fitted into a w × h canvas at the largest whole scale.
function gunCanvas(id,w,h){const s=document.createElement('canvas');s.width=200;s.height=80;const g=s.getContext('2d',{willReadFrequently:true});g.save();g.translate(60,40);g.scale(2,2);gunArt(painter(g),id);g.restore();
 const d=g.getImageData(0,0,200,80).data;let x0=200,y0=80,x1=-1,y1=-1;for(let y=0;y<80;y++)for(let x=0;x<200;x++)if(d[(y*200+x)*4+3]>8){x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);}
 const c=document.createElement('canvas');c.width=w;c.height=h;if(x1<0)return c;const bw=x1-x0+1,bh=y1-y0+1,k=Math.max(1,Math.floor(Math.min((w-4)/bw,(h-4)/bh)*2)/2),o=c.getContext('2d');o.imageSmoothingEnabled=false;
 o.drawImage(s,x0,y0,bw,bh,Math.round((w-bw*k)/2),Math.round((h-bh*k)/2),Math.round(bw*k),Math.round(bh*k));return c;}
// An item's picture, upright, at its own shape; turned items are turned by CSS.
function itemCanvas(id){const info=itemInfo(id),[w,h]=info.shape;if(info.gun)return gunCanvas(info.gun,w*PX,h*PX);
 const c=document.createElement('canvas');c.width=w*PX;c.height=h*PX;const g=c.getContext('2d');g.save();g.scale(2,2);g.translate(w*8,h*8);itemArt(painter(g),id);g.restore();return c;}
const TIP_TAP=2600;// how long a tapped item's tip stays up, in ms
const KIND={gun:'Gun',ammo:'Ammunition',kit:'Gun care',material:'Crafting material'};
// What a tooltip says about an item: its name and kind, the description, then the facts. A gun says how many it holds and what it
// fires, and what is in it and in the bag now; ammo says how much of it you carry in all; everything says what it weighs.
export function tipOf(id,n,k){const info=itemInfo(id),lines=[];
 if(info.gun){const g=GUNS[info.gun],word=g.shells?'shells':ammoOf(info.gun)?'rounds':'rounds',left=spare(k,info.gun);
  lines.push(`Holds ${g.mag} ${word}`,g.pellets?`${g.pellets} pellets of ${g.damage} damage`:`${g.damage} damage a shot`,`${Math.round(60/g.interval)} shots a minute · reach ${Math.round(g.range/40)} m`);
  if(k.guns?.[info.gun])lines.push(`${k.guns[info.gun].ammo} loaded · ${left===Infinity?'never runs out':left+' '+word+' in the bag'}`);}
 else if(info.kind==='ammo')lines.push(`${count(k.bag,id)} in the bag in all`);
 lines.push(`${kg(weightOf(id,n||1))} kg${info.stack>1?` · stacks to ${info.stack}`:''}`);
 return {title:info.name+(n>1?' ×'+n:''),kind:KIND[info.kind]||'',body:info.description+'.',lines};}
export class BagScreen{
 // ctx: kit() and setKit(k) for the house save, grid() for the pack you wear, look() for its art, hold(id) to put a gun in your hands.
 constructor(dialog,ctx){Object.assign(this,{dialog,ctx,sel:null,focus:{x:0,y:0},drag:null,note:''});}
 // The screen's parts are found and wired the first time it opens.
 init(){if(this.ready)return;this.ready=true;const dialog=this.dialog,$=s=>dialog.querySelector(s);Object.assign(this,{gridEl:$('#bagGrid'),layer:$('#bagItems'),spillEl:$('#bagSpill'),detail:$('#bagDetail'),slots:$('#bagSlots'),
   nameEl:$('#bagName'),sizeEl:$('#bagSize'),kgEl:$('#bagKg'),fill:$('#bagKgFill'),burdenEl:$('#bagBurden'),icon:$('#bagPackIcon'),noteEl:$('#bagNote')});
  $('#bagSort').onclick=()=>this.sortAll();$('#bagRotate').onclick=()=>this.turn();
  this.gridEl.addEventListener('pointerdown',e=>this.down(e));this.gridEl.addEventListener('pointermove',e=>this.dragMove(e));
  for(const n of ['pointerup','pointercancel'])this.gridEl.addEventListener(n,e=>this.up(e));
  this.gridEl.addEventListener('keydown',e=>this.keys(e));
  // The tooltip follows the mouse over items and slots, the keys and the controller onto them, and a tap that picks one.
  this.tipEl=el('div','bag-tip');this.tipEl.setAttribute('role','tooltip');this.tipEl.hidden=true;dialog.append(this.tipEl);
  this.gridEl.addEventListener('pointermove',e=>{if(e.pointerType!=='mouse'||this.drag?.on)return;this.kbd=false;const c=e.target.closest?.('.bag-cell'),i=c?this.at(+c.dataset.x,+c.dataset.y):-1;if(i!==this.hover){this.hover=i;this.showTip();}});
  this.gridEl.addEventListener('pointerleave',()=>{this.hover=-1;this.showTip();});
  this.slots.addEventListener('pointerover',e=>{const b=e.target.closest?.('.bag-slot');this.slotHover=b&&!b.disabled?b:null;this.showTip();});
  this.slots.addEventListener('pointerleave',()=>{this.slotHover=null;this.showTip();});
  this.slots.addEventListener('focusin',e=>{this.slotHover=e.target.closest?.('.bag-slot:not(:disabled)')||null;this.showTip();});this.slots.addEventListener('focusout',()=>{this.slotHover=null;this.showTip();});}
 get kit(){return this.ctx.kit();}
 get bag(){return this.kit.bag;}
 setBag(bag){this.ctx.setKit({...this.kit,bag});}
 open(){this.init();this.sel=null;this.note='';this.hover=-1;this.slotHover=null;this.kbd=false;this.paint(true);this.cellAt(this.focus.x,this.focus.y)?.focus({preventScroll:true});}
 // The item covering a cell, as its index in the bag.
 at(x,y){return this.bag.items.findIndex(o=>{const [w,h]=dims(o);return x>=o.x&&x<o.x+w&&y>=o.y&&y<o.y+h;});}
 cellAt(x,y){return this.gridEl.querySelector(`[data-x="${x}"][data-y="${y}"]`);}
 say(t){this.note=t;if(this.noteEl){this.noteEl.textContent=t;this.noteEl.hidden=!t;}}
 // Picking: tap an item to pick it, tap a free cell to put it there, tap it again to let go.
 tap(x,y){const i=this.at(x,y),s=this.sel;this.say('');
  if(s?.spill!=null){if(i<0){const next=unspill(this.bag,this.ctx.grid(),s.spill,x,y,0);if(next!==this.bag){this.setBag(next);this.sel={item:next.items.length-1};}else this.say('That doesn\'t fit there.');}else this.sel={item:i};this.paint();return;}
  if(s?.item!=null){if(i===s.item){this.sel=null;this.paint();return;}if(i>=0){this.sel={item:i};this.paint();return;}
   const next=move(this.bag,this.ctx.grid(),s.item,x,y);if(next===this.bag)this.say('That doesn\'t fit there.');else this.setBag(next);this.paint();return;}
  if(i>=0){this.sel={item:i};this.paint();}}
 turn(){const i=this.sel?.item;if(i==null)return;const it=this.bag.items[i],[w,h]=itemInfo(it.id).shape;if(w===h)return;const next=rotate(this.bag,this.ctx.grid(),i);
  if(next===this.bag){this.say('No room to turn it.');return;}// rotate may move the item to the end of the list
  const k=next.items.findIndex(o=>o.id===it.id&&o.n===it.n&&o.r!==it.r);this.setBag(next);this.sel=k>=0?{item:k}:null;this.paint();}
 sortAll(){this.setBag(sort(this.bag,this.ctx.grid()));this.sel=null;this.say('Packed tight.');this.paint();}
 // Dragging an item: it follows the pointer, and the cells it would land on light up, green if it fits there.
 cellFrom(e){const r=this.gridEl.getBoundingClientRect(),g=this.ctx.grid();return {x:(e.clientX-r.left)/(r.width/g.cols),y:(e.clientY-r.top)/(r.height/g.rows),cw:r.width/g.cols};}
 down(e){const c=e.target.closest?.('.bag-cell');if(!c)return;const x=+c.dataset.x,y=+c.dataset.y,i=this.at(x,y);if(i<0)return;const it=this.bag.items[i],p=this.cellFrom(e);
  this.drag={i,id:e.pointerId,sx:e.clientX,sy:e.clientY,ox:p.x-it.x,oy:p.y-it.y,on:false};}
 dragMove(e){const d=this.drag;if(!d||e.pointerId!==d.id)return;if(!d.on&&Math.hypot(e.clientX-d.sx,e.clientY-d.sy)<8)return;
  if(!d.on){d.on=true;try{this.gridEl.setPointerCapture(e.pointerId);}catch{}this.sel={item:d.i};this.paint();this.tipEl.hidden=true;}e.preventDefault();
  const p=this.cellFrom(e),it=this.bag.items[d.i],x=Math.round(p.x-d.ox),y=Math.round(p.y-d.oy);d.x=x;d.y=y;
  const ok=canPlace(this.bag,this.ctx.grid(),it,x,y,it.r,d.i),[w,h]=dims(it);this.ghost.style.display='block';
  this.ghost.style.setProperty('--x',x);this.ghost.style.setProperty('--y',y);this.ghost.style.setProperty('--w',w);this.ghost.style.setProperty('--h',h);this.ghost.classList.toggle('bad',!ok);
  const node=this.layer.children[d.i];if(node){node.classList.add('lifted');node.style.transform=`translate(${e.clientX-d.sx}px,${e.clientY-d.sy}px)`;}}
 up(e){const d=this.drag;if(!d||e.pointerId!==d.id)return;this.drag=null;this.ghost.style.display='none';
  if(!d.on)return;// a tap: the cell's click handles it
  const next=move(this.bag,this.ctx.grid(),d.i,d.x,d.y);if(next===this.bag&&(d.x!==this.bag.items[d.i].x||d.y!==this.bag.items[d.i].y))this.say('That doesn\'t fit there.');else this.setBag(next);
  this.dragged=performance.now();this.paint();}
 // Arrow keys and the D-pad move between cells; Enter or A picks and places; R or Y turns; Esc or B lets go, then closes.
 step(dx,dy){this.kbd=true;const g=this.ctx.grid();this.focus={x:(this.focus.x+dx+g.cols)%g.cols,y:(this.focus.y+dy+g.rows)%g.rows};this.cellAt(this.focus.x,this.focus.y)?.focus({preventScroll:true});this.paintFocus();this.showTip();}
 keys(e){const k=e.key.toLowerCase(),d={arrowleft:[-1,0],arrowright:[1,0],arrowup:[0,-1],arrowdown:[0,1]}[k];if(d){e.preventDefault();e.stopPropagation();this.step(...d);return;}
  if(k==='r'){e.preventDefault();this.turn();}}
 // Returns true when the controller press was used here (B with nothing picked closes the screen instead).
 pad(P){if(P.up)this.step(0,-1);else if(P.down)this.step(0,1);else if(P.left)this.step(-1,0);else if(P.right)this.step(1,0);
  if(P.a)this.tap(this.focus.x,this.focus.y);if(P.y)this.turn();if(P.x)this.sortAll();if(P.b){if(this.sel){this.sel=null;this.say('');this.paint();}else return false;}return true;}
 // Esc lets go of a picked item first; returns true if it did.
 cancel(){if(!this.sel)return false;this.sel=null;this.say('');this.paint();return true;}
 paintFocus(){for(const c of this.gridEl.querySelectorAll('.bag-cell'))c.classList.toggle('focus',+c.dataset.x===this.focus.x&&+c.dataset.y===this.focus.y);}
 paint(full){const g=this.ctx.grid(),bag=this.bag,k=this.kit;this.dialog.style.setProperty('--cols',g.cols);this.dialog.style.setProperty('--rows',g.rows);
  if(this.focus.x>=g.cols||this.focus.y>=g.rows)this.focus={x:0,y:0};
  // The pack: its picture, name, size and grid.
  this.nameEl.textContent=g.name;this.sizeEl.textContent=`${g.size==='None'?'No pack':g.size+' pack'} · ${g.cols} × ${g.rows} grid`;
  const ic=this.icon.getContext('2d');ic.clearRect(0,0,80,80);if(g.pack!==1){ic.save();ic.scale(2,2);ic.translate(20,56);packArt(ic,{...this.ctx.look(),pack:g.pack});ic.restore();}
  // The cells, rebuilt only when the grid size changes.
  if(full||this.gridEl.dataset.size!==g.cols+'x'+g.rows){this.gridEl.dataset.size=g.cols+'x'+g.rows;this.gridEl.replaceChildren();
   for(let y=0;y<g.rows;y++)for(let x=0;x<g.cols;x++){const c=el('button','bag-cell');c.type='button';c.dataset.x=x;c.dataset.y=y;c.tabIndex=x===this.focus.x&&y===this.focus.y?0:-1;
    c.onclick=()=>{if(performance.now()-(this.dragged||0)<250)return;this.focus={x,y};this.tap(x,y);this.paintFocus();};c.onfocus=()=>{this.focus={x,y};this.paintFocus();};this.gridEl.append(c);}
   this.ghost=el('i','bag-ghost');this.gridEl.append(this.ghost);}
  for(const c of this.gridEl.querySelectorAll('.bag-cell')){const i=this.at(+c.dataset.x,+c.dataset.y),it=bag.items[i];c.setAttribute('aria-label',it?`${itemInfo(it.id).name}${it.n>1?', '+it.n:''}`:`Empty, column ${+c.dataset.x+1}, row ${+c.dataset.y+1}`);
   c.classList.toggle('full',i>=0);c.classList.toggle('picked',i>=0&&i===this.sel?.item);}
  this.paintFocus();
  // The items over the cells.
  this.layer.replaceChildren(...bag.items.map((o,i)=>{const info=itemInfo(o.id),[w,h]=dims(o),n=el('div','bag-item'+(i===this.sel?.item?' picked':'')+(o.r?' turned':''));
   for(const [p,v] of Object.entries({x:o.x,y:o.y,w,h,iw:info.shape[0],ih:info.shape[1]}))n.style.setProperty('--'+p,v);
   const c=itemCanvas(o.id);c.setAttribute('aria-hidden','true');n.append(c);if(info.stack>1)n.append(el('b','bag-count',o.n));return n;}));
  // What does not fit in this pack.
  this.spillEl.hidden=!bag.spill.length;const list=this.spillEl.querySelector('.bag-spill-list');
  list.replaceChildren(...bag.spill.map((o,j)=>{const b=el('button','bag-spill-item'+(j===this.sel?.spill?' picked':''));b.type='button';b.append(itemCanvas(o.id),el('span',null,`${itemInfo(o.id).name} ×${o.n}`));
   b.onclick=()=>{this.sel=j===this.sel?.spill?null:{spill:j};this.say(this.sel?'Pick a free cell for it.':'');this.paint();};return b;}));
  // The two equipped guns.
  const slot=(kind,label)=>{const id=Object.keys(k.guns).find(g=>(kind==='secondary')===!GUNS[g].rifle),b=el('button','bag-slot'+(id&&id===k.held?' held':''));b.type='button';b.dataset.slot=kind;if(id)b.dataset.gun=id;
   b.append(el('span','bag-slot-kind',label));if(id){b.append(gunCanvas(id,kind==='primary'?192:96,48));const s=spare(k,id);
    b.append(el('b',null,GUNS[id].name),el('span','bag-slot-ammo',`${k.guns[id].ammo} loaded · ${s===Infinity?'unlimited spare':s+' '+(ammoOf(id)==='shells'?'shells':'rounds')+' in the bag'}`));
    if(id===k.held)b.append(el('em',null,'In your hands'));b.onclick=()=>{this.ctx.hold(id);this.paint();};}
   else{b.disabled=true;b.append(el('b',null,'Empty'),el('span','bag-slot-ammo',kind==='primary'?'A shotgun or a rifle':'A pistol'));}return b;};
  this.slots.replaceChildren(slot('primary','Primary'),slot('secondary','Secondary'));
  // The weight: the bag, anything waiting to fit, and both guns.
  const guns=Object.keys(k.guns),w=weight(bag,guns),b=burden(w,g.kg);this.kgEl.textContent=`${kg(w)} / ${g.kg} kg`;this.fill.style.width=Math.min(100,w/g.kg*100)+'%';
  this.fill.parentElement.classList.toggle('over',b.over);this.burdenEl.hidden=!b.over;
  // The picked item.
  const s=this.sel,it=s?.item!=null?bag.items[s.item]:s?.spill!=null?bag.spill[s.spill]:null;this.detail.classList.toggle('empty',!it);
  const info=it&&itemInfo(it.id);this.detail.querySelector('h2').textContent=info?info.name+(it.n>1?' ×'+it.n:''):'Your bag';
  this.detail.querySelector('p').textContent=info?`${info.description}. ${kg(weightOf(it.id,it.n))} kg${info.stack>1?`, up to ${info.stack} in one place`:''}.`:'Tap an item to pick it up, then tap where it should go. You can drag it too.';
  const [iw,ih]=info?.shape||[1,1];this.dialog.querySelector('#bagRotate').disabled=s?.item==null||iw===ih;
  this.say(this.note);this.showTip();}
 // Which item the tooltip is about: the slot under the mouse, the item being dragged hides it, then the picked item, the one under
 // the mouse, or the one the keys are on. It sits over the item, or under it when there is no room above.
 showTip(){const t=this.tipEl;if(!t||this.drag?.on){if(t)t.hidden=true;return;}const bag=this.bag,s=this.sel;let it=null,node=null;
  // A tip from a tap fades after a moment, so it never sits over the cells you are about to tap; hover and the keys keep theirs.
  const pk=s?(s.item??'s'+s.spill):null;if(pk!==this.pickKey){this.pickKey=pk;clearTimeout(this.tipT);this.hush=null;if(pk!=null)this.tipT=setTimeout(()=>{this.hush=pk;this.showTip();},TIP_TAP);}
  const quiet=pk!=null&&this.hush===pk&&!(this.hover>=0)&&!this.kbd;
  if(this.slotHover?.dataset.gun){it={id:'gun:'+this.slotHover.dataset.gun,n:1};node=this.slotHover;}
  else if(quiet){t.hidden=true;return;}
  else if(s?.spill!=null){it=bag.spill[s.spill];node=this.spillEl.querySelectorAll('.bag-spill-item')[s.spill];}
  else{const i=(this.hover>=0?this.hover:null)??s?.item??(this.kbd?this.at(this.focus.x,this.focus.y):-1);if(i>=0){it=bag.items[i];node=this.layer.children[i];}}
  if(!it||!node){t.hidden=true;return;}
  const T=tipOf(it.id,it.n,this.kit),key=JSON.stringify(T);if(key!==this.tipKey){this.tipKey=key;t.replaceChildren(el('b',null,T.title),...(T.kind?[el('span','bag-tip-kind',T.kind)]:[]),el('p',null,T.body),...T.lines.map(l=>el('span','bag-tip-line',l)));}
  t.hidden=false;const d=this.dialog.getBoundingClientRect(),r=node.getBoundingClientRect(),w=t.offsetWidth,h=t.offsetHeight,sx=this.dialog.scrollLeft,sy=this.dialog.scrollTop;
  const left=Math.max(8,Math.min(d.width-w-8,r.left-d.left+r.width/2-w/2)),above=r.top-d.top-h-8,top=above>=8?above:r.bottom-d.top+8;
  t.style.left=Math.round(left+sx)+'px';t.style.top=Math.round(top+sy)+'px';t.classList.toggle('below',above<8);}
}
