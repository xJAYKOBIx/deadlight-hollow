import {GUNS,GRENADES,PAINT,readLoadout,saveLoadout} from './equipment.js';import {WAVES} from './drill.js';import {SHOP} from '../grounds/data.js';import {readWallet,saveWallet,turnIn,buy,owns,perks,mods} from './wallet.js';
import {PadInput,PAD} from '../pad.js';import {Quality} from './quality.js';
import {readAppearance,saveAppearance} from './appearance.js';
import {createCreator} from './creator.js';
import {StudyModel} from './model.js';import {makeStudyScene} from './scene.js';import {DIRECTIONS} from './character.js';import {FloatingStick} from '../layout.js';import {mountGrime} from './grime.js';
import {CampModel} from '../camp/model.js';import {makeCampScene} from '../camp/scene.js';import {PROPS,MAX_CAMPERS} from '../camp/data.js';import {PROP_PAD} from '../camp/art.js';import {createCampPlay} from '../camp/play.js';
import {HomeModel} from '../home/model.js';import {makeHomeScene} from '../home/scene.js';import {PROPS as HOME_PROPS} from '../home/data.js';
import {readCompanion,saveCompanion,normalizeCompanion,petLook,displayName} from '../companion/look.js';import {pet,PET_FRAME,PET_ANIM} from '../companion/pet.js';import {Follower,FOLLOW} from '../companion/follow.js';
const $=id=>document.getElementById(id),model=new StudyModel(),campModel=new CampModel(),_shared=(model.stamina=campModel.stamina),homeModel=new HomeModel(),_sharedHome=(homeModel.stamina=campModel.stamina),keys=new Set(),stick=new FloatingStick();let game,scene,ready=false,move={x:0,y:0},running=false,padState={move:{x:0,y:0},aim:{x:0,y:0},fire:false,run:false},inspectDirection=1,pose='idle',lastInspect=0,contextMissing=false;// Camera distances. Phones start on Wide so you can see what's coming; a PC starts on Normal.
const ZOOMS=[{z:.7,name:'Wide'},{z:1,name:'Normal'},{z:1.5,name:'Close'}];
// The game draws at the screen's real pixel density (up to 3×), so the wide view keeps every art pixel instead of dropping some.
// The camera zoom is one value from far out to close in. The pause menu steps through three presets; the console has a slider.
const ZMIN=.35,ZMAX=1.8,ZOOM_KEY='deadlight-zoom-v1';let zoomLevel=1;
const RES=Math.min(3,Math.max(1,Math.round(globalThis.devicePixelRatio||1))),zoom=()=>zoomLevel*RES;
let storage;try{storage=window.localStorage;}catch{}let appearance=readAppearance(storage),loadout=readLoadout(storage),wallet=readWallet(storage);
// Where the survivor is: the Training Grounds (a test space), Firelight Camp or the starter house. Remembered on this device; ?home opens the house.
const PLACE_KEY='deadlight-place-v1';let place='room',campScene=null,homeScene=null,talk=null,play=null,reelPointer=null;try{const v=storage?.getItem(PLACE_KEY);if(v==='camp'||v==='home')place=v;}catch{}if(/[?&]home\b/.test(globalThis.location?.search||'')||globalThis.location?.hash==='#home')place='home';
// The camp and the house are calm places: no shooting, Use and Talk instead.
const calm=()=>place!=='room',calmScene=()=>place==='home'?homeScene:campScene,calmModel=()=>place==='home'?homeModel:campModel;
// In camp you are always your survivor, never the zombie from the creator.
let survivorLook=appearance.zombie?readAppearance(storage,'survivor'):appearance;let aim={x:0,y:0},firing=false,mouseFire=false,mousePoint=null;
const SAVE_FAIL='Active for this visit. Saving is unavailable on this device.';
// Zombies are unarmed in the room: no gun, no grenades, and the shooting controls step aside.
const gear=()=>appearance.zombie?{...loadout,gun:'none'}:loadout;let armedKind=!!appearance.zombie;
function syncKind(){document.body.classList[appearance.zombie?'add':'remove']('zombie');model.zombie=!!appearance.zombie;showHelp();if(armedKind!==!!appearance.zombie){armedKind=!!appearance.zombie;scene?.practice.equip(gear());}}
// Camp draws an unarmed survivor; the room and the creator preview draw the full creator look.
function renderActor(){if(calm()&&!$('inspection').open)calmScene()?.setPlayerLook(survivorLook);else scene?.setAppearance(appearance);}
function applyAppearance(){if(!appearance.zombie)survivorLook=appearance;syncKind();renderActor();lastInspect=0;paintInspection(performance.now());$('lookSaveStatus').textContent=saveAppearance(storage,appearance)?'Look saved on this device.':SAVE_FAIL;creator.refresh();}
function paintGear(){const n=loadout.grenade==='incendiary'?'Firebomb':loadout.grenade==='explosive'?'Frag':'Smoke';$('grenadeName').textContent=$('grenadeLabel').textContent=n;$('grenadeDot').style.background=GRENADES[loadout.grenade]?.color||'';$('throwGrenade').setAttribute('aria-label','Throw '+n);}
function equip(){scene?.practice.equip(gear());renderActor();lastInspect=0;paintGear();$('lookSaveStatus').textContent=saveLoadout(storage,loadout)?'Gear saved on this device. Practice reserves are unlimited.':SAVE_FAIL;creator.refresh();}
// Your companion: chosen in the creator, following you in camp and in the room.
let companion=readCompanion(storage),petDirty=false;
function setCompanion(c,{name=false}={}){companion=normalizeCompanion(c);$('lookSaveStatus').textContent=saveCompanion(storage,companion)?'Companion saved on this device.':SAVE_FAIL;if(!name){petDirty=true;creator.refresh();lastInspect=0;paintInspection(performance.now());}lastTarget=undefined;}
const creator=createCreator({$,storage,look:()=>appearance,setLook:l=>{appearance=l;applyAppearance();},loadout:()=>loadout,setLoadout:l=>{loadout=l;equip();},companion:()=>companion,setCompanion});
creator.refresh();paintGear();if(!storage)$('lookSaveStatus').textContent=SAVE_FAIL;
$('equipment').onclick=()=>{if($('options').open)closeDialog('options');openDialog('inspection');creator.show('gear');};
// Right-thumb actions. Each is shared by the touch fan, the keyboard and the controller.
const GUN_IDS=Object.keys(GUNS);
function buzz(ms){try{if(device==='touch')navigator.vibrate?.(ms);}catch{}}
function doReload(){if(paused()||appearance.zombie||calm())return;const p=scene.practice,before=p.reloadTime;p.reload();if(!before&&p.reloadTime){buzz(12);pad.rumble(.1,.2,60);}}
function doThrow(){if(paused()||appearance.zombie||calm())return;if(scene.practice.throwGrenade()){buzz(25);pad.rumble(.45,.6,140);}}
// Swap cycles through every gun: the room is a practice range with unlimited reserves.
function swapGun(step=1,to=null){if(paused()||appearance.zombie||calm())return;const i=GUN_IDS.indexOf(loadout.gun),next=to??GUN_IDS[((i<0?-1:i)+step+GUN_IDS.length)%GUN_IDS.length];if(!next||next===loadout.gun)return;loadout={...loadout,gun:next};equip();buzz(10);pad.rumble(.05,.25,50);const h=$('weaponHud');h.classList.remove('swapped');void h.offsetWidth;h.classList.add('swapped');}
// Pointer presses act on pointerdown for speed; a click with no pointer behind it (Enter, Space, a controller, a script) still works.
const pressedAt={};for(const [id,fn] of [['reload',doReload],['throwGrenade',doThrow],['swapGun',()=>swapGun(1)]]){$(id).addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();pressedAt[id]=performance.now();$(id).classList.add('down');fn();});$(id).onclick=e=>{if(e?.pointerType||performance.now()-(pressedAt[id]??-1e9)<800)return;fn();};}
for(const id of ['reload','throwGrenade','swapGun'])for(const n of ['pointerup','pointercancel','pointerleave'])$(id).addEventListener(n,()=>$(id).classList.remove('down'));
// Phones and tablets start on the touch controls; a PC, even one with a touchscreen, starts without them and only shows them once you touch the screen.
const coarse=matchMedia('(pointer:coarse)').matches;
// The last thing you touched decides which prompts show: keys, a controller's buttons, or the touch controls.
let device=coarse?'touch':'keys';if(coarse)zoomLevel=ZOOMS[0].z;try{const z=Number(storage?.getItem(ZOOM_KEY));if(z>=ZMIN&&z<=ZMAX)zoomLevel=z;}catch{}document.body.classList.toggle('touch',device==='touch');const touch=()=>device==='touch';const pad=new PadInput();
// A short hint for the current place and device. It fades after a few seconds; the full list is in the menu under Controls.
const HELP={keys:{room:'WASD move · Shift run · Mouse aim · Click fire · R reload · Q or wheel swap · G grenade · Esc menu',camp:'WASD move · Shift run · E use or talk · I character · Esc menu',zombie:'WASD shamble · Shift lurch · I character · Esc menu'},
 pad:{room:'Left stick moves · Right stick aims and fires · RB grenade · X reload · Y swap · ☰ menu',camp:'Left stick moves · LT runs · A uses or talks · ☰ menu',zombie:'Left stick shambles · LT lurches · ☰ menu'},
 touch:{room:'Left stick moves · Tap Run to sprint · Right stick aims and fires',camp:'Left stick moves · Tap Run to sprint · Big button uses or talks',zombie:'Left stick shambles · Tap Run to lurch'}};
let helpTimer=0;function showHelp(){const k=calm()?'camp':appearance.zombie?'zombie':'room',el=$('instructions');el.textContent=HELP[device][k];el.classList.remove('fade');clearTimeout(helpTimer);helpTimer=setTimeout(()=>el.classList.add('fade'),device==='touch'?6000:9000);}
function setDevice(d){if(device===d)return;const wasTouch=device==='touch';device=d;document.body.classList.toggle('pad',d==='pad');document.body.classList.toggle('touch',d==='touch');if(wasTouch||d==='touch')resize();for(const k of document.querySelectorAll('kbd[data-key]')){k.textContent=d==='pad'?k.dataset.pad:k.dataset.key;k.dataset.glyph=d==='pad'?k.dataset.pad:'';}showHelp();lastTarget=undefined;}
syncKind();
function halted(){return !ready||document.hidden||contextMissing||$('inspection').open||$('options').open||$('shop').open;}
function paused(){return halted()||!!talk||!!play?.cooking;}
function resetInput(){if(play?.fishing)play.press(false);reelPointer=null;mousePoint=null;aim={x:0,y:0};firing=false;mouseFire=false;aimPointer=null;$('aimZone').classList.remove('active','firing');$('aimThumb').style.transform='';keys.clear();move={x:0,y:0};stick.end();$('moveZone').classList.remove('active');$('ring').style.left=$('ring').style.top='';$('thumb').style.transform='';padState={move:{x:0,y:0},aim:{x:0,y:0},fire:false,run:false};}
function openDialog(id){resetInput();if(id==='inspection'){inspectDirection=(calm()?calmModel():model).direction;pose='idle';setPose('idle');}$(id).showModal();if(id==='inspection'){if(calm())renderActor();creator.refresh();lastInspect=0;paintInspection(performance.now());if(!inspectLoop)inspectLoop=globalThis.requestAnimationFrame?.(loopInspection)||0;}}
function closeDialog(id){$(id).close();resetInput();if(id==='inspection'&&calm())renderActor();if(id==='inspection')refreshPet();}
// The companion sheet is repainted once the creator closes, not on every click.
function refreshPet(){if(!petDirty)return;petDirty=false;const l=petLook(companion);campScene?.setPetLook(l);scene?.setPetLook?.(l);}
$('inspect').onclick=()=>openDialog('inspection');$('menu').onclick=()=>openDialog('options');$('resume').onclick=()=>closeDialog('options');
// Menu entries that lead elsewhere close the pause menu first.
const fromMenu=fn=>()=>{if($('options').open)closeDialog('options');fn();};$('inspectMenu').onclick=fromMenu(()=>openDialog('inspection'));$('closeInspect').onclick=$('returnRoom').onclick=()=>closeDialog('inspection');$('closeOptions').onclick=()=>closeDialog('options');for(let id of ['inspection','options'])$(id).addEventListener('close',resetInput);
function cycleZoom(){const next=ZOOMS.find(p=>p.z>zoomLevel+.01)||ZOOMS[0];setZoom(next.z);}
function setZoom(z,save=true){zoomLevel=Math.max(ZMIN,Math.min(ZMAX,z));if(save){try{storage?.setItem(ZOOM_KEY,zoomLevel.toFixed(3));}catch{}}paintZoom();}
// The slider runs on a log scale, so each step out feels the same size as each step in.
const toSlider=z=>Math.round(Math.log(z/ZMIN)/Math.log(ZMAX/ZMIN)*100),fromSlider=v=>ZMIN*Math.pow(ZMAX/ZMIN,v/100);
function paintZoom(){const preset=ZOOMS.find(p=>Math.abs(p.z-zoomLevel)<.01),zl=$('zoom').firstChild;if(zl)zl.textContent='Camera: '+(preset?preset.name:Math.round(zoomLevel*100)+'%')+' ';const r=$('zoomRange');if(r&&document.activeElement!==r)r.value=String(toSlider(zoomLevel));}
$('zoom').onclick=cycleZoom;$('zoomRange').addEventListener('input',e=>setZoom(fromSlider(Number(e.target.value)),false));$('zoomRange').addEventListener('change',()=>setZoom(zoomLevel));
$('zoomOut').onclick=()=>setZoom(zoomLevel/1.15);$('zoomIn').onclick=()=>setZoom(zoomLevel*1.15);
// Effects: Auto watches the frame rate once a second while you play; the menu can fix it at High or Low.
const quality=new Quality(storage);function paintEffects(){$('effects').textContent='Effects: '+quality.label;document.body.classList.toggle('fx-low',quality.low);}
quality.onChange(paintEffects);paintEffects();$('effects').onclick=()=>quality.cycle();
setInterval(()=>{if(game&&!halted())quality.sample(game.loop?.actualFps);paintEffects();},1000).unref?.();
$('reset').onclick=()=>{if(place==='home'){homeModel.reset();}else if(place==='camp'){play.stop();campModel.reset();heel(campPet,campModel);}else{model.reset();scene?.practice.reset();heel(roomPet,model);}closeDialog('options');};
// Until co-op exists, this shows all four sleeping spots so the shelter can be judged full.
$('coopBeds').onclick=()=>{campModel.campers=campModel.campers>1?1:MAX_CAMPERS;const on=campModel.campers>1;$('coopBeds').textContent='Preview co-op beds: '+(on?'On':'Off');$('coopBeds').setAttribute('aria-pressed',String(on));};
$('fullscreen').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else if(document.documentElement.requestFullscreen&&document.fullscreenEnabled!==false)await document.documentElement.requestFullscreen();else $('fullscreenHelp').hidden=false;}catch{$('fullscreenHelp').hidden=false;}};
function setPose(p){pose=p;for(let b of document.querySelectorAll('[data-pose]'))b.setAttribute('aria-pressed',String(b.dataset.pose===p));lastInspect=0;}
for(let b of document.querySelectorAll('[data-pose]'))b.onclick=()=>setPose(b.dataset.pose);
let turnFrom=null;const stage=$('stage');stage.addEventListener('pointerdown',e=>{turnFrom={id:e.pointerId,x:e.clientX};stage.setPointerCapture?.(e.pointerId);});
stage.addEventListener('pointermove',e=>{if(!turnFrom||turnFrom.id!==e.pointerId)return;const dx=e.clientX-turnFrom.x;if(Math.abs(dx)>=26){inspectDirection=(inspectDirection+(dx>0?7:1))%8;turnFrom.x=e.clientX;lastInspect=0;}});
for(const name of ['pointerup','pointercancel','lostpointercapture'])stage.addEventListener(name,()=>{turnFrom=null;});
$('turnLeft').onclick=()=>{inspectDirection=(inspectDirection+7)%8;lastInspect=0;};$('turnRight').onclick=()=>{inspectDirection=(inspectDirection+1)%8;lastInspect=0;};
const petFrames=new Map();
function petPreview(c,now){const l=petLook(companion),list=PET_ANIM[pose]||PET_ANIM.idle,f=list[Math.floor(now/(pose==='run'?75:pose==='walk'?110:pose==='sit'?260:220))%list.length],key=JSON.stringify(l)+inspectDirection+':'+f;
 let fr=petFrames.get(key);if(!fr){if(petFrames.size>200)petFrames.clear();fr=document.createElement('canvas');fr.width=PET_FRAME.w;fr.height=PET_FRAME.h;const g=fr.getContext('2d');g.scale(2,2);pet(g,inspectDirection,f,l);petFrames.set(key,fr);}
 // Same scale as the survivor preview: one unit is four screen pixels. Cats are small, so they get a closer crop.
 if(l.species){c.drawImage(fr,34,32,92,98,2,66,276,294);}else c.drawImage(fr,10,22,140,120,0,120,280,240);
 $('direction').textContent=DIRECTIONS[inspectDirection];$('portrait').setAttribute('aria-label',displayName(companion)+', '+DIRECTIONS[inspectDirection]+' view, '+pose);}
// The preview animates on its own frame loop while the creator is open, so it plays and turns wherever you open it from.
let inspectLoop=0;function loopInspection(now){inspectLoop=0;if(!$('inspection').open)return;paintInspection(now);inspectLoop=globalThis.requestAnimationFrame?.(loopInspection)||0;}
function paintInspection(now){if(!scene||now-lastInspect<60)return;lastInspect=now;const c=$('portrait').getContext('2d');c.clearRect(0,0,280,360);c.imageSmoothingEnabled=false;if(creator.mode?.()==='pet'){petPreview(c,now);return;}if(pose==='sit')pose='idle';const z=appearance.zombie;let f=pose==='idle'?0:(pose==='run'?9:1)+Math.floor(now/(pose==='run'?(z?80:60):(z?125:85)))%8;scene.portrait(c,inspectDirection,f,140,332,2);$('direction').textContent=DIRECTIONS[inspectDirection];$('portrait').setAttribute('aria-label',DIRECTIONS[inspectDirection]+' view, '+pose+' animation');}
const zone=$('moveZone');function paintStick(v){$('ring').style.left=v.baseX+'px';$('ring').style.top=v.baseY+'px';$('thumb').style.transform=`translate(-50%,-50%) translate(${v.thumbX}px,${v.thumbY}px)`;}
zone.addEventListener('pointerdown',e=>{if(paused()||stick.pointer!==null)return;e.preventDefault();let b=zone.getBoundingClientRect();stick.start(e.pointerId,e.clientX-b.left,e.clientY-b.top,{w:b.width,h:b.height},56,40);zone.setPointerCapture(e.pointerId);zone.classList.add('active');paintStick({baseX:stick.base.x,baseY:stick.base.y,thumbX:0,thumbY:0});});
zone.addEventListener('pointermove',e=>{let b=zone.getBoundingClientRect(),v=stick.move(e.pointerId,e.clientX-b.left,e.clientY-b.top);if(!v)return;e.preventDefault();paintStick(v);let d=Math.hypot(v.dx,v.dy),power=Math.min(1,Math.max(0,(d-4)/33));move={x:d?v.dx/d*power:0,y:d?v.dy/d*power:0};});
for(let name of ['pointerup','pointercancel','lostpointercapture'])zone.addEventListener(name,e=>{if(stick.end(e.pointerId)){move={x:0,y:0};zone.classList.remove('active');$('ring').style.left=$('ring').style.top='';$('thumb').style.transform='';}});
// Run is a toggle on touch: tap it to run, tap again to walk. It stays on through stops, menus and trips between places.
const docked=()=>document.body.classList.contains('deck')&&touch();
// Running is a choice you keep paying for: Run stays on until you tap it off or your stamina runs dry, which turns it off for you.
// The ring round the button is the stamina left; while you are winded it will not switch back on.
const stamina=()=>campModel.stamina;let runShown='';
function paintRun(){const s=stamina();if(running&&s.winded){setRun(false);flashRun();}const key=Math.round(s.value/s.max*100)+(s.winded?'w':'');if(key===runShown)return;runShown=key;$('runRing').style.setProperty('--p',(s.value/s.max).toFixed(3));$('runToggle').classList.toggle('winded',s.winded);}
function flashRun(){const b=$('runToggle');b.classList.remove('empty');void b.offsetWidth;b.classList.add('empty');buzz(30);}
function setRun(on){running=on;$('runToggle').classList.toggle('on',on);$('runToggle').setAttribute('aria-pressed',String(on));zone.classList.toggle('sprint',on);buzz(on?12:6);}
function toggleRun(){if(paused())return;if(!running&&stamina().winded){flashRun();return;}setRun(!running);}
$('runToggle').addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();toggleRun();});$('runToggle').onclick=e=>{if(!e?.pointerType)toggleRun();};
// The fire stick sits in a fixed place so the fan of buttons around it never moves. Push it to aim; past a small dead zone it fires.
const aimZone=$('aimZone'),AIM_TRAVEL=40,FIRE_AT=14;let aimPointer=null;
function aimFrom(e){const r=$('aimRing').getBoundingClientRect(),dx=e.clientX-(r.left+r.width/2),dy=e.clientY-(r.top+r.height/2),d=Math.hypot(dx,dy),k=Math.min(1,AIM_TRAVEL/(d||1));
 $('aimThumb').style.transform=`translate(-50%,-50%) translate(${dx*k}px,${dy*k}px)`;firing=d>FIRE_AT;aim=d>6?{x:dx/d,y:dy/d}:{x:0,y:0};aimZone.classList.toggle('firing',firing);}
aimZone.addEventListener('pointerdown',e=>{if(paused()||aimPointer!==null)return;e.preventDefault();mousePoint=null;aimPointer=e.pointerId;aimZone.setPointerCapture(e.pointerId);aimZone.classList.add('active');aimFrom(e);});
aimZone.addEventListener('pointermove',e=>{if(e.pointerId!==aimPointer)return;e.preventDefault();aimFrom(e);});
for(const name of ['pointerup','pointercancel','lostpointercapture'])aimZone.addEventListener(name,e=>{if(e.pointerId!==aimPointer)return;aimPointer=null;aim={x:0,y:0};firing=false;aimZone.classList.remove('active','firing');$('aimThumb').style.transform='';});
function connectMouse(s){const canvas=s.game.canvas;let wheelAt=0;canvas.addEventListener('wheel',e=>{if(calm()||paused())return;e.preventDefault();const now=performance.now();if(now-wheelAt<180)return;wheelAt=now;swapGun(e.deltaY>0?1:-1);},{passive:false});window.addEventListener('pointermove',e=>{if(e.pointerType==='mouse')setDevice('keys');});window.addEventListener('pointerdown',e=>{if(e.pointerType==='touch')setDevice('touch');},true);const point=e=>{let b=canvas.getBoundingClientRect(),p=s.cameras.main.getWorldPoint((e.clientX-b.left)*s.scale.width/b.width,(e.clientY-b.top)*s.scale.height/b.height);mousePoint={x:(e.clientX-b.left)*s.scale.width/b.width,y:(e.clientY-b.top)*s.scale.height/b.height};aim={x:p.x-model.x,y:p.y+35-model.y};};canvas.addEventListener('pointermove',e=>{if(e.pointerType!=='touch'&&!paused()&&!calm())point(e);});canvas.addEventListener('pointerdown',e=>{if(calm()){if(place==='camp'&&play.fishing&&e.pointerType!=='touch'&&e.button===0&&!halted()){e.preventDefault();reelPointer=e.pointerId;play.press(true);return;}if(e.pointerType!=='touch'&&e.button===0&&!paused()&&calmScene()?.target){e.preventDefault();interact();}return;}if(e.pointerType==='touch'||e.button!==0||paused())return;e.preventDefault();point(e);mouseFire=true;canvas.setPointerCapture(e.pointerId);});for(const name of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(name,()=>{mouseFire=false;});}
window.addEventListener('keydown',e=>{let key=e.key.toLowerCase();setDevice(device==='touch'&&['INPUT','TEXTAREA'].includes(e.target?.tagName)?'touch':'keys');if(['SELECT','INPUT','TEXTAREA','BUTTON'].includes(e.target?.tagName)&&($('inspection').open||$('options').open||$('shop').open||(!!e.target.closest?.('#talk')&&['enter',' '].includes(key))))return;if(['arrowup','arrowdown','arrowleft','arrowright',' '].includes(key)&&!paused())e.preventDefault();if(e.repeat)return;if(key==='i'&&!$('options').open){e.preventDefault();$('inspection').open?closeDialog('inspection'):openDialog('inspection');return;}if(key==='escape'){if(talk){e.preventDefault();endTalk();return;}if(play?.active()&&!halted()){e.preventDefault();play.escape();return;}resetInput();if(!paused()){e.preventDefault();openDialog('options');}return;}if(calm()&&['e','enter',' '].includes(key)&&!$('inspection').open&&!$('options').open){if(talk){e.preventDefault();nextLine();return;}if(play.active()&&!halted()){e.preventDefault();if(play.cooking&&e.target?.tagName==='BUTTON'&&$('cookPanel').contains(e.target))e.target.click();else play.press(true);return;}if(!paused()){e.preventDefault();interact();return;}}if(!calm()&&!$('inspection').open&&!$('options').open){if(talk&&['e','enter',' '].includes(key)){e.preventDefault();nextLine();return;}if(key==='e'&&!paused()){e.preventDefault();interact();return;}}if(key==='z'&&!paused()){cycleZoom();return;}if(calm()&&!paused()){keys.add(key);return;}if(!paused()){if(key==='r')doReload();else if(key==='g')doThrow();else if(key==='q')swapGun(1);else if(/^[1-9]$/.test(key)&&GUN_IDS[key-1])swapGun(0,GUN_IDS[key-1]);else keys.add(key);}});window.addEventListener('keyup',e=>{const key=e.key.toLowerCase();keys.delete(key);if(play?.fishing&&['e','enter',' '].includes(key))play.press(false);});
for(const name of ['pointerup','pointercancel'])window.addEventListener(name,e=>{if(reelPointer===e.pointerId){reelPointer=null;play.press(false);}});window.addEventListener('blur',resetInput);document.addEventListener('visibilitychange',resetInput);
// Phone portrait on touch: the controls get their own deck along the bottom and the game view sits above it, so nothing in play is under your thumbs.
function resize(){let v=window.visualViewport,w=Math.round(v?.width||innerWidth),h=Math.round(v?.height||innerHeight);const deck=device==='touch'&&h>w*1.15;document.body.classList.toggle('deck',deck);const gh=h-(deck?$('deck').offsetHeight||0:0);
 for(let [k,n]of Object.entries({'--vw':w,'--vh':h,'--gh':gh,'--vx':v?.offsetLeft||0,'--vy':v?.offsetTop||0}))document.documentElement.style.setProperty(k,n+'px');game?.scale.resize(w*RES,gh*RES);resetInput();}
window.addEventListener('resize',resize);window.visualViewport?.addEventListener('resize',resize);window.visualViewport?.addEventListener('scroll',resize);document.addEventListener('fullscreenchange',resize);try{mountGrime($('deck'));}catch{}
// In the room the companion follows too, with the room's walls and furniture.
const roomBody=new StudyModel();roomBody.radius=FOLLOW.radius;const roomPet=new Follower((x,y)=>roomBody.blocked(x,y));heel(roomPet,model);
// The weapon panel: name, rounds left as a number and a bar, reload progress and the grenade timer. Written only when something changes.
let shown={};
function paintWeapon(p){const g=GUNS[loadout.gun],mag=p.mag,reload=g&&p.reloadTime?1-p.reloadTime/p.reloadFull:0,cool=p.throwCooldown/1.5,ammo=g?p.ammo:0,key=[loadout.gun,ammo,mag,Math.round(reload*40),Math.round(cool*30)].join();if(key===shown.key)return;
 if(g&&ammo<shown.ammo&&shown.gun===loadout.gun&&device==='pad')pad.rumble(g.rifle?.08:.15,.3,g.rifle?35:55);shown={key,ammo,gun:loadout.gun};
 $('weaponName').textContent=g?.name||'Unarmed';$('weaponHud').style.setProperty('--paint',PAINT[loadout.gun]||'transparent');$('ammoNow').textContent=g?ammo:'–';$('ammoMag').textContent=g?'/ '+mag:'';$('magFill').style.width=(g?(p.reloadTime?reload:ammo/mag)*100:0)+'%';
 const low=g&&!p.reloadTime&&ammo<=Math.ceil(mag*.25),h=$('weaponHud');h.classList.toggle('low',!!low);h.classList.toggle('reloading',!!p.reloadTime);h.classList.toggle('empty',!!g&&!ammo&&!p.reloadTime);
 $('ammoWord').textContent=p.reloadTime?'Reloading':ammo?'Reload':'Empty · reload';
 $('reloadRing').style.setProperty('--p',p.reloadTime?reload:g?ammo/mag:0);$('reload').classList.toggle('busy',!!p.reloadTime);$('reload').classList.toggle('low',!!low);
 $('throwRing').style.setProperty('--p',cool?1-cool:1);$('throwFill').style.width=(cool?1-cool:1)*100+'%';$('throwGrenade').classList.toggle('busy',cool>0);}
const bridge={quality,petLook:()=>petLook(companion),pet:()=>roomPet,petStep:dt=>{if(!halted())roomPet.update(dt,ownerOf(model));},paused,loadout:gear,appearance:()=>appearance,zoom,res:RES,input:()=>{const pa=padState.aim;if(pa.x||pa.y){mousePoint=null;aim={x:pa.x,y:pa.y};}else if(mousePoint){const p=scene.cameras.main.getWorldPoint(mousePoint.x,mousePoint.y);aim={x:p.x-model.x,y:p.y+35-model.y};}return {x:move.x+padState.move.x+Number(keys.has('d')||keys.has('arrowright'))-Number(keys.has('a')||keys.has('arrowleft')),y:move.y+padState.move.y+Number(keys.has('s')||keys.has('arrowdown'))-Number(keys.has('w')||keys.has('arrowup')),run:(running&&touch())||padState.run||keys.has('shift'),aimX:aim.x,aimY:aim.y,fire:firing||mouseFire||padState.fire||keys.has(' ')};},ready:s=>{scene=s;ready=true;connectMouse(s);s.practice.setMods(mods(wallet));if(place!=='room')setTimeout(()=>travel(place));else $('loading').hidden=true;},tick:now=>{paintRun();paintWeapon(scene.practice);paintDrill(scene.practice.drill,now);roomPrompt(scene);if($('inspection').open)paintInspection(now);},contextLost:()=>{contextMissing=true;resetInput();$('status').textContent='Graphics paused. Waiting to reconnect…';},contextRestored:()=>{contextMissing=false;$('status').textContent='';}};

// Firelight Camp. Same movement and touch controls; Talk replaces the shooting controls.
// The camera leans the way you aim, as in Helldivers, so you see what you are shooting at; it drifts back when you stop aiming.
const PLACES={room:{name:'Training Grounds <i>01</i>',kicker:'TRAINING GROUNDS / 0.31.0',go:'Camp',to:'camp',text:'A cave chamber under the camp. Aaron and Gadget, the last two of their LEET AF unit, built a whole building out of pallets, doors and scrap in the middle of it, with a yard around it and a barricade across the front. Their post sits by the gate: Aaron\'s paintball shop on the left, Gadget\'s parts counter on the right. Ask Gadget for a Holdout: waves of robot zombies out of every hatch until you drop. Pick up the broken parts they leave, trade them to Gadget for tokens, and spend the tokens at Aaron\'s shop. Every gun here is its paintball twin; reserves never run out. Push the right stick (or hold the mouse) to aim and fire; the buttons around it reload, throw and swap. Climb the stairs to go back up to camp.'},
 camp:{name:'Firelight Camp <i>Stage 1</i>',kicker:'FIRELIGHT CAMP / 0.31.0',go:'Training Grounds',to:'room',text:'The camp on the cave beach, forty-one days after the fall. Macy runs it from the quest board; Ava keeps the medic tent, Pike the cook pot, Stan the forge, and Zyn and Clyde the fenced garden to the south. Fish off the pier, then grill your catch at the campfire: a good meal means more stamina for running. Walk up to anything marked with an ember arrow to use it, and ask Aaron about the Training Grounds behind the steel doors. Jobs, crafting, planting and the gate come later.'},
 home:{name:'The house <i>Night one</i>',kicker:'STARTER HOUSE / 0.31.0',go:'Camp',to:'camp',text:'Your house, the night it all went wrong. The power is out, the TV is dead, and the sirens outside are getting closer. The dog and the cat are going about their evening as if nothing has happened. Walk up to either of them to give them a pat. Next, you will find what you need to protect yourself: the Light Pistol in the bedroom nightstand and the pump shotgun in the hall closet.'}};
function showPlace(){const p=PLACES[place];$('coopBeds').hidden=place!=='camp';document.body.classList[calm()?'add':'remove']('camp');document.body.classList.toggle('home',place==='home');$('placeName').innerHTML=p.name;$('travel').textContent='Go to '+p.go;$('travel').setAttribute('aria-label',p.to==='room'?'Go to the Training Grounds':'Go to Firelight Camp');$('travelHome').hidden=place==='home';$('optionsKicker').textContent=p.kicker;$('optionsText').textContent=p.text;syncKind();$('prompt').hidden=true;$('prompt').classList.remove('tap');$('act').hidden=true;lastTarget=undefined;}
// Each place is its own scene; the one you leave sleeps, so it is just as you left it when you come back.
const SCENES={room:'CharacterRoom',camp:'Camp',home:'Home'},LOADING={camp:'FIRELIGHT CAMP <span>Lighting the campfire…</span>',home:'THE HOUSE <span>The power just went out…</span>'};let activeScene='room';
function travel(to){if(!game||!ready)return;endTalk();play?.stop();resetInput();if(to!=='room')scene?.practice.drill.stop();else if(place!=='room'){model.reset();heel(roomPet,model);}place=to;try{storage?.setItem(PLACE_KEY,to);}catch{}showPlace();
 if(to==='camp'&&!campScene||to==='home'&&!homeScene){$('loading').innerHTML=LOADING[to];$('loading').hidden=false;}
 if(activeScene!==to){game.scene.sleep(SCENES[activeScene]);game.scene.run(SCENES[to]);activeScene=to;}if(to==='room'){renderActor();$('loading').hidden=true;}}
$('travel').onclick=()=>travel(PLACES[place].to);$('travelHome').onclick=()=>{closeDialog('options');travel('home');};
const verbOf=t=>t.kind==='resident'?'Talk':t.kind==='pet'?'Pet':play?.verb(t)||t.verb;
function interact(){const t=calm()?calmScene()?.target:scene?.target;if(!t||talk||play.active()||$('inspection').open||$('options').open)return;if(t.kind==='pet'){if(t.ref)t.ref.pet(homeModel);else campPet.pet();return;}if(t.id==='range'){travel('room');return;}if(t.id==='stairs'){travel('camp');return;}resetInput();if(play.use(t)){lastTarget=undefined;return;}talk=t.topics?{t,i:0,lines:[t.lines[(greetings[t.id]=(greetings[t.id]??-1)+1)%t.lines.length]],menu:true,asked:new Set()}:{t,i:0,lines:play.lines(t)||t.lines};paintTalk();($('talkTopics').querySelector('button')||$('talkNext')).focus({preventScroll:true});}
const greetings={};
function paintTalk(){const {t,i}=talk;$('talk').hidden=false;document.body.classList.add('talking');$('talkName').textContent=t.name;$('talkRole').textContent=t.role;$('talkLine').textContent=talk.lines[i];$('talkNext').textContent=talk.menu?'Bye':i<talk.lines.length-1?'Next':talk.act?'Go':t.topics?'Back':'Close';paintTopics();$('prompt').hidden=true;$('act').hidden=true;drawFace(t);}
function nextLine(){if(!talk)return;if(talk.menu){const f=document.activeElement;if(f&&$('talkTopics').contains(f)){f.click();return;}endTalk();return;}if(talk.i<talk.lines.length-1){talk.i++;paintTalk();}else if(talk.act){const a=talk.act;endTalk();runAct(a);}else if(talk.t.topics)askAbout(null);else endTalk();}
// Someone with topics (Aaron) answers questions: pick one, hear the answer, then pick again or say bye.
function askAbout(k){if(!talk)return;const q=talk.t.topics[k];if(q?.act==='turnin'){talk.asked.add(k);Object.assign(talk,{menu:false,i:0,lines:turnInLines(),from:k,act:null});}else if(q){talk.asked.add(k);Object.assign(talk,{menu:false,i:0,lines:q.a,from:k,act:q.act||null});}else Object.assign(talk,{menu:true,i:0,lines:[talk.t.more||'Anything else?'],act:null});paintTalk();
 const b=$('talkTopics').querySelectorAll('button');(talk.menu?b[(talk.from??-1)+1]||b[0]:$('talkNext'))?.focus({preventScroll:true});}
function paintTopics(){const box=$('talkTopics'),on=!!talk?.menu;box.hidden=!on;if(!on){box.replaceChildren();return;}box.replaceChildren(...talk.t.topics.map((q,k)=>[q,k]).filter(([q])=>offered(q)).map(([q,k])=>{const b=document.createElement('button');b.type='button';b.textContent=q.q.replace('{parts}',plural(wallet.parts,'part'));b.classList.toggle('asked',talk.asked.has(k));b.onclick=e=>{e.stopPropagation();askAbout(k);};return b;}));}
// Gadget's topics show only when they make sense: send robots in when none are out, call them off while they are, buy parts when you have some.
function offered(q){if(!q.when)return true;const run=scene?.practice.drill.state==='run';return q.when==='parts'?wallet.parts>0&&!run:q.when==='run'?run:!run;}
function runAct(a){if(a==='shop'){openShop();return;}const d=scene?.practice.drill;if(!d)return;if(a==='drill')d.start();else if(a==='holdout')d.start('holdout',perks(wallet));else if(a==='stop')d.stop();drillShown=null;}
const plural=(n,w)=>n+' '+w+(n===1?'':'s');
// Gadget pays a token a part, and says so.
function turnInLines(){const n=turnIn(wallet);saveWallet(storage,wallet);return [n===1?'One part. One token. Every bit helps.':n+' parts. That\'s '+n+' tokens.',n>=20?'You\'re keeping my bench busy. Aaron\'s shop is right next door.':'Spend them at Aaron\'s counter, right next to mine.','You\'ve got '+plural(wallet.chits,'token')+'.'];}
// Aaron's shop: everything here makes you last longer in a Holdout. You buy each thing once and keep it.
function openShop(){resetInput();paintShop();$('shop').showModal();$('shop').querySelector('.shop-items button:not([disabled])')?.focus({preventScroll:true});}
function paintShop(){$('shopChits').textContent=plural(wallet.chits,'token');$('shopParts').textContent=wallet.parts?plural(wallet.parts,'part')+' to turn in with Gadget':'';
 $('shopItems').replaceChildren(...SHOP.map(it=>{const li=document.createElement('li'),have=owns(wallet,it.id),short=it.price-wallet.chits;li.className=have?'owned':'';li.dataset.id=it.id;li.innerHTML=`<div><b></b><span></span></div><button type="button"></button>`;li.querySelector('b').textContent=it.name;li.querySelector('span').textContent=it.text;
  const b=li.querySelector('button');b.textContent=have?'Owned':short>0?it.price+' tokens':'Buy · '+it.price;b.disabled=have||short>0;b.setAttribute('aria-label',have?it.name+': owned':short>0?it.name+': '+it.price+' tokens, you need '+short+' more':'Buy '+it.name+' for '+it.price+' tokens');
  b.onclick=()=>{const r=buy(wallet,it.id);if(!r.ok)return;saveWallet(storage,wallet);scene?.practice.setMods(mods(wallet));buzz(20);paintShop();$('shopNote').textContent='Bought: '+it.name+'.';($('shopItems').querySelector('button:not([disabled])')||$('closeShop')).focus({preventScroll:true});};return li;}));}
$('closeShop').onclick=()=>closeDialog('shop');$('shop').addEventListener('close',()=>{resetInput();$('shopNote').textContent='';});
// The readout: wave, robots left and the clock while it runs; the result for a few seconds after. Your best drill time and Holdout wave stay on this device.
// In a Holdout it also shows your health, the pulls Gadget has left, and the parts you have picked up.
const HOLD_KEY='deadlight-holdout-best-v1';function readHold(){try{return Number(storage?.getItem(HOLD_KEY))||0;}catch{return 0;}}
const BEST_KEY='deadlight-drill-best-v1',clock=t=>Math.floor(t/60)+':'+String(Math.floor(t%60)).padStart(2,'0');let drillShown='',drillDoneAt=0;
function readBest(){try{return Number(storage?.getItem(BEST_KEY))||0;}catch{return 0;}}
// A banner slams in at the middle of the screen for the moments that matter: a wave starting or cleared, the gate locking, going down.
let bannerAt=0;function banner(title,text=''){const b=$('banner');$('bannerTitle').textContent=title;$('bannerText').textContent=text;b.hidden=false;b.classList.remove('show');void b.offsetWidth;b.classList.add('show');bannerAt=performance.now();
 clearTimeout(banner.t);banner.t=setTimeout(()=>{if(performance.now()-bannerAt>=1900){b.hidden=true;b.classList.remove('show');}},2000);}
function drillBanner(d,e){if(e.type==='wave')banner('Wave '+e.wave,d.holdout?(e.wave===1?'Here they come':'They get meaner'):'Warm-up · '+e.wave+' of '+WAVES.length);else if(e.type==='clear')banner('Wave '+e.wave+' cleared',d.holdout?'Grab the parts':'');
 else if(e.type==='locked')banner('Gate locked','Hold out');else if(e.type==='downed')banner('Down','Gadget is coming');else if(e.type==='revive')banner('Back up','Make it count');else if(e.type==='over')banner('Holdout over',plural(e.summary.cleared,'wave')+' cleared');else if(e.type==='done')banner('Drill done',clock(e.summary.time));}
function paintDrill(d,now){for(const e of d.drain()){drillBanner(d,e);if(e.type==='bump'||e.type==='hurt')flashHit();else if(e.type==='part'){wallet.parts+=e.n;saveWallet(storage,wallet);}else if(e.type==='downed'){buzz(120);if(device==='pad')pad.rumble(.8,.8,300);}
  else if(e.type==='over'){if(e.summary.cleared>readHold()){try{storage?.setItem(HOLD_KEY,String(e.summary.cleared));}catch{}e.summary.best=true;}drillDoneAt=now;}
  else if(e.type==='done'){const best=readBest();if(!best||e.summary.time<best){try{storage?.setItem(BEST_KEY,String(e.summary.time));}catch{}e.summary.best=true;}drillDoneAt=now;}}
 let html='';
 if(d.holdout){html=holdoutHud(d,now);}
 else if(d.state==='run')html=d.nextWave>0?`<b>Wave ${d.wave+2} incoming</b><span>${clock(d.time)}</span>`:`<b>Wave ${d.wave+1}/${WAVES.length}</b><span>${plural(d.left,'robot')} left</span><span>${clock(d.time)}</span>`;
 else if(d.state==='done'&&now-drillDoneAt<7000){const s=d.summary;html=`<b>Drill done · ${clock(s.time)}</b><span>${Math.round(s.accuracy*100)}% hits</span><span>${plural(s.bumps,'bump')}</span><span>${s.best?'New best':'Best '+clock(readBest())}</span>`;}
 if(html!==drillShown){drillShown=html;const h=$('drillHud');h.innerHTML=html;h.hidden=!html;}}
function holdoutHud(d,now){const s=d.summary;
 if(d.state==='done'){if(now-drillDoneAt>9000)return '';return `<div class="row"><b>Holdout over · wave ${s.wave}</b><span>${plural(s.cleared,'wave')} cleared</span><span>${plural(s.parts,'part')}</span><span>${s.best?'New best':'Best '+plural(readHold(),'wave')}</span></div>`;}
 if(d.state!=='run')return '';const left=Math.ceil(d.nextWave);let top;
 if(d.phase==='ready')top=`<b>Holdout</b><span>Go through the gate</span>`;else if(d.phase==='start')top=`<b>Gate locked</b><span>Wave 1 in ${clock(left)}</span>`;
 else if(d.phase==='down')top=`<b>Down</b><span>Gadget is coming</span>`;else if(d.phase==='break')top=`<b>Wave ${d.wave} cleared</b><span>Wave ${d.wave+1} in ${clock(left)}</span>`;
 else top=`<b>Wave ${d.wave}</b><span>${plural(d.left,'robot')} left</span><span>${clock(d.time)}</span>`;
 if(d.phase==='ready')return `<div class="row">${top}</div>`;const pct=Math.round(d.hp/d.maxHp*100);
 return `<div class="row">${top}</div><div class="vitals"><i class="hp${pct<=30?' low':''}" role="img" aria-label="Health ${Math.round(d.hp)} of ${d.maxHp}"><i style="width:${pct}%"></i></i><span class="pulls" aria-label="${plural(d.revives,'pull')} left">${'<i></i>'.repeat(d.revives)}</span><span class="parts">${plural(d.parts,'part')}</span></div>`;}
function flashHit(){const f=$('hitFlash');f.classList.remove('on');void f.offsetWidth;f.classList.add('on');buzz(30);if(device==='pad')pad.rumble(.5,.5,120);}
function endTalk(){if(!talk)return;talk=null;$('talk').hidden=true;document.body.classList.remove('talking');resetInput();lastTarget=undefined;}
// The speaker's face (or the thing you are looking at), cut from the art already on the GPU canvases.
function drawFace(t){const c=$('talkFace').getContext('2d');c.clearRect(0,0,160,160);c.imageSmoothingEnabled=false;
 if(t.kind==='resident'){const src=game.textures.get('camp-res-'+t.id).getSourceImage();c.drawImage(src,2*160+40,14,80,80,0,0,160,160);return;}
 const home=place==='home',o=(home?HOME_PROPS:PROPS).find(p=>p.id===(t.prop||t.id)),src=o&&game.textures.get((home?'home-':'camp-')+o.id).getSourceImage();if(!src)return;const k=Math.min(150/src.width,150/src.height),w=src.width*k,h=src.height*k;c.drawImage(src,(160-w)/2,(160-h)/2,w,h);}
$('talkNext').onclick=nextLine;$('talk').addEventListener('pointerdown',e=>{if(e.target.id!=='talkNext'&&!e.target.closest('#talkTopics')){e.preventDefault();if(!talk?.menu)nextLine();}});
$('act').addEventListener('pointerdown',e=>{e.preventDefault();if($('act').classList.contains('idle')&&!play.fishing)return;if(play.fishing){if(halted())return;reelPointer=e.pointerId;$('act').setPointerCapture?.(e.pointerId);play.press(true);return;}interact();});
let lastTarget=undefined;
// Fishing, grilling and the stamina readout. While fishing, the stick steers the rod instead of the feet.
play=createCampPlay({$,storage,model:campModel,touch,scene:()=>campScene,afterChange:()=>{lastTarget=undefined;}});
// The companion's feet in camp: a body the size of a dog, so it slips between props the survivor cannot.
const petBody=new CampModel();petBody.radius=FOLLOW.radius;const campPet=new Follower((x,y)=>petBody.blocked(x,y));
function heel(f,m){const a=m.direction*Math.PI/4,s=f.spotNear(m.x-Math.cos(a)*FOLLOW.behind,m.y-Math.sin(a)*FOLLOW.behind);f.place(s.x,s.y,m.direction);}
heel(campPet,campModel);const petTarget={id:'pet',kind:'pet',range:40,facing:true};
const ownerOf=(m,busy=false)=>({x:m.x,y:m.y,direction:m.direction,moving:m.moving,running:m.running,busy});
const campInput=()=>{let x=move.x+padState.move.x+Number(keys.has('d')||keys.has('arrowright'))-Number(keys.has('a')||keys.has('arrowleft')),y=move.y+padState.move.y+Number(keys.has('s')||keys.has('arrowdown'))-Number(keys.has('w')||keys.has('arrowup'));const m=Math.hypot(x,y);if(m>1){x/=m;y/=m;}return {x,y,run:(running&&touch())||padState.run||keys.has('shift')};};
// For local testing only: ?debug exposes the camp to the console.
if(/[?&]debug\b/.test(globalThis.location?.search||""))window.deadlight={quality,campModel,homeModel,get homeScene(){return homeScene;},roomModel:model,get roomScene(){return scene;},play,campPet,get campScene(){return campScene;},get running(){return running;},get zoom(){return zoomLevel;}};
const campBridge={quality,paused,zoom,res:RES,look:()=>survivorLook,
 input:()=>play.fishing?{x:0,y:0,run:false}:campInput(),step:dt=>{if(!halted())play.update(dt,campInput());},
 fishing:()=>play.view(),busy:()=>!!play.active(),
 petLook:()=>petLook(companion),pet:()=>campPet,petStep:dt=>{if(!halted())campPet.update(dt,ownerOf(campModel,play.active()));},
 petTarget:()=>Object.assign(petTarget,{name:displayName(companion),x:campPet.x,y:campPet.y,my:campPet.y-(companion.species?30:46)+(campPet.state==='lie'?10:0)}),cooking:()=>play.cookView(),rackFish:()=>play.camp.basket.length,
 ready:s=>{campScene=s;if(place==='camp')$('loading').hidden=true;},
 tick:(now,s)=>{paintRun();const t=s.target,show=!!t&&!paused(),pr=$('prompt');
  if(play.active()){pr.hidden=true;const fishing=play.fishing&&touch()&&!halted();$('act').hidden=!fishing;$('act').classList.remove('idle');if(fishing){const verb=play.actLabel();if($('actVerb').textContent!==verb){$('actVerb').textContent=verb;$('actName').textContent='Fishing';$('act').setAttribute('aria-label',verb);}}lastTarget=undefined;return;}
  if(t!==lastTarget){lastTarget=t;if(t){$('promptVerb').textContent=$('actVerb').textContent=verbOf(t);$('promptName').textContent=$('actName').textContent=t.name;$('act').setAttribute('aria-label',verbOf(t)+': '+t.name);}else{$('actVerb').textContent='Use';$('actName').textContent='';$('act').setAttribute('aria-label','Nothing to use here');}}
  // On the portrait deck the action button keeps its place, dimmed until something is in reach.
  $('act').hidden=!((show||document.body.classList.contains('deck'))&&touch());$('act').classList.toggle('idle',!show);pr.hidden=!show;if(!show)return;
  placePrompt(s,t);}};
// The starter house: the camp's walking and prompts. The dog and the cat keep their own routines.
const homeBridge={quality,paused,zoom,res:RES,look:()=>survivorLook,input:()=>campInput(),ready:s=>{homeScene=s;if(place==='home')$('loading').hidden=true;},tick:(now,s)=>campBridge.tick(now,s)};
// The Use prompt floats over whatever is in reach.
function placePrompt(s,t){const pr=$('prompt'),cam=s.cameras.main,b=game.canvas.getBoundingClientRect(),k=b.width/s.scale.width,v=cam.worldView,x=((t.mx??t.x)-v.x)*cam.zoom*k,y=((t.kind==='resident'?t.y-118:t.my-2)-v.y)*cam.zoom*k;pr.style.transform=`translate(${Math.round(x)}px,${Math.round(y)}px) translate(-50%,-100%)`;}
// On the range the shooting controls stay put, so the prompt itself is the button on a touch screen.
function roomPrompt(s){const t=s.target,show=!!t&&!paused()&&!calm(),pr=$('prompt'),dock=docked();if(t!==lastTarget){lastTarget=t;const verb=t?verbOf(t):'Use';$('promptVerb').textContent=$('actVerb').textContent=verb;$('promptName').textContent=$('actName').textContent=t?t.name:'';$('act').setAttribute('aria-label',t?verb+': '+t.name:'Nothing to use here');}
 // On the portrait console the Use key in the bottom row does the job, so nothing floats over the game.
 $('act').hidden=!dock;$('act').classList.toggle('idle',!show);pr.hidden=!show||dock;pr.classList.toggle('tap',show&&touch());if(show&&!dock)placePrompt(s,t);}
$('prompt').addEventListener('pointerdown',e=>{if(calm()||!touch())return;e.preventDefault();e.stopPropagation();interact();});
// Controller: polled every frame whatever is open. Dialogs and panels are walked with the D-pad and A; B backs out.
const zeroPad=()=>({move:{x:0,y:0},aim:{x:0,y:0},fire:false,run:false});let padRun=false;
function focusNav(box,P){const step=P.down||P.right?1:P.up||P.left?-1:0;if(!step)return;const list=[...box.querySelectorAll('button:not([disabled]),summary,a[href],input,[tabindex]:not([tabindex="-1"])')].filter(el=>el.offsetParent!==null&&!el.closest('[hidden]'));if(!list.length)return;const i=list.indexOf(document.activeElement);list[(i<0?0:(i+step+list.length)%list.length)].focus({preventScroll:false});}
function padLoop(){globalThis.requestAnimationFrame?.(padLoop);const st=pad.poll();if(!st)return;if(st.any)setDevice('pad');if(device!=='pad')return;const P=st.pressed,D=st.down;
 const dlg=['inspection','options','shop'].map($).find(d=>d.open);
 if(dlg){padState=zeroPad();if(P.b||(P.start&&dlg.id==='options')||(P.back&&dlg.id==='inspection')){closeDialog(dlg.id);return;}focusNav(dlg,P);if(P.a&&dlg.contains(document.activeElement))document.activeElement.click();return;}
 if(P.start){endTalk();openDialog('options');return;}if(P.back){endTalk();openDialog('inspection');return;}if(P.r3)cycleZoom();
 if(talk){padState=zeroPad();if(talk.menu)focusNav($('talk'),P);if(P.a)nextLine();if(P.b)endTalk();return;}
 if(calm()){
  if(play.cooking){padState=zeroPad();const box=$('cookPanel');focusNav(box,P);if(P.a){const f=document.activeElement;if(f?.tagName==='BUTTON'&&box.contains(f))f.click();else play.press(true);}if(P.b)play.escape();return;}
  if(play.fishing){if(P.a)play.press(true);if(st.released.a)play.press(false);}else if(P.a&&!paused())interact();
  if(P.b&&play.active())play.escape();}
 else if(!paused()){if(P.a)interact();if(P.x)doReload();if(P.y||P.right)swapGun(1);if(P.left)swapGun(-1);if(P.rb||P.lb)doThrow();}
 if(paused()){padState=zeroPad();return;}
 // L3 toggles running until the stick comes back to rest; holding LT runs too.
 const L=st.left,R=st.right;if(P.l3)padRun=!padRun;if(!L.m)padRun=false;
 padState={move:{x:L.x,y:L.y},aim:R.m>PAD.aim?{x:R.x/R.m,y:R.y/R.m}:{x:0,y:0},fire:R.m>PAD.fire||D.rt,run:padRun||D.lt};}
globalThis.requestAnimationFrame?.(padLoop);
// The full controls list in the menu, for all three ways to play.
const CONTROLS=[['Move','WASD or arrows','Left stick','Left thumb'],['Run','Shift','LT, or click L3','Run button (stays on until tapped)'],['Aim','Mouse','Right stick','Right stick'],['Fire','Click or Space','Push the right stick, or RT','Push the right stick'],['Reload','R','X','Reload'],['Grenade','G','RB or LB','Grenade'],['Swap weapon','Q, wheel or 1–5','Y or D-pad','Swap'],['Use or talk','E','A','Big button'],['Back','Esc','B','×'],['Character','I','View ⧉','Top right'],['Menu','Esc','Menu ☰','Top right'],['Camera zoom','Z','R3','Menu']];
$('controlsRef').innerHTML='<table><thead><tr><th></th><th>Keyboard &amp; mouse</th><th>Controller</th><th>Touch</th></tr></thead><tbody>'+CONTROLS.map(([a,...r])=>`<tr><th>${a}</th>${r.map(c=>`<td>${c}</td>`).join('')}</tr>`).join('')+'</tbody></table>';
showPlace();paintZoom();
if(typeof Phaser==='undefined')$('loading').innerHTML='Could not load the room.<span>Please refresh to try again.</span>';else{game=new Phaser.Game({type:Phaser.AUTO,parent:'game',width:innerWidth*RES,height:innerHeight*RES,backgroundColor:'#141311',pixelArt:true,roundPixels:true,antialias:false,resolution:Math.min(2,devicePixelRatio||1),render:{antialias:false,pixelArt:true,roundPixels:true},scene:[makeStudyScene(model,bridge),makeCampScene(campModel,campBridge),makeHomeScene(homeModel,homeBridge)],audio:{noAudio:true},banner:false});resize();}
