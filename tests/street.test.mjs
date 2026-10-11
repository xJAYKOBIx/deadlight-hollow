import test from 'node:test';import assert from 'node:assert/strict';
const {Fight,ZOMBIE,PLAYER_HP,ROAM,SLOW,DIVE,SHOVE,GORE_KILL,CRAWLER}=await import('../dist/street/fight.js');const {StreetModel}=await import('../dist/street/model.js');
const {normalizeHome,take,goal,useLines,loot,TRUNK}=await import('../dist/home/kit.js');const {count}=await import('../dist/home/bag.js');const {carrying}=await import('../dist/mc/assets/gear/bags.js');
const {STREET,START,WAVES,COP,NOTICE,HEAR,PROPS,BLOCKS,HOUSES,OBJECTS,ROAMERS,solidAt,coverAt,COLS,ROWS}=await import('../dist/street/data.js');
const grid=carrying({}),armed=(guns=['light-pistol','pump-shotgun'])=>guns.reduce((k,g)=>take(k,g,grid),{...normalizeHome(null),woke:true});
function setup(k=armed()){const box={k},m=new StreetModel(),f=new Fight(m,{kit:()=>box.k,setKit:v=>box.k=v,grid:()=>grid});m.zombies=f.zombies;f.start();return {box,m,f};}
const waves=f=>f.zombies.filter(z=>z.roam===undefined),run=(f,m,s,input=()=>({}))=>{for(let t=0;t<s;t+=1/60){const i=input();m.update(1/60,i);f.update(1/60,i);}};
test('the street: you step out on your own step, and everything stands on the map',()=>{const m=new StreetModel();assert.deepEqual([m.x,m.y],[START.x,START.y]);assert.equal(m.blocked(m.x,m.y),false);
 for(const o of PROPS)assert.ok(o.x+o.w>-40&&o.x<STREET.w+40&&o.y>=0&&o.y<STREET.h,o.id);
 // The door back in only answers when you face it, so a stray press on arrival does not send you straight back inside.
 m.direction=2;assert.equal(m.target()?.id,undefined);m.direction=6;assert.equal(m.target()?.id,'frontdoor');});
test('the cop waits at the cruiser until you come close or fire, then the others come out of the dark',()=>{const {m,f}=setup();assert.equal(waves(f).length,WAVES[0].length);
 assert.equal(f.out(f.zombies[1]),false,'the others are not out yet');run(f,m,2);assert.equal(f.alert,false);assert.equal(f.zombies[0].x,COP.x,'the cop has not moved');
 Object.assign(m,{x:COP.x-NOTICE+20,y:COP.y+40});run(f,m,.1);assert.equal(f.alert,true);run(f,m,Math.max(...WAVES[0].map(w=>w.delay||0))+.5);assert.ok(f.zombies.every(z=>f.out(z)),'all of them are out');});
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
 box.k={...box.k,guns:{...box.k.guns,'pump-shotgun':{ammo:7}}};f.reload();run(f,m,.05);assert.equal(m.slow,SLOW.reload);});
test('with no shells left the shotgun clicks empty and will not reload',()=>{const k=armed();const {box,m,f}=setup({...k,bag:{items:[],spill:[]},guns:{...k.guns,'pump-shotgun':{ammo:0}}});
 assert.equal(f.fire(),false);const ev=f.drain().map(e=>e.type);assert.ok(ev.includes('empty')&&ev.includes('nospare'));assert.equal(f.reloadTime,0);});
test('going down puts you back on your step with what you had when you came out',()=>{const {box,m,f}=setup();const snap=JSON.stringify(box.k);f.aimAngle=0;f.fire();f.fire();run(f,m,1);
 f.hurt(PLAYER_HP,{x:m.x+10,y:m.y});assert.ok(f.down>0);run(f,m,3.2);assert.equal(f.hp,PLAYER_HP);assert.equal(JSON.stringify(box.k),snap);assert.deepEqual([m.x,m.y],[START.x,START.y]);assert.equal(f.zombies[0].hp,f.zombies[0].max);});
test('clear the first wave, search the trunk, hold off the second wave, and the street is quiet',()=>{const {box,m,f}=setup();
 const kill=()=>{for(const z of f.zombies){z.delay=0;z.idle=false;f.hit(z,999,1,0);}};
 assert.equal(goal(box.k,true),'See what crashed down the street');kill();assert.equal(box.k.street,'cleared');assert.match(goal(box.k,true),/cruiser/);
 const shells=count(box.k.bag,'shells');assert.ok(f.search());assert.equal(box.k.street,'looted');assert.equal(count(box.k.bag,'shells'),shells+TRUNK[0][1]);assert.equal(count(box.k.bag,'rounds'),TRUNK[1][1]);
 assert.equal(f.live.length,WAVES[1].length);assert.equal(f.search(),false,'the trunk is only searched once');kill();assert.equal(box.k.street,'done');assert.equal(f.live.length,0);
 // Coming back out later: nothing waits on a quiet street.
 f.start();assert.equal(waves(f).length,0);});
test('in the house: the window shows the crash, and the front door goes out once you have a gun',()=>{let k={...normalizeHome(null),woke:true};assert.match(useLines(k,'window').lines[0],/cruiser/);
 assert.equal(useLines(k,'frontdoor').act,undefined);k=take(k,'light-pistol',grid);assert.equal(useLines(k,'frontdoor').act,'leave');assert.equal(loot(k,grid),k,'the trunk waits for the street to be clear');});
test('the street page wires the scene, the sound toggle and the fresh start',async()=>{const fs=await import('node:fs'),app=fs.readFileSync(new URL('../dist/study/app.js',import.meta.url),'utf8'),html=fs.readFileSync(new URL('../dist/index.html',import.meta.url),'utf8');
 assert.match(app,/makeStreetScene\(streetModel,streetBridge\)/);assert.match(app,/FRESH&&!KEEP/);assert.match(html,/id="sound"/);
 const {SOUNDS}=await import('../dist/mc/assets/sounds/library.js'),ids=new Set(SOUNDS.map(s=>s.id));for(const id of ['car-pass','car-crash','pistol','shotgun','pump','shell-in','mag-in','dry-fire','groan','zombie-hit','bite','distant-siren'])assert.ok(ids.has(id),id);
 for(const id of app.matchAll(/audio\.play\('([a-z-]+)'/g))assert.ok(ids.has(id[1]),id[1]);});
test('the neighbourhood: five blocks by five, the same every time, and everything you can use stands somewhere you can reach',()=>{
 assert.equal(BLOCKS.length,COLS*ROWS);assert.equal(COLS,5);assert.equal(ROWS,5);assert.ok(HOUSES.length>=90,'a house on every lot');assert.equal(new Set(PROPS.map(o=>o.id)).size,PROPS.length,'every prop has its own id');
 for(const o of OBJECTS){assert.ok(!solidAt(o.x,o.y,8),o.id+' can be reached');}assert.ok(!solidAt(START.x,START.y,10));
 // Houses stop bullets; a chain-link fence does not.
 const h=HOUSES[0];assert.ok(coverAt(h.x+h.w/2,h.y+h.h/2));const cl=PROPS.find(o=>o.kind==='chainlink');assert.equal(coverAt(cl.x+cl.w/2,cl.y+cl.h/2),null);
 assert.ok(ROAMERS.length>=40);for(const r of ROAMERS)assert.ok(!solidAt(r.x,r.y,8),'a wanderer starts in the open');});
test('wanderers drift round their yards, come for you when they see you or hear a shot, and give up once you are far away',()=>{const {m,f}=setup(),r=f.zombies.find(z=>z.roam!==undefined);
 assert.equal(f.live.length,WAVES[0].length,'the story only counts the waves');run(f,m,8);assert.ok(f.zombies.some(z=>z.roam!==undefined&&Math.hypot(z.x-z.sx,z.y-z.sy)>2),'they wander');
 assert.ok(Math.hypot(r.x-r.sx,r.y-r.sy)<=Math.hypot(ROAM.stroll.x,ROAM.stroll.y)+2,'but not far');assert.equal(r.hunt,false);
 Object.assign(m,{x:r.x+NOTICE-30,y:r.y});run(f,m,.6);assert.equal(r.hunt,true,'it saw you');assert.ok(f.threat().includes(r),'and it counts as coming for you');
 Object.assign(m,{x:r.x+ROAM.lose+50,y:r.y});run(f,m,.1);assert.equal(r.hunt,false,'gone');
 const q=f.zombies.find(z=>z.roam!==undefined&&z!==r&&z.hp>0);Object.assign(m,{x:q.x+HEAR-40,y:q.y});f.aimAngle=Math.PI;f.fire();assert.equal(q.hunt,true,'it heard the shot');});
test('a wanderer you put down stays down for the night, and the rest go back where they were when you start again',()=>{const {m,f}=setup(),[a,b]=f.zombies.filter(z=>z.roam!==undefined);
 f.hit(a,999,1,0);b.x+=30;f.start();const now=f.zombies.filter(z=>z.roam!==undefined);assert.ok(now.includes(a)&&a.hp<=0);assert.equal(b.x,b.sx);assert.equal(now.length,ROAMERS.length);});
test('the dead find a way round: the flow leads round a fence to you, and a clear line goes straight',async()=>{const {Flow,open,clearLine,PATH}=await import('../dist/street/paths.js');
 // A back yard: you on one side of a side fence, the flow spread from you; a square just across the fence is reached the long way round.
 const fence=PROPS.find(o=>o.kind==='woodfenceV'),y=fence.y+fence.h/2,me={x:fence.x+30,y},f=new Flow();f.update(1,[me]);
 const c=v=>Math.floor(v/PATH.cell),near=f.at(c(me.x+16),c(y)),across=f.at(c(fence.x-24),c(y));assert.ok(near<10);assert.ok(across>near+8,'across the fence is further than straight-line');
 assert.equal(clearLine(fence.x-24,y,me.x,y),false,'the fence is in the way');assert.ok(clearLine(me.x,y,me.x+40,y));
 const w=f.way(fence.x-24,y);if(across<0xffff)assert.ok(w&&Math.abs(w.y)>.3,'it heads along the fence, not into it');});
test('your flashlight: a wanderer it falls on sees you from further off, one behind you does not',async()=>{const {clearLine}=await import('../dist/street/paths.js');const {m,f}=setup();
 const r=f.zombies.find(z=>z.roam!==undefined&&clearLine(z.x-260,z.y,z.x,z.y)&&!solidAt(z.x-260,z.y,12));assert.ok(r,'a wanderer in the open');
 Object.assign(m,{x:r.x-260,y:r.y});f.beam={x:m.x,y:m.y,a:Math.PI};run(f,m,.2);assert.equal(r.hunt,false,'the light points away and it is out of sight');
 f.beam={x:m.x,y:m.y,a:0};f.update(1/60,{});assert.equal(r.hunt,true,'in the beam, it sees you');});
test('the dive: a burst along the way you move that costs stamina, dodges a bite in the air and stops you shooting till you are up',async()=>{const {Stamina}=await import('../dist/camp/fishing.js');
 const {m,f}=setup(),z=f.zombies[0];m.stamina=new Stamina();Object.assign(m,{x:z.x-ZOMBIE.reach+2,y:z.y});f.wake();run(f,m,.05);assert.equal(z.state,'windup');
 const x0=m.x,s0=m.stamina.value;let first=true;run(f,m,ZOMBIE.bite.windup,()=>{const i={x:-1,y:0,dive:first};first=false;return i;});
 assert.equal(f.hp,PLAYER_HP,'the bite missed');assert.ok(x0-m.x>50,'you went a good way: '+(x0-m.x));assert.ok(m.stamina.value<=s0-DIVE.cost+1,'it cost stamina');
 assert.ok(f.dive,'still getting up');assert.equal(f.fire(),false,'no shooting on the ground');run(f,m,DIVE.rise+.1);assert.equal(f.dive,null,'back up');
 // Winded, you cannot.
 m.stamina.value=2;run(f,m,DIVE.cool+.05);run(f,m,1/60,()=>({x:1,y:0,dive:true}));assert.equal(f.dive,null);});
test('a killing shot throws the body back, and it slides to a stop',()=>{const {m,f}=setup(),z=f.zombies[0];Object.assign(m,{x:z.x-60,y:z.y});f.wake();z.hp=1;f.aimAngle=0;
 const x0=z.x;assert.ok(f.fire());run(f,m,1,()=>({}));assert.equal(z.hp,0);assert.ok(z.x>x0+20,'slid back: '+(z.x-x0));assert.equal(z.vx,0,'and stopped');});
test('gore: a close shotgun kill cuts one in two and the top half crawls on, grabs your ankle and holds you until you dive free',()=>{const {box,m,f}=setup(),z=f.zombies[0];f.rand=()=>0;
 Object.assign(m,{x:z.x-GORE_KILL.near+20,y:z.y});f.wake();f.hit(z,999,1,0);const e=f.drain().find(e=>e.type==='kill');assert.equal(e.gore,'half');const c=e.crawler;assert.ok(c&&c.kind==='crawler');
 assert.equal(f.out(c),false,'the top half is still landing');assert.ok(f.live.includes(c),'it counts as one of the wave');run(f,m,CRAWLER.rise+.05);assert.ok(f.out(c));
 const hp=f.hp;run(f,m,6);assert.ok(f.hp<=hp-CRAWLER.damage,'it grabbed you');assert.ok(f.grab>0||f.hp<hp);
 Object.assign(c,{x:m.x+CRAWLER.reach,y:m.y,state:'windup',t:.01,cool:0});run(f,m,.05);assert.ok(f.grab>0);assert.equal(m.slow,CRAWLER.slow,'held nearly still');
 m.stamina&&(m.stamina.value=100);f.update(1/60,{dive:true,x:-1,y:0});assert.equal(f.grab,0,'a dive tears you free');});
test('gore: a pistol kill sometimes takes the head, and with gore reduced nothing comes apart',()=>{const k=armed();const {box,m,f}=setup({...k,held:'light-pistol'}),z=f.zombies[0];f.rand=()=>0;f.hit(z,999,1,0);
 assert.equal(f.drain().find(e=>e.type==='kill').gore,'head');const g=setup(),z2=g.f.zombies[0];g.f.gore=false;g.f.rand=()=>0;Object.assign(g.m,{x:z2.x-30,y:z2.y});g.f.hit(z2,999,1,0);
 const e=g.f.drain().find(e=>e.type==='kill');assert.equal(e.gore,null);assert.equal(e.crawler,null);});
test('scavenging: every car, bin, shed and stash and most houses can be searched; a search takes a moment standing still and fills your bag',async()=>{const {LOOT,lootOf,scavenge}=await import('../dist/home/kit.js');const {SEARCH}=await import('../dist/street/fight.js');
 const spots=OBJECTS.filter(o=>o.loot);for(const k of Object.keys(LOOT))assert.ok(spots.some(o=>o.loot===k),k);for(const o of spots)assert.equal(lootOf(o).length,lootOf(o).length);
 assert.ok(spots.filter(o=>o.loot==='cache').length>=5,'a few stashes');const cache=spots.find(o=>o.loot==='cache');assert.ok(lootOf(cache).find(([id])=>id==='shells')[1]>=10,'a stash is a big load');
 const {box,m,f}=setup();const before=count(box.k.bag,'shells');Object.assign(m,{x:cache.x,y:cache.y});assert.ok(f.scavenge(cache));run(f,m,SEARCH.time*.5);assert.ok(f.searching,'still searching');
 run(f,m,SEARCH.time*.6);assert.equal(f.searching,null);assert.ok(count(box.k.bag,'shells')>=before+10);assert.ok(box.k.looted.includes(cache.id));assert.equal(f.scavenge(cache),false,'only once');
 // Moving stops a search, and nothing is taken.
 const car=spots.find(o=>o.loot==='car');assert.ok(f.scavenge(car));run(f,m,.2,()=>({x:1,y:0}));assert.equal(f.searching,null);assert.ok(!box.k.looted.includes(car.id));});
test('the dead sometimes drop things, and walking over them picks them up',()=>{const {box,m,f}=setup(),z=f.zombies[0];f.rand=()=>0;Object.assign(m,{x:z.x-200,y:z.y});f.hit(z,999,1,0);assert.equal(f.drops.length,1);
 const d=f.drops[0],had=count(box.k.bag,d.id);Object.assign(m,{x:d.x,y:d.y});run(f,m,.05);assert.equal(f.drops.length,0);assert.equal(count(box.k.bag,d.id),had+d.n);});
