// Fast, short-lived projectiles with pooled-friendly plain data records.
import { WEAPONS } from '../core/config.js';
export function shoot(player, bullets, random) {
  const weapon=WEAPONS[player.weapon], count=weapon.pellets||1;
  for(let i=0;i<count;i++){const angle=player.angle+(random()-.5)*weapon.spread;bullets.push({x:player.x+Math.cos(angle)*24,y:player.y+Math.sin(angle)*24,vx:Math.cos(angle)*weapon.speed,vy:Math.sin(angle)*weapon.speed,life:.8,damage:weapon.damage,owner:'player'});}
}
