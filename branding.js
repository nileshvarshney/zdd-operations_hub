/* Presentation branding for the customer demo. */
function cleanDemoBranding(){
  document.title='Zero · Operations Hub';
  const brand=document.querySelector('#sidebar .brand');
  if(brand){
    const mark=brand.querySelector('em');
    if(mark)mark.textContent='0';
    const name=brand.querySelector('div');
    if(name&&name.firstChild)name.firstChild.nodeValue='Zero';
    const subtitle=brand.querySelector('small');
    if(subtitle)subtitle.textContent='DIGITAL DEFECTS';
  }
  const workspaceCard=document.querySelector('#sidebar .workspace');
  if(workspaceCard)workspaceCard.remove();
  const crumb=document.querySelector('.crumb');
  if(crumb)crumb.innerHTML='Manufacturing operations';
  document.querySelectorAll('.eyebrow').forEach(el=>{el.textContent=el.textContent.replaceAll('OPERATIONS WORKSPACE','OPERATIONS').replaceAll('WORKSPACE','')});
  document.querySelectorAll('#sidebar .navlabel').forEach(el=>{if(el.textContent.trim()==='WORKSPACE')el.textContent='HOME'});
  const replacements=[
    ['ZDD OPERATIONS HUB','ZERO OPERATIONS HUB'],
    ['ZDD /','ZERO /'],
    ['INTERACTIVE PROTOTYPE','OPERATIONS CONTROL CENTER'],
    ['Demo mode','Operations mode'],
    ['Demo data','Sample records'],
    ['Prototype','Application'],
    ['prototype','application'],
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
audit=function(t){state.audit.unshift([new Date().toLocaleTimeString(),'Herpreet Oberoi',t,'Application']);save()};
cleanDemoBranding();
const zeroRender=render;
render=function(){zeroRender();cleanDemoBranding()};
window.addEventListener('hashchange',()=>setTimeout(cleanDemoBranding,0));
