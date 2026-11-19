// SUNBURN CITY - Handles player movement, pistol combat and draw state.
// Player movement, pistol combat and the look state shared with the person painter.
import { WORLD_SIZE } from '../core/config.js';
import { clamp } from '../core/math.js';
import { muzzlePoint } from '../render/people.js';

const LOOKS = [
  { shirt: '#f5a46d', sleeve: '#ffc08b', pants: '#34445a', shoes: '#f1eadb', skin: '#bd805e', hair: '#30231f' },
  { shirt: '#25a9a0', sleeve: '#57c5b4', pants: '#263348', shoes: '#f3e5c7', skin: '#e3b18a', hair: '#483024', shades: '#15202d' },
  { shirt: '#e85e58', sleeve: '#ff9380', pants: '#d8d1c2', shoes: '#fff2db', skin: '#8f5e48', hair: '#191b22' },
];

export class Player {
  constructor(x, y, rng) {
    this.x = x;
    this.y = y;
    this.face = 0;
    this.walk = 0;
    this.speed = 0;
    this.health = 100;
    this.armour = 35;
    this.look = { ...LOOKS[Math.floor(rng.next() * LOOKS.length)], shirt: '#ff6658', sleeve: '#ff8b76' };
    this.armed = false;
    this.shotArmed = false;
    this.aimLocked = false;
    this.aim = 0;
    this.ammo = 12;
    this.reserve = 72;
    this.weapon = 'PISTOL';
    this.fireTimer = 0;
    this.reloadTimer = 0;
    this.sortY = y;
    this.inVehicle = null;
    this.muzzle = { x: 0, y: 0 };
  }

  update(dt, input, city, camera, effects, pedestrians, combat, wanted) {
    if (!this.aimLocked) this.aim = Math.atan2(camera.screenToWorldY(input.mouse.y) - this.y, camera.screenToWorldX(input.mouse.x) - this.x);
    this.face = this.aim;
    this.fireTimer = Math.max(0, this.fireTimer - dt);
    this.reloadTimer = Math.max(0, this.reloadTimer - dt);
    if (input.actionPressed('reload') && this.reloadTimer <= 0 && this.ammo < 12 && this.reserve > 0) this.reloadTimer = 0.9;
    if (this.reloadTimer > 0 && this.reloadTimer <= dt) {
      const load = Math.min(12 - this.ammo, this.reserve);
      this.ammo += load;
      this.reserve -= load;
    }

    let ax = input.axisX();
    let ay = input.axisY();
    const mag = Math.hypot(ax, ay);
    if (mag > 1) { ax /= mag; ay /= mag; }
    const pace = input.action('sprint') ? 222 : 166;
    this.speed = Math.hypot(ax, ay) * pace;
    const nx = clamp(this.x + ax * pace * dt, 12, WORLD_SIZE - 12);
    const ny = clamp(this.y + ay * pace * dt, 12, WORLD_SIZE - 12);
    if (!city.blockedAt(nx, this.y, 7)) this.x = nx;
    if (!city.blockedAt(this.x, ny, 7)) this.y = ny;
    if (this.speed > 0) this.walk += dt * this.speed * 0.095;
    this.sortY = this.y + 3;
    this.armed = input.mouse.left || this.shotArmed;
    if (input.mouse.left && this.fireTimer <= 0 && this.reloadTimer <= 0) this.fire(effects, pedestrians, combat, wanted);
  }

  fire(effects, pedestrians, combat, wanted) {
    if (this.ammo <= 0) { this.fireTimer = 0.28; return; }
    this.ammo--;
    this.fireTimer = 0.22;
    muzzlePoint(this, this.muzzle);
    const startX = this.muzzle.x;
    const startY = this.muzzle.y;
    effects.muzzleFlash(startX, startY, this.aim);
    effects.casing(this.x, this.y, this.aim);
    effects.addShake(0.13);
    combat.fire(this, this.aim, { x: startX, y: startY, player: true, damage: 34 });
    wanted.crime('gunfire');
    if (pedestrians) pedestrians.fleeFrom(this.x, this.y, 250, true);
  }

  drawState() {
    return { x: this.x, y: this.y, face: this.face, aim: this.aim, walk: this.walk, speed: this.speed, look: this.look,
      armed: this.armed, punch: 0, player: true };
  }
}
