// Shared world and simulation constants for Costa Vela.
export const WIDTH = 4200;
export const HEIGHT = 4200;
export const STEP = 1 / 60;
export const PALETTE = ['#e7cda5', '#d98e79', '#8dc5b5', '#f0d7b6', '#9bb8bb', '#efb7a3'];
export const WEAPONS = [
  { name: 'PISTOL', rate: 0.32, damage: 24, speed: 740, mag: 12, spread: 0.025 },
  { name: 'SMG', rate: 0.09, damage: 13, speed: 760, mag: 30, spread: 0.08 },
  { name: 'SHOTGUN', rate: 0.68, damage: 15, speed: 590, mag: 6, spread: 0.24, pellets: 6 },
  { name: 'RIFLE', rate: 0.2, damage: 38, speed: 980, mag: 20, spread: 0.012 },
];
