// The neighbourhood, the night it all went wrong: the suburbs' nine districts (street/plan.js lays them out), and on top of them what
// the night needs: the stashes, the first job's three places and the truck, the doors you can knock on or search, the dead and the
// light. Your block is in the middle, as it always was: your house and the neighbours', and the police cruiser up on the curb in
// the pole a few houses east. The art is the Master Creator's street and town sets; this file only places it.
import {rng} from '../mc/assets/core/kit.js';
import {FRONT,WALL_T,Z,BLOCK,BAND,CROSS,BACK,SIDEWALK_N,ROAD,SIDEWALK_S,CENTER,COLS,ROWS,MARGIN,OX,OY,STREET,MAP,TOWN,blockAt,CROSSES,ROADS,THROUGH,roadNear,HOME_BLOCK,HOME,P,BLOCKS,DISTRICTS,CREEK} from './plan.js';
export {FRONT,WALL_T,Z,BLOCK,BAND,CROSS,BACK,SIDEWALK_N,ROAD,SIDEWALK_S,CENTER,COLS,ROWS,MARGIN,OX,OY,STREET,MAP,TOWN,blockAt,CROSSES,ROADS,THROUGH,roadNear,HOME_BLOCK,HOME,BLOCKS,DISTRICTS,CREEK};
// The map is drawn and kept in chunks this big; only the ones near you are held.
export const CHUNK=512;
export const WALK={left:60,right:STREET.w-60,top:60,bottom:STREET.h-60};
// The special dead come in three looks each (the Master Creator's VARIANT_LOOKS), so a street of them is not one body over and over.
// A look only changes clothes, hair, skin and rot: it is the kind's name, then 2 or 3 for the other two. r is a number from 0 to 1.
export const VARIANTS=Object.fromEntries(['runner','brute','screamer','bloater','spitter'].map(k=>[k,[k,k+'2',k+'3']]));
export const vary=(kind,r)=>VARIANTS[kind]?VARIANTS[kind][Math.min(2,Math.floor(r*3))]:kind;
// What the corner of the screen calls each district while you are in it (short, to fit a phone); on the streets between them it
// keeps the last one.
export const AREA_NAMES={maze:'Back yards',tower:'Water tower',site:'Building site',church:'St. Brendan\'s',yours:'Your street',school:'The school',park:'Creek Park',shops:'The shops',fields:'Ball fields'};
export const areaAt=(x,y)=>DISTRICTS.find(d=>x>=d.x&&x<d.x+d.w&&y>=d.y&&y<d.y+d.h)?.id;
// Your street, the middle one of the three that cross the whole map.
export const HOME_ROAD=ROADS.find(rd=>rd.j===HOME_BLOCK.j);
// The neighbours' doors: a name, and what you find when you knock.
const NAMES=['The Albrights\' house','The Castillo house','The Dempseys\' house','The Holloway house','The Nakamuras\' house','The Pryor house','The Galloways\' house','The Mendoza house','The Whitfields\' house'];
// The houses with a name of their own.
const NAMED={rectory:'The rectory',hargrove:'The Hargrove house'};
// Knocking on a neighbour's door, said in your own voice (story/night1.js has the rest of the night).
const KNOCKS=[['Hello? ...Nothing.','Something inside knocks back.'],['Locked. There\'s a note on the glass: "Gone to St. Agnes. Stay inside."','The ink\'s run.'],['A dog barks once inside. Then nothing.'],
 ['Door\'s open a hand\'s width. It smells wrong in there.','I\'m leaving that alone.'],['Boarded up from the inside.','Somebody saw this coming.'],['A candle in the window goes out.'],
 ['Porch light\'s smashed. Glass everywhere.','Nobody\'s answering.'],['Muddy handprints all over the door. At every height.','Nope.']];
// Round the edge of town: pines and a few trees in the fields, and a farm fence along the north and south edges.
const tree=(x,y,seed,pine)=>P(`edge-${x}-${y}`,pine?'pine':'tree',x,y,pine?40:64,10,pine?96:104,{seed,box:pine?[16,0,8,10]:[28,0,8,10],fade:true});
const EDGE_TREES=[];{const R=rng(4242);
 for(let x=60;x<STREET.w-60;x+=50+R()*60)for(const y of [40+R()*80,STREET.h-MARGIN+50+R()*110])EDGE_TREES.push(tree(Math.round(x),Math.round(y),Math.round(x+y),R()<.7));
 for(let y=MARGIN;y<STREET.h-MARGIN;y+=50+R()*60)for(const x of [30+R()*110,STREET.w-MARGIN+70+R()*110])EDGE_TREES.push(tree(Math.round(x),Math.round(y),Math.round(x*3+y),R()<.7));
 // None out on the streets themselves, where they run off into the fields (the truck comes in that way).
 for(let i=EDGE_TREES.length-1;i>=0;i--){const t=EDGE_TREES[i];if(ROADS.some(rd=>(rd.x<=0||rd.x+rd.w>=STREET.w)&&t.y+t.h>rd.sn-10&&t.y-t.z*.3<rd.ss+30))EDGE_TREES.splice(i,1);}}
const FIELD_FENCES=[];for(let i=0;i<COLS;i++){const o=blockAt(i,0),q=blockAt(i,ROWS-1);FIELD_FENCES.push(P(`farm-n${i}`,'chainlink',o.x,o.y+BACK-14,BLOCK,4,30,{see:true}),P(`farm-s${i}`,'chainlink',q.x,q.y+SIDEWALK_S.y+SIDEWALK_S.h+30,BLOCK,4,30,{see:true}));}
export const HOUSES=BLOCKS.flatMap(b=>b.houses);
// Stashes other survivors left: one in about half the other blocks, somewhere out of the way, under a tarp with orange tape on it.
const CACHES=[];{const R=rng(5150);for(const b of BLOCKS){if(b.home||R()<.45)continue;for(let t=0;t<30;t++){const x=Math.round(b.x+60+R()*(BLOCK-160)),y=Math.round(b.y+BACK+40+R()*110);
 if(!b.props.some(o=>!o.flat&&x<o.x+o.w+30&&x+26>o.x-30&&y<o.y+o.h+24&&y+14>o.y-24)&&!b.blockers.some(o=>x<o.x+o.w+20&&x+26>o.x-20&&y<o.y+o.h+20&&y+14>o.y-20)&&!b.ground.some(g=>g.kind==='water'&&x<g.x+g.w+20&&x+26>g.x-20&&y<g.y+g.h&&y+14>g.y)){CACHES.push(P(`cache-${b.i}${b.j}`,'cache',x,y,26,14,10));break;}}}}
// The first job (street/jobs.js): Curtis Webb's ham radio in his house in the back-yard maze to the north-west, Ray Dunham's
// generator and work light by the site office on the building site to the north-east, and the go-bag Linda Hargrove keeps in her
// shed by the creek, south-west. The Castillos' car (its battery is for the radio) and her shed are the job's, not for searching.
const blockOf=(i,j)=>BLOCKS.find(b=>b.i===i&&b.j===j);
export const RADIO_HOUSE=blockOf(0,1).houses[1];
const SO=blockAt(2,0),GEN={x:SO.x+470,y:SO.y+BACK+250};
const JOB_PROPS=[P('job-gen','generator',GEN.x,GEN.y,22,14,18,{job:'power'}),P('job-light','floodlight',GEN.x+38,GEN.y-2,16,10,44,{job:'power'})];
export const PROPS=[...BLOCKS.flatMap(b=>b.props),...CACHES,...JOB_PROPS,...EDGE_TREES,...FIELD_FENCES];
for(const [id,job] of [['b00-car3','radio'],['d02-h-shed','supplies']])PROPS.find(o=>o.id===id).job=job;
// Where you stand guard while the generator warms up: under the work light.
export const HOLD_AT={x:GEN.x+46,y:GEN.y+3};
// What stops feet: everything standing up, by its footprint or, for a tree, its trunk. What stops bullets: anything 20 or more tall
// you cannot see through.
const boxOf=o=>o.box?{x:o.x+o.box[0],y:o.y+o.box[1],w:o.box[2],h:o.box[3]}:{x:o.x,y:o.y,w:o.w,h:o.h};
// Water stops feet but not bullets.
export const SOLIDS=[...PROPS.filter(o=>!o.flat).map(o=>({...boxOf(o),z:o.z,see:!!o.see,id:o.id,kind:o.kind})),...BLOCKS.flatMap(b=>b.blockers.map((w,n)=>({...w,z:0,see:true,id:`water-${b.i}${b.j}-${n}`,kind:'water'})))];
// A grid over the map, so feet and bullets only check what is near them.
const CELL=128,grid=new Map(),key=(cx,cy)=>cx+cy*1000,cells=(b,f)=>{for(let cy=Math.floor(b.y/CELL);cy<=Math.floor((b.y+b.h)/CELL);cy++)for(let cx=Math.floor(b.x/CELL);cx<=Math.floor((b.x+b.w)/CELL);cx++)f(key(cx,cy));};
for(const s of SOLIDS)cells(s,k=>{if(!grid.has(k))grid.set(k,[]);grid.get(k).push(s);});
const inRect=(x,y,r,b)=>{const dx=x-Math.max(b.x,Math.min(x,b.x+b.w)),dy=y-Math.max(b.y,Math.min(y,b.y+b.h));return dx*dx+dy*dy<r*r;};
// The first solid a circle of radius r at (x, y) touches, if any.
// MOVING holds anything solid that is not always there (the truck, once it has pulled up).
export const MOVING=[];
// still: only what is always there (the paths keep that, and ask about MOVING each time).
export function solidAt(x,y,r,still=false){let hit=null;cells({x:x-r,y:y-r,w:r*2,h:r*2},k=>{if(hit)return;for(const s of grid.get(k)||[])if(inRect(x,y,r,s)){hit=s;return;}});if(!hit&&!still)for(const s of MOVING)if(inRect(x,y,r,s))return s;return hit;}
// What would stop a bullet at this point.
export function coverAt(x,y){for(const s of grid.get(key(Math.floor(x/CELL),Math.floor(y/CELL)))||[])if(s.z>=20&&!s.see&&x>=s.x&&x<=s.x+s.w&&y>=s.y&&y<=s.y+s.h)return s;
 for(const s of MOVING)if(s.cover&&x>=s.x&&x<=s.x+s.w&&y>=s.y&&y<=s.y+s.h)return s;return null;}
// Where you come out, on your step, and the door back in.
const H=(x,y)=>({x:HOME.x+x,y:HOME.y+y});
export const START={...H(717,162),direction:2};
export const CRUISER=H(1370,232);
// Things to use: your door back inside, the cruiser's trunk once it is safe, and every neighbour's door.
const cr=PROPS.find(p=>p.id==='cruiser');
// Things to scavenge: every parked car, bin and shed, two in three of the neighbours' houses, and the stashes. What each holds is
// home/kit.js LOOT; a search takes a moment standing still.
// The town's places search as one of those: a bus like a car, a dumpster like a bin, a shop or the site office like a house.
const SEARCHABLE={car:{verb:'Search',name:'Parked car',role:'The doors are unlocked',range:44},bin:{verb:'Search',name:'Trash bin',role:'Somebody\'s bin',range:28},
 shed:{verb:'Search',name:'Garden shed',role:'The door hangs open',range:38},cache:{verb:'Search',name:'Survivor\'s stash',role:'Orange tape on the handle',range:32},
 schoolbus:{verb:'Search',name:'School bus',role:'The door folds open',range:50,loot:'car'},dumpster:{verb:'Search',name:'Dumpster',role:'Lift the lid',range:36,loot:'bin'},
 sitetrailer:{verb:'Search',name:'Site office',role:'The lock\'s been jimmied',range:40,loot:'house'},concession:{verb:'Search',name:'Snack stand',role:'The shutter\'s half up',range:40,loot:'shed'},
 storefront:{verb:'Search',name:'Shop',role:'The door\'s glass is gone',range:40,loot:'house'},gasstore:{verb:'Search',name:'Gas station',role:'Through the broken door',range:40,loot:'house'}};
// You stand in front of it if you can, otherwise beside it or behind it.
const standAt=o=>{const cx=o.x+o.w/2,below=o.y+o.h+(o.kind==='car'?14:10);for(const [x,y] of [[cx,below],[cx,below+10],[o.x-12,o.y+o.h/2],[o.x+o.w+12,o.y+o.h/2],[cx,o.y-12],[o.x-12,below],[o.x+o.w+12,below]])if(!solidAt(x,y,9))return {x,y};return {x:cx,y:below};};
const SPOTS=PROPS.filter(o=>SEARCHABLE[o.kind]&&!o.job).map(o=>({id:'search-'+o.id,prop:o.id,loot:SEARCHABLE[o.kind].loot||o.kind,...SEARCHABLE[o.kind],...standAt(o),mx:o.x+o.w/2,my:o.y-Math.min(o.z,90)-6})).filter(t=>!solidAt(t.x,t.y,8));
// The first job's spots, the place in the school's bus lot at the east end of your street to call the truck from, and the truck's
// tailgate once it is there. Where the truck pulls up: on your street in the far lane, nose west, just short of the last side street.
export const EVAC={x:5300,y:3360};
export const TRUCK={x:EVAC.x-120,y:HOME_ROAD.y+56,w:200,h:60,z:64,from:STREET.w+60};
const RH=RADIO_HOUSE,RD=RH.door0+17,RB=BLOCKS.find(b=>b.houses.includes(RH)),RADIO={x:RD,y:RB.y+FRONT+WALL_T+20,mx:RD,my:RB.y+FRONT-Z-6,range:34};
// The job, a step at a time (street/jobs.js USES says what each use does). The radio: the battery out of the Castillos' car (their
// keys are in the house; without them, smash the window), carried to Curtis's, wired up and tuned. The generator: Ray's can is
// empty, so fill it from a parked car's tank or the gas station's, carry it back, pour it in and pull the cord. The go-bag: the note
// on Mrs. Hargrove's door, then the key off her (she went to the park) or the hasp pried off her shed. A part you set down is
// picked up where it lies; her body is wherever she fell. mark is what the marker over a spot says while it is the one to go to.
const houseDoor=id=>{const h=HOUSES.find(o=>o.id===id),b=BLOCKS.find(q=>q.houses.includes(h)),d=h.door0+17;return {x:d,y:b.y+FRONT+WALL_T+20,mx:d,my:b.y+FRONT-Z-6,range:34};};
const at=id=>{const o=PROPS.find(q=>q.id===id);return {...standAt(o),mx:o.x+o.w/2,my:o.y-o.z-6};},AWAY={x:-1e4,y:-1e4,mx:-1e4,my:-1e4};
const C=(id,use,job,verb,name,role,where,e={})=>({id,use,job,verb,name,role,range:34,...where,...e});
// A car's tank, at whichever end of it you can stand.
const tank=o=>{for(const x of [o.x-12,o.x+o.w+12])if(!solidAt(x,o.y+o.h/2,9))return {x,y:o.y+o.h/2,mx:x<o.x?o.x+12:o.x+o.w-12,my:o.y-o.z+10};return null;};
const CHAIN_SPOTS=[C('chain-keys','keys','radio','Search','The Castillo house','Their car keys, maybe',houseDoor('b00-h3')),
 C('chain-smash','smash','radio','Smash','The Castillos\' car','Break a window for the battery. Loud',at('b00-car3'),{range:44,mark:'Battery'}),
 C('chain-open','open','radio','Open','The Castillos\' car','Their keys work',at('b00-car3'),{range:44,mark:'Battery'}),
 C('chain-set','set','radio','Set down','The Webb house','Curtis\'s ham radio',RADIO,{mark:'Radio'}),
 C('chain-wire','wire','radio','Wire','The Webb house','The battery to the radio',RADIO,{mark:'Radio'}),
 C('job-radio','tune','radio','Tune','The Webb house','Find the Guard',RADIO,{mark:'Radio'}),
 C('chain-check','check','power','Check','Ray\'s generator','Is there fuel in it?',at('job-gen'),{range:36,mark:'Generator'}),
 C('chain-store','store','power','Fill','The gas station','The hand pump on the tank',{x:3600,y:4490,mx:3600,my:4466},{mark:'Fuel'}),
 C('chain-fill','fill','power','Fill','Ray\'s generator','Pour the fuel in',at('job-gen'),{range:36,mark:'Generator'}),
 C('job-power','start','power','Start','Ray\'s generator','Pull the cord',at('job-gen'),{range:36,mark:'Generator'}),
 C('chain-note','note','supplies','Read','The Hargrove house','A note on the door',houseDoor('d02-hargrove'),{mark:'Hargrove'}),
 C('chain-body','body','supplies','Search','Mrs. Hargrove','Her cardigan pockets',AWAY,{range:30,mark:'Her key'}),
 C('chain-pry','pry','supplies','Pry','Mrs. Hargrove\'s shed','Force the hasp. Slow and loud',at('d02-h-shed'),{range:38}),
 C('chain-unlock','unlock','supplies','Unlock','Mrs. Hargrove\'s shed','With her key',at('d02-h-shed'),{range:38,mark:'Shed'}),
 C('job-supplies','bag','supplies','Take','Mrs. Hargrove\'s go-bag','On the shelf, packed',at('d02-h-shed'),{range:38,mark:'Go-bag'}),
 C('drop-battery','drop','part','Pick up','The car battery','Where you set it down',AWAY,{item:'battery',range:26,mark:'Battery'}),
 C('drop-fuel','drop','part','Pick up','The gas can','Where you set it down',AWAY,{item:'fuel',range:26,mark:'Fuel'}),
 ...PROPS.filter(o=>o.kind==='car'&&!o.job).map(o=>{const w=tank(o);return w&&C('siphon-'+o.id,'siphon','power','Siphon','Gas tank','Fill the can. Might set off the alarm',w,{range:26});}).filter(Boolean)];
const JOB_SPOTS=[...CHAIN_SPOTS,
 {id:'evac',job:'evac',verb:'Call',name:'The bus lot',role:'Call the truck in',x:EVAC.x,y:EVAC.y,mx:EVAC.x,my:EVAC.y-26,range:40,mark:'Call the truck'},
 {id:'board',job:'board',verb:'Get in',name:'The truck',role:'Time to go',x:TRUCK.x+TRUCK.w+12,y:TRUCK.y+TRUCK.h/2,mx:TRUCK.x+TRUCK.w-10,my:TRUCK.y-TRUCK.z+4,range:46,mark:'Truck'}];
// Operation Bell Jar on the ground (v0.68, street/op.js), on the east side: Hollow Six's truck drops you on your street just short
// of Juniper Lane, nose east with its ramp down at the back and two ammo cans by the ramp; the Marrow courier went off Route 9 a
// little west of Juniper Lane and rolled onto the verge by the ball fields; the beacon is planted on the sidewalk in front of it; and
// the truck comes back along Route 9 from the west and pulls up past the crash to take you out. The spots are only usable then.
const R9=ROADS.find(rd=>rd.j===7);
export const OP_APC={w:230,h:66,z:72,mark:'H6',ramp:27};
export const OP_DROP={x:5400,y:HOME_ROAD.y+56},OP_PICKUP={x:5330,y:R9.y+R9.h-OP_APC.h,from:4140};
export const OP_WRECK={id:'op-wreck',kind:'wreck',x:5180,y:R9.y-88,w:180,h:58,z:62,open:true};
export const OP_BEACON={id:'op-beacon',kind:'beacon',x:5262,y:R9.y-4,w:16,h:12,z:46};
export const OP_CANS={id:'op-cans',kind:'ammocan',x:OP_DROP.x-66,y:OP_DROP.y+2,w:30,h:10,z:11,n:2};
// Where you and Aaron come down the ramp, and where you come off it at the pickup.
export const OP_START={x:OP_DROP.x-40,y:OP_DROP.y+46,direction:1},OP_MATE={x:OP_DROP.x-76,y:OP_DROP.y+40,direction:1};
const atRamp=(T,dx=0)=>({x:T.x-OP_APC.ramp-14+dx,y:T.y+OP_APC.h/2+6});
export const OP_SPOTS=[{id:'op-samples',op:'samples',verb:'Recover',name:'The courier',role:'Marrow\'s samples, in the torn hold',x:OP_WRECK.x+34,y:OP_WRECK.y+OP_WRECK.h+16,mx:OP_WRECK.x+30,my:OP_WRECK.y-6,range:40,mark:'Samples'},
 {id:'op-plant',op:'beacon',verb:'Plant',name:'The crash',role:'The containment beacon goes here',x:OP_BEACON.x+40,y:OP_BEACON.y+OP_BEACON.h+8,mx:OP_BEACON.x+8,my:OP_BEACON.y-10,range:40,mark:'Beacon'},
 {id:'op-ammo',op:'ammo',verb:'Restock',name:'Ammo cans',role:'Spare magazines for the rifle',x:OP_CANS.x+OP_CANS.w/2,y:OP_CANS.y+OP_CANS.h+12,mx:OP_CANS.x+OP_CANS.w/2,my:OP_CANS.y-OP_CANS.z-6,range:34},
 {id:'op-aaron',op:'revive',verb:'Help up',name:'Aaron',role:'Get him back on his feet',...AWAY,range:40,mark:'Aaron'},
 {id:'op-board',op:'board',verb:'Board',name:'Hollow Six\'s truck',role:'Up the ramp and home',...atRamp(OP_PICKUP),mx:OP_PICKUP.x-12,my:OP_PICKUP.y-OP_APC.z+10,range:48,mark:'Truck'}];
export const opRamp=atRamp;
// The big buildings' doors: shut tonight, every one.
const door=(id,name,role,dx,lines,verb='Try')=>{const o=PROPS.find(q=>q.id===id);return {id:'door-'+id,prop:id,verb,name,role,x:o.x+dx,y:o.y+o.h+16,mx:o.x+dx,my:o.y+o.h-Math.min(o.z,80)-6,range:36,lines};};
const DOORS=[door('d01-church','St. Brendan\'s','The church doors',130,['Barred from the inside.','Somebody in there is praying. Out loud. Over and over.'],'Knock'),
 door('d21-school','Hollow Creek Elementary','The front doors',360,['Chained shut. A sign taped to the glass: "SHELTER FULL."']),
 door('d21-gym','The gym','The double doors',190,['Locked. Something heavy is leaning on them from inside.','I hear breathing.'])];
export const OBJECTS=[
 {id:'frontdoor',prop:'yours',verb:'Go in',name:'Your front door',role:'Home',...H(717,146),mx:HOME.x+717,my:HOME.y+FRONT-Z-6,range:34,facing:true},
 {id:'cruiser',prop:'cruiser',verb:'Search',name:'Police cruiser',role:'The trunk',x:cr.x+22,y:cr.y+cr.h+12,mx:cr.x+22,my:cr.y-cr.z-4,range:44},
 {id:'door-e1',prop:'east1',verb:'Knock',name:'The Suttons\' house',role:'Next door',...H(1077,150),mx:HOME.x+1077,my:HOME.y+FRONT-Z-6,range:34,lines:['Mrs. Sutton? It\'s me, from next door.','A candle moves away from the glass and goes out.']},
 {id:'door-w',prop:'west',verb:'Knock',name:'The corner house',role:'Next door',...H(157,150),mx:HOME.x+157,my:HOME.y+FRONT-Z-6,range:34,lines:['Door\'s open a crack. Pitch black in there, and it smells wrong.','I\'m pulling it shut.']},
 ...BLOCKS.filter(b=>!b.home).flatMap(b=>b.houses.map((h,k)=>{if(h===RADIO_HOUSE||h.id==='b00-h3'||h.id==='d02-hargrove')return null;const d=h.door0+17,s=(b.i*5+b.j)*3+k,at={x:d,y:b.y+FRONT+WALL_T+20,mx:d,my:b.y+FRONT-Z-6,range:34,name:NAMED[h.id.split('-').pop()]||NAMES[s%NAMES.length]};
  return s%3&&!NAMED[h.id.split('-').pop()]?{id:'search-'+h.id,prop:h.id,loot:'house',verb:'Search',role:'The door is not locked',...at}:{id:'door-'+h.id,prop:h.id,verb:'Knock',role:'A neighbour',...at,lines:KNOCKS[(s*7+3)%KNOCKS.length]};})),
 ...DOORS,...SPOTS,...JOB_SPOTS,...OP_SPOTS].filter(Boolean);
// The dead. Each has a look (zombie looks in street/scene.js), where it starts, and when it comes: wave 1 is the cop at the cruiser
// and the five the noise brings out of the dark one after another; wave 2, once you open the trunk, is a crowd of twelve in three
// rushes (from the west, then the east, then all round) and one that lost its legs before tonight, dragging itself up from the
// south, so there is always something to turn and shoot.
export const COP={...H(1376,292),direction:6};
export const WAVES=[
 [{look:'cop',x:COP.x,y:COP.y,direction:COP.direction,idle:true},{look:'neighbour',...H(1285,140),delay:1.2},{look:'jogger',...H(1250,540),delay:2.4},
  {look:'robe',...H(1700,470),delay:3.8},{look:'worker',...H(1050,500),delay:5},{look:'neighbour2',...H(1500,160),delay:6.5}],
 [{look:'robe',...H(850,320),delay:1},{look:'worker',...H(900,500),delay:1.4},{look:'neighbour',...H(820,200),delay:1.8},
  {look:'jogger',...H(1900,300),delay:5},{look:'neighbour2',...H(1940,420),delay:5.4},{look:'worker',...H(1880,180),delay:5.8},{look:'robe',...H(1980,340),delay:6.2},
  {look:'neighbour',...H(1200,540),delay:10},{look:'neighbour2',...H(1450,540),delay:10.4},{look:'runner',kind:'runner',...H(1600,170),delay:10.8},{look:'worker',...H(1150,170),delay:11.2},{look:'robe',...H(1700,520),delay:11.6},
  {look:'worker',kind:'crawler',...H(1330,580),delay:8}]];
// The rest of the neighbourhood: two to four in every other block, wandering their yards and the street until they notice you. None
// close enough to your step to hear your first shot (HEAR, below), so the fight on your lawn stays yours.
export const ROAMERS=[];{const R=rng(9091),LOOKS=['neighbour','jogger','robe','worker','neighbour2'];
 for(const b of BLOCKS){if(b.home)continue;for(let k=0,n=2+Math.floor(R()*3);k<n;k++)for(let tries=0;tries<20;tries++){const x=Math.round(b.x+40+R()*(BLOCK-80)),y=Math.round(b.y+(R()<.6?150+R()*230:BACK+30+R()*120));if(!solidAt(x,y,10)&&Math.hypot(x-START.x,y-START.y)>560){ROAMERS.push({look:LOOKS[Math.floor(R()*LOOKS.length)],x,y});break;}}}}
// The special dead about town: one near each job (a screamer by the radio house, a bloater on Ray's street, a spitter in the yards
// round the go-bag) and a few more scattered through the other blocks.
{const R=rng(3131),put=(kind,x,y)=>{for(let t=0;t<30;t++){const px=Math.round(x+(R()-.5)*t*12),py=Math.round(y+(R()-.5)*t*8);if(!solidAt(px,py,10)&&px>WALK.left+40&&px<WALK.right-40&&py>WALK.top+40&&py<WALK.bottom-40){ROAMERS.push({look:vary(kind,(Math.imul(ROAMERS.length+1,2654435761)>>>0)/4294967296),kind,x:px,y:py});return;}}};
 const near=(id,dx,dy)=>{const o=OBJECTS.find(q=>q.id===id);return [o.x+dx,o.y+dy];};
 put('screamer',...near('job-radio',-160,40));put('bloater',...near('job-power',140,70));put('spitter',...near('job-supplies',120,-60));
 for(const b of BLOCKS){if(b.home||R()>.4)continue;const kind=['screamer','bloater','spitter'][Math.floor(R()*3)];put(kind,b.x+100+R()*(BLOCK-200),b.y+(R()<.6?180+R()*180:BACK+40+R()*100));}}
// The hold-out's breaches: where the dead get into the lit bus lot while you wait for the truck, in the order they give way. The
// holes in the lot's back fence, the storm drain in the gutter (what comes up out of it crawls), and the gym's doors over the road,
// which burst. prop is what is painted open once it has given way.
export const BREACHES=[{id:'gap-e',name:'The fence gap',short:'Fence gap',x:5130,y:3860},{id:'drain',name:'The storm drain',short:'Storm drain',x:4725,y:3172,prop:'d21-drain'},
 {id:'gym',name:'The gym doors',short:'Gym doors',x:5250,y:2996,prop:'d21-gym'},{id:'gap-w',name:'The fence gap',short:'Fence gap',x:4430,y:3860}];
// Mrs. Hargrove, who went to the park after her dog and did not come back, and two who were there with her. Last, so every other
// wanderer keeps its place in the list.
{const R=rng(2718),put=(look,x,y,who)=>{for(let t=0;t<40;t++){const px=Math.round(x+(R()-.5)*t*10),py=Math.round(y+(R()-.5)*t*8);if(!solidAt(px,py,10)){ROAMERS.push({look,x:px,y:py,...(who?{who}:{})});return;}}};
 put('hargrove',1000,4480,'hargrove');put('neighbour',1070,4520);put('jogger',940,4440);}
// The cop turns round when you come this close, or the moment you fire. Wanderers notice you as close, and hear a shot from further.
export const NOTICE=190,HEAR=420;
// Light: the moon in patches over everything, a candle in a window here and there, and the cruiser's one working headlight.
const moon=(x,y,rad)=>[x,y,rad,.6,.7,1];
export const LIGHTS=[];{const R=rng(77);for(let y=200;y<STREET.h;y+=420)for(let x=200;x<STREET.w;x+=520)LIGHTS.push(moon(Math.round(x+R()*240),Math.round(y+R()*200),240+Math.round(R()*60)));
 LIGHTS.push(...[[992,140,70,1,.72,.42],[1490,236,90,1,.95,.75],[1530,240,60,1,.95,.8]].map(([x,y,...l])=>[HOME.x+x,HOME.y+y,...l]));
 for(const h of HOUSES){if(['west','yours','east1','east2'].includes(h.id)||R()>=.12)continue;const w=h.windows[0];if(w)LIGHTS.push([h.x+w[0]+22,h.y+h.h+14,60,1,.72,.42]);}
 // Light that leads you: the car in the trees by the water tower with a headlight on, candles in the church, the battery light over
 // the gym door, the gas station's one dim bulb, the car that hit the pumps, and a fire in a barrel behind the church.
 const at=id=>PROPS.find(o=>o.id===id);for(const [id,dx,dy,rad,...l] of [['d10-ditch-car',150,30,110,1,.95,.8],['d01-church',130,214,90,1,.72,.42],['d01-church',60,214,50,1,.72,.42],
  ['d21-gym',190,236,90,.85,.92,1],['d12-store',60,154,70,1,.9,.6],['d12-crash',150,30,110,1,.95,.8],['d01-fire',13,20,130,1,.58,.28]]){const o=at(id);if(o)LIGHTS.push([o.x+dx,o.y+dy,rad,...l]);}}
export const LIGHT_BAR=H(1370,184);
