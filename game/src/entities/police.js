// Live patrols, pursuit steering, foot arrests, gunfire, road hazards and the search helicopter.
import { clamp, dist, lerpAngle } from '../core/math.js';

const OFFICER_LOOK = { shirt: '#eee9d9', sleeve: '#c4cbd0', pants: '#26384e', shoes: '#1e2530', skin: '#bd8b69', hair: '#24262a', hat: '#243a55' };

export class PoliceSystem {
  constructor(game) {
    this.game = game;
    this.units = [];
    this.officers = [];
    this.rnd = ((game.seed ^ 0x71a1ce31) >>> 0) || 1;
    this.nextOfficer = 1;
    this.dispatchClock = 0;
    this.hazardClock = 0;
    this.ramClock = 0;
    this.helicopter = null;
    this.hazards = [];
    this.ensurePatrols();
  }

  random() {
    this.rnd = (Math.imul(this.rnd, 1664525) + 1013904223) >>> 0;
    return this.rnd / 4294967296;
  }

  ensurePatrols() {
    const p = this.game.player;
    for (const [dx, dy] of [[-900, -450], [850, 620]]) {
      const lane = this.game.city.nearestLane(p.x + dx, p.y + dy);
      if (lane) this.addCruiser(lane.x, lane.y, lane.edge.angle || Math.atan2(lane.edge.dy, lane.edge.dx), false);
    }
  }

  resetScene() {
    this.units.length = 0;
    this.officers.length = 0;
    this.hazards.length = 0;
    this.helicopter = null;
    this.dispatchClock = 0;
    this.ramClock = 0;
    this.ensurePatrols();
  }

  addCruiser(x, y, angle, pursuit = true) {
    const car = this.game.traffic.addCar('police', x, y, angle, '#f1f1ee', { siren: pursuit ? 1 : 0, headlights: true });
    car.policeUnit = true;
    car.pursuit = pursuit;
    car.ramClock = 0;
    this.units.push(car);
    return car;
  }

  stagePursuit(count, x, y, angle, spacing = 86) {
    for (const unit of this.units) {
      if (unit.pursuit && !unit.destroyed) {
        unit.destroyed = true;
        const index = this.game.traffic.cars.indexOf(unit);
        if (index >= 0) this.game.traffic.cars.splice(index, 1);
      }
    }
    this.units = this.units.filter((unit) => !unit.destroyed);
    for (let i = 0; i < count; i++) {
      const back = spacing * (i + 1);
      const side = i % 2 ? 28 : -28;
      const px = x - Math.cos(angle) * back - Math.sin(angle) * side;
      const py = y - Math.sin(angle) * back + Math.cos(angle) * side;
      const lane = this.game.city.nearestLane(px, py);
      const car = this.addCruiser(lane ? lane.x : px, lane ? lane.y : py, angle, true);
      car.siren = i + 1;
      car.speed = 192;
    }
  }

  stageOfficers(count, x, y, facing, spacing = 32, targetX = x, targetY = y) {
    for (const person of this.officers) person.down = true;
    for (let i = 0; i < count; i++) {
      const side = i % 2 ? 1 : -1;
      const row = Math.floor(i / 2);
      const px = x + Math.cos(facing + Math.PI / 2) * side * spacing + Math.cos(facing) * row * spacing;
      const py = y + Math.sin(facing + Math.PI / 2) * side * spacing + Math.sin(facing) * row * spacing;
      this.createOfficer(px, py, Math.atan2(targetY - py, targetX - px), true);
    }
  }

  createOfficer(x, y, face, shooting = false) {
    const person = {
      id: 'cop-' + this.nextOfficer++, x, y, face, aim: face, walk: 0, speed: 0,
      look: OFFICER_LOOK, armed: shooting, punch: 0, police: true, health: 100, down: false,
      sortY: y + 2, shootClock: shooting ? 0 : 0.25 + this.random() * 0.4,
    };
    this.officers.push(person);
    return person;
  }

  update(dt) {
    const game = this.game;
    const level = game.wantedSystem.level;
    this.dispatchClock -= dt;
    this.ramClock -= dt;
    const targetCount = level ? Math.min(7, 1 + level) : 0;
    const active = this.units.filter((car) => car.pursuit && !car.destroyed).length;
    if (level && active < targetCount && this.dispatchClock <= 0) {
      this.dispatchClock = 0.8;
      const a = this.random() * Math.PI * 2;
      const screenRadius = Math.hypot(game.width / 2 / game.camera.zoom, game.height / 2 / game.camera.zoom);
      const radius = Math.max(820, screenRadius + 320) + this.random() * 130;
      const lane = game.city.nearestLane(game.player.x + Math.cos(a) * radius, game.player.y + Math.sin(a) * radius);
      if (lane) this.addCruiser(lane.x, lane.y, Math.atan2(game.player.y - lane.y, game.player.x - lane.x), true);
    }

    for (let i = this.units.length - 1; i >= 0; i--) {
      const car = this.units[i];
      if (car.destroyed) {
        this.units.splice(i, 1);
        continue;
      }
      if (car.pursuit && level) this.drivePursuit(car, dt);
      else if (!car.pursuit && !car.parked) game.traffic.driveCar(car, dt, game.day, game.effects, game.player.inVehicle);
      if (level > 0 && level <= 2 && car.pursuit && !car.officer && dist(car.x, car.y, game.player.x, game.player.y) < 185) {
        car.officer = this.createOfficer(car.x - Math.sin(car.heading) * 32, car.y + Math.cos(car.heading) * 32, car.heading);
      }
      if (level >= 3 && car.pursuit) this.shootAtPlayer(car, dt, 520, 0.9 + (5 - level) * 0.15);
    }
    for (const officer of this.officers) if (!officer.down) {
      officer.hitFlash = Math.max(0, officer.hitFlash - dt);
      this.updateOfficer(officer, dt, level);
    }

    if (level >= 4) this.updateHelicopter(dt);
    else this.helicopter = null;
    if (level >= 3) this.updateHazards(dt);
    else this.hazards.length = 0;
    this.officers = this.officers.filter((person) => !person.down);

    if (level <= 2) this.checkArrest(dt);
  }

  drivePursuit(car, dt) {
    const game = this.game;
    const p = game.player;
    const targetAngle = Math.atan2(p.y - car.y, p.x - car.x);
    const distance = dist(car.x, car.y, p.x, p.y);
    const desiredSpeed = game.wantedSystem.level >= 5 ? 280 : 238;
    car.speed += clamp(desiredSpeed - car.speed, -280 * dt, 145 * dt);
    car.heading = lerpAngle(car.heading, targetAngle, Math.min(1, dt * (distance < 150 ? 2.4 : 1.35)));
    const nx = car.x + Math.cos(car.heading) * car.speed * dt;
    const ny = car.y + Math.sin(car.heading) * car.speed * dt;
    if (!game.city.blockedAt(nx, ny, 10, car)) {
      car.x = nx;
      car.y = ny;
    } else {
      car.heading += (this.random() - 0.5) * 1.8;
      car.speed *= 0.55;
    }
    car.sortY = car.y + car.spec.l * 0.35;
    car.brakeLights = distance < 95;
    car.siren = Math.max(1, car.siren || 1);
    car.headlights = true;

    if (game.player.inVehicle && distance < 50 && this.ramClock <= 0) {
      const playerCar = game.player.inVehicle;
      playerCar.health = Math.max(0, playerCar.health - 8 - game.wantedSystem.level * 2);
      playerCar.speed *= 0.72;
      this.ramClock = 0.65;
      game.effects.addShake(0.16);
      if (playerCar.health <= 0) playerCar.explode(game.effects, game.wantedSystem);
    }
  }

  shootAtPlayer(shooter, dt, range, interval) {
    const game = this.game;
    const target = game.player;
    const angle = Math.atan2(target.y - shooter.y, target.x - shooter.x);
    const distance = dist(shooter.x, shooter.y, target.x, target.y);
    if (distance > range || game.city.raycast(shooter.x, shooter.y, angle, distance) < distance - 10) return;
    shooter.shootClock = (shooter.shootClock || 0) - dt;
    if (shooter.shootClock > 0) return;
    shooter.shootClock = interval;
    const ox = shooter.x + Math.cos(shooter.heading) * 16;
    const oy = shooter.y + Math.sin(shooter.heading) * 16;
    game.effects.muzzleFlash(ox, oy, angle);
    game.effects.casing(ox, oy, angle);
    game.combat.fire(shooter, angle + (this.random() - 0.5) * 0.09, { x: ox, y: oy, damage: 15, speed: 760, color: '#ffcb68' });
  }

  updateOfficer(officer, dt, level) {
    const game = this.game;
    const p = game.player;
    const d = dist(officer.x, officer.y, p.x, p.y);
    const angle = Math.atan2(p.y - officer.y, p.x - officer.x);
    officer.face = angle;
    if (level >= 3) {
      officer.armed = true;
      officer.shootClock -= dt;
      if (d < 430 && officer.shootClock <= 0 && game.city.raycast(officer.x, officer.y, angle, d) >= d - 10) {
        officer.shootClock = 1.15 + this.random() * 0.35;
        game.effects.muzzleFlash(officer.x + Math.cos(angle) * 12, officer.y + Math.sin(angle) * 12, angle);
        game.effects.casing(officer.x, officer.y, angle);
        game.combat.fire(officer, angle + (this.random() - 0.5) * 0.1, { x: officer.x + Math.cos(angle) * 12, y: officer.y + Math.sin(angle) * 12, damage: 13, speed: 780 });
      }
      return;
    }
    if (d > 34) {
      officer.speed = 78;
      const nx = officer.x + Math.cos(angle) * officer.speed * dt;
      const ny = officer.y + Math.sin(angle) * officer.speed * dt;
      if (!game.city.blockedAt(nx, ny, 6)) { officer.x = nx; officer.y = ny; }
      officer.walk += dt * 7;
    } else officer.speed = 0;
    officer.sortY = officer.y + 2;
  }

  checkArrest(dt) {
    const game = this.game;
    const player = game.player;
    const stopped = player.inVehicle ? Math.abs(player.inVehicle.speed) < 5 : player.speed < 4;
    let close = false;
    if (stopped) {
      for (const officer of this.officers) {
        if (!officer.down && dist(officer.x, officer.y, player.x, player.y) < 34) {
          close = true;
          break;
        }
      }
    }
    game.wantedSystem.arrestProgress = close ? game.wantedSystem.arrestProgress + dt : Math.max(0, game.wantedSystem.arrestProgress - dt * 0.8);
    if (game.wantedSystem.arrestProgress >= 3) {
      game.state = 'busted';
      game.wantedSystem.arrestProgress = 0;
    }
  }

  canSeePlayer() {
    const game = this.game;
    for (const car of this.units) {
      if (!car.pursuit || car.destroyed) continue;
      const d = dist(car.x, car.y, game.player.x, game.player.y);
      if (d < 650 && game.city.raycast(car.x, car.y, Math.atan2(game.player.y - car.y, game.player.x - car.x), d) >= d - 10) return true;
    }
    for (const officer of this.officers) {
      if (officer.down) continue;
      const d = dist(officer.x, officer.y, game.player.x, game.player.y);
      if (d < 520 && game.city.raycast(officer.x, officer.y, Math.atan2(game.player.y - officer.y, game.player.x - officer.x), d) >= d - 10) return true;
    }
    return false;
  }

  nearestDistance() {
    const game = this.game;
    let nearest = Infinity;
    for (const car of this.units) if (car.pursuit && !car.destroyed) nearest = Math.min(nearest, dist(car.x, car.y, game.player.x, game.player.y));
    for (const officer of this.officers) if (!officer.down) nearest = Math.min(nearest, dist(officer.x, officer.y, game.player.x, game.player.y));
    return nearest;
  }

  updateHelicopter(dt) {
    const p = this.game.player;
    if (!this.helicopter) this.helicopter = { x: p.x + 300, y: p.y - 250, phase: 0 };
    const h = this.helicopter;
    h.phase += dt * 0.4;
    h.x = p.x + Math.cos(h.phase) * 360;
    h.y = p.y + Math.sin(h.phase) * 250 - 100;
    h.angle = Math.atan2(p.y - h.y, p.x - h.x);
  }

  updateHazards(dt) {
    this.hazardClock -= dt;
    if (this.hazards.length || this.hazardClock > 0) return;
    this.hazardClock = 22;
    const game = this.game;
    const p = game.player;
    const lane = game.city.nearestLane(p.x + Math.cos(p.face) * 260, p.y + Math.sin(p.face) * 260);
    if (!lane) return;
    this.hazards.push({ x: lane.x, y: lane.y, angle: Math.atan2(lane.edge.dy, lane.edge.dx), type: this.random() < 0.55 ? 'roadblock' : 'spikes' });
  }

  checkHazards() {
    const car = this.game.player.inVehicle;
    if (!car) return;
    for (const hazard of this.hazards) {
      if (dist(car.x, car.y, hazard.x, hazard.y) > 30) continue;
      if (hazard.type === 'spikes') {
        car.health = Math.max(0, car.health - 12);
        car.speed *= 0.6;
      } else {
        car.health = Math.max(0, car.health - 6);
        car.speed *= 0.45;
      }
      hazard.hit = true;
      if (car.health <= 0) car.explode(this.game.effects, this.game.wantedSystem);
    }
    this.hazards = this.hazards.filter((hazard) => !hazard.hit);
  }

  clearPursuit() {
    for (const car of this.units) if (car.pursuit) {
      car.pursuit = false;
      car.siren = 0;
    }
    this.officers.length = 0;
    this.helicopter = null;
    this.hazards.length = 0;
  }
}
