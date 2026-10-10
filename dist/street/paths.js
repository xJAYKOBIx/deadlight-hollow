// How the dead find you. A coarse grid over the map knows which squares a zombie fits in; a few times a second a flow map is
// spread out from every player across the squares near them, so each square knows the next step toward the nearest one. A zombie
// with a clear line walks straight at you; one behind a fence follows the flow round it and through the gap. Same for 4 players.
import {MAP,solidAt} from './data.js';
// CELL: one square, in world units. CLEAR: how much room a zombie needs round a square's middle. REACH: how far the flow spreads
// from each player (past it, zombies just walk straight). EVERY: how often it is spread again.
export const PATH={cell:16,clear:7,reach:960,every:.25};
const W=Math.ceil(MAP.w/PATH.cell),H=Math.ceil(MAP.h/PATH.cell),FAR=0xffff;
// 1 open, 2 blocked, 0 not looked at yet: each square is only checked against the props the first time something asks.
const room=new Uint8Array(W*H);
export function open(cx,cy){if(cx<0||cy<0||cx>=W||cy>=H)return false;const i=cx+cy*W;if(!room[i])room[i]=solidAt((cx+.5)*PATH.cell,(cy+.5)*PATH.cell,PATH.clear)?2:1;return room[i]===1;}
const cellOf=v=>Math.floor(v/PATH.cell);
// Nothing in the way along a straight line, checked every half square.
export function clearLine(x0,y0,x1,y1){const d=Math.hypot(x1-x0,y1-y0),n=Math.ceil(d/(PATH.cell/2));for(let k=1;k<n;k++){const t=k/n;if(!open(cellOf(x0+(x1-x0)*t),cellOf(y0+(y1-y0)*t)))return false;}return true;}
// The eight steps, with their cost (2 straight, 3 diagonal).
const STEPS=[[1,0,2],[-1,0,2],[0,1,2],[0,-1,2],[1,1,3],[1,-1,3],[-1,1,3],[-1,-1,3]];
export class Flow{
 constructor(){const n=Math.ceil(PATH.reach*2/PATH.cell)+1;this.n=n;this.dist=new Uint16Array(n*n);this.ox=0;this.oy=0;this.t=0;this.key='';this.q=[];}
 // Spreads the flow from the players, again only when one has moved to another square or a moment has passed.
 update(dt,players){this.t-=dt;const live=players.filter(Boolean),key=live.map(p=>cellOf(p.x)+','+cellOf(p.y)).join(';');if(this.t>0&&key===this.key)return;this.t=PATH.every;this.key=key;
  const n=this.n,D=this.dist;D.fill(FAR);if(!live.length)return;
  // The window covers every player and REACH round them (one window for now; players far apart share its middle).
  const xs=live.map(p=>cellOf(p.x)),ys=live.map(p=>cellOf(p.y)),half=(n-1)/2;this.ox=Math.round((Math.min(...xs)+Math.max(...xs))/2-half);this.oy=Math.round((Math.min(...ys)+Math.max(...ys))/2-half);
  // A bucket queue: costs are small whole numbers, so squares are taken in order of distance without sorting.
  const B=[];const push=(i,d)=>{(B[d]||(B[d]=[])).push(i);};
  for(let k=0;k<xs.length;k++){const lx=xs[k]-this.ox,ly=ys[k]-this.oy;if(lx<0||ly<0||lx>=n||ly>=n)continue;const i=lx+ly*n;D[i]=0;push(i,0);}
  for(let d=0;d<B.length;d++){const b=B[d];if(!b)continue;for(let j=0;j<b.length;j++){const i=b[j];if(D[i]!==d)continue;const lx=i%n,ly=(i/n)|0;
   for(const [sx,sy,c] of STEPS){const x=lx+sx,y=ly+sy;if(x<0||y<0||x>=n||y>=n)continue;const k=x+y*n,nd=d+c;if(nd>=D[k])continue;
    const gx=x+this.ox,gy=y+this.oy;if(!open(gx,gy))continue;if(sx&&sy&&(!open(lx+sx+this.ox,ly+this.oy)||!open(lx+this.ox,ly+sy+this.oy)))continue;D[k]=nd;push(k,nd);}}B[d]=null;}}
 // How far a square is from the nearest player, in steps (FAR if the flow has not reached it).
 at(cx,cy){const x=cx-this.ox,y=cy-this.oy,n=this.n;return x<0||y<0||x>=n||y>=n?FAR:this.dist[x+y*n];}
 // The way to go from (x, y): toward the middle of the neighbouring square nearest a player. null when the flow has nothing to say.
 way(x,y){const cx=cellOf(x),cy=cellOf(y);let best=this.at(cx,cy),bx=0,by=0;
  for(const [sx,sy] of STEPS){const d=this.at(cx+sx,cy+sy);if(d<best&&(!sx||!sy||open(cx+sx,cy)&&open(cx,cy+sy))){best=d;bx=sx;by=sy;}}
  if(best===FAR||(!bx&&!by))return null;const tx=(cx+bx+.5)*PATH.cell-x,ty=(cy+by+.5)*PATH.cell-y,l=Math.hypot(tx,ty)||1;return {x:tx/l,y:ty/l};}}
