import {gates,islands,lanes,SECTORS} from './simulation.js';
const C={cyan:'#72edf1',amber:'#ffd083',violet:'#bc9aff',red:'#ff7592',muted:'#7298ac'};
function rect(c,x,y,w,h,fill,stroke){c.fillStyle=fill;c.fillRect(x,y,w,h);if(stroke){c.strokeStyle=stroke;c.strokeRect(x+.5,y+.5,w,h);}}
function text(c,str,x,y,size=12,color=C.muted,align='left'){c.fillStyle=color;c.font=`${size>=20?'700':'500'} ${size}px Segoe UI, Arial`;c.textAlign=align;c.fillText(str,x,y);}
function line(c,x,y,xx,yy,color,width=1){c.strokeStyle=color;c.lineWidth=width;c.beginPath();c.moveTo(x,y);c.lineTo(xx,yy);c.stroke();c.lineWidth=1;}
function ring(c,x,y,r,color,width=1){c.strokeStyle=color;c.lineWidth=width;c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.stroke();c.lineWidth=1;}
function glow(c,color,blur=15){c.shadowColor=color;c.shadowBlur=blur;}
function capsule(c,x,y,t,index){c.save();c.translate(x,y);c.rotate(Math.sin(t*2+index)*.12);glow(c,C.amber,12);rect(c,-10,-14,20,28,'#463e32',C.amber);rect(c,-5,-8,10,12,C.amber);c.shadowBlur=0;line(c,-15,-5,-15,5,C.amber,2);line(c,15,-5,15,5,C.amber,2);c.restore();ring(c,x,y,24+Math.sin(t*3+index)*3,'#ffd08330');}
function drawPort(c,s){
 const bg=c.createLinearGradient(0,100,1120,650);bg.addColorStop(0,'#102e40');bg.addColorStop(.5,'#092333');bg.addColorStop(1,'#0c1e34');rect(c,0,112,1120,520,bg);
 for(let x=60;x<1090;x+=36)line(c,x,132,x,620,'#7cdaec07');for(let y=136;y<630;y+=36)line(c,40,y,1080,y,'#7cdaec07');
 // Reflected orbital infrastructure, authored from repeating geometry.
 for(let i=0;i<70;i++){let x=50+(i*167)%1020,y=145+(i*91)%460;let a=.1+.08*Math.sin(s.time+i);c.globalAlpha=a;line(c,x,y,x+10+Math.sin(i)*7,y,C.cyan);c.globalAlpha=1;}
 for(const l of lanes){let color=s.phase?C.violet:C.cyan;rect(c,l.x,l.y,l.w,l.h,s.phase?'#9c7bea12':'#50e6ed0b');line(c,l.x,l.y,l.x+l.w,l.y,color+'35');line(c,l.x,l.y+l.h,l.x+l.w,l.y+l.h,color+'35');
 let dir=l.dir*(s.phase?-1:1);for(let x=l.x+20;x<l.x+l.w-20;x+=60){let offset=(s.time*35*dir)%60,xx=x+offset;for(let k=0;k<2;k++){let cy=l.y+21+k*22;line(c,xx-dir*7,cy-5,xx,cy,color+'65');line(c,xx,cy,xx-dir*7,cy+5,color+'65');}}
 }
 // Outer pressure wall and numbered mooring fingers.
 c.strokeStyle='#3a6170';c.lineWidth=2;c.strokeRect(40,130,1040,490);c.lineWidth=1;
 for(let i=0;i<12;i++){let x=65+i*87;rect(c,x,130,40,11,'#203d4c','#3b5a64');rect(c,x,609,40,11,'#203d4c','#3b5a64');line(c,x+8,135,x+28,135,C.amber+'70',2);}
 for(const r of islands){rect(c,r.x+6,r.y+8,r.w,r.h,'#04111d');rect(c,r.x,r.y,r.w,r.h,'#1a3545','#58717d');rect(c,r.x+8,r.y+8,r.w-16,r.h-16,'#102638','#2e4f60');for(let x=r.x+15;x<r.x+r.w-15;x+=25)line(c,x,r.y+12,x,r.y+r.h-12,'#3b5c69');text(c,r.x<500?'SUBMERGED ARRAY':'TERMINAL / 07',r.x+r.w/2,r.y+32,9,'#83a2ad','center');}
 // Breakwater links make the phase doors part of the architecture.
 line(c,569,131,569,150,'#58717d',16);line(c,569,300,569,400,'#213f4f',16);line(c,569,575,569,620,'#58717d',16);
 for(const g of gates){let open=s.phase===g.phase,color=g.phase?C.violet:C.cyan;rect(c,g.x-5,g.y-8,28,8,'#42616d');rect(c,g.x-5,g.y+g.h,28,8,'#42616d');
 if(!open){glow(c,color,9);for(let y=g.y;y<g.y+g.h;y+=9)line(c,g.x,y,g.x+g.w,y+5,color,2);c.shadowBlur=0;}else{line(c,g.x+9,g.y,g.x+9,g.y+g.h,color+'35');}
 text(c,open?'OPEN':'LOCK',g.x+32,g.y+g.h/2,9,color);text(c,g.phase?'II':'I',g.x+9,g.y-17,11,color,'center');}
 // Safe dock: ring, berth lights and landing target.
 rect(c,42,288,105,124,'#143d46','#447b81');rect(c,42,300,70,100,'#1c4b50');ring(c,110,350,48,'#74f4d440',2);ring(c,110,350,38,'#74f4d4',2);line(c,85,350,135,350,'#74f4d4');line(c,110,325,110,375,'#74f4d4');for(let y=300;y<=400;y+=25)rect(c,49,y,6,12,C.amber);text(c,'HAVEN',110,429,14,'#a8f8dd','center');text(c,'DELIVER + REFUEL',110,446,8,'#8fb5b6','center');
 text(c,'GATE SPINE',569,646,9,C.muted,'center');text(c,`0${s.wave} / ${SECTORS[s.wave-1].toUpperCase()}`,58,646,10,'#9bb8c5');text(c,'ORBITAL FLOODPLAIN  /  02:17 LST',1064,646,9,C.muted,'right');
}
function drawHazards(c,s){for(const h of s.hazards){ring(c,h.x,h.y,h.r+10,'#ff759223');c.save();c.translate(h.x,h.y);c.rotate(s.time*(h.kind?-1:1));glow(c,C.red,12);c.strokeStyle=C.red;c.lineWidth=2;c.beginPath();for(let i=0;i<8;i++){let a=i*Math.PI/4,r=i%2?h.r*.65:h.r+5;c.lineTo(Math.cos(a)*r,Math.sin(a)*r);}c.closePath();c.fillStyle='#38253b';c.fill();c.stroke();c.shadowBlur=0;ring(c,0,0,6,C.red,2);c.restore();}}
function drawSkiff(c,s){let p=s.player;
 for(let i=0;i<s.trail.length;i+=4){let t=s.trail[i];ring(c,t.x,t.y,2+i*.075,`rgba(113,237,241,${(1-i/80)*.23})`);}
 let last=p;for(const cargo of s.cargo){line(c,last.x,last.y,cargo.x,cargo.y,'#ffd08380',2);capsule(c,cargo.x,cargo.y,s.time,cargo.id);last=cargo;}
 c.save();c.translate(p.x,p.y);c.rotate(p.angle);if(s.invulnerable>0&&Math.sin(s.time*35)>0)c.globalAlpha=.35;
 glow(c,C.cyan,16);c.fillStyle='#c5fcff';c.strokeStyle=C.cyan;c.lineWidth=2;c.beginPath();c.moveTo(19,0);c.lineTo(-11,-12);c.lineTo(-6,0);c.lineTo(-11,12);c.closePath();c.fill();c.stroke();c.shadowBlur=0;rect(c,-2,-5,9,10,'#143f57');rect(c,-15,-12,7,5,C.amber);rect(c,-15,7,7,5,C.amber);if(Math.hypot(p.vx,p.vy)>15){c.fillStyle=C.cyan;c.beginPath();c.moveTo(-14,-4);c.lineTo(-25-Math.sin(s.time*40)*5,0);c.lineTo(-14,4);c.fill();}c.restore();
 ring(c,p.x,p.y,24,s.phase?C.violet+'60':C.cyan+'60');
}
function drawHud(c,s){rect(c,0,0,1120,112,'#071725');line(c,0,111,1120,111,'#375364');text(c,'RESCUE OPERATION',30,27,9,C.muted);text(c,'0'+s.wave,30,68,34,C.cyan);text(c,'/ 03',82,66,16,C.muted);text(c,SECTORS[s.wave-1],30,93,11,'#b5ccd6');
 text(c,'SIGNAL SCORE',242,27,9,C.muted);text(c,String(s.score).padStart(6,'0'),242,66,31,'#ecf8fa');text(c,`${s.total} CAPSULES SAFE`,242,93,10,C.amber);
 text(c,'REACTOR ENERGY',470,27,9,C.muted);text(c,`${Math.ceil(s.energy)}%`,650,27,10,s.energy<25?C.red:C.cyan,'right');rect(c,470,43,180,14,'#223a48');rect(c,470,43,180*s.energy/100,14,s.energy<25?C.red:C.cyan);for(let x=500;x<650;x+=30)line(c,x,43,x,57,'#092030',2);text(c,'TOW',470,88,9,C.muted);for(let i=0;i<3;i++)rect(c,507+i*25,75,17,17,i<s.cargo.length?C.amber:'#233c4c',i<s.cargo.length?C.amber:'#45616c');text(c,`${s.delivered}/6 THIS SECTOR`,650,88,9,C.muted,'right');
 let color=s.phase?C.violet:C.cyan;text(c,'PHASE / SPACE',735,27,9,C.muted);text(c,s.phase?'II  VIOLET':'I  CYAN',735,62,25,color);text(c,s.cooldown>0?'RELAY CHARGING':'SWITCH READY',735,91,9,color);
 text(c,'CHAIN BONUS',1078,27,9,C.muted,'right');text(c,s.cargo.length?`x${s.cargo.length}`:'-',1078,65,34,C.amber,'right');text(c,'3 TOWED = 600',1078,93,10,C.muted,'right');
 rect(c,0,665,1120,35,'#071725');text(c,'WASD / ARROWS  steer     •     HOLD MOUSE  navigate',25,687,10,'#a3c1ce');text(c,'SPACE / RIGHT CLICK  switch tide     •     P  pause     •     R  restart',1090,687,10,'#a3c1ce','right');
}
export function renderGame(c,s){c.clearRect(0,0,1120,700);drawPort(c,s);for(const pod of s.capsules)if(!pod.rescued)capsule(c,pod.x,pod.y,s.time,pod.id);drawHazards(c,s);drawSkiff(c,s);
 for(const f of s.particles){c.globalAlpha=Math.min(1,f.life);rect(c,f.x,f.y,3,3,f.color);}c.globalAlpha=1;drawHud(c,s);
 if(s.noticeTime>0&&s.status==='playing'){c.fillStyle='#061522df';c.fillRect(300,120,520,28);text(c,s.notice,560,139,11,'#d5f8f4','center');}
}
