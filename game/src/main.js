// SUNBURN CITY — Initializes the browser game, seed, canvas and screenshot bridge.
// Static-browser entry point: deterministic seed, responsive canvas and the unchanged screenshot bridge.
import { Game } from './game/game.js';
import { GameLoop } from './core/loop.js';

const canvas = document.getElementById('game');
if (!(canvas instanceof HTMLCanvasElement)) throw new Error('SUNBURN CITY requires the #game canvas.');

const params = new URLSearchParams(window.location.search);
const seedValue = params.has('seed') ? Number(params.get('seed')) : 1;
const seed = Number.isFinite(seedValue) ? Math.floor(seedValue) >>> 0 : 1;
const game = new Game(canvas, seed);
const loop = new GameLoop((dt) => game.update(dt), (alpha, dt) => game.render(alpha, dt));
let manual = false;
const bridge = {
  ready: false,
  setShot(name) { game.setShot(name); },
  step(ms) {
    manual = true;
    loop.stop();
    game.step(Number(ms) || 0);
  },
  game,
};
window.__sunburn = bridge;

const shot = params.get('shot');
if (shot) game.setShot(shot);
game.render(0, 0);

window.addEventListener('resize', () => {
  game.resize();
  game.render(0, 0);
});
window.addEventListener('blur', () => {
  if (game.state === 'playing') {
    game.state = 'paused';
    game.audio.setPaused(true);
  }
  game.input.releaseAll();
});

let settledFrames = 0;
function settle() {
  if (!manual) game.update(1 / 60);
  game.render(0, 1 / 60);
  settledFrames++;
  if (settledFrames >= 2) {
    bridge.ready = true;
    if (!manual) loop.start();
  } else requestAnimationFrame(settle);
}
requestAnimationFrame(settle);
