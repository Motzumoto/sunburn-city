// SUNBURN CITY - Draws the street map, landmarks and pursuit markers.
// Compact street map with generated blocks, the shoreline and active pursuit markers.
import { shoreY } from '../world/shoreline.js';
import { roundRectPath } from '../render/palette.js';

const GOLD = '#f2c45c';

export class Minimap {
  draw(ctx, game, width, height) {
    const box = { x: 10, y: Math.max(10, height - 186), w: Math.min(240, width - 20), h: 168 };
    box.x = width - box.w - 18;
    const map = { x: box.x + 8, y: box.y + 29, w: box.w - 16, h: box.h - 37 };
    const spanX = 600;
    const spanY = spanX * map.h / map.w;
    const left = game.player.x - spanX / 2;
    const top = game.player.y - spanY / 2;
    const mapX = (x) => map.x + (x - left) * map.w / spanX;
    const mapY = (y) => map.y + (y - top) * map.h / spanY;

    ctx.save();
    roundRectPath(ctx, box.x, box.y, box.w, box.h, 10);
    ctx.fillStyle = '#101d2a';
    ctx.fill();
    ctx.strokeStyle = '#f1dfbf';
    ctx.lineWidth = 2;
    ctx.stroke();
    roundRectPath(ctx, box.x + 2, box.y + 2, box.w - 4, 24, 7);
    ctx.fillStyle = '#1c3041';
    ctx.fill();
    ctx.fillStyle = '#f4e8d2';
    ctx.font = '800 10px "Segoe UI", Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('COSTA VELA', box.x + 11, box.y + 17);
    ctx.textAlign = 'right';
    ctx.fillStyle = '#f3ddb0';
    ctx.fillText('N ▲', box.x + box.w - 10, box.y + 17);

    roundRectPath(ctx, map.x, map.y, map.w, map.h, 4);
    ctx.fillStyle = '#c9b994';
    ctx.fill();
    ctx.save();
    ctx.beginPath();
    ctx.rect(map.x, map.y, map.w, map.h);
    ctx.clip();

    // Sand and sea are painted first so the map remains useful at every shoreline position.
    ctx.fillStyle = '#dbc99d';
    ctx.fillRect(map.x, map.y, map.w, map.h);
    ctx.beginPath();
    for (let i = 0; i <= 30; i++) {
      const wx = left + spanX * i / 30;
      const px = mapX(wx);
      const py = mapY(shoreY(wx));
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.lineTo(map.x + map.w, map.y + map.h);
    ctx.lineTo(map.x, map.y + map.h);
    ctx.closePath();
    ctx.fillStyle = '#1d8197';
    ctx.fill();

    const minX = left;
    const maxX = left + spanX;
    const minY = top;
    const maxY = top + spanY;
    for (const block of game.city.blocks) {
      if (block.x1 < minX || block.x0 > maxX || block.y1 < minY || block.y0 > maxY) continue;
      ctx.fillStyle = block.kind === 'park' ? '#3d885b' : block.kind === 'plaza' || block.kind === 'landmark'
        ? '#96896d' : '#35495a';
      ctx.fillRect(mapX(block.x0), mapY(block.y0), (block.x1 - block.x0) * map.w / spanX, (block.y1 - block.y0) * map.h / spanY);
    }
    ctx.strokeStyle = 'rgba(248,232,199,0.9)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (const x of game.city.grid.xs) {
      ctx.moveTo(mapX(x), map.y);
      ctx.lineTo(mapX(x), map.y + map.h);
    }
    for (const y of game.city.grid.ys) {
      ctx.moveTo(map.x, mapY(y));
      ctx.lineTo(map.x + map.w, mapY(y));
    }
    ctx.stroke();

    for (const landmark of game.city.landmarks) {
      if (landmark.x < minX || landmark.x > maxX || landmark.y < minY || landmark.y > maxY) continue;
      diamond(ctx, mapX(landmark.x), mapY(landmark.y), 4, GOLD);
    }
    if (game.missionMarker) {
      const marker = game.missionMarker;
      star(ctx, mapX(marker.x), mapY(marker.y), 6, '#ffd45f');
    } else if (game.objective && Number.isFinite(game.objective.x) && Number.isFinite(game.objective.y)) {
      star(ctx, mapX(game.objective.x), mapY(game.objective.y), 6, '#ffd45f');
    }
    for (const marker of game.activities.markers) {
      if (marker.x < minX || marker.x > maxX || marker.y < minY || marker.y > maxY) continue;
      blip(ctx, mapX(marker.x), mapY(marker.y), marker.type === 'race' || marker.type === 'vigilante' ? '#51d1c5' : '#f0c45b');
    }
    if (game.activityTarget) star(ctx, mapX(game.activityTarget.x), mapY(game.activityTarget.y), 5, '#62d8c8');

    const wanted = game.wantedSystem;
    if (wanted.level > 0) {
      const px = mapX(game.player.x);
      const py = mapY(game.player.y);
      const radius = wanted.searchRadius * map.w / spanX;
      ctx.strokeStyle = 'rgba(255,215,110,0.52)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(px, py, radius, 0, Math.PI * 2);
      ctx.stroke();
      for (const car of game.police.units) if (car.pursuit && !car.destroyed) {
        blip(ctx, mapX(car.x), mapY(car.y), '#ff4d3d');
      }
      for (const officer of game.police.officers) if (!officer.down) {
        blip(ctx, mapX(officer.x), mapY(officer.y), '#ff4d3d');
      }
      if (game.police.helicopter) blip(ctx, mapX(game.police.helicopter.x), mapY(game.police.helicopter.y), '#ff4d3d');
    }

    const playerX = mapX(game.player.x);
    const playerY = mapY(game.player.y);
    if (game.player.inVehicle) chevron(ctx, playerX - 7, playerY + 5, game.player.inVehicle.heading, '#35c8c0');
    arrow(ctx, playerX, playerY, game.player.face, '#fff3d4');
    ctx.restore();

    ctx.fillStyle = '#aab4b4';
    ctx.font = '600 9px "Segoe UI", Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('100 WORLD UNITS', map.x + 6, map.y + 13);
    ctx.strokeStyle = '#f5e8d0';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(map.x + 6, map.y + map.h - 10);
    ctx.lineTo(map.x + 44, map.y + map.h - 10);
    ctx.stroke();
    ctx.restore();
  }
}

function blip(ctx, x, y, color) {
  ctx.fillStyle = '#101a25';
  ctx.beginPath(); ctx.arc(x, y, 4.2, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.arc(x, y, 2.7, 0, Math.PI * 2); ctx.fill();
}

function arrow(ctx, x, y, angle, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle - Math.PI / 2);
  ctx.fillStyle = '#10202d';
  ctx.beginPath(); ctx.moveTo(0, -9); ctx.lineTo(7, 7); ctx.lineTo(0, 3); ctx.lineTo(-7, 7); ctx.closePath(); ctx.fill();
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.moveTo(0, -7); ctx.lineTo(5, 5); ctx.lineTo(0, 2); ctx.lineTo(-5, 5); ctx.closePath(); ctx.fill();
  ctx.restore();
}

function chevron(ctx, x, y, angle, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.strokeStyle = '#101a25';
  ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(-5, -4); ctx.lineTo(0, 0); ctx.lineTo(5, -4); ctx.stroke();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(-5, -4); ctx.lineTo(0, 0); ctx.lineTo(5, -4); ctx.stroke();
  ctx.restore();
}

function diamond(ctx, x, y, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.moveTo(x, y - r); ctx.lineTo(x + r, y); ctx.lineTo(x, y + r); ctx.lineTo(x - r, y); ctx.closePath(); ctx.fill();
}

function star(ctx, x, y, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const radius = i % 2 ? r * 0.45 : r;
    const angle = -Math.PI / 2 + i * Math.PI / 5;
    const px = x + Math.cos(angle) * radius;
    const py = y + Math.sin(angle) * radius;
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
}
