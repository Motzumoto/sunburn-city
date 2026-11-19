// Extruded roof masses with long sunward shadows, parapets, glazing and rooftop details.
export function drawBuildings(ctx,blocks,props,camera,hour=12){
  const left=camera.x-900,right=camera.x+900,top=camera.y-700,bottom=camera.y+700;
  for(const b of blocks){if(b.x+b.w<left||b.x>right||b.y+b.h<top||b.y>bottom)continue;
    const lift=Math.min(48,b.height*.22),dark=shade(b.color,.69),sun=shade(b.color,1.08);
    ctx.fillStyle='rgba(28,38,44,.18)';ctx.beginPath();ctx.moveTo(b.x-11,b.y-5);ctx.lineTo(b.x+b.w+lift+26,b.y-lift+18);ctx.lineTo(b.x+b.w+lift+20,b.y+b.h+lift+22);ctx.lineTo(b.x+12,b.y+b.h+lift+10);ctx.closePath();ctx.fill();
    ctx.fillStyle=dark;ctx.beginPath();ctx.moveTo(b.x+b.w,b.y);ctx.lineTo(b.x+b.w+lift,b.y-lift);ctx.lineTo(b.x+b.w+lift,b.y+b.h-lift);ctx.lineTo(b.x+b.w,b.y+b.h);ctx.closePath();ctx.fill();
    ctx.fillStyle=sun;ctx.beginPath();ctx.moveTo(b.x,b.y+b.h);ctx.lineTo(b.x+b.w,b.y+b.h);ctx.lineTo(b.x+b.w+lift,b.y+b.h-lift);ctx.lineTo(b.x+lift,b.y+b.h-lift);ctx.closePath();ctx.fill();
    ctx.fillStyle=b.color;ctx.fillRect(b.x,b.y-lift,b.w,b.h);
    if(hour>19||hour<6){ctx.fillStyle='rgba(255,215,145,.82)';for(let wx=b.x+12;wx<b.x+b.w-4;wx+=31){if(Math.floor(wx/31+b.seed*9)%3!==0){ctx.fillRect(wx,b.y+b.h-lift+5,6,5);if(b.style==='glass')ctx.fillRect(wx,b.y-lift+15,5,4);}}}
    ctx.strokeStyle='rgba(255,247,218,.75)';ctx.lineWidth=3;ctx.strokeRect(b.x+2,b.y-lift+2,b.w-4,b.h-4);
    if(b.style==='glass'){ctx.strokeStyle='rgba(255,249,221,.4)';ctx.lineWidth=2;for(let x=b.x+20;x<b.x+b.w-5;x+=30){ctx.beginPath();ctx.moveTo(x,b.y-lift+6);ctx.lineTo(x,b.y+b.h-5);ctx.stroke();}}
    if(b.style==='neon'&&b.w>85){ctx.save();ctx.shadowBlur=15;ctx.shadowColor=b.seed>.5?'#ff648b':'#44e3d2';ctx.fillStyle=b.seed>.5?'#ff8297':'#6de5d3';ctx.fillRect(b.x+b.w*.22,b.y+b.h*.4,b.w*.56,5);ctx.shadowBlur=0;ctx.fillStyle='rgba(28,48,53,.86)';ctx.font='900 8px sans-serif';ctx.textAlign='center';ctx.fillText(b.seed>.5?'VIVA':'MOTEL',b.x+b.w*.5,b.y+b.h*.4-4);ctx.textAlign='left';ctx.restore();}
    if(b.seed>.45&&b.w>80&&b.h>60){ctx.fillStyle='rgba(38,76,80,.72)';ctx.fillRect(b.x+b.w*.28,b.y+b.h*.3,b.w*.42,b.h*.32);ctx.strokeStyle='#e7d9bb';ctx.lineWidth=3;ctx.strokeRect(b.x+b.w*.28,b.y+b.h*.3,b.w*.42,b.h*.32);}
    ctx.fillStyle='rgba(42,51,53,.54)';for(let i=0;i<Math.floor(b.w/65);i++){ctx.fillRect(b.x+12+i*55,b.y-lift+12,18,11);ctx.fillRect(b.x+16+i*55,b.y-lift+16,10,3);}
    if(b.label){ctx.fillStyle='#fff0c8';ctx.font=`900 ${Math.min(15,9+b.w/40)}px sans-serif`;ctx.textAlign='center';ctx.fillText(b.label,b.x+b.w/2,b.y+b.h/2);ctx.textAlign='left';}
  }
  for(const p of props){if(p.x<left||p.x>right||p.y<top||p.y>bottom)continue;
    if(p.kind==='tree'||p.kind==='palm'){ctx.fillStyle='rgba(30,40,41,.2)';ctx.beginPath();ctx.ellipse(p.x+8,p.y+9,p.size*1.35,p.size*.72,-.3,0,Math.PI*2);ctx.fill();ctx.fillStyle='#775f48';ctx.fillRect(p.x-2,p.y-p.size*.3,4,p.size*.72);ctx.fillStyle=p.color;ctx.beginPath();ctx.arc(p.x,p.y-p.size*.35,p.size*.8,0,Math.PI*2);ctx.fill();if(p.kind==='palm'){ctx.strokeStyle='#437b68';ctx.lineWidth=3;for(let a=0;a<6;a++){const ang=a*Math.PI/3;ctx.beginPath();ctx.moveTo(p.x,p.y-p.size*.35);ctx.quadraticCurveTo(p.x+Math.cos(ang)*p.size,p.y-p.size*.8+Math.sin(ang)*p.size,p.x+Math.cos(ang)*p.size*1.6,p.y-p.size*.35+Math.sin(ang)*p.size);ctx.stroke();}}}
    else if(p.kind==='umbrella'){ctx.fillStyle=p.color;ctx.beginPath();ctx.arc(p.x,p.y,p.size,Math.PI,0);ctx.lineTo(p.x,p.y);ctx.fill();ctx.strokeStyle='#9b7254';ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(p.x,p.y+p.size);ctx.stroke();}
  }
}
function shade(hex,factor){const n=parseInt(hex.slice(1),16);return`rgb(${Math.min(255,(n>>16)*factor|0)},${Math.min(255,(n>>8&255)*factor|0)},${Math.min(255,(n&255)*factor|0)})`;}
