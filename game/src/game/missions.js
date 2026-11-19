// SUNBURN CITY - Advances missions through the live world and entities.
// Mission progression uses the same live world and entities as free roam.
import { dist } from '../core/math.js';
import { MISSIONS } from './story.js';

export class Missions {
  constructor(game) {
    this.game = game;
    this.progress = 0;
    this.completed = [];
    this.active = null;
    this.stage = 0;
    this.timer = 0;
    this.detection = 0;
    this.tailLost = 0;
    this.tailRouteComplete = false;
    this.cargo = 100;
    this.lastVehicleHealth = 100;
    this.enemies = [];
    this.wave = 0;
    this.targetCar = null;
    this.targets = [];
  }

  reconcile() {
    this.completed = MISSIONS.filter((m) => this.completed.includes(m.id)).map((m) => m.id);
    this.progress = Math.max(this.progress, this.completed.length);
    this.progress = Math.min(this.progress, MISSIONS.length);
  }

  pointInDistrict(id, anchor = [2500, 2500]) {
    const city = this.game.city;
    let best = null;
    let bestScore = Infinity;
    for (const block of city.blocks) {
      if (block.district.id !== id || block.kind === 'landmark') continue;
      const x = (block.x0 + block.x1) / 2;
      const y = (block.y0 + block.y1) / 2;
      const score = Math.hypot(x - anchor[0], y - anchor[1]) + (block.kind === 'park' ? 0 : 1);
      if (score < bestScore) { best = { x, y }; bestScore = score; }
    }
    if (!best) best = { x: anchor[0], y: anchor[1] };
    return city.findWalkableNear(best.x, best.y, 7);
  }

  start() {
    this.progress = 0;
    this.completed.length = 0;
    this.startCurrent();
  }

  startCurrent() {
    const g = this.game;
    if (this.progress >= MISSIONS.length) {
      g.beginEpilogue();
      return;
    }
    this.clearMissionWorld();
    this.active = MISSIONS[this.progress];
    this.missionStart = { x: g.player.x, y: g.player.y };
    this.stage = 0;
    this.timer = 0;
    this.detection = 0;
    this.tailLost = 0;
    this.tailRouteComplete = false;
    this.cargo = 100;
    this.wave = 0;
    this.enemies.length = 0;
    this.targetCar = null;
    this.targets.length = 0;
    this.prepareMission();
    g.state = 'briefing';
    g.dialogueCard = { character: g.character(this.active.speaker), title: this.active.name.toUpperCase(), lines: this.active.lines };
    g.missionMarker = this.currentTarget();
    g.setObjective(this.active.name, this.stageText(), this.currentTarget());
    g.saveGame();
  }

  restoreObjective() {
    if (this.progress >= MISSIONS.length) {
      this.active = null;
      this.game.setObjective('FREE ROAM', 'The city is yours. Pick up another job.', null);
      return;
    }
    this.active = MISSIONS[this.progress];
    this.missionStart = { x: this.game.player.x, y: this.game.player.y };
    this.stage = 0;
    this.prepareMission();
    this.game.setObjective(this.active.name, this.stageText(), this.currentTarget());
  }

  continueBriefing() {
    this.game.state = 'playing';
    this.game.missionBanner = 2.4;
  }

  prepareMission() {
    const g = this.game;
    const at = (id, anchor) => this.pointInDistrict(id, anchor);
    switch (this.active.id) {
      case 'first-light':
        this.targets = [at('palms', [700, 2300]), at('palms', [1050, 1800])];
        break;
      case 'marina-job': {
        const marina = g.city.landmark('marina') || { x: 4300, y: 4300 };
        const carSpot = g.city.findWalkableNear(marina.x, marina.y - 100, 8);
        this.targetCar = g.traffic.addCar('sport', carSpot.x, carSpot.y, -Math.PI / 2, '#f44943', { parked: true, staged: true });
        this.targetCar.parked = true;
        this.targetCar.staged = true;
        this.targetCar.named = 'MARINA VIENTO SS';
        this.targets = [carSpot, at('yards', [700, 3700])];
        break;
      }
      case 'the-tail': {
        const start = at('neon', [3920, 2850]);
        this.targetCar = g.traffic.addCar('coupe', start.x, start.y, 0, '#267ac7', { staged: true });
        this.targetCar.named = "DANTE'S CADIZ GT";
        const p1 = at('neon', [4120, 3150]);
        const p2 = at('neon', [3800, 3300]);
        const p3 = at('neon', [4070, 2800]);
        this.targets = [p1, p2, p3];
        this.targetCar.routePoints = this.targets.map((point) => ({ ...point }));
        break;
      }
      case 'boardwalk-hold-out': {
        const strip = g.city.strips.find((s) => s.kind === 'beach');
        this.targets = [{ x: (strip.x0 + strip.x1) / 2, y: strip.y0 + 145 }];
        this.targets[0] = g.city.findWalkableNear(this.targets[0].x, this.targets[0].y, 7);
        break;
      }
      case 'cold-delivery':
        this.targets = [at('oldtown', [1450, 2400]), at('marina', [4300, 3950])];
        this.timer = 175;
        break;
      case 'the-yards-run': {
        const start = at('yards', [750, 3700]);
        this.targetCar = g.traffic.addCar('coupe', start.x + 120, start.y + 70, 0, '#267ac7', { staged: true });
        this.targetCar.named = "DANTE'S CADIZ GT";
        this.targetCar.health = 210;
        this.targetCar.maxHealth = 210;
        this.targetCar.routePoints = [at('yards', [950, 3900]), at('yards', [650, 3300]), at('yards', [1050, 3750])];
        this.targets = [start];
        break;
      }
      case 'annex-break-in': {
        const bank = g.city.landmark('costa_trust') || { x: 2400, y: 3450 };
        const annex = g.city.findWalkableNear(bank.x, bank.y + 95, 7);
        this.targets = [annex, at('yards', [800, 3600])];
        break;
      }
      case 'costa-trust-score': {
        const bank = g.city.landmark('costa_trust') || { x: 2400, y: 3450 };
        this.targets = [g.city.findWalkableNear(bank.x, bank.y + 95, 7), at('yards', [800, 3600])];
        break;
      }
      default:
        this.targets = [];
    }
  }

  currentTarget() {
    if (!this.active) return null;
    if (this.active.id === 'the-tail' && this.targetCar && !this.targetCar.destroyed) return this.targetCar;
    if (this.active.id === 'the-yards-run' && this.targetCar && !this.targetCar.destroyed && this.stage === 1) return this.targetCar;
    if (this.active.id === 'marina-job' && this.stage === 0) return this.targetCar;
    if (this.active.id === 'annex-break-in' && this.stage === 1) return this.targets[0];
    if (this.active.id === 'annex-break-in' && this.stage === 2) return this.targets[1];
    if (this.active.id === 'costa-trust-score' && this.stage === 1) return this.targets[0];
    if (this.active.id === 'costa-trust-score' && this.stage === 2) return this.targetCar;
    if (this.active.id === 'costa-trust-score' && this.stage === 3) return this.targets[1];
    if (this.active.id === 'boardwalk-hold-out' && this.stage > 0) return null;
    return this.targets[this.stage] || null;
  }

  stageText() {
    const a = this.active;
    if (!a) return '';
    const labels = {
      'first-light': ['Pick up Marisol’s package', 'Deliver the package'],
      'marina-job': ['Steal the named Viento SS', 'Deliver it to the Yards'],
      'the-tail': ['Follow Dante through Neon Row', 'Keep following Dante', 'Keep following Dante'],
      'boardwalk-hold-out': ['Reach the boardwalk', 'Survive the Sosa crew'],
      'cold-delivery': ['Pick up the sealed case', 'Deliver the fragile cargo'],
      'the-yards-run': ['Find Dante’s car', 'Wreck Dante’s Cadiz GT'],
      'annex-break-in': ['Reach the Costa Trust annex', 'Take the ledger', 'Escape the three-star response'],
      'costa-trust-score': ['Reach the Costa Trust tower', 'Take the vault cash', 'Get to the getaway', 'Reach the escape route'],
    };
    return (labels[a.id] || [a.name])[this.stage] || a.name;
  }

  update(dt) {
    if (!this.active || this.game.state !== 'playing') return;
    const g = this.game;
    if (!(this.active.id === 'costa-trust-score' && this.stage === 3) &&
      (this.active.id !== 'cold-delivery' || this.stage > 0)) this.timer = Math.max(0, this.timer - dt);
    if (this.active.id === 'cold-delivery' && this.stage === 1 && g.wantedSystem.level < 2) g.wantedSystem.setLevel(2);
    if (this.active.id === 'annex-break-in' && this.stage === 2 && g.wantedSystem.level < 3) g.wantedSystem.setLevel(3);
    if (this.active.id === 'costa-trust-score' && this.stage >= 2 && g.wantedSystem.level < 5) g.wantedSystem.setLevel(5);
    if (this.active.id === 'marina-job' && this.stage === 0 && g.player.inVehicle === this.targetCar) this.advance();
    if (this.active.id === 'costa-trust-score' && this.stage === 2 && g.player.inVehicle === this.targetCar) this.advance();
    if (this.active.id === 'cold-delivery') {
      if (this.stage === 1 && g.player.inVehicle) {
        const health = g.player.inVehicle.health;
        this.cargo = Math.max(0, this.cargo - Math.max(0, this.lastVehicleHealth - health) * 1.25);
        this.lastVehicleHealth = health;
      }
      if (this.timer <= 0) return this.fail('The delivery window closed.');
      if (this.cargo <= 0) return this.fail('The sealed cargo was destroyed.');
    }
    if (this.active.id === 'marina-job' && this.targetCar &&
      (this.targetCar.destroyed || this.targetCar.health < 24)) return this.fail('The Viento SS was wrecked.');
    if (this.active.id === 'the-tail') this.updateTail(dt);
    if (!this.active) return;
    if (this.active.id === 'boardwalk-hold-out') this.updateWaves(dt);
    if (!this.active) return;
    if (this.active.id === 'the-yards-run') this.updateChase(dt);
    if (!this.active || g.state !== 'playing') return;
    const target = this.currentTarget();
    if (!target || this.active.id === 'boardwalk-hold-out' && this.stage > 0) return;
    const d = dist(g.player.x, g.player.y, target.x, target.y);
    if (this.active.id === 'costa-trust-score' && this.stage === 3) {
      this.timer = d < 54 ? this.timer + dt : 0;
      if (this.timer > 3) this.complete();
      return;
    }
    const radius = this.active.id === 'marina-job' && this.stage === 0 ? 46 : 54;
    if (d < radius && this.autoAdvance()) this.advance();
  }

  autoAdvance() {
    return this.active.id === 'first-light' || this.active.id === 'cold-delivery' ||
      this.active.id === 'marina-job' && this.stage === 1 ||
      this.active.id === 'annex-break-in' && (this.stage === 0 || this.stage === 2) ||
      this.active.id === 'the-yards-run' && this.stage === 0 ||
      this.active.id === 'costa-trust-score' && this.stage === 0;
  }

  interact() {
    const g = this.game;
    if (!this.active || g.state !== 'playing') return false;
    const target = this.currentTarget();
    if (!target || dist(g.player.x, g.player.y, target.x, target.y) > 56) return false;
    const id = this.active.id;
    if (id === 'first-light' && this.stage === 0 || id === 'cold-delivery' && this.stage === 0) {
      this.advance();
    } else if (id === 'marina-job' && this.stage === 0 && g.player.inVehicle === this.targetCar) {
      this.advance();
    } else if (id === 'annex-break-in' && this.stage === 1) {
      this.advance();
      g.wantedSystem.setLevel(3);
      g.wanted = 3;
    } else if (id === 'costa-trust-score' && this.stage === 1) {
      if (g.player.inVehicle) g.exitVehicle();
      this.advance();
      g.wantedSystem.setLevel(5);
      g.wanted = 5;
      this.targetCar = g.traffic.addCar('sport', g.player.x + 48, g.player.y + 24, 0, '#f44943', { parked: true, staged: true });
      this.targetCar.parked = true;
      this.targetCar.named = 'GETAWAY VIENTO';
      this.refreshObjective();
    } else return false;
    return true;
  }

  updateTail(dt) {
    const car = this.targetCar;
    if (!car || car.destroyed) return this.fail('Dante lost you in Neon Row.');
    let d = dist(this.game.player.x, this.game.player.y, car.x, car.y);
    if (d > 520) {
      this.tailLost = 0;
      return;
    }
    if (car.routePoints && car.routePoints.length) {
      const target = car.routePoints[0];
      const targetDistance = dist(car.x, car.y, target.x, target.y);
      if (targetDistance < 26) {
        car.routePoints.shift();
        this.stage = Math.min(2, 3 - car.routePoints.length);
        this.refreshObjective();
        if (!car.routePoints.length) {
          this.tailRouteComplete = true;
        }
      }
      if (!this.tailRouteComplete) {
        const angle = Math.atan2(target.y - car.y, target.x - car.x);
        car.heading = angle;
        car.speed = 74;
        car.x += Math.cos(angle) * car.speed * dt;
        car.y += Math.sin(angle) * car.speed * dt;
        car.sortY = car.y + car.spec.l * 0.35;
      }
    }
    d = dist(this.game.player.x, this.game.player.y, car.x, car.y);
    if (d < 92) this.detection += dt * (92 - d) / 42;
    else this.detection = Math.max(0, this.detection - dt * 0.55);
    this.tailLost = d > 380 ? (this.tailLost || 0) + dt : 0;
    if (this.tailLost > 5) return this.fail('You lost Dante in the city traffic.');
    if (this.detection >= 2.8) this.fail('Dante spotted you tailing him.');
    if (this.tailRouteComplete && d < 380) this.complete();
  }

  updateWaves(dt) {
    if (!this.wave && dist(this.game.player.x, this.game.player.y, this.targets[0].x, this.targets[0].y) < 150) {
      this.stage = 1;
      this.refreshObjective();
      this.spawnWave();
    }
    for (const enemy of this.enemies) {
      if (enemy.down) continue;
      enemy.shootClock -= dt;
      const d = dist(enemy.x, enemy.y, this.game.player.x, this.game.player.y);
      if (d < 480 && enemy.shootClock <= 0) {
        enemy.shootClock = 1.1 + (this.enemies.indexOf(enemy) % 3) * 0.2;
        const angle = Math.atan2(this.game.player.y - enemy.y, this.game.player.x - enemy.x);
        this.game.combat.fire(enemy, angle, { x: enemy.x, y: enemy.y, damage: 11, speed: 610, range: 520, color: '#ffb56c' });
      }
    }
    this.enemies = this.enemies.filter((enemy) => !enemy.down);
    this.game.missionEnemies = this.game.missionEnemies.filter((enemy) => !enemy.down);
    if (this.wave && !this.enemies.length && this.wave < 3) this.spawnWave();
    else if (this.wave === 3 && !this.enemies.length) this.complete();
  }

  spawnWave() {
    const g = this.game;
    this.wave++;
    const center = this.targets[0];
    const count = this.wave + 2;
    for (let i = 0; i < count; i++) {
      const a = i / count * Math.PI * 2;
      const spot = g.city.findWalkableNear(center.x + Math.cos(a) * 120, center.y + Math.sin(a) * 120, 6);
      const enemy = {
        id: 'sosa-' + this.wave + '-' + i, x: spot.x, y: spot.y, face: 0, aim: 0, walk: 0, speed: 0,
        look: { shirt: i % 2 ? '#a44759' : '#37364c', sleeve: '#b76470', pants: '#222b3b', shoes: '#1d2027', skin: '#bd805e', hair: '#241a21' },
        armed: true, punch: 0, health: 35, down: false, hostile: true, shootClock: 0.5 + i * 0.17, sortY: spot.y + 2,
      };
      this.enemies.push(enemy);
      g.missionEnemies.push(enemy);
    }
    g.pickups.push({ kind: 'pickup', x: center.x + (this.wave % 2 ? 40 : -40), y: center.y, type: this.wave % 2 ? 'health' : 'armour', active: true, sortY: center.y + 2 });
    g.radio = 'BOARDWALK  ·  WAVE ' + this.wave + ' / 3';
  }

  updateChase(dt) {
    const car = this.targetCar;
    if (!car || car.destroyed || car.health <= 0) {
      if (car) {
        car.destroyed = true;
        car.exploded = true;
        this.complete();
      } else this.fail('Dante escaped the Yards.');
      return;
    }
    if (car.routePoints && car.routePoints.length) {
      const target = car.routePoints[0];
      if (dist(car.x, car.y, target.x, target.y) < 34) car.routePoints.shift();
      const angle = Math.atan2(target.y - car.y, target.x - car.x);
      car.heading = angle;
      car.speed = Math.max(55, car.speed);
      car.x += Math.cos(angle) * car.speed * dt;
      car.y += Math.sin(angle) * car.speed * dt;
      car.sortY = car.y + car.spec.l * 0.35;
    }
  }

  advance() {
    if (!this.active) return;
    const id = this.active.id;
    if (id === 'first-light' || id === 'cold-delivery') {
      if (this.stage === 0) this.stage = 1;
      else this.complete();
    } else if (id === 'marina-job' && this.stage === 0) this.stage = 1;
    else if (id === 'marina-job' && this.stage === 1) this.complete();
    else if (id === 'annex-break-in' && this.stage < 2) this.stage++;
    else if (id === 'annex-break-in' && this.stage === 2) this.complete();
    else if (id === 'the-yards-run' && this.stage === 0) this.stage = 1;
    else if (id === 'costa-trust-score' && this.stage < 3) this.stage++;
    else if (id === 'costa-trust-score' && this.stage === 3) this.complete();
    else return;

    if (!this.active) return;
    if (id === 'costa-trust-score' && this.stage === 3) this.timer = 0;
    if (this.stage === 1 && id === 'cold-delivery') {
      this.game.wantedSystem.setLevel(2);
      this.game.wanted = 2;
      this.lastVehicleHealth = this.game.player.inVehicle ? this.game.player.inVehicle.health : 100;
    }
    this.refreshObjective();
  }

  refreshObjective() {
    const g = this.game;
    const target = this.currentTarget();
    g.missionMarker = target;
    g.setObjective(this.active.name, this.stageText(), target);
  }

  complete() {
    const g = this.game;
    if (!this.active) return;
    const mission = this.active;
    if (!this.completed.includes(mission.id)) this.completed.push(mission.id);
    this.progress = Math.min(MISSIONS.length, this.progress + 1);
    g.player.money += mission.reward;
    g.audio.play('missionComplete');
    g.wantedSystem.setLevel(0);
    g.wanted = 0;
    g.police.clearPursuit();
    this.clearMissionWorld();
    this.active = null;
    g.objectiveTarget = null;
    g.missionMarker = null;
    g.objective = { title: 'MISSION COMPLETE', text: mission.name + '  ·  +$' + mission.reward.toLocaleString('en-US') };
    g.missionCompleteName = mission.name;
    g.missionCompleteReward = mission.reward;
    g.state = 'missioncomplete';
    g.saveGame();
  }

  fail(reason) {
    if (!this.active || this.game.state === 'missionfailed') return;
    this.game.missionFailedReason = reason;
    this.game.state = 'missionfailed';
    this.game.audio.setPaused(true);
  }

  retry() {
    const car = this.game.player.inVehicle;
    if (car === this.targetCar) {
      car.isPlayerCar = false;
      car.driver = null;
      this.game.player.inVehicle = null;
    } else if (car) this.game.exitVehicle();
    this.clearMissionWorld();
    this.game.player.health = 100;
    this.game.player.armour = Math.max(40, this.game.player.armour - 15);
    this.game.player.money = Math.max(0, this.game.player.money - 150);
    this.game.player.inVehicle = null;
    this.game.player.x = this.missionStart ? this.missionStart.x : this.game.city.spawn.x;
    this.game.player.y = this.missionStart ? this.missionStart.y : this.game.city.spawn.y;
    this.game.wantedSystem.setLevel(0);
    this.game.police.clearPursuit();
    this.game.camera.snapTo(this.game.player.x, this.game.player.y);
    this.startCurrent();
  }

  continueAfterComplete() {
    if (this.progress >= MISSIONS.length) return this.game.beginEpilogue();
    this.startCurrent();
  }

  clearMissionWorld() {
    const g = this.game;
    for (const enemy of this.enemies) enemy.down = true;
    this.enemies.length = 0;
    g.missionEnemies.length = 0;
    if (this.targetCar && !this.targetCar.isPlayerCar) {
      this.targetCar.destroyed = true;
      const i = g.traffic.cars.indexOf(this.targetCar);
      if (i >= 0) g.traffic.cars.splice(i, 1);
      this.targetCar = null;
    }
  }
}
