// SUNBURN CITY — Validates and persists local game progress.
// Validated local save data for player progress and the current ride.
import { MISSIONS } from './story.js';

const KEY = 'sunburn-city-save';
const VERSION = 1;
const VEHICLE_TYPES = new Set(['sedan', 'coupe', 'hatch', 'suv', 'van', 'taxi', 'sport', 'police']);

export function hasSave() {
  return !!readSave();
}

export function saveGame(game) {
  try {
    localStorage.setItem(KEY, JSON.stringify({
      version: VERSION,
      money: game.player.money,
      health: game.player.health,
      armour: game.player.armour,
      weapon: game.player.weapon,
      ammo: game.player.ammo,
      reserve: game.player.reserve,
      progress: game.missions.progress,
      completed: game.missions.completed,
      position: { x: game.player.x, y: game.player.y },
      vehicle: game.player.inVehicle ? {
        type: game.player.inVehicle.type, color: game.player.inVehicle.color,
        x: game.player.inVehicle.x, y: game.player.inVehicle.y, heading: game.player.inVehicle.heading,
        health: game.player.inVehicle.health,
      } : null,
      clock: game.day.hour,
    }));
    return true;
  } catch {
    return false;
  }
}

export function loadGame(game) {
  const data = readSave();
  if (!data) return false;
  const p = game.player;
  p.money = data.money;
  p.health = data.health;
  p.armour = data.armour;
  p.weapon = data.weapon;
  p.ammo = data.ammo;
  p.reserve = data.reserve;
  game.missions.progress = data.progress;
  game.missions.completed = data.completed;
  game.missions.reconcile();
  p.inVehicle = null;
  p.x = data.position.x;
  p.y = data.position.y;
  if (data.vehicle) {
    const car = game.traffic.addCar(data.vehicle.type, data.vehicle.x, data.vehicle.y, data.vehicle.heading, data.vehicle.color, { parked: true });
    car.parked = true;
    car.health = data.vehicle.health;
    p.inVehicle = car;
    car.isPlayerCar = true;
    car.driver = p;
  }
  game.day.setHour(data.clock);
  game.camera.snapTo(p.x, p.y);
  game.state = 'playing';
  game.missions.restoreObjective();
  return true;
}

function readSave() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const d = JSON.parse(raw);
    if (!d || d.version !== VERSION || !validNumber(d.money, 0, 1e9) ||
      !validNumber(d.health, 1, 100) || !validNumber(d.armour, 0, 100) ||
      d.weapon !== 'PISTOL' || !validNumber(d.ammo, 0, 999) ||
      !validNumber(d.reserve, 0, 999) || !Number.isInteger(d.progress) || d.progress < 0 || d.progress > 8 ||
      !Array.isArray(d.completed) || !d.completed.every((id, index) => MISSIONS[index] && id === MISSIONS[index].id) ||
      d.progress !== d.completed.length ||
      !d.position || !validNumber(d.position.x, 0, 5000) || !validNumber(d.position.y, 0, 5000) ||
      !validNumber(d.clock, 0, 24)) return null;
    if (d.vehicle && (!VEHICLE_TYPES.has(d.vehicle.type) || !/^#[0-9a-f]{6}$/i.test(d.vehicle.color) ||
      !validNumber(d.vehicle.x, 0, 5000) || !validNumber(d.vehicle.y, 0, 5000) ||
      !validNumber(d.vehicle.heading, -10, 10) || !validNumber(d.vehicle.health, 0, 100))) return null;
    return d;
  } catch {
    return null;
  }
}

function validNumber(value, min, max) {
  return Number.isFinite(value) && value >= min && value <= max;
}
