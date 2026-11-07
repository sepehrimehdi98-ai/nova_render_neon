import {useEffect,useState} from 'react';
import {api,type Row} from '../../../src/live/api';
import Link from '../navigation'
import { Icon, PageTitle, ProgressRing } from '../nova-ui'

const chapters = [
  {
    n: '۰۱',
    title: 'شروع ماجراجویی با پایتون',
    meta: '۴ درس • ۵۵ دقیقه',
    done: true,
    lessons: ['پایتون چیست؟', 'نصب و راه‌اندازی', 'اولین برنامه من', 'متغیرها و انواع داده'],
  },
  {
    n: '۰۲',
    title: 'تصمیم‌گیری در برنامه',
    meta: '۵ درس • ۱ ساعت و ۲۰ دقیقه',
    done: true,
    lessons: ['عملگرهای مقایسه', 'دستور شرطی if', 'شرط‌های چندگانه'],
  },
  {
    n: '۰۳',
    title: 'حلقه‌ها و تکرار',
    meta: '۶ درس • ۱ ساعت و ۴۵ دقیقه',
    active: true,
    lessons: ['آشنایی با حلقه for', 'تابع range', 'حلقه while', 'حلقه‌های تو در تو'],
  },
  {
    n: '۰۴',
    title: 'ساختمان داده‌ها',
    meta: '۷ درس • ۲ ساعت',
    lessons: ['لیست‌ها', 'تاپل‌ها', 'دیکشنری‌ها'],
  },
]

export default function LessonsPage() {
 const [lessons,setLessons]=useState<Row[]>([]),[error,setError]=useState('');
 useEffect(()=>{(async()=>{const {courses}=await api('/courses');const results=await Promise.all(courses.map((c:Row)=>api('/courses/'+c.id)));setLessons(results.flatMap(r=>r.lessons))})().catch(e=>setError(e.message))},[]);

  return (
    <>
      <PageTitle title="درس‌های من" subtitle="مسیر پایتون را قدم‌به‌قدم و با پروژه‌های واقعی پیش ببر" />
      <div className="rounded-[30px] bg-[#2d185e] p-6 text-white md:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center">
          <span className="grid size-20 shrink-0 place-items-center rounded-[24px] bg-[#b7f536] text-3xl font-black text-[#2d185e]">
            Py
          </span>
          <div className="flex-1">
            <span className="text-[10px] text-[#bbaedd]">مسیر آموزشی فعال</span>
            <h2 className="mt-1 text-2xl font-black">پایتون از صفر تا ساخت پروژه</h2>
            <p className="mt-2 text-[11px] text-[#c9bde2]">
              ۱۲ فصل • ۶۸ درس • سطح مقدماتی تا متوسط
            </p>
            <div className="mt-5 h-2 max-w-xl rounded-full bg-white/15">
              <div className="h-full w-[43%] rounded-full bg-[#b7f536]" />
            </div>
          </div>
          <div className="text-center">
            <ProgressRing value={43} size={86} color="#b7f536" />
            <small className="text-[9px] text-[#bbaedd]">پیشرفت کل</small>
          </div>
        </div>
      </div>
      <div className="mt-7 grid gap-6 lg:grid-cols-[1fr_300px]">
        <div className="space-y-3">
          {error&&<p role="alert">{error}</p>}{lessons.map(l=><a className="block rounded-xl bg-white p-4" key={l.id} href={"/lessons/view?id="+l.id}>{l.title}</a>)}{chapters.map((c, i) => (
            <div
              key={c.n}
              className={`rounded-[24px] border bg-white p-5 ${c.active ? 'border-[#7453b9] shadow-[0_10px_28px_rgba(81,45,168,.08)]' : 'border-[#ebe7e2]'}`}
            >
              <div className="flex items-center gap-4">
                <span
                  className={`grid size-11 shrink-0 place-items-center rounded-2xl text-xs font-black ${c.done ? 'bg-[#e8f7cd] text-[#60851d]' : c.active ? 'bg-[#512DA8] text-white' : 'bg-[#f2eff4] text-[#aaa4af]'}`}
                >
                  {c.done ? <Icon name="check" className="size-5" /> : c.n}
                </span>
                <div className="flex-1">
                  <h3 className="text-sm font-black">{c.title}</h3>
                  <p className="mt-1 text-[9px] text-[#a09aa6]">{c.meta}</p>
                </div>
                {c.active && (
                  <span className="rounded-full bg-[#eee8ff] px-3 py-1.5 text-[9px] font-bold text-[#6342ad]">
                    در حال یادگیری
                  </span>
                )}
              </div>
              {(c.active || i === 0) && (
                <div className="mr-[60px] mt-5 space-y-2 border-r border-[#e8e3eb] pr-5">
                  {c.lessons.map((l, j) => (
                    <Link
                      href="/lessons/python-basics"
                      key={l}
                      className="flex items-center gap-3 rounded-xl p-2 text-[10px] transition hover:bg-[#f7f4fa]"
                    >
                      <span
                        className={`grid size-7 place-items-center rounded-lg ${i === 0 || j === 0 ? 'bg-[#e9f7ce] text-[#648724]' : 'bg-[#f1eef3] text-[#9993a0]'}`}
                      >
                        {i === 0 || j === 0 ? (
                          <Icon name="check" className="size-3" />
                        ) : (
                          <Icon name={j % 2 ? 'code' : 'video'} className="size-3" />
                        )}
                      </span>
                      <span className="font-semibold">{l}</span>
                      <span className="mr-auto text-[8px] text-[#aaa4ae]">{8 + j * 2} دقیقه</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
        <aside>
          <div className="sticky top-24 rounded-[26px] border border-[#ebe7e2] bg-white p-5">
            <span className="grid size-11 place-items-center rounded-2xl bg-[#fff0e9] text-[#e06347]">
              <Icon name="calendar" className="size-5" />
            </span>
            <h3 className="mt-4 text-sm font-black">برنامه پیشنهادی</h3>
            <p className="mt-2 text-[10px] leading-6 text-[#88818f]">
              با هفته‌ای ۴ جلسه، این مسیر را تا ۸ هفته دیگر به پایان می‌رسانی.
            </p>
            <div className="mt-5 space-y-3">
              {['شنبه • درس و ویدیو', 'دوشنبه • تمرین کدنویسی', 'چهارشنبه • کوییز'].map((x) => (
                <div key={x} className="flex items-center gap-2 text-[9px]">
                  <i className="size-2 rounded-full bg-[#b7f536]" />
                  {x}
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </>
  )
}
