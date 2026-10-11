// How far into Operation Bell Jar you are (v0.66), kept on the device apart from Marcus's night: the stage you are at (the briefing,
// gearing up, rifle drawn, on the truck, off it at Juniper Lane, on the ground, back aboard) and, from v0.70, the furthest you have
// ever got, so New Game can start you at any part you have reached. Nothing here touches the page; app.js reads and writes through it.
import {OP} from '../story/op.js';
export const OP_KEY='deadlight-op-v1',OP_STAGES=['brief','gear','armed','boarded','arrived','op','done'];
const at=s=>OP_STAGES.indexOf(s);
// The parts, each with the stage it starts you at.
export const OP_PARTS=[['brief','brief'],['ride','boarded'],['ground','arrived']].map(([id,stage])=>({id,stage,label:OP.parts[id][0],sub:OP.parts[id][1]}));
// The save as kept: a stage it knows, and reached never behind it (a save from before v0.70 has only the stage).
export function readOpSave(storage){try{const v=JSON.parse(storage?.getItem(OP_KEY)||'null');if(v&&at(v.stage)>=0)return {stage:v.stage,reached:at(v.reached)>=at(v.stage)?v.reached:v.stage};}catch{}return null;}
// Moving on: the change, with reached kept at the furthest stage yet.
export function advance(save,patch){const s={...save,...patch};if(at(s.stage)>at(s.reached))s.reached=s.stage;return s;}
// New Game's parts: none until you have got on the truck (New Game is then just the briefing); after that each part, open once reached.
export function opParts(save){const r=at(save?.reached);if(r<at('boarded'))return null;
 return OP_PARTS.map(p=>({id:p.id,label:p.label,sub:r>=at(p.stage)?p.sub:'Not reached yet',off:r<at(p.stage)}));}
// The line under New Game: the operation done, or parts to pick from, or (null) the menu's own line.
export function newGameLine(save){return save?.stage==='done'?OP.parts.done:opParts(save)?OP.parts.again:null;}
