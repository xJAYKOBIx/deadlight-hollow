// Operation Bell Jar, the opening mission (v0.66): every line in one place, scene by scene, like night1.js. Lines are [who, text];
// who is one of OP_SPEAKERS, or 'you' (the name you gave your survivor, or You). Story lines wait for a tap in the dialog box.
export const OP_SPEAKERS={calloway:'Col. Calloway',hale:'Deputy Director Hale',okafor:'SSgt. Okafor',unit:'The unit',aaron:'Aaron',gadget:'Gadget',guard:'Guard corporal'};
export const OP={
 // Part 1. The briefing in Hangar 3 at Harlan Field: Calloway opens, Hale gives the why, Calloway gives the who and where.
 title:['Operation Bell Jar','0300 · Harlan Field'],
 brief:{
  settle:[['calloway','All right. Settle down.'],['calloway','You get this brief once, so get it the first time.']],
  intro:[['calloway','This is Deputy Director Warren Hale, Homeland Security. Sir.']],
  quiet:[['hale','Thank you, Colonel.'],['hale','At one o\'clock this morning, Deadlight Hollow stopped answering. Phones, radio, the county sheriff. All of it, inside four minutes.'],
   ['hale','Eleven thousand people. The Guard has closed every road out. Nobody has come out to the cordon. Nobody.']],
  lz6:[['hale','Some of you will know this from television.'],['hale','LZ-6, from Marrow Industries. "Nobody has to stay dead."'],['hale','It works. The dead do get back up. What gets up is not who went down.']],
  crash:[['hale','At 2341 last night a Marrow courier went off Route 9, inside the Hollow. Our drone found it on its roof.'],
   ['hale','It was carrying reference samples of the compound, cold-packed. Without them nobody makes a cure.']],
  beacon:[['hale','You will recover those samples, and at the crash you will plant one of these.'],['hale','A containment beacon. It tells us exactly where to draw the line.'],
   ['hale','Whatever is in that town does not leave the Hollow. Is that understood?']],
  yes:[['unit','Sir, yes sir!']],
  sectors:[['calloway','Eight sectors, eight pairs. You know your numbers.'],['calloway','Hollow Six. East side, Juniper Lane down to Route 9. The crash is in your sector.'],
   ['you','Sir. My partner isn\'t here.'],['calloway','Your partner\'s on your truck, prepping it. You\'ll meet on the ride in.']],
  roe:[['calloway','Rules of engagement. Anything that comes at you is hostile. Anything that\'s been bitten is hostile.'],['calloway','You do not stop to talk to it. You do not stop to help it up.'],
   ['calloway','Samples. Beacon. Pickup. One step at a time, and nobody plays hero.']],
  dismissed:[['calloway','Quartermaster has your rifles. Trucks roll in ten.'],['calloway','Dismissed.']]},
 // Gearing up: Okafor issues your rifle at the armory window, then your truck is waiting on the apron with its ramp down.
 okafor:{issue:['Hollow Six. Rifle, four magazines, a sling and a light. Sign here.','Bring it back clean. It\'s on my books, not yours.'],
  wait:['Rifles are issued at this window. That\'s all I do tonight.'],done:['You\'ve got yours. Your truck\'s waiting.']},
 // What you say looking round the hangar.
 look:{board:[['you','Sixteen names on the board. Ours is the only sector with a red ring round it.']],coffee:[['you','Coffee\'s cold. Somebody already took the last good doughnut.']],
  cases:[['you','Empty cold cases, waiting for the samples. Ours is already on the truck.']],locker:[['you','My locker. The photo\'s still taped inside the door. It stays here.']],
  podium:[['you','The Colonel\'s notes. Every sector has a time written next to it. Ours says 0420.']],screen:[['you','The Hollow, cut in eight. Six is lit up in amber.']],
  truck:[['you','Not without a rifle. Okafor\'s at the armory.']],board2:[['you','Hollow Six, boarding.']]},
 // Part 2. The ride in, in the back of Hollow Six's truck: Aaron across from you, Gadget driving, through the Guard's cordon and into
 // the dark. load waits for you to load your rifle (ride/script.js).
 ride:{title:['Route 9','0341 · Eastbound to the Hollow'],
  meet:[['aaron','So you\'re the other half of Hollow Six.'],['aaron','Aaron Whitlock. Sit anywhere you like. Just not on the beacon.']],
  prep:[['you','The Colonel said you were prepping the truck.'],['aaron','Beacon\'s charged, the cold case is strapped down, and I zeroed your optic. You\'re welcome.']],
  gadget:[['gadget','And I\'m the one driving. Priya Nair. Everyone calls me Gadget.'],['gadget','I\'ve got a drone in a box up here. Once you\'re out, I stay with the truck and I\'m your eyes.'],
   ['aaron','She\'s also the reason this truck still runs. Don\'t touch her cables.'],['gadget','Don\'t touch my cables.']],
  load:[['aaron','Load up. Magazine in, safety on until the ramp drops.']],
  loaded:[['aaron','Thirty a magazine, four magazines. Count them. They go faster than you think.']],
  plan:[['aaron','Walk me through it, so I know you heard it.'],['you','The crash. The samples go in the cold case. Plant the beacon. Back to the truck.'],
   ['aaron','One step at a time. If I go down, you get me up. If you go down, I get you up.'],['aaron','Nobody gets left in there.']],
  cordon:[['gadget','Cordon\'s up ahead. Slowing down.']],
  guard:[['guard','LEET AF, Hollow Six. You\'re cleared through.'],['guard','Nothing\'s come out. Not all night. Not one car.'],['gadget','Copy that. Thanks, Corporal.']],
  dark:[['gadget','We\'re in. The power\'s out on the whole east side.'],['aaron','So nobody\'s home. Or nobody\'s turning the lights on.']],
  hit:[['gadget','Hold on!'],['gadget','That was a person. Aaron, that was a person.'],['aaron','It was one of them. Keep driving.']],
  close:[['gadget','Juniper Lane. Two minutes.'],['aaron','When the ramp drops, we go out together and we stay together.'],['gadget','I\'ll be on the radio the whole way. Bring them back cold.']],
  ramp:[['aaron','Ready?'],['you','Ready.']]},
 // The end of part two, until the operation itself is built.
 end:['To be continued','Juniper Lane']};
// The people in the hangar, and what each says when you walk up. lines rotate; a second visit gets the next one.
export const OP_TALK={
 calloway:{gear:['Rifle first, Six. Okafor\'s at the armory.','Questions go through your partner. Your partner\'s on the truck.'],armed:['Your truck\'s on the apron. Ramp\'s down. Go.']},
 hale:{gear:['Colonel Calloway speaks very highly of your unit.','If it comes to a choice, the beacon matters more than the samples. Remember that.'],armed:['Good luck, Six. Bring them back cold.']},
 kessler:['North end, by the reservoir. Lucky us.','Watch your corners out there, Six.'],ortega:['My sister lives in Cedar Grove. Two towns over. Two.'],
 reyes:['Coffee\'s been on that plate since midnight. Drink it anyway.','Hollow Two\'s got the school. Tell me there\'s nobody in a school at three in the morning.'],
 booker:['Eleven thousand people. And they\'re sending sixteen.'],adeyemi:['You ever see one of those LZ-6 ads? My mom wanted to sign my grandfather up.'],
 walsh:['Hale didn\'t say what happens if we don\'t plant the beacon. I noticed that.'],park:['If it\'s quiet in there, it\'s quiet. If it isn\'t...'],
 halvorsen:['Check your magazines twice. Okafor loads them, but check them anyway.'],mensah:['Truck five is ours. If you see us waving, it isn\'t hello.'],
 volkova:['Sixteen of us for eight sectors. Somebody did that math on a napkin.'],brandt:['The church on the hill\'s in our sector. I\'m not going in there.'],
 tanaka:['You\'ve got Gadget driving you in. If she says move, you move.'],holloway:['Hollow Eight. Holloway. Yes, I know. I\'ve heard it.'],
 malhotra:['The samples are cold-packed. Keep them cold, keep them closed, and don\'t drop them.']};
