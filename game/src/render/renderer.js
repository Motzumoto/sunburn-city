// Purpose: compose the world, entities, HUD and final lighting.
// Main exports: Renderer.
// Inputs: canvas and the live game state.
// Outputs: complete viewport pixels.
// Side effects: owns resize listener and canvas transform.
// Notes: world drawing uses the staged camera and zoom.
import { drawGround } from './ground.js';
import { drawBuildings } from './buildings.js';
import { drawLighting } from './lighting.js';
import { drawProps } from './props.js';
import { drawHud } from '../ui/hud.js';
import { drawMenu } from '../ui/menus.js';
import { drawDialogue } from '../ui/dialogue.js';
export class Renderer {
  constructor(canvas){this.canvas=canvas;this.ctx=canvas.getContext('2d',{alpha:false});this.width=0;this.height=0;this.dpr=1;this.resize();window.addEventListener('resize',()=>this.resize());}
  resize(){this.dpr=Math.min(2,window.devicePixelRatio||1);this.width=window.innerWidth;this.height=window.innerHeight;this.canvas.width=Math.round(this.width*this.dpr);this.canvas.height=Math.round(this.height*this.dpr);this.ctx.setTransform(this.dpr,0,0,this.dpr,0,0);}
  draw(game){
    const c=this.ctx,w=this.width,h=this.height,cam=game.camera;c.setTransform(this.dpr,0,0,this.dpr,0,0);c.fillStyle='#153940';c.fillRect(0,0,w,h);
    drawWorldLayer(c,w,h,cam,game);
    drawLighting(c,w,h,game.hour,game.time);
    drawInterfaceLayer(c,w,h,game);
  }
}
function drawWorldLayer(ctx,width,height,camera,game){
  ctx.save();
  ctx.translate(width/2,height/2);
  ctx.scale(camera.zoom,camera.zoom);
  ctx.translate(-camera.x,-camera.y);
  drawGround(ctx,camera,game.shotScene==='chase',game.shotScene==='mission');
  drawBuildings(ctx,game.city.blocks,game.city.props,camera,game.hour);
  drawProps(ctx,game,camera);
  drawSceneAccents(ctx,game);
  game.effects.draw(ctx,false);
  drawBullets(ctx,game.bullets);
  drawLivingWorld(ctx,game);
  drawMissionMarker(ctx,game);
  drawPlayerOrHeroVehicle(ctx,game);
  game.effects.draw(ctx,true);
  ctx.restore();
}
function drawInterfaceLayer(ctx,width,height,game){
  if(game.state==='playing'||game.state==='map')drawHud(ctx,width,height,game.hud);
  if(game.dialogue)drawDialogue(ctx,width,height,game.dialogue.character,game.dialogue.lines);
  if(game.state!=='playing')drawMenu(ctx,width,height,game.state,game.selection,game.missions.progress);
  if(game.state==='title')drawSunset(ctx,width,height,game.time);
}
function drawBullets(ctx,bullets){
  for(const bullet of bullets){
    ctx.strokeStyle=bullet.owner==='police'?'#ff8b67':'#ffecba';
    ctx.lineWidth=3;
    ctx.beginPath();
    ctx.moveTo(bullet.x,bullet.y);
    ctx.lineTo(bullet.x-bullet.vx*.045,bullet.y-bullet.vy*.045);
    ctx.stroke();
  }
}
function drawLivingWorld(ctx,game){
  for(const enemy of game.enemies||[])if(enemy.health>0)drawEnemy(ctx,enemy);
  for(const pedestrian of game.peds)drawPed(ctx,pedestrian);
  if(game.shotContact)drawContact(ctx,game.shotContact);
  for(const car of game.cars)drawCar(ctx,car,game.time,game.hour);
  for(const cruiser of game.police)drawCar(ctx,cruiser,game.time,game.hour);
  for(const officer of game.officers||[])drawOfficer(ctx,officer);
}
function drawMissionMarker(ctx,game){
  const mission=game.hud?.mission||game.missions?.active;
  if(!mission)return;
  const pulse=1+Math.sin(game.time*4)*.12;
  ctx.strokeStyle='#ffae78';
  ctx.lineWidth=4;
  ctx.beginPath();
  ctx.arc(mission.target.x,mission.target.y,24*pulse,0,Math.PI*2);
  ctx.stroke();
  ctx.fillStyle='rgba(255,157,101,.18)';
  ctx.beginPath();
  ctx.arc(mission.target.x,mission.target.y,19,0,Math.PI*2);
  ctx.fill();
}
function drawPlayerOrHeroVehicle(ctx,game){
  if(game.player.vehicle)drawCar(ctx,game.player.vehicle,game.time,game.hour,true);
  else drawPlayer(ctx,game.player);
}
function drawCar(c,car,time,hour=12,hero=false){
  c.save();c.translate(car.x,car.y);c.rotate(car.angle);c.scale(hero?1.62:1.28,hero?1.48:1.18);
  if(hour>19||hour<5){
    c.fillStyle='rgba(255,237,182,.1)';c.beginPath();c.moveTo(18,-10);c.lineTo(190,-52);c.lineTo(190,52);c.lineTo(18,10);c.closePath();c.fill();
  }
  c.fillStyle='rgba(15,27,34,.36)';c.beginPath();c.roundRect(-22,-12,52,29,8);c.fill();c.fillStyle=car.color;c.beginPath();c.roundRect(-27,-15,50,27,7);c.fill();c.fillStyle=car.police?'#d8e8ec':'rgba(24,61,72,.88)';c.beginPath();c.roundRect(-12,-11,22,19,5);c.fill();c.fillStyle='#f7d8a6';c.fillRect(15,-10,5,5);c.fillRect(15,5,5,5);c.fillStyle=car.speed<42?'#f75b4b':'#8c3835';c.fillRect(-26,-10,4,5);c.fillRect(-26,5,4,5);c.fillStyle='#343d43';c.fillRect(-18,-18,9,4);c.fillRect(8,-18,9,4);c.fillRect(-18,14,9,4);c.fillRect(8,14,9,4);
  if(car.police){
    c.globalCompositeOperation='lighter';c.fillStyle='rgba(255,44,65,.36)';c.fillRect(-18,-26,20,20);c.fillStyle='rgba(55,135,255,.36)';c.fillRect(0,-26,19,20);c.globalCompositeOperation='source-over';
    c.fillStyle='#ff3e51';c.fillRect(-7,-19,8,6);c.fillStyle='#398cff';c.fillRect(2,-19,8,6);c.fillStyle='#fff4db';c.fillRect(-6,-18,3,3);c.fillRect(4,-18,3,3);
  }
  c.restore();
}
function drawPed(c,p){c.fillStyle='rgba(24,33,34,.22)';c.beginPath();c.ellipse(p.x+2,p.y+5,7,4,0,0,Math.PI*2);c.fill();c.fillStyle='#423a38';c.fillRect(p.x-3,p.y+1,3,8);c.fillRect(p.x+1,p.y+1,3,8);c.fillStyle=p.color;c.beginPath();c.roundRect(p.x-5,p.y-7,10,12,4);c.fill();c.fillStyle='#d9ad88';c.beginPath();c.arc(p.x,p.y-9,4,0,Math.PI*2);c.fill();}
function drawEnemy(c,p){c.save();c.translate(p.x,p.y);c.rotate(p.angle);c.fillStyle='rgba(24,30,34,.3)';c.beginPath();c.ellipse(2,5,12,7,0,0,Math.PI*2);c.fill();c.fillStyle=p.color;c.beginPath();c.roundRect(-7,-8,14,17,5);c.fill();c.fillStyle='#d9ad88';c.beginPath();c.arc(0,-10,5,0,Math.PI*2);c.fill();c.fillStyle='#272e34';c.fillRect(4,-3,15,3);c.restore();}
function drawPlayer(c,p){c.save();c.translate(p.x,p.y+Math.sin(p.walk)*2);c.rotate(p.angle);c.scale(1.9,1.8);c.fillStyle='rgba(10,26,34,.3)';c.beginPath();c.ellipse(2,5,13,8,0,0,Math.PI*2);c.fill();c.fillStyle='#252f37';c.fillRect(-6,3,4,9);c.fillRect(2,3,4,9);c.fillStyle='#e98770';c.beginPath();c.roundRect(-8,-8,16,15,5);c.fill();c.fillStyle='#e7b994';c.beginPath();c.arc(0,-10,5,0,Math.PI*2);c.fill();c.strokeStyle='#e7b994';c.lineWidth=4;c.beginPath();c.moveTo(4,-3);c.lineTo(17,-5);c.stroke();c.fillStyle='#f3dfb2';c.fillRect(14,-7,22,4);c.fillStyle='#292f35';c.fillRect(31,-8,5,2);c.restore();}
function drawOfficer(c,o){c.save();c.translate(o.x,o.y);c.rotate(o.angle);c.scale(1.2,1.2);c.fillStyle='rgba(12,24,31,.38)';c.beginPath();c.ellipse(2,6,12,7,0,0,Math.PI*2);c.fill();c.fillStyle='#192b38';c.fillRect(-7,3,5,10);c.fillRect(2,3,5,10);c.fillStyle='#24577d';c.beginPath();c.roundRect(-8,-8,17,16,5);c.fill();c.fillStyle='#f0cb72';c.beginPath();c.arc(1,-2,2,0,Math.PI*2);c.fill();c.fillStyle='#d9ad88';c.beginPath();c.arc(0,-11,5,0,Math.PI*2);c.fill();c.strokeStyle='#d9ad88';c.lineWidth=4;c.beginPath();c.moveTo(5,-3);c.lineTo(15,-4);c.stroke();c.fillStyle='#252d32';c.fillRect(12,-6,19,4);c.fillRect(28,-7,3,7);c.restore();}
function drawContact(c,p){c.save();c.translate(p.x,p.y);c.fillStyle='rgba(29,51,64,.38)';c.beginPath();c.ellipse(4,10,15,8,0,0,Math.PI*2);c.fill();c.fillStyle='#302b36';c.fillRect(-7,2,6,13);c.fillRect(2,2,6,13);c.fillStyle='#2f8f8f';c.beginPath();c.roundRect(-11,-15,22,21,6);c.fill();c.fillStyle='#d8a47f';c.beginPath();c.arc(0,-18,7,0,Math.PI*2);c.fill();c.fillStyle='#352b2e';c.beginPath();c.arc(0,-20,8,Math.PI,Math.PI*2);c.fill();c.fillStyle='#e7c39a';c.fillRect(-10,-7,4,2);c.restore();}
function drawSceneAccents(c,game){
  const p=game.player;
  if(game.shotScene==='mission'){
    drawAreaGlow(c,p.x-170,p.y-95,'rgba(70,220,220,.10)');drawAreaGlow(c,p.x+155,p.y-130,'rgba(255,119,155,.08)');drawAreaGlow(c,p.x+185,p.y+75,'rgba(255,194,117,.10)');
    drawNeonSign(c,p.x-220,p.y-150,'PIER 9','#45e1d4');drawNeonSign(c,p.x+105,p.y-115,'TIDE CLUB','#ff769d');
  }
}
function drawAreaGlow(c,x,y,color){const light=c.createRadialGradient(x,y,5,x,y,110);light.addColorStop(0,color);light.addColorStop(1,'rgba(255,170,110,0)');c.fillStyle=light;c.fillRect(x-110,y-110,220,220);}
function drawNeonSign(c,x,y,label,color){c.save();c.globalCompositeOperation='lighter';c.globalAlpha=.22;c.fillStyle=color;c.fillRect(x-8,y-7,128,39);c.globalAlpha=1;c.fillStyle='rgba(20,37,43,.96)';c.fillRect(x,y,112,25);c.strokeStyle=color;c.lineWidth=2;c.strokeRect(x,y,112,25);c.fillStyle=color;c.font='900 13px sans-serif';c.textAlign='center';c.fillText(label,x+56,y+17);c.restore();}
function drawSunset(c,w,h,time){const g=c.createLinearGradient(0,0,0,h);g.addColorStop(0,'rgba(239,150,106,.08)');g.addColorStop(1,'rgba(10,35,42,.16)');c.fillStyle=g;c.fillRect(0,0,w,h);}
