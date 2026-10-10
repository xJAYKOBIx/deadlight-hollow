// The starter house: the survivor's small one-story home on the night it all went wrong. Living room and kitchen along the
// north, the bedroom, bathroom and front hall along the south. The power is out; the moon comes in through the windows and a
// candle burns on the coffee table. A dog and a cat live here and go about their own business.
// The art for every piece comes from the Master Creator (mc/assets/props/home.js); this file only places it.
export const HOME={w:760,h:600};
// The house itself and the walls' measurements: outside walls 12 thick, inside walls 10, all cut away at 48 high.
export const HOUSE={x:100,y:70,w:560,h:420},Z=48,T=12,IT=10;
// Inside, where the survivor can walk.
export const INSIDE={left:HOUSE.x+T,top:HOUSE.y+T,right:HOUSE.x+HOUSE.w-T,bottom:HOUSE.y+HOUSE.h-T};
const MID=290,LK=470,BB=290,BH=400;
// Rooms, for the floors and for the pets finding their way around. Paint is the wall color each room's walls are seen in.
export const ROOMS=[
 {id:'living',name:'Living room',x:INSIDE.left,y:INSIDE.top,w:LK-INSIDE.left,h:MID-INSIDE.top,floor:'wood',paint:0},
 {id:'kitchen',name:'Kitchen',x:LK+IT,y:INSIDE.top,w:INSIDE.right-LK-IT,h:MID-INSIDE.top,floor:'tile',paint:1},
 {id:'bedroom',name:'Bedroom',x:INSIDE.left,y:MID+IT,w:BB-INSIDE.left,h:INSIDE.bottom-MID-IT,floor:'carpet',paint:2},
 {id:'bath',name:'Bathroom',x:BB+IT,y:MID+IT,w:BH-BB-IT,h:INSIDE.bottom-MID-IT,floor:'bathtile',paint:3},
 {id:'hall',name:'Front hall',x:BH+IT,y:MID+IT,w:INSIDE.right-BH-IT,h:INSIDE.bottom-MID-IT,floor:'wood',paint:4}];
// Doorways between rooms: where they are, and the two rooms they join.
export const DOORS=[
 {a:'living',b:'kitchen',x:LK+IT/2,y:175,axis:'v',from:150,to:200},
 {a:'living',b:'bedroom',x:269,y:MID+IT/2,axis:'h',from:252,to:286},
 {a:'living',b:'hall',x:438,y:MID+IT/2,axis:'h',from:420,to:456},
 {a:'kitchen',b:'hall',x:578,y:MID+IT/2,axis:'h',from:560,to:596},
 {a:'hall',b:'bath',x:BH+IT/2,y:438,axis:'v',from:420,to:456}];
const P=(id,kind,x,y,w,h,z,extra={})=>({id,kind,x,y,w,h,z,...extra});
// A run of wall from a to b, broken by doorways, windows and the front door. paint(x or y) gives the color of each stretch.
function run(id,axis,at,a,b,gaps,paint,t){const out=[];let cur=a,k=0;const seg=(s,e)=>{if(e<=s)return;
  // A stretch is split wherever the room on its face changes color.
  let x=s;while(x<e){let n=x+1;while(n<e&&paint(n)===paint(x))n++;out.push(axis==='h'?P(`${id}-${k++}`,'wall',x,at,n-x,t,Z,{paint:paint(x),wall:true}):P(`${id}-${k++}`,'wallV',at,x,t,n-x,Z,{paint:paint(x),wall:true}));x=n;}};
 for(const [s,e,type,extra] of gaps){seg(cur,s);const kind=axis==='h'?{door:'doorway',window:'window',front:'frontdoor'}[type]:{door:'doorwayV',window:'windowV'}[type];
  out.push(axis==='h'?P(`${id}-${type}${s}`,kind,s,at,e-s,t,Z,{paint:paint(s),wall:type!=='door',...extra}):P(`${id}-${type}${s}`,kind,at,s,t,e-s,Z,{paint:paint(s),wall:type!=='door',...extra}));cur=e;}
 seg(cur,b);return out;}
const H=HOUSE,X1=H.x+H.w,Y1=H.y+H.h;
// Vertical walls go first so the horizontal walls they meet are drawn over their ends.
const VERTICAL=[...run('west','v',H.x,H.y,Y1,[[150,194,'window'],[360,404,'window']],()=>5,T),
 ...run('east','v',X1-T,H.y,Y1,[[130,174,'window'],[370,414,'window']],()=>5,T),
 ...run('lk','v',LK,INSIDE.top,MID+IT,[[150,200,'door']],()=>0,IT),
 ...run('bb','v',BB,MID+IT,INSIDE.bottom,[],()=>2,IT),
 ...run('bh','v',BH,MID+IT,INSIDE.bottom,[[420,456,'door']],()=>3,IT)];
const HORIZONTAL=[...run('north','h',H.y,INSIDE.left,INSIDE.right,[[166,210,'window',{curtain:0}],[330,374,'window',{curtain:0}],[566,610,'window',{curtain:1}]],x=>x<LK+IT/2?0:1,T),
 ...run('mid','h',MID,INSIDE.left,INSIDE.right,[[252,286,'door'],[420,456,'door'],[560,596,'door']],x=>x<BB+IT/2?2:x<BH+IT/2?3:4,IT),
 ...run('south','h',INSIDE.bottom,INSIDE.left,INSIDE.right,[[170,214,'window'],[330,358,'window'],[500,534,'front'],[584,628,'window']],()=>5,T)];
// Pictures, a clock, the calendar, a mirror and the coat hooks hang on the face of the wall at their y.
const WALL_DECOR=[P('pic-family','frame',212,H.y,20,T,Z,{pic:0}),P('clock','clock',302,H.y,16,T,Z),P('calendar','calendar',520,H.y,16,T,Z),
 P('pic-dog','frame',160,MID,20,IT,Z,{pic:2,top:4,fh:9}),P('pic-beach','frame',212,MID,22,IT,Z,{pic:3,fw:16,fh:10,top:4,gold:true}),
 P('mirror-bath','mirror',374,MID,20,IT,Z,{fw:14}),P('mirror-hall','mirror',510,MID,24,IT,Z),P('hooks','hooks',600,MID,30,IT,Z)];
const FURNITURE=[
 // Living room: the couch facing the TV, the coffee table with the candle, an armchair, books and the pets' corner.
 P('rug-living','rug',204,128,120,80,1,{style:0,flat:true}),P('tv','tv',240,82,56,18,48),P('coffeetable','coffeetable',242,148,52,24,14),P('sofa','sofa',224,188,88,34,30),
 P('endtable','endtable',316,200,20,16,20),P('armchair','armchair',118,84,34,30,30),P('floorlamp','floorlamp',154,84,12,10,62),P('bookshelf','bookshelf',398,82,42,12,64),
 P('plant','plant',446,84,16,16,40),P('dogbed','dogbed',382,196,40,28,4,{flat:true}),P('cattree','cattree',118,190,30,28,66),P('plant-2','plant',448,206,16,16,40),
 // Kitchen: fridge, counter, sink under the window and the stove along the back; the table and chairs; the pets' bowls.
 P('fridge','fridge',484,82,30,24,70),P('counter','counter',514,82,38,22,30),P('sink','sink',552,82,60,22,30),P('stove','stove',612,82,30,22,30),
 P('dtable','dtable',532,170,56,32,22),P('chair-nw','chair',538,156,16,14,30,{face:'s'}),P('chair-ne','chair',566,156,16,14,30,{face:'s'}),P('chair-sw','chair',538,200,16,14,30,{face:'n'}),P('chair-se','chair',566,200,16,14,30,{face:'n'}),
 P('petbowls','petbowls',606,220,26,12,1,{flat:true}),P('trash','trash',486,222,14,12,22),
 // Bedroom: the bed, the nightstand with the pistol in it, a dresser, a rug and the laundry.
 P('nightstand','nightstand',116,300,22,16,22),P('bed','bed',140,300,64,86,16),P('dresser','dresser',206,300,44,18,36),P('rug-bed','rug',146,392,72,36,1,{style:1,flat:true}),P('laundry','laundry',262,404,18,14,14),
 // Bathroom: tub along the back, the toilet beside it, a mat.
 P('tub','tub',302,300,70,30,18),P('toilet','toilet',376,300,18,26,16),P('bathmat','rug',318,370,46,28,1,{style:3,flat:true}),
 // Front hall: the closet with the lockbox, the hall table, shoes by the door and the mat.
 P('closet','closet',462,300,46,18,66),P('console','console',512,300,42,14,28),P('shoes','shoes',574,410,28,14,1,{flat:true}),P('runner','rug',440,340,150,30,1,{style:0,flat:true}),P('doormat','doormat',502,462,30,14,1,{flat:true}),P('plant-hall','plant',626,302,16,16,40)];
// Out front: the step, a path to the mailbox, shrubs along the wall and the picket fence.
const OUTSIDE=[P('porch','porch',487,490,60,24,1,{flat:true}),P('bush-w','bush',124,492,60,16,26),P('bush-w2','bush',230,492,40,16,24),P('bush-e','bush',576,492,60,16,26),
 P('mailbox','mailbox',548,560,10,8,34),P('fence-w','picket',40,582,420,4,22),P('fence-e','picket',580,582,140,4,22),P('bush-n','bush',300,30,90,16,26),P('bush-n2','bush',560,34,60,16,24)];
export const WALLS=[...VERTICAL,...HORIZONTAL];
export const PROPS=[...WALLS,...WALL_DECOR.map(o=>({...o,deco:true})),...FURNITURE,...OUTSIDE];
// What stops feet: walls (not doorways), and everything standing on the floor.
export const SOLIDS=PROPS.filter(o=>!o.flat&&!o.deco&&o.kind!=='doorway'&&o.kind!=='doorwayV');
// The path out front and the floors, for the ground art.
export const PATH={x:502,y:514,w:30,h:86};
export const START={x:206,y:226,direction:1};
export const USE_RANGE=40;
const at=(id,dy=12)=>{const o=PROPS.find(p=>p.id===id);return {x:o.x+o.w/2,y:o.y+o.h+dy,mx:o.x+o.w/2,my:o.y-o.z-4};};
// Things to look at and use. The nightstand and the closet hold the guns; picking them up comes next.
export const OBJECTS=[
 {id:'tv',verb:'Look',name:'The TV',role:'Living room',...at('tv',60),lines:['Dead since the power went. A second before it did, the anchor was shouting about the bridges.','You can still hear sirens outside. More of them than before.']},
 {id:'window',prop:'north-window330',verb:'Look',name:'Front window',role:'Living room',...at('north-window330',28),lines:['Your street, under the moon. Every porch light is out.','Somebody\'s car alarm is going, a few houses down. Nobody comes out to stop it.']},
 {id:'nightstand',verb:'Open',name:'Nightstand',role:'Bedroom',...at('nightstand',10),lines:['The top drawer sticks, like always.','Something heavy rolls around inside.']},
 {id:'closet',verb:'Open',name:'Hall closet',role:'Front hall',...at('closet',10),lines:['Coats, boxes of who-knows-what, and the vacuum nobody uses.','The lockbox is on the floor at the back. Your fingers still know the code.']},
 {id:'fridge',verb:'Open',name:'Fridge',role:'Kitchen',...at('fridge',10),lines:['Still cold, for now.','Leftover pizza, mustard and a jar of pickles nobody remembers buying.']},
 {id:'bookshelf',verb:'Look',name:'Bookcase',role:'Living room',...at('bookshelf',12),lines:['Paperbacks, a dog-training book with the spine cracked at chapter two, and a first-aid manual still in its plastic.']},
 {id:'frontdoor',prop:'south-front500',verb:'Leave',name:'Front door',role:'Front hall',x:517,y:452,mx:517,my:INSIDE.bottom-Z-6,lines:['You put your hand on the lock and stop.','Not without something to protect yourself with.']}];
// The dog and the cat. Each has its own spots around the house: where it naps, eats, watches and waits.
// A spot is a floor point and a pose. A perch lifts the animal onto furniture: it hops from the floor point up to (x, y) at
// height h, drawn at depth d so the furniture in front of it still covers its feet.
export const PETS=[
 {id:'dog',name:'Dog',role:'Your dog',look:{species:0,breed:1,coat:3,marking:0,eyes:0,collar:0},radius:7,speed:42,
  spots:[{x:402,y:210,pose:'lie',room:'living',time:[14,24],weight:3},{x:594,y:226,pose:'sniff',room:'kitchen',time:[4,7],face:0,weight:2},
   {x:517,y:420,pose:'lie',room:'hall',time:[10,18],face:2,weight:2},{x:506,y:182,pose:'lie',room:'kitchen',time:[8,14],weight:1},
   {x:182,y:410,pose:'lie',room:'bedroom',time:[10,18],weight:2},{x:188,y:118,pose:'sit',room:'living',time:[6,10],face:6,weight:1},
   {x:420,y:150,pose:'stretch',room:'living',time:[2,3],weight:1},{x:452,y:396,pose:'sit',room:'hall',time:[5,9],face:2,weight:1}]},
 {id:'cat',name:'Cat',role:'Your cat',look:{species:1,breed:0,coat:4,marking:1,eyes:2,collar:3},radius:5,speed:30,
  spots:[{x:150,y:238,pose:'lie',room:'living',time:[16,28],weight:3,perch:{x:133,y:212,h:62,d:217.5}},
   {x:268,y:182,pose:'lie',room:'living',time:[12,20],weight:2,perch:{x:268,y:200,h:14,d:221.5}},
   {x:172,y:396,pose:'lie',room:'bedroom',time:[16,26],weight:3,perch:{x:172,y:356,h:16,d:386.5}},
   {x:600,y:238,pose:'sniff',room:'kitchen',time:[3,6],face:6,weight:1},{x:188,y:120,pose:'sit',room:'living',time:[8,14],face:6,weight:1},
   {x:340,y:412,pose:'stretch',room:'bath',time:[2,3],weight:1},{x:430,y:404,pose:'sit',room:'hall',time:[5,9],weight:1}]}];
// The bottom 48 units of each room sit behind the wall to its south, so nothing is placed there; walk in and the wall thins out.
// Light: the moon through every window, the candle on the coffee table. x, y, radius, r, g, b.
const moon=(x,y,rad=120)=>[x,y,rad,.62,.72,1];
export const LIGHTS=[moon(188,128),moon(352,128),moon(588,128),moon(150,172,90),moon(170,382,90),moon(612,152,90),moon(612,392,80),moon(192,450,80),moon(344,452,60),moon(606,452,80),
 [284,166,110,1,.74,.46],[284,166,40,1,.8,.55]];
export const CANDLE={x:286,y:148-14-3};
