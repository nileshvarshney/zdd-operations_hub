/* Solution architecture (the customer's numbered ZDD flow) and master-data synchronisation. */
(function(){
  const comp=(n,label,sub,route,cls='')=>`<a class="sa-comp ${cls}" href="#${route}"><span class="sa-num">${n}</span><b>${label}</b>${sub?`<small>${sub}</small>`:''}</a>`;
  const src=(label,route)=>`<a class="sa-src" href="#${route}">${label}</a>`;
  const stages=[
    ['Data processing','events',['Configure customer data requirements against product mapping.','Receive FSB lot-movement events (start, end, station) linked to the map or PUID and load them to the ZDD database.']],
    ['AI prediction of data arrival & potential defect','predictions',['Estimate the checkpoint date and time for the next step from past history.','Predict potential digital defects and update the ZDD database.']],
    ['Data monitoring','monitoring',['Time-based check for late or missing data when the lot passes a step.','Flag lots at risk of late or missing data.']],
    ['Data quality check','quality',['Check the map when it is complete.','Flag risk when quantities do not match or an abnormality is detected.']],
    ['Alarm management','alarms',['Send late-data and data-quality flags to site users, IT and the business owner.']]
  ];
  const parts=[
    ['1','FSB events → ZDD DB','Lot movement events loaded with lot, PUID, station and time.','events','Event processing'],
    ['2','Master data','Scheduled load of customer requirements, product mapping and PUID rules.','master-data','Master data'],
    ['3','ZDD data predict','Arrival-time and defect predictions written back to ZDD.','predictions','AI predictions'],
    ['4','AI agent (Vero-wchat LLM)','Explains exceptions and recommends the next action. Can also use Claude, GPT, Gemini, Llama or Mistral.','assistant','Ask Zero · AI models'],
    ['5','ODS / Databricks','Historical lots used to train and score the models.','system/7','Data systems'],
    ['6','ZDD data monitor','Scheduled check of LTDS / GTDS map availability against expected time.','monitoring','Data monitoring'],
    ['7','Critical data element configuration','The fields every map must contain, per customer and product.','elements','Critical data elements'],
    ['8','ZDD data quality check','Completeness, quantity and abnormality checks on the finished map.','quality','Data quality'],
    ['9','Contact vs alarm configuration','Who is notified for each alarm type, site and severity.','contacts','Alarm routing'],
    ['10','ZDD alarm','Alarms raised, routed, escalated and resolved.','alarms','Alarm center']
  ];
  function architecture(){
    return title('Solution architecture','How Zero connects to your systems and where each numbered component lives in the application.',`<a class="button" href="#flow">Source integration map</a><a class="button primary" href="#process-guide">Follow a lot ↗</a>`)
    +card('ZDD processing flow','Select any stage or numbered component to open its screen.',`<div class="sa-wrap">
      <div class="sa-stages">${stages.map(([s,r],i)=>`<a class="sa-stage" href="#${r}"><span>${i+1}</span>${s}</a>`).join('')}</div>
      <div class="sa-grid">
        <div class="sa-col">${src('FSB','system/2')}${comp(1,'Lot events → ZDD DB','start · end · station','events')}${comp(2,'Master data','scheduled ⏱','master-data')}</div>
        <div class="sa-col">${comp(5,'ODS / Databricks','history','system/7','src')}${comp(4,'AI agent','Vero-wchat LLM + others','models')}${comp(3,'ZDD data predict','arrival & defect','predictions','core')}</div>
        <div class="sa-col"><div class="sa-pair">${src('LTDS','system/4')}${src('GTDS','system/5')}</div>${comp(6,'ZDD data monitor','scheduled ⏱','monitoring','core')}</div>
        <div class="sa-col">${comp(7,'Critical data elements','configuration','elements')}${comp(8,'ZDD data Q-check','quantity · abnormality','quality','core')}</div>
        <div class="sa-col">${comp(9,'Contact vs alarm','configuration','contacts')}${comp(10,'ZDD alarm','site · IT · business','alarms','core')}</div>
      </div>
      <a class="sa-db" href="#lineage"><span>ZDD database</span><small>events · predictions · availability · quality results · alarms</small></a>
    </div>`)
    +`<div class="sa-notes">${stages.map(([s,,notes],i)=>`<div class="sa-note"><b>${i+1}. ${s}</b><ul>${notes.map(n=>`<li>${n}</li>`).join('')}</ul></div>`).join('')}</div>`
    +card('Component reference','Each numbered component and the screen that shows it.',table(['#','Component','What it does','Screen'],parts.map(p=>[p[0],p[1],p[2],p[4]]),"navigate(['events','master-data','predictions','assistant','system/7','monitoring','elements','quality','contacts','alarms'][$i])",false))
    +card('Source systems','Systems that feed ZDD, as in your integration diagram.',`<div class="pad" style="padding-top:0">${[['SAP','Orders and shipment master','system/0'],['CAMSTAR','Lot and station movement','system/1'],['Blue Yonder','Planning and shipment context','system/3'],['FSB','Map data transaction and lot-move events','system/2'],['Integration scripts','Map data availability','system/6'],['LTDS','Local test data · map availability','system/4'],['GTDS','Global test data · shipment information and map availability check','system/5'],['ODS / Databricks','History for AI prediction','system/7']].map(([k,v,r])=>`<a class="statline" href="#${r}" style="text-decoration:none;color:inherit"><span>${k}</span><b>${v} ↗</b></a>`).join('')}</div>`);
  }

  const masters=[['Customer data requirements','ZDD configuration','Every 15 minutes','10:30','3 customers · 25 elements each','Healthy'],['Product mapping','SAP material master','Hourly','10:00','5 products · 3 routes','Healthy'],['PUID patterns','ZDD configuration','Every 15 minutes','10:30','5 patterns','Healthy'],['Station & route master','CAMSTAR','Hourly','10:00','34 stations · 11 checkpoints','Healthy'],['Shipment master','SAP / GTDS','Every 30 minutes','10:15','29 shipments this week','Delayed']];
  window.syncMaster=function(i){const m=masters[i];audit('Master data sync: '+m[0]);toast(m[0]+' synchronised · '+m[4])};
  function masterData(){
    return title('Master data','Reference data loaded into the ZDD database on a schedule, so every event can be matched to its customer, product and requirements.',btn('Sync all now',"audit('Master data sync: all');toast('All master data synchronised')",true))
    +kpis([['Data sets','5','Synchronised on schedule'],['Last full sync','10:30','Today'],['Records','2,418','Customers, products, stations, PUIDs'],['Stale','1','Shipment master · 26 min',true]])
    +card('Master data sets','Select a row to synchronise it now.',table(['Data set','Source','Schedule','Last sync','Contents','Status'],masters,'syncMaster($i)'))
    +`<div class="two">${card('How master data is used','Component 2 in the solution architecture.',`<div class="evidence-list">${[['Match events','Each FSB event is matched to its customer, product and PUID pattern.'],['Set expectations','Routes and checkpoints define when each map should arrive.'],['Check content','Customer requirements define the critical data elements the quality check enforces.']].map(([h,p],i)=>`<div class="evidence-row"><span class="evidence-num">${i+1}</span><div><strong>${h}</strong><p>${p}</p></div>${pill('Active')}</div>`).join('')}</div>`)}
      ${card('Recent synchronisations','',table(['Time','Data set','Changes','Result'],[['10:30','Customer data requirements','0 changes','Passed'],['10:30','PUID patterns','1 pattern added','Passed'],['10:15','Shipment master','Source slow · retrying','Warning'],['10:00','Product mapping','2 products updated','Passed']],"toast('Sync log opened')",false))}</div>`;
  }
  registerPage('architecture',architecture,{});
  registerPage('master-data',masterData,{});
})();
