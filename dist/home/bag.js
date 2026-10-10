// What you carry: a grid of cells (the pack's columns × rows) with items placed on it, each at a cell and either upright or
// turned a quarter (r). Stacks of the same supply share one place up to its stack size. Whatever does not fit (after changing
// to a smaller pack) is set down in spill until there is room again, so nothing is ever lost; it is not carried meanwhile. All functions return new state.
import {itemInfo,weightOf,GUN_KG} from '../mc/assets/gear/items.js';
export const emptyBag=()=>({items:[],spill:[]});
export const dims=it=>{const s=itemInfo(it.id)?.shape||[1,1];return it.r?[s[1],s[0]]:[s[0],s[1]];};
const overlap=(a,b)=>{const [aw,ah]=dims(a),[bw,bh]=dims(b);return a.x<b.x+bw&&b.x<a.x+aw&&a.y<b.y+bh&&b.y<a.y+ah;};
// Whether an item can sit at (x, y) turned r, leaving out the item at index skip (the one being moved).
export function canPlace(state,grid,it,x,y,r=it.r|0,skip=-1){const c={...it,x,y,r},[w,h]=dims(c);if(x<0||y<0||x+w>grid.cols||y+h>grid.rows)return false;
 return state.items.every((o,i)=>i===skip||!overlap(c,o));}
// The first free spot, row by row: anywhere upright first, then turned.
export function firstFit(state,grid,it,turns=[0,1]){for(const r of turns)for(let y=0;y<grid.rows;y++)for(let x=0;x<grid.cols;x++)if(canPlace(state,grid,it,x,y,r))return {x,y,r};return null;}
// Adds n of a supply: tops up stacks already there, then starts new ones where they fit. What will not fit goes to spill.
export function add(state,grid,id,n=1){const info=itemInfo(id);if(!info||n<=0)return state;let items=state.items.map(o=>({...o})),left=n;
 for(const o of items)if(o.id===id&&o.n<info.stack&&left>0){const k=Math.min(left,info.stack-o.n);o.n+=k;left-=k;}
 while(left>0){const k=Math.min(left,info.stack),spot=firstFit({items},grid,{id});if(!spot)break;items.push({id,n:k,...spot});left-=k;}
 const spill=state.spill.map(o=>({...o}));if(left>0){const s=spill.find(o=>o.id===id);if(s)s.n+=left;else spill.push({id,n:left});}
 return {items,spill};}
// Takes up to n of a supply out of the bag, from the smallest stacks first.
export function remove(state,id,n=1){const items=state.items.map(o=>({...o})),order=items.map((o,i)=>i).filter(i=>items[i].id===id).sort((a,b)=>items[a].n-items[b].n);let left=n;
 for(const i of order){const k=Math.min(left,items[i].n);items[i].n-=k;left-=k;}return {items:items.filter(o=>o.n>0),spill:state.spill};}
export const count=(state,id)=>state.items.reduce((s,o)=>s+(o.id===id?o.n:0),0);
// Moves the item at index i to (x, y) turned r, if it fits there; otherwise nothing changes.
export function move(state,grid,i,x,y,r){const it=state.items[i];if(!it||!canPlace(state,grid,it,x,y,r??it.r,i))return state;
 return {...state,items:state.items.map((o,k)=>k===i?{...o,x,y,r:r??o.r}:o)};}
// Turns an item a quarter where it stands, or at the first spot it fits turned, if it does not fit in place.
export function rotate(state,grid,i){const it=state.items[i];if(!it)return state;const r=it.r?0:1;if(canPlace(state,grid,it,it.x,it.y,r,i))return move(state,grid,i,it.x,it.y,r);
 const rest={...state,items:state.items.filter((_,k)=>k!==i)},spot=firstFit(rest,grid,it,[r]);if(!spot)return state;return {...state,items:[...rest.items,{...it,...spot}]};}
// Packs everything tightly again: biggest first, stacks merged, spill brought back in where there is room.
export function sort(state,grid){const all=[...state.items,...state.spill],totals=new Map();for(const o of all)totals.set(o.id,(totals.get(o.id)||0)+o.n);
 const ids=[...totals.keys()].sort((a,b)=>{const [aw,ah]=itemInfo(a)?.shape||[1,1],[bw,bh]=itemInfo(b)?.shape||[1,1];return bw*bh-aw*ah||String(a).localeCompare(String(b));});
 return ids.reduce((s,id)=>add(s,grid,id,totals.get(id)),emptyBag());}
// After changing packs: what still fits stays where it was, the rest is placed again, and anything left over waits in spill.
export function refit(state,grid){let s={items:[],spill:state.spill.map(o=>({...o}))};const later=[];
 for(const o of state.items){if(canPlace(s,grid,o,o.x,o.y,o.r))s={...s,items:[...s.items,{...o}]};else later.push(o);}
 for(const o of later){const spot=firstFit(s,grid,o);if(spot)s={...s,items:[...s.items,{...o,...spot}]};else{const k=s.spill.find(m=>m.id===o.id);if(k)k.n+=o.n;else s.spill.push({id:o.id,n:o.n});}}
 return s;}
// Puts one spilled stack back into the bag at (x, y) turned r, as much of it as fits in that one place.
export function unspill(state,grid,j,x,y,r=0){const o=state.spill[j];if(!o)return state;const info=itemInfo(o.id),k=Math.min(o.n,info.stack),it={id:o.id,n:k,x,y,r};if(!canPlace(state,grid,it,x,y,r))return state;
 return {items:[...state.items,it],spill:state.spill.map((m,i)=>i===j?{...m,n:m.n-k}:m).filter(m=>m.n>0)};}
// Everything you carry, in kg: the bag and the guns you have equipped. What is waiting to fit is set down, so it weighs nothing.
export function weight(state,guns=[]){const w=state.items.reduce((s,o)=>s+weightOf(o.id,o.n),0)+guns.reduce((s,g)=>s+(GUN_KG[g]||0),0);return Math.round(w*100)/100;}
// Going over the limit is allowed: you move more slowly, down to 70% at half again over, and running drains stamina faster.
export function burden(kg,limit){const over=Math.max(0,kg-limit)/(limit||1);return {over:over>0,speed:over?Math.max(.7,1-over*.6):1,drain:over?1.5:1};}
export function normalizeBag(v,grid){const ok=o=>o&&itemInfo(o.id)&&Number(o.n)>0,num=k=>Math.max(0,Math.floor(Number(k)||0));
 const items=(Array.isArray(v?.items)?v.items:[]).filter(ok).map(o=>({id:o.id,n:Math.min(itemInfo(o.id).stack,num(o.n)),x:num(o.x),y:num(o.y),r:o.r?1:0}));
 const spill=(Array.isArray(v?.spill)?v.spill:[]).filter(ok).map(o=>({id:o.id,n:num(o.n)}));
 // Stacks that overlap or fall off the grid in a damaged save are placed again rather than dropped.
 let s={items:[],spill};for(const o of items){if(canPlace(s,grid,o,o.x,o.y,o.r))s={...s,items:[...s.items,o]};else s=add(s,grid,o.id,o.n);}return s;}
