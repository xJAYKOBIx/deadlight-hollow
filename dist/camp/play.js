// Camp activities: fishing off the pier, grilling at the fire, and the stamina and basket readouts.
// The rules live in fishing.js; this file runs a session and paints the page around it.
import {Fishing,FISH_BY_ID,BASKET_SIZE,sizeLabel,COOK,QUALITY,cookQuality,grilledBuff,readCamp,saveCamp,addToBasket,takeFromBasket,basketSummary} from './fishing.js';
import {fishArt} from './art.js';
import {OBJECTS} from './data.js';
const PIER=OBJECTS.find(o=>o.id==='pier');
export const PIER_END=1112,FIRE_SIDE={x:516,y:500};
const IDLE=['ready','landed','snapped','lost'];
const AR={away:'→',up:'↑',down:'↓'},CO={away:'←',up:'↓',down:'↑'};
const lower=c=>FISH_BY_ID[c.id||c.fish].name.toLowerCase();
// A fish drawn on a small page canvas, centered, at a whole-pixel scale.
export function paintFish(canvas,id,cook=null){const c=canvas.getContext('2d'),k=canvas.width/40;c.clearRect(0,0,canvas.width,canvas.height);c.save();c.imageSmoothingEnabled=false;c.scale(k,k);c.translate(22.5,canvas.height/k/2);fishArt(c,id,cook);c.restore();}
export function createCampPlay({$,storage,model,touch:touchInput,scene,afterChange}){
 const touch$=()=>typeof touchInput==='function'?touchInput():!!touchInput;
 const camp=readCamp(storage);model.stamina.setBuff(camp.buff);model.stamina.value=model.stamina.max;
 let fishing=null,cooking=null,hud='',fishHud='';
 const vibrate=p=>{try{navigator.vibrate?.(p);}catch{}};
 const save=()=>{const ok=saveCamp(storage,camp);scene()?.setRackFish(camp.basket.length);hud='';return ok;};
 // Fishing. The survivor stands at the end of the pier, facing the water.
 function startFishing(){if(fishing||cooking)return;fishing={f:new Fishing(),reel:false,released:false,idle:0,target:null,catch:null};Object.assign(model,{x:PIER.x,y:PIER.y,direction:0,frame:0,phase:0,moving:false,running:false});
  document.body.classList.add('fishing');$('fishPanel').hidden=false;$('fishCatch').hidden=true;fishHud='';paintFishing();}
 function stopFishing(){if(!fishing)return;fishing=null;document.body.classList.remove('fishing');$('fishPanel').hidden=true;afterChange();}
 function cast(){const f=fishing.f;if(!f.cast())return;fishing.catch=null;fishing.reel=false;fishing.target={x:PIER_END+42+Math.random()*26,y:PIER.y-10+Math.random()*22};$('fishCatch').hidden=true;}
 // The one action button: cast when the line is in, reel while it is out. On the grill it takes the fish off.
 function press(down){if(cooking){if(down)cookAction();return;}if(!fishing)return;if(down&&IDLE.includes(fishing.f.state)){cast();return;}fishing.reel=!!down;}
 function updateFishing(dt,input){const s=fishing,f=s.f,m=Math.hypot(input.x,input.y);if(m<.25)s.released=true;
  // Between casts, pushing the stick walks you off the pier. It has to be let go first, so a fight never ends in a stroll.
  if(IDLE.includes(f.state)){s.idle+=dt;if(s.released&&m>.6&&s.idle>.3){stopFishing();return;}}
  f.update(dt,{x:input.x,y:input.y,reel:s.reel});
  for(const e of f.events.splice(0)){if(e==='bite')vibrate(70);else if(e==='hooked')vibrate(25);else if(e==='tired')vibrate(15);else if(e==='snap')vibrate([80,50,80]);else if(e==='landed')land();
   if(['snap','landed','stole'].includes(e)){s.released=false;s.idle=0;s.reel=false;}}
  paintFishing();}
 function land(){const c=fishing.f.catch,kept=addToBasket(camp,c);fishing.catch={...c,kept};save();vibrate([30,40,30]);
  paintFish($('fishCard'),c.id);const f=FISH_BY_ID[c.id];$('catchName').textContent=(f.rare?'Rare! ':'')+f.name;
  $('catchInfo').textContent=`${c.w.toFixed(1)} kg · ${sizeLabel(c)}. `+(kept?`Into Pike's basket (${camp.basket.length}/${BASKET_SIZE}).`:'The basket is full, so you let it go.');$('fishCatch').hidden=false;}
 function fishText(){const f=fishing.f,P=f.pull?.name,castHint=touch$()?'Tap Cast. Move to leave the pier.':'Space or click to cast. Walk away to stop.';
  switch(f.state){
   case 'ready':return ['Cast your line',castHint,''];
   case 'cast':return ['Casting…','',''];
   case 'wait':return ['Watch the bobber',`When it sinks, pull back ${CO.away}`,''];
   case 'early':return ['Too soon','You spooked it. Wait for the bobber to sink.','warn'];
   case 'bite':return [`Bite! Pull back ${CO.away}`,'Now!','hot'];
   case 'fight':{const hint=fishing.reel?'Stop reeling while it fights!':f.stance==='counter'?'Good. It\'s getting tired.':f.stance==='with'?'You\'re pulling with it. The line can\'t take that.':`Hold the stick ${CO[P]}`;
    return [`It pulls ${AR[P]} · Hold ${CO[P]}`,hint,f.stance==='counter'&&!fishing.reel?'good':'hot'];}
   case 'slack':return ['It\'s tired. Reel in!',touch$()?'Hold Reel until it fights again.':'Hold Space or the mouse button to reel.','good'];
   case 'landed':return ['Caught!',castHint,'good'];
   case 'snapped':return ['The line snapped','It got away. '+castHint,'warn'];
   case 'lost':return ['It stole the bait','Pull back the moment the bobber sinks. '+castHint,'warn'];}
  return ['','',''];}
 function paintFishing(){const f=fishing.f,[status,hint,tone]=fishText(),hooked=f.state==='fight'||f.state==='slack',key=[status,hint,tone,hooked].join('|');
  if(key!==fishHud){fishHud=key;$('fishStatus').textContent=status;$('fishHint').textContent=hint;$('fishPanel').dataset.tone=tone;$('fishPanel').classList.toggle('hooked',hooked);}
  if(hooked){$('fishTension').style.transform=`scaleX(${f.tension.toFixed(3)})`;$('fishTension').classList.toggle('danger',f.tension>.7);$('fishLine').style.transform=`scaleX(${f.line.toFixed(3)})`;}}
 // Grilling. Pick a kind of fish; the biggest one goes on the spit. Take it off in the perfect window.
 function startCooking(){if(cooking||fishing||!camp.basket.length)return false;cooking={phase:'pick'};
  // Step to the side of the fire so the spit stays in view.
  Object.assign(model,{x:FIRE_SIDE.x,y:FIRE_SIDE.y,direction:7,frame:0,phase:0,moving:false,running:false});document.body.classList.add('cooking');$('cookPanel').hidden=false;paintCook();return true;}
 function pick(id){const c=takeFromBasket(camp,id);if(!c)return;save();cooking={phase:'grill',fish:c,p:0,shown:-1};paintCook();$('cookTake').focus({preventScroll:true});}
 function takeOff(){if(cooking?.phase!=='grill')return;const quality=cookQuality(cooking.p),buff=grilledBuff(cooking.fish,quality),old=camp.buff;camp.buff=buff;
  // A meal fills you up: the new maximum, and a full bar.
  model.stamina.setBuff(buff);model.stamina.value=model.stamina.max;model.stamina.winded=false;save();cooking={phase:'done',fish:cooking.fish,p:cooking.p,buff,old};vibrate(30);paintCook();$('cookOk').focus({preventScroll:true});}
 function closeCook(){if(!cooking||cooking.phase==='grill')return;cooking=null;document.body.classList.remove('cooking');$('cookPanel').hidden=true;afterChange();}
 function cookAction(){if(cooking?.phase==='grill')takeOff();else if(cooking?.phase==='done')closeCook();}
 function paintCook(){const ph=cooking.phase;$('cookClose').hidden=ph==='grill';$('cookPick').hidden=ph!=='pick';$('cookGrill').hidden=ph!=='grill';$('cookDone').hidden=ph!=='done';
  if(ph==='pick'){$('cookTitle').textContent='Grill a fish';const list=$('cookFish');list.textContent='';
   for(const f of basketSummary(camp)){const best=Math.max(...camp.basket.filter(c=>c.id===f.id).map(c=>c.w)),b=document.createElement('button'),cv=document.createElement('canvas');cv.width=80;cv.height=40;paintFish(cv,f.id);
    const name=document.createElement('b'),info=document.createElement('span');name.textContent=f.name;info.textContent=`×${f.count} · biggest ${best.toFixed(1)} kg`;b.append(cv,name,info);b.onclick=()=>pick(f.id);b.dataset.fish=f.id;list.append(b);}
   $('cookMeal').textContent=camp.buff?`You've eaten: ${QUALITY[camp.buff.quality].name.toLowerCase()} ${lower(camp.buff)}, +${camp.buff.max} stamina. A new meal replaces it.`:'You haven\'t eaten yet.';
   list.querySelector('button')?.focus({preventScroll:true});}
  if(ph==='grill'){$('cookTitle').textContent='Grilling '+lower(cooking.fish);paintGrill();}
  if(ph==='done'){const {buff,old,fish}=cooking,q=QUALITY[buff.quality];$('cookTitle').textContent='Off the fire';paintFish($('cookResult'),fish.id,cooking.p);
   $('cookQuality').textContent=`${q.name} ${lower(fish)}`;$('cookBuff').textContent=`+${buff.max} max stamina, and it recovers ${buff.regen.toFixed(2).replace(/0$/,'')}× as fast. Lasts until your next mission.`+(old?` Replaces your ${lower(old)}.`:'');
   $('cookAgain').hidden=!camp.basket.length;}}
 function paintGrill(){const p=cooking.p,step=Math.floor(p*40);if(step===cooking.shown)return;cooking.shown=step;$('cookMark').style.left=(p*100).toFixed(1)+'%';paintFish($('cookSpit'),cooking.fish.id,p);
  const q=cookQuality(p);$('cookState').textContent=q==='raw'?'Cooking…':q==='done'?'Cooked through. Wait for perfect…':q==='perfect'?'Perfect. Take it off!':'Burning!';$('cookGrill').dataset.q=q;}
 $('cookClose').onclick=closeCook;$('cookTake').onclick=takeOff;$('cookOk').onclick=closeCook;$('cookAgain').onclick=()=>{cooking={phase:'pick'};paintCook();};$('fishStop').onclick=stopFishing;
 // The top-left readout: stamina (wider when you have eaten), today's meal, and fish in the basket.
 function paintVitals(){const s=model.stamina,key=[Math.round(s.value),s.max,s.winded,camp.basket.length,camp.buff?.fish,camp.buff?.quality].join();if(key===hud)return;hud=key;
  $('vitals').style.setProperty('--max',(s.max/100).toFixed(2));$('staminaFill').style.transform=`scaleX(${(s.value/s.max).toFixed(3)})`;$('vitals').classList.toggle('winded',s.winded);
  $('mealChip').hidden=!camp.buff;if(camp.buff)$('mealChip').textContent=`${QUALITY[camp.buff.quality].name==='Perfect'?'Perfect ':''}grilled ${lower(camp.buff)} +${camp.buff.max}`;$('fishChip').textContent=`Fish ${camp.basket.length}/${BASKET_SIZE}`;}
 return {camp,
  get fishing(){return !!fishing;},get cooking(){return !!cooking;},
  active:()=>fishing?'fishing':cooking?'cooking':null,
  stop(){stopFishing();if(cooking){if(cooking.phase==='grill')takeOff();closeCook();}},
  press,escape(){if(fishing)stopFishing();else if(cooking)closeCook();},
  update(dt,input){if(fishing)updateFishing(dt,input);if(cooking?.phase==='grill'){cooking.p+=COOK.rate*dt;if(cooking.p>=1){cooking.p=1;takeOff();}else paintGrill();}paintVitals();},
  actLabel:()=>fishing&&!IDLE.includes(fishing.f.state)?'Reel':'Cast',
  view(){if(!fishing)return null;const f=fishing.f;return {state:f.state,t:f.t,tension:f.tension,line:f.line,pull:f.pull,stance:f.stance,nibble:f.nibble,catch:fishing.catch||f.catch,target:fishing.target,reel:fishing.reel};},
  cookView:()=>cooking&&cooking.phase!=='pick'?{id:cooking.fish.id,p:cooking.p}:null,
  verb:t=>t.id==='fire'&&camp.basket.length?'Cook':null,
  lines(t){if(t.id==='basket'){const s=basketSummary(camp);if(!s.length)return ['Empty. The pier\'s past the medic tent.','Pike salts whatever you bring in, so nothing spoils.'];
    return [s.map(f=>`${f.count} ${f.name.toLowerCase()}`).join(', ').replace(/^./,c=>c.toUpperCase())+`. ${camp.basket.length} of ${BASKET_SIZE} spaces used.`,'Grill one on the campfire before you head out. The big ones keep you going longer.'];}
   if(t.id==='fire')return ['The fire crackles. For a moment, everything is quiet.','Catch something at the pier and you can grill it here.'];return null;},
  use(t){if(t.id==='pier'){startFishing();return true;}if(t.id==='fire'&&camp.basket.length)return startCooking();return false;}};
}
