// The first night in the house: whether you have woken up yet, whether you have found the flashlight, the guns you have found with the rounds in them, what is in your
// bag, which spots you have already searched, and how far the fight out on the street has got. Saved, but while the tutorial is
// being built every visit starts fresh on the couch (FRESH), so each test plays it from the very beginning. The Light Pistol is in the
// bedroom nightstand, the Pump Shotgun in the hall closet lockbox; the kitchen, the sink and the laundry hold supplies.
import {GUNS,unlimited} from '../study/equipment.js';
import {itemInfo} from '../mc/assets/gear/items.js';
import {carrying,BAGS} from '../mc/assets/gear/bags.js';
import {add,count,normalizeBag} from './bag.js';
import {rng} from '../mc/assets/core/kit.js';import {SCRIPT} from '../story/night1.js';
export const HOME_KEY='deadlight-home-v1';
// While the tutorial is being built, the saved night is ignored on load: you wake on the couch with nothing, every time.
export const FRESH=true;
// The street outside: the crash, then the first fight. start: the cop at the cruiser; cleared: the first three are down and the
// trunk waits; looted: you took what was in it and more are coming; done: the street is quiet.
export const STREET_STAGES=['start','cleared','looted','done'];
// The cruiser's trunk: a box of shells and a carton of rifle rounds, for a rifle you do not have yet.
// The first job, once the street is quiet: three jobs anywhere in town, in any order, then the truck out. Each job is a chain of
// steps (street/jobs.js). done lists the jobs finished and step how far along each one is; have holds what you have found for
// them (the Castillos' car keys, Ray's empty can, Mrs. Hargrove's shed key); carry is the heavy part in your hands and drops the
// ones you set down and where; out is true once you are on the truck.
export const JOBS=['radio','power','supplies'];
export const CHAINS={radio:['battery','carry','wire','tune'],power:['fuel','carry','start','hold'],supplies:['note','hunt','shed','bag']};
export const HAVE=['keys','can','shedkey'],PARTS=['battery','fuel'];
export const stepOf=(k,id)=>k.mission?.done.includes(id)?'done':CHAINS[id][k.mission?.step?.[id]||0];
// A step done: the next one, or the job finished once the last is.
export function stepOn(k,id,grid){const m=k.mission,n=(m.step[id]||0)+1;if(n>=CHAINS[id].length)return job(k,id,grid);return {...k,mission:{...m,step:{...m.step,[id]:n}}};}
// Jumping to a later step (prying the shed open skips her key).
export const stepTo=(k,id,s)=>({...k,mission:{...k.mission,step:{...k.mission.step,[id]:CHAINS[id].indexOf(s)}}});
export const give=(k,h)=>k.mission.have.includes(h)?k:{...k,mission:{...k.mission,have:[...k.mission.have,h]}};
export const spend=(k,h)=>({...k,mission:{...k.mission,have:k.mission.have.filter(x=>x!==h)}});
// Picking a part up (it goes in your hands; you put the shotgun on your back for the pistol) and setting it down where you stand.
export const lift=(k,item)=>({...k,held:k.guns['light-pistol']?'light-pistol':k.held,mission:{...k.mission,carry:item,drops:k.mission.drops.filter(d=>d.item!==item)}});
export const setDown=(k,x,y)=>{const c=k.mission.carry;return c?{...k,mission:{...k.mission,carry:null,drops:[...k.mission.drops.filter(d=>d.item!==c),{item:c,x,y}]}}:k;};
export const delivered=k=>({...k,mission:{...k.mission,carry:null}});
// What the survivor's go-bag holds.
export const GO_BAG=[['shells',12],['cloth',2],['gun-oil',1],['powder',2]];
// Finishing a job, and getting on the truck.
export function job(k,id,grid=carrying({})){if(!JOBS.includes(id)||k.mission.done.includes(id))return k;return {...k,bag:id==='supplies'?pack(k,grid,GO_BAG):k.bag,mission:{...k.mission,done:[...k.mission.done,id],step:{...k.mission.step,[id]:CHAINS[id].length}}};}
export const jobsDone=k=>JOBS.every(id=>k.mission?.done.includes(id));
export const board=k=>({...k,mission:{...k.mission,out:true}});
export const TRUNK=[['shells',12],['rounds',30]];
// What each find holds: rounds loaded, and what goes into the bag with it. A pistol is a secondary, so its spare rounds never run
// out; the shotgun is a primary and only has the shells in your bag.
export const FINDS={'light-pistol':{at:'nightstand',ammo:15,bag:[]},'pump-shotgun':{at:'closet',ammo:8,bag:[['shells',16],['gun-oil',1]]}};
// Supplies in the house, found by searching. Nothing here is needed to leave; it is what a careful person takes.
export const SUPPLIES={counter:[['scrap',3],['electronics',1]],sink:[['solvent',1]],laundry:[['cloth',2]]};
// The guns a kit can hold: the two in the house, and the heavy pistol your own survivor comes out with.
const ORDER=[...Object.keys(FINDS),'heavy-pistol'];
// Whose night it is. tutorial: the man on the couch, start to finish. own: after he dies in the hold-out, the survivor you make, who
// watched it from across the street; corpse is what he had on him when he went down (his guns, rounds and bag) and where, and taken
// once you have it back.
export const PHASES=['tutorial','own'];
const BIGGEST=Object.values(BAGS).reduce((a,b)=>a.cols*a.rows>=b.cols*b.rows?a:b);
// What your own survivor has when they come out of the house across the street: their own heavy pistol, nothing else.
export const OWN_GUN='heavy-pistol';
// Which ammo a gun uses from the bag, or null for a pistol (unlimited).
export const ammoOf=id=>unlimited(id)?null:GUNS[id]?.shells?'shells':'rounds';
const normGuns=v=>{const guns={};for(const id of ORDER){const g=v?.[id];if(!g)continue;guns[id]={ammo:Math.min(GUNS[id].mag,Math.max(0,Math.floor(Number(g.ammo)||0)))};}return guns;};
export function normalizeHome(v,grid=carrying({})){const guns={};for(const id of ORDER){const g=v?.guns?.[id];if(!g)continue;guns[id]={ammo:Math.min(GUNS[id].mag,Math.max(0,Math.floor(Number(g.ammo)||0)))};}
 const held=guns[v?.held]?v.held:ORDER.find(id=>guns[id])||null,searched=[...new Set((Array.isArray(v?.searched)?v.searched:[]).filter(id=>SUPPLIES[id]))];
 let bag=normalizeBag(v?.bag,grid);
 // Saves from before the bag kept the shotgun's spare shells on the gun; they move into the bag.
 if(!v?.bag&&guns['pump-shotgun'])bag=add(bag,grid,'shells',Math.max(0,Math.floor(Number(v.guns['pump-shotgun'].reserve)||0)));
 const street=STREET_STAGES.includes(v?.street)?v.street:'start',looted=[...new Set((Array.isArray(v?.looted)?v.looted:[]).filter(id=>typeof id==='string'))];
 const M=v?.mission,done=[...new Set((Array.isArray(M?.done)?M.done:[]).filter(id=>JOBS.includes(id)))],step={};
 for(const id of JOBS)step[id]=done.includes(id)?CHAINS[id].length:Math.max(0,Math.min(CHAINS[id].length-1,Math.floor(Number(M?.step?.[id])||0)));
 const drops=[];for(const d of Array.isArray(M?.drops)?M.drops:[])if(PARTS.includes(d?.item)&&!drops.some(e=>e.item===d.item)&&Number.isFinite(Number(d.x))&&Number.isFinite(Number(d.y)))drops.push({item:d.item,x:Number(d.x),y:Number(d.y)});
 const mission={done,out:M?.out===true,step,have:[...new Set((Array.isArray(M?.have)?M.have:[]).filter(h=>HAVE.includes(h)))],carry:PARTS.includes(M?.carry)&&!drops.some(d=>d.item===M.carry)?M.carry:null,drops};
 const phase=PHASES.includes(v?.phase)?v.phase:'tutorial',c=v?.corpse,corpse=phase==='own'&&c?{guns:normGuns(c.guns),held:c.held??null,bag:normalizeBag(c.bag,BIGGEST),x:Number(c.x)||0,y:Number(c.y)||0,dir:Number(c.dir)>=0&&Number(c.dir)<8?Number(c.dir)|0:2,taken:c.taken===true}:null;
 return {woke:v?.woke===true,light:v?.light===true,guns,held,bag,searched,street,looted,mission,phase,corpse};}
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
// What each step asks of you, as the goal line says it.
export const STEP_GOALS={radio:{battery:'get the battery out of the Castillos\' car',carry:'carry the battery to Curtis Webb\'s',wire:'wire up Curtis\'s radio',tune:'find the Guard on the radio'},
 power:{fuel:'find fuel for Ray\'s generator',carry:'carry the fuel to Ray\'s generator',start:'start the generator',hold:'stay by the light while it warms up'},
 supplies:{note:'go to Mrs. Hargrove\'s house',hunt:'find Mrs. Hargrove in the park, or force her shed',shed:'open her shed with her key',bag:'take the go-bag'}};
export function goal(k,outside=false){if(!k.woke)return '';const p=found(k,'light-pistol'),s=found(k,'pump-shotgun');
 if(k.phase==='own'){if(k.mission?.out)return 'You made it out';return k.corpse&&!k.corpse.taken?'Put him down, and take back what he carried':'Get to the truck at the east end of the street';}
 if(!k.light&&!outside)return 'Find the flashlight in the kitchen';
 if(!p&&!s)return 'Find something to protect yourself with';
 if(k.street==='done'&&k.mission){const m=k.mission;if(m.out)return 'You made it out';if(jobsDone(k))return 'Call the truck at the east end of your street';
  if(m.carry)return STEP_GOALS[m.carry==='battery'?'radio':'power'].carry[0].toUpperCase()+STEP_GOALS[m.carry==='battery'?'radio':'power'].carry.slice(1);
  return 'Get ready to leave: '+JOBS.filter(id=>!m.done.includes(id)).map(id=>STEP_GOALS[id][stepOf(k,id)]).join(', ');}
 if(outside||k.street!=='start')return {start:'See what crashed down the street',cleared:'Search the police cruiser',looted:'Hold them off',done:'The street is quiet, for now'}[k.street];
 return 'Go and see what crashed down the street';}
// What the nightstand, the closet, the searchable spots and the front door say, and what using them does. act names what
// happens after the last line.
// The lines come from the script (story/night1.js) as plain text; whoever you are says them.
const L=lines=>lines.map(l=>l[1]),look=id=>L(SCRIPT.look[id]);
export function useLines(k,id){
 // Until you have the flashlight, the drawers and the closet are too dark to go through; the flashlight is in the kitchen junk drawer.
 if(!k.light&&(id==='nightstand'||id==='closet'))return {lines:look('dark')};
 if(id==='counter'&&!k.light)return {lines:L(SCRIPT.drawer),act:'flashlight',verb:'Take'};
 if(id==='nightstand')return found(k,'light-pistol')?{lines:look('nightstandEmpty')}:{lines:look('nightstand'),act:'take:light-pistol',verb:'Take'};
 if(id==='closet')return found(k,'pump-shotgun')?{lines:look('closetEmpty')}:{lines:look('closet'),act:'take:pump-shotgun',verb:'Take'};
 if(SUPPLIES[id])return k.searched.includes(id)?{lines:look('searched')}:{lines:[...look(id),...L(SCRIPT.search[id])],act:'search:'+id,verb:'Take'};
 if(id==='frontdoor'){const p=found(k,'light-pistol'),s=found(k,'pump-shotgun');
  if(!p&&!s)return {lines:look(k.light?'doorEmpty':'doorDark')};
  return {lines:look(k.street!=='start'?'doorBack':s?'door':'doorOne'),act:'leave',verb:'Go out'};}
 if(id==='window'&&k.woke&&k.street==='start')return {lines:look('windowCrash')};
 if(SCRIPT.look[id])return {lines:look(id)};
 return null;}
// Once something is taken, the spot is only worth a look.
export const verbFor=(k,id)=>id==='counter'&&!k.light?'Search':(id==='nightstand'&&found(k,'light-pistol'))||(id==='closet'&&found(k,'pump-shotgun'))||(SUPPLIES[id]&&k.searched.includes(id))?'Look':null;
// The line that tells you what you just picked up.
export function pickupLine(id){const f=FINDS[id];if(f)return `${GUNS[id].name}: ${f.ammo} loaded${ammoOf(id)?'':', unlimited spare'}${f.bag.length?'. In your bag: '+listOf(f.bag):''}`;
 return SUPPLIES[id]?'In your bag: '+listOf(SUPPLIES[id]):'';}
// He is gone: what he had stays with his body, and your own survivor starts over with just their pistol. The street and the job
// stay where they were (the truck is still coming), since you watched it all happen.
export function reborn(k,at){const corpse={guns:k.guns,held:k.held,bag:k.bag,x:at.x,y:at.y,dir:at.dir??2,taken:false};
 return {...k,phase:'own',corpse,guns:{[OWN_GUN]:{ammo:GUNS[OWN_GUN].mag}},held:OWN_GUN,bag:{items:[],spill:[]}};}
// Taking it back off him: his guns with what is in them, and everything in his bag on top of yours (what does not fit is set down,
// never lost). You keep holding what you hold.
export function reclaim(k,grid=carrying({})){const c=k.corpse;if(!c||c.taken)return k;let bag=k.bag;for(const o of [...c.bag.items,...c.bag.spill])bag=add(bag,grid,o.id,o.n);
 return {...k,guns:{...c.guns,...k.guns},bag,corpse:{...c,taken:true}};}
// What comes back, for the line on screen: his guns by name, then what was in his bag.
export function reclaimed(c){const items=[...c.bag.items,...c.bag.spill].reduce((m,o)=>{const e=m.find(x=>x[0]===o.id);if(e)e[1]+=o.n;else m.push([o.id,o.n]);return m;},[]);
 return [...Object.keys(c.guns).map(id=>GUNS[id].name),...(items.length?[listOf(items)]:[])].join(', ');}
