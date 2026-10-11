import './smooth.js';import {leanTextures} from './memory.js';import {AimStick,assist,AIM} from './aimstick.js';import {Thoughts} from '../home/thoughts.js';import {GUNS,GRENADES,PAINT,readLoadout,saveLoadout} from './equipment.js';import {WAVES} from './drill.js';import {SHOP} from '../grounds/data.js';import {readWallet,saveWallet,turnIn,buy,owns,perks,mods} from './wallet.js';
import {PadInput,PAD} from '../pad.js';import {Quality} from './quality.js';
import {readAppearance,saveAppearance} from './appearance.js';
import {createCreator} from './creator.js';import {layout as ccLayout,mountConsole,readConsole,saveConsole} from './console.js';import {mountEditor} from './console-edit.js';
import {StudyModel} from './model.js';import {makeStudyScene} from './scene.js';import {DIRECTIONS,survivor,FRAME} from './character.js';import {mountSay} from './say.js';import {SCRIPT,SPEAKERS} from '../story/night1.js';import {FloatingStick} from '../layout.js';import {mountGrime} from './grime.js';
import {CampModel} from '../camp/model.js';import {makeCampScene} from '../camp/scene.js';import {PROPS,MAX_CAMPERS} from '../camp/data.js';import {PROP_PAD} from '../camp/art.js';import {createCampPlay} from '../camp/play.js';
import {HomeModel} from '../home/model.js';import {readHome,saveHome,normalizeHome,take,search,swap,goal,useLines,pickupLine,listOf,rounds,verbFor,reborn,FRESH,TRUNK,GO_BAG,JOBS,JOB_NAMES,stepOf} from '../home/kit.js';import {StreetModel,TARGETS as STREET_TARGETS} from '../street/model.js';import {makeStreetScene,TUTORIAL_LOOK} from '../street/scene.js';import {HEAT,JOB,BREACH} from '../street/fight.js';import {HOLD} from '../street/jobs.js';import {paintWindow} from '../street/watch.js';import {PROPS as STREET_PROPS,CRUISER,EVAC,AREA_NAMES,areaAt} from '../street/data.js';import {Audio} from '../audio.js';import {refit,weight,burden} from '../home/bag.js';import {BagScreen} from '../home/bagui.js';import {carrying} from '../mc/assets/gear/bags.js';import {gunArt} from './equipment.js';import {painter} from '../mc/assets/core/paint.js';import {makeHomeScene} from '../home/scene.js';import {PROPS as HOME_PROPS} from '../home/data.js';
import {readCompanion,saveCompanion,normalizeCompanion,petLook,displayName} from '../companion/look.js';import {pet,PET_FRAME,PET_ANIM} from '../companion/pet.js';import {Follower,FOLLOW} from '../companion/follow.js';
const $=id=>document.getElementById(id),model=new StudyModel(),campModel=new CampModel(),_shared=(model.stamina=campModel.stamina),homeModel=new HomeModel(),_sharedHome=(homeModel.stamina=campModel.stamina),streetModel=new StreetModel(),_sharedStreet=(streetModel.stamina=campModel.stamina),keys=new Set(),stick=new FloatingStick();let game,scene,ready=false,move={x:0,y:0},running=false,padState={move:{x:0,y:0},aim:{x:0,y:0},fire:false,run:false},inspectDirection=1,pose='idle',lastInspect=0,contextMissing=false;// Camera distances. Phones start on Wide so you can see what's coming; a PC starts on Normal.
const ZOOMS=[{z:.7,name:'Wide'},{z:1,name:'Normal'},{z:1.5,name:'Close'}];
// The game draws at the screen's real pixel density (up to 3×), so the wide view keeps every art pixel instead of dropping some.
// The camera zoom is one value from far out to close in. The pause menu steps through three presets; the console has a slider.
const ZMIN=.35,ZMAX=1.8,ZOOM_KEY='deadlight-zoom-v1';let zoomLevel=1;
const RES=Math.min(3,Math.max(1,Math.round(globalThis.devicePixelRatio||1))),zoom=()=>zoomLevel*RES;
let storage;try{storage=window.localStorage;}catch{}let appearance=readAppearance(storage),loadout=readLoadout(storage),wallet=readWallet(storage);
// Where the survivor is: the Training Grounds (a test space), Firelight Camp, the starter house or the street outside it. Remembered
// on this device; ?home opens the house. While the tutorial is being built (FRESH) every visit starts on the couch instead.
const thoughts=new Thoughts();let thoughtShown=null,thoughtAt=0;
let intro=null,watch=null,firstSurvivor=false;const PLACE_KEY='deadlight-place-v1',KEEP=/[?&]keep\b/.test(globalThis.location?.search||'');let areaShown=null,place='room',campScene=null,homeScene=null,streetScene=null,talk=null,play=null,reelPointer=null;try{const v=storage?.getItem(PLACE_KEY);if(v==='camp'||v==='home')place=v;}catch{}if(/[?&]home\b/.test(globalThis.location?.search||'')||globalThis.location?.hash==='#home'||(FRESH&&!KEEP))place='home';
// The camp and the house are calm places: no shooting, Use and Talk instead.
let homeKit=readHome(storage,undefined,FRESH&&!KEEP);if(/[?&]wake\b/.test(globalThis.location?.search||''))homeKit={...homeKit,woke:false};
// For testing the fight: ?street starts out on the street, awake, with both guns.
if(/[?&]street\b/.test(globalThis.location?.search||'')){place='street';homeKit=take(take({...homeKit,woke:true,light:true},'light-pistol'),'pump-shotgun');}
const street=()=>place==='street',calm=()=>place!=='room'&&place!=='street',calmScene=()=>place==='home'?homeScene:campScene,calmModel=()=>place==='home'?homeModel:campModel;
// In camp you are always your survivor, never the zombie from the creator.
let survivorLook=appearance.zombie?readAppearance(storage,'survivor'):appearance;
// On night one you play the tutorial's survivor, a stranger with his own look; once he is gone you are the one you made.
const heroLook=()=>homeKit.phase==='own'?survivorLook:TUTORIAL_LOOK;const packGrid=()=>carrying(heroLook());homeKit={...homeKit,bag:refit(homeKit.bag,packGrid())};let aim={x:0,y:0},firing=false,mouseFire=false,mousePoint=null;
let ccSet=readConsole(storage),ccL=null,ccEditor=null;const cc=mountConsole(document,{deck:$('deck')}),ccOn=()=>document.body.classList.contains('cc');
// The dialog box (study/say.js). Marcus speaks until he is gone, then you; the faces are drawn from the looks.
let say=null;const me=()=>homeKit.phase==='own'?'you':'marcus',faces=new Map();
function lookFace(look){const k=JSON.stringify(look);if(!faces.has(k)){const c=document.createElement('canvas');c.width=FRAME.w;c.height=FRAME.h;const x=c.getContext('2d');x.imageSmoothingEnabled=false;x.scale(2,2);survivor(x,2,0,true,{...look,zombie:0,gun:'none',grenade:null});faces.set(k,c);}return faces.get(k);}
// Head and shoulders off the front-facing frame. The watcher is a shape against the dark, rimmed in cold light; the radio is a handset.
function drawSayFace(c,who){c.clearRect(0,0,64,64);c.imageSmoothingEnabled=false;
 if(who==='guard'){const R=(x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(x,y,w,h);};R(38,6,4,14,'#0b0d10');R(39,7,2,13,'#3b424a');R(22,18,22,40,'#0b0d10');R(24,20,18,36,'#2b3037');R(24,20,18,2,'#5b636c');for(let y=26;y<38;y+=3)R(27,y,12,1,'#14171b');R(27,42,12,9,'#0d1418');R(28,43,10,7,'#3d7a6a');R(29,44,4,1,'#9fd6c4');R(36,22,3,2,'#d23a2a');return;}
 const src=lookFace(who==='marcus'?TUTORIAL_LOOK:survivorLook);
 if(who==='watcher'){const t=document.createElement('canvas');t.width=t.height=64;const x=t.getContext('2d');x.imageSmoothingEnabled=false;x.drawImage(src,48,22,64,64,0,0,64,64);x.globalCompositeOperation='source-in';x.fillStyle='#46597a';x.fillRect(0,0,64,64);c.drawImage(t,1,0);x.fillStyle='#07080b';x.fillRect(0,0,64,64);c.drawImage(t,0,0);return;}
 c.drawImage(src,48,22,64,64,0,0,64,64);}
// Lines in the box: a bare string is said by whoever you are now; Marcus's lines become yours once he is gone.
const yourName=()=>{try{return (storage?.getItem('deadlight-character-room-name-v1')||'').trim();}catch{return '';}};
say=mountSay(document,{face:drawSayFace,name:w=>w==='you'?yourName()||'You':SPEAKERS[w]||w,reduced:()=>!!globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches,onChange:on=>{if(!on){lastTarget=undefined;const e=endLook;endLook=null;e?.();}}});
function sayLines(lines,{act=null,then=null,hold=true}={}){const L=lines.map(l=>Array.isArray(l)?[l[0]==='marcus'?me():l[0],l[1]]:[me(),l]);resetInput();say.play(L,{hold,then:()=>{if(act)runAct(act);then?.();}});}
const ccMode=()=>calm()?'calm':appearance.zombie&&!street()?'zombie':street()?'fight':'range';
// Reads the safe insets (CSS variables) as pixels; made the first time the deck is shown.
let ccProbe=null;const ccInsets=()=>{if(!ccProbe){ccProbe=Object.assign(document.createElement('div'),{ariaHidden:'true'});ccProbe.style.cssText='position:fixed;left:0;top:0;visibility:hidden;pointer-events:none;width:var(--sl);height:var(--sr);margin-left:var(--sb)';document.body.appendChild(ccProbe);}return getComputedStyle(ccProbe);};
const SAVE_FAIL='Active for this visit. Saving is unavailable on this device.';
// Zombies are unarmed in the room: no gun, no grenades, and the shooting controls step aside.
const gear=()=>appearance.zombie?{...loadout,gun:'none'}:loadout;let armedKind=!!appearance.zombie;
function syncKind(){document.body.classList[appearance.zombie&&!street()?'add':'remove']('zombie');ccApply();model.zombie=!!appearance.zombie;showHelp();if(armedKind!==!!appearance.zombie){armedKind=!!appearance.zombie;scene?.practice.equip(gear());}}
// Camp draws an unarmed survivor; the room and the creator preview draw the full creator look.
function renderActor(){if(street()&&!$('inspection').open)streetScene?.setPlayerLook(heroLook());else if(calm()&&!$('inspection').open)calmScene()?.setPlayerLook(place==='home'?heroLook():survivorLook);else scene?.setAppearance(appearance);}
function applyAppearance(){if(!appearance.zombie){survivorLook=appearance;const b=refit(homeKit.bag,packGrid());if(JSON.stringify(b)!==JSON.stringify(homeKit.bag)){homeKit={...homeKit,bag:b};saveHome(storage,homeKit);}paintKit();}syncKind();renderActor();lastInspect=0;paintInspection(performance.now());$('lookSaveStatus').textContent=saveAppearance(storage,appearance)?'Look saved on this device.':SAVE_FAIL;creator.refresh();}
// The flashlight on your gun, out on the street: on by default, F, D-pad down or the Light button turns it on and off. On the
// street the grenade button is the light switch, since there are no grenades out there yet.
const LIGHT_KEY='deadlight-light-v1',GRENADE_ICON='M9.5 9.5h5l1.5 2.5v6.5a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2V12zM10.5 9.5V7h3v2.5M13.5 7.5l3.5-3M8.5 14h7',LIGHT_ICON='M4 10h7l5-3v10l-5-3H4zM18.5 8.5l2-1.5M19 12h2.5M18.5 15.5l2 1.5';
let flashlight=true;try{flashlight=storage?.getItem(LIGHT_KEY)!=='0';}catch{}
function toggleLight(){if(!street()||paused())return;flashlight=!flashlight;try{storage?.setItem(LIGHT_KEY,flashlight?'1':'0');}catch{}audio.play('remote-click');buzz(8);paintGear();}
function paintGear(){const btn=$('throwGrenade'),path=btn.querySelector?.('path');if(street()){path?.setAttribute('d',LIGHT_ICON);$('grenadeName').textContent=flashlight?'Light':'Light off';btn.setAttribute('aria-label','Flashlight');btn.setAttribute('aria-pressed',String(flashlight));btn.classList.toggle('lit',flashlight);return;}
 path?.setAttribute('d',GRENADE_ICON);btn.removeAttribute?.('aria-pressed');btn.classList?.remove('lit');const n=loadout.grenade==='incendiary'?'Firebomb':loadout.grenade==='explosive'?'Frag':'Smoke';$('grenadeName').textContent=$('grenadeLabel').textContent=n;$('grenadeDot').style.background=GRENADES[loadout.grenade]?.color||'';$('throwGrenade').setAttribute('aria-label','Throw '+n);}
function equip(){scene?.practice.equip(gear());renderActor();lastInspect=0;paintGear();$('lookSaveStatus').textContent=saveLoadout(storage,loadout)?'Gear saved on this device. Practice reserves are unlimited.':SAVE_FAIL;creator.refresh();}
// Your companion: chosen in the creator, following you in camp and in the room.
let companion=readCompanion(storage),petDirty=false;
function setCompanion(c,{name=false}={}){companion=normalizeCompanion(c);$('lookSaveStatus').textContent=saveCompanion(storage,companion)?'Companion saved on this device.':SAVE_FAIL;if(!name){petDirty=true;creator.refresh();lastInspect=0;paintInspection(performance.now());}lastTarget=undefined;}
const creator=createCreator({$,storage,kicker:()=>firstSurvivor?'The one who was watching':null,look:()=>appearance,setLook:l=>{appearance=l;applyAppearance();},loadout:()=>loadout,setLoadout:l=>{loadout=l;equip();},companion:()=>companion,setCompanion});
creator.refresh();paintGear();if(!storage)$('lookSaveStatus').textContent=SAVE_FAIL;
$('equipment').onclick=()=>{if($('options').open)closeDialog('options');openDialog('inspection');creator.show('gear');};$('ccCustomize').onclick=()=>{if($('options').open)closeDialog('options');openCcEditor();};
// Right-thumb actions. Each is shared by the touch fan, the keyboard and the controller.
const GUN_IDS=Object.keys(GUNS);
function buzz(ms){try{if(device==='touch')navigator.vibrate?.(ms);}catch{}}
function doReload(){if(paused()||calm())return;if(street()){if(streetScene?.fight.reload()){buzz(12);pad.rumble(.1,.2,60);}return;}if(appearance.zombie)return;const p=scene.practice,before=p.reloadTime;p.reload();if(!before&&p.reloadTime){buzz(12);pad.rumble(.1,.2,60);}}
function doThrow(){if(paused()||appearance.zombie||calm()||street())return;if(scene.practice.throwGrenade()){buzz(25);pad.rumble(.45,.6,140);}}
// Swap cycles through every gun: the room is a practice range with unlimited reserves.
function swapGun(step=1,to=null){if(paused()||calm())return;if(street()){if(to===null)swapHome();return;}if(appearance.zombie)return;const i=GUN_IDS.indexOf(loadout.gun),next=to??GUN_IDS[((i<0?-1:i)+step+GUN_IDS.length)%GUN_IDS.length];if(!next||next===loadout.gun)return;loadout={...loadout,gun:next};equip();buzz(10);pad.rumble(.05,.25,50);const h=$('weaponHud');h.classList.remove('swapped');void h.offsetWidth;h.classList.add('swapped');}
// Pointer presses act on pointerdown for speed; a click with no pointer behind it (Enter, Space, a controller, a script) still works.
const pressedAt={};for(const [id,fn] of [['reload',doReload],['throwGrenade',()=>street()?toggleLight():doThrow()],['swapGun',()=>swapGun(1)]]){$(id).addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();pressedAt[id]=performance.now();$(id).classList.add('down');fn();});$(id).onclick=e=>{if(e?.pointerType||performance.now()-(pressedAt[id]??-1e9)<800)return;fn();};}
for(const id of ['reload','throwGrenade','swapGun'])for(const n of ['pointerup','pointercancel','pointerleave'])$(id).addEventListener(n,()=>$(id).classList.remove('down'));
// Phones and tablets start on the touch controls; a PC, even one with a touchscreen, starts without them and only shows them once you touch the screen.
const coarse=matchMedia('(pointer:coarse)').matches;
// The last thing you touched decides which prompts show: keys, a controller's buttons, or the touch controls.
let device=coarse?'touch':'keys';if(coarse)zoomLevel=ZOOMS[0].z;try{const z=Number(storage?.getItem(ZOOM_KEY));if(z>=ZMIN&&z<=ZMAX)zoomLevel=z;}catch{}document.body.classList.toggle('touch',device==='touch');const touch=()=>device==='touch';const pad=new PadInput();
// A short hint for the current place and device. It fades after a few seconds; the full list is in the menu under Controls.
const HELP={keys:{street:'WASD move · Shift run · C dive · Push into a low fence to climb it · Mouse aim · Click fire · R reload · Q swap · F light · E use · Tab bag · Esc menu',room:'WASD move · Shift run · Mouse aim · Click fire · R reload · Q or wheel swap · G grenade · Esc menu',camp:'WASD move · Shift run · E use or talk · I character · Esc menu',zombie:'WASD shamble · Shift lurch · I character · Esc menu'},
 pad:{street:'Left stick moves · Push into a low fence to climb it · Right stick aims and fires · B dives · X reload · Y swap · D-pad down light · A uses · ☰ menu',room:'Left stick moves · Right stick aims and fires · RB grenade · X reload · Y swap · ☰ menu',camp:'Left stick moves · LT runs · A uses or talks · ☰ menu',zombie:'Left stick shambles · LT lurches · ☰ menu'},
 touch:{street:'Left stick moves; push into a low fence to climb it · Tap Run to sprint, Dive to throw yourself clear · Right stick aims; push it all the way to fire · Reload, Light and Swap sit by it',room:'Left stick moves · Tap Run to sprint · Right stick aims; push it all the way to fire',camp:'Left stick moves · Tap Run to sprint · Big button uses or talks',zombie:'Left stick shambles · Tap Run to lurch'}};
let helpTimer=0;function showHelp(){const k=calm()?'camp':street()?'street':appearance.zombie?'zombie':'room',el=$('instructions');el.textContent=HELP[device][k];el.classList.remove('fade');clearTimeout(helpTimer);helpTimer=setTimeout(()=>el.classList.add('fade'),device==='touch'?6000:9000);}
function setDevice(d){if(device===d)return;const wasTouch=device==='touch';device=d;document.body.classList.toggle('pad',d==='pad');document.body.classList.toggle('touch',d==='touch');if(wasTouch||d==='touch')resize();for(const k of document.querySelectorAll('kbd[data-key]')){k.textContent=d==='pad'?k.dataset.pad:k.dataset.key;k.dataset.glyph=d==='pad'?k.dataset.pad:'';}showHelp();lastTarget=undefined;}
syncKind();
function halted(){return !ready||document.hidden||contextMissing||!!ccEditor?.isOpen()||$('inspection').open||$('options').open||$('shop').open||$('bag').open||$('summary').open;}
function paused(){return halted()||!!talk||!!say?.holding()||!!play?.cooking||!!intro;}
function resetInput(){if(play?.fishing)play.press(false);reelPointer=null;mousePoint=null;aim={x:0,y:0};firing=false;mouseFire=false;aimPointer=null;touchAim.up();laser=null;$('aimZone').classList.remove('active','firing');$('aimThumb').style.transform='';keys.clear();move={x:0,y:0};stick.end();$('moveZone').classList.remove('active');$('ring').style.left=$('ring').style.top='';$('thumb').style.transform='';padState={move:{x:0,y:0},aim:{x:0,y:0},fire:false,run:false};}
function openDialog(id){resetInput();if(id==='inspection'){inspectDirection=(calm()?calmModel():model).direction;pose='idle';setPose('idle');}$(id).showModal();if(id==='inspection'){if(calm())renderActor();creator.refresh();lastInspect=0;paintInspection(performance.now());if(!inspectLoop)inspectLoop=globalThis.requestAnimationFrame?.(loopInspection)||0;}}
function closeDialog(id,force=false){if(id==='inspection'&&firstSurvivor&&!force)return;$(id).close();resetInput();if(id==='inspection'&&calm())renderActor();if(id==='inspection')refreshPet();}
// The companion sheet is repainted once the creator closes, not on every click.
function refreshPet(){if(!petDirty)return;petDirty=false;const l=petLook(companion);campScene?.setPetLook(l);scene?.setPetLook?.(l);}
$('inspect').onclick=()=>openDialog('inspection');$('menu').onclick=()=>openDialog('options');$('resume').onclick=()=>closeDialog('options');
// Menu entries that lead elsewhere close the pause menu first.
const fromMenu=fn=>()=>{if($('options').open)closeDialog('options');fn();};$('inspectMenu').onclick=fromMenu(()=>openDialog('inspection'));$('closeInspect').onclick=()=>closeDialog('inspection');$('returnRoom').onclick=()=>firstSurvivor?finishFirst():closeDialog('inspection');$('closeOptions').onclick=()=>closeDialog('options');for(let id of ['inspection','options'])$(id).addEventListener('close',resetInput);
function cycleZoom(){const next=ZOOMS.find(p=>p.z>zoomLevel+.01)||ZOOMS[0];setZoom(next.z);}
function setZoom(z,save=true){zoomLevel=Math.max(ZMIN,Math.min(ZMAX,z));if(save){try{storage?.setItem(ZOOM_KEY,zoomLevel.toFixed(3));}catch{}}paintZoom();}
// The slider runs on a log scale, so each step out feels the same size as each step in.
const toSlider=z=>Math.round(Math.log(z/ZMIN)/Math.log(ZMAX/ZMIN)*100),fromSlider=v=>ZMIN*Math.pow(ZMAX/ZMIN,v/100);
function paintZoom(){const preset=ZOOMS.find(p=>Math.abs(p.z-zoomLevel)<.01),zl=$('zoom').firstChild;if(zl)zl.textContent='Camera: '+(preset?preset.name:Math.round(zoomLevel*100)+'%')+' ';const r=$('zoomRange');if(r&&document.activeElement!==r)r.value=String(toSlider(zoomLevel));}
$('zoom').onclick=cycleZoom;$('zoomRange').addEventListener('input',e=>setZoom(fromSlider(Number(e.target.value)),false));$('zoomRange').addEventListener('change',()=>setZoom(zoomLevel));
$('zoomOut').onclick=()=>setZoom(zoomLevel/1.15);$('zoomIn').onclick=()=>setZoom(zoomLevel*1.15);
// Effects: Auto watches the frame rate once a second while you play; the menu can fix it at High or Low.
const quality=new Quality(storage),audio=new Audio(storage);function paintSound(){$('sound').textContent='Sound: '+(audio.on?'On':'Off');}$('sound').onclick=()=>{audio.set(!audio.on);paintSound();};paintSound();function paintEffects(){$('effects').textContent='Effects: '+quality.label;document.body.classList.toggle('fx-low',quality.low);}
quality.onChange(paintEffects);paintEffects();$('effects').onclick=()=>quality.cycle();
setInterval(()=>{if(game&&!halted())quality.sample(game.loop?.actualFps);paintEffects();},1000).unref?.();
$('reset').onclick=()=>{endWatch();if(street())travel('home');if(place==='home'){endTalk();thoughts.reset();paintThought(null);homeKit=normalizeHome();saveHome(storage,homeKit);homeModel.reset();paintKit();homeScene?.scene.restart();}else if(place==='camp'){play.stop();campModel.reset();heel(campPet,campModel);}else{model.reset();scene?.practice.reset();heel(roomPet,model);}closeDialog('options');};
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
$('diveBtn')?.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();askDive();});if($('diveBtn'))$('diveBtn').onclick=e=>{if(!e?.pointerType)askDive();};
// The fire stick sits in a fixed place so the fan of buttons around it never moves. A light push turns you; nearly all the way fires,
// once you face that way (study/aimstick.js). Aim and fire are worked out each frame in fightInput, since turning takes time.
const aimZone=$('aimZone'),AIM_TRAVEL=40,touchAim=new AimStick();
// How far the touch fire stick has to be pushed before it shoots: all the way by default (Jaykobi, 2026-10-11), lower in the menu.
// Gore: full (bodies come apart, blood everywhere) or reduced (no pieces, half the blood).
const GORE_KEY='deadlight-gore-v1';let gore='full';try{if(storage?.getItem(GORE_KEY)==='reduced')gore='reduced';}catch{}
function paintGore(){$('gore').textContent='Gore: '+(gore==='full'?'Full':'Reduced');}$('gore').onclick=()=>{gore=gore==='full'?'reduced':'full';try{storage?.setItem(GORE_KEY,gore);}catch{}paintGore();};paintGore();
const FIRE_KEY='deadlight-fire-at-v1';let fireAt=1;try{const v=Number(storage?.getItem(FIRE_KEY));if(v>=.5&&v<=1)fireAt=v;}catch{}
function setFireAt(v,save=true){fireAt=Math.max(.5,Math.min(1,v));touchAim.o={...AIM,fireAt};$('fireAt').value=String(Math.round(fireAt*100));$('fireAtOut').textContent=Math.round(fireAt*100)+'%';if(save){try{storage?.setItem(FIRE_KEY,String(fireAt));}catch{}}}
setFireAt(fireAt,false);$('fireAt').addEventListener('input',e=>setFireAt(Number(e.target.value)/100));let aimPointer=null,touchAt=0,laser=null;
function aimFrom(e){const r=$('aimRing').getBoundingClientRect(),dx=e.clientX-(r.left+r.width/2),dy=e.clientY-(r.top+r.height/2),d=Math.hypot(dx,dy),k=Math.min(1,AIM_TRAVEL/(d||1));
 $('aimThumb').style.transform=`translate(-50%,-50%) translate(${dx*k}px,${dy*k}px)`;touchAim.set(dx,dy,AIM_TRAVEL);}
aimZone.addEventListener('pointerdown',e=>{if(paused()||aimPointer!==null)return;e.preventDefault();mousePoint=null;aimPointer=e.pointerId;aimZone.setPointerCapture(e.pointerId);aimZone.classList.add('active');touchAim.down((street()?streetModel:model).aim);touchAt=0;aimFrom(e);});
aimZone.addEventListener('pointermove',e=>{if(e.pointerId!==aimPointer)return;e.preventDefault();aimFrom(e);});
for(const name of ['pointerup','pointercancel','lostpointercapture'])aimZone.addEventListener(name,e=>{if(e.pointerId!==aimPointer)return;aimPointer=null;aim={x:0,y:0};firing=false;touchAim.up();laser=null;aimZone.classList.remove('active','firing');$('aimThumb').style.transform='';});
// Two fingers on the game picture zoom the camera (the deck's sticks never see them).
const pinch=new Map();let pinchFrom=null;const pinchSpan=()=>{const [a,b]=[...pinch.values()];return Math.hypot(a.x-b.x,a.y-b.y)||1;};
function pinchOn(canvas){canvas.addEventListener('pointerdown',e=>{if(e.pointerType!=='touch')return;pinch.set(e.pointerId,{x:e.clientX,y:e.clientY});if(pinch.size===2){pinchFrom={d:pinchSpan(),z:zoomLevel};resetInput();}});
 window.addEventListener('pointermove',e=>{if(!pinch.has(e.pointerId))return;pinch.set(e.pointerId,{x:e.clientX,y:e.clientY});if(pinchFrom&&pinch.size===2)setZoom(pinchFrom.z*pinchSpan()/pinchFrom.d,false);});
 for(const n of ['pointerup','pointercancel'])window.addEventListener(n,e=>{if(!pinch.delete(e.pointerId))return;if(pinchFrom&&pinch.size<2){pinchFrom=null;setZoom(zoomLevel);}});}
function connectMouse(s){const canvas=s.game.canvas;let wheelAt=0;pinchOn(canvas);canvas.addEventListener('wheel',e=>{if(calm()||paused())return;e.preventDefault();const now=performance.now();if(now-wheelAt<180)return;wheelAt=now;swapGun(e.deltaY>0?1:-1);},{passive:false});window.addEventListener('pointermove',e=>{if(e.pointerType==='mouse')setDevice('keys');});window.addEventListener('pointerdown',e=>{if(e.pointerType==='touch')setDevice('touch');},true);const point=e=>{const cs=street()&&streetScene||s,cm=street()?streetModel:model;let b=canvas.getBoundingClientRect(),p=cs.cameras.main.getWorldPoint((e.clientX-b.left)*s.scale.width/b.width,(e.clientY-b.top)*s.scale.height/b.height);mousePoint={x:(e.clientX-b.left)*s.scale.width/b.width,y:(e.clientY-b.top)*s.scale.height/b.height};aim={x:p.x-cm.x,y:p.y+35-cm.y};};canvas.addEventListener('pointermove',e=>{if(e.pointerType!=='touch'&&!paused()&&!calm())point(e);});canvas.addEventListener('pointerdown',e=>{if(calm()){if(place==='camp'&&play.fishing&&e.pointerType!=='touch'&&e.button===0&&!halted()){e.preventDefault();reelPointer=e.pointerId;play.press(true);return;}if(e.pointerType!=='touch'&&e.button===0&&!paused()&&calmScene()?.target){e.preventDefault();interact();}return;}if(e.pointerType==='touch'||e.button!==0||paused())return;e.preventDefault();point(e);mouseFire=true;canvas.setPointerCapture(e.pointerId);});for(const name of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(name,()=>{mouseFire=false;});}
window.addEventListener('keydown',e=>{let key=e.key.toLowerCase();setDevice(device==='touch'&&['INPUT','TEXTAREA'].includes(e.target?.tagName)?'touch':'keys');if(['SELECT','INPUT','TEXTAREA','BUTTON'].includes(e.target?.tagName)&&($('inspection').open||$('options').open||$('shop').open||(!!e.target.closest?.('#talk')&&['enter',' '].includes(key))))return;if($('bag').open){if(key==='escape'){e.preventDefault();if(!bagUI.cancel())closeDialog('bag');return;}if(key==='tab'){e.preventDefault();closeDialog('bag');return;}if(key==='r'&&!e.repeat){e.preventDefault();bagUI.turn();}return;}if(say.open()&&[' ','enter','e'].includes(key)){e.preventDefault();if(!e.repeat)say.tap();return;}if(key==='tab'){e.preventDefault();if(!e.repeat)openBag();return;}if(['arrowup','arrowdown','arrowleft','arrowright',' '].includes(key)&&!paused())e.preventDefault();if(e.repeat)return;if(key==='i'&&!$('options').open&&!firstSurvivor&&!watch){e.preventDefault();$('inspection').open?closeDialog('inspection'):openDialog('inspection');return;}if(key==='escape'){if(watch&&!halted()){e.preventDefault();skipWatch();return;}if(place==='home'&&homeScene?.wake&&!paused()){e.preventDefault();homeScene.skipWake();return;}if(talk){e.preventDefault();endTalk();return;}if(play?.active()&&!halted()){e.preventDefault();play.escape();return;}resetInput();if(!paused()){e.preventDefault();openDialog('options');}return;}if(calm()&&['e','enter',' '].includes(key)&&!$('inspection').open&&!$('options').open){if(talk){e.preventDefault();nextLine();return;}if(play.active()&&!halted()){e.preventDefault();if(play.cooking&&e.target?.tagName==='BUTTON'&&$('cookPanel').contains(e.target))e.target.click();else play.press(true);return;}if(!paused()){e.preventDefault();interact();return;}}if(!calm()&&!$('inspection').open&&!$('options').open){if(talk&&['e','enter',' '].includes(key)){e.preventDefault();nextLine();return;}if(key==='e'&&!paused()){e.preventDefault();interact();return;}}if(key==='z'&&!paused()){cycleZoom();return;}if(calm()&&!paused()){if(place==='home'&&key==='q'){swapHome();return;}keys.add(key);return;}if(!paused()){if(key==='r')doReload();else if(key==='g')doThrow();else if(key==='f')toggleLight();else if(key==='c')askDive();else if(key==='q')swapGun(1);else if(/^[1-9]$/.test(key)&&GUN_IDS[key-1])swapGun(0,GUN_IDS[key-1]);else keys.add(key);}});window.addEventListener('keyup',e=>{const key=e.key.toLowerCase();keys.delete(key);if(play?.fishing&&['e','enter',' '].includes(key))play.press(false);});
for(const name of ['pointerup','pointercancel'])window.addEventListener(name,e=>{if(reelPointer===e.pointerId){reelPointer=null;play.press(false);}});window.addEventListener('blur',resetInput);document.addEventListener('visibilitychange',resetInput);
// The control center (study/console.js): on a phone held upright the controls sit on a steel plate under the game, placed for
// the screen's width and the player's settings (size, see-through, colour, hand, anything dragged).
function ccApply(w){const on=document.body.classList.contains('deck');document.body.classList.toggle('cc',on);if(!on){cc.clear();return;}
 const v=window.visualViewport,W=w??Math.round(v?.width||innerWidth),cs=ccInsets(),sl=parseFloat(cs.width)||14,sr=parseFloat(cs.height)||14,sb=parseFloat(cs.marginLeft)||14;
 ccL=ccLayout(W,{sl,sr,mode:ccMode(),set:ccSet});cc.apply(ccL,ccSet,sb);ccEditor?.refresh();}
// Customize controls (Menu): the editor shows each change at once (the deck can change height, so the whole screen is laid out
// again) and saves on Done.
function openCcEditor(){if(!ccOn())return;ccEditor??=mountEditor(document,{get:()=>ccSet,view:()=>({rect:$('deck').getBoundingClientRect(),L:ccL}),
 set:s=>{ccSet=s;resize();},done:s=>{ccSet=s;saveConsole(storage,s);resize();}});resetInput();ccEditor.open();}
// The weapon readout is the Swap button in the control center.
$('weaponHud').addEventListener('pointerdown',e=>{if(!ccOn())return;e.preventDefault();const h=$('weaponHud');h.classList.add('down');setTimeout(()=>h.classList.remove('down'),120);swapGun(1);});
// Phone portrait on touch: the controls get their own deck along the bottom and the game view sits above it, so nothing in play is under your thumbs.
function resize(){let v=window.visualViewport,w=Math.round(v?.width||innerWidth),h=Math.round(v?.height||innerHeight);const deck=device==='touch'&&h>w*1.15;document.body.classList.toggle('deck',deck);ccApply(w);const gh=h-(deck?$('deck').offsetHeight||0:0);
 for(let [k,n]of Object.entries({'--vw':w,'--vh':h,'--gh':gh,'--vx':v?.offsetLeft||0,'--vy':v?.offsetTop||0}))document.documentElement.style.setProperty(k,n+'px');game?.scale.resize(w*RES,gh*RES);resetInput();}
window.addEventListener('resize',resize);window.visualViewport?.addEventListener('resize',resize);window.visualViewport?.addEventListener('scroll',resize);document.addEventListener('fullscreenchange',resize);try{mountGrime($('deck'));}catch{}
// In the room the companion follows too, with the room's walls and furniture.
const roomBody=new StudyModel();roomBody.radius=FOLLOW.radius;const roomPet=new Follower((x,y)=>roomBody.blocked(x,y));heel(roomPet,model);
// The weapon panel: name, rounds left as a number and a bar, reload progress and the grenade timer. Written only when something changes.
let shown={};
function paintWeapon(p,id=loadout.gun){const g=GUNS[id],mag=p.mag,reload=g&&p.reloadTime?1-p.reloadTime/p.reloadFull:0,cool=p.throwCooldown/1.5,ammo=g?p.ammo:0,key=[id,ammo,mag,Math.round(reload*40),Math.round(cool*30),p.spare].join();if(key===shown.key)return;
 if(g&&ammo<shown.ammo&&shown.gun===id&&device==='pad')pad.rumble(g.rifle?.08:.15,.3,g.rifle?35:55);shown={key,ammo,gun:id};
 $('weaponName').textContent=g?.name||'Unarmed';$('weaponHud').style.setProperty('--paint',PAINT[id]||'transparent');$('ammoNow').textContent=g?ammo:'–';$('ammoMag').textContent=g?'/ '+mag:'';$('magFill').style.width=(g?(p.reloadTime?reload:ammo/mag)*100:0)+'%';
 const low=g&&!p.reloadTime&&ammo<=Math.ceil(mag*.25),h=$('weaponHud');h.classList.toggle('low',!!low);h.classList.toggle('reloading',!!p.reloadTime);h.classList.toggle('empty',!!g&&!ammo&&!p.reloadTime);
 // Out on the street the spare rounds are real: the shells in your bag (a pistol's never run out).
 $('ammoWord').textContent=(p.reloadTime?'Reloading':ammo?'Reload':'Empty · reload')+(p.spare===undefined?'':' · '+(p.spare===Infinity?'∞':p.spare)+' spare');
 $('reloadRing').style.setProperty('--p',p.reloadTime?reload:g?ammo/mag:0);$('reload').classList.toggle('busy',!!p.reloadTime);$('reload').classList.toggle('low',!!low);
 $('throwRing').style.setProperty('--p',cool?1-cool:1);$('throwFill').style.width=(cool?1-cool:1)*100+'%';$('throwGrenade').classList.toggle('busy',cool>0);}
// Twin-stick input for the places you fight in (the room and the street): moving, running, aiming and firing.
// What the touch stick may pull toward: the dead on the street, the robots and paper targets in the Training Grounds, as offsets from you.
function aimTargets(m){const f=street()&&streetScene?.fight,p=!street()&&scene?.practice;const list=f?f.zombies.filter(z=>f.out(z)):p?[...p.drill.bots.filter(b=>b.hp>0),...p.targets.filter(t=>t.hp>0)]:[];return list.map(t=>({x:t.x-m.x,y:t.y-m.y}));}
function touchStep(m){if(!touchAim.on){touchAt=0;laser=null;return;}const now=performance.now(),dt=touchAt?(now-touchAt)/1000:0;touchAt=now;const r=touchAim.step(Math.min(.1,dt),aimTargets(m));
 if(r.a!==null)aim={x:Math.cos(r.a),y:Math.sin(r.a)};firing=r.fire;aimZone.classList.toggle('firing',firing);laser=r.aiming?{a:r.a,fire:r.fire}:null;}
// A dive asked for by C, B on a controller or the Dive button, taken by the next step of the fight.
let diveAsk=false;function askDive(){if(street()&&!paused()){diveAsk=true;buzz(14);}}
// A controller's stick gets a gentler pull toward the dead than the touch stick, since a thumb on a stick is steadier.
const PAD_AIM={...AIM,cone:8*Math.PI/180,range:320};
function fightInput(s,m){touchStep(m);const pa=padState.aim;if(pa.x||pa.y){mousePoint=null;const a=assist(Math.atan2(pa.y,pa.x),aimTargets(m),PAD_AIM);aim={x:Math.cos(a),y:Math.sin(a)};}else if(mousePoint){const p=s.cameras.main.getWorldPoint(mousePoint.x,mousePoint.y);aim={x:p.x-m.x,y:p.y+35-m.y};}return {x:move.x+padState.move.x+Number(keys.has('d')||keys.has('arrowright'))-Number(keys.has('a')||keys.has('arrowleft')),y:move.y+padState.move.y+Number(keys.has('s')||keys.has('arrowdown'))-Number(keys.has('w')||keys.has('arrowup')),run:(running&&touch())||padState.run||keys.has('shift'),aimX:aim.x,aimY:aim.y,fire:firing||mouseFire||padState.fire||keys.has(' '),dive:diveAsk&&!(diveAsk=false)};}
const bridge={quality,here:()=>place==='room',aimLine:()=>laser,petLook:()=>petLook(companion),pet:()=>roomPet,petStep:dt=>{if(!halted())roomPet.update(dt,ownerOf(model));},paused,loadout:gear,appearance:()=>appearance,zoom,res:RES,input:()=>fightInput(scene,model),ready:s=>{scene=s;ready=true;connectMouse(s);s.practice.setMods(mods(wallet));if(place!=='room')setTimeout(()=>travel(place));else $('loading').hidden=true;},tick:now=>{paintRun();paintWeapon(scene.practice);paintDrill(scene.practice.drill,now);roomPrompt(scene);if($('inspection').open)paintInspection(now);},contextLost:()=>{contextMissing=true;resetInput();$('status').textContent='Graphics paused. Waiting to reconnect…';},contextRestored:()=>{contextMissing=false;$('status').textContent='';}};

// Firelight Camp. Same movement and touch controls; Talk replaces the shooting controls.
// The camera leans the way you aim, as in Helldivers, so you see what you are shooting at; it drifts back when you stop aiming.
const PLACES={room:{name:'Training Grounds <i>01</i>',kicker:'TRAINING GROUNDS / 0.59.0',go:'Camp',to:'camp',text:'A cave chamber under the camp. Aaron and Gadget, the last two of their LEET AF unit, built a whole building out of pallets, doors and scrap in the middle of it, with a yard around it and a barricade across the front. Their post sits by the gate: Aaron\'s paintball shop on the left, Gadget\'s parts counter on the right. Ask Gadget for a Holdout: waves of robot zombies out of every hatch until you drop. Pick up the broken parts they leave, trade them to Gadget for tokens, and spend the tokens at Aaron\'s shop. Every gun here is its paintball twin; reserves never run out. Push the right stick (or hold the mouse) to aim and fire; the buttons around it reload, throw and swap. Climb the stairs to go back up to camp.'},
 camp:{name:'Firelight Camp <i>Stage 1</i>',kicker:'FIRELIGHT CAMP / 0.59.0',go:'Training Grounds',to:'room',text:'The camp on the cave beach, forty-one days after the fall. Macy runs it from the quest board; Ava keeps the medic tent, Pike the cook pot, Stan the forge, and Zyn and Clyde the fenced garden to the south. Fish off the pier, then grill your catch at the campfire: a good meal means more stamina for running. Walk up to anything marked with an ember arrow to use it, and ask Aaron about the Training Grounds behind the steel doors. Jobs, crafting, planting and the gate come later.'},
 street:{name:'Your street <i>Night one</i>',kicker:'YOUR STREET / 0.59.0',go:'Camp',to:'camp',text:'Out the front door, the night it all went wrong. A police cruiser came down your street too fast and went into a pole a few houses east; its lights are still turning. Go and see who was in it. The rest of the neighbourhood is out there too, five blocks by five, and some of your neighbours are wandering their yards; they come for you when they see you or hear a shot. Aim with the right stick or the mouse and fire; the pistol never runs out of spare magazines, but the shotgun only has the shells in your bag. A zombie about to bite stops for a moment first: step back, or knock it off its feet with the shotgun. Night one does not end well for the man from the house. Whoever watched it happen gets the rest of it.'},
 home:{name:'The house <i>Night one</i>',kicker:'STARTER HOUSE / 0.59.0',go:'Camp',to:'camp',text:'Your house, the night it all went wrong. The power is out, the candle is nearly gone and the sirens outside will not stop. The dog and the cat are going about their evening as if nothing has happened; walk up to either of them to give them a pat. First find the flashlight in the kitchen junk drawer. Then get something to protect yourself with (the Light Pistol in the bedroom nightstand, the Pump Shotgun in the hall closet), and go out the front door to see what crashed.'}};
function showPlace(){const p=PLACES[place];paintThought(null);thoughtAt=0;$('coopBeds').hidden=place!=='camp';document.body.classList[calm()?'add':'remove']('camp');document.body.classList.toggle('home',place==='home');document.body.classList.toggle('street',street());if(!street()&&streetHudShown!==null){streetHudShown=null;$('drillHud').hidden=true;$('drillHud').innerHTML='';}$('placeName').innerHTML=p.name;areaShown=null;$('travel').textContent='Go to '+p.go;$('travel').setAttribute('aria-label',p.to==='room'?'Go to the Training Grounds':'Go to Firelight Camp');$('travelHome').hidden=place==='home';$('optionsKicker').textContent=p.kicker;$('optionsText').textContent=p.text;syncKind();$('prompt').hidden=true;$('prompt').classList.remove('tap');$('act').hidden=true;lastTarget=undefined;$('reset').textContent=place==='home'||street()?'Start the night over':'Return to the start';paintKit();paintGear();}
// Each place is its own scene; the one you leave sleeps, so it is just as you left it when you come back.
const SCENES={room:'CharacterRoom',camp:'Camp',home:'Home',street:'Street'},LOADING={camp:'FIRELIGHT CAMP <span>Lighting the campfire…</span>',home:'THE HOUSE <span>The power just went out…</span>',street:'YOUR STREET <span>Opening the front door…</span>'};let activeScene='room';
function travel(to){if(!game||!ready)return;if(to==='street')arrival=performance.now();endTalk();play?.stop();resetInput();// Coming back in from the street, you are just inside your front door.
 if(place==='street'&&to==='home')Object.assign(homeModel,{x:517,y:440,direction:6,frame:0,moving:false});if(to!=='room')scene?.practice.drill.stop();else if(place!=='room'){model.reset();heel(roomPet,model);}place=to;try{storage?.setItem(PLACE_KEY,to);}catch{}showPlace();
 if(to==='camp'&&!campScene||to==='home'&&!homeScene||to==='street'&&!streetScene){$('loading').innerHTML=LOADING[to];$('loading').hidden=false;}
 if(activeScene!==to){game.scene.sleep(SCENES[activeScene]);game.scene.run(SCENES[to]);activeScene=to;}if(to==='room'){renderActor();$('loading').hidden=true;}}
$('travel').onclick=()=>travel(PLACES[place].to);$('travelHome').onclick=()=>{closeDialog('options');travel('home');};
const verbOf=t=>place==='home'&&verbFor(homeKit,t.id)||(t.kind==='resident'?'Talk':t.kind==='pet'?'Pet':play?.verb(t)||t.verb);
function interact(){if(place==='home'&&homeScene?.wake||say.open())return;if(street()&&streetScene?.fight.jobs.fix&&!paused()){streetScene.fight.jobs.tap();return;}const t=calm()?calmScene()?.target:street()?streetScene?.target:scene?.target;if(!t||talk||play.active()||$('inspection').open||$('options').open)return;
 if(street()){resetInput();if(t.id==='frontdoor'){travel('home');return;}if(t.job||t.remains){streetScene?.fight.work(t);return;}if(t.loot){streetScene?.fight.scavenge(t);return;}if(t.id==='cruiser'){sayLines(SCRIPT.trunk,{act:'loot'});return;}sayLines(t.lines);return;}if(t.kind==='pet'){if(t.ref){t.ref.pet(homeModel);petLine(t.ref.def.id);}else campPet.pet();return;}if(t.id==='range'){travel('room');return;}if(t.id==='stairs'){travel('camp');return;}resetInput();if(play.use(t)){lastTarget=undefined;return;}const u=place==='home'&&useLines(homeKit,t.id);if(u){reveal(t.id);sayLines(u.lines,{act:u.act||null});return;}talk=t.topics?{t,i:0,lines:[t.lines[(greetings[t.id]=(greetings[t.id]??-1)+1)%t.lines.length]],menu:true,asked:new Set()}:{t,i:0,lines:play.lines(t)||t.lines};paintTalk();($('talkTopics').querySelector('button')||$('talkNext')).focus({preventScroll:true});}
const greetings={};
// Petting the dog or the cat: once a night each, a passing thought rather than a box (an armed goodbye for the dog).
const petSaid=new Set();function petLine(id){const k=id==='dog'&&homeKit.held?'dogArmed':id;if(petSaid.has(k)||!SCRIPT.pet[k])return;petSaid.add(k);thoughts.push(SCRIPT.pet[k][0][1]);}
function paintTalk(){const {t,i}=talk;$('talk').hidden=false;document.body.classList.add('talking');$('talkName').textContent=t.name;$('talkRole').textContent=t.role;$('talkLine').textContent=talk.lines[i];$('talkNext').textContent=talk.menu?'Bye':i<talk.lines.length-1?'Next':talk.act?(talk.verb||'Go'):t.topics?'Back':'Close';paintTopics();$('prompt').hidden=true;$('act').hidden=true;drawFace(t);}
function nextLine(){if(!talk)return;if(talk.menu){const f=document.activeElement;if(f&&$('talkTopics').contains(f)){f.click();return;}endTalk();return;}if(talk.i<talk.lines.length-1){talk.i++;paintTalk();}else if(talk.act){const a=talk.act;endTalk();runAct(a);}else if(talk.t.topics)askAbout(null);else endTalk();}
// Someone with topics (Aaron) answers questions: pick one, hear the answer, then pick again or say bye.
function askAbout(k){if(!talk)return;const q=talk.t.topics[k];if(q?.act==='turnin'){talk.asked.add(k);Object.assign(talk,{menu:false,i:0,lines:turnInLines(),from:k,act:null});}else if(q){talk.asked.add(k);Object.assign(talk,{menu:false,i:0,lines:q.a,from:k,act:q.act||null});}else Object.assign(talk,{menu:true,i:0,lines:[talk.t.more||'Anything else?'],act:null});paintTalk();
 const b=$('talkTopics').querySelectorAll('button');(talk.menu?b[(talk.from??-1)+1]||b[0]:$('talkNext'))?.focus({preventScroll:true});}
function paintTopics(){const box=$('talkTopics'),on=!!talk?.menu;box.hidden=!on;if(!on){box.replaceChildren();return;}box.replaceChildren(...talk.t.topics.map((q,k)=>[q,k]).filter(([q])=>offered(q)).map(([q,k])=>{const b=document.createElement('button');b.type='button';b.textContent=q.q.replace('{parts}',plural(wallet.parts,'part'));b.classList.toggle('asked',talk.asked.has(k));b.onclick=e=>{e.stopPropagation();askAbout(k);};return b;}));}
// Gadget's topics show only when they make sense: send robots in when none are out, call them off while they are, buy parts when you have some.
function offered(q){if(!q.when)return true;const run=scene?.practice.drill.state==='run';return q.when==='parts'?wallet.parts>0&&!run:q.when==='run'?run:!run;}
// The house: opening the nightstand or the closet shows what is inside; taking a gun puts it in your hands.
function reveal(id){if(id==='nightstand')homeScene?.setProp('nightstand',{open:true,gun:!homeKit.guns['light-pistol']});else if(id==='closet')homeScene?.setProp('closet',{open:true,box:homeKit.guns['pump-shotgun']?'empty':'open'});}
function takeGun(id){const spilled=homeKit.bag.spill.length;homeKit=take(homeKit,id,packGrid());saveHome(storage,homeKit);if(id==='light-pistol')homeScene?.setProp('nightstand',{gun:false});else homeScene?.setProp('closet',{box:'empty'});homeScene?.setPlayerLook(heroLook());paintKit();toast(pickupLine(id)+(homeKit.bag.spill.length>spilled?'. Your bag is full; open it to make room.':''));buzz(20);}
// Searching a drawer or a basket puts what is in it in your bag.
function searchSpot(id){const spilled=homeKit.bag.spill.length;homeKit=search(homeKit,id,packGrid());saveHome(storage,homeKit);paintKit();toast(pickupLine(id)+(homeKit.bag.spill.length>spilled?'. Your bag is full; open it to make room.':''));buzz(14);}
function swapHome(){if(street()&&homeKit.mission?.carry)streetScene?.fight.jobs.putDown();const next=swap(homeKit);if(next===homeKit)return;homeKit=next;saveHome(storage,homeKit);homeScene?.setPlayerLook(heroLook());streetScene?.setPlayerLook(heroLook());paintKit();buzz(8);if(street()){const h=$('weaponHud');h.classList.remove('swapped');void h.offsetWidth;h.classList.add('swapped');}}
// What to do next and the gun in your hands, under the stamina bar.
function paintKit(){const home=place==='home'||street(),g=homeKit.held,goalText=goal(homeKit,street());$('bagBtn').hidden=!bagOpen();const grid=packGrid(),load=burden(weight(homeKit.bag,Object.keys(homeKit.guns)),grid.kg);homeModel.burden=streetModel.burden=load;$('bagBtn').classList.toggle('over',load.over||homeKit.bag.spill.length>0);$('goalChip').hidden=!home||!goalText||!!homeScene?.wake;$('goalChip').textContent=goalText;$('gunChip').hidden=place!=='home'||!g;if(!g)return;
 $('gunChip').querySelector('b').textContent=GUNS[g].name;$('gunChip').querySelector('span').textContent=rounds(homeKit);$('gunChip').classList.toggle('two',Object.keys(homeKit.guns).length>1);
 const c=$('gunIcon').getContext('2d');c.clearRect(0,0,c.canvas.width,c.canvas.height);c.save();c.scale(2,2);c.translate(g==='pump-shotgun'?15:6,9);gunArt(painter(c),g);c.restore();}
let toastTimer=0;function toast(text){const el=$('toast');el.textContent=text;el.hidden=false;el.classList.remove('out');clearTimeout(toastTimer);toastTimer=setTimeout(()=>{el.classList.add('out');toastTimer=setTimeout(()=>el.hidden=true,400);},2600);}
// The wake-up scene's caption, letterbox and Skip.
// A cutscene's lines go in the dialog box; the beat waits until you tap past the last one (wake.js ack).
let cineShown=null,cineLine=null,titled=null;function paintCine(w){const on=!!w;document.body.classList.toggle('cine',on);$('cine').hidden=!on;if(!on){if(cineLine&&!watch)say.stop();cineLine=null;if(cineShown!==null){cineShown=null;paintKit();}return;}
 if(w.title&&w.title!==titled){titled=w.title;showTitle(...w.title,3400);}
 if(w.line&&w.line!==cineLine){cineLine=w.line;sayLines(w.line,{then:()=>w.ack?.()});}else if(!w.line)cineLine=null;
 if(w.say!==cineShown){cineShown=w.say;const el=$('cineLine');el.classList.remove('on');void el.offsetWidth;el.textContent=w.say;if(w.say)el.classList.add('on');}}
function runAct(a){if(a==='leave'){travel('street');return;}if(a==='flashlight'){homeKit={...homeKit,light:true};saveHome(storage,homeKit);paintKit();homeScene?.setPlayerLook(heroLook());buzz(16);audio.play('remote-click');homeScene?.crash();return;}if(a==='loot'){if(streetScene?.fight.search()){toast('In your bag: '+TRUNK.map(([id,n])=>n+' '+(id==='shells'?'shotgun shells':'rifle rounds')).join(', '));buzz(20);}return;}if(a.startsWith('take:')){takeGun(a.slice(5));return;}if(a.startsWith('search:')){searchSpot(a.slice(7));return;}if(a==='shop'){openShop();return;}const d=scene?.practice.drill;if(!d)return;if(a==='drill')d.start();else if(a==='holdout')d.start('holdout',perks(wallet));else if(a==='stop')d.stop();drillShown=null;}
const plural=(n,w)=>n+' '+w+(n===1?'':'s');
// Gadget pays a token a part, and says so.
function turnInLines(){const n=turnIn(wallet);saveWallet(storage,wallet);return [n===1?'One part. One token. Every bit helps.':n+' parts. That\'s '+n+' tokens.',n>=20?'You\'re keeping my bench busy. Aaron\'s shop is right next door.':'Spend them at Aaron\'s counter, right next to mine.','You\'ve got '+plural(wallet.chits,'token')+'.'];}
// Aaron's shop: everything here makes you last longer in a Holdout. You buy each thing once and keep it.
function openShop(){resetInput();paintShop();$('shop').showModal();$('shop').querySelector('.shop-items button:not([disabled])')?.focus({preventScroll:true});}
function paintShop(){$('shopChits').textContent=plural(wallet.chits,'token');$('shopParts').textContent=wallet.parts?plural(wallet.parts,'part')+' to turn in with Gadget':'';
 $('shopItems').replaceChildren(...SHOP.map(it=>{const li=document.createElement('li'),have=owns(wallet,it.id),short=it.price-wallet.chits;li.className=have?'owned':'';li.dataset.id=it.id;li.innerHTML=`<div><b></b><span></span></div><button type="button"></button>`;li.querySelector('b').textContent=it.name;li.querySelector('span').textContent=it.text;
  const b=li.querySelector('button');b.textContent=have?'Owned':short>0?it.price+' tokens':'Buy · '+it.price;b.disabled=have||short>0;b.setAttribute('aria-label',have?it.name+': owned':short>0?it.name+': '+it.price+' tokens, you need '+short+' more':'Buy '+it.name+' for '+it.price+' tokens');
  b.onclick=()=>{const r=buy(wallet,it.id);if(!r.ok)return;saveWallet(storage,wallet);scene?.practice.setMods(mods(wallet));buzz(20);paintShop();$('shopNote').textContent='Bought: '+it.name+'.';($('shopItems').querySelector('button:not([disabled])')||$('closeShop')).focus({preventScroll:true});};return li;}));}
// The bag: open in the house once you are awake. It pauses the game like the other screens.
const bagOpen=()=>(place==='home'||street())&&homeKit.woke&&!homeScene?.wake;
const bagUI=new BagScreen($('bag'),{kit:()=>homeKit,setKit:k=>{homeKit=k;saveHome(storage,homeKit);paintKit();},grid:packGrid,look:heroLook,
 hold:id=>{if(homeKit.held===id||!homeKit.guns[id])return;homeKit={...homeKit,held:id};saveHome(storage,homeKit);homeScene?.setPlayerLook(heroLook());streetScene?.setPlayerLook(heroLook());paintKit();buzz(8);}});
function openBag(){if(!bagOpen()||halted())return false;endTalk();resetInput();homeKit={...homeKit,bag:refit(homeKit.bag,packGrid())};$('bag').showModal();bagUI.open();return true;}
$('bagBtn').onclick=()=>openBag();$('closeBag').onclick=()=>closeDialog('bag');$('bag').addEventListener('close',()=>{resetInput();paintKit();});
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
 const home=place==='home',o=(home?HOME_PROPS:street()?STREET_PROPS:PROPS).find(p=>p.id===(t.prop||t.id)),src=o&&(street()?streetScene?.face(o.id):game.textures.get((home?'home-':'camp-')+o.id).getSourceImage());if(!src)return;const k=Math.min(150/src.width,150/src.height),w=src.width*k,h=src.height*k;c.drawImage(src,(160-w)/2,(160-h)/2,w,h);}
// A tap anywhere moves a held line on, so a cutscene never needs you to find the box; the menu and Skip still work.
$('say').addEventListener('pointerdown',e=>{e.preventDefault();say.tap();});document.addEventListener('pointerdown',e=>{if(!say.holding()||e.target.closest?.('#say,dialog,.topbar,#cineSkip'))return;e.preventDefault();e.stopPropagation();say.tap();},true);
$('talkNext').onclick=nextLine;$('gunChip').onclick=e=>{e.stopPropagation();swapHome();};$('cineSkip').onclick=()=>{say.stop();watch?skipWatch():homeScene?.skipWake();};$('talk').addEventListener('pointerdown',e=>{if(e.target.id!=='talkNext'&&!e.target.closest('#talkTopics')){e.preventDefault();if(!talk?.menu)nextLine();}});
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
if(/[?&]debug\b/.test(globalThis.location?.search||""))window.deadlight={quality,campModel,homeModel,get homeScene(){return homeScene;},streetModel,get streetScene(){return streetScene;},get homeKit(){return homeKit;},audio,travel:to=>travel(to),runAct:a=>runAct(a),roomModel:model,get roomScene(){return scene;},play,campPet,get campScene(){return campScene;},get running(){return running;},get zoom(){return zoomLevel;},get game(){return game;},thoughts,get say(){return say;},sayLines:(l,o)=>sayLines(l,o),SCRIPT};
const campBridge={quality,paused,zoom,res:RES,look:()=>survivorLook,
 input:()=>play.fishing?{x:0,y:0,run:false}:campInput(),step:dt=>{if(!halted())play.update(dt,campInput());},
 fishing:()=>play.view(),busy:()=>!!play.active(),
 petLook:()=>petLook(companion),pet:()=>campPet,petStep:dt=>{if(!halted())campPet.update(dt,ownerOf(campModel,play.active()));},
 petTarget:()=>Object.assign(petTarget,{name:displayName(companion),x:campPet.x,y:campPet.y,my:campPet.y-(companion.species?30:46)+(campPet.state==='lie'?10:0)}),cooking:()=>play.cookView(),rackFish:()=>play.camp.basket.length,
 ready:s=>{campScene=s;if(place==='camp')$('loading').hidden=true;},
 tick:(now,s)=>{paintRun();const t=s.target,show=!!t&&!paused(),pr=$('prompt');
  if(play.active()){pr.hidden=true;const fishing=play.fishing&&touch()&&!halted();$('act').hidden=!fishing;$('act').classList.remove('idle');if(fishing){const verb=play.actLabel();if($('actVerb').textContent!==verb){$('actVerb').textContent=verb;$('actName').textContent='Fishing';$('act').setAttribute('aria-label',verb);}}lastTarget=undefined;return;}
  if(t!==lastTarget){lastTarget=t;if(t){$('promptVerb').textContent=$('actVerb').textContent=verbOf(t);$('promptName').textContent=$('actName').textContent=t.short||t.name;$('act').setAttribute('aria-label',verbOf(t)+': '+t.name);}else{$('actVerb').textContent='Use';$('actName').textContent='';$('act').setAttribute('aria-label','Nothing to use here');}}
  // On the portrait deck the action button keeps its place, dimmed until something is in reach.
  $('act').hidden=!((show||document.body.classList.contains('deck'))&&touch());$('act').classList.toggle('idle',!show);pr.hidden=!show;if(!show)return;
  placePrompt(s,t);}};
// The starter house: the camp's walking and prompts. The dog and the cat keep their own routines.
// The film, "The Fall" (dist/fall/): no longer the opening (the night now starts on the couch and tells itself), kept for the
// menu and for pieces later in the game. ?intro plays it over the first night once.
const INTRO_Q=globalThis.location?.search||'';let introDone=!/[?&]intro\b/.test(INTRO_Q);
async function playIntro(night){if(intro)return;intro={};try{const {playFall}=await import('../fall/play.js');const {PETS}=await import('../home/data.js');
  intro=playFall({look:survivorLook,pets:PETS.map(p=>p.look),storage,sound:id=>audio.play(id),onDone:()=>{intro=null;}});}
 catch(e){console.error(e);intro=null;introDone=true;}}
function maybeIntro(){if(introDone||intro||!audio.gestured||place!=='home'||!homeScene?.wake)return;introDone=true;playIntro(true);}
$('watchIntro').onclick=fromMenu(()=>playIntro(false));
const homeBridge={quality,paused,zoom,res:RES,look:heroLook,input:()=>campInput(),sound:id=>audio.play(id),started:()=>audio.gestured&&!intro&&introDone,buzz,kit:()=>homeKit,held:()=>homeKit.held||(homeKit.light?'flashlight':undefined),woke:()=>homeKit.woke,wokeUp:()=>{homeKit={...homeKit,woke:true};saveHome(storage,homeKit);paintKit();},cine:paintCine,ready:s=>{homeScene=s;if(place==='home')$('loading').hidden=true;},tick:(now,s)=>{campBridge.tick(now,s);think(now);maybeIntro();}};
// The street: the room's twin-stick fighting with your real guns, and the house's kit. What the fight does comes back as events.
const streetBridge={quality,paused,zoom,res:RES,aimLine:()=>laser,flash:()=>flashlight,gore:()=>gore,
 // Where the mouse points in the street, for the crosshair (none on touch, or while a controller aims).
 reticle:()=>device==='keys'&&mousePoint&&!(padState.aim.x||padState.aim.y)?streetScene?.cameras.main.getWorldPoint(mousePoint.x,mousePoint.y):null,look:heroLook,held:()=>homeKit.held,kit:()=>homeKit,grid:packGrid,
 setKit:k=>{homeKit=k;saveHome(storage,homeKit);paintKit();},input:()=>fightInput(streetScene,streetModel),
 // The door back in stays shut while anything out here is coming for you, and the trunk waits until the street is clear.
 usable:t=>t.remains?!!streetScene?.fight.remains&&!homeKit.corpse?.taken&&!streetScene.fight.searching:t.id==='frontdoor'&&homeKit.phase==='own'?false:t.job?!!streetScene?.fight.can(t)&&!streetScene.fight.searching:t.loot?!homeKit.looted?.includes(t.id)&&!streetScene?.fight.searching&&!homeKit.mission?.carry:t.id==='frontdoor'?!streetScene?.fight.threat().length:t.id==='cruiser'?homeKit.street==='cleared':true,
 event:e=>streetEvent(e),ready:s=>{streetScene=s;if(place==='street')$('loading').hidden=true;},
 tick:(now,s)=>{paintWatch(now,s.fight);airTick(s.fight);arrive(now);paintRun();paintWeapon(s.fight,homeKit.held);streetHud(s.fight);paintMarks(s);roomPrompt(s);if($('inspection').open)paintInspection(now);think(now);}};
// Your thoughts (home/thoughts.js): one line at a time under you, at home and on the street. They wait while you talk, read or watch.
function think(now){const dt=Math.min(.1,Math.max(0,(now-(thoughtAt||now))/1000));thoughtAt=now;const home=place==='home',f=streetScene?.fight;
 const st=home?{place,kit:homeKit,x:homeModel.x,y:homeModel.y,pets:homeScene?.pets?.map(p=>({x:p.pet.x,y:p.pet.y,def:p.def}))}:{place,kit:homeKit,x:streetModel.x,y:streetModel.y,cruiser:Math.hypot(streetModel.x-CRUISER.x,streetModel.y-CRUISER.y),fight:f&&{alert:f.alert,hp:f.hp,maxHp:f.maxHp}};
 paintThought(thoughts.update(dt,st,paused()||!!watch||home&&!!homeScene?.wake));}
function paintThought(line){if(line===thoughtShown)return;thoughtShown=line;const el=$('thought');el.classList.remove('on');if(!line){el.hidden=true;return;}el.textContent=line;el.hidden=false;void el.offsetWidth;el.classList.add('on');}
// Sound, rumble, banners and the readout for the fight.
// Sounds from the dead carry: full close up, fading to a murmur at the edge of hearing (a loud one, like the groan of one that
// has just seen you, always comes through).
const far=(z,loud)=>{const d=z?Math.hypot(z.x-streetModel.x,z.y-streetModel.y):0;return Math.max(loud?.55:.12,Math.min(1,1.25-d/480));};
let pumpTimer=0;function streetEvent(e){const t=e.type;if(t==='casing'){if(Math.hypot(e.x-streetModel.x,e.y-streetModel.y)<160)audio.play('casing',{kind:e.hull?1:0,vol:.8},.03);return;}thoughts.note(t);
 if(t==='shot'){audio.play('gun-thump',{size:e.gun==='pump-shotgun'?1:0});if(e.gun==='pump-shotgun'){audio.play('shotgun');clearTimeout(pumpTimer);pumpTimer=setTimeout(()=>audio.play('pump'),380);buzz(30);pad.rumble(.35,.7,90);}else{audio.play('pistol');buzz(10);pad.rumble(.1,.3,40);}}
 else if(t==='hit')audio.play('zombie-hit',{},.04);else if(t==='kill'){audio.play('zombie-hit');audio.play('groan',{voice:1},.2);if(e.gore){audio.play('zombie-hit',{},.0);buzz(25);if(device==='pad')pad.rumble(.4,.5,90);}}
 else if(t==='grab'){audio.play('bite');flashHit();buzz(40);if(device==='pad')pad.rumble(.5,.3,160);}else if(t==='free'){buzz(10);}
 else if(t==='groan')audio.play('groan',{voice:['cop','worker'].includes(e.z?.look)?0:e.z?.look==='jogger'?2:1,vol:far(e.z,e.loud)},e.loud?0:.9);
 else if(t==='dive'){audio.play('dive');buzz(20);if(device==='pad')pad.rumble(.15,.3,60);}else if(t==='land'){buzz(12);if(device==='pad')pad.rumble(.3,.2,50);}else if(t==='winded')flashRun();
 else if(t==='hurt'){if(e.kind==='bite')audio.play('bite');flashHit();if(e.kind==='burst'){buzz(80);if(device==='pad')pad.rumble(.7,.6,260);}}else if(t==='shell')audio.play('shell-in');else if(t==='loaded')audio.play('mag-in');else if(t==='empty')audio.play('dry-fire');
 else if(t==='nospare')toast('No shells left in your bag.');
 else if(t==='patrol')audio.play('groan',{voice:1,vol:.25},1);
 else if(t==='horde'&&streetScene?.fight.evac){audio.play('groan',{voice:0,vol:.6});buzz(60);}
 else if(t==='horde'){const m=streetModel,a=Math.atan2(e.y-m.y,e.x-m.x),side=['east','south-east','south','south-west','west','north-west','north','north-east'][(Math.round(a/(Math.PI/4))+8)%8];banner('Horde','Coming from the '+side);audio.play('groan',{voice:0,vol:.7});audio.play('groan',{voice:2,vol:.6},.3);buzz(120);if(device==='pad')pad.rumble(.6,.6,500);}
 else if(t==='swarm-over'&&!watch)toast('That was the last of them. Stay quiet and they won\'t come back for a while.');
 else if(t==='heat'&&e.up&&e.level>=2&&!watch)toast(e.level===2?'They know you are out here. Keep it quiet for a while.':'Too much noise. Something big is coming.');
 else if(t==='search')audio.play('rummage');else if(t==='pickup'){audio.play('pickup',{kind:e.id==='shells'?0:e.id==='scrap'?1:2});toast('Picked up '+listOf([[e.id,e.n]]));paintKit();buzz(8);}
 else if(t==='found'){paintKit();toast((e.t.name||'')+': '+(e.items.length?listOf(e.items):'nothing worth taking'));buzz(e.items.length?16:6);if(e.alarm){audio.play('car-alarm');banner('Car alarm','Everything nearby heard that');buzz(80);if(device==='pad')pad.rumble(.4,.6,400);}}
 else if(t==='down'){banner('You went down',homeKit.phase==='own'?'Back where you came out':'Back to your step');buzz(120);if(device==='pad')pad.rumble(.8,.8,300);}
 else if(t==='restart'){paintKit();toast(homeKit.phase==='own'?'Back at the door, with what you had.':'Back on your step, with what you had when you came out.');}
 else if(t==='stage'){paintKit();if(e.stage==='cleared')sayLines(SCRIPT.cleared);else if(e.stage==='done')setTimeout(brief,1800);}
 else if(t==='story'&&e.beat==='him'){const c=copAt(),m=streetModel;lookAt(c&&{x:(c.x*2+m.x)/3,y:(c.y*2+m.y)/3-24,z:1.35,secs:.7},SCRIPT.cruiser.him,()=>streetScene?.fight.wake());}
 else if(t==='scream'){audio.play('groan',{voice:2,vol:far(e.z,true)});audio.play('groan',{voice:2,vol:far(e.z,true)*.8},.35);}
 else if(t==='screamed'){audio.play('groan',{voice:2,vol:1});audio.play('groan',{voice:0,vol:.7},.25);toast('A screamer called them in.');buzz(60);if(device==='pad')pad.rumble(.4,.3,300);}
 else if(t==='swell')audio.play('groan',{voice:0,vol:far(e.z,true)},.4);
 else if(t==='burst'){const v=far({x:e.x,y:e.y},true);audio.play('gun-thump',{size:1,vol:v});audio.play('zombie-hit',{vol:v});audio.play('zombie-hit',{vol:v*.8},.08);}
 else if(t==='spit')audio.play('groan',{voice:1,vol:far(e.z)*.7},.6);else if(t==='splash')audio.play('zombie-hit',{vol:.35},.3);
 else if(t==='burn'){buzz(10);}
 else if(t==='vault'){buzz(8);if(device==='pad')pad.rumble(.1,.15,40);}else if(t==='over'){audio.play('casing',{kind:1,vol:.25});buzz(10);}
 else if(t==='job'){paintKit();if(e.job==='supplies')toast('In your bag: '+listOf(GO_BAG));
  sayLines(SCRIPT.job[e.job],{then:()=>{if(e.all)say.radio(SCRIPT.air.jobs);}});buzz(30);if(device==='pad')pad.rumble(.3,.4,160);}
 // The job's steps: a line for each, the part in your hands, and the fixes' taps.
 else if(t==='chain'){paintKit();chainLines(SCRIPT.chain[e.line]);}
 else if(t==='step'){paintKit();if(e.step==='hold')setTimeout(()=>{if(stepOf(homeKit,'power')==='hold')chainLines(SCRIPT.chain.hold);},4000);}
 else if(t==='lift'){paintKit();toast(`Carrying ${PART_NAME[e.item]}. Swap sets it down.`);buzz(12);}else if(t==='setdown'){paintKit();toast(`Set ${PART_NAME[e.item]} down.`);buzz(8);}
 else if(t==='fix'){lastTarget=undefined;if(e.first)chainLines(SCRIPT.chain[e.kind]);buzz(8);}else if(t==='fixstop')lastTarget=undefined;
 else if(t==='fixhit'){audio.play(e.kind==='tune'?'tv-voice':'mag-in');buzz(14);if(device==='pad')pad.rumble(.2,.2,60);}
 else if(t==='fixmiss'){if(e.kind==='wire'){audio.play('casing',{kind:1,vol:.7});buzz(40);if(device==='pad')pad.rumble(.4,.2,90);}else{audio.play('signal-lost');buzz(10);}}
 else if(t==='fixed'){lastTarget=undefined;buzz(30);}else if(t==='static')audio.play('channel-flip',{},.5);
 else if(t==='prime'){audio.play('shell-in');buzz(8);}else if(t==='sputter'){audio.play('gun-thump',{size:0});buzz(40);if(device==='pad')pad.rumble(.4,.3,160);}
 else if(t==='started'){audio.play('gun-thump',{size:1});chainLines(SCRIPT.job.powerOn);buzz(80);if(device==='pad')pad.rumble(.6,.5,400);}
 // The hold-out's breaches: called out as one is about to give, then what comes through it.
 else if(t==='breaching'){banner(e.b.name,e.b.id==='gym'?'Something\'s hitting the doors':e.b.id==='drain'?'Something\'s under the grate':'They\'re coming through');audio.play('groan',{voice:0,vol:.7});buzz(50);if(device==='pad')pad.rumble(.4,.3,200);}
 else if(t==='breach'){if(e.b.id==='gym'){audio.play('gun-thump',{size:1});audio.play('zombie-hit');buzz(120);if(device==='pad')pad.rumble(.8,.6,400);}else if(e.b.id==='drain'){audio.play('casing',{kind:1,vol:1});audio.play('groan',{voice:1,vol:.8},.2);buzz(40);}else{audio.play('groan',{voice:2,vol:.8});buzz(40);}}
 else if(t==='evac'){say.radio(SCRIPT.air.called);audio.play('groan',{voice:0,vol:.5},.6);buzz(60);if(device==='pad')pad.rumble(.5,.5,300);}
 else if(t==='truck'){if(homeKit.phase!=='own')banner('Truck inbound','Headlights at the east end');buzz(30);}
 else if(t==='truckin'){banner('Truck is here','Get in the back');buzz(80);if(device==='pad')pad.rumble(.4,.4,300);}
 else if(t==='extract'){paintKit();setTimeout(()=>debrief(e.stats),900);banner('You made it out','');}
 else if(t==='windup')audio.play('groan',{voice:e.big?0:2,vol:far(e.z,e.big)},.5);
 else if(t==='charge'){audio.play('groan',{voice:0,vol:far(e.z,true)});if(Math.hypot(e.z.x-streetModel.x,e.z.y-streetModel.y)<300){buzz(40);if(device==='pad')pad.rumble(.5,.4,300);}}
 else if(t==='stun'){audio.play('gun-thump',{size:1,vol:far(e.z,true)});audio.play('zombie-hit',{vol:far(e.z,true)});}
 else if(t==='lunge')audio.play('groan',{voice:2,vol:far(e.z,true)},.2);
 else if(t==='overrun'){say.radio(SCRIPT.air.overrun);audio.play('groan',{voice:0,vol:.9});audio.play('groan',{voice:2,vol:.8},.25);audio.play('groan',{voice:1,vol:.7},.5);buzz(160);if(device==='pad')pad.rumble(.8,.8,600);}
 else if(t==='death')startWatch();
 else if(t==='rose'){audio.play('groan',{voice:1,vol:1},.1);buzz(40);}
 else if(t==='watched')endWatchSoon();
 else if(t==='fallen'){addRemains(e.z);buzz(30);sayLines(SCRIPT.fallen);}
 else if(t==='reclaimed'){paintKit();buzz(20);toast('In your bag: '+e.text);sayLines(SCRIPT.reclaimed,{then:()=>say.radio(SCRIPT.air.leaving)});}
 else if(t==='reborn'){paintKit();lastTarget=undefined;}}
// The end of night one, seen by someone else: through the window across the street, him going down, lying there, and getting up.
// The street keeps playing underneath; the window is a frame painted over it (street/watch.js). Then the creator, for the one who
// was watching, and out of their door with their own pistol (home/kit.js reborn, street/fight.js reborn).
function startWatch(){if(watch)return;endTalk();resetInput();if($('bag').open)closeDialog('bag');if($('options').open)closeDialog('options');
 watch={t:0,out:0,line:-1};document.body.classList.add('watching');const cv=$('watch');cv.hidden=false;sizeWatch();
 audio.play('bite');audio.play('groan',{voice:0,vol:1},.15);audio.play('groan',{voice:2,vol:.9},.4);buzz(200);if(device==='pad')pad.rumble(1,1,700);paintCine({say:''});}
function sizeWatch(){const cv=$('watch'),r=cv.getBoundingClientRect(),w=Math.max(80,Math.round((r.width||innerWidth)/3)),h=Math.max(60,Math.round((r.height||innerHeight)/3));if(cv.width!==w||cv.height!==h){cv.width=w;cv.height=h;}}
function paintWatch(now,f){if(!watch)return;if(f.dead)watch.t=f.dead.t;const t=watch.t;sizeWatch();
 const fade=watch.out?Math.max(0,1-(now-watch.out)/900):1,open=Math.max(0,Math.min(1,(t-1)/1.2))*fade;paintWindow($('watch').getContext('2d'),t,open);
 let i=-1;SCRIPT.window.forEach(([at],k)=>{if(t>=at)i=k;});if(watch.out)i=-2;if(i>watch.line){watch.line=i;const [,who,text]=SCRIPT.window[i];sayLines([[who,text]]);}}
// The first time out on the street: the camera goes down the road to the cruiser in the pole while he takes it in, then back.
let arrival=null,arrived=false;const copAt=()=>streetScene?.fight.zombies.find(z=>z.look==='cop'&&z.idle);
function arrive(now){if(arrival===null||now-arrival<900||paused())return;arrival=null;const c=copAt();
 if(arrived||!c||homeKit.phase==='own'||homeKit.street!=='start')return;arrived=true;lookAt({x:c.x-60,y:c.y-40,z:1.1,secs:1.8},[...SCRIPT.cruiser.see,...SCRIPT.cruiser.empty]);}
// A moment on the street: the bars come in, the camera goes to p, the lines are read, and it all comes back to you.
// However the lines end (read, or cut short by a fall or a skip), the camera and the bars come back (endLook, on the box closing).
let endLook=null;function lookAt(p,lines,then){const s=streetScene;if(s&&p)s.focus=p;document.body.classList.add('cine');$('cine').hidden=false;$('cineSkip').hidden=true;
 endLook=()=>{if(s)s.focus=null;$('cineSkip').hidden=false;if(!homeScene?.wake&&!watch)paintCine(null);};sayLines(lines,{then});}
// The title card: a few seconds of a name over black, for the start of the night and for the one who watched.
let titleT=0;function showTitle(title,sub='',ms=3000){const el=$('titleCard');el.querySelector('b').textContent=title;el.querySelector('span').textContent=sub;el.hidden=false;el.classList.remove('on');void el.offsetWidth;el.classList.add('on');el.style.setProperty('--title-ms',ms+'ms');clearTimeout(titleT);titleT=setTimeout(()=>{el.hidden=true;},ms);}
// The Guard on the radio while you hold out: the minute call, once per call.
let aired=null;function airTick(f){const v=f.evac;if(v?.state==='hold'&&v.el>=10&&aired!==v){aired=v;say.radio(SCRIPT.air.minute);}}
function endWatchSoon(){if(!watch||watch.out)return;watch.out=performance.now();setTimeout(openFirst,1100);}
function skipWatch(){if(!watch||firstSurvivor)return;say.stop();watch.out=watch.out||performance.now()-900;openFirst();}
function endWatch(){if(!watch&&!firstSurvivor)return;watch=null;firstSurvivor=false;document.body.classList.remove('watching','first-survivor');$('watch').hidden=true;paintCine(null);$('inspectTitle').textContent='Character creator';$('returnRoom').textContent='Done';}
// The window goes dark on him, the title asks who was watching, and the creator opens on them.
function openFirst(){if(!watch||firstSurvivor)return;firstSurvivor=true;say.stop();showTitle('Who are you?','',2600);setTimeout(()=>{if(!firstSurvivor)return;document.body.classList.add('first-survivor');paintCine(null);if(appearance.zombie)creator.setKind('survivor');
 $('inspectTitle').textContent='Who are you?';$('returnRoom').textContent='This is me';openDialog('inspection');inspectDirection=2;lastInspect=0;creator.show('body');},2200);}
function finishFirst(){if(!firstSurvivor)return;const f=streetScene?.fight,b=f?.dead?.body;
 homeKit=reborn(homeKit,{x:b?b.x:streetModel.x,y:b?b.y:streetModel.y,dir:b?.direction});homeKit={...homeKit,bag:refit(homeKit.bag,packGrid())};saveHome(storage,homeKit);
 firstSurvivor=false;closeDialog('inspection',true);endWatch();f?.reborn();streetScene?.setPlayerLook(heroLook());thoughts.note('reborn');paintKit();
 sayLines(SCRIPT.turn);}
$('inspection').addEventListener('cancel',e=>{if(firstSurvivor)e.preventDefault();});$('inspection').addEventListener('close',()=>{if(firstSurvivor)finishFirst();});
// Where he fell the second time: his gear, to search.
function addRemains(z){let t=STREET_TARGETS.find(o=>o.remains);if(!t){t={id:'remains',kind:'object',remains:true,verb:'Search',name:'What is left of him',role:'Your gear'};STREET_TARGETS.push(t);}Object.assign(t,{x:z.x,y:z.y,mx:z.x,my:z.y-30,range:36});lastTarget=undefined;}
// The first job's briefing, over the cruiser's radio once the street is quiet.
function brief(){if(!street()||homeKit.street!=='done'||homeKit.mission?.done.length)return;if(talk||paused()||say.open()){setTimeout(brief,2000);return;}audio.play('remote-click');sayLines(SCRIPT.radio);}
// On the truck: how the night went, then the ride to Firelight Camp.
function debrief(st){const m=Math.floor(st.time/60),sec=Math.floor(st.time%60),rows=[['Time out there',`${m}:${String(sec).padStart(2,'0')}`],['The dead put down',st.kills],['Shots fired',st.shots],['Places searched',st.found],['Times you went down',st.downs]];
 $('summaryStats').innerHTML=rows.map(([k,v])=>`<div><dt>${k}</dt><dd>${v}</dd></div>`).join('');openDialog('summary');$('summaryGo').focus({preventScroll:true});}
$('summaryGo').onclick=()=>{$('summary').close();travel('camp');};
// A step's line: one line of his goes by over his head, more open the box.
const PART_NAME={battery:'the car battery',fuel:'the gas can'};function chainLines(L){if(!L)return;if(L.length===1&&L[0][0]==='marcus')thoughts.push(L[0][1]);else sayLines(L);}
// Where the jobs are: a mark over each one still to do (and the call, then the truck), pinned to the edge of the screen with an
// arrow and how far, when it is off it.
const MARK_ICON={radio:'Radio',power:'Generator',supplies:'Go-bag',evac:'Call the truck',board:'Truck',risen:'Him',remains:'His gear'};
function paintMarks(s){const box=$('marks'),f=s.fight,k=homeKit;let list=[];
 if(k.phase==='own'&&!f.down){const b=f.zombies.find(z=>z.kind==='risen'&&z.hp>0);if(b)list=[{job:'risen',x:b.x,y:b.y,mx:b.x,my:b.y-40}];else if(f.remains&&!k.corpse?.taken)list=STREET_TARGETS.filter(t=>t.remains);else list=STREET_TARGETS.filter(t=>t.job==='board'&&f.can(t));}
 else if(f.warn&&f.evac&&!f.overrun&&f.warn.t<BREACH.warn+6&&!f.down)list=[{mark:f.warn.b.short,x:f.warn.b.x,y:f.warn.b.y,mx:f.warn.b.x,my:f.warn.b.y-30}];
 else if(k.street==='done'&&k.mission&&!k.mission.out&&!f.down)list=[...STREET_TARGETS.filter(t=>t.mark&&t!==s.target&&f.can(t)),...f.jobs.marks()];
 if(!list.length){if(!box.hidden){box.hidden=true;box.innerHTML='';}return;}box.hidden=false;
 const cam=s.cameras.main,b=game.canvas.getBoundingClientRect(),sc=b.width/s.scale.width*cam.zoom,v=cam.worldView,W=b.width,H=b.height,pad=34;
 // Marks pinned to the top edge stay clear of the readout over the street.
 const hud=$('drillHud'),top=Math.max(pad+40,!hud.hidden&&!document.body.classList.contains('deck')?hud.getBoundingClientRect().bottom-b.top+30:0);
 while(box.children.length<list.length){const d=document.createElement('div');d.className='mark';d.innerHTML='<i></i><b></b><span></span>';box.appendChild(d);}while(box.children.length>list.length)box.lastChild.remove();
 list.forEach((t,i)=>{const d=box.children[i],x=((t.mx??t.x)-v.x)*sc,y=((t.my??t.y)-14-v.y)*sc,on=x>pad&&x<W-pad&&y>top&&y<H-pad,dist=Math.round(Math.hypot(t.x-streetModel.x,t.y-streetModel.y)/40);
  const cx=W/2,cy=H/2,dx=x-cx,dy=y-cy,k=on?1:Math.min((W/2-pad)/Math.abs(dx||1),((dy<0?cy-top:H/2-pad-20))/Math.abs(dy||1)),px=cx+dx*k,py=cy+dy*k;
  d.classList.toggle('edge',!on);d.style.transform=`translate(${Math.round(px)}px,${Math.round(py)}px)`;d.children[0].style.transform=on?'':`rotate(${Math.atan2(dy,dx)}rad)`;
  d.children[1].textContent=t.mark||MARK_ICON[t.job||(t.remains?'remains':'')];d.children[2].textContent=on&&dist<4?'':dist+' m';});}
// The readout over the street: what is happening, how many are left, and your health once the fight is on.
// The district you are in names the place in the corner.
let streetHudShown=null;function streetHud(f){const area=areaAt(streetModel.x,streetModel.y);if(area&&area!==areaShown){areaShown=area;$('placeName').innerHTML=`${AREA_NAMES[area]} <i>Night one</i>`;}
 const n=f.threat().length,pct=Math.round(f.hp/f.maxHp*100),fighting=n>0,deckGoal=document.body.classList.contains('deck')&&goal(homeKit,true);
 // On the portrait deck the goal lives here too, since the deck's corner is the weapon panel's.
 const ev=f.evac,clock=v=>{const c=Math.ceil(v);return `${Math.floor(c/60)}:${String(c%60).padStart(2,'0')}`;};
 // A fix under way shows its dial (the cursor is moved below, every frame); the hold, how long the light still has to burn.
 const J=f.jobs,fx=!f.down&&J.view(),hold=!f.down&&J.on()&&stepOf(homeKit,'power')==='hold',carry=homeKit.mission?.carry,many=n?`<span>${plural(n,'zombie')}</span>`:'';
 const top=f.down?'<b>Down</b><span>Back to your step</span>':ev&&!ev.paused?(ev.state==='hold'?`<b>Hold out</b><span>Truck in ${clock(Math.max(0,ev.t))}</span>${many}`:ev.state==='drive'?'<b>Truck</b><span>Pulling in</span>':'<b>Truck is here</b><span>Get in the back</span>'):
  fx?`<b>${fx.title}</b><span>${fx.hint}</span>`:hold?`<b>Hold the light</b><span>${J.near?clock(HOLD.time-J.hold):'Get back to it'}</span>${many}`:fighting?`<b>Contact</b><span>${plural(n,'zombie')}</span>`:carry?`<b>Carrying</b><span>${PART_NAME[carry]}</span>`:pct<100?'<b>Hurt</b><span>It will close up</span>':deckGoal?`<b>Goal</b><span>${deckGoal}</span>`:'';
 const dial=fx?`<div class="fix ${fx.kind}"><i>${fx.zone?`<i class="zone" style="left:${(fx.zone[0]*100).toFixed(1)}%;width:${((fx.zone[1]-fx.zone[0])*100).toFixed(1)}%"></i><i class="cur"></i>`:`<i class="fill" style="width:${Math.round(fx.cur*100)}%"></i>`}</i><span class="dots">${Array.from({length:fx.of},(_,i)=>`<i${i<fx.done?' class="on"':''}></i>`).join('')}</span></div>`
  :hold?`<div class="fix hold"><i><i class="fill" style="width:${Math.floor(J.hold/HOLD.time*100)}%"></i></i></div>`:'';
 const bar=fighting||f.down||pct<100?`<div class="vitals"><i class="hp${pct<=30?' low':''}" role="img" aria-label="Health ${Math.round(f.hp)} of ${f.maxHp}"><i style="width:${pct}%"></i></i></div>`:'';
 // The heat, once you have made any noise: how loud you have been, and what that is bringing.
 // While a swarm is on you the meter holds still and counts down what is left of it instead.
 const lv=f.level,sl=f.swarmLeft(),heat=f.heat>1?`<div class="heat h${lv}"><b>${sl?`Swarm · ${sl} left`:HEAT.names[lv]}</b><i role="img" aria-label="Heat ${Math.round(f.heat)} of 100"><i style="width:${Math.round(f.heat)}%"></i></i></div>`:'';
 const html=top||heat?`${top?`<div class="row">${top}</div>`:''}${dial}${bar}${heat}`:'';
 if(html!==streetHudShown){streetHudShown=html;const h=$('drillHud');h.innerHTML=html;h.hidden=!html;}
 if(fx?.zone){const c=$('drillHud').querySelector('.fix .cur');if(c)c.style.left=(fx.cur*100).toFixed(1)+'%';}}
// The Use prompt floats over whatever is in reach.
function placePrompt(s,t){const pr=$('prompt'),cam=s.cameras.main,b=game.canvas.getBoundingClientRect(),k=b.width/s.scale.width,v=cam.worldView,x=((t.mx??t.x)-v.x)*cam.zoom*k,y=((t.kind==='resident'?t.y-118:t.my-2)-v.y)*cam.zoom*k;pr.style.transform=`translate(${Math.round(x)}px,${Math.round(y)}px) translate(-50%,-100%)`;}
// On the range the shooting controls stay put, so the prompt itself is the button on a touch screen.
function roomPrompt(s){const t=s.target,show=!!t&&!paused()&&!calm(),pr=$('prompt'),dock=docked();if(t!==lastTarget){lastTarget=t;const verb=t?verbOf(t):'Use';$('promptVerb').textContent=$('actVerb').textContent=verb;$('promptName').textContent=$('actName').textContent=t?t.short||t.name:'';$('act').setAttribute('aria-label',t?verb+': '+t.name:'Nothing to use here');}
 // On the portrait console the Use key in the bottom row does the job, so nothing floats over the game.
 $('act').hidden=!dock||(ccOn()&&!show);$('act').classList.toggle('idle',!show);pr.hidden=!show||dock;pr.classList.toggle('tap',show&&touch());if(show&&!dock)placePrompt(s,t);}
$('prompt').addEventListener('pointerdown',e=>{if(calm()||!touch())return;e.preventDefault();e.stopPropagation();interact();});
// Controller: polled every frame whatever is open. Dialogs and panels are walked with the D-pad and A; B backs out.
const zeroPad=()=>({move:{x:0,y:0},aim:{x:0,y:0},fire:false,run:false});let padRun=false;
function focusNav(box,P){const step=P.down||P.right?1:P.up||P.left?-1:0;if(!step)return;const list=[...box.querySelectorAll('button:not([disabled]),summary,a[href],input,[tabindex]:not([tabindex="-1"])')].filter(el=>el.offsetParent!==null&&!el.closest('[hidden]'));if(!list.length)return;const i=list.indexOf(document.activeElement);list[(i<0?0:(i+step+list.length)%list.length)].focus({preventScroll:false});}
function padLoop(){globalThis.requestAnimationFrame?.(padLoop);const st=pad.poll();if(!st)return;if(st.any)setDevice('pad');if(device!=='pad')return;const P=st.pressed,D=st.down;
 if($('bag').open){padState=zeroPad();if(!bagUI.pad(P))closeDialog('bag');return;}
 const dlg=['inspection','options','shop'].map($).find(d=>d.open);
 if(dlg){padState=zeroPad();if(P.b||(P.start&&dlg.id==='options')||(P.back&&dlg.id==='inspection')){closeDialog(dlg.id);return;}if(document.activeElement===$('fireAt')&&(P.left||P.right)){setFireAt(fireAt+(P.right?.05:-.05));return;}focusNav(dlg,P);if(P.a&&dlg.contains(document.activeElement))document.activeElement.click();return;}
 if(say.open()&&P.a){padState=zeroPad();say.tap();return;}if(say.holding()&&!watch&&!(P.start||P.b)){padState=zeroPad();return;}
 if(watch){padState=zeroPad();if(P.start||P.b)skipWatch();return;}
 if(P.start){endTalk();openDialog('options');return;}if(P.back){endTalk();openDialog('inspection');return;}if(P.up&&(calm()||street())&&!talk&&openBag())return;if(P.r3)cycleZoom();
 if(talk){padState=zeroPad();if(talk.menu)focusNav($('talk'),P);if(P.a)nextLine();if(P.b)endTalk();return;}
 if(calm()){
  if(play.cooking){padState=zeroPad();const box=$('cookPanel');focusNav(box,P);if(P.a){const f=document.activeElement;if(f?.tagName==='BUTTON'&&box.contains(f))f.click();else play.press(true);}if(P.b)play.escape();return;}
  if(play.fishing){if(P.a)play.press(true);if(st.released.a)play.press(false);}else if(P.a&&!paused())interact();
  if(P.b&&play.active())play.escape();}
 else if(!paused()){if(P.a)interact();if(P.x)doReload();if(P.y||P.right)swapGun(1);if(P.left)swapGun(-1);if(P.rb||P.lb)doThrow();if(P.down&&street())toggleLight();if(P.b&&street())askDive();}
 if(paused()){padState=zeroPad();return;}
 // L3 toggles running until the stick comes back to rest; holding LT runs too.
 const L=st.left,R=st.right;if(P.l3)padRun=!padRun;if(!L.m)padRun=false;
 padState={move:{x:L.x,y:L.y},aim:R.m>PAD.aim?{x:R.x/R.m,y:R.y/R.m}:{x:0,y:0},fire:R.m>PAD.fire||D.rt,run:padRun||D.lt};}
globalThis.requestAnimationFrame?.(padLoop);
// The full controls list in the menu, for all three ways to play.
const CONTROLS=[['Move','WASD or arrows','Left stick','Left thumb'],['Run','Shift','LT, or click L3','Run button (stays on until tapped)'],['Dive (the street)','C','B','Dive'],['Aim','Mouse','Right stick','Right stick'],['Fire','Click or Space','Push the right stick, or RT','Push the right stick all the way (menu: Stick fires at)'],['Reload','R','X','Reload'],['Grenade (not on the street)','G','RB or LB','Grenade'],['Flashlight (the street)','F','D-pad down','Light'],['Swap weapon','Q, wheel or 1–5','Y or D-pad','Swap'],['Use or talk','E','A','Big button'],['Back','Esc','B','×'],['Bag (the house and street)','Tab','D-pad up','Top right'],['Character','I','View ⧉','Top right'],['Menu','Esc','Menu ☰','Top right'],['Camera zoom','Z','R3','Menu']];
$('controlsRef').innerHTML='<table><thead><tr><th></th><th>Keyboard &amp; mouse</th><th>Controller</th><th>Touch</th></tr></thead><tbody>'+CONTROLS.map(([a,...r])=>`<tr><th>${a}</th>${r.map(c=>`<td>${c}</td>`).join('')}</tr>`).join('')+'</tbody></table>';
showPlace();paintZoom();
// Movement uses the real time between frames. Phaser's smoothing holds every step to a 60 fps frame for about 120 frames after
// the page gains focus or wakes, which made the first few seconds of walking slow on phones that draw fewer frames than that.
if(typeof Phaser==='undefined')$('loading').innerHTML='Could not load the room.<span>Please refresh to try again.</span>';else{leanTextures();game=new Phaser.Game({type:Phaser.AUTO,parent:'game',width:innerWidth*RES,height:innerHeight*RES,backgroundColor:'#141311',pixelArt:false,fps:{smoothStep:false},roundPixels:false,antialias:true,resolution:Math.min(2,devicePixelRatio||1),render:{antialias:true,pixelArt:false,roundPixels:false},scene:[makeStudyScene(model,bridge),makeCampScene(campModel,campBridge),makeHomeScene(homeModel,homeBridge),makeStreetScene(streetModel,streetBridge)],audio:{noAudio:true},banner:false});resize();}
