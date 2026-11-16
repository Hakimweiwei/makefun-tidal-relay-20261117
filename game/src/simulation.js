export const WIDTH=1120, HEIGHT=700, STEP=1/60;
export const SECTORS=['The Glass Anchorage','Helix Spillway','Last Light Terminal'];
export const gates=[{x:560,y:150,w:18,h:150,phase:1},{x:560,y:400,w:18,h:175,phase:0}];
export const islands=[{x:348,y:325,w:132,h:54},{x:748,y:325,w:160,h:54}];
export const lanes=[{x:220,y:220,w:800,h:64,dir:1},{x:210,y:448,w:800,h:64,dir:-1}];
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
function random(s){s.seed=(Math.imul(s.seed,1664525)+1013904223)>>>0;return s.seed/4294967296;}
export function createGame(seed=7319){
 const s={seed:seed>>>0,status:'title',wave:1,phase:0,time:0,energy:100,score:0,delivered:0,total:0,cargo:[],capsules:[],hazards:[],particles:[],events:[],cooldown:0,invulnerable:0,chain:0,phaseCount:0,notice:'',noticeTime:0,player:{x:110,y:350,vx:0,vy:0,angle:0},trail:[]};
 populateSector(s);return s;
}
function populateSector(s){
 const patterns=[[[290,180],[430,260],[720,175],[930,265],[710,490],[960,555]],[[290,540],[440,455],[695,230],[960,165],[760,550],[995,440]],[[280,190],[420,545],[700,170],[985,280],[690,530],[980,560]]];
 s.capsules=patterns[s.wave-1].map(([x,y],i)=>({x:x+(random(s)-.5)*12,y:y+(random(s)-.5)*12,id:i,rescued:false}));
 s.hazards=Array.from({length:s.wave+1},(_,i)=>({x:650+i*110,y:350,baseX:650+i*110,baseY:350,r:17+(i%2)*3,orbit:random(s)*6.28,kind:i%2}));
 s.delivered=0;s.notice=`SECTOR 0${s.wave} / ${SECTORS[s.wave-1]}`;s.noticeTime=4;
}
export function startGame(s){if(s.status==='title')s.status='playing';}
export function togglePause(s){if(s.status==='playing')s.status='paused';else if(s.status==='paused')s.status='playing';}
function burst(s,x,y,color,count=18){for(let i=0;i<count;i++){let a=random(s)*Math.PI*2,v=25+random(s)*100;s.particles.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,life:.5+random(s)*.6,color});}}
function announce(s,text,event){s.notice=text;s.noticeTime=2.5;s.events.push(event);}
function blocked(x,y,s){
 if(x<58||x>1062||y<144||y>602)return true;
 const spine=[{x:560,y:130,w:18,h:20},{x:560,y:300,w:18,h:100},{x:560,y:575,w:18,h:45}];
 return [...islands,...spine,...gates.filter(g=>g.phase!==s.phase)].some(r=>x>r.x-13&&x<r.x+r.w+13&&y>r.y-13&&y<r.y+r.h+13);
}
export function stepGame(s,input={},dt=STEP){
 if(s.status!=='playing')return;
 s.events=[];s.time+=dt;s.cooldown=Math.max(0,s.cooldown-dt);s.invulnerable=Math.max(0,s.invulnerable-dt);s.noticeTime=Math.max(0,s.noticeTime-dt);
 if(input.phase&&s.cooldown===0){s.phase=1-s.phase;s.cooldown=.55;s.phaseCount++;s.energy-=1.5;
  // A closing field gently ejects an overlapping hull to its nearest safe side.
  for(const g of gates)if(g.phase!==s.phase&&s.player.x>g.x-13&&s.player.x<g.x+g.w+13&&s.player.y>g.y-13&&s.player.y<g.y+g.h+13){s.player.x=s.player.x<g.x+g.w/2?g.x-14:g.x+g.w+14;s.player.vx=0;}
  burst(s,s.player.x,s.player.y,'#77efff',30);announce(s,`${s.phase?'VIOLET':'CYAN'} TIDE / currents reversed`,'phase');}
 const p=s.player;let ix=input.x||0,iy=input.y||0;
 if(input.target){let dx=input.target.x-p.x,dy=input.target.y-p.y,d=Math.hypot(dx,dy);if(d>9){ix=dx/d*Math.min(1,d/40);iy=dy/d*Math.min(1,d/40);}}
 const length=Math.hypot(ix,iy);if(length>1){ix/=length;iy/=length;}
 let flow=0;for(const l of lanes)if(p.x>l.x&&p.x<l.x+l.w&&p.y>l.y&&p.y<l.y+l.h)flow=l.dir*(s.phase?-1:1)*80;
 const speed=225-s.cargo.length*14,blend=1-Math.exp(-12*dt);
 p.vx+=(ix*speed+flow-p.vx)*blend;p.vy+=(iy*speed-p.vy)*blend;
 const nx=p.x+p.vx*dt,ny=p.y+p.vy*dt;
 if(!blocked(nx,p.y,s))p.x=nx;else p.vx=0;
 if(!blocked(p.x,ny,s))p.y=ny;else p.vy=0;
 if(Math.hypot(p.vx,p.vy)>8)p.angle=Math.atan2(p.vy,p.vx);
 s.trail.unshift({x:p.x,y:p.y});if(s.trail.length>80)s.trail.pop();
 s.energy-=dt*(.65+length*.55+s.cargo.length*.16);
 for(const c of s.capsules)if(!c.rescued&&s.cargo.length<3&&distance(c,p)<30){c.rescued=true;s.cargo.push({x:c.x,y:c.y,id:c.id});burst(s,c.x,c.y,'#ffc56d');announce(s,`CAPSULE LINKED / ${s.cargo.length} of 3 tow slots`,'pickup');}
 s.cargo.forEach((c,i)=>{let target=i?s.cargo[i-1]:p;let d=distance(c,target);if(d>27){let f=Math.min(1,(d-27)*dt*7/d);c.x+=(target.x-c.x)*f;c.y+=(target.y-c.y)*f;}});
 if(distance(p,{x:110,y:350})<48&&s.cargo.length){let n=s.cargo.length,points=100*n*(n+1)/2;s.score+=points;s.chain=Math.max(s.chain,n);s.delivered+=n;s.total+=n;s.energy=Math.min(100,s.energy+18+n*9);s.cargo=[];burst(s,110,350,'#ffc56d',45);announce(s,`${n} RESCUED / +${points} / energy restored`,'delivery');
  if(s.delivered===6){if(s.wave===3){s.status='won';s.score+=Math.ceil(s.energy)*10;s.events.push('win');}else{s.wave++;populateSector(s);s.energy=Math.min(100,s.energy+15);s.events.push('sector');}}
 }
 for(const h of s.hazards){const t=s.time*(.45+s.wave*.12)+h.orbit;h.x=h.baseX+Math.cos(t)*(h.kind?48:80);h.y=h.baseY+Math.sin(t*(h.kind?1.7:1))*(130+s.wave*8);
  if(distance(h,p)<h.r+12&&s.invulnerable===0){s.energy-=19;s.invulnerable=1.6;p.vx=-p.vx*1.5;p.vy=-p.vy*1.5;burst(s,p.x,p.y,'#ff6b89',30);announce(s,'HULL STRIKE / -19 energy','hit');}}
 for(const f of s.particles){f.x+=f.vx*dt;f.y+=f.vy*dt;f.life-=dt;}s.particles=s.particles.filter(f=>f.life>0);
 if(s.energy<=0&&s.status==='playing'){s.energy=0;s.status='lost';s.events.push('lose');}
}

