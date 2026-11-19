// Syndicate gunmen defend Costa Vela holdout sites with dodgeable projectiles.
export function createGang(target){return Array.from({length:5},(_,i)=>({x:target.x+(i-2)*72,y:target.y+110+(i%2)*52,health:70,angle:0,cooldown:.4+i*.23,color:['#8e4f48','#a75e50','#60494a','#9a6850','#6d5351'][i]}));}
export function updateGang(enemies,player,dt,bullets,random){
  for(const enemy of enemies){if(enemy.health<=0)continue;const dx=player.x-enemy.x,dy=player.y-enemy.y,distance=Math.hypot(dx,dy);enemy.angle=Math.atan2(dy,dx);enemy.cooldown-=dt;if(distance<520&&enemy.cooldown<=0){const spread=(random()-.5)*.11;const angle=enemy.angle+spread;bullets.push({x:enemy.x+Math.cos(angle)*14,y:enemy.y+Math.sin(angle)*14,vx:Math.cos(angle)*280,vy:Math.sin(angle)*280,life:2,damage:8,owner:'gang'});enemy.cooldown=1.1+random()*.8;}}
}
