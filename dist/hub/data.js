export const WORLD={w:4200,h:3000,sy:.72};
export const LAND=[[200,400],[1100,140],[2500,180],[3050,420],[3000,850],[2780,980],[2750,1370],[2400,1560],[2440,1930],[2700,2170],[3000,2180],[3260,2040],[3860,2040],[4000,2290],[4000,2830],[3150,2850],[2850,2560],[2460,2510],[2200,2350],[1580,2370],[1420,2600],[800,2560],[300,2120],[130,1300]];
export const WATER=[...LAND.slice(4,13),[4200,1900],[4200,0],[3040,0]];
export const PIER={x:2390,y:1350,w:610,h:105};
export const YARD={x:3270,y:2140,w:620,h:600};
export const PATHS=[[[570,2050],[1000,1730],[1470,1540],[1830,1430],[2400,1430],[2770,1400]],[[1080,1240],[1440,1280],[1830,1430],[2180,1190]],[[1470,1540],[1550,1100],[1590,770],[1570,580]],[[1830,1430],[2060,1730],[2130,2130],[2660,2340],[3190,2460],[3370,2560]],[[1000,1730],[650,1420],[600,920],[1000,680],[1590,770],[2080,850],[2560,660]],[[1470,1540],[1170,2070],[880,2230]]];
export const BUILDINGS=[
 {id:'workshop',name:'THE SALVAGE WORKS',x:930,y:930,w:310,h:195,z:155,roof:'#514b60',wall:'#625862',type:'workshop'},
 {id:'clinic',name:'TIDEWARD CLINIC',x:1820,y:575,w:285,h:175,z:146,roof:'#586777',wall:'#80828c',type:'clinic'},
 {id:'hall',name:'THE LANTERN HOUSE',x:1350,y:280,w:390,h:210,z:185,roof:'#55516c',wall:'#77707c',type:'hall'},
 {id:'kitchen',name:'THE COMMON TABLE',x:1650,y:965,w:275,h:190,z:132,roof:'#575d68',wall:'#6b5c60',type:'kitchen'},
 {id:'wardrobe',name:'THREAD & TIDE',x:670,y:1650,w:245,h:175,z:128,roof:'#63536d',wall:'#746674',type:'wardrobe'},
 {id:'market',name:'SHORE MARKET',x:2150,y:1010,w:245,h:125,z:106,roof:'#797080',wall:'#71616b',type:'market'},
 {id:'boatshop',name:'THE BOATHOUSE',x:2490,y:950,w:185,h:150,z:125,roof:'#445c72',wall:'#615e6b',type:'house'},
 ...[[430,570,160,130],[650,500,195,145],[900,400,210,150],[1110,220,180,140],[2050,240,205,155],[2370,340,190,150],[2700,500,155,140],[410,1070,155,160],[720,1180,160,115],[365,1500,155,150],[1000,1870,180,140],[660,2090,150,130],[1220,2220,180,145],[1810,2010,185,150],[2780,2230,150,135],[3040,2080,145,110]].map((b,i)=>({id:'home'+i,x:b[0],y:b[1],w:b[2],h:b[3],z:95+i%3*19,roof:['#515c73','#61506a','#6c5b63','#525f67'][i%4],wall:['#6b6570','#5d6270','#776e78'][i%3],type:'house',name:''}))
];
export const COVERS=[{x:3510,y:2460,w:135,h:52},{x:3690,y:2320,w:85,h:85},{x:3380,y:2380,w:75,h:50}];
export const STATIONS=[
 {id:'workshop',x:1090,y:1210,label:'Salvage Works',kind:'craft',person:'Mara Quinlan',role:'Quartermaster',text:'Nothing useful stays broken for long here. I laid out some spare materials for you. Try a new fitting, then take it to the yard.'},
 {id:'clinic',x:1940,y:830,label:'Tideward Clinic',kind:'clinic',person:'Dr. Sera Lindahl',role:'Village physician',text:'The hollow was a refuge long before it was a village. Now we keep it that way, one patient at a time. Take a breath. You are safe here.'},
 {id:'wardrobe',x:810,y:1900,label:'Thread & Tide',kind:'appearance',person:'Nell Hawthorne',role:'Tailor',text:'A little color is still allowed at the end of the world. Choose something that feels like you.'},
 {id:'kitchen',x:1780,y:1230,label:'The Common Table',kind:'talk',person:'Oren Blake',role:'Cook',text:'We used to fit everyone around one fire. Now I need three pots before breakfast. If you can smell the broth from the docks, it is ready.'},
 {id:'hall',x:1550,y:585,label:'Lantern House',kind:'talk',person:'Ada Reyes',role:'Community steward',text:'The old sign said Moonlight Hollow. After the disaster, people started calling it Deadlight. The name stayed. So did we.'},
 {id:'docks',x:2670,y:1410,label:'The Inlet',kind:'talk',person:'Eli Stroud',role:'Harbormaster',text:'The sea still brings us fish, driftwood, and sometimes people. The boats are staying close to home for now.'},
 {id:'market',x:2260,y:1205,label:'Shore Market',kind:'supplies',person:'Jun Takeda',role:'Salvager',text:'A practice allowance, courtesy of the village. The yard keeps spare ammunition. Bring your discoveries to Mara when you want something built.'},
 {id:'training',x:3300,y:2640,label:'Training Yard',kind:'training',person:'Dwayne "Rook" Rourke',role:'Range keeper',text:'Targets at the far wall. The marked ground is yours. Start with a steady shot, then try moving under pressure. Drills restore your health and supplies.'}
];
export const MATERIALS={scrap:'Scrap metal',cloth:'Woven fabric',herb:'Coastal herbs',parts:'Precision parts',alloy:'Armor plates'};
export const WEAPONS={pistol:{name:'Harbor pistol',tag:'Reliable sidearm',damage:24,rate:.3,clip:12,reload:1.15,speed:850,spread:.035,pellets:1,range:720},carbine:{name:'Patrol carbine',tag:'Automatic / balanced',damage:18,rate:.115,clip:24,reload:1.65,speed:1000,spread:.065,pellets:1,range:850},shotgun:{name:'Breakwater shotgun',tag:'Close-range / crowd control',damage:13,rate:.7,clip:6,reload:1.8,speed:740,spread:.3,pellets:6,range:390},marksman:{name:'Lookout rifle',tag:'Precision / long range',damage:70,rate:.8,clip:5,reload:1.8,speed:1400,spread:.008,pellets:1,range:1050}};
export const ARMORS={scout:{name:'Scavenger jacket',protection:0,speed:225,desc:'Light on your feet. No damage reduction.'},woven:{name:'Reinforced coat',protection:3,speed:215,desc:'Absorbs 3 damage per hit. A balanced field coat.'},plated:{name:'Salvaged vest',protection:6,speed:200,desc:'Absorbs 6 damage per hit. Heavier protection.'}};
export const RECIPES=[
 {id:'tonic',name:'Restorative tonic',category:'Supplies',desc:'Restore 55 health. Carry up to six.',cost:{herb:2,cloth:1}},
 {id:'woven',name:'Reinforced coat',category:'Armor',desc:ARMORS.woven.desc,cost:{scrap:6,cloth:4}},
 {id:'plated',name:'Salvaged vest',category:'Armor',desc:ARMORS.plated.desc,cost:{scrap:10,alloy:4,cloth:2}},
 ...Object.entries(WEAPONS).map(([id,w])=>({id:'tune_'+id,name:w.name+' tuning',category:'Weapons',desc:'Each tier adds 15% damage. Three tiers available.',cost:{scrap:8,parts:3},weapon:id}))
];
export const CRATES=[{id:'c1',x:1020,y:1280,loot:{scrap:8,parts:3}},{id:'c2',x:890,y:2180,loot:{cloth:5,herb:3}},{id:'c3',x:2420,y:1200,loot:{scrap:6,alloy:3}},{id:'c4',x:1280,y:650,loot:{herb:5,cloth:3}},{id:'c5',x:2890,y:1410,loot:{parts:4,scrap:8}},{id:'c6',x:2640,y:2350,loot:{alloy:3,cloth:4}}];
export const DESTINATIONS=[{name:'Village square',x:1510,y:1480},{name:'Salvage Works',x:1090,y:1280},{name:'Tideward Clinic',x:1940,y:860},{name:'Thread & Tide',x:810,y:1950},{name:'The Inlet',x:2610,y:1410},{name:'Training Yard',x:3320,y:2630}];
export const PALETTES=['#9982b6','#668d82','#bd895f','#648fb2','#af6974','#c7bca7'];
export const HAIR_COLORS=['#302c35','#725043','#b58657','#c2bcc0','#493731','#b36c48','#d4bb81','#766b89'];
export const SKINS=['#e8b997','#c68d69','#9c6649','#694936','#f1cdb2','#80553f'];
export const TROUSER_COLORS=['#465167','#68614f','#3a4149','#756077','#7b695d','#62796f'];
export const LOOK_OPTIONS={body:['Male','Female'],hair:['Short crop','Long hair','Side part','Curly crop','Ponytail','Braids','Buzz cut','Bald'],headwear:['None','Field cap','Knit hat','Hood up'],beard:['Clean shaven','Stubble','Mustache','Goatee','Short beard','Full beard'],nose:['Straight','Button','Broad','Angular'],outfit:['Field jacket','Long coat','Hoodie','Work shirt','Utility vest','Coastal knit'],pack:['No pack','Daypack','Bedroll pack']};
export const LOOK_DEFAULTS={coat:0,skin:0,hair:0,hairColor:0,outfit:0,pack:1,body:0,headwear:0,beard:0,nose:0,trousers:0};
export const LOOK_LIMITS={...Object.fromEntries(Object.entries(LOOK_OPTIONS).map(([key,items])=>[key,items.length])),coat:PALETTES.length,skin:SKINS.length,hairColor:HAIR_COLORS.length,trousers:TROUSER_COLORS.length};
export const NPCS=Array.from({length:26},(_,i)=>{let route=PATHS[i%PATHS.length];return {id:i,a:route[i%route.length],b:route[(i+1)%route.length],coat:PALETTES[i%6],skin:SKINS[i%4],hair:i%3};});
