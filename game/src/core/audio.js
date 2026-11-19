// SUNBURN CITY - Manages optional Web Audio playback.
// Owns optional Web Audio playback without coupling sound to the renderer.
import { createMusic } from '../audio/music.js';
import { createSfx } from '../audio/sfx.js';

export class AudioEngine {
  constructor() {
    this.context = null;
    this.master = null;
    this.music = null;
    this.sfx = null;
    this.started = false;
    this.paused = false;
    this.volume = 0.65;
    this.muted = false;
    this.station = 0;
  }

  start() {
    if (this.started) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    this.context = new AudioContext();
    this.master = this.context.createGain();
    this.master.gain.value = this.muted ? 0 : this.volume;
    this.master.connect(this.context.destination);
    this.music = createMusic(this.context, this.master);
    this.sfx = createSfx(this.context, this.master);
    this.started = true;
    this.context.resume();
    this.music.start(this.station);
    if (this.paused) this.setPaused(true);
  }

  setPaused(paused) {
    this.paused = paused;
    if (!this.started) return;
    if (paused) {
      this.music.stop();
      this.sfx.stop();
      this.context.suspend();
    } else {
      this.context.resume();
      this.music.start(this.station);
    }
  }

  setVolume(value) {
    this.volume = Math.max(0, Math.min(1, value));
    if (this.master) this.master.gain.setTargetAtTime(this.muted ? 0 : this.volume, this.context.currentTime, 0.04);
  }

  toggleMute() {
    this.muted = !this.muted;
    this.setVolume(this.volume);
  }

  setStation(index) {
    this.station = (index + 3) % 3;
    if (this.started && !this.paused) this.music.change(this.station);
  }

  play(name, detail) {
    if (this.started && !this.paused) this.sfx.play(name, detail);
  }

  update(game, dt) {
    if (!this.started || this.paused) return;
    const car = game.player.inVehicle;
    this.music.update(dt, !!car, car ? Math.abs(car.speed) : 0);
    this.sfx.update(dt, game.wantedSystem.level, game.player.x, game.player.y, game.police.units);
  }
}
