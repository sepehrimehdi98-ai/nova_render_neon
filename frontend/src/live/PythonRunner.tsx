import {useEffect,useRef,useState} from 'react';
import {Field} from './shared';
export function PythonRunner({initialCode,label='کد پایتون'}:{initialCode:string;label?:string}){
 const [code,setCode]=useState(initialCode),[stdin,setStdin]=useState(''),[output,setOutput]=useState(''),[busy,setBusy]=useState(false);const worker=useRef<Worker|null>(null),timer=useRef<ReturnType<typeof setTimeout>|null>(null);
 useEffect(()=>()=>{worker.current?.terminate();if(timer.current)clearTimeout(timer.current)},[]);
 function stop(){worker.current?.terminate();worker.current=null;if(timer.current)clearTimeout(timer.current);setBusy(false)}
 function run(){stop();setBusy(true);setOutput('در حال بارگذاری پایتون محلی…');const w=new Worker('/python-worker.js');worker.current=w;w.onmessage=e=>{setOutput(e.data.output||'(بدون خروجی)');stop()};w.onerror=()=>{setOutput('اجرای پایتون انجام نشد. دارایی‌های آفلاین را با npm run build آماده کنید.');stop()};timer.current=setTimeout(()=>{setOutput('زمان اجرا تمام شد. اجرای کد متوقف شد.');stop()},45000);w.postMessage({code,stdin});}
 return <div className="python-runner"><Field label={label}><textarea dir="ltr" spellCheck={false} rows={7} value={code} onChange={e=>setCode(e.target.value)}/></Field><Field label="ورودی استاندارد (برای input)"><textarea dir="ltr" rows={2} value={stdin} onChange={e=>setStdin(e.target.value)}/></Field><div className="actions"><button className="btn primary" disabled={busy} onClick={run}>{busy?'در حال اجرا…':'▶ اجرای پایتون'}</button>{busy&&<button className="btn secondary" onClick={()=>{stop();setOutput('اجرا متوقف شد.')}}>توقف</button>}<small>اجرای محلی در مرورگر · حداکثر ۴۵ ثانیه · خروجی تمرین، نمره نیست</small></div>{output&&<pre className="code-output" dir="ltr" aria-live="polite">{output}</pre>}</div>
}
