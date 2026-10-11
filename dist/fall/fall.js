// "The Fall", the intro: the whole cut as a list of shots on one clock. frame(t) draws any moment, so the page can play it, seek it
// (?t=) or test it. Act one is the room and the set (set.js); act two goes outside (town.js) and ends on the title.
import {Film,shake} from './film.js';
import {setShot,setAssets,SET} from './set.js';
import {streetShot,streetAssets,STREET,paint} from './street.js';
import {aerialShot,townAssets,AERIAL,paintTown} from './town.js';
import {titleShot,TITLE} from './title.js';
import {DARK} from './set.js';
import {SEGMENTS,ON,FLIP,TV} from './tv.js';
import {ALERT} from './alert.js';import {VARGA} from './varga.js';import {TRIAL} from '../intro/trial.js';import {MONTAGE} from '../intro/montage.js';
const LIST=[['set',SET.cut,setShot],['aerial',AERIAL.dur,aerialShot],['dark',DARK.end,(c,lt,A)=>setShot(c,SET.cut+lt,A.set)],['street',STREET.dur,streetShot],['title',TITLE.dur,titleShot]];
export const SHOTS=(()=>{let t=0;return LIST.map(([id,dur,draw])=>{const s={id,start:t,dur,draw};t+=dur;return s;});})();
export const LENGTH=SHOTS.reduce((a,s)=>Math.max(a,s.start+s.dur),0);
// The faces the captions and title use load when first asked for, so ask as soon as the film is being prepared.
const FONTS=["30px 'Saira Stencil One'","600 10px 'Barlow Condensed'","700 10px 'Barlow Condensed'"];
export function fallAssets(look,pets){try{for(const f of FONTS)document.fonts?.load(f);}catch{}return {set:setAssets(look,pets),street:streetAssets(),aerial:townAssets()};}
export function frame(film,t,A){const s=SHOTS.find(s=>t>=s.start&&t<s.start+s.dur)||SHOTS[SHOTS.length-1],lt=t-s.start;
 if(!A.aerial.ready)paintTown(A.aerial,5);else if(!A.street.ready)paint(A.street,5);const c=film.begin();const fx=s.draw(c,s.id==='set'?t:lt,s.id==='dark'?A:A[s.id])||{};film.end({...fx,fr:Math.floor(t*24)});}
// Sounds the game can play along (its own library): the remote, each flip, the trial's flatline and cheer, the sting, the link dying,
// a siren in the dark, then the cruiser. [time, sound id]
const at=id=>SHOTS.find(s=>s.id===id).start,seg=id=>SEGMENTS.find(s=>s.id===id).start;
export const CUES=[[ON.click,'remote-click'],[ON.click+.05,'tv-power-on'],...SEGMENTS.filter(s=>s.flips).map(s=>[s.start-FLIP,'channel-flip']),[ON.first-FLIP,'channel-flip'],
 ...ALERT.flips.map(([f])=>[TV.alert+f-FLIP,'channel-flip']),[seg('trial')+TRIAL.captions[3][0],'flatline'],[seg('trial')+TRIAL.cheer,'crowd-cheer'],[seg('montage')+MONTAGE.sting,'news-sting'],
 [seg('varga')+VARGA.freeze,'signal-lost'],[at('dark')+6.5,'distant-siren'],[at('street')+STREET.lights,'siren'],[at('street')+STREET.enter-.3,'car-pass'],[at('street')+STREET.hit,'car-crash']].sort((a,b)=>a[0]-b[0]);
