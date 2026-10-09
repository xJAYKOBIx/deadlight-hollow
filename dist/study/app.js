import {GUNS,GRENADES,readLoadout,saveLoadout} from './equipment.js';
import {PadInput,PAD} from '../pad.js';
import {readAppearance,saveAppearance} from './appearance.js';
import {createCreator} from './creator.js';
import {StudyModel} from './model.js';import {makeStudyScene} from './scene.js';import {DIRECTIONS} from './character.js';import {FloatingStick} from '../layout.js';
import {CampModel} from '../camp/model.js';import {makeCampScene} from '../camp/scene.js';import {PROPS,MAX_CAMPERS} from '../camp/data.js';import {PROP_PAD} from '../camp/art.js';import {createCampPlay} from '../camp/play.js';
import {readCompanion,saveCompanion,normalizeCompanion,petLook,displayName} from '../companion/look.js';import {pet,PET_FRAME,PET_ANIM} from '../companion/pet.js';import {Follower,FOLLOW} from '../companion/follow.js';
const $=id=>document.getElementById(id),model=new StudyModel(),campModel=new CampModel(),keys=new Set(),stick=new FloatingStick();let game,scene,ready=false,move={x:0,y:0},running=false,padState={move:{x:0,y:0},aim:{x:0,y:0},fire:false,run:false},zoomIndex=0,inspectDirection=1,pose='idle',lastInspect=0,contextMissing=false;const zooms=[1,1.5,2];
let storage;try{storage=window.localStorage;}catch{}let appearance=readAppearance(storage),loadout=readLoadout(storage);
// Where the survivor is: the character room (a test space) or Firelight Camp. Remembered on this device.
const PLACE_KEY='deadlight-place-v1';let place='room',campScene=null,talk=null,play=null,reelPointer=null;try{if(storage?.getItem(PLACE_KEY)==='camp')place='camp';}catch{}
// In camp you are always your survivor, never the zombie from the creator.
let survivorLook=appearance.zombie?readAppearance(storage,'survivor'):appearance;let aim={x:0,y:0},firing=false,mouseFire=false,mousePoint=null;
const SAVE_FAIL='Active for this visit. Saving is unavailable on this device.';
// Zombies are unarmed in the room: no gun, no grenades, and the shooting controls step aside.
const gear=()=>appearance.zombie?{...loadout,gun:'none'}:loadout;let armedKind=!!appearance.zombie;
function syncKind(){document.body.classList[appearance.zombie?'add':'remove']('zombie');model.zombie=!!appearance.zombie;showHelp();if(armedKind!==!!appearance.zombie){armedKind=!!appearance.zombie;scene?.practice.equip(gear());}}
// Camp draws an unarmed survivor; the room and the creator preview draw the full creator look.
function renderActor(){if(place==='camp'&&!$('inspection').open)campScene?.setPlayerLook(survivorLook);else scene?.setAppearance(appearance);}
function applyAppearance(){if(!appearance.zombie)survivorLook=appearance;syncKind();renderActor();lastInspect=0;paintInspection(performance.now());$('lookSaveStatus').textContent=saveAppearance(storage,appearance)?'Look saved on this device.':SAVE_FAIL;creator.refresh();}
function paintGear(){const n=loadout.grenade==='incendiary'?'Firebomb':loadout.grenade==='explosive'?'Frag':'Smoke';$('grenadeName').textContent=$('grenadeLabel').textContent=n;$('grenadeDot').style.background=GRENADES[loadout.grenade]?.color||'';$('throwGrenade').setAttribute('aria-label','Throw '+n);}
function equip(){scene?.practice.equip(gear());renderActor();lastInspect=0;paintGear();$('lookSaveStatus').textContent=saveLoadout(storage,loadout)?'Gear saved on this device. Practice reserves are unlimited.':SAVE_FAIL;creator.refresh();}
// Your companion: chosen in the creator, following you in camp and in the room.
let companion=readCompanion(storage),petDirty=false;
function setCompanion(c,{name=false}={}){companion=normalizeCompanion(c);$('lookSaveStatus').textContent=saveCompanion(storage,companion)?'Companion saved on this device.':SAVE_FAIL;if(!name){petDirty=true;creator.refresh();lastInspect=0;paintInspection(performance.now());}lastTarget=null;}
const creator=createCreator({$,storage,look:()=>appearance,setLook:l=>{appearance=l;applyAppearance();},loadout:()=>loadout,setLoadout:l=>{loadout=l;equip();},companion:()=>companion,setCompanion});
creator.refresh();paintGear();if(!storage)$('lookSaveStatus').textContent=SAVE_FAIL;
$('equipment').onclick=()=>{if($('options').open)closeDialog('options');openDialog('inspection');creator.show('gear');};
// Right-thumb actions. Each is shared by the touch fan, the keyboard and the controller.
const GUN_IDS=Object.keys(GUNS);
function buzz(ms){try{if(touch&&device!=='pad')navigator.vibrate?.(ms);}catch{}}
function doReload(){if(paused()||appearance.zombie||place==='camp')return;const p=scene.practice,before=p.reloadTime;p.reload();if(!before&&p.reloadTime){buzz(12);pad.rumble(.1,.2,60);}}
function doThrow(){if(paused()||appearance.zombie||place==='camp')return;if(scene.practice.throwGrenade()){buzz(25);pad.rumble(.45,.6,140);}}
// Swap cycles through every gun: the room is a practice range with unlimited reserves.
function swapGun(step=1,to=null){if(paused()||appearance.zombie||place==='camp')return;const i=GUN_IDS.indexOf(loadout.gun),next=to??GUN_IDS[((i<0?-1:i)+step+GUN_IDS.length)%GUN_IDS.length];if(!next||next===loadout.gun)return;loadout={...loadout,gun:next};equip();buzz(10);pad.rumble(.05,.25,50);const h=$('weaponHud');h.classList.remove('swapped');void h.offsetWidth;h.classList.add('swapped');}
// Pointer presses act on pointerdown for speed; a click with no pointer behind it (Enter, Space, a controller, a script) still works.
const pressedAt={};for(const [id,fn] of [['reload',doReload],['throwGrenade',doThrow],['swapGun',()=>swapGun(1)]]){$(id).addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();pressedAt[id]=performance.now();$(id).classList.add('down');fn();});$(id).onclick=e=>{if(e?.pointerType||performance.now()-(pressedAt[id]??-1e9)<800)return;fn();};}
for(const id of ['reload','throwGrenade','swapGun'])for(const n of ['pointerup','pointercancel','pointerleave'])$(id).addEventListener(n,()=>$(id).classList.remove('down'));
const touch=matchMedia('(pointer:coarse)').matches||navigator.maxTouchPoints>0;if(touch)document.body.classList.add('touch');
// The last thing you touched decides which prompts show: keys, a controller's buttons, or the touch controls.
let device=touch?'touch':'keys';const pad=new PadInput();
// A short hint for the current place and device. It fades after a few seconds; the full list is in the menu under Controls.
const HELP={keys:{room:'WASD move · Shift run · Mouse aim · Click fire · R reload · Q or wheel swap · G grenade · Esc menu',camp:'WASD move · Shift run · E use or talk · I character · Esc menu',zombie:'WASD shamble · Shift lurch · I character · Esc menu'},
 pad:{room:'Left stick moves · Right stick aims and fires · RB grenade · X reload · Y swap · ☰ menu',camp:'Left stick moves · LT runs · A uses or talks · ☰ menu',zombie:'Left stick shambles · LT lurches · ☰ menu'},
 touch:{room:'Left thumb moves, push to the edge to run · Right stick aims and fires',camp:'Left thumb moves, push to the edge to run · Tap the big button to use or talk',zombie:'Left thumb shambles, push to the edge to lurch'}};
let helpTimer=0;function showHelp(){const k=place==='camp'?'camp':appearance.zombie?'zombie':'room',el=$('instructions');el.textContent=HELP[device][k];el.classList.remove('fade');clearTimeout(helpTimer);helpTimer=setTimeout(()=>el.classList.add('fade'),device==='touch'?6000:9000);}
function setDevice(d){if(device===d)return;device=d;document.body.classList.toggle('pad',d==='pad');for(const k of document.querySelectorAll('kbd[data-key]')){k.textContent=d==='pad'?k.dataset.pad:k.dataset.key;k.dataset.glyph=d==='pad'?k.dataset.pad:'';}showHelp();lastTarget=null;}
syncKind();
function halted(){return !ready||document.hidden||contextMissing||$('inspection').open||$('options').open;}
function paused(){return halted()||!!talk||!!play?.cooking;}
function resetInput(){if(play?.fishing)play.press(false);reelPointer=null;mousePoint=null;aim={x:0,y:0};firing=false;mouseFire=false;aimPointer=null;$('aimZone').classList.remove('active','firing');$('aimThumb').style.transform='';keys.clear();move={x:0,y:0};running=false;stick.end();$('moveZone').classList.remove('active','sprint');$('ring').style.left=$('ring').style.top='';$('thumb').style.transform='';padState={move:{x:0,y:0},aim:{x:0,y:0},fire:false,run:false};}
function openDialog(id){resetInput();if(id==='inspection'){inspectDirection=(place==='camp'?campModel:model).direction;pose='idle';setPose('idle');}$(id).showModal();if(id==='inspection'){if(place==='camp')renderActor();creator.refresh();lastInspect=0;paintInspection(performance.now());if(!inspectLoop)inspectLoop=globalThis.requestAnimationFrame?.(loopInspection)||0;}}
function closeDialog(id){$(id).close();resetInput();if(id==='inspection'&&place==='camp')renderActor();if(id==='inspection')refreshPet();}
// The companion sheet is repainted once the creator closes, not on every click.
function refreshPet(){if(!petDirty)return;petDirty=false;const l=petLook(companion);campScene?.setPetLook(l);scene?.setPetLook?.(l);}
$('inspect').onclick=()=>openDialog('inspection');$('menu').onclick=()=>openDialog('options');$('resume').onclick=()=>closeDialog('options');
// Menu entries that lead elsewhere close the pause menu first.
const fromMenu=fn=>()=>{if($('options').open)closeDialog('options');fn();};$('inspectMenu').onclick=fromMenu(()=>openDialog('inspection'));$('closeInspect').onclick=$('returnRoom').onclick=()=>closeDialog('inspection');$('closeOptions').onclick=()=>closeDialog('options');for(let id of ['inspection','options'])$(id).addEventListener('close',resetInput);
function cycleZoom(){zoomIndex=(zoomIndex+1)%zooms.length;const zl=$('zoom').firstChild;if(zl)zl.textContent='Camera '+zooms[zoomIndex]+'× ';}$('zoom').onclick=cycleZoom;
$('reset').onclick=()=>{if(place==='camp'){play.stop();campModel.reset();heel(campPet,campModel);}else{model.reset();scene?.practice.reset();heel(roomPet,model);}closeDialog('options');};
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
function paintInspection(now){if(!scene||now-lastInspect<60)return;lastInspect=now;const c=$('portrait').getContext('2d');c.clearRect(0,0,280,360);c.imageSmoothingEnabled=false;if(creator.mode?.()==='pet'){petPreview(c,now);return;}if(pose==='sit')pose='idle';const z=appearance.zombie;let f=pose==='idle'?0:(pose==='run'?9:1)+Math.floor(now/(pose==='run'?(z?80:60):(z?125:85)))%8;c.drawImage(scene.textures.get('survivor-01').canvas,inspectDirection*160+10,f*192+4,140,180,0,0,280,360);$('direction').textContent=DIRECTIONS[inspectDirection];$('portrait').setAttribute('aria-label',DIRECTIONS[inspectDirection]+' view, '+pose+' animation');}
const zone=$('moveZone');function paintStick(v){$('ring').style.left=v.baseX+'px';$('ring').style.top=v.baseY+'px';$('thumb').style.transform=`translate(-50%,-50%) translate(${v.thumbX}px,${v.thumbY}px)`;}
zone.addEventListener('pointerdown',e=>{if(paused()||stick.pointer!==null)return;e.preventDefault();let b=zone.getBoundingClientRect();stick.start(e.pointerId,e.clientX-b.left,e.clientY-b.top,{w:b.width,h:b.height},56,40);zone.setPointerCapture(e.pointerId);zone.classList.add('active');paintStick({baseX:stick.base.x,baseY:stick.base.y,thumbX:0,thumbY:0});});
// Push the stick to its edge to run; ease off a little to walk again.
const RUN_AT=37,WALK_AT=29;
zone.addEventListener('pointermove',e=>{let b=zone.getBoundingClientRect(),v=stick.move(e.pointerId,e.clientX-b.left,e.clientY-b.top);if(!v)return;e.preventDefault();paintStick(v);let d=Math.hypot(v.dx,v.dy),power=Math.min(1,Math.max(0,(d-4)/33));move={x:d?v.dx/d*power:0,y:d?v.dy/d*power:0};const run=running?d>WALK_AT:d>RUN_AT;if(run!==running){running=run;zone.classList.toggle('sprint',run);if(run)buzz(8);}});
for(let name of ['pointerup','pointercancel','lostpointercapture'])zone.addEventListener(name,e=>{if(stick.end(e.pointerId)){move={x:0,y:0};running=false;zone.classList.remove('active','sprint');$('ring').style.left=$('ring').style.top='';$('thumb').style.transform='';}});
// The fire stick sits in a fixed place so the fan of buttons around it never moves. Push it to aim; past a small dead zone it fires.
const aimZone=$('aimZone'),AIM_TRAVEL=40,FIRE_AT=14;let aimPointer=null;
function aimFrom(e){const r=$('aimRing').getBoundingClientRect(),dx=e.clientX-(r.left+r.width/2),dy=e.clientY-(r.top+r.height/2),d=Math.hypot(dx,dy),k=Math.min(1,AIM_TRAVEL/(d||1));
 $('aimThumb').style.transform=`translate(-50%,-50%) translate(${dx*k}px,${dy*k}px)`;firing=d>FIRE_AT;aim=d>6?{x:dx/d,y:dy/d}:{x:0,y:0};aimZone.classList.toggle('firing',firing);}
aimZone.addEventListener('pointerdown',e=>{if(paused()||aimPointer!==null)return;e.preventDefault();mousePoint=null;aimPointer=e.pointerId;aimZone.setPointerCapture(e.pointerId);aimZone.classList.add('active');aimFrom(e);});
aimZone.addEventListener('pointermove',e=>{if(e.pointerId!==aimPointer)return;e.preventDefault();aimFrom(e);});
for(const name of ['pointerup','pointercancel','lostpointercapture'])aimZone.addEventListener(name,e=>{if(e.pointerId!==aimPointer)return;aimPointer=null;aim={x:0,y:0};firing=false;aimZone.classList.remove('active','firing');$('aimThumb').style.transform='';});
function connectMouse(s){const canvas=s.game.canvas;let wheelAt=0;canvas.addEventListener('wheel',e=>{if(place==='camp'||paused())return;e.preventDefault();const now=performance.now();if(now-wheelAt<180)return;wheelAt=now;swapGun(e.deltaY>0?1:-1);},{passive:false});window.addEventListener('pointermove',e=>{if(e.pointerType==='mouse')setDevice('keys');});window.addEventListener('pointerdown',e=>{if(e.pointerType==='touch')setDevice('touch');},true);const point=e=>{let b=canvas.getBoundingClientRect(),p=s.cameras.main.getWorldPoint((e.clientX-b.left)*s.scale.width/b.width,(e.clientY-b.top)*s.scale.height/b.height);mousePoint={x:(e.clientX-b.left)*s.scale.width/b.width,y:(e.clientY-b.top)*s.scale.height/b.height};aim={x:p.x-model.x,y:p.y+35-model.y};};canvas.addEventListener('pointermove',e=>{if(e.pointerType!=='touch'&&!paused()&&place!=='camp')point(e);});canvas.addEventListener('pointerdown',e=>{if(place==='camp'){if(play.fishing&&e.pointerType!=='touch'&&e.button===0&&!halted()){e.preventDefault();reelPointer=e.pointerId;play.press(true);return;}if(e.pointerType!=='touch'&&e.button===0&&!paused()&&campScene?.target){e.preventDefault();interact();}return;}if(e.pointerType==='touch'||e.button!==0||paused())return;e.preventDefault();point(e);mouseFire=true;canvas.setPointerCapture(e.pointerId);});for(const name of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(name,()=>{mouseFire=false;});}
window.addEventListener('keydown',e=>{let key=e.key.toLowerCase();setDevice(touch&&device==='touch'?'touch':'keys');if(['SELECT','INPUT','TEXTAREA','BUTTON'].includes(e.target?.tagName)&&($('inspection').open||$('options').open||(e.target.id==='talkNext'&&['enter',' '].includes(key))))return;if(['arrowup','arrowdown','arrowleft','arrowright',' '].includes(key)&&!paused())e.preventDefault();if(e.repeat)return;if(key==='i'&&!$('options').open){e.preventDefault();$('inspection').open?closeDialog('inspection'):openDialog('inspection');return;}if(key==='escape'){if(talk){e.preventDefault();endTalk();return;}if(play?.active()&&!halted()){e.preventDefault();play.escape();return;}resetInput();if(!paused()){e.preventDefault();openDialog('options');}return;}if(place==='camp'&&['e','enter',' '].includes(key)&&!$('inspection').open&&!$('options').open){if(talk){e.preventDefault();nextLine();return;}if(play.active()&&!halted()){e.preventDefault();if(play.cooking&&e.target?.tagName==='BUTTON'&&$('cookPanel').contains(e.target))e.target.click();else play.press(true);return;}if(!paused()){e.preventDefault();interact();return;}}if(key==='z'&&!paused()){cycleZoom();return;}if(place==='camp'&&!paused()){keys.add(key);return;}if(!paused()){if(key==='r')doReload();else if(key==='g')doThrow();else if(key==='q')swapGun(1);else if(/^[1-9]$/.test(key)&&GUN_IDS[key-1])swapGun(0,GUN_IDS[key-1]);else keys.add(key);}});window.addEventListener('keyup',e=>{const key=e.key.toLowerCase();keys.delete(key);if(play?.fishing&&['e','enter',' '].includes(key))play.press(false);});
for(const name of ['pointerup','pointercancel'])window.addEventListener(name,e=>{if(reelPointer===e.pointerId){reelPointer=null;play.press(false);}});window.addEventListener('blur',resetInput);document.addEventListener('visibilitychange',resetInput);
function resize(){let v=window.visualViewport,w=Math.round(v?.width||innerWidth),h=Math.round(v?.height||innerHeight);for(let [k,n]of Object.entries({'--vw':w,'--vh':h,'--vx':v?.offsetLeft||0,'--vy':v?.offsetTop||0}))document.documentElement.style.setProperty(k,n+'px');game?.scale.resize(w,h);resetInput();}
window.addEventListener('resize',resize);window.visualViewport?.addEventListener('resize',resize);window.visualViewport?.addEventListener('scroll',resize);document.addEventListener('fullscreenchange',resize);
// In the room the companion follows too, with the room's walls and furniture.
const roomBody=new StudyModel();roomBody.radius=FOLLOW.radius;const roomPet=new Follower((x,y)=>roomBody.blocked(x,y));heel(roomPet,model);
// The weapon panel: name, rounds left as a number and a bar, reload progress and the grenade timer. Written only when something changes.
let shown={};
function paintWeapon(p){const g=GUNS[loadout.gun],reload=g&&p.reloadTime?1-p.reloadTime/g.reload:0,cool=p.throwCooldown/1.5,ammo=g?p.ammo:0,key=[loadout.gun,ammo,Math.round(reload*40),Math.round(cool*30)].join();if(key===shown.key)return;
 if(g&&ammo<shown.ammo&&shown.gun===loadout.gun&&device==='pad')pad.rumble(g.rifle?.08:.15,.3,g.rifle?35:55);shown={key,ammo,gun:loadout.gun};
 $('weaponName').textContent=g?.name||'Unarmed';$('ammoNow').textContent=g?ammo:'–';$('ammoMag').textContent=g?'/ '+g.mag:'';$('magFill').style.width=(g?(p.reloadTime?reload:ammo/g.mag)*100:0)+'%';
 const low=g&&!p.reloadTime&&ammo<=Math.ceil(g.mag*.25),h=$('weaponHud');h.classList.toggle('low',!!low);h.classList.toggle('reloading',!!p.reloadTime);h.classList.toggle('empty',!!g&&!ammo&&!p.reloadTime);
 $('ammoWord').textContent=p.reloadTime?'Reloading':ammo?'Reload':'Empty · reload';
 $('reloadRing').style.setProperty('--p',p.reloadTime?reload:g?ammo/g.mag:0);$('reload').classList.toggle('busy',!!p.reloadTime);$('reload').classList.toggle('low',!!low);
 $('throwRing').style.setProperty('--p',cool?1-cool:1);$('throwFill').style.width=(cool?1-cool:1)*100+'%';$('throwGrenade').classList.toggle('busy',cool>0);}
const bridge={petLook:()=>petLook(companion),pet:()=>roomPet,petStep:dt=>{if(!halted())roomPet.update(dt,ownerOf(model));},paused,loadout:gear,appearance:()=>appearance,zoom:()=>zooms[zoomIndex],input:()=>{const pa=padState.aim;if(pa.x||pa.y){mousePoint=null;aim={x:pa.x,y:pa.y};}else if(mousePoint){const p=scene.cameras.main.getWorldPoint(mousePoint.x,mousePoint.y);aim={x:p.x-model.x,y:p.y+35-model.y};}return {x:move.x+padState.move.x+Number(keys.has('d')||keys.has('arrowright'))-Number(keys.has('a')||keys.has('arrowleft')),y:move.y+padState.move.y+Number(keys.has('s')||keys.has('arrowdown'))-Number(keys.has('w')||keys.has('arrowup')),run:running||padState.run||keys.has('shift'),aimX:aim.x,aimY:aim.y,fire:firing||mouseFire||padState.fire||keys.has(' ')};},ready:s=>{scene=s;ready=true;connectMouse(s);if(place==='camp')setTimeout(()=>travel('camp'));else $('loading').hidden=true;},tick:now=>{paintWeapon(scene.practice);if($('inspection').open)paintInspection(now);},contextLost:()=>{contextMissing=true;resetInput();$('status').textContent='Graphics paused. Waiting to reconnect…';},contextRestored:()=>{contextMissing=false;$('status').textContent='';}};

// Firelight Camp. Same movement and touch controls; Talk replaces the shooting controls.
const PLACES={room:{name:'Character room <i>01</i>',kicker:'CHARACTER ROOM / 0.22.0',go:'Camp',text:'Use these two rooms to judge the character’s shape, movement, and scale. The doorway on the right leads to three resetting practice targets. Equip weapons in Gear. Push the right stick (or hold the mouse) to aim and fire; the buttons around it reload, throw and swap. Practice reserves are unlimited.'},
 camp:{name:'Firelight Camp <i>Stage 1</i>',kicker:'FIRELIGHT CAMP / 0.22.0',go:'Room',text:'The first corner of Deadlight Hollow: a fire, a few tents and four survivors on the cave beach. Fish off the pier, then grill your catch at the campfire: a good meal means more stamina for running. Walk up to anything marked with an ember arrow to use it. Jobs, crafting and the gate come later.'}};
function showPlace(){const p=PLACES[place];$('coopBeds').hidden=place!=='camp';document.body.classList[place==='camp'?'add':'remove']('camp');$('placeName').innerHTML=p.name;$('travel').textContent='Go to '+p.go;$('travel').setAttribute('aria-label',place==='camp'?'Go to the character room':'Go to Firelight Camp');$('optionsKicker').textContent=p.kicker;$('optionsText').textContent=p.text;syncKind();$('prompt').hidden=true;$('act').hidden=true;}
function travel(to){if(!game||!ready)return;endTalk();play?.stop();resetInput();place=to;try{storage?.setItem(PLACE_KEY,to);}catch{}showPlace();
 if(to==='camp'){if(!campScene){$('loading').innerHTML='FIRELIGHT CAMP <span>Lighting the campfire…</span>';$('loading').hidden=false;}game.scene.sleep('CharacterRoom');game.scene.run('Camp');}else{game.scene.sleep('Camp');game.scene.run('CharacterRoom');renderActor();$('loading').hidden=true;}}
$('travel').onclick=()=>travel(place==='camp'?'room':'camp');
const verbOf=t=>t.kind==='resident'?'Talk':t.kind==='pet'?'Pet':play?.verb(t)||t.verb;
function interact(){const t=campScene?.target;if(!t||talk||play.active()||$('inspection').open||$('options').open)return;if(t.kind==='pet'){campPet.pet();return;}resetInput();if(play.use(t)){lastTarget=null;return;}talk={t,i:0,lines:play.lines(t)||t.lines};paintTalk();$('talkNext').focus({preventScroll:true});}
function paintTalk(){const {t,i}=talk;$('talk').hidden=false;document.body.classList.add('talking');$('talkName').textContent=t.name;$('talkRole').textContent=t.role;$('talkLine').textContent=talk.lines[i];$('talkNext').textContent=i<talk.lines.length-1?'Next':'Close';$('prompt').hidden=true;$('act').hidden=true;drawFace(t);}
function nextLine(){if(!talk)return;if(talk.i<talk.lines.length-1){talk.i++;paintTalk();}else endTalk();}
function endTalk(){if(!talk)return;talk=null;$('talk').hidden=true;document.body.classList.remove('talking');resetInput();lastTarget=null;}
// The speaker's face (or the thing you are looking at), cut from the art already on the GPU canvases.
function drawFace(t){const c=$('talkFace').getContext('2d');c.clearRect(0,0,160,160);c.imageSmoothingEnabled=false;
 if(t.kind==='resident'){const src=game.textures.get('camp-res-'+t.id).getSourceImage();c.drawImage(src,2*160+40,14,80,80,0,0,160,160);return;}
 const o=PROPS.find(p=>p.id===t.id),src=o&&game.textures.get('camp-'+o.id).getSourceImage();if(!src)return;const k=Math.min(150/src.width,150/src.height),w=src.width*k,h=src.height*k;c.drawImage(src,(160-w)/2,(160-h)/2,w,h);}
$('talkNext').onclick=nextLine;$('talk').addEventListener('pointerdown',e=>{if(e.target.id!=='talkNext'){e.preventDefault();nextLine();}});
$('act').addEventListener('pointerdown',e=>{e.preventDefault();if(play.fishing){if(halted())return;reelPointer=e.pointerId;$('act').setPointerCapture?.(e.pointerId);play.press(true);return;}interact();});
let lastTarget=null;
// Fishing, grilling and the stamina readout. While fishing, the stick steers the rod instead of the feet.
play=createCampPlay({$,storage,model:campModel,touch,scene:()=>campScene,afterChange:()=>{lastTarget=null;}});
// The companion's feet in camp: a body the size of a dog, so it slips between props the survivor cannot.
const petBody=new CampModel();petBody.radius=FOLLOW.radius;const campPet=new Follower((x,y)=>petBody.blocked(x,y));
function heel(f,m){const a=m.direction*Math.PI/4,s=f.spotNear(m.x-Math.cos(a)*FOLLOW.behind,m.y-Math.sin(a)*FOLLOW.behind);f.place(s.x,s.y,m.direction);}
heel(campPet,campModel);const petTarget={id:'pet',kind:'pet',range:40,facing:true};
const ownerOf=(m,busy=false)=>({x:m.x,y:m.y,direction:m.direction,moving:m.moving,running:m.running,busy});
const campInput=()=>{let x=move.x+padState.move.x+Number(keys.has('d')||keys.has('arrowright'))-Number(keys.has('a')||keys.has('arrowleft')),y=move.y+padState.move.y+Number(keys.has('s')||keys.has('arrowdown'))-Number(keys.has('w')||keys.has('arrowup'));const m=Math.hypot(x,y);if(m>1){x/=m;y/=m;}return {x,y,run:running||padState.run||keys.has('shift')};};
// For local testing only: ?debug exposes the camp to the console.
if(/[?&]debug\b/.test(globalThis.location?.search||""))window.deadlight={campModel,play,campPet,get campScene(){return campScene;}};
const campBridge={paused,zoom:()=>zooms[zoomIndex],look:()=>survivorLook,
 input:()=>play.fishing?{x:0,y:0,run:false}:campInput(),step:dt=>{if(!halted())play.update(dt,campInput());},
 fishing:()=>play.view(),busy:()=>!!play.active(),
 petLook:()=>petLook(companion),pet:()=>campPet,petStep:dt=>{if(!halted())campPet.update(dt,ownerOf(campModel,play.active()));},
 petTarget:()=>Object.assign(petTarget,{name:displayName(companion),x:campPet.x,y:campPet.y,my:campPet.y-(companion.species?30:46)+(campPet.state==='lie'?10:0)}),cooking:()=>play.cookView(),rackFish:()=>play.camp.basket.length,
 ready:s=>{campScene=s;if(place==='camp')$('loading').hidden=true;},
 tick:(now,s)=>{const t=s.target,show=!!t&&!paused(),pr=$('prompt');
  if(play.active()){pr.hidden=true;const fishing=play.fishing&&touch&&!halted();$('act').hidden=!fishing;if(fishing){const verb=play.actLabel();if($('actVerb').textContent!==verb){$('actVerb').textContent=verb;$('actName').textContent='Fishing';$('act').setAttribute('aria-label',verb);}}lastTarget=undefined;return;}
  if(t!==lastTarget){lastTarget=t;if(t){$('promptVerb').textContent=$('actVerb').textContent=verbOf(t);$('promptName').textContent=$('actName').textContent=t.name;$('act').setAttribute('aria-label',verbOf(t)+': '+t.name);}}
  $('act').hidden=!(show&&touch);pr.hidden=!show;if(!show)return;
  const cam=s.cameras.main,b=game.canvas.getBoundingClientRect(),k=b.width/s.scale.width,v=cam.worldView,x=((t.mx??t.x)-v.x)*cam.zoom*k,y=((t.kind==='resident'?t.y-118:t.my-2)-v.y)*cam.zoom*k;pr.style.transform=`translate(${Math.round(x)}px,${Math.round(y)}px) translate(-50%,-100%)`;}};
// Controller: polled every frame whatever is open. Dialogs and panels are walked with the D-pad and A; B backs out.
const zeroPad=()=>({move:{x:0,y:0},aim:{x:0,y:0},fire:false,run:false});let padRun=false;
function focusNav(box,P){const step=P.down||P.right?1:P.up||P.left?-1:0;if(!step)return;const list=[...box.querySelectorAll('button:not([disabled]),summary,a[href],input,[tabindex]:not([tabindex="-1"])')].filter(el=>el.offsetParent!==null&&!el.closest('[hidden]'));if(!list.length)return;const i=list.indexOf(document.activeElement);list[(i<0?0:(i+step+list.length)%list.length)].focus({preventScroll:false});}
function padLoop(){globalThis.requestAnimationFrame?.(padLoop);const st=pad.poll();if(!st)return;if(st.any)setDevice('pad');if(device!=='pad')return;const P=st.pressed,D=st.down;
 const dlg=['inspection','options'].map($).find(d=>d.open);
 if(dlg){padState=zeroPad();if(P.b||(P.start&&dlg.id==='options')||(P.back&&dlg.id==='inspection')){closeDialog(dlg.id);return;}focusNav(dlg,P);if(P.a&&dlg.contains(document.activeElement))document.activeElement.click();return;}
 if(P.start){endTalk();openDialog('options');return;}if(P.back){endTalk();openDialog('inspection');return;}if(P.r3)cycleZoom();
 if(talk){padState=zeroPad();if(P.a)nextLine();if(P.b)endTalk();return;}
 if(place==='camp'){
  if(play.cooking){padState=zeroPad();const box=$('cookPanel');focusNav(box,P);if(P.a){const f=document.activeElement;if(f?.tagName==='BUTTON'&&box.contains(f))f.click();else play.press(true);}if(P.b)play.escape();return;}
  if(play.fishing){if(P.a)play.press(true);if(st.released.a)play.press(false);}else if(P.a&&!paused())interact();
  if(P.b&&play.active())play.escape();}
 else if(!paused()){if(P.x)doReload();if(P.y||P.right)swapGun(1);if(P.left)swapGun(-1);if(P.rb||P.lb)doThrow();}
 if(paused()){padState=zeroPad();return;}
 // L3 toggles running until the stick comes back to rest; holding LT runs too.
 const L=st.left,R=st.right;if(P.l3)padRun=!padRun;if(!L.m)padRun=false;
 padState={move:{x:L.x,y:L.y},aim:R.m>PAD.aim?{x:R.x/R.m,y:R.y/R.m}:{x:0,y:0},fire:R.m>PAD.fire||D.rt,run:padRun||D.lt};}
globalThis.requestAnimationFrame?.(padLoop);
// The full controls list in the menu, for all three ways to play.
const CONTROLS=[['Move','WASD or arrows','Left stick','Left thumb'],['Run','Shift','LT, or click L3','Push the stick to its edge'],['Aim','Mouse','Right stick','Right stick'],['Fire','Click or Space','Push the right stick, or RT','Push the right stick'],['Reload','R','X','Reload'],['Grenade','G','RB or LB','Grenade'],['Swap weapon','Q, wheel or 1–5','Y or D-pad','Swap'],['Use or talk','E','A','Big button'],['Back','Esc','B','×'],['Character','I','View ⧉','Top right'],['Menu','Esc','Menu ☰','Top right'],['Camera zoom','Z','R3','Menu']];
$('controlsRef').innerHTML='<table><thead><tr><th></th><th>Keyboard &amp; mouse</th><th>Controller</th><th>Touch</th></tr></thead><tbody>'+CONTROLS.map(([a,...r])=>`<tr><th>${a}</th>${r.map(c=>`<td>${c}</td>`).join('')}</tr>`).join('')+'</tbody></table>';
showPlace();
if(typeof Phaser==='undefined')$('loading').innerHTML='Could not load the room.<span>Please refresh to try again.</span>';else{game=new Phaser.Game({type:Phaser.AUTO,parent:'game',width:innerWidth,height:innerHeight,backgroundColor:'#242630',pixelArt:true,roundPixels:true,antialias:false,resolution:Math.min(2,devicePixelRatio||1),render:{antialias:false,pixelArt:true,roundPixels:true},scene:[makeStudyScene(model,bridge),makeCampScene(campModel,campBridge)],audio:{noAudio:true},banner:false});resize();}
