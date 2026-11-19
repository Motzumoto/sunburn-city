// SUNBURN CITY — Runs fixed-step simulation and frame rendering.
// Fixed-timestep game loop: updates at 60Hz and renders once per animation frame.
import { FIXED_DT, MAX_FRAME_DT } from './config.js';

export class GameLoop {
  constructor(update, render) {
    this.update = update;
    this.render = render;
    this.acc = 0;
    this.last = 0;
    this.running = false;
    this.handle = 0;
    this.frame = this.frame.bind(this);
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.last = 0;
    this.handle = requestAnimationFrame(this.frame);
  }

  stop() {
    this.running = false;
    cancelAnimationFrame(this.handle);
  }

  frame(now) {
    if (!this.running) return;
    this.handle = requestAnimationFrame(this.frame);
    if (!this.last) this.last = now;
    let dt = (now - this.last) / 1000;
    this.last = now;
    if (dt > MAX_FRAME_DT) dt = MAX_FRAME_DT;
    this.acc += dt;
    let steps = 0;
    while (this.acc >= FIXED_DT && steps < 6) {
      this.update(FIXED_DT);
      this.acc -= FIXED_DT;
      steps++;
    }
    if (steps === 6) this.acc = 0;
    this.render(this.acc / FIXED_DT, dt);
  }
}
