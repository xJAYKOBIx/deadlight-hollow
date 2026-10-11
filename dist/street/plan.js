// The suburbs: nine districts, three by three, around your street (decided 2026-10-11, the Map Style Decision doc). Each district is
// one column of three bands; a band is a row of lots facing south onto its street, as on the old grid, so houses, yards and fences
// keep their shape. Three streets run the whole width (the middle band of each row of districts: your street is the middle one),
// side streets run the whole height between the districts and round the edge, and the two house districts have their own streets
// in their other bands. What fills each district is laid out here by hand, from Master Creator's street and town sets; anything
// scattered (trees, gravestones, parked cars) comes from a seed, so the map is the same every time.
//   back-yard maze (radio)   | water tower and woods | building site (generator)
//   church and cemetery      | your street           | school (the bus lot, the truck)
//   park and creek (go-bag)  | shops and gas station | ball fields
import {rng} from '../mc/assets/core/kit.js';
// A band, in its own units: the front walls along FRONT, the sidewalks and the road south of them, back yards north up to BACK.
// One band is BLOCK wide and BAND tall from street to street; side streets are CROSS wide (sidewalk, road, sidewalk).
export const FRONT=118,WALL_T=12,Z=48,BLOCK=1640,BAND=600,CROSS=160,BACK=-200;
export const SIDEWALK_N={y:236,h:20},ROAD={y:258,h:120},SIDEWALK_S={y:380,h:20},CENTER=318;
// COLS columns of districts, ROWS bands (three to a district).
export const COLS=3,ROWS=9,MARGIN=240,OX=MARGIN+CROSS,OY=MARGIN-BACK;
export const STREET={w:OX+COLS*(BLOCK+CROSS)+MARGIN,h:OY+(ROWS-1)*BAND+SIDEWALK_S.y+SIDEWALK_S.h+MARGIN};
export const MAP=STREET,TOWN={x:MARGIN,y:MARGIN,w:STREET.w-MARGIN*2,h:STREET.h-MARGIN*2};
export const blockAt=(i,j)=>({x:OX+i*(BLOCK+CROSS),y:OY+j*BAND});
export const CROSSES=Array.from({length:COLS+1},(_,k)=>({x:OX+k*(BLOCK+CROSS)-CROSS,w:CROSS}));
// The streets that run east to west, as pieces: the three through streets right across the map (out into the fields at both ends,
// where the truck comes in), and the house districts' own streets from side street to side street.
const road=(j,x,w)=>({j,x,w,y:OY+j*BAND+ROAD.y,h:ROAD.h,sn:OY+j*BAND+SIDEWALK_N.y,ss:OY+j*BAND+SIDEWALK_S.y});
const span=i=>({x:CROSSES[i].x,w:CROSSES[i+1].x+CROSS-CROSSES[i].x});
export const THROUGH=[1,4,7];
export const ROADS=[...THROUGH.map(j=>road(j,0,STREET.w)),...[[0,0],[0,2],[1,3],[1,5]].map(([i,j])=>{const s=span(i);return road(j,s.x,s.w);})].sort((a,b)=>a.y-b.y||a.x-b.x);
// Where a patrol coming down a street starts: the nearest point on any street or side street.
export function roadNear(px,py){let best=null,d=Infinity;const at=(x,y,along)=>{const q=Math.hypot(x-px,y-py);if(q<d){d=q;best={x,y,along};}};
 for(const rd of ROADS)at(Math.max(rd.x+20,Math.min(rd.x+rd.w-20,px)),rd.y+rd.h/2,'x');for(const cr of CROSSES)at(cr.x+cr.w/2,Math.max(TOWN.y+40,Math.min(TOWN.y+TOWN.h-40,py)),'y');return best;}
// Yours is the middle band of the middle district.
export const HOME_BLOCK={i:1,j:4},HOME=blockAt(HOME_BLOCK.i,HOME_BLOCK.j);
export const P=(id,kind,x,y,w,h,z,extra={})=>({id,kind,x,y,w,h,z,...extra});
// A house: its whole roof and front wall in one picture. depth runs back from the face of the front wall.
export const house=(id,x,x1,{windows,door,garage,paint=5,roof=0,chimney,depth=150},o)=>P(id,'house',o.x+x,o.y+FRONT+WALL_T-depth,x1-x,depth,Z,{paint,roof,windows:windows.map(([a,b])=>[a-x,b-x]),door:door-x,...(garage?{garage:[garage[0]-x,garage[1]-x]}:{}),...(chimney!=null?{chimney:chimney-x}:{}),fade:true,door0:o.x+door});
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
// Any other block of houses: four or five lots of different widths, each with a house, its yard and its back yard, from the block's
// seed. maze: the back-yard maze, narrower lots fenced on every side, more sheds, every yard a climb.
function block(i,j,o,{maze=false}={}){const R=rng(i*7919+j*104729+17),chance=p=>R()<p,id=s=>`b${i}${j}-${s}`;
 const houses=[],props=[],paths=[],drives=[],Q=(s,kind,x,y,w,h,z,e)=>props.push(P(id(s),kind,o.x+x,o.y+y,w,h,z,e));
 let x=20,n=0;while(x<BLOCK-(maze?220:260)){const lot=Math.min(BLOCK-20-x,(maze?250:300)+Math.round(R()*(maze?90:140)));if(lot<(maze?220:240))break;const hw=Math.min(lot-50,Math.round((maze?190:210)+R()*(maze?60:130))),hx=x+Math.round((lot-hw)*(.3+R()*.4)),k=n++;
  const garage=chance(.4)&&hw>=240?[hx+hw-74,hx+hw-10]:null,door=Math.round(hx+(garage?hw*.3:hw*(.35+R()*.3))),wins=[];
  for(const wx of [hx+16,hx+hw*.5,hx+hw-62]){const a=Math.round(wx);if(Math.abs(a+22-(door+17))<52||a<hx+10||a+44>(garage?garage[0]-6:hx+hw-10))continue;if(wins.some(([b])=>Math.abs(b-a)<60))continue;wins.push([a,a+44]);}
  const h=house(id('h'+k),hx,hx+hw,{windows:wins,door,garage,paint:5+Math.floor(R()*6),roof:Math.floor(R()*4),chimney:chance(.4)?Math.round(hx+hw*(.2+R()*.6)):null,depth:130+Math.round(R()*30)},o);houses.push(h);props.push(h);
  Q('porch'+k,'porch',door-13,FRONT+WALL_T,60,24,1,{flat:true});paths.push(o.x+door+2);if(garage)drives.push({x:o.x+garage[0]+4,w:garage[1]-garage[0]-8});
  // The front yard: shrubs along the wall, maybe a tree, the mailbox, a fence, a car at the curb and the bins out.
  if(chance(.7)){const bx=chance(.5)?hx+10:Math.min(hx+hw-60,door+44);if(Math.abs(bx-door)>40&&!(garage&&bx+50>garage[0]))Q('bush'+k,'bush',bx,130,40+Math.round(R()*20),16,24+Math.round(R()*4));}
  const tx=Math.round(x+20+R()*(lot-80));if(chance(.45)&&Math.abs(tx+30-door)>50&&!(garage&&tx+60>garage[0]-10&&tx<garage[1]+10))Q('tree'+k,'tree',tx,196,64,10,100,{seed:i*31+j*7+k,box:[28,0,8,10],fade:true});
  Q('mail'+k,'mailbox',door+40,214,10,8,34);if(chance(maze?.6:.35)){const a=x+4,b=door-6;if(b-a>60)Q('pk'+k,'picket',a,222,b-a,4,22);}
  if(chance(.35))Q('car'+k,'car',Math.round(x+R()*(lot-150)),262,140,52,46,{paint:Math.floor(R()*5)});
  if(chance(.3)){Q('bin'+k,'bin',door+56,224,12,10,22,{paint:Math.floor(R()*3)});Q('bin'+k+'b','bin',door+70,224,12,10,22,{paint:Math.floor(R()*3)});}
  // The back yard: a fence along the back and between the lots, a shed, trees.
  const back=maze?(chance(.75)?'woodfence':'chainlink'):chance(.5)?'woodfence':chance(.5)?'chainlink':null;if(back)Q('rear'+k,back,x,BACK+4,lot,4,30,back==='chainlink'?{see:true}:{});
  if(k>0&&chance(maze?1:.6))Q('side'+k,'woodfenceV',x-1,BACK+8,6,FRONT+WALL_T-150-BACK-14,30);
  if(chance(maze?.6:.35))Q('shed'+k,'shed',Math.round(x+20+R()*(lot-110)),BACK+40,64,44,46,{fade:true});
  for(let t=0,nt=Math.floor(R()*3);t<nt;t++){const px=Math.round(x+10+R()*(lot-60)),py=Math.round(BACK+30+R()*60),pine=chance(.4);Q('bt'+k+t,pine?'pine':'tree',px,py,pine?40:64,10,pine?92:100,{seed:i*13+j*29+k*5+t,box:pine?[16,0,8,10]:[28,0,8,10],fade:true});}
  x+=lot;}
 // Along the street: poles, a lamp, a hydrant, and stop signs at the corners.
 for(let px=180+Math.round(R()*120);px<BLOCK-80;px+=380+Math.round(R()*80))if(!paths.some(p=>Math.abs(o.x+px-p)<30))Q('pole'+px,'pole',px,236,12,12,150);
 Q('lamp','streetlamp',Math.round(500+R()*600),238,10,10,110);Q('hyd','hydrant',Math.round(200+R()*1200),240,12,10,18);Q('stop-w','stopsign',8,240,6,6,52);Q('stop-e','stopsign',BLOCK-14,386,6,6,52);
 return {houses,props,paths,drives,home:false};}
// A district's kit: its three bands to fill, and helpers that work in the district's own units (x from its west edge, y from its
// north edge; band k's street is at y k*600+458, its front walls at k*600+330, its back fences at k*600). Each thing goes into the
// band its foot stands in. Q is a prop, G a patch of ground (a floor, or painted lines), B a place you cannot walk (water).
const FW=k=>k*BAND+FRONT+WALL_T-BACK;
function kit(i,r,name){const o=blockAt(i,3*r),dx=o.x,dy=o.y+BACK,R=rng(i*313+r*1013+7),id=s=>`d${i}${r}-${s}`;
 const bands=[0,1,2].map(k=>({i,j:3*r+k,...blockAt(i,3*r+k),houses:[],props:[],paths:[],drives:[],ground:[],blockers:[],home:false,district:name}));
 const bandOf=y=>bands[Math.max(0,Math.min(2,Math.floor((y-dy)/BAND)))];
 const Q=(s,kind,x,y,w,h,z,e={})=>{const p=P(id(s),kind,Math.round(dx+x),Math.round(dy+y),w,h,z,e);bandOf(p.y+p.h-1).props.push(p);return p;};
 const G=(kind,x,y,w,h,e={})=>{bandOf(dy+y).ground.push({kind,x:dx+x,y:dy+y,w,h,ox:dx,oy:dy,...e});};
 const B=(x,y,w,h)=>{bandOf(dy+y).blockers.push({x:dx+x,y:dy+y,w,h});};
 // A house in band k's row, from x to x1, with its porch, its path to the sidewalk and its mailbox.
 const H=(s,k,x,x1,opts)=>{const b=bands[k],h=house(id(s),x,x1,opts,{x:dx,y:b.y});b.houses.push(h);b.props.push(h);b.props.push(P(id(s+'-porch'),'porch',dx+opts.door-13,b.y+FRONT+WALL_T,60,24,1,{flat:true}));b.paths.push(dx+opts.door+2);
  b.props.push(P(id(s+'-mail'),'mailbox',dx+opts.door+40,b.y+214,10,8,34));return h;};
 // Trees through a rectangle, about one every gap units, kept clear of the rectangles in keep.
 const woods=(s,x,y,w,h,gap,keep=[],pines=.7)=>{let n=0;for(let ty=y;ty<y+h-20;ty+=gap)for(let tx=x;tx<x+w-40;tx+=gap){if(R()<.3)continue;const px=Math.round(tx+R()*gap*.8),py=Math.round(ty+R()*gap*.8),pine=R()<pines,tw=pine?40:64;
  if(px+tw>x+w||py+10>y+h||keep.some(k=>px+tw>k[0]-20&&px<k[0]+k[2]+20&&py+10>k[1]-30&&py<k[1]+k[3]+30))continue;Q(s+(n++),pine?'pine':'tree',px,py,tw,10,pine?88+Math.round(R()*16):96+Math.round(R()*16),{seed:i*101+r*37+n,box:pine?[16,0,8,10]:[28,0,8,10],fade:true});}};
 // Poles along a through street's north sidewalk.
 const poles=(k,from=120,to=BLOCK-60)=>{for(let px=from+Math.round(R()*80);px<to;px+=400+Math.round(R()*80))Q('pole'+k+'-'+px,'pole',px,k*BAND+436,12,12,150);};
 return {i,r,o,dx,dy,R,id,bands,Q,G,B,H,woods,poles};}
// The back-yard maze, north-west: three streets of narrow, fully fenced lots. Curtis Webb's house, with the radio, is on the middle one.
function maze(i,r){return [0,1,2].map(k=>{const j=3*r+k,o=blockAt(i,j);return {i,j,...o,...block(i,j,o,{maze:true}),ground:[],blockers:[],district:'maze'};});}
// Your street and the two streets either side of it, as they always were.
function yours(i,r){return [0,1,2].map(k=>{const j=3*r+k,o=blockAt(i,j);return {i,j,...o,...(j===HOME_BLOCK.j?homeBlock(o):block(i,j,o)),ground:[],blockers:[],district:'yours'};});}
// The water tower, north: woods either side of the street, a gravel track up to the tower on its pad, a car that went off the
// road into the trees with one headlight still on, and a trail through the woods to the south.
function tower(i,r){const K=kit(i,r,'tower'),{Q,G}=K,TX=765,TY=560;
 G('gravel',660,470,300,220);G('gravel',800,690,40,346);
 Q('tower','watertower',TX,TY,110,70,360,{lit:true,box:[0,50,110,20]});Q('tower-shed','shed',900,500,64,44,46,{fade:true});Q('tower-truck','car',600,600,140,52,46,{paint:2});
 Q('tower-fence','chainlink',660,474,300,4,30,{see:true});
 // The car in the trees.
 Q('ditch-car','car',300,930,140,52,46,{paint:0});
 // A footpath through the woods, worn bare: one smooth ribbon, wandering south-east; the trees keep off it.
 const trail=[],mid=[];for(let t=0;t<=24;t++){const x=200+t*52,y=1236+t*22+Math.sin(t/3)*26;mid.push([x,y]);trail.push([x-34,y-30,68,60]);}
 G('poly',0,0,0,0,{pts:[...mid.map(([x,y])=>[x,y-24]),...mid.map(([x,y])=>[x,y+24]).reverse()],col:'#2a2219'});
 K.woods('n',20,20,BLOCK-40,980,120,[[640,440,340,600],[300,900,160,90],[780,680,80,360]]);K.woods('s',20,1210,BLOCK-40,570,120,trail);K.poles(1);
 return K.bands;}
// The building site, north-east: a new street of houses going up, the contractor's yard behind them with the office trailer, the
// digger, the dirt and the materials, and Ray Dunham's generator and work light by the trailer. Site fencing round the back.
function site(i,r){const K=kit(i,r,'site'),{Q,G}=K;
 G('dirt',0,0,BLOCK,1030);G('gravel',60,60,700,470);G('dirt',0,1200,BLOCK,600);G('gravel',500,1300,500,300);
 Q('fence-n','sitefence',20,20,BLOCK-40,4,38);Q('fence-s','sitefence',20,1770,BLOCK-40,4,38,{gap:true});
 Q('trailer','sitetrailer',100,120,250,86,72,{lit:true});Q('john-1','portajohn',400,110,24,24,58,{variant:0});Q('john-2','portajohn',432,110,24,24,58,{variant:1});
 Q('digger','excavator',820,300,200,90,120);Q('dirt-1','dirtpile',1080,250,130,70,40);Q('pipes','pipes',1300,150,90,44,72);Q('lumber-1','lumber',1180,420,96,26,22);Q('lumber-2','lumber',1320,440,96,26,22,{variant:1});
 Q('rebar','rebar',560,440,80,20,12);Q('barrier-1','barrier',700,520,52,8,24,{lit:true});Q('cone-1','cone',640,560,8,8,13);Q('cone-2','cone',770,560,8,8,13,{variant:1});
 // Between the yard and the new street: the foreman's pickup, a third heap, drums and crates of fixings, a stack of rebar.
 Q('site-truck','car',1180,620,140,52,46,{paint:1});Q('dirt-3','dirtpile',260,640,130,70,40);Q('drum-1','drum',560,640,26,14,40);Q('drum-2','drum',590,652,26,14,40);
 Q('crate-1','crate',820,700,40,30,28);Q('crate-2','crate',866,708,34,24,22);Q('rebar-2','rebar',1440,700,80,20,12);Q('cone-5','cone',1000,640,8,8,13);
 // The new street: three houses at three stages and a bare slab, a scaffold up the most finished one.
 const f=FW(1);[[0,40],[1,440],[2,840]].forEach(([v,x])=>Q('frame'+v,'houseframe',x,f-150,320,150,56,{variant:v,see:v<2}));Q('slab','slab',1260,f-140,280,140,4,{flat:true});
 Q('scaffold','scaffold',940,f+8,130,26,104,{see:true});for(const x of [200,600,1000,1400])G('concrete',x,f,30,1036-f);
 Q('cone-3','cone',300,1012,8,8,13);Q('cone-4','cone',700,1012,8,8,13);Q('barrier-2','barrier',1150,1004,52,8,24,{lit:true});K.poles(1);
 // South of the street: lots pegged out, a second heap, a toilet blown over, a pile of plywood.
 Q('dirt-2','dirtpile',200,1350,130,70,40);Q('john-3','portajohn',1200,1300,58,24,26,{variant:2});Q('lumber-3','lumber',1300,1500,96,26,22,{variant:1});Q('pipes-2','pipes',700,1620,90,44,72);
 for(let t=0;t<6;t++)Q('peg'+t,'cone',260+t*200,1240,8,8,13);
 return K.bands;}
// The church, west: the white church on your street with its steeple, the cemetery behind it inside an iron fence, the rectory
// beside it, the gravel lot, and over the road the church hall's car park with a fire burning in a barrel.
function church(i,r){const K=kit(i,r,'church'),{Q,G,R}=K,f=FW(1);
 Q('church','church',690,f-200,260,200,330,{fade:true});G('concrete',800,f,40,1036-f);G('concrete',740,f,160,40);
 // The cemetery: an iron fence all round, gates, rows of stones, old trees.
 Q('if-n','ironfence',40,40,1560,4,30,{see:true});Q('if-w','ironfenceV',40,44,6,656,30,{see:true});Q('if-e','ironfenceV',1594,44,6,656,30,{see:true});
 Q('if-s1','ironfence',40,700,260,4,30,{see:true});Q('gate-w','irongate',300,700,60,4,40,{open:true,see:true});Q('if-s2','ironfence',360,700,320,4,30,{see:true});
 Q('if-s3','ironfence',960,700,290,4,30,{see:true});Q('gate-e','irongate',1250,700,60,4,40,{see:true});Q('if-s4','ironfence',1310,700,284,4,30,{see:true});
 const keep=[[180,140,70,10],[1100,300,70,10],[600,500,70,10]];Q('oak-1','tree',180,140,72,10,112,{seed:61,box:[32,0,8,10],fade:true});Q('oak-2','tree',1100,300,72,10,112,{seed:62,box:[32,0,8,10],fade:true});Q('oak-3','tree',600,500,64,10,104,{seed:63,box:[28,0,8,10],fade:true});
 let n=0;for(let y=110;y<660;y+=74)for(let x=100;x<1540;x+=58){if(R()<.22)continue;const gx=Math.round(x+R()*10),gy=Math.round(y+R()*6),v=Math.floor(R()*5);if(keep.some(k=>gx+14>k[0]-10&&gx<k[0]+k[2]+10&&gy>k[1]-24&&gy<k[1]+20))continue;if(gx>660&&gx<980&&gy>640)continue;
  Q('stone'+(n++),'gravestone',gx,gy,14,6,[20,22,18,8,36][v],{variant:v});}
 G('dirt',310,704,40,20);G('dirt',1260,704,40,20);
 // The rectory, the lot and the hall's car park.
 K.H('rectory',1,60,400,{windows:[[90,134],[300,344]],door:200,paint:7,roof:1});G('gravel',1040,760,560,270);
 Q('van','car',1080,800,140,52,46,{paint:2});Q('lot-car','car',1300,900,140,52,46,{paint:4});Q('bench','bench',560,960,44,12,18);Q('oak-4','tree',980,940,64,10,104,{seed:64,box:[28,0,8,10],fade:true});K.poles(1,1040);
 G('asphalt',100,1240,1000,460);G('stalls',120,1250,960,90,{every:60});G('stalls',120,1600,960,90,{every:60});
 Q('hall-1','car',180,1262,140,52,46,{paint:3});Q('hall-2','car',560,1612,140,52,46,{paint:1});Q('hall-3','car',840,1262,140,52,46,{paint:2});Q('hall-bin','dumpster',1140,1260,60,34,36,{paint:0});
 Q('fire','drum',620,1420,26,14,40);K.woods('s',1160,1220,460,560,110);K.woods('w',20,1720,1100,70,90);
 return K.bands;}
// The school, east, where your street ends: the school and its gym on your street, the playground and a portable classroom behind
// them, and over the road the bus lot, fenced, where the truck comes for you. The evacuation hold-out happens here.
function school(i,r){const K=kit(i,r,'school'),{Q,G}=K,f=FW(1);
 Q('school','school',280,f-170,720,170,96,{door:360,fade:true});Q('gym','gym',1060,f-220,380,220,150,{fade:true});
 Q('flag','flagpole',230,f-40,8,8,170);Q('bikes','bikerack',540,f+14,60,10,14);G('concrete',610,f,60,1036-f);G('concrete',560,f,160,30);G('concrete',1230,f,40,1036-f);
 // Behind: the blacktop, the play set, a portable classroom, the back fence.
 G('asphalt',200,180,700,400);G('dirt',940,280,190,110);
 // Painted on the blacktop, worn: a basketball court with its keys and centre circle, and a four-square box.
 const L=(x1,y1,x2,y2,col='#7c7a6e')=>G('line',0,0,0,0,{x1,y1,x2,y2,w:1.5,col}),box=(x,y,w,h,col)=>{L(x,y,x+w,y,col);L(x+w,y,x+w,y+h,col);L(x+w,y+h,x,y+h,col);L(x,y+h,x,y,col);};
 box(240,220,420,320);L(450,220,450,540);G('oval',0,0,0,0,{cx:450,cy:380,rx:44,ry:34,w:1.5,col:'#7c7a6e'});box(240,330,90,100);box(570,330,90,100);
 box(720,250,130,130,'#86784a');L(785,250,785,380,'#86784a');L(720,315,850,315,'#86784a');Q('play','playset',960,300,150,70,90);Q('portable','sitetrailer',1200,220,250,86,72);
 Q('back-fence','chainlink',20,40,BLOCK-40,4,30,{see:true});Q('bench-1','bench',300,620,44,12,18);Q('bench-2','bench',700,620,44,12,18);
 Q('oak-1','tree',80,300,72,10,112,{seed:71,box:[32,0,8,10],fade:true});Q('oak-2','tree',1520,500,64,10,104,{seed:72,box:[28,0,8,10],fade:true});K.poles(1,500,1000);
 // The bus lot: the buses where they stopped, lights round the edge, a fence along the back with two holes in it.
 G('asphalt',0,1200,BLOCK,560);G('stalls',180,1220,1000,80,{every:80});
 Q('bus-1','schoolbus',200,1330,230,56,66);Q('bus-2','schoolbus',200,1460,230,56,66);Q('bus-3','schoolbus',620,1400,230,56,66,{crashed:true});
 for(const x of [60,800,1560])Q('lot-lamp'+x,'streetlamp',x,1214,10,10,110);
 Q('lot-fence-1','chainlink',20,1760,380,4,30,{see:true});Q('lot-fence-2','chainlink',460,1760,640,4,30,{see:true});Q('lot-fence-3','chainlink',1160,1760,460,4,30,{see:true});
 return K.bands;}
// The park and the creek, south-west: the creek runs the height of the district under two footbridges and the road; west of it the
// park (a pond with a path round it, the gazebo, the play set, benches), east of it Linda Hargrove's house with her back yard and
// shed, where she buried the go-bag; woods along the creek to the south.
export const CREEK={x:1130,w:70,bridges:[440,1500]};
const creekX=y=>CREEK.x+Math.sin(y/260)*30;
function park(i,r){const K=kit(i,r,'park'),{Q,G,B}=K,f=FW(1);
 for(let y=0;y<1800;y+=60){if(y+60>1030&&y<1206)continue;const cx=Math.round(creekX(y+30));G('dirt',cx-CREEK.w/2-10,y,CREEK.w+20,60);G('water',cx-CREEK.w/2,y,CREEK.w,60);
  if(!CREEK.bridges.some(b=>y+60>b-6&&y<b+50))B(cx-CREEK.w/2+4,y,CREEK.w-8,60);}
 for(const [k,b] of CREEK.bridges.entries()){const cx=Math.round(creekX(b+28));Q('bridge'+k,'footbridge',cx-70,b,140,56,22,{flat:true});}
 for(let t=0;t<8;t++){const y=120+t*220,cx=creekX(y);if(y>1000&&y<1240)continue;Q('reeds'+t,'cattails',Math.round(cx+(t%2?CREEK.w/2:-CREEK.w/2-40)),y,40,10,26,{flat:true});}
 // The park: the pond and its path, the gazebo, the play set, tables and benches, a few old trees.
 Q('pond','pond',200,260,400,240,2,{flat:true});B(240,290,320,180);B(220,330,360,100);
 for(const [x,y,w,h] of [[150,200,560,20],[150,540,560,20],[150,200,20,360],[690,200,20,360],[710,450,320,20],[420,560,20,476]])G('concrete',x,y,w,h);
 Q('gazebo','gazebo',760,40,150,150,120,{fade:true});G('concrete',825,190,20,260);Q('play','playset',100,660,150,70,90);G('dirt',80,640,190,110);
 Q('bench-1','bench',300,176,44,12,18);Q('bench-2','bench',500,566,44,12,18);Q('bench-3','bench',760,476,44,12,18);Q('picnic-1','picnic',800,640,54,34,18);Q('picnic-2','picnic',560,760,54,34,18);
 Q('bin-1','parkbin',730,520,14,12,24);Q('bin-2','parkbin',460,1000,14,12,24);Q('reeds-p','cattails',560,500,40,10,26,{flat:true});Q('rock-1','boulder',60,520,40,24,18,{variant:0});
 for(const [k,[x,y,s]] of [[300,860,81],[900,860,82],[60,120,83],[1000,300,84]].entries())Q('oak'+k,'tree',x,y,72,10,112,{seed:s,box:[32,0,8,10],fade:true});
 // Linda Hargrove's house over the creek, her yard fenced, her shed; woods behind.
 K.H('hargrove',1,1250,1560,{windows:[[1280,1324],[1480,1524]],door:1400,paint:9,roof:2,chimney:1300});
 Q('h-rear','woodfence',1230,604,390,4,30);Q('h-side','woodfenceV',1229,608,6,f-150-614,30);Q('h-shed','shed',1500,640,64,44,46,{fade:true});
 K.woods('ne',1220,20,400,560,110);K.woods('s',20,1220,BLOCK-40,560,120,[[CREEK.x-80,1200,200,600]]);Q('rock-2','boulder',600,1400,40,24,18,{variant:1});Q('rock-3','boulder',1400,1620,40,24,18,{variant:2});K.poles(1);
 return K.bands;}
// Shops and the gas station, south: a strip of four shops facing their car park, the service lot behind them on the street to the
// north, the gas station at the corner with its canopy, pumps and tall sign, a car that hit the pumps with its lights still on,
// and over the road a used-car lot full of alarms.
function shops(i,r){const K=kit(i,r,'shops'),{Q,G,R}=K;
 G('asphalt',0,0,1120,150);for(const [k,x] of [100,420,760].entries())Q('skip'+k,'dumpster',x,40,60,34,36,{paint:k,open:k===1});
 for(let k=0;k<4;k++)Q('shop'+k,'storefront',100+k*240,180,240,150,86,{variant:k,endL:k===0,endR:k===3,fade:true});
 G('concrete',60,330,1040,30);G('asphalt',40,360,1080,670);G('stalls',100,370,960,80,{every:60});G('stalls',100,930,960,80,{every:60});G('stalls',100,640,960,60,{every:60});
 const cars=[[160,372,1],[460,372,4],[760,632,0],[280,632,2],[900,940,3],[340,940,2]];cars.forEach(([x,y,p],k)=>Q('car'+k,'car',x,y,140,52,46,{paint:p}));
 Q('cart-1','shopcart',620,460,24,14,22);Q('cart-2','shopcart',980,560,24,14,22,{tipped:true});Q('cart-3','shopcart',220,800,24,14,22);Q('phone','payphone',1080,336,14,8,60);Q('news','newsbox',70,340,14,10,24);
 // The gas station.
 G('asphalt',1120,160,520,870);G('concrete',1280,340,280,24);Q('store','gasstore',1300,200,260,140,80,{lit:true,fade:true});Q('ice','icebox',1250,300,44,20,34);Q('skip3','dumpster',1570,100,60,34,36,{paint:2});
 // The canopy sorts as if it stood further back (sink), so the pumps under it and you at them draw over its shaded ground.
 Q('canopy','canopy',1240,600,300,130,110,{box:[0,124,10,6],fade:true,sink:70});for(const [k,x] of [1300,1350,1430,1480].entries())Q('pump'+k,'pump',x,680,18,12,40,{variant:k===2?1:0});
 Q('crash','car',1158,664,140,52,46,{paint:2});Q('sign','pricesign',1500,990,96,10,210,{box:[43,0,10,10]});
 // The car lot.
 G('asphalt',100,1240,1400,480);G('stalls',140,1250,1320,80,{every:110});G('stalls',140,1460,1320,80,{every:110});
 for(let k=0;k<12;k++){if(R()<.2)continue;Q('lot'+k,'car',150+(k%6)*220,k<6?1262:1472,140,52,46,{paint:Math.floor(R()*5)});}
 Q('lot-office','shed',1540,1300,64,44,46,{fade:true});Q('lot-fence','chainlink',20,1750,1600,4,30,{see:true});for(const x of [100,800,1500])Q('lot-lamp'+x,'streetlamp',x,1230,10,10,110);
 return K.bands;}
// The ball fields, south-east: a baseball diamond with its backstop, dugouts and light towers, bleachers and the snack stand by the
// street, and a soccer pitch over the road. Open ground: the place to run a horde round in circles.
function fields(i,r){const K=kit(i,r,'fields'),{Q,G}=K,HP=[500,740];
 G('poly',0,0,0,0,{pts:[[HP[0],HP[1]+30],[HP[0]+250,HP[1]-220],[HP[0],HP[1]-470],[HP[0]-250,HP[1]-220]],col:'#2c241b'});G('poly',0,0,0,0,{pts:[[HP[0],HP[1]-40],[HP[0]+180,HP[1]-220],[HP[0],HP[1]-400],[HP[0]-180,HP[1]-220]],col:'#243826'});
 G('line',0,0,0,0,{x1:HP[0],y1:HP[1],x2:HP[0]+640,y2:HP[1]-640,w:1.5,col:'#9a9a90'});G('line',0,0,0,0,{x1:HP[0],y1:HP[1],x2:HP[0]-480,y2:HP[1]-480,w:1.5,col:'#9a9a90'});
 for(const [x,y] of [[HP[0]+220,HP[1]-220],[HP[0],HP[1]-440],[HP[0]-220,HP[1]-220],[HP[0],HP[1]]])G('poly',0,0,0,0,{pts:[[x-6,y],[x,y-5],[x+6,y],[x,y+5]],col:'#c8c4b8'});
 Q('backstop','backstop',HP[0]-65,HP[1]+20,130,50,96,{see:true});Q('dug-1','dugout',140,HP[1]+10,180,40,50);Q('dug-2','dugout',680,HP[1]+10,180,40,50);
 Q('outfield','chainlink',40,40,1080,4,30,{see:true});for(const [k,[x,y]] of [[40,140],[880,140],[20,960],[900,960]].entries())Q('tower'+k,'lighttower',x,y,120,12,280,{box:[55,0,10,12]});
 // The stands down each baseline, in foul ground; picnic tables and shade out past right field.
 Q('stand-1','bleachers',40,600,220,70,56);Q('stand-2','bleachers',740,600,220,70,56);
 Q('picnic-2','picnic',1220,200,54,34,18);Q('picnic-3','picnic',1380,300,54,34,18);Q('bin-2','parkbin',1320,190,14,12,24);
 Q('oak-1','tree',1480,140,72,10,112,{seed:81,box:[32,0,8,10],fade:true});Q('oak-2','tree',1160,360,64,10,104,{seed:82,box:[28,0,8,10],fade:true});Q('snack','concession',1200,f2(),130,80,84,{lit:true});
 G('gravel',1140,520,480,280);Q('f-car-1','car',1180,560,140,52,46,{paint:1});Q('f-car-2','car',1400,680,140,52,46,{paint:3});
 Q('bin-1','parkbin',1120,980,14,12,24);Q('picnic','picnic',1440,960,54,34,18);K.poles(1);
 // The soccer pitch over the road.
 G('lawn',200,1260,1240,480);G('line',0,0,0,0,{x1:200,y1:1260,x2:1440,y2:1260,w:1.5,col:'#9a9a90'});G('line',0,0,0,0,{x1:200,y1:1740,x2:1440,y2:1740,w:1.5,col:'#9a9a90'});
 G('line',0,0,0,0,{x1:200,y1:1260,x2:200,y2:1740,w:1.5,col:'#9a9a90'});G('line',0,0,0,0,{x1:1440,y1:1260,x2:1440,y2:1740,w:1.5,col:'#9a9a90'});G('line',0,0,0,0,{x1:820,y1:1260,x2:820,y2:1740,w:1.5,col:'#9a9a90'});
 G('oval',0,0,0,0,{cx:820,cy:1500,rx:90,ry:70,w:1.5,col:'#9a9a90'});Q('tower4','lighttower',60,1220,120,12,280,{box:[55,0,10,12]});Q('tower5','lighttower',1460,1220,120,12,280,{box:[55,0,10,12]});
 Q('stand-3','bleachers',700,1760,220,30,40);
 return K.bands;
 function f2(){return FW(1)-80;}}
// Which builder fills each district, column by column, row by row.
const PLAN=[[maze,tower,site],[church,yours,school],[park,shops,fields]];
export const BLOCKS=[];for(let r=0;r<3;r++)for(let i=0;i<COLS;i++)BLOCKS.push(...PLAN[r][i](i,r));
BLOCKS.sort((a,b)=>a.j-b.j||a.i-b.i);
export const DISTRICTS=PLAN.flatMap((row,r)=>row.map((f,i)=>({id:f.name,i,r,x:blockAt(i,3*r).x,y:blockAt(i,3*r).y+BACK,w:BLOCK,h:3*BAND})));
