// North-up follow camera: smooth tracking, mouse look-ahead, context zoom, screen shake and world clamping.
import { clamp, damp, hash2 } from './math.js';
import { WORLD_SIZE } from './config.js';

export const ZOOM_ON_FOOT = 1.18;
export const ZOOM_IN_CAR = 0.82;

export class Camera {
  constructor() {
    this.x = WORLD_SIZE / 2;
    this.y = WORLD_SIZE / 2;
    this.zoom = ZOOM_ON_FOOT;
    this.targetZoom = ZOOM_ON_FOOT;
    this.viewW = 1280;
    this.viewH = 720;
    this.trauma = 0;
    this.shakeX = 0;
    this.shakeY = 0;
    this.clock = 0;
    this.lookAhead = 0.16;
    // World-space rectangle currently visible, refreshed by updateView().
    this.view = { left: 0, top: 0, right: 0, bottom: 0 };
    this.updateView();
  }

  resize(w, h) {
    this.viewW = w;
    this.viewH = h;
    this.updateView();
  }

  snapTo(x, y, zoom) {
    this.x = x;
    this.y = y;
    if (zoom) { this.zoom = zoom; this.targetZoom = zoom; }
    this.trauma = 0;
    this.clampToWorld();
    this.updateView();
  }

  addShake(amount) {
    this.trauma = clamp(this.trauma + amount, 0, 1);
  }

  // target: {x, y}. mouse: screen-space {x, y} or null to disable look-ahead.
  update(dt, target, mouse, speed = 0) {
    this.clock += dt;
    let tx = target.x;
    let ty = target.y;
    if (mouse) {
      const dx = (mouse.x - this.viewW / 2) / this.zoom;
      const dy = (mouse.y - this.viewH / 2) / this.zoom;
      tx += clamp(dx * this.lookAhead, -140, 140);
      ty += clamp(dy * this.lookAhead, -110, 110);
    }
    this.x = damp(this.x, tx, 5.5, dt);
    this.y = damp(this.y, ty, 5.5, dt);
    this.zoom = damp(this.zoom, this.targetZoom - clamp(speed / 900, 0, 0.12), 2.5, dt);
    this.trauma = Math.max(0, this.trauma - dt * 1.4);
    const s = this.trauma * this.trauma * 14;
    const t = Math.floor(this.clock * 60);
    this.shakeX = (hash2(t, 1, 7) - 0.5) * 2 * s;
    this.shakeY = (hash2(t, 2, 7) - 0.5) * 2 * s;
    this.clampToWorld();
    this.updateView();
  }

  clampToWorld() {
    const hw = this.viewW / 2 / this.zoom;
    const hh = this.viewH / 2 / this.zoom;
    this.x = hw * 2 >= WORLD_SIZE ? WORLD_SIZE / 2 : clamp(this.x, hw, WORLD_SIZE - hw);
    this.y = hh * 2 >= WORLD_SIZE ? WORLD_SIZE / 2 : clamp(this.y, hh, WORLD_SIZE - hh);
  }

  updateView() {
    const hw = this.viewW / 2 / this.zoom;
    const hh = this.viewH / 2 / this.zoom;
    const cx = this.x + this.shakeX / this.zoom;
    const cy = this.y + this.shakeY / this.zoom;
    this.view.left = cx - hw;
    this.view.right = cx + hw;
    this.view.top = cy - hh;
    this.view.bottom = cy + hh;
  }

  screenToWorldX(sx) {
    return (this.view.left + this.view.right) / 2 + (sx - this.viewW / 2) / this.zoom;
  }

  screenToWorldY(sy) {
    return (this.view.top + this.view.bottom) / 2 + (sy - this.viewH / 2) / this.zoom;
  }
}
