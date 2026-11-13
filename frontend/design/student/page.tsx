import StudentActivitySummary from './StudentActivitySummary';
import StudentHomeAdditions from './StudentHomeAdditions';
import {api} from '../../src/live/api';
'use client'

import Link from './navigation'
import { useEffect, useState, type PointerEvent } from 'react'
import { Icon, SectionHead } from './nova-ui'

export default function HomePage() {
  const [learning,setLearning]=useState<any>(null);useEffect(()=>{api('/profile/account').then(r=>setLearning(r.learning)).catch(()=>{})},[]);
  const [userName,setUserName]=useState('');useEffect(()=>{api('/me').then(r=>setUserName(r.user.name.split(' ')[0])).catch(()=>{})},[]);
  const [pointer, setPointer] = useState({ x: 70, y: 35 })
  const move = (e: PointerEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    setPointer({
      x: ((e.clientX - r.left) / r.width) * 100,
      y: ((e.clientY - r.top) / r.height) * 100,
    })
  }
  return (
    <>
      <section
        onPointerMove={move}
        className="hero-grid relative min-h-[310px] overflow-hidden rounded-[30px] bg-[#2d185e] p-7 text-white md:p-10"
      >
        <div className="pointer-glow" style={{ left: `${pointer.x}%`, top: `${pointer.y}%` }} />
        <div className="relative z-10 max-w-[570px]">
          <span className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-[10px] font-bold text-[#d9cafb]">
            <span className="size-1.5 rounded-full bg-[#b7f536] shadow-[0_0_10px_#b7f536]" />
            مسیر امروزت آماده‌ست
          </span>
          <h1 className="text-[29px] font-black leading-[1.5] md:text-[39px]">
            سلام {userName}، آماده‌ای کد بزنی؟
          </h1>
          <p className="mt-2 max-w-[460px] text-xs leading-7 text-[#c9bbe8]">
            امروز قراره حلقه‌های پایتون رو کامل کنی. فقط ۲۵ دقیقه تا رسیدن به هدف روزانه‌ات فاصله
            داری.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/lessons/python-basics"
              className="inline-flex items-center gap-2 rounded-2xl bg-[#b7f536] px-5 py-3 text-xs font-extrabold text-[#21183d] shadow-[0_8px_25px_rgba(183,245,54,.2)]"
            >
              ادامه یادگیری <Icon name="arrow" className="size-4 rotate-180" />
            </Link>
            <span className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-[11px] text-[#d9d0ea]">
              <Icon name="clock" className="size-4" />
              ۲۵ دقیقه تا هدف
            </span>
          </div>
        </div>
        <div className="absolute left-8 top-8 hidden h-[245px] w-[330px] md:block">
          <div
            className="code-window float-slow absolute left-0 top-8 w-[260px] rounded-2xl border border-white/10 bg-[#1d123a]/90 p-4 font-mono text-[11px] leading-6 shadow-2xl"
            dir="ltr"
          >
            <div className="mb-3 flex gap-1.5">
              <i className="size-2 rounded-full bg-[#ff7657]" />
              <i className="size-2 rounded-full bg-[#f5ca4b]" />
              <i className="size-2 rounded-full bg-[#68d391]" />
            </div>
            <p>
              <span className="text-[#d08cff]">for</span>{' '}
              <span className="text-[#8de6d4]">dream</span>{' '}
              <span className="text-[#d08cff]">in</span> goals:
            </p>
            <p className="pl-5">
              <span className="text-[#ffcb6b]">learn</span>(
              <span className="text-[#b7f536]">&quot;Python&quot;</span>)
            </p>
            <p className="pl-5 text-[#81749c]"># keep going!</p>
          </div>
          <div className="float-fast absolute bottom-0 right-0 grid size-20 place-items-center rounded-[25px] bg-[#b7f536] text-3xl font-black text-[#2d185e] shadow-[0_14px_35px_rgba(0,0,0,.25)]">
            Py
          </div>
          <span className="absolute right-4 top-0 rounded-xl bg-[#ff7657] px-3 py-2 font-mono text-xs shadow-lg">
            print()
          </span>
        </div>
      </section>

      <div className="mt-7 grid gap-7 xl:grid-cols-[1fr_340px]">
        <div>
          <StudentActivitySummary/>
        </div>
        <aside className="space-y-5">
          <div className="rounded-[26px] bg-[#e9f7c9] p-5">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold text-[#687545]">افتخار این هفته</span>
                <h3 className="mt-1 text-lg font-black">{learning?.streak>=7?'یادگیری پیوسته':'پیشرفت شخصی شما'}</h3>
              </div>
              <span className="grid size-14 place-items-center rounded-[20px] bg-[#b7f536] text-[#394514] shadow-[0_8px_22px_rgba(108,141,42,.18)]">
                <Icon name="trophy" className="size-7" />
              </span>
            </div>
            <p className="mt-4 text-[11px] leading-6 text-[#68705a]">
              {learning?`${learning.streak.toLocaleString('fa-IR')} روز زنجیره یادگیری · سطح ${learning.level.toLocaleString('fa-IR')} · ${learning.points.toLocaleString('fa-IR')} امتیاز`:'در حال دریافت پیشرفت شما…'}
            </p>
            <div className="mt-4 h-2 rounded-full bg-white/70">
              <div className="h-full rounded-full bg-[#6e9a21]" style={{width:(learning?.percent||0)+'%'}} />
            </div>
          </div>
          <div className="rounded-[26px] border border-[#ebe7e2] bg-white p-5">
            <SectionHead title="برنامه امروز" />
            {[
              ['۱۰:۳۰', 'تمرین حلقه For', 'code'],
              ['۱۶:۰۰', 'کوییز فصل سوم', 'quiz'],
              ['۱۸:۳۰', 'جلسه رفع اشکال', 'video'],
            ].map((a, i) => (
              <div
                key={a[0]}
                className={`flex items-center gap-3 py-3 ${i < 2 ? 'border-b border-[#f0ede9]' : ''}`}
              >
                <span className="grid size-9 place-items-center rounded-xl" style={{background:a[2]==='code'?'#e1f3e9':a[2]==='quiz'?'#eee4fa':'#fff0dd',color:a[2]==='code'?'#197954':a[2]==='quiz'?'#7443aa':'#b87627'}}>
                  <Icon name={a[2] as 'code'} className="size-4" />
                </span>
                <div className="flex-1">
                  <b className="block text-[11px]">{a[1]}</b>
                  <small className="text-[9px] text-[#aaa4af]">{a[0]}</small>
                </div>
                <span
                  className={`size-2 rounded-full ${i === 0 ? 'bg-[#b7f536]' : 'bg-[#e5e1e7]'}`}
                />
              </div>
            ))}
          </div>
        </aside>
      </div>
      <div className="mt-8"><StudentHomeAdditions/></div>
    </>
  )
}
