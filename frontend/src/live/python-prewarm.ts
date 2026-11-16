// One automatic runtime per page; other code boxes warm only on deliberate interaction.
let automaticOwner:symbol|null=null;
export function observePythonWarmup(element:Element,warm:()=>void){
 if(typeof IntersectionObserver==='undefined'||typeof navigator!=='undefined'&&(navigator as Navigator&{connection?:{saveData?:boolean}}).connection?.saveData)return ()=>{};
 const owner=Symbol('python-prewarm');let timer:ReturnType<typeof setTimeout>|undefined;
 const observer=new IntersectionObserver(entries=>{if(!entries.some(e=>e.isIntersecting))return;if(automaticOwner&&automaticOwner!==owner)return;automaticOwner=owner;observer.disconnect();timer=setTimeout(()=>{timer=undefined;try{warm()}catch{if(automaticOwner===owner)automaticOwner=null}},200)},{rootMargin:'120px'});observer.observe(element);
 return ()=>{observer.disconnect();if(timer!==undefined)clearTimeout(timer);if(automaticOwner===owner)automaticOwner=null};
}
