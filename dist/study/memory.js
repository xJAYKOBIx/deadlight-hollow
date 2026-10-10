// Keeping pictures small on a phone. Every painted texture used to live three times over: the canvas, a copy of its pixels for reading back, and the graphics card's copy.
// Nothing here reads pixels back, so that copy goes as soon as a texture is made.
export function leanTextures(){const T=globalThis.Phaser?.Textures?.TextureManager?.prototype;if(!T||T._lean)return;T._lean=true;const make=T.createCanvas;
 T.createCanvas=function(...a){const t=make.apply(this,a);if(t)t.imageData=t.data=t.pixels=t.buffer=null;return t;};}
// Big pictures painted once (floors, light maps, the dead) are sent to the graphics card, then their canvas is emptied, so only the card's copy is left.
// A phone can drop the graphics context when the game is in the background; when it comes back they are painted again from the same recipe.
const baked=new Map(),hooked=new WeakSet();
const empty=c=>{c.width=1;c.height=1;};
export function bake(scene,t,draw){const r=scene.game.renderer,c=t?.canvas;if(!c||!r?.gl||r.type!==Phaser.WEBGL||baked.has(t.key))return t;
 baked.set(t.key,{t,c,w:c.width,h:c.height,draw});empty(c);
 const g=scene.game.canvas;if(!hooked.has(g)){hooked.add(g);g.addEventListener('webglcontextrestored',()=>{for(const b of baked.values()){if(b.t.manager&&!b.t.manager.exists(b.t.key))continue;b.c.width=b.w;b.c.height=b.h;b.draw(b.c.getContext('2d'));b.t.refresh();empty(b.c);}});}
 return t;}
// Big enough to be worth it: a quarter of a megabyte of pixels or more.
export const worthBaking=(w,h)=>w*h>=65536;
