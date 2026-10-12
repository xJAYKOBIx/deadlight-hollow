// Character creator panel: section rail, picture tiles, color swatches, name and undo history.
// Tiles are drawn with the real survivor painter, so every thumbnail shows this character wearing that choice.
import {APPEARANCE_OPTIONS,DEFAULT_APPEARANCE,UNIFORMS,randomAppearance,readAppearance} from './appearance.js';
import {survivor,HAIR_TONES} from './character.js';
import {GUNS,GRENADES,gunArt,grenadeArt} from './equipment.js';
import {SKIN_TONES,DYES,SHIRT_TOPS,ROT_TONES,rotRamp} from './palette.js';
import {SPECIES,PET_OPTIONS,COATS,EYES,COLLARS,DEFAULT_PET,petLook,withLook,randomPet,cleanName} from '../companion/look.js';import {pet,PET_FRAME} from '../companion/pet.js';

export const NAME_KEY='deadlight-character-room-name-v1';
// Square crops in world units around the foot anchor: [x, y, size, facing].
const CROPS={full:[-36,-82,72,1],head:[-17,-81,34,1],face:[-15,-66,30,1],torso:[-21,-53,42,1],legs:[-17,-30,34,1],feet:[-14,-20,30,0],back:[-23,-62,46,7]};
const SWATCH={skin:SKIN_TONES.map(t=>t.ramp[0]),color:HAIR_TONES.map(t=>t[0]),coat:DYES.coat.map(d=>d[1]),shirt:DYES.shirt.map(d=>d[1]),pants:DYES.pants.map(d=>d[1]),boots:DYES.boots.map(d=>d[1]),packColor:DYES.pack.map(d=>d[1])};
const LABEL={body:'Body type',skin:'Skin tone',hair:'Hairstyle',color:'Hair color',beard:'Facial hair',hat:'Headwear',top:'Top',coat:'Jacket color',shirt:'Shirt color',bottom:'Pants',pants:'Pants color',shoes:'Shoes',boots:'Shoe color',pack:'Pack',packColor:'Pack color',rot:'Rot',decay:'Decay',eyes:'Eyes',wounds:'Wound'};
export const SECTIONS=[
 {id:'body',name:'Body',rows:[{key:'body',crop:'full'},{key:'skin'}]},
 {id:'head',name:'Head',rows:[{key:'hair',crop:'head'},{key:'color'},{key:'beard',crop:'face'}]},
 {id:'hat',name:'Headwear',rows:[{key:'hat',crop:'head'}]},
 {id:'top',name:'Top',rows:[{uniform:true},{key:'top',crop:'torso'},{key:'coat',show:l=>!SHIRT_TOPS.has(l.top),label:l=>l.top===3?'Hoodie color':l.top===7||l.top===8?'Fatigue color':l.top===10?'Uniform color':'Jacket color'},{key:'shirt',show:l=>![3,7,8,10].includes(l.top)}]},
 {id:'pants',name:'Pants',rows:[{key:'bottom',crop:'legs'},{key:'pants'}]},
 {id:'shoes',name:'Shoes',rows:[{key:'shoes',crop:'feet'},{key:'boots'}]},
 {id:'pack',name:'Pack',rows:[{key:'pack',crop:'back'},{key:'packColor',show:l=>l.pack!==1}]},
 {id:'gear',name:'Gear',rows:[{gear:'gun'},{gear:'grenade'}],survivor:true},
 {id:'infect',name:'Infection',rows:[{key:'rot'},{key:'decay',crop:'full'},{key:'eyes',crop:'face'},{key:'wounds',crop:'torso'}],zombie:true}
];
// The companion has its own short set of pages.
export const PET_SECTIONS=[
 {id:'pkind',name:'Companion',rows:[{pet:'species'},{pet:'breed'}]},
 {id:'pcoat',name:'Coat',rows:[{pet:'coat'},{pet:'marking'}]},
 {id:'pdetail',name:'Eyes and collar',rows:[{pet:'eyes'},{pet:'collar'}]},
 {id:'pgear',name:'Gear',rows:[{pet:'gear'}]}];
const PET_LABEL={species:'Dog or cat',breed:'Breed',coat:'Coat',marking:'Markings',eyes:'Eyes',collar:'Collar',gear:'Gear'};
// Odd eyes show both colors, split down the middle.
const PET_SWATCH={coat:COATS.map(c=>c.ramp[2]),eyes:EYES.map(e=>e.col2?`linear-gradient(90deg,${e.col} 50%,${e.col2} 50%)`:e.col)};
// Survivors carry gear; zombies swap that tab for their infection.
const sectionsFor=l=>SECTIONS.filter(s=>l.zombie?!s.survivor:!s.zombie);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const painter=c=>({r:(x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(x,y,w,h);},p:(pts,col)=>{c.fillStyle=col;c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill();}});
const make=(w,h)=>{if(typeof OffscreenCanvas!=='undefined')return new OffscreenCanvas(w,h);const c=document.createElement('canvas');c.width=w;c.height=h;return c;};

// dev(): the full creator, zombies and all, for making the game's own people (the ?dev or #dev link); players get the rest (v0.71).
export function createCreator({$,storage,kicker=()=>null,look,setLook,loadout,setLoadout,companion=()=>null,setCompanion=()=>{},dev=()=>false}){
 let section='body',history=[],name='',mode='person',petSection='pkind',petHistory=[];
 try{name=storage?.getItem(NAME_KEY)||'';}catch{}
 const cache=new Map();
 function frame(l,dir){const key=dir+JSON.stringify(l);if(cache.has(key))return cache.get(key);if(cache.size>160)cache.clear();
  const c=make(160,192),g=c.getContext('2d');g.scale(2,2);survivor(g,dir,0,true,l);cache.set(key,c);return c;}
 function thumb(canvas,l,crop){const [x,y,s,dir]=CROPS[crop],g=canvas.getContext('2d');g.clearRect(0,0,canvas.width,canvas.height);g.imageSmoothingEnabled=false;
  g.drawImage(frame(l,dir),(40+x)*2,(85+y)*2,s*2,s*2,0,0,canvas.width,canvas.height);}
 // Gear art is drawn large on a scratch canvas, then trimmed to its pixels and fitted to the tile.
 function gearThumb(canvas,kind,id){const g=canvas.getContext('2d'),W=canvas.width;g.clearRect(0,0,W,W);g.imageSmoothingEnabled=false;
  if(id==='none'){g.strokeStyle='#6f675b';g.lineWidth=5;g.beginPath();g.arc(W/2,W/2,W*.22,0,7);g.moveTo(W*.35,W*.65);g.lineTo(W*.65,W*.35);g.stroke();return;}
  const s=make(240,120),c=s.getContext('2d');c.translate(120,60);c.scale(4,4);
  if(kind==='gun'){if(!GUNS[id])return;gunArt(painter(c),id);}else grenadeArt(painter(c),id);
  const d=c.getImageData(0,0,240,120).data;let x0=240,y0=120,x1=0,y1=0;
  for(let y=0;y<120;y++)for(let x=0;x<240;x++)if(d[(y*240+x)*4+3]>8){if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y;}
  if(x1<x0)return;const w=x1-x0+1,h=y1-y0+1,k=Math.min(W*.84/w,W*.6/h,kind==='gun'?1.2:1.4),dw=w*k,dh=h*k;
  g.drawImage(s,x0,y0,w,h,Math.round((W-dw)/2),Math.round((W-dh)/2),Math.round(dw),Math.round(dh));}
 // Companion thumbnails: the real companion painter, cropped around the body.
 const petCache=new Map();
 function petFrame(l,dir,frame){const key=dir+':'+frame+JSON.stringify(l);if(petCache.has(key))return petCache.get(key);if(petCache.size>120)petCache.clear();
  const c=make(PET_FRAME.w,PET_FRAME.h),g=c.getContext('2d');g.scale(2,2);pet(g,dir,frame,l);petCache.set(key,c);return c;}
 // Collars are small, so their tiles look closer: a square at the top right of the animal, where its head and neck are when it faces front right.
 function petThumb(canvas,l,close){const g=canvas.getContext('2d'),fr=petFrame(l,1,0);let [x,y,s]=l.species?[34,38,98]:[22,16,116];
  if(close){const d=fr.getContext('2d').getImageData(0,0,fr.width,fr.height).data;let x1=0,y0=fr.height,x0=fr.width;for(let i=3;i<d.length;i+=4)if(d[i]>8){const px=(i>>2)%fr.width,py=(i>>2)/fr.width|0;if(px>x1)x1=px;if(px<x0)x0=px;if(py<y0)y0=py;}
   s=Math.round(Math.max(44,(x1-x0)*.7));x=x1-s+2;y=y0+Math.round(s*.24);}
  g.clearRect(0,0,canvas.width,canvas.height);g.imageSmoothingEnabled=false;g.drawImage(fr,x,y,s,s,0,0,canvas.width,canvas.height);}
 function petRowHtml(row,c){const l=petLook(c),key=row.pet,opts=key==='species'?SPECIES:PET_OPTIONS(c.species)[key],cur=key==='species'?c.species:l[key],title=PET_LABEL[key];
  if(PET_SWATCH[key])return `<div class="cr-row"><h3>${title}<b>${esc(opts[cur])}</b></h3><div class="cr-swatches">${opts.map((n,i)=>`<button class="cr-swatch" data-pet="${key}" data-value="${i}" aria-pressed="${i===cur}" aria-label="${esc(n)}" title="${esc(n)}" style="--c:${PET_SWATCH[key][i]}"></button>`).join('')}</div></div>`;
  return `<div class="cr-row"><h3>${title}<b>${esc(opts[cur])}</b></h3><div class="cr-tiles">${opts.map((n,i)=>`<button class="cr-tile" data-pet="${key}" data-value="${i}" aria-pressed="${i===cur}" aria-label="${esc(n)}"><canvas width="96" height="96" data-petthumb="${key}:${i}"></canvas><span>${esc(n)}</span></button>`).join('')}</div></div>`;}
 function petVariant(c,key,v){if(key==='species')return petLook({...c,species:v});return {...petLook(c),[key]:v};}
 function rowHtml(row,l){
  // Uniform sets dress the whole outfit in one tap; the tile shows this character wearing it.
  if(row.uniform){const on=UNIFORMS.findIndex(u=>Object.entries(u.look).every(([k,v])=>l[k]===v));
   return `<div class="cr-row"><h3>Uniform sets<b>${on<0?'Mix and match':esc(UNIFORMS[on].name)}</b></h3><div class="cr-tiles">${UNIFORMS.map((u,i)=>`<button class="cr-tile" data-uniform="${i}" aria-pressed="${i===on}" aria-label="${esc(u.name)} uniform"><canvas width="96" height="96" data-uniformthumb="${i}"></canvas><span>${esc(u.name)}</span></button>`).join('')}</div></div>`;}
  if(row.gear){const items=row.gear==='gun'?[['none','Unarmed'],...Object.entries(GUNS).map(([id,g])=>[id,g.name])]:Object.entries(GRENADES).map(([id,g])=>[id,g.name]),cur=loadout()[row.gear];
   const title=row.gear==='gun'?'Firearm':'Grenade',desc=row.gear==='gun'?(GUNS[cur]?.description||'Hands free. Grenades stay available.'):GRENADES[cur].description;
   return `<div class="cr-row"><h3>${title}<b>${esc(items.find(i=>i[0]===cur)?.[1]||'')}</b></h3><div class="cr-tiles">${items.map(([id,n])=>`<button class="cr-tile${id==='none'?' cr-none':''}" data-gear="${row.gear}" data-value="${id}" aria-pressed="${id===cur}" aria-label="${esc(n)}"><canvas width="96" height="96" data-gearthumb="${row.gear}:${id}"></canvas><span>${esc(n)}</span></button>`).join('')}</div><p class="cr-note">${esc(desc)}</p></div>`;}
  if(row.show&&!row.show(l))return '';
  const opts=APPEARANCE_OPTIONS[row.key],cur=l[row.key],title=row.label?row.label(l):LABEL[row.key],sw=row.key==='rot'?ROT_TONES.map((t,i)=>rotRamp(SKIN_TONES[l.skin]?.ramp||SKIN_TONES[0].ramp,i,l.decay)[0]):SWATCH[row.key];
  if(!row.crop)return `<div class="cr-row"><h3>${title}<b>${esc(opts[cur])}</b></h3><div class="cr-swatches">${opts.map((n,i)=>n?`<button class="cr-swatch" data-key="${row.key}" data-value="${i}" aria-pressed="${i===cur}" aria-label="${esc(n)}" title="${esc(n)}" style="--c:${sw[i]}"></button>`:'').join('')}</div></div>`;
  return `<div class="cr-row"><h3>${title}<b>${esc(opts[cur])}</b></h3><div class="cr-tiles">${opts.map((n,i)=>n?`<button class="cr-tile" data-key="${row.key}" data-value="${i}" aria-pressed="${i===cur}" aria-label="${esc(n)}"><canvas width="96" height="96" data-thumb="${row.key}:${i}:${row.crop}"></canvas><span>${esc(n)}</span></button>`:'').join('')}</div></div>`;}
 function renderPet(){const c=companion(),list=PET_SECTIONS;if(!list.some(x=>x.id===petSection))petSection='pkind';const s=list.find(x=>x.id===petSection),panel=$('creatorPanel');
  panel.innerHTML=`<div class="cr-panel-head"><h2>${s.name}</h2><span>${list.indexOf(s)+1} / ${list.length}</span></div>`+s.rows.map(r=>petRowHtml(r,c)).join('');
  for(const b of $('categoryRail').querySelectorAll?.('[data-section]')||[]){b.setAttribute('aria-pressed',String(b.dataset.section===petSection));b.hidden=!list.some(x=>x.id===b.dataset.section);}
  $('creatorKicker')&&($('creatorKicker').textContent=(c.species?'Cat':'Dog')+' · Companion file');
  for(const cv of panel.querySelectorAll?.('canvas[data-petthumb]')||[]){const [key,v]=cv.dataset.petthumb.split(':');petThumb(cv,petVariant(c,key,Number(v)),key==='collar');}
  const field=$('survivorName');field.placeholder=c.species?'Name your cat':'Name your dog';$('undoLook').disabled=!petHistory.length;kinds('companion');more();}
 function render(){document.body.classList?.toggle?.('cr-pet',mode==='pet');if(mode==='pet'){renderPet();return;}const l=look(),list=sectionsFor(l);$('survivorName').placeholder='Survivor 01';if(!list.some(x=>x.id===section))section=section==='gear'?'infect':section==='infect'?'gear':'body';const s=list.find(x=>x.id===section),panel=$('creatorPanel');
  panel.innerHTML=`<div class="cr-panel-head"><h2>${s.name}</h2><span>${list.indexOf(s)+1} / ${list.length}</span></div>`+s.rows.map(r=>rowHtml(r,l)).join('');
  for(const b of $('categoryRail').querySelectorAll?.('[data-section]')||[]){b.setAttribute('aria-pressed',String(b.dataset.section===section));b.hidden=!list.some(x=>x.id===b.dataset.section);}
  $('creatorKicker')&&($('creatorKicker').textContent=kicker()||(l.zombie?'Infected specimen · File 01':'Survivor intake · File 01'));
  for(const c of panel.querySelectorAll?.('canvas[data-thumb]')||[]){const [key,v,crop]=c.dataset.thumb.split(':');thumb(c,{...l,[key]:Number(v)},crop);}
  for(const c of panel.querySelectorAll?.('canvas[data-uniformthumb]')||[])thumb(c,{...l,...UNIFORMS[Number(c.dataset.uniformthumb)].look},'full');
  for(const c of panel.querySelectorAll?.('canvas[data-gearthumb]')||[]){const [kind,id]=c.dataset.gearthumb.split(':');gearThumb(c,kind,id);}
  $('undoLook').disabled=!history.length;kinds(l.zombie?'zombie':'survivor');more();}
 // Who you are making, lit; Zombie only shows in the full creator.
 function kinds(on){for(const b of $('kindSwitch').querySelectorAll?.('[data-kind]')||[]){b.setAttribute('aria-pressed',String(b.dataset.kind===on));if(b.dataset.kind==='zombie')b.hidden=!dev()&&on!=='zombie';}}
 // The More below tab and the fade over the bottom of the choices, while there is more to scroll to; the tab scrolls most of a screen.
 function more(){const p=$('creatorPanel'),w=p?.parentElement;if(!w?.classList||p.scrollHeight===undefined)return;w.classList.toggle('more',p.scrollHeight-p.scrollTop-p.clientHeight>12);}
 $('creatorPanel').addEventListener('scroll',more,{passive:true});globalThis.addEventListener?.('resize',more);
 $('creatorMore')?.addEventListener('click',()=>{const p=$('creatorPanel');p.scrollBy?.({top:p.clientHeight*.7,behavior:'smooth'});});
 function change(next){history.push(look());if(history.length>40)history.shift();setLook(next);}
 function changePet(next){petHistory.push(companion());if(petHistory.length>40)petHistory.shift();setCompanion(next);}
 function pickPet(t){const key=t.dataset.pet,v=Number(t.dataset.value),c=companion();if(key==='species'){if(c.species!==v){changePet({...c,species:v});}return;}if(petLook(c)[key]!==v)changePet(withLook(c,{...petLook(c),[key]:v}));}
 function pick(t){if(!t)return;if(t.dataset?.pet){pickPet(t);return;}if(t.dataset?.uniform!==undefined){const u=UNIFORMS[Number(t.dataset.uniform)];if(u)change({...look(),...u.look});return;}if(t.dataset?.gear){setLoadout({...loadout(),[t.dataset.gear]:t.dataset.value});return;}
  if(t.dataset?.key){const key=t.dataset.key,v=Number(t.dataset.value);if(look()[key]!==v)change({...look(),[key]:v});}}
 $('creatorPanel').addEventListener('click',e=>pick(e.target?.closest?e.target.closest('[data-key],[data-gear],[data-pet],[data-uniform]'):e.target));
 $('categoryRail').addEventListener('click',e=>{const t=e.target?.closest?e.target.closest('[data-section]'):e.target;if(t?.dataset?.section)show(t.dataset.section);});
 const field=$('survivorName');
 $('randomLook').onclick=()=>{if(mode==='pet'){const c=companion();changePet(withLook(c,randomPet(c.species)));return;}change({...randomAppearance(),body:look().body,zombie:look().zombie});};
 $('resetLook').onclick=()=>{if(mode==='pet'){const c=companion();changePet(withLook(c,DEFAULT_PET[c.species?'cat':'dog']));return;}change({...DEFAULT_APPEARANCE,zombie:look().zombie});};
 // Each kind keeps its own saved look; the first zombie is the current survivor, turned.
 // The third choice opens the companion's pages; the survivor or zombie stays as it was.
 function setKind(kind){if(kind==='companion'){if(mode!=='pet'){mode='pet';field.value=companion().name;render();}return;}
  const wasPet=mode==='pet';if(wasPet){mode='person';field.value=name;}
  if(kind==='zombie'&&!dev()){if(wasPet)render();return;}
  if((kind==='zombie')===!!look().zombie){if(wasPet)render();return;}history=[];setLook(readAppearance(storage,kind));}
 $('kindSwitch').addEventListener('click',e=>{const t=e.target?.closest?e.target.closest('[data-kind]'):e.target;if(t?.dataset?.kind)setKind(t.dataset.kind);});
 $('undoLook').onclick=()=>{if(mode==='pet'){if(petHistory.length)setCompanion(petHistory.pop());return;}if(!history.length)return;setLook(history.pop());};
 field.value=name;
 field.addEventListener('input',()=>{if(mode==='pet'){const n=cleanName(field.value);setCompanion({...companion(),name:n.trim()},{name:true});return;}name=field.value.replace(/\s+/g,' ').trimStart().slice(0,18);try{storage?.setItem(NAME_KEY,name.trim());}catch{}});
 function show(id){const was=mode==='pet'?petSection:section;if(PET_SECTIONS.some(s=>s.id===id)){petSection=id;mode='pet';field.value=companion().name;}else if(SECTIONS.some(s=>s.id===id)){section=id;if(mode==='pet'){mode='person';field.value=name;}}
  if(was!==id&&$('creatorPanel'))$('creatorPanel').scrollTop=0;render();}
 return {show,refresh:render,setKind,name:()=>name.trim(),section:()=>section,mode:()=>mode};
}
