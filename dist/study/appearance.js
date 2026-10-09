import {SKIN_TONES,DYES} from './palette.js';
export const APPEARANCE_KEY='deadlight-character-room-look-v1';
export const APPEARANCE_OPTIONS={hair:['Swept hair','Short crop','Ponytail','Bald','Buzz cut','Mohawk','Bob','Long hair','Curly','Top bun'],beard:['Clean shaven','Stubble','Mustache','Full beard','Goatee','Short beard','Long beard'],hat:['No hat','Field cap','Knit hat','Police cap','Cowboy hat','Riot helmet'],color:['Dark','Chestnut','Fair','Silver','Auburn','Platinum'],
 // Body and clothing parts. Every index stays stable once saved; append new choices at the end.
 body:['Male','Female'],skin:SKIN_TONES.map(t=>t.name),top:['Field jacket','T-shirt'],coat:DYES.coat.map(d=>d[0]),shirt:DYES.shirt.map(d=>d[0]),pants:DYES.pants.map(d=>d[0]),boots:DYES.boots.map(d=>d[0]),pack:['Leather pack','No pack'],packColor:DYES.pack.map(d=>d[0])};
export const DEFAULT_APPEARANCE={hair:0,beard:0,hat:0,color:0,body:0,skin:0,top:0,coat:0,shirt:0,pants:0,boots:0,pack:0,packColor:0};
// A random look for quick exploration; every combination is valid.
export function randomAppearance(rand=Math.random){const out={};for(const [key,options] of Object.entries(APPEARANCE_OPTIONS)){const valid=options.map((v,i)=>v?i:-1).filter(i=>i>=0);out[key]=valid[Math.floor(rand()*valid.length)];}return out;}
export function normalizeAppearance(value){const out={...DEFAULT_APPEARANCE};for(const key of Object.keys(out)){const v=value?.[key];if(Number.isInteger(v)&&v>=0&&v<APPEARANCE_OPTIONS[key].length&&APPEARANCE_OPTIONS[key][v])out[key]=v;}return out;}
export const appearanceKey=look=>Object.keys(DEFAULT_APPEARANCE).map(k=>look[k]).join('-');
export function readAppearance(storage){try{return normalizeAppearance(JSON.parse(storage.getItem(APPEARANCE_KEY)));}catch{return {...DEFAULT_APPEARANCE};}}
export function saveAppearance(storage,look){try{storage.setItem(APPEARANCE_KEY,JSON.stringify(normalizeAppearance(look)));return true;}catch{return false;}}
