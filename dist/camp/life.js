// The cave's small life: drips from the ceiling, glowing fungus, moths at the lanterns, bats overhead and crabs on the wet sand.
// Everything here is decoration: none of it blocks, and none of it can be used.
import {PROPS} from './data.js';
import {DRIPS,FUNGI,shoreX} from './art.js';
const px=v=>Math.round(v*2)/2;
// Where the moths circle: every lantern's glass, the board's lantern and the one at the end of the pier.
const pier=PROPS.find(o=>o.id==='pier'),board=PROPS.find(o=>o.id==='board');
export const LAMP_GLASS=[...PROPS.filter(o=>o.kind==='lantern').map(o=>({x:o.x+12,y:o.y-60.5})),...PROPS.filter(o=>o.glass).map(o=>({x:o.x+o.glass[0],y:o.y+o.glass[1]})),{x:board.x-2.5,y:board.y-57.5},{x:pier.x+pier.w-13,y:pier.y-pier.z-49}];
export const CANDLES=PROPS.filter(o=>o.candle).map(o=>({x:o.x+o.candle[0],y:o.y+o.candle[1]}));
// Crabs keep to the wet strip, clear of the pier and the boat.
export const CRAB={scare:46,flee:70,walk:22,back:[14,24],near:120};
const tideSpot=(rand=Math.random)=>{const y=470+rand()*270;return {x:shoreX(y)-6-rand()*16,y};};
export class CaveLife{
 constructor(scene){this.scene=scene;const add=d=>scene.add.graphics().setDepth(d);
  this.drips=DRIPS.map((d,i)=>({...d,g:add(d.into?273:d.y),period:2.4+i*.7,phase:i*.9}));
  if(!scene.textures.exists('camp-glow-green')){const t=scene.textures.createCanvas('camp-glow-green',64,64),c=t.context,gr=c.createRadialGradient(32,32,0,32,32,32);gr.addColorStop(0,'rgba(214,240,150,.8)');gr.addColorStop(.45,'rgba(170,220,120,.28)');gr.addColorStop(1,'rgba(150,210,110,0)');c.fillStyle=gr;c.fillRect(0,0,64,64);t.refresh();t.setFilter(Phaser.Textures.FilterMode.LINEAR);}
  this.glows=FUNGI.map(([x,y],i)=>scene.add.image(x,y-1,'camp-glow-green').setScale(.55,.4).setDepth(6001).setBlendMode(Phaser.BlendModes.ADD).setAlpha(.3));
  // A faint green breath from the gaps in the collapsed passage.
  const pass=PROPS.find(o=>o.id==='passage');this.passGlow=scene.add.image(pass.x+40,pass.y-6,'camp-glow-green').setScale(1.1,.9).setDepth(6001).setBlendMode(Phaser.BlendModes.ADD).setAlpha(.16);
  this.spores=[];this.nextSpore=0;
  this.moths=LAMP_GLASS.flatMap((l,i)=>Array.from({length:i%2?2:1},(_,k)=>({l,a:Math.random()*6.28,speed:2+Math.random()*2.5,rx:4+Math.random()*5,ry:3+Math.random()*4})));
  this.air=add(6002);this.bats=[];this.batG=add(5500);this.nextBats=4000+Math.random()*4000;
  this.crabs=Array.from({length:3},(_,i)=>{const s=tideSpot();return {...s,g:add(s.y),state:'idle',t:Math.random()*3,dir:1,legs:0,alpha:1};});}
 update(now,dt,people){const t=now/1000;
  // Drips: a drop falls, then a ring spreads in the puddle (or a splash jumps in the drum's funnel).
  for(const d of this.drips){const g=d.g,k=((t+d.phase)%d.period)/d.period,fall=.22;g.clear();
   if(k<fall){const y=d.top+(d.y-d.top)*(k/fall)**2;g.fillStyle(0xa9c3c8,.9);g.fillRect(px(d.x),px(y),.5,1.5);}
   else if(k<fall+.25){const r=(k-fall)/.25;if(d.into){g.fillStyle(0xa9c3c8,1-r);g.fillRect(px(d.x-1-r*3),px(d.y-r*4+r*r*6),.5,.5);g.fillRect(px(d.x+1+r*3),px(d.y-r*3+r*r*5),.5,.5);}
    else{g.lineStyle(.5,0x9fb8bd,.8*(1-r));g.strokeEllipse(d.x,d.y,2+r*12,1+r*3.5);}}}
  // Fungus breathes slowly; now and then a spore drifts up.
  this.glows.forEach((g,i)=>g.setAlpha(.26+.08*Math.sin(t*.9+i*1.7)));this.passGlow.setAlpha(.14+.05*Math.sin(t*.6));
  if(now>this.nextSpore){this.nextSpore=now+700+Math.random()*900;const [x,y]=FUNGI[Math.floor(Math.random()*FUNGI.length)];this.spores.push({x:x+(Math.random()-.5)*8,y:y-2,life:2.5});}
  const a=this.air;a.clear();this.spores=this.spores.filter(s=>(s.life-=dt)>0);for(const s of this.spores){s.y-=5*dt;s.x+=Math.sin(t*2+s.life*3)*3*dt;a.fillStyle(0xe2f2a6,Math.min(1,s.life*.6));a.fillRect(px(s.x),px(s.y),.5,.5);}
  // The candle by your bed.
  for(const c of CANDLES){const f=Math.sin(t*13+c.x)*.5+Math.sin(t*7.3)*.5;a.fillStyle(0xffc456,.85+.15*f);a.fillRect(px(c.x),px(c.y-1.5+(f>.6?-.5:0)),.5,1);a.fillStyle(0xfff0c0,.9);a.fillRect(px(c.x),px(c.y-.5),.5,.5);}
  // Moths: flickering specks looping round each lantern.
  for(const m of this.moths){m.a+=m.speed*dt*(1+.5*Math.sin(t*3+m.rx));const x=m.l.x+Math.cos(m.a)*m.rx+Math.sin(t*7+m.ry)*1.2,y=m.l.y+Math.sin(m.a*1.3)*m.ry,up=Math.floor(t*24+m.rx)%2;
   a.fillStyle(0xeee4c8,.95);a.fillRect(px(x),px(y),up?1.5:.5,up?.5:1);}
  this.updateBats(now,dt);this.updateCrabs(t,dt,people);}
 // Small flocks cross under the ceiling and leave by the cave mouth.
 updateBats(now,dt){const g=this.batG;g.clear();
  if(now>this.nextBats){this.nextBats=now+9000+Math.random()*9000;const n=1+Math.floor(Math.random()*3),y=96+Math.random()*60;for(let i=0;i<n;i++)this.bats.push({x:-20-i*18-Math.random()*10,y:y+(Math.random()-.5)*20,vx:95+Math.random()*30,flap:Math.random()*6,bob:Math.random()*6});}
  this.bats=this.bats.filter(b=>b.x<1360&&b.y>-20);
  for(const b of this.bats){b.x+=b.vx*dt;b.flap+=dt*18;if(b.x>900)b.y-=40*dt;const y=b.y+Math.sin(b.x*.04+b.bob)*6,w=Math.sin(b.flap)*3;
   g.fillStyle(0x0b0c10,1);g.fillRect(px(b.x-1),px(y-1),2,2);g.fillTriangle(b.x-1,y-.5,b.x-6,y-1+w,b.x-3,y+1);g.fillTriangle(b.x+1,y-.5,b.x+6,y-1+w,b.x+3,y+1);g.fillRect(px(b.x-1),px(y-2),.5,1);g.fillRect(px(b.x+.5),px(y-2),.5,1);}}
 // Crabs sidle about on the wet sand and bolt for the water when someone comes close, coming back later somewhere else.
 updateCrabs(t,dt,people){for(const c of this.crabs){const near=Math.min(...people.map(p=>Math.hypot(p.x-c.x,(p.y-c.y)*1.4)));
   if(c.state==='gone'){c.t-=dt;c.g.clear();if(c.t<=0){const s=tideSpot();if(Math.min(...people.map(p=>Math.hypot(p.x-s.x,p.y-s.y)))>CRAB.near)Object.assign(c,s,{state:'idle',t:2,alpha:0});}continue;}
   c.alpha=Math.min(1,c.alpha+dt*2);
   if(c.state!=='flee'&&near<CRAB.scare){c.state='flee';c.dir=1;}
   if(c.state==='flee'){c.x+=CRAB.flee*dt;c.y+=Math.sin(t*20)*.3;c.legs+=dt*30;const wet=c.x-shoreX(c.y);if(wet>4)c.alpha=Math.max(0,1-(wet-4)/8);if(wet>12){c.state='gone';c.t=CRAB.back[0]+Math.random()*(CRAB.back[1]-CRAB.back[0]);}}
   else if(c.state==='walk'){c.x+=c.dir*CRAB.walk*dt;c.legs+=dt*22;c.t-=dt;const sx=shoreX(c.y);if(c.x>sx-4||c.x<sx-26)c.dir=-c.dir;if(c.t<=0){c.state='idle';c.t=1.5+Math.random()*3;}}
   else{c.t-=dt;if(c.t<=0){c.state='walk';c.dir=Math.random()<.5?-1:1;c.t=.4+Math.random()*.9;}}
   this.drawCrab(c,t);}}
 drawCrab(c,t){const g=c.g,x=c.x,y=c.y,moving=c.state!=='idle',step=Math.floor(c.legs)%2,claw=c.state==='idle'&&Math.sin(t*2.3+c.y)>.85?1:0;g.clear().setDepth(y);g.setAlpha(c.alpha);
  g.fillStyle(0x191b21);for(const s of [-1,1])for(let i=0;i<3;i++){const lx=x+s*(3+i*1.2),ly=y+.5+i*.6+(moving&&(i+step)%2?-.5:0);g.fillRect(px(lx),px(ly),1,.5);g.fillRect(px(lx+s*.5),px(ly+.5),.5,1);}
  g.fillEllipse(x,y,9,5.5);g.fillCircle(x-3.5,y-2.5-claw,1.8);g.fillCircle(x+3.5,y-2.5-claw,1.8);
  g.fillStyle(0x9a5038);g.fillEllipse(x,y,7.5,4);g.fillCircle(x-3.5,y-2.5-claw,1.1);g.fillCircle(x+3.5,y-2.5-claw,1.1);g.fillStyle(0xc0704e);g.fillRect(px(x-2),px(y-1.5),3,.5);
  g.fillStyle(0x111319);g.fillRect(px(x-1.5),px(y-3),.5,1);g.fillRect(px(x+1),px(y-3),.5,1);}
}
