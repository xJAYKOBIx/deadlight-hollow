// The intro on its own page: press Watch, or ?t=12 to hold one frame.
import {Film} from './film.js';
import {frame,fallAssets,LENGTH} from './fall.js';
import {DEFAULT_APPEARANCE} from '../mc/assets/characters/appearance.js';
import {PETS} from '../home/data.js';
const q=new URLSearchParams(location.search),fixed=q.has('t')?Number(q.get('t')):null,$=id=>document.getElementById(id);
const film=new Film($('film')),A=fallAssets(DEFAULT_APPEARANCE,PETS.map(p=>p.look));let start=null;
function loop(now){film.fit();const t=fixed!=null?fixed:start==null?0:(now-start)/1000;frame(film,Math.min(t,LENGTH-.001),A);if(fixed==null)requestAnimationFrame(loop);else window.ready=true;}
const go=()=>requestAnimationFrame(loop);
$('watch').onclick=()=>{$('start').hidden=true;start=performance.now();};
if(fixed!=null)$('start').hidden=true;
(fixed!=null&&document.fonts?document.fonts.ready.then(()=>new Promise(r=>setTimeout(r,300))):Promise.resolve()).then(go);window.fall={get t(){return start==null?0:(performance.now()-start)/1000;},LENGTH};
