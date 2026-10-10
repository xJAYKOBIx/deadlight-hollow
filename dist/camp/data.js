// Firelight Camp: stage 1 of Deadlight Hollow. A small beach camp inside the sea cave.
// World units match the characters: 1 unit = 1 painter unit, art snapped to a 0.5 grid.
export const CAMP={w:1320,h:880};
export const CAMP_START={x:560,y:600,direction:6};
// Where feet may stand. Back wall to the north (with the barred gate), rock to the west, boulders to the south, the inlet to the east.
export const WALK=[[100,228],[880,226],[934,268],[962,334],[967,368],[1104,368],[1104,396],[971,396],[974,420],[968,520],[940,606],[890,684],[826,752],[720,778],[300,776],[160,770],[104,700],[98,560]];
// The waterline, north to south. Everything east of it is the inlet.
export const SHORE=[[930,150],[984,240],[1012,330],[1022,430],[1016,530],[990,622],[944,706],[884,782],[820,880]];
// Lights are baked into a banded light map: [x, y, radius, r, g, b] with 1 = untouched color.
export const AMBIENT=[.6,.64,.8];
export const LIGHTS=[[560,470,250,1,.86,.64],[742,606,120,1,.8,.58],[356,452,120,.98,.86,.66],[748,522,110,.98,.86,.66],[300,590,115,.98,.86,.66],[239,174,110,.98,.84,.62],[820,330,120,.92,.95,.98],[1110,120,330,.62,.72,.95],[1100,346,90,.98,.86,.66],[272,609,26,1,.86,.62],[428,690,135,.97,.92,.72],[302,236,96,.86,.92,1]];
// Solid props: footprint (x, y, w, h) and painted height z above it. flat props are walked over.
// Four sleeping spots under the shelter, east to west: spot 0 is yours, the rest fill as co-op players join.
export const MAX_CAMPERS=4;
export const BED_SPOTS=[290,243,196,149];
const SLEEPERS=BED_SPOTS.flatMap((cx,slot)=>[{id:'bed-'+slot,kind:'bed',slot,x:cx-13,y:602,w:26,h:66,z:2,flat:true},{id:'chest-'+slot,kind:'chest',slot,x:cx-13,y:672,w:26,h:12,z:14}]);
export const PROPS=[
 {id:'shelter',kind:'shelter',x:124,y:596,w:190,h:22,z:60,glass:[187,-6],candle:[148,13]},
 ...SLEEPERS,
 {id:'fire',kind:'fire',x:532,y:458,w:56,h:28,z:16},
 {id:'log-s',kind:'logH',x:512,y:532,w:96,h:16,z:14},
 {id:'log-w',kind:'logH',x:420,y:478,w:76,h:16,z:14},
 {id:'log-e',kind:'logH',x:624,y:478,w:76,h:16,z:14},
 {id:'board',kind:'board',x:510,y:290,w:100,h:12,z:76},
 {id:'cart',kind:'cart',x:110,y:372,w:140,h:44,z:44},
 {id:'scrap',kind:'scrap',x:262,y:386,w:50,h:26,z:22},
 {id:'tent-a',kind:'tent',x:366,y:234,w:108,h:52,z:64},
 {id:'tent-b',kind:'tent',x:640,y:236,w:96,h:48,z:58},
 {id:'medtent',kind:'medtent',x:754,y:262,w:150,h:68,z:80},
 {id:'cot',kind:'cot',x:808,y:352,w:72,h:24,z:14},
 {id:'pot',kind:'pot',x:740,y:590,w:44,h:26,z:50},
 {id:'fishcrate',kind:'crate',x:798,y:604,w:40,h:30,z:28},
 {id:'barrel',kind:'barrel',x:690,y:648,w:28,h:20,z:34},
 {id:'gate',kind:'gate',x:112,y:212,w:104,h:16,z:88},
 {id:'boat',kind:'boat',x:914,y:430,w:52,h:112,z:22},
 {id:'rack',kind:'rack',x:868,y:612,w:62,h:10,z:56,fish:0},
 {id:'lamp-1',kind:'lantern',x:351,y:450,w:10,h:8,z:72},
 {id:'lamp-2',kind:'lantern',x:743,y:520,w:10,h:8,z:72},
 {id:'lamp-4',kind:'lantern',x:234,y:240,w:10,h:8,z:72},
 {id:'rock-a',kind:'rock',x:302,y:740,w:40,h:22,z:20},
 {id:'rock-b',kind:'rock',x:620,y:734,w:30,h:16,z:14},
 {id:'rock-c',kind:'rock',x:110,y:716,w:28,h:18,z:16},
 {id:'pier',kind:'pier',x:958,y:362,w:154,h:40,z:8,flat:true},
 {id:'laundry',kind:'laundry',x:112,y:318,w:100,h:8,z:62},
 {id:'sacks',kind:'sacks',x:478,y:258,w:30,h:22,z:20},
 {id:'pool-a',kind:'tidepool',x:930,y:560,w:40,h:20,z:2,flat:true},
 {id:'pool-b',kind:'tidepool',x:900,y:640,w:30,h:16,z:2,flat:true},
 {id:'drift',kind:'driftwood',x:548,y:716,w:80,h:14,z:6,flat:true},
 {id:'woodpile',kind:'woodpile',x:378,y:518,w:42,h:18,z:30},
 {id:'drum',kind:'drum',x:904,y:258,w:26,h:14,z:40},
 {id:'nets',kind:'nets',x:906,y:332,w:42,h:14,z:8,flat:true},
 {id:'salvage',kind:'salvage',x:234,y:500,w:44,h:14,z:28},
 {id:'passage',kind:'passage',x:66,y:494,w:80,h:30,z:60},
 // The Training Grounds: a bunker door set into the back wall, where the old laundry line hung.
 {id:'range',kind:'range',x:246,y:214,w:112,h:14,z:100},
 // The garden: a fenced plot under its own lamp, with the water barrel and tools on the west side. Look only for now.
 {id:'farm',kind:'farm',x:340,y:660,w:176,h:84,z:46},
 {id:'lamp-5',kind:'lantern',x:324,y:648,w:10,h:8,z:72}
];
// Residents are placeholders until the cast is redesigned. Looks use the character creator's options.
export const RESIDENTS=[
 {id:'hollis',name:'Hollis',role:'Salvage smith',icon:'hammer',x:182,y:446,direction:2,
  look:{body:0,skin:3,hair:4,color:3,beard:3,hat:0,top:1,shirt:5,coat:0,bottom:0,pants:5,shoes:0,boots:1,pack:1,packColor:0},
  lines:['Name\'s Hollis. If it\'s metal and it\'s broken, it ends up on my cart.','Bring me scrap and parts from out there and I\'ll turn them into something that keeps you breathing.','The forge isn\'t lit yet. Give us time.']},
 {id:'ama',name:'Dr. Ama',role:'Medic',icon:'cross',x:774,y:398,direction:2,
  look:{body:1,skin:5,hair:9,color:0,beard:0,hat:0,top:2,shirt:1,coat:0,bottom:3,pants:4,shoes:1,boots:4,pack:1,packColor:0},
  lines:['Sit down before you fall down. Let me look at you.','Bites go bad fast. If you get one out there, you come to me first. Not the cook, not your bunk. Me.','I\'m short on everything. Herbs, bandages, clean water. Anything you find helps.']},
 {id:'pike',name:'Pike',role:'Cook',icon:'bowl',x:716,y:608,direction:1,
  look:{body:0,skin:1,hair:1,color:4,beard:2,hat:2,top:3,shirt:0,coat:5,bottom:2,pants:2,shoes:3,boots:0,pack:1,packColor:0},
  lines:['Soup\'s thin, but it\'s hot.','Grill a fish on the fire before you head out. It keeps your legs under you.','Your catch goes in my basket. I salt it, so nothing spoils.','Once we have more than fish, I\'ll cook real meals. Those patch you up, too. Not yet, though.']},
 {id:'wren',name:'Wren',role:'Camp steward',icon:'lantern',x:640,y:324,direction:2,
  look:{body:1,skin:2,hair:2,color:1,beard:0,hat:1,top:0,shirt:0,coat:1,bottom:1,pants:6,shoes:0,boots:0,pack:0,packColor:1},
  lines:['You\'re the new one. Good. We need people who come back.','Jobs get pinned to the board. Nothing\'s up yet. We\'re still counting what we have.','When that gate opens, you\'ll be the first one through it.']}
];
// Things you can walk up to. (x, y) is where you stand to use them; my is where the marker floats.
export const OBJECTS=[
 {id:'board',verb:'Read',my:200,name:'The Lantern Board',role:'Job board',x:560,y:316,lines:['No jobs posted yet.','One note, in faded marker: "Hunters wanted. Ask Wren."']},
 {id:'stash',verb:'Open',my:652,name:'Your stash',role:'Your chest',x:290,y:698,lines:['Your chest, at the foot of your bed. Empty for now.','Everything you bring home will end up in here.']},
 {id:'bedroll',verb:'Rest',my:606,name:'Your bedroll',role:'Bunk',x:290,y:640,lines:['Your bedroll. Thin, damp, and yours.','Rest and saved loadouts will live here.']},
 {id:'gate',verb:'Check',my:112,name:'The gate',role:'Way out',x:164,y:252,lines:['Planks, a car door and sandbags, barred from this side.','Wren\'s voice from across the camp: "It stays shut until we have a plan."']},
 {id:'boat',verb:'Look',my:404,mx:940,name:'Rowboat',role:'The inlet',x:902,y:486,lines:['A rowboat, patched with tar and stubbornness.','Someday it\'ll carry you past the mouth of the cave.']},
 {id:'basket',verb:'Check',my:566,name:'Fish basket',role:'Pike\'s salt crate',x:818,y:648,lines:['Empty. The pier\'s past the medic tent.']},
 {id:'pier',verb:'Fish',my:322,name:'Fishing pier',role:'The inlet',x:1086,y:382,lines:['The water\'s deep off the end of the pier.']},
 {id:'passage',verb:'Look',my:420,name:'Collapsed passage',role:'Deeper caverns',x:122,y:548,lines:['An old mine frame, choked with fallen rock. Cool air breathes through the gaps.','Something green is growing in there. You can smell wet soil, not salt.','Wren\'s voice from across the camp: "One day we dig that out. Not today."']},
 {id:'range',verb:'Enter',my:108,name:'Training Grounds',role:'Firing range and store',x:302,y:250,lines:['The old storm bunker, swept out and turned into a firing range.']},
 {id:'farm',verb:'Look',my:606,name:'The garden',role:'Farm plot',x:428,y:648,lines:['Potatoes, beans and a few stubborn squash, growing under a lamp in soil carried up from the tide line a bucket at a time.','Somebody gave the scarecrow a hard hat. Nobody admits to it.','Planting and harvesting will come later.']},
 {id:'fire',verb:'Sit',my:418,name:'Campfire',role:'Firelight Camp',x:560,y:506,lines:['The fire crackles. For a moment, everything is quiet.']}
];
export const USE_RANGE=44;
