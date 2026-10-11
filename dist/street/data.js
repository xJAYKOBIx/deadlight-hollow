// The neighbourhood: five blocks by five of a rural suburb, the night it all went wrong. Each block is one row of houses facing
// south onto its street, with back yards behind them running up to the next street north; side streets cross between the blocks,
// and fields and pines run off into the dark round the edge. Your block is in the middle: your house and the neighbours' as they
// always were, and the police cruiser up on the curb in the pole a few houses east. Every other block is laid out from a seed, so
// the map is the same every time. The art is the Master Creator's house and street sets; this file only places it.
import {rng} from '../mc/assets/core/kit.js';
// A block, in its own units: the front walls along FRONT, the sidewalks and the road south of them, back yards north up to BACK.
// One block is BLOCK wide and BAND tall from street to street; side streets are CROSS wide (sidewalk, road, sidewalk).
export const FRONT=118,WALL_T=12,Z=48,BLOCK=1640,BAND=600,CROSS=160,BACK=-200;
export const SIDEWALK_N={y:236,h:20},ROAD={y:258,h:120},SIDEWALK_S={y:380,h:20},CENTER=318;
export const COLS=5,ROWS=5,MARGIN=240,OX=MARGIN+CROSS,OY=MARGIN-BACK;
export const STREET={w:OX+COLS*(BLOCK+CROSS)+MARGIN,h:OY+(ROWS-1)*BAND+SIDEWALK_S.y+SIDEWALK_S.h+MARGIN};
export const MAP=STREET,TOWN={x:MARGIN,y:MARGIN,w:STREET.w-MARGIN*2,h:STREET.h-MARGIN*2};
// The map is drawn and kept in chunks this big; only the ones near you are held.
export const CHUNK=512;
export const WALK={left:60,right:STREET.w-60,top:60,bottom:STREET.h-60};
// Where a block's corner sits, and where the side streets and the streets run.
export const blockAt=(i,j)=>({x:OX+i*(BLOCK+CROSS),y:OY+j*BAND});
export const CROSSES=Array.from({length:COLS+1},(_,k)=>({x:OX+k*(BLOCK+CROSS)-CROSS,w:CROSS}));
export const ROADS=Array.from({length:ROWS},(_,j)=>({y:OY+j*BAND+ROAD.y,h:ROAD.h,sn:OY+j*BAND+SIDEWALK_N.y,ss:OY+j*BAND+SIDEWALK_S.y}));
// Yours is the middle block.
export const HOME_BLOCK={i:2,j:2},HOME=blockAt(HOME_BLOCK.i,HOME_BLOCK.j);
const P=(id,kind,x,y,w,h,z,extra={})=>({id,kind,x,y,w,h,z,...extra});
// A house: its whole roof and front wall in one picture. depth runs back from the face of the front wall.
const house=(id,x,x1,{windows,door,garage,paint=5,roof=0,chimney,depth=150},o)=>P(id,'house',o.x+x,o.y+FRONT+WALL_T-depth,x1-x,depth,Z,{paint,roof,windows:windows.map(([a,b])=>[a-x,b-x]),door:door-x,...(garage?{garage:[garage[0]-x,garage[1]-x]}:{}),...(chimney!=null?{chimney:chimney-x}:{}),fade:true,door0:o.x+door});
// The neighbours' doors: a name, and what you find when you knock.
const NAMES=['The Hendersons\' house','The Okafor house','The Millers\' house','The Ruiz house','The Brennans\' house','The Novak house','The Whitakers\' house','The Lindqvist house','The Duvalls\' house','The Abernathy house','The Kowalskis\' house','The Tran house'];
const KNOCKS=[['You knock. Nothing.','Somewhere inside, something knocks back.'],['Locked. A note is taped to the glass: "Gone to St. Agnes. Stay inside."','The ink has run.'],['You knock. A dog barks once inside, then goes quiet.'],
 ['The door is open a hand\'s width. It is dark inside, and it smells wrong.','You leave it alone.'],['Boards are nailed across the door from the inside.','Someone got ready for this.'],['You knock. A candle in the window goes out.'],
 ['The porch light is smashed. Glass crunches under your shoes.','Nobody answers.'],['Muddy handprints all over the door, at every height.','You step back.']];
// Your block, as it always was: yours (the same windows and door as the house you just left), the corner house to the west and two
// to the east, then the cars, the poles, the lamps and the cruiser.
function homeBlock(o){
 const houses=[house('west',20,250,{windows:[[30,74],[190,234]],door:140},o),house('yours',300,860,{windows:[[370,414],[530,558],[784,828]],door:700,chimney:420},o),
  house('east1',930,1250,{windows:[[970,1014],[1150,1194]],door:1060},o),house('east2',1320,1620,{windows:[[1360,1404],[1520,1564]],door:1440},o)];
 const Q=(id,kind,x,y,w,h,z,e)=>P(id,kind,o.x+x,o.y+y,w,h,z,e);
 const props=[...houses,
  Q('porch','porch',687,FRONT+WALL_T,60,24,1,{flat:true}),Q('bush-y1','bush',324,130,60,16,26),Q('bush-y2','bush',430,130,40,16,24),Q('bush-y3','bush',776,130,60,16,26),
  Q('mailbox','mailbox',752,214,10,8,34),Q('fence-y1','picket',300,222,388,4,22),Q('fence-y2','picket',746,222,114,4,22),
  Q('porch-w','porch',127,FRONT+WALL_T,60,24,1,{flat:true}),Q('bush-w','bush',30,130,60,16,24),Q('porch-e1','porch',1047,FRONT+WALL_T,60,24,1,{flat:true}),Q('bush-e1','bush',1130,130,80,16,26),
  Q('porch-e2','porch',1427,FRONT+WALL_T,60,24,1,{flat:true}),Q('bush-e2','bush',1530,130,60,16,24),Q('fence-e1','picket',930,222,110,4,22),Q('fence-e1b','picket',1110,222,140,4,22),
  // Parked for the night: a car outside your house and one across the road. The cruiser is up on the curb with its nose in the pole.
  Q('car-1','car',352,262,140,52,46,{paint:1}),Q('car-2','car',968,322,140,52,46,{paint:3}),
  Q('cruiser','policecar',1300,206,140,52,46,{crashed:true,lit:0}),Q('pole','pole',1442,218,12,12,150,{lean:14}),Q('pole-2','pole',600,236,12,12,150),
  Q('lamp-1','streetlamp',230,238,10,10,110),Q('lamp-2','streetlamp',1180,238,10,10,110),Q('lamp-3','streetlamp',860,384,10,10,110),Q('hydrant','hydrant',1004,240,12,10,18),
  // Your back yard and the neighbours': the fences you would have climbed as a kid, a shed, two old trees.
  Q('rear-y','woodfence',300,BACK+4,560,4,30),Q('rear-e1','chainlink',930,BACK+4,320,4,30,{see:true}),Q('side-y','woodfenceV',298,BACK+8,6,FRONT+WALL_T-150-BACK-14,30),
  Q('shed-y','shed',760,BACK+40,64,44,46,{fade:true}),Q('tree-y','tree',420,BACK+60,72,10,108,{seed:5,box:[32,0,8,10],fade:true}),Q('tree-w','tree',90,BACK+44,64,10,100,{seed:9,box:[28,0,8,10],fade:true})];
 return {houses,props,paths:houses.map(h=>h.door0+2),drives:[],home:true};}
// Any other block: four or five lots of different widths, each with a house, its yard and its back yard, from the block's seed.
function block(i,j,o){const R=rng(i*7919+j*104729+17),chance=p=>R()<p,id=s=>`b${i}${j}-${s}`;
 const houses=[],props=[],paths=[],drives=[],Q=(s,kind,x,y,w,h,z,e)=>props.push(P(id(s),kind,o.x+x,o.y+y,w,h,z,e));
 let x=20,n=0;while(x<BLOCK-260){const lot=Math.min(BLOCK-20-x,300+Math.round(R()*140));if(lot<240)break;const hw=Math.min(lot-50,Math.round(210+R()*130)),hx=x+Math.round((lot-hw)*(.3+R()*.4)),k=n++;
  const garage=chance(.4)&&hw>=240?[hx+hw-74,hx+hw-10]:null,door=Math.round(hx+(garage?hw*.3:hw*(.35+R()*.3))),wins=[];
  for(const wx of [hx+16,hx+hw*.5,hx+hw-62]){const a=Math.round(wx);if(Math.abs(a+22-(door+17))<52||a<hx+10||a+44>(garage?garage[0]-6:hx+hw-10))continue;if(wins.some(([b])=>Math.abs(b-a)<60))continue;wins.push([a,a+44]);}
  const h=house(id('h'+k),hx,hx+hw,{windows:wins,door,garage,paint:5+Math.floor(R()*6),roof:Math.floor(R()*4),chimney:chance(.4)?Math.round(hx+hw*(.2+R()*.6)):null,depth:130+Math.round(R()*30)},o);houses.push(h);props.push(h);
  Q('porch'+k,'porch',door-13,FRONT+WALL_T,60,24,1,{flat:true});paths.push(o.x+door+2);if(garage)drives.push({x:o.x+garage[0]+4,w:garage[1]-garage[0]-8});
  // The front yard: shrubs along the wall, maybe a tree, the mailbox, a fence, a car at the curb and the bins out.
  if(chance(.7)){const bx=chance(.5)?hx+10:Math.min(hx+hw-60,door+44);if(Math.abs(bx-door)>40&&!(garage&&bx+50>garage[0]))Q('bush'+k,'bush',bx,130,40+Math.round(R()*20),16,24+Math.round(R()*4));}
  const tx=Math.round(x+20+R()*(lot-80));if(chance(.45)&&Math.abs(tx+30-door)>50&&!(garage&&tx+60>garage[0]-10&&tx<garage[1]+10))Q('tree'+k,'tree',tx,196,64,10,100,{seed:i*31+j*7+k,box:[28,0,8,10],fade:true});
  Q('mail'+k,'mailbox',door+40,214,10,8,34);if(chance(.35)){const a=x+4,b=door-6;if(b-a>60)Q('pk'+k,'picket',a,222,b-a,4,22);}
  if(chance(.35))Q('car'+k,'car',Math.round(x+R()*(lot-150)),262,140,52,46,{paint:Math.floor(R()*5)});
  if(chance(.3)){Q('bin'+k,'bin',door+56,224,12,10,22,{paint:Math.floor(R()*3)});Q('bin'+k+'b','bin',door+70,224,12,10,22,{paint:Math.floor(R()*3)});}
  // The back yard: a fence along the back and between the lots, a shed, trees.
  const back=chance(.5)?'woodfence':chance(.5)?'chainlink':null;if(back)Q('rear'+k,back,x,BACK+4,lot,4,30,back==='chainlink'?{see:true}:{});
  if(k>0&&chance(.6))Q('side'+k,'woodfenceV',x-1,BACK+8,6,FRONT+WALL_T-150-BACK-14,30);
  if(chance(.35))Q('shed'+k,'shed',Math.round(x+20+R()*(lot-110)),BACK+40,64,44,46,{fade:true});
  for(let t=0,nt=Math.floor(R()*3);t<nt;t++){const px=Math.round(x+10+R()*(lot-60)),py=Math.round(BACK+30+R()*60),pine=chance(.4);Q('bt'+k+t,pine?'pine':'tree',px,py,pine?40:64,10,pine?92:100,{seed:i*13+j*29+k*5+t,box:pine?[16,0,8,10]:[28,0,8,10],fade:true});}
  x+=lot;}
 // Along the street: poles, a lamp, a hydrant, and stop signs at the corners.
 for(let px=180+Math.round(R()*120);px<BLOCK-80;px+=380+Math.round(R()*80))if(!paths.some(p=>Math.abs(o.x+px-p)<30))Q('pole'+px,'pole',px,236,12,12,150);
 Q('lamp','streetlamp',Math.round(500+R()*600),238,10,10,110);Q('hyd','hydrant',Math.round(200+R()*1200),240,12,10,18);Q('stop-w','stopsign',8,240,6,6,52);Q('stop-e','stopsign',BLOCK-14,386,6,6,52);
 return {houses,props,paths,drives,home:false};}
export const BLOCKS=[];
for(let j=0;j<ROWS;j++)for(let i=0;i<COLS;i++){const o=blockAt(i,j);BLOCKS.push({i,j,...o,...(i===HOME_BLOCK.i&&j===HOME_BLOCK.j?homeBlock(o):block(i,j,o))});}
// Round the edge of town: pines and a few trees in the fields, and a farm fence along the top row's back yards and past the bottom street.
const tree=(x,y,seed,pine)=>P(`edge-${x}-${y}`,pine?'pine':'tree',x,y,pine?40:64,10,pine?96:104,{seed,box:pine?[16,0,8,10]:[28,0,8,10],fade:true});
const EDGE_TREES=[];{const R=rng(4242);
 for(let x=60;x<STREET.w-60;x+=50+R()*60)for(const y of [40+R()*80,STREET.h-MARGIN+50+R()*110])EDGE_TREES.push(tree(Math.round(x),Math.round(y),Math.round(x+y),R()<.7));
 for(let y=MARGIN;y<STREET.h-MARGIN;y+=50+R()*60)for(const x of [30+R()*110,STREET.w-MARGIN+70+R()*110])EDGE_TREES.push(tree(Math.round(x),Math.round(y),Math.round(x*3+y),R()<.7));}
const FIELD_FENCES=[];for(let i=0;i<COLS;i++){const o=blockAt(i,0),q=blockAt(i,ROWS-1);FIELD_FENCES.push(P(`farm-n${i}`,'chainlink',o.x,o.y+BACK,BLOCK,4,30,{see:true}),P(`farm-s${i}`,'chainlink',q.x,q.y+SIDEWALK_S.y+SIDEWALK_S.h+30,BLOCK,4,30,{see:true}));}
export const HOUSES=BLOCKS.flatMap(b=>b.houses);
export const PROPS=[...BLOCKS.flatMap(b=>b.props),...EDGE_TREES,...FIELD_FENCES];
// What stops feet: everything standing up, by its footprint or, for a tree, its trunk. What stops bullets: anything 20 or more tall
// you cannot see through.
const boxOf=o=>o.box?{x:o.x+o.box[0],y:o.y+o.box[1],w:o.box[2],h:o.box[3]}:{x:o.x,y:o.y,w:o.w,h:o.h};
export const SOLIDS=PROPS.filter(o=>!o.flat).map(o=>({...boxOf(o),z:o.z,see:!!o.see,id:o.id}));
// A grid over the map, so feet and bullets only check what is near them.
const CELL=128,grid=new Map(),key=(cx,cy)=>cx+cy*1000,cells=(b,f)=>{for(let cy=Math.floor(b.y/CELL);cy<=Math.floor((b.y+b.h)/CELL);cy++)for(let cx=Math.floor(b.x/CELL);cx<=Math.floor((b.x+b.w)/CELL);cx++)f(key(cx,cy));};
for(const s of SOLIDS)cells(s,k=>{if(!grid.has(k))grid.set(k,[]);grid.get(k).push(s);});
const inRect=(x,y,r,b)=>{const dx=x-Math.max(b.x,Math.min(x,b.x+b.w)),dy=y-Math.max(b.y,Math.min(y,b.y+b.h));return dx*dx+dy*dy<r*r;};
// The first solid a circle of radius r at (x, y) touches, if any.
export function solidAt(x,y,r){let hit=null;cells({x:x-r,y:y-r,w:r*2,h:r*2},k=>{if(hit)return;for(const s of grid.get(k)||[])if(inRect(x,y,r,s)){hit=s;return;}});return hit;}
// What would stop a bullet at this point.
export function coverAt(x,y){for(const s of grid.get(key(Math.floor(x/CELL),Math.floor(y/CELL)))||[])if(s.z>=20&&!s.see&&x>=s.x&&x<=s.x+s.w&&y>=s.y&&y<=s.y+s.h)return s;return null;}
// Where you come out, on your step, and the door back in.
const H=(x,y)=>({x:HOME.x+x,y:HOME.y+y});
export const START={...H(717,162),direction:2};
export const CRUISER=H(1370,232);
// Things to use: your door back inside, the cruiser's trunk once it is safe, and every neighbour's door.
const cr=PROPS.find(p=>p.id==='cruiser');
export const OBJECTS=[
 {id:'frontdoor',prop:'yours',verb:'Go in',name:'Your front door',role:'Home',...H(717,146),mx:HOME.x+717,my:HOME.y+FRONT-Z-6,range:34,facing:true},
 {id:'cruiser',prop:'cruiser',verb:'Search',name:'Police cruiser',role:'The trunk',x:cr.x+22,y:cr.y+cr.h+12,mx:cr.x+22,my:cr.y-cr.z-4,range:44},
 {id:'door-e1',prop:'east1',verb:'Knock',name:'The Parks\' house',role:'Next door',...H(1077,150),mx:HOME.x+1077,my:HOME.y+FRONT-Z-6,range:34,lines:['You knock, softly. Nothing.','Through the glass, a candle moves away from the door and goes out.']},
 {id:'door-w',prop:'west',verb:'Knock',name:'The corner house',role:'Next door',...H(157,150),mx:HOME.x+157,my:HOME.y+FRONT-Z-6,range:34,lines:['The door is open a crack. It is completely dark inside, and it smells wrong.','You pull it shut.']},
 ...BLOCKS.filter(b=>!b.home).flatMap(b=>b.houses.map((h,k)=>{const d=h.door0+17,s=(b.i*5+b.j)*3+k;return {id:'door-'+h.id,prop:h.id,verb:'Knock',name:NAMES[s%NAMES.length],role:'A neighbour',x:d,y:b.y+FRONT+WALL_T+20,mx:d,my:b.y+FRONT-Z-6,range:34,lines:KNOCKS[(s*7+3)%KNOCKS.length]};}))];
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
  {look:'neighbour',...H(1200,540),delay:10},{look:'neighbour2',...H(1450,540),delay:10.4},{look:'jogger',...H(1600,170),delay:10.8},{look:'worker',...H(1150,170),delay:11.2},{look:'robe',...H(1700,520),delay:11.6},
  {look:'worker',kind:'crawler',...H(1330,580),delay:8}]];
// The rest of the neighbourhood: two to four in every other block, wandering their yards and the street until they notice you.
export const ROAMERS=[];{const R=rng(9091),LOOKS=['neighbour','jogger','robe','worker','neighbour2'];
 for(const b of BLOCKS){if(b.home)continue;for(let k=0,n=2+Math.floor(R()*3);k<n;k++)for(let tries=0;tries<20;tries++){const x=Math.round(b.x+40+R()*(BLOCK-80)),y=Math.round(b.y+(R()<.6?150+R()*230:BACK+30+R()*120));if(!solidAt(x,y,10)){ROAMERS.push({look:LOOKS[Math.floor(R()*LOOKS.length)],x,y});break;}}}}
// The cop turns round when you come this close, or the moment you fire. Wanderers notice you as close, and hear a shot from further.
export const NOTICE=190,HEAR=420;
// Light: the moon in patches over everything, a candle in a window here and there, and the cruiser's one working headlight.
const moon=(x,y,rad)=>[x,y,rad,.6,.7,1];
export const LIGHTS=[];{const R=rng(77);for(let y=200;y<STREET.h;y+=420)for(let x=200;x<STREET.w;x+=520)LIGHTS.push(moon(Math.round(x+R()*240),Math.round(y+R()*200),240+Math.round(R()*60)));
 LIGHTS.push(...[[992,140,70,1,.72,.42],[1490,236,90,1,.95,.75],[1530,240,60,1,.95,.8]].map(([x,y,...l])=>[HOME.x+x,HOME.y+y,...l]));
 for(const h of HOUSES){if(['west','yours','east1','east2'].includes(h.id)||R()>=.12)continue;const w=h.windows[0];if(w)LIGHTS.push([h.x+w[0]+22,h.y+h.h+14,60,1,.72,.42]);}}
export const LIGHT_BAR=H(1370,184);
