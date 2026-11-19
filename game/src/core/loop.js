// Fixed-step animation loop with bounded catch-up after a stalled browser frame.
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
