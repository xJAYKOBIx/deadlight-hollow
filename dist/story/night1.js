// Night one, every line in one place (v0.53): who says what, scene by scene. The game reads its lines from here, so the script can be
// rewritten without touching the scenes. Written up for review in the Night One Script doc. Lines are [who, text]; who is one of
// SPEAKERS. Story lines wait for a tap in the dialog box; thoughts drift up over your head and go by themselves.
export const SPEAKERS={owen:'Owen',you:'You',guard:'Guard 2-6',watcher:'???'};
export const SCRIPT={
 // Scene 1. The cutscene after the first tap: Duke wakes him, he sits up, he stands. Then the house is yours.
 wake:{up:[['owen','Mm. Hey, Duke. What time is it?']],power:[['owen','Power\'s still out.']],go:[['owen','Candle\'s almost done. Flashlight\'s in the kitchen drawer.']]},
 // Scene 2. The junk drawer, then the crash wherever you are standing.
 drawer:[['owen','Menus, rubber bands, screws... there.'],['owen','Batteries are still good.']],
 crash:{sirens:[['owen','That\'s a lot of sirens.']],close:[['owen','That one\'s on our street...']],after:[['owen','That was right by the Parks\' place.'],['owen','Somebody could be hurt in there.'],['owen','Pistol\'s in the nightstand. Shotgun\'s in the hall closet.']]},
 // Looking at things in the house, and what the drawers and the closet hold.
 look:{
  tv:[['owen','Dead. Right before the power went, the news was yelling about the bridges.']],
  window:[['owen','Every porch light\'s out. Somebody\'s car alarm is going and nobody\'s shutting it off.']],
  windowCrash:[['owen','The cruiser\'s nose-first in the pole by the Parks\' place. Lights still going.'],['owen','Nobody\'s got out. Nobody\'s come out of the houses either.']],
  fridge:[['owen','Still cold. For now.']],
  bookshelf:[['owen','The dog-training book. Duke won that one at chapter two.']],
  sink:[['owen','Dish soap, sponges, a mousetrap nobody set.']],
  laundry:[['owen','Clean, folded, never put away.']],
  counter:[['owen','Menus, rubber bands and a lot of screws.']],
  dark:[['owen','Can\'t see a thing in here. I need that flashlight.']],
  nightstand:[['owen','Top drawer sticks. Like always.'],['owen','There you are. Loaded, spare mags topped up.']],
  nightstandEmpty:[['owen','Just the paperback and the phone charger now.']],
  closet:[['owen','Lockbox. My fingers still know the code.'],['owen','Eight in the tube, sixteen in the box.']],
  closetEmpty:[['owen','Empty lockbox. The coats can stay.']],
  searched:[['owen','Nothing else worth taking.']],
  doorEmpty:[['owen','Not out there with nothing in my hands.']],
  doorDark:[['owen','Not out there in the dark. Not with nothing.']],
  door:[['owen','Red and blue, still turning down the street.']],
  doorOne:[['owen','The shotgun\'s still in the hall closet.'],['owen','...No. Red and blue, still turning. Pistol will have to do.']],
  doorBack:[['owen','Back out there.']]},
 // What the supply spots give, said as you take it.
 search:{counter:[['owen','Hinges, brackets, the old phone with the cracked screen. Parts are parts now.']],sink:[['owen','The degreaser I bought for the bike and never used.']],laundry:[['owen','Old flannel shirts. Rags, or patches.']]},
 pet:{dog:[['owen','Good boy. Stay close tonight, okay?']],cat:[['owen','Don\'t pretend you weren\'t scared too.']],dogArmed:[['owen','Stay, buddy. I\'ll be right back.']]},
 // Scene 4. The cruiser and the officer, then the quiet after the first fight, then the trunk.
 cruiser:{see:[['owen','It went straight into the pole.']],empty:[['owen','Door\'s open. Where\'s the officer?']],him:[['owen','Officer? You okay? You\'re bleeding...']]},
 cleared:[['owen','Those were my neighbours. That was Mr. Park.'],['owen','Don\'t think about it. Not yet.'],['owen','The cruiser. There might be something in it.']],
 trunk:[['owen','Trunk release is under the dash...'],['owen','Shells. Rifle rounds. Flares. Taking all of it.']],
 // Scene 5. The radio once the street is quiet, and the three jobs.
 radio:[['guard','...anyone still on the east side, this is Guard two-six.'],['guard','One truck comes through the Hollow tonight. East end of the middle street.'],['guard','We won\'t drive into a dark town blind. Get on a radio and light us a way in.'],
  ['owen','That\'s our street. And this handset\'s smashed.'],['owen','Daniel Okafor has a ham radio. Two blocks north-west.'],['owen','Walt keeps a generator and a work light, out north-east.'],
  ['owen','And Mrs. Novak buried a go-bag in her yard, south-west. "For when it happens."'],['owen','Well. It happened.']],
 job:{radio:[['owen','Daniel? ...Nobody home. His handheld still charges, though.']],power:[['owen','Here goes nothing.']],powerOn:[['owen','Everything for a mile heard that.']],supplies:[['owen','Mrs. Novak, you beautiful, paranoid woman.']]},
 // Over the radio during play: nothing waits for these.
 air:{jobs:'We see your light, east side. Get to the end of your street and pop a flare when you\'re ready.',called:'Copy your flare. We\'re a minute out.',minute:'Fifty seconds. Keep that corner clear.',overrun:'Hold on, we\'re seeing a lot of movement on your...',
  leaving:'Anyone still out there, the truck leaves the east end in sixty seconds.'},
 // Scene 7. Through the window: t is seconds from when he went down; the picture holds on each line until you tap.
 window:[[1.2,'watcher','No. No, no, no...'],[3.8,'watcher','Don\'t look away. Don\'t you dare look away.'],[6.9,'watcher','They\'re just... leaving him there.'],[9,'watcher','He moved. Did he just move?'],
  [11.6,'watcher','That\'s not him anymore.'],[13.4,'watcher','...Can he see me?']],
 // Scene 8. Your turn.
 turn:[['you','He\'s still standing there.'],['you','Everything he had is still on him. I need it more than he does now.']],
 fallen:[['you','I\'m sorry, Owen. I\'m so sorry.']],
 reclaimed:[['you','His light. His guns. His bag.']]};
// Passing thoughts: one line over your head, never waited for. delay is how long the moment must last first (thoughts.js).
export const THOUGHT_LINES={dark:'Kitchen. Junk drawer. It\'s always the junk drawer.',other:'The other one too. Rather have it and not need it.',out:'Cold. Too quiet.',
 bitten:'He bit me. He actually bit me!',hurt:'Back off. Get some room.',shells:'Shells are gone. Pistol.',again:'Not like that. Keep my distance.',loud:'That was loud. Too loud.',
 flare:'Come on. Come on.',overrun:'There\'s too many. There\'s too many of them!',coming:'He\'s coming. Don\'t freeze.',run:'Then run.'};
