// Purpose: create repeatable pseudo-random sequences.
// Main exports: mulberry32.
// Inputs: a seed integer.
// Outputs: a function returning values in the range [0, 1).
// Side effects: no global state or entropy access.
// Notes: the exact integer mixing is part of scene determinism.
export function mulberry32(seed = 1) {
  let state = seed >>> 0;
  return () => {
    state += 0x6D2B79F5;
    let value = state;
    value = Math.imul(value ^ value >>> 15, value | 1);
    value ^= value + Math.imul(value ^ value >>> 7, value | 61);
    return ((value ^ value >>> 14) >>> 0) / 4294967296;
  };
}
