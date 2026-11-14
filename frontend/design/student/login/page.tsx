import {LoginBrand,DesignerCredit} from '../../LoginBrand';
import {api} from '../../../src/live/api';
'use client'

import Link from '../navigation'
import { useRouter } from '../navigation'
import { FormEvent, useState } from 'react'
import { Icon, Logo } from '../nova-ui'

const codeLines = [
  {
    n: '01',
    code: (
      <>
        <span className="text-[#c792ea]">class</span>{' '}
        <span className="text-[#82aaff]">Student</span>:
      </>
    ),
  },
  {
    n: '02',
    code: (
      <>
        <span className="text-[#c792ea]">def</span> <span className="text-[#82aaff]">__init__</span>
        (self, name):
      </>
    ),
  },
  { n: '03', code: <>self.name = name</> },
  { n: '04', code: <>self.skills = []</> },
  { n: '05', code: <></> },
  {
    n: '06',
    code: (
      <>
        <span className="text-[#c792ea]">def</span> <span className="text-[#82aaff]">learn</span>
        (self, skill):
      </>
    ),
  },
  { n: '07', code: <>self.skills.append(skill)</> },
  {
    n: '08',
    code: (
      <>
        <span className="text-[#f78c6c]">print</span>(
        <span className="text-[#c3e88d]">
          f&quot;{'{'}skill{'}'} یاد گرفتم!&quot;
        </span>
        )
      </>
    ),
  },
  { n: '09', code: <></> },
  {
    n: '10',
    code: (
      <>
        arian = Student(<span className="text-[#c3e88d]">&quot;آرین&quot;</span>)
      </>
    ),
  },
  {
    n: '11',
    code: (
      <>
        arian.learn(<span className="text-[#c3e88d]">&quot;Python&quot;</span>)
      </>
    ),
  },
]

export default function LoginPage() {
  const router = useRouter()
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!phone.trim() || password.length < 4) {
      setError('نام کاربری یا رمز عبور را به‌درستی وارد کن.')
      return
    }
    setError('')
    setLoading(true)
    try{await api('/login',{username:phone,password});router.push('/')}catch(e){setError(String(e));setLoading(false)}
  }

  return (
    <main className="grid min-h-dvh bg-white lg:grid-cols-[0.92fr_1.08fr]" dir="rtl">
      <section className="flex min-h-dvh flex-col px-6 py-6 sm:px-12 lg:px-[10%] lg:py-8">
        <LoginBrand />
        <div className="mx-auto flex w-full max-w-[410px] flex-1 flex-col justify-center py-12">
          <span className="mb-5 grid size-12 place-items-center rounded-[17px] bg-[#eee8ff] text-[#512DA8]">
            <Icon name="user" className="size-5" />
          </span>
          <h1 className="text-[28px] font-black tracking-tight md:text-[34px]">دوباره سلام!</h1>
          <p className="mt-2 text-[11px] leading-6 text-[#8d8693]">
            وارد حساب نووا شو و یادگیری را از همان‌جایی که بودی ادامه بده.
          </p>

          <form onSubmit={submit} className="mt-8 space-y-5">
            <label className="block">
              <span className="mb-2 block text-[10px] font-bold text-[#655e6a]">نام کاربری</span>
              <div className="relative">
                <Icon
                  name="phone"
                  className="absolute right-4 top-1/2 size-4 -translate-y-1/2 text-[#9a939f]"
                />
                <input
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  inputMode="text"
                  autoComplete="tel"
                  placeholder="نام کاربری"
                  className="h-14 w-full rounded-[17px] border border-[#e3ded9] bg-[#faf9f7] pr-11 pl-4 text-xs outline-none transition focus:border-[#6b4ab2] focus:bg-white focus:ring-4 focus:ring-[#6b4ab2]/5"
                />
              </div>
            </label>
            <label className="block">
              <span className="mb-2 block text-[10px] font-bold text-[#655e6a]">رمز عبور</span>
              <div className="relative">
                <Icon
                  name="lock"
                  className="absolute right-4 top-1/2 size-4 -translate-y-1/2 text-[#9a939f]"
                />
                <input
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="رمز عبور خود را وارد کن"
                  className="h-14 w-full rounded-[17px] border border-[#e3ded9] bg-[#faf9f7] pr-11 pl-16 text-xs outline-none transition focus:border-[#6b4ab2] focus:bg-white focus:ring-4 focus:ring-[#6b4ab2]/5"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[9px] font-bold text-[#6b4ab2]"
                >
                  {showPassword ? 'پنهان' : 'نمایش'}
                </button>
              </div>
            </label>
            <div className="flex items-center justify-between text-[9px]">
              <label className="flex items-center gap-2 text-[#746d78]">
                <input type="checkbox" className="accent-[#512DA8]" />
                مرا به خاطر بسپار
              </label>
              <button type="button" className="font-bold text-[#5e3da6]">
                رمز را فراموش کردی؟
              </button>
            </div>
            {error && (
              <p className="rounded-xl bg-[#fff0ed] px-3 py-2.5 text-[9px] font-bold text-[#c94e39]">
                {error}
              </p>
            )}
            <button
              disabled={loading}
              className="flex h-14 w-full items-center justify-center gap-2 rounded-[17px] bg-[#512DA8] text-xs font-bold text-white shadow-[0_12px_28px_rgba(81,45,168,.2)] transition hover:bg-[#43248d] disabled:opacity-70"
            >
              {loading ? (
                <span className="size-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <>
                  ورود به نووا <Icon name="arrow" className="size-4 rotate-180" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 flex items-center gap-3 text-[9px] text-[#aaa4ad]">
            <i className="h-px flex-1 bg-[#e9e5e0]" />
            ورود نمایشی
            <i className="h-px flex-1 bg-[#e9e5e0]" />
          </div>
          <p className="mt-5 text-center text-[10px] text-[#817a87]">
            هنوز عضو نووا نیستی؟{' '}
            <button className="font-extrabold text-[#5c3aa5]">ساخت حساب کاربری</button>
          </p>
        </div>
        <div className="flex justify-between text-[8px] text-[#aaa4ad]">
          <DesignerCredit />
          <span>حریم خصوصی • قوانین</span>
        </div>
      </section>

      <section className="login-code-panel relative hidden min-h-dvh overflow-hidden bg-[#281452] p-10 text-white lg:flex lg:flex-col">
        <div className="absolute left-[-80px] top-[-80px] size-[300px] rounded-full bg-[#7c55cd]/20 blur-3xl" />
        <div className="absolute bottom-[-100px] right-[-60px] size-[360px] rounded-full bg-[#b7f536]/10 blur-3xl" />
        <div className="relative z-10 flex items-center justify-between text-[9px] text-[#b9acd3]">
          <span className="flex items-center gap-2">
            <i className="size-2 rounded-full bg-[#b7f536]" />
            محیط یادگیری فعال
          </span>
          <span>nova.py</span>
        </div>
        <div className="relative z-10 mx-auto my-auto w-full max-w-[620px]">
          <div className="mb-10">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-[9px] text-[#d8ccee]">
              <Icon name="spark" className="size-3 text-[#b7f536]" />
              هر روز یک مهارت تازه
            </span>
            <h2 className="mt-5 max-w-[500px] text-[31px] font-black leading-[1.55]">
              آینده با یک خط کد شروع می‌شود.
            </h2>
            <p className="mt-3 max-w-[470px] text-[11px] leading-7 text-[#bdaed9]">
              در نووا، برنامه‌نویسی را با تمرین‌های واقعی و همراهی یک دستیار هوشمند یاد می‌گیری.
            </p>
          </div>
          <div
            className="float-slow overflow-hidden rounded-[24px] border border-white/10 bg-[#121c27]/95 shadow-[0_30px_70px_rgba(0,0,0,.28)]"
            dir="ltr"
          >
            <div className="flex h-12 items-center gap-2 border-b border-white/10 px-4">
              <i className="size-2.5 rounded-full bg-[#ff6b67]" />
              <i className="size-2.5 rounded-full bg-[#f3c44f]" />
              <i className="size-2.5 rounded-full bg-[#5ed38d]" />
              <span className="ml-4 text-[9px] text-[#778793]">student.py</span>
              <span className="ml-auto rounded-md bg-[#233443] px-2 py-1 text-[8px] text-[#87a0ae]">
                Python 3.12
              </span>
            </div>
            <div className="p-5 font-mono text-[11px] leading-7 text-[#d7e3e7]">
              {codeLines.map((line, index) => (
                <div key={line.n} className="login-code-line flex">
                  <span className="mr-5 w-5 select-none text-right text-[#4d5d68]">{line.n}</span>
                  <code className={`${[2, 3, 6, 7].includes(index) ? 'pl-5' : ''}`}>
                    {line.code}
                  </code>
                </div>
              ))}
              <div className="mt-4 flex border-t border-white/10 pt-4">
                <span className="mr-5 w-5 text-right text-[#4d5d68]">›</span>
                <span className="text-[#b7f536]">Python یاد گرفتم!</span>
                <i className="code-cursor ml-1 h-4 w-1.5 bg-[#b7f536]" />
              </div>
            </div>
          </div>
          <div className="mt-7 flex items-center gap-4">
            <div className="flex -space-x-2 space-x-reverse">
              {['🧑🏻‍💻', '👩🏻‍💻', '🧑🏽‍🚀', '👨🏻‍🎓'].map((avatar) => (
                <span
                  key={avatar}
                  className="grid size-8 place-items-center rounded-full border-2 border-[#281452] bg-[#e8ddff] text-sm"
                >
                  {avatar}
                </span>
              ))}
            </div>
            <p className="text-[9px] text-[#bcaed5]">
              <b className="text-white">+۲,۵۰۰ دانش‌آموز</b>
              <br />
              همین حالا در حال یادگیری‌اند
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}
