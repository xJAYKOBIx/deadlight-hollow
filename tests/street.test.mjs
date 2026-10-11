import test from 'node:test';import assert from 'node:assert/strict';
const {Fight,ZOMBIE,PLAYER_HP,ROAM,SLOW,DIVE,SHOVE,GORE_KILL,CRAWLER}=await import('../dist/street/fight.js');const {StreetModel}=await import('../dist/street/model.js');
const {normalizeHome,take,goal,useLines,loot,TRUNK}=await import('../dist/home/kit.js');const {count}=await import('../dist/home/bag.js');const {carrying}=await import('../dist/mc/assets/gear/bags.js');
const {STREET,START,WAVES,COP,NOTICE,HEAR,PROPS,BLOCKS,HOUSES,OBJECTS,ROAMERS,SOLIDS,DISTRICTS,roadNear,solidAt,coverAt,COLS,ROWS,AREA_NAMES,areaAt}=await import('../dist/street/data.js');
const grid=carrying({}),armed=(guns=['light-pistol','pump-shotgun'])=>guns.reduce((k,g)=>take(k,g,grid),{...normalizeHome(null),woke:true,light:true});
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
test('the suburbs: nine districts, the same every time, and everything you can use stands somewhere you can reach',()=>{
 assert.equal(DISTRICTS.length,9);assert.equal(BLOCKS.length,COLS*ROWS);assert.equal(new Set(DISTRICTS.map(d=>d.id)).size,9,'every district is its own kind');
 assert.ok(HOUSES.length>=25,'the house districts are full of houses');assert.equal(new Set(PROPS.map(o=>o.id)).size,PROPS.length,'every prop has its own id');
 for(const o of OBJECTS){assert.ok(!solidAt(o.x,o.y,8),o.id+' can be reached');}assert.ok(!solidAt(START.x,START.y,10));
 // Houses stop bullets; a chain-link fence does not; the creek stops feet but not bullets.
 const h=HOUSES[0];assert.ok(coverAt(h.x+h.w/2,h.y+h.h/2));const cl=PROPS.find(o=>o.kind==='chainlink');assert.equal(coverAt(cl.x+cl.w/2,cl.y+cl.h/2),null);
 const w=SOLIDS.find(s=>s.kind==='water');assert.ok(w&&solidAt(w.x+w.w/2,w.y+w.h/2,4));assert.equal(coverAt(w.x+w.w/2,w.y+w.h/2),null);
 // The landmarks you steer by are on the map, and each job sits in its own district.
 for(const k of ['watertower','church','school','gym','pricesign','lighttower','gazebo','excavator'])assert.ok(PROPS.some(o=>o.kind===k),k);
 const dist=(x,y)=>DISTRICTS.find(d=>x>=d.x&&x<d.x+d.w&&y>=d.y&&y<d.y+d.h)?.id;
 assert.equal(dist(...['job-radio'].map(id=>OBJECTS.find(o=>o.id===id)).map(o=>[o.x,o.y])[0]),'maze');assert.equal(dist(...[OBJECTS.find(o=>o.id==='job-power')].map(o=>[o.x,o.y])[0]),'site');
 assert.equal(dist(...[OBJECTS.find(o=>o.id==='job-supplies')].map(o=>[o.x,o.y])[0]),'park');assert.equal(dist(...[OBJECTS.find(o=>o.id==='evac')].map(o=>[o.x,o.y])[0]),'school');
 // The corner names the district you are in, starting on your street.
 assert.equal(areaAt(START.x,START.y),'yours');for(const d of DISTRICTS)assert.ok(AREA_NAMES[d.id]&&AREA_NAMES[d.id].length<=13,d.id);
 // Every patrol comes down a real street.
 for(const [x,y] of [[100,100],[3000,3000],[5900,5800],[2100,4500]]){const p=roadNear(x,y);assert.ok(!solidAt(p.x,p.y,10),`a street near ${x},${y}`);}
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
 const fence=PROPS.find(o=>o.kind==='woodfenceV'&&clearLine(o.x+20,o.y+o.h/2,o.x+80,o.y+o.h/2)&&clearLine(o.x-60,o.y+o.h/2,o.x-12,o.y+o.h/2)),y=fence.y+fence.h/2,me={x:fence.x+30,y},f=new Flow();f.update(1,[me]);
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
test('fighting a swarm never queues the next one: the meter holds, and clearing it drops the street to Stirring',async()=>{const {HEAT}=await import('../dist/street/fight.js');
 const {box,m,f}=setup();box.k={...box.k,street:'done'};f.start();f.noise(100);run(f,m,.05);assert.equal(f.level,3);run(f,m,5);
 const sw=()=>f.zombies.filter(z=>z.swarm&&z.hp>0);assert.ok(sw().length>=HEAT.horde.size[0],'a swarm');const h0=f.heat;
 for(let i=0;i<10;i++)f.noise(HEAT.shot['pump-shotgun']);assert.equal(f.heat,h0,'shots during the swarm add nothing');
 // Held off long past the horde timer, no second swarm arrives while the first is alive.
 const n=sw().length;for(const z of sw())z.x=m.x+300;f.drain();run(f,m,HEAT.horde.every+5,()=>{f.hp=99;for(const z of sw()){z.x=m.x+300;z.y=m.y;}return {};});
 assert.equal(f.drain().filter(e=>e.type==='horde').length,0,'no new swarm while one is alive');assert.ok(sw().length<=n);
 for(const z of sw())z.hp=0;run(f,m,.05);assert.ok(f.heat<=HEAT.after&&f.level<3,'cleared: back to Stirring');assert.ok(f.drain().some(e=>e.type==='swarm-over'));
 assert.ok(f.hordeT>=HEAT.horde.every-1,'the next swarm is a full wait away');});
test('heat: shots and alarms raise it and quiet lets it fall; on a quiet street it sends patrols, and at the top a horde that already knows where you are',async()=>{const {HEAT}=await import('../dist/street/fight.js');
 const {box,m,f}=setup();box.k={...box.k,street:'done'};f.start();f.aimAngle=0;f.fire();assert.equal(f.heat,HEAT.shot['pump-shotgun']);run(f,m,HEAT.quiet-1);assert.equal(f.heat,HEAT.shot['pump-shotgun'],'it holds for a while');
 run(f,m,4);assert.ok(f.heat<HEAT.shot['pump-shotgun'],'then cools');
 // A patrol comes down a street from out of sight, heading your way.
 f.patrolT=0;const n0=f.zombies.length;run(f,m,.05);const p=f.zombies.filter(z=>z.extra);assert.ok(p.length>=HEAT.size[0]&&p.length<=HEAT.size[1]);assert.ok(p.every(z=>Math.hypot(z.x-m.x,z.y-m.y)>HEAT.spawn.near*.8&&!z.hunt&&z.route?.length));
 const d0=Math.min(...p.map(z=>Math.hypot(z.x-m.x,z.y-m.y)));run(f,m,8);assert.ok(Math.min(...p.map(z=>Math.hypot(z.x-m.x,z.y-m.y)))<d0-60,'they come closer');
 // Swarming: a horde, hunting from the start.
 f.noise(100);run(f,m,.05);assert.equal(f.level,3);run(f,m,5);const h=f.zombies.filter(z=>z.extra&&z.hunt&&z.state==='chase');assert.ok(h.length>=HEAT.horde.size[0],'a horde');
 // Walk well away and the ones that have not seen you are let go.
 for(const z of f.zombies)if(z.extra){z.hunt=false;z.x=m.x+HEAT.gone+100;}run(f,m,.05);assert.equal(f.zombies.filter(z=>z.extra).length,0);
 // During the tutorial's own fight, no patrols.
 const g=setup();g.f.patrolT=0;run(g.f,g.m,.1);assert.equal(g.f.zombies.filter(z=>z.extra).length,0);});
test('runners sprint, crouch and leap: the leap lands if you stand there, and one that misses is left sprawled',async()=>{const {RUNNER}=await import('../dist/street/fight.js');const {box,m,f}=setup();
 const z=f.zombies[0];Object.assign(z,{kind:'runner',hp:RUNNER.hp,max:RUNNER.hp,idle:false});f.wake();Object.assign(m,{x:z.x-RUNNER.lunge.at+10,y:z.y});run(f,m,.05);assert.equal(z.state,'crouch');assert.ok(z.tell>0,'it shows a tell');
 const hp=f.hp;run(f,m,RUNNER.lunge.tell+RUNNER.lunge.time);assert.equal(f.hp,hp-RUNNER.lunge.damage,'the leap lands');
 const g=setup(),r=g.f.zombies[0];Object.assign(r,{kind:'runner',hp:RUNNER.hp,max:RUNNER.hp,idle:false});g.f.wake();Object.assign(g.m,{x:r.x-RUNNER.lunge.at+10,y:r.y});run(g.f,g.m,.05);assert.equal(r.state,'crouch');
 g.m.y+=70;run(g.f,g.m,RUNNER.lunge.tell+RUNNER.lunge.time+.02);assert.equal(g.f.hp,PLAYER_HP,'stepped aside');assert.ok(r.stagger>0,'sprawled');});
test('brutes: a shotgun barely moves one; it charges in a straight line, and one that hits a wall is stunned and takes more',async()=>{const {BRUTE}=await import('../dist/street/fight.js');const {box,m,f}=setup();
 const z=f.zombies[0];Object.assign(z,{kind:'brute',hp:BRUTE.hp,max:BRUTE.hp,idle:false,x:5600,y:1990});Object.assign(m,{x:5400,y:1990});f.wake();f.zombies.slice(1).forEach(q=>q.delay=99);
 run(f,m,.05);assert.equal(z.state,'set');assert.ok(z.tell>0);run(f,m,BRUTE.charge.tell+.05);assert.equal(z.state,'charge');
 // You dive out of the way; it carries on past where you were.
 m.y-=80;run(f,m,BRUTE.charge.time);assert.equal(f.hp,PLAYER_HP);assert.ok(z.x<5600-150,"it kept going");
 // A shotgun blast barely shoves it, and a stunned brute takes half as much again.
 const b=setup(),q=b.f.zombies[0];Object.assign(q,{kind:'brute',hp:BRUTE.hp,max:BRUTE.hp,idle:false});b.f.hit(q,100,1,0);assert.ok(Math.abs(q.vx)<SHOVE['pump-shotgun'].push*.5);assert.equal(q.stagger,0);
 q.stun=1;const before=q.hp;b.f.hit(q,100,1,0);assert.equal(before-q.hp,100*BRUTE.charge.weak);});
test('climbing: push into a low fence for a moment and you hop over it, bites miss on the way, and the farm fence is too high',async()=>{const {VAULT}=await import('../dist/street/fight.js');const {box,m,f}=setup({...armed(),street:'done'});
 const fence=PROPS.find(o=>o.id==='rear-y');Object.assign(m,{x:fence.x+200,y:fence.y+fence.h+m.radius*.85+1});const up=()=>({x:0,y:-1});
 run(f,m,VAULT.push*.5,up);assert.equal(f.vault,null,'a brush against it is not a climb');run(f,m,VAULT.push*.6+.05,up);assert.ok(f.vault,'pushing a moment longer is');
 assert.equal(f.air,true,'in the air bites miss');assert.equal(f.fire(),false,'and you cannot shoot');run(f,m,VAULT.time,up);assert.equal(f.vault,null);assert.ok(m.y<fence.y,'over it');
 // A fence along the side of a yard is climbed east or west.
 const side=PROPS.find(o=>o.kind==='woodfenceV');Object.assign(m,{x:side.x-m.radius*.85-1,y:side.y+side.h/2});f.vault=null;run(f,m,VAULT.push+VAULT.time+.1,()=>({x:1,y:0}));assert.ok(m.x>side.x+side.w,'over the side fence');
 // The farm fence round the edge of town stays shut.
 const farm=PROPS.find(o=>o.id==='farm-n2');Object.assign(m,{x:farm.x+300,y:farm.y+farm.h+m.radius*.85+1});run(f,m,1,up);assert.ok(m.y>farm.y,'still inside the farm fence');});
test('the first job: three things anywhere in town in any order, then call the truck, hold out, and get in the back',async()=>{const {JOB}=await import('../dist/street/fight.js');const {jobsDone,GO_BAG}=await import('../dist/home/kit.js');const {TARGETS}=await import('../dist/street/model.js');
 const {box,m,f}=setup({...armed(),street:'done'}),T=id=>TARGETS.find(t=>t.id===id),at=t=>Object.assign(m,{x:t.x,y:t.y});f.zombies.length=0;
 assert.match(goal(box.k,true),/radio.*generator.*go-bag/);assert.equal(f.can(T('evac')),false,'the truck cannot be called yet');assert.equal(f.can(T('board')),false);
 for(const id of ['job-radio','job-power','job-supplies'])assert.ok(!solidAt(T(id).x,T(id).y,8),id+' can be reached');
 // The go-bag first: a moment standing still, then it is in your bag. Moving stops a job.
 at(T('job-supplies'));const shells=count(box.k.bag,'shells');assert.ok(f.work(T('job-supplies')));run(f,m,.3,()=>({x:1,y:0}));assert.equal(f.searching,null,'walking off stops it');
 at(T('job-supplies'));f.work(T('job-supplies'));run(f,m,JOB.time.supplies+.1);assert.deepEqual(box.k.mission.done,['supplies']);assert.equal(count(box.k.bag,'shells'),shells+GO_BAG.find(([id])=>id==='shells')[1]);assert.equal(f.can(T('job-supplies')),false);
 // The generator is loud: the heat jumps and a horde comes a few seconds later.
 at(T('job-power'));f.work(T('job-power'));run(f,m,JOB.time.power+.1);assert.ok(box.k.mission.done.includes('power'));assert.ok(f.heat>=JOB.power.noise);f.drain();run(f,m,JOB.power.horde+.1);assert.ok(f.drain().some(e=>e.type==='horde'),'a horde heard it');
 // Going down after a job keeps the job done.
 at(T('job-radio'));f.work(T('job-radio'));run(f,m,JOB.time.radio+.1);assert.ok(jobsDone(box.k));f.hurt(999,{x:m.x+10,y:m.y});run(f,m,3.2);assert.ok(jobsDone(box.k),'still done after going down');assert.match(goal(box.k,true),/east end/);
 // The call: a hold-out against hordes (on night one it goes wrong; see the next test).
 f.zombies.length=0;at(T('evac'));assert.ok(f.can(T('evac')));f.work(T('evac'));assert.equal(f.evac.state,'hold');f.drain();
 run(f,m,JOB.evac.every*3+.5,()=>{f.hp=PLAYER_HP;return {};});assert.ok(f.drain().filter(e=>e.type==='horde').length>=3,'hordes come all through the hold-out');});
test('night one ends in the hold-out: overrun, he dies and gets up, and the one who watched puts him down and takes his gear to the truck',async()=>{
 const {DEATH,RISEN,JOB}=await import('../dist/street/fight.js');const K=await import('../dist/home/kit.js');const {TARGETS}=await import('../dist/street/model.js');
 const {box,m,f}=setup({...armed(),street:'done',mission:{done:['radio','power','supplies'],out:false}}),T=id=>TARGETS.find(t=>t.id===id);f.zombies.length=0;
 Object.assign(m,{x:T('evac').x,y:T('evac').y});f.work(T('evac'));f.drain();
 run(f,m,DEATH.overrun+.2,()=>{f.hp=PLAYER_HP;return {};});let ev=f.drain();assert.ok(ev.some(e=>e.type==='overrun'));assert.ok(f.zombies.filter(z=>z.extra).length>=DEATH.shamblers+DEATH.runners);
 const left=f.evac.t;run(f,m,1,()=>{f.hp=PLAYER_HP;return {};});assert.equal(f.evac.t,left,'the truck is held up');
 for(let t=0;t<DEATH.doom+2&&!f.dead;t+=1/60){m.update(1/60,{});f.update(1/60,{});}assert.ok(f.dead,'he does not get back up this time');ev=f.drain();assert.ok(ev.some(e=>e.type==='death'));assert.ok(!ev.some(e=>e.type==='restart'));
 const body=f.dead.body;assert.equal(body.kind,'risen');assert.ok(f.torch,'his flashlight lies where he dropped it');
 run(f,m,DEATH.cine.end+.2);ev=f.drain();assert.ok(ev.some(e=>e.type==='rose'));assert.ok(ev.some(e=>e.type==='watched'));assert.equal(body.state,'up');
 const watch=f.dead.watch;box.k=K.reborn(box.k,{x:body.x,y:body.y,dir:body.direction});f.reborn();
 assert.equal(f.dead,null);assert.ok(Math.hypot(m.x-watch.x,m.y-watch.y)<1,'you come out of the door across the street');assert.equal(f.held,K.OWN_GUN);assert.equal(f.hp,PLAYER_HP);
 assert.ok(!f.zombies.some(z=>z.extra),'the overrun has moved on');assert.ok(body.lurk&&body.hp===RISEN.hp&&f.zombies.includes(body));assert.ok(f.evac.paused,'the truck waits on you');
 f.hit(body,9999,1,0);ev=f.drain();assert.ok(ev.some(e=>e.type==='fallen'));assert.ok(f.remains);
 const t={id:'remains',remains:true,x:f.remains.x,y:f.remains.y};Object.assign(m,{x:t.x,y:t.y});f.zombies.length=0;assert.ok(f.work(t));run(f,m,RISEN.search+.1);
 assert.equal(box.k.corpse.taken,true);assert.ok(box.k.guns['pump-shotgun']&&box.k.guns['light-pistol']&&box.k.guns[K.OWN_GUN],'all three guns');ev=f.drain();assert.ok(ev.some(e=>e.type==='reclaimed'));assert.equal(f.evac.state,'drive');
 f.zombies.length=0;run(f,m,JOB.evac.drive+.1);assert.equal(f.evac.state,'wait');f.zombies.length=0;Object.assign(m,{x:T('board').x,y:T('board').y});f.drain();assert.ok(f.work(T('board')));assert.ok(f.drain().some(e=>e.type==='extract'));assert.equal(box.k.mission.out,true);
 // Going down as your own survivor is not the end: back where you came out, as before.
 const {box:b2,m:m2,f:f2}=setup(box.k);f2.hurt(9999,{x:m2.x+10,y:m2.y});assert.equal(f2.dead,null);assert.ok(f2.down>0&&f2.down<10);});
const special=(f,kind,x,y)=>{const hp=f.hpOf(kind,kind),z={kind,extra:true,roam:-1,look:kind,x,y,sx:x,sy:y,direction:4,frame:0,phase:0,hp,max:hp,idle:false,delay:0,state:'chase',hunt:true,t:0,vx:0,vy:0,stagger:0,tell:0,cool:0,flash:0,groan:9,wt:0,wx:x,wy:y,acc:0};f.zombies.push(z);return z;};
test('screamers keep their distance and scream when they see you: a hit breaks it, a finished scream brings a horde',async()=>{const {SCREAMER}=await import('../dist/street/fight.js');const {box,m,f}=setup({...armed(),street:'done'});
 Object.assign(m,{x:5300,y:1990});f.zombies.length=0;f.patrolT=999;const z=special(f,'screamer',5440,1960),C=SCREAMER.scream;
 run(f,m,2.2);assert.equal(z.state,'scream','it stops and screams');assert.ok(Math.hypot(z.x-m.x,z.y-m.y)>SCREAMER.keep-40,'from a distance');
 f.aimAngle=Math.atan2(z.y-m.y,z.x-m.x);f.kit().held;box.k={...box.k,held:'light-pistol'};f.held=f.gunId;f.hit(z,5,1,0);assert.equal(z.state,'chase','a hit breaks it');f.drain();
 const heat=f.heat;run(f,m,C.again+C.tell+.3);const ev=f.drain();assert.ok(ev.some(e=>e.type==='screamed'),'it tries again and finishes');assert.ok(ev.some(e=>e.type==='horde'),'the horde is coming');assert.ok(f.heat>=heat+C.heat-3);});
test('bloaters swell and burst close to you, throwing you back; the gas hangs and kills the dead caught in it',async()=>{const {BLOATER}=await import('../dist/street/fight.js');const {box,m,f}=setup({...armed(),street:'done'});
 Object.assign(m,{x:5300,y:1990});f.zombies.length=0;f.patrolT=999;const b=special(f,'bloater',5380,1990),B=BLOATER.burst;
 for(let t=0;t<5&&b.state!=='swell';t+=1/60){m.update(1/60,{});f.update(1/60,{});}assert.equal(b.state,'swell','close in, it swells');f.drain();run(f,m,BLOATER.swell.tell+.05);const ev=f.drain();assert.ok(ev.some(e=>e.type==='burst'));assert.equal(b.hp,0);assert.ok(f.hp<=PLAYER_HP-B.damage,'the burst hurts');assert.ok(f.shove,'and throws you back');
 assert.equal(f.clouds.length,1);assert.equal(b.gore,null,'it never comes apart');
 // Shot among others: the burst hurts them and the gas finishes them.
 const {m:m2,f:f2}=setup({...armed(),street:'done'});Object.assign(m2,{x:5000,y:1990});f2.zombies.length=0;f2.patrolT=999;const b2=special(f2,'bloater',5400,1990),near=[special(f2,'shambler',5420,2000),special(f2,'runner',5385,1975)];near[0].look='worker';
 f2.hit(b2,999,1,0);assert.ok(near.every(z=>z.hp<z.max),'the burst hurts the dead round it');for(let t=0;t<B.time;t+=1/60){f2.hp=PLAYER_HP;m2.update(1/60,{});f2.update(1/60,{});}assert.ok(near.every(z=>z.hp<=0),'the gas kills them');assert.equal(f2.clouds.length,0,'and clears');});
test('spitters lob acid where you are going: stand there and it lands on you, move and it misses, and the pool burns',async()=>{const {SPITTER}=await import('../dist/street/fight.js');const {m,f}=setup({...armed(),street:'done'});
 Object.assign(m,{x:5300,y:1990});f.zombies.length=0;f.patrolT=999;const z=special(f,'spitter',5520,1990),P=SPITTER.spit;
 run(f,m,P.tell+.1);assert.equal(f.globs.length,1,'it spits');const g=f.globs[0];assert.ok(Math.hypot(g.x1-m.x,g.y1-m.y)<5,'at where you stand');run(f,m,P.flight+.05);assert.ok(f.hp<=PLAYER_HP-P.damage,'and it lands on you');assert.equal(f.pools.length,1);
 // Stand in the pool and it burns.
 const hp=f.hp;run(f,m,1.1);assert.ok(f.hp<hp,'the pool burns');
 // Walk away from the next one and it misses.
 Object.assign(m,{x:5300,y:2100});f.hp=PLAYER_HP;z.cool=0;run(f,m,P.tell+.05,()=>({x:-1,y:0}));assert.equal(f.globs.length,1);run(f,m,P.flight+.05,()=>({x:-1,y:0}));assert.equal(f.hp,PLAYER_HP,'it misses you on the move');
 assert.ok(Math.hypot(z.x-m.x,z.y-m.y)>SPITTER.keep[0]-20,'it keeps its distance');});
