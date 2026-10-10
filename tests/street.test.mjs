import test from 'node:test';import assert from 'node:assert/strict';
const {Fight,ZOMBIE,PLAYER_HP}=await import('../dist/street/fight.js');const {StreetModel}=await import('../dist/street/model.js');
const {normalizeHome,take,goal,useLines,loot,TRUNK}=await import('../dist/home/kit.js');const {count}=await import('../dist/home/bag.js');const {carrying}=await import('../dist/mc/assets/gear/bags.js');
const {STREET,SOLIDS,START,WAVES,COP,NOTICE,PROPS}=await import('../dist/street/data.js');
const grid=carrying({}),armed=(guns=['light-pistol','pump-shotgun'])=>guns.reduce((k,g)=>take(k,g,grid),{...normalizeHome(null),woke:true});
function setup(k=armed()){const box={k},m=new StreetModel(),f=new Fight(m,{kit:()=>box.k,setKit:v=>box.k=v,grid:()=>grid});m.zombies=f.zombies;f.start();return {box,m,f};}
const run=(f,m,s,input=()=>({}))=>{for(let t=0;t<s;t+=1/60){const i=input();m.update(1/60,i);f.update(1/60,i);}};
test('the street: you step out on your own step, and everything stands on the map',()=>{const m=new StreetModel();assert.deepEqual([m.x,m.y],[START.x,START.y]);assert.equal(m.blocked(m.x,m.y),false);
 for(const o of PROPS)assert.ok(o.x+o.w>-40&&o.x<STREET.w+40&&o.y>=0&&o.y<STREET.h,o.id);
 // The door back in only answers when you face it, so a stray press on arrival does not send you straight back inside.
 m.direction=2;assert.equal(m.target()?.id,undefined);m.direction=6;assert.equal(m.target()?.id,'frontdoor');});
test('the cop waits at the cruiser until you come close or fire, then the others come out of the dark',()=>{const {m,f}=setup();assert.equal(f.zombies.length,WAVES[0].length);
 assert.equal(f.out(f.zombies[1]),false,'the others are not out yet');run(f,m,2);assert.equal(f.alert,false);assert.equal(f.zombies[0].x,COP.x,'the cop has not moved');
 Object.assign(m,{x:COP.x-NOTICE+20,y:COP.y+40});run(f,m,.1);assert.equal(f.alert,true);run(f,m,3);assert.ok(f.zombies.every(z=>f.out(z)),'all three are out');});
test('a bite winds up first: step out of reach and it misses; stand there and it lands',()=>{const {m,f}=setup(),z=f.zombies[0];
 Object.assign(m,{x:z.x-ZOMBIE.reach+2,y:z.y});f.wake();run(f,m,.05);assert.equal(z.state,'windup');assert.ok(z.tell>0,'it shows a tell');
 m.x-=60;run(f,m,ZOMBIE.bite.windup+.05);assert.equal(f.hp,PLAYER_HP,'it missed');
 const g=setup();const z2=g.f.zombies[0];Object.assign(g.m,{x:z2.x-ZOMBIE.reach+2,y:z2.y});g.f.wake();run(g.f,g.m,ZOMBIE.bite.windup+.1);assert.equal(g.f.hp,PLAYER_HP-ZOMBIE.bite.damage);});
test('guns shove what they hit; the shotgun breaks a bite that is winding up',()=>{const {m,f}=setup(),z=f.zombies[0];Object.assign(m,{x:z.x-ZOMBIE.reach+2,y:z.y});f.wake();run(f,m,.05);assert.equal(z.state,'windup');
 f.aimAngle=0;assert.equal(f.gunId,'pump-shotgun');const x0=z.x;assert.ok(f.fire());run(f,m,.2,()=>({}));assert.notEqual(z.state,'windup');assert.ok(z.hp<z.max);if(z.hp>0)assert.ok(z.x>x0+5,'knocked back');});
test('the pistol never runs out of spare magazines; the shotgun reloads a shell at a time from the bag',()=>{const {box,m,f}=setup();
 box.k={...box.k,held:'light-pistol',guns:{...box.k.guns,'light-pistol':{ammo:0}}};assert.equal(f.spare,Infinity);run(f,m,.1);assert.ok(f.reload());run(f,m,1.3);assert.equal(f.ammo,15);
 box.k={...box.k,held:'pump-shotgun',guns:{...box.k.guns,'pump-shotgun':{ammo:5}}};run(f,m,.5);const before=count(box.k.bag,'shells');assert.ok(f.reload());run(f,m,.5);assert.equal(f.ammo,6);assert.equal(count(box.k.bag,'shells'),before-1);
 run(f,m,1.2);assert.equal(f.ammo,8);assert.equal(count(box.k.bag,'shells'),before-3);
 // You move slower while reloading.
 box.k={...box.k,guns:{...box.k.guns,'pump-shotgun':{ammo:7}}};f.reload();run(f,m,.05);assert.equal(m.slow,.72);});
test('with no shells left the shotgun clicks empty and will not reload',()=>{const k=armed();const {box,m,f}=setup({...k,bag:{items:[],spill:[]},guns:{...k.guns,'pump-shotgun':{ammo:0}}});
 assert.equal(f.fire(),false);const ev=f.drain().map(e=>e.type);assert.ok(ev.includes('empty')&&ev.includes('nospare'));assert.equal(f.reloadTime,0);});
test('going down puts you back on your step with what you had when you came out',()=>{const {box,m,f}=setup();const snap=JSON.stringify(box.k);f.aimAngle=0;f.fire();f.fire();run(f,m,1);
 f.hurt(PLAYER_HP,{x:m.x+10,y:m.y});assert.ok(f.down>0);run(f,m,3.2);assert.equal(f.hp,PLAYER_HP);assert.equal(JSON.stringify(box.k),snap);assert.deepEqual([m.x,m.y],[START.x,START.y]);assert.equal(f.zombies[0].hp,f.zombies[0].max);});
test('clear the first three, search the trunk, hold off the second wave, and the street is quiet',()=>{const {box,m,f}=setup();
 const kill=()=>{for(const z of f.zombies){z.delay=0;z.idle=false;f.hit(z,999,1,0);}};
 assert.equal(goal(box.k,true),'See what crashed down the street');kill();assert.equal(box.k.street,'cleared');assert.match(goal(box.k,true),/cruiser/);
 const shells=count(box.k.bag,'shells');assert.ok(f.search());assert.equal(box.k.street,'looted');assert.equal(count(box.k.bag,'shells'),shells+TRUNK[0][1]);assert.equal(count(box.k.bag,'rounds'),TRUNK[1][1]);
 assert.equal(f.zombies.length,WAVES[1].length);assert.equal(f.search(),false,'the trunk is only searched once');kill();assert.equal(box.k.street,'done');assert.equal(f.live.length,0);
 // Coming back out later: nothing waits on a quiet street.
 f.start();assert.equal(f.zombies.length,0);});
test('in the house: the window shows the crash, and the front door goes out once you have a gun',()=>{let k={...normalizeHome(null),woke:true};assert.match(useLines(k,'window').lines[0],/cruiser/);
 assert.equal(useLines(k,'frontdoor').act,undefined);k=take(k,'light-pistol',grid);assert.equal(useLines(k,'frontdoor').act,'leave');assert.equal(loot(k,grid),k,'the trunk waits for the street to be clear');});
test('the street page wires the scene, the sound toggle and the fresh start',async()=>{const fs=await import('node:fs'),app=fs.readFileSync(new URL('../dist/study/app.js',import.meta.url),'utf8'),html=fs.readFileSync(new URL('../dist/index.html',import.meta.url),'utf8');
 assert.match(app,/makeStreetScene\(streetModel,streetBridge\)/);assert.match(app,/FRESH&&!KEEP/);assert.match(html,/id="sound"/);
 const {SOUNDS}=await import('../dist/mc/assets/sounds/library.js'),ids=new Set(SOUNDS.map(s=>s.id));for(const id of ['car-pass','car-crash','pistol','shotgun','pump','shell-in','mag-in','dry-fire','groan','zombie-hit','bite','distant-siren'])assert.ok(ids.has(id),id);
 for(const id of app.matchAll(/audio\.play\('([a-z-]+)'/g))assert.ok(ids.has(id[1]),id[1]);});
