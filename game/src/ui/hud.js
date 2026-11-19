// Compact coastal HUD: cash, health, ammo, objective, clock, radio and wanted stars.
import { WEAPONS } from '../core/config.js';
import { objectiveText } from '../game/objectives.js';
import { drawMinimap } from './minimap.js';
export function drawHud(ctx,width,height,game){
  ctx.fillStyle='rgba(10,29,37,.82)';ctx.beginPath();ctx.roundRect(25,25,228,98,14);ctx.fill();ctx.fillStyle='#f0c482';ctx.font='900 11px sans-serif';ctx.fillText('COSTA VELA  ·  '+game.district,40,47);ctx.fillStyle='#fff0d2';ctx.font='900 25px Georgia';ctx.fillText('$'+game.player.money.toLocaleString(),40,78);bar(ctx,40,91,178,7,game.player.health/100,'#d86657');bar(ctx,40,103,178,5,game.player.armor/100,'#64b9b1');
  ctx.fillStyle='rgba(10,29,37,.82)';ctx.beginPath();ctx.roundRect(width-272,212,226,50,12);ctx.fill();ctx.fillStyle='#f4ce98';ctx.font='900 12px sans-serif';ctx.fillText(WEAPONS[game.player.weapon].name, width-254,232);ctx.fillStyle='#fff';ctx.font='700 16px sans-serif';ctx.fillText(`${game.player.mag[game.player.weapon]} / ${game.player.ammo[game.player.weapon]}`,width-254,251);
  ctx.fillStyle='rgba(10,29,37,.8)';ctx.beginPath();ctx.roundRect(width*.28,25,width*.44,45,11);ctx.fill();ctx.fillStyle='#fff0d5';ctx.font='800 12px sans-serif';ctx.textAlign='center';ctx.fillText(objectiveText(game.mission,game.player),width*.5,53);ctx.textAlign='left';
  ctx.fillStyle='#fff0d6';ctx.font='800 17px sans-serif';ctx.fillText(game.clock,26,height-28);
  ctx.fillStyle='#f4a16f';ctx.font='900 21px Georgia';for(let i=0;i<game.wanted;i++)ctx.fillText('★',width-266+i*27,199);if(game.wanted===0){ctx.fillStyle='#e7d2ad';ctx.font='700 10px sans-serif';ctx.fillText('NO HEAT',width-263,199);}
  ctx.fillStyle='rgba(10,29,37,.7)';ctx.beginPath();ctx.roundRect(28,height-75,156,34,10);ctx.fill();ctx.fillStyle='#f0bf8a';ctx.font='700 11px sans-serif';ctx.fillText('♫  '+game.radio,42,height-53);
  drawMinimap(ctx,game.player,game.cars,game.peds,width,game.police||[],game.mission);
  if(game.missionComplete>0){ctx.fillStyle=`rgba(255,231,184,${Math.min(1,game.missionComplete)})`;ctx.textAlign='center';ctx.font='900 34px Georgia';ctx.fillText('JOB COMPLETE',width/2,height*.25);ctx.textAlign='left';}
}
function bar(ctx,x,y,w,h,value,color){ctx.fillStyle='rgba(255,255,255,.16)';ctx.beginPath();ctx.roundRect(x,y,w,h,h/2);ctx.fill();ctx.fillStyle=color;ctx.beginPath();ctx.roundRect(x,y,w*Math.max(0,value),h,h/2);ctx.fill();}
