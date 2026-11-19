// SUNBURN CITY - Defines vehicle specs, colours and kinematic state.
// Vehicle data: body specs, colours and the kinematic state shared by live and staged cars.
import { approach, clamp, wrapAngle } from '../core/math.js';
import { WORLD_SIZE } from '../core/config.js';
import { FX } from '../render/effects.js';

export const VEHICLE_SPECS = {
  sedan: { l: 52, w: 24, h: 12, cabin: [0.28, 0.66], name: 'Marlin LX' },
  coupe: { l: 50, w: 24, h: 11, cabin: [0.34, 0.68], name: 'Cadiz GT' },
  hatch: { l: 45, w: 22, h: 13, cabin: [0.22, 0.78], name: 'Pico' },
  suv: { l: 55, w: 26, h: 17, cabin: [0.22, 0.82], name: 'Tundra Bay' },
  van: { l: 60, w: 27, h: 21, cabin: [0.16, 0.9], name: 'Hauler' },
  taxi: { l: 53, w: 24, h: 13, cabin: [0.26, 0.7], name: 'Cab' },
  sport: { l: 53, w: 25, h: 9, cabin: [0.4, 0.7], name: 'Viento SS' },
  police: { l: 55, w: 25, h: 13, cabin: [0.26, 0.7], name: 'Patrol' },
};

export const CAR_COLORS = ['#e8452f', '#f2b632', '#2c7fb8', '#23232b', '#ece8df', '#7fc8a9', '#f08aa8', '#8e99a4',
  '#2d4a3e', '#ff7a3d', '#6b4fa3', '#19b5b0', '#c9c2b2', '#b53a4c'];

let nextVehicleId = 1;

export class Vehicle {
  constructor(type, color) {
    this.id = nextVehicleId++;
    this.drawKind = 2;
    this.type = type;
    this.spec = VEHICLE_SPECS[type] || VEHICLE_SPECS.sedan;
    this.color = color;
    this.x = 0;
    this.y = 0;
    this.heading = 0; // radians, 0 = east
    this.speed = 0;
    this.slip = 0; // body angle relative to travel direction, for drifting
    this.parked = false;
    this.headlights = false;
    this.brakeLights = false;
    this.siren = 0; // 0 off, otherwise flash phase offset + 1
    this.sortY = 0;
    this.isPlayerCar = false;
    this.health = 100;
    this.maxHealth = 100;
    this.destroyed = false;
    this.exploded = false;
    this.smokeClock = 0;
    this.vx = 0;
    this.vy = 0;
    this.steer = 0;
    this.drift = false;
    this.driver = null;
    this._q = 0;
  }

  place(x, y, heading) {
    this.x = x;
    this.y = y;
    this.heading = heading;
    this.sortY = y + this.spec.l * 0.35;
    return this;
  }

  // Axis-aligned bounds used for parked-car collision.
  halfExtents() {
    const c = Math.abs(Math.cos(this.heading));
    const s = Math.abs(Math.sin(this.heading));
    return {
      hx: (this.spec.l * c + this.spec.w * s) / 2,
      hy: (this.spec.l * s + this.spec.w * c) / 2,
    };
  }

  update(dt, input, city, effects, others = [], wanted = null) {
    if (this.destroyed) return;
    const throttle = input.action('moveUp') ? 1 : 0;
    const brake = input.action('moveDown') ? 1 : 0;
    const steer = input.axisX();
    const handbrake = input.down.has('Space');
    const forwardMax = this.type === 'sport' ? 330 : this.type === 'suv' ? 270 : 290;
    if (throttle) this.speed = approach(this.speed, forwardMax, 245 * dt);
    else if (brake) this.speed = this.speed > 12 ? approach(this.speed, 0, 430 * dt) : approach(this.speed, -105, 150 * dt);
    else this.speed = approach(this.speed, 0, (Math.abs(this.speed) > 100 ? 48 : 100) * dt);

    const speedRatio = clamp(Math.abs(this.speed) / forwardMax, 0, 1);
    this.steer = steer;
    this.drift = handbrake && speedRatio > 0.18;
    const reverse = this.speed < -2 ? -1 : 1;
    this.heading = wrapAngle(this.heading + steer * reverse * (0.35 + speedRatio * 1.75) * dt);
    const targetSlip = this.drift ? steer * 0.52 * speedRatio : steer * 0.12 * speedRatio;
    this.slip += (targetSlip - this.slip) * Math.min(1, dt * (this.drift ? 3.2 : 5.5));
    if (!steer) this.slip *= Math.max(0, 1 - dt * 2.4);

    const travel = this.heading + this.slip;
    this.vx = Math.cos(travel) * this.speed;
    this.vy = Math.sin(travel) * this.speed;
    const nx = this.x + this.vx * dt;
    const ny = this.y + this.vy * dt;
    const collided = this.vehicleAt(nx, ny, others);
    if (this.bodyBlocked(city, nx, ny) || collided) {
      const impact = Math.abs(this.speed);
      this.speed *= -0.12;
      this.health = Math.max(0, this.health - Math.max(2, (impact - 35) * 0.12));
      if (this.isPlayerCar && collided && collided.type === 'police' && wanted) {
        wanted.crime('policeCar');
        collided.health = Math.max(0, collided.health - Math.max(4, impact * 0.08));
      }
      effects.spark(this.x + Math.cos(this.heading) * this.spec.l * 0.42, this.y + Math.sin(this.heading) * this.spec.l * 0.42, this.heading + Math.PI, 100 + impact);
      if (impact > 80) effects.addShake(Math.min(0.35, impact / 1200));
      if (this.health <= 0) this.explode(effects, wanted);
      if (collided && collided.health <= 0) collided.explode(effects, wanted);
    } else {
      this.x = nx;
      this.y = ny;
    }

    const rearX = this.x - Math.cos(this.heading) * this.spec.l * 0.35;
    const rearY = this.y - Math.sin(this.heading) * this.spec.l * 0.35;
    if (this.drift && speedRatio > 0.2) {
      const sideX = -Math.sin(this.heading) * this.spec.w * 0.35;
      const sideY = Math.cos(this.heading) * this.spec.w * 0.35;
      effects.skid(rearX - sideX, rearY - sideY, rearX - sideX + this.vx * dt * 0.75, rearY - sideY + this.vy * dt * 0.75, 2.5);
      effects.skid(rearX + sideX, rearY + sideY, rearX + sideX + this.vx * dt * 0.75, rearY + sideY + this.vy * dt * 0.75, 2.5);
      if (city.groundAt(this.x, this.y) !== 1) effects.dust(rearX, rearY, -this.vx, -this.vy);
    }
    this.brakeLights = brake || handbrake || Math.abs(this.speed) < 2;
    this.headlights = this.headlights || false;
    this.sortY = this.y + this.spec.l * 0.35;
    if (this.health < 60) {
      this.smokeClock -= dt;
      if (this.smokeClock <= 0) {
        effects.smoke(rearX, rearY, -this.vx, -this.vy, 5 + (60 - this.health) * 0.12);
        this.smokeClock = 0.18 + this.health / 300;
      }
    }
  }

  bodyBlocked(city, x, y) {
    const a = this.heading + this.slip;
    const ca = Math.cos(a);
    const sa = Math.sin(a);
    const l = this.spec.l * 0.39;
    const w = this.spec.w * 0.28;
    const points = [[0, 0], [l, w], [l, -w], [-l, w], [-l, -w]];
    for (const p of points) {
      const px = x + ca * p[0] - sa * p[1];
      const py = y + sa * p[0] + ca * p[1];
      if (px < 12 || py < 12 || px > WORLD_SIZE - 12 || py > WORLD_SIZE - 12 ||
        city.blockedAt(px, py, 6, this)) return true;
    }
    return false;
  }

  vehicleAt(x, y, others) {
    for (const car of others) {
      if (car === this || car.destroyed || Math.hypot(car.x - x, car.y - y) > 48) continue;
      const radius = (this.spec.l + car.spec.l) * 0.28;
      if (Math.hypot(car.x - x, car.y - y) < radius) return car;
    }
    return null;
  }

  explode(effects, wanted = null) {
    if (this.exploded) return;
    this.exploded = true;
    this.destroyed = true;
    this.speed = 0;
    if (wanted) wanted.crime('explosion');
    for (let i = 0; i < 24; i++) effects.spawn(FX.SPARK, this.x, this.y, (effects.rnd() - 0.5) * 200, (effects.rnd() - 0.5) * 200, 0.3 + effects.rnd() * 0.5, 2, 0);
    for (let i = 0; i < 12; i++) effects.smoke(this.x, this.y, 0, 0, 12 + i);
    effects.addShake(0.7);
  }
}

export function createPoliceCruiser(phase = 0) {
  const v = new Vehicle('police', '#f1f1ee');
  v.siren = 1 + phase;
  v.headlights = true;
  return v;
}
