/* Turns plain arrow characters on flow and lineage screens into animated data-flow arrows (styled in motion.css). */
(function(){
  const kinds={'→':'','←':'rev','↓':'down'};
  function animateArrows(){
    const app=document.querySelector('#app');if(!app)return;
    app.querySelectorAll('span,em').forEach(el=>{
      if(el.classList.contains('flow-arrow')||el.children.length)return;
      const t=el.textContent.trim();
      if(!(t in kinds))return;
      el.classList.add('flow-arrow');if(kinds[t])el.classList.add(kinds[t]);
      el.setAttribute('aria-hidden','true');
      el.innerHTML='<i></i><b></b>';
    });
  }

  const reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* KPI and headline numbers count up from zero */
  function countUp(){
    document.querySelectorAll('#app .kpi strong,#app .big-num,#app .score strong').forEach(el=>{
      if(el.dataset.counted)return;el.dataset.counted='1';
      const txt=el.textContent.trim(),m=txt.match(/^([$−-]?)([\d,]*\.?\d+)(.*)$/);
      if(!m||/\d/.test(m[3])||/^[-–]/.test(m[3]))return;
      const target=parseFloat(m[2].replace(/,/g,''));if(!target)return;
      const dec=(m[2].split('.')[1]||'').length,comma=m[2].includes(','),t0=performance.now(),dur=900;
      const fmt=v=>{let s=v.toFixed(dec);if(comma)s=Number(s).toLocaleString('en-US',{minimumFractionDigits:dec,maximumFractionDigits:dec});return m[1]+s+m[3]};
      const step=now=>{const k=Math.min(1,(now-t0)/dur),e=1-Math.pow(1-k,3);el.textContent=fmt(target*e);if(k<1)requestAnimationFrame(step);else el.textContent=txt};
      el.textContent=fmt(0);requestAnimationFrame(step);
    });
  }

  /* Line charts draw themselves; data points pop in left to right */
  function drawCharts(){
    document.querySelectorAll('#app svg').forEach(svg=>{
      if(svg.dataset.drawn||svg.closest('button,.navicon,.pal-icon,.feed-icon,.sa-wrap'))return;
      svg.dataset.drawn='1';
      const vb=svg.viewBox&&svg.viewBox.baseVal;const W=vb&&vb.width||600;
      svg.querySelectorAll('path,polyline').forEach(p=>{
        const fill=(p.getAttribute('fill')||'').toLowerCase(),cs=getComputedStyle(p);
        if(fill&&fill!=='none'){if(p.getAttribute('fill').startsWith('url'))p.animate([{opacity:0},{opacity:1}],{duration:1200,delay:500,easing:'ease-out',fill:'backwards'});return}
        if(cs.strokeDasharray&&cs.strokeDasharray!=='none'||p.getAttribute('stroke-dasharray'))return;
        let L=0;try{L=p.getTotalLength()}catch(e){}
        if(L<80)return;
        p.animate([{strokeDasharray:L+' '+L,strokeDashoffset:L},{strokeDasharray:L+' '+L,strokeDashoffset:0}],{duration:1500,easing:'ease-out'});
      });
      const dots=[...svg.querySelectorAll('circle')].filter(c=>Number(c.getAttribute('r'))<=7&&svg.querySelectorAll('circle').length>4);
      dots.forEach(c=>{const x=Number(c.getAttribute('cx'))||0;c.animate([{opacity:0},{opacity:1}],{duration:300,delay:200+x/W*1300,fill:'backwards'})});
      /* Wafer maps: dies appear row by row, like a tester scanning the wafer */
      const rects=svg.querySelectorAll('rect[rx]');
      if(rects.length>80){const H=vb&&vb.height||360;rects.forEach(r=>{const y=Number(r.getAttribute('y'))||0;r.style.animation=`die-in .3s ease-out ${(y/H*1.1).toFixed(2)}s both`})}
    });
  }

  function animateAll(){animateArrows();if(reduce)return;countUp();drawCharts()}
  new MutationObserver(animateAll).observe(document.querySelector('#app'),{childList:true,subtree:true});
  animateAll();
})();
