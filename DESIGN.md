## Active direction — character first (v0.7)

The user has reset development scope to a single polished character in simple rooms. The v0.6.1 character and directional arm correction are approved. Add a small first set of hair, beard and hat choices before expanding the environment or clothing/armor system. The established Hollow concept remains context; the village and customization work below are preserved history, not current feature priorities.

Reference: `design/character/style-reference.jpeg`. Aim for bold dark outlines, readable hair clusters, layered navy clothing, brown leather, compact proportions and genuine front/rear three-quarter views. Keep the existing display frame dimensions. No Blender is required; authored pixel layers are rasterized into one cached directional atlas. Do not claim the reference has been matched exactly or the character finalized without user review.

Two rooms provide movement space and collision/occlusion checks. The inspection modal shows the same runtime atlas, at close scale, with all directions and idle/walk/run playback. Controls remain sparse and phone-friendly. Do not introduce new combat, inventory, economy or missions during this stage.

---

# Deadlight Hollow — agreed direction

## User decisions

- Mobile/browser first; iPhone landscape is the primary control/layout target.
- Keep the angled camera and twin-stick shooting feel. More visual richness without a Blender production dependency.
- Up to 4-player co-op is a goal (decided 2026-10-10), playable solo. Build every fight for it from now on; see "The plan: co-op, big maps and the aim stick" below. How enemy counts scale with party size is still to be tuned.
- Central persistent community and large instanced open-world regions, inspired structurally by Monster Hunter; objective combat inspiration from No More Room in Hell 2. Original content and story.
- Build the hub and a training area before designing or implementing expedition missions.
- Hub: a beautiful large cave with an ocean inlet and a little beach inside. Locally once known as Moonlight Hollow; after the disaster a large bustling survivor village called Deadlight Hollow.
- Equipment should determine roles. Class/discipline leveling and eventually combining mastered disciplines remain candidate systems, not finalized mechanics.
- Customizable characters; meaningful gathering/crafting for weapons, armor, consumables, and community needs. Balance to be developed through playtests.
- Fights play like Helldivers 1; the loop around them plays like Monster Hunter (decided 2026-10-10). Jaykobi: "the actual gameplay loop of upgrading your weapons and building your armor sets and stuff should be closer to monster hunter. It doesn't have to quite be as in depth… but it does need one that keeps the grind worth it." And first: "before we start getting all of those systems in place, we need to make combat feel good first… We gotta get that down here in the tutorial." So the upgrade and armor-set loop waits until the tutorial fight feels like a solid twin-stick shooter (v0.40.0 is the first pass).

## The plan: co-op, big maps and the aim stick (decided 2026-10-10)

Jaykobi, 2026-10-10: "this will be the plan moving forward." The goals are Helldivers 1 combat, 4-player co-op and large Helldivers-style maps, on phones (iPhone first), with tight memory and no leaks. Every new fight, map and system follows these rules. Older code is brought in line when it is next touched, not all at once.

**Aim stick (built in v0.37.0).** A light push on the right stick turns you and shows a faint laser line. Pushing past about 85% fires, but only once you face within a few degrees of the stick, so a quick flick cannot fire behind you mid-turn. A light pull toward the nearest zombie in a narrow cone in front helps on a small screen. Mouse and controller keep their own aiming. Today the stick fires past a small dead zone (`study/app.js`), which is what makes shots go the wrong way.

**Co-op: what every fight is built on.**
- *Simulation apart from drawing.* Models and fights (`street/fight.js`, `street/model.js`) never touch Phaser, the page or storage; scenes only draw what they report. This is already true and stays true.
- *A fixed clock.* The fight steps at a fixed rate (30 steps a second), whatever the screen's frame rate; drawing smooths between steps. Today `Fight.update` takes the frame's time.
- *Players are a list.* Every player and every zombie has an id. Fights take a list of players, each with its own input, health, guns, bag and position; zombies pick the nearest or noisiest player. Nothing new assumes a single "you".
- *Input is data.* Each player's controls arrive as a plain object per step (move, aim, fire, reload, swap, use), as `fightInput` already makes. Anything that changes the game goes through an input or a command, never straight from a button handler.
- *Events are data.* Fights report what happened as events (shot, hit, kill, hurt, stage…), as they do now, so sound, shake, thoughts and the HUD react the same way on every phone.
- *Seeded randomness.* Spawns, spread and drops come from seeded generators, never `Math.random`, so a fight replays the same from the same inputs.
- *The host decides.* One player's phone is the host and runs the real fight; it decides hits, damage, deaths and loot. The other phones send their inputs, move their own survivor at once so it feels instant, and draw the rest from the host's updates. Shared progress (the map's state, objectives) lives with the host; personal progress (looks, bag, guns, camp) stays with each player. Reconnecting and the host leaving are designed when networking is built.
- *A small server, later.* Phones need a server to find and connect to each other. The test link cannot open network connections, so co-op is tested on a real host when we get there. No networking is built yet.

**Big maps on phones.**
- A map is never one painted picture: a Helldivers-size map painted whole would need gigabytes. Maps are cut into chunks (about 512 × 512 world units). Only the chunks around each player are painted and held; chunks you leave are freed and painted again, from the same seed, if you come back.
- Big pictures painted once keep only the graphics card's copy (`study/memory.js`); a texture that is repainted (looks, splats) does not.
- Memory budget: all images together stay under about 250 MB, measured on a phone-sized test every time a place is added (sum each texture's canvas and graphics-card size, as in v0.36.0).
- Zombies far from every player move on a cheap, slow update with no sprite; they become full sprites near a player, from a reused pool, so sprites are not made and thrown away.
- No leaks: a scene that is left stops its timers and listeners, and everything a chunk or a fight makes is freed with it. A long session's memory is checked as part of testing a new place.

## The Helldivers loop: the combat plan (proposed 2026-10-10; Jaykobi: "a good start for a plan", combat feel first)

What Jaykobi asked for (2026-10-10): shooting is constant, as in Helldivers, but running through your ammo is not a punishment; staying supplied is a real thing to balance; different kinds of monsters keep every fight changing; and you are always on the move round the map, kiting crowds while you complete missions. The numbers below are starting points to tune by feel.

**1. Ammo you can spend.** The aim: an ordinary fight uses about half of what you carry, and you can refill before the next one if you go looking. Running dry happens when you stay too long in one place, not because you fired.
- *Bigger loads.* Primary guns carry more spare ammo in the bag than today (shotgun about 32 shells, rifle about 120 rounds), so holding the trigger is normal.
- *The pistol is the floor.* It never runs out (decided earlier), so you are never helpless, only weaker.
- *Scavenging everywhere.* Every house, car, bin and shed in the neighbourhood can be searched with a short hold (about one second, interrupted if you are hit): a little ammo, scrap and supplies, each spot once a night. This makes kiting through yards pay off.
- *Caches.* A few places on each map are marked as worth the trip (the police cruiser, a gun shop, a hunting cabin, an army checkpoint): a big refill, but usually guarded.
- *Supply drop.* The Helldivers call-in: a flare or a radio code that brings a crate after a few seconds. It refills everyone nearby (co-op), it can be used again after a few minutes, and it is loud, so it pulls the crowd toward you.
- *From the dead.* Now and then a zombie drops what it carried in life (a cop's magazine, a hunter's shells), so a long fight partly feeds itself.

**2. Noise brings hordes.** This is what keeps you moving, like Helldivers' patrols and bug breaches.
- *Heat.* A hidden meter that every shot raises (pistol a little, shotgun more, explosions and car alarms a lot) and that falls back while you are quiet.
- *As heat rises:* wanderers in earshot drift toward the noise; then patrols of three to six start sweeping the nearby streets; at the top a horde of ten to twenty comes in from off screen and follows the flow map to you. A horde has a cooldown, so you get room to breathe if you keep moving.
- *Stand and fight* and the heat keeps climbing; *move* and it falls behind you. Kiting is the safe way to play, as in Helldivers.

**3. New kinds of dead.** Each one changes how you move, not just how many bullets it takes.
- *Runner.* Fast and fragile, often in twos and threes. It makes you stop and shoot rather than walk away.
- *Brute.* Big and tough from the front, slow to turn. It charges in a straight line, so you sidestep; the shotgun staggers it, and shots from the side or back hurt more.
- *Screamer.* Weak, but if you let it scream it calls the heat straight to the top. A priority target.
- *Bloater.* Bursts when it dies and leaves a patch you should not stand in; kill it before it reaches the crowd you are holding.
- *Crawler.* Low in the long grass and under cars; it grabs your ankles and slows you for a moment.
- Suggested order: runner and brute first (the most change for the least art), then the screamer, then the bloater and crawler.

**4. Missions across the map.** Each outing has two or three objectives spread over the neighbourhood (find something in a house, start a generator, reach a survivor, carry supplies out) and an extraction point to finish at. Side objectives and caches are optional and marked. A compass or small map shows where to go.

**5. Moving well.** A dive or roll that costs stamina and gets you out of a bite or a charge; climbing over low fences (picket, chain-link) slowly, while tall fences still block; the flashlight's trade-off (you see further, and so do they, since v0.39.0).

**6. Built for co-op from the start.** Heat, hordes, drops and objectives are all data the host runs (see the plan above), so four players share one heat meter, one horde and one supply drop.

**Proposed build order:** v0.40 ammo, scavenging and pickups; v0.41 heat, patrols and hordes; v0.42 runner and brute; v0.43 the dive and climbing fences; v0.44 the first mission set with extraction; v0.45 screamer and bloater.

**Build order as of 2026-10-11** (combat feel came first, so the rest moved back; proposed to Jaykobi): v0.40 combat feel (done, includes the dive); v0.41 combat polish (fire only at a full push on the touch stick by default, with a Settings slider; drawn dive frames; hit reactions, death falls, guns that move when fired); v0.42 gore (blown in half, crawling halves, gibs, more blood, a gore setting); v0.43 ammo, scavenging and pickups; v0.44 heat, patrols and hordes; v0.45 runner and brute; v0.46 climbing low fences and the first mission with extraction; v0.47 screamer and bloater. Then the Monster Hunter loop (weapon upgrades, armor sets, crafting at camp). Jaykobi finds the sounds cheap (2026-10-11): a sound pass is due, later.

## v0.3 implementation choices

Phaser 4.2.1, original procedural sprite/scenery art, separate simulation. Established village with eight service NPCs and ambient residents. Services are outdoor interactions; buildings do not yet have enterable interiors. Hub is safe; weapons work only in the training yard.

Training has targets and repeatable simulated infected encounters. Ammo reserves and reset supplies are explicitly training conveniences. They are not final RPG economy decisions. Existing pistol/carbine/shotgun/rifle are available to compare immediately. Gear tuning is a small linear sample; branching upgrade trees remain future design work.

Crafting starts with five resource families, tonics, two armor recipes and weapon tuning. Caches are one-time rewards; drills provide repeatable small rewards. No real-world chemical recipes. No missions, settlements elsewhere, persistent hunger, permadeath, multiplayer, classes or story campaign implemented.

## Hub districts

Lantern House / high terraces; central common square; Salvage Works; Tideward Clinic; Thread & Tide; Common Table kitchen; Shore Market; inlet and docks; moonlit shore; separate southeast training yard. Village shortcuts assist early playtesting, alongside continuous walking paths.

## Next review priorities

Actual iPhone touch comfort and sustained performance; settlement art and cave identity; readable combat during large drills; accuracy/damage/armor balance; hub path density. Preserve the concept art's warmth, ocean inlet, small beach and living community as the art improves. Do not imply procedural first-pass visuals match the concept illustration's fidelity.

Co-op: superseded by "The plan: co-op, big maps and the aim stick" above.

## v0.4 approved visual direction

User selected Moonlit from three pixel-art mockups. Keep 2.5D and the current camera, use cool slate/indigo and warm amber accents, and add a modest amount of character detail without Blender. The generated mockup is directional, not a promised fidelity target. Customization must be recognizable in play.

Procedural pixel artwork uses distinctive jackets, long coats, hoodies, hairstyles/headwear, hair colors and cosmetic packs. Equipped armor overlays the outfit; guns have separate silhouettes and are holstered/slung in the hub. Default character world size is retained. All village, crafting and training mechanics remain.

## v0.5 character creator

Keep the v0.4.3 half-world-pixel density, 160 × 192 source frames, scale 0.5, foot anchor, movement and collision. Add modular cosmetic variety: body, face, hair/headwear and clothing. All choices are available to both male and female bodies. Female tailoring narrows the torso/shoulders subtly without changing height; coordinates stay snapped to the existing pixel grid. Hair and facial hair share a color. Nose shapes affect the true lateral contour. Headwear layers over the selected hair. Equipment remains a separate gameplay choice, with an optional creator preview so armor does not hide clothing while editing.

Appearance schema 2 stays within the existing v3 village save. Old combined hair/headwear choices 2–4 become short hair plus the corresponding cap, knit hat or hood. Defaults fill absent fields; gear and resources are preserved.

Archive approved equipment art in design/equipment/approved; it is reference art for a future implementation and is excluded from dist.

### v0.6.1 directional arm layering

The far arm must remain readable in frontal, rear and three-quarter poses. Draw it over the clothing/pack silhouette with a narrower projected width in quarter views; place it outside the backpack's edge for rear quarter views. Only true lateral views intentionally hide the far arm behind the body. Verify through the full gait, not only idle.

### v0.7 first head customization

Preserve the approved default sprite exactly. Head choices share body proportions, feet, gait and arm layers. Hair/beard colors are paired; hats cover the crown while leaving appropriate side hair and ponytails visible. Keep one runtime atlas and refresh it on selection; do not retain an atlas for every combination. Inspect View/Style controls retain the facing and animation when switching. Save only to `deadlight-character-room-look-v1`, with safe defaults for corrupt/unavailable storage. Clothing, armor and body variants are later work.

### v0.7.1 reference beard correction

The full beard uses broad connected sideburn/cheek/jaw planes, a flat lower edge and a muted mouth seam. Avoid the earlier curled mustache and skin-colored mouth ring. Keep the other facial-hair choices and base character unchanged. Existing short-beard selection index 3 now selects this corrected Full beard without changing saved appearance indexes.

### v0.8 fitted headwear

Add police cap, cowboy hat and riot helmet at stable hat indexes 3–5. Crop the underlying head art above the fitted brow band; crowns replace the upper hair volume. Police cap has a structured crown/low band/peak; cowboy brim surrounds the head with a separate lateral crown; riot shell protects temples and nape, with a transparent face visor. Ponytail is tucked inside the riot helmet. Preserve current dimensions, animation and both approved facial-hair designs. Offer only clean shaven and full beard; reserve old beard indexes 1/2 and normalize them to clean shaven, retaining full beard at index 3.

### v0.9 equipment practice

User requested the eight approved guns/grenades on the current character. Keep the two rooms and cosmetic work; add Gear selectors, authored directional held sprites with grip/support arms and belt grenade, and three resetting targets in the second room. Reuse the current atlas, refreshing only on appearance/loadout changes. Teal light pistol and Tactical AR, walnut/silver Heavy Pistol, large-cylinder Hand Cannon, sand Heavy AR, blue/cream smoke canister, orange incendiary, olive/yellow explosive.

Practice statistics are provisional game values. Infinite reserves, finite magazines and reload delays, continuous aiming with eight sprite facings, hitscan cover blocking, forward grenade arcs/fuses, blast occlusion and persistent burn damage. Smoke is a visual screen; no enemy AI exists yet. Keep loadout storage independent. All effects use bounded-lifetime simulation records and a reused Phaser Graphics layer. No expedition/combat progression or additional character creator work.

### v0.9.1 walk and run cycles

Replace the sine shuffle with an explicit stride. Frame 0 is idle, 1–8 walk, 9–16 run; the atlas is 8 × 17. Each foot travels along the facing direction projected onto the ground plane and lifts while swinging through; profile hips share one centre while moving. Arms swing opposite their leg through a progressive sleeve bend (rigid forearm/hand), with elbows bending on the forward swing. The upper body dips after each contact and rises after passing. Running uses a longer stride, higher foot lift, carried arms, a one-unit forward lean and a longer distance per cycle (72 vs 54). The idle pose and all approved art are unchanged.

### v0.10 swappable body and clothing parts

First creator foundation. Each part is drawn once in its original Survivor 01 colors; a look swaps whole color ramps by exact hex match (`study/palette.js`), so outlines, shading steps, pixel placement and animation are identical for every combination and the default look is unchanged pixel-for-pixel. Skin tones are six hand-authored ramps; jacket, shirt, trousers, boots and pack use HSL dyes that keep each ramp's relative shading. Boots and pack start from the same leather ramp but dye independently. Top choice adds a T-shirt (jacket silhouette in shirt colors, closed front, short sleeves with bare forearms). Pack choice can remove the pack and its chest straps. New appearance fields append to the same saved look with safe defaults; old saves load unchanged. Style screen groups Body / Head / Clothing and adds Randomize. Known gap: aiming arms with a gun still draw full-length sleeves on the T-shirt. Next: female base body on the same skeleton.

### v0.11 female base body (subtle build)

User chose a subtle build: same height, skeleton, gait and legs as Survivor 01, so every hat, outfit, pack and gun fits both bodies. The female body draws the same authored upper-body parts through a smooth horizontal tailoring warp (shoulders .84, chest .86, waist .74, hips .90 in front/back views; a lighter profile in side views); edges are subdivided so outlines follow the waist curve. Arms keep their thickness and move in with the shoulders. The head narrows the jaw and lifts the chin half a unit below the cheekbones only, so crowns, hair volume and hats are unchanged; lashes and a softer mouth are added. Body type is an appearance choice (stable index: 0 Male, 1 Female) available with every other choice. T-shirt aiming arms now show bare forearms.

### v0.11.1 gun-holding arms

User reported thin, wire-like arms in front views. Arms holding a gun are now two-bone limbs (shoulder, outward-bending elbow, forearm) drawn at the same thickness, outline and shading as the walking arms, ending in outlined hands on the grip and fore-end (pistols get a cupped support hand). Guns are placed by a true rotation instead of a shear, so every silhouette stays intact: side 0°, quarter ±22°, front/back ±52° across the body with 0.8 foreshortening. Female shoulder spacing and T-shirt forearms apply to aiming arms too.

### v0.11.2 diagonal walk fix

User reported off foot movement in some directions. The four diagonals had legs whose hip offset did not agree with the stride direction (front diagonals also had near and far legs swapped), so the feet scissored mid-step. `legLayout()` now places both hips and both stride tracks on one ground plane: near (right) hip screen-left and lower facing down-right, screen-right and lower facing up-right; far foot raised 4; quarter stride (.65, ±.5). A test asserts the feet keep a clear gap across the track and never change sides. Front diagonals also swap the walking and gun-holding arms so the near (right) arm is screen-left, matching the legs. Front, back and side frames are unchanged pixel for pixel.

### v0.12 more hair and facial hair

User asked for more hair and facial hair for both bodies (step 1 of hair, tops, then pants and shoes). New hairstyles at stable indexes 4–9: buzz cut, mohawk, bob, long hair, curly, top bun (`study/hair.js`). Buzz and the shaved mohawk sides are a translucent hair layer, so they read on every skin tone. Bob, long hair and curls are framing masses painted over the face features with the face left open; long hair also has a layer behind the torso in forward views, so it falls behind the shoulders, and hangs over the back and pack from behind. Field cap and knit hat crop the new styles above the brow band (buns and crests tuck in); fitted hats crop as before. Facial hair now fills the reserved indexes: 1 stubble (translucent), 2 mustache, 3 full beard (unchanged), plus 4 goatee, 5 short beard, 6 long beard over the chest. Hair colors add auburn and platinum. Every earlier look is unchanged pixel for pixel. Next: tops (long sleeve, hoodie, business shirt), then pants and shoes.

### v0.13 tops

Step 2 of the clothing pass. New tops at stable indexes 2–6: long sleeve, hoodie, business shirt, shirt and tie, tank top. Closed tops share the T-shirt body; each adds its own details: hoodie has a lowered hood (rim over the shoulders from the front, folded on the upper back from behind), drawstrings, kangaroo pocket and ribbed hem and cuffs, and covers the belt; business shirt has collar points, a button placket, breast pocket and light cuffs, tucked at the belt; shirt and tie swaps the pocket for a tie; tank top has a scoop neck, bare shoulders and bare arms. Sleeves are one parameter shared by walking arms and gun-holding arms (0 jacket, 1 short, 2 long, 3 ribbed, 4 shirt cuff, 5 bare). Shirts take the shirt color; jacket and hoodie take the jacket color (the picker is now "Jacket & hoodie color"), and the unused picker is disabled. The tie is hidden from behind. Every earlier look is unchanged pixel for pixel. Next: pants and shoes.

### v0.14 pants and shoes

Step 3 of the clothing pass. Two new appearance keys, appended with safe defaults: `bottom` (0 work trousers, 1 jeans, 2 cargo pants, 3 slacks, 4 shorts) and `shoes` (0 work boots, 1 sneakers, 2 dress shoes, 3 hiking boots). Jeans add contrast stitching on the outer seam and pocket; cargo pants are a unit roomier with a flapped thigh pocket on the outer side and a reinforced knee; slacks are half a unit slimmer with a pressed crease; shorts end mid-thigh with bare knees and shins and socks above the shoe. Sneakers are low with a white sole and laces; dress shoes are low, glossy and pointed; hiking boots are taller with a padded collar, laces and a lug sole. All styles follow the same stride, lift and knee as the original legs. Pants color adds denim and faded denim; shoe color adds white, red and gray. The creator labels are now Pants / Pants color and Shoes / Shoe color. Every earlier look is unchanged pixel for pixel; nothing above the hips changes.

### v0.15 creator interface

User asked for a professional rehaul of the character creator interface and picked the "Grim survival" direction: dark worn panels, stencil headings (Saira Stencil One), condensed labels (Barlow Condensed), ember-orange accents and a hazard stripe under the top bar. The small "A closer look" dialog is replaced by a full-screen creator (`study/creator.js`). Left: a large preview with drag-to-turn, turn arrows and Idle / Walk / Run. Middle: a category rail (Body, Head, Headwear, Top, Pants, Shoes, Pack, Gear). Right: picture tiles drawn with the real survivor painter, each showing this character wearing that choice and cropped to the part that changes, plus color swatches taken from the actual palettes. Color rows appear only when they apply (Hoodie color vs Jacket color, no shirt color under a hoodie, no pack color without a pack). Top bar: Room, a survivor name (saved under `deadlight-character-room-name-v1`, 18 characters), Undo (40 steps), Randomize (keeps the body type), Reset (undoable) and Done. The Gear button opens the creator on the Gear section. Layout: phone landscape first (rail fits all eight categories), phone portrait stacks preview, horizontal rail and options, desktop uses larger tiles. Saved looks and all character art are unchanged pixel for pixel.

### v0.16 zombie switch

User asked to add zombies to the creator and picked the "Zombie switch" direction: any survivor look can become a zombie, keeping every hair and clothing option, with infection options on top. A Survivor / Zombie switch sits above the preview. Each kind keeps its own saved look (`deadlight-character-room-look-v1` for the survivor, `deadlight-character-room-zombie-v1` for the zombie, `deadlight-character-room-kind-v1` for the active one); the first time you switch, the zombie starts as your current survivor, turned. New appearance keys, appended with safe defaults: `zombie` (0/1), `rot` (pallid, sickly green, bruised, corpse blue), `decay` (fresh, turned, rotten), `eyes` (clouded, glowing, hollow), `wounds` (none, bite, claw gashes, exposed ribs). Rot recolors the survivor's own skin ramp (`rotRamp` in palette.js), so a deep-skinned survivor stays deep after turning; more decay drains and darkens it. `study/zombie.js` paints the face (eyes, sunken shadows, open mouth with teeth and a blood drip, veins and rot patches with decay) before facial hair and hats, and stamps torn clothes, blood and wounds with source-atop compositing so they land only on pixels already painted and follow every top, pants style and body type. Tears and stains grow with decay (hem and knee rips when turned; more stains, a shoulder tear and both knees when rotten). Zombies carry no gun or grenades: the art drops them and the room hides the shooting controls. In zombie mode the Gear tab becomes Infection. Survivors are unchanged pixel for pixel. Next: zombie movement (shamble walk, arms-forward idle, lurching run).

### v0.17 zombie movement

Step 2 of zombies. Zombie arms reach forward in every pose: the same arm art is turned and foreshortened toward the facing direction (`zombieReach` and `reachPainter` in `study/zombie.js`), keeping full arm thickness. Out to the side in profile, angled in the diagonals, short and raised toward the viewer from the front, and rising past the shoulders from behind (painted before the torso so the body covers them). Idle (frame 0) holds the arms out. The walk becomes a shamble: a 3-unit stride, the far foot dragging (lift × 0.2), an uneven dip on one step and a half-unit sideways sway in front and back views. The run becomes a lurch: a longer stride, a 2-unit forward lean, a heavier dip and wider arm flails. In the room zombies move at 70 walking / 150 running (survivors 126 / 215), with a shorter step per animation cycle, and the creator preview plays zombie walk and run frames more slowly. Survivors are unchanged pixel for pixel.

### Camp direction (decided Oct 9, before v0.18)

Plan: the "Deadlight Hollows camp plan" Claude Doc (https://claude.ai/code/artifact/080e16a9-c404-4a04-a32e-e0e2bc7fcbaf). Monster Hunter-style loop: prepare in camp, take a job (Lantern Board, story givers, bounties), head out, long mission, extract, turn in, craft and build. The camp grows in four stages from a small Firelight Camp on the cave beach to the full Deadlight Hollow. User decisions:
- Camera: keep the current angled 2.5D top-down view (twin-stick shooter).
- You play your created survivor. Zombies are a creator-only option, not playable.
- Going down: lose everything carried. Your old self rises as a zombie wearing your gear where you fell; kill it with your new survivor to recover the items, damaged.
- Mission length is per mission: some have a hard 30-minute timer, some none; side goals (rescues) can have soft timers that fail only that side goal.
- All residents and camp members will be redesigned in the new style; the old hub names and roles are placeholders.
- The original wave shooter becomes the Holdout job type.
- Solo play with co-op additions (like Dying Light, Gauntlet Slayer Edition). Mobile web browser first; PC scaled up later, once the game is designed.
- Controls for now: both phone touch (joystick, tap to talk) and PC keyboard and mouse, like the character room. The full PC-scaled layout comes later.

### v0.18 Firelight Camp

Stage 1 of the camp from the camp plan: a small beach camp inside the sea cave, reached with the Camp button in the top bar (Room goes back; the last place is remembered under `deadlight-place-v1`). The world is 1200 × 880 (`dist/camp/`): back wall with stalactites and the barred gate cut into it, rock to the west, boulders along the south edge (drawn in front of everyone), and the inlet to the east with a glimpse of the moonlit sea through the cave mouth. Props: campfire with three log seats, the Lantern Board, two sleeping tents, the medic tent and cot, Hollis's cart workbench and scrap pile, the cook pot, fish crate and barrel, your lean-to, bedroll and stash crate, a beached rowboat, a net rack, lanterns and rocks. Four placeholder residents use the character painter and creator options (Hollis the salvage smith, Dr. Ama the medic, Pike the cook, Wren the camp steward); they turn to face you when you come close. Walk up to a resident or a usable object (board, stash, bedroll, gate, rowboat, fire) and an ember arrow and a prompt appear; E, Enter, Space, a click or the round Talk button (touch) opens a talk panel with a portrait and short lines. Nothing is functional yet: jobs, crafting, stash and the gate come later.

Environment art rules, so people, items and scenery stay easy to tell apart: the same half-unit pixel grid as the characters, drawn on 2x canvases; scenery muted and low contrast with no hard outlines on the ground; solid props get a softer edge (#191b21) than people (#111319); things you own or can use carry ember orange (stash stripe, board pin); teal is reserved for care (the medic); role badges and markers float above the lighting so they never dim. Lighting is a banded, dithered light map multiplied over the world (cool cave ambient, warm pools under the fire and lanterns, moonlight at the mouth), with a flickering additive glow, rising embers, cook-pot smoke, breathing foam and water glints. In camp you are always your survivor (never the zombie look) and carry no gun; the creator still opens from camp and previews the full creator look. The camera zooms in on wide screens so the cave always fills the view. Survivors and zombies are unchanged pixel for pixel.

### Direction after v0.18 (Oct 9)

User approved Firelight Camp as the main base to build from. The camp fills out and grows as the player progresses; survivors found through optional missions join and grow the community. Before missions or other maps: add more camp detail and the first mechanics, starting with fishing. Food is scarce and fishing is the only immediate source of fresh food; the player keeps a stock of fish without it becoming a burden, and cooks fish at the campfire (like Monster Hunter's meat) for buffs such as stamina.
Fishing decisions: a joystick mini-game. When the bobber sinks, pull back on the stick to hook; then a Sea of Thieves style fight where the fish pulls in directions and the player holds the opposite way until it tires and the line goes slack; reel only while slack, or the line can break when it fights again. Grilled fish at the campfire boosts stamina only (a stamina bar drained by running). Full, proper meals (camp only, e.g. from the cook) also boost health.

### v0.19 Fishing, grilling and stamina

Camp detail: a plank pier runs out over the inlet past the medic tent (one board missing, a bait bucket, a coil of rope and its own lantern), a laundry line between the gate and the first tent, grain sacks by the tent, two tide pools on the east beach, and the net rack now hangs one drying fish for every fish in the basket (up to nine). The world is now 1320 wide (was 1200) so the inlet has room past the pier; the camera can lean out over the water.

Stamina (`dist/camp/fishing.js`, `Stamina`): 100 base. Running drains 22 a second; it refills at 15 a second after 0.7 seconds of rest. Run it dry and you are winded (walk only) until it is back to 30%. Shown top left in camp with the current meal and the basket count.

Fishing (`Fishing`, run by `dist/camp/play.js`): walk to the end of the pier and Fish. Cast (Space, click or the round button on touch). Watch the bobber; it nibbles first. When it sinks, pull back (away from the water, left) within about a second to hook; pulling early spooks the fish and the wait starts over. In the fight the fish pulls away, up or down and switches every 1 to 2 seconds; hold the stick the opposite way to tire it. Neutral lets strain creep up, pulling with the fish raises it fast, and reeling during a fight raises it more; full strain snaps the line. When it tires the line goes slack for 2 to 3.5 seconds: hold Reel to bring it in until it fights again. Four fish: sand perch (common), inlet mackerel, rock cod and the rare moonfin, each with a weight range; bigger kinds pull harder and reel slower. Red arrow over the fish shows its pull, the arrow by the survivor shows where to hold (ember when right). The camera zooms in while fishing. Moving the stick between casts (after letting go) leaves the pier; Esc or Stop also ends it.

The basket: Pike's salt crate holds 12 fish and nothing spoils, so stock is never a chore. A full basket means the catch is released (still counted in the tally). Saved under `deadlight-camp-v1` (basket, current meal, catch tally).

Grilling: with fish in the basket the campfire's verb becomes Cook. Pick a kind; the biggest of that kind goes on the spit. Take it off in the perfect window (3.6 to 4.2 seconds); later it burns. Quality (underdone, well done, perfect, burnt), size and species set the buff: +8 to +70 max stamina and faster recovery, lasting until your next mission (missions do not exist yet, so it lasts). A new meal replaces the old one and fills the bar. Grilled fish never heal; Pike's full meals (health and stamina, camp only) are shown as coming later.

### v0.20 Companion

Your own dog or cat (`dist/companion/`). In the character creator, the third switch tab, Companion, opens three pages. Kind: Dog or Cat, and the breed (dogs: Shepherd, Lab, Terrier, Husky; cats: Shorthair, Longhair). Coat: seven colors (Black, Chocolate, Tan, Golden, Ginger, Gray, Cream) and markings (dogs: solid, white chest, saddle, patches, mask; cats: solid, tabby, white chest, tuxedo, patches). Details: eye color and a collar (red, blue, green, ember, leather, a bandana, or none). The name box names the pet while the Companion tab is open. Randomize, Reset and Undo work on the pet. The preview turns and plays idle, walk, run and sit. Dog and cat each keep their own look, so switching never loses a choice. Saved on the device under `deadlight-companion-v1` (`{species, dog, cat, name}`, names up to 16 characters).

Art (`pet.js`): the same half-unit grid and #111319 ink as the people. Each breed is a plan (body length, chest and hip size, leg length, snout, ear type, tail type, fluff, scale), posed as a small 3D skeleton (forward, side, up) and drawn as depth-sorted outlined shapes, so all 8 facings come from one model. 19 frames per facing: idle 4 (breathing, tail wag), walk 6 (four-beat), run 6 (gallop), sit 2 (wag) and lie 1. Each frame is 160 × 160 on the 2x sheet, with the feet at (40, 58). A whole sheet paints in about a third of a second with a small software rasterizer, and it is repainted only when the look changes.

Following (`follow.js`), reworked in v0.20.1 after play feedback that the pet moved too much to pet: while you walk it keeps level with you at your side (the side it is already on, or behind you where both sides are blocked), walking with you and running when you run or when it falls more than 70 behind. When you stop it does not fuss for the perfect spot: once it is within 36 it stays where it is, and after about a second it sits and stays. While it stays you can walk around it, face it and pet it; it only gets up when you walk more than 72 away, then catches up. It keeps facing whichever way it settled (so you see it sit and lie from every side); only when you walk more than 52 away does it sit up and look round at you, and past 72 it gets up and follows. Stand around and after 7 seconds it gets up and wanders: two or three slow legs to spots within about 58 of you, sniffing at each, then back to your side, where it sits and lies down after 9 seconds. Later wanders come every 30 seconds. It never wanders while you fish or cook. Moving off calls it straight back to heel. If it ends up more than 320 away, or is stuck for over 2 seconds, it simply appears near you. It follows in the room and in camp, and sits by you on the pier while you fish.

Petting: face your pet in camp and the prompt reads "Pet (name)" (or "Pet your dog/cat" with no name). Petting makes it sit up, wag fast and float ember hearts. It has no other job yet. What the companion does (scavenging, warnings, fetching fish) is still to be decided.

### v0.20.2 creator preview fix, muzzles

The creator preview now runs its own animation loop while the creator is open. Before this, only the room scene repainted it, so in camp the Idle, Walk and Run buttons and drag-to-turn did nothing (desktop and phone alike). Muzzles were rebuilt: dogs have a tapered muzzle from a broad base at the stop to the nose, a jaw line on the visible side, a nose with a highlight, and the tongue tucked under the nose. Snout lengths are a little shorter (Shepherd 5.6, Lab 4.8, Terrier 3.2, Husky 4.8). Cats have a very short muzzle with round cheeks either side. The eyes now draw over the muzzle, so front views show them.

### v0.20.3 companion build fixes (from a turnaround video)

Body: the middle of the body chain is slimmer and a little higher, giving a deep chest and a tucked waist. Each standing leg now has a thigh or shoulder mass that joins the body without a seam: far ones are drawn under the body, near ones over it. The old round joint balls are gone. Neck: thinner (0.72 of the head radius) and set further back, and the collar sits lower on the neck. From behind, the head now draws over the neck, so it shows above the shoulders instead of disappearing behind a collar band. Lab ears hang at the sides of the head, not over the face. A saddle-backed dog has a dark stripe down the top of its tail, so from behind the tail no longer reads as a fifth leg. The husky's curled tail leans to one side.

### v0.20.4 chest and legs

The chest no longer hangs out in front of the front legs like a ball. The front of the body chain now ends 0.3 of the chest radius further back, and the front legs sit further forward (at 0.84 of the half body length, was 0.72), so the forechest only just clears the forearms. The waist is tucked more for dogs (0.22, cats 0.1), so the underline rises from a deep chest to the hips and the Lab no longer reads as a tube. The thigh and shoulder masses keep only a soft shadow along their lower edge, with no full ring.

### v0.21 camp polish

The camp gets more detail without more clutter, so it still reads on a phone. Back wall (`art.js`, `groundColor`): vertical joints split the rock into blocks, each a slightly different shade with its own bedding-plane tilt, so the strata break at the joints like stacked stone. Moss grows along the damp foot of the walls; the west rock is a field of boulders with dark seams. Roots hang from the ceiling edge. Three drips run down the wall into puddles, and a fourth feeds a blue water drum by the medic tent (`DRIPS`). Pale yellow-green glowing fungus grows in six damp corners (`FUNGI`); it is not ember (yours or usable) and not teal (care).

New props: a woodpile with a chopping stump by the fire, the medic's water drum with a tarp funnel, a net heap with floats and an oar by the pier (flat), salvage crates by Hollis's cart, and the collapsed passage in the west wall: a mine frame in a rock outcrop, choked with rubble, with a few sprouts and a faint green glow coming through. You can Look at it. It is where the deeper caverns (the farm and training grounds) will open later. On the sand: the rowboat's keel groove back to the water, crab holes, a half-sunk anchor and a starfish.

Cave life (`life.js`, `CaveLife`), all decoration: drops fall and ring out in the puddles; the fungus glow breathes and lets off the odd spore; moths loop round every lantern; small flocks of bats cross under the ceiling every 9 to 18 seconds and leave by the cave mouth; three crabs sidle on the wet sand, bolt into the water when you or your pet come within 46 units, and come back somewhere else 14 to 24 seconds later. It costs about 0.06 ms a frame; the ground takes about 5% longer to paint once at load.

### v0.21.1 the sleeping shelter and co-op beds

The lean-to, bedroll and stash crate are replaced by one shared shelter (`shelter`): a patched tarp on a ridge pole, sagging between three posts, with a coat and a pack hung on its back wall and a lantern at the front corner. Under it are four sleeping spots (`BED_SPOTS`), east to west. Each is a bed (`bed`, flat: a pad, a plump pillow, a patchwork quilt with the sheet turned down and a corner folded back) and a footlocker at its foot (`chest`: plank lid, leather straps, iron corners, a lock). Each spot has its own bedding colors (`BED_COLORS`); yours, spot 0, is the warm brown one nearest the fire, with an ember band on the quilt and chest, a brass lock and a candle beside it.

Your chest is your stash (Open, from the foot of the chest); Rest is on your bed. The other three spots stay empty until co-op players join: `CampModel.campers` (1 to `MAX_CAMPERS`, 4) sets how many show, and an empty spot's chest does not block. The gaps between chests are wide enough to walk through. Until co-op exists, "Preview co-op beds" in the camp's options menu shows all four.

### v0.22.0 controls: phone, PC and controller

The controls are rebuilt to feel like a twin-stick shooter, with the left thumb only ever moving and everything else under the right thumb.

Phone: the left side is a floating move stick (it appears where you touch); pushing it past about 90% of its reach runs, and easing back below about 70% walks again, so there is no Run button. The right side is a fixed fire stick: a small push turns your aim, a fuller push (past 14 px of its 40 px reach) also fires. Reload, Grenade and Swap sit in a fan just above and left of the fire stick, all reachable without lifting the left thumb. Reload and Grenade show their cooldown as a ring; buttons act on press (not release) and buzz on supported phones. In camp the fan and fire stick give way to the big action button. The top bar keeps only Character and Menu; Room/Camp travel, zoom, full screen and reset live in the pause menu, along with a full controls table. Health is not shown because there is no health system yet.

PC: WASD or arrows move, Shift runs, the mouse aims (with a crosshair cursor) and the left button or Space fires; E uses, R reloads, G throws, Q or the wheel swaps, 1 to 5 pick a gun, Z zooms, I opens the character, Esc pauses. Every HUD button shows its key.

Controller (`pad.js`, standard mapping): left stick moves (L3 or LT runs), right stick aims past 30% and fires past 55% (or RT), X reload, Y swap, RB/LB grenade, A use, Start pause, Back character, R3 zoom; the D-pad and A/B work the menus. Firing, reloading, swapping and throwing rumble. The HUD's key prompts switch to controller glyphs as soon as a controller is used, and back when you touch the keyboard, mouse or screen.

The weapon panel (`#weaponHud`) shows the gun, rounds left over the magazine with a bar, the reload state and the grenade with its cooldown; it turns ember when low and red when empty.

### v0.22.1 touch controls only while touching

The touch overlay (move stick, fire stick, fan, action button) follows the last input you used instead of whether the device has a touchscreen. Phones and tablets (primary pointer coarse) start with it; a PC starts without it, even with a touchscreen. Touching the screen shows it; moving the mouse, pressing a key (except while typing in a text field) or using a controller hides it, so it never sits over the game catching clicks. Camp fishing hints follow the same switch.

### v0.22.2 portrait control deck

On a phone held upright (touch, height more than 1.15× width) the controls get their own deck along the bottom (`#deck`, 206px plus the safe area) and the game view ends above it, so nothing in play sits under your thumbs; the camera centers on the smaller view. The fire stick sits in the corner (130px), with Reload, Grenade and Swap on an arc 100px around it at 180°, 225° and 270°; the ammo readout takes the corner above the move stick. In camp the action button keeps its place on the deck, dimmed and reading Use until something is in reach. Landscape and PC are unchanged, and switching to the keyboard, mouse or a controller drops the deck.

### v0.22.3 wider camera, aim lean, Run toggle, lighter landscape

Camera distances are now Wide (0.7), Normal (1) and Close (1.5); phones start on Wide and a PC on Normal. To keep pixel art whole when zoomed out, the game draws at the screen's real pixel density (`RES`, up to 3×) and every camera zoom is multiplied by it. When the view is bigger than the character room, the room is centered in it.

The camera leans toward your aim (`leadStep`, 36% of the half-view along the aim), so you see what you are shooting at, as in Helldivers. Sticks lean by their direction; the mouse leans by its distance from the middle of the screen, so the view never chases the cursor. It eases in quickly and drifts back slowly when you stop aiming. Camp has no lean.

Run on touch is a toggle button up and in from the move stick: tap to run, tap again to walk; it stays on through stops. Pushing the stick to its edge no longer runs. Controller L3/LT and Shift are unchanged.

Landscape is lighter: the fire stick (108px ring) and a 50px fan on a 92px arc sit in the corner, the stick labels are gone, and the ammo readout is a small plate under the menu buttons instead of a panel at the bottom middle. On the portrait deck the readout loses its plate and sits top-left, with Run beside it.

### v0.23.0 the garden and the Training Grounds

Camp gains two places. The old laundry spot on the back wall (x246–358) is now the Training Grounds door: a concrete storm-bunker portal set into the cliff with olive steel doors, a bullseye sign, a floodlight, sandbags and a paper target. Walking up shows "Enter Training Grounds" and using it travels to the old character room, which is renamed Training Grounds. That room is where everything is unlocked for trying guns and armor; the wave shooter and the store will live there later. The laundry line moved west to x112.

The garden sits south of the fire (x340–516, y660–744): a fenced, tilled plot with staked beans along the back, potatoes, squash and seedlings, a scarecrow in a hard hat with a crow, and a rain barrel, watering can and rake outside the west fence. It has its own lamp and a warm-white light. For now it is Look only; planting and harvesting come later. The rock and driftwood that stood there moved aside.

The planned zombie roster (fodder, specials, heavies, bosses, alert levels and counters, played like Helldivers) is a separate Claude Doc.

### v0.24.0 factions, Aaron and uniforms

Two factions join the world. The Elite Armed Forces are the primary military force; their vests are taped "LEET AF" and everyone calls them that. G.U.N., the Guardians of the Underground Network, is a paramilitary group holed up in the public tunnels that reach every corner of the map; once made safe, the network becomes a fast-travel route later in the game. The faction table lives in the zombie roster doc.

Aaron, a LEET AF range warden, stands guard beside the Training Grounds door (x352, y244) with a target badge. His lines introduce LEET AF, the unlocked range and G.U.N.

New wearable pieces, all in the character creator (indices appended, so saved looks keep working):
- Tops 7 Fatigues and 8 LEET AF fatigues: a camouflage jacket (jacket dye) under a plate carrier with mag pouches. The carrier keeps its own colors; LEET AF adds a black tape stenciled "LEET AF" on chest and back. Top 9 Police shirt (shirt dye, short sleeves) with a badge, name bar, shoulder radio and duty belt. Top 10 SWAT armor: black carrier taped "SWAT", padded shoulders and elbows.
- Hat 6 Combat helmet with a cover band, ear cut-outs, chin strap and night-vision mount.
- Pants 5 Fatigue pants (camouflage cargo) and 6 Tactical pants (knee pads).
- Shirt dyes Police navy and Sky blue.
- Uniform sets (Military, LEET AF, Police, SWAT) at the top of the Top page dress the whole outfit in one tap and leave body, face and hair alone.

Stencil lettering is a 3 × 5 half-unit font. Mirrored directions reverse it so it still reads, it skips the female tailoring warp (which would pinch letters), and on the narrower tailored chest "LEET AF" stacks into two lines. Pack straps tuck under a vest.

### v0.25.0 bigger camp, the cast and the garden

The camp has grown to 1920×1520 (it was about half that). There are no separate sections: the camera follows the survivor across one map. Everything sits in districts:
- **Back wall:** the barred gate, the Training Grounds door, tents, Macy's quest board and the medic tent. A watch post stands by the gate.
- **North middle:** the camp store, with crates, sacks and a water barrel.
- **West:** Stan's forge, with a brick furnace, an anvil and a quench bucket, plus his cart and scrap heap.
- **Centre:** the campfire ring and its logs.
- **East:** Pike's kitchen, with the pot, fish crate, rack and mess table. More tents for newer arrivals go up the east side.
- **South-west:** the shelter beds. The living tents, laundry line and supply crates are close by.
- **South:** the fenced garden, which has its own lamps. The north gate leads in. Inside are potato, cabbage, squash and carrot beds, a tilled bed, staked beans, the scarecrow, the tool shed, compost and a wheelbarrow.
- Hard-coded positions in scene.js, life.js and play.js (embers, pot steam, lamp glows, foam, sparkles, crabs, bats, pier end, fire seat) now follow the props or the camp size.

The cast, 41 days after the fall:

| Character | Role | Notes |
|---|---|---|
| Macy | Runs the camp from the quest board | Former zoo-keeper and hiking guide. Nurturing. |
| Ava | Camp doctor | Always short on supplies. Proper medical gear is a premium fetch. Later she'll help with bites, an antidote and slowing the spread. |
| Scoutmaster Pike | Cook and field survival | Also the fishing expert. |
| Old-man Stan | Blacksmith | Grumpy ex-gunsmith. The world was lucky it didn't end in his prime. Probably. |
| Zyn and Clyde | Country farmers who run the garden | The player's contacts for planting and harvesting. |
| Aaron | LEET AF guide for the Training Grounds | Stands at the door and inside the range. |

Five generic "Survivor" residents fill out the camp: nets, fire, laundry, watch and tent.

The scarecrow is a quiet signature, a loose nod to the Jaykobi Games mascot:
- A faded purple, bent witch hat with a stitched patch and a frayed brim.
- A burlap head with a stitched grin and no eyes.
- A straw ruff and a ragged, patched coat.
- A crow on the crossbar.
- Purple appears only on the hat.

Aaron now answers questions. The talk panel supports `topics`, a list of {q, a[]} pairs:
- A resident with topics opens on a greeting and a set of question buttons.
- Picking a question plays its answer, then Back returns to the questions. Answered questions dim.
- There are seven topics: the Training Grounds, how the range works, which gun, grenades, LEET AF, G.U.N., and what's coming.

Aaron also stands inside the Training Grounds by the range doorway (x604, y322), as range officer:
- Talk with E, or A on a controller.
- On a touch screen, tap the floating Talk prompt. The shooting controls stay where they are.
- His answers there say "here" instead of "down there".

### v0.26.0 Gadget and the Training Grounds

The story is now set: Marrow Industries, LZ-6 (the Lazarus drug), and Rebecca Lynell's revival on live TV. Everyone dosed turned within two months, then everyone they bit. The world collapsed in under six months. The game opens 41 days after the collapse. The full write-up is in the zombie roster doc. In camp, Macy names LZ-6 and Ava explains bite timing (the sick go fast, the young and strong last longer).

The Training Grounds were rebuilt as a cave chamber under the camp (1720×1720, `grounds/data.js` and `grounds/art.js`):
- The arena is 1600×1200, two thirds of each side of the old 2400×1800 wave map. It is built from pallets, old doors, corrugated sheet, plywood, tires, cable spools, sandbags, drums, crates and stacked shopping carts.
- A barricade of the same scrap runs along the south side, with a gate. Below it is the front office: Gadget's desk (CRT, radar LCD, laptop, camera monitor), a wire-shelf server rack, a battery bank, the DRILL whiteboard, a car-seat couch and a camp stove. Aaron's counter sits under a pegboard of paintball guns, next to the paint crate. The robot bench, three parked robots and their charger are there too.
- Everything runs on extension cords from a generator in camp, next to the steel doors. The cords run under the doors and down the stairs, then along the floor to every light, screen and charger.
- Work lights on tripods light the arena: a cool white, multiplied over a dark ambient. The office is warmer, and the screens and LEDs blink above the lighting.
- You arrive at the foot of the stairs. Climb them (E, A, or tap) to go back up to camp.

Gadget is the second LEET AF soldier (Engineer). There is no command left, just her, Aaron and a lot of gear. She sits at her desk and has eight topics. Two of them run the drill:
- **Send in the robots** starts a drill. Three waves (4, 6, then 8 robots) roll out of the two hatches in the back wall.
- **Call off the drill** shows only while one is running.

The robots are built from pillows, bedsheets, broom or plunger arms, shopping-cart casters and a car battery:
- They follow a breadth-first flow field around the cover, keep apart from each other, and roll faster each wave.
- They stop at the gate line, so the office is safe.
- Contact is a bump, not a bite. It shoves you 16 units, flashes the screen edge and counts against you. You cannot walk through a robot, but you can always step away from one.
- A robot falls over after 66 damage and stays down, paint and all, until the next drill.

The drill readout under the top bar shows the wave, robots left and the clock. At the end it shows time, hit percentage, bumps and your best time. The best time is saved on this device as `deadlight-drill-best-v1`.

Every gun in the Training Grounds is its paintball twin, with the same magazine, fire rate, reload and range. The held gun gets a hopper and a muzzle in its paint color:

| Gun | Paint |
|---|---|
| Light Pistol | pink |
| Heavy Pistol | orange |
| Hand Cannon | yellow |
| Tactical AR | green |
| Heavy AR | blue |

The weapon readout shows a dot in that color. Paint behaves like this:
- Hits are still decided at once. The ball flies at 900 units per second, then splats on whatever it reached. On cover, the splat goes on the visible face, or on the top for low cover. Targets and robots carry their own paint. Shots that hit nothing splat on the floor.
- Reset clears the paint.

Aaron moved to his counter. His answers now cover the arena, paintball, Gadget, and the army being gone.

### v0.27.0 — Holdout in the Training Grounds

The cavern grew to 1960 × 2000 to fit a building. LEET AF built it out of pallets, doors, sheet metal and plywood in the middle of a yard, so a Holdout down here plays like holding a house out in the world:
- Five rooms with their names stencilled on the floor: bunks, stores, the hall, the kitchen and the office. Lino from a dozen kitchens on the floor, cots, shelving, tables and sandbags inside.
- Doorways on every side, and windows. A window stops your feet but not paint, and robots climb through it at a third of their speed.
- Cover out in the yard, and a barricade across the front with a chain-link gate. Gadget shuts the gate behind you when a Holdout starts and opens it when the run ends.
- Five robot hatches: three in the back wall and one in each side wall.
- The floor is drawn in four tiles of at most 2000 × 2000 pixels, so no texture is too big for a phone.

The LEET AF post sits between the stairs and the gate. Aaron's paintball shop (pegboard and counter) is on the left of the aisle and Gadget's parts counter and desk are on the right, side by side and facing you as you walk up. Her robot bench, the parked robots and the car-seat couch are behind her; the lane is off to the west.

Gadget's topics: **Start a Holdout**, **Run the warm-up drill**, **Call it off** (while one runs) and **Turn in parts** (when you have some). Aaron's first topic is **Browse the paintball shop**.

A Holdout:
- Starts when you walk into the yard. The gate locks and wave 1 comes 3 s later.
- Is endless. Wave n sends 5 + 2n robots, at most 24 at once, with a 10 s break between waves. Wave 1 is Shamblers; Runners join in wave 2, Husks in 3, a Spitter in 4 and the Brute in 5.
- You have 100 health. At zero you go down; 2.5 s later Gadget pulls you up at 60, shoving and stunning every robot close by. She does it once a run (twice with a Second wind), and the next down ends it. You cannot move or shoot while down.
- Ends with waves cleared, time, kills and parts. The best is saved as `deadlight-holdout-best-v1`.

The robots copy the roster (see the Zombie Roster doc). Each has a tell frame:

| Robot | Health | Speed | Tell | Damage | Rules |
|---|---|---|---|---|---|
| Shambler | 40 | 44–56 | Arms up for 0.35 s | 12 | Headshot ×2 |
| Runner | 30 | ~60, sprints at 150 | Shrieks for 0.5 s on sight (within 420) | 10 | Packs of 3–5, toy-car chassis |
| Husk | 70 | 40–50 | Arms up | 14 | Light Pistol and Tactical AR do ×0.35 to the body; headshot ×2 |
| Spitter | 60 | 50–60 | Jerks back, launcher glows green for 0.6 s | 8 on landing, puddle 10 a second for 4 s | Keeps 170–260 away |
| Brute | 400 | 38 | Paws for 1 s, eyes red | 40 and a 40 knockback | Charges at 300 for up to 1.2 s and stuns itself for 1.6 s on a wall. Front ×0.2, sides ×0.6, back or stunned ×1.5, explosives full |

A headshot is a hit within 4.5 units of the robot's centre line. Robots get 1.5 speed per wave.

Parts and tokens:
- Fallen robots drop parts (Shambler and Runner 1, Husk and Spitter 2, Brute 5). They scatter, then pull toward you within 50 and are picked up within 22.
- Gadget buys parts for a token each. The wallet (`deadlight-tg-wallet-v1`) keeps parts, tokens and what you own on this device.
- Aaron's shop sells each item once: Padded vest (60, +25 health), Speed loader (50, reload ×0.75), Big hopper (70, magazine ×1.3), Med kit (40, 40 health each break) and Second wind (120, one more pull). The weapon readout shows the bigger magazine.

The readout gains a second row in a Holdout: a health bar, a pip for each pull Gadget has left, and the parts you have picked up. The drill is unchanged as a warm-up.

### v0.28.0 — The field kit (visual overhaul, stage 1: interface)
Every screen now shares one salvage look, built in CSS on top of the old layers (the last block of `study/style.css`):
- **Plates:** panels are welded iron plates: a warm dark gradient, faint grit, four corner screws, a 1px seam and an inner bevel. Headers get a hazard stripe that fades out to the right. Used for the pause menu, the shop, talk, the grill, fishing, the weapon readout and the Holdout banner.
- **Type:** Saira Stencil for names and numbers (place, speaker, wave, ammo, tokens), Barlow Condensed for labels and keys, Barlow for sentences. Small labels carry an ember diamond.
- **Colour:** ember is live or yours, brass is tokens, green is health, red is hurt. The page, the Phaser clear colour and the app's theme colour are all `#141311`.
- **Gauges:** stamina, health and the magazine are skewed bars cut into segments.
- **Keys:** menu buttons are raised iron keys with an icon each; the main action is an ember key with cut corners. Travel gets its own row, and on touch the key hints are hidden.
- **Touch:** sticks are dark wells with a tick ring and an iron knob. Round buttons have an inner seam. The portrait console is diamond plate with a hazard strip.
- **Small touches:** prompts are tags with a bobbing pointer. The Use button breathes while there is something to use. The loading card has a pixel campfire and a sweep bar. The shop has pixel icons for every item, tokens and parts.
- **Phones:** no backdrop blur anywhere. The only animations are transforms and opacity on small elements.

### v0.28.0 — stage 2: Firelight Camp comes alive
- **Light and colour:** the ambient is darker and cooler (`AMBIENT` .5/.55/.74), and the fire throws a bigger, warmer pool (radius 300). Warm pools now read against cool shadow, which is the camp's grade.
- **Living light:** one flicker value drives the fire's glow, both its brightness and its size. Every lantern's glass gets a small breathing halo. Four moonlight shafts fall through the cave mouth and drift slowly.
- **Smoke:** soft puffs rise and spread from the fire, Stan's forge chimney and the generator's exhaust. They sit under the lighting, so the firelight colours them.
- **Dust:** 28 specks drift up through the fire and lantern pools and fade at the edge of the light.
- **Movement:** the washing sways on its line (five drawings, swapped every 0.24 s). The generator shivers, and its green lamp blinks.
- **Ground:** the sand is warmer, with mid-scale grain and wind ripples. The earth is packed darker where people stand, sit and work: tents, logs, tables, the forge, the range, the pot, the board, the rack, the woodpile, the cart, the shed and the shelter. Everything standing on the sand gets a soft dark pool. There are scraps of camp life (cans, offcuts, paper, rope, bottle caps) near the work spots, and pale cave grass along the walls and round the drips.
- **Wear:** every standing prop gets a grimy band at its foot. Canvas and wood get dirt specks toward the bottom. Both are painted only over the prop's own pixels.
- **Vignette:** a soft vignette, drawn in CSS over the game view.

**Effects quality** (`study/quality.js`, saved as `deadlight-quality-v1`) has three settings, set from Effects in the pause menu:
- **High:** all effects on.
- **Low:** the moonlight shafts, the dust and the vignette are off, and the smoke comes about half as often.
- **Auto** (the default): starts on High and samples the game's frame rate once a second while you play. Three slow seconds in a row (under 45 fps) switch it to Low; ten smooth ones (55 or more) switch it back.

A large additive bounce glow over the fire was tried and cut, because it cost the most frame rate for the least gain.

### v0.28.0 — stage 3: the arena and how the fight feels
- **Grade:** the Training Grounds are colder and moodier. The ambient is `.42/.48/.64` and the work lights are cool white (radius 350), so each lamp throws a pool, with darker floor between. The warm post and the red hatches stand out against the cold.
- **Haze:** a tileable soft-noise sheet drifts under the lighting, so it glows in the lamp pools and disappears in the dark. It is on High only, and it is the single most expensive effect.
- **Combat feel** (`study/juice.js`) is decoration read off the practice state. It never changes the fight.
  - **Shots:** every shot pops a small light at the muzzle, briefly lights the shooter, and puffs a little gas.
  - **Paint:** a ball that lands throws nine arcing drops in its colour and leaves a quick ring.
  - **Robots falling:** they pop with a flash, sparks, bouncing debris and smoke. The camera shakes a touch, and the game holds for 45 ms (110 ms for the brute).
  - **Other hits:** brute stuns, hits on you and grenade blasts each have their own shake. Blasts also flash, throw sparks and hold for 70 ms. Reduced motion turns every shake off.
  - **Tells:** a robot about to act shows a pip above its head in its kind's colour. A winding brute also marks a red ring on the floor where it will hit, and a shrieking runner sends out rings.
  - **Low quality:** keeps the flashes, shakes and tells, and halves the particles.
- **Pickups:** parts on the floor have a pulsing ring under their glint.
- **Banners:** a stencil title slams in mid-screen for a wave starting or cleared, the gate locking, going down, getting back up, and the end of a Holdout or drill.

Frame rate (software renderer, 1280×800):
- **High:** about 5 fps slower than stage 2, all from the haze.
- **Low:** matches stage 2. Post 20.3, yard 19.3, 16 robots firing 18.7.

## v0.29.0 — Twin-stick aim: the survivor turns all the way round
In the Training Grounds the survivor is drawn in layers, the way top-down twin-stick shooters draw their heroes (`study/layers.js`):
- **Legs** walk the way you move, in 8 directions. Move more than a quarter turn away from your aim and they face the aim side and run their walk cycle backwards, so you backpedal instead of twisting round. Move across your aim and they turn sideways under the body, so you strafe.
- **Body:** the torso, pack and walking arms take the nearest of the 8 facings toward the aim.
- **Arms and gun** are drawn ahead of time at 64 angles (one every 5.6°). The barrel points along the aim, and stays crisp pixel art with no runtime rotation.
  - The angle is worked out in the body facing's own space. Past straight up or down the gun flips over, so it is never held upside down.
  - Aiming toward or away from the camera foreshortens it by up to 35%. Aimed up, it shifts toward the trigger shoulder so it peeks past the head.
- **Head and neck** sit above the gun, as they always did. From behind, a gun-holder's pack is in this top layer too, so the arms show between the coat and the pack. The arms and head ride the body's bob and lean (`bodyShift`).
- **Shots** leave the end of the barrel you see (`muzzle()`) and meet the line of fire where they land. The muzzle flash sits there too.
- **Crops:** each layer is cropped to the part of the 160 × 192 frame it uses, measured over random looks with room to spare. Together the four sheets are about a quarter smaller than the old full sheet.
- **One source of truth:** `survivor()` stacks the same layers for one facing. So the creator preview (now drawn from the game's own layers), camp, residents and thumbnails all match. Unarmed and side-view frames are pixel-identical to v0.28. Front, back and diagonal facings with a gun now point the barrel exactly along the facing.
- **Camp:** no gun is carried there, so the body and legs still face the way you walk.

## v0.30.0 — The phone controller (portrait)
On a phone held upright everything that used to sit over the game lives in the controller deck below it, so the view is clear.
- **Top band:** the place name on the left (Holdout status takes its spot during a drill), weapon and ammo on the right (camp stamina and supplies in camp).
- **Sticks** raised to the middle of the deck. Between them: the camera zoom (− slider +, 0.35× to 1.8× on a log scale, remembered per device), then **Run** and **Reload** side by side. In camp, Run sits there alone and Use takes the right stick's place.
- **Bottom row:** Character and Menu on the left; Use, Grenade and Swap toward the right thumb.
- **No camera lead:** the view stays centred on the survivor, so flicking the aim back and forth doesn't swing it.
- **Run is a toggle** and spending stamina is a choice: tap to run, tap to stop, and it stays on after you let go of the stick. The ring round the button is your stamina. Run switches itself off with a buzz when you run dry and stays locked until you are no longer winded. The Training Grounds share the camp's stamina.
- **Grime** (`study/grime.js`): blood, smears and scrapes painted on the deck as pixel art from a fixed seed. A splash on the hazard stripe that runs toward the zoom bar, a hand dragged down the left edge, claw gouges on the right edge and along the bottom, a spray behind Grenade and Swap, dried specks and worn chips. It is kept off the sticks and the HUD text. Reload has a bloody thumbprint, Swap a few flecks and Menu a wipe.
- Landscape keeps the earlier layout for now; it will be redesigned to match once the portrait layout settles.

## v0.31.0 — The starter house

The tutorial survivor's home on the first night (`dist/home/`), chosen as a small one-story house: living room and kitchen along the north, bedroom, bathroom and front hall along the south, two screens of floor in all. Open it with "Go to the house" in the menu (or `?home`); like the camp, it is remembered as the last place. The power is out: cool moonlight comes through the windows and a candle burns on the coffee table. Every piece of art comes from the Master Creator's new home set and floor tiles (Master Creator 0.2.0, 56f4dbc); `home/data.js` only places it. Walls are cut away at 48 high and thin out when you walk behind them. Rule for placing anything: horizontal walls hide the 48 units of floor north of them, so furniture, pickups and pet spots must stay out of those bands (`tests/house.test.mjs` checks the pet spots).

Usable objects: the TV, a window, the bedroom nightstand, the hall closet, the fridge, the bookshelf and the front door ("Not without something to protect yourself with."). The pistol (nightstand) and the shotgun (closet lockbox, 8/16) are the next step.

The dog (golden Lab) and the cat (orange tabby) live here and never follow (`dist/companion/house.js`, `HousePet`). Each keeps its own routine of weighted spots with rest timers: napping in the dog bed, on the bed or the sofa, eating at the bowls, watching a window, stretching. The cat hops up onto the cat tree, sofa and bed. They find their way with a grid search round the furniture and through the doorways. When you come close the dog sits up and looks at you; the cat only glances when you are very close. Walk up and Pet: hearts, it sits and stays a moment, then carries on. They are called Dog and Cat for now.

## v0.32.0 — Waking up, and finding the guns

First time in the house (or after "Start the night over" in the menu, or with `?wake`), the tutorial opens on a short scene (`dist/home/wake.js`): you are asleep on the couch with the cat curled up beside you, the dog comes over and noses your hand, you sit up, stand, walk round the end of the couch and pet the dog and then the cat, sirens outside, and "Find something to protect yourself with." Letterboxed captions; Skip (or Esc) jumps to the end. The couch is seen from behind, so lying, sitting and standing are the standing sprite lowered behind it and cut at its foot. The pets are called over with `HousePet.goTo` and go back to their routines afterwards; this is the one time they come to you.

Then the goal shows under the stamina bar. The Light Pistol is in the bedroom nightstand (15 loaded, 15 spare) and the Pump Shotgun in the hall closet lockbox (8 in the tube, 16 spare). Opening either shows the gun inside; Take puts it in your hands, a note says what you got, and the gun chip shows the gun and its rounds (tap it, or Q, to switch once you have both). The front door says what is still missing, then that outside is the next part. Saved under `deadlight-home-v1` (`dist/home/kit.js`).

The Pump Shotgun is now a gun everywhere (Master Creator 1ab1d3e): seven pellets in a fixed fan, a pump between shots, one shell loaded at a time (you can fire part way through), and its paintball twin in the Training Grounds.

Fix: on phones the first few seconds of walking were slow. Phaser's frame smoothing holds each step to a 60 fps frame for about 120 frames after the page gains focus or wakes, so a phone drawing fewer frames walked slowly until that ran out. The game now steps with the real time between frames (`fps.smoothStep` off; every scene still caps a long frame at 50 ms).

## v0.33.0 — Pistols never run dry, and three backpacks

Pistols are secondaries: they still reload, but their spare rounds are unlimited, and the gun chip in the house shows them as ∞ ("15 / ∞"). Shotguns and rifles are primaries and only have the ammo you carry; the Pump Shotgun still starts at 8 and 16. The rule lives in the Master Creator (`slotOf`, `unlimited` in `weapons/equipment.js`); the house kit saves a pistol's spares as null and restores them as unlimited.

Three backpacks (Master Creator f912048), chosen in the creator's Pack tab: Canvas daypack (small, 5 × 4 grid, 12 kg), the Leather pack (medium, 6 × 6, 20 kg) and a Frame pack (large, 8 × 7, 32 kg) with its frame showing above the shoulders and a red wool bedroll strapped under. Their grid and weight data is in `dist/mc/assets/gear/bags.js`; the inventory screen that uses it comes next. Pack choices only appended (2 and 3), so saved looks keep their pack.

The crafting and upgrades plan (tiers, armor pieces, materials, wear and repair, ammo) is the Claude Doc "Deadlight Hollow: Crafting and Upgrades".

## v0.34.0 — The inventory screen

In the house, once you are awake, the Bag button (top right, Tab, or D-pad up on a controller) opens your bag and pauses the game. Left: the pack you wear, the weight you carry against its limit, and your two equipped guns (tap one to put it in your hands). Right: the pack's grid, sized by the pack (5 × 4, 6 × 6, 8 × 7, or 3 × 2 pockets with no pack). Tap an item to pick it up and tap a free cell to put it there, or drag it; R (Y) turns it, Sort (X) packs everything tight, Esc (B) lets go and then closes. The rules are in `dist/home/bag.js`; the screen is `dist/home/bagui.js`.

Supplies (Master Creator c4286c8, `gear/items.js`): shotgun shells (24 a stack), rifle rounds (60), gun oil, scrap metal, cloth and leather, powder, electronics, oil and solvent, each one cell with its weight; spare guns are items too (pistol 2 × 1, shotgun 6 × 1, rifle 6 × 2). The shotgun's spare shells are now the shells in your bag: the closet gives 16 shells and a bottle of gun oil with the gun, and older saves move their spare shells into the bag. Three new places to search in the house, none of them needed to leave: the kitchen drawers (3 scrap metal, 1 electronics), under the sink (oil and solvent) and the laundry basket (2 cloth).

Weight counts the bag and both equipped guns. Over the limit you move more slowly (down to 70% at half again over) and running drains stamina 1.5 times as fast; the Bag button shows an orange dot. Changing to a smaller pack in the creator keeps what fits where it was, places the rest again, and sets aside what still will not fit ("Doesn't fit in this pack"); set-aside things weigh nothing and come back when you tap one and then a free cell, or Sort.

## v0.45.0 — Runners and brutes

From the build order (2026-10-11): the first two special dead.

**Runners.** Out for a run when it happened: lean, in sportswear, with eyes that catch the light. 40 health. Once one has you it sprints (150, faster than you walk, slower than you run). Close in with a clear line it crouches for 0.3 seconds, with an orange tell, and leaps along the line it had at the start of the crouch. Stand there and it lands for 16; step aside or dive and it misses and lies sprawled for most of a second. A shotgun blast breaks the crouch. Their sheet holds the lurching run in place of the walk. (`RUNNER` in `street/fight.js`.)

**Brutes.** A big man gone bad, drawn half as big again. 420 health; a shotgun barely shoves one and nothing staggers it. With a clear run at you from 110 to 330 units it sets its feet for 0.6 seconds (a red ring on the ground and a tell) and charges in a straight line for up to 1.4 seconds: 30 damage and a long throw if it hits you. Dive out of the way. If the charge runs into something solid it is stunned for 1.8 seconds and takes half as much again from every hit. Close in it swings slowly (0.75 second tell) for 32 and a throw. It always drops 4 to 8 shells. Brutes never come apart. (`BRUTE`.)

**Where they come from.** Patrols have a chance of runners (12% each while Stirring, 20% Hunted, 25% Swarming) and, while Hunted or worse, a 15% chance of one brute; every horde while Swarming has a brute. The tutorial's second wave now has one runner in its last rush.

## v0.44.0 — Heat, patrols and hordes

From the build order (2026-10-11): a heat meter, patrols and hordes, the Helldivers pressure loop.

**Heat.** A meter from 0 to 100 of how much noise you have made lately (`HEAT` in `street/fight.js`). A pistol shot adds 3, a shotgun blast 6, a kill 1 and a car alarm 30. After 8 seconds of quiet it falls by 2.5 a second. Four levels, shown under your health with their name: Quiet, Stirring (25), Hunted (50) and Swarming (80, the name pulses).

**Patrols.** Once the tutorial's fight is over, the neighbourhood sends patrols: three to five of the dead come down a street or side street from out of sight (620 to 820 units away) and head to where you were, noticing you the way wanderers do. One comes every 90 seconds while Quiet, 50 Stirring, 30 Hunted and 20 Swarming.

**Hordes.** While Swarming, a horde of 10 to 14 comes from one side every 45 seconds (the first within a few seconds of hitting Swarming), already hunting you. A banner says which way it is coming from. Shooting your way out keeps the heat up; going quiet is the way to make it stop.

**Limits.** At most 40 extra dead at once; any that have not seen you, and their bodies, are let go once you are 1500 units away.

## v0.43.0 — Scavenging

From the build order (2026-10-11): ammo, scavenging, caches, drops from the dead, bigger loads.

**Search the neighbourhood.** Every parked car, trash bin and garden shed can be searched, and so can two in three of the neighbours' houses (the rest you still knock on). Press Use at one and you start going through it: it takes about a second standing still, with a ring filling over it. Moving, shooting, diving or getting bitten stops it, and nothing is taken. What turns up is in your bag and on screen ("Parked car: 4 shotgun shells, scrap metal"). 175 spots in all; each is searched once.

**What is where.** Each kind of spot has its own odds (`LOOT` in `home/kit.js`): cars are the best bet for shells, sheds for scrap, powder and solvent, houses for shells and cloth, bins for not much. What a spot holds comes from its id, so the neighbourhood holds the same things every night.

**Stashes.** Eleven survivor's stashes sit in back yards round town: an ammo can and a duffel under a tarp, with orange tape on the handle. Each is a big load: 10 to 14 shells, powder, scrap and maybe gun oil.

**Car alarms.** One car in eight has its alarm set. Opening it sets it off: every wanderer within 900 units comes to see, and keeps coming.

**Drops from the dead.** The cop drops a few shells most of the time; a worker sometimes drops scrap; anyone else sometimes a few shells or a rag. Drops lie where the body fell, bobbing with a glint, until you walk over them.

**Master Creator.** A survivor's stash prop in the street set, and three sounds: rummaging, picking something up, and a car alarm.

## v0.42.0 — Gore

From Jaykobi (2026-10-11): more gore and blood; zombies blown in half; something like ragdolls.

**Bodies come apart.** A shotgun kill within 80 units cuts a zombie in two at the waist, and between 80 and 140 it does 40% of the time (`GORE_KILL` in `street/fight.js`). A pistol kill takes the head off 22% of the time. The bottom half (or the headless body) topples where it stood; the top half or the head flies along the shot, tumbling, bounces, skids and lies where it stops, dripping as it goes. Gibs (meat, ribs, bone, gut, a hand, cloth, scalp) are thrown from the cut. Pieces and gibs are faked ragdoll: they fall, bounce and slide like the casings, and the last 70 stay on the ground.

**Crawlers.** Half the top halves keep coming: the piece lands a little way along the shot and starts dragging itself at you by its arms (`CRAWLER`: 25 health, slow, low). Instead of biting it grabs your ankle: less damage, but you are held nearly still for a moment; a dive tears you free. A crawler from a wave counts as one of that wave, so the street is not quiet until it is dead. The second wave also has one that lost its legs before tonight, coming up from the south.

**Much more blood.** Blood is now stamped as pictures: a spray thrown past every hit, more on a kill, a pool where each body stops, drops where pieces land and bounce and along a crawler's way, and splatter up the wall of anything solid just behind a zombie you shoot (when you can see that wall's face). The last 240 stamps stay.

**Gore setting.** The menu has "Gore: Full / Reduced" (kept as `deadlight-gore-v1`). Reduced: no bodies coming apart or crawlers from kills, and about half the blood.

**Master Creator.** New `assets/effects/gore.js`: `zombiePiece` (any look and facing cut at the waist or neck along a ragged line, with a wound, spine and gut), `crawlArt` (the crawling top half, 8 facings by 4 frames), `gibArt`, `bloodArt` (pool, spray, drops, drag mark, wall splatter) and the `GORE` palette, with library entries for each. Existing art is unchanged.

## v0.41.0 — Combat polish

From Jaykobi (2026-10-11): polish things like the dive animation; the right stick should only shoot when pushed all the way, with a setting so each player can choose.

**Fire at a full push.** The touch fire stick now shoots only when pushed all the way to the edge of its ring (`AIM.fireAt` 1, was 0.85). The menu has a "Stick fires at" slider (touch only), 50% to 100% in steps of 5, kept on the device (`deadlight-fire-at-v1`); a controller can change it with left and right while it is focused.

**Drawn dive frames.** The dive no longer tips the standing sprite over: it has its own frames, built in the Master Creator from the survivor's layers so every look and gun gets them (`paintDive`, `DIVE` in `assets/characters/layers.js`; a "Survivor dive" entry in the library). Three phases for each of eight directions: the leap (tipping forward mid-stride), the slide (flat out along the ground, going over onto your side left and right, lying along the line up and down the screen, foreshortened) and the rise (pushing back up), each with a shadow on the ground. Dust kicks up along the slide.

**Guns that cycle.** The pistol's slide snaps back over a brass case for a moment as it fires, and the shotgun's pump is pulled back (with the hand on it) a moment after each shot, in time with the pump sound and the hull coming out. New Master Creator art: guns take an `act` (0 at rest, 1 racked), and `paintRacked` draws the arms layer racked at all 64 angles. Existing art is unchanged (parity checked).

**Hits and deaths.** A hit zombie flinches back away from the shot for a moment as well as flashing white. A killed one topples over, pivoting at the hips as they drop to the ground, then greys, puffs dust where it lands, and leaves its pool where it stops sliding.

## v0.40.0 — Combat feel, first pass

From Jaykobi (2026-10-10): the fight "just works, but it doesn't feel like a solid twin stick shooter. We gotta get that down here in the tutorial." The numbers live at the top of `dist/street/fight.js` and `dist/street/scene.js` so they can be tuned by feel.

**Clock and controls.** The street fight now runs on a steady clock, sixty steps a second (up to four a frame), so it plays the same on a slow phone as on a fast one (`STEP` in `street/scene.js`). Shooting and reloading slow you less (`SLOW` in `street/fight.js`: 90% for a moment after a shot, 82% while reloading, was 80% and 72%), so you can back off while you fight. The touch stick turns faster (900° a second, was 720°) and pulls a little harder toward the dead (a 14° cone out to 300 units, was 12° and 260). A controller's stick now gets a gentler pull too (8°).

**Shots with weight.** Each shot lights the street round you for an instant (stamped into the night's light map, wider for the shotgun), throws a hard little star of fire and sparks from the muzzle, kicks your arms and head back along the shot, and jolts the view away from it (`KICK`; skipped with reduced motion). The pistol throws a brass casing out of the right side of the gun; the shotgun's red hull comes out when you pump it. Casings bounce and stay on the ground (the newest 60). Shots that stop on a car, house or fence throw sparks back toward you and a puff of dust.

**Hits you feel.** A hit zombie flashes white. Guns shove harder (`SHOVE`: pistol 80 and a 0.22 s stagger, shotgun 58 a pellet and 0.4 s, half as hard again from inside 70 units), and a killing hit throws the body nearly twice as far. The dead now slide to a stop on the ground (they used to freeze where they fell) and leave their pool of blood where they stop. Blood is thrown out of the far side along the shot, with a splash on the ground beyond.

**The dive.** C on a keyboard, B on a controller, and a Dive button on a touch screen (next to Run in landscape; over Run and Reload on the phone deck, where the zoom bar was; zoom is still in the menu there). A burst of about 80 units along the way you are moving (or aiming, standing still), costing 24 stamina; too winded and the Run button shakes instead. While you are in the air a bite misses; then you are on the ground for a moment and cannot shoot until you are up (`DIVE`). You tip over onto your side the way you went and get back up.

**Bigger, staggered groups.** The first wave is the cop and five more coming out of the dark one after another (was two). Opening the trunk brings twelve (was three), in three rushes: three from the west, four from the east, then five from all round.

**Aim.** With a mouse, a crosshair (four ticks round a dot that spread after each shot) replaces the pointer over the street. The touch laser stops at the first thing it touches and shows a dot there.

**Sound.** New Master Creator sounds (6747069): a gun thump layered under each shot (deeper for the shotgun), the dive, and casings landing (brass or hull). Any Master Creator sound can now be played quieter, and groans fade with distance: full close up, a murmur at the edge of hearing.

## v0.39.0 — Smarter dead, readable walls, and a flashlight

From Jaykobi's first walk of the neighbourhood (2026-10-10): the zombies get stuck, fences and gaps along walls that run away from you are hard to read, the door between the kitchen and living room is hard to see, and the dark might be fine with a flashlight to try.

**Pathing** (`dist/street/paths.js`). A 16-unit grid knows where a zombie fits (each square checked against the props the first time it is asked). Four times a second, while anything is coming for you, a flow map spreads out from every player, up to 960 units, and each square learns the next step toward the nearest one. A zombie with a clear line walks straight at you; one with a fence or a house in between follows the flow round it and through the gap. Players are a list, so this already works for co-op. In a test of 60 random back-yard chases, zombies reached you within 30 seconds 50 times, against 25 before; most of the rest were still on their way round a long block.

**Walls and gaps.** Doorways in walls that run away from you no longer draw a header across the gap, so the end of the wall shows, and each now has a half-open door standing in it (new Master Creator art, `doorleaf`; Master Creator 09ca061) and a threshold board running out into both rooms. Wooden fences have a post at each end and every so often, and every fence throws a shadow along its foot, so you can see where it stops; side fences are a little thicker.

**The flashlight.** A gun light, on by default, that throws a warm cone about 240 units long from the muzzle, plus a small pool round you. On the street the grenade button becomes the Light button; F on a keyboard, D-pad down on a controller. It is added into the night's light map, so it lights what it falls on rather than glowing over it (the chunks' light maps and the beam are drawn into one screen-sized picture each frame). The trade-off: a wanderer the beam falls on, within 300 and with nothing in the way, sees you from that far instead of 190.

## v0.38.0 — The first map: the neighbourhood

The street is now a whole neighbourhood (Jaykobi, 2026-10-10: "about 5x5 blocks of a rural suburb"). `dist/street/data.js` lays it out: five blocks by five, 9640 × 3480 units. Each block is one row of houses facing south onto its street, with back yards behind running up to the street to the north, so walking north you cross back fences and yards. Six side streets cross between the blocks, and fields with pines and a farm fence run round the edge of town. Your block is the middle one, as it was: your house, the corner house, the Parks' and the house past them, and the cruiser in the pole. The other 24 blocks come from a seed, so the map is the same every time: four or five lots each, every lot with a house (one of 11 sidings and four roofs, a door, windows, maybe a garage and chimney), its porch and path, shrubs, maybe a tree, a mailbox, a picket fence, a car at the curb, bins out, a back fence (wood or chain-link), a side fence, a shed and back-yard trees; poles, a lamp, a hydrant and stop signs along each street. Every neighbour's door can be knocked on (12 names, 8 kinds of answer). New Master Creator art for it: houses, trees, pines, stop signs, bins, sheds, wood and chain-link fences, five sidings, and dirt, gravel and field ground (Master Creator 71d5714).

**Built for big maps, per the plan.** The map is far too big for one picture, so it is drawn in 512-unit chunks (`dist/street/scene.js`): the ground and light of the chunks round the screen are painted as you come near, a strip at a time across frames (anything already on screen is painted at once), and let go once you are well past; each prop is painted while any held chunk touches its picture. Collision and cover use a grid (`solidAt`, `coverAt`), so they only check what is near. Zombie sprites come from a pool sized to what is on screen. Walking laps of the whole map holds steady (no leak); on a phone-sized test the whole game holds about 220 MB on the graphics card and 75 MB of canvases, about what the one street held before.

**Wanderers.** About 70 of the dead are out in the other blocks, drifting round their yards. One that sees you within 190, or hears a shot within 420, comes for you, and gives up once you are 900 away. Far ones that have not seen you are only updated twice a second. Wanderers do not count toward the street's story (the cruiser's first wave and the second), but they do count as contact: the front door stays shut while anything is coming for you. One you put down stays down for the night; going down puts the rest back where they were. Houses, trees and sheds go see-through when you are behind them.

## v0.37.0 — The new aim stick

The touch fire stick no longer fires the moment the thumb leaves the middle, which sent shots the wrong way when a thumb landed off centre or flicked across (Jaykobi, 2026-10-10). Now (`dist/study/aimstick.js`): a push past 15% turns you toward the stick at 720 degrees a second (half a turn in a quarter of a second) and shows a faint red laser from the muzzle; pushing past 85% fires, but only while you face within 8 degrees of the stick. A pull toward the nearest zombie (or, in the Training Grounds, robot or paper target) within 12 degrees and 260 of the line moves the aim toward it: all the way when it is right on the line, none at the edge of the cone. The stick ring still lights orange while firing. Mouse and controller aim as before. These numbers are first guesses to tune by feel on a phone.

## v0.36.0 — The phone crash, and your own thoughts

**The phone crash going out the front door (reported 2026-10-10).** Every painted picture lived three times: the canvas, a copy of its pixels Phaser keeps for reading back, and the graphics card's copy. On the street that came to about 770 MB, which a phone kills the page for (it reloads, and the fresh start puts you back on the couch). Now, in `dist/study/memory.js`: the read-back copy is dropped from every canvas texture (nothing reads pixels back); big pictures painted once (floors, front walls, light maps, the house's dog and cat, the dead, every street prop) keep only the graphics card's copy and are painted again from the same recipe if a phone drops the graphics context; and the Training Grounds' floor, front wall and light map wait until you first walk into the room, so a night that starts at home never holds them. The street is now about 290 MB in all and every picture is pixel-identical (checked on screenshots, including after a lost and restored context). Rule from here: a texture painted once goes through the scene's `texture(..., once)` or `bake()`; a texture that is repainted (looks, paint splats, the nightstand and closet) does not.

**Your thoughts** (`dist/home/thoughts.js`). Short first-person lines in italics under you, apart from the talk box, which still describes what you look at in the second person. Each is said once a night, when its moment has lasted long enough; one at a time, a beat apart; they wait while you talk, read, use the bag or watch the wake-up scene, and a moment that passes before its turn is dropped rather than said late. At home: no gun yet ("I'm not walking out there with nothing"), a reminder of the nightstand if you wander, the door without a gun, the shotgun in the closet once you have the pistol (or the pistol once you have the shotgun), "That's everything. Front door.", telling the dog to stay, and a nudge if you linger. On the street: the cold and the lights, the cruiser in the pole, the first one walking wrong, the first bite, the first kill, low health, out of shells, after going down, the street clear, the trunk bringing more, and quiet again. Starting the night over resets them.

## v0.35.0 — Outside: the crash and the first fight

**Combat feel (decided 2026-10-10): Helldivers 1.** Every fight is aimed at Helldivers 1's feel and pace: few enemies but each one dangerous, guns with weight that shove what they hit, reloads you commit to (you move at 72% while reloading and 80% for a moment after each shot), attacks you can see coming, and groups that come at you from more than one side. The camera does not lead the aim for now: aiming back and forth or spinning made the earlier lean feel janky (Jaykobi, 2026-10-10), so the street keeps the camera centred on you. The Training Grounds still lean (v0.22.3).

**Fresh start every load (for now).** While the tutorial is being built, every visit starts on the couch with nothing: `FRESH` in `dist/home/kit.js` makes the saved night and the saved place be ignored on load (the game still saves as you go). `?keep` turns it off for testing the room; `?street` starts on the street, awake, with both guns. The night waits in the dark for a first tap or key ("Tap anywhere, or press any key, to begin") so its sounds can play.

**The crash.** After the pets, the wake-up scene adds: sirens; "One of them is close. Tires on your street, coming fast." with the cruiser's red and blue light sweeping past the front of the house and its siren and engine passing; "Brakes. Then a crash, a few houses down." with the crash and a camera shake; the light keeps turning down the street; "Find something to protect yourself with. Then go and look." The goal becomes "Go and see what crashed down the street" once you have a gun (one is enough; the door tells you the other is still there). The front window describes the cruiser in the pole.

**The street** (`dist/street/`): your house front and three neighbours' along the north side with roofs, yards, fences and the mailbox; sidewalks, a two-lane road with a dashed line, two parked cars, a dark street lamp or three, a hydrant; lawns, hedges and fences to the south running into the dark. The cruiser is up on the curb with its nose in a leaning pole, the near front door hanging open, glass on the sidewalk, skid marks across the road, its light bar turning (red and blue glow) and one headlight still on. A candle moves behind the Parks' window; the corner house's door is open a crack. Night light is darker than the house.

**The first fight** (`dist/street/fight.js`): your real guns. The pistol has unlimited spare magazines; the shotgun loads a shell at a time from the shells in your bag, and clicks empty with none. Hitscan bullets and pellets stop at the first zombie or anything 20 or more tall (the hydrant and the steps do not stop them); shotgun pellets do 55% past 150. Hits shove and stagger (pistol 55 and .16 s, shotgun 42 a pellet and .32 s), bleed onto the ground, and the shotgun's shove breaks a bite that is winding up. Zombies shamble at 40 and lurch at 64 within 80; a bite stops for .45 s with a yellow tell above the head, then lands for 14 within 32 (step back and it misses), with a shove and a 1.1 s cooldown. You have 100 health, which comes back at 5 a second after 5 s untouched. Going down shows "You went down" and puts you back on your step after 3 s with exactly the rounds and shells you came out with.
- The cop (80) waits at the open door until you come within 190 or fire; then two neighbours (60, 55) come out of the dark, one from the side yard and one from across the road. Clear them: "Street clear · Search the police cruiser".
- The trunk: 12 shotgun shells and 30 rifle rounds (for a rifle you do not have yet). Opening it brings three more, from the west, the south and the east: "More of them · Drawn by the noise". Clear them: "Quiet again · That is the tutorial so far".
- The door back in will not open while anything is coming for you, and only answers when you face it. The street remembers where the fight got to (`street` in the house save: start, cleared, looted, done); leaving mid-fight brings that wave back fresh.
- No grenades on the street. The Bag works here (it pauses). The HUD: the weapon panel with spare shells, and over the top a Contact readout with the count and a health bar; on the portrait deck the goal moves into that readout.

**Sound, for the first time.** `dist/audio.js` plays the Master Creator's synthesised sounds on one AudioContext started by your first tap or key; Sound: On/Off is in the menu (remembered). New sounds in the Master Creator (3aea1b2): the cruiser speeding past, the crash, pistol and shotgun shots, the pump, a shell going in, a magazine going in, an empty click, zombie groans (three voices), a hit and a bite. Street props (3aea1b2): parked cars in five paints, the police cruiser (light bar dark, red or blue; crashed with the door open; trunk open), utility poles, street lamps, fire hydrants, and asphalt.

## Ideas queued (from Jaykobi, 2026-10-10)
- **Mop, the camp dog:** a little terrier with knotted, matted hair who wanders the camp and is looked after by everyone there. Later, Mop gives the player a quest that leads them out into the world to find and rescue their own companion (dog or cat).
- **Macy, pet makeovers:** Macy was a zookeeper, so she can help the player change their animal (cat or dog) and its looks.
- **The intro, "The Fall":** a channel-flipping cold open on a modern flatscreen, about 60 seconds. Marrow Industries' LZ-6 ad, the live Lazarus trial, millions lining up, tonight's breaking news, a field crew attacked outside St. Agnes, the emergency alert (bites are infectious), Dr. Varga on Myrphol (say "mire-fall"), the drug that slows the infection, before the signal dies, then the power cut and the title. LZ-6 takers fall to a sudden fever about two months after the shot, die again within 24 hours and rise. Field reporter: Alex Park. The survivor reflected in the black screen, with a dog and a cat, is the tutorial character, who dies. The script is a Claude Doc; the five-second Channel 6 test (`cinematic.html`) was the proof of concept.
- **Intro changes after the step 2 pass:** the national network is now **MTNN, My Time News Network** (replaces MRN; the TV brand stays VESPERA). Every segment needs slowing down: there is too much on screen to read the captions and take in the picture without missing something. Longer holds per shot and per caption, even if the intro grows past 60 seconds for now. Steps 3 and 4 (the field crew, the alert, Dr. Varga, the power cut) are on hold while the tutorial comes first.
- **The tutorial opening (next focus):** after the TV dies, the starter survivor (a man, not the custom character) gets up from the couch and pets the dog and cat, then the player takes over. First goal: find protection in the apartment. He owns a **Light Pistol** and a **pump-action shotgun** with an 8-shell tube; the player starts with 8/16 shells (8 in the tube, 16 in the inventory).
- **Inventory on backpacks:** the inventory belongs to the backpack, so its size and carry limit change with the bag. Needs an inventory screen and several bag types. Decided: **grid + weight**. Items take shapes on the bag's grid (a shotgun is long, shells are small), bigger bags have bigger grids, and each bag also sets a weight limit.
- **Weapons and ammo (decided 2026-10-10):** pistols are the secondary weapon and have unlimited ammo. They still reload, and each pistol is unique in damage, fire rate, reload speed and magazine size. Primary weapons (shotguns and rifles) use ammo the player has to carry.
- **Backpacks (decided 2026-10-10):** three bags, Small, Medium and Large. Drawn and in the data since v0.33.0.
- **Crafting and upgrades (decided 2026-10-10):** weapon tiers; armor as head, body and leg pieces shown on the survivor; common scrap from anywhere plus rare parts from special infected; armor wears as it is hit and guns foul with use (gun oil in the field, a full clean at camp); shotgun and rifle ammo found and crafted at camp. The full plan is the Claude Doc "Deadlight Hollow: Crafting and Upgrades".
- **A Master Creator:** one place that houses every reusable asset (characters, animations, sounds, objects) so they can be browsed and reused. Today the character creator covers survivors, zombies and pets; everything else lives in code across `study/`, `companion/`, `camp/`, `grounds/` and `intro/`.

## Where we are and what's next (2026-10-10)
Bookmark set by Jaykobi before starting the Master Creator.

**Done so far:** v0.30.0 phone controller with deck grime (main game). Intro "The Fall" steps 1 and 2 on the test link (`intro.html`): the VESPERA set, the channel flips, the Marrow ad, the MRN live trial, the LZ-6 queues, the BREAKING sting and tonight's anchor with the Alex Park feed. The script is the "Intro Script: The Fall" Claude Doc.

**Work queue, in order:**
1. **Master Creator (now):** a separate pixel-art asset project, kept independently of Deadlight Hollow and reusable across future games in this style. It houses characters, animations, sounds and objects; Deadlight Hollow is built from it. Lives in its own repo, `xJAYKOBIx/master-creator` (a copy is in the shared folder under Master Creator). Version 0.1 (2026-10-10) holds the survivor and zombie, dogs and cats, the guns and grenades, the grime brushes, the TV and broadcast effects, the pixel font and 25 sounds, all checked pixel for pixel against this game. Version 0.2 adds 79 props (camp and workshop sets), the training robots and the brute, fish, campfire flames, map markers and spray-paint lettering, again checked pixel for pixel (241 placed props). Since 2026-10-10 this game loads that art from it: `dist/mc` is a copy of the Master Creator's `assets/` folder, made by `tools/sync-master-creator.sh /path/to/master-creator` (it writes the version to `dist/mc/VERSION`), and the game's old art files (`study/`, `companion/`, `intro/font.js`, `kit.js`, `tv.js`, `overlay.js`, the sound kit, and the props, icons, fish, flames and robots in `camp/art.js` and `grounds/art.js`) now only re-export from it, so every import in the game still works. Change shared art in the Master Creator, then run the script again; never edit `dist/mc` by hand. The ground and lighting of each map are still drawn here. Its next step: ground and scenery tiles.
2. **Tutorial opening:** the house, the wake-up scene and the two guns are in (v0.31.0, v0.32.0); outside, the crash and the first fight are in (v0.35.0), and your thoughts guide you through both (v0.36.0). Next: where the tutorial goes after the street is quiet.
3. **Inventory:** the three bags (v0.33.0) and the inventory screen with supplies (v0.34.0) are in. Next, as the crafting plan orders them: wear (armor condition, gun fouling, gun oil), materials in the world, then Hollis's workbench.
4. **Intro revisions:** rename MRN to MTNN (My Time News Network) in code, slow every segment down, then steps 3 (the field crew attack and the emergency alert) and 4 (Dr. Varga and Myrphol, the power cut, the reflection, the title, skip), then put the intro in the game.
5. **Later:** Mop the camp dog and his quest, Macy's pet makeovers, the landscape controller redesign, a trademark search on every in-world name before release.
