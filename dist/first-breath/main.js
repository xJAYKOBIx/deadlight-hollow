import {Playback,DURATION,LINE,frameAt} from './model.js';
import {makeFirstBreathScene} from './scene.js';
import {Sound} from './sound.js';
const $=id=>document.getElementById(id), player=new Playback(),sound=new Sound();
let scene=null,scrubbing=false,wasPlaying=false,backgroundResume=false;
const motion=matchMedia('(prefers-reduced-motion: reduce)');
$('subtitle').textContent=LINE;
function render(){
 const f=frameAt(player.t,motion.matches);scene?.draw(player.t);
 $('subtitle').classList.toggle('visible',f.subtitle);
 $('play').textContent=player.state==='playing'?'Pause':player.state==='ended'?'Replay':'Play';
 $('play').setAttribute('aria-label',player.state==='playing'?'Pause cinematic':player.state==='ended'?'Replay cinematic':'Play cinematic');
 if(!scrubbing)$('seek').value=player.t;
 $('clock').textContent=`0:${Math.floor(player.t).toString().padStart(2,'0')} / 0:10`;
 $('start').hidden=player.state!=='ready';$('finished').hidden=player.state!=='ended';
}
async function playPause(){
 if(!scene)return;
 if(player.state==='playing'){player.pause();sound.stop();}else{await sound.unlock();player.play();}
 render();
}
function ready(s){scene=s;$('loading').hidden=true;$('start').hidden=false;for(const el of document.querySelectorAll('[data-playback]'))el.disabled=false;render();}
function tick(dt){if(scrubbing||player.state!=='playing')return;for(const _ of player.advance(dt))sound.pulse();render();}
function pauseForBackground(){if(backgroundResume)return;backgroundResume=player.state==='playing';player.pause();sound.stop();render();}
function resumeFromBackground(){if(!document.hidden&&backgroundResume){backgroundResume=false;void sound.unlock();player.play();render();}}
$('play').addEventListener('click',playPause);$('start').addEventListener('click',playPause);
$('replay').addEventListener('click',async()=>{sound.stop();await sound.unlock();player.seek(0);player.play();render();});
$('restart').addEventListener('click',async()=>{sound.stop();await sound.unlock();player.seek(0);player.play();render();});
$('mute').addEventListener('click',()=>{sound.muted=!sound.muted;if(sound.muted)sound.stop();$('mute').textContent=sound.muted?'Sound off':'Sound on';$('mute').setAttribute('aria-pressed',String(sound.muted));});
$('seek').addEventListener('pointerdown',()=>{scrubbing=true;wasPlaying=player.state==='playing';player.pause();sound.stop();});
$('seek').addEventListener('input',()=>{player.seek(Number($('seek').value));render();});
const endScrub=()=>{if(!scrubbing)return;scrubbing=false;if(wasPlaying&&player.t<DURATION)player.play();render();};
window.addEventListener('pointerup',endScrub);window.addEventListener('pointercancel',endScrub);
$('seek').addEventListener('keydown',()=>{player.pause();sound.stop();});
window.addEventListener('keydown',e=>{if(e.target.matches('input,button'))return;if(e.code==='Space'){e.preventDefault();void playPause();}if(e.code==='Escape'){player.pause();sound.stop();render();}});
window.addEventListener('blur',pauseForBackground);window.addEventListener('focus',resumeFromBackground);
document.addEventListener('visibilitychange',()=>document.hidden?pauseForBackground():resumeFromBackground());
function fail(e){$('loading').hidden=false;$('loading').textContent='The cinematic could not start. Please reload this page.';console.error(e);}
window.addEventListener('error',e=>fail(e.error||e.message));
if(!globalThis.Phaser){fail('Phaser failed to load');}else{
 try{
  new Phaser.Game({type:Phaser.AUTO,parent:'film',width:960,height:540,backgroundColor:'#030b10',
   antialias:true,pixelArt:false,roundPixels:false,resolution:Math.min(devicePixelRatio||1,2),
   scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},audio:{noAudio:true},
   scene:makeFirstBreathScene({ready,tick,reduced:()=>motion.matches})});
 }catch(e){fail(e);}
}
window.addEventListener('pagehide',()=>{player.pause();sound.stop();});
