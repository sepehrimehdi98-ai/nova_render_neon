import {useId,useRef,useState,type FormEvent} from 'react';
import {MessageSquare,Pencil,Check,X} from 'lucide-react';
import './chat-history-list.css';
export type ChatThread={id:string;title:string};
export default function ChatHistoryList({threads,active,disabled=false,closeOnSelect=false,onSelect,onRename}:{threads:ChatThread[];active:string;disabled?:boolean;closeOnSelect?:boolean;onSelect:(id:string)=>void;onRename:(id:string,title:string)=>Promise<void>}){
 return <nav className="chat-history-list" aria-label="گفت‌وگوهای ذخیره‌شده">{threads.map(thread=><HistoryItem key={thread.id} thread={thread} active={active===thread.id} disabled={disabled} closeOnSelect={closeOnSelect} onSelect={onSelect} onRename={onRename}/>)}</nav>;
}
function HistoryItem({thread,active,disabled,closeOnSelect,onSelect,onRename}:{thread:ChatThread;active:boolean;disabled:boolean;closeOnSelect:boolean;onSelect:(id:string)=>void;onRename:(id:string,title:string)=>Promise<void>}){
 const [editing,setEditing]=useState(false),[draft,setDraft]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState(''),id=useId(),renameButton=useRef<HTMLButtonElement>(null);
 function close(){setEditing(false);setError('');requestAnimationFrame(()=>renameButton.current?.focus())}
 async function save(e:FormEvent){e.preventDefault();if(busy||disabled)return;setBusy(true);setError('');try{await onRename(thread.id,draft.trim());close()}catch(e){setError((e as Error).message)}finally{setBusy(false)}}
 return <article className={'chat-history-item'+(active?' is-active':'')}>
  <div className="history-item-row"><button className="history-select" type="button" aria-pressed={active} disabled={disabled||busy} data-close-drawer={closeOnSelect||undefined} onClick={()=>onSelect(thread.id)}><MessageSquare size={17} aria-hidden="true"/><span>{thread.title||'گفت‌وگوی جدید'}</span></button><button ref={renameButton} className="history-rename" type="button" aria-label={'تغییر نام گفتگو: '+(thread.title||'گفت‌وگوی جدید')} aria-expanded={editing} aria-controls={id} disabled={disabled||busy} onClick={()=>{if(editing){close();return}setDraft(thread.title);setError('');setEditing(true)}}><Pencil size={16} aria-hidden="true"/></button></div>
  {editing&&<form id={id} className="history-name-form" onSubmit={save} onKeyDown={e=>{if(e.key==='Escape'){e.preventDefault();e.stopPropagation();if(!busy)close()}}}><label htmlFor={id+'-name'}>نام گفتگو <small>اختیاری</small></label><div><input autoFocus id={id+'-name'} value={draft} maxLength={120} disabled={busy} onChange={e=>setDraft(e.target.value)} placeholder="مثلاً مرور پایتون"/><button className="history-save" type="submit" disabled={busy||disabled} aria-label="ذخیره نام گفتگو"><Check size={17}/></button><button type="button" disabled={busy} aria-label="انصراف از تغییر نام" onClick={close}><X size={17}/></button></div>{error&&<p role="alert">{error}</p>}</form>}
 </article>;
}
