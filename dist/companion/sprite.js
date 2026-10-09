// The companion on screen: one shared sheet texture, a sprite that follows the Follower, and hearts when petted.
import {PET_FRAME,PET_FRAME_COUNT,paintPetSheet} from './pet.js';
export const PET_TEXTURE='pet-01';
export function petSheet(scene,look){const tm=scene.textures;let t=tm.exists(PET_TEXTURE)?tm.get(PET_TEXTURE):null;
 if(!t){t=tm.createCanvas(PET_TEXTURE,PET_FRAME.w*8,PET_FRAME.h*PET_FRAME_COUNT);for(let f=0;f<PET_FRAME_COUNT;f++)for(let d=0;d<8;d++)t.add(f*8+d,0,d*PET_FRAME.w,f*PET_FRAME.h,PET_FRAME.w,PET_FRAME.h);t.petKey=null;}
 const key=JSON.stringify(look);if(t.petKey!==key){t.petKey=key;paintPetSheet(t.context,look);t.refresh();}return t;}
export function addPet(scene,look){petSheet(scene,look);return scene.add.image(0,0,PET_TEXTURE,0).setOrigin(.5,PET_FRAME.footY/PET_FRAME.displayH).setScale(.5);}
export function placePet(sprite,f){sprite.setPosition(f.x,f.y).setDepth(f.y).setFrame(f.frame*8+f.direction);}
// Little pixel hearts that rise above the companion's head, drawn above the lighting.
const HEART=['.XX.XX.','XXXXXXX','XXXXXXX','.XXXXX.','..XXX..','...X...'];
export function drawHearts(g,f,top,now){if(!f.happy)return;const k=1-f.happy/1.6;
 for(let i=0;i<3;i++){const t=k*1.4-i*.25;if(t<0||t>1)continue;const x=f.x+(i-1)*7+Math.sin(now/200+i)*1.5,y=top-t*16,a=Math.min(1,(1-t)*2.2);
  g.fillStyle(0x111319,a);for(let r=0;r<HEART.length;r++)for(let c=0;c<7;c++)if(HEART[r][c]==='X')g.fillRect(x-3.5+c*.75-.5,y+r*.75-.5,1.75,1.75);
  g.fillStyle(0xe2566a,a);for(let r=0;r<HEART.length;r++)for(let c=0;c<7;c++)if(HEART[r][c]==='X')g.fillRect(x-3.5+c*.75,y+r*.75,.75,.75);}}
