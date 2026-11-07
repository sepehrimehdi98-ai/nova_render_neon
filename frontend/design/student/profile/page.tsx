'use client'

import Link from '../navigation'
import {api} from '../../../src/live/api';
import { useEffect,useState } from 'react'
import { Icon, PageTitle } from '../nova-ui'

const avatars = ['👨🏻‍💻', '🧑🏻‍🚀', '🦸🏻‍♂️', '🧙🏻‍♂️', '🥷🏻', '🤖']

export default function ProfilePage() {
  const [avatar, setAvatar] = useState(0),
    [saved, setSaved] = useState(false)
  const [fields,setFields]=useState<Record<string,string>>({});
  const [revision,setRevision]=useState<number|null>(null);
  useEffect(()=>{api('/sample-state/profile').then(r=>{setFields(r.value?.fields||{});setAvatar(r.value?.avatar||0);setRevision(r.revision)}).catch(e=>alert(e.message))},[]);
  return (
    <>
      <PageTitle
        title="پروفایل و تنظیمات"
        subtitle="اطلاعات حساب و تجربه یادگیری خودت را مدیریت کن"
      />
      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        <aside className="rounded-[28px] border border-[#ebe7e2] bg-white p-6 text-center">
          <div className="relative mx-auto grid size-28 place-items-center rounded-[34px] bg-[#eee8ff] text-6xl">
            {avatars[avatar]}
            <button className="absolute -bottom-2 -left-2 grid size-9 place-items-center rounded-xl bg-[#512DA8] text-white shadow-lg">
              <Icon name="edit" className="size-4" />
            </button>
          </div>
          <h2 className="mt-6 text-lg font-black">آرین محمدی</h2>
          <p className="mt-1 text-[10px] text-[#97909e]">دانش‌آموز سطح ۷</p>
          <div className="mt-6 grid grid-cols-2 gap-2">
            <div className="rounded-2xl bg-[#f5f2f7] p-3">
              <b className="block text-lg">۱۲</b>
              <small className="text-[8px] text-[#9992a0]">نشان‌ها</small>
            </div>
            <div className="rounded-2xl bg-[#eef7db] p-3">
              <b className="block text-lg">۲۳</b>
              <small className="text-[8px] text-[#778260]">روز مستمر</small>
            </div>
          </div>
          <Link
            href="/login"
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-[#f0d8d2] py-3 text-[10px] font-bold text-[#cf5a44]"
          >
            <Icon name="logout" className="size-4" />
            خروج از حساب
          </Link>
        </aside>
        <div className="space-y-5">
          <section className="rounded-[28px] border border-[#ebe7e2] bg-white p-6 md:p-7">
            <h2 className="text-base font-black">انتخاب آواتار</h2>
            <p className="mt-1 text-[9px] text-[#9a94a0]">
              شخصیت مورد علاقه‌ات را برای پروفایل انتخاب کن
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              {avatars.map((a, i) => (
                <button
                  onClick={() => setAvatar(i)}
                  key={a}
                  className={`grid size-16 place-items-center rounded-[20px] text-3xl transition ${avatar === i ? 'scale-105 bg-[#e9e0ff] ring-2 ring-[#6847b2] ring-offset-2' : 'bg-[#f5f2f0] hover:-translate-y-1'}`}
                >
                  {a}
                </button>
              ))}
            </div>
          </section>
          <section className="rounded-[28px] border border-[#ebe7e2] bg-white p-6 md:p-7">
            <h2 className="text-base font-black">اطلاعات شخصی</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {[
                ['نام و نام خانوادگی', 'آرین محمدی', 'user'],
                ['شماره تماس', '۰۹۱۲ ۱۲۳ ۴۵۶۷', 'phone'],
                ['ایمیل', 'arian@example.com', 'mail'],
                ['پایه تحصیلی', 'پایه دهم', 'book'],
              ].map((x) => (
                <label key={x[0]}>
                  <span className="mb-2 block text-[9px] font-bold text-[#7c7583]">{x[0]}</span>
                  <div className="relative">
                    <Icon
                      name={x[2] as 'user'}
                      className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-[#9992a0]"
                    />
                    <input
                      value={fields[x[0]]??x[1]} onChange={e=>setFields({...fields,[x[0]]:e.target.value})}
                      className="w-full rounded-2xl border border-[#e7e2dc] bg-[#faf9f7] py-3.5 pr-10 pl-3 text-[11px] outline-none focus:border-[#765ab6]"
                    />
                  </div>
                </label>
              ))}
            </div>
          </section>
          <section className="rounded-[28px] border border-[#ebe7e2] bg-white p-6 md:p-7">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-2xl bg-[#fff0eb] text-[#df6045]">
                <Icon name="lock" className="size-5" />
              </span>
              <div>
                <h2 className="text-base font-black">تغییر رمز عبور</h2>
                <p className="text-[9px] text-[#9a94a0]">برای امنیت بیشتر از رمز قوی استفاده کن</p>
              </div>
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              {['رمز فعلی', 'رمز جدید', 'تکرار رمز جدید'].map((x) => (
                <label key={x}>
                  <span className="mb-2 block text-[9px] font-bold text-[#7c7583]">{x}</span>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full rounded-2xl border border-[#e7e2dc] bg-[#faf9f7] px-4 py-3.5 text-xs outline-none focus:border-[#765ab6]"
                  />
                </label>
              ))}
            </div>
          </section>
          <button
            disabled={revision===null} onClick={async () => {
              try{const r=await api("/sample-state/profile",{revision,value:{avatar,fields}});setRevision(r.revision)}catch(e){alert(String(e));return}
              setSaved(true)
              setTimeout(() => setSaved(false), 1800)
            }}
            className="flex items-center gap-2 rounded-2xl bg-[#512DA8] px-6 py-3.5 text-xs font-bold text-white shadow-[0_10px_25px_rgba(81,45,168,.2)]"
          >
            <Icon name={saved ? 'check' : 'save'} className="size-4" />
            {saved ? 'تغییرات ذخیره شد' : 'ذخیره تغییرات'}
          </button>
        </div>
      </div>
    </>
  )
}
