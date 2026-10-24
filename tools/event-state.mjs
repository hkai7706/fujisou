export function japanDate(timestamp=Date.now()) {
  return new Date(timestamp+9*60*60*1000).toISOString().slice(0,10);
}

// Preserve page formatting while tracking nested event scopes. Script/style
// contents are opaque, so template strings cannot be mistaken for HTML tags.
export function renderEventState(html,date=japanDate()) {
  const stack=[];
  const voids=new Set(['area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr']);
  const tokens=/<!--[\s\S]*?-->|<(script|style)\b[^>]*>[\s\S]*?<\/\1>|<\/?([a-z][\w:-]*)\b(?:[^"'<>]|"[^"]*"|'[^']*')*>/gi;
  return html.replace(tokens,(tag,opaque,name)=>{
    if(opaque||!name)return tag;
    name=name.toLowerCase();
    if(tag.startsWith('</')){
      const index=stack.findLastIndex(item=>item.name===name);
      if(index>=0)stack.length=index;
      return tag;
    }
    const end=tag.match(/\bdata-event-end="(\d{4}-\d{2}-\d{2})"/)?.[1];
    const ended=end?date>end:stack.at(-1)?.ended;
    if(ended!==undefined){
      let hidden;
      if(/\bdata-event-active\b/.test(tag)||/\bdata-event-promotion\b/.test(tag))hidden=ended;
      if(/\bdata-event-closed\b/.test(tag))hidden=!ended;
      if(hidden!==undefined){
        tag=tag.replace(/\shidden(?:="[^"]*"|='[^']*')?(?=\s|\/?>)/gi,'');
        if(hidden)tag=tag.replace(/(\/?>)$/,' hidden$1');
      }
    }
    if(!voids.has(name)&&!tag.endsWith('/>'))stack.push({name,ended});
    return tag;
  });
}
