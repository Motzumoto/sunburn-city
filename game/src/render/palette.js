// SUNBURN CITY — Provides cached colour parsing, shading and mixing helpers.
// Colour helpers: hex parsing, shading and mixing that return CSS strings (cached by callers, not per frame).

export const PALETTE = {
  sand: '#d9c39a',
  coral: '#ef7d63',
  teal: '#2f8f8f',
  shadow: '#1d3340',
  cream: '#fff0cf',
};

export function hexToRgb(hex) {
  const h = hex.charAt(0) === '#' ? hex.slice(1) : hex;
  const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function rgbCss(r, g, b, a = 1) {
  const c = (v) => Math.max(0, Math.min(255, Math.round(v)));
  return a >= 1 ? 'rgb(' + c(r) + ',' + c(g) + ',' + c(b) + ')' : 'rgba(' + c(r) + ',' + c(g) + ',' + c(b) + ',' + a + ')';
}

// amount > 0 lightens toward white, < 0 darkens toward black.
export function shade(hex, amount) {
  const [r, g, b] = hexToRgb(hex);
  if (amount >= 0) return rgbCss(r + (255 - r) * amount, g + (255 - g) * amount, b + (255 - b) * amount);
  return rgbCss(r * (1 + amount), g * (1 + amount), b * (1 + amount));
}

export function mix(hexA, hexB, t) {
  const a = hexToRgb(hexA);
  const b = hexToRgb(hexB);
  return rgbCss(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t);
}

// Shaded wall pair: sunlit west face is warmed, the south face is cooled and darkened.
export function wallColors(hex) {
  return { lit: mix(shade(hex, 0.12), PALETTE.cream, 0.16), dark: mix(shade(hex, -0.2), PALETTE.shadow, 0.2) };
}

export function alpha(hex, a) {
  const [r, g, b] = hexToRgb(hex);
  return rgbCss(r, g, b, a);
}

export function roundRectPath(ctx, x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}
