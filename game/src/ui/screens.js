import { DISTRICTS } from '../world/districts.js';
import { hasSave, loadGame } from '../game/save.js';
import { roundRectPath } from '../render/palette.js';
import { FONT_STACK, DISPLAY_STACK } from '../core/config.js';

const COLORS = { ink: '#fff0d6', gold: '#f4c35d', teal: '#65d2c7', muted: '#bdc8c9' };

export class Screens {
  constructor() {
    this.cursor = 0;
    this.buttons = [];
    this.mapReturn = 'paused';
    this.infoReturn = 'title';
    this.volumeRect = null;
    this.muteRect = null;
    this.endState = null;
  }

  update(game) {
    const input = game.input;
    this.buttons = [];
    const endState = ['missionfailed', 'wasted', 'busted'].includes(game.state) ? game.state : null;
    if (endState && endState !== this.endState) this.cursor = 0;
    this.endState = endState;
    if (game.state === 'title') this.titleInput(game);
    else if (game.state === 'controls' || game.state === 'credits') {
      if (input.actionPressed('pause') || input.actionPressed('confirm') || input.mouse.leftPressed) {
        game.state = this.infoReturn; this.cursor = 0;
      }
    } else if (game.state === 'briefing') {
      if (input.actionPressed('confirm') || input.actionPressed('interact') || input.mouse.leftPressed) {
        game.audio.play('missionStart');
        game.missions.continueBriefing();
      }
    } else if (game.state === 'intro') {
      if (input.actionPressed('confirm') || input.actionPressed('interact') || input.mouse.leftPressed) {
        game.introIndex++;
        if (game.introIndex >= game.introCards.length) game.missions.start();
      }
    } else if (game.state === 'epilogue') {
      if (input.actionPressed('confirm') || input.actionPressed('interact') || input.mouse.leftPressed) {
        game.epilogueIndex++;
        if (game.epilogueIndex >= game.epilogueCards.length) game.finishEpilogue();
      }
    } else if (game.state === 'playing') {
      if (input.actionPressed('pause')) {
        game.state = 'paused';
        game.audio.setPaused(true);
        this.cursor = 0;
      } else if (input.pressed.has('KeyM')) {
        this.mapReturn = 'playing';
        game.state = 'map';
        game.audio.setPaused(true);
      }
    } else if (game.state === 'paused') this.pauseInput(game);
    else if (game.state === 'map') {
      if (input.actionPressed('pause') || input.pressed.has('KeyM')) {
        game.state = this.mapReturn;
        if (game.state === 'playing') game.audio.setPaused(false);
      }
    } else if (game.state === 'missioncomplete') {
      if (input.actionPressed('confirm') || input.actionPressed('interact') || input.mouse.leftPressed) {
        game.audio.play('ui');
        game.missions.continueAfterComplete();
      }
    } else if (game.state === 'missionfailed' || game.state === 'wasted' || game.state === 'busted') this.endInput(game);
  }

  titleInput(game) {
    const items = (hasSave() ? ['Continue', 'New Game', 'Controls', 'Credits'] : ['New Game', 'Controls', 'Credits']);
    this.makeButtons(game, items, game.width / 2, game.height * 0.44, 246, 40, 10);
    if (this.cursor >= items.length) this.cursor = items.length - 1;
    if (this.navigate(game, items.length)) this.activateTitle(game, items[this.cursor]);
  }

  activateTitle(game, item) {
    game.audio.start();
    game.audio.setPaused(false);
    game.audio.play('ui');
    if (item === 'Continue') {
      if (!loadGame(game)) { game.radio = 'NO VALID SAVE'; return; }
    } else if (item === 'New Game') game.newGame();
    else {
      this.infoReturn = 'title';
      game.state = item.toLowerCase();
    }
  }

  pauseInput(game) {
    const items = ['Resume', 'Map', 'Save Game', 'Controls', 'Quit to Title'];
    const cx = game.width / 2;
    this.makeButtons(game, items, cx, game.height * 0.36, 250, 38, 8);
    this.volumeRect = { x: cx - 125, y: game.height * 0.36 + items.length * 46 + 8, w: 250, h: 12 };
    this.muteRect = { x: cx - 125, y: this.volumeRect.y + 32, w: 250, h: 25 };
    if (game.input.actionPressed('pause')) {
      game.state = 'playing';
      game.audio.setPaused(false);
      return;
    }
    if (game.input.mouse.moved) this.cursor = this.hoveredIndex(game, items.length);
    if (game.input.mouse.left && inside(game.input.mouse, this.volumeRect)) {
      game.audio.setVolume((game.input.mouse.x - this.volumeRect.x) / this.volumeRect.w);
      return;
    }
    if (game.input.mouse.leftPressed) {
      if (inside(game.input.mouse, this.muteRect)) { game.audio.toggleMute(); return; }
    }
    if (this.navigate(game, items.length)) {
      const selected = items[this.cursor];
      game.audio.play('ui');
      if (selected === 'Resume') { game.state = 'playing'; game.audio.setPaused(false); }
      else if (selected === 'Map') { this.mapReturn = 'paused'; game.state = 'map'; }
      else if (selected === 'Save Game') { game.radio = game.saveGame() ? 'GAME SAVED' : 'SAVE FAILED'; }
      else if (selected === 'Controls') {
        this.infoReturn = 'paused';
        game.state = 'controls';
      }
      else if (selected === 'Quit to Title') { game.state = 'title'; game.audio.setPaused(true); this.cursor = 0; }
    }
  }

  endInput(game) {
    const items = ['Retry', 'Quit to Title'];
    this.makeButtons(game, items, game.width / 2, game.height * 0.61, 220, 42, 10);
    if (this.cursor >= items.length) this.cursor = 0;
    if (this.navigate(game, items.length)) {
      if (items[this.cursor] === 'Retry') {
        if (game.state === 'missionfailed' && game.missions.active) game.missions.retry();
        else game.retry();
        game.audio.setPaused(false);
      } else {
        game.state = 'title';
        game.audio.setPaused(true);
      }
    }
  }

  navigate(game, count) {
    const input = game.input;
    if (input.actionPressed('menuDown')) this.cursor = (this.cursor + 1) % count;
    if (input.actionPressed('menuUp')) this.cursor = (this.cursor + count - 1) % count;
    if (input.mouse.moved) {
      const i = this.hoveredIndex(game, count);
      if (i >= 0) this.cursor = i;
    }
    if (input.actionPressed('confirm') || input.mouse.leftPressed) {
      if (input.mouse.leftPressed) {
        const i = this.hoveredIndex(game, count);
        if (i >= 0) this.cursor = i;
      }
      return input.actionPressed('confirm') || this.hoveredIndex(game, count) >= 0;
    }
    return false;
  }

  hoveredIndex(game, count) {
    for (let i = 0; i < Math.min(count, this.buttons.length); i++) if (inside(game.input.mouse, this.buttons[i])) return i;
    return -1;
  }

  makeButtons(game, labels, centerX, top, width, height, gap) {
    this.buttons = labels.map((label, index) => {
      const r = { x: centerX - width / 2, y: top + index * (height + gap), w: width, h: height, label };
      return r;
    });
  }

  draw(ctx, game) {
    if (game.state === 'title') this.drawTitleMenu(ctx, game);
    else if (game.state === 'paused') this.drawPause(ctx, game);
    else if (game.state === 'map') this.drawMap(ctx, game);
    else if (game.state === 'controls' || game.state === 'credits') this.drawInfo(ctx, game);
    else if (game.state === 'briefing') game.dialogueUI.draw(ctx, game.dialogueCard, game.width, game.height);
    else if (game.state === 'intro') game.dialogueUI.drawTitle(ctx, game, game.introCards[game.introIndex], game.introIndex, game.introCards.length);
    else if (game.state === 'epilogue') game.dialogueUI.drawTitle(ctx, game, game.epilogueCards[game.epilogueIndex], game.epilogueIndex, game.epilogueCards.length);
    else if (game.state === 'missioncomplete') this.drawComplete(ctx, game);
    else if (game.state === 'missionfailed' || game.state === 'wasted' || game.state === 'busted') this.drawEndCard(ctx, game);
    if (game.state === 'playing' && game.missionBanner > 0) this.drawBanner(ctx, game);
  }

  drawTitleMenu(ctx, game) {
    const save = hasSave();
    const items = (save ? ['Continue', 'New Game', 'Controls', 'Credits'] : ['New Game', 'Controls', 'Credits']);
    ctx.textAlign = 'center';
    ctx.fillStyle = COLORS.ink;
    ctx.font = '900 60px ' + DISPLAY_STACK;
    ctx.shadowColor = 'rgba(255,132,81,0.65)';
    ctx.shadowBlur = 22;
    ctx.fillText('SUNBURN CITY', game.width / 2, game.height * 0.29);
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#f2c48e';
    ctx.font = '600 14px ' + FONT_STACK;
    ctx.fillText('COSTA VELA NEVER SLEEPS. IT ONLY TANS.', game.width / 2, game.height * 0.29 + 30);
    this.makeButtons(game, items, game.width / 2, game.height * 0.44, 246, 40, 10);
    this.drawButtons(ctx, this.buttons);
    ctx.fillStyle = 'rgba(255,239,215,0.75)';
    ctx.font = '500 10px ' + FONT_STACK;
    ctx.fillText('WASD / ARROWS MOVE & DRIVE  ·  E ENTER / EXIT  ·  MOUSE AIM / FIRE', game.width / 2, game.height - 34);
  }

  drawPause(ctx, game) {
    this.scrim(ctx, game);
    ctx.textAlign = 'center';
    ctx.fillStyle = COLORS.ink;
    ctx.font = '900 38px ' + DISPLAY_STACK;
    ctx.fillText('PAUSED', game.width / 2, game.height * 0.29);
    const items = ['Resume', 'Map', 'Save Game', 'Controls', 'Quit to Title'];
    const cx = game.width / 2;
    this.makeButtons(game, items, cx, game.height * 0.36, 250, 38, 8);
    this.drawButtons(ctx, this.buttons);
    this.volumeRect = { x: cx - 125, y: game.height * 0.36 + items.length * 46 + 8, w: 250, h: 12 };
    this.muteRect = { x: cx - 125, y: this.volumeRect.y + 32, w: 250, h: 25 };
    ctx.textAlign = 'left';
    ctx.fillStyle = COLORS.muted;
    ctx.font = '700 10px ' + FONT_STACK;
    ctx.fillText('VOLUME', this.volumeRect.x, this.volumeRect.y - 7);
    ctx.fillStyle = '#40515d';
    ctx.fillRect(this.volumeRect.x, this.volumeRect.y, this.volumeRect.w, this.volumeRect.h);
    ctx.fillStyle = COLORS.teal;
    ctx.fillRect(this.volumeRect.x, this.volumeRect.y, this.volumeRect.w * game.audio.volume, this.volumeRect.h);
    ctx.strokeStyle = COLORS.ink;
    ctx.strokeRect(this.volumeRect.x, this.volumeRect.y, this.volumeRect.w, this.volumeRect.h);
    this.drawButton(ctx, this.muteRect, game.audio.muted ? 'SOUND OFF  ·  CLICK TO UNMUTE' : 'SOUND ON  ·  CLICK TO MUTE', false);
  }

  drawMap(ctx, game) {
    this.scrim(ctx, game, 0.94);
    const r = { x: 54, y: 82, w: game.width - 108, h: game.height - 152 };
    ctx.fillStyle = '#d2c7a6';
    ctx.fillRect(r.x, r.y, r.w, r.h);
    ctx.fillStyle = '#19829c';
    ctx.fillRect(r.x, r.y + r.h * 0.87, r.w, r.h * 0.13);
    const sx = r.w / 5000;
    const sy = r.h / 5000;
    ctx.strokeStyle = 'rgba(255,246,225,0.55)';
    ctx.lineWidth = 2;
    for (const x of game.city.grid.xs) {
      ctx.beginPath(); ctx.moveTo(r.x + x * sx, r.y); ctx.lineTo(r.x + x * sx, r.y + r.h); ctx.stroke();
    }
    for (const y of game.city.grid.ys) {
      ctx.beginPath(); ctx.moveTo(r.x, r.y + y * sy); ctx.lineTo(r.x + r.w, r.y + y * sy); ctx.stroke();
    }
    for (const block of game.city.blocks) {
      if (block.kind === 'park') ctx.fillStyle = 'rgba(55,135,80,0.55)';
      else if (block.kind === 'landmark') ctx.fillStyle = 'rgba(238,191,91,0.75)';
      else ctx.fillStyle = 'rgba(49,67,81,0.65)';
      ctx.fillRect(r.x + block.x0 * sx, r.y + block.y0 * sy, Math.max(1, (block.x1 - block.x0) * sx), Math.max(1, (block.y1 - block.y0) * sy));
    }
    ctx.textAlign = 'center';
    ctx.font = '700 12px ' + FONT_STACK;
    for (const d of DISTRICTS) {
      const [x, y] = d.seeds[0];
      ctx.fillStyle = 'rgba(17,30,40,0.75)';
      ctx.fillText(d.name.toUpperCase(), r.x + x * sx, r.y + y * sy);
    }
    const point = (p, color, radius = 4) => {
      if (!p) return;
      ctx.fillStyle = color;
      ctx.beginPath(); ctx.arc(r.x + p.x * sx, r.y + p.y * sy, radius, 0, Math.PI * 2); ctx.fill();
    };
    for (const marker of game.activities.markers) point(marker, marker.type === 'race' || marker.type === 'vigilante' ? '#6fe0cf' : '#f5cb65', 3);
    if (game.missions.active) {
      for (let i = 0; i < game.missions.targets.length; i++) point(game.missions.targets[i], i === game.missions.stage ? '#ff704e' : '#e5c874', 4);
    }
    point(game.activityTarget, '#62d8c8', 5);
    point(game.objectiveTarget, '#ff704e', 6);
    point(game.player, '#ffffff', 5);
    ctx.textAlign = 'left';
    ctx.fillStyle = COLORS.ink;
    ctx.font = '900 24px ' + DISPLAY_STACK;
    ctx.fillText('COSTA VELA', 60, 48);
    ctx.font = '600 11px ' + FONT_STACK;
    ctx.fillText('GOLD  SERVICES  ·  TEAL  ACTIVITIES  ·  CORAL  OBJECTIVE  ·  WHITE  YOU', 62, game.height - 40);
    ctx.textAlign = 'right';
    ctx.fillText('ESC / M  CLOSE MAP', game.width - 58, 48);
  }

  drawInfo(ctx, game) {
    this.scrim(ctx, game, 0.96);
    ctx.textAlign = 'center';
    ctx.fillStyle = COLORS.ink;
    ctx.font = '900 36px ' + DISPLAY_STACK;
    ctx.fillText(game.state === 'controls' ? 'CONTROLS' : 'CREDITS', game.width / 2, game.height * 0.28);
    ctx.fillStyle = COLORS.muted;
    ctx.font = '600 14px ' + FONT_STACK;
    const lines = game.state === 'controls' ? [
      'WASD / ARROWS  Walk on foot and steer / accelerate in a car',
      'E  Enter or exit a nearby vehicle; interact with a nearby marker',
      'MOUSE  Aim and fire your pistol    ·    R  Reload on foot',
      'SPACE  Handbrake drift    ·    H  Horn    ·    TAB / R / WHEEL  Radio in a car',
      'ESC  Pause    ·    M  City map    ·    Click or ENTER  Select',
    ] : [
      'An original Costa Vela story',
      'Written and built for SUNBURN CITY',
      'All audio is synthesised live with Web Audio.',
      'No external assets, libraries, or network requests.',
    ];
    lines.forEach((line, i) => ctx.fillText(line, game.width / 2, game.height * 0.4 + i * 31));
    ctx.fillStyle = COLORS.teal;
    ctx.fillText('CLICK, ENTER, OR ESC TO RETURN', game.width / 2, game.height * 0.78);
  }

  drawComplete(ctx, game) {
    this.scrim(ctx, game, 0.84);
    ctx.textAlign = 'center';
    ctx.fillStyle = COLORS.gold;
    ctx.font = '900 13px ' + FONT_STACK;
    ctx.fillText('MISSION COMPLETE', game.width / 2, game.height * 0.39);
    ctx.fillStyle = COLORS.ink;
    ctx.font = '900 38px ' + DISPLAY_STACK;
    ctx.fillText(game.missionCompleteName || 'JOB DONE', game.width / 2, game.height * 0.48);
    ctx.fillStyle = COLORS.teal;
    ctx.font = '800 18px ' + FONT_STACK;
    ctx.fillText('+$' + (game.missionCompleteReward || 0).toLocaleString('en-US'), game.width / 2, game.height * 0.54);
    ctx.fillStyle = COLORS.muted;
    ctx.font = '600 12px ' + FONT_STACK;
    ctx.fillText('ENTER OR CLICK  ·  CONTINUE', game.width / 2, game.height * 0.63);
  }

  drawEndCard(ctx, game) {
    this.scrim(ctx, game, 0.93);
    const failed = game.state === 'missionfailed';
    const title = failed ? 'MISSION FAILED' : game.state === 'busted' ? 'BUSTED' : 'WASTED';
    ctx.textAlign = 'center';
    ctx.fillStyle = game.state === 'busted' ? '#f0d7a1' : '#f16b60';
    ctx.font = '900 58px ' + DISPLAY_STACK;
    ctx.fillText(title, game.width / 2, game.height * 0.4);
    ctx.fillStyle = COLORS.ink;
    ctx.font = '600 14px ' + FONT_STACK;
    ctx.fillText(failed ? game.missionFailedReason : game.endReason || 'You were taken out.', game.width / 2, game.height * 0.49);
    if (!failed) {
      ctx.fillStyle = COLORS.muted;
      ctx.font = '600 11px ' + FONT_STACK;
      ctx.fillText('Retry fee: $150', game.width / 2, game.height * 0.54);
    }
    const items = ['Retry', 'Quit to Title'];
    this.makeButtons(game, items, game.width / 2, game.height * 0.61, 220, 42, 10);
    this.drawButtons(ctx, this.buttons);
  }

  drawBanner(ctx, game) {
    const alpha = Math.min(1, game.missionBanner * 2);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = 'rgba(9,17,28,0.76)';
    ctx.fillRect(0, game.height * 0.16, game.width, 72);
    ctx.textAlign = 'center';
    ctx.fillStyle = COLORS.gold;
    ctx.font = '800 10px ' + FONT_STACK;
    ctx.fillText('MISSION STARTED', game.width / 2, game.height * 0.16 + 23);
    ctx.fillStyle = COLORS.ink;
    ctx.font = '900 24px ' + DISPLAY_STACK;
    ctx.fillText(game.missions.active ? game.missions.active.name : '', game.width / 2, game.height * 0.16 + 52);
    ctx.globalAlpha = 1;
  }

  drawButtons(ctx, buttons) {
    buttons.forEach((button, index) => this.drawButton(ctx, button, button.label, index === this.cursor));
  }

  drawButton(ctx, rect, label, active) {
    roundRectPath(ctx, rect.x, rect.y, rect.w, rect.h, 6);
    ctx.fillStyle = active ? 'rgba(52,127,132,0.92)' : 'rgba(21,34,48,0.89)';
    ctx.fill();
    ctx.strokeStyle = active ? COLORS.gold : 'rgba(255,239,215,0.28)';
    ctx.lineWidth = active ? 2 : 1;
    ctx.stroke();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = active ? '#fff8e9' : COLORS.muted;
    ctx.font = '800 12px ' + FONT_STACK;
    ctx.fillText(label, rect.x + rect.w / 2, rect.y + rect.h / 2);
    ctx.textBaseline = 'alphabetic';
  }

  scrim(ctx, game, alpha = 0.82) {
    ctx.fillStyle = `rgba(6,12,22,${alpha})`;
    ctx.fillRect(0, 0, game.width, game.height);
  }
}

function inside(point, rect) {
  return !!rect && point.x >= rect.x && point.x <= rect.x + rect.w && point.y >= rect.y && point.y <= rect.y + rect.h;
}
