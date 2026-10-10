// The first night in the house: whether you have woken up yet, and the guns you have found, with their rounds. Saved, so the
// tutorial picks up where you left it. The Light Pistol is in the bedroom nightstand, the Pump Shotgun in the hall closet lockbox.
import {GUNS} from '../study/equipment.js';
export const HOME_KEY='deadlight-home-v1';
// What each find holds: rounds loaded and spare rounds.
export const FINDS={'light-pistol':{at:'nightstand',ammo:15,reserve:15},'pump-shotgun':{at:'closet',ammo:8,reserve:16}};
const ORDER=Object.keys(FINDS);
export function normalizeHome(v){const guns={};for(const id of ORDER){const g=v?.guns?.[id];if(!g)continue;const cap=GUNS[id].mag,n=k=>Math.max(0,Math.floor(Number(g[k])||0));guns[id]={ammo:Math.min(cap,n('ammo')),reserve:n('reserve')};}
 const held=guns[v?.held]?v.held:ORDER.find(id=>guns[id])||null;return {woke:v?.woke===true,guns,held};}
export function readHome(storage){try{return normalizeHome(JSON.parse(storage.getItem(HOME_KEY)));}catch{return normalizeHome();}}
export function saveHome(storage,v){try{storage.setItem(HOME_KEY,JSON.stringify(normalizeHome(v)));return true;}catch{return false;}}
// Picking a gun up puts it in your hands.
export function take(k,id){if(!FINDS[id]||k.guns[id])return k;const f=FINDS[id];return normalizeHome({...k,guns:{...k.guns,[id]:{ammo:f.ammo,reserve:f.reserve}},held:id});}
export function swap(k){const have=ORDER.filter(id=>k.guns[id]);if(have.length<2)return k;return {...k,held:have[(have.indexOf(k.held)+1)%have.length]};}
export const found=(k,id)=>!!k.guns[id];
export function rounds(k,id=k.held){const g=k.guns[id];return g?`${g.ammo} / ${g.reserve}`:'';}
// What to do next, shown under the place name.
export function goal(k){if(!k.woke)return '';const p=found(k,'light-pistol'),s=found(k,'pump-shotgun');
 return !p&&!s?'Find something to protect yourself with':!s?'Get the shotgun from the hall closet':!p?'Get the pistol from the bedroom nightstand':'Leave by the front door';}
// What the nightstand, the closet and the front door say, and what using them does. act names what happens after the last line.
export function useLines(k,id){
 if(id==='nightstand')return found(k,'light-pistol')?{lines:['Just the paperback and a dead flashlight now.']}:
  {lines:['The top drawer sticks, like always.','Your Light Pistol is right where you left it. One magazine in it, and a spare.'],act:'take:light-pistol',verb:'Take'};
 if(id==='closet')return found(k,'pump-shotgun')?{lines:['The lockbox is empty now. The coats can stay.']}:
  {lines:['Coats, boxes of who-knows-what, and the vacuum nobody uses.','The lockbox is on the floor at the back. Your fingers still know the code.','The Pump Shotgun. Eight shells in the tube and a box of sixteen more.'],act:'take:pump-shotgun',verb:'Take'};
 if(id==='frontdoor'){const p=found(k,'light-pistol'),s=found(k,'pump-shotgun');
  if(!p&&!s)return {lines:['You put your hand on the lock and stop.','Not without something to protect yourself with.']};
  if(!p||!s)return {lines:['You put your hand on the lock.',!s?'The shotgun is still in the closet lockbox. Better take it too.':'The pistol is still in the bedroom nightstand. Better take it too.']};
  return {lines:['You check the lock, then the window beside it. The street is empty, and too quiet.','Outside is the next part of the tutorial. It is coming soon.']};}
 return null;}
// Once a gun is taken, the drawer and the closet are only worth a look.
export const verbFor=(k,id)=>(id==='nightstand'&&found(k,'light-pistol'))||(id==='closet'&&found(k,'pump-shotgun'))?'Look':null;
// The line that tells you what you just picked up.
export function pickupLine(id){const f=FINDS[id];return `${GUNS[id].name}: ${f.ammo} loaded, ${f.reserve} spare`;}
