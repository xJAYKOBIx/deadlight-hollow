// The dialog box (v0.53): who is talking, their face, and one line at a time that waits for you. A slim strip over the bottom of
// the game view; the text types in, a tap finishes it, the next tap moves on. Story lines and looking at things go here; passing
// thoughts stay over your head (thoughts.js) and the radio in a fight has its own small box at the top that goes by itself.
// lines: [[who, text], ...]. who names a speaker the game knows how to draw (face) and name (name).
export const TYPE_RATE=55,RADIO_FOR=4.2;
// Frames where there are any (the tests have none, and then lines show whole).
const frame=f=>globalThis.requestAnimationFrame?.(f)??0,unframe=id=>globalThis.cancelAnimationFrame?.(id);
export function mountSay(doc,{face,name,reduced=()=>false,onChange=()=>{}}){
 const $=id=>doc.getElementById(id),box=$('say'),line=$('sayLine');let q=[],i=0,shown=0,full='',typing=0,raf=0,done=null,hold=false,radioT=0;box.hidden=$('radio').hidden=true;
 function paint(){const [who,text]=q[i];$('sayName').textContent=name(who);face($('sayFace').getContext('2d'),who);box.dataset.who=who;
  full=text;shown=reduced()||!globalThis.requestAnimationFrame?full.length:0;line.textContent=full.slice(0,shown);box.classList.toggle('typed',shown>=full.length);typing=performance.now();unframe(raf);if(shown<full.length)raf=frame(type);}
 // A character at a time, TYPE_RATE a second, measured from when the line started so a slow frame never slows the reading.
 function type(now){const n=Math.min(full.length,Math.floor((now-typing)/1000*TYPE_RATE));if(n!==shown){shown=n;line.textContent=full.slice(0,n);}
  if(n<full.length)raf=frame(type);else box.classList.add('typed');}
 function close(){unframe(raf);box.hidden=true;doc.body.classList.remove('saying');q=[];i=0;hold=false;const d=done;done=null;onChange(false);d?.();}
 return {
  // Play some lines. hold: the game waits while they are up. then: what happens after the last one.
  play(lines,{hold:h=true,then=null}={}){if(!lines?.length){then?.();return;}const was=!box.hidden;q=lines.map(l=>Array.isArray(l)?l:['marcus',l]);i=0;hold=h;done=then;box.hidden=false;doc.body.classList.add('saying');paint();if(!was)onChange(true);},
  // A tap: finish the line typing in, or go to the next, or close after the last.
  tap(){if(box.hidden)return false;if(shown<full.length){shown=full.length;line.textContent=full;box.classList.add('typed');unframe(raf);return true;}
   if(++i<q.length)paint();else close();return true;},
  open:()=>!box.hidden,holding:()=>!box.hidden&&hold,line:()=>box.hidden?null:q[i],
  stop(){if(!box.hidden){done=null;close();}},
  // The radio in a fight: a small box at the top for a few seconds, nothing waits for it.
  radio(text,who='guard'){const r=$('radio');$('radioName').textContent=name(who);face($('radioFace').getContext('2d'),who);$('radioLine').textContent=text;r.hidden=false;r.classList.remove('on');void r.offsetWidth;r.classList.add('on');
   clearTimeout(radioT);radioT=setTimeout(()=>{r.hidden=true;},RADIO_FOR*1000);}};}
