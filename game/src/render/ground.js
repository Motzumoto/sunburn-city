// Purpose: paint the city ground, streets and waterfront.
// Main exports: drawGround.
// Inputs: context, camera bounds, wet and pier flags.
// Outputs: tiled and culling-aware ground pixels.
// Side effects: mutates canvas path and fill state.
// Notes: road and shoreline constants are shared with world generation.
import { ROAD_X, ROAD_Y, STREETS } from '../world/roads.js';
export function drawGround(ctx,camera,wet=false,pier=false){
  const left=camera.x-850,top=camera.y-620,right=camera.x+850,bottom=camera.y+620;
  ctx.fillStyle='#d9c39a';ctx.fillRect(0,0,4200,4200);
  ctx.fillStyle='#278b91';ctx.fillRect(0,3810,4200,390);ctx.fillRect(3980,0,220,3810);
  ctx.fillStyle='#40aeb0';ctx.fillRect(3050,200,930,830);
  for(let i=0;i<24;i++){const y=240+i*32;if(y<top-5||y>bottom+5)continue;ctx.strokeStyle=i%2?'rgba(230,250,226,.13)':'rgba(220,246,216,.08)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(3060,y);ctx.lineTo(3970,y+8);ctx.stroke();}
  ctx.fillStyle='#e2c89c';ctx.fillRect(2120,3500,1860,310);ctx.fillStyle='#fff0cf';ctx.fillRect(3972,0,8,3810);ctx.fillRect(2140,3804,1840,6);
  ctx.strokeStyle='rgba(255,245,218,.75)';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(3978,0);ctx.quadraticCurveTo(3948,130,3978,270);ctx.stroke();
  ctx.fillStyle='#6b9b82';ctx.fillRect(900,1900,510,260);ctx.fillStyle='#9bb581';ctx.fillRect(930,1930,450,200);
  for(const x of ROAD_X){
    if(x<left-90||x>right+90)continue;
    ctx.fillStyle='#d3c09d';ctx.fillRect(x-24,0,48,3810);ctx.fillStyle='#9b896d';ctx.fillRect(x-18,0,36,3810);ctx.fillStyle='#353b42';ctx.fillRect(x-12,0,24,3810);
    ctx.fillStyle='#d8c8a9';ctx.fillRect(x-1,0,2,3810);
    for(let y=Math.max(50,Math.floor(top/68)*68);y<Math.min(3810,bottom+68);y+=68){ctx.fillStyle='#fff0cf';ctx.fillRect(x-6,y,2,26);}
    for(let y=Math.max(0,Math.floor(top/48)*48);y<Math.min(3810,bottom+48);y+=48){ctx.strokeStyle='rgba(88,76,61,.19)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x-22,y);ctx.lineTo(x-14,y);ctx.stroke();ctx.beginPath();ctx.moveTo(x+14,y+24);ctx.lineTo(x+22,y+24);ctx.stroke();}
  }
  for(const y of ROAD_Y){
    if(y<top-100||y>bottom+100||y>3810)continue;
    ctx.fillStyle='#d3c09d';ctx.fillRect(0,y-24,4200,48);ctx.fillStyle='#9b896d';ctx.fillRect(0,y-18,4200,36);ctx.fillStyle='#353b42';ctx.fillRect(0,y-12,4200,24);ctx.fillStyle='#d8c8a9';ctx.fillRect(0,y-1,4200,2);
    for(let x=Math.max(40,Math.floor(left/68)*68);x<Math.min(4200,right+68);x+=68){ctx.fillStyle='#fff0cf';ctx.fillRect(x,y-6,27,2);}
    for(let x=Math.max(0,Math.floor(left/48)*48);x<Math.min(4200,right+48);x+=48){ctx.strokeStyle='rgba(88,76,61,.18)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x,y-22);ctx.lineTo(x+24,y-22);ctx.stroke();ctx.beginPath();ctx.moveTo(x+24,y+22);ctx.lineTo(x+48,y+22);ctx.stroke();}
    ctx.fillStyle='rgba(38,42,45,.4)';for(let x=Math.max(0,Math.floor(left/340)*340+170);x<Math.min(4200,right+340);x+=340){ctx.beginPath();ctx.ellipse(x,y,10,6,0,0,Math.PI*2);ctx.fill();ctx.strokeStyle='rgba(205,194,163,.45)';ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(x,y,7,4,0,0,Math.PI*2);ctx.stroke();}
  }
  if(top<3670&&bottom>3450&&right>2100&&left<3980){
    ctx.fillStyle='#d2c09f';ctx.fillRect(2100,3450,1880,230);ctx.fillStyle='#9d8b70';ctx.fillRect(2100,3472,1880,186);ctx.fillStyle='#363c42';ctx.fillRect(2100,3480,1880,170);
    ctx.fillStyle='#fff0cf';ctx.fillRect(2100,3474,1880,4);ctx.fillRect(2100,3654,1880,4);
    for(let x=Math.max(2100,Math.floor(left/64)*64);x<Math.min(3980,right+64);x+=64){ctx.fillStyle='rgba(255,240,207,.7)';ctx.fillRect(x,3512,30,3);ctx.fillRect(x+32,3616,30,3);}
    for(let x=Math.max(2100,Math.floor(left/180)*180);x<Math.min(3980,right+180);x+=180){ctx.fillStyle='#29363b';ctx.fillRect(x,3468,36,5);for(let slot=0;slot<5;slot++)ctx.fillRect(x+3+slot*7,3469,3,3);ctx.fillRect(x,3660,36,5);}
    for(let x=2100;x<3980;x+=210){ctx.fillStyle='#fff0cf';ctx.fillRect(x,3480,5,170);for(let k=0;k<6;k++)ctx.fillRect(x+10+k*9,3488,5,28);}
  }
  if(right>1220&&left<1830&&bottom>690&&top<1160){
    ctx.fillStyle='#c9b991';ctx.fillRect(1220,690,610,470);ctx.fillStyle='#d9c39a';ctx.fillRect(1240,710,570,430);
    ctx.strokeStyle='rgba(117,101,77,.26)';ctx.lineWidth=2;
    for(let x=1260;x<1810;x+=48){ctx.beginPath();ctx.moveTo(x,710);ctx.lineTo(x,1140);ctx.stroke();}
    for(let y=730;y<1140;y+=48){ctx.beginPath();ctx.moveTo(1240,y);ctx.lineTo(1810,y);ctx.stroke();}
    ctx.fillStyle='#f0dfb8';ctx.fillRect(1260,720,20,7);ctx.fillRect(1770,1120,20,7);
  }
  if(pier&&right>3000&&left<3980&&bottom>3260&&top<3820){
    ctx.fillStyle='#278b91';ctx.fillRect(3000,3260,980,550);
    for(let i=0;i<20;i++){const y=3280+i*22;if(y<top-4||y>bottom+4)continue;ctx.strokeStyle='rgba(219,245,222,.12)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(3010,y);ctx.lineTo(3970,y+7);ctx.stroke();}
    ctx.strokeStyle='#fff0cf';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(3010,3500);ctx.quadraticCurveTo(3480,3487,3970,3500);ctx.stroke();
    ctx.fillStyle='#b38d65';ctx.fillRect(3040,3505,900,255);ctx.fillStyle='#d2ad7c';ctx.fillRect(3040,3512,900,240);
    for(let x=Math.max(3040,Math.floor(left/34)*34);x<Math.min(3940,right+34);x+=34){ctx.strokeStyle='rgba(99,70,50,.34)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x,3512);ctx.lineTo(x,3752);ctx.stroke();}
    ctx.fillStyle='#725b47';for(let x=3060;x<3940;x+=110){ctx.fillRect(x,3515,9,240);}
  }
  for(const x of ROAD_X)for(const y of ROAD_Y){if(x>left&&x<right&&y>top&&y<bottom){for(let i=0;i<7;i++){ctx.fillStyle='#fff0cf';ctx.fillRect(x-44+i*13,y-48,7,3);ctx.fillRect(x-44+i*13,y+45,7,3);}}}
  for(const street of STREETS){if(street.x<left-80||street.x>right+80||street.y<top-80||street.y>bottom+80)continue;ctx.save();ctx.translate(street.x,street.y);if(!street.horizontal)ctx.rotate(-Math.PI/2);ctx.fillStyle='rgba(255,240,207,.82)';ctx.font='700 10px sans-serif';ctx.fillText(street.name,0,0);ctx.restore();}
  if(wet){
    ctx.save();ctx.globalAlpha=.35;
    for(let i=0;i<18;i++){const x=camera.x-600+i*68,y=camera.y+((i%5)-2)*62;ctx.fillStyle=i%3?'#5ea4a6':'#df9c79';ctx.fillRect(x,y,34+(i%4)*13,3);}
    ctx.restore();
  }
  ctx.fillStyle='rgba(255,244,208,.58)';ctx.font='700 12px sans-serif';ctx.fillText('COSTA VELA  ·  PACIFIC COAST',2200,3785);
}
