## Active direction — character first (v0.7)

The user has reset development scope to a single polished character in simple rooms. The v0.6.1 character and directional arm correction are approved. Add a small first set of hair, beard and hat choices before expanding the environment or clothing/armor system. The established Hollow concept remains context; the village and customization work below are preserved history, not current feature priorities.

Reference: `design/character/style-reference.jpeg`. Aim for bold dark outlines, readable hair clusters, layered navy clothing, brown leather, compact proportions and genuine front/rear three-quarter views. Keep the existing display frame dimensions. No Blender is required; authored pixel layers are rasterized into one cached directional atlas. Do not claim the reference has been matched exactly or the character finalized without user review.

Two rooms provide movement space and collision/occlusion checks. The inspection modal shows the same runtime atlas, at close scale, with all directions and idle/walk/run playback. Controls remain sparse and phone-friendly. Do not introduce new combat, inventory, economy or missions during this stage.

---

# Deadlight Hollow — agreed direction

## User decisions

- Mobile/browser first; iPhone landscape is the primary control/layout target.
- Keep the angled camera and twin-stick shooting feel. More visual richness without a Blender production dependency.
- Solo game with optional co-op in the future. Party scaling remains undecided.
- Central persistent community and large instanced open-world regions, inspired structurally by Monster Hunter; objective combat inspiration from No More Room in Hell 2. Original content and story.
- Build the hub and a training area before designing or implementing expedition missions.
- Hub: a beautiful large cave with an ocean inlet and a little beach inside. Locally once known as Moonlight Hollow; after the disaster a large bustling survivor village called Deadlight Hollow.
- Equipment should determine roles. Class/discipline leveling and eventually combining mastered disciplines remain candidate systems, not finalized mechanics.
- Customizable characters; meaningful gathering/crafting for weapons, armor, consumables, and community needs. Balance to be developed through playtests.

## v0.3 implementation choices

Phaser 4.2.1, original procedural sprite/scenery art, separate simulation. Established village with eight service NPCs and ambient residents. Services are outdoor interactions; buildings do not yet have enterable interiors. Hub is safe; weapons work only in the training yard.

Training has targets and repeatable simulated infected encounters. Ammo reserves and reset supplies are explicitly training conveniences. They are not final RPG economy decisions. Existing pistol/carbine/shotgun/rifle are available to compare immediately. Gear tuning is a small linear sample; branching upgrade trees remain future design work.

Crafting starts with five resource families, tonics, two armor recipes and weapon tuning. Caches are one-time rewards; drills provide repeatable small rewards. No real-world chemical recipes. No missions, settlements elsewhere, persistent hunger, permadeath, multiplayer, classes or story campaign implemented.

## Hub districts

Lantern House / high terraces; central common square; Salvage Works; Tideward Clinic; Thread & Tide; Common Table kitchen; Shore Market; inlet and docks; moonlit shore; separate southeast training yard. Village shortcuts assist early playtesting, alongside continuous walking paths.

## Next review priorities

Actual iPhone touch comfort and sustained performance; settlement art and cave identity; readable combat during large drills; accuracy/damage/armor balance; hub path density. Preserve the concept art's warmth, ocean inlet, small beach and living community as the art improves. Do not imply procedural first-pass visuals match the concept illustration's fidelity.

Co-op will need an authoritative session model, reconnect behavior, and explicit shared versus personal progression rules. Keep simulation commands separate from UI/rendering now; no claim that networking is implemented.

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
