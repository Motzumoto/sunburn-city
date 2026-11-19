// SUNBURN CITY - Owns the world, game state, simulation and Canvas renderer.
// Owns the live world, state transitions, fixed-step simulation and ordered Canvas renderer.
import { MAX_DPR } from '../core/config.js';
import { Camera, ZOOM_IN_CAR, ZOOM_ON_FOOT } from '../core/camera.js';
import { Input } from '../core/input.js';
import { Random } from '../core/rng.js';
import { dist } from '../core/math.js';
import { City } from '../world/city.js';
import { Player } from '../entities/player.js';
import { Traffic } from '../entities/traffic.js';
import { Pedestrians } from '../entities/pedestrians.js';
import { PoliceSystem } from '../entities/police.js';
import { Combat } from '../entities/combat.js';
import { createPickups } from '../entities/pickups.js';
import { DayCycle } from './dayCycle.js';
import { WantedSystem } from './wanted.js';
import { TerrainCache } from '../render/terrain.js';
import { drawBuilding, drawBuildingNight } from '../render/buildings.js';
import { drawProp, drawPropNight } from '../render/props.js';
import { drawPerson, drawPersonShadow } from '../render/people.js';
import { drawVehicle, drawVehicleShadow, drawVehicleNight } from '../render/vehicles.js';
import { drawWater } from '../render/water.js';
import { paintShotBoulevard, paintWetReflections } from '../render/roadPainter.js';
import { Effects } from '../render/effects.js';
import { Lighting } from '../render/lighting.js';
import { HUD } from '../ui/hud.js';
import { setShotScene } from '../ui/shots.js';
import { drawObjectiveMarker } from '../ui/objective.js';
import { Dialogue } from '../ui/dialogue.js';
import { Screens } from '../ui/screens.js';
import { Missions } from './missions.js';
import { Activities } from './activities.js';
import { AudioEngine } from '../core/audio.js';
import { saveGame as persistGame } from './save.js';
import { CHARACTERS, INTRO_CARDS, EPILOGUE_CARDS } from './story.js';

export class Game {
  constructor(canvas, seed = 1) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: false });
    this.seed = seed >>> 0;
    this.random = new Random(this.seed);
    this.city = new City(this.seed);
    this.input = new Input();
    this.input.attach(window, canvas);
    this.camera = new Camera();
    this.day = new DayCycle();
    this.audio = new AudioEngine();
    this.effects = new Effects(this.seed);
    this.terrain = new TerrainCache(this.city);
    this.player = new Player(this.city.spawn.x, this.city.spawn.y, this.random.fork('player'));
    this.player.money = 12450;
    this.traffic = new Traffic(this.city, this.seed);
    this.pedestrians = new Pedestrians(this.city, this.seed);
    this.wantedSystem = new WantedSystem();
    this.combat = new Combat(this.effects);
    this.pickups = createPickups(this.city, this.seed);
    this.police = new PoliceSystem(this);
    this.player.hitFlash = 0;
    this.lighting = new Lighting();
    this.hud = new HUD();
    this.dialogueUI = new Dialogue();
    this.screens = new Screens();
    this.state = 'title';
    this.width = 1280;
    this.height = 720;
    this.dpr = 1;
    this.elapsed = 0;
    this.manualAccumulator = 0;
    this.wanted = 0;
    this.objective = { title: 'COSTA VELA', text: 'A city of sunlit streets and long nights.' };
    this.missionMarker = null;
    this.objectiveTarget = null;
    this.dialogue = null;
    this.radio = 'COSTA FM  ·  98.4';
    this.radioText = '';
    this.missionEnemies = [];
    this.missions = new Missions(this);
    this.activities = new Activities(this);
    this.introCards = INTRO_CARDS;
    this.epilogueCards = EPILOGUE_CARDS;
    this.introIndex = 0;
    this.epilogueIndex = 0;
    this.missionBanner = 0;
    this.footstepClock = 0;
    this.lastTyreSound = 0;
    this.renderScratch = [];
    this.shotProps = [];
    this.shotScene = null;
    this.shotZoom = 1.45;
    this.shotCameraOffset = 100;
    this.shotCameraTarget = { x: 0, y: 0 };
    this.lightView = { left: 0, top: 0, right: 0, bottom: 0 };
    this.titleOrigin = { x: this.player.x, y: this.player.y };
    this.resize();
    this.camera.snapTo(this.player.x, this.player.y);
    this.traffic.fillScene(this.player, 22, 700);
    this.pedestrians.populate(this.player, 32, 540);
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    this.width = Math.max(1, Math.floor(rect.width || window.innerWidth));
    this.height = Math.max(1, Math.floor(rect.height || window.innerHeight));
    this.dpr = Math.min(MAX_DPR, window.devicePixelRatio || 1);
    this.canvas.width = Math.round(this.width * this.dpr);
    this.canvas.height = Math.round(this.height * this.dpr);
    this.camera.resize(this.width, this.height);
    this.lighting.prepare(this.canvas.width, this.canvas.height);
  }

  setShot(name) {
    setShotScene(this, name);
  }

  character(id) {
    return CHARACTERS[id] || CHARACTERS.rico;
  }

  setObjective(title, text, target) {
    this.objective = { title, text };
    this.objectiveTarget = target || null;
    this.missionMarker = this.objectiveTarget;
  }

  saveGame() {
    const saved = persistGame(this);
    if (!saved) this.radio = 'SAVE FAILED';
    return saved;
  }

  newGame() {
    if (this.player.inVehicle) {
      const oldCar = this.player.inVehicle;
      oldCar.isPlayerCar = false;
      oldCar.driver = null;
      oldCar.parked = true;
      if (!this.city.parked.includes(oldCar)) this.city.parked.push(oldCar);
    }
    this.player.inVehicle = null;
    for (const car of this.police.units) {
      const i = this.traffic.cars.indexOf(car);
      if (i >= 0) this.traffic.cars.splice(i, 1);
    }
    if (this.activities.vigilante) {
      const i = this.traffic.cars.indexOf(this.activities.vigilante);
      if (i >= 0) this.traffic.cars.splice(i, 1);
    }
    this.activities.vigilante = null;
    this.activities.race = null;
    this.activityTarget = null;
    if (this.audio.sfx) this.audio.sfx.setVehicle(null);
    this.effects.clear();
    this.combat.bullets.length = 0;
    this.missionEnemies.length = 0;
    this.player.x = this.city.spawn.x;
    this.player.y = this.city.spawn.y;
    this.player.health = 100;
    this.player.armour = 35;
    this.player.money = 1000;
    this.player.weapon = 'PISTOL';
    this.player.ammo = 12;
    this.player.reserve = 72;
    this.player.speed = 0;
    this.player.hitFlash = 0;
    this.day.setHour(6.2);
    this.wantedSystem.setLevel(0);
    this.wanted = 0;
    this.police.resetScene();
    this.camera.snapTo(this.player.x, this.player.y);
    this.introIndex = 0;
    this.epilogueIndex = 0;
    this.missions.progress = 0;
    this.missions.completed.length = 0;
    this.missions.active = null;
    this.state = 'intro';
    this.setObjective('COSTA VELA', 'A new story begins at first light.', null);
  }

  beginEpilogue() {
    this.epilogueIndex = 0;
    this.state = 'epilogue';
    this.dialogueCard = null;
  }

  finishEpilogue() {
    this.state = 'playing';
    this.setObjective('FREE ROAM', 'The city is yours. Pick up another job.', null);
    this.saveGame();
  }

  update(dt) {
    this.elapsed += dt;
    const input = this.input;
    if (this.shotScene) {
      this.effects.update(dt);
      this.shotCameraTarget.x = this.player.x;
      this.shotCameraTarget.y = this.player.y - this.shotCameraOffset;
      this.camera.targetZoom = this.shotZoom;
      this.camera.update(dt, this.shotCameraTarget, null, 0);
      input.endTick();
      return;
    }
    if (!this.audio.started && (input.pressed.size || input.mouse.leftPressed)) this.audio.start();
    this.screens.update(this);

    if (this.state === 'playing') {
      if (this.player.inVehicle && (input.wheel || input.actionPressed('radio') || input.actionPressed('reload'))) {
        this.audio.setStation(this.audio.station + (input.wheel || 1));
        this.radioText = '';
      }
      if (this.player.inVehicle && input.actionPressed('horn')) this.audio.play('horn');
      if (input.actionPressed('interact')) {
        const handled = this.missions.interact() || this.activities.interact();
        if (!handled) {
          if (this.player.inVehicle) this.exitVehicle();
          else this.enterNearestVehicle();
        }
      }
      if (this.player.inVehicle) {
        const car = this.player.inVehicle;
        if (this.audio.sfx) this.audio.sfx.setVehicle(car);
        const wasDestroyed = car.destroyed;
        const oldHealth = car.health;
        car.update(dt, input, this.city, this.effects, this.traffic.cars.concat(this.city.parked), this.wantedSystem);
        if (!wasDestroyed && car.destroyed) this.audio.play('explosion');
        else if (car.health < oldHealth) this.audio.play('impact');
        if (car.drift && this.elapsed - this.lastTyreSound > 0.3) {
          this.audio.play('tyre');
          this.lastTyreSound = this.elapsed;
        }
        this.player.x = car.x;
        this.player.y = car.y;
        this.player.face = car.heading;
        this.player.speed = Math.abs(car.speed);
        if (car.destroyed) this.exitVehicle();
      } else {
        if (this.audio.sfx) this.audio.sfx.setVehicle(null);
        const ammo = this.player.ammo;
        const reloading = this.player.reloadTimer > 0;
        this.player.update(dt, input, this.city, this.camera, this.effects, this.pedestrians, this.combat, this.wantedSystem);
        if (this.player.ammo < ammo) this.audio.play('gunshot', { weapon: this.player.weapon });
        else if (reloading && this.player.reloadTimer === 0) this.audio.play('reload');
        this.footstepClock -= dt;
        if (this.player.speed > 0 && this.footstepClock <= 0) {
          const sand = this.city.groundAt(this.player.x, this.player.y) === 5;
          this.audio.play('footstep', { sand });
          this.footstepClock = sand ? 0.42 : 0.34;
        }
      }
      this.day.update(dt);
      this.traffic.update(dt, this.player, this.day, this.effects, this.player.inVehicle);
      this.pedestrians.update(dt, this.player, this.day, this.traffic.cars, this.wantedSystem);
      this.police.update(dt);
      this.combat.update(dt, this);
      this.wantedSystem.update(dt, this);
      this.police.checkHazards();
      this.updatePickups();
      this.activities.update(dt);
      this.missions.update(dt);
      this.player.hitFlash = Math.max(0, this.player.hitFlash - dt);
      if ((this.state === 'wasted' || this.state === 'busted') && this.missions.active) {
        this.endReason = this.state === 'busted' ? 'Lt. Voss had you in cuffs.' : 'Rico was taken out.';
        this.missions.fail(this.endReason);
      }
      this.missionBanner = Math.max(0, this.missionBanner - dt);
      this.audio.update(this, dt);
      if (this.audio.music) {
        this.radioStation = this.audio.music.label;
        this.radioText = this.audio.music.hostLine;
      }
      if ((this.state === 'wasted' || this.state === 'busted') && !this.missions.active) this.audio.setPaused(true);
    } else if (this.state === 'title') {
      this.day.update(dt);
      this.traffic.update(dt, this.player, this.day, this.effects);
      this.pedestrians.update(dt, this.player, this.day, this.traffic.cars, this.wantedSystem);
    }

    this.effects.update(dt);
    if (this.effects.shake > 0) {
      this.camera.addShake(this.effects.shake);
      this.effects.shake = 0;
    }
    const car = this.player.inVehicle;
    if (this.shotScene) {
      this.camera.targetZoom = this.shotZoom;
      this.shotCameraTarget.x = this.player.x;
      this.shotCameraTarget.y = this.player.y - this.shotCameraOffset;
      this.camera.update(dt, this.shotCameraTarget, null, 0);
    } else if (this.state === 'title') {
      const target = { x: this.titleOrigin.x + Math.sin(this.elapsed * 0.11) * 70, y: this.titleOrigin.y + Math.cos(this.elapsed * 0.08) * 42 };
      this.camera.update(dt, target, null, 0);
    } else {
      this.camera.targetZoom = car ? ZOOM_IN_CAR : ZOOM_ON_FOOT;
      this.camera.update(dt, this.player, car ? null : input.mouse, car ? Math.abs(car.speed) : 0);
    }
    input.endTick();
  }

  enterNearestVehicle() {
    let best = null;
    let bestDistance = 70;
    const candidates = this.traffic.cars.concat(this.city.parked);
    for (const car of candidates) {
      if (car.destroyed || car.parked === false && car.staged) continue;
      const d = dist(car.x, car.y, this.player.x, this.player.y);
      if (d < bestDistance) { best = car; bestDistance = d; }
    }
    if (!best) return;
    this.wantedSystem.crime('carjacking');
    this.wanted = this.wantedSystem.level;
    if (!this.traffic.cars.includes(best)) this.traffic.cars.push(best);
    best.parked = false;
    best.staged = false;
    best.isPlayerCar = true;
    best.driver = this.player;
    best.speed = 0;
    if (!best.route) {
      const lane = this.city.nearestLane(best.x, best.y);
      this.traffic.resetRoute(best, lane ? lane.edge.id : -1, lane ? lane.t : 0);
    }
    this.player.inVehicle = best;
    this.pedestrians.fleeFrom(best.x, best.y, 90, false);
    this.camera.targetZoom = ZOOM_IN_CAR;
  }

  exitVehicle() {
    const car = this.player.inVehicle;
    if (!car) return;
    car.speed = 0;
    car.isPlayerCar = false;
    car.driver = null;
    car.parked = true;
    const offsets = [0, Math.PI / 2, Math.PI, -Math.PI / 2, Math.PI / 4, -Math.PI / 4, 3 * Math.PI / 4, -3 * Math.PI / 4];
    let spot = null;
    for (const a of offsets) {
      const x = car.x + Math.cos(a) * 38;
      const y = car.y + Math.sin(a) * 38;
      if (this.city.isWalkable(x, y) && !this.city.blockedAt(x, y, 7, car)) { spot = { x, y }; break; }
    }
    if (!spot) spot = this.city.findWalkableNear(car.x + 42, car.y, 7);
    this.player.x = spot.x;
    this.player.y = spot.y;
    this.player.face = car.heading;
    this.player.inVehicle = null;
    if (!car.inCityHash) {
      const ext = car.halfExtents();
      this.city.hash.insert(car, car.x - ext.hx, car.y - ext.hy, car.x + ext.hx, car.y + ext.hy);
      car.inCityHash = true;
    }
    if (!this.city.parked.includes(car)) this.city.parked.push(car);
    this.camera.targetZoom = ZOOM_ON_FOOT;
  }

  render(alpha = 0, frameDt = 0) {
    const ctx = this.ctx;
    const dpr = this.dpr;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = '#122533';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    const k = dpr * this.camera.zoom;
    const tx = dpr * (this.width / 2 - this.camera.x * this.camera.zoom + this.camera.shakeX);
    const ty = dpr * (this.height / 2 - this.camera.y * this.camera.zoom + this.camera.shakeY);
    ctx.setTransform(k, 0, 0, k, tx, ty);
    const view = this.camera.view;
    this.lightView.left = view.left;
    this.lightView.top = view.top;
    this.lightView.right = view.right;
    this.lightView.bottom = view.bottom;
    this.terrain.draw(ctx, view, 2);
    if (this.shotScene === 'city') paintShotBoulevard(ctx, this.player.x, this.player.y, 560);
    if (this.shotScene === 'chase') paintWetReflections(ctx, this.city, view, this.day.sky.night, this.elapsed);
    drawWater(ctx, this.city, view, this.elapsed, this.day.sky.night);
    this.effects.drawGround(ctx, view);
    const objects = this.visibleObjects(view);
    for (const item of objects) {
      if (item.spec) drawVehicleShadow(ctx, item);
      else if (item.look) drawPersonShadow(ctx, item);
    }
    this.lighting.lights.clear();
    for (const item of objects) this.drawObject(ctx, item);
    if (this.state !== 'title') {
      if (this.objectiveTarget) drawObjectiveMarker(ctx, this.objectiveTarget, this.elapsed, this.camera.zoom);
      else if (this.activityTarget) drawObjectiveMarker(ctx, this.activityTarget, this.elapsed, this.camera.zoom);
      this.drawActivityMarkers(ctx, view);
    }
    this.effects.drawAir(ctx, view);
    this.effects.collectLights(this.lighting.lights, view);
    this.lighting.lights.draw(ctx, k, tx, ty);

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.lighting.applyTint(ctx, this.canvas.width, this.canvas.height, this.day.sky);
    this.lighting.applyGlow(ctx, this.canvas.width, this.canvas.height, this.day.sky);
    this.lighting.applyVignette(ctx, this.canvas.width, this.canvas.height, this.day.sky);
    this.lighting.applyGrade(ctx, this.canvas.width, this.canvas.height);
    this.lighting.applyFilmGrain(ctx, this.canvas.width, this.canvas.height);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (this.state === 'title') this.drawTitle(ctx);
    else {
      if (this.player.hitFlash > 0) {
        ctx.fillStyle = 'rgba(230,40,44,' + (this.player.hitFlash * 0.24).toFixed(3) + ')';
        ctx.fillRect(0, 0, this.width, this.height);
      }
      this.hud.draw(ctx, this, this.width, this.height);
    }
    this.screens.draw(ctx, this);
  }

  drawActivityMarkers(ctx, view) {
    for (const marker of this.activities.markers) {
      if (marker.hidden || marker.x < view.left - 30 || marker.x > view.right + 30 ||
        marker.y < view.top - 30 || marker.y > view.bottom + 30) continue;
      const color = marker.type === 'race' || marker.type === 'vigilante' ? '#62d8c8' : '#f2c45c';
      ctx.save();
      ctx.translate(marker.x, marker.y);
      ctx.fillStyle = 'rgba(11,19,29,0.82)';
      ctx.beginPath(); ctx.arc(0, 0, 11, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(0, 0, 7, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = color;
      ctx.font = '800 7px "Segoe UI", Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(marker.type === 'shop' ? '$' : marker.type === 'wash' ? 'W' :
        marker.type === 'safehouse' || marker.type === 'hospital' ? 'H' : marker.type === 'police' ? 'P' :
          marker.type === 'race' ? 'R' : 'V', 0, 2.5);
      ctx.restore();
    }
  }

  visibleObjects(view) {
    const out = this.city.queryRect(view.left - 220, view.top - 300, view.right + 220, view.bottom + 300, this.renderScratch);
    for (const car of this.traffic.cars) {
      if (!car.destroyed && car.x >= view.left - 100 && car.x <= view.right + 100 && car.y >= view.top - 130 && car.y <= view.bottom + 130) out.push(car);
    }
    for (const p of this.pedestrians.people) {
      if (p.x >= view.left - 30 && p.x <= view.right + 30 && p.y >= view.top - 30 && p.y <= view.bottom + 30) out.push(p);
    }
    for (const p of this.police.officers) {
      if (!p.down && p.x >= view.left - 30 && p.x <= view.right + 30 && p.y >= view.top - 30 && p.y <= view.bottom + 30) out.push(p);
    }
    for (const p of this.pickups) if (p.active && p.x >= view.left - 20 && p.x <= view.right + 20 && p.y >= view.top - 20 && p.y <= view.bottom + 20) out.push(p);
    for (const p of this.missionEnemies) if (!p.down && p.x >= view.left - 30 && p.x <= view.right + 30 && p.y >= view.top - 30 && p.y <= view.bottom + 30) out.push(p);
    for (const p of this.shotProps) if (p.x >= view.left - 220 && p.x <= view.right + 220 && p.y >= view.top - 220 && p.y <= view.bottom + 220) out.push(p);
    if (this.police.helicopter) out.push({ ...this.police.helicopter, kind: 'helicopter', sortY: this.police.helicopter.y - 20 });
    for (const hazard of this.police.hazards) out.push({ ...hazard, kind: 'hazard', sortY: hazard.y });
    if (!this.player.inVehicle) out.push(this.player.drawState());
    for (const cash of this.pedestrians.cash) {
      cash.sortY = cash.y + 1;
      if (cash.x >= view.left - 20 && cash.x <= view.right + 20 && cash.y >= view.top - 20 && cash.y <= view.bottom + 20) out.push({ ...cash, kind: 'cash' });
    }
    const sorted = [];
    const seen = new Set();
    for (const item of out) {
      if (seen.has(item)) continue;
      seen.add(item);
      if (this.shotScene && item.spec && !this.traffic.cars.includes(item)) continue;
      if (item.kind === 'building' || item.kind === 'prop') sorted.push(item);
      else if (item.spec && item.parked && !item.destroyed) sorted.push(item);
      else if (item.spec && this.traffic.cars.includes(item)) sorted.push(item);
      else if (item.look || item.kind === 'cash' || item.kind === 'pickup' || item.kind === 'helicopter' || item.kind === 'hazard') sorted.push(item);
    }
    sorted.sort((a, b) => a.sortY - b.sortY || (a.x || 0) - (b.x || 0));
    const playerCar = this.player.inVehicle;
    if (playerCar && playerCar.isPlayerCar) {
      const band = Math.floor(playerCar.sortY / 32);
      const index = sorted.indexOf(playerCar);
      if (index >= 0) {
        let end = index;
        while (end + 1 < sorted.length && Math.floor(sorted[end + 1].sortY / 32) === band) end++;
        sorted.splice(index, 1);
        sorted.splice(end, 0, playerCar);
      }
    }
    return sorted;
  }

  drawObject(ctx, item) {
    const night = this.day.sky.night;
    if (item.kind === 'building') {
      drawBuilding(ctx, item);
      if (night > 0.01) drawBuildingNight(ctx, item, night, this.elapsed, this.lighting.lights);
    } else if (item.kind === 'prop') {
      drawProp(ctx, item, this.elapsed);
      if (night > 0.01) drawPropNight(ctx, item, night, this.elapsed, this.lighting.lights);
    } else if (item.spec) {
      drawVehicle(ctx, item, this.elapsed);
      if (item.isPlayerCar && item.driver) {
        const p = item.driver.drawState();
        p.x = item.x + Math.cos(item.heading) * 5;
        p.y = item.y + Math.sin(item.heading) * 5;
        p.face = item.heading;
        p.armed = false;
        drawPerson(ctx, p);
      }
      drawVehicleNight(ctx, item, night, this.elapsed, this.lighting.lights);
    } else if (item.look) drawPerson(ctx, item);
    else if (item.kind === 'cash') drawCash(ctx, item, this.elapsed);
    else if (item.kind === 'pickup') drawPickup(ctx, item, this.elapsed);
    else if (item.kind === 'helicopter') drawHelicopter(ctx, item, this.player);
    else if (item.kind === 'hazard') drawHazard(ctx, item);
  }

  drawTitle(ctx) {
    const g = ctx.createLinearGradient(0, 90, 0, this.height - 70);
    g.addColorStop(0, 'rgba(9,17,29,0.12)');
    g.addColorStop(0.5, 'rgba(9,17,29,0.55)');
    g.addColorStop(1, 'rgba(9,17,29,0.86)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, this.width, this.height);
  }

  step(milliseconds) {
    this.manualAccumulator += Math.max(0, Math.min(1000, milliseconds)) / 1000;
    const dt = 1 / 60;
    while (this.manualAccumulator >= dt) {
      this.update(dt);
      this.manualAccumulator -= dt;
    }
    this.render(0, milliseconds / 1000);
  }

  updatePickups() {
    for (const pickup of this.pickups) {
      if (!pickup.active || dist(this.player.x, this.player.y, pickup.x, pickup.y) > 18) continue;
      if (pickup.type === 'health') this.player.health = Math.min(100, this.player.health + 35);
      else this.player.armour = Math.min(100, this.player.armour + 35);
      pickup.active = false;
      this.radio = pickup.type === 'health' ? 'HEALTH RESTORED' : 'ARMOUR RESTORED';
    }
  }

  damagePlayer(amount) {
    const absorbed = Math.min(this.player.armour, amount * 0.7);
    this.player.armour -= absorbed;
    this.player.health = Math.max(0, this.player.health - (amount - absorbed));
    this.player.hitFlash = 0.35;
    this.camera.addShake(0.18);
    if (this.player.health <= 0) {
      this.endReason = 'Rico was taken out in the street.';
      this.state = 'wasted';
    }
  }

  retry() {
    const bust = this.state === 'busted';
    const respawn = bust ? this.activities.policeStation : this.activities.hospital;
    if (this.player.inVehicle) this.exitVehicle();
    this.state = 'playing';
    this.player.money = Math.max(0, this.player.money - 150);
    this.player.x = respawn.x;
    this.player.y = respawn.y;
    this.player.inVehicle = null;
    this.player.health = 100;
    this.player.armour = 64;
    this.player.ammo = 12;
    this.player.speed = 0;
    this.player.hitFlash = 0;
    this.player.reserve = 72;
    this.wantedSystem.arrestProgress = 0;
    this.wantedSystem.setLevel(0);
    this.wanted = 0;
    this.combat.bullets.length = 0;
    this.police.clearPursuit();
    this.camera.snapTo(this.player.x, this.player.y, ZOOM_ON_FOOT);
    this.objective = { title: 'COSTA VELA', text: 'Keep moving. The city is yours to explore.' };
    this.objectiveTarget = null;
    this.audio.setPaused(false);
  }
}

function drawCash(ctx, item, time) {
  const y = item.y + Math.sin(time * 4 + item.phase) * 2;
  ctx.save();
  ctx.translate(item.x, y);
  ctx.rotate(Math.sin(time * 2 + item.phase) * 0.08);
  ctx.fillStyle = '#f2c34e';
  ctx.fillRect(-6, -3, 12, 6);
  ctx.fillStyle = '#fff2a1';
  ctx.fillRect(-3, -2, 6, 4);
  ctx.restore();
}

function drawPickup(ctx, item, time) {
  const pulse = 1 + Math.sin(time * 4 + item.x) * 0.12;
  ctx.save();
  ctx.translate(item.x, item.y);
  ctx.scale(pulse, pulse);
  ctx.fillStyle = item.type === 'health' ? '#f16b60' : '#4ec7d4';
  ctx.beginPath();
  ctx.arc(0, 0, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#fff2df';
  ctx.lineWidth = 2.2;
  if (item.type === 'health') {
    ctx.beginPath(); ctx.moveTo(-4, 0); ctx.lineTo(4, 0); ctx.moveTo(0, -4); ctx.lineTo(0, 4); ctx.stroke();
  } else ctx.strokeRect(-3.5, -4, 7, 8);
  ctx.restore();
}

function drawHelicopter(ctx, heli, player) {
  ctx.save();
  ctx.fillStyle = 'rgba(255,244,190,0.12)';
  ctx.beginPath();
  ctx.moveTo(heli.x, heli.y);
  ctx.lineTo(player.x - 55, player.y + 70);
  ctx.lineTo(player.x + 55, player.y + 70);
  ctx.closePath();
  ctx.fill();
  ctx.translate(heli.x, heli.y);
  ctx.rotate(heli.angle);
  ctx.fillStyle = '#26394b';
  ctx.beginPath(); ctx.ellipse(0, 0, 23, 12, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#5ab7c8';
  ctx.fillRect(4, -7, 10, 14);
  ctx.strokeStyle = '#1c2936';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(-18, 0); ctx.lineTo(-34, 0); ctx.moveTo(0, -18); ctx.lineTo(0, 18); ctx.stroke();
  ctx.restore();
}

function drawHazard(ctx, hazard) {
  ctx.save();
  ctx.translate(hazard.x, hazard.y);
  ctx.rotate(hazard.angle);
  ctx.fillStyle = hazard.type === 'spikes' ? '#68747d' : '#f3a949';
  ctx.fillRect(-28, -10, 56, 20);
  if (hazard.type === 'spikes') {
    ctx.fillStyle = '#e9e3ce';
    for (let x = -24; x <= 24; x += 8) {
      ctx.beginPath(); ctx.moveTo(x, -8); ctx.lineTo(x + 4, -15); ctx.lineTo(x + 7, -8); ctx.fill();
    }
  } else {
    ctx.strokeStyle = '#fff0d6';
    ctx.lineWidth = 2;
    for (let x = -20; x <= 20; x += 20) { ctx.beginPath(); ctx.moveTo(x, -8); ctx.lineTo(x, 8); ctx.stroke(); }
  }
  ctx.restore();
}
