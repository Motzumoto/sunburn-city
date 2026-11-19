// Purpose: schedule rendering and fixed-step simulation.
// Main exports: startLoop.
// Inputs: update callback, render callback and step size.
// Outputs: a requestAnimationFrame-driven loop.
// Side effects: schedules browser animation frames.
// Notes: elapsed-frame catch-up is capped to avoid simulation bursts.
export function startLoop(update, render, step = 1 / 60) {
  let previous = performance.now(), carry = 0;
  function frame(now) {
    requestAnimationFrame(frame);
    carry += Math.min((now - previous) / 1000, 0.18); previous = now;
    while (carry >= step) { update(step); carry -= step; }
    render(carry / step);
  }
  requestAnimationFrame(frame);
}
