// Player movement, aiming, weapon inventory, health and vehicle transitions.
import { WEAPONS } from '../core/config.js';
export class Player {
  constructor() { this.x=1800; this.y=1700; this.vx=0; this.vy=0; this.angle=0; this.health=100; this.armor=35; this.money=1250; this.weapon=0; this.ammo=WEAPONS.map(w=>w.mag*5); this.mag=WEAPONS.map(w=>w.mag); this.reload=0; this.cooldown=0; this.vehicle=null; this.walk=0; this.invulnerable=0; }
  update(input, dt, camera, canvas, city, fire) {
    const oldX=this.x,oldY=this.y;
    const dir=input.direction(); this.walk+=dt*(Math.abs(dir.x)+Math.abs(dir.y))*8;
    if(input.hit('Digit1','Digit2','Digit3','Digit4')) this.weapon=['Digit1','Digit2','Digit3','Digit4'].findIndex(k=>input.hit(k));
    if(input.hit('KeyR') && this.mag[this.weapon]<WEAPONS[this.weapon].mag && this.ammo[this.weapon]>0) this.reload=1.05;
    if(this.reload>0){ this.reload=Math.max(0,this.reload-dt); if(!this.reload){const amount=Math.min(WEAPONS[this.weapon].mag-this.mag[this.weapon],this.ammo[this.weapon]);this.mag[this.weapon]+=amount;this.ammo[this.weapon]-=amount;} }
    this.cooldown=Math.max(0,this.cooldown-dt); this.invulnerable=Math.max(0,this.invulnerable-dt);
    if(input.hit('KeyE')) {
      if(this.vehicle){this.x+=Math.cos(this.vehicle.angle+1.5)*35;this.y+=Math.sin(this.vehicle.angle+1.5)*35;this.vehicle.occupied=false;this.vehicle=null;}
      else {let nearest=null,dist=100;for(const car of city.cars){const d=Math.hypot(car.x-this.x,car.y-this.y);if(d<dist&&!car.occupied){nearest=car;dist=d;}}if(nearest){this.vehicle=nearest;nearest.occupied=true;}}
    }
    const mx=(input.mouse.x-canvas.width/2)/camera.zoom+camera.x, my=(input.mouse.y-canvas.height/2)/camera.zoom+camera.y;
    this.angle=Math.atan2(my-this.y,mx-this.x);
    if(this.vehicle){const car=this.vehicle;const throttle=Number(input.down('KeyW','ArrowUp'))-Number(input.down('KeyS','ArrowDown')); const steer=Number(input.down('KeyD','ArrowRight'))-Number(input.down('KeyA','ArrowLeft'));
      car.speed+=throttle*260*dt;car.speed*=Math.pow(.985,dt*60);car.speed=Math.max(-120,Math.min(car.maxSpeed,car.speed));car.angle+=steer*dt*(0.6+Math.abs(car.speed)/115)*Math.sign(car.speed||1);car.x+=Math.cos(car.angle)*car.speed*dt;car.y+=Math.sin(car.angle)*car.speed*dt;this.x=car.x;this.y=car.y;this.angle=car.angle;
    }else{const length=Math.hypot(dir.x,dir.y)||1,sprint=input.down('ShiftLeft','ShiftRight')?1.55:1;this.vx+=(dir.x/length*175*sprint-this.vx)*Math.min(1,dt*7);this.vy+=(dir.y/length*175*sprint-this.vy)*Math.min(1,dt*7);if(!dir.x)this.vx*=Math.pow(.86,dt*60);if(!dir.y)this.vy*=Math.pow(.86,dt*60);this.x+=this.vx*dt;this.y+=this.vy*dt;}
    this.x=Math.max(40,Math.min(4160,this.x));this.y=Math.max(40,Math.min(3740,this.y));
    if(city.blocks.some(b=>this.x>b.x-12&&this.x<b.x+b.w+12&&this.y>b.y-12&&this.y<b.y+b.h+12)){
      this.x=oldX;if(city.blocks.some(b=>this.x>b.x-12&&this.x<b.x+b.w+12&&this.y>b.y-12&&this.y<b.y+b.h+12))this.y=oldY;
      if(this.vehicle){this.vehicle.speed*=.28;this.x=this.vehicle.x=oldX;this.y=this.vehicle.y=oldY;}
    }
    if(input.mouse.down && !this.vehicle && this.cooldown===0 && this.reload===0 && this.mag[this.weapon]>0){fire(this);this.mag[this.weapon]--;this.cooldown=WEAPONS[this.weapon].rate;}
  }
}
