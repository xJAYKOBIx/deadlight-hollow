# First Breath cinematic preview

An eighteen-second revision of the first hospital scene in Introduction Cinematic Script v1. Open `dist/first-breath.html` in the game repository, or the root page of the standalone preview. The normal game boot, saved progress and old intro are unchanged.

Uses the repository's vendored Phaser 4.2.1 with no runtime network dependencies. Shot-specific Canvas 2D compositions become separate Phaser textures at startup. A compact 17-frame atlas animates the fingers. The monitor trace uses Phaser Graphics. Frame state is derived from elapsed seconds, so scrubbing never queues old sounds.

## Revised staging

The scene now explicitly depicts a revival rather than an ordinary bedside visit:

- 0–3.65 seconds: monitor reads zero / NO PULSE; the first rhythm returns at 3.05 seconds.
- 3.65–7.6 seconds: face close-up. The patient takes a first breath at 4.3 seconds and opens his eyes from 5.2–6.3 seconds.
- 7.6–10.6 seconds: hand insert; the patient deliberately squeezes the visitor's hand from 8.1–9.6 seconds.
- 10.6–13.8 seconds: pull back to the complete bedside scene.
- 14–15.2 seconds: the visitor smiles and looks toward the awake patient.
- 15.2–18 seconds: hold on the reunited family.

Revised narration captions: “His heart had stopped.” / “Marrow brought him back.” / “For one family, it meant another morning together.” These replace the earlier single sentence for story clarity. Voice-over remains unrecorded. A compact face atlas animates the inhale and eye opening independently of the room; the eyes remain open in the final frame.

The room and figures were rebuilt after the anatomy review. The bed now has a finite mattress, articulated backrest, lift column, footboard and caster base. The patient has a supported head, connected neck/shoulders/arms, and a full-length body under the blanket. The seated visitor has two bent legs, planted shoes, a resting hand and a reaching arm. The cabinet, IV stand and chair meet the floor with contact shadows. Breathing moves the patient and bedding only; the bed frame stays fixed. The three subtitle phrases follow the edit. Spoken narration, breath/cloth Foley and music are not recorded yet. Monitor sound is enabled by the initial play gesture.

Pause/resume, replay, seeking and background-tab pausing remain available. Reduced-motion mode uses fixed compositions and a cut to the family instead of a moving pullback. Illustration remains specific to this scene and does not modify shared `dist/mc` assets.

## Verification

`node --test tests/first-breath.test.mjs` checks action visibility in each shot, eye opening, finger poses, subtitle timing, camera bounds, seeking, pause/replay and sound-cue crossings. New JavaScript files pass syntax checks. Offline Canvas renders were visually reviewed for the monitor, hand insert and complete family composition, including legs/feet and the bed supports. Browser/WebGL and device playback could not be verified in this environment because browser control was unavailable.

## Next integration step

Review this scene's look and timing before extending Shot 02. When integrating the completed introduction, give it its own completion flag: the legacy Fall route treats the police crash as already shown. This isolated preview does not call that route or the wake sequence.
