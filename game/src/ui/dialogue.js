// SUNBURN CITY - Draws character portraits and dialogue cards.
// Draws character portraits and dialogue cards for missions and the opening story.
import { FONT_STACK, DISPLAY_STACK } from '../core/config.js';
import { roundRectPath } from '../render/palette.js';

export class Dialogue {
  draw(ctx, card, width, height, index = 0, count = 1) {
    const w = Math.min(780, width - 36);
    const x = (width - w) / 2;
    const y = height - 190;
    const c = card.character;
    roundRectPath(ctx, x, y, w, 164, 8);
    ctx.fillStyle = 'rgba(10,18,29,0.94)';
    ctx.fill();
    ctx.strokeStyle = c.color;
    ctx.lineWidth = 2;
    ctx.stroke();
    const px = x + 20;
    const py = y + 22;
    ctx.fillStyle = c.color;
    ctx.fillRect(px, py, 104, 104);
    ctx.fillStyle = c.jacket;
    if (c.shape === 'wide') ctx.fillRect(px + 16, py + 62, 72, 39);
    else if (c.shape === 'long') ctx.fillRect(px + 26, py + 63, 52, 39);
    else ctx.fillRect(px + 20, py + 63, 64, 39);
    ctx.fillStyle = c.skin;
    ctx.beginPath();
    ctx.ellipse(px + 52, py + 45, c.shape === 'wide' ? 23 : 19, 24, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = c.hair;
    ctx.beginPath();
    ctx.ellipse(px + 52, py + 31, c.shape === 'long' ? 25 : 21, c.shape === 'wide' ? 14 : 17, 0, Math.PI, Math.PI * 2);
    ctx.fill();
    if (c.shape === 'sharp') {
      ctx.fillStyle = '#201c2b';
      ctx.beginPath(); ctx.moveTo(px + 30, py + 27); ctx.lineTo(px + 52, py + 10); ctx.lineTo(px + 75, py + 27); ctx.fill();
    }
    ctx.textAlign = 'left';
    ctx.fillStyle = c.color;
    ctx.font = '800 11px ' + FONT_STACK;
    ctx.fillText(card.title || c.name, x + 150, y + 36);
    ctx.fillStyle = '#fff2df';
    ctx.font = '600 14px ' + FONT_STACK;
    ctx.fillText(card.lines[0] || '', x + 150, y + 69, w - 178);
    ctx.fillStyle = '#d3c9bd';
    ctx.fillText(card.lines[1] || '', x + 150, y + 96, w - 178);
    ctx.fillStyle = '#8ed9ce';
    ctx.font = '700 10px ' + FONT_STACK;
    ctx.fillText(`${index + 1} / ${count}     ENTER  CONTINUE`, x + 150, y + 137);
  }

  drawTitle(ctx, game, card, index, count) {
    this.draw(ctx, { ...card, character: game.character(card.speaker) }, game.width, game.height, index, count);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#fff2df';
    ctx.font = '900 40px ' + DISPLAY_STACK;
    ctx.fillText(card.title, game.width / 2, game.height * 0.33);
  }
}
