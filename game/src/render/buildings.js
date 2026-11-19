// Extruded facades with sunward shadows, window grids, neon, palms and roof detail.
const facadeColors=new Map();
export function drawBuildings(ctx,blocks,props,camera,hour=12){
  const left=camera.x-900,right=camera.x+900,top=camera.y-700,bottom=camera.y+700,night=hour>19||hour<6;
  for(const b of blocks){if(b.x+b.w<left||b.x>right||b.y+b.h<top||b.y>bottom)continue;
    const lift=Math.min(48,b.height*.22),colors=shades(b.color),dark=colors[0],sun=colors[1];
    ctx.fillStyle='rgba(29,51,64,.25)';ctx.beginPath();ctx.moveTo(b.x-14,b.y-4);ctx.lineTo(b.x+b.w+lift+30,b.y-lift+23);ctx.lineTo(b.x+b.w+lift+24,b.y+b.h+lift+26);ctx.lineTo(b.x+12,b.y+b.h+lift+12);ctx.closePath();ctx.fill();
    ctx.fillStyle=dark;ctx.beginPath();ctx.moveTo(b.x+b.w,b.y);ctx.lineTo(b.x+b.w+lift,b.y-lift);ctx.lineTo(b.x+b.w+lift,b.y+b.h-lift);ctx.lineTo(b.x+b.w,b.y+b.h);ctx.closePath();ctx.fill();
    ctx.fillStyle=sun;ctx.beginPath();ctx.moveTo(b.x,b.y+b.h);ctx.lineTo(b.x+b.w,b.y+b.h);ctx.lineTo(b.x+b.w+lift,b.y+b.h-lift);ctx.lineTo(b.x+lift,b.y+b.h-lift);ctx.closePath();ctx.fill();
    ctx.fillStyle=b.color;ctx.fillRect(b.x,b.y-lift,b.w,b.h);
    ctx.fillStyle='rgba(45,53,56,.14)';ctx.fillRect(b.x+4,b.y+b.h*.7,b.w-8,b.h*.3-lift);
    const step=b.style==='glass'?25:34,windowW=b.style==='glass'?15:12,windowH=b.style==='glass'?19:14;
    for(let wx=b.x+12;wx<b.x+b.w-8;wx+=step){
      for(let wy=b.y-lift+12;wy<b.y+b.h-10;wy+=b.style==='glass'?29:31){
        const lit=night&&Math.floor(wx/step+wy/31+b.seed*13)%4===0;
        ctx.fillStyle=lit?'rgba(255,211,137,.9)':b.style==='glass'?'rgba(174,222,215,.54)':'rgba(72,105,106,.62)';
        ctx.fillRect(wx,wy,windowW,windowH);ctx.fillStyle=lit?'rgba(255,239,188,.78)':'rgba(255,242,212,.45)';ctx.fillRect(wx,wy,windowW,2);
      }
    }
    if(b.style==='glass'){ctx.strokeStyle='rgba(255,249,221,.62)';ctx.lineWidth=2;for(let x=b.x+20;x<b.x+b.w-5;x+=30){ctx.beginPath();ctx.moveTo(x,b.y-lift+5);ctx.lineTo(x,b.y+b.h-5);ctx.stroke();}}
    if(b.w>78&&b.h>70&&b.style!=='glass'){const awningY=b.y+b.h*.52;ctx.fillStyle=b.seed>.5?'#ef7d63':'#f3d9aa';ctx.fillRect(b.x+7,awningY,b.w-14,10);for(let ax=b.x+7;ax<b.x+b.w-7;ax+=16){ctx.fillStyle='#fff0cf';ctx.fillRect(ax,awningY,7,10);}}
    if(b.style==='neon'&&b.w>85){
      const neon=b.seed>.5?'#ff7692':'#72f0dc',sign=b.label|| (b.seed>.5?'VIVA':'MOTEL'),sx=b.x+b.w*.16,sy=b.y+b.h*.39,sw=b.w*.68;
      ctx.fillStyle='rgba(239,125,99,.13)';ctx.fillRect(sx-8,sy-12,sw+16,32);ctx.fillStyle='rgba(22,39,48,.94)';ctx.fillRect(sx,sy-8,sw,25);ctx.strokeStyle=neon;ctx.lineWidth=2;ctx.strokeRect(sx,sy-8,sw,25);ctx.fillStyle=neon;ctx.font='900 9px sans-serif';ctx.textAlign='center';ctx.fillText(sign,sx+sw/2,sy+8);ctx.textAlign='left';
      if(night){ctx.globalCompositeOperation='lighter';ctx.globalAlpha=.22;ctx.fillStyle=neon;ctx.fillRect(sx-6,sy-14,sw+12,38);ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';}
    }
    if(b.seed>.45&&b.w>80&&b.h>60){ctx.fillStyle='rgba(38,76,80,.72)';ctx.fillRect(b.x+b.w*.28,b.y+b.h*.3,b.w*.42,b.h*.32);ctx.strokeStyle='#e7d9bb';ctx.lineWidth=3;ctx.strokeRect(b.x+b.w*.28,b.y+b.h*.3,b.w*.42,b.h*.32);}
    ctx.fillStyle='rgba(42,51,53,.64)';for(let i=0;i<Math.floor(b.w/65);i++){const rx=b.x+12+i*55;ctx.fillRect(rx,b.y-lift+12,18,11);ctx.fillStyle='rgba(255,240,207,.5)';ctx.fillRect(rx+4,b.y-lift+16,10,3);ctx.fillStyle='rgba(42,51,53,.64)';}
    ctx.fillStyle='rgba(255,247,218,.78)';ctx.lineWidth=2;ctx.strokeStyle='rgba(255,247,218,.72)';ctx.strokeRect(b.x+2,b.y-lift+2,b.w-4,b.h-4);
    if(b.label&&b.style!=='neon'){ctx.fillStyle='#fff0cf';ctx.font='900 10px sans-serif';ctx.textAlign='center';ctx.fillText(b.label,b.x+b.w/2,b.y+b.h/2);ctx.textAlign='left';}
  }
  for(const p of props){if(p.x<left||p.x>right||p.y<top||p.y>bottom)continue;
    if(p.kind==='tree'||p.kind==='palm'){
      const height=p.kind==='palm'?p.size*2.7:p.size*.9;ctx.fillStyle='rgba(29,51,64,.22)';ctx.beginPath();ctx.ellipse(p.x+height*.8,p.y+height*.3,height*1.3,p.size*.55,-.25,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#775f48';ctx.fillRect(p.x-2,p.y-p.size*.3,4,p.size*.72);ctx.fillStyle=p.color;ctx.beginPath();ctx.arc(p.x,p.y-p.size*.35,p.size*.75,0,Math.PI*2);ctx.fill();
      if(p.kind==='palm'){ctx.strokeStyle='#397663';ctx.lineWidth=4;for(let a=0;a<7;a++){const ang=a*Math.PI/3.5,tipX=p.x+Math.cos(ang)*p.size*1.8,tipY=p.y-p.size*.35+Math.sin(ang)*p.size*.9;ctx.beginPath();ctx.moveTo(p.x,p.y-p.size*.35);ctx.quadraticCurveTo(p.x+Math.cos(ang)*p.size*.85,p.y-p.size*.8+Math.sin(ang)*p.size*.55,tipX,tipY);ctx.stroke();ctx.strokeStyle='#628f62';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(p.x,p.y-p.size*.35);ctx.lineTo(tipX,tipY);ctx.stroke();ctx.strokeStyle='#397663';ctx.lineWidth=4;}}
    }else if(p.kind==='umbrella'){ctx.fillStyle=p.color;ctx.beginPath();ctx.arc(p.x,p.y,p.size,Math.PI,0);ctx.lineTo(p.x,p.y);ctx.fill();ctx.strokeStyle='#9b7254';ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(p.x,p.y+p.size);ctx.stroke();}
  }
}
function shades(hex){let colors=facadeColors.get(hex);if(!colors){const n=parseInt(hex.slice(1),16);colors=[shade(n,.69),shade(n,1.08)];facadeColors.set(hex,colors);}return colors;}
function shade(n,factor){return`rgb(${Math.min(255,(n>>16)*factor|0)},${Math.min(255,(n>>8&255)*factor|0)},${Math.min(255,(n&255)*factor|0)})`;}
