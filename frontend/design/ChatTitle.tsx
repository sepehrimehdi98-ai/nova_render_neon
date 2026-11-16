import {useId,useState} from 'react';
import {Pencil,Check,X} from 'lucide-react';
import './chat-title.css';
export default function ChatTitle({title='',disabled=false,onSave}:{title?:string;disabled?:boolean;onSave:(title:string)=>Promise<void>}){
 const [editing,setEditing]=useState(false),[draft,setDraft]=useState(title),[busy,setBusy]=useState(false),[error,setError]=useState('');const id=useId();
 async function save(e:React.FormEvent){e.preventDefault();setBusy(true);setError('');try{await onSave(draft.trim());setEditing(false)}catch(e){setError((e as Error).message)}finally{setBusy(false)}}
 return <div className="chat-title-control">{editing?<form onSubmit={save}><label htmlFor={id}>نام دلخواه گفتگو <small>اختیاری</small></label><div><input autoFocus id={id} value={draft} maxLength={120} onChange={e=>setDraft(e.target.value)} placeholder="مثلاً مرور متغیرها" disabled={busy}/><button type="submit" disabled={busy||disabled} aria-label="ذخیره نام گفتگو"><Check size={18}/></button><button type="button" disabled={busy} aria-label="انصراف از تغییر نام" onClick={()=>setEditing(false)}><X size={18}/></button></div></form>:<><span title={title}>{title||'گفت‌وگوی جدید'}</span><button type="button" disabled={disabled} onClick={()=>{setDraft(title);setError('');setEditing(true)}} aria-label="نام‌گذاری گفتگو"><Pencil size={16}/><span>نام‌گذاری</span></button></>}{error&&<p role="alert">{error}</p>}</div>
}
