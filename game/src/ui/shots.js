// SUNBURN CITY - Stages deterministic city, chase, mission and heist screenshots.
// Deterministic screenshot scenes assembled from the live city and entity systems.
import { dist } from '../core/math.js';
import { LIGHT } from '../render/lightSprites.js';
import { muzzlePoint } from '../render/people.js';
import { makeProp } from '../world/propsGen.js';
import { shoreY } from '../world/shoreline.js';

export const SHOT_NAMES = ['city', 'chase', 'mission', 'heist'];
const SHOT_ZOOM = { city: 2.0, chase: 2.05, mission: 2.15, heist: 2.0 };
const SHOT_OFFSET = { city: 40, chase: 60, mission: -25, heist: 20 };
const TRAFFIC_COLORS = ['#7f8f93', '#3f6f74', '#c9b08a', '#59606e', '#8c5f52'];

export function setShotScene(game, name) {
  if (!SHOT_NAMES.includes(name)) throw new Error('Unknown screenshot scene: ' + name);
  game.state = 'playing';
  game.day.frozen = true;
  game.shotScene = name;
  game.shotZoom = SHOT_ZOOM[name];
  game.shotCameraOffset = SHOT_OFFSET[name];
  game.shotProps.length = 0;
  game.traffic.cars.length = 0;
  game.pedestrians.people.length = 0;
  game.pedestrians.cash.length = 0;
  game.effects.clear();
  game.combat.bullets.length = 0;
  game.wantedSystem.setLevel(0);
  game.wanted = 0;
  game.missionMarker = null;
  game.objectiveTarget = null;
  game.police.resetScene();
  game.dialogue = null;
  game.objective = null;
  game.player.inVehicle = null;
  game.player.shotArmed = false;
  game.player.aimLocked = false;
  game.player.armed = false;
  game.player.health = 100;
  game.player.armour = 64;
  game.player.ammo = 12;
  game.player.reserve = 72;
  game.player.money = 12450;
  game.player.face = 0;
  game.player.aim = 0;
  game.player.speed = 0;
  game.radioStation = '';

  if (name === 'city') cityScene(game);
  else if (name === 'chase') chaseScene(game);
  else if (name === 'mission') missionScene(game);
  else heistScene(game);

  game.camera.snapTo(game.player.x, game.player.y - game.shotCameraOffset, game.shotZoom);
  game.camera.resize(game.width, game.height);
  game.terrain.prewarm(game.ctx, game.camera.view);
  game.update(1 / 60);
  game.wanted = game.wantedSystem.level;
  game.render(0, 1 / 60);
}

function cityScene(game) {
  game.day.setHour(18 + 10 / 60);
  const x = 2500;
  const y = shoreY(x) - 70;
  const car = stagePlayerCar(game, 'sport', x, y, 0, '#ff4d3d');
  car.speed = 55;
  car.brakeLights = true;
  game.player.x = car.x;
  game.player.y = car.y;
  game.player.face = 0;
  game.player.inVehicle = car;
  stageBoulevardTraffic(game, car, y);
  game.pedestrians.populate(game.player, 10, 470);
  stageSidewalkCrowd(game, x, y, 10, 106);
  for (let i = 0; i < 2; i++) {
    const side = i ? 1 : -1;
    const tableX = x + (i ? 150 : -150);
    const table = makeProp('cafeTable', tableX, y + side * 112, null, { accent: i ? '#3f6f74' : '#c9b08a' });
    game.shotProps.push(table);
    game.shotProps.push(makeProp('umbrella', tableX, y + side * 112, null, { v: i, h: 31 }));
  }
  for (let i = 0; i < 4; i++) game.shotProps.push(makeProp('palm', x - 240 + i * 160, y - 148, null));
  for (let side = -1; side <= 1; side += 2) {
    game.shotProps.push(makeProp('signal', x + 244, y + side * 86, null, { h: 48, phase: 1 }));
    game.shotProps.push(makeProp('signal', x + 292, y + side * 86, null, { h: 48, phase: 0 }));
  }
  stageRoadSigns(game, x, y, ['OCEAN BOULEVARD', 'SOUTH BEACH'], ['#2f8f8f', '#ef7d63']);
  game.objective = { title: 'SOUTH BEACH  ·  OCEAN BOULEVARD', text: 'Rush hour, headed for the water.' };
  game.radio = 'PALM FM 88.4';
  game.player.money = 18450;
}

function chaseScene(game) {
  game.day.setHour(21 + 40 / 60);
  const lane = laneNear(game, 3970, 2860, (edge) => edge.dx > 0) || laneNear(game, 3970, 2860);
  const x = lane ? lane.x : 3970;
  const y = lane ? lane.y : 2860;
  const angle = lane ? Math.atan2(lane.edge.dy, lane.edge.dx) : 0;
  const bx = Math.cos(angle);
  const by = Math.sin(angle);
  const car = stagePlayerCar(game, 'coupe', x, y, angle, '#2fd6c8');
  car.speed = 214;
  car.slip = 0.08;
  car.brakeLights = true;
  game.player.x = x;
  game.player.y = y;
  game.player.inVehicle = car;
  game.player.face = angle;
  for (let i = 0; i < 2; i++) {
    const back = i ? 62 : 34;
    const cruiser = game.police.addCruiser(x - bx * back, y - by * back, angle, true);
    cruiser.siren = i + 1;
    cruiser.speed = 192;
  }
  const farTraffic = [[118, -24], [166, 24], [208, -54], [248, 54], [282, -24]];
  for (let i = 0; i < farTraffic.length; i++) {
    const [ahead, lane] = farTraffic[i];
    const traffic = game.traffic.addCar(i % 2 ? 'sedan' : 'coupe',
      x + bx * ahead - by * lane, y + by * ahead + bx * lane, angle,
      TRAFFIC_COLORS[i % TRAFFIC_COLORS.length], { staged: true });
    traffic.speed = 70;
  }
  game.wantedSystem.setLevel(3);
  game.wanted = 3;
  game.objective = { title: 'WANTED  ·  NEON ROW', text: 'Lose the tail. Reach the marina.' };
  game.missionMarker = game.city.landmark('marina');
  game.radio = 'NEON TIDE 104.2';
  addBillboard(game, x + 106, y - 120, 'VIVA', '#ff398f', 68);
  addBillboard(game, x + 240, y + 72, 'MOTEL', '#44d9e8', 84);
  addBillboard(game, x - 205, y - 88, 'FLAMINGO HOTEL', '#ff74a4', 132);
  const roadblock = { x: x + bx * 230, y: y + by * 230, angle, type: 'roadblock' };
  game.police.hazards.push(roadblock);
  addBillboard(game, roadblock.x + 24, roadblock.y - 72, 'ROAD CLOSED', '#ef7d63', 102);
  const heli = { x: x + 192, y: y - 205, angle: Math.atan2(y - (y - 205), x - (x + 192)), staged: true };
  game.police.helicopter = heli;
  game.effects.beam(heli.x, heli.y, x + 8, y + 44, 58, 40);
  game.effects.glow(heli.x, heli.y, 27, LIGHT.BLUE, 40);
  for (let i = 0; i < 38; i++) {
    const d = 10 + i * 6;
    const sx = x - bx * d;
    const sy = y - by * d;
    game.effects.skid(sx - 6, sy - 4, sx - bx * 10 - 6, sy - by * 10 - 4, 2.8);
    game.effects.skid(sx + 6, sy + 4, sx - bx * 10 + 6, sy - by * 10 + 4, 2.8);
  }
  for (let i = 0; i < 10; i++) game.effects.smoke(x - bx * (32 + i * 12), y - by * (32 + i * 12), -bx * 40, -by * 40, 8 + i * 0.3);
  for (let i = 0; i < 10; i++) game.effects.spark(x + bx * (32 + i * 8), y + by * (32 + i * 8), angle + Math.PI, 175);
}

function missionScene(game) {
  game.day.setHour(21 + 20 / 60);
  const pier = game.city.landmark('pier9');
  const anchorX = pier ? pier.x : 800;
  const anchorY = pier ? pier.y : 4530;
  const spot = game.city.findWalkableNear(anchorX - 40, anchorY, 7);
  game.player.x = spot.x;
  game.player.y = spot.y;
  game.player.face = 0;
  game.player.aim = -Math.PI / 2;
  game.player.aimLocked = true;
  game.player.armed = true;
  game.player.shotArmed = true;
  const pedestrianLook = { shirt: '#2f8f8f', sleeve: '#56b8ad', pants: '#263348', shoes: '#fff0cf', skin: '#d99b76', hair: '#211d2b', shades: null };
  for (const [i, side] of [-1, 1].entries()) {
    game.pedestrians.people.push({
      id: 'shot-pier-' + i, x: spot.x + side * 19, y: spot.y + 2, face: side * 0.9,
      aim: side * 0.9, walk: 1.5, speed: 48, look: pedestrianLook, armed: false, punch: 0,
      state: 'flee', sortY: spot.y + 4,
    });
  }
  for (let i = 0; i < 5; i++) {
    game.shotProps.push(makeProp('stringLights', spot.x - 185 + (i % 2) * 55, spot.y - 102 - Math.floor(i / 2) * 31, null,
      { len: 150, sag: 17 }));
  }
  addBillboard(game, spot.x - 155, spot.y - 155, 'PIER 9', '#ef7d63', 86);
  addBillboard(game, spot.x + 120, spot.y - 150, 'TIDE CLUB', '#2f8f8f', 112);
  addBillboard(game, spot.x - 45, spot.y - 185, 'MARISOL', '#ef7d63', 94);
  game.wantedSystem.setLevel(1);
  game.wanted = 1;
  game.objective = { title: 'THE BOARDWALK', text: 'Talk to Marisol about the missing ledger.' };
  game.missionMarker = pier || { x: anchorX, y: anchorY };
  game.dialogue = { name: 'MARISOL VEGA', lines: [
    'You said this was a clean job. The whole waterfront is talking.',
    'Meet me by the old lighthouse before the tide turns.',
  ] };
  game.radio = 'LOW TIDE  ·  91.2';
}

function heistScene(game) {
  game.day.setHour(15.5);
  const bank = game.city.landmark('costa_trust');
  const anchorX = bank ? bank.x : 2350;
  const anchorY = bank ? bank.y : 3500;
  const plaza = bank && bank.plaza;
  const spot = game.city.findWalkableNear(anchorX, plaza ? (plaza.y0 + plaza.y1) / 2 : anchorY + 100, 7);
  game.player.x = spot.x;
  game.player.y = spot.y + 42;
  game.player.face = -Math.PI / 2;
  game.player.aim = -Math.PI / 2;
  game.player.armed = true;
  game.player.shotArmed = true;
  game.player.aimLocked = true;
  const cover = game.traffic.addCar('sedan', spot.x, spot.y + 14, 0, '#1d3340', { parked: true });
  cover.parked = true;
  game.wantedSystem.setLevel(5);
  game.wanted = 5;
  stageCoverCruisers(game, spot.x, spot.y - 68);
  game.police.stageOfficers(3, spot.x, game.player.y - 32, Math.PI / 2, 28, game.player.x, game.player.y);
  for (const officer of game.police.officers) {
    const angle = Math.atan2(game.player.y - officer.y, game.player.x - officer.x);
    const mx = officer.x + Math.cos(angle) * 12;
    const my = officer.y + Math.sin(angle) * 12;
    game.effects.muzzleFlash(mx, my, angle);
    game.effects.glow(mx, my, 16, LIGHT.AMBER, 12);
    game.effects.casing(officer.x, officer.y, angle);
    game.effects.spark(mx, my, angle, 115);
    game.effects.beam(mx, my, game.player.x, game.player.y - 28, 12, 4);
    game.combat.fire(officer, angle, { x: mx, y: my, damage: 13, speed: 780 });
    officer.shootClock = 1.2;
  }
  const muzzle = muzzlePoint(game.player, game.player.muzzle);
  game.effects.muzzleFlash(muzzle.x, muzzle.y, game.player.aim);
  game.effects.glow(muzzle.x, muzzle.y, 18, LIGHT.AMBER, 12);
  game.effects.beam(muzzle.x, muzzle.y, spot.x, spot.y - 64, 10, 4);
  for (let i = 0; i < 8; i++) game.effects.smoke(spot.x - 110 + i * 31, spot.y - 62 - (i % 3) * 14, 0, -8, 10 + i);
  for (let i = 0; i < 12; i++) game.effects.spark(spot.x - 130 + i * 24, spot.y - 95, -Math.PI / 2, 140);
  game.objective = { title: 'HIGH TIDE', text: 'Get clear of the plaza. The exits are closing.' };
  game.missionMarker = { x: anchorX, y: anchorY };
  game.radio = 'HIGH TIDE  ·  104.2';
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

function stageBoulevardTraffic(game, playerCar, boulevardY) {
  const stagedTraffic = [
    [150, -24, 0], [320, -24, 0], [220, 24, 0],
    [-160, -24, 0], [-330, 24, 0], [150, -54, Math.PI], [-190, -54, Math.PI],
  ];
  for (let i = 0; i < stagedTraffic.length; i++) {
    const [offset, lane, heading] = stagedTraffic[i];
    const car = game.traffic.addCar(i % 3 ? 'sedan' : 'coupe',
      playerCar.x + offset, boulevardY + lane, heading, TRAFFIC_COLORS[i % TRAFFIC_COLORS.length], { staged: true });
    car.speed = 48 + i * 3;
    car.brakeLights = offset < 0;
  }
  for (let i = 0; i < 4; i++) {
    const car = game.traffic.addCar(i % 2 ? 'sedan' : 'coupe', playerCar.x - 210 + i * 140,
      boulevardY + (i % 2 ? -106 : 106), Math.PI / 2, TRAFFIC_COLORS[(i + 2) % TRAFFIC_COLORS.length], { parked: true });
    car.staged = true;
  }
}

function stageSidewalkCrowd(game, x, y, count, offset) {
  const people = game.pedestrians.people;
  for (let i = 0; i < Math.min(count, people.length); i++) {
    const row = Math.floor(i / 8);
    const col = i % 8;
    const side = row % 2 ? -1 : 1;
    const spot = game.city.findWalkableNear(x - 250 + col * 70, y + side * offset, 6);
    const person = people[i];
    person.x = spot.x;
    person.y = spot.y;
    person.targetX = spot.x + (col % 2 ? 22 : -22);
    person.targetY = spot.y;
    person.sortY = spot.y + 2;
    person.idle = 1 + (i % 4) * 0.4;
    person.state = 'idle';
    person.speed = 0;
  }
}

function stageRoadSigns(game, x, y, labels, colors) {
  addBillboard(game, x - 320, y - 95, labels[0], colors[0], 102);
  addBillboard(game, x + 310, y + 92, labels[1], colors[1], 106);
}

function addBillboard(game, x, y, text, accent, len) {
  game.shotProps.push(makeProp('billboard', x, y, null, { text, accent, len, boardHeight: 22, h: 34 }));
}

function stageCoverCruisers(game, x, y) {
  game.police.units.length = 0;
  for (let i = 0; i < 2; i++) {
    const side = i ? 1 : -1;
    const cruiserX = x + side * 90;
    const cruiserY = y + 20;
    const angle = Math.atan2(y + 42 - cruiserY, x - cruiserX);
    const cruiser = game.traffic.addCar('police', cruiserX, cruiserY, angle, '#fff0cf',
      { parked: true, siren: i + 1, headlights: true });
    cruiser.policeUnit = true;
    cruiser.pursuit = false;
    cruiser.brakeLights = true;
    game.police.units.push(cruiser);
  }
}
