import test from'node:test';import assert from'node:assert/strict';import{createRequire}from'node:module';import{APPEARANCE_KEY,ZOMBIE_KEY,KIND_KEY,APPEARANCE_OPTIONS,UNIFORMS,DEFAULT_APPEARANCE,normalizeAppearance,readAppearance,saveAppearance,randomAppearance}from'../dist/study/appearance.js';import{survivor}from'../dist/study/character.js';
const require=createRequire(import.meta.url),{createCanvas}=require((process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES||'/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules')+'/@napi-rs/canvas');
test('study appearance safely restores, validates and persists independently',()=>{let data;const storage={getItem:k=>{if(k===KIND_KEY)return null;assert.equal(k,APPEARANCE_KEY);return data},setItem:(k,v)=>{if(k===KIND_KEY)return assert.equal(v,'survivor');assert.equal(k,APPEARANCE_KEY);data=v}};assert.deepEqual(readAppearance(storage),DEFAULT_APPEARANCE);const look={hair:2,beard:3,hat:1,color:2};assert.equal(saveAppearance(storage,look),true);assert.deepEqual(readAppearance(storage),{...DEFAULT_APPEARANCE,...look});data='broken';assert.deepEqual(readAppearance(storage),DEFAULT_APPEARANCE);assert.deepEqual(normalizeAppearance({hair:99,beard:-1,hat:'1',color:2,extra:1}),{...DEFAULT_APPEARANCE,color:2});assert.deepEqual(readAppearance(undefined),DEFAULT_APPEARANCE);assert.equal(saveAppearance(undefined,look),false);assert.equal(normalizeAppearance({beard:1}).beard,1);assert.equal(normalizeAppearance({beard:7}).beard,0);assert.equal(normalizeAppearance({hair:10,color:6}).hair,0);assert.equal(normalizeAppearance({beard:3,hat:5}).hat,5);assert.deepEqual(APPEARANCE_OPTIONS.beard,['Clean shaven','Stubble','Mustache','Full beard','Goatee','Short beard','Long beard']);});
function render(d,f,look){const c=createCanvas(160,192),g=c.getContext('2d');g.scale(2,2);survivor(g,d,f,true,look);return g.getImageData(0,0,160,192).data;}
test('head choices preserve the approved body and remain inside the atlas in all directions and walking frames',()=>{let looks=[{hair:1},{hair:2},{hair:3},{beard:1},{beard:2},{beard:3},{hat:1},{hat:2},{hair:2,beard:3,hat:1,color:1},{hair:2,beard:2,hat:2,color:2},{hair:3,beard:3,color:3}];for(let hat of[3,4,5])for(let hair of[0,1,2,3])for(let beard of[0,3])looks.push({hat,hair,beard,color:hair});for(let d=0;d<8;d++)for(let f=0;f<17;f++){const original=render(d,f,{});for(const look of looks){let a=render(d,f,look);assert.deepEqual(a.slice(92*160*4),original.slice(92*160*4),`body changed ${d}/${f}/${JSON.stringify(look)}`);for(let x=0;x<160;x++)assert.equal(a[(x)*4+3]+a[(191*160+x)*4+3],0);for(let y=0;y<192;y++)assert.equal(a[y*160*4+3]+a[(y*160+159)*4+3],0);}}});
test('every hair, beard, hat and color choice visibly changes the front portrait',()=>{const base=render(2,0,{});for(const key of['hair','beard','hat','color'])for(let i=1;i<APPEARANCE_OPTIONS[key].length;i++)assert.notDeepEqual(render(2,0,{[key]:i}),base,`${key} ${i}`);});

test('fitted hats occlude crown hair and have distinct silhouettes in every direction',()=>{for(let d=0;d<8;d++){let hats=[];for(let hat of[3,4,5,6]){const base=render(d,0,{hat});hats.push(base);for(let hair=0;hair<APPEARANCE_OPTIONS.hair.length;hair++)assert.deepEqual(render(d,0,{hat,hair,color:3}).slice(0,44*160*4),base.slice(0,44*160*4),`hair above crown ${d}/${hat}/${hair}`);}for(let i=0;i<hats.length;i++)for(let j=i+1;j<hats.length;j++)assert.notDeepEqual(hats[i],hats[j]);}});

test('body and clothing parts recolor only their own pixels and keep the silhouette',()=>{const alpha=d=>{const out=[];for(let i=3;i<d.length;i+=4)out.push(d[i]);return out;};
 const base=[],looks=[{skin:5},{coat:3},{shirt:3},{pants:2},{boots:1},{packColor:4},{top:1,shirt:1},{skin:4,coat:7,shirt:4,pants:5,boots:3,packColor:2}];
 for(const d of [0,1,2,6,7])for(const f of [0,3,12])base.push([d,f,render(d,f,{})]);
 for(const look of looks)for(const [d,f,b] of base){const a=render(d,f,look);if(look.top!==1)assert.deepEqual(alpha(a),alpha(b),`silhouette ${d}/${f}/${JSON.stringify(look)}`);let changed=0;for(let i=0;i<a.length;i+=4)if(a[i]!==b[i]||a[i+1]!==b[i+1]||a[i+2]!==b[i+2])changed++;assert.ok(changed>0||(d>=5&&look.shirt!==undefined&&Object.keys(look).length===1),`no change ${d}/${f}/${JSON.stringify(look)}`);}
 // Outline ink is never dyed.
 const ink=a=>{let n=0;for(let i=0;i<a.length;i+=4)if(a[i]===17&&a[i+1]===19&&a[i+2]===25)n++;return n;};for(const [d,f,b] of base)assert.equal(ink(render(d,f,{skin:5,coat:2,pants:1,boots:1,packColor:2})),ink(b));
});
test('no pack removes the pack and straps; boots and pack dye independently',()=>{const withPack=render(6,0,{}),none=render(6,0,{pack:1});assert.notDeepEqual(withPack,none);
 const leather=[0x5b,0x40,0x30];const count=(a,c)=>{let n=0;for(let i=0;i<a.length;i+=4)if(a[i]===c[0]&&a[i+1]===c[1]&&a[i+2]===c[2])n++;return n;};
 assert.equal(count(render(2,0,{pack:1}),leather)>0,true,'boots keep their leather');assert.ok(count(render(6,0,{boots:1}),leather)>0,'pack keeps leather when only boots change');assert.ok(count(render(2,0,{boots:1,packColor:1,pack:1}),leather)<count(render(2,0,{}),leather));
});
test('saved looks from before clothing parts gain safe defaults and random looks are always valid',()=>{assert.deepEqual(normalizeAppearance({hair:1,beard:3,hat:2,color:3}),{...DEFAULT_APPEARANCE,hair:1,beard:3,hat:2,color:3});assert.deepEqual(normalizeAppearance({skin:99,top:-1,coat:'2',pack:1}),{...DEFAULT_APPEARANCE,pack:1});
 let seed=7;const rand=()=>(seed=(seed*16807)%2147483647)/2147483647;for(let i=0;i<40;i++){const look=randomAppearance(rand);assert.deepEqual(normalizeAppearance(look),look);for(const d of [1,6])render(d,i%17,look);}
});

test('female body narrows shoulders and waist on the same skeleton without moving feet, head height or animation frames',()=>{
 const rows=(a,y0,y1)=>{let min=999,max=-1;for(let y=y0;y<y1;y++)for(let x=0;x<160;x++)if(a[(y*160+x)*4+3]===255){min=Math.min(min,x);max=Math.max(max,x);}return max-min;};
 const top=a=>{for(let y=0;y<192;y++)for(let x=0;x<160;x++)if(a[(y*160+x)*4+3]===255)return y;};
 for(const d of [1,2,6])for(const f of [0,4,13]){const m=render(d,f,{pack:1}),w=render(d,f,{pack:1,body:1});
  assert.ok(rows(w,110,122)<rows(m,110,122),`waist narrower ${d}/${f}`);assert.equal(top(w),top(m),`same height ${d}/${f}`);
  assert.deepEqual(m.slice(150*160*4),w.slice(150*160*4),`legs and feet shared ${d}/${f}`);}
 for(const look of [{body:1,hat:5,hair:2},{body:1,beard:3,top:1},{body:1,gun:'tactical-ar',grenade:'smoke'},{body:1,skin:5,coat:4}])for(let d=0;d<8;d++)for(const f of [0,5,14])render(d,f,look);
});
test('short sleeves show bare forearms while aiming',()=>{const skin=new Set(['217,155,115','174,115,86']);const count=a=>{let n=0;for(let i=0;i<a.length;i+=4)if(skin.has(`${a[i]},${a[i+1]},${a[i+2]}`))n++;return n;};
 for(const d of [1,2])assert.ok(count(render(d,0,{top:1,gun:'heavy-pistol'}))>count(render(d,0,{gun:'heavy-pistol'})));});

test('new hairstyles and facial hair stay inside the atlas and leave the body below the chest untouched',()=>{const looks=[];for(let hair=4;hair<10;hair++)looks.push({hair,color:hair%6},{hair,hat:1+hair%5,body:1});for(let beard=1;beard<7;beard++)looks.push({beard,hair:beard+3},{beard,body:1,skin:5,color:5});
 for(let d=0;d<8;d++)for(const f of[0,3,7,12,16]){const bases=[render(d,f,{}),render(d,f,{body:1,skin:5})];for(const look of looks){const a=render(d,f,look),original=look.body?(look.skin?bases[1]:render(d,f,{body:1})):bases[0];assert.deepEqual(a.slice(100*160*4),original.slice(100*160*4),`body changed ${d}/${f}/${JSON.stringify(look)}`);for(let x=0;x<160;x++)assert.equal(a[x*4+3]+a[(191*160+x)*4+3],0);for(let y=0;y<192;y++)assert.equal(a[y*160*4+3]+a[(y*160+159)*4+3],0);}}});
test('every hairstyle has its own silhouette from the front, side and back, and facial hair shows wherever the face does',()=>{for(const d of[0,1,2,6,7]){const hair=APPEARANCE_OPTIONS.hair.map((_,i)=>Buffer.from(render(d,0,{hair:i})).toString('base64'));assert.equal(new Set(hair).size,hair.length,`hair dir ${d}`);
 if(d===6)continue;const beards=APPEARANCE_OPTIONS.beard.map((_,i)=>Buffer.from(render(d,0,{beard:i})).toString('base64'));assert.equal(new Set(beards).size,beards.length,`beard dir ${d}`);}});
test('long hair falls behind the torso in forward views and over the back from behind',()=>{const chest=(a)=>{const out=[];for(let y=84;y<98;y++)for(let x=74;x<86;x++)out.push(a[(y*160+x)*4],a[(y*160+x)*4+3]);return out;};
 for(const d of[1,2,3])for(const f of[0,4,12])assert.deepEqual(chest(render(d,f,{hair:7})),chest(render(d,f,{hair:6})),`front ${d}/${f}`);
 assert.notDeepEqual(chest(render(6,0,{hair:7,pack:1})),chest(render(6,0,{hair:6,pack:1})));});
test('every top has its own look in front, side and back views and fits the atlas while walking, running and aiming',()=>{const tops=APPEARANCE_OPTIONS.top.map((_,i)=>i);
 for(const d of[0,1,2,6,7]){const seen=tops.map(top=>Buffer.from(render(d,0,{top,pack:1})).toString('base64'));assert.equal(new Set(seen).size,tops.length-(d>=6?1:0),`tops dir ${d}`);if(d>=6)assert.equal(seen[4],seen[5],"the tie is hidden from behind");}
 for(const top of tops)for(const look of[{top},{top,body:1,gun:'heavy-ar'},{top,gun:'light-pistol',hair:7}])for(let d=0;d<8;d++)for(const f of[0,4,13]){const a=render(d,f,look);for(let x=0;x<160;x++)assert.equal(a[x*4+3]+a[(191*160+x)*4+3],0);for(let y=0;y<192;y++)assert.equal(a[y*160*4+3]+a[(y*160+159)*4+3],0,`${top}/${d}/${f}`);}});
test('shirts take the shirt color, the jacket and hoodie take the jacket color',()=>{const same=(a,b)=>Buffer.from(a).equals(Buffer.from(b));
 for(const top of[1,2,4,5,6]){assert.ok(same(render(2,0,{top}),render(2,0,{top,coat:3})),`coat ignored by ${top}`);assert.ok(!same(render(2,0,{top}),render(2,0,{top,shirt:3})),`shirt dyes ${top}`);}
 assert.ok(same(render(2,0,{top:3}),render(2,0,{top:3,shirt:3})),'shirt color ignored by hoodie');assert.ok(!same(render(2,0,{top:3}),render(2,0,{top:3,coat:3})),'jacket color dyes hoodie');});
test('tank top arms are bare skin, walking and aiming',()=>{const sleeve=[0x29,0x46,0x5a],count=(a,c)=>{let n=0;for(let i=0;i<a.length;i+=4)if(a[i]===c[0]&&a[i+1]===c[1]&&a[i+2]===c[2])n++;return n;};
 for(const look of[{top:6,shirt:2},{top:6,shirt:2,gun:'tactical-ar'}])for(const d of[0,1,2,6])assert.equal(count(render(d,3,{...look,pants:1}),sleeve),0,`${d}/${JSON.stringify(look)}`);});
test('pants and shoes change only the legs and feet, look distinct in every view and fit the atlas',()=>{const bottoms=APPEARANCE_OPTIONS.bottom.length,shoes=APPEARANCE_OPTIONS.shoes.length;
 for(const d of[0,1,2,6,7]){const b=[...Array(bottoms)].map((_,i)=>Buffer.from(render(d,0,{bottom:i})).toString('base64')),s=[...Array(shoes)].map((_,i)=>Buffer.from(render(d,0,{shoes:i})).toString('base64'));assert.equal(new Set(b).size,bottoms,`pants dir ${d}`);assert.equal(new Set(s).size,shoes,`shoes dir ${d}`);}
 for(let d=0;d<8;d++)for(const f of[0,2,6,11,15]){const original=render(d,f,{pack:1});for(let bottom=0;bottom<bottoms;bottom++)for(let sh=0;sh<shoes;sh++){if(!bottom&&!sh)continue;const a=render(d,f,{pack:1,bottom,shoes:sh});
  assert.deepEqual(a.slice(0,104*160*4),original.slice(0,104*160*4),`upper body changed ${d}/${f}/${bottom}/${sh}`);for(let x=0;x<160;x++)assert.equal(a[(191*160+x)*4+3],0);for(let y=0;y<192;y++)assert.equal(a[y*160*4+3]+a[(y*160+159)*4+3],0);}}});
test('shorts show bare knees in every skin tone and new pants and shoe colors dye',()=>{const skinTone=[0xd9,0x9b,0x73],count=(a,c)=>{let n=0;for(let i=0;i<a.length;i+=4)if(a[i]===c[0]&&a[i+1]===c[1]&&a[i+2]===c[2])n++;return n;};
 for(const d of[0,2,6])assert.ok(count(render(d,0,{bottom:4,pack:1}).slice(130*160*4),skinTone)>count(render(d,0,{pack:1}).slice(130*160*4),skinTone),`knees ${d}`);
 const same=(a,b)=>Buffer.from(a).equals(Buffer.from(b));assert.ok(!same(render(2,0,{bottom:1}),render(2,0,{bottom:1,pants:6})));assert.ok(!same(render(2,0,{shoes:1}),render(2,0,{shoes:1,boots:4})));
 assert.deepEqual(normalizeAppearance({bottom:9,shoes:-1}),DEFAULT_APPEARANCE);});

test('zombies keep their own saved look, start from the survivor, and never come from randomize',()=>{const data=new Map(),storage={getItem:k=>{assert.ok([APPEARANCE_KEY,ZOMBIE_KEY,KIND_KEY].includes(k));return data.get(k)??null},setItem:(k,v)=>{assert.ok([APPEARANCE_KEY,ZOMBIE_KEY,KIND_KEY].includes(k));data.set(k,v)}};
 saveAppearance(storage,{...DEFAULT_APPEARANCE,hair:5,top:3});assert.equal(readAppearance(storage).zombie,0);
 const turned=readAppearance(storage,'zombie');assert.deepEqual(turned,{...DEFAULT_APPEARANCE,hair:5,top:3,zombie:1});assert.equal(data.has(ZOMBIE_KEY),false);
 saveAppearance(storage,{...turned,eyes:2,wounds:3,hair:1});assert.equal(data.get(KIND_KEY),'zombie');assert.deepEqual(readAppearance(storage),{...turned,eyes:2,wounds:3,hair:1});
 assert.equal(readAppearance(storage,'survivor').hair,5);assert.equal(JSON.parse(data.get(APPEARANCE_KEY)).hair,5);
 for(let i=0;i<40;i++)assert.equal(randomAppearance().zombie,0);
 assert.deepEqual(normalizeAppearance({zombie:2,rot:4,decay:3,eyes:3,wounds:4}),DEFAULT_APPEARANCE);});
test('every infection choice changes the zombie in every view, survivors ignore infection, and zombies drop their gear',()=>{const same=(a,b)=>Buffer.from(a).equals(Buffer.from(b)),Z={zombie:1,rot:1,decay:1,eyes:0,wounds:1,pack:1};
 for(let d=0;d<8;d++){const survivor0=render(d,0,{pack:1});assert.ok(same(survivor0,render(d,0,{pack:1,rot:3,decay:2,eyes:2,wounds:3})),`survivor ${d}`);const z=render(d,0,Z);assert.ok(!same(z,survivor0),`zombie ${d}`);
  for(const [key,n] of [['rot',4],['decay',3],['wounds',4]]){const seen=new Set();for(let v=0;v<n;v++)seen.add(Buffer.from(render(d,0,{...Z,[key]:v})).toString('base64'));
   assert.equal(seen.size,n,`${key} dir ${d}`);}
  if(d<5){const seen=new Set();for(let v=0;v<3;v++)seen.add(Buffer.from(render(d,0,{...Z,eyes:v})).toString('base64'));assert.equal(seen.size,3,`eyes ${d}`);}
  for(const f of[0,4,12]){const a=render(d,f,{...Z,decay:2,wounds:3});for(let x=0;x<160;x++)assert.equal(a[(191*160+x)*4+3],0);for(let y=0;y<192;y++)assert.equal(a[y*160*4+3]+a[(y*160+159)*4+3],0);}
  assert.ok(same(render(d,6,{...Z,gun:'heavy-ar',grenade:'smoke'}),render(d,6,Z)),`gear ${d}`);}});
test('zombies reach forward and shamble in every view while staying inside the atlas',()=>{const Z={zombie:1,rot:1,decay:1,eyes:0,wounds:0,pack:1},same=(a,b)=>Buffer.from(a).equals(Buffer.from(b));
 const reach=a=>{let max=0;for(let y=0;y<192;y++)for(let x=0;x<160;x++)if(a[(y*160+x)*4+3]&&y<110)max=Math.max(max,x);return max;};
 assert.ok(reach(render(0,0,Z))>reach(render(0,0,{pack:1}))+12,'arms out in front in profile');
 for(let d=0;d<8;d++){const frames=new Set();for(let f=0;f<17;f++){const a=render(d,f,Z);frames.add(Buffer.from(a).toString('base64'));for(let x=0;x<160;x++)assert.equal(a[(191*160+x)*4+3],0);for(let y=0;y<192;y++)assert.equal(a[y*160*4+3]+a[(y*160+159)*4+3],0,`edge ${d}/${f}`);}
  assert.ok(frames.size>=15,`animated ${d}: ${frames.size}`);assert.ok(!same(render(d,4,Z),render(d,4,{...Z,zombie:0})));}});
test('zombies move slower than survivors in the room',async()=>{const {StudyModel}=await import('../dist/study/model.js');const run=(zombie,running)=>{const m=new StudyModel();m.zombie=zombie;for(let i=0;i<20;i++)m.update(.05,{x:1,y:0,run:running});return m.x;};
 assert.ok(run(true,false)<run(false,false));assert.ok(run(true,true)<run(false,true));assert.ok(run(true,true)>run(true,false));});

test('uniform sets are valid looks, and only the LEET AF and SWAT vests carry readable tape in front and back views',()=>{const count=(a,hex)=>{const c=[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16));let n=0;for(let i=0;i<a.length;i+=4)if(a[i]===c[0]&&a[i+1]===c[1]&&a[i+2]===c[2]&&a[i+3]===255)n++;return n;};
 assert.deepEqual(UNIFORMS.map(u=>u.name),['Military','LEET AF','Police','SWAT']);
 for(const u of UNIFORMS){assert.deepEqual(normalizeAppearance({...DEFAULT_APPEARANCE,...u.look}),{...DEFAULT_APPEARANCE,...u.look},u.id);for(const k of Object.keys(u.look))assert.ok(!['body','skin','hair','beard','color','zombie'].includes(k),`${u.id} keeps the body`);}
 for(const d of[1,2,3,5,6,7]){const look=u=>({...DEFAULT_APPEARANCE,...UNIFORMS.find(x=>x.id===u).look,pack:1});
  assert.ok(count(render(d,0,look('leet')),'#e3dcc6')>=20,`LEET AF tape ${d}`);assert.equal(count(render(d,0,look('military')),'#e3dcc6'),0,`plain fatigues ${d}`);assert.ok(count(render(d,0,look('swat')),'#e8e6df')>=12,`SWAT tape ${d}`);
  assert.ok(count(render(d,0,{...look('leet'),body:1}),'#e3dcc6')>=20,`LEET AF tape on the tailored body ${d}`);}
 // Mirrored views reverse the stencil so the words still read left to right on screen.
 const tape=a=>{const rows=[];for(let y=0;y<192;y++){let row='';for(let x=0;x<160;x++){const i=(y*160+x)*4;row+=a[i]===0xe3&&a[i+1]===0xdc&&a[i+2]===0xc6?'#':'.';}if(row.includes('#'))rows.push(row);}return rows;};
 const right=tape(render(1,0,{top:8,pack:1})),left=tape(render(3,0,{top:8,pack:1}));const trim=rows=>{const xs=rows.flatMap(r=>[r.indexOf('#'),r.lastIndexOf('#')]);const a=Math.min(...xs.filter(x=>x>=0)),b=Math.max(...xs);return rows.map(r=>r.slice(a,b+1));};
 assert.deepEqual(trim(left),trim(right));});
