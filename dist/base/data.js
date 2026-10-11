// Hangar 3 at Harlan Field, LEET AF's staging base, where Operation Bell Jar is briefed (v0.66). The hangar floor runs between two
// side walls under the back wall; its south side is the big door, open onto the wet apron where the trucks wait. The stage and
// screen are at the north end with the chairs in front of them, the armory cage in the north-west corner, lockers in the
// north-east, and the coffee, the briefing board and the sample cases round the edges. The props are the Master Creator's base set.
import {OP_TALK} from '../story/op.js';
export const BASE={w:880,h:680},HANGAR={x:10,y:110,w:860,h:364},DOOR_Y=474;
// How far the stage lifts what stands on it.
export const LIFT=6;
// The chairs: three rows of six with an aisle down the middle, numbered from the front.
export const ROWS=[206,248,290],COLS=[350,376,402,458,484,510];
export const CHAIRS=ROWS.flatMap((y,r)=>COLS.map((x,c)=>({id:`chair${r}${c}`,kind:'foldchair',x,y,w:20,h:14,z:28,n:r*6+c+1})));
const chair=(r,c)=>CHAIRS[r*6+c];
export const PROPS=[
 {id:'wall',kind:'hangarwall',x:0,y:100,w:880,h:10,z:100,sign:'HANGAR 3',signX:640},
 {id:'wallW',kind:'hangarwallV',x:0,y:110,w:10,h:364,z:100},{id:'wallE',kind:'hangarwallV',x:870,y:110,w:10,h:364,z:100},
 {id:'colW',kind:'column',x:2,y:466,w:12,h:10,z:110},{id:'colE',kind:'column',x:866,y:466,w:12,h:10,z:110},
 {id:'stage',kind:'stage',x:330,y:118,w:220,h:52,z:6},
 {id:'screen',kind:'screen',x:360,y:104,w:160,h:6,z:96,drop:66,slide:0,deco:true},
 {id:'bannerW',kind:'crestbanner',x:316,y:104,w:30,h:6,z:92,len:60,deco:true},{id:'bannerE',kind:'crestbanner',x:534,y:104,w:30,h:6,z:92,len:60,deco:true},
 {id:'podium',kind:'podium',x:352,y:136,w:26,h:14,z:36,lift:LIFT},
 ...CHAIRS,
 {id:'projector',kind:'projector',x:429,y:326,w:22,h:16,z:30},
 {id:'armory',kind:'armory',x:30,y:110,w:150,h:40,z:74},
 {id:'lockersA',kind:'lockers',x:620,y:110,w:112,h:14,z:64},{id:'lockersB',kind:'lockers',x:744,y:110,w:112,h:14,z:64,open:2},
 {id:'board',kind:'briefboard',x:220,y:250,w:60,h:10,z:62},
 {id:'coffee',kind:'urntable',x:780,y:300,w:52,h:18,z:26},
 {id:'caseA',kind:'hazcase',x:604,y:420,w:26,h:16,z:16,cold:true,marrow:true},{id:'caseB',kind:'hazcase',x:634,y:424,w:26,h:16,z:16},
 // Your truck, ramp down, and Hollow Five's beside it.
 {id:'truck',kind:'apc',x:360,y:560,w:230,h:66,z:72,mark:'H6',open:true},{id:'truck5',kind:'apc',x:650,y:604,w:230,h:66,z:72,mark:'H5'}];
// What you cannot walk through: everything standing, and the ramp's foot is left open so you can walk up to it.
export const SOLIDS=PROPS.filter(o=>!o.deco);
// Where you sit for the briefing (an aisle seat in the second row, the seat beside it empty for the partner you have not met),
// where you stand once it is over, and where you are when you come back to it already on the truck.
export const YOUR_SEAT=chair(1,2),GEAR_START={x:440,y:268,direction:2},AT_RAMP={x:340,y:596,direction:0};
// The people. LEET AF fatigues with no helmets indoors; Hale in a charcoal suit. Okafor's icon floats over him while your rifle is waiting.
const LEET={top:8,coat:1,shirt:0,hat:0,bottom:5,pants:3,shoes:3,boots:1,pack:1,packColor:1};
const op=(id,name,callsign,look)=>({id,name,short:name.split(' ').pop(),role:'LEET AF · '+callsign,look:{...LEET,...look},lines:OP_TALK[id]});
export const OPERATORS=[
 op('kessler','Sgt. Dana Kessler','Hollow One',{body:1,skin:1,hair:2,color:2,beard:0}),op('ortega','Cpl. Luis Ortega','Hollow One',{body:0,skin:3,hair:1,color:0,beard:5}),
 op('reyes','Mara Reyes','Hollow Two',{body:1,skin:3,hair:6,color:0,beard:0}),op('booker','Tom Booker','Hollow Two',{body:0,skin:4,hair:4,color:0,beard:3}),
 op('adeyemi','Ike Adeyemi','Hollow Three',{body:0,skin:5,hair:3,color:0,beard:4}),op('walsh','Sean Walsh','Hollow Three',{body:0,skin:0,hair:0,color:4,beard:1}),
 op('park','Jin Park','Hollow Four',{body:0,skin:2,hair:1,color:0,beard:0,hat:1}),op('halvorsen','Ruth Halvorsen','Hollow Four',{body:1,skin:0,hair:9,color:5,beard:0}),
 op('mensah','Kofi Mensah','Hollow Five',{body:0,skin:5,hair:8,color:0,beard:0}),op('volkova','Nadia Volkova','Hollow Five',{body:1,skin:1,hair:7,color:1,beard:0}),
 op('brandt','Eli Brandt','Hollow Seven',{body:0,skin:1,hair:5,color:1,beard:1}),op('tanaka','Sam Tanaka','Hollow Seven',{body:1,skin:2,hair:0,color:0,beard:0,hat:1}),
 op('holloway','Grace Holloway','Hollow Eight',{body:1,skin:4,hair:8,color:0,beard:0}),op('malhotra','Dev Malhotra','Hollow Eight',{body:0,skin:3,hair:1,color:0,beard:3})];
export const STAFF=[
 {id:'calloway',name:'Col. James Calloway',short:'Calloway',role:'LEET AF · Commanding',look:{...LEET,body:0,skin:1,hair:1,color:3,beard:2,hat:1}},
 {id:'hale',name:'Warren Hale',short:'Hale',role:'Deputy Director · Homeland Security',look:{body:0,skin:0,hair:0,color:3,beard:0,hat:0,top:11,coat:2,shirt:1,bottom:3,pants:1,shoes:2,boots:1,pack:1,packColor:0}},
 {id:'okafor',name:'SSgt. Ben Okafor',short:'Okafor',role:'LEET AF · Quartermaster',icon:'target',look:{...LEET,body:0,skin:5,hair:4,color:0,beard:1}}];
export const PEOPLE=[...STAFF,...OPERATORS];
export const LOOKS=Object.fromEntries(PEOPLE.map(p=>[p.id,p.look]));
// The briefing: who sits where (row, seat), and where the three at the front stand. On the stage they are lifted by LIFT.
export const SEATED={kessler:[0,0],ortega:[0,1],reyes:[0,3],booker:[0,4],adeyemi:[0,5],park:[0,2],halvorsen:[1,0],walsh:[1,3],mensah:[1,4],volkova:[1,5],
 brandt:[2,0],tanaka:[2,1],holloway:[2,2],malhotra:[2,3]};
export const SEAT_OF=Object.fromEntries(Object.entries(SEATED).map(([id,[r,c]])=>[id,chair(r,c)]));
export const PODIUM_AT={x:365,y:134,direction:2},STAGE_SIDE={x:486,y:142,direction:3},STAGE_AWAY={x:520,y:150,direction:3};
export const BRIEF_STAFF={calloway:{...PODIUM_AT,lift:LIFT},hale:{x:486,y:142,direction:3,lift:LIFT},okafor:{x:105,y:166,direction:2}};
// Gearing up: everyone on their feet round the hangar and out by the trucks.
export const GEAR={calloway:{x:568,y:184,direction:0},hale:{x:600,y:186,direction:4},okafor:{x:105,y:166,direction:2},
 kessler:{x:150,y:196,direction:6},ortega:{x:176,y:204,direction:5},reyes:{x:770,y:334,direction:0},booker:{x:250,y:288,direction:6},
 adeyemi:{x:654,y:144,direction:6},walsh:{x:692,y:146,direction:5},park:{x:832,y:150,direction:4},halvorsen:{x:846,y:340,direction:4},
 mensah:{x:640,y:584,direction:2},volkova:{x:606,y:572,direction:1},brandt:{x:520,y:448,direction:2},tanaka:{x:556,y:440,direction:3},
 holloway:{x:216,y:292,direction:7},malhotra:{x:300,y:612,direction:0}};
// Things to look at and use, each with where you stand (x, y), where its marker floats (mx, my) and how far it reaches.
const at=(id,dy=12,range=36)=>{const o=PROPS.find(p=>p.id===id);return {x:o.x+o.w/2,y:o.y+o.h+dy,mx:o.x+o.w/2,my:o.y-o.z-4-(o.lift||0),range};};
export const OBJECTS=[
 {id:'board',verb:'Look',name:'Briefing board',role:'Bell Jar',...at('board'),say:'board'},
 {id:'coffee',verb:'Look',name:'Coffee',role:'Hangar 3',...at('coffee'),say:'coffee'},
 {id:'cases',prop:'caseA',verb:'Look',name:'Sample cases',role:'Marrow Industries',...at('caseA',12,40),say:'cases'},
 {id:'locker',prop:'lockersB',verb:'Open',name:'Your locker',role:'Hollow Six',x:779,y:136,mx:779,my:40,range:30,say:'locker'},
 {id:'podium',verb:'Look',name:'Podium',role:'The Colonel\'s notes',x:365,y:182,mx:365,my:86,range:30,say:'podium'},
 {id:'screen',verb:'Look',name:'The screen',role:'Sectors',x:440,y:182,mx:440,my:24,range:30,say:'screen'},
 {id:'ramp',prop:'truck',verb:'Board',name:'Your truck',role:'Hollow Six',x:346,y:604,mx:420,my:478,range:44,say:'truck'}];
