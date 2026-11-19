// Purpose: draw a circular, player-centered city map.
// Main exports: drawMinimap.
// Inputs: context, entities, viewport and active mission.
// Outputs: clipped roads, points of interest and compass pixels.
// Side effects: mutates canvas clipping and transform state.
// Notes: the minimap is fixed at width-105, y=112.
import { ROAD_X, ROAD_Y } from '../world/roads.js';
export function drawMinimap(ctx,player,cars,peds,width,police=[],mission=null){
  const x=width-105,y=112,r=77;ctx.save();ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.clip();ctx.fillStyle='#529a91';ctx.fillRect(x-r,y-r,r*2,r*2);
  const scale=.09;ctx.save();ctx.translate(x-player.x*scale,y-player.y*scale);ctx.scale(scale,scale);ctx.fillStyle='#374952';for(const rx of ROAD_X)ctx.fillRect(rx-13,0,26,4200);for(const ry of ROAD_Y)ctx.fillRect(0,ry-13,4200,26);ctx.fillStyle='#b8aa84';ctx.fillRect(0,3810,4200,390);ctx.fillStyle='#248087';ctx.fillRect(0,3880,4200,320);
  for(const car of cars){ctx.fillStyle=car.police?'#fff':car.color;ctx.fillRect(car.x-14,car.y-9,28,18);}for(const car of police){ctx.fillStyle='#fff';ctx.fillRect(car.x-18,car.y-12,36,24);}for(const p of peds){ctx.fillStyle='#ffd2a6';ctx.fillRect(p.x-5,p.y-5,10,10);}if(mission){ctx.fillStyle='#ff9f70';ctx.beginPath();ctx.arc(mission.target.x,mission.target.y,23,0,Math.PI*2);ctx.fill();}ctx.restore();
  ctx.fillStyle='#fff0bd';ctx.beginPath();ctx.moveTo(x,y-14);ctx.lineTo(x-7,y+8);ctx.lineTo(x,y+4);ctx.lineTo(x+7,y+8);ctx.fill();ctx.strokeStyle='rgba(255,235,195,.8)';ctx.lineWidth=3;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.stroke();ctx.fillStyle='#fff3d3';ctx.font='800 10px sans-serif';ctx.textAlign='center';ctx.fillText('N',x,y-r+12);ctx.restore();
}
