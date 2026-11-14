import ChatPurpose from '../../ChatPurpose';
import {api} from '../../../src/live/api';
import {consult} from '../../consult';
'use client'

import Link from '../navigation'
import { useEffect, useRef, useState } from 'react'
import { Icon, Logo } from '../nova-ui'

type Message = {
  role: 'user' | 'bot'
  text: string
  code?: string
  lesson?: boolean
}

const starters = [
  { icon: 'code' as const, title: 'توضیح یک مفهوم', text: 'حلقه for را خیلی ساده توضیح بده' },
  { icon: 'quiz' as const, title: 'ساخت تمرین', text: 'یک تمرین درباره لیست‌ها برام بساز' },
  { icon: 'spark' as const, title: 'رفع اشکال کد', text: 'کمکم کن خطای کد پایتونم را پیدا کنم' },
  { icon: 'book' as const, title: 'مرور درس', text: 'درس امروز را در سه نکته خلاصه کن' },
]

const conversations = [
  { group: 'امروز', items: ['حلقه‌های تو در تو', 'ساخت ماشین حساب پایتون'] },
  { group: '۷ روز گذشته', items: ['تفاوت لیست و تاپل', 'رفع خطای SyntaxError', 'تمرین شرط‌ها'] },
]

function getAnswer(question: string): Message {
  if (question.includes('لیست')) {
    return {
      role: 'bot',
      text: 'حتماً! یک لیست از نمره‌های پنج دانش‌آموز بساز و با استفاده از حلقه، میانگین آن‌ها را محاسبه کن. اگر میانگین بیشتر از ۱۸ بود، پیام «عالی» را چاپ کن.',
      code: 'scores = [18, 16, 20, 19, 17]\n# کد خودت را از اینجا بنویس',
    }
  }
  if (question.includes('خطا')) {
    return {
      role: 'bot',
      text: 'کدت را اینجا بفرست تا خط‌به‌خط بررسی کنیم. معمولاً خطاهای پایتون از تورفتگی، جا افتادن دونقطه یا بسته نشدن پرانتزها ایجاد می‌شوند.',
    }
  }
  if (question.includes('خلاصه')) {
    return {
      role: 'bot',
      text: 'خلاصه درس امروز: ۱) حلقه for برای تکرار روی اعضای یک مجموعه است. ۲) range دنباله‌ای از اعداد می‌سازد. ۳) با break می‌توانیم حلقه را زودتر متوقف کنیم.',
      lesson: true,
    }
  }
  return {
    role: 'bot',
    text: 'حلقه for مثل این است که به پایتون بگویی: «برای هر عضو این مجموعه، یک کار مشخص را انجام بده». مثلاً برای چاپ اعداد ۱ تا ۵ می‌توانیم از کد زیر استفاده کنیم:',
    code: 'for number in range(1, 6):\n    print(number)',
    lesson: true,
  }
}

export default function AssistantPage() {
  const [input, setInput] = useState('')
  const [purpose,setPurpose]=useState('auto')
  const [messages, setMessages] = useState<Message[]>([])
  const [typing, setTyping] = useState(false)
  const [sidebar, setSidebar] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typing])

  function newChat() {
    setMessages([])
    setInput('')
    setSidebar(false)
  }

  async function send(text = input) {
    if (!text.trim() || typing) return
    setMessages((current) => [...current, { role: 'user', text: text.trim() }])
    setInput('')
    setTyping(true)
    try{
      const {courses}=await api('/courses');
      let answer='برای مشاوره ابتدا یک درس منتشرشده لازم است.';
      for(const course of courses){
        const {lessons}=await api('/courses/'+course.id);
        if(!lessons.length)continue;
        const lesson=lessons[0],cap=await api('/capabilities');
        answer=cap.ai?await consult(course.id,lesson.id,text,'','',purpose):'جست‌وجوی محلی · '+lesson.title+'\n'+(await api('/lessons/'+lesson.id+'/local-chat',{question:text,purpose})).answer;
        break;
      }
      setMessages(current=>[...current,{role:'bot',text:answer}]);
    }catch(e){setMessages(current=>[...current,{role:'bot',text:String(e)}])}
    finally{setTyping(false)}
  }

  return (
    <div className="student-conversation-layout flex h-dvh overflow-hidden bg-white text-[#211a37]" dir="rtl">
      {sidebar && (
        <button
          aria-label="بستن منو"
          onClick={() => setSidebar(false)}
          className="fixed inset-0 z-40 bg-[#211a37]/30 lg:hidden"
        />
      )}
      <aside
        className={`fixed inset-y-0 right-0 z-50 flex w-[280px] flex-col bg-[#f5f3f0] p-3 transition-transform lg:static lg:translate-x-0 ${sidebar ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex h-14 items-center justify-between px-2">
          <Logo />
          <button
            onClick={() => setSidebar(false)}
            className="grid size-9 place-items-center rounded-xl text-[#827b89] hover:bg-white lg:hidden"
          >
            <Icon name="close" className="size-5" />
          </button>
        </div>
        <button
          onClick={newChat}
          className="mt-4 flex items-center gap-3 rounded-2xl border border-[#ded9d3] bg-white px-4 py-3.5 text-xs font-bold shadow-sm transition hover:border-[#7254b6]"
        >
          <span className="grid size-7 place-items-center rounded-lg bg-[#512DA8] text-lg font-light text-white">
            +
          </span>
          گفت‌وگوی جدید
          <span className="mr-auto rounded-md border border-[#e4dfda] px-1.5 py-0.5 text-[8px] text-[#aaa3ad]">
            Ctrl K
          </span>
        </button>
        <div className="mt-5 flex-1 overflow-y-auto px-1">
          {conversations.map((group) => (
            <div key={group.group} className="mb-5">
              <p className="mb-2 px-3 text-[9px] font-bold text-[#aaa3ad]">{group.group}</p>
              {group.items.map((item, index) => (
                <button
                  key={item}
                  className={`group mb-1 flex w-full items-center gap-2 rounded-xl px-3 py-3 text-right text-[10px] transition ${index === 0 && group.group === 'امروز' ? 'bg-white font-bold shadow-sm' : 'text-[#67616c] hover:bg-white/70'}`}
                >
                  <Icon name="bot" className="size-3.5 text-[#8c8493]" />
                  <span className="truncate">{item}</span>
                  <span className="mr-auto hidden tracking-[2px] text-[#a29ba7] group-hover:block">
                    •••
                  </span>
                </button>
              ))}
            </div>
          ))}
        </div>
        <div className="border-t border-[#e2ddd7] pt-3">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-2xl p-2.5 transition hover:bg-white"
          >
            <span className="grid size-9 place-items-center rounded-xl bg-[#e6ddf8] text-lg">
              👨🏻‍💻
            </span>
            <span>
              <b className="block text-[10px]">آرین محمدی</b>
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
            className="ml-3 grid size-10 place-items-center rounded-xl hover:bg-[#f5f2ef] lg:hidden"
          >
            <Icon name="menu" className="size-5" />
          </button>
          <button className="flex items-center gap-2 rounded-xl px-2 py-2 text-sm font-black hover:bg-[#f7f5f2]">
            دستیار نووا
            <span className="rounded-md bg-[#eef8dc] px-2 py-1 text-[8px] font-bold text-[#638421]">
              آموزشی
            </span>
          </button>
          <div className="mr-auto flex items-center gap-2">
            <span className="hidden items-center gap-1.5 text-[9px] text-[#918a96] sm:flex">
              <i className="size-1.5 rounded-full bg-[#5ac277]" />
              آماده پاسخ‌گویی
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

        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="mx-auto flex min-h-full max-w-[780px] flex-col justify-center px-5 py-16">
              <div className="mb-9 text-center">
                <span className="relative mx-auto grid size-16 place-items-center rounded-[22px] bg-[#512DA8] text-white shadow-[0_12px_35px_rgba(81,45,168,.22)]">
                  <Icon name="spark" className="size-8" />
                  <i className="absolute -left-1 -top-1 size-4 rounded-full border-4 border-white bg-[#b7f536]" />
                </span>
                <h1 className="mt-6 text-[24px] font-black md:text-[30px]">
                  سلام آرین، امروز چی یاد بگیریم؟
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
                    className="group rounded-[20px] border border-[#e7e2dd] bg-white p-4 text-right transition hover:-translate-y-0.5 hover:border-[#9b84cb] hover:shadow-[0_10px_30px_rgba(49,37,69,.07)]"
                  >
                    <span className="mb-4 grid size-9 place-items-center rounded-xl bg-[#f0ebf9] text-[#6040a8] transition group-hover:bg-[#512DA8] group-hover:text-white">
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
                <div key={index} className="mb-8 flex gap-3 md:gap-4">
                  <span
                    className={`grid size-8 shrink-0 place-items-center rounded-[11px] ${message.role === 'bot' ? 'bg-[#512DA8] text-white' : 'bg-[#e8e1f5] text-lg'}`}
                  >
                    {message.role === 'bot' ? <Icon name="spark" className="size-4" /> : '👨🏻‍💻'}
                  </span>
                  <div className="min-w-0 flex-1 pt-1">
                    <b className="mb-2 block text-[10px]">
                      {message.role === 'bot' ? 'دستیار نووا' : 'شما'}
                    </b>
                    <p dir="auto" className="whitespace-pre-wrap text-xs leading-8 text-[#504957]">{message.text}</p>
                    {message.code && (
                      <div className="mt-4 overflow-hidden rounded-[16px] bg-[#172431]" dir="ltr">
                        <div className="flex items-center justify-between border-b border-white/10 px-4 py-2.5 text-[9px] text-[#9fb1bd]">
                          <span>python</span>
                          <button className="flex items-center gap-1.5 hover:text-white">
                            <Icon name="save" className="size-3" />
                            کپی کد
                          </button>
                        </div>
                        <pre className="overflow-x-auto p-4 font-mono text-[11px] leading-6 text-[#d7e8e7]">
                          <code>{message.code}</code>
                        </pre>
                      </div>
                    )}
                    {message.lesson && (
                      <Link
                        href="/lessons/python-basics"
                        className="mt-4 flex items-center gap-3 rounded-[17px] border border-[#ded7e8] bg-[#f6f2fb] p-3 text-[#533399] transition hover:border-[#8f74c6]"
                      >
                        <span className="grid size-10 place-items-center rounded-xl bg-white">
                          <Icon name="book" className="size-4" />
                        </span>
                        <span>
                          <b className="block text-[10px]">مطالعه درس حلقه‌های پایتون</b>
                          <small className="text-[8px] text-[#9083a8]">فصل سوم • ۱۲ دقیقه</small>
                        </span>
                        <Icon name="arrow" className="mr-auto size-3 rotate-180" />
                      </Link>
                    )}
                    {message.role === 'bot' && (
                      <div className="mt-3 flex gap-1 text-[#948d99]">
                        {['check', 'edit'].map((name) => (
                          <button
                            key={name}
                            className="grid size-7 place-items-center rounded-lg hover:bg-[#f3f0ed]"
                          >
                            <Icon name={name as 'check'} className="size-3" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {typing && (
                <div className="mb-8 flex gap-4">
                  <span className="grid size-8 place-items-center rounded-[11px] bg-[#512DA8] text-white">
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
            <div className="rounded-[22px] border border-[#dcd6df] bg-white p-2 shadow-[0_12px_38px_rgba(41,30,58,.11)] focus-within:border-[#8065bb]">
              <ChatPurpose value={purpose} onChange={setPurpose} text={input} disabled={typing}/>
              <textarea
                aria-label="پیام دستیار"
                maxLength={4000}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault()
                    send()
                  }
                }}
                rows={2}
                placeholder="پیام یا لینک مرجع را اینجا بنویس…"
                className="max-h-32 w-full resize-none bg-transparent px-3 py-2 text-xs leading-6 outline-none"
              />
              <div className="flex items-center justify-between px-1">
                <small className="text-[10px] text-[#77877e]">لینک را داخل پیام بنویسید</small>
                <button
                  aria-label="ارسال پیام دستیار"
                  onClick={() => send()}
                  disabled={!input.trim() || typing}
                  className="grid size-9 place-items-center rounded-[12px] bg-[#512DA8] text-white transition disabled:bg-[#ddd8e2]"
                >
                  <Icon name="send" className="size-4" />
                </button>
              </div>
            </div>
            <p className="mt-2 text-center text-[8px] text-[#aaa4ae]">
              دستیار نووا ممکن است اشتباه کند؛ پاسخ‌های مهم را با محتوای درس بررسی کن.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
