// The Training Grounds: a cave chamber under the camp. LEET AF built a whole building out of pallets, doors, sheet metal and plywood
// in the middle of it, so a Holdout down here plays like holding a house out in the world. Their post by the gate runs on cords from camp.
import {RESIDENTS} from '../camp/data.js';
export const TG={w:1960,h:2000};
// The yard around the building, where Gadget's robots roll in from the hatches. A barricade with a gate closes it off from the post.
export const ARENA={x:72,y:168,w:1816,h:1272};
export const GATE={x:920,w:120,y:1440};
// The gate itself: a chain-link panel Gadget swings shut while a Holdout runs.
export const GATE_DOOR={x:GATE.x,y:GATE.y+2,w:GATE.w,h:14,z:44};
export const BUILDING={x:440,y:400,w:1080,h:760,rooms:[['BUNKS',630,522],['STORES',1330,522],['HALL',980,902],['KITCHEN',548,902],['OFFICE',1412,902]]};
// Walkable bounds for the survivor. The rock edges are drawn just outside them.
export const ROOM={w:TG.w,h:TG.h,left:72,top:168,right:TG.w-72,bottom:TG.h-88};
export const STAIRS={x:928,w:104,y:TG.h-132};
export const START={x:980,y:TG.h-130,direction:6};
const P=(id,kind,x,y,w,h,z,extra={})=>({id,kind,x,y,w,h,z,...extra});
// A wall of scrap from a to b, with doorways (open) and windows (a low sill you can shoot over and robots climb through).
const H_KINDS=['sheet','pallets','plywood','doors','pallets','sheet','plywood'],V_KINDS=['palletsV','plywoodV','sheetV'];
function wall(id,axis,at,a,b,gaps=[],T=16,z=50){const out=[];let cur=a,k=0;const piece=(s,e)=>{for(let x=s;x<e;){const n=Math.min(e,x+Math.max(40,Math.min(132,e-x)));const len=e-n<40&&e-n>0?e-x:n-x;
   const kind=axis==='h'?H_KINDS[(k+Math.round(at/7))%H_KINDS.length]:V_KINDS[(k+Math.round(at/7))%V_KINDS.length];out.push(axis==='h'?P(`${id}-${k}`,kind,x,at,len,T,z,{wall:true}):P(`${id}-${k}`,kind,at,x,T,len,z,{wall:true}));k++;x+=len;}};
 for(const [s,e,type] of gaps){if(s>cur)piece(cur,s);if(type==='window')out.push(axis==='h'?P(`${id}-w${s}`,'window',s,at,e-s,T,18,{window:true}):P(`${id}-w${s}`,'windowV',at,s,T,e-s,18,{window:true}));cur=e;}
 if(b>cur)piece(cur,b);return out;}
const B=BUILDING,BX=B.x+B.w-16,BY=B.y+B.h-16;
const SHELL=[...wall('bn','h',B.y,B.x,B.x+B.w,[[540,600,'window'],[940,1020,'door'],[1360,1420,'window']]),
 ...wall('bs','h',BY,B.x,B.x+B.w,[[700,760,'window'],[940,1020,'door'],[1200,1260,'window']]),
 ...wall('bw','v',B.x,B.y+16,BY,[[470,530,'window'],[760,820,'window'],[980,1040,'door']]),
 ...wall('be','v',BX,B.y+16,BY,[[470,530,'window'],[760,820,'window'],[980,1040,'door']]),
 // Inside: a line of rooms along the north (bunks, a corridor, stores) and the hall between the kitchen and the office.
 ...wall('im','h',640,B.x+16,BX,[[564,624,'door'],[940,1020,'door'],[1360,1420,'door']]),
 ...wall('ia','v',820,B.y+16,640),...wall('ib','v',1140,B.y+16,640),
 ...wall('ic','v',640,656,BY,[[860,920,'door']]),...wall('id','v',1320,656,BY,[[860,920,'door']])];
const FURNITURE=[
 ['cot',470,446,64,22,14],['cot',700,446,64,22,14],['cot',470,566,64,22,14],['crate',740,560,40,30,28],
 ['sandbags',880,470,64,16,18],['sandbags',1020,470,64,16,18],
 ['shelf',1170,426,96,16,62],['crate',1420,560,40,30,28],['crate',1180,580,34,24,22],['drum',1440,440,26,14,40],['drum',1468,450,26,14,40],
 ['table',740,760,84,30,24],['table',1120,760,84,30,24],['spool',960,800,40,26,34],['crate',700,1010,40,30,28],['crate',1240,1010,40,30,28],['sandbags',866,1070,56,16,18],['sandbags',1038,1070,56,16,18],
 ['table',486,700,84,30,24],['stove',590,1090,30,20,26],['drum',480,1090,26,14,40],
 ['table',1390,700,84,30,24],['shelf',1380,1110,96,16,62]].map(([kind,x,y,w,h,z],i)=>P('in-'+i,kind,x,y,w,h,z));
// Cover out in the yard, leaving lanes wide enough for the robots to roll through.
const YARD=[
 ['tires',240,300,30,22,26],['tires',1700,320,30,22,26],['pallets',200,640,64,14,34],['pallets',1660,640,64,14,34],['cartpile',250,1100,52,30,30],['cartpile',1650,1100,52,30,30],
 ['drum',300,880,26,14,40],['drum',332,892,26,14,40],['barrel',1640,880,28,20,34],['crate',1700,1000,40,30,28],['plywood',620,250,92,10,46],['plywood',1250,250,92,10,46],
 ['sandbags',780,1290,96,16,18],['sandbags',1086,1290,96,16,18],['doors',200,1300,72,12,40],['doors',1690,1300,72,12,40],['spool',460,1300,40,26,34],['spool',1460,1300,40,26,34]].map(([kind,x,y,w,h,z],i)=>P('yard-'+i,kind,x,y,w,h,z));
// The barricade between the yard and the post: whatever LEET AF could drag in, end to end, with posts either side of the gate.
const BARRICADE=[['pallets',72,128],['doors',200,90],['sheet',290,110],['plywood',400,120],['pallets',520,120],['doors',640,90],['sheet',730,100],['pallets',830,78],
 ['pallets',1052,96],['plywood',1148,120],['doors',1268,90],['sheet',1358,120],['pallets',1478,128],['plywood',1606,120],['doors',1726,90],['pallets',1816,72]].map(([kind,x,w],i)=>P('wall-'+i,kind,x,GATE.y,w,18,46,{wall:true}));
// Work lights on tripods, each fed by a cord.
export const WORKLIGHTS=[[150,196],[640,196],[1320,196],[1810,196],[96,620],[1864,620],[96,1120],[1864,1120],[640,1340],[1320,1340],[790,430],[1170,600],[716,716],[1244,716],[470,1124],[1490,1124],[980,1124]];
const LIGHTS_P=WORKLIGHTS.map(([x,y],i)=>P('worklight-'+i,'worklight',x-6,y-5,12,10,74));
// The post: Aaron's paintball shop on the left of the aisle, Gadget's parts counter on the right, both facing you as you walk up from the stairs.
const POST=[
 P('gate-l','gatepost',GATE.x-12,GATE.y-2,12,22,58),P('gate-r','gatepost',GATE.x+GATE.w,GATE.y-2,12,22,58,{right:true}),
 P('banner','banner',GATE.x,GATE.y+16,GATE.w,2,72,{deco:true}),
 P('pegboard','pegboard',700,1462,180,6,70,{label:'PAINTBALL SHOP'}),P('counter','counter',700,1600,180,22,30),P('paintcrate','paintcrate',656,1598,34,26,24),
 P('crate-a','crate',556,1470,40,30,28),P('crate-b','crate',600,1470,40,30,28),P('crate-c','crate',556,1510,40,30,28),
 P('desk','desk',1080,1466,160,30,36),P('server','server',1252,1460,50,22,86),P('batteries','batteries',1312,1474,66,18,14),P('whiteboard','whiteboard',1394,1468,58,8,66),
 P('partscounter','partscounter',1080,1600,180,22,30),
 P('botbench','botbench',1460,1600,140,28,30),P('parts','parts',1612,1606,52,24,22),
 ...[1480,1530,1580].map((x,i)=>P('parked-'+i,'botparked',x,1700,30,18,40,{variant:(i+1)%4})),P('charger','charger',1630,1698,32,16,30),
 P('carseat','carseat',1560,1820,100,24,26),P('stove','stove',1680,1830,30,20,26),P('cordreel','cordreel',1460,1830,28,18,24),
 P('lane-wall','pallets',80,1810,440,14,34),P('sandbags-s','sandbags',780,1840,64,16,18),
 P('officelight','worklight',530,1640,12,10,74),P('officelight-e','worklight',1400,1760,12,10,74)];
export const PROPS=[...SHELL,...FURNITURE,...YARD,...BARRICADE,...LIGHTS_P,...POST];
// Solids for walking and for shots: every prop except decoration. Windows stop feet but not paint.
export const SOLIDS=PROPS.filter(o=>!o.deco).map(o=>({...o,height:o.z}));
// The robot hatches: three in the back wall and one in each side wall.
export const HATCHES=[{x:300,y:196,side:'n'},{x:980,y:196,side:'n'},{x:1660,y:196,side:'n'},{x:100,y:820,side:'w'},{x:TG.w-100,y:820,side:'e'}];
// Paper targets in the lane at the west end of the post, and the chalk line you shoot from.
export const TARGETS=[1560,1650,1740].map((y,i)=>({id:i,x:150,y}));
export const LANE={x:430,y0:1500,y1:1800};
// Floors laid over the rock: lino and plywood in the building, plywood at the post.
export const FLOORS=[{x:B.x+16,y:B.y+16,w:B.w-32,h:B.h-32,kind:'lino'},{x:540,y:1458,w:880,h:260,kind:'ply'}];
// Lights: x, y, radius, r, g, b. Work lights are a cool white; the post is warmer, and Gadget's screens are cyan.
export const LIGHTS=[...WORKLIGHTS.map(([x,y])=>[x,y+20,350,.96,.99,1]),[790,1640,230,1,.88,.66],[1170,1640,230,1,.88,.66],[1160,1500,120,.55,.85,1],
 [1276,1470,60,.5,1,.6],[1530,1640,120,1,.86,.62],[1690,1846,70,1,.7,.42],[980,1890,140,.8,.84,.9],[530,1660,200,.96,.9,.78],
 ...HATCHES.map(h=>[h.x,h.side==='n'?h.y-16:h.y,70,1,.42,.36]),...[160,420,660,1300,1540,1800].map(x=>[x,1474,110,1,.82,.55])];
// Who works here. Aaron keeps the range and the shop; Gadget keeps the lights on, builds the robots and buys their parts back.
const aaron=RESIDENTS.find(r=>r.id==='aaron');
const here=l=>l.replace('It was a storm bunker under the cave.','This was a storm bunker.').replace(/down there/g,'down here').replace(' Ask her down here.',' She\'s at the parts counter, next to mine.').replace('Gadget and I built an arena down here','Gadget and I built this place');
export const SHOP=[
 {id:'vest',name:'Padded vest',price:60,text:'Foam sewn into a flak vest. 25 more health in a Holdout.'},
 {id:'loader',name:'Speed loader',price:50,text:'Pre-filled paint tubes. Every gun reloads a quarter faster.'},
 {id:'hopper',name:'Big hopper',price:70,text:'A taller hopper on every gun: 30 percent more shots per load.'},
 {id:'medkit',name:'Med kit',price:40,text:'Ava\'s spare kit. Heals 40 health in every break between waves.'},
 {id:'wind',name:'Second wind',price:120,text:'Gadget can pull you up one more time each run.'}];
export const AARON_ROOM_TOPICS=[{q:'Browse the paintball shop',act:'shop',a:['Let\'s see what your tokens buy.']},...aaron.topics.map(q=>({...q,a:q.a.map(here)})),
 {q:'How do tokens work?',a:['Bring Gadget the parts off her robots and she pays you in tokens. Range money; it\'s no good topside.','Spend them here. Everything I sell makes you last longer in a Holdout.']}];
export const GADGET_TOPICS=[
 {q:'Start a Holdout',act:'holdout',when:'idle',a:['Waves until you drop. They come out of every hatch and they get meaner every wave: runners, armored husks, spitters, and the big one.','Go through the gate. It locks behind you, and the first wave starts when you\'re in the yard.','If you go down I\'ll pull you up once. Grab the parts off anything you knock over.']},
 {q:'Run the warm-up drill',act:'drill',when:'idle',a:['Three waves of the old robots. They only bump. Good for learning the building.']},
 {q:'Call it off',act:'stop',when:'run',a:['Calling them back. They\'ll be charged again whenever you are.']},
 {q:'Turn in parts ({parts})',act:'turnin',when:'parts',a:[]},
 {q:'What are those things?',a:['Pillows, bedsheets and brooms on shopping-cart wheels, a car battery in each. The new ones copy what\'s out there: runners on toy-car chassis, husks in pot helmets, spitters with paint launchers, and the brute.','They won\'t bite. They hit with paint, and paint counts.']},
 {q:'How do I beat the specials?',a:['Watch for the tell. Shamblers raise their arms before they grab. Runners shriek, then sprint. Spitters jerk back and glow green before they lob.','Husks shrug off light pistols and the Tactical AR unless you hit the head. The brute paws the floor, then charges in a straight line. Step aside and shoot its back.']},
 {q:'Why paintball?',a:['Real rounds through my robots? Absolutely not. Every gun down here has a paintball twin: same magazine, same rate, same reload.','Different paint for each gun, so I can see who hit what.']},
 {q:'Where does the power come from?',a:['A generator up in camp, by the doors. Extension cords all the way down the stairs. Don\'t trip on them. Seriously.']},
 {q:'What happened out there?',a:['Marrow Industries. LZ-6, the Lazarus drug. They brought a dead woman back on live TV, and the whole world lined up for a dose.','Two months later she turned. So did everyone who took it, and then everyone they bit.','There was a moment where it looked like we had it under control. The army didn\'t fall in a day. It just ran out of people.']},
 {q:'You and Aaron?',a:['Last two of our unit. No command, no orders, no resupply. He runs the range and the shop, I run the robots and the power. Macy tells us where to be useful.']}];
export const ROOM_NPCS=[
 {...aaron,id:'aaron-room',kind:'resident',role:'LEET AF · Range and shop',x:790,y:1576,direction:2,talk:{x:790,y:1650},
  lines:['Welcome to the Training Grounds. Gear up here before you go through the gate.','Range is hot. Shopping or questions?'],more:'Anything else?',topics:AARON_ROOM_TOPICS},
 {id:'gadget',kind:'resident',name:'Priya "Gadget" Nair',short:'Gadget',role:'LEET AF · Engineer',x:1170,y:1576,direction:2,talk:{x:1170,y:1650},
  look:{body:1,skin:2,hair:9,color:0,beard:0,hat:0,top:8,coat:1,shirt:0,bottom:5,pants:3,shoes:3,boots:1,pack:1,packColor:1},
  lines:['Gadget. I keep the lights on down here, and I build the zombies. Want some?','Mind the cords. Everything in here runs on one generator and a lot of hope.'],more:'Anything else? The robots are charged.',topics:GADGET_TOPICS}];
export const TALK_RANGE=44;
// Things to use: the stairs back up to camp.
export const OBJECTS=[{id:'stairs',kind:'object',verb:'Climb',name:'Stairs to camp',role:'Firelight Camp',x:980,y:TG.h-112,mx:980,my:TG.h-150}];
