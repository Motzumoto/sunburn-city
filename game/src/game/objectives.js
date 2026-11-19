// Purpose: format active mission objective text.
// Main exports: distanceTo, objectiveText.
// Inputs: player position and active mission record.
// Outputs: rounded distance or free-roam objective text.
// Side effects: none.
// Notes: objective text is consumed by the HUD renderer.
export function distanceTo(player, target){return Math.round(Math.hypot(target.x-player.x,target.y-player.y));}
export function objectiveText(mission,player){if(!mission)return'Free roam — Costa Vela is yours';return `${mission.title}  ·  ${distanceTo(player,mission.target)} m`;}
