// Character creator panel: section rail, picture tiles, color swatches, name and undo history.
// Tiles are drawn with the real survivor painter, so every thumbnail shows this character wearing that choice.
import {APPEARANCE_OPTIONS,DEFAULT_APPEARANCE,randomAppearance,readAppearance} from './appearance.js';
import {survivor,HAIR_TONES} from './character.js';
import {GUNS,GRENADES,gunArt,grenadeArt} from './equipment.js';
import {SKIN_TONES,DYES,SHIRT_TOPS,ROT_TONES,rotRamp} from './palette.js';

export const NAME_KEY='deadlight-character-room-name-v1';
// Square crops in world units around the foot anchor: [x, y, size, facing].
const CROPS={full:[-36,-82,72,1],head:[-17,-81,34,1],face:[-15,-66,30,1],torso:[-21,-53,42,1],legs:[-17,-30,34,1],feet:[-14,-20,30,0],back:[-23,-62,46,7]};
const SWATCH={skin:SKIN_TONES.map(t=>t.ramp[0]),color:HAIR_TONES.map(t=>t[0]),coat:DYES.coat.map(d=>d[1]),shirt:DYES.shirt.map(d=>d[1]),pants:DYES.pants.map(d=>d[1]),boots:DYES.boots.map(d=>d[1]),packColor:DYES.pack.map(d=>d[1])};
const LABEL={body:'Body type',skin:'Skin tone',hair:'Hairstyle',color:'Hair color',beard:'Facial hair',hat:'Headwear',top:'Top',coat:'Jacket color',shirt:'Shirt color',bottom:'Pants',pants:'Pants color',shoes:'Shoes',boots:'Shoe color',pack:'Pack',packColor:'Pack color',rot:'Rot',decay:'Decay',eyes:'Eyes',wounds:'Wound'};
export const SECTIONS=[
 {id:'body',name:'Body',rows:[{key:'body',crop:'full'},{key:'skin'}]},
 {id:'head',name:'Head',rows:[{key:'hair',crop:'head'},{key:'color'},{key:'beard',crop:'face'}]},
 {id:'hat',name:'Headwear',rows:[{key:'hat',crop:'head'}]},
 {id:'top',name:'Top',rows:[{key:'top',crop:'torso'},{key:'coat',show:l=>!SHIRT_TOPS.has(l.top),label:l=>l.top===3?'Hoodie color':'Jacket color'},{key:'shirt',show:l=>l.top!==3}]},
 {id:'pants',name:'Pants',rows:[{key:'bottom',crop:'legs'},{key:'pants'}]},
 {id:'shoes',name:'Shoes',rows:[{key:'shoes',crop:'feet'},{key:'boots'}]},
 {id:'pack',name:'Pack',rows:[{key:'pack',crop:'back'},{key:'packColor',show:l=>l.pack!==1}]},
 {id:'gear',name:'Gear',rows:[{gear:'gun'},{gear:'grenade'}],survivor:true},
 {id:'infect',name:'Infection',rows:[{key:'rot'},{key:'decay',crop:'full'},{key:'eyes',crop:'face'},{key:'wounds',crop:'torso'}],zombie:true}
];
// Survivors carry gear; zombies swap that tab for their infection.
const sectionsFor=l=>SECTIONS.filter(s=>l.zombie?!s.survivor:!s.zombie);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const painter=c=>({r:(x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(x,y,w,h);},p:(pts,col)=>{c.fillStyle=col;c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill();}});
const make=(w,h)=>{if(typeof OffscreenCanvas!=='undefined')return new OffscreenCanvas(w,h);const c=document.createElement('canvas');c.width=w;c.height=h;return c;};

export function createCreator({$,storage,look,setLook,loadout,setLoadout}){
 let section='body',history=[],name='';
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
 function rowHtml(row,l){
  if(row.gear){const items=row.gear==='gun'?[['none','Unarmed'],...Object.entries(GUNS).map(([id,g])=>[id,g.name])]:Object.entries(GRENADES).map(([id,g])=>[id,g.name]),cur=loadout()[row.gear];
   const title=row.gear==='gun'?'Firearm':'Grenade',desc=row.gear==='gun'?(GUNS[cur]?.description||'Hands free. Grenades stay available.'):GRENADES[cur].description;
   return `<div class="cr-row"><h3>${title}<b>${esc(items.find(i=>i[0]===cur)?.[1]||'')}</b></h3><div class="cr-tiles">${items.map(([id,n])=>`<button class="cr-tile${id==='none'?' cr-none':''}" data-gear="${row.gear}" data-value="${id}" aria-pressed="${id===cur}" aria-label="${esc(n)}"><canvas width="96" height="96" data-gearthumb="${row.gear}:${id}"></canvas><span>${esc(n)}</span></button>`).join('')}</div><p class="cr-note">${esc(desc)}</p></div>`;}
  if(row.show&&!row.show(l))return '';
  const opts=APPEARANCE_OPTIONS[row.key],cur=l[row.key],title=row.label?row.label(l):LABEL[row.key],sw=row.key==='rot'?ROT_TONES.map((t,i)=>rotRamp(SKIN_TONES[l.skin]?.ramp||SKIN_TONES[0].ramp,i,l.decay)[0]):SWATCH[row.key];
  if(!row.crop)return `<div class="cr-row"><h3>${title}<b>${esc(opts[cur])}</b></h3><div class="cr-swatches">${opts.map((n,i)=>n?`<button class="cr-swatch" data-key="${row.key}" data-value="${i}" aria-pressed="${i===cur}" aria-label="${esc(n)}" title="${esc(n)}" style="--c:${sw[i]}"></button>`:'').join('')}</div></div>`;
  return `<div class="cr-row"><h3>${title}<b>${esc(opts[cur])}</b></h3><div class="cr-tiles">${opts.map((n,i)=>n?`<button class="cr-tile" data-key="${row.key}" data-value="${i}" aria-pressed="${i===cur}" aria-label="${esc(n)}"><canvas width="96" height="96" data-thumb="${row.key}:${i}:${row.crop}"></canvas><span>${esc(n)}</span></button>`:'').join('')}</div></div>`;}
 function render(){const l=look(),list=sectionsFor(l);if(!list.some(x=>x.id===section))section=section==='gear'?'infect':section==='infect'?'gear':'body';const s=list.find(x=>x.id===section),panel=$('creatorPanel');
  panel.innerHTML=`<div class="cr-panel-head"><h2>${s.name}</h2><span>${list.indexOf(s)+1} / ${list.length}</span></div>`+s.rows.map(r=>rowHtml(r,l)).join('');
  for(const b of $('categoryRail').querySelectorAll?.('[data-section]')||[]){b.setAttribute('aria-pressed',String(b.dataset.section===section));b.hidden=!list.some(x=>x.id===b.dataset.section);}
  for(const b of $('kindSwitch').querySelectorAll?.('[data-kind]')||[])b.setAttribute('aria-pressed',String((b.dataset.kind==='zombie')===!!l.zombie));
  $('creatorKicker')&&($('creatorKicker').textContent=l.zombie?'Infected specimen · File 01':'Survivor intake · File 01');
  for(const c of panel.querySelectorAll?.('canvas[data-thumb]')||[]){const [key,v,crop]=c.dataset.thumb.split(':');thumb(c,{...l,[key]:Number(v)},crop);}
  for(const c of panel.querySelectorAll?.('canvas[data-gearthumb]')||[]){const [kind,id]=c.dataset.gearthumb.split(':');gearThumb(c,kind,id);}
  $('undoLook').disabled=!history.length;}
 function change(next){history.push(look());if(history.length>40)history.shift();setLook(next);}
 function pick(t){if(!t)return;if(t.dataset?.gear){setLoadout({...loadout(),[t.dataset.gear]:t.dataset.value});return;}
  if(t.dataset?.key){const key=t.dataset.key,v=Number(t.dataset.value);if(look()[key]!==v)change({...look(),[key]:v});}}
 $('creatorPanel').addEventListener('click',e=>pick(e.target?.closest?e.target.closest('[data-key],[data-gear]'):e.target));
 $('categoryRail').addEventListener('click',e=>{const t=e.target?.closest?e.target.closest('[data-section]'):e.target;if(t?.dataset?.section)show(t.dataset.section);});
 $('randomLook').onclick=()=>change({...randomAppearance(),body:look().body,zombie:look().zombie});
 $('resetLook').onclick=()=>change({...DEFAULT_APPEARANCE,zombie:look().zombie});
 // Each kind keeps its own saved look; the first zombie is the current survivor, turned.
 function setKind(kind){if((kind==='zombie')===!!look().zombie)return;history=[];setLook(readAppearance(storage,kind));}
 $('kindSwitch').addEventListener('click',e=>{const t=e.target?.closest?e.target.closest('[data-kind]'):e.target;if(t?.dataset?.kind)setKind(t.dataset.kind);});
 $('undoLook').onclick=()=>{if(!history.length)return;setLook(history.pop());};
 const field=$('survivorName');field.value=name;
 field.addEventListener('input',()=>{name=field.value.replace(/\s+/g,' ').trimStart().slice(0,18);try{storage?.setItem(NAME_KEY,name.trim());}catch{}});
 function show(id){if(SECTIONS.some(s=>s.id===id))section=id;render();}
 return {show,refresh:render,setKind,name:()=>name.trim(),section:()=>section};
}
