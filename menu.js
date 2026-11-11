/* Compact menu: related screens are grouped into one menu item with tabs,
   one menu section open at a time, a Cmd/Ctrl+K quick finder and an Ask Zero side panel. */
(function(){
  const hubs=[
    {sec:'HOME',label:'Overview',tabs:[['overview','Operations'],['executive','Executive summary']]},
    {sec:'HOME',label:'How it works',tabs:[['flow','End-to-end flow'],['architecture','Solution architecture'],['process-guide','Process guide']]},
    {sec:'OPERATE',label:'Data delivery',tabs:[['systems','Data systems'],['pipelines','Pipelines'],['freshness','Freshness'],['events','Event processing'],['dead-letter','Failed events'],['lineage','Lineage']]},
    {sec:'OPERATE',label:'Lots & shipments',tabs:[['lots','Lot explorer'],['wafer-map','Wafer maps'],['shipments','Shipment release']]},
    {sec:'OPERATE',label:'Data health',tabs:[['predictions','AI predictions'],['monitoring','Monitoring'],['quality','Quality'],['reconciliation','Reconciliation']]},
    {sec:'OPERATE',label:'Alarms & issues',count:true,tabs:[['alarms','Alarms'],['anomalies','Anomalies'],['issues','Issues'],['capa','Root cause & CAPA'],['handover','Shift handover'],['notifications','Notifications']]},
    {sec:'CONFIGURE',label:'Setup & catalog',tabs:[['setup','Application setup'],['mappings','Customer maps'],['master-data','Master data'],['products','Products & routes'],['sites','Sites & stations']]},
    {sec:'CONFIGURE',label:'Rules & controls',tabs:[['checkpoints','Checkpoints & SLAs'],['elements','Critical elements'],['rules','Quality rules'],['contacts','Alarm routing'],['maintenance','Maintenance windows'],['models','AI models']]},
    {sec:'GOVERN',label:'Customers & compliance',tabs:[['customers','Scorecards'],['evidence','Evidence packs'],['approvals','Change approvals'],['reports','Reports'],['report-schedules','Scheduled reports'],['audit','Audit trail']]},
    {sec:'GOVERN',label:'Program',tabs:[['customer-problem','Customer problem'],['business-case','Business case'],['gap-analysis','Gap analysis'],['feasibility','Design feasibility'],['signoff','MRAT & FMEA'],['rollout','Pilot & rollout']]},
    {sec:'ADMIN',label:'Administration',tabs:[['settings','Settings'],['users','Users'],['roles','Roles & permissions'],['integrations','Integrations & API'],['security','Security & retention']]}
  ];

  /* Detail screens open under their list screen. */
  Object.assign(navParent,{lot:'lots',system:'systems',alarm:'alarms',prediction:'predictions','quality-detail':'quality'});
  const hubOf={};
  hubs.forEach(h=>{const first=h.tabs[0][0];h.tabs.forEach(([r])=>{hubOf[r]=h;if(r!==first)navParent[r]=first})});

  /* Rebuild the left menu: 5 sections, 11 items. */
  groups.length=0;
  ['HOME','OPERATE','CONFIGURE','GOVERN','ADMIN'].forEach(sec=>groups.push([sec,hubs.filter(h=>h.sec===sec).map(h=>[h.tabs[0][0],'•',h.label,h.count?'1':undefined])]));

  /* Route → its chain of parents (e.g. pipeline → pipelines → systems). */
  function chain(r){const out=[r];for(let n=0;n<6&&navParent[r]&&navParent[r]!==r;n++){r=navParent[r];out.push(r)}return out}
  function hubFor(r){return chain(r).map(x=>hubOf[x]).find(Boolean)}

  /* Tabs at the top of every grouped screen. */
  function injectTabs(){
    const app=document.querySelector('#app');if(!app)return;
    const r=(location.hash.slice(1).split('/')[0])||'overview',h=hubFor(r);
    const existing=app.querySelector(':scope > .hub-bar');
    if(!h){if(existing)existing.remove();return}
    const c=chain(r),active=c.find(x=>h.tabs.some(([t])=>t===x))||h.tabs[0][0];
    const key=h.label+'|'+active;
    if(existing&&existing.dataset.key===key&&app.firstElementChild===existing)return;
    if(existing)existing.remove();
    const bar=document.createElement('div');bar.className='hub-bar';bar.dataset.key=key;
    bar.innerHTML=`<span class="hub-name">${h.label}</span><nav class="hub-tabs" aria-label="${h.label}">${h.tabs.map(([t,l])=>`<a href="#${t}" class="${t===active?'active':''}" ${t===active?'aria-current="page"':''}>${l}</a>`).join('')}</nav>`;
    app.prepend(bar);
    const on=bar.querySelector('.active');if(on&&on.scrollIntoView)on.scrollIntoView({block:'nearest',inline:'nearest'});
  }
  new MutationObserver(injectTabs).observe(document.querySelector('#app'),{childList:true});

  /* One menu section open at a time. */
  document.addEventListener('toggle',e=>{
    const d=e.target;
    if(!d.classList||!d.classList.contains('nav-section')||!d.open||document.body.classList.contains('nav-collapsed'))return;
    document.querySelectorAll('#sidebar .nav-section').forEach(o=>{if(o!==d)o.open=false});
  },true);

  /* Close the account menu when clicking elsewhere. */
  document.addEventListener('click',e=>{const m=document.querySelector('#sidebar .user-menu[open]');if(m&&!m.contains(e.target))m.open=false});

  /* ---------- Quick finder (Cmd/Ctrl + K) ---------- */
  const pal=document.createElement('div');pal.id='palette';pal.hidden=true;
  pal.innerHTML=`<div class="pal-backdrop"></div><div class="pal-box" role="dialog" aria-label="Quick finder"><div class="pal-input"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg><input placeholder="Jump to a page, lot, alarm, issue or system…" aria-label="Quick finder"><kbd>Esc</kbd></div><div class="pal-list" role="listbox"></div><div class="pal-foot"><span><kbd>↑</kbd><kbd>↓</kbd> move</span><span><kbd>Enter</kbd> open</span><span><kbd>Esc</kbd> close</span></div></div>`;
  document.body.append(pal);
  const input=pal.querySelector('input'),list=pal.querySelector('.pal-list');let items=[],sel=0;

  function entries(){
    const out=[];
    hubs.forEach(h=>h.tabs.forEach(([r,l])=>out.push({k:'Pages',t:l,s:h.label,r})));
    [['assistant','Ask Zero','Assistant'],['inbox','Inbox','Account'],['profile','My profile','Account'],['help','Help & release notes','Account'],['login','Sign out','Account']].forEach(([r,t,s])=>out.push({k:'Pages',t,s,r}));
    lots.forEach((l,i)=>out.push({k:'Lots',t:l[0],s:`${l[1]} · ${l[2]} · ${l[4]}`,r:'lot/'+i}));
    lots.forEach((l,i)=>out.push({k:'Wafer maps',t:'Wafer map · '+l[0],s:l[1],r:'wafer-map/'+i}));
    alarms.forEach((a,i)=>out.push({k:'Alarms',t:a[0]+' · '+a[1],s:`${a[2]} · ${a[3]}`,r:'alarm/'+i}));
    try{issueSeed.forEach((a,i)=>out.push({k:'Issues',t:a[0]+' · '+a[3],s:`${a[2]} · ${a[6]}`,r:'issue/'+i}))}catch(e){}
    systems.forEach((s,i)=>out.push({k:'Systems',t:s[0],s:s[1],r:'system/'+i}));
    return out;
  }
  function draw(){
    const q=input.value.trim().toLowerCase(),terms=q.split(/\s+/).filter(Boolean);
    let res=entries().filter(e=>terms.every(t=>(e.t+' '+e.s+' '+e.k).toLowerCase().includes(t)));
    if(!q)res=res.filter(e=>e.k==='Pages').slice(0,12);else res=res.slice(0,30);
    if(q)res.push({k:'Search',t:`Search everything for “${input.value.trim()}”`,s:'Full results page',r:'search/'+encodeURIComponent(input.value.trim())});
    items=res;sel=Math.min(sel,Math.max(0,items.length-1));
    let last='';
    list.innerHTML=items.length?items.map((e,i)=>{const head=e.k!==last?`<div class="pal-group">${q?e.k:'Suggested pages'}</div>`:'';last=e.k;return head+`<div class="pal-item ${i===sel?'sel':''}" role="option" data-i="${i}"><span class="pal-icon">${typeof navSvg==='function'&&navSvg(e.r.split('/')[0])||'↗'}</span><span><b>${esc(e.t)}</b><small>${esc(e.s)}</small></span><span class="pal-go">↵</span></div>`}).join(''):`<div class="pal-empty">No matches</div>`;
    const s=list.querySelector('.sel');if(s)s.scrollIntoView({block:'nearest'});
  }
  function go(i){const e=items[i];if(!e)return;closePalette();navigate(e.r)}
  window.openPalette=function(prefill=''){pal.hidden=false;input.value=prefill;sel=0;draw();setTimeout(()=>input.focus(),0)};
  window.closePalette=function(){pal.hidden=true};
  input.addEventListener('input',()=>{sel=0;draw()});
  input.addEventListener('keydown',e=>{if(e.key==='ArrowDown'){e.preventDefault();sel=Math.min(sel+1,items.length-1);draw()}else if(e.key==='ArrowUp'){e.preventDefault();sel=Math.max(sel-1,0);draw()}else if(e.key==='Enter'){e.preventDefault();go(sel)}else if(e.key==='Escape'){closePalette()}});
  list.addEventListener('click',e=>{const it=e.target.closest('.pal-item');if(it)go(Number(it.dataset.i))});
  list.addEventListener('mousemove',e=>{const it=e.target.closest('.pal-item');if(it&&Number(it.dataset.i)!==sel){sel=Number(it.dataset.i);list.querySelectorAll('.pal-item').forEach(x=>x.classList.toggle('sel',Number(x.dataset.i)===sel))}});
  pal.querySelector('.pal-backdrop').addEventListener('click',closePalette);
  document.addEventListener('keydown',e=>{if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();pal.hidden?openPalette():closePalette()}else if(e.key==='/'&&pal.hidden&&!/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)){e.preventDefault();openPalette()}});

  /* ---------- Ask Zero side panel ---------- */
  const panel=document.createElement('div');panel.id='zero-panel';panel.hidden=true;document.body.append(panel);
  const prompts=['Why is LOT-2026-0842 late?','Which shipments are at risk this week?','Summarize today’s status'];
  function drawPanel(){
    const log=[['bot','Hello Herpreet. Ask me about a lot, alarm, shipment or source. I explain with evidence; you decide the action.'],...(state.saved.chat||[])];
    panel.innerHTML=`<div class="zp-head"><div><b>Ask Zero</b><small>AI assistant · advisory only</small>${window.llmSelect?llmSelect('zp-model'):''}</div><a class="link" href="#assistant" onclick="closeZeroPanel()">Full page ↗</a><button type="button" class="zp-close" onclick="closeZeroPanel()" aria-label="Close">×</button></div><div class="zp-log">${log.map(([w,t])=>`<div class="msg ${w}">${t}</div>`).join('')}</div><div class="zp-chips">${prompts.map(p=>`<span class="chip" onclick="zeroPanelSend(this.textContent)">${p}</span>`).join('')}</div><form class="zp-input" onsubmit="event.preventDefault();zeroPanelSend(this.q.value)"><input name="q" placeholder="Ask a question…" aria-label="Message"><button class="primary">Send</button></form>`;
    const l=panel.querySelector('.zp-log');l.scrollTop=l.scrollHeight;
  }
  window.openZeroPanel=function(){panel.hidden=false;drawPanel();setTimeout(()=>{const i=panel.querySelector('input');if(i)i.focus()},50)};
  window.closeZeroPanel=function(){panel.hidden=true};
  window.zeroPanelSend=function(q){q=String(q||'').trim();if(!q||!window.zeroReply)return;state.saved.chat=state.saved.chat||[];state.saved.chat.push(['user',esc(q)],['bot',zeroReply(q)]);save();audit('Asked Zero assistant');drawPanel();if((location.hash.slice(1).split('/')[0])==='assistant')render();setTimeout(()=>{const i=panel.querySelector('input');if(i)i.focus()},30)};
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!panel.hidden)closeZeroPanel()});
})();
