// SUNBURN CITY - Manages optional city activities and their markers.
// Optional city activities and their persistent world markers.
import { dist } from '../core/math.js';

const SHOP_AMMO = 120;
const SHOP_ARMOUR = 260;
const WASH_PRICE = 500;

export class Activities {
  constructor(game) {
    this.game = game;
    this.markers = [];
    this.race = null;
    this.vigilante = null;
    this.buildMarkers();
  }

  buildMarkers() {
    const g = this.game;
    const at = (district, anchor) => g.missions.pointInDistrict(district, anchor);
    this.hospital = at('downtown', [2100, 3500]);
    this.policeStation = at('downtown', [2800, 3400]);
    this.raceCheckpoints = [at('marina', [4500, 3700]), at('marina', [4600, 3800])];
    this.markers = [
      { id: 'hospital', label: 'HOSPITAL', type: 'hospital', ...this.hospital },
      { id: 'police-station', label: 'COSTA VELA PD', type: 'police', ...this.policeStation },
      { id: 'gunshop-downtown', label: 'GUN SHOP', type: 'shop', price: SHOP_AMMO, ...at('downtown', [2500, 3300]) },
      { id: 'gunshop-neon', label: 'GUN SHOP', type: 'shop', price: SHOP_AMMO, ...at('neon', [4000, 3000]) },
      { id: 'sunwash-marina', label: 'SUN WASH', type: 'wash', price: WASH_PRICE, ...at('marina', [4600, 4050]) },
      { id: 'sunwash-neon', label: 'SUN WASH', type: 'wash', price: WASH_PRICE, ...at('neon', [4000, 3300]) },
      { id: 'safehouse', label: 'SAFEHOUSE', type: 'safehouse', ...at('yards', [750, 3600]) },
      { id: 'marina-race', label: 'MARINA CHECKPOINT RACE', type: 'race', ...at('marina', [4300, 4050]) },
      { id: 'vigilante', label: 'VIGILANTE CALL', type: 'vigilante', ...at('downtown', [2500, 3400]) },
    ];
  }

  interact() {
    const game = this.game;
    const marker = this.markers.find((m) => !m.hidden && dist(game.player.x, game.player.y, m.x, m.y) < 46);
    if (!marker) return false;
    const p = game.player;
    if (marker.type === 'shop') {
      if (p.money >= SHOP_AMMO) {
        p.money -= SHOP_AMMO;
        p.reserve = Math.min(240, p.reserve + 48);
        p.armour = Math.min(100, p.armour + 20);
        game.radio = 'GUN SHOP  ·  AMMO + ARMOUR';
      } else game.radio = 'GUN SHOP  ·  NEED $120';
    } else if (marker.type === 'wash') {
      if (p.money >= WASH_PRICE) {
        p.money -= WASH_PRICE;
        if (p.inVehicle) {
          p.inVehicle.color = '#2ec4b6';
          p.inVehicle._c = null;
        }
        game.wantedSystem.setLevel(0);
        game.wanted = 0;
        game.police.clearPursuit();
        game.radio = 'SUN WASH  ·  CLEAN SLATE';
      } else game.radio = 'SUN WASH  ·  NEED $500';
    } else if (marker.type === 'safehouse') {
      p.health = 100;
      p.armour = Math.max(p.armour, 50);
      game.wantedSystem.setLevel(0);
      game.wanted = 0;
      game.police.clearPursuit();
      game.radio = 'SAFEHOUSE  ·  RESTED & SAVED';
      game.saveGame();
    } else if (marker.type === 'hospital') {
      if (p.money >= 150) {
        p.money -= 150;
        p.health = 100;
        game.radio = 'HOSPITAL  ·  TREATED';
      } else game.radio = 'HOSPITAL  ·  NEED $150';
    } else if (marker.type === 'police') {
      game.wantedSystem.setLevel(0);
      game.wanted = 0;
      game.police.clearPursuit();
      game.radio = 'COSTA VELA PD  ·  REPORT FILED';
    } else if (marker.type === 'race') {
      if (this.race) {
        game.radio = 'RACE  ·  ALREADY RUNNING';
      } else if (!p.inVehicle) {
        game.radio = 'RACE  ·  TAKE A CAR';
      } else {
        const route = [marker, ...this.raceCheckpoints];
        this.race = { route, checkpoint: 0, time: 70 };
        this.setRaceCheckpoint();
        game.radio = 'MARINA SPRINT  ·  GO!';
      }
    } else if (marker.type === 'vigilante') {
      if (this.vigilante) game.radio = 'VIGILANTE CALL  ·  TARGET ACTIVE';
      else {
        const target = game.traffic.addCar('coupe', marker.x + 180, marker.y + 110, Math.PI, '#8e3846');
        target.vigilanteTarget = true;
        target.health = 130;
        target.maxHealth = 130;
        this.vigilante = target;
        game.wantedSystem.setLevel(1);
        game.wanted = 1;
        game.radio = 'VIGILANTE CALL  ·  STOP THE RED COUPE';
      }
    }
    return true;
  }

  update(dt) {
    const g = this.game;
    if (this.race) {
      this.race.time -= dt;
      if (this.race.time <= 0) {
        this.race = null;
        g.activityTarget = null;
        g.radio = 'RACE  ·  TIME EXPIRED';
      } else if (g.player.inVehicle && dist(g.player.x, g.player.y, this.race.route[this.race.checkpoint].x, this.race.route[this.race.checkpoint].y) < 52) {
        this.race.checkpoint++;
        if (this.race.checkpoint >= this.race.route.length) {
          g.player.money += 1000;
          this.race = null;
          g.activityTarget = null;
          g.radio = 'RACE WON  ·  +$1,000';
          g.saveGame();
        } else this.setRaceCheckpoint();
      }
    }
    if (this.vigilante && (this.vigilante.destroyed || this.vigilante.health <= 0)) {
      g.player.money += 650;
      this.vigilante.destroyed = true;
      this.vigilante = null;
      g.radio = 'VIGILANTE TARGET STOPPED  ·  +$650';
      g.wantedSystem.setLevel(0);
      g.wanted = 0;
      g.activityTarget = null;
      g.saveGame();
    } else if (this.vigilante) {
      g.activityTarget = this.vigilante;
    }
  }

  setRaceCheckpoint() {
    const next = this.race.route[this.race.checkpoint];
    this.game.activityTarget = next;
  }
}
