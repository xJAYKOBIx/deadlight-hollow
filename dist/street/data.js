// Your street, the night it all went wrong: your house and the neighbours' along the north side, the road, and the lawns across
// it running off into the dark. A police cruiser came down here too fast and went up the curb into a pole a few houses east of
// yours; its light bar is still turning. The art is the Master Creator's house and street sets; this file only places it.
export const STREET={w:1640,h:560};
// Where things run across the map: the front walls of the houses, the sidewalks and the road between them.
export const FRONT=118,WALL_T=12,Z=48,WALK={left:8,right:STREET.w-8,top:FRONT+WALL_T+2,bottom:524};
export const SIDEWALK_N={y:236,h:20},ROAD={y:258,h:120},SIDEWALK_S={y:380,h:20},CENTER=318;
const P=(id,kind,x,y,w,h,z,extra={})=>({id,kind,x,y,w,h,z,...extra});
// A house front: siding wall from x0 to x1 with its windows and the front door. Only the front wall shows; the roof is painted
// into the ground above it.
function front(id,x0,x1,windows,door){const out=[],gaps=[...windows.map(([a,b])=>[a,b,'window']),[door,door+34,'frontdoor']].sort((a,b)=>a[0]-b[0]);let cur=x0,k=0;
 for(const [a,b,kind] of gaps){if(a>cur)out.push(P(`${id}-wall${k++}`,'wall',cur,FRONT,a-cur,WALL_T,Z,{paint:5,wall:true}));out.push(P(`${id}-${kind}${a}`,kind,a,FRONT,b-a,WALL_T,Z,{paint:5,wall:true,...(kind==='window'?{curtain:k%2}:{})}));cur=b;}
 if(x1>cur)out.push(P(`${id}-wall${k}`,'wall',cur,FRONT,x1-cur,WALL_T,Z,{paint:5,wall:true}));return out;}
// Yours (the same windows and door as the house you just left), the corner house to the west and two to the east.
export const HOUSES=[{id:'west',x0:-20,x1:250,door:140},{id:'yours',x0:300,x1:860,door:700},{id:'east1',x0:930,x1:1250,door:1060},{id:'east2',x0:1320,x1:1660,door:1440}];
const FRONTS=[...front('west',-20,250,[[30,74],[190,234]],140),...front('yours',300,860,[[370,414],[530,558],[784,828]],700),
 ...front('east1',930,1250,[[970,1014],[1150,1194]],1060),...front('east2',1320,1660,[[1360,1404],[1520,1564]],1440)];
const YARDS=[
 // Your yard: the step, the path, shrubs along the wall, the mailbox and the picket fence, as you see it from the hall window.
 P('porch','porch',687,FRONT+WALL_T,60,24,1,{flat:true}),P('bush-y1','bush',324,130,60,16,26),P('bush-y2','bush',430,130,40,16,24),P('bush-y3','bush',776,130,60,16,26),
 P('mailbox','mailbox',752,214,10,8,34),P('fence-y1','picket',300,222,388,4,22),P('fence-y2','picket',746,222,114,4,22),
 // The neighbours': a step and a shrub or two each.
 P('porch-w','porch',127,FRONT+WALL_T,60,24,1,{flat:true}),P('bush-w','bush',20,130,70,16,24),P('porch-e1','porch',1047,FRONT+WALL_T,60,24,1,{flat:true}),P('bush-e1','bush',1130,130,80,16,26),
 P('porch-e2','porch',1427,FRONT+WALL_T,60,24,1,{flat:true}),P('bush-e2','bush',1530,130,60,16,24),P('fence-e1','picket',930,222,110,4,22),P('fence-e1b','picket',1110,222,140,4,22),
 // Across the road: a hedge and a fence where the lawns end, and the dark past them.
 P('hedge-s1','bush',60,470,140,16,28),P('fence-s1','picket',240,474,300,4,22),P('hedge-s2','bush',620,470,120,16,26),P('fence-s2','picket',780,474,260,4,22),P('hedge-s3','bush',1120,470,100,16,28),P('fence-s3','picket',1300,474,320,4,22)];
const STREETSIDE=[
 // Parked for the night: a car outside your house and one across the road.
 P('car-1','car',352,262,140,52,46,{paint:1}),P('car-2','car',968,322,140,52,46,{paint:3}),
 // The cruiser, up on the curb with its nose in the pole. The pole took the hit and leans.
 P('cruiser','policecar',1300,206,140,52,46,{crashed:true,lit:0}),P('pole','pole',1442,218,12,12,150,{lean:14}),P('pole-2','pole',600,236,12,12,150),
 P('lamp-1','streetlamp',230,238,10,10,110),P('lamp-2','streetlamp',1180,238,10,10,110),P('lamp-3','streetlamp',860,384,10,10,110),P('hydrant','hydrant',1004,240,12,10,18)];
export const PROPS=[...FRONTS,...YARDS,...STREETSIDE];
// What stops feet and bullets: everything standing up. The step and the walls' doors are walls like the rest.
export const SOLIDS=PROPS.filter(o=>!o.flat);
// Where you come out, on your step, and the door back in.
export const START={x:717,y:162,direction:2};
// Things to use: your door back inside, the cruiser's trunk once it is safe, and the neighbours' doors.
const at=(id,dx,dy)=>{const o=PROPS.find(p=>p.id===id);return {x:o.x+dx,y:o.y+o.h+dy,mx:o.x+dx,my:o.y-o.z-4};};
export const OBJECTS=[
 {id:'frontdoor',prop:'yours-frontdoor700',verb:'Go in',name:'Your front door',role:'Home',x:717,y:146,mx:717,my:FRONT-Z-6,range:34,facing:true},
 {id:'cruiser',prop:'cruiser',verb:'Search',name:'Police cruiser',role:'The trunk',...at('cruiser',22,12),range:44},
 {id:'door-e1',prop:'east1-frontdoor1060',verb:'Knock',name:'The Parks\' house',role:'Next door',x:1077,y:150,mx:1077,my:FRONT-Z-6,range:34,lines:['You knock, softly. Nothing.','Through the glass, a candle moves away from the door and goes out.']},
 {id:'door-w',prop:'west-frontdoor140',verb:'Knock',name:'The corner house',role:'Next door',x:157,y:150,mx:157,my:FRONT-Z-6,range:34,lines:['The door is open a crack. It is completely dark inside, and it smells wrong.','You pull it shut.']}];
// The dead. Each has a look (zombie looks in street/scene.js), where it starts, and when it comes: wave 1 is the cop at the cruiser
// and the two the noise brings; wave 2 comes once you open the trunk.
export const COP={x:1376,y:292,direction:6};
export const WAVES=[
 [{look:'cop',x:COP.x,y:COP.y,direction:COP.direction,idle:true},{look:'neighbour',x:1285,y:140,delay:1.2},{look:'jogger',x:1250,y:540,delay:2.4}],
 [{look:'robe',x:20,y:300,delay:1},{look:'worker',x:640,y:548,delay:2.2},{look:'neighbour2',x:1620,y:420,delay:3.6}]];
// The cop turns round when you come this close, or the moment you fire.
export const NOTICE=190;
// Light: the moon over everything, a candle behind the Parks' window, and the cruiser's one working headlight into the pole.
const moon=(x,y,rad)=>[x,y,rad,.6,.7,1];
export const LIGHTS=[moon(300,300,260),moon(900,320,260),moon(1500,320,240),[992,140,70,1,.72,.42],[1490,236,90,1,.95,.75],[1530,240,60,1,.95,.8]];
export const LIGHT_BAR={x:1370,y:184};
