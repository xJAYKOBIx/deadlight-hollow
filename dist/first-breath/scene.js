import {painters,hands,W,H} from './art.js';
import {frameAt,ecg} from './model.js';
export function makeFirstBreathScene(bridge) {
 return class FirstBreath extends Phaser.Scene {
  constructor(){super('FirstBreath');}
  create(){
   this.layers={};this.owned=[];
   for(const [name,paint] of Object.entries(painters)){
    const key='first-breath-'+name;
    if(!this.textures.exists(key)){
     const texture=this.textures.createCanvas(key,W*2,H*2);
     texture.context.scale(2,2);paint(texture.context);texture.refresh();
    }
    this.owned.push(key);this.layers[name]=this.add.image(0,0,key).setOrigin(0).setScale(.5);
   }
   // A compact atlas preserves actual finger motion without cross-fading two hands.
   const handKey='first-breath-hands',fw=80,fh=64,hx=512,hy=324;
   const atlas=this.textures.createCanvas(handKey,fw*2*17,fh*2);
   for(let i=0;i<=16;i++){
    const c=atlas.context;c.save();c.beginPath();c.rect(i*fw*2,0,fw*2,fh*2);c.clip();
    c.translate(i*fw*2,0);c.scale(2,2);c.translate(-hx,-hy);hands(c,i/16);c.restore();
    atlas.add(i,0,i*fw*2,0,fw*2,fh*2);
   }
   atlas.refresh();this.owned.push(handKey);
   this.hand=this.add.image(hx,hy,handKey,0).setOrigin(0).setScale(.5).setDepth(4);
   const depths={room:0,bed:1,relative:2,relieved:3,foreground:5,atmosphere:8,warmLight:9};
   for(const [name,depth] of Object.entries(depths))this.layers[name].setDepth(depth);
   this.trace=this.add.graphics().setDepth(6);
   this.readout=this.add.text(267,249,'—',{fontFamily:'monospace',fontSize:'21px',color:'#a7dcc0'}).setOrigin(1,0).setDepth(7);
   this.bpm=this.add.text(268,272,'BPM',{fontFamily:'sans-serif',fontSize:'6px',color:'#648d80'}).setOrigin(1,0).setDepth(7);
   this.black=this.add.rectangle(W/2,H/2,W,H,0x030b10).setScrollFactor(0).setDepth(1000);
   // Black overlay stays screen-aligned while the shot camera moves.
   this.events.once('shutdown',()=>{for(const key of this.owned)this.textures.remove(key);bridge.shutdown?.();});
   bridge.ready(this);this.draw(0);
  }
  draw(t){
   const f=frameAt(t,bridge.reduced());
   this.cameras.main.setZoom(f.zoom).centerOn(f.focusX,f.focusY);
   this.hand.setFrame(f.fingerFrame);
   this.layers.bed.y=f.breath;this.hand.y=324+f.breath;
   this.layers.relative.setAlpha(1-f.relief);this.layers.relieved.setAlpha(f.relief);
   this.layers.warmLight.setAlpha(f.warm);
   this.black.setAlpha(f.fade).setScale(2); // Overscan covers the zoomed camera at every time.
   const g=this.trace;g.clear();
   const points=[];
   for(let i=0;i<=174;i++){const x=99+i,st=t-(174-i)/56;points.push({x,y:227-ecg(st)});}
   for(const [width,color,alpha] of [[5,0x75d9ad,.07],[2.5,0x8bddb6,.16],[1.1,0xa7e4bc,.92]]){
    g.lineStyle(width,color,alpha);g.beginPath();points.forEach((p,i)=>i?g.lineTo(p.x,p.y):g.moveTo(p.x,p.y));g.strokePath();
   }
   g.fillStyle(0xc6f3cf,1);g.fillCircle(273,points.at(-1).y,1.7);
   this.readout.setText(f.alive?'60':'—');
  }
  update(_time,delta){bridge.tick(delta/1000);}
 };
}
