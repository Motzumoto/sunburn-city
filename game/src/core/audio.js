// Purpose: synthesize effects and rotating radio beds.
// Main exports: AudioEngine.
// Inputs: start, mute and station commands plus tone parameters.
// Outputs: WebAudio oscillators and a master gain.
// Side effects: creates browser AudioContext resources.
// Notes: radio intervals are replaced when the station changes.
export class AudioEngine {
  constructor() { this.context = null; this.master = null; this.started = false; this.muted = false; this.volume = 0.35; this.stationTimer = 0; this.stationStep = 0; }
  start() {
    if (this.started) return;
    const Audio = window.AudioContext || window.webkitAudioContext;
    if (!Audio) return;
    this.context = new Audio(); this.master = this.context.createGain(); this.master.gain.value = this.volume; this.master.connect(this.context.destination); this.started = true; this.setStation(0);
  }
  tone(frequency = 440, duration = 0.12, type = 'sine', gain = 0.06) {
    if (!this.context || this.muted) return;
    const oscillator = this.context.createOscillator(), envelope = this.context.createGain();
    oscillator.type = type; oscillator.frequency.value = frequency; envelope.gain.setValueAtTime(gain, this.context.currentTime);
    envelope.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + duration);
    oscillator.connect(envelope); envelope.connect(this.master); oscillator.start(); oscillator.stop(this.context.currentTime + duration);
  }
  setMuted(value) { this.muted = value; if (this.master) this.master.gain.value = value ? 0 : this.volume; }
  setStation(index) {
    if (this.stationTimer) clearInterval(this.stationTimer);
    if (!this.started) return;
    this.stationStep = 0;
    const scales = [[220,277,330,440,392,330,277,247],[196,247,294,370,330,294,247,220],[110,147,165,196]];
    const scale = scales[index % scales.length];
    this.stationTimer = setInterval(() => {
      const step = this.stationStep++;
      const note = scale[step % scale.length];
      this.tone(note, index === 2 ? .28 : .2, index === 1 ? 'triangle' : 'sine', index === 2 ? .012 : .024);
      if (index === 1 && step % 4 === 0) this.tone(note / 2, .12, 'triangle', .025);
      if (index === 0 && step % 4 === 2) this.tone(note * 2, .11, 'sine', .012);
    }, index === 2 ? 520 : 300);
  }
}
