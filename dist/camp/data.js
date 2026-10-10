// Firelight Camp: stage 1 of Deadlight Hollow. A beach camp inside the sea cave, big enough that the camera follows you around it.
// World units match the characters: 1 unit = 1 painter unit, art snapped to a 0.5 grid.
export const CAMP={w:1920,h:1520};
export const CAMP_START={x:800,y:744,direction:6};
// Where feet may stand. Back wall to the north (with the barred gate and the Training Grounds door), rock to the west, boulders to the south, the inlet to the east.
export const WALK=[[100,228],[1410,226],[1462,268],[1488,334],[1496,368],[1616,368],[1616,396],[1500,396],[1502,440],[1496,540],[1478,640],[1452,760],[1416,880],[1376,1000],[1332,1120],[1286,1240],[1238,1350],[1196,1428],[160,1430],[106,1370],[104,1000],[104,600]];
// The waterline, north to south. Everything east of it is the inlet.
export const SHORE=[[1440,150],[1494,240],[1522,330],[1532,430],[1526,530],[1508,640],[1484,760],[1450,880],[1410,1000],[1366,1120],[1318,1240],[1270,1360],[1230,1460],[1200,1520]];
// Lights are baked into a banded light map: [x, y, radius, r, g, b] with 1 = untouched color. The fire comes first.
export const AMBIENT=[.6,.64,.8];
export const LIGHTS=[[800,640,260,1,.86,.64],[1032,786,120,1,.8,.58],[645,562,120,.98,.86,.66],[1018,702,110,.98,.86,.66],[300,924,115,.98,.86,.66],[305,174,110,.98,.84,.62],[1190,330,120,.92,.95,.98],[1760,120,330,.62,.72,.95],[1610,346,90,.98,.86,.66],[272,943,26,1,.86,.62],[386,236,96,.86,.92,1],
 [330,584,92,1,.72,.48],[700,886,110,.98,.86,.66],[512,1236,300,.97,.92,.72],[136,1090,90,.98,.88,.7],[884,1090,90,.98,.88,.7],[1295,522,120,.98,.86,.66],[690,430,90,.98,.86,.66]];
// Solid props: footprint (x, y, w, h) and painted height z above it. flat props are walked over.
// Four sleeping spots under the shelter, east to west: spot 0 is yours, the rest fill as co-op players join.
export const MAX_CAMPERS=4;
export const BED_SPOTS=[290,243,196,149];
const SLEEPERS=BED_SPOTS.flatMap((cx,slot)=>[{id:'bed-'+slot,kind:'bed',slot,x:cx-13,y:936,w:26,h:66,z:2,flat:true},{id:'chest-'+slot,kind:'chest',slot,x:cx-13,y:1006,w:26,h:12,z:14}]);
// The garden: a fenced field south of the beds, six beds of crops with walkways between, a gate on the north side.
export const GARDEN={x:120,y:1100,w:780,h:276,gate:[360,410]};
const fence=(id,x,y,w,h,extra={})=>({id,kind:'fence',x,y,w,h,z:18,...extra});
const SIDES=[0,1,2,3].flatMap(i=>{const y=GARDEN.y+6+i*67.5;return [fence('fence-w'+i,GARDEN.x,y,6,67.5),fence('fence-e'+i,GARDEN.x+GARDEN.w-6,y,6,67.5)];});
const PLOTS=[['potato',150,1140],['cabbage',410,1140],['squash',150,1262],['carrot',410,1262],['tilled',670,1262]].map(([crop,x,y],i)=>({id:'plot-'+(i+1),kind:'plot',crop,x,y,w:crop==='tilled'?200:210,h:70,z:4,flat:true}));
export const PROPS=[
 {id:'shelter',kind:'shelter',x:124,y:930,w:190,h:22,z:60,glass:[187,-6],candle:[148,13]},
 ...SLEEPERS,
 // The fire, in the middle of everything.
 {id:'fire',kind:'fire',x:772,y:626,w:56,h:28,z:16},
 {id:'log-s',kind:'logH',x:752,y:700,w:96,h:16,z:14},
 {id:'log-w',kind:'logH',x:660,y:646,w:76,h:16,z:14},
 {id:'log-e',kind:'logH',x:864,y:646,w:76,h:16,z:14},
 {id:'woodpile',kind:'woodpile',x:600,y:700,w:42,h:18,z:30},
 // Along the back wall: the barred gate, the Training Grounds door, tents, Macy's board, the medic tent.
 {id:'gate',kind:'gate',x:112,y:212,w:104,h:16,z:88},
 {id:'range',kind:'range',x:330,y:214,w:112,h:14,z:100},
 // Gadget's generator, with its cords running under the steel doors and down to the Training Grounds.
 {id:'generator',kind:'generator',x:234,y:214,w:44,h:24,z:34},
 {id:'gencords',kind:'gencords',x:276,y:220,w:70,h:20,z:2,flat:true},
 {id:'lamp-4',kind:'lantern',x:300,y:240,w:10,h:8,z:72},
 {id:'tent-a',kind:'tent',x:540,y:236,w:108,h:52,z:64},
 {id:'sacks',kind:'sacks',x:662,y:258,w:30,h:22,z:20},
 {id:'board',kind:'board',x:760,y:290,w:100,h:12,z:76},
 {id:'tent-b',kind:'tent',x:960,y:236,w:96,h:48,z:58},
 {id:'medtent',kind:'medtent',x:1120,y:262,w:150,h:68,z:80},
 {id:'cot',kind:'cot',x:1174,y:352,w:72,h:24,z:14},
 {id:'drum',kind:'drum',x:1290,y:258,w:26,h:14,z:40},
 // The store: crates, sacks and a water barrel by the board, where Macy can keep an eye on them.
 {id:'store-sacks',kind:'sacks',x:596,y:432,w:30,h:22,z:20},
 {id:'store-1',kind:'crate',x:636,y:420,w:40,h:30,z:28},
 {id:'store-2',kind:'crate',x:682,y:428,w:34,h:24,z:22},
 {id:'store-barrel',kind:'barrel',x:726,y:428,w:28,h:20,z:34},
 {id:'nets',kind:'nets',x:1292,y:332,w:42,h:14,z:8,flat:true},
 // Stan's corner to the west: the salvage cart, the scrap heap and his forge.
 {id:'cart',kind:'cart',x:140,y:470,w:140,h:44,z:44},
 {id:'scrap',kind:'scrap',x:300,y:486,w:50,h:26,z:22},
 {id:'forge',kind:'forge',x:290,y:572,w:76,h:30,z:64},
 {id:'salvage',kind:'salvage',x:420,y:600,w:44,h:14,z:28},
 {id:'lamp-1',kind:'lantern',x:640,y:560,w:10,h:8,z:72},
 {id:'passage',kind:'passage',x:66,y:800,w:80,h:30,z:60},
 // The shore: pier, rowboat and tide pools.
 {id:'pier',kind:'pier',x:1470,y:362,w:154,h:40,z:8,flat:true},
 {id:'boat',kind:'boat',x:1424,y:430,w:52,h:112,z:22},
 {id:'pool-a',kind:'tidepool',x:1420,y:720,w:40,h:20,z:2,flat:true},
 {id:'pool-b',kind:'tidepool',x:1370,y:860,w:30,h:16,z:2,flat:true},
 {id:'drift',kind:'driftwood',x:1196,y:1100,w:80,h:14,z:6,flat:true},
 // Pike's kitchen, east of the fire.
 {id:'pot',kind:'pot',x:1010,y:770,w:44,h:26,z:50},
 {id:'fishcrate',kind:'crate',x:1068,y:784,w:40,h:30,z:28},
 {id:'barrel',kind:'barrel',x:930,y:830,w:28,h:20,z:34},
 {id:'rack',kind:'rack',x:1130,y:792,w:62,h:10,z:56,fish:0},
 {id:'lamp-2',kind:'lantern',x:1013,y:700,w:10,h:8,z:72},
 {id:'mess',kind:'table',x:1060,y:880,w:64,h:26,z:26},
 // Where people live: tents, a table, washing on the line and the supply crates.
 {id:'tent-c',kind:'tent',x:400,y:900,w:96,h:48,z:58},
 {id:'tent-d',kind:'tent',x:548,y:892,w:108,h:52,z:64},
 {id:'lamp-7',kind:'lantern',x:700,y:880,w:10,h:8,z:72},
 {id:'table',kind:'table',x:740,y:936,w:64,h:26,z:26},
 {id:'laundry',kind:'laundry',x:520,y:1010,w:100,h:8,z:62},
 {id:'supplies',kind:'crate',x:860,y:960,w:40,h:30,z:28},
 {id:'supplies-2',kind:'crate',x:880,y:1000,w:34,h:24,z:22},
 // The garden. Low crops are flat beds you can walk between; the beans, scarecrow and fence stand up.
 fence('fence-n1',GARDEN.x,GARDEN.y,GARDEN.gate[0]-GARDEN.x,6,{post:'end'}),
 fence('fence-n2',GARDEN.gate[1],GARDEN.y,GARDEN.x+GARDEN.w-GARDEN.gate[1],6,{post:'start'}),
 fence('fence-s',GARDEN.x,GARDEN.y+GARDEN.h-6,GARDEN.w,6),
 ...SIDES,
 ...PLOTS,
 {id:'trellis',kind:'trellis',x:670,y:1152,w:200,h:44,z:40},
 {id:'scarecrow',kind:'scarecrow',x:638,y:1228,w:14,h:8,z:58},
 {id:'shed',kind:'shed',x:930,y:1140,w:96,h:52,z:76},
 {id:'rainbarrel',kind:'barrel',x:1036,y:1172,w:28,h:20,z:34},
 {id:'compost',kind:'compost',x:930,y:1228,w:44,h:24,z:22},
 {id:'wheelbarrow',kind:'wheelbarrow',x:1000,y:1236,w:40,h:18,z:18},
 {id:'lamp-5',kind:'lantern',x:880,y:1086,w:10,h:8,z:72},
 {id:'lamp-6',kind:'lantern',x:130,y:1086,w:10,h:8,z:72},
 // Rocks on the open sand.
 {id:'rock-a',kind:'rock',x:1120,y:1240,w:40,h:22,z:20},
 {id:'rock-b',kind:'rock',x:1150,y:1360,w:30,h:16,z:14},
 {id:'rock-c',kind:'rock',x:1300,y:990,w:28,h:18,z:16},
 // More tents up the east side, for the newer arrivals.
 {id:'tent-e',kind:'tent',x:1180,y:508,w:96,h:48,z:58},
 {id:'tent-f',kind:'tent',x:1300,y:580,w:96,h:48,z:58},
 {id:'tent-sacks',kind:'sacks',x:1196,y:600,w:30,h:22,z:20},
 {id:'lamp-8',kind:'lantern',x:1290,y:520,w:10,h:8,z:72}
];
// Aaron answers questions about the Training Grounds, at the door and down on the range.
export const AARON_TOPICS=[
 {q:'What are the Training Grounds?',a:['It was a storm bunker under the cave. Gadget and I built an arena down there out of pallets, doors and whatever we could drag in.','Nothing down there counts. Every gun and every piece of armor we have is unlocked, and the paint never runs out. Break it all you like.']},
 {q:'How does the range work?',a:['Every gun down there has a paintball twin: same magazine, same rate of fire, same reload. Paint washes off. Habits don\'t.','Paper targets stand in the lane in the far corner; knock one down and it stands back up. Learn how many rounds you get before you reload. That number keeps you alive out there.','When you want targets that move, ask Gadget.']},
 {q:'Who is Gadget?',a:['Our engineer. She keeps the generator, the lights and her servers alive, and she builds robot zombies out of pillows, bedsheets and shopping cart wheels.','She is the smartest person in this cave. Don\'t touch her cords.']},
 {q:'Which gun should I pick?',a:['The Light Pistol is quick and forgiving: fifteen rounds and a fast reload. Start there.','The Heavy Pistol and the Hand Cannon hit harder but fire slower, with fewer rounds. Make every shot count.','The ARs are for when there are too many to count. The Tactical AR sprays fast; the Heavy AR is slower and hits like a truck. Both chew through a magazine.']},
 {q:'What about grenades?',a:['Three kinds. Smoke hides you, incendiary leaves the ground burning, and the explosive one goes off right away.','Throw as many as you like at the targets. Out there you\'ll be lucky to carry one.']},
 {q:'Who are LEET AF?',a:['Elite Armed Forces. What was left of a few units when the cities fell. Everyone reads the vest and calls us LEET AF, so that stuck.','There is no command anymore. No orders, no resupply. Just Gadget and me, a lot of gear, and Macy telling us where to be useful.','So we keep the camp\'s weapons and teach anyone who\'ll listen.']},
 {q:'Who are G.U.N.?',a:['Guardians of the Underground Network. They live in the tunnels and the old transit lines.','If you meet them down there, keep your hands where they can see them. They don\'t trust us, and we don\'t trust them.']},
 {q:'What\'s coming next?',a:['Gadget runs Holdouts now: her robots come out of every hatch, wave after wave, until you drop. Ask her down there.','Bring her the parts they leave behind and she pays you in chits. My shop takes chits. After that, the real thing, out past the gate.']}];
// The cast. Looks use the character creator's options.
export const RESIDENTS=[
 {id:'macy',name:'Macy',role:'Runs the camp · Quest board',icon:'lantern',x:900,y:320,direction:2,
  look:{body:1,skin:2,hair:2,color:4,beard:0,hat:0,top:0,shirt:5,coat:6,bottom:2,pants:2,shoes:3,boots:0,pack:1,packColor:0},
  lines:['There you are. Come here, let me look at you. Eat something before you go anywhere, okay?','I used to keep the big cats at the county zoo, and on weekends I walked tourists up the ridge trails. Forty-one days ago that stopped mattering.','Before all this, Marrow Industries told the world nobody had to stay dead. LZ-6. Everyone who took it turned, and then everyone they bit. I don\'t say that name around the kids.','Somehow everyone started bringing their problems to me, so now I keep the board. If it needs doing, it gets pinned up there.','No jobs yet. When there are, you\'ll be the first I ask. We look after each other here.']},
 {id:'ava',name:'Ava',role:'Camp doctor',icon:'cross',x:1150,y:404,direction:2,
  look:{body:1,skin:5,hair:9,color:0,beard:0,hat:0,top:2,shirt:1,coat:0,bottom:3,pants:4,shoes:1,boots:4,pack:1,packColor:0},
  lines:['Sit. You\'re bleeding and you haven\'t noticed. Typical.','I need everything. Bandages, alcohol, thread, pills, clean water. Anything helps, but bring me real medical supplies and I will owe you.','If you get bitten, you come straight to me. Not to your bunk, not to the fire. Me. There are ways to slow it down, and I mean to find them.','Nobody knows how long a bite gives you. The sick go fast. The young and strong can hold out for days. Don\'t count on being strong.','The better this camp gets, the more I can do for you. Remember that when you\'re out there scavenging.']},
 {id:'pike',name:'Scoutmaster Pike',role:'Cook · Field survival',icon:'bowl',x:986,y:800,direction:1,
  look:{body:0,skin:1,hair:1,color:4,beard:2,hat:1,top:0,shirt:0,coat:6,bottom:4,pants:2,shoes:3,boots:0,pack:0,packColor:3},
  lines:['Thirty-two years of leading scout troops and I finally have a troop that listens. Funny what it takes.','Grill a fish before you head out. Hot food keeps your legs under you.','The perch bite at dusk off the end of the pier. Keep the line tight and let them tire.','Bring me more than fish and I\'ll cook proper meals, the kind that patch you up. That\'s field cooking, and I know a lot of it.']},
 {id:'stan',name:'Old-man Stan',role:'Blacksmith · Gunsmith',icon:'hammer',x:248,y:604,direction:2,
  look:{body:0,skin:1,hair:3,color:3,beard:6,hat:0,top:2,shirt:2,coat:3,bottom:0,pants:5,shoes:0,boots:0,pack:1,packColor:0},
  lines:['What? No, I\'m not busy. I\'m always busy. What do you want?','Forty years I built rifles by hand. You kids buy a gun, you don\'t know what makes it go bang.','If these dead had come for us when I was in my prime, I\'d have sorted this out by supper. Probably.','Bring me scrap, springs, good steel. I\'ll forge you something that won\'t jam when it counts.']},
 {id:'aaron',name:'Aaron',role:'LEET AF · Training Grounds',icon:'target',x:476,y:250,direction:2,
  look:{body:0,skin:4,hair:4,color:0,beard:1,hat:6,top:8,shirt:0,coat:1,bottom:5,pants:3,shoes:3,boots:1,pack:1,packColor:1},
  lines:['Aaron. I look after the Training Grounds. Anything about them, ask me.','Heading down to the range? Ask me first, it saves ammo.'],more:'Anything else before you head down?',topics:AARON_TOPICS},
 {id:'zyn',name:'Zyn',role:'Gardener',icon:'sprout',x:215,y:1236,direction:2,
  look:{body:1,skin:3,hair:8,color:4,beard:0,hat:0,top:2,shirt:3,coat:0,bottom:1,pants:6,shoes:0,boots:0,pack:1,packColor:0},
  lines:['Mind the rows, sugar. Those carrots took me a week to talk into growing.','Clyde and I farmed out past the county line our whole lives. Soil\'s soil, even in a cave, if you feed it right.','When we\'re set up proper, you\'ll plant with us and bring in the harvest. Seeds first, though. Bring me any you find.']},
 {id:'clyde',name:'Clyde',role:'Farmer',icon:'sprout',x:985,y:1300,direction:5,
  look:{body:0,skin:0,hair:1,color:1,beard:5,hat:4,top:1,shirt:1,coat:0,bottom:1,pants:7,shoes:3,boots:2,pack:1,packColor:0},
  lines:['Howdy. Zyn runs the rows, I run the shed. Works out.','Tools, seed, compost, water. Farming\'s mostly hauling things from one place to another.','You find a shovel out there, or a bag of seed potatoes, you bring it here. We\'ll put you to work planting soon enough.']},
 // A few of the other survivors who live here.
 {id:'survivor-dock',name:'Survivor',role:'Mending nets',x:1360,y:350,direction:4,
  look:{body:0,skin:4,hair:1,color:0,beard:1,hat:2,top:3,shirt:0,coat:4,bottom:2,pants:3,shoes:0,boots:1,pack:1,packColor:0},
  lines:['Pike says if I fix these nets we won\'t need the pier for every fish. Pike says a lot.','The tide comes up under the boat at night. You can hear it.']},
 {id:'survivor-fire',name:'Survivor',role:'Warming up',x:880,y:700,direction:3,
  look:{body:1,skin:0,hair:6,color:2,beard:0,hat:0,top:3,shirt:0,coat:5,bottom:1,pants:6,shoes:1,boots:4,pack:1,packColor:0},
  lines:['Just warming my hands. It gets cold in here at night.','Macy found me on the highway with a flat tire and a crowbar. I owe her.']},
 {id:'survivor-wash',name:'Survivor',role:'Doing laundry',x:570,y:1052,direction:6,
  look:{body:0,skin:3,hair:0,color:1,beard:0,hat:0,top:6,shirt:2,coat:0,bottom:4,pants:5,shoes:1,boots:0,pack:1,packColor:0},
  lines:['Salt water does not get anything clean. Don\'t tell Macy I said that.','If you see a bar of soap out there, I will trade you anything.']},
 {id:'survivor-watch',name:'Survivor',role:'On watch',x:236,y:296,direction:6,
  look:{body:1,skin:4,hair:4,color:0,beard:0,hat:1,top:0,shirt:4,coat:2,bottom:2,pants:1,shoes:3,boots:1,pack:0,packColor:2},
  lines:['Quiet out there tonight. I don\'t like quiet.','Nobody opens that gate without Macy\'s say-so.']},
 {id:'survivor-tent',name:'Survivor',role:'Patching a tent',x:1250,y:640,direction:1,
  look:{body:1,skin:2,hair:2,color:5,beard:0,hat:0,top:1,shirt:5,coat:0,bottom:3,pants:2,shoes:2,boots:0,pack:0,packColor:1},
  lines:['Came in last week. Macy gave me a tent and a needle and said get to it.','Forty-one days. I keep count on the tent pole. Somebody has to.']}
];
// Things you can walk up to. (x, y) is where you stand to use them; my is where the marker floats.
export const OBJECTS=[
 {id:'board',verb:'Read',my:200,name:'The Lantern Board',role:'Quest board',x:810,y:316,lines:['No jobs posted yet.','A note in Macy\'s round handwriting: "Seeds, bandages, scrap. Whatever you can carry. Come home first."']},
 {id:'stash',verb:'Open',my:986,name:'Your stash',role:'Your chest',x:290,y:1032,lines:['Your chest, at the foot of your bed. Empty for now.','Everything you bring home will end up in here.']},
 {id:'bedroll',verb:'Rest',my:940,name:'Your bedroll',role:'Bunk',x:290,y:974,lines:['Your bedroll. Thin, damp, and yours.','Rest and saved loadouts will live here.']},
 {id:'gate',verb:'Check',my:112,name:'The gate',role:'Way out',x:164,y:252,lines:['Planks, a car door and sandbags, barred from this side.','Macy\'s voice from across the camp: "It stays shut until we have a plan, sweetheart."']},
 {id:'boat',verb:'Look',my:404,mx:1450,name:'Rowboat',role:'The inlet',x:1412,y:486,lines:['A rowboat, patched with tar and stubbornness.','Someday it\'ll carry you past the mouth of the cave.']},
 {id:'basket',verb:'Check',my:746,name:'Fish basket',role:'Pike\'s salt crate',x:1088,y:828,lines:['Empty. The pier\'s past the medic tent.']},
 {id:'pier',verb:'Fish',my:322,name:'Fishing pier',role:'The inlet',x:1598,y:382,lines:['The water\'s deep off the end of the pier.']},
 {id:'passage',verb:'Look',my:726,name:'Collapsed passage',role:'Deeper caverns',x:122,y:854,lines:['An old mine frame, choked with fallen rock. Cool air breathes through the gaps.','Something green is growing in there. You can smell wet soil, not salt.','Stan, from his forge: "One day we dig that out. Not today. My back says not today."']},
 {id:'forge',verb:'Look',my:500,name:'Stan\'s forge',role:'Blacksmith',x:328,y:626,lines:['A brick forge, an anvil worn smooth and a bucket of black water. The coals never quite go out.','Stan will make and mend weapons here once there is steel to work.']},
 {id:'range',verb:'Enter',my:108,name:'Training Grounds',role:'Arena and firing range',x:386,y:250,lines:['The old storm bunker, swept out and turned into a training arena.']},
 {id:'generator',verb:'Look',my:176,name:'Generator',role:'Power for the Training Grounds',x:256,y:254,lines:['A diesel generator on a pallet, coughing away to itself. Two extension cords run from it, under the steel doors and down the stairs.','A strip of tape on the tank, in marker: "FEED ME. DO NOT UNPLUG. — G."']},
 {id:'garden',verb:'Look',my:1050,name:'The garden',role:'Zyn and Clyde\'s field',x:385,y:1086,lines:['Six beds of potatoes, cabbage, squash, carrots and beans, in soil hauled up from the tide line a bucket at a time.','Zyn and Clyde run it. Planting and harvesting will come later.']},
 {id:'scarecrow',verb:'Look',my:1150,name:'Scarecrow',role:'The garden',x:645,y:1258,lines:['A burlap scarecrow in a tall, crooked hat. Someone stitched him a big smile.','Zyn says he doesn\'t need eyes to keep watch.']},
 {id:'fire',verb:'Sit',my:586,name:'Campfire',role:'Firelight Camp',x:800,y:674,lines:['The fire crackles. For a moment, everything is quiet.']}
];
export const USE_RANGE=44;
