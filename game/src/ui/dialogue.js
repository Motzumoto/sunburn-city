// Purpose: draw story dialogue and character portrait cards.
// Main exports: drawDialogue.
// Inputs: context, viewport and character/line records.
// Outputs: one lower-screen dialogue card.
// Side effects: mutates canvas text and path state.
// Notes: card width follows 58 percent of the viewport.
export function drawDialogue(ctx,width,height,character,lines){
  const x=200,y=height-158;ctx.fillStyle='rgba(10,30,38,.9)';round(ctx,x,y,width*.58,126,15);ctx.fill();ctx.strokeStyle='rgba(243,193,142,.76)';ctx.lineWidth=1.5;ctx.stroke();
  ctx.save();ctx.beginPath();ctx.roundRect(x+12,y+12,82,100,10);ctx.clip();ctx.fillStyle=character.color;ctx.fillRect(x+12,y+12,82,100);ctx.fillStyle='#493936';ctx.beginPath();ctx.arc(x+54,y+54,22,0,Math.PI*2);ctx.fill();ctx.fillStyle='#f0bd95';ctx.beginPath();ctx.arc(x+54,y+48,15,0,Math.PI*2);ctx.fill();ctx.fillStyle='#292b31';ctx.fillRect(x+39,y+44,30,5);ctx.fillStyle='#233940';ctx.fillRect(x+30,y+69,48,42);ctx.restore();
  ctx.fillStyle='#f0b37f';ctx.font='900 11px sans-serif';ctx.fillText(character.name,x+110,y+33);ctx.fillStyle='#fff0d6';ctx.font='500 14px sans-serif';ctx.fillText(lines[0]||'',x+110,y+62);ctx.fillText(lines[1]||'',x+110,y+86);
}
function round(ctx,x,y,w,h,r){ctx.beginPath();ctx.roundRect(x,y,w,h,r);}
