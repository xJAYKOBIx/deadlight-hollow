// The Training Grounds wallet: broken parts picked up in a Holdout, the chits Gadget pays for them, and what you bought from Aaron.
// It lives on this device, like your best times.
import {SHOP} from '../grounds/data.js';
export const WALLET_KEY='deadlight-tg-wallet-v1';
const fresh=()=>({parts:0,chits:0,owned:[]});
export function readWallet(storage){try{const v=JSON.parse(storage?.getItem(WALLET_KEY)||'null');if(v&&typeof v==='object')return {parts:Math.max(0,Math.floor(Number(v.parts)||0)),chits:Math.max(0,Math.floor(Number(v.chits)||0)),owned:Array.isArray(v.owned)?v.owned.filter(id=>SHOP.some(s=>s.id===id)):[]};}catch{}return fresh();}
export function saveWallet(storage,w){try{storage?.setItem(WALLET_KEY,JSON.stringify(w));}catch{}}
// Gadget buys every part you bring her: one chit a part.
export function turnIn(w){const n=w.parts;w.chits+=n;w.parts=0;return n;}
export function buy(w,id){const item=SHOP.find(s=>s.id===id);if(!item)return {ok:false,reason:'missing'};if(w.owned.includes(id))return {ok:false,reason:'owned'};if(w.chits<item.price)return {ok:false,reason:'short',need:item.price-w.chits};w.chits-=item.price;w.owned.push(id);return {ok:true,item};}
export const owns=(w,id)=>w.owned.includes(id);
// What the gear does: perks for the Holdout itself, and changes to every gun.
export const perks=w=>({vest:owns(w,'vest'),medkit:owns(w,'medkit'),wind:owns(w,'wind')});
export const mods=w=>({mag:owns(w,'hopper')?1.3:1,reload:owns(w,'loader')?.75:1});
