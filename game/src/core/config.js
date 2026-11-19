// Global tuning constants: world size, fixed timestep, sun direction and building extrusion.

export const WORLD_SIZE = 5000;
export const FIXED_DT = 1 / 60;
export const MAX_FRAME_DT = 0.1;
export const MAX_DPR = 2;

// Unit vector pointing from a caster toward where its shadow falls (sun in the upper left).
export const SHADOW_DIR = { x: 0.62, y: 0.78 };
// Shadow length per unit of building height.
export const SHADOW_LEN = 0.95;

// Fake 3D: a roof is drawn shifted by (x, y) * height relative to its footprint.
export const EXTRUDE = { x: 0.11, y: -0.25 };

// Terrain streaming: chunk size in world units, bake resolution and the seam-hiding overlap.
export const CHUNK = 512;
export const CHUNK_SCALE = 1.5;
export const CHUNK_MARGIN = 3;

export const LANE_W = 30;
export const SIDEWALK_W = 16;

export const GROUND = {
  OUT: 0,
  ROAD: 1,
  SIDEWALK: 2,
  LOT: 3,
  GRASS: 4,
  SAND: 5,
  WATER: 6,
  CONCRETE: 7,
  PLAZA: 8,
  BOARDWALK: 9,
  PARKING: 10,
  PIER: 11,
};

export const FONT_STACK = '"Segoe UI", "Helvetica Neue", Helvetica, Arial, sans-serif';
export const DISPLAY_STACK = '"Arial Black", "Segoe UI Black", Impact, "Helvetica Neue", Arial, sans-serif';

export const GAME_NAME = 'SUNBURN CITY';
export const TAGLINE = 'Costa Vela never sleeps. It only tans.';
