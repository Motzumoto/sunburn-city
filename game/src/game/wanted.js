// Wanted heat, escalating response stars and Sunspray payoff service.
export class Wanted {
  constructor(){this.level=0;this.heat=0;this.cool=0;}
  add(amount=1){this.heat=Math.min(5,this.heat+amount);this.level=Math.min(5,Math.ceil(this.heat));this.cool=0;}
  update(dt,nearPolice){if(this.level&& !nearPolice){this.cool+=dt;if(this.cool>24){this.heat=Math.max(0,this.heat-dt*.12);this.level=Math.ceil(this.heat);}}}
  clear(player){const fee=this.level*350;if(player.money<fee)return false;player.money-=fee;this.heat=0;this.level=0;this.cool=0;return true;}
}
