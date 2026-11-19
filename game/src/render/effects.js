// Capped flashes, tracers, casings, tire smoke, sparks and searchlight effects.
export class Effects {
  constructor(){this.items=[];}
  add(x,y,type='dust',angle=0,lifetime=null){
    const duration={flash:.22,casing:7,spark:.5,dust:3.4,smoke:7,skid:18,beam:2.8,glow:1.6};
    const life=lifetime??duration[type]??3.4;if(this.items.length>=180)this.items.shift();this.items.push({x,y,type,angle,life,maxLife:life});
  }
  update(dt){for(let i=this.items.length-1;i>=0;i--){this.items[i].life-=dt;if(this.items[i].life<=0)this.items.splice(i,1);}}
  draw(ctx,foreground=null){
    let glows=0;
    for(const e of this.items){
      const behind=e.type==='smoke'||e.type==='dust'||e.type==='skid';
      if(foreground!==null&&foreground===behind)continue;
      if((e.type==='glow'||e.type==='beam')&&glows++>=8)continue;
      const age=Math.max(1-e.life/e.maxLife,e.type==='smoke'?.35:e.type==='dust'?.2:0);ctx.save();ctx.globalAlpha=e.type==='skid'?.72:Math.min(1,e.life*5);ctx.translate(e.x,e.y);ctx.rotate(e.angle);
      if(e.type==='flash'){ctx.globalCompositeOperation='lighter';ctx.fillStyle='rgba(255,144,65,.18)';ctx.beginPath();ctx.arc(0,0,14,0,Math.PI*2);ctx.fill();ctx.fillStyle='#fff0a8';ctx.beginPath();ctx.moveTo(0,-5);ctx.lineTo(5,-3);ctx.lineTo(17,0);ctx.lineTo(5,3);ctx.lineTo(2,8);ctx.lineTo(0,4);ctx.lineTo(-5,3);ctx.lineTo(-16,0);ctx.lineTo(-4,-3);ctx.lineTo(-2,-8);ctx.closePath();ctx.fill();ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(0,0,4,0,Math.PI*2);ctx.fill();}
      else if(e.type==='casing'){ctx.fillStyle='#f4c66e';ctx.strokeStyle='#fff0b0';ctx.lineWidth=1.5;ctx.beginPath();ctx.roundRect(-5,-2,10,4,2);ctx.fill();ctx.stroke();}
      else if(e.type==='spark'){ctx.globalCompositeOperation='lighter';ctx.strokeStyle='#ffd66e';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-11,0);ctx.lineTo(11,0);ctx.moveTo(0,-10);ctx.lineTo(0,10);ctx.moveTo(-7,-7);ctx.lineTo(7,7);ctx.stroke();}
      else if(e.type==='skid'){ctx.strokeStyle='rgba(18,18,22,.95)';ctx.lineWidth=12;ctx.beginPath();ctx.moveTo(-120,-4);ctx.lineTo(120,-4);ctx.stroke();}
      else if(e.type==='beam'){const beam=ctx.createLinearGradient(0,0,260,0);beam.addColorStop(0,'rgba(255,246,202,.10)');beam.addColorStop(.7,'rgba(214,231,236,.05)');beam.addColorStop(1,'rgba(214,231,236,0)');ctx.fillStyle=beam;ctx.beginPath();ctx.moveTo(0,-9);ctx.lineTo(260,-64);ctx.lineTo(260,64);ctx.lineTo(0,9);ctx.closePath();ctx.fill();}
      else if(e.type==='glow'){const radius=90+age*20,glow=ctx.createRadialGradient(0,0,3,0,0,radius);glow.addColorStop(0,'rgba(255,82,91,.42)');glow.addColorStop(.48,'rgba(66,143,255,.22)');glow.addColorStop(1,'rgba(66,143,255,0)');ctx.globalCompositeOperation='lighter';ctx.fillStyle=glow;ctx.beginPath();ctx.arc(0,0,radius,0,Math.PI*2);ctx.fill();}
      else{const radius=(e.type==='smoke'?16:5)+age*(e.type==='smoke'?44:18);const puff=ctx.createRadialGradient(0,0,1,0,0,radius);puff.addColorStop(0,e.type==='smoke'?'rgba(175,180,180,.82)':'rgba(220,190,154,.55)');puff.addColorStop(1,e.type==='smoke'?'rgba(135,148,154,0)':'rgba(220,190,154,0)');ctx.fillStyle=puff;ctx.beginPath();ctx.arc(0,0,radius,0,Math.PI*2);ctx.fill();}
      ctx.restore();
    }
    ctx.globalAlpha=1;
  }
}
