// Purpose: track and constrain the world camera.
// Main exports: Camera.
// Inputs: target position, aim offset, driving state and frame time.
// Outputs: updated camera x, y, zoom and shake values.
// Side effects: mutates the instance used by the renderer.
// Notes: staged shots set zoom and position directly.
export class Camera {
  constructor() { this.x = 2100; this.y = 2100; this.zoom = 1; this.shake = 0; }
  update(target, aim, driving, dt) {
    const zoom = driving ? 0.82 : 1;
    const tx = target.x + aim.x * 0.16, ty = target.y + aim.y * 0.16;
    const blend = 1 - Math.exp(-dt * 3.8);
    this.x += (tx - this.x) * blend; this.y += (ty - this.y) * blend; this.zoom += (zoom - this.zoom) * blend;
    this.shake = Math.max(0, this.shake - dt * 13);
  }
  clamp(viewW, viewH) { this.x = Math.max(viewW / 2, Math.min(4200 - viewW / 2, this.x)); this.y = Math.max(viewH / 2, Math.min(4200 - viewH / 2, this.y)); }
}
