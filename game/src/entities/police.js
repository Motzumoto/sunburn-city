// Wanted-level response units that pursue the player with flashing rooftop lights.
import { createCar } from './vehicle.js';
export function spawnPolice(player,index){const angle=(index*2.399)% (Math.PI*2);return createCar(player.x+Math.cos(angle)*(380+index*70),player.y+Math.sin(angle)*(380+index*70),angle,index,true);}
export function updatePolice(police,player,dt){for(const unit of police){const desired=Math.atan2(player.y-unit.y,player.x-unit.x);let diff=Math.atan2(Math.sin(desired-unit.angle),Math.cos(desired-unit.angle));unit.angle+=Math.max(-2.2*dt,Math.min(2.2*dt,diff));unit.speed=Math.min(unit.maxSpeed,unit.speed+100*dt);unit.x+=Math.cos(unit.angle)*unit.speed*dt;unit.y+=Math.sin(unit.angle)*unit.speed*dt;}}
