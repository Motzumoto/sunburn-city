// SUNBURN CITY — Synthesizes the game's Costa Vela radio stations.
// Three synthesized Costa Vela radio stations; no media files or network fetches.
const STATIONS = [
  { name: 'SUNSET DRIVE · SYNTHWAVE', a: 110, b: 164.81, wave: 'sawtooth' },
  { name: 'COSTA SOL · GUITAR RADIO', a: 146.83, b: 196, wave: 'triangle' },
  { name: 'VELA TALK · 101.2 FM', a: 82.41, b: 123.47, wave: 'sine' },
];

export function createMusic(context, output) {
  let oscillators = [];
  let gains = [];
  let station = 0;
  let clock = 0;
  let hostLine = 0;
  const stop = () => {
    for (const oscillator of oscillators) {
      try { oscillator.stop(); } catch { }
      oscillator.disconnect();
    }
    for (const gain of gains) gain.disconnect();
    oscillators = [];
    gains = [];
  };
  const start = (index) => {
    stop();
    station = index;
    const tune = STATIONS[station];
    for (let i = 0; i < 2; i++) {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = tune.wave;
      oscillator.frequency.value = i ? tune.b : tune.a;
      gain.gain.value = station === 2 ? 0.025 : 0.035;
      oscillator.connect(gain);
      gain.connect(output);
      oscillator.start();
      oscillators.push(oscillator);
      gains.push(gain);
    }
    clock = 0;
  };
  return {
    start,
    stop,
    change(index) { start(index); },
    update(dt, driving, speed) {
      clock += dt;
      const tune = STATIONS[station];
      const pulse = station === 0 ? Math.sin(clock * 2.1) : station === 1 ? Math.sin(clock * 1.1) : Math.sin(clock * 0.5);
      if (oscillators.length) {
        oscillators[0].frequency.setTargetAtTime(tune.a * (1 + pulse * 0.06), context.currentTime, 0.12);
        oscillators[1].frequency.setTargetAtTime(tune.b * (1 - pulse * 0.035), context.currentTime, 0.12);
        for (const gain of gains) gain.gain.setTargetAtTime((station === 2 ? 0.025 : 0.035) * (driving ? 1 : 0.72) * Math.min(1, 0.7 + speed / 400), context.currentTime, 0.15);
      }
      if (station === 2 && clock > 10) {
        clock = 0;
        hostLine = (hostLine + 1) % 4;
      }
    },
    get hostLine() { return station === 2 ? [
      'TRAFFIC IS LIGHT ON THE COASTAL ROAD.',
      'YOU ARE LISTENING TO VELA TALK 101.2.',
      'THE CORAL SYNDICATE DECLINED TO COMMENT.',
      'LT. VOSS SAYS THE STREETS ARE SAFE TONIGHT.',
    ][hostLine] : ''; },
    get label() { return STATIONS[station].name; },
  };
}
