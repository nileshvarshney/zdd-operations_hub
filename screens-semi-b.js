/* Semiconductor screens (part B): map delivery, test data integrity, SPC charts and die-count reconciliation. */
(function(){
  const idx=(part,list,def=0)=>{const n=Number(part);return part!==undefined&&part!==''&&Number.isInteger(n)&&n>=0&&n<list.length?n:def};
  const fmt=n=>Number(n).toLocaleString('en-US');
  const lotIndex=id=>Math.max(0,lots.findIndex(l=>l[0]===id));
  const closeBtn=`<button type="button" onclick="document.querySelector('dialog').close()">Close</button>`;
  const dlg=html=>{$('#dialog').innerHTML=html;$('#dialog').showModal()};
  const lines=rows=>`<div class="pad" style="padding-top:0">${rows.map(([k,v])=>`<div class="statline"><span>${k}</span><b>${v}</b></div>`).join('')}</div>`;
  const bars=rows=>`<div class="bar-list">${rows.map(([l,v,cls])=>`<div class="bar-row"><span>${l}</span><div class="bar"><span class="${cls||''}" style="width:${parseFloat(v)}%"></span></div><b>${v}</b></div>`).join('')}</div>`;

  /* ---------------- MAP DELIVERY ---------------- */
  const deliveries=[
    ['MAP-7781','LOT-2026-0842','25','SEMI E142 + STDF','Apex Automotive portal','—','Final-test map missing','On hold'],
    ['MAP-7779','LOT-2026-0837','25','SINF + SEMI E142','Assembly partner · Penang','v2 (re-sent)','Version mismatch fixed','Released'],
    ['MAP-7776','LOT-2026-0839','25','SEMI E142 + STDF','Apex Automotive portal','v1','Quantity mismatch','On hold'],
    ['MAP-7772','LOT-2026-0840','25','Customer CSV','Vertex Industrial portal','v1','6 of 6 passed','Released'],
    ['MAP-7770','LOT-2026-0838','25','Customer CSV','Vertex Industrial portal','v1','6 of 6 passed','Released'],
    ['MAP-7768','LOT-2026-0841','25','SINF','Horizon Mobility','—','Thickness hold','Pending']
  ];
  window.mapDeliveryDialog=function(i){
    const d=deliveries[i],li=lotIndex(d[1]),l=lots[li],s=specFor(l[1]);
    const fails={0:{3:'Missing'},2:{2:'Failed'},5:{6:'On hold'}}[i]||{};
    const checks=[['Format schema valid ('+d[3]+')','Passed'],[`Die count = gross die (${fmt(s.gross)} per wafer)`,'Passed'],['Bin codes mapped to customer codes','Passed'],['PAT / GDBN reject bins (8, 9) included',i===1?'Passed':'Passed'],[`Orientation matches spec (${s.mark})`,'Passed'],['Checksum and file size','Passed'],['Release gate (holds cleared)','Passed']];
    if(i===0)checks[1]=['Die count = gross die (final-test map not received)','Missing'];
    if(i===2)checks[2]=['Bin totals agree with final-test quantity (4,982 vs 5,000)','Failed'];
    if(i===5)checks[6]=['Release gate (W07 thickness hold)','On hold'];
    if(i===1)checks.push(['Destination has latest map version (v2 after PAT re-binning)','Passed']);
    void fails;
    const rows=s.size===300?96:s.size===200?66:50;
    dlg(`<div class="stage-label">MAP DELIVERY</div><h2>${d[0]} · ${d[1]}</h2><p class="note">${l[1]} · ${s.label} · ${d[2]} wafers · ${d[3]} → ${d[4]}</p><div style="margin:14px 0">${checks.map(([k,v])=>`<div class="statline"><span>${k}</span>${pill(v)}</div>`).join('')}</div>${i===1?`<div class="logic-band" style="margin-bottom:12px"><strong>Caught before assembly:</strong> the assembly partner still held map v1, created before PAT and GDBN re-binning. Zero detected the version mismatch and re-sent v2, so outlier dies will not be picked.</div>`:''}<pre class="code" style="margin:0 0 14px">&lt;MapData xmlns="urn:semi-org:xsd.E142-1.V1005.SubstrateMap"&gt;
  &lt;Layouts&gt;&lt;Layout LayoutId="${l[0]}-W07" DefaultUnits="mm"&gt;
    &lt;Dimension X="${rows}" Y="${rows}"/&gt;
    &lt;DeviceSize X="${s.die[0]}" Y="${s.die[1]}"/&gt;
  &lt;/Layout&gt;&lt;/Layouts&gt;
  &lt;Substrates&gt;&lt;Substrate SubstrateType="Wafer" SubstrateId="${l[0]}-W07"&gt;
    &lt;LotId&gt;${l[0]}&lt;/LotId&gt;&lt;SlotNumber&gt;7&lt;/SlotNumber&gt;
    &lt;AliasIds&gt;&lt;AliasId Type="Diameter" Value="${s.size}mm"/&gt;&lt;AliasId Type="${s.mark}" Value="0deg"/&gt;&lt;/AliasIds&gt;
  &lt;/Substrate&gt;&lt;/Substrates&gt;
&lt;/MapData&gt;</pre><div class="formactions">${closeBtn}<button type="button" onclick="document.querySelector('dialog').close();audit('Validated ${d[0]}');toast('${d[0]} validated · results updated')">Validate now</button><button type="button" onclick="document.querySelector('dialog').close();toast('${d[0]} downloaded (${d[3]})')">Download</button><button class="primary" type="button" onclick="document.querySelector('dialog').close();${d[7]==='On hold'||d[7]==='Pending'?`toast('Re-send blocked: ${d[6].toLowerCase()} must be resolved first')`:`audit('Re-sent ${d[0]}');toast('${d[0]} re-sent to ${d[4]}')`}">Re-send</button></div>`);
  };
  function mapDelivery(){
    return title('Map delivery','Wafer maps and test results sent to the assembly partner and to customers, in the format each one requires, and checked before they leave.',btn('Validate all',"audit('All map deliveries validated');toast('6 deliveries validated · 3 need action')")+btn('Download',"toast('Delivery log downloaded (CSV)')")+btn('Re-send latest',"audit('Re-sent MAP-7779');toast('MAP-7779 re-sent to Assembly partner · Penang')",true))
    +kpis([['Maps delivered today','148','To 4 destinations'],['Blocked','2','Missing map · quantity mismatch',true],['Version mismatches caught','1','LOT-2026-0837 · v1 → v2',true],['Format errors','0','Last 7 days']])
    +card('Map formats','What each file contains.',`<div class="evidence-list">${[['SINF','Simple die-level map in text form: one character per die showing its bin. Common with assembly partners.'],['SEMI E142','Industry XML standard for substrate maps: wafer ID, size, orientation and every die position with its bin.'],['STDF','Standard Test Data Format: the full test results per die or unit, used for traceability and analysis.'],['Customer CSV','A customer-defined table of wafer, die position and bin, used where a portal needs a simple upload.']].map(([h,p],i)=>`<div class="evidence-row"><span class="evidence-num">${i+1}</span><div><strong>${h}</strong><p>${p}</p></div>${pill('Supported')}</div>`).join('')}</div>`)
    +card('Deliveries','Select a delivery to see its validation checks and file header.',table(['Map ID','Lot ID','Wafers','Format','Destination','Version','Checks','Status'],deliveries,'mapDeliveryDialog($i)'))
    +`<div class="two">${card('Format requirements by destination','Set per customer in Customer maps.',table(['Destination','Formats','PAT / GDBN bins','Bin codes','Delivery'],[['Apex Automotive','SEMI E142 + STDF','Required','Customer codes A1–A9','Portal upload'],['Horizon Mobility','SINF','Optional','Standard bins 1–9','SFTP'],['Vertex Industrial','Customer CSV','Optional','Customer codes V-PASS / V-FAIL','Portal upload'],['Assembly partner · Penang','SINF + SEMI E142','Required','Standard bins 1–9','SFTP · before die pick']],"navigate('mappings')",false))}
      ${card('Why delivery is checked','A map that reaches assembly wrong cannot be fixed later.',lines([['Missing map','Assembly cannot pick dies · shipment held'],['Wrong version','Rejected dies may be assembled'],['Wrong bin codes','Customer receives incorrect quality data'],['Die count mismatch','Traceability to the wafer is lost']]))}</div>`;
  }

  /* ---------------- TEST DATA INTEGRITY ---------------- */
  const runs=[
    ['TR-5521','LOT-2026-0842','Wafer sort · 25 °C','WS-MCU-A40-r08','T2000-03','PC-4471','92,300','1,140','Complete','Passed'],
    ['TR-5534','LOT-2026-0842','Final test · 125 °C hot','FT-MCU-A40-r12','T2000-07','LB-2210','5,970','74','Missing in LTDS','Missing'],
    ['TR-5502','LOT-2026-0839','Final test · 125 °C hot','FT-MCU-A40-r12','T2000-07','LB-2210','5,018','212','Retest merge error','Failed'],
    ['TR-5503','LOT-2026-0839','Final test · −40 °C cold','FT-MCU-A40-r12','T2000-09','LB-2214','5,018','96','Complete','Passed'],
    ['TR-5498','LOT-2026-0841','Wafer sort · 25 °C','WS-PMIC-H12-r05','T1000-02','PC-3318','78,500','830','Complete','Passed'],
    ['TR-5490','LOT-2026-0840','Final test · 25 °C','FT-RFX-V7-r09','T1000-05','LB-1180','4,780','41','Complete','Passed'],
    ['TR-5486','LOT-2026-0838','Final test · 25 °C','FT-SE-K3-r04','T1000-04','LB-1102','8,960','63','Complete','Passed']
  ];
  window.testRunDialog=function(i){
    const r=runs[i];
    dlg(`<div class="stage-label">TEST RUN</div><h2>${r[0]} · ${r[1]}</h2><p class="note">${r[2]} · program ${r[3]} · tester ${r[4]} · ${r[5].startsWith('PC')?'probe card':'load board'} ${r[5]}</p><div style="margin:14px 0">${[['Test program version approved','Passed'],[`Tester ${r[4]} calibrated`,r[4]==='T2000-07'?'Warning':'Passed'],[`${r[5].startsWith('PC')?'Probe card':'Load board'} within life`,'Passed'],['STDF file received and complete',r[9]==='Missing'?'Missing':'Passed'],['Retest records merged by unit ID',r[9]==='Failed'?'Failed':'Passed']].map(([k,v])=>`<div class="statline"><span>${k}</span>${pill(v)}</div>`).join('')}</div>${r[9]==='Failed'?`<div class="logic-band" style="margin-bottom:12px"><strong>Retest merge error:</strong> retest records were matched by time instead of unit ID, so 18 units recovered on retest kept their first-pass fail. Reported pass 4,982 instead of 5,000. <a class="link" href="#issue/1" onclick="document.querySelector('dialog').close()">ISS-1023 ↗</a></div>`:''}${r[9]==='Missing'?`<div class="logic-band" style="margin-bottom:12px"><strong>Missing:</strong> the final-test STDF file and map have not arrived in LTDS. <a class="link" href="#alarm/0" onclick="document.querySelector('dialog').close()">ALM-1024 ↗</a></div>`:''}<div class="formactions">${closeBtn}<button type="button" onclick="document.querySelector('dialog').close();toast('${r[0]} STDF downloaded')">Download STDF</button><button class="primary" type="button" onclick="document.querySelector('dialog').close();audit('Re-validated ${r[0]}');toast('${r[0]} re-validated')">Re-validate</button></div>`);
  };
  function testData(){
    return title('Test data integrity','Every test step must be present, run with the approved program on calibrated equipment, and have its retests merged correctly.',btn('Re-validate all',"audit('Test data re-validated');toast('7 test runs re-validated · 2 need action')",true))
    +kpis([['Test runs today','412','Wafer sort and final test'],['Incomplete','1','LOT-2026-0842 final test',true],['Retest merge errors','1','LOT-2026-0839',true],['Testers due calibration','1','T2000-07 · 6 days',true]])
    +card('Test steps explained','Automotive parts are tested several times, at different temperatures.',`<div class="evidence-list">${[['Test insertion','One pass of a wafer or unit through a tester: wafer sort (probing dies on the wafer) or final test (packaged units).'],['Temperature','Room 25 °C, hot 125 °C and cold −40 °C. Automotive parts need hot and cold to prove they work across the vehicle range.'],['Program, tester, probe card','The test program version, the tester and the probe card (wafer) or load board (units) used. Each must be approved and within its life.'],['Retest merge','Units that fail can be retested. The final result must use the latest result per unit ID, never both and never the wrong one.']].map(([h,p],i)=>`<div class="evidence-row"><span class="evidence-num">${i+1}</span><div><strong>${h}</strong><p>${p}</p></div>${pill('Checked')}</div>`).join('')}</div>`)
    +card('Test runs','Select a run to see its checks.',table(['Run','Lot ID','Insertion','Program','Tester','Probe card / board','Units tested','Retests','STDF','Result'],runs,'testRunDialog($i)'))
    +`<div class="two">${card('Required test steps by product','Completeness for lots in progress.',table(['Lot ID','Product','Required steps','Present','Status'],[['LOT-2026-0842','Automotive MCU','Wafer sort 25 °C · 125 °C, final test hot + cold','3 of 4','Missing'],['LOT-2026-0839','Automotive MCU','Wafer sort 25 °C · 125 °C, final test hot + cold','4 of 4 (1 merge error)','Failed'],['LOT-2026-0841','Power management','Wafer sort 25 °C, final test 25 °C','1 of 2','Pending'],['LOT-2026-0840','RF transceiver','Wafer sort 25 °C, final test 25 °C','2 of 2','Passed'],['LOT-2026-0838','Secure element','Wafer sort 25 °C, final test 25 °C + 85 °C','3 of 3','Passed'],['LOT-2026-0837','Power management','Wafer sort 25 °C, final test 25 °C','2 of 2','Passed']],"navigate('lot/'+[0,3,1,2,4,5][$i])",false))}
      ${card('Retest merge · LOT-2026-0839','Final test 125 °C hot.',`<div class="pad" style="padding-top:0">${[['Units tested (first pass)','5,018'],['Passed first time','4,806'],['Sent to retest','212'],['Recovered on retest','194'],['Failed after retest','18'],['Expected pass (4,806 + 194)','5,000'],['Reported pass','<span style="color:#bc7463">4,982 (−18)</span>']].map(([k,v])=>`<div class="statline"><span>${k}</span><b>${v}</b></div>`).join('')}<p class="note" style="margin-top:12px">18 recovered units kept their first-pass fail because retests were matched by time, not unit ID.</p><div class="formactions"><a class="button" href="#die-flow/3">Die count chain</a><a class="button primary" href="#issue/1">Open ISS-1023</a></div></div>`)}</div>`
    +card('Equipment checks','Testers, probe cards and load boards used today.',table(['Equipment','Type','Check','Value','Status'],[['T2000-07','Tester','Calibration due','6 days','Warning'],['T2000-03','Tester','Calibration due','41 days','Passed'],['PC-4471','Probe card','Touchdowns','412,000 of 500,000','Passed'],['PC-3318','Probe card','Touchdowns','188,000 of 500,000','Passed'],['LB-2210','Load board','Insertions','61,200 of 100,000','Passed']],"toast('Equipment record opened')",false));
  }

  /* ---------------- SPC ---------------- */
  function controlChart(points,o){
    const W=1000,H=240,pl=52,pr=16,pt=16,pb=30,n=points.length;
    const x=i=>pl+(W-pl-pr)*(n===1?0:i/(n-1)),y=v=>pt+(H-pt-pb)*(1-(v-o.min)/(o.max-o.min));
    const hline=(v,dash,col,label)=>`<line x1="${pl}" x2="${W-pr}" y1="${y(v).toFixed(1)}" y2="${y(v).toFixed(1)}" stroke="${col}" stroke-width="1.2" ${dash?'stroke-dasharray="5 4"':''}/><text x="${W-pr}" y="${(y(v)-4).toFixed(1)}" text-anchor="end" font-size="11" paint-order="stroke" stroke="#fff" stroke-width="3" stroke-linejoin="round" fill="${col}">${label}</text>`;
    const ticks=[o.min,(o.min+o.max)/2,o.max].map(v=>`<text x="${pl-6}" y="${(y(v)+3).toFixed(1)}" text-anchor="end" font-size="11" paint-order="stroke" stroke="#fff" stroke-width="3" stroke-linejoin="round" fill="#9aa69c">${+v.toFixed(1)}${o.unit}</text>`).join('');
    const path=points.map((p,i)=>`${i?'L':'M'}${x(i).toFixed(1)} ${y(p).toFixed(1)}`).join(' ');
    const dots=points.map((p,i)=>{const c=o.color(i,p);return `<circle cx="${x(i).toFixed(1)}" cy="${y(p).toFixed(1)}" r="${c==='#6d9b68'?3.2:5}" fill="${c}" stroke="#fff" stroke-width="1.5"><title>${o.label(i)}: ${p}${o.unit}</title></circle>`}).join('');
    return `<div class="chart" style="padding:4px 22px 6px"><svg viewBox="0 0 ${W} ${H}" width="100%" style="height:auto;display:block" role="img" aria-label="${o.aria}"><line x1="${pl}" x2="${pl}" y1="${pt}" y2="${H-pb}" stroke="#e3e9e4"/><line x1="${pl}" x2="${W-pr}" y1="${H-pb}" y2="${H-pb}" stroke="#e3e9e4"/>${ticks}${hline(o.ucl,true,'#9aa69c','UCL '+o.ucl+o.unit)}${hline(o.lcl,true,'#9aa69c','LCL '+o.lcl+o.unit)}${hline(o.center,false,'#b9c7bb',(o.centerLabel||'Mean')+' '+o.center+o.unit)}<path d="${path}" fill="none" stroke="#6d9b68" stroke-width="1.8"/>${dots}<text x="${pl}" y="${H-8}" font-size="11" paint-order="stroke" stroke="#fff" stroke-width="3" stroke-linejoin="round" fill="#9aa69c">${o.first}</text><text x="${W-pr}" y="${H-8}" text-anchor="end" font-size="11" paint-order="stroke" stroke="#fff" stroke-width="3" stroke-linejoin="round" fill="#9aa69c">${o.last}</text></svg></div><div class="legend"><span><b></b>In control</span><span><b style="background:#d9a35a"></b>Trend warning</span><span><b style="background:#cf7a62"></b>Out of control</span><span style="margin-left:auto">Rules: Western Electric 1 (beyond limits), 2 (7 points trending)</span></div>`;
  }
  function spc(){
    const yieldPts=[87.4,86.9,88.1,87.0,86.2,88.6,87.8,86.5,87.9,88.3,86.8,87.5,85.9,81.2,87.1,88.0,86.7,87.6,88.4,84.2];
    const thick=[101,99,102,98,100,103,97,100,101,99,102,100,98,101,103,99,100,102,101,113];
    const leak=[0.82,0.79,0.85,0.8,0.83,0.78,0.81,0.84,0.8,0.82,0.79,0.81,0.83,0.86,0.9,0.95,1.01,1.08,1.14,1.21];
    const lotLabel=(base,i)=>'LOT-2026-'+String(base+i).padStart(4,'0');
    return title('SPC charts','Statistical process control: each chart shows a measurement over time with control limits. Points outside the limits or trending in one direction are flagged before they become defects.',btn('Export charts',"toast('SPC charts exported (PDF)')")+btn('Acknowledge all',"audit('SPC signals acknowledged');toast('3 signals acknowledged · owners notified')",true))
    +kpis([['Charts monitored','24','Yield, thickness and bin rates'],['Out of control','2','Beyond control limits',true],['Trend warnings','1','Bin 4 leakage rising',true],['In control','21','No action needed']])
    +card('Wafer-sort yield · Automotive MCU','Yield per lot, last 20 lots. One lot fell below the lower control limit.',controlChart(yieldPts,{min:79,max:92,ucl:90.6,lcl:83.8,center:87.2,unit:'%',aria:'Yield control chart',first:lotLabel(820,0),last:'LOT-2026-0839',label:i=>i===19?'LOT-2026-0839':lotLabel(820,i),color:(i,p)=>p<83.8||p>90.6?'#cf7a62':'#6d9b68'}))
    +card('Final thickness · Power management','Thickness after grinding per wafer. Target 100 µm, limits 90–110 µm.',controlChart(thick,{min:86,max:116,ucl:110,lcl:90,center:100,centerLabel:'Target',unit:' µm',aria:'Thickness control chart',first:'LOT-2026-0837 · W01',last:'LOT-2026-0841 · W07',label:i=>i===19?'LOT-2026-0841 · W07':'Wafer '+(i+1),color:(i,p)=>p>110||p<90?'#cf7a62':'#6d9b68'}))
    +card('Bin 4 leakage rate · all products','Share of dies failing the leakage test. The last 7 lots rise in a row, a trend warning.',controlChart(leak,{min:0.6,max:1.4,ucl:1.25,lcl:0.55,center:0.9,unit:'%',aria:'Leakage rate control chart',first:lotLabel(818,0),last:'LOT-2026-0837',label:i=>lotLabel(818,i),color:i=>i>=13?'#d9a35a':'#6d9b68'}))
    +card('Signals','Select a signal to open the related screen.',table(['Chart','Lot / wafer','Value','Rule','Status','Action'],[['Final thickness','LOT-2026-0841 · W07','113 µm','Rule 1 · above UCL 110 µm','Open','Hold wafer, re-measure'],['Wafer-sort yield','LOT-2026-0833','81.2%','Rule 1 · below LCL 83.8%','In progress','Investigate probe card PC-4471'],['Bin 4 leakage rate','Last 7 lots','0.83 → 1.21%','Rule 2 · 7 points rising','Open','Review leakage screening limits']],"navigate(['wafer-map/1','test-data','anomalies'][$i])",false));
  }

  /* ---------------- DIE FLOW ---------------- */
  const sortYield=[0.887,0.823,0.826,0.842,0.894,0.869],issued=[6000,5500,4800,5040,9000,5200],asmLoss=[30,25,20,22,40,26],ftFail=[60,48,40,18,85,52],sawRate=0.002;
  function flowFor(i){
    const l=lots[i],s=specFor(l[1]),gross=s.gross*25,sortGood=Math.round(gross*sortYield[i]),saw=Math.round(sortGood*sawRate),bank=sortGood-saw,ftIn=issued[i]-asmLoss[i],expPass=ftIn-ftFail[i];
    const reported=i===3?expPass-18:i===0?null:expPass,shipped=i===4?reported:null;
    return {l,s,gross,sortGood,saw,bank,remain:bank-issued[i],issued:issued[i],asmOut:ftIn,ftIn,expPass,reported,shipped};
  }
  function dieFlow(part){
    const i=idx(part,lots,3),f=flowFor(i),l=f.l;
    const steps=[
      ['Gross die',fmt(f.gross),`${fmt(f.s.gross)} per wafer × 25 wafers`,'Passed'],
      ['Wafer sort good die',fmt(f.sortGood),`${fmt(f.gross-f.sortGood)} failed at wafer sort`,'Passed'],
      ['Die bank (after sawing)',fmt(f.bank),`${fmt(f.saw)} lost in sawing`,'Passed'],
      ['Issued to assembly',fmt(f.issued),`${fmt(f.remain)} remain in die bank`,'Passed'],
      ['Assembly out',fmt(f.asmOut),`${fmt(asmLoss[i])} lost in assembly`,'Passed'],
      ['Final test in',fmt(f.ftIn),'Equals assembly out','Passed'],
      ['Final test pass',f.reported===null?'—':fmt(f.reported),f.reported===null?'Final-test map not received':i===3?`Expected ${fmt(f.expPass)} · ${fmt(ftFail[i])} failed · 18 unaccounted`:`${fmt(ftFail[i])} failed at final test`,f.reported===null?'Missing':i===3?'Failed':'Passed'],
      ['Shipped',f.shipped===null?'—':fmt(f.shipped),f.shipped===null?(i===3||i===0||i===1?'On hold':'Awaiting release'):'All passed units shipped',f.shipped===null?(i===3||i===0||i===1?'On hold':'Pending'):'Passed']
    ];
    const cur=steps.findIndex(s=>s[3]!=='Passed');
    const allRows=lots.map((x,k)=>{const g=flowFor(k);return [x[0],x[1],fmt(g.gross),fmt(g.sortGood),fmt(g.issued),g.reported===null?'—':fmt(g.reported),k===3?'−18':k===0?'—':'0',k===3?'Failed':k===0?'Missing':'Passed']});
    return title('Die count across steps','Every die is accounted for from the wafer to the shipped unit: what passed, what was scrapped and why. Any unexplained difference is a data defect.',`<a class="button" href="#test-data">Test data</a>${btn('Export reconciliation',`toast('Die reconciliation for ${l[0]} exported (CSV)')`,true)}`)
    +`<div class="tabs">${lots.map((x,k)=>`<a class="${k===i?'active':''}" href="#die-flow/${k}">${x[0].slice(-4)}</a>`).join('')}</div>`
    +kpis([['Gross die',fmt(f.gross),`${l[1]} · ${f.s.label}`],['Issued to assembly',fmt(f.issued),`${fmt(f.remain)} remain in die bank`],['Final test pass',f.reported===null?'—':fmt(f.reported),f.reported===null?'Map not received':i===3?`Expected ${fmt(f.expPass)}`:'Reconciled',f.reported===null||i===3],['Unexplained difference',i===3?'−18':i===0?'Unknown':'0',i===3?'ISS-1023 · retest merge':i===0?'ALM-1024 · missing map':'All dies accounted for',i===3||i===0]])
    +card(`${l[0]} · die count chain`,'Quantity at each step, with the loss explained.',`<div class="track">${steps.map((s,k)=>`<div class="track-step ${cur===-1||k<cur?'done':k===cur?'current':''}">${s[0]}<small>${s[1]}</small></div>`).join('')}</div>`+table(['Step','Quantity','Loss / note','Check'],steps,i===3?"navigate($i===6?'issue/1':'test-data')":i===0?"navigate('alarm/0')":"toast('Step record opened')",false)
      +(i===3?`<div class="logic-band" style="margin:0 22px 18px"><strong>Mismatch:</strong> final test should report ${fmt(f.expPass)} passing units but reports ${fmt(f.reported)}. The 18 units were recovered on retest but kept their first-pass fail. <a class="link" href="#issue/1">ISS-1023 ↗</a> <a class="link" href="#test-data">Test data ↗</a></div>`:'')
      +(i===0?`<div class="logic-band" style="margin:0 22px 18px"><strong>Cannot reconcile:</strong> the final-test map for ${l[0]} has not arrived, so passing units are unknown. <a class="link" href="#alarm/0">ALM-1024 ↗</a></div>`:''))
    +`<div class="two">${card('Loss by reason','All lots in progress, this week.',bars([['Wafer sort fail','71%','warn'],['Sawing / handling','9%'],['Assembly (wire bond, mold)','8%'],['Final test fail','11%'],['Unexplained','1%','bad']]))}
      ${card('How reconciliation works','',lines([['Each step','In = out + scrap'],['Scrap','Needs a reason code'],['Final test','Pass count must match the merged test result'],['Any gap','Raises an alarm and blocks shipment']]))}</div>`
    +card('All lots','Reconciliation status per lot.',table(['Lot ID','Product','Gross die','Sort good die','Issued to assembly','Final test pass','Difference','Status'],allRows,"navigate('die-flow/$i')",false));
  }

  registerPage('map-delivery',mapDelivery,{});
  registerPage('test-data',testData,{});
  registerPage('spc',spc,{});
  registerPage('die-flow',dieFlow,{});
})();
