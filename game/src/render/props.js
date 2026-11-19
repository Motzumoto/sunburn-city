// SUNBURN CITY — draw camera-culled street furniture and custom scene dressing.
import { ROAD_X, ROAD_Y } from '../world/roads.js';
export function drawProps(ctx,game,camera){
  const left=camera.x-650,right=camera.x+650,top=camera.y-500,bottom=camera.y+500,night=game.hour>19||game.hour<6,p=game.player;let poolCount=0;
  for(const x of ROAD_X)for(const y of ROAD_Y){
    if(x<left-70||x>right+70||y<top-70||y>bottom+70)continue;
    streetlight(ctx,x-31,y-32,night&&poolCount++<8);streetlight(ctx,x+31,y+32,night&&poolCount++<8);
    if((x+y)%3===0)trafficLight(ctx,x+25,y-24,game.time);
    if((x+y)%4===0)hydrant(ctx,x-45,y+25);
  }
  if(game.shotScene==='city'){
    drawSkyline(ctx,p);
    cafeTable(ctx,p.x-150,p.y-138,0);cafeTable(ctx,p.x+150,p.y+138,1);
    streetlight(ctx,p.x-470,p.y-115,night&&poolCount++<8);streetlight(ctx,p.x+360,p.y+115,night&&poolCount++<8);
    trafficLight(ctx,p.x-410,p.y-88,game.time);trafficLight(ctx,p.x+410,p.y+88,game.time);
    for(let i=0;i<3;i++)scooter(ctx,p.x-260+i*240,p.y+83);
    bench(ctx,p.x-390,p.y+145);busShelter(ctx,p.x+335,p.y-150);
    drawZebra(ctx,p.x+245,p.y);
  }
  if(game.shotScene==='chase'){
    streetlight(ctx,p.x-275,p.y-155,poolCount++<8);streetlight(ctx,p.x+250,p.y+145,poolCount++<8);
    drawNeonPlacard(ctx,p.x-360,p.y-235,'VIVA','#ff7395');drawNeonPlacard(ctx,p.x+70,p.y-260,'MOTEL','#76eee0');drawNeonPlacard(ctx,p.x+300,p.y-190,'FLAMINGO HOTEL','#ffbd73');
    helicopter(ctx,p.x+255,p.y-285);
    for(let i=0;i<5;i++){const x=p.x-250+i*125;ctx.fillStyle='rgba(75,171,193,.27)';ctx.fillRect(x,p.y+105+(i%2)*18,92,4);}
    for(let i=0;i<7;i++){const x=p.x+185+i*17;ctx.fillStyle=i%2?'#ef7d63':'#fff0cf';ctx.fillRect(x,p.y-96,10,9);}
    ctx.fillStyle='#37464a';ctx.fillRect(p.x+180,p.y-100,126,5);ctx.fillRect(p.x+188,p.y-95,5,30);ctx.fillRect(p.x+293,p.y-95,5,30);
  }
  if(game.shotScene==='mission'){
    for(let i=0;i<5;i++)marketStall(ctx,p.x-260+i*130,p.y-68,i);
    stringLights(ctx,p.x-310,p.y-110,620);
    for(let i=0;i<4;i++){streetlight(ctx,p.x-260+i*175,p.y+70,poolCount++<8);cafeTable(ctx,p.x-220+i*145,p.y+18,i);}
    for(let i=0;i<6;i++){ctx.fillStyle='#283c45';ctx.fillRect(p.x-260+i*104,p.y-40,7,92);ctx.fillStyle='#47767b';ctx.fillRect(p.x-263+i*104,p.y+45,13,5);}
  }
  if(game.shotScene==='heist'){
    for(let i=0;i<4;i++)streetlight(ctx,p.x-330+i*220,p.y+260,false);
    for(let i=0;i<4;i++){const x=p.x-300+i*190;ctx.fillStyle='rgba(29,51,64,.28)';ctx.fillRect(x,p.y+155,95,28);}
  }
  if(game.shotScene!=='city'&&game.shotScene!=='mission'&&game.shotScene!=='chase'&&game.shotScene!=='heist'){
    for(let i=-2;i<=2;i++){cafeTable(ctx,p.x+i*110,p.y+145,Math.abs(i));if(i%2===0)scooter(ctx,p.x+i*130+45,p.y+180);}
    bench(ctx,p.x+310,p.y+90);busShelter(ctx,p.x-350,p.y-105);
  }
}
function streetlight(ctx,x,y,night){
  if(night){const pool=ctx.createRadialGradient(x,y+20,2,x,y+20,115);pool.addColorStop(0,'rgba(255,190,103,.17)');pool.addColorStop(1,'rgba(255,190,103,0)');ctx.fillStyle=pool;ctx.fillRect(x-115,y-95,230,230);}
  ctx.fillStyle='#34434a';ctx.fillRect(x-3,y-65,6,67);ctx.fillRect(x-3,y-65,29,4);
  ctx.fillStyle=night?'#ffd88f':'#fff0cf';ctx.beginPath();ctx.roundRect(x+20,y-69,12,8,3);ctx.fill();
}
function trafficLight(ctx,x,y,time){
  ctx.fillStyle='#38464a';ctx.fillRect(x,y-42,4,43);ctx.fillRect(x-13,y-44,32,8);ctx.fillStyle='#20343b';ctx.fillRect(x-12,y-43,30,7);
  const phase=Math.floor(time*2)%2;ctx.fillStyle=phase?'#54b89a':'#e66c58';ctx.beginPath();ctx.arc(x-5,y-40,2.2,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(x+10,y-40,2.2,0,Math.PI*2);ctx.fill();
}
function hydrant(ctx,x,y){ctx.fillStyle='#b84f45';ctx.fillRect(x-4,y-8,8,13);ctx.fillRect(x-7,y-5,14,4);ctx.fillStyle='#e7b28a';ctx.fillRect(x-3,y-10,6,3);}
function cafeTable(ctx,x,y,index){
  ctx.fillStyle='rgba(29,51,64,.24)';ctx.beginPath();ctx.ellipse(x+7,y+11,24,12,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#d9c39a';ctx.fillRect(x-2,y-2,4,22);ctx.fillStyle=index%2?'#ef7d63':'#fff0cf';ctx.beginPath();ctx.ellipse(x,y-4,24,12,0,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle='#fff0cf';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x-14,y-10);ctx.lineTo(x-10,y-16);ctx.moveTo(x+14,y+3);ctx.lineTo(x+10,y+9);ctx.stroke();
  ctx.fillStyle=index%2?'#ef7d63':'#2f8f8f';ctx.beginPath();ctx.moveTo(x,y-5);ctx.lineTo(x-23,y-25);ctx.lineTo(x+24,y-25);ctx.closePath();ctx.fill();ctx.fillStyle='#fff0cf';ctx.fillRect(x-1,y-25,2,20);
}
function marketStall(ctx,x,y,index){
  ctx.fillStyle='rgba(29,51,64,.3)';ctx.fillRect(x-34,y+22,72,8);ctx.fillStyle='#76594a';ctx.fillRect(x-34,y-13,5,39);ctx.fillRect(x+31,y-13,5,39);ctx.fillStyle='#e8b17f';ctx.fillRect(x-38,y-17,80,7);
  for(let i=0;i<8;i++){ctx.fillStyle=(i+index)%2?'#ef7d63':'#fff0cf';ctx.beginPath();ctx.moveTo(x-38+i*10,y-17);ctx.lineTo(x-28+i*10,y-17);ctx.lineTo(x-28+i*10,y-7);ctx.lineTo(x-33+i*10,y-4);ctx.lineTo(x-38+i*10,y-7);ctx.fill();}
}
function stringLights(ctx,x,y,width){
  ctx.strokeStyle='rgba(35,47,51,.9)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x,y-6);ctx.quadraticCurveTo(x+width/2,y+50,x+width,y-6);ctx.stroke();
  for(let i=0;i<11;i++){const lx=x+i*width/10,ly=y-6+Math.sin(i/10*Math.PI)*56;ctx.strokeStyle='#37464a';ctx.beginPath();ctx.moveTo(lx,ly-8);ctx.lineTo(lx,ly);ctx.stroke();ctx.fillStyle=i%2?'#ffd68e':'#ff9b79';ctx.beginPath();ctx.arc(lx,ly+2,4,0,Math.PI*2);ctx.fill();}
}
function drawNeonPlacard(ctx,x,y,label,color){
  ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=.2;ctx.fillStyle=color;ctx.fillRect(x-14,y-12,164,50);ctx.globalAlpha=1;ctx.fillStyle='#172c37';ctx.fillRect(x,y,136,25);ctx.strokeStyle=color;ctx.lineWidth=2;ctx.strokeRect(x,y,136,25);ctx.fillStyle=color;ctx.font='900 11px sans-serif';ctx.textAlign='center';ctx.fillText(label,x+68,y+17);ctx.restore();
}
function scooter(ctx,x,y){
  ctx.fillStyle='rgba(29,51,64,.28)';ctx.beginPath();ctx.ellipse(x,y+5,22,6,0,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#34454b';ctx.lineWidth=3;ctx.beginPath();ctx.arc(x-11,y+3,5,0,Math.PI*2);ctx.arc(x+13,y+3,5,0,Math.PI*2);ctx.stroke();ctx.fillStyle='#ef7d63';ctx.fillRect(x-9,y-7,20,7);ctx.strokeStyle='#fff0cf';ctx.beginPath();ctx.moveTo(x+10,y-6);ctx.lineTo(x+15,y-14);ctx.stroke();
}
function bench(ctx,x,y){
  ctx.fillStyle='rgba(29,51,64,.28)';ctx.fillRect(x-27,y+10,56,7);ctx.fillStyle='#755641';ctx.fillRect(x-26,y-3,52,10);ctx.fillStyle='#a57b55';ctx.fillRect(x-25,y-14,50,8);ctx.fillStyle='#41464a';ctx.fillRect(x-21,y+6,4,12);ctx.fillRect(x+17,y+6,4,12);
}
function busShelter(ctx,x,y){
  ctx.fillStyle='rgba(29,51,64,.2)';ctx.fillRect(x-39,y+28,84,8);ctx.fillStyle='rgba(91,162,165,.34)';ctx.fillRect(x-37,y-24,76,51);ctx.strokeStyle='#e2d4b8';ctx.lineWidth=3;ctx.strokeRect(x-39,y-26,80,56);ctx.beginPath();ctx.moveTo(x-45,y-28);ctx.lineTo(x+45,y-28);ctx.stroke();ctx.fillStyle='#b87355';ctx.fillRect(x-35,y+7,70,6);ctx.fillStyle='#35464b';ctx.fillRect(x-31,y+12,4,13);ctx.fillRect(x+29,y+12,4,13);
}
function helicopter(ctx,x,y){
  ctx.fillStyle='rgba(20,33,40,.78)';ctx.beginPath();ctx.ellipse(x,y,20,7,-.15,0,Math.PI*2);ctx.fill();ctx.fillRect(x+14,y-2,24,3);ctx.fillRect(x-28,y-1,12,2);ctx.strokeStyle='#172c37';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x,y-7);ctx.lineTo(x,y-13);ctx.moveTo(x-22,y-13);ctx.lineTo(x+22,y-13);ctx.stroke();ctx.fillStyle='#ef7d63';ctx.beginPath();ctx.arc(x+5,y-7,2,0,Math.PI*2);ctx.fill();
}
function drawZebra(ctx,x,y){ctx.fillStyle='rgba(255,240,207,.86)';for(let i=0;i<9;i++)ctx.fillRect(x-46+i*12,y-78,7,26);}
function drawSkyline(ctx,p){
  for(let i=0;i<5;i++){
    const x=p.x-535+i*215,y=p.y-420,w=152+(i%2)*28,h=215+(i%3)*35;
    ctx.fillStyle='rgba(29,51,64,.28)';ctx.fillRect(x+18,y+16,w,h);
    ctx.fillStyle=i%3===0?'#6da9a7':i%3===1?'#d9b78e':'#8cb9b1';ctx.fillRect(x,y,w,h);
    ctx.fillStyle='rgba(255,240,207,.82)';ctx.fillRect(x-5,y,w+10,8);ctx.fillStyle='rgba(47,143,143,.62)';ctx.fillRect(x+8,y+12,w-16,h-18);
    ctx.strokeStyle='rgba(255,240,207,.78)';ctx.lineWidth=3;
    for(let wx=x+20;wx<x+w-8;wx+=31){ctx.beginPath();ctx.moveTo(wx,y+14);ctx.lineTo(wx,y+h-8);ctx.stroke();}
    for(let wy=y+34;wy<y+h-10;wy+=32){ctx.beginPath();ctx.moveTo(x+8,wy);ctx.lineTo(x+w-8,wy);ctx.stroke();}
    ctx.fillStyle='#ef7d63';ctx.fillRect(x+w*.24,y-12,w*.52,12);
  }
}
