/* Source architecture additions inferred from the FSB event-backbone role. */
if(!systems.some(s=>s[0].startsWith('TIBCO'))){
  systems.push(['TIBCO / Event middleware','Event integration and live message routing','Live','5 sec','FSB event transport and subscriptions']);
  render();
}
