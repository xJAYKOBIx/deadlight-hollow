# First Breath cinematic preview

The opening ten seconds of the Introduction Cinematic Script v1. This is an isolated preview at `dist/first-breath.html`; the normal game boot, saved progress and old intro are unchanged.

Uses the repository's vendored Phaser 4.2.1 with no runtime network dependencies. Shot-specific Canvas 2D compositions become separate Phaser textures at startup. The monitor trace uses Phaser Graphics. Frame state is derived from elapsed seconds, so scrubbing never changes narrative state or queues old sounds.

Implemented: one-second black lead, warm hospital scene, slow camera pullback, returned ECG rhythm, animated hand clasp, subtle breathing and relative movement, the 2–8 second narration subtitle, gesture-unlocked monitor audio, pause/resume, replay, seeking, tab visibility and reduced-motion handling. Spoken narration, the breath/cloth Foley and the music bed are not recorded yet.

Artwork is an initial smooth illustration pass for review. It is specific to this shot and does not modify `dist/mc`. If reused as shared props later, move the approved art into Master Creator and sync through the existing workflow.

## Verification

`node --test tests/first-breath.test.mjs` checks timeline boundaries, seeking, pause/replay and sound-cue crossings. All new JavaScript files pass syntax checks. The painter output was rendered and visually reviewed at 2.5 and 7 seconds using a Canvas 2D renderer. Browser/WebGL and device playback were not verified in this environment because the required browser control capability was unavailable. The standalone deployment is the playable review surface.

## Next integration step

Approve the shot's look and timing before extending Shot 02. When integrating the completed introduction, give it its own completion flag: the legacy Fall route treats the police crash as already shown. This preview does not call that route or the wake sequence.
