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
