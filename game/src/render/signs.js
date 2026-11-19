// Rooftop signage: upright text plates that glow like neon after dark.
import { FONT_STACK } from '../core/config.js';
import { clamp } from '../core/math.js';

function prepare(ctx, b) {
  const s = b.sign;
  if (s.font) return;
  const cap = b.landmark ? 18 : 11;
  const fs = clamp(Math.floor((b.w * 0.86) / (s.text.length * 0.66)), 7, cap);
  s.fs = fs;
  s.font = '800 ' + fs + 'px ' + FONT_STACK;
  ctx.font = s.font;
  s.tw = ctx.measureText(s.text).width;
  s.ph = fs + 6;
}

// (rx, ry, rw) is the projected roof rectangle; the plate stands on the back edge facing the street.
export function drawRoofSign(ctx, b, rx, ry, rw) {
  const s = b.sign;
  prepare(ctx, b);
  const pw = Math.min(rw, s.tw + 12);
  const x = rx + (rw - pw) / 2;
  const y = ry - s.ph + 3;
  ctx.strokeStyle = '#2c2f3a';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(x + 5, y + s.ph); ctx.lineTo(x + 5, ry + 6);
  ctx.moveTo(x + pw - 5, y + s.ph); ctx.lineTo(x + pw - 5, ry + 6);
  ctx.stroke();
  ctx.fillStyle = '#1b1e2a';
  ctx.fillRect(x, y, pw, s.ph);
  ctx.strokeStyle = s.color;
  ctx.lineWidth = 1.2;
  ctx.strokeRect(x + 0.6, y + 0.6, pw - 1.2, s.ph - 1.2);
  ctx.font = s.font;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = s.color;
  ctx.fillText(s.text, x + pw / 2, y + s.ph / 2 + 0.5);
  s.px = x + pw / 2;
  s.py = y + s.ph / 2;
  s.pw = pw;
}

// Night pass: redraw the text bright. Glow sprites are added by the caller using sign.px/py.
export function drawRoofSignLit(ctx, b) {
  const s = b.sign;
  if (!s.font || s.px === undefined) return;
  ctx.font = s.font;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineWidth = 3;
  ctx.strokeStyle = s.color;
  ctx.globalAlpha *= 0.35;
  ctx.strokeText(s.text, s.px, s.py + 0.5);
  ctx.globalAlpha /= 0.35;
  ctx.fillStyle = '#fff6f0';
  ctx.fillText(s.text, s.px, s.py + 0.5);
}
