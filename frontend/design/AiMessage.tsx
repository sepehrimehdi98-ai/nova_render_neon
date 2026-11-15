import {useState} from 'react';
import {Copy,Check} from 'lucide-react';
import './ai-message.css';
export default function AiMessage({text}:{text:string}){
 const [copied,setCopied]=useState<number|null>(null),[error,setError]=useState('');
 return <div className="ai-message-content">{text.split(/(```[\s\S]*?```)/g).filter(Boolean).map((part,i)=>{if(!part.startsWith('```'))return <p className="ai-message-paragraph" dir="auto" key={i}>{part}</p>;const inner=part.slice(3,-3),newline=inner.indexOf('\n'),candidate=newline>=0?inner.slice(0,newline).trim():'',hasLanguage=/^[a-zA-Z0-9_+#.-]{1,24}$/.test(candidate),language=hasLanguage?candidate:'code',code=hasLanguage?inner.slice(newline+1):inner.replace(/^\n/,'');return <section className="ai-message-code" key={i} aria-label={'نمونه کد '+language}><header><span dir="ltr">{language}</span><button type="button" aria-label="کپی نمونه کد" onClick={async()=>{try{await navigator.clipboard.writeText(code);setCopied(i);setError('')}catch{setError('کپی خودکار ممکن نیست؛ متن کد را انتخاب و کپی کنید.')}}}>{copied===i?<Check size={15}/>:<Copy size={15}/>} {copied===i?'کپی شد':'کپی کد'}</button></header><pre dir="ltr" tabIndex={0}><code>{code}</code></pre><small>کد پیشنهادی است؛ پیش از استفاده آن را بررسی کنید.</small></section>})}{error&&<p className="ai-copy-error" role="status">{error}</p>}</div>;
}
