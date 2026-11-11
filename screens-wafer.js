/* Wafer sizes, thicknesses and die-per-wafer used by products, wafer maps and quality rules. */
(function(){
  /* Industry-standard wafers (SEMI M1 for silicon; common SiC thicknesses). */
  const standards=[
    [100,'4-inch',525,'Flat','Silicon','Legacy, MEMS, discrete'],
    [125,'5-inch',625,'Flat','Silicon','Legacy analog, discrete'],
    [150,'6-inch',675,'Flat','Silicon','Analog, RF, power, MEMS'],
    [200,'8-inch',725,'Notch','Silicon','Power, analog, sensors, mature logic'],
    [300,'12-inch',775,'Notch','Silicon','Microcontrollers, logic, memory'],
    [150,'6-inch',350,'Flat','Silicon carbide (SiC)','Power MOSFETs, EV inverters'],
    [200,'8-inch',500,'Notch','Silicon carbide (SiC)','Next-generation SiC power']
  ];
  const products={
    'Automotive MCU':{size:300,incoming:775,final:200,tol:15,die:[4.2,4.2],edge:3},
    'Power management':{size:200,incoming:725,final:100,tol:10,die:[3,3],edge:3},
    'RF transceiver':{size:150,incoming:675,final:250,tol:15,die:[2.5,2.5],edge:3},
    'Secure element':{size:300,incoming:775,final:150,tol:10,die:[2,2],edge:3},
    'Sensor interface':{size:200,incoming:725,final:300,tol:20,die:[3.5,3.5],edge:3}
  };
  /* Gross die per wafer: usable area / die area − edge loss. */
  const gdpw=(d,w,h,e)=>{const D=d-2*e,S=w*h;return Math.max(0,Math.floor(Math.PI*(D/2)**2/S-Math.PI*D/Math.sqrt(2*S)))};
  window.waferStandards=standards;
  window.gdpw=gdpw;
  window.specFor=function(name){const s=products[name]||products['Automotive MCU'];const std=standards.find(x=>x[0]===s.size&&x[4]==='Silicon');return Object.assign({},s,{name,inch:std[1],label:`${s.size} mm (${std[1]})`,mark:std[3],material:'Silicon',gross:gdpw(s.size,s.die[0],s.die[1],s.edge),dieLabel:`${s.die[0]} × ${s.die[1]} mm`})};
  window.productSpecNames=Object.keys(products);

  window.calcGdpw=function(f){const d=Number(f.d.value),w=Number(f.w.value),h=Number(f.h.value),e=Number(f.e.value);const out=document.querySelector('#gdpw-out');if(!out)return;if(!(d>0&&w>0&&h>0&&e>=0)){out.textContent='—';return}const g=gdpw(d,w,h,e);out.innerHTML=`<b>${g.toLocaleString()}</b> gross die per wafer <small>${d} mm wafer · ${w} × ${h} mm die · ${e} mm edge exclusion</small>`};

  function waferSpecs(){
    const rows=productSpecNames.map(n=>{const s=specFor(n);return [n,s.label,s.mark,`${s.incoming} µm`,`${s.final} ± ${s.tol} µm`,s.dieLabel,s.gross.toLocaleString(),'Active']});
    return title('Wafer specifications','Wafer size, thickness and die layout for every product. Zero uses them to know how many dies each wafer map must contain and which thickness is in spec.',btn('+ New wafer spec',"document.querySelector('#gdpw-form [name=d]').focus()",true))
    +kpis([['Wafer sizes in use','3','150, 200 and 300 mm'],['Products specified','5','All active products'],['Thickness tolerance','± 10–20 µm','After back-grinding · TTV ≤ 3 µm'],['Out of spec today','1 wafer','LOT-2026-0841 · W07',true]])
    +card('Product wafer specifications','Select a product to open its wafer map.',table(['Product','Wafer size','Orientation','Incoming thickness','Final thickness','Die size','Gross die / wafer','Status'],rows,"navigate(['wafer-map/0','wafer-map/1','wafer-map/2','wafer-map/4','products'][$i])"))
    +`<div class="two">${card('Industry-standard wafers','Diameters and standard (as-delivered) thickness. Wafers are usually back-ground to 50–300 µm before assembly.',`<table class="static"><thead><tr><th>Diameter</th><th>Name</th><th>Standard thickness</th><th>Orientation</th><th>Material</th><th>Typical use</th></tr></thead><tbody>${standards.map(s=>`<tr><td><b>${s[0]} mm</b></td><td style="white-space:nowrap">${s[1]}</td><td style="white-space:nowrap">${s[2]} µm</td><td>${s[3]}</td><td>${s[4]}</td><td>${s[5]}</td></tr>`).join('')}</tbody></table><p class="note" style="padding:12px 22px 18px">Silicon thickness follows SEMI M1. 450 mm wafers were proposed but are not in volume production.</p>`)}
      ${card('Die-per-wafer calculator','Check the expected die count for a new product.',`<form id="gdpw-form" class="pad" style="padding-top:0" oninput="calcGdpw(this)" onsubmit="event.preventDefault();calcGdpw(this);audit('Wafer spec calculated');toast('Wafer spec saved as draft')"><div class="fields"><label class="field">Wafer diameter<select name="d">${[100,125,150,200,300].map(d=>`<option value="${d}" ${d===300?'selected':''}>${d} mm</option>`).join('')}</select></label><label class="field">Edge exclusion (mm)<input name="e" type="number" step="0.5" min="0" value="3"></label><label class="field">Die width (mm)<input name="w" type="number" step="0.1" min="0.1" value="4.2"></label><label class="field">Die height (mm)<input name="h" type="number" step="0.1" min="0.1" value="4.2"></label></div><div class="gdpw-out" id="gdpw-out"><b>${gdpw(300,4.2,4.2,3).toLocaleString()}</b> gross die per wafer <small>300 mm wafer · 4.2 × 4.2 mm die · 3 mm edge exclusion</small></div><div class="formactions"><button class="primary">Save as draft spec</button></div></form>`)}</div>`
    +card('Thickness checks','Measured after back-grinding and stored with the wafer map.',`<div class="pad" style="padding-top:0">${[['Final thickness','Within target ± tolerance for the product'],['Total thickness variation (TTV)','≤ 3 µm across the wafer'],['Measurement present','Every wafer must carry a thickness record before release'],['Wafer size','Map header diameter must match the product specification']].map(([k,v])=>`<div class="statline"><span>${k}</span><b>${v}</b></div>`).join('')}<div class="formactions"><a class="button" href="#rules">Open quality rules</a><a class="button primary" href="#wafer-map/1">See an out-of-spec wafer</a></div></div>`);
  }
  registerPage('wafer-specs',waferSpecs,{});
})();
