// The seven districts of Costa Vela: where they sit, their palettes and what gets built in them.
import { WORLD_SIZE } from '../core/config.js';

export const DISTRICTS = [
  {
    id: 'downtown', name: 'Downtown',
    seeds: [[2300, 3250], [1750, 3300], [2800, 3150], [2500, 2750], [3200, 3500]],
    ground: '#cdbfa6', sidewalk: '#e6dcc6', lotGround: '#d4c7ae',
    walls: ['#efe3c8', '#f4ead6', '#e7d4b0', '#f0dcc2'],
    glass: ['#5fb8c4', '#4aa3b8', '#7cc7d0', '#6fb2d6'],
    roofs: ['#bdb4a2', '#a9a395', '#cbc2b0'],
    accents: ['#ff7a66', '#18b6a8', '#ffb347'],
    mix: [['tower', 5], ['midrise', 5], ['deco', 2], ['shop', 1]],
    height: { tower: [170, 340], midrise: [80, 160], deco: [70, 120], shop: [30, 50] },
    lot: [90, 210], gap: [4, 9],
    blockKinds: [['buildings', 8], ['plaza', 1.2], ['parking', 1], ['park', 0.6]],
  },
  {
    id: 'marina', name: 'The Marina',
    seeds: [[4300, 3950], [3600, 3950], [4600, 3500]],
    ground: '#d9cdb2', sidewalk: '#efe6d2', lotGround: '#ded3ba',
    walls: ['#f6f3ea', '#e9f1ee', '#cfeceb', '#f7e9d0'],
    glass: ['#7fd1d6', '#5ab8c9'],
    roofs: ['#2b5d7a', '#d9d4c6', '#34b7b0'],
    accents: ['#34b7b0', '#2b5d7a', '#ff8a6b'],
    mix: [['midrise', 3], ['lowrise', 5], ['shop', 3], ['deco', 1]],
    height: { midrise: [70, 120], lowrise: [34, 62], shop: [26, 44], deco: [60, 100] },
    lot: [80, 170], gap: [6, 12],
    blockKinds: [['buildings', 6], ['parking', 2], ['plaza', 1], ['park', 0.8]],
  },
  {
    id: 'neon', name: 'Neon Row',
    seeds: [[3950, 2850], [4000, 3350]],
    ground: '#bfb1a8', sidewalk: '#d8cbc4', lotGround: '#c6b8b0',
    walls: ['#f48fb1', '#7e57c2', '#26c6da', '#ffb74d', '#ef6c8a'],
    glass: ['#4dd0e1', '#ba68c8'],
    roofs: ['#6d6176', '#8a7f93', '#5d5468'],
    accents: ['#ff3d9a', '#22e6ff', '#ffe14d', '#b46bff'],
    mix: [['club', 5], ['midrise', 3], ['shop', 4], ['lowrise', 2]],
    height: { club: [40, 78], midrise: [70, 130], shop: [30, 52], lowrise: [34, 60] },
    lot: [70, 150], gap: [2, 6],
    blockKinds: [['buildings', 8], ['parking', 1.4], ['plaza', 0.8]],
  },
  {
    id: 'beach', name: 'Vela Beach',
    seeds: [[1500, 4100], [2200, 4150], [2900, 4100]],
    ground: '#e4d6b4', sidewalk: '#f2e8cf', lotGround: '#e8dbbb',
    walls: ['#bfeadf', '#f7c6d0', '#fff1d6', '#9fe0d6', '#ffb4a2'],
    glass: ['#8ad8d6'],
    roofs: ['#ff8a7a', '#35b9ad', '#fbe3c0'],
    accents: ['#ff6f61', '#2ec4b6', '#ffd166'],
    mix: [['deco', 6], ['lowrise', 3], ['shop', 3], ['midrise', 1]],
    height: { deco: [60, 118], lowrise: [32, 58], shop: [26, 42], midrise: [80, 120] },
    lot: [80, 170], gap: [6, 14],
    blockKinds: [['buildings', 6], ['park', 1.4], ['plaza', 1], ['parking', 1]],
  },
  {
    id: 'palms', name: 'Breezy Palms',
    seeds: [[500, 2300], [800, 900], [2500, 1300], [3800, 1500], [4300, 2400], [3000, 500], [4300, 800], [2300, 2000]],
    ground: '#cfc6a8', sidewalk: '#ece3cb', lotGround: '#c9d3a4',
    walls: ['#f6e8d0', '#f3d9c0', '#e9efe0', '#f7d1c4', '#f9f1dc'],
    glass: ['#9fd3d8'],
    roofs: ['#d0714f', '#c25a45', '#cfc7b8', '#b6684c'],
    accents: ['#2ec4b6', '#ff8a7a', '#f4d35e'],
    mix: [['house', 9], ['lowrise', 1.5]],
    height: { house: [22, 34], lowrise: [34, 52] },
    lot: [62, 96], gap: [10, 18],
    blockKinds: [['buildings', 8], ['park', 1.3], ['parking', 0.2]],
  },
  {
    id: 'yards', name: 'The Yards',
    seeds: [[700, 3700], [500, 3200], [1000, 4000]],
    ground: '#b6b0a2', sidewalk: '#c9c3b4', lotGround: '#aaa596',
    walls: ['#b9b7ae', '#b5654a', '#8a9aa0', '#d1b46a', '#9aa7a0'],
    glass: ['#7fa3a8'],
    roofs: ['#7e8a8c', '#6f7a7d', '#8d6a58'],
    accents: ['#ffb300', '#d94f30', '#2a7f9e'],
    mix: [['warehouse', 7], ['lowrise', 1.5], ['shop', 1]],
    height: { warehouse: [34, 60], lowrise: [30, 52], shop: [24, 36] },
    lot: [120, 240], gap: [6, 12],
    blockKinds: [['buildings', 5], ['containers', 4], ['parking', 1]],
  },
  {
    id: 'oldtown', name: 'Old Town',
    seeds: [[1300, 2450], [1100, 1700], [1750, 2000]],
    ground: '#cdb994', sidewalk: '#e5d6b6', lotGround: '#cdb994',
    walls: ['#e8c9a0', '#d9a679', '#f2d7ae', '#e3b88a', '#dcae8c'],
    glass: ['#9bc3c4'],
    roofs: ['#c2674a', '#b45a40', '#d08a62'],
    accents: ['#1f7a7a', '#c94f4f', '#e6b800'],
    mix: [['shop', 6], ['lowrise', 5], ['house', 1]],
    height: { shop: [32, 60], lowrise: [44, 80], house: [26, 38] },
    lot: [46, 100], gap: [0, 2],
    blockKinds: [['buildings', 8], ['plaza', 1.2], ['park', 0.4]],
  },
];

export const DISTRICT_BY_ID = {};
DISTRICTS.forEach((d, i) => { d.index = i; DISTRICT_BY_ID[d.id] = d; });

const GRID_CELL = 100;

// Nearest-seed (Voronoi) assignment, baked into a coarse grid so lookups are O(1).
export class DistrictMap {
  constructor() {
    this.cols = Math.ceil(WORLD_SIZE / GRID_CELL);
    this.cells = new Uint8Array(this.cols * this.cols);
    for (let j = 0; j < this.cols; j++) {
      for (let i = 0; i < this.cols; i++) {
        this.cells[j * this.cols + i] = DistrictMap.nearest((i + 0.5) * GRID_CELL, (j + 0.5) * GRID_CELL);
      }
    }
  }

  static nearest(x, y) {
    let best = 0;
    let bd = Infinity;
    for (const d of DISTRICTS) {
      for (const s of d.seeds) {
        const dd = (s[0] - x) * (s[0] - x) + (s[1] - y) * (s[1] - y);
        if (dd < bd) { bd = dd; best = d.index; }
      }
    }
    return best;
  }

  at(x, y) {
    const i = Math.min(this.cols - 1, Math.max(0, Math.floor(x / GRID_CELL)));
    const j = Math.min(this.cols - 1, Math.max(0, Math.floor(y / GRID_CELL)));
    return DISTRICTS[this.cells[j * this.cols + i]];
  }
}
