// The first night in the house: whether you have woken up yet, the guns you have found with the rounds in them, what is in your
// bag, and which spots you have already searched. Saved, so the tutorial picks up where you left it. The Light Pistol is in the
// bedroom nightstand, the Pump Shotgun in the hall closet lockbox; the kitchen, the sink and the laundry hold supplies.
import {GUNS,unlimited} from '../study/equipment.js';
import {itemInfo} from '../mc/assets/gear/items.js';
import {carrying} from '../mc/assets/gear/bags.js';
import {add,count,normalizeBag} from './bag.js';
export const HOME_KEY='deadlight-home-v1';
// What each find holds: rounds loaded, and what goes into the bag with it. A pistol is a secondary, so its spare rounds never run
// out; the shotgun is a primary and only has the shells in your bag.
export const FINDS={'light-pistol':{at:'nightstand',ammo:15,bag:[]},'pump-shotgun':{at:'closet',ammo:8,bag:[['shells',16],['gun-oil',1]]}};
// Supplies in the house, found by searching. Nothing here is needed to leave; it is what a careful person takes.
export const SUPPLIES={counter:[['scrap',3],['electronics',1]],sink:[['solvent',1]],laundry:[['cloth',2]]};
const ORDER=Object.keys(FINDS);
// Which ammo a gun uses from the bag, or null for a pistol (unlimited).
export const ammoOf=id=>unlimited(id)?null:GUNS[id]?.shells?'shells':'rounds';
export function normalizeHome(v,grid=carrying({})){const guns={};for(const id of ORDER){const g=v?.guns?.[id];if(!g)continue;guns[id]={ammo:Math.min(GUNS[id].mag,Math.max(0,Math.floor(Number(g.ammo)||0)))};}
 const held=guns[v?.held]?v.held:ORDER.find(id=>guns[id])||null,searched=[...new Set((Array.isArray(v?.searched)?v.searched:[]).filter(id=>SUPPLIES[id]))];
 let bag=normalizeBag(v?.bag,grid);
 // Saves from before the bag kept the shotgun's spare shells on the gun; they move into the bag.
 if(!v?.bag&&guns['pump-shotgun'])bag=add(bag,grid,'shells',Math.max(0,Math.floor(Number(v.guns['pump-shotgun'].reserve)||0)));
 return {woke:v?.woke===true,guns,held,bag,searched};}
export function readHome(storage,grid){try{return normalizeHome(JSON.parse(storage.getItem(HOME_KEY)),grid);}catch{return normalizeHome(null,grid);}}
export function saveHome(storage,v){try{storage.setItem(HOME_KEY,JSON.stringify(v));return true;}catch{return false;}}
const pack=(k,grid,list)=>list.reduce((b,[id,n])=>add(b,grid,id,n),k.bag);
// Picking a gun up puts it in your hands, and what came with it in your bag.
export function take(k,id,grid=carrying({})){if(!FINDS[id]||k.guns[id])return k;const f=FINDS[id];return {...k,guns:{...k.guns,[id]:{ammo:f.ammo}},held:id,bag:pack(k,grid,f.bag)};}
// Searching a spot puts its supplies in your bag.
export function search(k,id,grid=carrying({})){if(!SUPPLIES[id]||k.searched.includes(id))return k;return {...k,bag:pack(k,grid,SUPPLIES[id]),searched:[...k.searched,id]};}
export function swap(k){const have=ORDER.filter(id=>k.guns[id]);if(have.length<2)return k;return {...k,held:have[(have.indexOf(k.held)+1)%have.length]};}
export const found=(k,id)=>!!k.guns[id];
// Spare rounds for a gun: unlimited for a pistol, otherwise what is in the bag.
export const spare=(k,id)=>ammoOf(id)?count(k.bag,ammoOf(id)):Infinity;
export function rounds(k,id=k.held){const g=k.guns[id];if(!g)return '';const s=spare(k,id);return `${g.ammo} / ${s===Infinity?'∞':s}`;}
// What to do next, shown under the place name.
export function goal(k){if(!k.woke)return '';const p=found(k,'light-pistol'),s=found(k,'pump-shotgun');
 return !p&&!s?'Find something to protect yourself with':!s?'Get the shotgun from the hall closet':!p?'Get the pistol from the bedroom nightstand':'Leave by the front door';}
// What the nightstand, the closet, the searchable spots and the front door say, and what using them does. act names what
// happens after the last line.
const SEARCH_LINES={counter:['The junk drawer. Takeout menus, rubber bands and a lot of screws.','A handful of hinges and brackets, and the old phone with the cracked screen. Parts are parts now.'],
 sink:['Dish soap, sponges and a mousetrap nobody set.','At the back, the can of degreaser you bought for the bike and never used.'],
 laundry:['Clean, folded, and never put away.','A couple of old flannel shirts. They will make good rags, or patches.']};
export function useLines(k,id){
 if(id==='nightstand')return found(k,'light-pistol')?{lines:['Just the paperback and a dead flashlight now.']}:
  {lines:['The top drawer sticks, like always.','Your Light Pistol is right where you left it, loaded, with the spare magazines you always keep topped up.'],act:'take:light-pistol',verb:'Take'};
 if(id==='closet')return found(k,'pump-shotgun')?{lines:['The lockbox is empty now. The coats can stay.']}:
  {lines:['Coats, boxes of who-knows-what, and the vacuum nobody uses.','The lockbox is on the floor at the back. Your fingers still know the code.','The Pump Shotgun. Eight shells in the tube, a box of sixteen more, and the little bottle of gun oil.'],act:'take:pump-shotgun',verb:'Take'};
 if(SUPPLIES[id])return k.searched.includes(id)?{lines:['Nothing else worth taking.']}:{lines:SEARCH_LINES[id],act:'search:'+id,verb:'Take'};
 if(id==='frontdoor'){const p=found(k,'light-pistol'),s=found(k,'pump-shotgun');
  if(!p&&!s)return {lines:['You put your hand on the lock and stop.','Not without something to protect yourself with.']};
  if(!p||!s)return {lines:['You put your hand on the lock.',!s?'The shotgun is still in the closet lockbox. Better take it too.':'The pistol is still in the bedroom nightstand. Better take it too.']};
  return {lines:['You check the lock, then the window beside it. The street is empty, and too quiet.','Outside is the next part of the tutorial. It is coming soon.']};}
 return null;}
// Once something is taken, the spot is only worth a look.
export const verbFor=(k,id)=>(id==='nightstand'&&found(k,'light-pistol'))||(id==='closet'&&found(k,'pump-shotgun'))||(SUPPLIES[id]&&k.searched.includes(id))?'Look':null;
// The line that tells you what you just picked up.
const listOf=list=>list.map(([id,n])=>(n>1?n+' ':'')+itemInfo(id).name.toLowerCase()).join(', ');
export function pickupLine(id){const f=FINDS[id];if(f)return `${GUNS[id].name}: ${f.ammo} loaded${ammoOf(id)?'':', unlimited spare'}${f.bag.length?'. In your bag: '+listOf(f.bag):''}`;
 return SUPPLIES[id]?'In your bag: '+listOf(SUPPLIES[id]):'';}
