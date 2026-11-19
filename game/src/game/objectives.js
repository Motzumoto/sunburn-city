// Mission marker progression and human-readable distance callouts.
export function distanceTo(player, target){return Math.round(Math.hypot(target.x-player.x,target.y-player.y));}
export function objectiveText(mission,player){if(!mission)return'Free roam — Costa Vela is yours';return `${mission.title}  ·  ${distanceTo(player,mission.target)} m`;}
