const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
// All touch positions are in CSS pixels, shared by the actual UI and geometry checks.
export function touchLayout(width,height,safe={},size='medium',reach='edge'){
 const portrait=height>width;
 const left=Math.max(12,safe.left||0),right=Math.max(12,safe.right||0),bottom=Math.max(12,safe.bottom||0);
 const unit={small:.88,medium:1,large:1.12}[size]||1;
 const ring=44*unit,button=Math.max(48,Math.round(52*unit));
 const available=width-left-right;
 const zoneW=Math.min(portrait?available*.46:available*.31,230);
 const zoneH=Math.min(portrait?192:190,height*.52);
 const dockBottom=bottom+4;
 const zoneY=height-bottom-zoneH-10;
 const centerInset=Math.min(zoneW-ring-8,Math.max(ring+12,(portrait?62:76)+(reach==='inward'?20:0)));
 const localY=zoneH-Math.max(ring+16,portrait?62:72);
 const move={x:left,y:zoneY,w:zoneW,h:zoneH,cx:centerInset,cy:localY};
 const aim={x:width-right-zoneW,y:zoneY,w:zoneW,h:zoneH,cx:zoneW-centerInset,cy:localY};
 const actionOffset=portrait?Math.max(58,ring+button/2+10):Math.max(70,ring+button/2+10);
 const actionY=Math.max((safe.top||0)+62,zoneY+localY-actionOffset-button/2);
 // Dash and heal share the right thumb arc; movement remains uninterrupted.
 const actionCenter=Math.min(aim.x+aim.cx,width-right-button-6);
 const dash={x:actionCenter-button-6,y:actionY,w:button,h:button};
 const heal={x:actionCenter+6,y:actionY,w:button,h:button};
 const sentry={x:move.x+move.cx-button/2+(portrait?15:36),y:actionY,w:button,h:button};
 const dockWidth=portrait?Math.min(296,available-12):Math.min(296,Math.max(212,available-2*(centerInset+ring+12)));
 const dock={x:(width-dockWidth)/2,y:portrait?zoneY-58:height-dockBottom-46,w:dockWidth,h:46};
 return {portrait,ring,button,travel:36*unit,move,aim,dash,heal,sentry,dock,dockBottom};
}
export class FloatingStick {
 constructor(){this.pointer=null;this.base={x:0,y:0};}
 start(pointer,x,y,bounds,radius=44,travel=36){if(this.pointer!==null)return false;this.pointer=pointer;this.bounds=bounds;this.radius=radius;this.travel=travel;this.base={x:clamp(x,radius,bounds.w-radius),y:clamp(y,radius,bounds.h-radius)};return true;}
 move(pointer,x,y){if(pointer!==this.pointer)return null;let dx=x-this.base.x,dy=y-this.base.y,d=Math.hypot(dx,dy);
  // Let the base follow a long drag so a thumb never feels pinned to its first touch.
  if(d>this.travel*1.8){let excess=d-this.travel*1.8;this.base.x=clamp(this.base.x+dx/d*excess,this.radius,this.bounds.w-this.radius);this.base.y=clamp(this.base.y+dy/d*excess,this.radius,this.bounds.h-this.radius);dx=x-this.base.x;dy=y-this.base.y;d=Math.hypot(dx,dy);}
  let k=Math.min(1,this.travel/(d||1));return {dx,dy,thumbX:dx*k,thumbY:dy*k,baseX:this.base.x,baseY:this.base.y};
 }
 end(pointer=this.pointer){if(pointer!==this.pointer)return false;this.pointer=null;return true;}
}
