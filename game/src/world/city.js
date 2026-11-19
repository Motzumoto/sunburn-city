// Purpose: assemble the seeded Costa Vela world.
// Main exports: City.
// Inputs: an integer seed.
// Outputs: blocks, props, landmarks and generated traffic storage.
// Side effects: deterministic generation of random world content.
// Notes: seed one is used for all official shot captures.
import { mulberry32 } from '../core/rng.js';
import { makeBlocks } from './blocks.js';
import { makeProps } from './props.js';
export class City {
  constructor(seed = 1) { const random = mulberry32(seed); this.seed = seed; this.blocks = makeBlocks(random); this.props = makeProps(this.blocks, random); this.landmarks = [{x:1460,y:640,name:'VELA TOWER'}, {x:2820,y:1720,name:'THE FLAMINGO HOTEL'}, {x:3370,y:3525,name:'PIER 9'}, {x:3380,y:890,name:'COSTA VELA MARINA'}]; }
}
