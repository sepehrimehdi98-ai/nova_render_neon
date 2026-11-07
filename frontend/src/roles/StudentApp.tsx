import { useState } from "react"
import { AppShell, type NavItem } from "../components/AppShell"
import {
  Avatar,
  Countdown,
  DataList,
  LineChart,
  ProgressBar,
  ProgressRing,
  StatCard,
  Toast,
} from "../components/UI"
import { Icon } from "../components/Icons"
import { formatJalali, toFa } from "../lib/format"
import type { Role } from "../api/platform"

const nav: NavItem[] = [
  { id: "home", label: "خانه", icon: "home" },
  { id: "lessons", label: "درس‌ها", icon: "book" },
  { id: "exams", label: "آزمون‌ها", icon: "exam" },
  { id: "analytics", label: "تحلیل", icon: "chart" },
  { id: "assistant", label: "یار درس", icon: "sparkle" },
  { id: "profile", label: "پروفایل", icon: "user" },
]

type Props = {
  onRoleChange: (role: Role) => void
  theme: string
  onTheme: () => void
}

export default function StudentApp(props: Props) {
  const [page, setPage] = useState("home")
  const [toast, setToast] = useState("")
  const titles: Record<string, [string, string]> = {
    home: ["سلام آرین، آماده‌ای؟", "دوشنبه، ۴ فروردین ۱۴۰۵"],
    lessons: ["درس‌های من", "مسیر یادگیری خودت را ادامه بده"],
    exams: ["آزمون‌ها", "برنامه‌ریزی و نتایج آزمون‌های تو"],
    analytics: ["تحلیل یادگیری", "تصویر دقیق‌تری از پیشرفتت"],
    assistant: ["یارِ درس", "پرسش‌هایت را با منبع بپرس"],
    profile: ["پروفایل من", "حساب و دستاوردهای تو"],
  }
  const [title, subtitle] = titles[page]
  return (
    <AppShell
      {...props}
      role="student"
      page={page}
      setPage={setPage}
      nav={nav}
      title={title}
      subtitle={subtitle}
      headerVisual={
        <div className="student-header-visual">
          <code>
            print(<b>"سلام"</b>)
          </code>
          <i />
          <span className="streak">۱۲ روز پیوسته</span>
          <ProgressRing value={68} size={52} />
        </div>
      }
    >
      {page === "home" && <StudentHome navigate={setPage} />}
      {page === "lessons" && (
        <Lessons onDone={() => setToast("درس با موفقیت تکمیل شد")} />
      )}
      {page === "exams" && <Exams />}
      {page === "analytics" && <Analytics />}
      {page === "assistant" && <Assistant />}
      {page === "profile" && <Profile />}
      {toast && <Toast message={toast} onDone={() => setToast("")} />}
    </AppShell>
  )
}

function StudentHome({ navigate }: { navigate: (id: string) => void }) {
  return (
    <div className="dashboard-grid">
      <section className="hero-course card entrance">
        <div className="eyebrow">
          <span className="live-dot" /> ادامهٔ یادگیری
        </div>
        <div className="course-main">
          <div>
            <span className="course-tag">پایتون مقدماتی</span>
            <h2>حلقه‌ها و ساختارهای تکرار</h2>
            <p>جلسهٔ ۵ از ۱۲ · حدود ۱۸ دقیقه</p>
          </div>
          <div className="lesson-illustration">
            <code>for i in range(5):</code>
            <code>　print(i)</code>
            <span className="floating-shape one" />
            <span className="floating-shape two" />
          </div>
        </div>
        <div className="course-progress">
          <span>پیشرفت دوره</span>
          <strong>۶۲٪</strong>
        </div>
        <ProgressBar value={62} />
        <button className="btn primary" onClick={() => navigate("lessons")}>
          <Icon name="play" /> ادامهٔ درس
        </button>
      </section>
      <section className="next-exam card entrance">
        <div className="section-top">
          <div>
            <span className="eyebrow amber">آزمون بعدی</span>
            <h2>میان‌ترم پایتون</h2>
          </div>
          <span className="icon-box amber">
            <Icon name="exam" />
          </span>
        </div>
        <p className="exam-meta">
          <Icon name="clock" /> چهارشنبه ۶ فروردین، ساعت ۱۰:۰۰
        </p>
        <Countdown target="2026-03-25T10:00:00" />
        <button className="btn secondary" onClick={() => navigate("exams")}>
          جزئیات آزمون <Icon name="arrow" />
        </button>
      </section>
      <div className="stats-row">
        <StatCard
          icon="chart"
          label="میانگین نمره"
          value="۸۷.۵"
          hint="۳.۲٪ رشد"
        />
        <StatCard icon="book" label="درس باقی‌مانده" value="۷ درس" tone="teal" />
        <StatCard
          icon="exam"
          label="آزمون پیش‌رو"
          value="۲ آزمون"
          tone="amber"
        />
      </div>
      <section className="card weekly entrance">
        <div className="section-top">
          <div>
            <span className="eyebrow">این هفته</span>
            <h2>ریتم یادگیری تو</h2>
          </div>
          <span className="chip teal">عالی پیش می‌ری</span>
        </div>
        <div className="week-bars">
          {["ش", "ی", "د", "س", "چ", "پ", "ج"].map((d, i) => (
            <div key={d}>
              <span style={{ height: `${[35, 62, 46, 82, 70, 54, 22][i]}%` }} />
              <small>{d}</small>
            </div>
          ))}
        </div>
      </section>
      <section className="card recent entrance">
        <div className="section-top">
          <h2>فعالیت‌های اخیر</h2>
          <button className="link-btn">مشاهده همه</button>
        </div>
        <DataList
          items={[
            {
              title: "تمرین حلقه‌های تو در تو",
              meta: "امروز، ۱۱:۴۵",
              status: "کامل",
              tone: "green",
            },
            {
              title: "کوییز متغیرها",
              meta: "دیروز، ۱۶:۲۰",
              status: "نمره ۹۰",
              tone: "purple",
            },
            {
              title: "ویدیوی شرط‌ها",
              meta: "۲ روز پیش",
              status: "۱۲ دقیقه",
              tone: "gray",
            },
          ]}
        />
      </section>
    </div>
  )
}

function Lessons({ onDone }: { onDone: () => void }) {
  const [ran, setRan] = useState(false)
  return (
    <div className="lesson-layout">
      <section className="lesson-content">
        <div className="card lesson-head">
          <div>
            <span className="course-tag">پایتون مقدماتی</span>
            <h2>حلقه‌ها و ساختارهای تکرار</h2>
            <p>مدرس: سارا احمدی · جلسهٔ ۳ از ۱۲</p>
          </div>
          <ProgressRing value={25} />
        </div>
        <div className="stepper">
          {["ویدیو", "توضیح", "مثال", "تمرین", "آزمون"].map((x, i) => (
            <span className={i < 2 ? "done" : ""} key={x}>
              <i>{i < 2 ? "✓" : toFa(i + 1)}</i>
              {x}
            </span>
          ))}
        </div>
        <article className="lesson-block video-block">
          <div className="video-screen">
            <button aria-label="پخش ویدیو">
              <Icon name="play" />
            </button>
            <div className="video-code">for item in lessons:</div>
          </div>
          <div className="video-controls">
            <span>ادامه از ۰۸:۳۴</span>
            <button>1× سرعت</button>
            <button>CC زیرنویس</button>
          </div>
        </article>
        <article className="lesson-block">
          <span className="block-label">توضیح</span>
          <h3>چرا به حلقه نیاز داریم؟</h3>
          <p>
            حلقه‌ها به ما کمک می‌کنند یک کار را بدون تکرار دستی کد، چند بار اجرا
            کنیم. در پایتون حلقهٔ <code>for</code> برای پیمایش مجموعه‌ها استفاده
            می‌شود.
          </p>
        </article>
        <article className="lesson-block example">
          <span className="block-label">مثال</span>
          <h3>چاپ اعداد یک تا پنج</h3>
          <pre>
            <code>for number in range(1, 6):{"\n"} print(number)</code>
          </pre>
          <button className="btn primary small" onClick={() => setRan(true)}>
            <Icon name="play" /> اجرا
          </button>
          {ran && <div className="code-output">خروجی: ۱　۲　۳　۴　۵</div>}
        </article>
        <article className="lesson-block tip">
          <b>نکته</b>
          <p>تابع range عدد انتهایی را در بازه قرار نمی‌دهد.</p>
        </article>
        <article className="lesson-block">
          <span className="block-label">تمرین سریع</span>
          <h3>اعداد زوج صفر تا ده را چاپ کن.</h3>
          <textarea
            aria-label="پاسخ تمرین"
            placeholder="کدت را اینجا بنویس..."
          />
          <button className="btn secondary">بررسی پاسخ</button>
        </article>
        <div className="lesson-actions">
          <button className="btn ghost">درس قبلی</button>
          <button className="btn primary" onClick={onDone}>
            تکمیل درس
          </button>
          <button className="btn secondary">درس بعدی</button>
        </div>
      </section>
      <aside className="lesson-outline card">
        <h3>مسیر این جلسه</h3>
        {[
          "ویدیوی آموزشی",
          "مفهوم حلقه",
          "یک مثال واقعی",
          "تمرین کدنویسی",
          "آزمون کوتاه",
        ].map((x, i) => (
          <button className={i === 1 ? "active" : ""} key={x}>
            <span>{toFa(i + 1)}</span>
            {x}
          </button>
        ))}
      </aside>
    </div>
  )
}

function Exams() {
  const [tab, setTab] = useState<"future" | "past">("future")
  return (
    <section className="card content-card">
      <div className="tabs">
        <button
          className={tab === "future" ? "active" : ""}
          onClick={() => setTab("future")}
        >
          پیش‌رو <span>۲</span>
        </button>
        <button
          className={tab === "past" ? "active" : ""}
          onClick={() => setTab("past")}
        >
          گذشته
        </button>
      </div>
      {tab === "future" ? (
        <div className="exam-cards">
          {[
            ["میان‌ترم پایتون", "2026-03-25T10:00:00", "۴۵ دقیقه", "۲۰ سؤال"],
            [
              "کوییز تفکر الگوریتمی",
              "2026-04-02T14:30:00",
              "۲۰ دقیقه",
              "۱۰ سؤال",
            ],
          ].map((x, i) => (
            <article className="exam-card" key={x[0]}>
              <div className="exam-date">
                <b>{toFa(i ? 13 : 6)}</b>
                <span>فروردین</span>
              </div>
              <div className="exam-info">
                <span className="course-tag">
                  {i ? "تفکر الگوریتمی" : "پایتون مقدماتی"}
                </span>
                <h3>{x[0]}</h3>
                <p>
                  {formatJalali(x[1])} · ساعت {i ? "۱۴:۳۰" : "۱۰:۰۰"} · {x[2]} ·{" "}
                  {x[3]}
                </p>
                <Countdown target={x[1]} />
              </div>
              <div className="exam-action">
                <button className="btn primary" disabled>
                  شروع آزمون
                </button>
                <small>آزمون ۱۰ دقیقه پیش از شروع فعال می‌شود</small>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div>
          <div className="filters">
            <select aria-label="فیلتر دوره">
              <option>همهٔ دوره‌ها</option>
              <option>پایتون مقدماتی</option>
            </select>
            <select aria-label="مرتب‌سازی">
              <option>جدیدترین</option>
              <option>بالاترین نمره</option>
            </select>
          </div>
          {[
            ["کوییز شرط‌ها", 90, true],
            ["آزمون فصل اول", 72, true],
            ["کوییز متغیرها", 54, false],
          ].map(([x, s, p]) => (
            <article className="past-exam" key={String(x)}>
              <div>
                <h3>{x}</h3>
                <span className={`chip ${p ? "green" : "red"}`}>
                  {p ? "قبول" : "مردود"}
                </span>
              </div>
              <strong>
                {toFa(Number(s))}
                <small>/۱۰۰</small>
              </strong>
              <ProgressBar value={Number(s)} tone={p ? "teal" : "red"} />
              <button className="btn secondary">تحلیل آزمون</button>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

function Analytics() {
  return (
    <div className="analytics-grid">
      <div className="stats-row full">
        <StatCard icon="chart" label="میانگین کل" value="۸۷.۵" />
        <StatCard icon="exam" label="بهترین نمره" value="۹۶" tone="teal" />
        <StatCard
          icon="arrow"
          label="روند این ماه"
          value="۸.۴٪ +"
          tone="amber"
        />
      </div>
      <section className="card chart-card">
        <div className="section-top">
          <div>
            <span className="eyebrow">۶ ماه اخیر</span>
            <h2>روند نمرات</h2>
          </div>
          <select>
            <option>همهٔ دوره‌ها</option>
          </select>
        </div>
        <LineChart />
      </section>
      <section className="card skill-card">
        <h2>نقاط قوت و فرصت رشد</h2>
        {[
          ["حلقه‌ها", 92, "teal"],
          ["متغیرها", 84, "teal"],
          ["توابع", 71, "amber"],
          ["لیست‌ها", 48, "red"],
        ].map(([x, v, t]) => (
          <div className="skill-row" key={x}>
            <span>{x}</span>
            <ProgressBar value={Number(v)} tone={String(t)} />
            <b>{toFa(Number(v))}٪</b>
          </div>
        ))}
      </section>
      <section className="card comparison">
        <span className="eyebrow">مقایسهٔ ناشناس</span>
        <h2>تو بالاتر از میانگین کلاسی</h2>
        <div className="compare-bars">
          <span style={{ height: "87%" }}>
            <b>۸۷</b>
            <small>شما</small>
          </span>
          <span className="muted-bar" style={{ height: "73%" }}>
            <b>۷۳</b>
            <small>کلاس</small>
          </span>
        </div>
      </section>
      <section className="card suggestions">
        <h2>پیشنهادهای بهبود</h2>
        <DataList
          items={[
            {
              title: "مرور لیست‌های تو در تو",
              meta: "یک درس ۱۲ دقیقه‌ای",
              status: "شروع",
              tone: "purple",
            },
            {
              title: "حل ۳ تمرین تابع",
              meta: "برای تثبیت مفهوم پارامتر",
              status: "تمرین",
              tone: "teal",
            },
            {
              title: "مرور سؤال‌های اشتباه",
              meta: "۲ سؤال از آزمون اخیر",
              status: "مرور",
              tone: "amber",
            },
          ]}
        />
      </section>
    </div>
  )
}

function Assistant() {
  const [message, setMessage] = useState("")
  const [sent, setSent] = useState(false)
  return (
    <div className="chat-layout">
      <section className="card chat-main">
        <div className="chat-title">
          <span className="assistant-orb">
            <Icon name="sparkle" />
          </span>
          <div>
            <h2>یارِ درس نُوا</h2>
            <p>فقط از منابع همین درس پاسخ می‌دهم.</p>
          </div>
          <span className="chip green">آماده</span>
        </div>
        <div className="active-sources">
          <span>منابع فعال:</span>
          <button>درس حلقه‌ها ×</button>
          <button>جزوه من.pdf ×</button>
        </div>
        <div className="messages">
          <div className="message user">تفاوت while و for چیست؟</div>
          <div className="message ai">
            <p>
              از <code>for</code> وقتی استفاده می‌کنیم که روی یک مجموعه حرکت
              می‌کنیم یا تعداد تکرار مشخص است. <code>while</code> تا زمانی ادامه
              دارد که یک شرط برقرار باشد.
            </p>
            <button className="source-chip">
              <Icon name="book" /> درس حلقه‌ها · بلوک ۳
            </button>
          </div>
          {sent && (
            <>
              <div className="message user">{message}</div>
              <div className="message ai typing">
                <i />
                <i />
                <i />
                <span className="audio-wave">
                  {[1, 2, 3, 4, 5].map((x) => (
                    <b key={x} />
                  ))}
                </span>
              </div>
            </>
          )}
        </div>
        <form
          className="composer"
          onSubmit={(e) => {
            e.preventDefault()
            if (message.trim()) setSent(true)
          }}
        >
          <button type="button" aria-label="افزودن فایل">
            <Icon name="plus" />
          </button>
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="سؤالت را دربارهٔ این درس بپرس..."
            aria-label="پیام"
          />
          <button className="send" aria-label="ارسال">
            <Icon name="arrow" />
          </button>
        </form>
      </section>
      <aside className="card uploads">
        <h3>فایل‌های من</h3>
        <button className="upload-box">
          <Icon name="upload" />
          <b>افزودن منبع</b>
          <small>PDF، تصویر یا فایل py.</small>
        </button>
        <DataList
          items={[
            {
              title: "جزوه من.pdf",
              meta: "۲.۴ مگابایت",
              status: "آماده",
              tone: "green",
            },
            {
              title: "تمرین.py",
              meta: "در حال بررسی",
              status: "پردازش",
              tone: "amber",
            },
          ]}
        />
      </aside>
    </div>
  )
}

function Profile() {
  const [avatar, setAvatar] = useState(1)
  return (
    <div className="profile-grid">
      <section className="card profile-card">
        <Avatar seed={avatar} size={96} />
        <h2>آرین رضایی</h2>
        <p>دانش‌آموز · عضو از {formatJalali("2024-09-21")}</p>
        <button className="btn secondary">ویرایش اطلاعات حساب</button>
        <div className="account-info">
          <span>
            نام کاربری <b>arian.rezai</b>
          </span>
          <span>
            ایمیل <b>arian@nova.ir</b>
          </span>
        </div>
      </section>
      <section className="card avatar-gallery">
        <h2>انتخاب آواتار</h2>
        <p>یک چهره برای پروفایلت انتخاب کن.</p>
        <div>
          {Array.from({ length: 12 }, (_, i) => (
            <button
              aria-label={`آواتار ${i + 1}`}
              key={i}
              onClick={() => setAvatar(i)}
            >
              <Avatar seed={i} size={68} selected={avatar === i} />
            </button>
          ))}
        </div>
      </section>
      <section className="card profile-progress">
        <h2>پیشرفت من</h2>
        <div>
          <ProgressRing value={68} size={88} label="درس‌ها" />
          <span>
            <b>۸ از ۱۲</b> درس کامل شده
          </span>
        </div>
        <div>
          <ProgressRing value={75} size={88} label="آزمون‌ها" />
          <span>
            <b>۶ از ۸</b> آزمون انجام شده
          </span>
        </div>
      </section>
      <section className="card password-flow">
        <div className="section-top">
          <h2>درخواست تغییر رمز</h2>
          <button className="btn secondary small">درخواست جدید</button>
        </div>
        <p>رمز عبور هیچ‌گاه نمایش داده نمی‌شود.</p>
        <div className="timeline">
          <span className="done">
            <i />
            ثبت‌شده<small>۲ فروردین، ۱۰:۲۵</small>
          </span>
          <span className="current">
            <i />
            در انتظار مدیر<small>در حال بررسی</small>
          </span>
          <span>
            <i />
            نتیجه درخواست<small>تأیید یا رد</small>
          </span>
        </div>
      </section>
    </div>
  )
}
