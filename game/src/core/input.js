// SUNBURN CITY - Tracks keyboard, mouse and named game actions.
// Keyboard and mouse state plus named actions shared by driving, combat and menus.

export const ACTION_KEYS = {
  moveUp: ['KeyW', 'ArrowUp'],
  moveDown: ['KeyS', 'ArrowDown'],
  moveLeft: ['KeyA', 'ArrowLeft'],
  moveRight: ['KeyD', 'ArrowRight'],
  sprint: ['ShiftLeft', 'ShiftRight'],
  punch: ['Space'],
  interact: ['KeyE'],
  reload: ['KeyR'],
  radio: ['Tab'],
  pause: ['Escape'],
  confirm: ['Enter', 'NumpadEnter'],
  menuUp: ['KeyW', 'ArrowUp'],
  menuDown: ['KeyS', 'ArrowDown'],
  horn: ['KeyH'],
};

const BLOCKED_DEFAULTS = new Set(['Tab', 'Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']);

export class Input {
  constructor() {
    this.down = new Set();
    this.pressed = new Set();
    this.mouse = { x: 0, y: 0, left: false, right: false, leftPressed: false, rightPressed: false, moved: false };
    this.wheel = 0;
    this.attached = false;
  }

  attach(win, canvas) {
    if (this.attached) return;
    this.attached = true;
    win.addEventListener('keydown', (e) => {
      if (BLOCKED_DEFAULTS.has(e.code)) e.preventDefault();
      if (!e.repeat) this.pressed.add(e.code);
      this.down.add(e.code);
    });
    win.addEventListener('keyup', (e) => this.down.delete(e.code));
    win.addEventListener('blur', () => this.releaseAll());
    canvas.addEventListener('mousemove', (e) => {
      const r = canvas.getBoundingClientRect();
      this.mouse.x = e.clientX - r.left;
      this.mouse.y = e.clientY - r.top;
      this.mouse.moved = true;
    });
    canvas.addEventListener('mousedown', (e) => {
      if (e.button === 0) { this.mouse.left = true; this.mouse.leftPressed = true; }
      if (e.button === 2) { this.mouse.right = true; this.mouse.rightPressed = true; }
    });
    win.addEventListener('mouseup', (e) => {
      if (e.button === 0) this.mouse.left = false;
      if (e.button === 2) this.mouse.right = false;
    });
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      this.wheel = Math.sign(e.deltaY);
    }, { passive: false });
  }

  releaseAll() {
    this.down.clear();
    this.mouse.left = false;
    this.mouse.right = false;
  }

  // Call once after each fixed update so "pressed" edges only fire a single tick.
  endTick() {
    this.pressed.clear();
    this.mouse.leftPressed = false;
    this.mouse.rightPressed = false;
    this.wheel = 0;
  }

  action(name) {
    const keys = ACTION_KEYS[name];
    for (let i = 0; i < keys.length; i++) if (this.down.has(keys[i])) return true;
    return false;
  }

  actionPressed(name) {
    const keys = ACTION_KEYS[name];
    for (let i = 0; i < keys.length; i++) if (this.pressed.has(keys[i])) return true;
    return false;
  }

  // Movement axes in [-1, 1].
  axisX() {
    return (this.action('moveRight') ? 1 : 0) - (this.action('moveLeft') ? 1 : 0);
  }

  axisY() {
    return (this.action('moveDown') ? 1 : 0) - (this.action('moveUp') ? 1 : 0);
  }
}
