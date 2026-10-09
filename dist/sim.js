export const WORLD={w:2400,h:1800};
export const CHARACTERS=[
 {id:'ivy',name:'Ivy',role:'SCOUT',color:'#c4f181',accent:'#668f55',hp:140,speed:210,damage:1,starter:'pistol',description:'Quick on her feet. Extra pickup reach.',perk:'Fast movement · wide pickup radius'},
 {id:'rook',name:'Rook',role:'BRUISER',color:'#f2b57e',accent:'#9f644e',hp:210,speed:175,damage:1.1,starter:'cleaver',description:'A heavy hitter with a sweeping cleaver.',perk:'210 health · 10% more damage'},
 {id:'wren',name:'Wren',role:'MEDIC',color:'#91ded5',accent:'#4c8f95',hp:150,speed:192,damage:1,starter:'needle',description:'Recovers slowly while out of danger.',perk:'Regeneration · stronger medkits'},
 {id:'hex',name:'Hex',role:'TINKER',color:'#c5a7f6',accent:'#796099',hp:135,speed:192,damage:1,starter:'spark',description:'A bouncing spark and a talent for machines.',perk:'Stronger sentries · faster reloads'}
];
export const WEAPONS={
 pistol:{name:'Field pistol',tag:'SIDEARM',price:0,damage:24,rate:.25,clip:12,reload:1.05,ammo:'free',speed:850,range:700,color:'#f4d68c',desc:'Reliable, accurate. Unlimited reserve.'},
 cleaver:{name:'Rust cleaver',tag:'MELEE',price:0,damage:58,rate:.43,clip:1,reload:0,ammo:'free',range:105,melee:true,color:'#ffc599',desc:'A broad swing. Unlimited use.'},
 needle:{name:'Needle caster',tag:'SIDEARM',price:0,damage:19,rate:.2,clip:16,reload:1,ammo:'free',speed:900,range:620,color:'#95eee3',desc:'Rapid needles with unlimited reserve.'},
 spark:{name:'Spark wand',tag:'SIDEARM',price:0,damage:27,rate:.32,clip:10,reload:.9,ammo:'free',speed:740,range:650,pierce:1,color:'#d5bbff',desc:'Sparks pass through two enemies.'},
 carbine:{name:'Patrol carbine',tag:'RIFLE',price:110,damage:24,rate:.12,clip:24,reload:1.1,ammo:'light',speed:1000,range:850,color:'#ffdd96',desc:'Steady automatic fire. A versatile first buy.'},
 shotgun:{name:'Grave sweeper',tag:'SHOTGUN',price:135,damage:19,pellets:6,spread:.5,rate:.68,clip:6,reload:1.45,ammo:'shell',speed:860,range:420,color:'#ffc19b',desc:'Six pellets clear a path through a crowd.'},
 smg:{name:'Needle storm',tag:'SMG',price:180,damage:15,spread:.13,rate:.066,clip:36,reload:1.2,ammo:'light',speed:940,range:620,color:'#f9e79e',desc:'Fast fire, high ammunition appetite.'},
 frost:{name:'Cold shoulder',tag:'CONTROL',price:220,damage:36,rate:.32,clip:12,reload:1.3,ammo:'heavy',speed:760,range:700,slow:2.1,color:'#9deaff',desc:'Freezes enemies to half speed. Pierces two.',pierce:1},
 rail:{name:'Widowmaker',tag:'PIERCING',price:280,damage:110,rate:.8,clip:5,reload:1.5,ammo:'heavy',speed:1600,range:1050,pierce:7,color:'#eab8ff',desc:'Punches through an entire line of enemies.'},
 ember:{name:'Cinder hose',tag:'FLAME',price:250,damage:12,rate:.065,clip:60,reload:1.6,ammo:'light',speed:540,range:260,spread:.4,burn:2,color:'#ff9a59',desc:'Short-range flames burn clustered enemies.',pierce:2},
 grenade:{name:'Bell ringer',tag:'EXPLOSIVE',price:320,damage:110,rate:.85,clip:4,reload:1.6,ammo:'explosive',speed:520,range:650,blast:110,color:'#ffd277',desc:'Explosive rounds punish tightly packed hordes.'},
 saw:{name:'Briar cutter',tag:'PIERCING',price:350,damage:62,rate:.4,clip:10,reload:1.5,ammo:'heavy',speed:680,range:850,pierce:5,color:'#e5f0c0',desc:'Wide sawblades slice through six enemies.',size:9},
 tesla:{name:'Storm lantern',tag:'CHAIN',price:430,damage:55,rate:.36,clip:14,reload:1.4,ammo:'heavy',speed:1000,range:700,chain:3,color:'#bbbcff',desc:'Lightning jumps to three nearby targets.'}
};
export const ENEMIES={
 shambler:{hp:45,speed:54,damage:11,r:15,color:'#a2b382',reward:7},
 runner:{hp:36,speed:108,damage:9,r:13,color:'#cf9b82',reward:8},
 brute:{hp:220,speed:42,damage:22,r:24,color:'#c0a4cf',reward:19},
 spitter:{hp:72,speed:49,damage:10,r:15,color:'#aad29b',reward:12},
 volatile:{hp:62,speed:82,damage:22,r:17,color:'#e2b377',reward:12},
 keeper:{hp:125,speed:42,damage:10,r:17,color:'#98d4c3',reward:18},
 boss:{hp:2600,speed:48,damage:28,r:39,color:'#c8a6d9',reward:200}
};
export const WAVE_TOTALS=[14,21,28,35,44,53,64,76,90,65];
export const OBSTACLES=[
 {x:660,y:380,w:38,h:650,kind:'wall'}, {x:660,y:380,w:680,h:38,kind:'wall'},
 {x:1302,y:380,w:38,h:290,kind:'wall'}, {x:1302,y:805,w:38,h:225,kind:'wall'},
 {x:660,y:992,w:240,h:38,kind:'wall'}, {x:1030,y:992,w:310,h:38,kind:'wall'},
 {x:660,y:685,w:260,h:25,kind:'wall'}, {x:1050,y:685,w:290,h:25,kind:'wall'},
 {x:740,y:460,w:70,h:155,kind:'shelf'}, {x:1140,y:450,w:115,h:70,kind:'table'},
 {x:745,y:840,w:145,h:60,kind:'sofa'}, {x:1150,y:840,w:80,h:70,kind:'table'},
 {x:380,y:1280,w:100,h:100,kind:'fountain'},
 {x:1670,y:300,w:42,h:45,kind:'grave'}, {x:1830,y:300,w:42,h:45,kind:'grave'}, {x:1990,y:300,w:42,h:45,kind:'grave'},
 {x:1670,y:460,w:42,h:45,kind:'grave'}, {x:1830,y:460,w:42,h:45,kind:'grave'}, {x:1990,y:460,w:42,h:45,kind:'grave'},
 {x:1670,y:620,w:42,h:45,kind:'grave'}, {x:1830,y:620,w:42,h:45,kind:'grave'}, {x:1990,y:620,w:42,h:45,kind:'grave'},
 {x:1600,y:1160,w:75,h:55,kind:'crate'}, {x:1710,y:1160,w:55,h:55,kind:'crate'},
 {x:1930,y:1320,w:75,h:55,kind:'crate'}, {x:220,y:620,w:50,h:50,kind:'tree'},
 {x:350,y:320,w:50,h:50,kind:'tree'}, {x:2000,y:1010,w:50,h:50,kind:'tree'},
 {x:1720,y:1460,w:50,h:50,kind:'tree'}, {x:350,y:1600,w:50,h:50,kind:'tree'}
];
const AMMO_MAX={light:400,shell:80,heavy:130,explosive:35};
export const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
export function collides(x,y,r=15){return x<r+55||y<r+55||x>WORLD.w-r-55||y>WORLD.h-r-55||OBSTACLES.some(o=>{let nx=clamp(x,o.x,o.x+o.w),ny=clamp(y,o.y,o.y+o.h);return (x-nx)**2+(y-ny)**2<r*r;});}
function lineClear(a,b,r=8){let d=dist(a,b),n=Math.ceil(d/25);for(let i=1;i<n;i++)if(collides(a.x+(b.x-a.x)*i/n,a.y+(b.y-a.y)*i/n,r))return false;return true;}
export class Game {
 constructor(seed=Date.now()){
  this.seed=(seed>>>0)||1;this.phase='menu';this.bonus=0;this.time=0;this.wave=0;this.enemies=[];this.bullets=[];this.pickups=[];this.effects=[];this.hazards=[];this.sentries=[];this.events=[];this.id=1;this.kills=0;this.totalDamage=0;this.spent=0;this.flow=null;this.flowTimer=0;this.waveKills=0;this.spawned=0;this.spawnTimer=0;this.bossSpawned=false;this.difficulty='standard';
  this.resetPlayer('ivy');
 }
 rand(){this.seed=(Math.imul(this.seed,1664525)+1013904223)>>>0;return this.seed/4294967296;}
 resetPlayer(id){let c=CHARACTERS.find(x=>x.id===id)||CHARACTERS[0];this.character=c.id;this.player={x:1130,y:1190,r:15,hp:c.hp,maxHp:c.hp,speed:c.speed,angle:-Math.PI/2,cash:70,medkits:2,armor:0,dash:0,dashTime:0,invuln:0,sinceHit:0,selected:0,guns:[this.makeGun(c.starter)],ammo:{light:120,shell:24,heavy:35,explosive:8},turretCharges:0};}
 makeGun(id){return {id,level:0,clip:WEAPONS[id].clip,cooldown:0,reload:0};}
 get char(){return CHARACTERS.find(c=>c.id===this.character);}
 get gun(){return this.player.guns[this.player.selected];}
 get weapon(){return WEAPONS[this.gun.id];}
 emit(type,data={}){this.events.push({type,...data});}
 start(id,difficulty='standard'){this.resetPlayer(id);this.difficulty=difficulty;this.phase='shop';this.wave=0;this.beginWave();}
 beginWave(){if(this.phase!=='shop')return false;this.wave++;this.phase='wave';this.waveKills=0;this.spawned=0;this.spawnTimer=1.8;this.bossSpawned=false;this.enemies=[];this.bullets=[];this.hazards=[];this.sentries=[];this.effects=[];this.player.invuln=2;this.player.dash=0;this.player.hp=Math.min(this.player.maxHp,this.player.hp+this.player.maxHp*.13);for(let g of this.player.guns){g.clip=WEAPONS[g.id].clip+g.level*2;g.reload=0;g.cooldown=0;}this.emit('wave',{wave:this.wave});return true;}
 move(e,dx,dy){let steps=Math.max(1,Math.ceil(Math.max(Math.abs(dx),Math.abs(dy))/10));for(let i=0;i<steps;i++){if(!collides(e.x+dx/steps,e.y,e.r))e.x+=dx/steps;if(!collides(e.x,e.y+dy/steps,e.r))e.y+=dy/steps;}}
 reload(){let g=this.gun,w=this.weapon,p=this.player;if(g.reload>0||w.melee||g.clip>=w.clip+g.level*2||w.ammo!=='free'&&p.ammo[w.ammo]<=0)return false;g.reload=w.reload*(this.character==='hex'?.8:1);this.emit('reload');return true;}
 switchWeapon(index){if(index<0||index>=this.player.guns.length)return false;this.player.selected=index;this.emit('switch');return true;}
 get roaming(){return this.phase==='wave'||this.phase==='scavenge';}
 heal(){let p=this.player;if(!this.roaming||p.medkits<1||p.hp>=p.maxHp)return false;p.medkits--;p.hp=Math.min(p.maxHp,p.hp+(this.character==='wren'?85:60));this.effects.push({kind:'heal',x:p.x,y:p.y,life:.7,max:.7,r:65});this.emit('heal');return true;}
 dash(dx,dy){let p=this.player;if(!this.roaming||p.dash>0)return false;let l=Math.hypot(dx,dy);p.dashX=l>.1?dx/l:Math.cos(p.angle);p.dashY=l>.1?dy/l:Math.sin(p.angle);p.dash=3.4;p.dashTime=.17;p.invuln=Math.max(p.invuln,.25);this.emit('dash');return true;}
 deploy(){let p=this.player;if(this.phase!=='wave'||p.turretCharges<1||this.sentries.length>=2)return false;p.turretCharges--;this.sentries.push({x:p.x,y:p.y,r:12,life:40,shot:0,angle:p.angle});this.emit('deploy');return true;}
 purchase(id){if(this.phase!=='shop')return {ok:false,message:'Shop opens between waves.'};let p=this.player,w=WEAPONS[id];if(w){if(p.guns.some(g=>g.id===id))return {ok:false,message:'Already equipped.'};if(p.cash<w.price)return {ok:false,message:'Not enough scrap.'};p.cash-=w.price;this.spent+=w.price;let slot=p.guns.length<3?p.guns.length:p.selected===0?2:p.selected;p.guns[slot]=this.makeGun(id);p.selected=slot;p.ammo[w.ammo]=Math.min(AMMO_MAX[w.ammo]||0,(p.ammo[w.ammo]||0)+(w.ammo==='light'?100:w.ammo==='shell'?24:w.ammo==='heavy'?40:10));this.emit('purchase');return {ok:true,message:w.name+' equipped.'};}
  let cost={ammo:45,medkit:55,repair:65,armor:100,turret:90}[id];if(cost===undefined)return {ok:false,message:'Unknown item.'};if(id==='armor')cost=100+p.armor*7;if(id==='medkit'&&p.medkits>=4)return {ok:false,message:'You can carry four medkits.'};if(id==='turret'&&p.turretCharges>=3)return {ok:false,message:'You can carry three sentries.'};if(id==='repair'&&p.hp>=p.maxHp)return {ok:false,message:'Health is already full.'};if(id==='armor'&&p.armor>=12)return {ok:false,message:'Armor is fully upgraded.'};if(p.cash<cost)return {ok:false,message:'Not enough scrap.'};if(id==='ammo'&&Object.entries(AMMO_MAX).every(([k,v])=>p.ammo[k]>=v))return {ok:false,message:'Ammo is already full.'};p.cash-=cost;this.spent+=cost;
  if(id==='ammo')for(let [k,v]of Object.entries(AMMO_MAX))p.ammo[k]=Math.min(v,p.ammo[k]+Math.ceil(v*.5));if(id==='medkit')p.medkits++;if(id==='repair')p.hp=p.maxHp;if(id==='armor')p.armor+=3;if(id==='turret')p.turretCharges++;this.emit('purchase');return {ok:true,message:'Supplies secured.'};
 }
 upgrade(index=this.player.selected){if(this.phase!=='shop')return {ok:false,message:'Upgrade between waves.'};let p=this.player,g=p.guns[index];if(!g)return {ok:false,message:'Choose a weapon.'};if(g.level>=3)return {ok:false,message:'Fully upgraded.'};let cost=65+g.level*65;if(p.cash<cost)return {ok:false,message:'Not enough scrap.'};p.cash-=cost;this.spent+=cost;g.level++;g.clip=WEAPONS[g.id].clip+g.level*2;this.emit('purchase');return {ok:true,message:WEAPONS[g.id].name+' upgraded.'};}
 spawn(type,x,y){let a=ENEMIES[type],factor=1+(this.wave-1)*.075;if(type==='boss')factor=1;let e={id:this.id++,type,x,y,r:a.r,hp:a.hp*factor,maxHp:a.hp*factor,speed:a.speed,damage:a.damage,active:1.1,hit:0,slow:0,burn:0,attack:0,special:1.5+this.rand()*2,angle:0};this.enemies.push(e);return e;}
 chooseEnemy(){let r=this.rand();if(this.wave>=7&&r<.1)return 'keeper';if(this.wave>=5&&r<.22)return 'volatile';if(this.wave>=4&&r<.33)return 'spitter';if(this.wave>=3&&r<.45)return 'brute';if(this.wave>=2&&r<.65)return 'runner';return 'shambler';}
 spawnNear(type){let p=this.player;for(let i=0;i<35;i++){let angle=this.rand()*Math.PI*2,d=470+this.rand()*230;let x=clamp(p.x+Math.cos(angle)*d,110,WORLD.w-110),y=clamp(p.y+Math.sin(angle)*d,110,WORLD.h-110);if(!collides(x,y,ENEMIES[type].r+6)&&Math.hypot(x-p.x,y-p.y)>330){this.spawn(type,x,y);return true;}}return false;}
 buildFlow(radius=17){
  const cell=40,nx=WORLD.w/cell,ny=WORLD.h/cell,p=this.player;
  this.blocks??={};let blocked=this.blocks[radius];
  if(!blocked){blocked=new Uint8Array(nx*ny);for(let y=0;y<ny;y++)for(let x=0;x<nx;x++)blocked[y*nx+x]=collides(x*cell+20,y*cell+20,radius)?1:0;this.blocks[radius]=blocked;}
  let tx=clamp(Math.floor(p.x/cell),0,nx-1),ty=clamp(Math.floor(p.y/cell),0,ny-1),start=ty*nx+tx;
  if(blocked[start]){let best=Infinity;for(let yy=-5;yy<=5;yy++)for(let xx=-5;xx<=5;xx++){let x=tx+xx,y=ty+yy,j=y*nx+x;if(x<0||y<0||x>=nx||y>=ny||blocked[j])continue;let d=(x*cell+20-p.x)**2+(y*cell+20-p.y)**2;if(d<best){best=d;start=j;}}}
  let out=new Int16Array(nx*ny);out.fill(-1);let q=new Int32Array(nx*ny),head=0,tail=0;out[start]=0;q[tail++]=start;
  while(head<tail){let i=q[head++],x=i%nx,y=Math.floor(i/nx);for(let [dx,dy]of [[1,0],[-1,0],[0,1],[0,-1]]){let xx=x+dx,yy=y+dy,j=yy*nx+xx;if(xx>=0&&yy>=0&&xx<nx&&yy<ny&&!blocked[j]&&out[j]<0){out[j]=out[i]+1;q[tail++]=j;}}}
  return out;
 }
 hurtEnemy(e,amount){if(e.hp<=0||e.active>0)return;e.hp-=amount;e.hit=.1;this.totalDamage+=amount;if(e.hp<=0){this.kills++;this.waveKills++;let t=ENEMIES[e.type];this.pickups.push({x:e.x,y:e.y,kind:'cash',value:t.reward,life:50});let roll=this.rand();if(roll<.12)this.pickups.push({x:e.x+15,y:e.y,kind:'health',value:14,life:40});else if(roll<.35)this.pickups.push({x:e.x-10,y:e.y,kind:'ammo',value:1,life:40});this.effects.push({kind:'burst',x:e.x,y:e.y,life:.4,max:.4,r:e.r+12,color:t.color});this.emit('kill');if(e.type==='volatile'){this.explode(e.x,e.y,80,80,false);this.hazards.push({x:e.x,y:e.y,r:62,life:4,warn:.55,type:'acid'});}if(e.type==='boss')this.emit('bossdown');}}
 hurtPlayer(amount){let p=this.player;if(p.invuln>0||this.phase!=='wave')return;p.hp-=Math.max(2,amount-p.armor)*(this.difficulty==='relaxed'?.65:1);p.invuln=.55;p.sinceHit=0;this.emit('hurt');if(p.hp<=0){p.hp=0;this.phase='dead';this.emit('dead');}}
 explode(x,y,r,damage,hostile){this.effects.push({kind:'explosion',x,y,r,life:.42,max:.42});if(hostile){if(Math.hypot(this.player.x-x,this.player.y-y)<r)this.hurtPlayer(damage);}else{for(let e of this.enemies)if(e.hp>0&&Math.hypot(e.x-x,e.y-y)<r+e.r)this.hurtEnemy(e,damage);}}
 fire(angle){let p=this.player,g=this.gun,w=this.weapon;if(g.cooldown>0||g.reload>0)return;if(g.clip<=0){this.reload();return;}let damage=w.damage*(1+g.level*.3)*this.char.damage;g.cooldown=w.rate/(1+g.level*.05);if(!w.melee)g.clip--;p.angle=angle;
  if(w.melee){for(let e of this.enemies){let da=Math.atan2(e.y-p.y,e.x-p.x)-angle;da=Math.atan2(Math.sin(da),Math.cos(da));if(dist(e,p)<w.range+e.r&&Math.abs(da)<1.35)this.hurtEnemy(e,damage);}this.effects.push({kind:'swing',x:p.x,y:p.y,angle,life:.2,max:.2,r:w.range});}
  else for(let i=0;i<(w.pellets||1);i++){let a=angle+(w.pellets?(i/(w.pellets-1)-.5)*(w.spread||0):(this.rand()-.5)*(w.spread||0));this.bullets.push({x:p.x+Math.cos(a)*22,y:p.y+Math.sin(a)*22,vx:Math.cos(a)*w.speed,vy:Math.sin(a)*w.speed,life:w.range/w.speed,damage,r:w.size||3,color:w.color,pierce:w.pierce||0,slow:w.slow||0,burn:w.burn||0,blast:w.blast||0,chain:w.chain||0,hit:[],hostile:false});}
  this.emit('shoot',{weapon:g.id});if(g.clip<=0)this.reload();
 }
 update(dt,input={}){dt=clamp(dt,0,.05);if(!this.roaming)return;this.time+=dt;let p=this.player;p.invuln=Math.max(0,p.invuln-dt);p.dash=Math.max(0,p.dash-dt);p.sinceHit+=dt;
  for(let g of p.guns){g.cooldown=Math.max(0,g.cooldown-dt);if(g.reload>0){g.reload-=dt;if(g.reload<=0){let w=WEAPONS[g.id],need=w.clip+g.level*2-g.clip,take=w.ammo==='free'?need:Math.min(need,p.ammo[w.ammo]);g.clip+=take;if(w.ammo!=='free')p.ammo[w.ammo]-=take;this.emit('loaded');}}}
  let mx=input.mx||0,my=input.my||0,ml=Math.hypot(mx,my);if(ml>1){mx/=ml;my/=ml;}if(p.dashTime>0){p.dashTime-=dt;this.move(p,p.dashX*660*dt,p.dashY*660*dt);}else this.move(p,mx*p.speed*dt,my*p.speed*dt);
  if(Number.isFinite(input.angle))p.angle=input.angle;if(this.phase==='scavenge'){this.updatePickups(dt,false);for(let fx of this.effects)fx.life-=dt;this.effects=this.effects.filter(e=>e.life>0);return;}if(input.fire)this.fire(p.angle);if(this.character==='wren'&&p.sinceHit>5)p.hp=Math.min(p.maxHp,p.hp+2.5*dt);
  this.flowTimer-=dt;if(this.flowTimer<=0){this.flow=this.buildFlow(17);this.largeFlow=this.enemies.some(e=>e.r>17&&e.r<30)?this.buildFlow(26):null;this.bossFlow=this.enemies.some(e=>e.type==='boss')?this.buildFlow(41):null;this.flowTimer=.35;}
  this.spawnTimer-=dt;let total=WAVE_TOTALS[this.wave-1];if(this.spawned<total&&this.spawnTimer<=0&&this.enemies.filter(e=>e.hp>0).length<65){let type=this.wave===10&&!this.bossSpawned?'boss':this.chooseEnemy();if(this.spawnNear(type)){this.spawned++;if(type==='boss'){this.bossSpawned=true;this.emit('boss');}}this.spawnTimer=Math.max(.16,.7-this.wave*.044);}
  // A compact spatial hash prevents crowd separation from becoming quadratic.
  let buckets=new Map();for(let e of this.enemies){let k=Math.floor(e.x/60)+','+Math.floor(e.y/60);if(!buckets.has(k))buckets.set(k,[]);buckets.get(k).push(e);}
  for(let e of this.enemies){if(e.hp<=0)continue;e.hit=Math.max(0,e.hit-dt);if(e.active>0){e.active-=dt;continue;}e.attack-=dt;e.special-=dt;e.slow=Math.max(0,e.slow-dt);if(e.burn>0){e.burn-=dt;this.hurtEnemy(e,14*dt);}let d=dist(e,p),vx=p.x-e.x,vy=p.y-e.y;
   if(d>110&&!lineClear(e,p,e.r)){let cx=Math.floor(e.x/40),cy=Math.floor(e.y/40),best=9999,bx=0,by=0;for(let yy=-1;yy<=1;yy++)for(let xx=-1;xx<=1;xx++){let x=cx+xx,y=cy+yy,j=y*60+x,f=(e.r>30?(this.bossFlow||this.flow):e.r>17?(this.largeFlow||this.flow):this.flow)[j];if(x<0||y<0||x>=60||y>=45||f<0)continue;let wx=x*40+20,wy=y*40+20;if(collides(wx,wy,e.r)||!lineClear(e,{x:wx,y:wy},e.r))continue;let score=f+Math.hypot(wx-e.x,wy-e.y)*.006;if(score<best){best=score;bx=wx-e.x;by=wy-e.y;}}if(best<9999){vx=bx;vy=by;}}
   let len=Math.hypot(vx,vy)||1;vx/=len;vy/=len;e.angle=Math.atan2(vy,vx);let sx=0,sy=0,bx=Math.floor(e.x/60),by=Math.floor(e.y/60);for(let yy=-1;yy<=1;yy++)for(let xx=-1;xx<=1;xx++)for(let o of buckets.get((bx+xx)+','+(by+yy))||[]){if(o===e||o.hp<=0)continue;let dx=e.x-o.x,dy=e.y-o.y,dd=Math.hypot(dx,dy),min=e.r+o.r;if(dd>0&&dd<min){sx+=dx/dd*(min-dd)*2;sy+=dy/dd*(min-dd)*2;}}
   let speed=e.speed*(e.slow>0?.48:1)*(this.difficulty==='relaxed'?.88:1);if(e.type==='spitter'&&d<260&&lineClear(e,p,3))speed*=.1;this.move(e,(vx*speed+sx)*dt,(vy*speed+sy)*dt);
   if(d<e.r+p.r+7&&e.attack<=0){this.hurtPlayer(e.damage);e.attack=.8;if(e.type==='volatile'){this.hurtEnemy(e,999);}}
   if(e.type==='spitter'&&e.special<=0&&d<600&&lineClear(e,p,4)){let a=Math.atan2(p.y-e.y,p.x-e.x);this.bullets.push({x:e.x,y:e.y,vx:Math.cos(a)*210,vy:Math.sin(a)*210,life:3,damage:13,r:7,color:'#b6e67d',hostile:true,hit:[]});e.special=2.8;}
   if(e.type==='keeper'&&e.special<=0){for(let o of this.enemies)if(o.hp>0&&o.type!=='boss'&&dist(o,e)<180)o.hp=Math.min(o.maxHp,o.hp+12);this.effects.push({kind:'heal',x:e.x,y:e.y,r:180,life:.55,max:.55});e.special=3.5;}
   if(e.type==='boss'&&e.special<=0){this.hazards.push({x:p.x,y:p.y,r:110,life:2.3,warn:1.4,type:'slam'});for(let i=0;i<8;i++){let a=i*Math.PI/4+this.time*.1;this.bullets.push({x:e.x,y:e.y,vx:Math.cos(a)*150,vy:Math.sin(a)*150,life:4,damage:16,r:8,color:'#ca9fff',hostile:true,hit:[]});}e.special=e.hp<e.maxHp*.4?2.5:4;}
  }
  for(let b of this.bullets){if(b.life<=0)continue;let steps=Math.max(1,Math.ceil(Math.hypot(b.vx,b.vy)*dt/13));for(let s=0;s<steps&&b.life>0;s++){b.x+=b.vx*dt/steps;b.y+=b.vy*dt/steps;b.life-=dt/steps;if(collides(b.x,b.y,b.r)){if(b.blast)this.explode(b.x,b.y,b.blast,b.damage,false);b.life=0;break;}if(b.hostile){if(dist(b,p)<p.r+b.r){this.hurtPlayer(b.damage);b.life=0;}}else for(let e of this.enemies){if(e.hp<=0||e.active>0||b.hit.includes(e.id)||dist(e,b)>e.r+b.r)continue;b.hit.push(e.id);this.hurtEnemy(e,b.damage);e.slow=Math.max(e.slow,b.slow||0);e.burn=Math.max(e.burn,b.burn||0);if(b.chain){let last=e;for(let i=0;i<b.chain;i++){let nearest=this.enemies.filter(o=>o.hp>0&&o.active<=0&&!b.hit.includes(o.id)&&dist(o,last)<145).sort((a,c)=>dist(a,last)-dist(c,last))[0];if(!nearest)break;b.hit.push(nearest.id);this.effects.push({kind:'arc',x:last.x,y:last.y,x2:nearest.x,y2:nearest.y,life:.14,max:.14});this.hurtEnemy(nearest,b.damage*.65);last=nearest;}}if(b.blast)this.explode(b.x,b.y,b.blast,b.damage,false);if(b.pierce>0)b.pierce--;else {b.life=0;break;}}}}
  for(let h of this.hazards){h.life-=dt;let was=h.warn;h.warn-=dt;if(h.type==='slam'&&was>0&&h.warn<=0)this.explode(h.x,h.y,h.r,30,true);if(h.type==='acid'&&h.warn<=0&&dist(h,p)<h.r)this.hurtPlayer(7);}
  for(let t of this.sentries){t.life-=dt;t.shot-=dt;if(t.shot<=0){let e=this.enemies.filter(e=>e.hp>0&&e.active<=0&&dist(e,t)<450&&lineClear(t,e,3)).sort((a,b)=>dist(a,t)-dist(b,t))[0];if(e){t.angle=Math.atan2(e.y-t.y,e.x-t.x);this.bullets.push({x:t.x,y:t.y,vx:Math.cos(t.angle)*950,vy:Math.sin(t.angle)*950,life:.5,damage:this.character==='hex'?40:26,r:3,color:'#c3b6ff',hit:[],pierce:0});t.shot=.24;}}}
  this.updatePickups(dt);
  for(let fx of this.effects)fx.life-=dt;this.effects=this.effects.filter(e=>e.life>0).slice(-100);this.enemies=this.enemies.filter(e=>e.hp>0);this.bullets=this.bullets.filter(b=>b.life>0).slice(-450);this.pickups=this.pickups.filter(q=>q.life>0).slice(-200);this.hazards=this.hazards.filter(h=>h.life>0);this.sentries=this.sentries.filter(t=>t.life>0);
  if(this.phase==='wave'&&this.spawned>=total&&this.enemies.length===0)this.finishWave();
 }
 collectPickup(q){let p=this.player;if(q.kind==='cash')p.cash+=q.value;if(q.kind==='health')p.hp=Math.min(p.maxHp,p.hp+q.value);if(q.kind==='ammo')for(let [k,n]of Object.entries({light:20,shell:4,heavy:6,explosive:2}))p.ammo[k]=Math.min(AMMO_MAX[k],p.ammo[k]+n);}
 updatePickups(dt,decay=true){let p=this.player;for(let q of this.pickups){if(q.life<=0)continue;if(decay)q.life-=dt;let d=dist(q,p);if(d<(this.character==='ivy'?155:115)){let step=Math.min(d,350*dt);q.x+=(p.x-q.x)/Math.max(d,1)*step;q.y+=(p.y-q.y)/Math.max(d,1)*step;}if(dist(q,p)<28){this.collectPickup(q);q.life=0;}}this.pickups=this.pickups.filter(q=>q.life>0);}
 finishWave(){if(this.phase!=='wave')return false;this.bullets=[];this.hazards=[];this.sentries=[];this.bonus=65+this.wave*18;this.phase='scavenge';if(this.wave>=10){this.bankPickups();this.phase='won';this.emit('won',{bonus:this.bonus});}else this.emit('scavenge');return true;}
 bankPickups(){for(let q of this.pickups)if(q.life>0)this.collectPickup(q);this.pickups=[];this.player.cash+=this.bonus;}
 enterShop(){if(this.phase!=='scavenge')return false;this.bankPickups();this.phase='shop';this.emit('clear',{bonus:this.bonus});return true;}
 snapshot(){let keys=['seed','phase','time','wave','enemies','bullets','pickups','hazards','sentries','id','kills','totalDamage','spent','waveKills','spawned','spawnTimer','bossSpawned','difficulty','character','player','bonus'];let out={version:1};for(let k of keys)out[k]=this[k];return JSON.parse(JSON.stringify(out));}
 static restore(data){if(!data||data.version!==1||!['wave','scavenge','shop'].includes(data.phase)||!CHARACTERS.some(c=>c.id===data.character)||!data.player||!Array.isArray(data.player.guns)||data.player.guns.some(g=>!WEAPONS[g.id])||data.wave<1||data.wave>10)throw new Error('Invalid save');let g=new Game();for(let k of Object.keys(g.snapshot()))if(k!=='version'&&data[k]!==undefined)g[k]=data[k];g.player.invuln=2;g.events=[];return g;}
}
