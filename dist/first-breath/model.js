// Shot 01: deterministic seconds, independent of Phaser and wall-clock time.
export const DURATION = 10;
export const LINE = 'The first time Marrow brought someone back, a family got another morning together.';
export const BEATS = [3.05, 4.05, 5.05, 6.05, 7.05, 8.05, 9.05];
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const ease = v => { v = clamp(v); return v * v * (3 - 2 * v); };
export function frameAt(seconds, reduced = false) {
  const t = clamp(Number.isFinite(seconds) ? seconds : 0, 0, DURATION);
  return { t, fade: 1 - ease((t - 1) / 1.3), zoom: reduced ? 1 : 1.23 - .23 * ease((t - 1) / 8),
    focusX: 460 + 20 * ease((t - 1) / 8), focusY: 322 - 52 * ease((t - 1) / 8),
    clasp: ease((t - 4.2) / 1.9), breath: t > 3 ? Math.sin((t - 3) * 1.8) * .6 : 0,
    relief: ease((t - 5.3) / 1.8), subtitle: t >= 2 && t < 8, alive: t >= 3.05, done: t >= DURATION };
}
export function crossedBeats(from, to) { return to > from ? BEATS.filter(t => t > from && t <= to) : []; }
export class Playback {
  constructor() { this.t = 0; this.state = 'ready'; }
  play() { if (this.state === 'ended') this.t = 0; this.state = 'playing'; }
  pause() { if (this.state === 'playing') this.state = 'paused'; }
  seek(t) { this.t = frameAt(t).t; if (this.t === DURATION) this.state = 'ended'; else if (this.state === 'ended') this.state = 'paused'; }
  advance(dt) {
    if (this.state !== 'playing') return [];
    const previous = this.t;
    this.t = Math.min(DURATION, this.t + Math.max(0, Number.isFinite(dt) ? dt : 0));
    if (this.t === DURATION) this.state = 'ended';
    return crossedBeats(previous, this.t);
  }
}
// A trace sample at elapsed seconds. One clear rhythm after the first returned beat.
export function ecg(t) {
  if (t < 3) return Math.sin(t * 15) * .12;
  const p = (t - 3) % 1;
  const bump = (c,w,h) => h * Math.exp(-(((p-c)/w)**2));
  return bump(.055,.012,-5) + bump(.085,.014,25) + bump(.115,.018,-12) + bump(.32,.08,5) + bump(.84,.04,2);
}
