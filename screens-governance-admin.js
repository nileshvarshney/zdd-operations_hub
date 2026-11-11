/* Governance and administration screens: customer scorecards, approvals, evidence, schedules, roles, integrations, security, profile, help. */
(function(){
  const closeBtn='<button type="button" onclick="document.querySelector(\'dialog\').close()">Close</button>';
  function openDialog(html){$('#dialog').innerHTML=html;$('#dialog').showModal()}
  function closeDialog(){document.querySelector('dialog').close()}
  function sw(on){return `<label class="switch"><input type="checkbox" ${on?'checked':''} onchange="toast('Preference '+(this.checked?'enabled':'disabled'))"><span></span></label>`}
  function switchRow(h,p,on){return `<div class="switch-row"><div><strong>${h}</strong><p>${p}</p></div>${sw(on)}</div>`}
  function ring(pct,color){const c=2*Math.PI*40,off=c*(1-pct/100);return `<svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="40" fill="none" stroke="#edf3eb" stroke-width="10"/><circle cx="50" cy="50" r="40" fill="none" stroke="${color||'#6d9b68'}" stroke-width="10" stroke-linecap="round" stroke-dasharray="${c.toFixed(1)}" stroke-dashoffset="${off.toFixed(1)}" transform="rotate(-90 50 50)"/></svg>`}
  function bar(label,val,cls){return `<div class="bar-row"><span>${label}</span><div class="bar"><span class="${cls||''}" style="width:${val}%"></span></div><b>${val}%</b></div>`}
  const sl=(k,v)=>`<div class="statline"><span>${k}</span><b>${v}</b></div>`;

  /* ---------- Customers ---------- */
  const customers=[
    {name:'Apex Automotive',products:'Automotive MCU',required:'Wafer map, final test, shipment',onTime:'96.4%',quality:'97.9%',alarms:'2',status:'At risk',score:91,
     elements:'25 critical elements',sla:'Final-test map within 20 min + 5 min grace',contacts:'Supplier quality · A. Mendes',certs:'IATF 16949 · AEC-Q100',mapping:'MAP-001',
     months:[[`Jun`,97],[`Jul`,98],[`Aug`,97],[`Sep`,96],[`Oct`,95],[`Nov`,96]],
     lots:[['LOT-2026-0842','Automotive MCU','ATKH','Final test','Late data'],['LOT-2026-0839','Automotive MCU','ATBK','Final test','Quality issue']],
     exceptions:[['ALM-1024','Late final test map','LOT-2026-0842','Critical','Open'],['ALM-1023','Quantity mismatch','LOT-2026-0839','Critical','Open']]},
    {name:'Horizon Mobility',products:'Power management',required:'Wafer map, test quantity',onTime:'98.1%',quality:'98.8%',alarms:'1',status:'Active',score:96,
     elements:'18 critical elements',sla:'Wafer-sort map within 15 min + 5 min grace',contacts:'Quality engineering · R. Tan',certs:'IATF 16949',mapping:'MAP-002',
     months:[[`Jun`,98],[`Jul`,99],[`Aug`,98],[`Sep`,98],[`Oct`,97],[`Nov`,98]],
     lots:[['LOT-2026-0841','Power management','ATKH','Wafer sort','At risk'],['LOT-2026-0837','Power management','ATGD','Wafer sort','On track']],
     exceptions:[['ALM-1022','Predicted data delay','LOT-2026-0841','Warning','Open']]},
    {name:'Vertex Industrial',products:'RF transceiver, Secure element',required:'Assembly, final test',onTime:'99.2%',quality:'99.4%',alarms:'0',status:'Active',score:98,
     elements:'14 critical elements',sla:'Assembly data within 30 min + 10 min grace',contacts:'Operations · M. Weber',certs:'ISO 9001',mapping:'MAP-003',
     months:[[`Jun`,99],[`Jul`,99],[`Aug`,100],[`Sep`,99],[`Oct`,99],[`Nov`,99]],
     lots:[['LOT-2026-0840','RF transceiver','ATBK','Assembly','On track'],['LOT-2026-0838','Secure element','ATKH','Shipment','On track']],
     exceptions:[['ISS-1021','Shipment context delayed','LOT-2026-0838','Medium','Resolved']]}
  ];
  function customersPage(){
    return title('Customer scorecards','Data-delivery performance against each customer’s digital-footprint requirements.',btn('Export scorecards',"audit('Customer scorecards exported');toast('Scorecards exported to CSV')",true))
    +kpis([['Active customers','3','Automotive and industrial'],['Average on-time data','97.9%','Last 30 days'],['Average quality pass','98.7%','Last 30 days'],['Customers at risk','1','Apex Automotive',true]])
    +card('Customer portfolio','Select a customer to open the scorecard and contract requirements.',table(['Customer','Products','Required data','On-time data','Quality pass','Open alarms','Status'],customers.map(c=>[c.name,c.products,c.required,c.onTime,c.quality,c.alarms,c.status]),"navigate('customer/$i')",false));
  }
  function customerPage(part){
    const i=customers[Number(part)]?Number(part):0,c=customers[i];
    return title(c.name,`${c.products} · Mapping ${c.mapping}`,`<a class="button" href="#customers">← All customers</a>${btn('Share scorecard',`audit('Scorecard shared with ${c.name}');toast('Scorecard sent to ${c.contacts.split(' · ')[1]}')`,true)}`)
    +kpis([['On-time data',c.onTime,'Last 30 days'],['Quality pass',c.quality,'Last 30 days'],['Open alarms',c.alarms,c.alarms==='0'?'No open exceptions':'Needs attention',c.alarms!=='0'],['Lots in progress',String(c.lots.length),'Tracked end to end']])
    +`<div class="two">${card('Data-delivery score','Weighted on-time arrival, completeness and reconciliation.',`<div class="score">${ring(c.score,c.score<93?'#d9a35a':'#6d9b68')}<div><strong>${c.score} / 100</strong><span>${c.score<93?'Below the 93-point target. Two critical exceptions this month.':'Above the 93-point target.'}</span></div></div><div class="kv-grid">${sl('Required elements',c.elements)}${sl('SLA window',c.sla)}${sl('Customer contact',c.contacts)}${sl('Certifications',c.certs)}${sl('Mapping',`<a class="link" href="#mappings">${c.mapping} ↗</a>`)}${sl('Status',pill(c.status))}</div>`)}${card('Monthly on-time data','Share of lots with complete data inside the SLA window.',`<div class="bar-list">${c.months.map(([m,v])=>bar(m,v,v<96?'warn':'')).join('')}</div>`)}</div>`
    +card('Customer lots','Lots currently in production for this customer.',table(['Lot ID','Product','Site','Current step','Status'],c.lots,`zga.openCustomerLot(${i},$i)`,false))
    +card('Recent exceptions','Alarms and issues that affected this customer’s data.',table(['Reference','Summary','Lot ID','Severity','Status'],c.exceptions,"navigate('alarms')",false));
  }

  /* ---------- Change approvals ---------- */
  const changes=[
    ['CR-118','Checkpoint threshold','Final test complete: expected window 20 → 15 min','Herpreet Oberoi','Medium · 2 sites','Pending'],
    ['CR-117','Customer mapping','MAP-001 adds “Bin summary” as required element','Quality team','High · Apex Automotive','Pending'],
    ['CR-116','Quality rule','Yield deviation threshold ± 3σ → ± 2.5σ','Quality team','Medium · All products','Approved'],
    ['CR-115','Alarm routing','Shipment risk escalates to site manager after 10 min','Logistics','Low · ATKH','Deployed']
  ];
  const diffs={
    'CR-118':'checkpoint: "Final test complete"\n<span class="diff-del">- expected_window_minutes: 20</span><span class="diff-add">+ expected_window_minutes: 15</span>  grace_period_minutes: 5\n  sites: [ATKH, ATBK]',
    'CR-117':'mapping: MAP-001  # Apex Automotive\n  required_elements:\n    - PUID\n    - Tested quantity\n    - Good die count\n<span class="diff-add">+   - Bin summary</span>',
    'CR-116':'rule: "Yield deviation"\n<span class="diff-del">- threshold: "± 3σ"</span><span class="diff-add">+ threshold: "± 2.5σ"</span>  severity: High',
    'CR-115':'policy: "Shipment risk"\n<span class="diff-del">- escalation: "Site manager · 15 min"</span><span class="diff-add">+ escalation: "Site manager · 10 min"</span>'
  };
  function decideChange(i,decision){closeDialog();audit(`${changes[i][0]} ${decision.toLowerCase()}`);toast(`${changes[i][0]} ${decision.toLowerCase()} · requester notified`)}
  function openChange(i){
    const c=changes[i];
    openDialog(`<div class="stage-label">CHANGE REQUEST</div><h2>${c[0]} · ${c[1]}</h2><p class="note">${esc(c[2])}</p><div style="margin:14px 0 6px">${sl('Requested by',c[3])}${sl('Impact',c[4])}${sl('Status',pill(c[5]))}</div><div class="stage-label" style="margin:14px 0 8px">PROPOSED CHANGE</div><pre class="code" style="margin:0 0 6px">${diffs[c[0]]}</pre><div class="formactions">${closeBtn}${c[5]==='Pending'?`<button type="button" onclick="zga.decideChange(${i},'Rejected')">Reject</button><button class="primary" type="button" onclick="zga.decideChange(${i},'Approved')">Approve change</button>`:''}</div>`);
  }
  function approvalsPage(){
    return title('Change approvals','Every configuration change is reviewed for impact before it reaches production monitoring.',btn('+ New change request',"zga.newChange()",true))
    +kpis([['Pending approval','2','Oldest: 1 day',true],['Approved this month','14','Average 6 hours to approve'],['Deployed','12','Zero rollbacks'],['Rejected','1','Returned with comments']])
    +card('Approval workflow','CR-118 · Checkpoint threshold',`<div class="track"><div class="track-step done">Requested<small>Nov 10 · 09:12</small></div><div class="track-step done">Impact review<small>2 sites · 41 lots</small></div><div class="track-step current">Approval<small>Quality owner</small></div><div class="track-step">Deployed<small>After approval</small></div></div>`)
    +card('Change requests','Select a request to review the proposed change and approve or reject it.',table(['Request','Type','Change','Requested by','Impact','Status'],changes,"zga.openChange($i)",true));
  }
  function newChange(){
    openDialog(`<h2>New change request</h2><form onsubmit="event.preventDefault();document.querySelector('dialog').close();audit('Change request submitted');toast('Change request CR-119 submitted for impact review')"><div class="fields"><label class="field">Change type<select><option>Checkpoint threshold</option><option>Customer mapping</option><option>Quality rule</option><option>Alarm routing</option></select></label><label class="field">Affected sites<select><option>All sites</option><option>ATKH</option><option>ATBK</option><option>ATGD</option></select></label><label class="field wide">Description<textarea required placeholder="Describe the change and the reason"></textarea></label></div><div class="formactions">${closeBtn}<button class="primary">Submit for review</button></div></form>`);
  }

  /* ---------- Evidence packs ---------- */
  const packs=[
    ['EP-2026-0838','LOT-2026-0838','Vertex Industrial','Wafer map · Test summary · Reconciliation · Alarm history · Sign-off','Nov 10, 2026','Complete'],
    ['EP-2026-0840','LOT-2026-0840','Vertex Industrial','Wafer map · Test summary · Reconciliation','Nov 10, 2026','Active'],
    ['EP-2026-0839','LOT-2026-0839','Apex Automotive','Wafer map · Test summary · Alarm history','Nov 09, 2026','On hold'],
    ['EP-2026-0837','LOT-2026-0837','Horizon Mobility','Wafer map · Test summary · Reconciliation · Sign-off','Nov 08, 2026','Complete']
  ];
  function evidencePage(){
    return title('Evidence packs','Audit-ready proof that every shipped lot had complete, reconciled and approved data.',btn('Download all complete packs',"audit('Evidence packs downloaded');toast('2 complete evidence packs downloaded (ZIP)')",true))
    +kpis([['Packs generated','312','Last 30 days'],['Complete','308','Ready for customer audit'],['On hold','1','LOT-2026-0839 quantity mismatch',true],['Average build time','42 sec','Automatic on shipment release']])
    +`<div class="two">${card('Generate an evidence pack','Assemble the records a customer or auditor needs for one shipment.',`<form class="pad" onsubmit="event.preventDefault();audit('Evidence pack generated for '+this.lot.value);toast('Evidence pack for '+this.lot.value+' generated')"><div class="fields"><label class="field">Lot ID<select name="lot">${['LOT-2026-0842','LOT-2026-0841','LOT-2026-0840','LOT-2026-0839','LOT-2026-0838','LOT-2026-0837'].map(l=>`<option>${l}</option>`).join('')}</select></label><label class="field">Format<select><option>PDF + CSV bundle</option><option>PDF summary</option><option>JSON (customer portal)</option></select></label><label class="field wide">Include<div class="chips">${['Wafer map','Test summary','Reconciliation result','Alarm history','MRAT / FMEA sign-off','Lineage trace'].map(x=>`<span class="chip on" onclick="this.classList.toggle('on');this.textContent=(this.classList.contains('on')?'✓ ':'+ ')+this.textContent.slice(2)">✓ ${x}</span>`).join('')}</div></label></div><div class="formactions"><button class="primary">Generate pack</button></div></form>`)}${card('What an auditor sees','Each pack is signed and time-stamped.',`<div class="evidence-list">${[['Wafer map','Final map with PUIDs and bin summary.'],['Test summary','Tested quantity and good-die count.'],['Reconciliation','Expected versus actual values.'],['Alarm history','Every exception and its resolution.'],['Sign-off','Owner approval before shipment.']].map(([h,p],i)=>`<div class="evidence-row"><span class="evidence-num">${i+1}</span><div><strong>${h}</strong><p>${p}</p></div>${pill('Included')}</div>`).join('')}</div>`)}</div>`
    +card('Evidence pack library','Select a pack to download it.',table(['Pack','Lot ID','Customer','Contents','Generated','Status'],packs,"zga.downloadPack($i)",true));
  }
  function downloadPack(i){const p=packs[i];if(p[5]==='On hold'){toast(p[0]+' is on hold until ALM-1023 is resolved');return}audit(p[0]+' downloaded');toast(p[0]+' downloaded')}

  /* ---------- Scheduled reports ---------- */
  const schedules=[
    ['Daily data-delivery summary','Daily · 07:00','Site operations, Quality team','PDF','Tomorrow 07:00','Active'],
    ['Customer scorecard · Apex Automotive','Weekly · Monday','Supplier quality, Business owner','PDF + CSV','Nov 16, 07:00','Active'],
    ['Open alarms & issues','Every shift · 06:00 / 14:00 / 22:00','Shift leads','Email','Today 14:00','Active'],
    ['Monthly ZDD performance','Monthly · 1st','Leadership','PDF','Dec 01, 08:00','Active'],
    ['Model accuracy review','Monthly · 5th','Data engineering','CSV','Dec 05, 09:00','Draft']
  ];
  function reportSchedulesPage(){
    return title('Scheduled reports','Deliver the right report to the right people automatically.',`<a class="button" href="#reports">Open reports</a>`)
    +kpis([['Active schedules','4','1 draft'],['Delivered this week','38','100% delivered'],['Recipients','26','Across 3 sites'],['Next run','14:00','Open alarms & issues']])
    +card('Report schedules','Run any report immediately or review its delivery.',`<table class="static"><thead><tr><th>Report</th><th>Frequency</th><th>Recipients</th><th>Format</th><th>Next run</th><th>Status</th><th></th></tr></thead><tbody>${schedules.map((s,i)=>`<tr><td>${esc(s[0])}</td><td>${esc(s[1])}</td><td>${esc(s[2])}</td><td>${esc(s[3])}</td><td>${esc(s[4])}</td><td>${pill(s[5])}</td><td><button class="table-action" onclick="audit('Report run: ${esc(s[0]).replace(/'/g,'')}');toast('Report generated and sent to ${esc(s[2]).replace(/'/g,'')}')">Run now</button></td></tr>`).join('')}</tbody></table><div class="tablefoot"><span>${schedules.length} schedules</span><span>Page 1 of 1</span></div>`)
    +card('Create a schedule','Choose a report, frequency and recipients.',`<form class="pad" onsubmit="event.preventDefault();audit('Report schedule created');toast('Schedule created · first run '+this.freq.value.toLowerCase())"><div class="fields"><label class="field">Report<select><option>Daily data-delivery summary</option><option>Customer scorecard</option><option>Open alarms & issues</option><option>Reconciliation results</option><option>Model accuracy review</option></select></label><label class="field">Frequency<select name="freq"><option>Daily</option><option>Every shift</option><option>Weekly</option><option>Monthly</option></select></label><label class="field">Recipients<input required value="Quality team"></label><label class="field">Format<select><option>PDF</option><option>CSV</option><option>PDF + CSV</option><option>Email body</option></select></label></div><div class="formactions"><button type="reset">Clear</button><button class="primary">Create schedule</button></div></form>`);
  }

  /* ---------- Roles & permissions ---------- */
  const roles=[['Administrator','Full configuration, users and security.','2'],['Quality engineer','Rules, reconciliation, issues and sign-off.','6'],['Site operations','Monitoring, alarms and issue resolution for assigned sites.','14'],['IT support','Data systems, pipelines and event replay.','5'],['Business viewer','Dashboards, scorecards and reports (read only).','11']];
  const caps=[['View dashboards & reports','yes','yes','yes','yes','yes'],['Acknowledge & resolve alarms','yes','yes','yes','part','no'],['Create & assign issues','yes','yes','yes','yes','no'],['Edit quality rules & checkpoints','yes','yes','no','no','no'],['Edit customer mappings','yes','part','no','no','no'],['Manage data systems & pipelines','yes','no','no','yes','no'],['Replay failed events','yes','no','no','yes','no'],['Approve configuration changes','yes','yes','no','no','no'],['Record MRAT / FMEA sign-off','yes','yes','no','no','no'],['Manage users & security','yes','no','no','no','no']];
  function rolesPage(){
    const mark={yes:'<span class="yes">✓</span>',no:'<span class="no">—</span>',part:'<span class="part">◐</span>'};
    return title('Roles & permissions','Role-based access for operations, quality, IT and business users.',btn('+ New role',"zga.newRole()",true))
    +`<div class="grid3">${roles.slice(0,3).map(r=>card(r[0],r[1],`<div class="pad" style="padding-top:0">${sl('Users',r[2])}${sl('Scope',r[0]==='Site operations'?'Assigned sites':'All sites')}</div>`)).join('')}</div>`
    +card('Permission matrix','✓ full access · ◐ limited to assigned sites or read-only · — no access',`<table class="matrix"><thead><tr><th>Capability</th>${roles.map(r=>`<th>${r[0]}</th>`).join('')}</tr></thead><tbody>${caps.map(c=>`<tr><td>${c[0]}</td>${c.slice(1).map(v=>`<td>${mark[v]}</td>`).join('')}</tr>`).join('')}</tbody></table>`)
    +`<div class="two">${card('Role assignment','Users per role.',`<div class="bar-list">${roles.map(r=>bar(r[0],Math.round(Number(r[2])/38*100))).join('')}</div>`)}${card('Access review','Quarterly certification of user access.',`<div class="pad">${sl('Last review','Oct 01, 2026')}${sl('Next review','Jan 05, 2027')}${sl('Accounts removed','3 inactive users')}<div class="formactions">${btn('Start access review',"audit('Access review started');toast('Access review started · 38 users to certify')",true)}</div></div>`)}</div>`;
  }
  function newRole(){openDialog(`<h2>New role</h2><form onsubmit="event.preventDefault();document.querySelector('dialog').close();audit('Role created');toast('Role created')"><div class="fields"><label class="field">Role name<input required placeholder="Example: Customer quality liaison"></label><label class="field">Based on<select>${roles.map(r=>`<option>${r[0]}</option>`).join('')}</select></label><label class="field wide">Description<textarea placeholder="What this role is responsible for"></textarea></label></div><div class="formactions">${closeBtn}<button class="primary">Create role</button></div></form>`)}

  /* ---------- Integrations & API ---------- */
  const connectors=[['SAP','Orders & shipment master','Connected','2 min ago'],['CAMSTAR','Lot movement (MES)','Connected','1 min ago'],['FSB / TIBCO','Station events','Connected','12 sec ago'],['LTDS','Local test data','Delayed','18 min ago'],['GTDS','Global test data','Connected','3 min ago'],['Blue Yonder','Planning & logistics','Connected','4 min ago'],['ODS / Databricks','Historical data for AI','Connected','6 min ago'],['Microsoft Teams','Alarm notifications','Connected','8 min ago'],['Email / SMTP','Alarm notifications','Connected','5 min ago'],['ServiceNow','Issue tickets','Not connected','—']];
  const apiKeys=[['Customer portal · Apex','zdd_live_••••••••3f9a','Read scorecards','Nov 01, 2026','Active'],['ServiceNow sync','zdd_live_••••••••a71c','Issues read/write','Sep 14, 2026','Active'],['Data science notebook','zdd_live_••••••••0be2','Predictions read','Aug 02, 2026','Disabled']];
  function integrationsPage(){
    return title('Integrations & API','Connect source systems, notification channels and external tools.',btn('+ Add integration',"navigate('systems')",true))
    +kpis([['Connected','9','Of 10 integrations'],['Needs attention','1','LTDS delayed 18 min',true],['API calls today','48,210','99.98% success'],['Active webhooks','3','0 failed deliveries']])
    +card('Connectors','Source systems and outbound channels.',`<div class="pad"><div class="kv-grid" style="padding:0">${connectors.map(c=>`<div class="statline"><span><b style="color:var(--ink)">${c[0]}</b> · ${c[1]}</span><b>${pill(c[2]==='Connected'?'Healthy':c[2]==='Delayed'?'Delayed':'Draft')} <small style="color:#9aa69c;font-weight:400">${c[3]}</small></b></div>`).join('')}</div><div class="formactions">${btn('Connect ServiceNow',"audit('ServiceNow connection started');toast('ServiceNow connection started · awaiting OAuth approval')")}${btn('Test all connections',"audit('Connection test run');toast('Connection test complete: 8 healthy, 1 delayed, 1 not connected')",true)}</div></div>`)
    +card('API keys','Keys are shown once at creation and stored encrypted.',table(['Name','Key','Scope','Created','Status'],apiKeys,"zga.keyDetail($i)",false),`<button class="primary" onclick="zga.createKey()">Create key</button>`)
    +`<div class="two">${card('Webhooks','Push alarms and status changes to external systems.',`<div class="pad">${sl('alarm.created → https://hooks.apex-auto.com/zdd','Healthy')}${sl('issue.updated → ServiceNow','Healthy')}${sl('lot.released → Customer portal','Healthy')}<div class="formactions">${btn('Send test event',"audit('Webhook test sent');toast('Test event delivered to 3 webhooks')",true)}</div></div>`)}${card('Webhook payload format','alarm.created',`<pre class="code">{
  "event": "alarm.created",
  "alarm_id": "ALM-1024",
  "lot_id": "LOT-2026-0842",
  "site": "ATKH",
  "severity": "Critical",
  "summary": "Late final test map",
  "expected_at": "2026-11-10T10:20:00Z",
  "assigned_to": "ATKH site operations"
}</pre>`)}</div>`;
  }
  function createKey(){openDialog(`<h2>Create API key</h2><form onsubmit="event.preventDefault();zga.keyCreated()"><div class="fields"><label class="field">Key name<input required placeholder="Example: Customer portal · Horizon"></label><label class="field">Scope<select><option>Read scorecards</option><option>Predictions read</option><option>Issues read/write</option><option>Full read-only</option></select></label><label class="field">Expires<select><option>90 days</option><option>180 days</option><option>1 year</option></select></label></div><div class="formactions">${closeBtn}<button class="primary">Create key</button></div></form>`)}
  function keyCreated(){audit('API key created');openDialog(`<h2>Key created</h2><p class="note">Copy this key now. It will not be shown again.</p><pre class="code" style="margin:14px 0">zdd_live_7Hq2LmX9pR4tVb8Kc1sN0e5W</pre><div class="formactions"><button class="primary" type="button" onclick="zga.close();toast('API key created')">Done</button></div>`)}
  function openCustomerLot(ci,i){const c=customers[ci]||customers[0];const lot=(c.lots[i]||c.lots[0])[0];const idx=842-Number(lot.slice(-3));navigate('lot/'+(idx>=0&&idx<=5?idx:0))}
  function keyDetail(i){const k=apiKeys[i];openDialog(`<div class="stage-label">API KEY</div><h2>${k[0]}</h2>${sl('Key',k[1])}${sl('Scope',k[2])}${sl('Created',k[3])}${sl('Status',pill(k[4]))}${sl('Last used','Today · 10:31')}<div class="formactions">${closeBtn}<button type="button" onclick="zga.close();audit('API key revoked: ${k[0]}');toast('Key revoked')">Revoke key</button></div>`)}

  /* ---------- Security & retention ---------- */
  function securityPage(){
    const retention=[['Lot events (FSB / CAMSTAR)','2 years','Hot 90 days · archive after'],['Wafer maps & test summaries','7 years','Customer contractual requirement'],['Alarms, issues & resolutions','7 years','Audit evidence'],['AI predictions & explanations','3 years','Model review'],['Audit trail','10 years','Immutable'],['Notification logs','1 year','Operational']];
    return title('Security & retention','Authentication, access, encryption and data-retention controls.',btn('Save security settings',"audit('Security settings saved');toast('Security settings saved')",true))
    +kpis([['SSO coverage','100%','Azure AD / Entra ID'],['MFA enforced','Yes','All users'],['Encryption','AES-256','At rest and in transit (TLS 1.3)'],['Last security review','Oct 18, 2026','No open findings']])
    +`<div class="two">${card('Authentication','Applies to all users.',`<div class="pad" style="padding-top:0">${switchRow('Single sign-on (SAML / OIDC)','Users sign in with the corporate identity provider.',true)}${switchRow('Multi-factor authentication','Required for every sign-in.',true)}${switchRow('Session timeout after 30 minutes','Idle sessions sign out automatically.',true)}${switchRow('Allow local accounts','Only for break-glass administrators.',false)}${switchRow('IP allow-list','Restrict access to corporate networks.',true)}</div>`)}${card('IP allow-list','Corporate and site networks.',`<pre class="code">10.20.0.0/16    # ATKH site network
10.40.0.0/16    # ATBK site network
10.60.0.0/16    # ATGD data center
172.16.8.0/24   # Corporate VPN</pre><div class="pad" style="padding-top:0">${btn('Add range',"zga.addRange()")}</div>`)}</div>`
    +card('Data retention','How long each class of data is kept before archive or deletion.',table(['Data class','Retention','Policy note'],retention,"toast('Retention changes go through Change approvals')",false))
    +card('Security events','Recent sign-in and access events.',table(['Time','User','Event','Location','Status'],[['10:02','Herpreet Oberoi','Signed in with SSO + MFA','ATKH network','Passed'],['09:47','IT support','API key used: ServiceNow sync','Cloud','Passed'],['08:15','Unknown','Blocked sign-in outside allow-list','External','Failed'],['07:58','Quality team','Role change approved','Corporate VPN','Passed']],"toast('Security event recorded in the audit trail')",false));
  }
  function addRange(){openDialog(`<h2>Add IP range</h2><form onsubmit="event.preventDefault();document.querySelector('dialog').close();audit('IP range added');toast('IP range added to allow-list')"><div class="fields"><label class="field">CIDR range<input required placeholder="10.80.0.0/16"></label><label class="field">Description<input placeholder="Example: New site network"></label></div><div class="formactions">${closeBtn}<button class="primary">Add range</button></div></form>`)}

  /* ---------- My profile ---------- */
  function profilePage(){
    return title('My profile','Your details, notification preferences and sites you follow.',btn('Sign out',"audit('Signed out');navigate('login')"))
    +`<div class="two">${card('Personal details','Synced from the corporate directory.',`<form class="pad" onsubmit="event.preventDefault();audit('Profile updated');toast('Profile saved')"><div class="fields"><label class="field">Full name<input value="Herpreet Oberoi"></label><label class="field">Job title<input value="Operations lead"></label><label class="field">Team<input value="Data engineering"></label><label class="field">Role<input value="Administrator" disabled></label><label class="field">Language<select><option>English (US)</option><option>English (UK)</option><option>Deutsch</option><option>ไทย</option></select></label><label class="field">Time zone<select><option>America/Chicago (ATKH)</option><option>Asia/Bangkok (ATBK)</option><option>UTC</option></select></label></div><div class="formactions"><button class="primary">Save profile</button></div></form>`)}${card('Sites I follow','Alarms from these sites appear in your inbox.',`<div class="pad"><div class="chips">${['ATKH · Austin','ATBK · Bangkok','ATGD · Global data'].map((s,i)=>`<span class="chip" onclick="this.style.opacity=this.style.opacity==='0.45'?'1':'0.45';toast('Site follow updated')">${i<2?'✓ ':''}${s}</span>`).join('')}</div><div style="margin-top:18px">${sl('Default landing page','Operations overview')}${sl('Last sign-in','Today · 10:02 · SSO')}</div></div>`)}</div>`
    +card('Notification preferences','Choose how you are told about each severity.',`<table class="static"><thead><tr><th>Severity</th><th>In-app</th><th>Email</th><th>Microsoft Teams</th><th>Daily digest</th></tr></thead><tbody>${[['Critical',1,1,1,0],['Warning',1,1,0,1],['Info',1,0,0,1]].map(r=>`<tr><td>${pill(r[0])}</td>${r.slice(1).map(v=>`<td>${sw(v)}</td>`).join('')}</tr>`).join('')}</tbody></table>`);
  }

  /* ---------- Help & release notes ---------- */
  function helpPage(){
    const start=[['Operations overview','See today’s data health at a glance.','overview'],['Process guide','How one lot moves through every control.','process-guide'],['Application setup','Connect sources and set checkpoints.','setup'],['Alarm center','Acknowledge, assign and resolve exceptions.','alarms'],['Lot explorer','Trace a lot, PUID and map end to end.','lots'],['Reports','Reliability and customer-readiness trends.','reports']];
    const faq=[['What happens when a wafer map is late?','Zero compares the expected arrival time with the actual arrival. After the grace period, an alarm is created and routed to the site owner, then escalated if not acknowledged.'],['Does the AI make decisions on its own?','No. Predictions and anomaly explanations are advisory. A person acknowledges, resolves and signs off every exception.'],['How do I add a new customer requirement?','Open Customer & product maps, add the required elements, and submit the change for approval.'],['Where is the evidence for a customer audit?','Open Evidence packs and download the pack for the lot or shipment.']];
    return title('Help & release notes','Guides, answers and what is new in Zero.',btn('Contact support',"zga.support()",true))
    +card('Getting started','Short paths through the most-used screens.',`<div class="grid3 pad">${start.map(([h,p,r])=>`<a class="statline" href="#${r}" style="flex-direction:column;gap:4px;border:1px solid var(--line);border-radius:8px;padding:14px"><b style="color:var(--ink)">${h} ↗</b><span>${p}</span></a>`).join('')}</div>`)
    +`<div class="two">${card('Frequently asked questions','',`<div class="pad" style="padding-top:0">${faq.map(([q,a])=>`<details class="switch-row" style="display:block"><summary style="cursor:pointer;font-weight:600;font-size:12.5px">${q}</summary><p class="note" style="margin-top:8px">${a}</p></details>`).join('')}</div>`)}${card('Release notes','',`<div class="pad"><div class="timeline"><div class="event"><strong>v2.4 · Nov 2026</strong><p>Arrival prediction model v2.4 (MAE 3.8 min) · Evidence packs · Change approvals · Customer scorecards.</p></div><div class="event"><strong>v2.3 · Oct 2026</strong><p>Anomaly investigation queue · Reconciliation history · Teams notifications · Collapsible navigation.</p></div><div class="event"><strong>v2.2 · Sep 2026</strong><p>Data lineage registry · Pipeline health · Role-based access.</p></div></div></div>`)}</div>`
    +card('Support','',`<div class="kv-grid three">${sl('Service desk','zero-support@company.com')}${sl('Hours','24 × 7 for Critical alarms')}${sl('Response target','15 min Critical · 4 h other')}</div>`);
  }
  function support(){openDialog(`<h2>Contact support</h2><form onsubmit="event.preventDefault();document.querySelector('dialog').close();audit('Support request opened');toast('Support request SR-4471 opened')"><div class="fields"><label class="field">Topic<select><option>Data not arriving</option><option>Alarm routing</option><option>Access request</option><option>Other</option></select></label><label class="field">Priority<select><option>Normal</option><option>High</option><option>Critical</option></select></label><label class="field wide">Describe the problem<textarea required></textarea></label></div><div class="formactions">${closeBtn}<button class="primary">Send request</button></div></form>`)}

  /* ---------- Handlers used by inline onclick ---------- */
  window.zga={openChange,decideChange,newChange,downloadPack,newRole,createKey,keyCreated,keyDetail,openCustomerLot,addRange,support,close:closeDialog};

  /* ---------- Registration ---------- */
  registerPage('customers',customersPage,{group:'GOVERNANCE',label:'Customer scorecards',after:'reports'});
  registerPage('customer',customerPage,{parent:'customers'});
  registerPage('approvals',approvalsPage,{group:'GOVERNANCE',label:'Change approvals',after:'customers'});
  registerPage('evidence',evidencePage,{group:'GOVERNANCE',label:'Evidence packs',after:'approvals'});
  registerPage('report-schedules',reportSchedulesPage,{group:'GOVERNANCE',label:'Scheduled reports',after:'evidence'});
  registerPage('roles',rolesPage,{group:'ADMINISTRATION',label:'Roles & permissions',after:'users'});
  registerPage('integrations',integrationsPage,{group:'ADMINISTRATION',label:'Integrations & API',after:'roles'});
  registerPage('security',securityPage,{group:'ADMINISTRATION',label:'Security & retention',after:'integrations'});
  registerPage('profile',profilePage,{group:'ADMINISTRATION',label:'My profile',after:'security'});
  registerPage('help',helpPage,{group:'ADMINISTRATION',label:'Help & release notes',after:'profile'});
})();
