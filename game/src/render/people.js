// SUNBURN CITY - Draws pedestrians, officers and the highlighted player.
// Draws top-down people: pedestrians, cops and the player with walk cycle, bobbing, aimed pistol and punch.
import { EXTRUDE, SHADOW_DIR } from '../core/config.js';

const HAND_REACH = 9;

export function drawPersonShadow(ctx, p) {
  ctx.fillStyle = 'rgba(29,51,64,0.12)';
  ctx.beginPath();
  ctx.ellipse(p.x + SHADOW_DIR.x * 8, p.y + SHADOW_DIR.y * 8, 8, 5.2, 0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(29,51,64,0.25)';
  ctx.beginPath();
  ctx.ellipse(p.x + SHADOW_DIR.x * 7, p.y + SHADOW_DIR.y * 7, 5.5, 3.6, 0.5, 0, Math.PI * 2);
  ctx.fill();
}

// p: {x, y, face, walk, speed, look, armed, aim, punch, down}
export function drawPerson(ctx, p) {
  if (p.player) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.scale(1.4, 1.4);
    ctx.translate(-p.x, -p.y);
    drawPersonSprite(ctx, p);
    ctx.restore();
    return;
  }
  drawPersonSprite(ctx, p);
}

function drawPersonSprite(ctx, p) {
  const look = p.look;
  const face = p.armed ? p.aim : p.face;
  const swing = Math.sin(p.walk) * Math.min(1, p.speed / 60) * 3.4;
  const bob = Math.abs(Math.sin(p.walk)) * Math.min(1, p.speed / 60) * 0.9;
  const cf = Math.cos(face);
  const sf = Math.sin(face);
  if (p.down) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.face);
    ctx.fillStyle = '#283440';
    ctx.beginPath(); ctx.ellipse(0, 0, 8, 3.5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = look.shirt;
    ctx.beginPath(); ctx.ellipse(1, 0, 4.5, 3, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = look.skin;
    ctx.beginPath(); ctx.arc(6, 0, 2.2, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    return;
  }
  if (p.player) {
    ctx.fillStyle = 'rgba(255,246,225,0.42)';
    ctx.shadowColor = 'rgba(255,246,225,0.55)';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.ellipse(p.x, p.y + 3, 11, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }
  // Legs on the ground.
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(face);
  ctx.fillStyle = look.pants;
  ctx.beginPath(); ctx.ellipse(swing, -2.4, 3.3, 1.9, 0, 0, 6.3); ctx.fill();
  ctx.beginPath(); ctx.ellipse(-swing, 2.4, 3.3, 1.9, 0, 0, 6.3); ctx.fill();
  ctx.fillStyle = look.shoes || '#f2efe6';
  ctx.beginPath(); ctx.ellipse(swing + 1.6, -2.4, 1.8, 1.4, 0, 0, 6.3); ctx.fill();
  ctx.beginPath(); ctx.ellipse(-swing + 1.6, 2.4, 1.8, 1.4, 0, 0, 6.3); ctx.fill();
  ctx.restore();
  // Torso and arms at chest height.
  const tx = p.x + EXTRUDE.x * 7;
  const ty = p.y + EXTRUDE.y * 7 - bob;
  ctx.save();
  ctx.translate(tx, ty);
  ctx.rotate(face);
  ctx.fillStyle = look.shirt;
  ctx.beginPath(); ctx.ellipse(0, 0, 3.7, 6.2, 0, 0, 6.3); ctx.fill();
  if (p.hitFlash > 0) {
    ctx.fillStyle = 'rgba(255,244,218,' + Math.min(0.9, p.hitFlash * 4).toFixed(2) + ')';
    ctx.beginPath(); ctx.ellipse(0, 0, 3.7, 6.2, 0, 0, 6.3); ctx.fill();
  }
  if (p.player) {
    ctx.strokeStyle = '#fff6e2';
    ctx.lineWidth = 1.6;
    ctx.stroke();
  }
  ctx.fillStyle = 'rgba(255,255,255,0.2)';
  ctx.beginPath(); ctx.ellipse(-0.6, -1.8, 2, 3, 0, 0, 6.3); ctx.fill();
  ctx.lineCap = 'round';
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = look.sleeve || look.shirt;
  ctx.beginPath();
  if (p.armed) {
    ctx.moveTo(0, -5.2); ctx.lineTo(2.5, -5.4);
    ctx.moveTo(0, 5.2); ctx.lineTo(HAND_REACH - 2, 1.4);
  } else if (p.punch > 0) {
    const ext = Math.sin(p.punch * Math.PI) * 9;
    ctx.moveTo(0, -5.2); ctx.lineTo(-swing * 0.6, -5.8);
    ctx.moveTo(0, 5.2); ctx.lineTo(3 + ext, 2.2);
  } else {
    ctx.moveTo(0, -5.2); ctx.lineTo(-swing * 0.8, -5.9);
    ctx.moveTo(0, 5.2); ctx.lineTo(swing * 0.8, 5.9);
  }
  ctx.stroke();
  ctx.lineCap = 'butt';
  // Hands and weapon.
  ctx.fillStyle = look.skin;
  if (p.armed) {
    ctx.beginPath(); ctx.arc(HAND_REACH - 2, 1.4, 1.7, 0, 6.3); ctx.fill();
    ctx.fillStyle = '#1b1d24';
    ctx.fillRect(HAND_REACH - 3, 0.6, 7, 1.9);
    ctx.fillRect(HAND_REACH - 3, 1.4, 2.6, 2.6);
  } else if (p.punch > 0) {
    const ext = Math.sin(p.punch * Math.PI) * 9;
    ctx.beginPath(); ctx.arc(4 + ext, 2.2, 2.1, 0, 6.3); ctx.fill();
  }
  ctx.restore();
  // Head sits above the shoulders.
  const hx = p.x + EXTRUDE.x * 12 + cf * 0.6;
  const hy = p.y + EXTRUDE.y * 12 - bob + sf * 0.6;
  ctx.fillStyle = look.skin;
  ctx.beginPath(); ctx.arc(hx, hy, 3.7, 0, 6.3); ctx.fill();
  if (p.player) {
    ctx.strokeStyle = '#fff6e2';
    ctx.lineWidth = 1.6;
    ctx.stroke();
  }
  ctx.fillStyle = look.hair;
  ctx.beginPath();
  ctx.arc(hx, hy, 3.9, face + 0.9, face + 6.283 - 0.9);
  ctx.closePath();
  ctx.fill();
  if (look.hat) {
    ctx.fillStyle = look.hat;
    ctx.beginPath(); ctx.arc(hx, hy, 3.9, 0, 6.3); ctx.fill();
    ctx.fillRect(hx + cf * 2.8 - 1.5, hy + sf * 2.8 - 1.5, 3, 3);
  }
  if (look.shades) {
    ctx.fillStyle = '#10131a';
    ctx.beginPath(); ctx.arc(hx + cf * 2.2, hy + sf * 2.2, 1.5, 0, 6.3); ctx.fill();
  }
  if (p.player) {
    ctx.strokeStyle = 'rgba(20,25,32,0.75)';
    ctx.lineWidth = 3;
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(p.x - 4, p.y - 13);
    ctx.lineTo(p.x, p.y - 18);
    ctx.lineTo(p.x + 4, p.y - 13);
    ctx.stroke();
    ctx.strokeStyle = '#ff4d3d';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(p.x - 4, p.y - 13);
    ctx.lineTo(p.x, p.y - 18);
    ctx.lineTo(p.x + 4, p.y - 13);
    ctx.stroke();
  }
}

// World position of the pistol muzzle for a person, written into out.
export function muzzlePoint(p, out) {
  const face = p.aim;
  const tx = p.x + EXTRUDE.x * 7;
  const ty = p.y + EXTRUDE.y * 7;
  const cf = Math.cos(face);
  const sf = Math.sin(face);
  // Hand at local (7, 1.4) rotated by face, plus barrel length.
  const lx = HAND_REACH + 5;
  const ly = 1.4;
  out.x = tx + cf * lx - sf * ly;
  out.y = ty + sf * lx + cf * ly;
  return out;
}
