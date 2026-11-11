/* Language models available to the Zero AI agent (component 4 in the solution architecture). */
(function(){
  const llms=[
    {id:'vero',name:'Vero-wchat LLM',provider:'Vero · private model',hosting:'Private · inside company network',best:'Explaining late and missing data, alarm summaries',residency:'Stays on site',logo:'V',color:'#5b3a8c'},
    {id:'claude',name:'Claude Sonnet 5.5',provider:'Anthropic',hosting:'Cloud API · AWS Bedrock',best:'Root-cause reasoning, CAPA drafts, long investigations',residency:'Regional cloud',logo:'A',color:'#c96442'},
    {id:'gpt',name:'GPT (latest)',provider:'OpenAI',hosting:'Microsoft Azure OpenAI',best:'Shift summaries, report narratives',residency:'Regional cloud',logo:'O',color:'#10a37f'},
    {id:'gemini',name:'Gemini (latest)',provider:'Google',hosting:'Google Cloud Vertex AI',best:'Reading documents and wafer-map images',residency:'Regional cloud',logo:'G',color:'#4285f4'},
    {id:'llama',name:'Llama (latest)',provider:'Meta · open weights',hosting:'Self-hosted on site GPU servers',best:'Air-gapped sites with no external access',residency:'Stays on site',logo:'L',color:'#0467df'},
    {id:'mistral',name:'Mistral Large',provider:'Mistral AI',hosting:'Cloud API or self-hosted',best:'EU data-residency requirements',residency:'EU',logo:'M',color:'#fa520f'}
  ];
  window.zeroLlms=llms;
  const current=()=>llms.find(l=>l.id===state.saved.llm)||llms[0];
  window.currentLlm=current;
  window.setLlm=function(id,quiet){state.saved.llm=id;save();audit('Default language model set to '+current().name);render();const p=document.querySelector('#zero-panel');if(p&&!p.hidden&&window.openZeroPanel)openZeroPanel();if(!quiet)toast(current().name+' is now the default model for Ask Zero')};
  window.llmSelect=function(cls=''){return `<select class="llm-select ${cls}" aria-label="Language model" onchange="setLlm(this.value)">${llms.map(l=>`<option value="${l.id}" ${l.id===current().id?'selected':''}>${l.name}</option>`).join('')}</select>`};

  /* Every answer records the model that produced it. */
  const baseReply=window.zeroReply;
  if(baseReply)window.zeroReply=q=>baseReply(q)+`<span class="src">Answered by ${current().name} · ${current().hosting}</span>`;

  const logo=l=>`<span class="llm-logo" style="background:${l.color}">${l.logo}</span>`;
  window.llmDialog=function(id){const l=llms.find(x=>x.id===id);$('#dialog').innerHTML=`<div class="stage-label">LANGUAGE MODEL</div><h2 style="display:flex;align-items:center;gap:10px">${logo(l)}${l.name}</h2><p class="note">${l.provider} · ${l.hosting}</p><form onsubmit="event.preventDefault();document.querySelector('dialog').close();audit('${l.name} settings saved');toast('${l.name} settings saved')"><div class="fields" style="margin-top:16px"><label class="field">Endpoint / region<input value="${l.residency==='Stays on site'?'https://llm.internal.company.com':l.residency==='EU'?'eu-west':'us-east'}"></label><label class="field">Max response length<select><option>Short (≈ 300 words)</option><option selected>Standard (≈ 800 words)</option><option>Long (≈ 2,000 words)</option></select></label><label class="field">Creativity<select><option selected>Precise</option><option>Balanced</option></select></label><label class="field">Monthly budget<input value="${l.residency==='Stays on site'?'Included':'$1,500'}"></label></div><div class="switch-row"><div><strong>Mask lot IDs, PUIDs and customer names</strong><p>Identifiers are replaced before the prompt leaves the network.</p></div><label class="switch"><input type="checkbox" ${l.residency==='Stays on site'?'':'checked'}><span></span></label></div><div class="formactions"><button type="button" onclick="document.querySelector('dialog').close()">Close</button><button type="button" onclick="toast('Test prompt answered by ${l.name} in 1.4 s')">Send test prompt</button><button class="primary">Save settings</button></div></form>`;$('#dialog').showModal()};

  function llmSection(){
    const cur=current();
    const routing=[['Explain a late or missing map','vero'],['Summarize alarms for a shift handover','gpt'],['Draft root cause & CAPA','claude'],['Read a wafer-map image or PDF report','gemini'],['Answers for air-gapped sites','llama']];
    return `<div class="section-title"><h2>Language models for the AI agent</h2><p>Ask Zero can use the Vero-wchat LLM from the ZDD architecture or other leading models. Choose a default, then route tasks to the model that fits best.</p></div>`
    +`<div class="llm-grid">${llms.map(l=>`<div class="llm-card ${l.id===cur.id?'is-default':''}"><div class="llm-head">${logo(l)}<div><b>${l.name}</b><small>${l.provider}</small></div>${l.id===cur.id?pill('Default'):pill('Available')}</div><div class="statline"><span>Runs on</span><b>${l.hosting}</b></div><div class="statline"><span>Data location</span><b>${l.residency}</b></div><p class="note" style="margin:10px 0 0">Best for: ${l.best}</p><div class="formactions" style="margin-top:14px;padding-top:14px">${btn('Configure',`llmDialog('${l.id}')`)}${l.id===cur.id?'<button disabled>Default model</button>':btn('Set as default',`setLlm('${l.id}')`,true)}</div></div>`).join('')}</div>`
    +`<div class="two">${card('Task routing','Which model handles each kind of request. Unlisted requests use the default model.',`<div class="pad" style="padding-top:0">${routing.map(([t,id])=>`<div class="statline"><span>${t}</span><select aria-label="${t}" onchange="audit('Routing changed: ${t}');toast('Routing updated')">${llms.map(l=>`<option ${l.id===id?'selected':''}>${l.name}</option>`).join('')}</select></div>`).join('')}<div class="statline"><span>Fallback if a model is unavailable</span><b>${cur.id==='vero'?'Llama (latest)':'Vero-wchat LLM'}</b></div></div>`)}
      ${card('Guardrails','Apply to every model.',`<div class="pad" style="padding-top:0">${[['Human approval for every action','The assistant suggests; a person confirms.',true],['Mask identifiers for cloud models','Lot IDs, PUIDs and customer names are masked.',true],['Keep answers grounded in ZDD records','Every answer cites the lots, events or alarms it used.',true],['Store prompts and answers in the audit trail','Retained for 365 days.',true],['Allow models to learn from company data','Disabled by contract with each provider.',false]].map(([h,p,on])=>`<div class="switch-row"><div><strong>${h}</strong><p>${p}</p></div><label class="switch"><input type="checkbox" ${on?'checked':''} onchange="audit('Guardrail changed: ${h}');toast('Guardrail updated')"><span></span></label></div>`).join('')}</div>`)}</div>`
    +card('Model usage this month','Requests answered by each model.',`<div class="bar-list">${[['Vero-wchat LLM','60%'],['Claude Sonnet 5.5','14%'],['GPT (latest)','11%'],['Gemini (latest)','6%'],['Llama (latest)','5%'],['Mistral Large','4%']].map(([n,v])=>`<div class="bar-row"><span>${n}</span><div class="bar"><span style="width:${parseFloat(v)}%"></span></div><b>${v}</b></div>`).join('')}</div>`);
  }

  /* AI models page: existing model cards + language models. */
  registerPage('models',()=>models().replace('Vero / WeChat LLM agent','Vero-wchat LLM agent')+llmSection(),{});

  /* Ask Zero page: model picker next to the page actions. */
  const baseAssistant=pageRegistry.assistant;
  if(baseAssistant)registerPage('assistant',p=>baseAssistant(p).replace(`<button class="" onclick="clearZeroChat()">New conversation</button>`,`<label class="llm-pick">Model ${llmSelect()}</label><button class="" onclick="clearZeroChat()">New conversation</button>`).replace(`<div class="statline"><span>Actions</span>`,`<div class="statline"><span>Language model</span><b>${current().name}</b></div><div class="statline"><span>Actions</span>`),{});
})();
