// Culls and paints the complete world, then layers weathered-light and UI details.
import { drawGround } from './ground.js';
import { drawBuildings } from './buildings.js';
import { drawLighting } from './lighting.js';
import { drawHud } from '../ui/hud.js';
import { drawMenu } from '../ui/menus.js';
import { drawDialogue } from '../ui/dialogue.js';
export class Renderer {
  constructor(canvas){this.canvas=canvas;this.ctx=canvas.getContext('2d',{alpha:false});this.width=0;this.height=0;this.dpr=1;this.resize();window.addEventListener('resize',()=>this.resize());}
  resize(){this.dpr=Math.min(2,window.devicePixelRatio||1);this.width=window.innerWidth;this.height=window.innerHeight;this.canvas.width=Math.round(this.width*this.dpr);this.canvas.height=Math.round(this.height*this.dpr);this.ctx.setTransform(this.dpr,0,0,this.dpr,0,0);}
  draw(game){
    const c=this.ctx,w=this.width,h=this.height,cam=game.camera;c.setTransform(this.dpr,0,0,this.dpr,0,0);c.fillStyle='#153940';c.fillRect(0,0,w,h);
    c.save();c.translate(w/2,h/2);c.scale(cam.zoom,cam.zoom);c.translate(-cam.x,-cam.y);
    drawGround(c,cam);drawBuildings(c,game.city.blocks,game.city.props,cam,game.hour);drawSceneAccents(c,game);
    game.effects.draw(c,false);
    for(const bullet of game.bullets){c.strokeStyle=bullet.owner==='police'?'#ff8b67':'#ffecba';c.lineWidth=3;c.beginPath();c.moveTo(bullet.x,bullet.y);c.lineTo(bullet.x-bullet.vx*.045,bullet.y-bullet.vy*.045);c.stroke();}
    for(const enemy of game.enemies||[])if(enemy.health>0)drawEnemy(c,enemy);
    for(const ped of game.peds)drawPed(c,ped);
    for(const car of game.cars)drawCar(c,car,game.time,game.hour);
    for(const car of game.police)drawCar(c,car,game.time,game.hour);
    for(const officer of game.officers||[])drawOfficer(c,officer);
    const mission=game.hud?.mission||game.missions?.active;
    if(mission){const pulse=1+Math.sin(game.time*4)*.12;c.strokeStyle='#ffae78';c.lineWidth=4;c.beginPath();c.arc(mission.target.x,mission.target.y,24*pulse,0,Math.PI*2);c.stroke();c.fillStyle='rgba(255,157,101,.18)';c.beginPath();c.arc(mission.target.x,mission.target.y,19,0,Math.PI*2);c.fill();}
    if(game.player.vehicle)drawCar(c,game.player.vehicle,game.time,game.hour,true);else drawPlayer(c,game.player);
    game.effects.draw(c,true);
    c.restore();drawLighting(c,w,h,game.hour);
    if(game.state==='playing'||game.state==='map')drawHud(c,w,h,game.hud);
    if(game.dialogue)drawDialogue(c,w,h,game.dialogue.character,game.dialogue.lines);
    if(game.state!=='playing')drawMenu(c,w,h,game.state,game.selection,game.missions.progress);
    if(game.state==='title')drawSunset(c,w,h,game.time);
  }
}
function drawCar(c,car,time,hour=12,hero=false){
  c.save();c.translate(car.x,car.y);c.rotate(car.angle);c.scale(hero?1.62:1.28,hero?1.48:1.18);
  if(hour>19||hour<5){
    const beam=c.createLinearGradient(19,0,190,0);beam.addColorStop(0,'rgba(255,237,182,.3)');beam.addColorStop(1,'rgba(255,237,182,0)');c.fillStyle=beam;c.beginPath();c.moveTo(18,-10);c.lineTo(190,-52);c.lineTo(190,52);c.lineTo(18,10);c.closePath();c.fill();
  }
  c.fillStyle='rgba(15,27,34,.36)';c.beginPath();c.roundRect(-22,-12,52,29,8);c.fill();c.fillStyle=car.color;c.beginPath();c.roundRect(-27,-15,50,27,7);c.fill();c.fillStyle=car.police?'#d8e8ec':'rgba(24,61,72,.88)';c.beginPath();c.roundRect(-12,-11,22,19,5);c.fill();c.fillStyle='#f7d8a6';c.fillRect(15,-10,5,5);c.fillRect(15,5,5,5);c.fillStyle='#343d43';c.fillRect(-18,-18,9,4);c.fillRect(8,-18,9,4);c.fillRect(-18,14,9,4);c.fillRect(8,14,9,4);
  if(car.police){c.save();c.globalCompositeOperation='lighter';for(const [x,center,edge] of [[-5,'rgba(255,45,65,.54)','rgba(255,45,65,0)'],[6,'rgba(55,135,255,.54)','rgba(55,135,255,0)']]){const glow=c.createRadialGradient(x,-16,1,x,-16,48);glow.addColorStop(0,center);glow.addColorStop(.35,'rgba(220,220,220,.1)');glow.addColorStop(1,edge);c.fillStyle=glow;c.beginPath();c.arc(x,-16,48,0,Math.PI*2);c.fill();}c.restore();
    c.shadowBlur=18;c.shadowColor='#ff334d';c.fillStyle='#ff3e51';c.fillRect(-7,-19,8,6);c.shadowColor='#318fff';c.fillStyle='#398cff';c.fillRect(2,-19,8,6);c.shadowBlur=0;c.fillStyle='#fff4db';c.fillRect(-6,-18,3,3);c.fillRect(4,-18,3,3);
  }
  c.restore();
}
function drawPed(c,p){c.fillStyle='rgba(24,33,34,.22)';c.beginPath();c.ellipse(p.x+2,p.y+5,7,4,0,0,Math.PI*2);c.fill();c.fillStyle='#423a38';c.fillRect(p.x-3,p.y+1,3,8);c.fillRect(p.x+1,p.y+1,3,8);c.fillStyle=p.color;c.beginPath();c.roundRect(p.x-5,p.y-7,10,12,4);c.fill();c.fillStyle='#d9ad88';c.beginPath();c.arc(p.x,p.y-9,4,0,Math.PI*2);c.fill();}
function drawEnemy(c,p){c.save();c.translate(p.x,p.y);c.rotate(p.angle);c.fillStyle='rgba(24,30,34,.3)';c.beginPath();c.ellipse(2,5,12,7,0,0,Math.PI*2);c.fill();c.fillStyle=p.color;c.beginPath();c.roundRect(-7,-8,14,17,5);c.fill();c.fillStyle='#d9ad88';c.beginPath();c.arc(0,-10,5,0,Math.PI*2);c.fill();c.fillStyle='#272e34';c.fillRect(4,-3,15,3);c.restore();}
function drawPlayer(c,p){c.save();c.translate(p.x,p.y+Math.sin(p.walk)*2);c.rotate(p.angle);c.scale(1.9,1.8);c.fillStyle='rgba(10,26,34,.3)';c.beginPath();c.ellipse(2,5,13,8,0,0,Math.PI*2);c.fill();c.fillStyle='#252f37';c.fillRect(-6,3,4,9);c.fillRect(2,3,4,9);c.fillStyle='#e98770';c.beginPath();c.roundRect(-8,-8,16,15,5);c.fill();c.fillStyle='#e7b994';c.beginPath();c.arc(0,-10,5,0,Math.PI*2);c.fill();c.strokeStyle='#e7b994';c.lineWidth=4;c.beginPath();c.moveTo(4,-3);c.lineTo(17,-5);c.stroke();c.fillStyle='#f3dfb2';c.fillRect(14,-7,22,4);c.fillStyle='#292f35';c.fillRect(31,-8,5,2);c.restore();}
function drawOfficer(c,o){c.save();c.translate(o.x,o.y);c.rotate(o.angle);c.scale(1.2,1.2);c.fillStyle='rgba(12,24,31,.38)';c.beginPath();c.ellipse(2,6,12,7,0,0,Math.PI*2);c.fill();c.fillStyle='#192b38';c.fillRect(-7,3,5,10);c.fillRect(2,3,5,10);c.fillStyle='#24577d';c.beginPath();c.roundRect(-8,-8,17,16,5);c.fill();c.fillStyle='#f0cb72';c.beginPath();c.arc(1,-2,2,0,Math.PI*2);c.fill();c.fillStyle='#d9ad88';c.beginPath();c.arc(0,-11,5,0,Math.PI*2);c.fill();c.strokeStyle='#d9ad88';c.lineWidth=4;c.beginPath();c.moveTo(5,-3);c.lineTo(15,-4);c.stroke();c.fillStyle='#252d32';c.fillRect(12,-6,19,4);c.fillRect(28,-7,3,7);c.restore();}
function drawSceneAccents(c,game){
  const p=game.player;
  if(game.shotScene==='mission'){
    for(const [x,y,color] of [[p.x-170,p.y-95,'rgba(70,220,220,.25)'],[p.x+155,p.y-130,'rgba(255,119,155,.25)'],[p.x+185,p.y+75,'rgba(255,194,117,.2)']]){const light=c.createRadialGradient(x,y,5,x,y,145);light.addColorStop(0,color);light.addColorStop(1,'rgba(255,170,110,0)');c.fillStyle=light;c.fillRect(x-145,y-145,290,290);}
    for(const [x,y,label,color] of [[p.x-220,p.y-150,'PIER 9','#45e1d4'],[p.x+105,p.y-115,'TIDE CLUB','#ff769d']]){c.save();c.shadowBlur=22;c.shadowColor=color;c.fillStyle='rgba(20,37,43,.9)';c.fillRect(x,y,112,25);c.strokeStyle=color;c.lineWidth=2;c.strokeRect(x,y,112,25);c.fillStyle=color;c.font='900 13px sans-serif';c.textAlign='center';c.fillText(label,x+56,y+17);c.restore();}
  }
}
function drawSunset(c,w,h,time){const g=c.createLinearGradient(0,0,0,h);g.addColorStop(0,'rgba(239,150,106,.08)');g.addColorStop(1,'rgba(10,35,42,.16)');c.fillStyle=g;c.fillRect(0,0,w,h);}
