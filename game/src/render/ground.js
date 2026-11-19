// Painted city ground, beach, marina water, boulevards and crisp road markings.
import { ROAD_X, ROAD_Y, STREETS } from '../world/roads.js';
export function drawGround(ctx, camera) {
  const left=camera.x-760,top=camera.y-520,right=camera.x+760,bottom=camera.y+520;
  ctx.fillStyle='#b9b08c';ctx.fillRect(0,0,4200,4200);
  ctx.fillStyle='#16727a';ctx.fillRect(0,3810,4200,390);
  ctx.fillStyle='#d7bd91';ctx.fillRect(2120,3500,2080,310);
  ctx.fillStyle='#77b8aa';ctx.fillRect(3050,200,1120,830);
  for(let i=0;i<24;i++){ctx.strokeStyle=`rgba(220,246,216,${.07+(i%3)*.03})`;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(3060,240+i*32);ctx.lineTo(4150,240+i*32);ctx.stroke();}
  ctx.fillStyle='#6b9b82';ctx.fillRect(900,1900,510,260);ctx.fillStyle='#9bb581';ctx.fillRect(930,1930,450,200);
  for(const x of ROAD_X){if(x<left-60||x>right+60)continue;ctx.fillStyle='#d5c9a9';ctx.fillRect(x-18,0,36,3810);ctx.fillStyle='#303d49';ctx.fillRect(x-12,0,24,3810);ctx.fillStyle='#e7d6a5';ctx.fillRect(x-1,0,2,3810);ctx.fillStyle='rgba(245,231,193,.8)';for(let y=70;y<3810;y+=68){ctx.fillRect(x-6,y,2,28);}}
  for(const y of ROAD_Y){if(y<top-55||y>bottom+55||y>3810)continue;ctx.fillStyle='#d5c9a9';ctx.fillRect(0,y-18,4200,36);ctx.fillStyle='#303d49';ctx.fillRect(0,y-12,4200,24);ctx.fillStyle='#e7d6a5';ctx.fillRect(0,y-1,4200,2);for(let x=45;x<4200;x+=68)ctx.fillRect(x,y-6,28,2);}
  ctx.fillStyle='#d9d3bb';
  for(const x of ROAD_X)for(const y of ROAD_Y){if(x>left&&x<right&&y>top&&y<bottom){for(let i=0;i<7;i++){ctx.fillRect(x-44+i*13,y-48,7,3);ctx.fillRect(x-44+i*13,y+45,7,3);}}}
  for(const street of STREETS){ctx.save();ctx.translate(street.x,street.y);if(!street.horizontal)ctx.rotate(-Math.PI/2);ctx.fillStyle='rgba(231,217,180,.82)';ctx.font='700 10px sans-serif';ctx.fillText(street.name,0,0);ctx.restore();}
  ctx.fillStyle='rgba(255,244,208,.42)';ctx.font='700 12px sans-serif';ctx.fillText('COSTA VELA  •  PACIFIC COAST',2200,3785);
}
