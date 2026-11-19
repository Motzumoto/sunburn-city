// Sidewalk walkers who scatter when shots crack nearby.
export class Pedestrian {
  constructor(random,index){this.x=120+random()*3900;this.y=120+random()*3500;this.angle=random()*Math.PI*2;this.speed=18+random()*22;this.color=['#f1d2a7','#e98f7b','#7bb6a7','#d6b3cb'][index%4];this.flee=0;}
  update(dt,shots){if(shots){this.angle=Math.atan2(this.y-shots.y,this.x-shots.x);this.flee=2.2;}this.flee=Math.max(0,this.flee-dt);this.x+=Math.cos(this.angle)*this.speed*(this.flee?3:1)*dt;this.y+=Math.sin(this.angle)*this.speed*(this.flee?3:1)*dt;this.x=Math.max(20,Math.min(4180,this.x));this.y=Math.max(20,Math.min(3780,this.y));}
}
