// Deterministic Costa Vela screenshot scenes assembled from live game entities.
import { createCar, VEHICLES } from '../entities/vehicle.js';
import { DISTRICTS } from '../world/districts.js';

export function stageShot(game,name){
  game.state='playing';game.time=0;game.shotScene=name;game.dialogue=null;game.shotContact=null;game.missions.active=null;game.missions.progress=0;game.missionComplete=0;game.police=[];game.officers=[];game.bullets=[];game.effects.items.length=0;game.wanted=0;game.hour=17.4;
  const p=game.player;p.health=100;p.armor=68;p.money=18450;p.weapon=0;p.x=2000;p.y=1700;p.vehicle=null;
  for(let i=0;i<game.cars.length;i++){const car=game.cars[i];car.x=80;car.y=80;car.speed=0;car.occupied=false;car.police=false;car.color=VEHICLES[i%VEHICLES.length].color;}
  for(const ped of game.peds){ped.x=80;ped.y=80;ped.flee=0;}
  if(name==='city'){
    game.hour=18.17;p.x=3715;p.y=3565;frameCamera(game,1.3);p.vehicle=game.cars[0];placeCar(p.vehicle,p.x,p.y,0);p.vehicle.color='#ef7d63';p.vehicle.speed=94;p.vehicle.occupied=true;
    game.hud.radio='PALM FM 88.4';game.hud.clock='5:42 PM';
    const slots=[-330,-120,120],lanes=[-64,-30,30,64];
    for(let i=1;i<=12;i++){const lane=i%4,slot=Math.floor((i-1)/4),x=p.x+slots[slot],car=game.cars[i];placeCar(car,x,p.y+lanes[lane],lane<2?0:Math.PI);car.speed=lane<2?0:24+slot*8;}
    for(let i=13;i<21;i++){const side=i%2?1:-1,car=game.cars[i];placeCar(car,p.x-300+Math.floor((i-13)/2)*200,p.y+side*112,side>0?Math.PI/2:-Math.PI/2);car.speed=0;}
    for(let i=0;i<18;i++){const column=i%9,row=Math.floor(i/9),walker=game.peds[i];walker.x=p.x-300+column*75+(row?38:0);walker.y=p.y+(row?118:-118);walker.angle=row?Math.PI:0;}
  }

  if(name==='chase'){
    game.hour=21.67;p.x=2820;p.y=1840;frameCamera(game,1.4);p.vehicle=game.cars[0];placeCar(p.vehicle,p.x,p.y,0);p.vehicle.speed=330;p.vehicle.color='#e8a88a';p.vehicle.occupied=true;
    game.wanted=3;game.missions.active={title:'NO BRAKES',type:'chase',target:{x:p.x+470,y:p.y}};game.hud.radio='NEON TIDE 104.2';game.hud.clock='9:40 PM';
    for(let i=0;i<3;i++){const c=createCar(i===2?p.x+330:p.x-90-i*90,p.y+(i===0?32:i===1?-32:0),i===2?Math.PI/2:0,i,true);c.speed=i===2?0:270;c.occupied=true;game.police.push(c);}
    game.effects.add(p.x-100,p.y+12,'glow',0,1.6);game.effects.add(p.x-165,p.y-34,'glow',0,1.6);
    game.effects.add(p.x-160,p.y+12,'skid',0,18);game.effects.add(p.x-160,p.y-8,'skid',0,18);
    game.effects.add(p.x-105,p.y+4,'smoke');game.effects.add(p.x-135,p.y+8,'smoke');
    game.effects.add(p.x+205,p.y-30,'spark',.6,.6);game.effects.add(p.x+218,p.y-22,'spark',-.35,.6);
  }

  if(name==='mission'){
    game.hour=21.33;p.x=3290;p.y=3700;frameCamera(game,1.4);game.camera.y+=55;p.angle=0;game.wanted=1;game.hud.radio='NEON TIDE 104.2';game.hud.clock='9:20 PM';
    game.missions.active={title:'PIER 9',type:'story',target:{x:p.x+365,y:p.y-78}};
    game.shotContact={x:p.x+105,y:p.y-12};
    game.dialogue={character:{name:'MARISOL VEGA',color:'#2f8f8f'},lines:['The tide hides more than footprints.','Pier 9. Midnight. Bring nobody.']};
    const crowd=[[-165,-32],[-155,-112],[-55,-170],[30,-185],[188,-130],[206,-42],[176,45],[-148,46],[-70,84],[18,82],[112,87],[238,35]];
    for(let i=0;i<crowd.length;i++){const walker=game.peds[i];walker.x=p.x+crowd[i][0];walker.y=p.y+crowd[i][1];walker.angle=i*Math.PI/6;}
  }

  if(name==='heist'){
    game.hour=15.5;p.x=1665;p.y=930;frameCamera(game,1.35);p.angle=-2.7;game.wanted=4;game.hud.clock='3:30 PM';game.hud.radio='PALM FM 88.4';
    game.missions.active={title:'HIGH TIDE',type:'heist',target:{x:1500,y:750}};
    placeCar(game.cars[0],p.x-38,p.y+28,-.18);game.cars[0].color='#343f46';game.cars[0].occupied=false;
    const cruiserSpots=[[1450,820,.2],[1570,760,2.4],[1518,1015,-1.15]];
    for(let i=0;i<cruiserSpots.length;i++){const spot=cruiserSpots[i],cruiser=createCar(spot[0],spot[1],spot[2],i,true);game.police.push(cruiser);}
    const officerSpots=[[1480,755],[1600,790],[1550,900],[1400,875],[1635,965]];
    for(let i=0;i<officerSpots.length;i++){
      const spot=officerSpots[i],angle=Math.atan2(p.y-spot[1],p.x-spot[0]);game.officers.push({x:spot[0],y:spot[1],angle,seed:i});
      const muzzleX=spot[0]+Math.cos(angle)*24,muzzleY=spot[1]+Math.sin(angle)*24;game.effects.add(muzzleX,muzzleY,'flash',angle,.22);game.effects.add(muzzleX-5,muzzleY+6,'casing',angle+1.1);game.effects.add(muzzleX+4,muzzleY+4,'spark',angle,.55);
    }
    game.effects.add(p.x+Math.cos(p.angle)*27,p.y+Math.sin(p.angle)*27,'flash',p.angle,.22);
    game.effects.add(p.x+Math.cos(p.angle)*16-10,p.y+Math.sin(p.angle)*16+5,'casing',p.angle+1,.55);
    game.effects.add(1510,798,'dust');game.effects.add(1550,830,'smoke');game.effects.add(1450,900,'smoke');
    game.effects.add(1515,790,'spark',.2,.6);game.effects.add(1580,850,'spark',-.5,.6);game.effects.add(1460,875,'spark',.8,.6);
    game.bullets.push({x:1510,y:780,vx:260,vy:85,life:.45,owner:'police'},{x:1590,y:840,vx:-210,vy:40,life:.45,owner:'police'},{x:1500,y:885,vx:200,vy:-85,life:.45,owner:'police'},{x:1580,y:870,vx:-230,vy:-75,life:.45,owner:'player'});
  }
  const district=name==='mission'?'PIER 9':DISTRICTS.find(d=>p.x>=d.x&&p.x<d.x+d.w&&p.y>=d.y&&p.y<d.y+d.h)?.name||'OLD TOWN';
  game.hud={player:p,cars:game.cars,police:game.police,peds:game.peds,wanted:game.wanted,mission:game.missions.active,missionComplete:0,district,clock:game.hud.clock||'4:30 PM',radio:game.hud.radio||'PALM FM 88.4'};
  game.clock=game.hud.clock;return game;
}

function frameCamera(game,zoom){game.camera.zoom=zoom;game.camera.x=game.player.x;game.camera.y=game.player.y-(window.innerHeight||720)*.16/zoom;}
function placeCar(car,x,y,angle){car.x=x;car.y=y;car.angle=angle;car.occupied=false;}
