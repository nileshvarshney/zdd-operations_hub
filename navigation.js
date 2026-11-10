/* Foldable, grouped navigation for the static demo. */
(function(){
  const storageKey='zddNavCollapsed';
  const icons={HOME:'⌂',OPERATIONS:'◉',CONFIGURATION:'⚙',MANAGEMENT:'▤','DELIVERY READINESS':'✓'};
  const normalLabel=value=>value.trim().toUpperCase()==='WORKSPACE'?'HOME':value.trim();

  function setCollapsed(value){
    document.body.classList.toggle('nav-collapsed',value);
    try{localStorage.setItem(storageKey,value?'1':'0')}catch(e){}
    const toggle=document.querySelector('.nav-toggle');
    if(toggle){toggle.textContent=value?'›':'‹';toggle.setAttribute('aria-label',value?'Expand navigation':'Collapse navigation');toggle.title=value?'Expand navigation':'Collapse navigation'}
  }

  function section(label){
    const details=document.createElement('details');
    details.className='nav-section';
    const summary=document.createElement('summary');
    const icon=document.createElement('span');icon.className='section-icon';icon.textContent=icons[label]||'•';
    const name=document.createElement('span');name.className='section-name';name.textContent=label;
    summary.append(icon,name);details.append(summary);return details;
  }

  function sync(){
    const current=location.hash.slice(1).split('/')[0]||'overview';
    document.querySelectorAll('.nav-section').forEach(group=>{
      const active=group.querySelector('.navitem.active')||group.querySelector(`.navitem[href="#${current}"]`);
      if(active)group.open=true;
    });
    const toggle=document.querySelector('.nav-toggle');
    if(toggle)toggle.textContent=document.body.classList.contains('nav-collapsed')?'›':'‹';
  }

  function enhance(){
    const sidebar=document.querySelector('#sidebar');
    if(!sidebar)return;
    const oldWorkspace=sidebar.querySelector('.workspace');if(oldWorkspace)oldWorkspace.remove();
    let nav=sidebar.querySelector('nav');if(!nav)return;

    if(!sidebar.querySelector('.sidebar-head')){
      const brand=sidebar.querySelector('.brand');
      const head=document.createElement('div');head.className='sidebar-head';
      if(brand){brand.remove();head.append(brand)}
      const toggle=document.createElement('button');toggle.className='nav-toggle';toggle.type='button';toggle.textContent='‹';
      toggle.addEventListener('click',()=>setCollapsed(!document.body.classList.contains('nav-collapsed')));
      head.append(toggle);sidebar.prepend(head);
    }

    if(!nav.querySelector('.nav-section')){
      const children=[...nav.children];nav.innerHTML='';let current=null;
      children.forEach(child=>{
        if(child.classList.contains('navlabel')){
          const label=normalLabel(child.textContent);current=section(label);current.open=label==='HOME';nav.append(current);
        }else if(child.classList.contains('navitem')){
          if(!current){current=section('HOME');current.open=true;nav.append(current)}
          current.append(child);
        }
      });
    }

    let collapsed=false;try{collapsed=localStorage.getItem(storageKey)==='1'}catch(e){}
    setCollapsed(document.body.classList.contains('nav-collapsed')||collapsed);
    sync();
  }

  window.enhanceNavigation=enhance;
  window.toggleSidebar=()=>setCollapsed(!document.body.classList.contains('nav-collapsed'));
  enhance();
  window.addEventListener('hashchange',()=>setTimeout(enhance,40));
})();
