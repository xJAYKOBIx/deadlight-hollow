export const GUNS={
 'light-pistol':{name:'Light Pistol',mag:15,damage:22,interval:.23,reload:1.1,range:510,rifle:false,description:'Compact steel slide · teal grip · quick follow-up shots'},
 'heavy-pistol':{name:'Heavy Pistol',mag:8,damage:38,interval:.38,reload:1.4,range:550,rifle:false,description:'Long silver slide · walnut grip · stronger impact'},
 'hand-cannon':{name:'Hand Cannon',mag:5,damage:65,interval:.65,reload:1.9,range:470,rifle:false,description:'Large revolver cylinder · short heavy barrel · slow, powerful shots'},
 'tactical-ar':{name:'Tactical AR',mag:30,damage:19,interval:.105,reload:1.6,range:670,rifle:true,description:'Teal furniture · optic and foregrip · fast automatic fire'},
 'heavy-ar':{name:'Heavy AR',mag:20,damage:31,interval:.18,reload:1.9,range:710,rifle:true,description:'Sand receiver · black magazine · slower, heavier automatic fire'}
};
export const GRENADES={smoke:{name:'Smoke Grenade',color:'#59818a',description:'Blue canister · lingering smoke screen',duration:6,radius:78},incendiary:{name:'Incendiary Grenade',color:'#bc582b',description:'Orange canister · burning ground',duration:4,radius:54},explosive:{name:'Explosive Grenade',color:'#7d8050',description:'Olive body · yellow band · immediate blast',duration:.55,radius:85}};
export const LOADOUT_KEY='deadlight-character-room-equipment-v1';
export function normalizeLoadout(v){return {gun:v?.gun==='none'||Object.hasOwn(GUNS,v?.gun)?v.gun:'light-pistol',grenade:Object.hasOwn(GRENADES,v?.grenade)?v.grenade:'smoke'};}
export function readLoadout(storage){try{return normalizeLoadout(JSON.parse(storage.getItem(LOADOUT_KEY)));}catch{return normalizeLoadout();}}
export function saveLoadout(storage,v){try{storage.setItem(LOADOUT_KEY,JSON.stringify(normalizeLoadout(v)));return true;}catch{return false;}}
// Author-sized half-pixel silhouettes translated from the approved design sheets.
export function gunArt(g,id){const{p,r}=g,ink='#10151c',steel='#535c65',hi='#a1a7aa';if(!GUNS[id])return;
 if(!GUNS[id].rifle){const heavy=id==='heavy-pistol',rev=id==='hand-cannon',len=heavy?15:rev?13:11;
 p([[-3,-3],[len,-3],[len+1,-1],[len+1,2],[4,2],[2,8],[-3,8],[-1,2],[-4,1]],ink);
 r(-2,-2,len+2,3,heavy?'#88858b':steel);r(-1,-2,len, .5,hi);r(len,-1,1.5,2,'#282e36');
 p([[-1,2],[3,2],[1,7],[-2,7]],heavy||rev?'#80503b':'#38646d');r(-1,3,1,3,heavy?'#a77050':'#60818a');r(0,6,.5,.5,'#c6a06a');
 r(3,2,4,3,ink);r(4,2,2,2,'#56606a');r(4,2,2,1,'#202933');r(len-2,-3.5,1.5,1,ink);
 if(rev){r(-3,-2,7,5,ink);r(-2,-2,5,4,'#687580');r(-1,-1,3,1,hi);r(-1,1,3,1,'#27313c');p([[-4,-3],[-2,-2],[-3,-1],[-5,-2]],hi);r(4,1,8,1,'#38434e');}
 else{for(let x=-1;x<3;x++)r(x,-1.5,.5,2,'#303640');r(5,-2,3,1,heavy?'#43454e':'#899aa2');if(heavy)r(-2,7,3,.5,'#856078');}return;
 }
 const heavy=id==='heavy-ar',body=heavy?'#ac8b60':'#344a54',edge=heavy?'#d0b18a':'#739298';
 p([[-12,-4],[-5,-4],[-5,-2],[1,-2],[1,-4],[19,-4],[20,-2],[27,-2],[27,1],[19,1],[18,3],[9,3],[10,10],[4,11],[2,4],[-1,3],[-3,8],[-6,7],[-4,2],[-10,2],[-12,5]],ink);
 p([[-11,-3],[-6,-3],[-6,-1],[-2,-1],[-2,1],[-9,1],[-11,3]],body);r(-10,-3,4,.5,edge);
 r(-2,-3,20,5,body);r(-1,-3,18,.5,edge);r(0,-1,5,1,'#1f2830');r(4,0,2,.5,hi);r(19,-1,6,1,'#67727a');r(25,-2,2,3,'#343d46');r(26,-1,.5,1,ink);
 p([[3,3],[7,3],[8,9],[4,10]],'#646971');r(4,4,1,5,'#99998d');r(6,4,.5,4,'#252c34');p([[-3,2],[-1,3],[-3,7],[-5,6]],heavy?'#34363d':'#4d7176');
 r(1,-6,5,3,ink);r(2,-5,3,1.5,'#626970');r(4,-5,.5,1,heavy?'#d3a148':'#81c2c2');
 for(let x=8;x<18;x+=3)r(x,-2,2,1,ink);r(17,-5,1,2,ink);
 if(!heavy){r(12,2,2,5,ink);r(12.5,3,1,3,'#64828a');}else r(14,0,3,2,'#30343b');
}
export function grenadeArt(g,id){const{p,r}=g;const col=GRENADES[id]?.color||'#7d8050';p([[-2,-7],[2,-7],[2,-5],[4,-3],[4,4],[2,6],[-2,6],[-4,4],[-4,-3],[-2,-5]],'#141a20');r(-1,-6,3,2,'#737a7b');p([[-2,-4],[2,-4],[3,-2],[3,4],[1,5],[-2,4],[-3,2],[-3,-2]],col);r(-2,-2,1,6,id==='explosive'?'#aaa473':'#96a1a0');r(-3,0,6,2,id==='smoke'?'#ddd2ad':id==='incendiary'?'#e4823c':'#d0ac43');r(3,-5,1,8,'#4b5157');r(2,-6,3,.5,'#b3ada0');r(4,-5,.5,2,'#b3ada0');if(id==='explosive'){r(-3,3,6,.5,'#343c27');r(0,-3,.5,8,'#44482c');}else r(0,0,1,2,'#e7d8b5');}
// Projection shares the sprite's eight-facing convention. Grip is local (0,0).
// Front and back views foreshorten the gun and angle it across the body, so it reads as aimed toward or away from the camera.
function aim(back,quarter,side){const t=side?0:(back?-1:1)*(quarter?.39:.9),L=side?1:quarter?.84:.8,c=Math.cos(t),n=Math.sin(t),ax=side?6:quarter?5:0,ay=side||quarter?-36:-39;
 // A true rotation (not a shear) keeps every gun's silhouette intact at each angle.
 return {point:([u,v])=>[ax+u*L*c-v*n,ay+u*L*n+v*c]};}
// Where each hand closes on the gun: the trigger grip, and the fore-end for rifles (pistols use a cupped support hand).
export function gunHands(id,back,quarter,side){const {point}=aim(back,quarter,side),grip=point([0,3]);return {grip,support:GUNS[id]?.rifle?point([12,3]):[grip[0]-1.5,grip[1]+1]};}
function hand(g,[x,y],near){g.p([[x-2.5,y-1.5],[x+2.5,y-1.5],[x+2.5,y+2.5],[x-1,y+3.5],[x-3.5,y+1.5]],'#111319');g.p([[x-2,y-1],[x+2,y-1],[x+2,y+2],[x-1,y+3],[x-3,y+1]],near?'#d99b73':'#ae7356');g.r(x-1,y-.5,2,1.5,near?'#ecb18a':'#d99b73');}
export function heldGun(g,id,back,quarter,side){if(!GUNS[id])return;const {point}=aim(back,quarter,side);
 const projected={p:(pts,col)=>g.p(pts.map(point),col),r:(x,y,w,h,col)=>g.p([[x,y],[x+w,y],[x+w,y+h],[x,y+h]].map(point),col)};
 gunArt(projected,id);
 // Hands close around the trigger and the fore-end, over the gun.
 if(back&&!quarter)return;const h=gunHands(id,back,quarter,side);hand(g,h.support,false);hand(g,h.grip,true);
}
// Two-bone arm: upper sleeve, bent elbow and forearm with the same thickness and shading as the walking arms.
function limb(g,s,e,h,near,short){const seg=(a,b,wa,wb,col)=>{const dx=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dx,dy)||1,nx=-dy/l,ny=dx/l;g.p([[a[0]+nx*wa,a[1]+ny*wa],[b[0]+nx*wb,b[1]+ny*wb],[b[0]-nx*wb,b[1]-ny*wb],[a[0]-nx*wa,a[1]-ny*wa]],col);};
 const joint=([x,y],w,col)=>g.p([[x-w*.5,y-w],[x+w*.5,y-w],[x+w,y-w*.5],[x+w,y+w*.5],[x+w*.5,y+w],[x-w*.5,y+w],[x-w,y+w*.5],[x-w,y-w*.5]],col);
 const ink='#111319',sleeve=near?'#29465a':'#1b3040',hi=near?'#3d5c72':'#304f64',light=near?'#47677c':'#3d5c72',skin=near?'#d99b73':'#ae7356';
 joint(s,4,ink);seg(s,e,4,3.5,ink);joint(e,3.5,ink);seg(e,h,3.5,2.5,ink);
 joint(s,3,sleeve);seg(s,e,3,2.5,sleeve);joint(e,2.5,short?skin:sleeve);seg(e,h,2.5,1.5,short?skin:sleeve);
 seg(s,e,1.5,1,hi);if(!short)seg(e,h,1,.5,hi);g.r(s[0]-1.5,s[1]-1.5,2,2,light);
 if(short){const m=[s[0]+(e[0]-s[0])*.75,s[1]+(e[1]-s[1])*.75];seg(m,[m[0]+(e[0]-s[0])*.08,m[1]+(e[1]-s[1])*.08],3,3,'#172731');}
}
function elbow(s,h,out,lu=9,lf=9){const dx=h[0]-s[0],dy=h[1]-s[1],d=Math.min(Math.hypot(dx,dy)||1,lu+lf-.5),ux=dx/(Math.hypot(dx,dy)||1),uy=dy/(Math.hypot(dx,dy)||1),a=(lu*lu-lf*lf+d*d)/(2*d),k=Math.sqrt(Math.max(0,lu*lu-a*a)),px=s[0]+ux*a,py=s[1]+uy*a;
 const c1=[px-uy*k,py+ux*k],c2=[px+uy*k,py-ux*k];return out(c1)>=out(c2)?c1:c2;}
// shoulderX scales shoulder spread for narrower bodies.
export function weaponArms(g,back,quarter,side,id,short=false,shoulderX=x=>x){if(!GUNS[id])return;const h=gunHands(id,back,quarter,side);
 // Far arm (support hand) first, then near arm (trigger hand); elbows bend outward and down, never across the chest.
 const far=side?[-1,-46]:[shoulderX(back&&quarter?-12:quarter?-9:-10),-46],near=side?[1,-45]:[shoulderX(quarter?9:10),-45];
 const outward=(cx)=>p=>side?p[1]-Math.abs(p[0]-cx)*.2:Math.abs(p[0])+p[1]*.35;
 limb(g,far,elbow(far,h.support,outward(far[0])),h.support,false,short);
 limb(g,near,elbow(near,h.grip,outward(near[0])),h.grip,true,short);
}
