// SUNBURN CITY boot, state machine, fixed-step simulation and screenshot interface.
import { STEP } from './core/config.js';
import { mulberry32 } from './core/rng.js';
import { Input } from './core/input.js';
import { Camera } from './core/camera.js';
import { startLoop } from './core/loop.js';
import { AudioEngine } from './core/audio.js';
import { City } from './world/city.js';
import { districtAt } from './world/districts.js';
import { Player } from './entities/player.js';
import { shoot } from './entities/bullet.js';
import { createGang, updateGang } from './entities/enemy.js';
import { makeTraffic } from './entities/traffic.js';
import { Pedestrian } from './entities/pedestrian.js';
import { updatePolice, spawnPolice } from './entities/police.js';
import { Effects } from './render/effects.js';
import { Renderer } from './render/renderer.js';
import { Missions } from './game/missions.js';
import { Wanted } from './game/wanted.js';
import { readSave, writeSave, applySave } from './game/save.js';
import { STATIONS, nextStation } from './audio/music.js';
import { playSfx } from './audio/sfx.js';
import { stageShot } from './ui/shots.js';
import { STORY } from './game/story.js';

const canvas=document.getElementById('game'),renderer=new Renderer(canvas),input=new Input(canvas),audio=new AudioEngine();
const query=new URLSearchParams(location.search),seed=Number.parseInt(query.get('seed')||'1',10)||1,random=mulberry32(seed);
const city=new City(seed),player=new Player(),missions=new Missions(),camera=new Camera(),effects=new Effects(),wanted=new Wanted();
city.cars=makeTraffic(random);
const peds=Array.from({length:94},(_,i)=>new Pedestrian(random,i));
const game={state:'title',selection:0,city,player,camera,effects,cars:city.cars,peds,police:[],officers:[],enemies:[],bullets:[],missions,wanted,hour:16.5,time:0,missionComplete:0,dialogue:null,menuFrom:'title',radioIndex:0,radio:STATIONS[0],clock:'4:30 PM',hud:{clock:'4:30 PM',radio:STATIONS[0]},seed};
const save=readSave();if(save){applySave(player,save);missions.progress=Math.min(5,save.progress);const car=city.cars.find(candidate=>candidate.name===player.savedVehicle);if(car){player.vehicle=car;car.occupied=true;car.x=player.x;car.y=player.y;}}
let shotMode=Boolean(query.get('shot')),shotFrames=0;
function launchMission(){missions.start();game.enemies.length=0;if(missions.active?.type==='holdout'){game.enemies.push(...createGang(missions.active.target));wanted.add(1);}}
function begin(newGame){audio.start();audio.setStation(game.radioIndex);playSfx(audio,'click');if(newGame){player.x=1865;player.y=1840;player.vehicle=null;player.money=1250;player.health=100;player.armor=35;player.weapon=0;missions.progress=0;}game.state='playing';game.dialogue={character:{name:'MARISOL VALE',color:'#d47c69'},lines:['You came back to the right city.','One quiet favor. Then we talk.']};launchMission();writeSave(player,missions.progress);game.selection=0;}
function update(dt){
  game.time+=dt;game.hour=(game.hour+dt*.06)%24;game.missionComplete=Math.max(0,game.missionComplete-dt);effects.update(dt);
  for(const car of game.cars){if(!car.occupied&&car.speed){car.x+=Math.cos(car.angle)*car.speed*dt;car.y+=Math.sin(car.angle)*car.speed*dt;if(car.x<40||car.x>4160||car.y<40||car.y>3750){car.x=Math.max(40,Math.min(4160,car.x));car.y=Math.max(40,Math.min(3750,car.y));car.angle+=Math.PI;}}}
  if(game.state==='title')for(const ped of peds)ped.update(dt,null);
  let resumed=false;
  if(game.state==='title'){if(input.hit('ArrowDown','KeyS'))game.selection=(game.selection+1)%4;if(input.hit('ArrowUp','KeyW'))game.selection=(game.selection+3)%4;if(input.hit('Enter','Space')){if(game.selection===0)begin(false);else if(game.selection===1)begin(true);else if(game.selection===2||game.selection===3){game.menuFrom='title';game.state=game.selection===2?'controls':'credits';}}if(input.mouse.clicked){audio.start();if(input.mouse.y>renderer.height*.5&&input.mouse.y<renderer.height*.75){game.selection=Math.max(0,Math.min(3,Math.floor((input.mouse.y/renderer.height-.53)/.05)));if(game.selection<2)begin(game.selection===1);else game.state=game.selection===2?'controls':'credits';}}}
  else if(game.state==='controls'||game.state==='credits'){if(input.hit('Escape','Enter','Space'))game.state=game.menuFrom;}
  else if(game.state==='paused'){if(input.hit('Escape','Space')){game.state='playing';resumed=true;}if(input.hit('ArrowDown','KeyS'))game.selection=(game.selection+1)%5;if(input.hit('ArrowUp','KeyW'))game.selection=(game.selection+4)%5;if(input.hit('Enter')){if(game.selection===0){game.state='playing';resumed=true;}else if(game.selection===1){game.state='map';game.menuFrom='paused';}else if(game.selection===2)writeSave(player,missions.progress);else if(game.selection===3){game.state='controls';game.menuFrom='paused';}else{game.state='title';}}if(input.hit('KeyM','Tab')){game.state='map';game.menuFrom='paused';}}
  else if(game.state==='map'){if(input.hit('Escape','Tab','KeyM')){game.state='playing';resumed=true;}camera.x+=input.direction().x*430*dt;camera.y+=input.direction().y*430*dt;}
  else if(game.state==='gameover'){if(input.hit('Enter','Space','KeyR'))begin(false);if(input.hit('Escape'))game.state='title';}
  if(game.state==='playing'&&!shotMode)simulate(dt);
  if(input.hit('Escape')&&game.state==='playing'&&!shotMode&&!resumed){game.state='paused';game.selection=0;}
  if(input.hit('Tab','KeyM')&&game.state==='playing'&&!shotMode&&!resumed){game.state='map';game.menuFrom='playing';}
  if(input.mouse.wheel&&player.vehicle){game.radioIndex=nextStation(game.radioIndex);game.radio=STATIONS[game.radioIndex];audio.setStation(game.radioIndex);playSfx(audio,'click');}
  if(input.hit('KeyH')&&player.vehicle)playSfx(audio,'horn');
  if(input.hit('Space')&&game.state==='playing'&&!player.vehicle&&!resumed){effects.add(player.x+Math.cos(player.angle)*20,player.y+Math.sin(player.angle)*20,'dust',0,.85);for(const ped of peds){if(Math.hypot(ped.x-player.x,ped.y-player.y)<45)ped.flee=2;}playSfx(audio,'impact');}
  game.hud={player,cars:game.cars,peds:game.peds,wanted:wanted.level,mission:missions.active,missionComplete:game.missionComplete,district:districtAt(player.x,player.y).name,clock:game.clock,radio:game.radio};
  if(game.state!=='map'){const mx=(input.mouse.x-renderer.width/2)/camera.zoom+camera.x,my=(input.mouse.y-renderer.height/2)/camera.zoom+camera.y;camera.update(player,{x:game.state==='playing'?mx-player.x:player.vx,y:game.state==='playing'?my-player.y:player.vy},Boolean(player.vehicle),dt);}camera.clamp(renderer.width/camera.zoom,renderer.height/camera.zoom);
  input.endFrame();
}
function simulate(dt){
  if(game.dialogue&&(input.hit('Enter','Space')||input.mouse.clicked))game.dialogue=null;
  const fire=p=>{shoot(p,game.bullets,random);wanted.add(.08);effects.add(p.x+Math.cos(p.angle)*28,p.y+Math.sin(p.angle)*28,'flash',p.angle,.16);playSfx(audio,'shot');};
  player.update(input,dt,camera,{width:renderer.width,height:renderer.height},city,fire);
  if(input.hit('KeyE')&&player.x>3420&&player.x<3630&&player.y<1200&&wanted.level){if(wanted.clear(player))playSfx(audio,'mission');}
  for(const ped of peds)ped.update(dt,null);
  updateGang(game.enemies,player,dt,game.bullets,random);
  for(let i=game.bullets.length-1;i>=0;i--){const b=game.bullets[i];b.x+=b.vx*dt;b.y+=b.vy*dt;b.life-=dt;if(b.life<=0){game.bullets.splice(i,1);continue;}if(b.owner==='player'){let hit=false;for(const enemy of game.enemies){if(enemy.health>0&&Math.hypot(enemy.x-b.x,enemy.y-b.y)<13){enemy.health-=b.damage;hit=true;break;}}if(!hit)for(const ped of peds){if(Math.hypot(ped.x-b.x,ped.y-b.y)<12){ped.flee=2;ped.angle=Math.atan2(ped.y-b.y,ped.x-b.x);wanted.add(.25);hit=true;break;}}if(hit)game.bullets.splice(i,1);}else if(b.owner==='gang'&&Math.hypot(player.x-b.x,player.y-b.y)<16){if(player.armor>0)player.armor=Math.max(0,player.armor-b.damage);else player.health=Math.max(0,player.health-b.damage);game.bullets.splice(i,1);}}
  updatePolice(game.police,player,dt);wanted.update(dt,game.police.some(c=>Math.hypot(c.x-player.x,c.y-player.y)<580));
  if(wanted.level>game.police.length&&game.police.length<5&&random()<dt*.15)game.police.push(spawnPolice(player,game.police.length));
  const event=missions.update(player,dt);if(event==='complete'){game.missionComplete=3.5;playSfx(audio,'mission');writeSave(player,missions.progress);if(missions.progress<MISSIONS_LENGTH)launchMission();else game.dialogue={character:{name:'MARISOL VALE',color:'#d47c69'},lines:['We made it to the other side.','Costa Vela can keep its secrets.']};}
  if(event==='failed')game.dialogue={character:{name:'MISSION FAILED',color:'#b85851'},lines:['The window closed.','Press R to regroup and try again.']};
  const minute=Math.floor(game.time*2)%60,hour=(Math.floor(game.hour)%12)||12;game.clock=`${hour}:${String(minute).padStart(2,'0')} ${game.hour%24>=12?'PM':'AM'}`;
  if(player.health<=0)game.state='gameover';
  if(input.hit('KeyR')&&missions.active===null&&missions.progress<MISSIONS_LENGTH){launchMission();writeSave(player,missions.progress);}
}
const MISSIONS_LENGTH=6;
function render(){renderer.draw(game);if(shotMode&&shotFrames<12)shotFrames++;if(shotMode&&shotFrames===12)window.__sunburn.ready=true;}
if(query.has('shot')){
  stageShot(game,query.get('shot'));window.__sunburn={ready:false,setShot(name){stageShot(game,name);shotFrames=0;this.ready=false;renderer.draw(game);},step(ms){game.time+=ms/1000;effects.update(ms/1000);renderer.draw(game);}};
  startLoop(()=>{},render,STEP);
}else{
  window.__sunburn={ready:true,setShot(name){stageShot(game,name);renderer.draw(game);},step(ms){game.time+=ms/1000;renderer.draw(game);}};
  startLoop(update,render,STEP);
}
window.addEventListener('blur',()=>{if(game.state==='playing'&&!shotMode)game.state='paused';});
