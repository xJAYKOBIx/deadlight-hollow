// The Training Grounds: a cave chamber under the camp. LEET AF built an arena out of pallets, doors, plywood and scrap,
// and a front office where Aaron and Gadget work, all run off extension cords from the generator up in camp.
import {RESIDENTS} from '../camp/data.js';
export const TG={w:1720,h:1720};
// The arena is 1600×1200, two thirds of each side of the old wave map. The office strip runs along the south.
export const ARENA={x:60,y:150,w:1600,h:1200};
export const GATE={x:800,w:120,y:1350};
// Walkable bounds for the survivor. The rock edges are drawn just outside them.
export const ROOM={w:TG.w,h:TG.h,left:72,top:168,right:1648,bottom:1632};
export const START={x:176,y:1590,direction:6};
const P=(id,kind,x,y,w,h,z,extra={})=>({id,kind,x,y,w,h,z,...extra});
// The wall between the arena and the office: whatever LEET AF could drag in, end to end, with a gap for the gate.
const WALL=[['pallets',72,128],['doors',200,90],['sheet',290,110],['plywood',400,120],['pallets',520,120],['doors',640,90],['sheet',730,58],
 ['plywood',932,190],['pallets',1122,128],['doors',1250,90],['sheet',1340,120],['pallets',1460,120],['plywood',1580,68]].map(([kind,x,w],i)=>P('wall-'+i,kind,x,GATE.y,w,18,46,{wall:true}));
// Cover inside the arena, roughly in rows, leaving lanes wide enough for the robots to roll through.
const COVER=[
 ['pallets',200,320,64,14,34],['tires',340,300,30,22,26],['doors',560,330,72,12,40],['spool',770,300,40,26,34],['plywood',900,350,92,10,46],['drum',1130,320,26,14,40],['drum',1162,330,26,14,40],['sheet',1440,330,84,10,38],
 ['palletsV',300,520,14,64,34],['sandbags',420,600,64,16,18],['cartpile',640,540,52,30,30],['plywoodV',820,500,12,80,46],['crate',900,600,40,30,28],['crate',946,612,34,24,22],['tires',1080,540,30,22,26],['palletsV',1250,500,14,64,34],['spool',1480,560,40,26,34],
 ['sheet',160,800,84,10,38],['doors',420,820,72,12,40],['plywoodV',640,760,12,80,46],['pallets',800,840,64,14,34],['drum',1000,780,26,14,40],['barrel',1030,792,28,20,34],['sandbags',1180,840,64,16,18],['cartpile',1420,780,52,30,30],
 ['doors',1060,440,144,12,40],['pallets',590,700,128,14,34],['sheet',1300,650,120,10,38],['plywood',340,690,46,10,46],['tires',1520,420,30,22,26],['crate',560,900,40,30,28],
 ['doors',140,1180,72,12,40],['drum',360,1150,26,14,40],['drum',392,1162,26,14,40],['sandbags',600,1200,96,16,18],['cartpile',1080,1180,52,30,30],['palletsV',1560,900,14,64,34],
 ['tires',240,1040,30,22,26],['plywood',480,1010,92,10,46],['spool',700,1060,40,26,34],['pallets',1000,1040,64,14,34],['plywoodV',1200,980,12,80,46],
 // The target lane in the south-east corner, walled off along its north side.
 ['pallets',1380,1110,268,14,34]].map(([kind,x,y,w,h,z],i)=>P('cover-'+i,kind,x,y,w,h,z));
// Work lights on tripods, each fed by a cord.
export const WORKLIGHTS=[[150,196],[860,196],[1570,196],[96,720],[1624,700],[860,1236],[1300,1250],[480,740],[1240,740],[1636,1330]];
const LIGHTS_P=WORKLIGHTS.map(([x,y],i)=>P('worklight-'+i,'worklight',x-6,y-5,12,10,74));
// The front office.
const OFFICE=[
 P('gate-l','gatepost',788,GATE.y-2,12,22,58),P('gate-r','gatepost',920,GATE.y-2,12,22,58,{right:true}),
 P('banner','banner',800,GATE.y+16,120,2,72,{deco:true}),
 P('pegboard','pegboard',962,1370,148,6,70),
 P('counter','counter',950,1440,170,22,30),
 P('paintcrate','paintcrate',1134,1438,34,26,24),
 P('desk','desk',290,1392,160,30,30),
 P('server','server',462,1382,50,22,86),
 P('batteries','batteries',524,1400,66,18,14),
 P('whiteboard','whiteboard',606,1396,58,8,66),
 P('chair','chair',408,1446,18,14,26),
 P('carseat','carseat',660,1560,100,24,26),
 P('stove','stove',776,1570,30,20,26),
 P('cordreel','cordreel',522,1562,28,18,24),
 P('botbench','botbench',1230,1400,140,28,30),
 P('parts','parts',1384,1408,52,24,22),
 ...[1460,1510,1560].map((x,i)=>P('parked-'+i,'botparked',x,1420,30,18,40,{variant:(i+1)%4})),
 P('charger','charger',1606,1402,32,16,30),
 P('officelight','worklight',244,1496,12,10,74),
 P('sandbags-s','sandbags',560,1598,64,16,18)];
export const PROPS=[...WALL,...COVER,...LIGHTS_P,...OFFICE];
// Solids for walking and for shots: every prop except decoration.
export const SOLIDS=PROPS.filter(o=>!o.deco).map(o=>({...o,height:o.z}));
// The robot hatches: plywood doors in the back wall, where Gadget's robots roll in from.
export const HATCHES=[{x:400,y:196},{x:1320,y:196}];
// Paper targets in the lane.
export const TARGETS=[1170,1240,1300].map((y,i)=>({id:i,x:1600,y}));
// The firing line for the lane, chalked on the floor.
export const LANE={x:1420,y0:1130,y1:1340};
// Lights: x, y, radius, r, g, b. Work lights are a cool white; the office is warmer, and Gadget's screens are cyan.
export const LIGHTS=[...WORKLIGHTS.map(([x,y])=>[x,y+20,380,1,1,.97]),[250,1520,210,.96,.9,.78],[370,1420,120,.55,.85,1],[1035,1440,150,1,.86,.62],
 [480,1386,60,.5,1,.6],[1300,1430,110,1,.86,.62],[790,1576,70,1,.7,.42],[400,180,70,1,.42,.36],[1320,180,70,1,.42,.36],[176,1660,120,.8,.84,.9],
 ...[160,420,660,1020,1300,1540].map(x=>[x,1374,110,1,.82,.55])];
// Who works here. Aaron keeps the range; Gadget keeps the lights on and builds the robots.
const aaron=RESIDENTS.find(r=>r.id==='aaron');
const here=l=>l.replace('It was a storm bunker under the cave.','This was a storm bunker.').replace(/down there/g,'down here').replace(' Ask her down here.',' She\'s at her desk by the stairs.').replace('Gadget and I built an arena down here','Gadget and I built this arena');
export const GADGET_TOPICS=[
 {q:'Send in the robots',act:'drill',when:'idle',a:['Hatches opening. Three waves, bigger each time, and the clock starts with the first one.','They stop at the gate line, so the office is safe. Go get them!']},
 {q:'Call off the drill',act:'stop',when:'run',a:['Calling them back. They\'ll be charged again whenever you are.']},
 {q:'What are those things?',a:['Pillows, bedsheets and brooms on wheels off shopping carts. A car battery in each one and the guts of a toy truck.','They roll at you like the real thing. They won\'t bite, but they will bump you, and I count every bump.']},
 {q:'How does a drill work?',a:['Three waves, bigger each time, out of the two hatches in the back wall. Paint them until they fall over.','I time you from the first robot to the last. Fewer bumps and fewer wasted shots is what I write on the board.']},
 {q:'Why paintball?',a:['Real rounds through my robots? Absolutely not. Every gun down here has a paintball twin: same magazine, same rate, same reload.','Different paint for each gun, so I can see who hit what. You get the real thing when you go topside.']},
 {q:'Where does the power come from?',a:['A generator up in camp, by the doors. Extension cords all the way down the stairs. Don\'t trip on them. Seriously.','When it coughs, the lights go, and so do my servers. Bring me fuel if you find any.']},
 {q:'What happened out there?',a:['Marrow Industries. LZ-6, the Lazarus drug. They brought a dead woman back on live TV, and the whole world lined up for a dose.','Two months later she turned. So did everyone who took it, and then everyone they bit.','There was a moment where it looked like we had it under control. The army didn\'t fall in a day. It just ran out of people.']},
 {q:'You and Aaron?',a:['Last two of our unit. No command, no orders, no resupply. Just us, a lot of gear, and Macy telling us where to be useful.']}];
export const ROOM_NPCS=[
 {...aaron,id:'aaron-room',kind:'resident',role:'LEET AF · Range officer',x:1035,y:1416,direction:2,talk:{x:1035,y:1486},
  lines:['Welcome to the Training Grounds. Ask away.','Range is hot. What do you need?'],more:'Anything else?',topics:aaron.topics.map(q=>({...q,a:q.a.map(here)}))},
 {id:'gadget',kind:'resident',name:'Gadget',role:'LEET AF · Engineer',x:376,y:1468,direction:6,talk:{x:376,y:1504},
  look:{body:1,skin:2,hair:9,color:0,beard:0,hat:0,top:8,coat:1,shirt:0,bottom:5,pants:3,shoes:3,boots:1,pack:1,packColor:1},
  lines:['Gadget. I keep the lights on down here, and I build the zombies. Want some?','Mind the cords. Everything in here runs on one generator and a lot of hope.'],more:'Anything else? The robots are charged.',topics:GADGET_TOPICS}];
export const TALK_RANGE=44;
// Things to use: the stairs back up to camp.
export const OBJECTS=[{id:'stairs',kind:'object',verb:'Climb',name:'Stairs to camp',role:'Firelight Camp',x:176,y:1612,mx:176,my:1574}];
