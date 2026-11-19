// Deterministic staged moments composed from the actual city and game entities.
import { createCar, VEHICLES } from '../entities/vehicle.js';
import { DISTRICTS } from '../world/districts.js';

export function stageShot(game,name){
  game.state='playing';game.time=0;game.shotScene=name;game.dialogue=null;game.missions.active=null;game.missions.progress=0;game.missionComplete=0;game.police=[];game.officers=[];game.bullets=[];game.effects.items.length=0;game.wanted=0;game.hour=17.4;
  const p=game.player;p.health=100;p.armor=68;p.money=18450;p.weapon=0;p.x=2000;p.y=1700;p.vehicle=null;
  for(let i=0;i<game.cars.length;i++){const car=game.cars[i];car.x=80;car.y=80;car.speed=0;car.occupied=false;car.color=VEHICLES[i%VEHICLES.length].color;}
  for(const ped of game.peds){ped.x=80;ped.y=80;ped.flee=0;}
  if(name==='city'){
    game.hour=16.7;p.x=2490;p.y=3565;frameCamera(game,1.15);p.vehicle=game.cars[0];placeCar(p.vehicle,p.x,p.y,0);p.vehicle.occupied=true;
    game.hud.radio='PALM FM 88.4';game.hud.clock='5:42 PM';
    for(let i=1;i<20;i++){const lane=i%2? -7:7;placeCar(game.cars[i],p.x-760+i*78,p.y+lane,i%2?0:Math.PI);game.cars[i].speed=42+(i%5)*8;}
    for(let i=0;i<56;i++){const column=i%28,row=Math.floor(i/28);const walker=game.peds[i];walker.x=p.x-620+column*46+(row?18:0);walker.y=p.y+(row?42:-42);walker.angle=row?Math.PI:0;}
  }
  if(name==='chase'){
    game.hour=20.4;p.x=2820;p.y=1840;frameCamera(game,1.2);p.vehicle=game.cars[0];placeCar(p.vehicle,p.x,p.y,0);p.vehicle.speed=325;p.vehicle.occupied=true;
    game.wanted=3;game.missions.active={title:'NO BRAKES',type:'chase',target:{x:3270,y:1830}};game.hud.radio='NEON TIDE 104.2';game.hud.clock='8:24 PM';
    for(let i=0;i<2;i++){const c=createCar(p.x-100-i*95,p.y+(i===0?38:-34),0,i,true);c.speed=260;c.occupied=true;game.police.push(c);}
    for(const side of [-1,1])game.effects.add(p.x-160,p.y+side*11,'skid',0);
    game.effects.add(p.x-95,p.y+4,'smoke');game.effects.add(p.x-125,p.y+8,'smoke');
  }
  if(name==='mission'){
    game.hour=21.2;p.x=3220;p.y=3580;frameCamera(game,1.2);p.angle=-.24;game.wanted=1;game.hud.radio='VELA TALK 92.1';game.hud.clock='9:18 PM';
    game.missions.active={title:'PIER 9',type:'story',target:{x:p.x+360,y:p.y-100}};
    game.dialogue={character:{name:'MARISOL VALE',color:'#d47c69'},lines:['The tide hides more than footprints.','Pier 9. Midnight. Bring nobody.']};
    const crowd=[[-150,-60],[-130,-140],[-30,-190],[85,-180],[165,-115],[185,-20],[160,50],[-165,45]];
    crowd.forEach(([dx,dy],i)=>{const walker=game.peds[i];walker.x=p.x+dx;walker.y=p.y+dy;walker.angle=i*Math.PI/4;});
  }
  if(name==='heist'){
    game.hour=12.3;p.x=1645;p.y=920;frameCamera(game,1.15);p.angle=-2.55;game.wanted=4;game.hud.clock='12:18 PM';game.hud.radio='PALM FM 88.4';
    game.missions.active={title:'HIGH TIDE',type:'heist',target:{x:1500,y:750}};
    placeCar(game.cars[0],p.x-48,p.y-62,.08);game.cars[0].color='#343f46';
    const cruiserSpots=[[1435,790,.2],[1585,745,2.4],[1510,960,-1.15]];
    cruiserSpots.forEach(([x,y,a],i)=>{const c=createCar(x,y,a,i,true);game.police.push(c);});
    const officerSpots=[[1485,760],[1605,815],[1535,930],[1400,850]];
    officerSpots.forEach(([x,y],i)=>{const angle=Math.atan2(p.y-y,p.x-x);game.officers.push({x,y,angle,seed:i});const muzzleX=x+Math.cos(angle)*24,muzzleY=y+Math.sin(angle)*24;game.effects.add(muzzleX,muzzleY,'flash',angle);game.effects.add(muzzleX-5,muzzleY+6,'casing',angle+1.1);});
    game.effects.add(p.x+Math.cos(p.angle)*27,p.y+Math.sin(p.angle)*27,'flash',p.angle);
    game.effects.add(p.x+Math.cos(p.angle)*16-10,p.y+Math.sin(p.angle)*16+5,'casing',p.angle+1);
    game.effects.add(1510,798,'dust');game.effects.add(1550,830,'smoke');game.effects.add(1450,900,'smoke');
    game.effects.add(1515,790,'spark',.2);game.effects.add(1580,850,'spark',-.5);game.effects.add(1460,875,'spark',.8);
    game.bullets.push({x:1510,y:780,vx:260,vy:85,life:.45,owner:'police'},{x:1590,y:840,vx:-210,vy:40,life:.45,owner:'police'},{x:1500,y:885,vx:200,vy:-85,life:.45,owner:'police'},{x:1580,y:870,vx:-230,vy:-75,life:.45,owner:'player'});
  }
  game.hud={player:p,cars:game.cars,police:game.police,peds:game.peds,wanted:game.wanted,mission:game.missions.active,missionComplete:0,district:DISTRICTS.find(d=>p.x>=d.x&&p.x<d.x+d.w&&p.y>=d.y&&p.y<d.y+d.h)?.name||'OLD TOWN',clock:game.hud.clock||'4:30 PM',radio:game.hud.radio||'PALM FM 88.4'};
  game.clock=game.hud.clock;return game;
}

function frameCamera(game,zoom){game.camera.zoom=zoom;game.camera.x=game.player.x;game.camera.y=game.player.y-(window.innerHeight||720)*.14/zoom;}
function placeCar(car,x,y,angle){car.x=x;car.y=y;car.angle=angle;car.occupied=false;}
