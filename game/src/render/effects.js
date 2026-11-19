// Deterministic dust, muzzle flashes, shell casings, skid marks and smoke.
export class Effects {
  constructor(){this.items=[];}
  add(x,y,type='dust',angle=0,lifetime=null){const duration={flash:3,casing:7,spark:2.5,dust:3.4,smoke:7,skid:18};const life=lifetime??duration[type]??3.4;this.items.push({x,y,type,angle,life,maxLife:life});}
  update(dt){for(let i=this.items.length-1;i>=0;i--){this.items[i].life-=dt;if(this.items[i].life<=0)this.items.splice(i,1);}}
  draw(ctx,foreground=null){
    for(const e of this.items){
      const behind=['smoke','dust','skid'].includes(e.type);
      if(foreground!==null&&foreground===behind)continue;
      const age=Math.max(1-e.life/e.maxLife,e.type==='smoke'?.55:e.type==='dust'?.2:0);ctx.save();ctx.globalAlpha=e.type==='skid'?.72:Math.min(1,e.life*2);ctx.translate(e.x,e.y);ctx.rotate(e.angle);
      if(e.type==='flash'){ctx.shadowBlur=22;ctx.shadowColor='#ffad53';ctx.fillStyle='#fff4bc';ctx.beginPath();ctx.moveTo(0,-5);ctx.lineTo(5,-3);ctx.lineTo(16,0);ctx.lineTo(5,3);ctx.lineTo(2,8);ctx.lineTo(0,4);ctx.lineTo(-5,3);ctx.lineTo(-15,0);ctx.lineTo(-4,-3);ctx.lineTo(-2,-8);ctx.closePath();ctx.fill();ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(0,0,4,0,Math.PI*2);ctx.fill();}
      else if(e.type==='casing'){ctx.fillStyle='#f4c66e';ctx.strokeStyle='#fff0b0';ctx.lineWidth=1.5;ctx.beginPath();ctx.roundRect(-5,-2,10,4,2);ctx.fill();ctx.stroke();}
      else if(e.type==='spark'){ctx.strokeStyle='#ffd66e';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-8,0);ctx.lineTo(8,0);ctx.moveTo(0,-7);ctx.lineTo(0,7);ctx.stroke();}
      else if(e.type==='skid'){ctx.strokeStyle='rgba(18,18,22,.95)';ctx.lineWidth=12;ctx.beginPath();ctx.moveTo(-120,-4);ctx.lineTo(120,-4);ctx.stroke();}
      else{const radius=(e.type==='smoke'?16:5)+age*(e.type==='smoke'?44:18);const puff=ctx.createRadialGradient(0,0,1,0,0,radius);puff.addColorStop(0,e.type==='smoke'?'rgba(175,180,180,.82)':'rgba(220,190,154,.55)');puff.addColorStop(1,e.type==='smoke'?'rgba(135,148,154,0)':'rgba(220,190,154,0)');ctx.fillStyle=puff;ctx.beginPath();ctx.arc(0,0,radius,0,Math.PI*2);ctx.fill();}
      ctx.restore();
    }
    ctx.globalAlpha=1;
  }
}
