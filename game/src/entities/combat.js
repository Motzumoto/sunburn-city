// Short-lived projectile simulation shared by the player's pistol and police firearms.
import { dist } from '../core/math.js';

export class Combat {
  constructor(effects) {
    this.effects = effects;
    this.bullets = [];
    this.nextId = 1;
  }

  fire(shooter, angle, options = {}) {
    const speed = options.speed || 920;
    const range = options.range || 620;
    const sx = options.x === undefined ? shooter.x : options.x;
    const sy = options.y === undefined ? shooter.y : options.y;
    const bullet = {
      id: this.nextId++, x: sx, y: sy, angle, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
      remaining: range, damage: options.damage || 24, shooter, player: !!options.player,
      color: options.color || '#fff0aa',
    };
    this.bullets.push(bullet);
    this.effects.tracer(sx, sy, sx + bullet.vx * 0.1, sy + bullet.vy * 0.1);
    return bullet;
  }

  update(dt, game) {
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const b = this.bullets[i];
      let travel = Math.min(b.remaining, Math.hypot(b.vx, b.vy) * dt);
      let hit = false;
      while (travel > 0) {
        const step = Math.min(14, travel);
        const x = b.x + Math.cos(b.angle) * step;
        const y = b.y + Math.sin(b.angle) * step;
        travel -= step;
        b.remaining -= step;
        if (this.hitPeople(b, x, y, game) || this.hitCars(b, x, y, game)) {
          b.x = x; b.y = y; hit = true; break;
        }
        if (game.city.solidAt(x, y)) {
          this.effects.spark(x, y, b.angle + Math.PI, 90);
          b.x = x; b.y = y; hit = true; break;
        }
        b.x = x;
        b.y = y;
      }
      if (hit || b.remaining <= 0) this.bullets.splice(i, 1);
    }
  }

  hitPeople(b, x, y, game) {
    if (!b.player && dist(x, y, game.player.x, game.player.y) < 10) {
      game.damagePlayer(b.damage);
      return true;
    }
    const targets = game.police.officers.concat(game.pedestrians.people, game.missionEnemies);
    for (const person of targets) {
      if (person === b.shooter || person.down || dist(x, y, person.x, person.y) > 8) continue;
      person.health = (person.health === undefined ? 100 : person.health) - b.damage;
      person.hitFlash = 0.18;
      if (person.police) {
        if (b.player) game.wantedSystem.crime('officer');
        if (person.health <= 0) person.down = true;
      } else if (person.hostile) {
        if (person.health <= 0) person.down = true;
      } else {
        if (b.player) game.wantedSystem.crime('pedestrian');
        if (person.health <= 0) person.down = true;
        else game.pedestrians.fleeOne(person, b.x, b.y, 3);
      }
      return true;
    }
    return false;
  }

  hitCars(b, x, y, game) {
    const cars = game.traffic.cars.concat(game.city.parked);
    for (const car of cars) {
      if (car === b.shooter || car.destroyed || dist(x, y, car.x, car.y) > 21) continue;
      car.health = Math.max(0, car.health - b.damage * 0.75);
      car.driverHealth = Math.max(0, (car.driverHealth === undefined ? 100 : car.driverHealth) - b.damage);
      if (car.driverHealth <= 0) car.driverDown = true;
      this.effects.spark(x, y, b.angle + Math.PI, 100);
      if (car.type === 'police' && b.player) game.wantedSystem.crime('policeCar');
      if (car.health <= 0) car.explode(this.effects, b.player ? game.wantedSystem : null);
      return true;
    }
    return false;
  }
}
