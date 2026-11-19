// SUNBURN CITY — Supplies seeded random numbers for repeatable world generation.
// Seeded pseudo random numbers keep the generated city and screenshot scenes deterministic.

export function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hashString(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export class Random {
  constructor(seed) {
    this.seed = seed >>> 0;
    this.next = mulberry32(this.seed);
  }

  // Independent child stream, so adding content in one system never reshuffles another.
  fork(label) {
    return new Random((this.seed ^ hashString(String(label))) >>> 0);
  }

  range(lo, hi) {
    return lo + (hi - lo) * this.next();
  }

  int(lo, hi) {
    return Math.floor(this.range(lo, hi + 1));
  }

  chance(p) {
    return this.next() < p;
  }

  sign() {
    return this.next() < 0.5 ? -1 : 1;
  }

  pick(list) {
    return list[Math.floor(this.next() * list.length) % list.length];
  }

  // Picks from [[item, weight], ...].
  weighted(pairs) {
    let total = 0;
    for (const p of pairs) total += p[1];
    let r = this.next() * total;
    for (const p of pairs) {
      r -= p[1];
      if (r <= 0) return p[0];
    }
    return pairs[pairs.length - 1][0];
  }

  shuffle(list) {
    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.floor(this.next() * (i + 1));
      const t = list[i];
      list[i] = list[j];
      list[j] = t;
    }
    return list;
  }
}
