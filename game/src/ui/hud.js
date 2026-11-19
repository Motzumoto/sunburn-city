// Purpose: compose the compact in-game HUD.
// Main exports: drawHud.
// Inputs: context, viewport and normalized HUD state.
// Outputs: status panels, objective, weapon, clock and minimap.
// Side effects: mutates canvas state and delegates to minimap.
// Notes: exact panel positions are retained for screenshot parity.
import { WEAPONS } from '../core/config.js';
import { objectiveText } from '../game/objectives.js';
import { drawMinimap } from './minimap.js';
export function drawHud(ctx,width,height,game){
  drawCashAndVitals(ctx,game);
  drawWeaponPanel(ctx,width,game.player);
  drawObjectiveStrip(ctx,width,game);
  drawClock(ctx,height,game.clock);
  drawWanted(ctx,width,game.wanted);
  drawRadio(ctx,height,game.radio);
  drawMinimap(ctx,game.player,game.cars,game.peds,width,game.police||[],game.mission);
  drawMissionBanner(ctx,width,height,game.missionComplete);
}
function drawCashAndVitals(ctx,game){
  ctx.fillStyle='rgba(10,29,37,.82)';
  ctx.beginPath();ctx.roundRect(25,25,228,98,14);ctx.fill();
  ctx.fillStyle='#f0c482';ctx.font='900 11px sans-serif';
  ctx.fillText('COSTA VELA  ·  '+game.district,40,47);
  ctx.fillStyle='#fff0d2';ctx.font='900 25px Georgia';
  ctx.fillText('$'+game.player.money.toLocaleString(),40,78);
  bar(ctx,40,91,178,7,game.player.health/100,'#d86657');
  bar(ctx,40,103,178,5,game.player.armor/100,'#64b9b1');
}
function drawWeaponPanel(ctx,width,player){
  ctx.fillStyle='rgba(10,29,37,.82)';
  ctx.beginPath();ctx.roundRect(width-272,212,226,50,12);ctx.fill();
  ctx.fillStyle='#f4ce98';ctx.font='900 12px sans-serif';
  ctx.fillText(WEAPONS[player.weapon].name,width-254,232);
  ctx.fillStyle='#fff';ctx.font='700 16px sans-serif';
  ctx.fillText(`${player.mag[player.weapon]} / ${player.ammo[player.weapon]}`,width-254,251);
}
function drawObjectiveStrip(ctx,width,game){
  ctx.fillStyle='rgba(10,29,37,.8)';
  ctx.beginPath();ctx.roundRect(width*.28,25,width*.44,45,11);ctx.fill();
  ctx.fillStyle='#fff0d5';ctx.font='800 12px sans-serif';
  ctx.textAlign='center';
  ctx.fillText(objectiveText(game.mission,game.player),width*.5,53);
  ctx.textAlign='left';
}
function drawClock(ctx,height,clock){
  ctx.fillStyle='#fff0d6';ctx.font='800 17px sans-serif';
  ctx.fillText(clock,26,height-28);
}
function drawWanted(ctx,width,wanted){
  ctx.fillStyle='#f4a16f';ctx.font='900 21px Georgia';
  for(let star=0;star<wanted;star++)ctx.fillText('★',width-266+star*27,199);
  if(wanted===0){
    ctx.fillStyle='#e7d2ad';ctx.font='700 10px sans-serif';
    ctx.fillText('NO HEAT',width-263,199);
  }
}
function drawRadio(ctx,height,radio){
  ctx.fillStyle='rgba(10,29,37,.7)';
  ctx.beginPath();ctx.roundRect(28,height-75,156,34,10);ctx.fill();
  ctx.fillStyle='#f0bf8a';ctx.font='700 11px sans-serif';
  ctx.fillText('♫  '+radio,42,height-53);
}
function drawMissionBanner(ctx,width,height,remaining){
  if(remaining<=0)return;
  ctx.fillStyle=`rgba(255,231,184,${Math.min(1,remaining)})`;
  ctx.textAlign='center';ctx.font='900 34px Georgia';
  ctx.fillText('JOB COMPLETE',width/2,height*.25);
  ctx.textAlign='left';
}
function bar(ctx,x,y,w,h,value,color){ctx.fillStyle='rgba(255,255,255,.16)';ctx.beginPath();ctx.roundRect(x,y,w,h,h/2);ctx.fill();ctx.fillStyle=color;ctx.beginPath();ctx.roundRect(x,y,w*Math.max(0,value),h,h/2);ctx.fill();}
