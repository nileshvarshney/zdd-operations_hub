/* Live end-to-end flow, laid out like the customer's ZDD processing diagram:
   five stages on top, numbered components 1–10 below, data packets moving along every connector. */
(function(){
  const GREEN='#4f9a3a',DARK='#5b3a8c',LIGHT='#ece4f7',LIGHTB='#d9cbef',BLUE='#3d8fc2';
  const stages=[
    ['events','Data processing','1,284 processed','M-10 -6h10v-6l10 12-10 12v-6h-10z'],
    ['predictions','AI prediction of data arrival & potential defect','24 at risk','M0 -13l3.5 9.5 9.5 3.5-9.5 3.5-3.5 9.5-3.5-9.5-9.5-3.5 9.5-3.5z'],
    ['monitoring','Data monitoring','12 late / missing','M-13 0s5-9 13-9 13 9 13 9-5 9-13 9-13-9-13-9zM0 -4a4 4 0 1 0 .01 0z'],
    ['quality','Data quality check','98.6% passing','M-11 0l7 7 15-15'],
    ['alarms','Alarm management','3 need attention','M-8 6v-6a8 8 0 0 1 16 0v6l3 3h-22zM-3 12h6']
  ];
  const X=[120,340,560,780,1000];
  const box=(n,x,y,w,h,label,sub,href,kind,timer)=>{
    const fill=kind==='dark'?DARK:kind==='blue'?BLUE:LIGHT,stroke=kind==='light'?LIGHTB:fill,tc=kind==='light'?'#4a2f73':'#fff',sc=kind==='light'?'#7b679a':kind==='blue'?'#d9ecf7':'#d9cbef';
    return `<a href="#${href}" class="lf-node"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="9" fill="${fill}" stroke="${stroke}"/>
      <text x="${x+w/2}" y="${y+(sub?h/2-3:h/2+4)}" text-anchor="middle" font-size="12.5" font-weight="700" fill="${tc}">${label}</text>
      ${sub?`<text x="${x+w/2}" y="${y+h/2+13}" text-anchor="middle" font-size="10.5" fill="${sc}">${sub}</text>`:''}
      ${timer?`<g transform="translate(${x+w-14},${y+h-2})"><circle r="9" fill="#fff" stroke="${kind==='light'?DARK:'#fff'}" stroke-width="1.5"/><path d="M0 -5v5l3 2" stroke="${DARK}" stroke-width="1.6" fill="none" stroke-linecap="round"/></g>`:''}
      ${n?`<g transform="translate(${x-2},${y-2})"><circle r="11" fill="#7c5bb0" stroke="#fff" stroke-width="2"/><text y="4" text-anchor="middle" font-size="11" font-weight="700" fill="#fff">${n}</text></g>`:''}</a>`;
  };
  /* connectors: [id, path, delay] — packets travel along each one */
  const links=[
    ['s1','M158 92 H298',0],['s2','M378 92 H518',.5],['s3','M598 92 H738',1],['s4','M818 92 H958',1.5],
    ['c1','M75 254 C75 290 92 300 104 318',0],                 /* FSB → ZDD DB (1) */
    ['c2','M190 254 C190 290 150 300 136 318',.4],             /* Master data → DB (2) */
    ['c3','M152 350 H262',.8],                                 /* DB → data predict (3) */
    ['c5','M300 254 V316',.2],                                 /* ODS → predict (5) */
    ['c4','M420 260 V316',.6],                                 /* AI agent → predict (4) */
    ['c6','M438 340 H486',1.1],                                /* predict → data monitor */
    ['c7','M528 254 V316',.3],['c8','M612 254 V316',.7],       /* LTDS, GTDS → monitor (6) */
    ['c9','M610 318 C620 170 690 160 712 210',1.2],            /* monitor → critical elements (7) */
    ['c10','M790 260 V316',1.5],                               /* critical elements → Q-check (8) */
    ['c11','M672 340 H706',1.4],                               /* monitor → Q-check */
    ['c12','M846 214 C880 150 900 150 930 196',1.8],           /* critical elements → contact vs alarm (9) */
    ['c13','M1000 260 V316',2.1],                              /* contact vs alarm → ZDD alarm (10) */
    ['c14','M874 340 H930',2]                                  /* Q-check → alarm */
  ];
  window.liveFlowHTML=function(){
    const chip=(l,r,c='')=>`<a class="jchip ${c}" href="#${r}">${l}</a>`;
    const svg=`<svg class="live-flow" viewBox="0 0 1100 400" role="img" aria-label="Live ZDD processing flow">
      <defs><marker id="lf-ah" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#7c5bb0"/></marker>
      <marker id="lf-ahg" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="8" markerHeight="8" orient="auto"><path d="M0 0L10 5L0 10z" fill="${GREEN}"/></marker></defs>
      <text x="6" y="70" font-size="14" font-weight="800" fill="${GREEN}">start</text>
      <path d="M6 80 H74" stroke="${GREEN}" stroke-width="3" marker-end="url(#lf-ahg)" class="lf-line g"/>
      <text x="6" y="100" font-size="9.5" fill="#6f826d">map data</text><text x="6" y="111" font-size="9.5" fill="#6f826d">transaction &amp;</text><text x="6" y="122" font-size="9.5" fill="#6f826d">lot-move</text><text x="6" y="133" font-size="9.5" fill="#6f826d">events</text>
      ${links.map(([id,d])=>`<path id="lf-${id}" d="${d}" class="lf-line ${id[0]==='s'?'g':''}" ${id[0]==='s'?`marker-end="url(#lf-ahg)"`:`marker-end="url(#lf-ah)"`}/>`).join('')}
      ${stages.map(([r,label,count,icon],i)=>`<a href="#${r}" class="lf-stage"><text x="${X[i]}" y="28" text-anchor="middle" font-size="12" font-weight="700" fill="${GREEN}">${label.length>26?label.slice(0,label.indexOf('&')).trim():label}</text>${label.length>26?`<text x="${X[i]}" y="42" text-anchor="middle" font-size="12" font-weight="700" fill="${GREEN}">${label.slice(label.indexOf('&'))}</text>`:''}
        <circle cx="${X[i]}" cy="92" r="36" fill="${GREEN}" class="lf-circle" style="animation-delay:${i*.8}s"/><path d="${icon}" transform="translate(${X[i]},92)" fill="${i===3||i===2?'none':'#fff'}" stroke="#fff" stroke-width="${i===3?3:1.6}" stroke-linecap="round" stroke-linejoin="round"/>
        <text x="${X[i]}" y="146" text-anchor="middle" font-size="11" font-weight="700" fill="#4a784c">${count}</text></a>`).join('')}
      ${box(0,30,214,90,40,'FSB','via TIBCO','system/8','blue')}
      ${box(2,140,214,100,40,'Master data','scheduled','master-data','light',true)}
      <a href="#lineage" class="lf-node"><ellipse cx="128" cy="324" rx="26" ry="8" fill="#7c5bb0"/><rect x="102" y="324" width="52" height="40" fill="#6b4aa0"/><ellipse cx="128" cy="364" rx="26" ry="8" fill="#5b3a8c"/><ellipse cx="128" cy="324" rx="26" ry="8" fill="#8a6bc0"/><text x="128" y="390" text-anchor="middle" font-size="10.5" font-weight="700" fill="#5b3a8c">ZDD database</text></a>
      ${box(5,250,214,110,40,'ODS / Databricks','history','system/7','blue')}
      ${box(4,370,214,110,46,'AI agent','Vero-wchat LLM','models','light')}
      ${box(3,262,318,176,44,'ZDD data predict','','predictions','dark')}
      ${box(0,488,214,80,40,'LTDS','','system/4','blue')}
      ${box(0,576,214,80,40,'GTDS','','system/5','blue')}
      ${box(6,486,318,186,44,'ZDD data monitor','','monitoring','dark',true)}
      ${box(7,712,210,156,50,'Critical data element','configuration','elements','light')}
      ${box(8,706,318,168,44,'ZDD data Q-check','','quality','dark')}
      ${box(9,926,196,150,50,'Contact vs alarm','configuration','contacts','light')}
      ${box(10,930,318,140,44,'ZDD alarm','','alarms','dark')}
      ${links.map(([id,,delay])=>`<circle r="${id[0]==='s'?5:4}" class="lf-packet ${id[0]==='s'?'g':''}"><animateMotion dur="${id[0]==='s'?2:1.8}s" begin="${delay}s" repeatCount="indefinite" keyPoints="0;1" keyTimes="0;1" calcMode="linear"><mpath href="#lf-${id}"/></animateMotion></circle>`).join('')}
    </svg>`;
    const looks=[[['Customer maps','mappings'],['Products & routes','products'],['PUID patterns','master-data']],[['Checkpoints & SLAs','checkpoints'],['AI models','models']],[['Checkpoints & SLAs','checkpoints'],['Maintenance windows','maintenance'],['Sites & calendars','sites']],[['Quality rules','rules'],['Bin tables','bins'],['Wafer specs','wafer-specs'],['PAT limits','outliers']],[['Escalation rules','contacts'],['Notification channels','integrations'],['GTDS shipment information','system/5']]];
    return `<div class="journey"><div class="jupstream"><span class="jlabel">Upstream systems</span>${chip('SAP','system/0','up')}<span>→</span>${chip('CAMSTAR','system/1','up')}<span>→</span>${chip('FSB','system/2','up')}<span>→</span>${chip('TIBCO','system/8','up')}<i class="jsep"></i>${chip('Blue Yonder','system/3','up')}<span>→</span>${chip('Integration scripts','system/6','up')}<i class="jsep"></i>${chip('FSB','system/2','up')}<span>→</span>${chip('LTDS','system/4','up')}<span>→</span>${chip('GTDS','system/5','up')}</div>
      <div class="lf-wrap">${svg}</div>
      <div class="lf-looks">${looks.map(l=>`<div><span class="jlabel">Also uses</span>${l.map(([a,b])=>chip(a,b,'look')).join('')}</div>`).join('')}</div></div>`;
  };
})();
