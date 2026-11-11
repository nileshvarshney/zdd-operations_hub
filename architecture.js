/* TIBCO: event messaging source that routes FSB lot and station events to ZDD. */
if(!systems.some(s=>s[0].startsWith('TIBCO'))){
  systems.push(['TIBCO','Event messaging middleware','Healthy','5 sec','FSB lot & station events routed to ZDD']);
  render();
}
