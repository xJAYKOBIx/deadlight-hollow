// Your companion: a dog or a cat, its breed, coat, markings, eyes, collar, gear and name. Saved on this device.
export const COMPANION_KEY='deadlight-companion-v1';
export const SPECIES=['Dog','Cat'];
// Every list here is saved by index: new choices only ever go on the end.
export const BREEDS=[['Shepherd','Lab','Terrier','Husky','Pit bull','Collie','Beagle','Corgi','Doberman'],['Shorthair','Longhair','Maine Coon','Siamese','Bobtail','Fold']];
export const MARKINGS=[['Solid','White chest','Saddle','Patches','Mask','Tan points','Brindle','Spotted','Socks','Blaze'],['Solid','Tabby','White chest','Tuxedo','Patches','Calico','Points','Socks','Spotted','Tortie']];
// Coat ramps run deep, low, base, high. Indexes are stable once saved; append new ones at the end.
export const COATS=[
 {name:'Black',ramp:['#141418','#1f1f25','#2d2d35','#45454f']},
 {name:'Chocolate',ramp:['#24160f','#3a2419','#553626','#74503a']},
 {name:'Tan',ramp:['#4e321a','#76502d','#9f7343','#c49a62']},
 {name:'Golden',ramp:['#6a461b','#98692b','#c8953d','#e4bd6a']},
 {name:'Ginger',ramp:['#5e2812','#8f451e','#c46c2c','#e39549']},
 {name:'Gray',ramp:['#32363e','#4f555f','#757d88','#9da6b0']},
 {name:'Cream',ramp:['#7e6e55','#ae9c7c','#d8c7a5','#efe3c6']},
 {name:'White',ramp:['#8a8579','#bab4a6','#dfdacd','#f5f2e9']},
 {name:'Red',ramp:['#3c140e','#621f15','#8c3220','#b34e30']},
 {name:'Silver',ramp:['#4a4c50','#77797e','#a3a6aa','#cdd0d2']},
 {name:'Blue',ramp:['#252a35','#3b4252','#59637a','#7d89a0']},
 {name:'Fawn',ramp:['#6a4e33','#94714d','#bb9468','#d9b88c']}];
// Odd eyes are blue on the left and brown on the right (col2).
export const EYES=[{name:'Brown',col:'#4a2a16'},{name:'Amber',col:'#c98a1c'},{name:'Green',col:'#5f9a3a'},{name:'Blue',col:'#5aa6d6'},{name:'Hazel',col:'#7d6a2c'},{name:'Copper',col:'#b65a1e'},{name:'Ice',col:'#a8dcef'},{name:'Odd eyes',col:'#5aa6d6',col2:'#4a2a16'}];
export const COLLARS=[{name:'Red collar',col:'#b8352b'},{name:'Blue collar',col:'#2f64a8'},{name:'Green collar',col:'#3f7d3a'},{name:'Ember collar',col:'#dd6f2c'},{name:'Leather collar',col:'#6b4a2c'},{name:'Bandana',col:'#b8352b',bandana:true},{name:'No collar',col:null},
 {name:'Spiked collar',col:'#2a2a30',spikes:true},{name:'Bell collar',col:'#b8352b',bell:true},{name:'Blue bandana',col:'#2f64a8',bandana:true},{name:'Olive bandana',col:'#5f6b34',bandana:true},
 {name:'Pink collar',col:'#d0607e'},{name:'Purple collar',col:'#6b45a0'},{name:'Yellow collar',col:'#d8b02a'}];
// Gear worn over the body. Ramps run deep, low, base, high, like the coats.
export const GEAR=[{name:'No gear'},{name:'Harness',ramp:['#2c0d0b','#561a15','#84291f','#ab4130']},{name:'Saddlebags',ramp:['#24251a','#3c3f2b','#5a5d40','#7a7d58']},
 {name:'Medic vest',ramp:['#2a3020','#3e4730','#566243','#717f59']},{name:'Tactical vest',ramp:['#3a2f1e','#5e4c31','#826b48','#a38b62']},{name:'Hi-vis vest',ramp:['#4e5a0c','#7f9114','#b4c826','#d6e956']}];
// Each kind keeps its own look, so switching between dog and cat never loses a choice.
export const DEFAULT_PET={dog:{breed:0,coat:2,marking:2,eyes:0,collar:0,gear:0},cat:{breed:0,coat:4,marking:1,eyes:2,collar:3,gear:0}};
export const DEFAULT_COMPANION={species:0,...DEFAULT_PET,name:''};
export const PET_OPTIONS=species=>({breed:BREEDS[species],coat:COATS.map(c=>c.name),marking:MARKINGS[species],eyes:EYES.map(e=>e.name),collar:COLLARS.map(c=>c.name),gear:GEAR.map(g=>g.name)});
const kindKey=s=>s?'cat':'dog';
function normalizeLook(v,species){const out={...DEFAULT_PET[kindKey(species)]},opts=PET_OPTIONS(species);for(const k of Object.keys(out)){const n=v?.[k];if(Number.isInteger(n)&&n>=0&&n<opts[k].length)out[k]=n;}return out;}
export function cleanName(s){return String(s??'').replace(/[\u0000-\u001f]/g,'').replace(/\s+/g,' ').trimStart().slice(0,16);}
export function normalizeCompanion(v){const species=v?.species===1?1:0;return {species,dog:normalizeLook(v?.dog,0),cat:normalizeLook(v?.cat,1),name:cleanName(v?.name).trim()};}
// The look the painter draws: the active kind's choices plus its species.
export const petLook=c=>({species:c.species,...c[kindKey(c.species)]});
export function withLook(c,look){return normalizeCompanion({...c,[kindKey(c.species)]:look});}
export function readCompanion(storage){try{const raw=storage?.getItem(COMPANION_KEY);if(raw)return normalizeCompanion(JSON.parse(raw));}catch{}return normalizeCompanion();}
export function saveCompanion(storage,c){try{storage.setItem(COMPANION_KEY,JSON.stringify(normalizeCompanion(c)));return true;}catch{return false;}}
export function randomPet(species,rand=Math.random){const opts=PET_OPTIONS(species),out={};for(const [k,list] of Object.entries(opts))out[k]=Math.floor(rand()*list.length);return out;}
export const displayName=c=>c.name||(c.species?'Your cat':'Your dog');
