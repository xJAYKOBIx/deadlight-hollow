// The first night in the house: whether you have woken up yet, the guns you have found with the rounds in them, what is in your
// bag, which spots you have already searched, and how far the fight out on the street has got. Saved, but while the tutorial is
// being built every visit starts fresh on the couch (FRESH), so each test plays it from the very beginning. The Light Pistol is in the
// bedroom nightstand, the Pump Shotgun in the hall closet lockbox; the kitchen, the sink and the laundry hold supplies.
import {GUNS,unlimited} from '../study/equipment.js';
import {itemInfo} from '../mc/assets/gear/items.js';
import {carrying} from '../mc/assets/gear/bags.js';
import {add,count,normalizeBag} from './bag.js';
import {rng} from '../mc/assets/core/kit.js';
export const HOME_KEY='deadlight-home-v1';
// While the tutorial is being built, the saved night is ignored on load: you wake on the couch with nothing, every time.
export const FRESH=true;
// The street outside: the crash, then the first fight. start: the cop at the cruiser; cleared: the first three are down and the
// trunk waits; looted: you took what was in it and more are coming; done: the street is quiet.
export const STREET_STAGES=['start','cleared','looted','done'];
// The cruiser's trunk: a box of shells and a carton of rifle rounds, for a rifle you do not have yet.
// The first job, once the street is quiet: three things to do anywhere in town, in any order, then the truck out. done lists the
// ones finished; out is true once you are on the truck.
export const JOBS=['radio','power','supplies'];
// What the survivor's go-bag holds.
export const GO_BAG=[['shells',12],['cloth',2],['gun-oil',1],['powder',2]];
// Finishing a job, and getting on the truck.
export function job(k,id,grid=carrying({})){if(!JOBS.includes(id)||k.mission.done.includes(id))return k;return {...k,bag:id==='supplies'?pack(k,grid,GO_BAG):k.bag,mission:{...k.mission,done:[...k.mission.done,id]}};}
export const jobsDone=k=>JOBS.every(id=>k.mission?.done.includes(id));
export const board=k=>({...k,mission:{...k.mission,out:true}});
export const TRUNK=[['shells',12],['rounds',30]];
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
 const street=STREET_STAGES.includes(v?.street)?v.street:'start',looted=[...new Set((Array.isArray(v?.looted)?v.looted:[]).filter(id=>typeof id==='string'))];
 const mission={done:[...new Set((Array.isArray(v?.mission?.done)?v.mission.done:[]).filter(id=>JOBS.includes(id)))],out:v?.mission?.out===true};
 return {woke:v?.woke===true,guns,held,bag,searched,street,looted,mission};}
export function readHome(storage,grid,fresh=FRESH){if(fresh)return normalizeHome(null,grid);try{return normalizeHome(JSON.parse(storage.getItem(HOME_KEY)),grid);}catch{return normalizeHome(null,grid);}}
export function saveHome(storage,v){try{storage.setItem(HOME_KEY,JSON.stringify(v));return true;}catch{return false;}}
const pack=(k,grid,list)=>list.reduce((b,[id,n])=>add(b,grid,id,n),k.bag);
// Picking a gun up puts it in your hands, and what came with it in your bag.
export function take(k,id,grid=carrying({})){if(!FINDS[id]||k.guns[id])return k;const f=FINDS[id];return {...k,guns:{...k.guns,[id]:{ammo:f.ammo}},held:id,bag:pack(k,grid,f.bag)};}
// Searching a spot puts its supplies in your bag.
export function search(k,id,grid=carrying({})){if(!SUPPLIES[id]||k.searched.includes(id))return k;return {...k,bag:pack(k,grid,SUPPLIES[id]),searched:[...k.searched,id]};}
// Opening the cruiser's trunk puts its boxes in your bag.
export function loot(k,grid=carrying({})){if(k.street!=='cleared')return k;return {...k,bag:pack(k,grid,TRUNK),street:'looted'};}
// Scavenging out on the street: what each kind of spot can hold, as [item, chance, least, most]. A stash someone left is the big
// one. What is in a spot comes from its id, so the neighbourhood holds the same things every night; one car in eight has its alarm
// set, and opening it sets it off.
export const LOOT={car:[['shells',.45,2,4],['scrap',.6,1,2],['electronics',.3,1,1],['gun-oil',.1,1,1],['cloth',.25,1,1]],
 bin:[['scrap',.45,1,1],['cloth',.4,1,2],['shells',.12,1,2]],
 shed:[['scrap',.8,2,3],['powder',.4,1,2],['solvent',.35,1,1],['shells',.25,2,4]],
 house:[['shells',.5,3,6],['cloth',.6,1,2],['electronics',.35,1,1],['powder',.2,1,1],['solvent',.2,1,1],['gun-oil',.15,1,1]],
 cache:[['shells',1,10,14],['powder',1,2,3],['scrap',1,2,3],['gun-oil',.5,1,1]]};
export const ALARM=.125;
const seedOf=id=>[...id].reduce((h,c)=>Math.imul(h^c.charCodeAt(0),16777619)>>>0,2166136261);
export function lootOf(t){const R=rng(seedOf(t.id));return (LOOT[t.loot]||[]).map(([id,p,a,b])=>{const hit=R()<p,n=a+Math.floor(R()*(b-a+1));return hit?[id,n]:null;}).filter(Boolean);}
export const alarmed=t=>t.loot==='car'&&rng(seedOf(t.id)+7)()<ALARM;
export function scavenge(k,t,grid=carrying({})){if(!LOOT[t.loot]||k.looted.includes(t.id))return {k,items:[]};const items=lootOf(t);return {k:{...k,bag:pack(k,grid,items),looted:[...k.looted,t.id]},items};}
// What the dead sometimes drop: the cop its shells, a worker a bit of scrap, anyone else a few shells or a rag.
export const DROPS={cop:[['shells',.7,2,4]],brute:[['shells',1,4,8]],worker:[['scrap',.4,1,2],['shells',.15,1,2]],any:[['shells',.2,1,3],['cloth',.12,1,1]]};
// A list of what you found, for a line on screen.
export const listOf=list=>list.map(([id,n])=>(n>1?n+' ':'')+itemInfo(id).name.toLowerCase()).join(', ');
export const advance=(k,stage)=>STREET_STAGES.indexOf(stage)>STREET_STAGES.indexOf(k.street)?{...k,street:stage}:k;
export function swap(k){const have=ORDER.filter(id=>k.guns[id]);if(have.length<2)return k;return {...k,held:have[(have.indexOf(k.held)+1)%have.length]};}
export const found=(k,id)=>!!k.guns[id];
// Spare rounds for a gun: unlimited for a pistol, otherwise what is in the bag.
export const spare=(k,id)=>ammoOf(id)?count(k.bag,ammoOf(id)):Infinity;
export function rounds(k,id=k.held){const g=k.guns[id];if(!g)return '';const s=spare(k,id);return `${g.ammo} / ${s===Infinity?'∞':s}`;}
// What to do next, shown under the place name. outside is true on the street.
export const JOB_NAMES={radio:'find a radio',power:'start the generator',supplies:'get the go-bag'};
export function goal(k,outside=false){if(!k.woke)return '';const p=found(k,'light-pistol'),s=found(k,'pump-shotgun');
 if(!p&&!s)return 'Find something to protect yourself with';
 if(k.street==='done'&&k.mission){const m=k.mission;if(m.out)return 'You made it out';if(jobsDone(k))return 'Call the truck at the east end of your street';
  return 'Get ready to leave: '+JOBS.filter(id=>!m.done.includes(id)).map(id=>JOB_NAMES[id]).join(', ');}
 if(outside||k.street!=='start')return {start:'See what crashed down the street',cleared:'Search the police cruiser',looted:'Hold them off',done:'The street is quiet, for now'}[k.street];
 return 'Go and see what crashed down the street';}
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
  const lines=k.street==='start'?['You check the lock, then the window beside it. Red and blue light is still turning down the street.','Whoever was in that car might need help. Or might not be a whoever any more.']:['The street is out there, the way you left it.'];
  if(!p||!s)lines.push(!s?'The shotgun is still in the closet lockbox. You could take it too.':'The pistol is still in the bedroom nightstand. You could take it too.');
  return {lines,act:'leave',verb:'Go out'};}
 if(id==='window'&&k.woke&&k.street==='start')return {lines:['Down the street, a police cruiser has gone up the curb into a pole. Its lights are still turning.','Nobody has got out of it. Nobody has come out of the houses either.']};
 return null;}
// Once something is taken, the spot is only worth a look.
export const verbFor=(k,id)=>(id==='nightstand'&&found(k,'light-pistol'))||(id==='closet'&&found(k,'pump-shotgun'))||(SUPPLIES[id]&&k.searched.includes(id))?'Look':null;
// The line that tells you what you just picked up.
export function pickupLine(id){const f=FINDS[id];if(f)return `${GUNS[id].name}: ${f.ammo} loaded${ammoOf(id)?'':', unlimited spare'}${f.bag.length?'. In your bag: '+listOf(f.bag):''}`;
 return SUPPLIES[id]?'In your bag: '+listOf(SUPPLIES[id]):'';}
