// Deterministic screenshot scenes assembled from the live city and entity systems.
import { dist } from '../core/math.js';
import { makeProp } from '../world/propsGen.js';

export const SHOT_NAMES = ['city', 'chase', 'mission', 'heist'];

export function setShotScene(game, name) {
  if (!SHOT_NAMES.includes(name)) throw new Error('Unknown screenshot scene: ' + name);
  game.state = 'playing';
  game.day.frozen = true;
  game.traffic.cars.length = 0;
  game.pedestrians.people.length = 0;
  game.pedestrians.cash.length = 0;
  game.effects.clear();
  game.combat.bullets.length = 0;
  game.wantedSystem.setLevel(0);
  game.wanted = 0;
  game.missionMarker = null;
  game.police.resetScene();
  game.dialogue = null;
  game.objective = null;
  game.player.inVehicle = null;
  game.player.shotArmed = false;
  game.player.aimLocked = false;
  game.player.health = 100;
  game.player.armour = 64;
  game.player.ammo = 12;
  game.player.reserve = 72;
  game.player.money = 12450;
  game.player.face = 0;
  game.player.aim = 0;
  game.player.speed = 0;

  if (name === 'city') cityScene(game);
  else if (name === 'chase') chaseScene(game);
  else if (name === 'mission') missionScene(game);
  else heistScene(game);

  game.camera.snapTo(game.player.x, game.player.y, game.player.inVehicle ? 0.82 : name === 'heist' ? 0.98 : 1.18);
  game.camera.resize(game.width, game.height);
  game.terrain.prewarm(game.ctx, game.camera.view);
  game.update(1 / 60);
  game.render(0, 1 / 60);
}

function cityScene(game) {
  game.day.setHour(17.5);
  const y = game.city.grid.ys[3];
  const lane = laneNear(game, 2500, y, (edge) => edge.dx > 0) || laneNear(game, 2500, y);
  const x = lane ? lane.x : 2500;
  const py = lane ? lane.y : y + 34;
  const car = stagePlayerCar(game, 'sport', x, py, 0, '#ff624e');
  car.speed = 46;
  game.player.x = car.x;
  game.player.y = car.y;
  game.player.face = 0;
  game.player.inVehicle = car;
  game.traffic.fillScene(car, 55, 460);
  stageNearLanes(game, x, py, 8);
  fillDenseScene(game, x, py, 52, 620);
  game.pedestrians.populate(game.player, 75, 480);
  for (let i = 0; i < 6; i++) {
    const side = i < 3 ? -1 : 1;
    const n = i % 3;
    const sidewalk = game.city.findWalkableNear(x - 90 + n * 82, py + side * 108, 6);
    const person = game.pedestrians.people[i];
    if (person && sidewalk) {
      person.x = sidewalk.x;
      person.y = sidewalk.y;
      person.targetX = sidewalk.x + (n - 1) * 55;
      person.targetY = sidewalk.y + side * 14;
      person.sortY = sidewalk.y + 2;
    }
  }
  game.objective = { title: 'FREE ROAM', text: 'Take the long way along the coast.' };
  game.radio = 'SUNSET DRIVE  ·  98.4';
}

function chaseScene(game) {
  game.day.setHour(19.15);
  const lane = laneNear(game, 3970, 2860, (edge) => edge.dx > 0) || laneNear(game, 3970, 2860);
  const x = lane ? lane.x : 3970;
  const y = lane ? lane.y : 2860;
  const angle = lane ? Math.atan2(lane.edge.dy, lane.edge.dx) : 0;
  const bx = Math.cos(angle);
  const by = Math.sin(angle);
  const car = stagePlayerCar(game, 'coupe', x, y, angle, '#25a9a0');
  car.speed = 214;
  car.slip = 0.08;
  game.player.x = x;
  game.player.y = y;
  game.player.inVehicle = car;
  game.player.face = angle;
  game.police.stagePursuit(2, x, y, angle, 80);
  game.traffic.fillScene(car, 18, 620);
  game.pedestrians.populate(game.player, 29, 560);
  game.wantedSystem.setLevel(3);
  game.wanted = 3;
  game.objective = { title: 'WANTED  ·  NEON ROW', text: 'Lose the tail. Reach the marina.' };
  const marina = game.city.landmark('marina');
  if (marina) game.missionMarker = { x: marina.x, y: marina.y };
  game.radio = 'POLICE BAND  ·  STATIC';
  for (let i = 0; i < 34; i++) {
    const d = 8 + i * 7;
    const sx = x - bx * d;
    const sy = y - by * d;
    game.effects.skid(sx - 6, sy - 4, sx - bx * 9 - 6, sy - by * 9 - 4, 2.8);
    game.effects.skid(sx + 6, sy + 4, sx - bx * 9 + 6, sy - by * 9 + 4, 2.8);
  }
  for (let i = 0; i < 10; i++) game.effects.smoke(x - bx * (38 + i * 13), y - by * (38 + i * 13), -bx * 40, -by * 40, 8);
}

function missionScene(game) {
  game.day.setHour(21.3);
  const strip = game.city.strips.find((item) => item.kind === 'beach' && 2250 >= item.x0 && 2250 <= item.x1) || game.city.strips[2];
  const x = strip ? (strip.x0 + strip.x1) / 2 : 2450;
  const y = strip ? strip.y0 + 56 : 4260;
  const spot = game.city.findWalkableNear(x, y, 7);
  if (!game.missionPier) {
    game.city.addPier({ x0: spot.x + 126, x1: spot.x + 142, y0: spot.y + 128, y1: spot.y + 270 });
    game.city.addProp(makeProp('lamp', spot.x + 127, spot.y + 155, null, { side: 'left' }));
    game.city.addProp(makeProp('lamp', spot.x + 127, spot.y + 216, null, { side: 'left' }));
    game.missionPier = true;
  }
  game.player.x = spot.x;
  game.player.y = spot.y;
  game.player.face = -0.22;
  game.player.aim = -0.22;
  game.player.armed = true;
  game.player.shotArmed = true;
  game.player.aimLocked = true;
  game.camera.snapTo(spot.x, spot.y, 1.18);
  game.pedestrians.populate(game.player, 39, 440);
  for (let i = 0; i < Math.min(3, game.pedestrians.people.length); i++) {
    const person = game.pedestrians.people[i];
    const away = game.city.findWalkableNear(spot.x + (i - 1) * 38, spot.y + 24, 6);
    person.x = away.x;
    person.y = away.y;
    person.targetX = away.x + (i - 1) * 90;
    person.targetY = away.y + 80;
    person.state = 'flee';
    person.flee = 3;
    person.face = Math.atan2(person.targetY - person.y, person.targetX - person.x);
  }
  game.objective = { title: 'THE BOARDWALK', text: 'Talk to Marisol about the missing ledger.' };
  const marker = game.city.landmark('pier9');
  if (marker) game.missionMarker = { x: marker.x, y: marker.y };
  game.dialogue = { name: 'MARISOL VEGA', lines: [
    'You said this was a clean job. The whole waterfront is talking.',
    'Meet me by the old lighthouse before the tide turns.',
  ] };
  game.radio = 'LOW TIDE  ·  91.2';
}

function heistScene(game) {
  game.day.setHour(13.1);
  const bank = game.city.landmark('costa_trust');
  const bx = bank ? bank.x : 2350;
  const by = bank ? bank.y : 3500;
  const plaza = bank && bank.plaza;
  const spot = game.city.findWalkableNear(bx, plaza ? (plaza.y0 + plaza.y1) / 2 : by + 110, 7);
  game.player.x = spot.x;
  game.player.y = spot.y;
  game.player.face = -Math.PI / 2;
  game.player.aim = -Math.PI / 2;
  game.player.armed = true;
  game.player.shotArmed = true;
  game.player.aimLocked = true;
  game.player.y = spot.y + 38;
  game.camera.snapTo(game.player.x, game.player.y, 0.98);
  const cover = game.traffic.addCar('sedan', spot.x, spot.y + 14, 0, '#344b60', { parked: true });
  cover.parked = true;
  game.police.stagePursuit(2, spot.x, spot.y - 115, Math.PI / 2, 125);
  game.police.stageOfficers(4, spot.x, spot.y - 90, Math.PI / 2, 38, game.player.x, game.player.y);
  game.traffic.fillScene(game.player, 13, 620);
  game.pedestrians.populate(game.player, 34, 500);
  game.wantedSystem.setLevel(5);
  game.wanted = 5;
  for (const officer of game.police.officers) {
    const angle = Math.atan2(game.player.y - officer.y, game.player.x - officer.x);
    const mx = officer.x + Math.cos(angle) * 12;
    const my = officer.y + Math.sin(angle) * 12;
    game.effects.muzzleFlash(mx, my, angle);
    game.effects.casing(officer.x, officer.y, angle);
    game.combat.fire(officer, angle, { x: mx, y: my, damage: 13, speed: 780 });
    officer.shootClock = 1.2;
  }
  game.objective = { title: 'COSTA TRUST  ·  ALERT', text: 'Get clear of the plaza. The exits are closing.' };
  game.missionMarker = { x: bx, y: by };
  game.radio = 'DISPATCH  ·  ALL UNITS';
}

function stagePlayerCar(game, type, x, y, angle, color) {
  const car = game.traffic.addCar(type, x, y, angle, color);
  car.isPlayerCar = true;
  car.driver = game.player;
  return car;
}

function laneNear(game, x, y, filter) {
  const lane = game.city.nearestLane(x, y, filter);
  return lane && dist(lane.x, lane.y, x, y) < 280 ? lane : null;
}

function stageNearLanes(game, x, y, count) {
  const edges = game.city.lanes.laneEdgesNear(x, y, 520, []);
  for (let i = 0; i < Math.min(3, count); i++) {
    const lane = game.city.nearestLane(x + 135 + i * 92, y, (edge) => edge.dx > 0);
    if (!lane || game.traffic.cars.some((car) => dist(car.x, car.y, lane.x, lane.y) < 70)) continue;
    game.traffic.addCar(i === 1 ? 'taxi' : 'sedan', lane.x, lane.y, Math.atan2(lane.edge.dy, lane.edge.dx));
  }
  for (let i = 3; i < count && edges.length; i++) {
    const edge = edges[(i * 7) % edges.length];
    const t = 0.34 + (i % 4) * 0.1;
    const px = edge.x0 + (edge.x1 - edge.x0) * t;
    const py = edge.y0 + (edge.y1 - edge.y0) * t;
    if (dist(px, py, x, y) < 110) continue;
    game.traffic.addCar(i % 5 === 0 ? 'taxi' : 'sedan', px, py, Math.atan2(edge.dy, edge.dx));
  }
}

function fillDenseScene(game, x, y, target, radius) {
  const edges = game.city.lanes.laneEdgesNear(x, y, radius, []);
  for (const edge of edges) {
    if (game.traffic.cars.length >= target) return;
    if (edge.kind !== 'lane') continue;
    for (let d = 48; d < edge.len - 24; d += 76) {
      const t = d / edge.len;
      const px = edge.x0 + (edge.x1 - edge.x0) * t;
      const py = edge.y0 + (edge.y1 - edge.y0) * t;
      if (dist(px, py, x, y) < 120 || dist(px, py, x, y) > radius || Math.abs(py - y) > 440 || Math.abs(px - x) > 760) continue;
      if (game.traffic.cars.some((car) => dist(car.x, car.y, px, py) < 68)) continue;
      if (game.city.blockedAt(px, py, 7)) continue;
      const type = game.traffic.rnd() < 0.22 ? 'taxi' : game.traffic.rnd() < 0.5 ? 'coupe' : 'sedan';
      game.traffic.addCar(type, px, py, Math.atan2(edge.dy, edge.dx));
      if (game.traffic.cars.length >= target) return;
    }
  }
}
