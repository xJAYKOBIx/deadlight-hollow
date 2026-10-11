// Shot-specific compositions, not modifications to the shared Master Creator assets.
export const W=960,H=540;
function rr(c,x,y,w,h,r,fill,stroke=null,lw=1){c.beginPath();c.roundRect(x,y,w,h,r);c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=lw;c.stroke();}}
function path(c,d,fill,stroke=null,lw=2){const p=new Path2D(d);c.fillStyle=fill;c.fill(p);if(stroke){c.lineWidth=lw;c.strokeStyle=stroke;c.lineJoin='round';c.stroke(p);}}
function line(c,d,col,w=1){c.strokeStyle=col;c.lineWidth=w;c.lineCap='round';c.stroke(new Path2D(d));}
function grad(c,x,y,x2,y2,a,b){const g=c.createLinearGradient(x,y,x2,y2);g.addColorStop(0,a);g.addColorStop(1,b);return g;}
function glow(c,x,y,r,color){const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,color);g.addColorStop(1,'#00000000');c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2);}
function txt(c,s,x,y,size,col,font='sans-serif'){c.font=`${size}px ${font}`;c.fillStyle=col;c.fillText(s,x,y);}
export function room(c){
 c.fillStyle=grad(c,0,0,960,520,'#11212d','#585b4e');c.fillRect(0,0,W,H);
 c.fillStyle=grad(c,0,0,700,0,'#172b38','#7d7965');c.fillRect(0,0,960,330);
 // Acoustic wall panels and painted hospital wall rail.
 for(let x=40;x<960;x+=155){c.fillStyle='#ffffff05';c.fillRect(x,15,1,300);c.fillStyle='#111c2515';c.fillRect(x+151,15,2,300);}
 rr(c,0,319,960,15,2,'#293f43','#8c9890');c.fillStyle='#18292d';c.fillRect(0,334,960,7);
 c.fillStyle=grad(c,0,340,0,540,'#4c5550','#222e31');c.fillRect(0,341,960,199);
 for(let y=390;y<540;y+=60){line(c,`M0 ${y}L960 ${y-35}`,'#b0b2a10b');}
 // Window, deep sill, distant city blurred into broad shapes.
 rr(c,635,22,284,246,4,'#263e43');rr(c,647,30,261,226,1,'#e6dfc2');
 c.fillStyle=grad(c,650,35,650,246,'#adc0bd','#f8dca1');c.fillRect(652,36,250,211);
 for(let i=0;i<13;i++){let x=658+i*20,y=157+(i*17%52);c.fillStyle=['#8d9d9460','#9da99a70','#b6b9a380'][i%3];c.fillRect(x,y,17,90);}
 glow(c,843,94,160,'#fff1c482');
 c.fillStyle='#536862';c.fillRect(769,32,7,216);c.fillRect(650,134,253,7);
 c.fillStyle='#b7b6a4';c.fillRect(647,251,261,12);path(c,'M637 264L921 264L937 279L630 279Z','#727f73','#344c48');
 // Cloth curtain folds.
 path(c,'M612 12L676 12Q655 118 676 282L609 298Q625 143 612 12Z',grad(c,610,0,680,0,'#71847c','#a6aaa0'),'#425b56');
 for(let x=622;x<667;x+=10)line(c,`M${x} 16Q${x-6} 140 ${x+1} 286`,x%20?'#d1d0b333':'#253e4538',3);
 path(c,'M914 12L960 12L960 302L922 285Q935 148 914 12Z','#717f71','#405951');
 // Sunlight across wall and floor, one broad translucent wedge.
 path(c,'M653 141L902 141L744 540L211 540Z','#ffe8b910');
 for(let i=0;i<5;i++)path(c,`M${650+i*48} 150L${670+i*48} 150L${408+i*62} 540L${378+i*62} 540Z`,'#fff0bf06');
 // Wall outlet headwall and information plaque.
 rr(c,317,147,242,44,5,'#44595a','#7a8981');rr(c,329,158,32,22,3,'#9fa79a');
 for(let x of [337,347]){rr(c,x,164,3,7,1,'#3e5151');}
 for(let i=0;i<3;i++){rr(c,384+i*36,157,24,24,3,'#263e42','#75877d');rr(c,392+i*36,164,8,8,4,['#caad71','#829d97','#8e9bac'][i]);}
 txt(c,'RECOVERY  /  06',329,137,9,'#c7ccbb');
 rr(c,36,57,122,41,3,'#3b5357','#61746f');txt(c,'MARROW',48,76,12,'#d1dacb');txt(c,'PATIENT RECOVERY',48,89,6,'#9cafa7');
 // Equipment cable, pole and hanging bag.
 line(c,'M567 311L567 74Q567 60 581 60L601 60','#1e3438',7);line(c,'M569 311L569 74Q569 62 581 62L601 62','#a2b1a6',2);
 line(c,'M593 62L593 80','#c6cebd',2);rr(c,579,81,28,61,7,'#aebeb478','#c3d0ba',1);
 rr(c,583,106,20,30,4,'#dbe0bf66');line(c,'M593 141Q589 176 603 207T586 296','#d0d8b580',1.5);
 txt(c,'LZ–6',582,101,7,'#334f52');
 // A paper cup, folded coat and a family card left during the wait.
 rr(c,834,335,106,10,4,'#8b8670','#253c3f',2);
 line(c,'M927 345L923 493','#253c3f',8);
 path(c,'M850 307L873 308L869 334L854 334Z','#b5a786','#364d4b',1.5);
 rr(c,848,305,27,5,2,'#e1cfaa','#657368',1);
 path(c,'M892 300L918 306L917 333L890 325Z','#dfd2af','#52605a',1);
 path(c,'M900 312Q896 305 900 306Q904 306 904 311Q911 307 909 312L903 320Z','#ae785d');
 line(c,'M895 323L911 327','#aa9b80',.7);
 path(c,'M916 351Q938 355 945 387L930 439L913 431L916 389L900 370Z','#2c3c48','#142831',2);
 line(c,'M924 367Q933 389 923 418','#627370',2);
 // Monitor pedestal behind the bed.
 path(c,'M156 289L171 288L167 470L151 474Z',grad(c,150,0,174,0,'#172a30','#7d8a85'),'#182b30');
 path(c,'M120 468L194 465L213 480L105 484Z','#26393d','#15272c',3);
 rr(c,111,479,16,11,5,'#152329');rr(c,192,476,16,11,5,'#152329');
}
export function bed(c){
 // Bed chassis, pillow and body; graphic-novel contours with soft material shading.
 path(c,'M227 329L641 219Q672 221 688 252L770 396L298 530L211 418Z','#1c3036','#14252b',5);
 path(c,'M218 324L622 216Q652 210 672 233L738 359L290 498Q266 504 249 486L204 362Q196 339 218 324Z',grad(c,200,240,500,500,'#a6b4ac','#4f7278'),'#1d363e',4);
 path(c,'M229 329L623 225Q646 222 661 242L715 348L284 474Q269 478 263 462L217 352Q212 334 229 329Z','#9db1ac','#bdd0bd',1);
 // Pillow.
 path(c,'M497 253Q529 221 607 224L657 247Q670 262 650 300L577 329L496 296Q482 280 497 253Z',grad(c,530,224,593,328,'#d6d8bd','#8eaaa2'),'#45666a',2.5);
 line(c,'M503 258Q528 242 555 244M506 286Q531 304 559 312M640 248Q652 266 641 287','#edefd433',3);
 // Patient head side facing the relative, hair and ear.
 path(c,'M559 249Q565 224 597 224Q628 225 640 251L634 279L621 291L600 287L584 277L568 276Z',grad(c,580,230,620,293,'#dfc09e','#ac8069'),'#263a3d',3);
 path(c,'M555 251Q548 229 568 217Q601 203 625 224L635 242L618 239Q612 227 594 234L576 252L566 266Z','#3e3c37','#223035',3);
 path(c,'M559 235Q579 213 606 222L617 230Q591 220 571 244Z','#585247');
 path(c,'M633 252Q636 260 642 264Q645 269 635 271L633 280Q628 289 618 286Q607 284 605 276L585 269','#cfaa87','#38413d',1.5);
 line(c,'M614 250Q621 249 626 253','#4f5044',2);line(c,'M615 256L622 258','#473e35',1.5);
 line(c,'M631 275L637 275','#825d4c',1.4);rr(c,576,254,11,15,5,'#bd9276');line(c,'M580 258Q588 258 582 266','#8b6659');
 // Shoulder gown and blanket volume.
 path(c,'M558 286Q532 282 510 298L444 328L495 380L607 341L617 303L601 286L586 292Z',grad(c,520,282,570,364,'#638c94','#375f6c'),'#24424b',3);
 line(c,'M570 289L580 311L598 300M523 312L549 340M503 327L517 344','#a8bcb3',1.5);
 // Main sheet, broad sculpted creases.
 path(c,'M229 352Q291 316 414 318Q459 307 510 343Q532 361 585 363L694 368L737 410Q719 449 667 451L327 528Q289 535 270 505L229 392Z',grad(c,390,320,500,519,'#c9d0bc','#64838a'),'#35535c',3);
 path(c,'M234 357Q321 331 413 331Q449 323 499 350L574 377L691 384Q652 397 592 391L465 370L407 358L280 396Z','#d6d9c13b');
 path(c,'M279 401Q337 377 389 380Q440 390 496 411Q425 395 379 401Q332 411 306 435Z','#42687955');
 path(c,'M380 484Q424 440 461 400Q439 439 428 475Z','#3e65705c');
 path(c,'M495 458Q524 420 560 399Q601 410 628 401Q595 418 569 415Z','#2b586145');
 line(c,'M244 368Q316 343 363 347M285 495Q309 509 354 491M475 384Q514 409 549 399M600 408L659 408','#edf0d647',2);
 // Patient forearm lies on sheet and extends toward clasp.
 path(c,'M516 307Q501 306 484 323L470 341Q492 355 514 354L548 356L563 342L536 334Z',grad(c,490,309,526,357,'#d7b495','#af826c'),'#364b4a',2.5);
 path(c,'M496 300L518 304L527 326L490 340L475 329Z','#4c7884','#294b56',2);
 line(c,'M483 324L513 313','#a8b6a266',2);
 // Visitor's chair.
 path(c,'M801 411L839 405L874 521L855 521Z','#293735','#14272c',3);
 rr(c,751,356,106,89,14,'#5c5c47','#263b39',4);
}
export function relative(c,relief=false){
 // A seated adult leans toward the patient; visible only as the camera pulls back.
 path(c,'M750 322Q734 323 719 354L725 428L812 449L845 419L824 350Q811 324 790 319Z',grad(c,733,327,834,416,'#8c7356','#544d42'),'#21373b',4);
 path(c,'M793 325Q817 344 829 399L810 423L794 368L774 335Z','#a68b65');
 path(c,'M751 335L746 401L772 422L749 423L737 387Z','#423f38');
 line(c,'M793 340L806 390M760 342L755 376M818 409L797 417','#d2b88650',2);
 path(c,'M768 300L763 327Q772 342 787 334L793 312Z','#a57960','#32413e',2);
 // Face turned left, with a subtle smile at the near cheek.
 path(c,'M751 247Q771 235 790 250Q803 263 799 283L796 299Q794 311 784 315Q767 316 758 304Q751 298 751 288Q737 286 744 280L748 270Z',grad(c,748,257,798,304,'#e2ba91','#ab7b61'),'#293936',3);
 path(c,'M746 269Q731 248 748 232Q770 215 794 234Q815 243 808 273L799 291L791 286L793 264L782 248Q766 256 746 252Z','#4c4036','#213238',3);
 path(c,'M744 243Q760 224 785 237L800 253Q782 237 761 247Z','#715b45');
 line(c,relief?'M753 270Q758 267 764 269':'M751 269L763 264','#624534',1.6);
 if(relief){line(c,'M751 277Q757 280 763 275','#493f35',1.5);line(c,'M752 297Q758 301 767 293','#80553f',1.4);}
 else{path(c,'M750 276Q756 272 763 274Q759 279 750 276Z','#d4b093');rr(c,752,274,2.5,3.5,1.2,'#2c3331');line(c,'M752 298Q758 294 764 296','#80553f',1.4);}
 line(c,'M751 281Q756 284 762 281','#b08162',.8);path(c,'M747 283L754 283L752 287Z','#edbd90');
 glow(c,777,278,22,'#e9b77f17');
 // Reaching sleeve and wrist.
 path(c,'M752 343Q742 349 722 367L675 374L608 351L593 365Q650 404 685 404L741 386Q766 372 770 356Z',grad(c,645,350,714,403,'#9b815c','#665846'),'#293d3c',3);
 path(c,'M610 350L625 356L619 377L601 372Z','#bbb092','#43504a',2);
 path(c,'M605 352L578 339L557 339L544 350L557 365L579 364L602 373Z',grad(c,553,340,580,371,'#d8ac81','#a7755b'),'#37433d',2);
 // Soft outline highlights tie the figure to the window.
 line(c,'M802 248Q811 258 806 273M813 338Q827 357 832 378','#eed2a26b',2);
}
export function hands(c,closed=0){
 // Distinct patient fingers rest over the visitor's palm. Closing rotates each around the knuckle.
 path(c,'M529 338Q536 331 545 334L563 341L571 352Q568 361 557 363L535 357L524 351Z',grad(c,530,333,553,361,'#e7c4a0','#b8896c'),'#4b5045',1.8);
 const fingers=[{x:549,y:339,l:23},{x:545,y:344,l:25},{x:541,y:349,l:23}];
 for(const f of fingers){c.save();c.translate(f.x,f.y);c.rotate(.04+closed*.4);path(c,`M0 0Q8 -3 ${f.l} 1Q${f.l+4} 3 ${f.l-1} 6L5 6Q0 5 0 0Z`,grad(c,0,0,0,7,'#e3bb94','#bc8c6c'),'#785f4a',.8);line(c,`M${f.l-5} 2L${f.l-2} 2`,'#f0d2b2',1);c.restore();}
 path(c,`M535 344Q${541+closed} ${331+closed*3} ${548+closed} ${331+closed*5}Q${554+closed} ${333+closed*9} ${552-closed*3} ${338+closed*9}L543 345L539 351Z`,'#d9ac85','#80654f',1);
 line(c,'M535 337L542 338','#f0d4b2',1.2);
 // Small white patient wristband.
 path(c,'M525 335L532 335L529 353L521 351Z','#dcdac3','#708481',1);
 for(let x=525;x<530;x+=1.5)line(c,`M${x} 340L${x-1} 347`,'#4d6665',.5);
 line(c,'M560 344L559 348','#d8c08b',1.6);line(c,'M534 347Q538 345 540 347','#b38367',.6);
}
export function foreground(c){
 // Curved tubular bed rail, metal reflections.
 line(c,'M273 493L263 420Q260 410 273 405L440 361Q453 356 456 370L471 447','#253c43',12);
 line(c,'M273 490L263 420Q260 410 273 405L440 361Q453 356 456 370L471 445','#819893',7);
 line(c,'M267 416L444 368','#dae1c066',2);
 for(let i=0;i<4;i++){const x=297+i*38,y=401-i*10;line(c,`M${x} ${y}L${x+10} ${y+69}`,'#2b454e',7);line(c,`M${x-1} ${y}L${x+9} ${y+68}`,'#718d8d',3);}
 // Monitor housing sits above pedestal, crisp enough to read at the opening close-up.
 rr(c,68,154,244,169,12,'#182d34','#102127',4);rr(c,73,156,232,161,9,grad(c,73,156,305,317,'#738984','#3e5659'),'#91a39a',1);
 rr(c,84,168,204,130,5,'#09282c','#1d3b3e',3);
 rr(c,90,174,193,116,3,grad(c,90,174,283,290,'#0e3436','#092428'));
 for(let x=96;x<278;x+=15)line(c,`M${x} 194L${x} 278`,'#41837b18',.5);
 for(let y=197;y<280;y+=15)line(c,`M96 ${y}L278 ${y}`,'#41837b18',.5);
 txt(c,'ECG',97,187,7,'#a9cbb0');txt(c,'II',97,206,7,'#507f72');txt(c,'RECOVERY',213,186,6,'#84a79c');
 for(let i=0;i<11;i++)line(c,`M${158+i*6} 303L${158+i*6} 309`,'#233b40',1.5);
 for(const [x,y] of [[78,162],[299,162],[78,310],[299,310]]){rr(c,x,y,2.5,2.5,1.2,'#c5c7ab');}
 line(c,'M92 170L281 170','#c7ead027',1);
 path(c,'M210 176L237 176L185 287L158 287Z','#daf3d105');
 txt(c,'MARROW  /  LZ-6',89,309,6,'#c6d1bd');rr(c,275,302,7,7,4,'#c7d8a2');
 // Knob, port and draped cable.
 rr(c,296,184,4,21,2,'#243a3e');line(c,'M104 318Q81 357 116 403Q138 433 140 467','#10282d',3);
 glow(c,181,228,135,'#62c6a00c');
 // Edge shadow, not a pixel/noise filter.
 const g=c.createRadialGradient(480,290,140,480,290,620);g.addColorStop(0,'#06171d00');g.addColorStop(.75,'#06171d0b');g.addColorStop(1,'#06171d9c');c.fillStyle=g;c.fillRect(0,0,W,H);
}
export function atmosphere(c){
 const shadow=c.createLinearGradient(0,0,960,0);shadow.addColorStop(0,'#05142265');shadow.addColorStop(.48,'#05142208');shadow.addColorStop(1,'#eabf7c0a');c.fillStyle=shadow;c.fillRect(0,0,W,H);
 glow(c,809,108,415,'#ffdb8e27');
 // Window light falls across the blanket. Hand silhouettes stay unobscured.
 path(c,'M668 262L776 267L488 523L330 533Z','#ffe6a610');
 line(c,'M681 281L514 445','#e9d5a81a',2);
}
export function warmLight(c){glow(c,752,207,390,'#ffd58f1f');}
export const painters={room,bed,relative:c=>relative(c,false),relieved:c=>relative(c,true),foreground,atmosphere,warmLight};
