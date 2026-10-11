// The control center: the phone held upright, the controls on a steel plate under the game (v0.50). This works out where every
// control sits from the screen's width and the player's own settings, puts each one there, and paints the plate to match.
// Rules it keeps: the left thumb only ever moves (the move stick, plus the screens you open while standing still: character, bag,
// map, menu); everything you need in a fight rings the fire stick under the right thumb; Use shows up in the game view above the
// right stick only when something is in reach; the camera zooms with a pinch on the game view.
// Positions are centres in deck pixels: x from the deck's left edge, y down from its top (negative is up in the game view).
import {paintPlate} from '../mc/assets/ui/plate.js';
export const CONSOLE_KEY='deadlight-console-v1';
// The colours a player can pick for the lit edges: [edge, glow].
export const ACCENTS={ember:['#dd6f2c','#ff9a52'],bone:['#a8a090','#efe8da'],toxic:['#6f9a2c','#b6e05a'],siren:['#2c6fdd','#7ab0ff'],blood:['#a3221a','#ff5a46']};
export const ACCENT_NAMES={ember:'Ember',bone:'Bone',toxic:'Toxic',siren:'Siren',blood:'Blood'};
export const DEFAULT_CONSOLE={scale:1,opacity:1,accent:'ember',hand:'right',moved:{}};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export function normalizeConsole(v){const o=v&&typeof v==='object'?v:{},moved={};
 for(const [id,m] of Object.entries(o.moved&&typeof o.moved==='object'?o.moved:{}))if(m&&Number.isFinite(m.dx)&&Number.isFinite(m.dy))moved[id]={dx:clamp(Math.round(m.dx),-500,500),dy:clamp(Math.round(m.dy),-500,500)};
 return {scale:clamp(Number(o.scale)||1,.8,1.3),opacity:clamp(Number(o.opacity)||1,.35,1),accent:ACCENTS[o.accent]?o.accent:'ember',hand:o.hand==='left'?'left':'right',moved};}
export function readConsole(storage){try{return normalizeConsole(JSON.parse(storage?.getItem(CONSOLE_KEY)||'null'));}catch{return normalizeConsole(null);}}
export function saveConsole(storage,s){try{storage?.setItem(CONSOLE_KEY,JSON.stringify(s));return true;}catch{return false;}}
// Which controls each kind of place has. fight: the street. range: the Training Grounds (no diving there). calm: camp and the house (Use takes the fire
// stick's place). zombie: the room as a zombie (moving, and Use for the stairs).
export const SLOTS={fight:['move','aim','dive','reload','run','grenade','weapon','act','inspect','bag','menu'],range:['move','aim','reload','run','grenade','weapon','act','inspect','bag','menu'],calm:['move','act','run','inspect','bag','menu'],zombie:['move','act','run','inspect','menu']};
// The controls a player can drag in the editor, and what they are called there.
export const NAMES={aim:'Fire stick',dive:'Dive',reload:'Reload',run:'Run',grenade:'Light / grenade',weapon:'Weapon · swap',act:'Use',inspect:'Character',bag:'Bag',menu:'Menu',move:'Move stick'};
// W: deck width. sl, sr: the safe insets. mode: fight, calm or zombie. set: the player's settings.
export function layout(W,{sl=14,sr=14,mode='fight',set=DEFAULT_CONSOLE}={}){
 // Bigger controls are capped so the move stick and the fire ring (313 units from edge to edge) still fit side by side.
 const k=Math.min(clamp(W/390,.86,1.12)*set.scale,(W-sl-sr-6)/313),U=Math.round(214*k),band=16,dk=U+band,ARC=100*k,deg=Math.PI/180;
 const F={x:W-sr-64*k,y:122*k},M={x:sl+68*k,y:110*k},items={},at=(a,s)=>({x:F.x+Math.cos(a*deg)*ARC,y:F.y+Math.sin(a*deg)*ARC,w:s,h:s,round:true});
 items.move={x:M.x,y:M.y,w:112*k,h:112*k,round:true};
 if(mode==='fight'||mode==='range'){items.aim={x:F.x,y:F.y,w:140*k,h:140*k,round:true,ring:116*k};
  // The ring round the fire stick, nearest first for the things you press most: Dive, Reload, then Run below and Light above.
  items.dive=at(172,52*k);items.reload=at(203,52*k);items.run=at(141,46*k);items.grenade=at(234,46*k);
  // The weapon readout, top right: tap it to swap guns.
  const x0=F.x-30*k;items.weapon={x:(x0+W-sr)/2,y:6+22*k,w:W-sr-x0,h:44*k};
  // Use, in the game view just above the right stick, only while something is in reach.
  const aw=Math.min(220,Math.round(W*.56));items.act={x:W-sr-aw/2,y:-36,w:aw,h:52,pill:true};}
 else{items.act={x:F.x,y:F.y-4*k,w:96*k,h:96*k,round:true};items.run=at(172,48*k);}
 // The screens you open standing still: bottom left.
 ['inspect','bag','menu'].filter(id=>SLOTS[mode].includes(id)).forEach((id,i)=>{items[id]={x:sl+20*k+i*46*k,y:U-22*k,w:40*k,h:40*k};});
 // The readouts along the top: status (or the place) on the left, the weapon (or camp stamina) on the right.
 // Without a weapon readout (camp, the house, the zombie) the two halves share the top: the place left, stamina and the goal right.
 const mid=Math.round(W*.46),status={x:sl,y:6,w:items.weapon?Math.max(80,F.x-84*k-sl):mid-6-sl,h:42*k},right=items.weapon||{x:(mid+W-sr)/2,y:6+22*k,w:W-sr-mid,h:44*k};
 for(const id of Object.keys(items))if(!SLOTS[mode].includes(id))delete items[id];
 // Left-handed: the whole deck mirrored.
 if(set.hand==='left'){for(const o of Object.values(items))o.x=W-o.x;status.x=W-status.x-status.w;if(right!==items.weapon)right.x=W-right.x;}
 for(const [id,m] of Object.entries(set.moved||{}))if(items[id]){items[id].x=clamp(items[id].x+m.dx,items[id].w/2,W-items[id].w/2);items[id].y=clamp(items[id].y+m.dy,id==='act'?-400:items[id].h/2,dk-items[id].h/2);}
 const mv=items.move,split=Math.round(set.hand==='left'?(mv.x-mv.w/2+(items.dive?items.dive.x+items.dive.w/2:W*.55))/2:(mv.x+mv.w/2+(items.dive?items.dive.x-items.dive.w/2:W*.45))/2);
 return {W,k,U,band,dk,split,mode,items,status,right,sl,sr};}
// The plate for a layout, in art pixels (half the deck's size): wells under the sticks, sockets under the buttons, glass behind the
// readouts, and the two names along the bottom.
export function plateFor(L,sb){const h=Math.ceil((L.dk+sb)/2),w=Math.ceil(L.W/2),it=L.items,wells=[],sockets=[],half=v=>Math.round(v/2);
 wells.push({x:half(it.move.x),y:half(it.move.y),r:half(it.move.w/2)+3});
 if(it.aim)wells.push({x:half(it.aim.x),y:half(it.aim.y),r:half(it.aim.ring/2)+3});
 for(const [id,o] of Object.entries(it))if(!['move','aim','weapon'].includes(id)&&!o.pill)sockets.push({x:half(o.x),y:half(o.y),r:half(o.w/2)+2});
 const insets=[L.status,L.right].map(r=>r.w?{x:half(r.x),y:half(r.y),w:half(r.w),h:half(r.h)}:null).filter(Boolean);
 // The weapon readout's rect is stored by its centre.
 if(it.weapon)insets[1]={x:half(it.weapon.x-it.weapon.w/2),y:half(it.weapon.y-it.weapon.h/2),w:half(it.weapon.w),h:half(it.weapon.h)};
 else if(L.right.w)insets[1]={x:half(L.right.x-L.right.w/2),y:half(L.right.y-L.right.h/2),w:half(L.right.w),h:half(L.right.h)};
 return {w,h,split:half(L.split),band:Math.ceil((L.band+sb)/2),wells,sockets,insets,names:{left:half(L.sl)+1,right:half(L.W-L.sr)-1,y:half(L.U)+Math.max(1,Math.floor((Math.ceil((L.band+sb)/2)-7)/2))}};}
// The element each control is.
export const ELEMENTS={move:'moveZone',aim:'aimZone',dive:'diveBtn',reload:'reload',run:'runToggle',grenade:'throwGrenade',weapon:'weaponHud',act:'act',inspect:'inspect',bag:'bagBtn',menu:'menu'};
// Puts a layout on the page: each control's centre and size as CSS variables (study/style.css places them), the deck's height and
// the readouts' boxes on the root, and the plate repainted when anything about it changed.
export function mountConsole(doc,{deck}){let plateKey='',cv=null,shown=false;
 const root=doc.documentElement.style,px=v=>Math.round(v)+'px';
 function apply(L,set,sb){shown=true;root.setProperty('--dk',px(L.dk));root.setProperty('--cc-split',px(L.split));
  root.setProperty('--st-x',px(L.status.x));root.setProperty('--st-y',px(L.status.y));root.setProperty('--st-w',px(L.status.w));root.setProperty('--st-h',px(L.status.h));
  const r=L.items.weapon||L.right;root.setProperty('--rt-x',px(r.x-r.w/2));root.setProperty('--rt-y',px(r.y-r.h/2));root.setProperty('--rt-w',px(r.w));root.setProperty('--rt-h',px(r.h));
  root.setProperty('--cc-op',String(set.opacity));const [a,g]=ACCENTS[set.accent];root.setProperty('--cc-accent',a);root.setProperty('--cc-glow',g);
  for(const [id,el] of Object.entries(ELEMENTS)){const e=doc.getElementById(el),o=L.items[id];if(!e)continue;if(!o||id==='move'){e.removeAttribute('data-cc');continue;}
   e.setAttribute('data-cc',id);e.toggleAttribute('data-up',o.y<0);for(const [k,v] of [['--cx',o.x],['--cy',o.y],['--cw',o.w],['--ch',o.h]])e.style.setProperty(k,px(v));}
  const m=L.items.move,left=m.x<L.W/2,zl=left?0:L.split,z=doc.getElementById('moveZone');
  root.setProperty('--zone-l',px(zl));root.setProperty('--zone-w',px(left?L.split:L.W-L.split));if(z){z.style.setProperty('--mx',px(m.x-zl));z.style.setProperty('--my',px(m.y));z.style.setProperty('--mw',px(m.w));}
  const P=plateFor(L,sb),key=JSON.stringify(P);if(key===plateKey)return;plateKey=key;
  if(!cv){cv=doc.createElement('canvas');cv.id='plate';cv.setAttribute('aria-hidden','true');deck.insertBefore(cv,deck.firstChild);}
  cv.width=P.w;cv.height=P.h;try{paintPlate(cv.getContext('2d'),P);}catch(e){console.error(e);}}
 function clear(){if(!shown)return;shown=false;for(const el of Object.values(ELEMENTS)){const e=doc.getElementById(el);e?.removeAttribute('data-cc');}}
 return {apply,clear};}
