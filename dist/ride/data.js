// The ride in (v0.67): the back of Hollow Six's truck between Harlan Field and the Hollow, its roof cut away so you can see in, on
// the wet road at night. You sit on the south bench with your back to us, Aaron across from you on the north bench, Gadget drives.
// The truck stays where it is and the road runs past under it. The truck is the Master Creator's base set (apcbay).
import {apcSeats} from '../mc/assets/props/base.js';
// The world is far wider and taller than the truck so a wide screen or a tall phone still sees road and fields to its edges.
export const RIDE={w:640,h:560};
export const TRUCK={id:'truck',kind:'apcbay',x:170,y:260,w:300,h:76,z:60,cab:66,mark:'H6'};
// Where the three of you sit, in the world: x, the hip line a seated body is cut at, and for Aaron where his boots rest.
const S=apcSeats(TRUCK),at=p=>({x:TRUCK.x+p.x,y:TRUCK.y+p.y,hip:TRUCK.y+p.hip,...(p.feet!==undefined&&{feet:TRUCK.y+p.feet})});
export const SEATS={you:at(S.south[3]),aaron:at(S.north[4]),gadget:at(S.driver)};
// The driver's seat back, drawn over Gadget; the cold case and the beacon's case strapped down in the aisle.
export const DRIVER_BACK={kind:'cabseat',x:SEATS.gadget.x-12,y:SEATS.gadget.y-7,w:4,h:14,z:30};
export const CARGO=[{id:'coldcase',kind:'hazcase',x:TRUCK.x+64,y:TRUCK.y+30,w:26,h:16,z:16,cold:true,marrow:true},{id:'beacon',kind:'beaconcase',x:TRUCK.x+150,y:TRUCK.y+29,w:34,h:18,z:12,open:true}];
// The road: the shoulder and the field above it, the westbound lane, the dashed centre line, and the eastbound lane the truck is in.
// It is painted PERIOD long and repeats. A street lamp (the library's) stands on the north shoulder every LAMP_GAP until the cordon;
// past it the power is out.
export const ROAD={top:160,line:188,bottom:374,period:192},LAMP_GAP=300,LAMP={kind:'streetlamp',x:0,y:ROAD.top-14,w:10,h:10,z:110};
// The Guard's checkpoint, built from the library's road props and placed against its gate as it comes up (dx from the gate, y in the
// world): barriers closing the westbound lane, two of them flashing, cones and the flood light; on the near side, in front of the
// truck (front), the gate's post and sandbags.
export const CHECKPOINT=[{kind:'cone',dx:-196,y:178,w:8,h:8,z:13},{kind:'barrier',dx:-176,y:172,w:52,h:8,z:24},{kind:'barrier',dx:-116,y:174,w:52,h:8,z:24,lit:true},
 {kind:'barrier',dx:-56,y:172,w:52,h:8,z:24,lit:true},{kind:'cone',dx:4,y:178,w:8,h:8,z:13},{kind:'floodlight',dx:18,y:168,w:16,h:10,z:44,on:true},
 {kind:'sandbags',dx:-82,y:ROAD.bottom+2,w:64,h:16,z:18,front:true},{kind:'gatepost',dx:-6,y:ROAD.bottom-6,w:12,h:22,z:58,front:true},{kind:'sandbags',dx:12,y:ROAD.bottom+2,w:56,h:16,z:18,front:true}];
// How fast the road goes by (units a second): on the highway, through the Hollow, and how hard the truck slows and speeds up.
export const DRIVE={cruise:150,hollow:90,brake:70,gas:45};
// Where the road stands still against the truck: the tip of its nose. The checkpoint's gate stops GATE_GAP in front of it.
export const REF=TRUCK.x+TRUCK.w,GATE_GAP=10;
// The three faces in the dialog box: Aaron and Gadget in LEET AF fatigues (Aaron in his helmet), and the Guard corporal at the cordon.
const LEET={top:8,coat:1,shirt:0,bottom:5,pants:3,shoes:3,boots:1,pack:1,packColor:1};
export const LOOKS={aaron:{...LEET,body:0,skin:4,hair:4,color:0,beard:1,hat:6},gadget:{...LEET,body:1,skin:2,hair:9,color:0,beard:0,hat:0},
 guard:{top:7,coat:1,shirt:0,hat:6,bottom:5,pants:3,shoes:3,boots:1,pack:1,packColor:1,body:0,skin:3,hair:0,color:0,beard:0}};
