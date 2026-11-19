import { dist } from '../core/math.js';

export function objectiveDistance(game) {
  const target = game.objectiveTarget;
  if (!target || !Number.isFinite(target.x) || !Number.isFinite(target.y)) return null;
  return dist(game.player.x, game.player.y, target.x, target.y);
}

export function drawObjectiveMarker(ctx, target, time, scale = 1) {
  if (!target) return;
  const pulse = 1 + Math.sin(time * 4) * 0.12;
  ctx.save();
  ctx.translate(target.x, target.y);
  ctx.scale(pulse, pulse);
  ctx.strokeStyle = '#fff0bd';
  ctx.lineWidth = 2 / scale;
  ctx.beginPath();
  ctx.arc(0, 0, 20, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = 'rgba(255,196,76,0.3)';
  ctx.beginPath();
  ctx.arc(0, 0, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffd45f';
  ctx.beginPath();
  ctx.moveTo(0, -13); ctx.lineTo(9, -4); ctx.lineTo(0, 5); ctx.lineTo(-9, -4); ctx.closePath();
  ctx.fill();
  ctx.restore();
}
