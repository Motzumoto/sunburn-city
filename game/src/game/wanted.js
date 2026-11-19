// SUNBURN CITY - Tracks police heat, visibility and pursuit decay.
// Heat, visibility-gated decay and the break-contact timer for live police pursuits.
export class WantedSystem {
  constructor() {
    this.heat = 0;
    this.level = 0;
    this.escapeTime = 0;
    this.arrestProgress = 0;
    this.searchRadius = 0;
    this.flashing = false;
  }

  crime(reason) {
    const heat = { gunfire: 1.2, carjacking: 3.2, pedestrian: 3, policeCar: 5, explosion: 6, officer: 7 };
    this.heat = Math.min(30, this.heat + (heat[reason] || 1));
    this.level = heatLevel(this.heat);
    this.searchRadius = this.level ? 260 + this.level * 100 : 0;
    this.escapeTime = 0;
    this.flashing = false;
  }

  setLevel(level) {
    this.level = Math.max(0, Math.min(5, Math.floor(level)));
    this.heat = [0, 1, 4, 8, 14, 22][this.level];
    this.searchRadius = this.level ? 260 + this.level * 100 : 0;
    this.escapeTime = 0;
    this.flashing = false;
  }

  update(dt, game) {
    if (!this.level) {
      this.heat = Math.max(0, this.heat - dt * 0.5);
      this.searchRadius = 0;
      this.flashing = false;
      game.wanted = 0;
      return;
    }

    const seen = game.police.canSeePlayer();
    const nearest = game.police.nearestDistance();
    this.searchRadius = 260 + this.level * 100;
    if (seen || nearest <= this.searchRadius) {
      this.escapeTime = 0;
    } else {
      this.escapeTime += dt;
      this.flashing = this.escapeTime >= 8 && Math.floor(game.elapsed * 5) % 2 === 0;
    }

    if (!seen) this.heat = Math.max(0, this.heat - dt * 0.2);
    if (this.escapeTime >= 12) {
      this.heat = 0;
      this.level = 0;
      this.escapeTime = 0;
      this.searchRadius = 0;
      this.flashing = false;
      game.radio = 'POLICE BAND  ·  AREA CLEAR';
      game.police.clearPursuit();
    }
    game.wanted = this.level;
  }
}

function heatLevel(heat) {
  if (heat >= 22) return 5;
  if (heat >= 14) return 4;
  if (heat >= 8) return 3;
  if (heat >= 4) return 2;
  if (heat >= 1) return 1;
  return 0;
}
