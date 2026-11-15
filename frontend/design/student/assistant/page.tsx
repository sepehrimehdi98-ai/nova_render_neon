import {Paperclip,X,BookOpen,ChevronDown} from 'lucide-react';
import AiMessage from '../../AiMessage';
import {Copy,RotateCcw} from 'lucide-react';
import './assistant-polish.css';
import ChatPurpose from '../../ChatPurpose';
import {api,type Row} from '../../../src/live/api';
import {consult,extractFromFiles} from '../../consult';
'use client'

import Link from '../navigation'
import { useEffect, useRef, useState } from 'react'
import { Icon } from '../nova-ui'

type Message = {
  role: 'user' | 'bot'
  text: string
  code?: string
  lesson?: boolean
  error?: boolean
  context?: string
}

const starters = [
  { icon: 'code' as const, title: 'توضیح یک مفهوم', text: 'حلقه for را خیلی ساده توضیح بده' },
  { icon: 'quiz' as const, title: 'ساخت تمرین', text: 'یک تمرین درباره لیست‌ها برام بساز' },
  { icon: 'spark' as const, title: 'رفع اشکال کد', text: 'کمکم کن خطای کد پایتونم را پیدا کنم' },
  { icon: 'book' as const, title: 'مرور درس', text: 'درس امروز را در سه نکته خلاصه کن' },
]

export default function AssistantPage() {
  const [input, setInput] = useState('')
  const [purpose,setPurpose]=useState('auto')
  const [documents,setDocuments]=useState<Row[]>([]),[uploading,setUploading]=useState(false),[uploadError,setUploadError]=useState('');const fileInput=useRef<HTMLInputElement>(null);

  const [messages, setMessages] = useState<Message[]>([])
  const [typing, setTyping] = useState(false)
  const [sidebar, setSidebar] = useState(false)
  const [mobile,setMobile]=useState(()=>typeof window!=='undefined'&&window.matchMedia('(max-width:1023px)').matches)
  useEffect(()=>{const media=window.matchMedia('(max-width:1023px)');const change=()=>setMobile(media.matches);media.addEventListener('change',change);const escape=(e:KeyboardEvent)=>{if(e.key==='Escape')setSidebar(false)};window.addEventListener('keydown',escape);return()=>{media.removeEventListener('change',change);window.removeEventListener('keydown',escape)}},[])
  const [userName,setUserName]=useState(''),[service,setService]=useState('loading'),[notice,setNotice]=useState('')
  const [courses,setCourses]=useState<Row[]>([]),[courseId,setCourseId]=useState(''),[lessons,setLessons]=useState<Row[]>([]),[lockedLessons,setLockedLessons]=useState<string[]>([]),[lessonId,setLessonId]=useState(''),[contextLoading,setContextLoading]=useState(true),[contextError,setContextError]=useState(''),[contextAttempt,setContextAttempt]=useState(0)
  useEffect(()=>{const c=new AbortController();api('/courses',undefined,c.signal).then(r=>{setCourses(r.courses);setCourseId(previous=>r.courses.some((x:Row)=>x.id===previous)?previous:r.courses[0]?.id||'');if(!r.courses.length)setContextLoading(false)}).catch(e=>{if(!c.signal.aborted){setContextError(e.message);setContextLoading(false)}});return()=>c.abort()},[contextAttempt])
  useEffect(()=>{setLessons([]);setLockedLessons([]);setLessonId('');if(!courseId)return;const c=new AbortController();setContextLoading(true);setContextError('');Promise.all([api('/courses/'+courseId,undefined,c.signal),api('/courses/'+courseId+'/structure',undefined,c.signal)]).then(([r,structure])=>{if(!c.signal.aborted){setLessons(r.lessons);setLockedLessons(structure.locked||[]);setLessonId(r.lessons.find((l:Row)=>!structure.locked?.includes(l.id))?.id||'');setContextLoading(false)}}).catch(e=>{if(!c.signal.aborted){setContextError(e.message);setContextLoading(false)}});return()=>c.abort()},[courseId,contextAttempt])
  useEffect(()=>{setDocuments([]);setUploadError('')},[courseId]);
  const inputRef=useRef<HTMLTextAreaElement>(null)
  useEffect(()=>{const c=new AbortController();api('/me',undefined,c.signal).then(r=>setUserName(r.user.name)).catch(()=>{});api('/capabilities',undefined,c.signal).then(r=>setService(r.ai?'online':'local')).catch(()=>{if(!c.signal.aborted)setService('unknown')});return()=>c.abort()},[])
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'nearest' })
  }, [messages, typing])

  function newChat() {
    if(typing)return
    setMessages([])
    setInput('')
    setSidebar(false)
    setNotice('')
    inputRef.current?.focus()
  }

  async function attach(file:File){if(!courseId)return;setUploadError('');if(file.size>1500000||!file.size){setUploadError('فایل باید بین ۱ بایت و ۱٫۵ مگابایت باشد.');return}if(!/\.(pdf|docx|txt|md)$/i.test(file.name)){setUploadError('فقط PDF متنی، DOCX، TXT و Markdown پذیرفته می‌شود.');return}if(documents.length>=6){setUploadError('حداکثر شش فایل برای هر پیام انتخاب کنید.');return}setUploading(true);const captured=courseId;try{const base64=await new Promise<string>((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(String(r.result).split(',')[1]);r.onerror=()=>reject(Error('خواندن فایل ممکن نشد.'));r.readAsDataURL(file)});const doc=await api('/courses/'+captured+'/documents',{file:{name:file.name,base64}});setDocuments(d=>[...d,{...doc,courseId:captured}])}catch(e){setUploadError((e as Error).message)}finally{setUploading(false)}}
  async function send(text = input) {
    if (!text.trim() || typing || uploading || contextLoading || !lessonId || !courseId) return
    const context=[courses.find(c=>c.id===courseId)?.title,lessons.find(l=>l.id===lessonId)?.title].filter(Boolean).concat(documents.filter(d=>d.courseId===courseId).map(d=>d.name)).join(' · ')
    setMessages((current) => [...current, { role: 'user', text: text.trim(),context }])
    setInput('')
    setTyping(true)
    try{
      const cap=['online','local'].includes(service)?{ai:service==='online'}:await api('/capabilities');setService(cap.ai?'online':'local');
      const answer=cap.ai?await consult(courseId,lessonId,text,'','',purpose,documents.filter(d=>d.courseId===courseId).map(d=>d.id)):documents.some(d=>d.courseId===courseId)?await extractFromFiles(courseId,lessonId,text,documents.filter(d=>d.courseId===courseId).map(d=>d.id)):'جست‌وجوی محلی · '+(lessons.find(l=>l.id===lessonId)?.title||'درس')+'\n'+(await api('/lessons/'+lessonId+'/local-chat',{question:text,purpose})).answer;
      setMessages(current=>[...current,{role:'bot',text:answer}]);
    }catch(e){setMessages(current=>[...current,{role:'bot',text:e instanceof Error?e.message:'پاسخ دریافت نشد؛ دوباره تلاش کنید.',error:true}])}
    finally{setTyping(false)}
  }

  return (
    <div className="student-conversation-layout flex h-dvh overflow-hidden bg-white text-[#233e2e]" dir="rtl">
      {sidebar && (
        <button
          aria-label="بستن منو"
          onClick={() => setSidebar(false)}
          className="fixed inset-0 z-40 bg-[#233e2e]/30 lg:hidden"
        />
      )}
      <aside
        id="student-ai-sidebar"
        aria-label="فهرست گفت‌وگو"
        aria-hidden={mobile&&!sidebar}
        inert={mobile&&!sidebar?true:undefined}
        className={`fixed inset-y-0 right-0 z-50 flex w-[280px] flex-col bg-[#f5f3f0] p-3 transition-transform lg:static lg:translate-x-0 ${sidebar ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex h-14 items-center justify-between px-2">
          <h2 className="student-chat-menu-title">گفت‌وگوهای شما</h2>
          <button
            onClick={() => setSidebar(false)}
            aria-label="بستن فهرست گفت‌وگو"
            className="grid size-9 place-items-center rounded-xl text-[#827b89] hover:bg-white lg:hidden"
          >
            <Icon name="close" className="size-5" />
          </button>
        </div>
        <button
          onClick={newChat}
          disabled={typing}
          className="mt-4 flex items-center gap-3 rounded-2xl border border-[#ded9d3] bg-white px-4 py-3.5 text-xs font-bold shadow-sm transition hover:border-[#6e9c76]"
        >
          <span className="grid size-7 place-items-center rounded-lg bg-[#1d704b] text-lg font-light text-white">
            +
          </span>
          گفت‌وگوی جدید

        </button>
        <div className="mt-5 flex-1 overflow-y-auto px-1">
          <h2 className="student-ai-history-heading">همین گفت‌وگو</h2>
          {messages.filter(m=>m.role==='user').length?messages.map((m,index)=>m.role==='user'?<a key={index} className="student-ai-history-link" href={'#student-ai-message-'+index} onClick={()=>setSidebar(false)}><Icon name="bot" className="size-4"/><span>{m.text}</span></a>:null):<p className="student-ai-history-empty">پس از ارسال پرسش، دسترسی به پیام‌های همین گفت‌وگو اینجا نمایش داده می‌شود.</p>}
          <p className="student-ai-history-empty">این فهرست تاریخچه ذخیره‌شده نیست؛ با شروع گفت‌وگوی جدید یا بارگذاری مجدد صفحه، نمای فعلی پاک می‌شود.</p>
        </div>
        <div className="border-t border-[#e2ddd7] pt-3">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-2xl p-2.5 transition hover:bg-white"
          >
            <span className="grid size-9 place-items-center rounded-xl bg-[#e4eedb] text-lg">
              <Icon name="user" className="size-5"/>
            </span>
            <span>
              <b className="block text-[10px]">{userName||'حساب من'}</b>
              <small className="text-[8px] text-[#99929e]">بازگشت به داشبورد</small>
            </span>
            <Icon name="arrow" className="mr-auto size-3 rotate-180 text-[#89818e]" />
          </Link>
        </div>
      </aside>

      <section className="relative flex min-w-0 flex-1 flex-col">
        <header className="flex h-[68px] shrink-0 items-center border-b border-[#eeeae5] px-4 md:px-6">
          <button
            onClick={() => setSidebar(true)}
            aria-label="باز کردن فهرست گفت‌وگو"
            aria-expanded={sidebar}
            aria-controls="student-ai-sidebar"
            className="ml-3 grid size-10 place-items-center rounded-xl hover:bg-[#f5f2ef] lg:hidden"
          >
            <Icon name="menu" className="size-5" />
          </button>
          <div className="flex items-center gap-2 rounded-xl px-2 py-2 text-sm font-black">
            دستیار نووا

          </div>
          <div className="mr-auto flex items-center gap-2">
            <span className="hidden items-center gap-1.5 text-[9px] text-[#918a96] sm:flex">
              <i className="size-1.5 rounded-full bg-[#5ac277]" />
              {typing?'در حال آماده‌سازی پاسخ':service==='online'?'پاسخ آنلاین':service==='local'?'جست‌وجو در درس':service==='unknown'?'وضعیت اتصال نامشخص':'بررسی سرویس…'}
            </span>
            <Link
              href="/"
              className="grid size-9 place-items-center rounded-xl border border-[#e7e2dd] text-[#77707e] hover:bg-[#f7f5f2]"
              aria-label="داشبورد"
            >
              <Icon name="close" className="size-4" />
            </Link>
          </div>
        </header>

        <details className="student-ai-context"><summary><BookOpen size={18}/><span>انتخاب دوره و درس</span><strong>{contextLoading?'در حال دریافت…':courses.find(c=>c.id===courseId)?.title||'دوره‌ای در دسترس نیست'}</strong><ChevronDown size={16}/></summary><div><div className="student-course-segments" role="group" aria-label="انتخاب دوره پرسش">{courses.map(c=><button type="button" key={c.id} aria-pressed={courseId===c.id} disabled={typing||uploading} onClick={()=>setCourseId(c.id)}>{c.title}</button>)}</div><label className="student-course-native">دوره<select aria-label="دوره پرسش دستیار" disabled={typing} value={courseId} onChange={e=>setCourseId(e.target.value)}>{!courses.length&&<option value="">دوره‌ای در دسترس نیست</option>}{courses.map(c=><option key={c.id} value={c.id}>{c.title}</option>)}</select></label><label>درس<select aria-label="درس پرسش دستیار" disabled={typing||contextLoading} value={lessonId} onChange={e=>setLessonId(e.target.value)}>{!lessons.length&&<option value="">درس منتشرشده‌ای در دسترس نیست</option>}{lessons.map(l=><option key={l.id} value={l.id} disabled={lockedLessons.includes(l.id)}>{l.title}{lockedLessons.includes(l.id)?' · نیازمند تکمیل پیش‌نیاز':''}</option>)}</select></label></div></details>
        {contextError&&<p className="student-ai-context-error" role="alert">{contextError}<button type="button" disabled={typing} onClick={()=>setContextAttempt(x=>x+1)}>تلاش دوباره</button></p>}
        {!contextLoading&&!contextError&&!lessonId&&<p className="student-ai-context-error">برای پرسش مرتبط با درس، یک درس منتشرشده با پیش‌نیاز تکمیل‌شده لازم است.</p>}
        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="mx-auto flex min-h-full max-w-[780px] flex-col justify-center px-5 py-16">
              <div className="mb-9 text-center">
                <span className="relative mx-auto grid size-16 place-items-center rounded-[22px] bg-[#1d704b] text-white shadow-[0_12px_35px_rgba(81,45,168,.22)]">
                  <Icon name="spark" className="size-8" />
                  <i className="absolute -left-1 -top-1 size-4 rounded-full border-4 border-white bg-[#b7f536]" />
                </span>
                <h1 className="mt-6 text-[24px] font-black md:text-[30px]">
                  سلام {userName?userName.split(' ')[0]:'دوست من'}، امروز چی یاد بگیریم؟
                </h1>
                <p className="mx-auto mt-2 max-w-md text-[11px] leading-6 text-[#8e8793]">
                  سؤال برنامه‌نویسی بپرس، کدت را برای رفع اشکال بفرست یا از من بخواه یک مفهوم را ساده
                  توضیح بدهم.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {starters.map((item) => (
                  <button
                    key={item.title}
                    onClick={() => send(item.text)}
                    disabled={typing||contextLoading||!lessonId}
                    className="student-ai-starter group rounded-[20px] border border-[#e7e2dd] bg-white p-4 text-right transition hover:-translate-y-0.5 hover:border-[#83aa86] hover:shadow-[0_10px_30px_rgba(49,37,69,.07)]"
                  >
                    <span className="mb-4 grid size-9 place-items-center rounded-xl bg-[#eaf2e4] text-[#30764c] transition group-hover:bg-[#1d704b] group-hover:text-white">
                      <Icon name={item.icon} className="size-4" />
                    </span>
                    <b className="block text-[11px]">{item.title}</b>
                    <span className="mt-1 block text-[9px] text-[#99929e]">{item.text}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="mx-auto w-full max-w-[820px] px-4 py-8 md:px-8">
              {messages.map((message, index) => (
                <div key={index} id={'student-ai-message-'+index} role={message.error?'alert':undefined} className={'student-ai-message mb-8 flex gap-3 md:gap-4 '+message.role+(message.error?' is-error':'')}>
                  <span
                    className={`grid size-8 shrink-0 place-items-center rounded-[11px] ${message.role === 'bot' ? 'bg-[#1d704b] text-white' : 'bg-[#e4eedb] text-lg'}`}
                  >
                    {message.role === 'bot' ? <Icon name="spark" className="size-4" /> : <Icon name="user" className="size-4"/>}
                  </span>
                  <div className="min-w-0 flex-1 pt-1">
                    <b className="mb-2 block text-[10px]">
                      {message.role === 'bot' ? 'دستیار نووا' : 'شما'}
                    </b>
                    {message.context&&<small className="student-ai-message-context">{message.context}</small>}
                    <AiMessage text={message.text}/>
                    {message.role==='bot'&&<div className="student-ai-response-actions"><button type="button" onClick={async()=>{try{await navigator.clipboard.writeText(message.text);setNotice('پاسخ کپی شد.')}catch{setNotice('کپی خودکار ممکن نیست؛ متن پاسخ را انتخاب کنید.')}}}><Copy size={14}/>کپی پاسخ</button>{message.error&&<button type="button" disabled={typing} onClick={()=>{setInput([...messages.slice(0,index)].reverse().find(m=>m.role==='user')?.text||'');inputRef.current?.focus()}}><RotateCcw size={14}/>ویرایش و ارسال دوباره</button>}</div>}
                  </div>
                </div>
              ))}
              {typing && (
                <div className="mb-8 flex gap-4" role="status" aria-label="دستیار در حال آماده‌سازی پاسخ است">
                  <span className="grid size-8 place-items-center rounded-[11px] bg-[#1d704b] text-white">
                    <Icon name="spark" className="size-4" />
                  </span>
                  <div className="flex items-center gap-1 pt-3">
                    <i className="typing-dot" />
                    <i className="typing-dot" />
                    <i className="typing-dot" />
                  </div>
                </div>
              )}
              <div ref={endRef} />
            </div>
          )}
        </div>

        <div className="shrink-0 bg-gradient-to-t from-white via-white to-white/0 px-4 pb-4 pt-4">
          <div className="mx-auto max-w-[780px]">
            <div className="rounded-[22px] border border-[#dcd6df] bg-white p-2 shadow-[0_12px_38px_rgba(41,30,58,.11)] focus-within:border-[#5b966b]">
              <div className="student-ai-files">{documents.filter(d=>d.courseId===courseId).map(d=><span key={d.id}>{d.name}<button type="button" aria-label={'حذف پیوست '+d.name} disabled={typing} onClick={()=>setDocuments(items=>items.filter(x=>x.id!==d.id))}><X size={13}/></button></span>)}</div>{uploadError&&<p role="alert">{uploadError}</p>}<input hidden ref={fileInput} type="file" accept=".pdf,.docx,.txt,.md" onChange={e=>{const file=e.target.files?.[0];e.target.value='';if(file)void attach(file)}}/>
              <ChatPurpose value={purpose} onChange={setPurpose} text={input} disabled={typing}/>
              <textarea
                ref={inputRef}
                aria-label="پیام دستیار"
                maxLength={4000}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
                    event.preventDefault()
                    send()
                  }
                }}
                rows={2}
                placeholder="پیام یا لینک مرجع را اینجا بنویس…"
                className="max-h-32 w-full resize-none bg-transparent px-3 py-2 text-xs leading-6 outline-none"
              />
              <div className="flex items-center justify-between px-1">
                <button type="button" className="student-attach" disabled={typing||uploading||contextLoading||!courseId} onClick={()=>fileInput.current?.click()}><Paperclip size={17}/>{uploading?'در حال بارگذاری…':'افزودن فایل'}</button>
                <button
                  aria-label="ارسال پیام دستیار"
                  onClick={() => send()}
                  disabled={!input.trim() || typing || uploading || contextLoading || !lessonId}
                  className="grid size-9 place-items-center rounded-[12px] bg-[#1d704b] text-white transition disabled:bg-[#ddd8e2]"
                >
                  <Icon name="send" className="size-4" />
                </button>
              </div>
            </div>
            {notice&&<p className="student-ai-action-notice" role="status">{notice}</p>}
            <p className="mt-2 text-center text-[8px] text-[#aaa4ae]">
              دستیار نووا ممکن است اشتباه کند؛ پاسخ‌های مهم را با محتوای درس بررسی کن.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
