# First Breath cinematic preview

A fourteen-second revision of the first hospital scene in Introduction Cinematic Script v1. Open `dist/first-breath.html` in the game repository, or the root page of the standalone preview. The normal game boot, saved progress and old intro are unchanged.

Uses the repository's vendored Phaser 4.2.1 with no runtime network dependencies. Shot-specific Canvas 2D compositions become separate Phaser textures at startup. A compact 17-frame atlas animates the fingers. The monitor trace uses Phaser Graphics. Frame state is derived from elapsed seconds, so scrubbing never queues old sounds.

## Revised staging

- 0–3.65 seconds: fade into a cold monitor close-up; the first rhythm returns at 3.05 seconds.
- 3.65–7.6 seconds: cut to the joined hands; the patient's fingers curl into a squeeze.
- 7.6–11.2 seconds: pull back to reveal the bedside relationship and morning light.
- 10.7–12.1 seconds: the relative's worried expression relaxes once the face is visible.
- 12.1–14 seconds: hold on the family, with subtle breathing and a regular monitor rhythm.

The room and figures were rebuilt after the anatomy review. The bed now has a finite mattress, articulated backrest, lift column, footboard and caster base. The patient has a supported head, connected neck/shoulders/arms, and a full-length body under the blanket. The seated visitor has two bent legs, planted shoes, a resting hand and a reaching arm. The cabinet, IV stand and chair meet the floor with contact shadows. Breathing moves the patient and bedding only; the bed frame stays fixed. The two subtitle phrases follow the edit. Spoken narration, breath/cloth Foley and music are not recorded yet. Monitor sound is enabled by the initial play gesture.

Pause/resume, replay, seeking and background-tab pausing remain available. Reduced-motion mode uses fixed compositions and a cut to the family instead of a moving pullback. Illustration remains specific to this scene and does not modify shared `dist/mc` assets.

## Verification

`node --test tests/first-breath.test.mjs` checks edit boundaries, finger poses, subtitle timing, camera bounds, seeking, pause/replay and sound-cue crossings. New JavaScript files pass syntax checks. Offline Canvas renders were visually reviewed for the monitor, hand insert and complete family composition, including legs/feet and the bed supports. Browser/WebGL and device playback could not be verified in this environment because browser control was unavailable.

## Next integration step

Review this scene's look and timing before extending Shot 02. When integrating the completed introduction, give it its own completion flag: the legacy Fall route treats the police crash as already shown. This isolated preview does not call that route or the wake sequence.
