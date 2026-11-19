// Purpose: own mission progress and completion rules.
// Main exports: Missions.
// Inputs: player state and frame delta.
// Outputs: complete or failed events.
// Side effects: adds rewards and advances mission progress.
// Notes: heists move their target through staged positions.
import { MISSIONS } from './data/missions.js';
export class Missions {
  constructor(progress=0){this.progress=progress;this.active=null;this.elapsed=0;this.stage=0;this.completeBanner=0;this.failed='';}
  start(){if(this.active)return;const source=MISSIONS[this.progress%MISSIONS.length];this.active={...source,target:{...source.target}};this.elapsed=0;this.stage=0;this.failed='';}
  update(player,dt){if(!this.active)return null;this.elapsed+=dt;const m=this.active;let done=false;
    if(m.time&&this.elapsed>m.time){this.failed='The window closed.';this.active=null;return 'failed';}
    if(Math.hypot(player.x-m.target.x,player.y-m.target.y)<95){
      if(m.type==='holdout'&&this.elapsed<12)return null;
      if(m.type==='heist'&&this.stage<2){this.stage++;m.target={x:m.target.x+135,y:m.target.y+90};return null;}
      done=true;
    }
    if(done){player.money+=m.reward;this.progress++;this.active=null;this.completeBanner=4;return 'complete';}
    this.completeBanner=Math.max(0,this.completeBanner-dt);return null;
  }
  retry(){this.start();}
}
