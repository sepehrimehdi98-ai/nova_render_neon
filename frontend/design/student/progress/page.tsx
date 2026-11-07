'use client'

import { useState } from 'react'
import { Icon, PageTitle } from '../nova-ui'

const tabs = ['حضور و غیاب', 'نتایج آزمون', 'حل تمرین', 'زمان یادگیری']
const datasets = [
  [68, 82, 76, 90, 86, 92, 88, 96],
  [52, 66, 61, 78, 72, 84, 81, 91],
  [40, 55, 70, 62, 78, 74, 89, 86],
  [60, 48, 75, 68, 88, 81, 94, 90],
]

export default function ProgressPage() {
  const [tab, setTab] = useState(0)
  const points = datasets[tab].map((v, i) => `${i * (100 / 7)},${100 - v}`).join(' ')
  return (
    <>
      <PageTitle
        title="مسیر پیشرفت"
        subtitle="روایت تصویری تلاش‌ها و رشد تو از اولین روز تا امروز"
        action={
          <button className="rounded-2xl border border-[#e4dfd9] bg-white px-4 py-3 text-[11px] font-bold">
            <Icon name="calendar" className="ml-2 inline size-4" />
            ۳۰ روز اخیر
          </button>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ['روز یادگیری مستمر', '۲۳ روز', '+ ۵ روز', 'spark', '#eee8ff', '#6845b8'],
          ['میانگین آزمون‌ها', '۸۷٪', '+ ۱۲٪', 'quiz', '#e7f8f2', '#118875'],
          ['تمرین حل‌شده', '۴۸ تمرین', '+ ۸ تمرین', 'code', '#fff0eb', '#e36245'],
          ['زمان یادگیری', '۳۲ ساعت', '+ ۶ ساعت', 'clock', '#eef5d8', '#688a23'],
        ].map((s) => (
          <div key={s[0]} className="rounded-[24px] border border-[#ebe7e2] bg-white p-5">
            <div className="flex items-center justify-between">
              <span
                className="grid size-10 place-items-center rounded-2xl"
                style={{ background: s[4], color: s[5] }}
              >
                <Icon name={s[3] as 'spark'} className="size-5" />
              </span>
              <span className="rounded-full bg-[#eff8df] px-2 py-1 text-[9px] font-bold text-[#66852b]">
                {s[2]}
              </span>
            </div>
            <p className="mt-5 text-[10px] text-[#96909d]">{s[0]}</p>
            <b className="mt-1 block text-xl">{s[1]}</b>
          </div>
        ))}
      </div>
      <div className="mt-6 rounded-[28px] border border-[#ebe7e2] bg-white p-5 md:p-7">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h2 className="text-lg font-black">نمودار عملکرد</h2>
            <p className="mt-1 text-[10px] text-[#9993a2]">روند رشد تو در ۸ هفته گذشته</p>
          </div>
          <div className="flex max-w-full gap-1 overflow-x-auto rounded-2xl bg-[#f5f2f7] p-1">
            {tabs.map((t, i) => (
              <button
                onClick={() => setTab(i)}
                key={t}
                className={`whitespace-nowrap rounded-xl px-3 py-2 text-[10px] font-bold transition ${tab === i ? 'bg-white text-[#512DA8] shadow-sm' : 'text-[#928b99]'}`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        <div className="relative mt-8 h-[250px] w-full md:h-[310px]">
          <div className="absolute inset-0 flex flex-col justify-between text-[9px] text-[#aaa4af]">
            {[100, 75, 50, 25, 0].map((n) => (
              <div key={n} className="flex items-center gap-3">
                <span className="w-5">{n}</span>
                <i className="h-px flex-1 bg-[#eeeae6]" />
              </div>
            ))}
          </div>
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="absolute inset-y-2 right-8 h-[calc(100%-16px)] w-[calc(100%-32px)] overflow-visible"
          >
            <defs>
              <linearGradient id="area" x1="0" y1="0" x2="0" y2="1">
                <stop stopColor="#6847b2" stopOpacity=".24" />
                <stop offset="1" stopColor="#6847b2" stopOpacity="0" />
              </linearGradient>
            </defs>
            <polygon points={`0,100 ${points} 100,100`} fill="url(#area)" />
            <polyline
              points={points}
              fill="none"
              stroke="#6847b2"
              strokeWidth="2.4"
              vectorEffect="non-scaling-stroke"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {datasets[tab].map((v, i) => (
              <circle
                key={i}
                cx={i * (100 / 7)}
                cy={100 - v}
                r="1.7"
                fill="white"
                stroke="#6847b2"
                strokeWidth=".8"
                vectorEffect="non-scaling-stroke"
              />
            ))}
          </svg>
        </div>
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <div className="rounded-[28px] bg-[#2d185e] p-6 text-white">
          <div className="flex items-center gap-4">
            <span className="grid size-16 place-items-center rounded-[22px] bg-[#b7f536] text-[#2d185e]">
              <Icon name="trophy" className="size-8" />
            </span>
            <div>
              <small className="text-[#baaadd]">دستاورد بعدی</small>
              <h3 className="mt-1 text-xl font-black">حل‌کننده حرفه‌ای</h3>
            </div>
          </div>
          <p className="mt-5 text-xs leading-6 text-[#cfc4e7]">
            ۲ تمرین دیگر حل کن تا این نشان را دریافت کنی.
          </p>
          <div className="mt-4 h-2 rounded-full bg-white/15">
            <div className="h-full w-[82%] rounded-full bg-[#b7f536]" />
          </div>
          <p className="mt-2 text-left text-[9px] text-[#b7f536]">۱۸ از ۲۰ تمرین</p>
        </div>
        <div className="rounded-[28px] border border-[#ebe7e2] bg-white p-6">
          <h2 className="text-lg font-black">آخرین فعالیت‌ها</h2>
          <div className="mt-4 space-y-1">
            {[
              ['نمره ۹۲ در آزمون حلقه‌ها', 'امروز، ۱۰:۴۵', 'quiz'],
              ['تکمیل تمرین تشخیص عدد اول', 'دیروز، ۱۸:۲۰', 'check'],
              ['۳ ساعت یادگیری در این هفته', '۲ روز پیش', 'clock'],
            ].map((a, i) => (
              <div
                key={a[0]}
                className="flex items-center gap-3 border-b border-[#f1eeea] py-3 last:border-0"
              >
                <span
                  className={`grid size-9 place-items-center rounded-xl ${i === 0 ? 'bg-[#eee8ff] text-[#6847b2]' : i === 1 ? 'bg-[#e7f8f2] text-[#138b77]' : 'bg-[#fff2dc] text-[#d38a20]'}`}
                >
                  <Icon name={a[2] as 'quiz'} className="size-4" />
                </span>
                <div>
                  <b className="block text-[11px]">{a[0]}</b>
                  <small className="text-[9px] text-[#a09aa5]">{a[1]}</small>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
