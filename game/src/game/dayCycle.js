// Game clock and sky colour keyframes: dawn, noon, golden hour, dusk and a bright-enough night.
import { smoothstep } from '../core/math.js';

// [hour, tintR, tintG, tintB, glow]: the tint multiplies the whole world, glow is the golden-hour bloom.
const KEYS = [
  [0, 0.36, 0.42, 0.68, 0], [5, 0.38, 0.44, 0.7, 0], [6.1, 0.8, 0.6, 0.64, 0.3], [7.2, 1, 0.82, 0.68, 0.35],
  [8.8, 1, 0.94, 0.86, 0.1], [12, 1, 0.99, 0.95, 0], [15.5, 1, 0.95, 0.84, 0.15], [17.4, 1, 0.84, 0.62, 0.6],
  [18.5, 1, 0.74, 0.48, 0.9], [19.5, 0.88, 0.54, 0.6, 0.55], [20.6, 0.52, 0.44, 0.7, 0.1], [22, 0.38, 0.43, 0.68, 0],
  [24, 0.36, 0.42, 0.68, 0],
];

export const SKY_DEFAULT_HOUR = 17.9;

export class DayCycle {
  constructor(hour = SKY_DEFAULT_HOUR) {
    this.hour = hour;
    this.frozen = false;
    this.hoursPerSecond = 24 / 900; // a full day lasts 15 real minutes
    this.sky = { r: 1, g: 1, b: 1, glow: 0, night: 0, hour };
    this.setHour(hour);
  }

  setHour(h) {
    this.hour = ((h % 24) + 24) % 24;
    skyAt(this.hour, this.sky);
  }

  update(dt) {
    if (this.frozen) return;
    this.setHour(this.hour + dt * this.hoursPerSecond);
  }

  clockText() {
    const h = Math.floor(this.hour);
    const m = Math.floor((this.hour - h) * 60);
    const h12 = h % 12 === 0 ? 12 : h % 12;
    return h12 + ':' + (m < 10 ? '0' : '') + m + ' ' + (h < 12 ? 'AM' : 'PM');
  }
}

export function skyAt(hour, out) {
  let i = 0;
  while (i < KEYS.length - 2 && hour >= KEYS[i + 1][0]) i++;
  const a = KEYS[i];
  const b = KEYS[i + 1];
  const t = (hour - a[0]) / (b[0] - a[0]);
  out.r = a[1] + (b[1] - a[1]) * t;
  out.g = a[2] + (b[2] - a[2]) * t;
  out.b = a[3] + (b[3] - a[3]) * t;
  out.glow = a[4] + (b[4] - a[4]) * t;
  // Lights switch on through dusk and off around dawn.
  out.night = hour >= 12 ? smoothstep(18.4, 20.6, hour) : 1 - smoothstep(5.2, 6.8, hour);
  out.hour = hour;
  return out;
}
