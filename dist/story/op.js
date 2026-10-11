// Operation Bell Jar, the opening mission (v0.66): every line in one place, scene by scene, like night1.js. Lines are [who, text];
// who is one of OP_SPEAKERS, or 'you' (the name you gave your survivor, or You). Story lines wait for a tap in the dialog box.
export const OP_SPEAKERS={calloway:'Col. Calloway',hale:'Deputy Director Hale',okafor:'SSgt. Okafor',unit:'The unit'};
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
 // The end of part one, until the ride in is built.
 end:['To be continued','The ride in']};
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
 tanaka:['Gadget\'s running comms for the whole op tonight. If she says move, you move.'],holloway:['Hollow Eight. Holloway. Yes, I know. I\'ve heard it.'],
 malhotra:['The samples are cold-packed. Keep them cold, keep them closed, and don\'t drop them.']};
