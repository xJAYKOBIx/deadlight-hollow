import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {Game} from '../dist/sim.js';
const require=createRequire(import.meta.url);
let createCanvas;try{({createCanvas}=require((process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES||'/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules')+'/@napi-rs/canvas'));}catch{}

test('interface connects touch controls, pausing, save/resume, shop, and next wave', {skip:!createCanvas}, async()=>{
 const html=readFileSync(new URL('../dist/classic.html',import.meta.url),'utf8');
 class Classes{constructor(value=''){this.values=new Set(value.split(/\s+/).filter(Boolean));}add(s){this.values.add(s)}remove(s){this.values.delete(s)}contains(s){return this.values.has(s)}toggle(s,force){let value=force??!this.values.has(s);value?this.add(s):this.remove(s);return value;}}
 class Element{
  constructor(id='',classes=''){this.id=id;this.classList=new Classes(classes);this.style={setProperty(k,v){this[k]=String(v)}};this.dataset={};this.listeners={};this.children=[];this.textContent='';this.value='';this.checked=true;this.tagName='DIV';this._html='';}
  addEventListener(type,fn){(this.listeners[type]??=[]).push(fn)}emit(type,event={}){for(let fn of this.listeners[type]||[])fn({preventDefault(){},target:this,...event});}
  setAttribute(name,value){this[name]=value}setPointerCapture(){}getBoundingClientRect(){return {left:parseFloat(this.style.left)||0,top:parseFloat(this.style.top)||0,width:parseFloat(this.style.width)||128,height:parseFloat(this.style.height)||128};}
  querySelector(selector){if(selector==='canvas'){this.avatar??=createCanvas(128,160);return this.avatar;}this.parts??={};return this.parts[selector]??=new Element();}
  set innerHTML(value){this._html=value;if(this.id==='characters'){this.children=[...value.matchAll(/data-character="([^"]+)"/g)].map(m=>{let e=new Element();e.dataset.character=m[1];return e;});}}
  get innerHTML(){return this._html}click(){this.onclick?.({target:this})}closest(){return this;}
 }
 const els={};for(let match of html.matchAll(/<[^>]+id="([^"]+)"[^>]*>/g)){let classes=match[0].match(/class="([^"]+)"/);els[match[1]]=new Element(match[1],classes?.[1]||'');}
 els.difficulty.value='standard';const tabs=['arsenal','upgrades','supplies'].map(t=>{let el=new Element();el.dataset.tab=t;return el;});
 const canvas=createCanvas(852,393);canvas.addEventListener=(...args)=>canvasEvents.addEventListener(...args);canvas.setPointerCapture=()=>{};const canvasEvents=els.world;els.world=canvas;
 let win=new Element(),doc=new Element(),store=new Map(),raf,vv=Object.assign(new Element(),{width:852,height:393,offsetLeft:0,offsetTop:0});
 globalThis.window=Object.assign(win,{innerWidth:852,innerHeight:393,devicePixelRatio:1,visualViewport:vv});
 globalThis.document=Object.assign(doc,{body:new Element(),documentElement:new Element(),getElementById:id=>{assert.ok(els[id],'HTML element exists: '+id);return els[id];},createElement:tag=>tag==='canvas'?createCanvas(10,10):new Element(),querySelectorAll:()=>tabs});
 globalThis.matchMedia=q=>({matches:q==='(pointer:coarse)'});globalThis.requestAnimationFrame=fn=>{raf=fn;};globalThis.localStorage={getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v),removeItem:k=>store.delete(k)};
 Object.defineProperty(globalThis,'navigator',{value:{maxTouchPoints:2,getGamepads:()=>{throw new Error('Permissions policy blocks gamepad');}},configurable:true});
 await import('../dist/app.js');assert.equal(els.characters.children.length,4);assert.equal(els.menu.classList.contains('hidden'),false);assert.equal(els.resume.classList.contains('hidden'),true);
 els.start.click();assert.equal(els.menu.classList.contains('hidden'),true);assert.equal(els.hud.classList.contains('hidden'),false);assert.match(els.waveText.textContent,/01/);
 const step=(from,count)=>{for(let i=0;i<count;i++)raf(from+i*17);};
 let mr=els.moveStick.getBoundingClientRect(),ar=els.aimStick.getBoundingClientRect();
 els.moveStick.emit('pointerdown',{pointerId:1,clientX:mr.left+75,clientY:mr.top+90});els.aimStick.emit('pointerdown',{pointerId:2,clientX:ar.left+75,clientY:ar.top+90});
 step(500,3);win.emit('pagehide');assert.equal(JSON.parse(store.get('deadlight-hollow-run-v1')).player.x,1130,'floating stick starts neutral at the touch');
 els.moveStick.emit('pointermove',{pointerId:1,clientX:mr.left+125,clientY:mr.top+90});els.aimStick.emit('pointermove',{pointerId:2,clientX:ar.left+125,clientY:ar.top+90});step(1000,30);win.emit('pagehide');let save=JSON.parse(store.get('deadlight-hollow-run-v1'));assert.ok(save.player.x>1200,'left stick moved player');assert.ok(save.player.guns[0].clip<12,'right stick fired at the same time');assert.equal(save.phase,'wave');
 els.dashButton.click();step(1530,3);win.emit('pagehide');save=JSON.parse(store.get('deadlight-hollow-run-v1'));assert.ok(save.player.dash>0,'dash activates while left thumb remains held');assert.ok(save.player.x>1200);
 els.moveStick.emit('pointerup',{pointerId:1});els.aimStick.emit('pointercancel',{pointerId:2});els.pauseButton.click();assert.equal(els.pause.classList.contains('hidden'),false);let savedX=save.player.x;step(1700,20);win.emit('pagehide');save=JSON.parse(store.get('deadlight-hollow-run-v1'));assert.equal(save.player.x,savedX,'pause stops simulation');
 els.controlSettings.click();assert.equal(els.controls.classList.contains('hidden'),false);els.controlSize.value='large';els.controlSize.onchange();els.controlReach.value='inward';els.controlReach.onchange();assert.equal(JSON.parse(store.get('deadlight-hollow-settings-v1')).controlSize,'large');assert.ok(parseFloat(els.dashButton.style.width)>=58);els.closeControls.click();
 await els.fullscreen.onclick();assert.equal(els.displayHelp.classList.contains('hidden'),false);assert.match(els.displayStatus.textContent,/Home Screen/);els.closeDisplayHelp.click();
 vv.height=320;vv.offsetTop=12;vv.emit('resize');assert.equal(document.documentElement.style['--view-height'],'320px');assert.equal(document.documentElement.style['--view-top'],'12px');assert.ok(parseFloat(els.weaponDock.style.top)+46<=320);vv.height=393;vv.offsetTop=0;vv.emit('resize');
 els.saveQuit.click();assert.equal(els.menu.classList.contains('hidden'),false);assert.equal(els.resume.classList.contains('hidden'),false);els.resume.click();assert.equal(els.pause.classList.contains('hidden'),false);els.continueButton.click();assert.equal(els.pause.classList.contains('hidden'),true);
 els.pauseButton.click();els.saveQuit.click();let collecting=new Game(3);collecting.start('ivy');collecting.finishWave();collecting.pickups=[{kind:'cash',value:21,x:100,y:100,life:1}];store.set('deadlight-hollow-run-v1',JSON.stringify(collecting.snapshot()));els.resume.click();els.continueButton.click();step(2150,2);assert.equal(els.shop.classList.contains('hidden'),true);assert.equal(els.collectContinue.classList.contains('hidden'),false);win.emit('pagehide');assert.equal(JSON.parse(store.get('deadlight-hollow-run-v1')).phase,'scavenge');els.collectContinue.click();assert.equal(els.shop.classList.contains('hidden'),false);assert.equal(JSON.parse(store.get('deadlight-hollow-run-v1')).player.cash,collecting.player.cash+21+83);els.nextWave.click();
 els.pauseButton.click();els.saveQuit.click();let shopGame=new Game(1);shopGame.start('ivy');shopGame.phase='shop';shopGame.bonus=83;shopGame.player.cash=600;store.set('deadlight-hollow-run-v1',JSON.stringify(shopGame.snapshot()));els.resume.click();assert.equal(els.shop.classList.contains('hidden'),false);assert.match(els.shopItems.innerHTML,/Patrol carbine/);
 let buy={dataset:{buy:'carbine'},closest(){return this}};els.shopItems.onclick({target:buy});save=JSON.parse(store.get('deadlight-hollow-run-v1'));assert.equal(save.player.cash,490);assert.equal(save.player.guns[1].id,'carbine');
 tabs[1].click();assert.match(els.shopItems.innerHTML,/Upgrade/);let upgrade={dataset:{buy:'upgrade:1'},closest(){return this}};els.shopItems.onclick({target:upgrade});save=JSON.parse(store.get('deadlight-hollow-run-v1'));assert.equal(save.player.guns[1].level,1);
 els.nextWave.click();assert.equal(els.shop.classList.contains('hidden'),true);assert.match(els.waveText.textContent,/02/);step(2500,5);assert.equal(els.pause.classList.contains('hidden'),true,'blocked optional gamepad access did not interrupt play');
 doc.hidden=true;doc.emit('visibilitychange');assert.equal(els.pause.classList.contains('hidden'),false);assert.equal(JSON.parse(store.get('deadlight-hollow-run-v1')).wave,2);
});
