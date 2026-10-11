import test from 'node:test';import assert from 'node:assert/strict';
// The broadcast prepares a few small pictures as it loads; a canvas that accepts any drawing is enough to check the timing.
const ctx=new Proxy({},{get:(o,k)=>k==='createImageData'||k==='getImageData'?(w=1,h=1)=>({data:new Uint8ClampedArray(w*h*4||4)}):k.startsWith?.('create')?()=>({addColorStop(){}}):k==='measureText'?()=>({width:0}):()=>{},set:()=>true});
globalThis.document??={createElement:()=>({getContext:()=>ctx,width:0,height:0})};
const {SHOTS,LENGTH,CUES}=await import('../dist/fall/fall.js'),{SEGMENTS,TV}=await import('../dist/fall/tv.js'),{SEEN_KEY,seen}=await import('../dist/fall/play.js');
test('the intro runs the broadcast in the script order, then the town, the dark room, the street and the title, end to end',()=>{
 assert.deepEqual(SEGMENTS.map(s=>s.id),['ad','trial','montage','news','field','alert','varga','nosignal']);
 for(let i=1;i<SEGMENTS.length;i++)assert.ok(Math.abs(SEGMENTS[i].start-(SEGMENTS[i-1].start+SEGMENTS[i-1].dur))<1e-9,`${SEGMENTS[i].id} follows on`);
 assert.deepEqual(SHOTS.map(s=>s.id),['set','aerial','dark','street','title']);assert.equal(SHOTS[0].start,0);
 for(let i=1;i<SHOTS.length;i++)assert.ok(Math.abs(SHOTS[i].start-(SHOTS[i-1].start+SHOTS[i-1].dur))<1e-9,`${SHOTS[i].id} follows on`);
 assert.ok(Math.abs(SHOTS[1].start-TV.end)<1e-9,'the town comes in as the set goes dark');assert.ok(LENGTH>120&&LENGTH<150,`about two minutes (${LENGTH.toFixed(1)} s)`);});
test('the intro\'s sounds are in order, inside the film, and all in the game\'s library',async()=>{
 const {SOUNDS}=await import('../dist/mc/assets/sounds/library.js'),ids=new Set(SOUNDS.map(s=>s.id));
 for(let i=1;i<CUES.length;i++)assert.ok(CUES[i][0]>=CUES[i-1][0],`${CUES[i][1]} at ${CUES[i][0]} comes after ${CUES[i-1][1]}`);
 for(const [t,id] of CUES){assert.ok(t>=0&&t<LENGTH,`${id} plays inside the film`);assert.ok(ids.has(id),`${id} is a sound the game has`);}});
test('the intro remembers it has been seen, and a blocked store never stops it',()=>{
 const store=new Map(),mem={getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,v)};assert.equal(seen(mem),false);store.set(SEEN_KEY,'1');assert.equal(seen(mem),true);
 assert.equal(seen({getItem(){throw new Error('blocked');}}),false);});
