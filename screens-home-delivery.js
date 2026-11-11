/* Additional screens: HOME and DATA DELIVERY sections. */
(function(){
  const idx=(part,list)=>{const n=Number(part);return Number.isInteger(n)&&n>=0&&n<list.length?n:0};
  const back=(href,label)=>`<a class="button" href="#${href}">← ${label}</a>`;
  const bars=rows=>`<div class="bar-list">${rows.map(([l,v,cls])=>`<div class="bar-row"><span>${l}</span><div class="bar"><span class="${cls||''}" style="width:${parseFloat(v)}%"></span></div><b>${v}</b></div>`).join('')}</div>`;
  const kv=(rows,cls='')=>`<div class="kv-grid ${cls}">${rows.map(([k,v])=>`<div class="statline"><span>${k}</span><b>${v}</b></div>`).join('')}</div>`;
  const closeBtn=`<button type="button" onclick="document.querySelector('dialog').close()">Close</button>`;
  window.zeroDialog=function(html){$('#dialog').innerHTML=html;$('#dialog').showModal()};

  /* ---------------- HOME ---------------- */

  function executive(){
    return title('Executive summary','Business outcomes of digital-defect prevention across sites, customers and products.',`<select aria-label="Period"><option>Quarter to date</option><option>Last 30 days</option><option>Year to date</option></select>${btn('Export briefing',"audit('Executive briefing exported');toast('Executive briefing exported as PDF')",true)}`)
    +kpis([['Escaped digital defects','0','↓ from 4 last quarter'],['Cost avoided','$1.82M','Holds, rework and claims prevented'],['On-time data delivery','97.8%','↑ 3.1 pts vs. last quarter'],['Customer escalations','1','Apex Automotive · closed',true]])
    +`<div class="two">${card('On-time data delivery by month','Share of lots whose required data arrived within the agreed window.',bars([['June','91.2%','warn'],['July','93.5%'],['August','94.8%'],['September','96.1%'],['October','97.2%'],['November','97.8%']]))}
      ${card('Defects caught before shipment','Exceptions detected and resolved before the customer was affected.',`<div class="pad"><div class="big-num">146</div><p class="note">Exceptions resolved before shipment this quarter, including 38 missing wafer maps, 52 late test records and 11 quantity mismatches.</p><div class="progress"><span style="width:100%"></span></div><div class="statline"><span>Prevented customer holds</span><b>23</b></div><div class="statline"><span>Average time to resolve</span><b>24 min</b></div><div class="statline"><span>Automated detection rate</span><b>96%</b></div></div>`)}</div>`
    +`<div class="two">${card('Site comparison','Data reliability and response by manufacturing site.',table(['Site','Lots','On-time data','Quality pass','Open alarms','Trend'],[['ATKH · Austin','612','96.9%','98.1%','2','Improving'],['ATBK · Bangkok','471','98.4%','98.9%','1','Stable'],['ATGD · Global data','201','99.1%','99.4%','0','Stable']],"navigate('sites')",false))}
      ${card('Top causes of data exceptions','Where to invest to remove repeat issues.',bars([['LTDS ingestion lag','38%','bad'],['Late station-end events','24%','warn'],['PUID mapping gaps','17%','warn'],['Quantity mismatch','13%'],['Shipment context delay','8%']]))}</div>`
    +card('Customer outlook','Customers whose delivery commitments need attention this week.',table(['Customer','Product','Shipments this week','Data readiness','Risk','Owner'],[['Apex Automotive','Automotive MCU','14','92%','High','Herpreet Oberoi'],['Horizon Mobility','Power management','9','97%','Medium','Quality team'],['Vertex Industrial','RF transceiver','6','100%','Low','Logistics']],"navigate('customers')",false));
  }

  /* Ask Zero assistant */
  const zeroAnswers=[
    [/0842|late|map/i,`<b>LOT-2026-0842</b> is 18 minutes late for its final-test wafer map.<ul><li>FSB confirmed station end at 10:00; the map was expected in LTDS by 10:20.</li><li>LTDS ingestion is currently delayed (18 min lag) — the likely cause.</li><li>Alarm ALM-1024 is routed to ATKH site operations.</li></ul>Recommended action: check the LTDS ingestion job, then replay event EVT-9048.<span class="src">Sources: FSB event EVT-9048 · LTDS availability check 10:38 · ALM-1024</span>`],
    [/risk|ship|week/i,`Three shipments this week carry data risk:<ul><li><b>SHP-5512</b> · Apex Automotive · LOT-2026-0842 — final-test map missing</li><li><b>SHP-5509</b> · Apex Automotive · LOT-2026-0839 — quantity mismatch under review</li><li><b>SHP-5507</b> · Horizon Mobility · LOT-2026-0841 — predicted data delay (84% risk)</li></ul>All other shipments have complete evidence packs.<span class="src">Sources: Shipment release · AI predictions · Reconciliation</span>`],
    [/quantity|0839|mismatch/i,`<b>LOT-2026-0839</b> shows a quantity mismatch: lot movement reports 5,000 units while the final-test summary reports 4,982 (−18).<ul><li>Rule: Test quantity reconciliation (0 difference allowed)</li><li>Issue ISS-1023 is being investigated by the Quality team.</li></ul><span class="src">Sources: Reconciliation run · ISS-1023</span>`],
    [/summar|today|shift|status/i,`Today so far:<ul><li>1,284 lots processed · 97.8% on-time data</li><li>3 open alarms (2 critical, 1 warning)</li><li>LTDS is the only source with degraded latency</li><li>17 issues resolved, average 24 minutes</li></ul><span class="src">Sources: Operations overview · Alarm center</span>`]
  ];
  function zeroReply(q){const hit=zeroAnswers.find(([re])=>re.test(q));return hit?hit[1]:`I looked across lots, alarms, quality results and source health. Try asking about a specific lot (for example <b>LOT-2026-0842</b>), shipments at risk, or today’s status.<span class="src">Zero assistant · advisory only — a person confirms every action</span>`}
  window.zeroReply=zeroReply;window.askZero=function(q){q=String(q||'').trim();if(!q)return;state.saved.chat=state.saved.chat||[];state.saved.chat.push(['user',esc(q)],['bot',window.zeroReply(q)]);save();audit('Asked Zero assistant');render();setTimeout(()=>{const log=document.querySelector('.chat-log');if(log)log.scrollTop=log.scrollHeight;const inp=document.querySelector('.chat-input input');if(inp)inp.focus()},30)};
  window.clearZeroChat=function(){state.saved.chat=[];save();render()};
  function assistant(){
    const log=[['bot','Hello Herpreet. I can explain late or missing data, summarize alarms, and suggest next actions. I only advise — every action is confirmed by a person.'],...(state.saved.chat||[])];
    const prompts=['Why is LOT-2026-0842 late?','Which shipments are at risk this week?','Explain the quantity mismatch on LOT-2026-0839','Summarize today’s status'];
    return title('Ask Zero','An AI assistant that explains data exceptions with evidence and recommends the next action.',btn('New conversation','clearZeroChat()'))
    +`<div class="two">${card('Conversation','Answers cite the records they are based on.',`<div class="chat"><div class="chat-log">${log.map(([who,t])=>`<div class="msg ${who}">${t}</div>`).join('')}</div><form class="chat-input" onsubmit="event.preventDefault();askZero(this.q.value)"><input name="q" placeholder="Ask about a lot, alarm, shipment or source…" aria-label="Message"><button class="primary">Send</button></form></div>`)}
      <div>${card('Suggested questions','',`<div class="pad" style="padding-top:0"><div class="chips">${prompts.map(p=>`<span class="chip" onclick="askZero(this.textContent)">${p}</span>`).join('')}</div></div>`)}
      ${card('What the assistant can see','Read-only access, scoped to your sites.',`<div class="pad" style="padding-top:0">${[['Lots & events','CAMSTAR, FSB'],['Wafer maps & tests','LTDS, GTDS'],['Predictions','Arrival & defect models'],['Alarms & issues','Alarm center'],['Actions','Suggest only']].map(([k,v])=>`<div class="statline"><span>${k}</span><b>${v}</b></div>`).join('')}</div>`)}</div></div>`;
  }

  /* Inbox */
  const inboxItems=[
    ['red','⚠︎','Critical alarm assigned to your team','ALM-1024 · Late final test map on LOT-2026-0842','10:38','alarm/0'],
    ['orange','✎','Approval requested','Change CR-311 · Final test grace period 5 → 8 minutes','10:12','approvals'],
    ['blue','@','You were mentioned on ISS-1023','“@Herpreet can you confirm the expected quantity for this lot?” — Quality team','09:54','issue/1'],
    ['red','⚠︎','Quantity mismatch detected','ALM-1023 · LOT-2026-0839 · −18 units','09:41','alarm/1'],
    ['','✓','Shipment released','SHP-5504 · Vertex Industrial · evidence pack complete','09:20','shipments'],
    ['blue','▤','Weekly reliability report ready','Delivery and quality summary for week 45','08:00','reports'],
    ['','↻','Model retrained','Arrival prediction v2.4 passed evaluation (MAE 3.8 min)','Yesterday','model/0']
  ];
  window.markInboxRead=function(){state.saved.inboxRead=true;save();render();toast('All notifications marked as read')};
  function inbox(){
    const read=state.saved.inboxRead;
    return title('Inbox','Alarms, approvals and mentions that need your attention.',btn('Mark all as read','markInboxRead()')+`<a class="button primary" href="#profile">Notification preferences</a>`)
    +kpis([['Unread',read?'0':'4','Since your last visit',!read],['Assigned to me','2','Alarms and issues'],['Approvals waiting','1','Configuration change'],['Mentions','1','Issue discussion']])
    +`<div class="tabs"><a class="active" href="#inbox">All</a><a href="#alarms">Alarms</a><a href="#approvals">Approvals</a><a href="#issues">Issues</a></div>`
    +card('Notifications','Select a notification to open the related record.',`<div class="feed">${inboxItems.map(([c,i,h,p,t,r],n)=>`<a class="feed-item ${!read&&n<4?'unread':''}" href="#${r}"><span class="feed-icon ${c}">${i}</span><div><strong>${h}</strong><p>${p}</p></div><time>${t}</time></a>`).join('')}</div>`);
  }

  /* Global search */
  function search(part){
    const q=decodeURIComponent(part||'').trim(),ql=q.toLowerCase();
    const match=row=>!ql||row.join(' ').toLowerCase().includes(ql);
    let issues=[];try{issues=issueSeed}catch(e){}
    const screens=groups.flatMap(([g,items])=>items.map(([r,,t])=>[t,g,r])).filter(([t,g])=>!ql||t.toLowerCase().includes(ql)||g.toLowerCase().includes(ql));
    const groupsOut=[
      ['Lots',lots.map((l,i)=>[l,i]).filter(([l])=>match(l)),([l,i])=>[`lot/${i}`,l[0],`${l[1]} · ${l[2]} · ${l[3]}`,l[4]]],
      ['Alarms',alarms.map((a,i)=>[a,i]).filter(([a])=>match(a)),([a,i])=>[`alarm/${i}`,a[0]+' · '+a[1],`${a[2]} · ${a[4]}`,a[3]]],
      ['Issues',issues.map((a,i)=>[a,i]).filter(([a])=>match(a)),([a,i])=>[`issue/${i}`,a[0]+' · '+a[3],`${a[2]} · ${a[4]}`,a[6]]],
      ['Source systems',systems.map((s,i)=>[s,i]).filter(([s])=>match(s)),([s,i])=>[`system/${i}`,s[0],s[1],s[2]]],
      ['Screens',screens.map(s=>[s]),([s])=>[s[2],s[0],s[1].charAt(0)+s[1].slice(1).toLowerCase(),'']]
    ];
    const total=groupsOut.reduce((n,g)=>n+g[1].length,0);
    return title(q?`Results for “${esc(q)}”`:'Search','Search across lots, PUIDs, alarms, issues, source systems and screens.')
    +card('Search','',`<form class="pad" style="padding-top:0" onsubmit="event.preventDefault();navigate('search/'+encodeURIComponent(this.q.value.trim()))"><div style="display:flex;gap:10px"><input name="q" value="${esc(q)}" placeholder="Try LOT-2026-0842, ALM-1023, LTDS, quality…" style="flex:1"><button class="primary">Search</button></div><div class="chips" style="margin-top:12px">${['LOT-2026-0842','ALM-1023','LTDS','Quantity','Apex'].map(s=>`<a class="chip" href="#search/${encodeURIComponent(s)}">${s}</a>`).join('')}</div></form>`)
    +(total?groupsOut.filter(g=>g[1].length).map(([name,items,fmt])=>card(`${name} <span class="pill gray">${items.length}</span>`,'',`<div class="feed">${items.map(it=>{const [r,h,p,s]=fmt(it);return `<a class="feed-item" href="#${r}"><span class="feed-icon">${name[0]}</span><div><strong>${esc(h)}</strong><p>${esc(p)}</p></div>${s?pill(s):'<time>Open ↗</time>'}</a>`}).join('')}</div>`)).join(''):card('No results','',`<div class="empty">Nothing matches “${esc(q)}”. Check the lot ID or try a shorter term.</div>`));
  }

  /* Sign-in */
  window.signIn=function(){audit('Signed in with single sign-on');navigate('overview');setTimeout(()=>toast('Welcome back, Herpreet'),60)};
  function login(){
    return `<div class="login-wrap"><div class="login-art"><div class="brand-mark"><em>0</em>Zero</div><div><div class="stage-label" style="color:#8fd19e">ZERO DIGITAL DEFECTS</div><h1>Every lot ships with complete, trusted data.</h1><p>Zero watches every hand-off of manufacturing data between your factory systems, predicts when data is at risk, and gets every gap fixed before the product ships.</p><div class="login-points"><div><b>1</b>Predict when wafer maps and test data will arrive</div><div><b>2</b>Detect late, missing and inconsistent data automatically</div><div><b>3</b>Route alarms to the right owner and prove resolution</div></div></div><p style="font-size:11px">© 2026 Zero Operations Hub</p></div>
    <div class="login-form"><div class="login-card"><h2>Sign in</h2><p>Use your company account to continue.</p><button class="sso" type="button" onclick="signIn()"><svg width="16" height="16" viewBox="0 0 24 24"><rect x="2" y="2" width="9" height="9" fill="#f25022"/><rect x="13" y="2" width="9" height="9" fill="#7fba00"/><rect x="2" y="13" width="9" height="9" fill="#00a4ef"/><rect x="13" y="13" width="9" height="9" fill="#ffb900"/></svg>Continue with Microsoft SSO</button><div class="divider">or</div><form onsubmit="event.preventDefault();signIn()"><label class="field">Work email<input type="email" value="herpreet.oberoi@company.com" required></label><label class="field">Password<input type="password" value="••••••••••" required></label><button class="primary full" type="submit">Sign in</button></form><div class="login-foot">Protected by multi-factor authentication · <a class="link" href="#help">Need help?</a></div></div></div></div>`;
  }

  /* ---------------- DATA DELIVERY ---------------- */

  /* Wafer map viewer */
  function rng(seed){let s=seed;return()=>{s=(s*9301+49297)%233280;return s/233280}}
  /* Draws a representative map; grid density follows wafer size, each square stands for a block of dies. */
  function waferSvg(i,spec){
    const r=rng(7+i*13),n={100:16,125:18,150:20,200:24,300:30}[spec.size]||26,size=360,c=size/2,R=170,cell=size/n;let rects='',counts={pass:0,fail:0,edge:0,missing:0};
    const missingBand=i===0;
    for(let y=0;y<n;y++)for(let x=0;x<n;x++){const cx=x*cell+cell/2,cy=y*cell+cell/2,d=Math.hypot(cx-c,cy-c);if(d>R-cell*.6)continue;if(spec.mark==='Flat'&&cy>c+R*.9)continue;let k='pass';const v=r();if(missingBand&&x>n*.68&&y>n*.48&&y<n*.76)k='missing';else if(d>R-cell*2.2&&v<.35)k='edge';else if(v<(i===3?.11:.05))k='fail';counts[k]++;const col={pass:'#7fb97a',fail:'#d97a62',edge:'#e8b462',missing:'#d8dcd8'}[k];rects+=`<rect x="${(x*cell+.6).toFixed(1)}" y="${(y*cell+.6).toFixed(1)}" width="${(cell-1.2).toFixed(1)}" height="${(cell-1.2).toFixed(1)}" rx="1.2" fill="${col}"></rect>`}
    const mark=spec.mark==='Notch'?`<circle cx="${c}" cy="${c+R+4}" r="7" fill="#fff" stroke="#cfd9d1" stroke-width="2"/>`:`<rect x="${c-R*.45}" y="${c+R*.92}" width="${R*.9}" height="14" fill="#fff"/><line x1="${c-R*.43}" y1="${c+R*.92}" x2="${c+R*.43}" y2="${c+R*.92}" stroke="#cfd9d1" stroke-width="2"/>`;
    return {svg:`<svg viewBox="0 0 ${size} ${size+8}" role="img" aria-label="${spec.size} mm wafer map"><circle cx="${c}" cy="${c}" r="${R+4}" fill="#f6f8f5" stroke="#cfd9d1" stroke-width="2"/>${rects}${mark}</svg>`,counts};
  }
  function waferMap(part){
    const i=idx(part,lots),l=lots[i],spec=specFor(l[1]),{svg,counts}=waferSvg(i,spec);
    const cells=counts.pass+counts.fail+counts.edge+counts.missing,k=spec.gross/cells,perCell=Math.max(1,Math.round(k));
    const sc={fail:Math.round(counts.fail*k),edge:Math.round(counts.edge*k),missing:Math.round(counts.missing*k)};sc.pass=spec.gross-sc.fail-sc.edge-sc.missing;
    const yieldPct=(sc.pass/(spec.gross-sc.missing)*100).toFixed(1);
    const measured=spec.final+[3,13,-4,2,-6,1][i],ttv=[1.8,2.4,1.5,2.1,1.2,1.9][i],thickOk=Math.abs(measured-spec.final)<=spec.tol;
    const src=spec.size===300?'GTDS':'LTDS';
    const wafers=Array.from({length:6},(_,w)=>{const t=w===2?measured:spec.final+[1,-2,0,2,-1,0][w];const miss=w===2&&i===0;return [`W${String(w+5).padStart(2,'0')}`,spec.gross.toLocaleString(),(sc.pass+(2-w)*Math.round(spec.gross*.004)).toLocaleString(),(yieldPct-(w-2)*.4).toFixed(1)+'%',`${t} µm`,miss?'Missing':Math.abs(t-spec.final)>spec.tol?'Failed':'Passed',miss?'—':`09:${String(10+w*4).padStart(2,'0')}`]});
    return title('Wafer map viewer',`Inspect the digital wafer map for ${l[0]} and verify it is complete and in spec before shipment.`,`<a class="button" href="#lot/${i}">Open lot journey</a><a class="button" href="#wafer-specs">Wafer specs</a>${btn('Download map',`audit('Wafer map downloaded for ${l[0]}');toast('Wafer map exported (SINF / XML)')`,true)}`)
    +`<div class="tabs">${lots.map((x,n)=>`<a class="${n===i?'active':''}" href="#wafer-map/${n}">${x[0].slice(-4)} · ${specFor(x[1]).size} mm</a>`).join('')}</div>`
    +kpis([['Gross die',spec.gross.toLocaleString(),`${spec.label} · ${spec.dieLabel} die`],['Good die',sc.pass.toLocaleString(),`Yield ${yieldPct}%`],['Final thickness',`${measured} µm`,`Target ${spec.final} ± ${spec.tol} µm`,!thickOk],['Missing records',sc.missing.toLocaleString(),sc.missing?'Map incomplete':'Map complete',sc.missing>0]])
    +card(`${l[0]} · Wafer 07 · ${l[3]}`,`${l[1]} · PUID NX-${794020+i} · ${spec.label} · Source ${src}`,`<div class="wafer-wrap">${svg}<div><div class="bin-legend"><div><i style="background:#7fb97a"></i>Bin 1 · Pass <b style="margin-left:auto">${sc.pass.toLocaleString()}</b></div><div><i style="background:#d97a62"></i>Bins 2–5 · Functional fail <b style="margin-left:auto">${sc.fail.toLocaleString()}</b></div><div><i style="background:#e8b462"></i>Bins 6–7 · Edge / parametric <b style="margin-left:auto">${sc.edge.toLocaleString()}</b></div><div><i style="background:#d8dcd8"></i>No record received <b style="margin-left:auto">${sc.missing.toLocaleString()}</b></div></div><p class="note" style="margin-top:8px">Each square represents about ${perCell} dies.</p>
      <div style="margin-top:14px">${[['Map header (lot, wafer, PUID)','Passed'],[`Wafer size matches product (${spec.size} mm)`,'Passed'],['Die count matches wafer spec',sc.missing?'Failed':'Passed'],['Bin totals equal test summary',i===3?'Failed':'Passed'],[`Thickness ${measured} µm within ${spec.final} ± ${spec.tol} µm`,thickOk?'Passed':'Failed'],[`TTV ${ttv} µm ≤ 3 µm`,'Passed'],['Received within SLA',i===0?'Late data':'Passed']].map(([a,b])=>`<div class="statline"><span>${a}</span>${pill(b)}</div>`).join('')}</div>
      ${sc.missing?`<div class="logic-band" style="margin-top:16px"><strong>Digital defect:</strong> ${sc.missing.toLocaleString()} die have no test record. The wafer cannot be released until the map is complete. <a class="link" href="#alarm/0">Open ALM-1024 ↗</a></div>`:''}${!thickOk?`<div class="logic-band" style="margin-top:16px"><strong>Out of spec:</strong> measured thickness ${measured} µm is above the ${spec.final} ± ${spec.tol} µm limit for ${l[1]}. Hold the wafer for re-measurement. <a class="link" href="#rules">Thickness rule ↗</a></div>`:''}</div></div>`)
    +`<div class="two">${card('Wafer specification','From the product definition in Wafer specs.',`<div class="pad" style="padding-top:0">${[['Diameter',spec.label],['Material',spec.material],['Orientation mark',spec.mark],['Incoming thickness (SEMI)',`${spec.incoming} µm`],['Final thickness after grinding',`${spec.final} ± ${spec.tol} µm`],['Measured thickness',`${measured} µm`],['Total thickness variation',`${ttv} µm (limit 3 µm)`],['Die size',spec.dieLabel],['Edge exclusion',`${spec.edge} mm`],['Gross die per wafer',spec.gross.toLocaleString()]].map(([a,b])=>`<div class="statline"><span>${a}</span><b>${b}</b></div>`).join('')}</div>`)}
      ${card('Wafers in this lot','Every wafer must carry a complete map and an in-spec thickness before release.',table(['Wafer','Gross die','Good die','Yield','Thickness','Map status','Received'],wafers,`toast('Wafer selected')`,false))}</div>`;
  }

  /* Shipment release */
  const shipments=[['SHP-5512','Apex Automotive','LOT-2026-0842','Automotive MCU','Nov 11 · 06:00','4 of 6','On hold'],['SHP-5509','Apex Automotive','LOT-2026-0839','Automotive MCU','Nov 11 · 14:00','5 of 6','On hold'],['SHP-5507','Horizon Mobility','LOT-2026-0841','Power management','Nov 12 · 08:00','5 of 6','At risk'],['SHP-5505','Vertex Industrial','LOT-2026-0840','RF transceiver','Nov 12 · 16:00','6 of 6','Ready'],['SHP-5504','Vertex Industrial','LOT-2026-0838','Secure element','Nov 10 · 09:00','6 of 6','Released']];
  const gateChecks=['Lot movement complete (CAMSTAR)','Wafer maps complete (LTDS / GTDS)','Test quantity reconciled','No open critical alarms','Customer-required data elements present','Evidence pack generated'];
  window.shipmentDialog=function(i){const s=shipments[i],done=parseInt(s[5]);zeroDialog(`<div class="stage-label">SHIPMENT RELEASE GATE</div><h2>${s[0]} · ${s[1]}</h2><p class="note">${s[2]} · ${s[3]} · Planned ${s[4]}</p><div style="margin:14px 0">${gateChecks.map((c,k)=>`<div class="statline"><span>${c}</span>${pill(k<done?'Passed':'Failed')}</div>`).join('')}</div><div class="formactions">${closeBtn}<button type="button" onclick="document.querySelector('dialog').close();audit('${s[0]} placed on hold');toast('${s[0]} held · customer notified')">Hold shipment</button><button class="primary" type="button" onclick="document.querySelector('dialog').close();${done===6?`audit('${s[0]} released');toast('${s[0]} released · evidence pack attached')`:`toast('Release blocked: ${6-done} gate check(s) still failing')`}">Release</button></div>`)};
  function shipmentsPage(){
    return title('Shipment release','Release a shipment only when every lot carries complete, reconciled digital data.',`<a class="button" href="#evidence">Evidence packs</a>${btn('Open release gate','shipmentDialog(0)',true)}`)
    +kpis([['Shipments this week','29','Across 3 customers'],['Ready to release','24','All gate checks passed'],['On hold','2','Data gaps blocking release',true],['At risk','1','Predicted data delay',true]])
    +`<div class="banner"><div><strong>2 shipments are held for missing or inconsistent data</strong><p>SHP-5512 waits for the LOT-2026-0842 final-test map. SHP-5509 waits for quantity reconciliation on LOT-2026-0839.</p></div>${pill('Action required')}</div>`
    +card('Shipment queue','Select a shipment to review its release gate.',table(['Shipment','Customer','Lot ID','Product','Planned','Gate checks','Status'],shipments,'shipmentDialog($i)'))
    +`<div class="two">${card('Release gate','The checks every shipment must pass.',`<div class="pad" style="padding-top:0">${gateChecks.map((c,k)=>`<div class="statline"><span>${k+1}. ${c}</span>${pill('Required')}</div>`).join('')}</div>`)}${card('Holds by reason','Last 30 days.',bars([['Missing wafer map','46%','bad'],['Quantity mismatch','27%','warn'],['Late test data','18%','warn'],['Customer field missing','9%']]))}</div>`;
  }

  /* Data freshness */
  function freshness(){
    const srcs=['SAP','CAMSTAR','FSB','LTDS','GTDS','Blue Yonder','ODS'];
    const data={'ATKH · Austin':[2,1,.2,18,3,4,6],'ATBK · Bangkok':[3,1,.2,4,2,5,6],'ATGD · Global data':[2,2,.3,null,3,4,7],'ATPN · Penang':[4,2,.4,6,9,5,8]};
    const cls=v=>v===null?'na':v>12?'bad':v>7?'warn':'ok',fmt=v=>v===null?'n/a':v<1?Math.round(v*60)+' s':v+' min';
    return title('Data freshness','Minutes since the last record from every source system at every site.',btn('Refresh now',"audit('Freshness refreshed');toast('Freshness refreshed · 10:41')",true))
    +kpis([['Feeds monitored','27','7 sources × 4 sites'],['Fresh','24','Within threshold'],['Stale','2','Above warning threshold',true],['Critical','1','LTDS at ATKH',true]])
    +card('Freshness heatmap','Green within threshold · amber above 7 minutes · red above 12 minutes.',`<div style="overflow-x:auto"><table class="heat"><thead><tr><th>Site</th>${srcs.map(s=>`<th>${s}</th>`).join('')}</tr></thead><tbody>${Object.entries(data).map(([site,vals])=>`<tr><td>${site}</td>${vals.map((v,k)=>`<td class="${cls(v)}" title="${srcs[k]} · ${site}">${fmt(v)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`)
    +`<div class="two">${card('Stale feeds','Feeds above threshold with the owner notified.',table(['Feed','Site','Last record','Threshold','Owner','Status'],[['LTDS wafer maps','ATKH','18 min ago','10 min','Site operations','Critical'],['GTDS test summary','ATPN','9 min ago','7 min','IT support','Warning'],['ODS history sync','ATPN','8 min ago','7 min','Data engineering','Warning']],"navigate('system/4')",false))}${card('Thresholds','Set per source in Checkpoints & SLAs.',`<div class="pad" style="padding-top:0">${[['FSB events','30 seconds'],['CAMSTAR movement','5 minutes'],['LTDS / GTDS maps','10 minutes'],['SAP / Blue Yonder','15 minutes']].map(([k,v])=>`<div class="statline"><span>${k}</span><b>${v}</b></div>`).join('')}<div class="formactions"><a class="button" href="#checkpoints">Edit thresholds</a></div></div>`)}</div>`;
  }

  /* Failed events & replay */
  const failed=[['EVT-9048-R','FSB / TIBCO','Station end','LOT-2026-0842','Map not found in LTDS','10:20','3'],['EVT-9031','CAMSTAR','Lot move','LOT-2026-0841','PUID missing in payload','09:47','1'],['EVT-9027','GTDS','Test summary','LOT-2026-0839','Quantity field out of range','09:41','2'],['EVT-9012','SAP','Shipment update','LOT-2026-0838','Schema version 3.2 not mapped','08:55','1']];
  window.replayEvent=function(i){audit('Replayed '+failed[i][0]);toast(failed[i][0]+' replayed · result will appear in Event processing')};
  window.failedPayload=function(i){const f=failed[i];zeroDialog(`<div class="stage-label">FAILED EVENT</div><h2>${f[0]} · ${f[2]}</h2><p class="note">${f[1]} · ${f[3]} · First failure ${f[5]} · ${f[6]} attempt(s)</p><div class="statline"><span>Error</span><b>${f[4]}</b></div><pre class="code" style="margin:14px 0">{
  "eventId": "${f[0]}",
  "source": "${f[1]}",
  "type": "${f[2]}",
  "lotId": "${f[3]}",
  "puid": "${f[4].includes('PUID')?'':'NX-794020'}",
  "station": "FT-07",
  "timestamp": "2026-11-10T${f[5]}:00Z"
}</pre><div class="formactions">${closeBtn}<button type="button" onclick="document.querySelector('dialog').close();toast('Event discarded and logged')">Discard</button><button class="primary" type="button" onclick="document.querySelector('dialog').close();replayEvent(${i})">Replay event</button></div>`)};
  function deadLetter(){
    return title('Failed events & replay','Events that could not be processed, why they failed, and replay once the cause is fixed.',btn('Replay all',"audit('Replayed all failed events');toast('4 events queued for replay')",true))
    +kpis([['Failed events','4','Last 24 hours',true],['Auto-retried','11','Recovered without action'],['Oldest failure','1 h 46 min','EVT-9012'],['Replay success','94%','Last 30 days']])
    +card('Failed event queue','Select an event to inspect its payload.',`<div class="anomaly-table"><table><thead><tr><th>Event</th><th>Source</th><th>Type</th><th>Lot ID</th><th>Error</th><th>First failure</th><th>Attempts</th><th></th></tr></thead><tbody>${failed.map((f,i)=>`<tr tabindex="0" style="cursor:pointer" onclick="failedPayload(${i})">${f.map(c=>`<td>${esc(c)}</td>`).join('')}<td><button class="table-action" onclick="event.stopPropagation();replayEvent(${i})">Replay</button></td></tr>`).join('')}</tbody></table></div>`)
    +`<div class="two">${card('Failures by reason','Last 7 days.',bars([['Referenced data not found','41%','bad'],['Missing identifier','26%','warn'],['Value out of range','19%','warn'],['Unmapped schema','14%']]))}${card('Retry policy','Applied before an event reaches this queue.',`<div class="pad" style="padding-top:0">${[['Automatic retries','3'],['Back-off','1 · 5 · 15 minutes'],['Alarm after','3 failed attempts'],['Retention','30 days']].map(([k,v])=>`<div class="statline"><span>${k}</span><b>${v}</b></div>`).join('')}</div>`)}</div>`;
  }

  /* Pipeline detail */
  function pipelineDetail(part){
    let rows=[];try{rows=savedRows('pipelines',pipelineSeed)}catch(e){}
    const i=idx(part,rows),p=rows[i]||['PL-001','FSB event intake','FSB / TIBCO','ZDD event store','Every 1 minute','Healthy','Data engineering'];
    const warn=p[5]!=='Healthy';
    return title(`${p[0]} · ${p[1]}`,`${p[2]} → ${p[3]} · ${p[4]}`,`${back('pipelines','All pipelines')}${btn('Pause',`audit('${p[0]} paused');toast('${p[0]} paused')`)}${btn('▶ Run now',`audit('${p[0]} run started');toast('${p[0]} run started')`,true)}`)
    +kpis([['Status',p[5],warn?'Latency above target':'All stages healthy',warn],['Records today',warn?'38,214':'412,906','↑ 6% vs. yesterday'],['Avg. latency',warn?'14.2 min':'48 s',warn?'Target 10 min':'Target 60 s',warn],['Failed records',warn?'27':'3','Sent to Failed events',warn]])
    +card('Processing stages','Latest run · 10:38',`<div class="track">${[['Extract','10:38:02'],['Validate','10:38:09'],['Map & enrich','10:38:15'],['Load','10:38:21'],['Publish','10:38:24']].map(([s,t],k)=>`<div class="track-step ${warn&&k===3?'current':'done'}">${s}<small>${warn&&k===3?'Waiting on source':t}</small></div>`).join('')}</div>`)
    +`<div class="two">${card('Run history','Most recent runs first.',table(['Run','Started','Duration','Records','Failed','Status'],[['R-48211','10:38','22 s','1,204','0',warn?'Warning':'Passed'],['R-48210','10:37','19 s','1,187','1','Passed'],['R-48209','10:36','21 s','1,233','0','Passed'],['R-48208','10:35','24 s','1,310','2','Passed'],['R-48207','10:34','20 s','1,165','0','Passed']],"toast('Run log opened')",false))}
      ${card('Configuration','',kv([['Source',p[2]],['Target',p[3]],['Schedule',p[4]],['Owner',p[6]],['Validation','Schema · identifiers · duplicates'],['On failure','Retry 3× then Failed events']],'one'))}</div>`;
  }

  registerPage('executive',executive,{group:'HOME',label:'Executive summary',after:'overview'});
  registerPage('assistant',assistant,{group:'HOME',label:'Ask Zero',after:'process-guide'});
  registerPage('inbox',inbox,{group:'HOME',label:'Inbox',after:'assistant'});
  registerPage('search',search,{});
  registerPage('login',login,{});
  registerPage('wafer-map',waferMap,{group:'DATA DELIVERY',label:'Wafer map viewer',after:'lots'});
  registerPage('shipments',shipmentsPage,{group:'DATA DELIVERY',label:'Shipment release',after:'wafer-map'});
  registerPage('freshness',freshness,{group:'DATA DELIVERY',label:'Data freshness',after:'pipelines'});
  registerPage('dead-letter',deadLetter,{group:'DATA DELIVERY',label:'Failed events & replay',after:'events'});
  registerPage('pipeline',pipelineDetail,{parent:'pipelines'});
})();
