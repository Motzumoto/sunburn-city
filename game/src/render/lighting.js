// Purpose: apply final hour tint, vignette and grain.
// Main exports: drawLighting.
// Inputs: canvas context, viewport and hour.
// Outputs: full-screen atmospheric overlays.
// Side effects: caches one reusable grain pattern.
// Notes: daylight and night gradients follow the palette module.
import { lightAt } from './palette.js';
let grainPattern=null;
function getGrain(ctx){
  if(grainPattern)return grainPattern;
  const grain=document.createElement('canvas');grain.width=64;grain.height=64;
  const sample=grain.getContext('2d'),image=sample.createImageData(64,64);
  for(let i=0;i<image.data.length;i+=4){const value=Math.random()<.5?0:255;image.data[i]=value;image.data[i+1]=value;image.data[i+2]=value;image.data[i+3]=28;}
  sample.putImageData(image,0,0);grainPattern=ctx.createPattern(grain,'repeat');return grainPattern;
}
export function drawLighting(ctx,width,height,hour){
  const light=lightAt(hour);ctx.fillStyle=light.wash;ctx.fillRect(0,0,width,height);
  if(hour>17||hour<6){const sun=ctx.createRadialGradient(width*.82,height*.73,8,width*.82,height*.73,width*.55);sun.addColorStop(0,'rgba(255,190,115,.10)');sun.addColorStop(1,'rgba(255,190,115,0)');ctx.fillStyle=sun;ctx.fillRect(0,0,width,height);}
  const vignette=ctx.createRadialGradient(width/2,height/2,height*.25,width/2,height/2,height*.82);vignette.addColorStop(.62,'rgba(29,51,64,0)');vignette.addColorStop(1,'rgba(18,34,46,.20)');ctx.fillStyle=vignette;ctx.fillRect(0,0,width,height);
  ctx.globalAlpha=.05;ctx.fillStyle=getGrain(ctx);ctx.fillRect(0,0,width,height);ctx.globalAlpha=1;
}
