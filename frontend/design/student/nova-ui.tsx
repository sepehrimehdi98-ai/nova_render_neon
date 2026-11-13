'use client'
import {useEffect,useState} from 'react'
import {api} from '../../src/live/api'

import Link from './navigation'
import { usePathname } from './navigation'
import type { ReactNode, SVGProps } from 'react'

export type IconName =
  | 'home'
  | 'chart'
  | 'bot'
  | 'book'
  | 'user'
  | 'bell'
  | 'search'
  | 'arrow'
  | 'play'
  | 'clock'
  | 'check'
  | 'calendar'
  | 'trophy'
  | 'code'
  | 'video'
  | 'quiz'
  | 'folder'
  | 'lock'
  | 'phone'
  | 'mail'
  | 'save'
  | 'send'
  | 'spark'
  | 'menu'
  | 'close'
  | 'edit'
  | 'logout'

export function Icon({ name, ...props }: { name: IconName } & SVGProps<SVGSVGElement>) {
  const paths: Record<IconName, ReactNode> = {
    home: (
      <>
        <path d="m3 11 9-8 9 8" />
        <path d="M5.5 9.5V21h13V9.5M9 21v-6h6v6" />
      </>
    ),
    chart: (
      <>
        <path d="M4 19V9m6 10V5m6 14v-7m4 7H2" />
      </>
    ),
    bot: (
      <>
        <rect x="4" y="7" width="16" height="13" rx="4" />
        <path d="M9 12h.01M15 12h.01M9 16h6M12 7V3m-2 0h4" />
      </>
    ),
    book: (
      <>
        <path d="M4 5a3 3 0 0 1 3-2h5v18H7a3 3 0 0 0-3 2V5Z" />
        <path d="M20 5a3 3 0 0 0-3-2h-5v18h5a3 3 0 0 1 3 2V5Z" />
      </>
    ),
    user: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21a8 8 0 0 1 16 0" />
      </>
    ),
    bell: (
      <>
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" />
      </>
    ),
    search: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-4-4" />
      </>
    ),
    arrow: (
      <>
        <path d="M5 12h14m-6-6 6 6-6 6" />
      </>
    ),
    play: <path d="m9 6 9 6-9 6V6Z" />,
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    calendar: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="3" />
        <path d="M8 3v4m8-4v4M3 10h18" />
      </>
    ),
    trophy: (
      <>
        <path d="M8 4h8v5a4 4 0 0 1-8 0V4Z" />
        <path d="M8 6H4v2a4 4 0 0 0 4 4m8-6h4v2a4 4 0 0 1-4 4m-4 1v4m-4 4h8m-6-4h4" />
      </>
    ),
    code: (
      <>
        <path d="m8 9-4 3 4 3m8-6 4 3-4 3m-2-9-4 12" />
      </>
    ),
    video: (
      <>
        <rect x="3" y="5" width="14" height="14" rx="3" />
        <path d="m17 10 4-2v8l-4-2" />
      </>
    ),
    quiz: (
      <>
        <path d="M9.5 9a2.7 2.7 0 1 1 4.2 2.3c-1 .7-1.7 1.2-1.7 2.7M12 18h.01" />
        <circle cx="12" cy="12" r="10" />
      </>
    ),
    folder: (
      <path d="M3 6a2 2 0 0 1 2-2h5l2 3h7a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6Z" />
    ),
    lock: (
      <>
        <rect x="5" y="10" width="14" height="11" rx="2" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3" />
      </>
    ),
    phone: (
      <path d="M7 3H4a2 2 0 0 0-2 2c0 9.4 7.6 17 17 17a2 2 0 0 0 2-2v-3l-5-1-1.5 3a15 15 0 0 1-9.5-9.5L8 8 7 3Z" />
    ),
    mail: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m3 7 9 6 9-6" />
      </>
    ),
    save: (
      <>
        <path d="M5 3h12l3 3v15H4V3h1Z" />
        <path d="M8 3v6h8V3M8 21v-7h8v7" />
      </>
    ),
    send: (
      <>
        <path d="m22 2-7 20-4-9-9-4 20-7Z" />
        <path d="M22 2 11 13" />
      </>
    ),
    spark: (
      <>
        <path d="m12 3 1.2 4.8L18 9l-4.8 1.2L12 15l-1.2-4.8L6 9l4.8-1.2L12 3Z" />
        <path d="m19 15 .6 2.4L22 18l-2.4.6L19 21l-.6-2.4L16 18l2.4-.6L19 15Z" />
      </>
    ),
    menu: <path d="M4 7h16M4 12h16M4 17h16" />,
    close: <path d="m6 6 12 12M18 6 6 18" />,
    edit: (
      <>
        <path d="m14 4 6 6L9 21H3v-6L14 4Z" />
        <path d="m12 6 6 6" />
      </>
    ),
    logout: (
      <>
        <path d="M10 17l5-5-5-5m5 5H3" />
        <path d="M14 4h5a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-5" />
      </>
    ),
  }
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {paths[name]}
    </svg>
  )
}

const nav = [
  { href: '/', label: 'خانه', icon: 'home' as const },
  { href: '/progress', label: 'مسیر پیشرفت', icon: 'chart' as const },
  { href: '/assistant', label: 'دستیار نووا', icon: 'bot' as const },
  { href: '/exams', label: 'آزمون‌ها', icon: 'quiz' as const },
  { href: '/lessons', label: 'درس‌های من', icon: 'book' as const },
  { href: '/profile', label: 'پروفایل', icon: 'user' as const },
]

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-3" aria-label="نووا، خانه">
      <span className="grid size-10 place-items-center rounded-[14px] bg-[#157659] text-white shadow-[0_8px_20px_rgba(21,118,89,.15)]">
        <svg viewBox="0 0 34 34" className="size-7" fill="none">
          <path
            d="M7 24V10l10 7 10-7v14"
            stroke="currentColor"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="17" cy="17" r="3" fill="#B7F536" />
        </svg>
      </span>
      <span>
        <b className="block text-[18px] leading-5 text-[#1d1633]">نووا</b>
        <small className="text-[10px] text-[#8c869a]">آکادمی برنامه‌نویسی</small>
      </span>
    </Link>
  )
}

export function DashboardShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const [userName,setUserName]=useState('');useEffect(()=>{api('/me').then(r=>setUserName(r.user.name)).catch(()=>{})},[]);
  if (pathname === '/login' || pathname === '/assistant') {
    return <>{children}</>
  }
  return (
    <div className="nova-student-shell min-h-screen bg-[#f7f6f2] text-[#211a37]" dir="rtl">
      <aside className="fixed inset-y-0 right-0 z-30 hidden w-[238px] flex-col border-l border-[#e9e5df] bg-white px-5 py-7 lg:flex">
        <Logo />
        <nav className="mt-12 space-y-1.5">
          {nav.map((item) => {
            const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-2xl px-4 py-3.5 text-[13px] font-semibold transition ${active ? 'bg-[#157659] text-white shadow-[0_10px_24px_rgba(21,118,89,.15)]' : 'text-[#777181] hover:bg-[#edf6ee] hover:text-[#157659]'}`}
              >
                <Icon name={item.icon} className="size-[19px]" />
                {item.label}
              </Link>
            )
          })}
        </nav>
        <div className="mt-auto rounded-[22px] bg-[#f0f9dc] p-4">
          <div className="mb-3 flex items-center gap-2">
            <span className="grid size-8 place-items-center rounded-xl bg-[#b7f536]">
              <Icon name="spark" className="size-4" />
            </span>
            <b className="text-xs">هر روز یک قدم</b>
          </div>
          <p className="text-[11px] leading-5 text-[#6f715f]">
            با ۲۰ دقیقه تمرین روزانه، زنجیره یادگیریت رو حفظ کن.
          </p>
        </div>
      </aside>
      <div className="lg:pr-[238px]">
        <header className="sticky top-0 z-20 flex h-[76px] items-center justify-between border-b border-[#ebe8e2]/90 bg-[#f7f6f2]/90 px-4 backdrop-blur-xl md:px-8">
          <div className="lg:hidden">
            <Logo />
          </div>
          <label className="relative hidden w-[270px] lg:block">
            <Icon
              name="search"
              className="absolute right-4 top-1/2 size-4 -translate-y-1/2 text-[#9b95a5]"
            />
            <input
              className="w-full rounded-2xl border border-[#e8e4de] bg-white py-3 pr-11 pl-4 text-xs outline-none transition focus:border-[#7457ba]"
              placeholder="جستجو در درس‌ها..."
            />
          </label>
          <div className="flex items-center gap-3">
            <button className="relative grid size-10 place-items-center rounded-2xl border border-[#e8e4de] bg-white text-[#706a7c]">
              <Icon name="bell" className="size-[18px]" />
              <span className="absolute right-2 top-2 size-2 rounded-full border-2 border-white bg-[#ff7657]" />
            </button>
            <Link
              href="/profile"
              className="flex items-center gap-2 rounded-2xl bg-white p-1.5 pl-3 shadow-sm"
            >
              <span className="grid size-9 place-items-center rounded-[13px] bg-[#e7ddff] text-lg">
                👨🏻‍💻
              </span>
              <span className="hidden text-right sm:block">
                <b className="block text-[11px]">{userName||'دانش‌آموز'}</b>
                <small className="text-[9px] text-[#9a94a4]">دانش‌آموز پایتون</small>
              </span>
            </Link>
          </div>
        </header>
        <main className="mx-auto max-w-[1440px] px-4 pb-24 pt-6 md:px-8 md:pt-8 lg:pb-10">
          {children}
        </main>
      </div>
      <nav className="fixed inset-x-3 bottom-3 z-40 flex justify-around rounded-[22px] border border-white/70 bg-white/95 px-2 py-2 shadow-[0_12px_40px_rgba(45,35,70,.16)] backdrop-blur lg:hidden">
        {nav.map((item) => {
          const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.label}
              className={`grid min-w-12 place-items-center rounded-2xl px-3 py-2 ${active ? 'bg-[#157659] text-white' : 'text-[#8d8797]'}`}
            >
              <Icon name={item.icon} className="size-5" />
            </Link>
          )
        })}
      </nav>
    </div>
  )
}

export function PageTitle({
  title,
  subtitle,
  action,
}: {
  title: string
  subtitle: string
  action?: ReactNode
}) {
  return (
    <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <h1 className="text-[26px] font-black tracking-tight md:text-[30px]">{title}</h1>
        <p className="mt-1.5 text-xs leading-6 text-[#8d8797]">{subtitle}</p>
      </div>
      {action}
    </div>
  )
}

export function ProgressRing({
  value,
  size = 76,
  color = '#157659',
}: {
  value: number
  size?: number
  color?: string
}) {
  const r = 32,
    c = 2 * Math.PI * r
  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg viewBox="0 0 76 76" className="absolute inset-0 size-full -rotate-90">
        <circle cx="38" cy="38" r={r} fill="none" stroke="#eeeaf2" strokeWidth="6" />
        <circle
          cx="38"
          cy="38"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - value / 100)}
        />
      </svg>
      <b className="text-sm">{value}٪</b>
    </div>
  )
}

export function SectionHead({
  title,
  link,
  href = '#',
}: {
  title: string
  link?: string
  href?: string
}) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <h2 className="text-[17px] font-extrabold">{title}</h2>
      {link && (
        <Link href={href} className="flex items-center gap-1 text-[11px] font-bold text-[#157659]">
          {link}
          <Icon name="arrow" className="size-3 rotate-180" />
        </Link>
      )}
    </div>
  )
}
