// Converts keyboard and pointer events into a compact, frame-readable control state.
export class Input {
  constructor(canvas) {
    this.keys = new Set(); this.pressed = new Set(); this.mouse = { x: 0, y: 0, down: false, clicked: false, wheel: 0 };
    window.addEventListener('keydown', event => { if (!this.keys.has(event.code)) this.pressed.add(event.code); this.keys.add(event.code); if (['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Tab'].includes(event.code)) event.preventDefault(); });
    window.addEventListener('keyup', event => this.keys.delete(event.code));
    canvas.addEventListener('pointermove', event => { const rect = canvas.getBoundingClientRect(); this.mouse.x = event.clientX - rect.left; this.mouse.y = event.clientY - rect.top; });
    canvas.addEventListener('pointerdown', event => { canvas.setPointerCapture(event.pointerId); this.mouse.down = true; this.mouse.clicked = true; });
    window.addEventListener('pointerup', () => { this.mouse.down = false; });
    canvas.addEventListener('wheel', event => { this.mouse.wheel += Math.sign(event.deltaY); event.preventDefault(); }, { passive: false });
  }
  down(...codes) { return codes.some(code => this.keys.has(code)); }
  hit(...codes) { return codes.some(code => this.pressed.has(code)); }
  direction() { return { x: Number(this.down('KeyD','ArrowRight')) - Number(this.down('KeyA','ArrowLeft')), y: Number(this.down('KeyS','ArrowDown')) - Number(this.down('KeyW','ArrowUp')) }; }
  endFrame() { this.pressed.clear(); this.mouse.clicked = false; this.mouse.wheel = 0; }
}
