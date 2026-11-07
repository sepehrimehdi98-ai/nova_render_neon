import { useState } from "react"
import type { Role } from "../api/platform"
import { AppShell, type NavItem } from "../components/AppShell"
import { DataList, StatCard, Toast } from "../components/UI"
import { Icon } from "../components/Icons"

const nav: NavItem[] = [
  { id: "overview", label: "نمای کلی", icon: "home" },
  { id: "accounts", label: "حساب‌ها", icon: "users" },
  { id: "courses", label: "دوره‌ها", icon: "course" },
  { id: "media", label: "رسانه", icon: "media" },
  { id: "profile", label: "پروفایل", icon: "user" },
]
type Props = {
  onRoleChange: (r: Role) => void
  theme: string
  onTheme: () => void
}
export default function AdminApp(props: Props) {
  const [page, setPage] = useState("overview"),
    [toast, setToast] = useState("")
  const names: Record<string, string> = {
    overview: "مرکز فرمان نُوا",
    accounts: "مدیریت حساب‌ها",
    courses: "مدیریت دوره‌ها",
    media: "تأیید رسانه",
    profile: "پروفایل مدیر",
  }
  return (
    <AppShell
      {...props}
      role="admin"
      page={page}
      setPage={setPage}
      nav={nav}
      title={names[page]}
      subtitle="سامانه پایدار و همه‌چیز تحت کنترل است"
      headerVisual={
        <div className="admin-network">
          <i />
          <i />
          <i />
          <i />
          <svg viewBox="0 0 100 30">
            <path d="M8 15 34 6 62 22 91 8" />
          </svg>
          <span>
            <Icon name="shield" /> سلامت سرویس‌ها: عالی
          </span>
        </div>
      }
    >
      {page === "overview" && <Overview />}
      {page === "accounts" && <Accounts notify={setToast} />}
      {page === "courses" && <AdminCourses />}
      {page === "media" && <AdminMedia notify={setToast} />}
      {page === "profile" && <AdminProfile />}
      {toast && <Toast message={toast} onDone={() => setToast("")} />}
    </AppShell>
  )
}
function Overview() {
  return (
    <div className="dashboard-grid">
      <div className="stats-row full">
        <StatCard icon="users" label="کل کاربران" value="۱,۲۴۸" />
        <StatCard icon="media" label="رسانه منتظر" value="۱۲" tone="amber" />
        <StatCard icon="shield" label="درخواست رمز" value="۵" tone="red" />
        <StatCard icon="sparkle" label="کارگر AI" value="فعال" tone="teal" />
      </div>
      <section className="card action-list">
        <div className="section-top">
          <div>
            <span className="eyebrow red">نیازمند اقدام</span>
            <h2>صف کارهای امروز</h2>
          </div>
          <span className="chip red">۸ مورد</span>
        </div>
        <DataList
          items={[
            {
              title: "۵ درخواست تغییر رمز",
              meta: "قدیمی‌ترین: ۳ ساعت پیش",
              status: "بررسی",
              tone: "red",
            },
            {
              title: "۱۲ رسانه منتظر تأیید",
              meta: "۷ ویدیو، ۳ PDF، ۲ تصویر",
              status: "مشاهده",
              tone: "amber",
            },
            {
              title: "۲ گزارش محتوای نامناسب",
              meta: "ثبت‌شده توسط دانش‌آموزان",
              status: "مهم",
              tone: "red",
            },
          ]}
        />
      </section>
      <section className="card system-health">
        <h2>سلامت سرویس‌ها</h2>
        {[
          ["API اصلی", "۹۹.۹٪", "green"],
          ["پردازشگر AI", "۷ کار در صف", "teal"],
          ["فضای رسانه", "۶۸٪ مصرف", "amber"],
        ].map(([x, v, t]) => (
          <div key={x}>
            <span>
              <i className={t} />
              {x}
            </span>
            <b>{v}</b>
          </div>
        ))}
      </section>
      <section className="card recent-log">
        <div className="section-top">
          <h2>لاگ اخیر</h2>
          <button className="link-btn">مشاهده کامل</button>
        </div>
        <DataList
          items={[
            { title: "تأیید ویدیوی «حلقه‌ها»", meta: "توسط مدیر · ۱۰:۴۵" },
            { title: "حساب مدرس جدید ساخته شد", meta: "توسط مدیر · ۰۹:۲۰" },
            { title: "دورهٔ جاوااسکریپت آرشیو شد", meta: "توسط مدیر · دیروز" },
          ]}
        />
      </section>
    </div>
  )
}
function Accounts({ notify }: { notify: (x: string) => void }) {
  const [query, setQuery] = useState("")
  const users = [
    ["سارا احمدی", "مدرس", "فعال"],
    ["آرین رضایی", "دانش‌آموز", "فعال"],
    ["نیما کاویانی", "دانش‌آموز", "غیرفعال"],
    ["امیر شریفی", "مدرس", "فعال"],
  ].filter((x) => x[0].includes(query))
  return (
    <section className="card content-card">
      <div className="section-top">
        <div>
          <h2>همهٔ حساب‌ها</h2>
          <p>کاربران، نقش‌ها و وضعیت دسترسی</p>
        </div>
        <button
          className="btn primary"
          onClick={() =>
            notify("رمز موقت ساخته شد؛ فقط همین یک‌بار نمایش داده می‌شود")
          }
        >
          <Icon name="plus" /> ساخت کاربر
        </button>
      </div>
      <div className="table-tools">
        <label className="search">
          <Icon name="search" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="جستجوی نام یا نام کاربری"
          />
        </label>
        <select>
          <option>همه نقش‌ها</option>
          <option>مدرس</option>
          <option>دانش‌آموز</option>
        </select>
        <select>
          <option>همه وضعیت‌ها</option>
          <option>فعال</option>
          <option>غیرفعال</option>
        </select>
      </div>
      <div className="responsive-table">
        <div className="table-head">
          <span>کاربر</span>
          <span>نقش</span>
          <span>وضعیت</span>
          <span>آخرین ورود</span>
          <span />
        </div>
        {users.map((u, i) => (
          <div className="table-row" key={u[0]}>
            <span className="user-cell">
              <i className={`mini-avatar a${i}`}>{u[0][0]}</i>
              <b>
                {u[0]}
                <small>user_{1024 + i}</small>
              </b>
            </span>
            <span>{u[1]}</span>
            <span>
              <i className={`chip ${u[2] === "فعال" ? "green" : "gray"}`}>
                {u[2]}
              </i>
            </span>
            <span>{i === 2 ? "۱۲ روز پیش" : "امروز"}</span>
            <button className="icon-button">
              <Icon name="dots" />
            </button>
          </div>
        ))}
      </div>
      <div className="password-queue">
        <div className="section-top">
          <h2>درخواست‌های تغییر رمز</h2>
          <span className="chip amber">۵ در انتظار</span>
        </div>
        <DataList
          items={[
            {
              title: "پرنیان نادری",
              meta: "ثبت‌شده ۲ ساعت پیش",
              status: "بررسی",
              tone: "amber",
            },
            {
              title: "محمد طاهری",
              meta: "ثبت‌شده دیروز",
              status: "بررسی",
              tone: "amber",
            },
          ]}
        />
      </div>
    </section>
  )
}
function AdminCourses() {
  return (
    <section className="card content-card">
      <div className="section-top">
        <div>
          <h2>همهٔ دوره‌ها</h2>
          <p>تخصیص مدرس و مدیریت چرخهٔ انتشار</p>
        </div>
        <button className="btn primary">
          <Icon name="plus" /> دوره جدید
        </button>
      </div>
      <div className="admin-course-grid">
        {[
          ["پایتون مقدماتی", "سارا احمدی", "۳۸ دانش‌آموز"],
          ["تفکر الگوریتمی", "امیر شریفی", "۲۶ دانش‌آموز"],
          ["پایتون پروژه‌محور", "بدون مدرس", "۰ دانش‌آموز"],
        ].map((x, i) => (
          <article key={x[0]}>
            <div className={`course-cover c${i}`}>
              <Icon name="course" />
            </div>
            <span className={`chip ${i === 2 ? "gray" : "green"}`}>
              {i === 2 ? "پیش‌نویس" : "فعال"}
            </span>
            <h3>{x[0]}</h3>
            <p>
              مدرس: {x[1]} · {x[2]}
            </p>
            <div>
              <button className="btn secondary small">تخصیص مدرس</button>
              <button className="btn ghost small">آرشیو</button>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
function AdminMedia({ notify }: { notify: (x: string) => void }) {
  return (
    <div className="media-grid">
      <section className="card approval-preview">
        <div className="video-screen">
          <button>
            <Icon name="play" />
          </button>
        </div>
        <span className="chip amber">منتظر تأیید</span>
        <h2>loops-intro.mp4</h2>
        <p>ارسال از سارا احمدی · پایتون مقدماتی</p>
        <textarea
          placeholder="دلیل رد (الزامی در صورت رد)"
          aria-label="دلیل رد"
        />
        <div>
          <button
            className="btn danger"
            onClick={() => notify("رسانه با ثبت دلیل رد شد")}
          >
            رد رسانه
          </button>
          <button
            className="btn primary"
            onClick={() => notify("رسانه تأیید شد")}
          >
            تأیید رسانه
          </button>
        </div>
      </section>
      <section className="card media-queue">
        <h2>صف تأیید</h2>
        <DataList
          items={[
            {
              title: "loops-intro.mp4",
              meta: "ویدیو · ۱۸۲ مگابایت",
              status: "در حال مشاهده",
              tone: "purple",
            },
            {
              title: "functions.pdf",
              meta: "PDF · ۴ مگابایت",
              status: "جدید",
              tone: "amber",
            },
            {
              title: "course-cover.jpg",
              meta: "تصویر · ۱.۲ مگابایت",
              status: "جدید",
              tone: "amber",
            },
          ]}
        />
      </section>
      <section className="card shared-library">
        <div className="section-top">
          <div>
            <span className="eyebrow">کتابخانهٔ مشترک</span>
            <h2>ویدیوهای پراستفاده</h2>
          </div>
          <button className="btn secondary">مشاهده همه</button>
        </div>
        <DataList
          items={[
            {
              title: "آشنایی با محیط پایتون",
              meta: "استفاده در ۴ دوره",
              status: "تغییر ویدیو",
              tone: "purple",
            },
            {
              title: "نصب و راه‌اندازی",
              meta: "استفاده در ۳ دوره",
              status: "تغییر ویدیو",
              tone: "purple",
            },
          ]}
        />
        <p className="note">جایگزینی ویدیو، همهٔ پیوندهای فعلی را حفظ می‌کند.</p>
      </section>
    </div>
  )
}
function AdminProfile() {
  return (
    <div className="profile-grid">
      <section className="card profile-card">
        <span className="mini-avatar a3 large">م</span>
        <h2>مدیر نُوا</h2>
        <p>مدیر ارشد سامانه</p>
        <span className="chip green">
          <Icon name="shield" /> احراز هویت دومرحله‌ای فعال
        </span>
      </section>
      <section className="card avatar-gallery">
        <h2>اطلاعات حساب</h2>
        <div className="account-info">
          <span>
            نام کاربری <b>nova.admin</b>
          </span>
          <span>
            آخرین ورود <b>امروز، ۰۸:۳۲</b>
          </span>
          <span>
            نشست‌های فعال <b>۱ دستگاه</b>
          </span>
        </div>
        <button className="btn secondary">ویرایش پروفایل</button>
      </section>
      <section className="card password-flow">
        <h2>امنیت و دسترسی</h2>
        <p>رمزها و کلیدهای سامانه در این صفحه ذخیره یا نمایش داده نمی‌شوند.</p>
        <button className="btn primary">درخواست تغییر رمز</button>
      </section>
    </div>
  )
}
