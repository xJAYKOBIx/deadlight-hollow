import test from 'node:test';import assert from 'node:assert/strict';
test('three backpacks: small, medium and large, each with its grid and weight limit and the pack art that draws it',async()=>{
 const {BAGS,BAG_IDS,slots,bagOf,ITEM_SHAPES}=await import('../dist/mc/assets/gear/bags.js');const {APPEARANCE_OPTIONS}=await import('../dist/mc/assets/characters/appearance.js');
 assert.deepEqual(BAG_IDS,['small','medium','large']);assert.deepEqual(BAG_IDS.map(slots),[20,36,56]);assert.deepEqual(BAG_IDS.map(id=>BAGS[id].kg),[12,20,32]);
 assert.deepEqual(APPEARANCE_OPTIONS.pack,['Leather pack','No pack','Canvas daypack','Frame pack'],'pack choices only ever append');
 for(const id of BAG_IDS)assert.equal(APPEARANCE_OPTIONS.pack[BAGS[id].pack],BAGS[id].name);
 assert.equal(bagOf({pack:0}),'medium');assert.equal(bagOf({}),'medium');assert.equal(bagOf({pack:1}),null);assert.equal(bagOf({pack:3}),'large');
 const fits=(shape,b)=>shape[0]<=b.cols&&shape[1]<=b.rows||shape[1]<=b.cols&&shape[0]<=b.rows;
 assert.ok(!fits(ITEM_SHAPES.shotgun,BAGS.small)&&!fits(ITEM_SHAPES.rifle,BAGS.small),'the daypack is too small for a spare long gun');
 assert.ok(fits(ITEM_SHAPES.rifle,BAGS.medium)&&fits(ITEM_SHAPES.shotgun,BAGS.medium),'the leather pack takes one');});
test('pistols are secondaries with unlimited ammo; shotguns and rifles are primaries',async()=>{
 const {GUNS,slotOf,unlimited}=await import('../dist/study/equipment.js');
 for(const id of Object.keys(GUNS))assert.equal(unlimited(id),!GUNS[id].rifle,id);
 assert.equal(slotOf('light-pistol'),'secondary');assert.equal(slotOf('hand-cannon'),'secondary');assert.equal(slotOf('pump-shotgun'),'primary');assert.equal(slotOf('tactical-ar'),'primary');});
test('the bag grid: stacks fill up, items move and turn only where they fit, sorting packs tight, nothing is lost',async()=>{
 const B=await import('../dist/home/bag.js');const {BAGS,POCKETS}=await import('../dist/mc/assets/gear/bags.js');const M=BAGS.medium,S=BAGS.small;
 let b=B.add(B.emptyBag(),M,'shells',30);assert.deepEqual(b.items.map(o=>o.n),[24,6],'shells stack 24 to a place');assert.equal(B.count(b,'shells'),30);
 b=B.add(b,M,'shells',10);assert.deepEqual(b.items.map(o=>o.n),[24,16],'new shells top up the open stack first');
 b=B.add(b,M,'gun:pump-shotgun',1);const gi=b.items.findIndex(o=>o.id==='gun:pump-shotgun');assert.deepEqual(B.dims(b.items[gi]),[6,1]);
 assert.equal(B.move(b,M,gi,1,0),b,'it cannot overlap the shells');const moved=B.move(b,M,gi,0,4);assert.equal(moved.items[gi].y,4);
 const turned=B.rotate(moved,M,gi),t=turned.items.find(o=>o.id==='gun:pump-shotgun');assert.equal(t.r,1);assert.deepEqual(B.dims(t),[1,6]);
 b=B.remove(moved,'shells',20);assert.equal(B.count(b,'shells'),20);assert.equal(B.remove(b,'shells',99).items.some(o=>o.id==='shells'),false);
 // Smaller pack: the shotgun no longer fits and waits in spill; a bigger pack takes it back with Sort.
 const small=B.refit(moved,S);assert.equal(small.spill.length,1);assert.equal(small.spill[0].id,'gun:pump-shotgun');assert.equal(B.count(small,'shells'),40);
 const back=B.sort(small,M);assert.equal(back.spill.length,0);assert.equal(back.items.filter(o=>o.id==='gun:pump-shotgun').length,1);
 const pockets=B.add(B.emptyBag(),POCKETS,'scrap',100);assert.equal(B.count(pockets,'scrap'),60);assert.equal(pockets.spill[0].n,40,'a full grid spills, it never drops');
 assert.equal(B.weight(B.add(B.emptyBag(),M,'scrap',10),['pump-shotgun','light-pistol']),9.4);
 assert.deepEqual(B.burden(10,20),{over:false,speed:1,drain:1});const heavy=B.burden(25,20);assert.ok(heavy.over&&heavy.speed<1&&heavy.speed>=.7&&heavy.drain>1);
 const fixed=B.normalizeBag({items:[{id:'shells',n:99,x:0,y:0},{id:'cloth',n:2,x:0,y:0},{id:'bogus',n:1,x:1,y:1},{id:'rounds',n:5,x:40,y:0}]},M);
 assert.equal(fixed.items.length,3,'overlapping and off-grid stacks are placed again');assert.equal(fixed.items[0].n,24,'a stack is cut to its size');});
test('searching the house fills the bag, and the bag knows the shotgun shells',async()=>{
 const K=await import('../dist/home/kit.js');const B=await import('../dist/home/bag.js');
 let k={...K.normalizeHome(),woke:true,light:true};k=K.take(k,'pump-shotgun');assert.equal(B.count(k.bag,'shells'),16);assert.equal(B.count(k.bag,'gun-oil'),1);
 k=K.search(k,'counter');assert.equal(B.count(k.bag,'scrap'),3);assert.equal(B.count(k.bag,'electronics'),1);assert.equal(K.search(k,'counter'),k,'a spot is searched once');
 assert.equal(K.verbFor(k,'counter'),'Look');assert.equal(K.useLines(k,'sink').act,'search:sink');assert.match(K.pickupLine('laundry'),/2 cloth and leather/);
 k={...k,bag:B.remove(k.bag,'shells',10)};assert.equal(K.rounds(k),'8 / 6','spare shells are the ones in the bag');});
