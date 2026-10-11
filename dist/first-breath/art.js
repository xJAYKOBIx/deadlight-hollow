// Shot-specific compositions, not modifications to the shared Master Creator assets.
export const W=960,H=540;
function rr(c,x,y,w,h,r,fill,stroke=null,lw=1){c.beginPath();c.roundRect(x,y,w,h,r);c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=lw;c.stroke();}}
function path(c,d,fill,stroke=null,lw=2){const p=new Path2D(d);c.fillStyle=fill;c.fill(p);if(stroke){c.lineWidth=lw;c.strokeStyle=stroke;c.lineJoin='round';c.stroke(p);}}
function line(c,d,col,w=1){c.strokeStyle=col;c.lineWidth=w;c.lineCap='round';c.stroke(new Path2D(d));}
function grad(c,x,y,x2,y2,a,b){const g=c.createLinearGradient(x,y,x2,y2);g.addColorStop(0,a);g.addColorStop(1,b);return g;}
function glow(c,x,y,r,color){const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,color);g.addColorStop(1,'#00000000');c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2);}
function txt(c,s,x,y,size,col,font='sans-serif'){c.font=`${size}px ${font}`;c.fillStyle=col;c.fillText(s,x,y);}

function ellipse(c,x,y,rx,ry,color){c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fillStyle=color;c.fill();}
export function room(c){
 // One floor plane; the rear wall meets a shallow side wall at the window.
 c.fillStyle=grad(c,0,0,960,400,'#263b43','#849087');c.fillRect(0,0,960,540);
 path(c,'M0 0L822 0L822 310L0 343Z',grad(c,0,0,820,300,'#364d55','#87958b'));
 path(c,'M822 0L960 0L960 352L822 310Z','#72837b');
 path(c,'M0 343L822 310L960 352L960 540L0 540Z',grad(c,0,320,0,540,'#667671','#34484b'));
 line(c,'M0 343L822 310L960 352','#253f43',9);
 line(c,'M0 336L822 304L960 345','#b2baaa',2);
 // Floor joints share a vanishing point above the back wall.
 for(const x of [-900,-350,120,550,1050,1570,2050]){const sy=342,sx=530+(x-530)*(sy-180)/360;line(c,`M${sx} ${sy}L${x} 540`,'#bbc4af14',1);}
 for(const y of [366,402,452,516])line(c,`M0 ${y}L960 ${y-18}`,'#172f3620',1);
 // Window recess, sill and distant roofs.
 rr(c,626,38,184,233,2,'#263e46');rr(c,634,44,167,216,1,'#aeb9ae');
 c.fillStyle=grad(c,637,47,637,253,'#9fb6bd','#edd8ac');c.fillRect(637,47,159,207);
 for(let i=0;i<8;i++){const x=641+i*21,y=182+(i*19%35);c.fillStyle=['#879d9770','#82958d80','#afbaaa80'][i%3];c.fillRect(x,y,19,254-y);}
 line(c,'M639 112L794 112M716 48L716 254','#71857c',5);
 path(c,'M626 260L810 260L822 270L622 270Z','#a5b1a1','#4e6865',1.5);
 line(c,'M625 272L818 272','#304d50',3);
 path(c,'M612 25L652 26Q639 140 648 287L607 294Q615 154 612 25Z',grad(c,608,0,652,0,'#466663','#8ea39a'),'#3e5e5c',2);
 for(let x=618;x<649;x+=9)line(c,`M${x} 28Q${x-4} 151 ${x-2} 286`,'#d1d9bb22',2);
 line(c,'M609 23L815 23','#9dad9d',3);
 // Continuous headwall services, with the bed centered below the medical outlets.
 path(c,'M292 151L601 144L601 183L292 191Z','#516b70','#8b9e94',1);
 for(let i=0;i<3;i++){rr(c,325+i*49,160-i,29,20,2,'#bdc6b6','#29484e',1);line(c,`M${334+i*49} ${165-i}L${334+i*49} ${172-i}M${345+i*49} ${165-i}L${345+i*49} ${172-i}`,'#536d6b',2);}
 for(let i=0;i<2;i++){ellipse(c,499+i*35,162,8,8,['#ae9261','#73949a'][i]);ellipse(c,499+i*35,162,3,3,'#2c4b51');}
 txt(c,'RECOVERY  /  06',319,140,8,'#cad3c3');
 rr(c,37,58,119,40,3,'#304c54','#6c8782');txt(c,'MARROW',48,77,12,'#d1dacb');txt(c,'PATIENT RECOVERY',48,89,6,'#9cafa7');
 // IV pole is planted on the same floor as the bed and chair.
 ellipse(c,628,432,48,10,'#142b333d');
 line(c,'M626 423L623 90Q623 77 607 77L597 77','#213c43',5);line(c,'M625 421L621 90Q621 79 607 79','#a3b8b0',1.5);
 for(const [x,y] of [[588,430],[658,439],[649,410]]){line(c,`M625 419L${x} ${y}`,'#758c89',4);ellipse(c,x,y+3,5,5,'#24383d');}
 line(c,'M599 79L599 92','#b9c8b6',1);rr(c,586,93,26,51,5,'#c4d5c25c','#c1d0bb',1);
 rr(c,589,111,20,27,3,'#d4dfc478');txt(c,'LZ–6',589,106,6,'#3f5d5c');
 line(c,'M599 144Q598 184 612 205Q624 236 583 269Q535 292 527 336','#bac9b1aa',1);
 // Bedside cabinet, on the floor rather than a floating shelf.
 ellipse(c,863,428,62,13,'#172b323d');
 path(c,'M821 314L890 305L925 322L854 332Z','#a3997d','#405b5b',2);
 path(c,'M854 332L925 322L925 412L854 428Z',grad(c,854,332,925,413,'#6e7c70','#4e665f'),'#354d4d',2);
 path(c,'M821 314L854 332L854 428L821 409Z','#566b66','#354d4d',2);
 path(c,'M862 344L918 336L918 362L862 372Z','#859184','#48665e',1);
 line(c,'M883 352L899 350','#c5c6aa',3);line(c,'M862 383L916 373','#344f50',1);
 path(c,'M835 291L852 291L850 312L838 313Z','#c1b69a','#586c65',1);rr(c,834,288,20,4,2,'#e4d8b8');
 path(c,'M884 278L906 282L906 309L882 305Z','#d7caac','#667568',1);path(c,'M889 289Q887 284 891 285L894 288Q900 282 900 289L894 299Z','#ad7963');
 // Contact shadows hold the composition to the floor.
 ellipse(c,458,443,255,51,'#122a3444');ellipse(c,714,489,81,19,'#122a3444');
 // Monitor pedestal (display is composed in foreground).
 line(c,'M164 316L163 427','#243f47',11);line(c,'M162 319L161 425','#9aafa8',3);
 for(const [x,y] of [[112,465],[205,446],[150,440]]){line(c,`M163 426L${x} ${y}`,'#567571',7);ellipse(c,x,y+3,9,6,'#20363c');}
}
export function bed(c){
 // Wheelbase and lift column. Mattress perimeter is a rectangular plane in perspective.
 for(const [x,y] of [[295,467],[388,504],[593,374],[680,411]]){line(c,`M${x} ${y-19}L${x} ${y-5}`,'#7a908c',5);ellipse(c,x,y,11,13,'#1e333b');ellipse(c,x-2,y-2,5,7,'#647b7a');}
 path(c,'M288 450L584 354L685 392L392 490Z','#4c6569','#203b44',3);
 line(c,'M306 453L391 483L669 394','#9aafaa',3);
 path(c,'M470 371L520 356L521 409L470 426Z','#778e89','#2d484f',2);
 path(c,'M491 366L510 361L510 413L491 419Z','#c4cdb7');
 // Flat seat/leg deck and the raised backrest articulate at the patient's hips.
 path(c,'M230 375L528 225L657 294L356 461Z','#728e8f','#273f49',3);
 path(c,'M230 375L356 446L657 281L657 301L356 467L230 394Z','#95aca5','#2e4c54',2.5);
 line(c,'M237 384L355 455L650 293','#d2d9c2',2);
 // Mattress top: finite thickness, separate from the mechanical frame.
 path(c,'M231 368Q229 361 239 356L524 214Q532 211 540 215L650 274Q660 280 651 286L362 445Q356 449 349 445L237 382Q230 378 231 368Z',grad(c,290,260,420,449,'#c1cfc1','#8aa5a1'),'#43666c',2);
 // Raised back support, with visible mattress edge.
 path(c,'M463 306L551 179Q556 171 566 178L665 242L668 263L546 326Z','#52747c','#294953',2.5);
 path(c,'M460 301L546 177Q551 168 561 174L659 237Q666 241 661 249L548 322Z',grad(c,532,183,552,313,'#b9cabc','#819f9d'),'#456970',2);
 line(c,'M552 179L651 242','#dae1cb80',2);
 // Pillow supports neck and back of skull, rather than swallowing the whole head.
 path(c,'M533 221Q535 204 553 192L583 190L629 221Q635 231 625 245L603 262Q596 267 583 260L535 237Q529 232 533 221Z',grad(c,560,193,590,260,'#d8decd','#9cb4aa'),'#64847f',1.7);
 line(c,'M539 221Q543 208 556 204M541 235Q558 237 578 251M618 224L609 245','#edf0d477',1.5);
}
export function patient(c){
 // Far arm lies along the covered body.
 path(c,'M561 264Q546 267 537 288L505 312L513 321L553 297L576 277Z','#bd947c','#43534e',1.7);
 // Gown follows shoulder -> rib cage -> pelvis along the inclined bed.
 path(c,'M562 253Q543 251 529 270L507 294L465 324L501 355L545 327L582 288Q598 272 583 261Z',grad(c,545,255,506,349,'#6d959b','#3f6c7c'),'#2f515d',2.2);
 path(c,'M554 255L550 268L568 278L581 265Z','#acc1b2','#4d7378',1);
 line(c,'M528 281Q528 300 512 316M550 292L534 319M494 315L506 329','#9ebcb4',1.2);
 // Neck is aligned with the raised torso, under the jaw.
 path(c,'M578 242L569 257Q565 265 575 270L586 258L593 247Z','#c59e83','#4b625b',1.5);
 // Adult head, reclined into the pillow. Cheek, ear, nose and jaw share one contour.
 path(c,'M565 204Q584 194 599 207Q610 216 607 230L612 239Q613 242 607 243L605 252Q601 261 590 257L578 252Q573 246 570 239L561 228Q556 215 565 204Z',grad(c,565,205,606,253,'#dfbb9b','#b88c72'),'#43534e',1.7);
 path(c,'M562 228Q551 220 556 209Q561 194 578 195Q596 193 603 211L602 219Q594 215 589 207Q578 208 573 215L568 231Z','#474841','#2e4245',2);
 path(c,'M560 211Q566 198 580 200Q591 200 596 207Q579 202 568 216Z','#656354');
 ellipse(c,569,230,5,7,'#c79b7d');line(c,'M568 227Q574 227 570 234','#9a755f',.8);
 line(c,'M589 221Q594 220 598 223','#74634f',1.2);line(c,'M589 227L596 229','#534e42',1.2);
 line(c,'M601 246L606 246','#8e6857',1);path(c,'M580 242Q586 248 595 250L590 253L581 249Z','#ba8b7260');
 // Blanket describes two legs at full length: pelvis, knees, ankles and feet.
 path(c,'M461 316Q476 313 495 333L523 353Q528 362 514 373L455 398Q425 417 402 432L365 449Q357 454 345 446L255 396Q246 389 256 381L306 365Q353 345 395 337Q429 328 461 316Z',grad(c,384,330,420,447,'#c9d3c3','#809d9c'),'#587c7f',2);
 // Twin knee ridges and a shallow central valley create volume without a giant mound.
 path(c,'M466 329Q444 337 424 357Q411 370 380 379L301 402L334 421Q371 408 401 397Q430 380 452 368L487 348Z','#dce0ca65');
 path(c,'M490 348Q472 364 447 374Q423 389 404 411L371 434L358 438Q391 405 418 383Q448 370 460 352Z','#50788242');
 path(c,'M312 383Q318 373 329 373L350 382Q352 389 343 394L321 400Z','#e1e4d05c');
 line(c,'M465 332Q440 345 424 362M485 351Q463 375 440 380M366 415L393 397M269 390L298 405M354 439L372 427','#eff0d778',1.6);
 line(c,'M384 349Q404 348 419 341M408 418L437 399','#678e90',1);
 // Near upper arm joins the shoulder, bends at the elbow and rests on the bedding.
 path(c,'M542 269Q530 267 520 281L501 309Q498 317 506 326L517 332L531 320L550 289Z','#5f8892','#345965',2);
 path(c,'M504 310L520 320L531 310L513 298Z','#8caaa9','#456a72',1);
 path(c,'M513 321Q517 325 526 329L543 336L541 352Q523 348 509 340Q501 336 503 329Z',grad(c,508,322,535,349,'#d8b394','#b88e73'),'#536057',1.5);
}
export function relative(c,relief=false){
 // Chair is drawn before a complete seated body: pelvis, two thighs, shins, shoes.
 for(const d of ['M719 403L713 474','M768 403L789 473','M724 373L738 449']){line(c,d,'#263e43',5);line(c,d,'#8b9c93',1.6);}
 path(c,'M735 296Q732 287 744 286L766 291Q774 294 773 306L769 391L737 385Z','#4d6b69','#2e494e',2);
 path(c,'M696 383L756 382L775 398L714 409L689 395Z','#72867b','#314f54',2);
 // Far leg: thigh projects toward the viewer, knee folds, calf reaches floor.
 path(c,'M734 370Q750 374 746 391L710 428L715 481L702 485L688 427Q688 419 696 407L713 378Z',grad(c,696,380,730,479,'#425967','#263f50'),'#243b45',2);
 path(c,'M700 475L716 475L718 487L734 495Q739 500 734 503L702 501L695 495Z','#685e50','#273b40',2);
 line(c,'M698 496L733 500','#a79b7b',1.3);line(c,'M708 482L716 484','#a59b85',1);
 // Near leg has its own knee and planted shoe; never hidden by the torso or replay UI.
 path(c,'M704 365Q717 366 724 384L682 422L669 480L651 479L656 417Q655 412 664 403L691 376Z',grad(c,679,385,685,476,'#536979','#304a5b'),'#263e48',2.3);
 path(c,'M651 475L670 476L672 485L687 491Q693 497 689 501L651 501Q644 499 644 493Z','#76664f','#293e43',2);
 line(c,'M648 496L687 497','#b0a080',1.2);line(c,'M657 483L670 485M656 487L670 489','#b7a887',1);
 line(c,'M696 386L668 417L660 467M721 397L700 424L707 469','#85929366',1.4);
 // Blouse and pelvis form a seated lean, not a standing floating torso.
 path(c,'M681 289Q694 283 708 291Q727 299 735 323L743 360Q745 375 731 384L713 393L686 379Q681 367 677 351L665 315Q663 300 681 289Z',grad(c,674,292,738,378,'#b29872','#786b51'),'#354f50',2.3);
 path(c,'M708 295Q724 313 725 335L736 367L719 374Q714 345 701 325Z','#c3aa7e66');
 line(c,'M703 316Q699 342 712 364M687 352L697 378M729 373L716 380','#dcc39855',1.5);
 // The other hand rests on the near thigh, with its own wrist and elbow.
 path(c,'M718 304Q729 307 732 320L746 350Q748 359 739 365L713 387L703 377L727 352L712 326Z','#9c8766','#405753',1.8);
 path(c,'M713 378L704 375L694 383Q688 389 692 395L700 397L714 389Z','#c89f7d','#5d6352',1.2);
 line(c,'M695 387L703 385M695 391L704 389','#916e55',.8);
 // Neck and head, approximately adult proportions; hair wraps behind the ear.
 path(c,'M683 273L681 289Q684 302 697 299L701 283L695 274Z','#b88f72','#526252',1.4);
 path(c,'M671 235Q681 222 697 229Q711 235 711 251L706 273Q702 286 691 286Q680 284 676 274L671 268Q662 267 666 262L671 254Z',grad(c,672,235,708,281,'#dfb78e','#b38468'),'#48594e',1.7);
 path(c,'M670 252Q659 242 666 230Q674 214 691 219Q709 220 717 237Q722 255 713 282L703 288L701 273Q708 264 706 253L699 239Q684 244 674 239Z','#4a4439','#2e474b',2);
 path(c,'M669 233Q681 221 694 225Q708 229 711 241Q691 229 680 239Z','#75644b');
 line(c,relief?'M673 254Q678 252 682 253':'M673 253L682 250','#795c43',1.1);
 if(relief){line(c,'M672 259Q677 261 681 257','#5b4d3a',1);line(c,'M674 274Q680 278 687 272','#8b6248',1);}
 else{ellipse(c,675,258,1.5,2,'#36423b');line(c,'M674 274Q679 272 684 274','#8b6248',1);}
 line(c,'M670 265L674 267','#a57b5c',.8);ellipse(c,704,258,3.5,5,'#c69b77');
 // Reaching arm: shoulder -> elbow -> forearm -> palm, each segment connected.
 path(c,'M679 299Q689 302 689 313L658 358Q653 365 642 365L590 357L589 344L642 346L663 308Q669 297 679 299Z',grad(c,660,311,638,363,'#b09970','#8a795a'),'#425b54',2);
 line(c,'M677 309L649 352L608 351','#d4bd8b66',1.5);
 path(c,'M591 343L601 344L599 360L588 359Z','#d2c4a0','#657566',1.2);
 path(c,'M591 345L578 339L558 341L549 350L558 361L580 362L591 359Z',grad(c,556,340,575,363,'#dbb28a','#ba8c69'),'#646852',1.3);
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

 // Two short side rails follow the near mattress edge, leaving the hand contact open.
 line(c,'M363 438L359 404Q358 396 365 392L449 346Q456 342 458 352L462 385','#2d4b55',8);
 line(c,'M363 438L359 404Q358 396 365 392L449 346Q456 342 458 352L462 385','#9cafa6',4);
 for(let i=0;i<3;i++){const x=378+i*25,y=389-i*14;line(c,`M${x} ${y}L${x+3} ${y+39}`,'#779392',4);line(c,`M${x-1} ${y}L${x+2} ${y+37}`,'#cfdbbf',1);}
 // Footboard stands vertically across the actual foot of the bed.
 path(c,'M230 380L353 448L354 473L232 404Z','#668386','#304e58',2);
 path(c,'M240 385L345 444L345 461L240 402Z','#a2b8ab','#486b70',1);
 line(c,'M248 395L336 444','#d6dec3',2);
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

}

export function atmosphere(c){
 const shade=c.createLinearGradient(0,0,960,0);shade.addColorStop(0,'#09213042');shade.addColorStop(.5,'#09213000');shade.addColorStop(1,'#dcc38b08');c.fillStyle=shade;c.fillRect(0,0,W,H);
 glow(c,727,124,285,'#ffe3a617');
}
export function warmLight(c){glow(c,706,211,300,'#ffd99516');}
export const painters={room,bed,patient,relative:c=>relative(c,false),relieved:c=>relative(c,true),foreground,atmosphere,warmLight};
