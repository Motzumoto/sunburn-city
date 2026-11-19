// Screen-space status panels, wanted stars, minimap, vehicle speed and story dialogue.
import { FONT_STACK, DISPLAY_STACK } from '../core/config.js';
import { roundRectPath } from '../render/palette.js';
import { Minimap } from './minimap.js';
import { objectiveDistance } from './objective.js';

export class HUD {
  constructor() {
    this.minimap = new Minimap();
  }

  draw(ctx, game, width, height) {
    this.drawStatus(ctx, game);
    this.drawObjective(ctx, game, width);
    this.drawWanted(ctx, game, width);
    this.drawRadio(ctx, game, width);
    this.minimap.draw(ctx, game, width, height);
    if (game.player.inVehicle) this.drawSpeed(ctx, game.player.inVehicle, width, height);
    if (game.dialogue) this.drawDialogue(ctx, game.dialogue, width, height);
    this.drawPrompt(ctx, game, width, height);
  }

  drawStatus(ctx, game) {
    const p = game.player;
    panel(ctx, 22, 20, 238, 120);
    ctx.textAlign = 'left';
    ctx.fillStyle = '#fff1db';
    ctx.font = '800 18px ' + DISPLAY_STACK;
    ctx.fillText('$' + Math.floor(p.money).toLocaleString('en-US'), 38, 48);
    ctx.textAlign = 'right';
    ctx.fillStyle = '#c9d2d3';
    ctx.font = '600 12px ' + FONT_STACK;
    ctx.fillText(game.day.clockText(), 244, 46);
    ctx.textAlign = 'left';
    ctx.fillStyle = '#ffd276';
    ctx.font = '700 11px ' + FONT_STACK;
    ctx.fillText(game.city.districtAt(p.x, p.y).name.toUpperCase(), 38, 68);
    bar(ctx, 38, 82, 147, 8, p.health / 100, '#ec6256');
    ctx.fillStyle = '#c9d2d3';
    ctx.font = '600 9px ' + FONT_STACK;
    ctx.fillText('HEALTH', 191, 90);
    bar(ctx, 38, 98, 147, 6, p.armour / 100, '#52b8cc');
    ctx.fillText('ARMOUR', 191, 105);
    ctx.fillStyle = '#fff1db';
    ctx.font = '700 10px ' + FONT_STACK;
    ctx.fillText(p.weapon + '   ' + p.ammo + ' / ' + p.reserve, 38, 126);
  }

  drawObjective(ctx, game, width) {
    if (!game.objective) return;
    const w = Math.min(360, width * 0.38);
    const x = (width - w) / 2;
    panel(ctx, x, 20, w, 52);
    ctx.fillStyle = '#f6bf55';
    ctx.font = '800 9px ' + FONT_STACK;
    ctx.textAlign = 'left';
    ctx.fillText(game.objective.title.toUpperCase(), x + 15, 39);
    ctx.fillStyle = '#f4eee3';
    ctx.font = '600 12px ' + FONT_STACK;
    const distance = objectiveDistance(game);
    const suffix = distance === null ? '' : '  ·  ' + Math.round(distance) + ' m';
    ctx.fillText(game.objective.text + suffix, x + 15, 58, w - 30);
    if (game.missions.active && game.missions.active.id === 'the-tail') {
      ctx.fillStyle = 'rgba(255,255,255,0.18)';
      ctx.fillRect(x + 15, 64, w - 30, 3);
      ctx.fillStyle = game.missions.detection > 1.5 ? '#f26a5f' : '#f2c45c';
      ctx.fillRect(x + 15, 64, (w - 30) * Math.min(1, game.missions.detection / 2.8), 3);
    } else if (game.missions.active && game.missions.active.id === 'cold-delivery' && game.missions.stage === 1) {
      ctx.fillStyle = '#70d4c8';
      ctx.font = '700 8px ' + FONT_STACK;
      ctx.fillText('CARGO ' + Math.round(game.missions.cargo) + '%  ·  ' + Math.ceil(game.missions.timer) + ' SEC', x + 15, 68);
    } else if (game.missions.active && game.missions.active.id === 'boardwalk-hold-out' && game.missions.wave) {
      ctx.fillStyle = '#70d4c8';
      ctx.font = '700 8px ' + FONT_STACK;
      ctx.fillText('WAVE ' + game.missions.wave + ' / 3  ·  ' + game.missions.enemies.length + ' REMAIN', x + 15, 68);
    } else if (game.activities.race) {
      ctx.fillStyle = '#70d4c8';
      ctx.font = '700 8px ' + FONT_STACK;
      ctx.fillText('RACE CHECKPOINT ' + (game.activities.race.checkpoint + 1) + '  ·  ' + Math.ceil(game.activities.race.time) + ' SEC', x + 15, 68);
    }
  }

  drawWanted(ctx, game, width) {
    const count = game.wanted || 0;
    const x0 = width / 2 - 50;
    const flash = game.wantedSystem.flashing;
    for (let i = 0; i < 5; i++) {
      const active = i < count;
      const cx = x0 + i * 25;
      ctx.beginPath();
      for (let n = 0; n < 10; n++) {
        const r = n % 2 ? 5 : 10;
        const a = -Math.PI / 2 + n * Math.PI / 5;
        const px = cx + Math.cos(a) * r;
        const py = 94 + Math.sin(a) * r;
        if (n === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.closePath();
      if (active && !flash) {
        ctx.fillStyle = '#ffd45f';
        ctx.fill();
      } else {
        ctx.strokeStyle = active ? '#f7d06a' : 'rgba(255,244,218,0.38)';
        ctx.lineWidth = 1.8;
        ctx.stroke();
      }
    }
    if (game.wantedSystem.arrestProgress > 0 && count <= 2) {
      ctx.fillStyle = 'rgba(12,19,30,0.82)';
      ctx.fillRect(width / 2 - 48, 108, 96, 4);
      ctx.fillStyle = '#efc56b';
      ctx.fillRect(width / 2 - 48, 108, 96 * Math.min(1, game.wantedSystem.arrestProgress / 3), 4);
    }
  }

  drawRadio(ctx, game, width) {
    const x = width - 253;
    panel(ctx, x, 20, 170, 35);
    ctx.fillStyle = '#56d4c8';
    ctx.font = '800 9px ' + FONT_STACK;
    ctx.textAlign = 'left';
    ctx.fillText('RADIO', x + 11, 34);
    ctx.fillStyle = '#fff1db';
    ctx.font = '600 11px ' + FONT_STACK;
    ctx.fillText(game.radioStation || game.radio || 'COSTA FM  ·  98.4', x + 11, 48);
    if (game.radioText) {
      ctx.fillStyle = '#f2c45c';
      ctx.font = '500 9px ' + FONT_STACK;
      ctx.fillText(game.radioText, x - 40, 67, 250);
    }
  }

  drawSpeed(ctx, car, width, height) {
    const x = 28;
    const y = height - 108;
    panel(ctx, x, y, 154, 78);
    ctx.fillStyle = '#9ae1d3';
    ctx.font = '800 9px ' + FONT_STACK;
    ctx.textAlign = 'left';
    ctx.fillText('SPEED', x + 13, y + 20);
    ctx.fillStyle = '#fff4df';
    ctx.font = '900 31px ' + DISPLAY_STACK;
    ctx.fillText(String(Math.round(Math.abs(car.speed) * 0.62)).padStart(3, '0'), x + 12, y + 52);
    ctx.fillStyle = '#c9d2d3';
    ctx.font = '700 9px ' + FONT_STACK;
    ctx.fillText('MPH', x + 93, y + 49);
    bar(ctx, x + 13, y + 62, 126, 4, car.health / car.maxHealth, '#e98668');
  }

  drawDialogue(ctx, dialogue, width, height) {
    const boxW = Math.min(760, width - 48);
    const x = (width - boxW) / 2;
    const y = height - 172;
    panel(ctx, x, y, boxW, 140);
    ctx.fillStyle = '#d7a875';
    ctx.fillRect(x + 18, y + 19, 84, 84);
    ctx.fillStyle = '#3e3245';
    ctx.beginPath();
    ctx.arc(x + 60, y + 52, 23, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#e0aa83';
    ctx.beginPath();
    ctx.arc(x + 60, y + 49, 17, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1f2834';
    ctx.beginPath();
    ctx.arc(x + 60, y + 42, 18, Math.PI, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#25394a';
    ctx.fillRect(x + 38, y + 73, 44, 30);
    ctx.textAlign = 'left';
    ctx.fillStyle = '#f6bf55';
    ctx.font = '800 11px ' + FONT_STACK;
    ctx.fillText(dialogue.name.toUpperCase(), x + 124, y + 34);
    ctx.fillStyle = '#fff2df';
    ctx.font = '600 14px ' + FONT_STACK;
    ctx.fillText(dialogue.lines[0], x + 124, y + 62, boxW - 150);
    ctx.fillStyle = '#c8c0b7';
    ctx.font = '500 13px ' + FONT_STACK;
    ctx.fillText(dialogue.lines[1], x + 124, y + 88, boxW - 150);
    ctx.fillStyle = '#68d2c8';
    ctx.font = '700 9px ' + FONT_STACK;
    ctx.fillText('E   CONTINUE', x + boxW - 104, y + 120);
  }

  drawPrompt(ctx, game, width, height) {
    let label = '';
    const missionTarget = game.missions.currentTarget();
    if (missionTarget && Math.hypot(game.player.x - missionTarget.x, game.player.y - missionTarget.y) < 70) {
      const id = game.missions.active && game.missions.active.id;
      if (id === 'marina-job' && game.missions.stage === 0) label = 'E  STEAL THE VIENTO SS';
      else if (id === 'annex-break-in' && game.missions.stage === 1) label = 'E  TAKE THE LEDGER';
      else if (id === 'costa-trust-score' && game.missions.stage === 1) label = 'E  TAKE THE VAULT CASH';
    }
    if (!label) {
      const activity = game.activities.markers.find((m) =>
        Math.hypot(game.player.x - m.x, game.player.y - m.y) < 55);
      if (activity) label = 'E  ' + activity.label;
    }
    if (!label && !game.player.inVehicle) {
      const car = game.traffic.cars.find((v) =>
        !v.destroyed && Math.hypot(game.player.x - v.x, game.player.y - v.y) < 60);
      if (car) label = car.named ? 'E  ' + car.named : 'E  ENTER VEHICLE';
    }
    if (!label) return;
    const w = Math.min(290, width - 32);
    const x = (width - w) / 2;
    const y = height - 220;
    panel(ctx, x, y, w, 32);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#fff0d6';
    ctx.font = '800 10px ' + FONT_STACK;
    ctx.fillText(label, width / 2, y + 20);
  }
}

function panel(ctx, x, y, w, h) {
  roundRectPath(ctx, x, y, w, h, 5);
  ctx.fillStyle = 'rgba(13,20,31,0.82)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,240,215,0.18)';
  ctx.lineWidth = 1;
  ctx.stroke();
}

function bar(ctx, x, y, w, h, value, color) {
  roundRectPath(ctx, x, y, w, h, h / 2);
  ctx.fillStyle = 'rgba(255,255,255,0.14)';
  ctx.fill();
  roundRectPath(ctx, x, y, w * Math.max(0, Math.min(1, value)), h, h / 2);
  ctx.fillStyle = color;
  ctx.fill();
}
