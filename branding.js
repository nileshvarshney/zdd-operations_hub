/* Presentation branding for the customer demo. */
function cleanDemoBranding(){
  const workspaceCard=document.querySelector('#sidebar .workspace');
  if(workspaceCard)workspaceCard.remove();
  const crumb=document.querySelector('.crumb');
  if(crumb)crumb.innerHTML='Manufacturing operations';
  document.querySelectorAll('.eyebrow').forEach(el=>{el.textContent=el.textContent.replaceAll('OPERATIONS WORKSPACE','OPERATIONS').replaceAll('WORKSPACE','')});
  document.querySelectorAll('#sidebar .navlabel').forEach(el=>{if(el.textContent.trim()==='WORKSPACE')el.textContent='HOME'});
  const replacements=[
    ['Operations workspace','Operations'],
    ['workspace','application'],
    ['Workspace','Application'],
    ['Workspace settings','Application settings'],
    ['Workspace members','Application users'],
    ['Workspace name','Application name'],
    ['Workspace preferences','Application preferences'],
    ['Workspace  /  Manufacturing operations','Manufacturing operations']
  ];
  const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
  const nodes=[];let node;while(node=walker.nextNode())nodes.push(node);
  nodes.forEach(n=>{let value=n.nodeValue;replacements.forEach(([from,to])=>{value=value.replaceAll(from,to)});value=value.replaceAll('OPERATIONS WORKSPACE','OPERATIONS').replaceAll('WORKSPACE','').replace(/\s{2,}/g,' ').trim();if(value!==n.nodeValue)n.nodeValue=value});
  const avatar=document.querySelector('.avatar');if(avatar)avatar.textContent='HO';
}
audit=function(t){state.audit.unshift([new Date().toLocaleTimeString(),'Herpreet Oberoi',t,'Prototype']);save()};
cleanDemoBranding();
window.addEventListener('hashchange',()=>setTimeout(cleanDemoBranding,0));
