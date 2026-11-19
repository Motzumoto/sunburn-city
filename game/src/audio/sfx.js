export function createSfx(context, output) {
  let engine = null;
  let siren = null;
  let lastSiren = 0;
  const voices = new Set();
  const trackVoice = (source, nodes) => {
    const voice = { source, nodes };
    voices.add(voice);
    source.onended = () => {
      voices.delete(voice);
      source.disconnect();
      for (const node of nodes) node.disconnect();
    };
  };
  const tone = (frequency, duration, type = 'sine', gainValue = 0.08, endFrequency = frequency, delay = 0) => {
    const start = context.currentTime + delay;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, start);
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(20, endFrequency), start + duration);
    gain.gain.setValueAtTime(0.001, start);
    gain.gain.setValueAtTime(gainValue, start + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
    oscillator.connect(gain);
    gain.connect(output);
    trackVoice(oscillator, [gain]);
    oscillator.start(start);
    oscillator.stop(start + duration + 0.02);
  };
  const noise = (duration, gainValue = 0.05, filterFrequency = 1200) => {
    const size = Math.floor(context.sampleRate * duration);
    const buffer = context.createBuffer(1, size, context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < size; i++) data[i] = Math.random() * 2 - 1;
    const source = context.createBufferSource();
    const filter = context.createBiquadFilter();
    const gain = context.createGain();
    filter.type = 'lowpass';
    filter.frequency.value = filterFrequency;
    gain.gain.setValueAtTime(gainValue, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + duration);
    source.buffer = buffer;
    source.connect(filter);
    filter.connect(gain);
    gain.connect(output);
    trackVoice(source, [filter, gain]);
    source.start();
    source.stop(context.currentTime + duration + 0.02);
  };
  const stopLoop = (loop) => {
    if (!loop) return;
    try { loop.oscillator.stop(); } catch { }
    loop.oscillator.disconnect();
    loop.gain.disconnect();
  };
  return {
    play(name, detail = {}) {
      switch (name) {
        case 'gunshot': noise(0.11, 0.11, 2100); tone(detail.weapon === 'SHOTGUN' ? 82 : 125, 0.12, 'triangle', 0.1, 35); break;
        case 'reload': tone(660, 0.06, 'square', 0.035, 430); tone(480, 0.08, 'square', 0.03, 720, 0.14); break;
        case 'impact': noise(0.16, 0.075, 600); break;
        case 'explosion': noise(0.8, 0.2, 360); tone(58, 0.7, 'sawtooth', 0.13, 24); break;
        case 'horn': tone(330, 0.32, 'sawtooth', 0.045); tone(415, 0.32, 'sawtooth', 0.035); break;
        case 'ui': tone(620, 0.045, 'sine', 0.035, 780); break;
        case 'missionStart': tone(440, 0.16, 'triangle', 0.065, 660); tone(660, 0.2, 'triangle', 0.055, 880, 0.15); break;
        case 'missionComplete': tone(523, 0.18, 'triangle', 0.07, 660); tone(659, 0.2, 'triangle', 0.07, 880, 0.14); tone(784, 0.28, 'triangle', 0.06, 1047, 0.29); break;
        case 'footstep': noise(0.055, 0.03, detail.sand ? 500 : 900); break;
        case 'tyre': noise(0.12, 0.035, 1400); break;
        default: break;
      }
    },
    update(dt, wanted, x, y, police) {
      const car = this._playerCar;
      if (car && car.speed > 2) {
        const frequency = 42 + Math.min(120, car.speed * 0.28);
        car.oscillator.frequency.setTargetAtTime(frequency, context.currentTime, 0.08);
        car.gain.gain.setTargetAtTime(Math.min(0.045, 0.009 + car.speed / 8000), context.currentTime, 0.1);
      } else if (car) car.gain.gain.setTargetAtTime(0.001, context.currentTime, 0.08);
      if (wanted > 0) {
        const nearest = police.reduce((best, unit) => Math.min(best, Math.hypot(unit.x - x, unit.y - y)), Infinity);
        const now = context.currentTime;
        if (nearest < 850) {
          if (!siren) {
            const oscillator = context.createOscillator();
            const gain = context.createGain();
            oscillator.type = 'sawtooth';
            gain.gain.value = 0.001;
            oscillator.connect(gain);
            gain.connect(output);
            oscillator.start();
            siren = { oscillator, gain, phase: 0 };
          }
          siren.phase += dt;
          siren.oscillator.frequency.setTargetAtTime(530 + Math.sin(siren.phase * 5.2) * 90, now, 0.06);
          siren.gain.gain.setTargetAtTime(0.03 * Math.max(0, 1 - nearest / 850), now, 0.12);
          lastSiren = now;
        } else if (siren) {
          siren.gain.gain.setTargetAtTime(0.001, now, 0.15);
          if (now - lastSiren > 1) { stopLoop(siren); siren = null; }
        }
      } else if (siren) {
        stopLoop(siren);
        siren = null;
      }
    },
    setVehicle(car) {
      if (!car && this._playerCar) {
        stopLoop(this._playerCar);
        this._playerCar = null;
      } else if (car && !this._playerCar) {
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        const filter = context.createBiquadFilter();
        oscillator.type = 'sawtooth';
        oscillator.frequency.value = 48;
        filter.type = 'lowpass';
        filter.frequency.value = 260;
        gain.gain.value = 0.001;
        oscillator.connect(filter);
        filter.connect(gain);
        gain.connect(output);
        oscillator.start();
        this._playerCar = { oscillator, gain };
      }
      if (this._playerCar && car) this._playerCar.speed = Math.abs(car.speed);
    },
    stop() {
      stopLoop(this._playerCar);
      this._playerCar = null;
      stopLoop(siren);
      siren = null;
      for (const voice of voices) {
        try { voice.source.stop(); } catch { }
        voice.source.disconnect();
        for (const node of voice.nodes) node.disconnect();
      }
      voices.clear();
    },
  };
}
