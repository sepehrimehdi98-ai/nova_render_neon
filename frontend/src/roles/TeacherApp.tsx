import { useState } from "react"
import type { Role } from "../api/platform"
import { AppShell, type NavItem } from "../components/AppShell"
import {
  DataList,
  LineChart,
  ProgressBar,
  StatCard,
  Toast,
} from "../components/UI"
import { Icon } from "../components/Icons"
import { toFa } from "../lib/format"

const nav: NavItem[] = [
  { id: "home", label: "خانه", icon: "home" },
  { id: "courses", label: "دوره‌ها", icon: "course" },
  { id: "builder", label: "سازنده درس", icon: "plus" },
  { id: "media", label: "رسانه و AI", icon: "media" },
  { id: "exams", label: "آزمون‌ها", icon: "exam" },
  { id: "analytics", label: "تحلیل", icon: "chart" },
  { id: "profile", label: "پروفایل", icon: "user" },
]
type Props = {
  onRoleChange: (role: Role) => void
  theme: string
  onTheme: () => void
}

export default function TeacherApp(props: Props) {
  const [page, setPage] = useState("home"),
    [toast, setToast] = useState("")
  const names: Record<string, string> = {
    home: "میز کار مدرس",
    courses: "دوره‌های من",
    builder: "سازندهٔ درس",
    media: "رسانه و هوش مصنوعی",
    exams: "مدیریت آزمون‌ها",
    analytics: "تحلیل کلاس",
    profile: "پروفایل مدرس",
  }
  return (
    <AppShell
      {...props}
      role="teacher"
      page={page}
      setPage={setPage}
      nav={nav}
      title={names[page]}
      subtitle="امروز چه چیزی می‌سازیم؟"
      headerVisual={
        <>
          <div className="floating-blocks">
            <i />
            <i />
            <i />
          </div>
          <span className="save-state">
            <i /> ذخیره‌شده
          </span>
        </>
      }
    >
      {page === "home" && <TeacherHome navigate={setPage} />}
      {page === "courses" && <Courses />}
      {page === "builder" && (
        <Builder done={() => setToast("نسخهٔ ۱۲ با موفقیت منتشر شد")} />
      )}
      {page === "media" && <Media />}
      {page === "exams" && <ExamBuilder />}
      {page === "analytics" && <TeacherAnalytics />}
      {page === "profile" && <TeacherProfile />}
      {toast && <Toast message={toast} onDone={() => setToast("")} />}
    </AppShell>
  )
}

function TeacherHome({ navigate }: { navigate: (x: string) => void }) {
  return (
    <div className="dashboard-grid">
      <div className="stats-row full">
        <StatCard icon="book" label="پیش‌نویس‌ها" value="۴ درس" />
        <StatCard
          icon="clock"
          label="منتظر بازبینی"
          value="۲ مورد"
          tone="amber"
        />
        <StatCard icon="users" label="نیازمند توجه" value="۶ نفر" tone="red" />
      </div>
      <section className="card draft-list">
        <div className="section-top">
          <div>
            <span className="eyebrow">ادامهٔ کار</span>
            <h2>پیش‌نویس‌های اخیر</h2>
          </div>
          <button className="btn primary" onClick={() => navigate("builder")}>
            <Icon name="plus" /> درس جدید
          </button>
        </div>
        <DataList
          items={[
            {
              title: "توابع و پارامترها",
              meta: "ویرایش ۲ ساعت پیش",
              status: "۷۰٪",
              tone: "purple",
            },
            {
              title: "پروژهٔ ماشین حساب",
              meta: "ویرایش دیروز",
              status: "۴۵٪",
              tone: "amber",
            },
            {
              title: "مقدمهٔ لیست‌ها",
              meta: "۳ روز پیش",
              status: "۹۰٪",
              tone: "green",
            },
          ]}
        />
      </section>
      <section className="card attention">
        <h2>دانش‌آموزان نیازمند توجه</h2>
        {[
          ["نیما کاویانی", "۳ درس عقب‌تر", "red"],
          ["پرنیان نادری", "افت ۱۸٪ نمره", "amber"],
          ["مانی حکیمی", "۷ روز غیرفعال", "red"],
        ].map(([n, m, t], i) => (
          <div className="student-row" key={n}>
            <span className={`mini-avatar a${i}`}>{n[0]}</span>
            <div>
              <b>{n}</b>
              <small>{m}</small>
            </div>
            <span className={`chip ${t}`}>پیگیری</span>
          </div>
        ))}
      </section>
      <section className="card upcoming">
        <h2>آزمون‌های پیش‌رو</h2>
        <div className="calendar-tile">
          <b>۰۶</b>
          <span>فروردین</span>
        </div>
        <div>
          <h3>میان‌ترم پایتون</h3>
          <p>۳۸ دانش‌آموز · ۲۰ سؤال</p>
        </div>
        <button className="icon-button">
          <Icon name="arrow" />
        </button>
      </section>
    </div>
  )
}

function Courses() {
  const [order, setOrder] = useState([
    "مقدمه و نصب",
    "متغیرها و انواع داده",
    "شرط‌ها",
    "حلقه‌ها",
  ])
  const move = (i: number, d: number) => {
    const n = [...order],
      j = i + d
    if (j < 0 || j >= n.length) return
    ;[n[i], n[j]] = [n[j], n[i]]
    setOrder(n)
  }
  return (
    <div className="courses-layout">
      <section className="card course-summary">
        <div className="course-cover python">
          <span>PY</span>
        </div>
        <div>
          <span className="chip green">در حال انتشار</span>
          <h2>پایتون مقدماتی</h2>
          <p>۱۲ درس · ۳۸ دانش‌آموز</p>
          <ProgressBar value={78} />
          <button className="btn secondary">ویرایش دوره</button>
        </div>
      </section>
      <section className="card order-list">
        <div className="section-top">
          <div>
            <h2>ترتیب درس‌ها</h2>
            <p>بکشید یا از دکمه‌های جابه‌جایی استفاده کنید.</p>
          </div>
          <button className="btn primary">
            <Icon name="plus" /> افزودن درس
          </button>
        </div>
        {order.map((x, i) => (
          <div className="order-row" draggable key={x}>
            <span className="drag">⠿</span>
            <span className="row-index">{toFa(i + 1)}</span>
            <div>
              <b>{x}</b>
              <small>{i === 3 ? "پیش‌نویس" : "منتشرشده"}</small>
            </div>
            <button onClick={() => move(i, -1)} aria-label="بالا">
              ↑
            </button>
            <button onClick={() => move(i, 1)} aria-label="پایین">
              ↓
            </button>
          </div>
        ))}
      </section>
    </div>
  )
}

const initialBlocks = [
  "ویدیو: حلقه‌های پایتون",
  "عنوان: ساختار تکرار",
  "متن: در این جلسه...",
  "کد: for i in range(5)",
  "تمرین: اعداد زوج را چاپ کن",
  "سؤال: خروجی کد چیست؟",
]
function Builder({ done }: { done: () => void }) {
  const [blocks, setBlocks] = useState(initialBlocks),
    [selected, setSelected] = useState(1),
    [preview, setPreview] = useState("desktop")
  const add = (name: string) => {
    setBlocks([...blocks, `${name}: بلوک تازه`])
    setSelected(blocks.length)
  }
  return (
    <div className="builder-page">
      <div className="builder-toolbar">
        <div>
          <button className="icon-button">↶</button>
          <button className="icon-button">↷</button>
          <span>نسخهٔ ۱۲ · ذخیره خودکار</span>
        </div>
        <div className="device-switch">
          {["mobile", "tablet", "desktop"].map((x) => (
            <button
              className={preview === x ? "active" : ""}
              onClick={() => setPreview(x)}
              key={x}
            >
              {x === "mobile" ? "موبایل" : x === "tablet" ? "تبلت" : "دسکتاپ"}
            </button>
          ))}
        </div>
        <button className="btn primary" onClick={done}>
          انتشار درس
        </button>
      </div>
      <div className="builder-grid">
        <aside className="builder-palette card">
          <h3>بلوک‌ها</h3>
          <div className="palette-grid">
            {[
              "ویدیو",
              "عنوان",
              "متن",
              "تصویر",
              "کد",
              "تمرین",
              "سؤال",
              "نکته",
              "پیشنهاد AI",
            ].map((x) => (
              <button onClick={() => add(x)} key={x}>
                <Icon
                  name={
                    x === "ویدیو"
                      ? "play"
                      : x === "تصویر"
                        ? "media"
                        : x === "پیشنهاد AI"
                          ? "sparkle"
                          : "plus"
                  }
                />
                {x}
              </button>
            ))}
          </div>
          <button
            className="template-button"
            onClick={() => setBlocks(initialBlocks)}
          >
            <Icon name="sparkle" />
            <span>
              <b>قالب کلاس</b>
              <small>ساخت خودکار ۶ بلوک</small>
            </span>
          </button>
        </aside>
        <section className={`builder-canvas ${preview}`}>
          <div className="canvas-paper">
            <div className="canvas-head">
              <span>پیش‌نمایش درس</span>
              <b>حلقه‌ها و ساختارهای تکرار</b>
            </div>
            {blocks.map((x, i) => (
              <button
                className={`canvas-block ${selected === i ? "selected" : ""}`}
                key={`${x}-${i}`}
                onClick={() => setSelected(i)}
                onKeyDown={(e) => {
                  if (e.key === "Delete")
                    setBlocks(blocks.filter((_, j) => j !== i))
                }}
              >
                <span className="drag">⠿</span>
                <div>
                  <small>بلوک {toFa(i + 1)}</small>
                  <b>{x}</b>
                </div>
                {i === 0 && (
                  <span className="video-placeholder">
                    <Icon name="play" />
                  </span>
                )}
                {i === 3 && <pre>for i in range(5):{"\n"}　print(i)</pre>}
              </button>
            ))}
          </div>
        </section>
        <aside className="builder-properties card">
          <h3>ویژگی‌های بلوک</h3>
          <label>
            عنوان
            <input value={(blocks[selected] ?? "").split(":")[0]} readOnly />
          </label>
          <label>
            محتوا
            <textarea defaultValue={(blocks[selected] ?? "").split(":")[1]} />
          </label>
          <label>
            اندازه قلم
            <select>
              <option>۱۶</option>
              <option>۲۰</option>
              <option>۲۴</option>
              <option>۳۲</option>
            </select>
          </label>
          <label>
            رنگ متن
            <input type="color" defaultValue="#25223a" />
          </label>
          <button className="btn secondary">تکرار بلوک</button>
          <button
            className="btn danger"
            onClick={() => setBlocks(blocks.filter((_, i) => i !== selected))}
          >
            حذف بلوک
          </button>
        </aside>
      </div>
      <button className="fab">
        <Icon name="plus" /> افزودن
      </button>
    </div>
  )
}

function Media() {
  return (
    <div className="media-grid">
      <section className="card media-upload">
        <div className="section-top">
          <h2>رسانه‌های من</h2>
          <button className="btn primary">
            <Icon name="upload" /> بارگذاری
          </button>
        </div>
        <DataList
          items={[
            {
              title: "loops-intro.mp4",
              meta: "ویدیو · ۱۸۲ مگابایت",
              status: "تأییدشده",
              tone: "green",
            },
            {
              title: "worksheet.pdf",
              meta: "PDF · ۲.۸ مگابایت",
              status: "منتظر مدیر",
              tone: "amber",
            },
            {
              title: "cover.jpg",
              meta: "تصویر · رد شده: کیفیت کم",
              status: "ردشده",
              tone: "red",
            },
          ]}
        />
      </section>
      <section className="card ai-tools">
        <span className="assistant-orb">
          <Icon name="sparkle" />
        </span>
        <h2>ساخت با هوش مصنوعی</h2>
        <p>از فایل‌ها خلاصه، سؤال یا بلوک درس بساز.</p>
        {["خلاصه‌سازی ویدیو", "استخراج ۱۰ سؤال", "ساخت بلوک‌های درس"].map((x) => (
          <button className="ai-action" key={x}>
            {x}
            <Icon name="arrow" />
          </button>
        ))}
      </section>
      <section className="card upgrade">
        <div className="section-top">
          <div>
            <span className="eyebrow">ارتقای درس</span>
            <h2>نسخهٔ فعلی و پیشنهاد AI</h2>
          </div>
          <button className="btn primary">اعمال انتخاب‌ها</button>
        </div>
        <div className="upgrade-columns">
          <div>
            <b>نسخهٔ فعلی</b>
            <article>توضیح کوتاه حلقه‌ها</article>
            <article>یک مثال کد</article>
          </div>
          <div>
            <b>پیشنهاد نووا</b>
            <article className="suggested">
              مثال تعاملی حلقه{" "}
              <span>
                <button>✓</button>
                <button>×</button>
              </span>
            </article>
            <article className="suggested">
              آزمون کوتاه ۳ سؤالی{" "}
              <span>
                <button>✓</button>
                <button>×</button>
              </span>
            </article>
          </div>
        </div>
        <p className="note">هیچ تغییری بدون تأیید شما منتشر نمی‌شود.</p>
      </section>
    </div>
  )
}

function ExamBuilder() {
  return (
    <section className="card form-card">
      <div className="section-top">
        <div>
          <span className="eyebrow">آزمون جدید</span>
          <h2>مشخصات و زمان‌بندی</h2>
        </div>
        <span className="chip gray">پیش‌نویس</span>
      </div>
      <div className="form-grid">
        <label>
          عنوان آزمون
          <input placeholder="مثلاً میان‌ترم پایتون" />
        </label>
        <label>
          دوره
          <select>
            <option>پایتون مقدماتی</option>
          </select>
        </label>
        <label>
          مدت آزمون
          <input value="۴۵ دقیقه" readOnly />
        </label>
        <label>
          نمرهٔ قبولی
          <input value="۶۰ از ۱۰۰" readOnly />
        </label>
        <label>
          تاریخ شمسی
          <input value="۱۴۰۵/۰۱/۰۶" readOnly />
        </label>
        <label>
          ساعت
          <input value="۱۰:۰۰" readOnly />
        </label>
      </div>
      <div className="question-builder">
        <h3>سؤال‌ها</h3>
        <DataList
          items={[
            {
              title: "خروجی حلقهٔ زیر چیست؟",
              meta: "چهارگزینه‌ای · ۵ نمره",
              status: "ویرایش",
            },
            {
              title: "یک حلقه for بنویسید",
              meta: "تشریحی · ۱۰ نمره",
              status: "ویرایش",
            },
          ]}
        />
        <button className="btn secondary">
          <Icon name="plus" /> افزودن سؤال
        </button>
      </div>
      <div className="form-actions">
        <button className="btn secondary">ذخیره پیش‌نویس</button>
        <button className="btn primary">انتشار آزمون</button>
      </div>
    </section>
  )
}

function TeacherAnalytics() {
  return (
    <div className="analytics-grid">
      <div className="stats-row full">
        <StatCard icon="chart" label="میانگین کلاس" value="۷۳.۸" />
        <StatCard
          icon="users"
          label="دانش‌آموز فعال"
          value="۳۴ از ۳۸"
          tone="teal"
        />
        <StatCard icon="book" label="نرخ تکمیل" value="۷۶٪" tone="amber" />
      </div>
      <section className="card chart-card">
        <h2>توزیع نمرات کلاس</h2>
        <div className="histogram">
          {[12, 25, 43, 68, 88, 72, 48, 24].map((x, i) => (
            <span key={i} style={{ height: `${x}%` }}>
              <small>{toFa(i * 10 + 20)}</small>
            </span>
          ))}
        </div>
      </section>
      <section className="card skill-card">
        <h2>سخت‌ترین سؤال‌ها</h2>
        {[
          ["سؤال ۱۲: حلقه تو در تو", 38],
          ["سؤال ۷: range", 52],
          ["سؤال ۱۵: break", 61],
        ].map(([x, v]) => (
          <div className="skill-row" key={String(x)}>
            <span>{x}</span>
            <ProgressBar value={Number(v)} tone="red" />
            <b>{toFa(Number(v))}٪</b>
          </div>
        ))}
      </section>
      <section className="card students-table">
        <div className="section-top">
          <h2>وضعیت دانش‌آموزان</h2>
          <div>
            <button className="btn secondary small">خروجی CSV</button>
          </div>
        </div>
        <DataList
          items={[
            {
              title: "نیما کاویانی",
              meta: "میانگین ۵۴ · آخرین فعالیت ۷ روز پیش",
              status: "ریسک بالا",
              tone: "red",
            },
            {
              title: "پرنیان نادری",
              meta: "میانگین ۶۸ · افت اخیر",
              status: "پیگیری",
              tone: "amber",
            },
            {
              title: "آرین رضایی",
              meta: "میانگین ۸۷ · فعال امروز",
              status: "خوب",
              tone: "green",
            },
          ]}
        />
      </section>
    </div>
  )
}

function TeacherProfile() {
  return (
    <div className="profile-grid">
      <section className="card profile-card">
        <span className="mini-avatar a1 large">س</span>
        <h2>سارا احمدی</h2>
        <p>مدرس پایتون · عضو از مهر ۱۴۰۲</p>
        <button className="btn secondary">ویرایش اطلاعات</button>
      </section>
      <section className="card avatar-gallery">
        <h2>دوره‌های در حال تدریس</h2>
        <DataList
          items={[
            {
              title: "پایتون مقدماتی",
              meta: "۳۸ دانش‌آموز · ۱۲ درس",
              status: "فعال",
              tone: "green",
            },
            {
              title: "پایتون پروژه‌محور",
              meta: "۲۴ دانش‌آموز · ۸ درس",
              status: "فعال",
              tone: "green",
            },
          ]}
        />
      </section>
      <section className="card password-flow">
        <h2>امنیت حساب</h2>
        <p>
          برای تغییر رمز درخواست امن ثبت کنید؛ رمز فعلی هیچ‌گاه نمایش داده
          نمی‌شود.
        </p>
        <button className="btn primary">درخواست تغییر رمز</button>
      </section>
    </div>
  )
}
