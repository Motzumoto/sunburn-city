// Reusable palms, rooftop details, beach umbrellas and waterfront greenery.
export function makeProps(blocks, random) {
  const props = [];
  for (let i = 0; i < 430; i++) {
    const x = 70 + random() * 4060, y = 90 + random() * 3720;
    props.push({ x, y, kind: random() > .78 ? 'palm' : 'tree', size: 12 + random() * 10, color: ['#477c68','#628e68','#3d7164'][Math.floor(random()*3)] });
  }
  for (const b of blocks) {
    const count = Math.max(2, Math.floor((b.w + b.h) / 55));
    for (let i = 0; i < count; i++) {
      const edge = Math.floor(random() * 4);
      props.push({ x: edge < 2 ? b.x + random() * b.w : b.x + (edge === 2 ? 0 : b.w), y: edge >= 2 ? b.y + random() * b.h : b.y + (edge === 0 ? 0 : b.h),
        kind: random() > .55 ? 'ac' : 'roof', size: 7 + random() * 14, color: '#d2c2a5' });
    }
  }
  for (let i = 0; i < 26; i++) props.push({ x: 2300 + random() * 1700, y: 3350 + random() * 500, kind: 'umbrella', size: 15 + random() * 5, color: ['#ff856f','#f4e0bb','#56bcb0'][i % 3] });
  for (let x = 170; x < 4040; x += 100) {
    props.push({ x, y: 3535, kind: 'palm', size: 17, color: '#397663' });
    props.push({ x: x + 44, y: 3595, kind: 'palm', size: 15, color: '#4a8069' });
  }
  return props;
}
