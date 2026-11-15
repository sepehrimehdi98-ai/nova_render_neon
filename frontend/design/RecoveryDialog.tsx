import {useEffect,useRef,type ReactNode} from 'react';
import {createPortal} from 'react-dom';
import {X,ShieldCheck} from 'lucide-react';
import {PORTAL_ROLE} from '../src/live/api';
import './account-recovery.css';
export default function RecoveryDialog({open,title,onClose,children}:{open:boolean;title:string;onClose:()=>void;children:ReactNode}){
 const ref=useRef<HTMLDialogElement>(null),close=useRef(onClose);close.current=onClose;
 useEffect(()=>{if(!open)return;const previous=document.activeElement as HTMLElement|null,overflow=document.body.style.overflow;document.body.style.overflow='hidden';ref.current?.showModal();return()=>{ref.current?.close();document.body.style.overflow=overflow;previous?.focus()}},[open]);
 if(!open||typeof document==='undefined')return null;
 return createPortal(<dialog ref={ref} className="recovery-dialog" data-role={PORTAL_ROLE} dir="rtl" aria-label={title} onCancel={e=>{e.preventDefault();close.current()}}><header><span><ShieldCheck size={22}/>{title}</span><button type="button" aria-label="بستن بازیابی" onClick={()=>close.current()}><X size={20}/></button></header>{children}</dialog>,document.body);
}
