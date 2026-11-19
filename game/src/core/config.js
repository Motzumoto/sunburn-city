// Purpose: publish simulation dimensions and shared combat palettes.
// Main exports: WIDTH, HEIGHT, STEP, PALETTE, WEAPONS.
// Inputs: none; values are static Costa Vela configuration.
// Outputs: immutable constants used across gameplay and rendering.
// Side effects: none.
// Notes: changing these values alters timing or world geometry.
export const WIDTH = 4200;
export const HEIGHT = 4200;
export const STEP = 1 / 60;
export const PALETTE = ['#d9c39a', '#ef7d63', '#2f8f8f', '#fff0cf', '#1d3340', '#e6a783'];
export const WEAPONS = [
  { name: 'PISTOL', rate: 0.32, damage: 24, speed: 740, mag: 12, spread: 0.025 },
  { name: 'SMG', rate: 0.09, damage: 13, speed: 760, mag: 30, spread: 0.08 },
  { name: 'SHOTGUN', rate: 0.68, damage: 15, speed: 590, mag: 6, spread: 0.24, pellets: 6 },
  { name: 'RIFLE', rate: 0.2, damage: 38, speed: 980, mag: 20, spread: 0.012 },
];
