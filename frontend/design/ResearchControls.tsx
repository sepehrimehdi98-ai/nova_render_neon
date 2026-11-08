import {useState} from 'react';
import {api,type Row} from '../src/live/api';
export function WebTopic({value,onChange}:{value:string,onChange:(v:string)=>void}){
 return <label style={{display:'block',fontSize:12,padding:8}}>موضوع عمومی برای جست‌وجوی وب (اختیاری؛ بدون اطلاعات شخصی)
 <input aria-label="موضوع جست‌وجوی وب" maxLength={200} value={value} onChange={e=>onChange(e.target.value)} placeholder="مثلاً مستندات حلقه‌های پایتون" style={{display:'block',width:'100%',padding:8,border:'1px solid #ddd',borderRadius:8}}/>
 <small>جست‌وجو فقط در صورت فعال‌سازی توسط مدیر انجام می‌شود.</small></label>;
}
export function DocumentSources({course}:{course:string}){
 const [sources,setSources]=useState<Row[]>([]),[message,setMessage]=useState(''),[busy,setBusy]=useState(false);
 async function refresh(){if(!course)return;setSources((await api('/courses/'+course+'/ai/sources')).sources);}
 async function act(fn:()=>Promise<void>){setBusy(true);try{await fn();setMessage('ذخیره شد؛ وضعیت پردازش را تازه‌سازی کنید.');}catch(e){setMessage(String(e));}finally{setBusy(false);}}
 return <details style={{padding:10,border:'1px solid #ddd',borderRadius:10,margin:8}}><summary>منابع دانش درس</summary>
 <p>فایل TXT یا Markdown، حداکثر ۱۶۰۰۰ نویسه. پس از بررسی هوش مصنوعی، تأیید مدرس لازم است.</p>
 <input aria-label="افزودن سند" type="file" accept=".txt,.md" disabled={!course||busy} onChange={e=>{const file=e.target.files?.[0];e.target.value='';if(!file)return;void act(async()=>{if(file.size>64000)throw Error('فایل بزرگ است');const text=await file.text();await api('/courses/'+course+'/ai/sources',{title:file.name,document:{mime:file.name.endsWith('.md')?'text/markdown':'text/plain',text}});await refresh();});}}/>
 <button type="button" disabled={!course||busy} onClick={()=>void act(refresh)}>تازه‌سازی منابع</button>
 <p role="status">{message}</p>
 {sources.map(source=><div key={source.id} style={{padding:8,borderTop:'1px solid #ddd'}}><strong>{source.title}</strong> · {source.status}
 <details><summary>پیش‌نمایش سند</summary><pre style={{whiteSpace:'pre-wrap',maxHeight:160,overflow:'auto'}}>{source.body}</pre></details>
 {source.status==='reviewed'&&<><button type="button" disabled={busy} onClick={()=>void act(async()=>{await api('/courses/'+course+'/ai/approve',{sourceId:source.id,studentVisible:false});await refresh();})}>تأیید فقط برای مدرس</button><button type="button" disabled={busy} onClick={()=>void act(async()=>{await api('/courses/'+course+'/ai/approve',{sourceId:source.id,studentVisible:true});await refresh();})}>تأیید برای دانش‌آموزان هم</button></>}
 {source.status!=='revoked'&&<button type="button" disabled={busy} onClick={()=>void act(async()=>{await api('/courses/'+course+'/ai/revoke',{sourceId:source.id});await refresh();})}>حذف از بازیابی</button>}</div>)}
 </details>;
}
