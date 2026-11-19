// Ambient parked cars and light-moving traffic along the boulevard grid.
import { createCar } from './vehicle.js';
export function makeTraffic(random){const cars=[];for(let i=0;i<34;i++){const horizontal=i%2===0;const lane=Math.floor(random()*10);const c=createCar(200+random()*3800,200+random()*3500, horizontal?0:Math.PI/2, i);if(horizontal){c.y=460+lane*345+(i%3)*16;c.angle=i%4<2?0:Math.PI;}else{c.x=465+lane*350+(i%3)*16;c.angle=i%4<2?Math.PI/2:-Math.PI/2;}c.speed=random()>.45?48+random()*68:0;cars.push(c);}return cars;}
