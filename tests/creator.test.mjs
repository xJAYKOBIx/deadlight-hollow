import test from 'node:test';import assert from 'node:assert/strict';
import {createCreator} from '../dist/study/creator.js';import {DEFAULT_APPEARANCE} from '../dist/study/appearance.js';import {DEFAULT_PET} from '../dist/companion/look.js';
// A creator with no page behind it: just enough elements to count what it shows and what it refuses.
function rig(dev){
 globalThis.document??={body:{classList:{toggle(){}}},createElement:()=>{throw new Error('no thumbnails here')}};
 class El{constructor(d={}){this.listeners={};this.dataset=d;this.hidden=false;this.innerHTML='';const set=new Set();this.classList={add:v=>set.add(v),remove:v=>set.delete(v),contains:v=>set.has(v),toggle:(v,f=!set.has(v))=>(f?set.add(v):set.delete(v),f)};}addEventListener(k,f){(this.listeners[k]??=[]).push(f)}emit(k,e={}){for(const f of this.listeners[k]||[])f({target:this,...e})}setAttribute(k,v){this[k]=v}querySelectorAll(){return this.kids||[]}}
 const els={},$=id=>els[id]??=new El(),kinds=['survivor','zombie','companion'].map(kind=>new El({kind}));$('kindSwitch').kids=kinds;
 const pane=new El(),panel=$('creatorPanel');panel.parentElement=pane;Object.assign(panel,{scrollHeight:900,clientHeight:400,scrollTop:0,scrollBy(o){this.scrolled=o.top}});
 const saved=new Map(),storage={getItem:k=>saved.get(k)??null,setItem:(k,v)=>saved.set(k,v)};let look={...DEFAULT_APPEARANCE},pet={...DEFAULT_PET.dog,species:0,name:'Mop'},looks=0;
 const c=createCreator({$,storage,look:()=>look,setLook:l=>{look=l;looks++;c.refresh();},loadout:()=>({gun:'none',grenade:'frag'}),setLoadout(){},companion:()=>pet,setCompanion:p=>{pet=p;c.refresh();},dev:()=>dev});
 const lit=()=>kinds.filter(b=>b['aria-pressed']==='true').map(b=>b.dataset.kind);
 return {c,els,kinds,pane,panel,lit,look:()=>look,looks:()=>looks};}
test('the player creator keeps Zombie out; the full creator (#dev) still has it',()=>{
 const p=rig(false);p.c.refresh();assert.equal(p.kinds[1].hidden,true,'no Zombie button for players');assert.deepEqual(p.lit(),['survivor']);
 p.c.setKind('zombie');assert.equal(p.looks(),0,'a player cannot switch to a zombie');assert.ok(!p.look().zombie);
 p.c.setKind('companion');assert.deepEqual(p.lit(),['companion'],'only Companion lights on the companion pages');assert.equal(p.kinds[1].hidden,true);
 p.c.setKind('zombie');assert.equal(p.c.mode(),'person','asking for Zombie from the companion pages goes back to the survivor');assert.equal(p.looks(),0);assert.deepEqual(p.lit(),['survivor']);
 const d=rig(true);d.c.refresh();assert.equal(d.kinds[1].hidden,false);d.c.setKind('zombie');assert.equal(d.looks(),1);assert.equal(d.look().zombie,1);assert.deepEqual(d.lit(),['zombie']);
});
test('the choices say when there are more below, and the tab scrolls to them',()=>{
 const p=rig(false);p.c.refresh();assert.ok(p.pane.classList.contains('more'),'a tall list shows More below');
 p.els.creatorMore.emit('click');assert.equal(p.panel.scrolled,280,'the tab scrolls most of a screen');
 p.panel.scrollTop=490;p.panel.emit('scroll');assert.ok(!p.pane.classList.contains('more'),'at the bottom the tab goes away');
 p.panel.scrollTop=300;p.panel.emit('scroll');assert.ok(p.pane.classList.contains('more'));
 p.c.show('head');assert.equal(p.panel.scrollTop,0,'a new tab starts at the top of its choices');
});
