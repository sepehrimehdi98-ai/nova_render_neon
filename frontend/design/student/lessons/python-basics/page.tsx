import {api} from '../../../../src/live/api';
'use client'

import { useEffect, useState } from 'react'
import Link from '../../navigation'
import { Icon } from '../../nova-ui'

export default function LessonPage() {
  const [code, setCode] = useState('for number in range(1, 6):\n    print(number)')
  const [output, setOutput] = useState('')
  const [answer, setAnswer] = useState<number | null>(null)
  const [note, setNote] = useState('')
  const [saved, setSaved] = useState(false)
  const [noteKey,setNoteKey]=useState('');
  const [revision,setRevision]=useState<number|null>(null);
  useEffect(() => {
    Promise.all([api('/me'),api('/sample-state/python-note')]).then(([{user},record])=>{
      const key='nova-sample-python-note:'+user.id;
      setRevision(record.revision);setNoteKey(key);setNote(localStorage.getItem(key)??record.value??'');
    }).catch(e=>alert(e.message))
  }, [])
  async function save() {
    if(!noteKey||revision===null)return;
    localStorage.setItem(noteKey, note)
    try{const record=await api('/sample-state/python-note',{revision,value:note});setRevision(record.revision)}catch(e){alert(String(e));return}
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }
  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_280px]">
      <article className="min-w-0">
        <div className="mb-5 flex items-center gap-2 text-[9px] text-[#98919e]">
          <Link href="/lessons">درس‌های من</Link>
          <Icon name="arrow" className="size-3" />
          <span>حلقه‌ها و تکرار</span>
        </div>
        <div className="rounded-[28px] border border-[#ebe7e2] bg-white p-6 md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-start">
            <span className="grid size-12 shrink-0 place-items-center rounded-[17px] bg-[#eee8ff] text-[#5d3ca5]">
              <Icon name="code" className="size-6" />
            </span>
            <div>
              <span className="text-[9px] font-bold text-[#6847b2]">فصل ۳ • درس ۱</span>
              <h1 className="mt-1 text-2xl font-black">آشنایی با حلقه for</h1>
              <p className="mt-2 text-[10px] text-[#9992a0]">
                <Icon name="clock" className="ml-1 inline size-3" />
                زمان مطالعه: ۱۲ دقیقه
              </p>
            </div>
          </div>
        </div>
        <section className="mt-4 rounded-[28px] border-r-4 border-r-[#ff7657] bg-white p-6 md:p-8">
          <span className="mb-5 inline-flex items-center gap-2 text-[10px] font-bold text-[#e06247]">
            <Icon name="video" className="size-4" />
            ویدیوی آموزشی
          </span>
          <div className="group relative grid aspect-video place-items-center overflow-hidden rounded-[20px] bg-[#251747]">
            <div className="absolute inset-0 opacity-30 [background:radial-gradient(circle_at_25%_30%,#805bd1,transparent_40%),radial-gradient(circle_at_75%_70%,#b7f536,transparent_30%)]" />
            <button className="relative grid size-16 place-items-center rounded-full bg-[#b7f536] text-[#2d185e] transition group-hover:scale-110">
              <Icon name="play" className="size-7 fill-current" />
            </button>
            <span className="absolute bottom-4 right-4 rounded-lg bg-black/50 px-2 py-1 text-[9px] text-white">
              ۰۸:۴۵
            </span>
          </div>
        </section>
        <section className="mt-4 rounded-[28px] border-r-4 border-r-[#6f4db7] bg-white p-6 md:p-8">
          <span className="inline-flex items-center gap-2 text-[10px] font-bold text-[#6544ad]">
            <Icon name="book" className="size-4" />
            نکته اصلی
          </span>
          <h2 className="mt-5 text-lg font-black">حلقه for چه کاری انجام می‌دهد؟</h2>
          <p className="mt-3 text-xs leading-8 text-[#68616f]">
            حلقه{' '}
            <code className="rounded bg-[#eee8ff] px-2 py-1 text-[#5d3ca5]" dir="ltr">
              for
            </code>{' '}
            به ما اجازه می‌دهد یک قطعه کد را برای هر عضو از یک مجموعه تکرار کنیم. این مجموعه می‌تواند
            لیست، رشته یا دنباله‌ای از اعداد باشد.
          </p>
          <div className="mt-5 rounded-2xl bg-[#f4f1f8] p-4 text-xs leading-7 text-[#574f60]">
            <b>مثال واقعی:</b> تصور کن می‌خواهی اسم تمام دانش‌آموزان کلاس را یک‌به‌یک چاپ کنی؛ حلقه for
            دقیقاً برای همین تکرار ساخته شده است.
          </div>
        </section>
        <section className="mt-4 overflow-hidden rounded-[28px] border-r-4 border-r-[#18a189] bg-[#172431] text-white">
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
            <span className="inline-flex items-center gap-2 text-[10px] font-bold text-[#74dec9]">
              <Icon name="code" className="size-4" />
              محیط تمرین کد
            </span>
            <button
              onClick={() => setOutput('1\\n2\\n3\\n4\\n5')}
              className="flex items-center gap-2 rounded-xl bg-[#b7f536] px-3 py-2 text-[9px] font-bold text-[#22320d]"
            >
              <Icon name="play" className="size-3 fill-current" />
              اجرای کد
            </button>
          </div>
          <textarea
            dir="ltr"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            spellCheck={false}
            className="h-36 w-full resize-none bg-[#172431] p-5 font-mono text-xs leading-7 text-[#d9e6e9] outline-none"
          />
          {output && (
            <pre className="border-t border-white/10 bg-[#101b25] p-5 text-xs leading-6 text-[#8ee3d1]">
              {output}
            </pre>
          )}
        </section>
        <section className="mt-4 rounded-[28px] border-r-4 border-r-[#e9ad30] bg-white p-6 md:p-8">
          <span className="inline-flex items-center gap-2 text-[10px] font-bold text-[#ca8c17]">
            <Icon name="quiz" className="size-4" />
            سنجش سریع
          </span>
          <h2 className="mt-5 text-base font-black">کدام گزینه اعداد ۰ تا ۴ را چاپ می‌کند؟</h2>
          <div className="mt-4 grid gap-2">
            {['for i in range(5):', 'for i in range(1, 5):', 'for i = 0 to 5:'].map((x, i) => (
              <button
                onClick={() => setAnswer(i)}
                key={x}
                dir="ltr"
                className={`rounded-2xl border p-4 text-left font-mono text-xs transition ${answer === i ? (i === 0 ? 'border-[#55b67b] bg-[#edf9f1] text-[#237044]' : 'border-[#ef8066] bg-[#fff0ed] text-[#a63e29]') : 'border-[#e9e4df] hover:border-[#9b85c8]'}`}
              >
                {x}
              </button>
            ))}
          </div>
          {answer !== null && (
            <p
              className={`mt-3 text-[10px] font-bold ${answer === 0 ? 'text-[#278154]' : 'text-[#d15b42]'}`}
            >
              {answer === 0
                ? 'آفرین! پاسخ درست است.'
                : 'دوباره فکر کن؛ range(1, 5) از عدد ۱ شروع می‌شود.'}
            </p>
          )}
        </section>
      </article>
      <aside className="space-y-4">
        <div className="sticky top-24 space-y-4">
          <div className="rounded-[24px] bg-[#eee8ff] p-5">
            <span className="grid size-10 place-items-center rounded-[14px] bg-[#512DA8] text-white">
              <Icon name="bot" className="size-5" />
            </span>
            <h3 className="mt-4 text-sm font-black">سؤالی داری؟</h3>
            <p className="mt-2 text-[10px] leading-6 text-[#756888]">
              دستیار نوا محتوای همین درس را می‌شناسد و می‌تواند با مثال بیشتر توضیح دهد.
            </p>
            <Link
              href="/assistant"
              className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-white py-3 text-[10px] font-bold text-[#54349b]"
            >
              پرسش از دستیار
              <Icon name="arrow" className="size-3 rotate-180" />
            </Link>
          </div>
          <div className="rounded-[24px] border border-[#ebe7e2] bg-white p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black">یادداشت من</h3>
              <Icon name="edit" className="size-4 text-[#8c8592]" />
            </div>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="mt-4 h-32 w-full resize-none rounded-2xl bg-[#f8f6f3] p-3 text-[10px] leading-6 outline-none focus:ring-1 focus:ring-[#7453b9]"
              placeholder="نکته‌های مهم این درس..."
            />
            <button
              onClick={save}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-[#2d185e] py-3 text-[10px] font-bold text-white"
            >
              <Icon name={saved ? 'check' : 'save'} className="size-3" />
              {saved ? 'ذخیره شد' : 'ذخیره یادداشت'}
            </button>
          </div>
        </div>
      </aside>
    </div>
  )
}
