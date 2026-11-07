import {api} from '../../src/live/api';
import {useEffect,useRef} from 'react';
import { FormEvent, useMemo, useState } from "react"
import {
  Activity,
  Bell,
  Bot,
  Check,
  ChevronLeft,
  CircleGauge,
  Clock3,
  GraduationCap,
  LayoutDashboard,
  LifeBuoy,
  Menu,
  MessageSquareText,
  MoreHorizontal,
  Plus,
  Search,
  Send,
  Server,
  Settings,
  ShieldCheck,
  Sparkles,
  Trash2,
  UserRound,
  Users,
  X,
  Zap,
} from "lucide-react"

type Page = "dashboard" | "health" | "tickets" | "students"
type Ticket = {
  id: number
  title: string
  sender: string
  role: "معلم" | "دانش‌آموز"
  time: string
  status: "باز" | "در حال بررسی" | "پاسخ داده شده"
  priority: "فوری" | "عادی"
  message: string
}
type Student = {
  id: number
  name: string
  code: string
  className: string
  status: "فعال" | "غیرفعال"
}

const initialTickets: Ticket[] = [
  {
    id: 1048,
    title: "عدم نمایش نمره آزمون ریاضی",
    sender: "خانم احمدی",
    role: "معلم",
    time: "۱۲ دقیقه پیش",
    status: "باز",
    priority: "فوری",
    message:
      "سلام، نمره‌های آزمون فصل چهارم برای چند دانش‌آموز در پنل کلاس نمایش داده نمی‌شود. لطفاً بررسی کنید.",
  },
  {
    id: 1047,
    title: "مشکل ورود به کلاس آنلاین",
    sender: "پارسا رستمی",
    role: "دانش‌آموز",
    time: "۳۵ دقیقه پیش",
    status: "در حال بررسی",
    priority: "عادی",
    message:
      "لینک کلاس آنلاین امروز برای من باز نمی‌شود و پیام خطای دسترسی می‌بینم.",
  },
  {
    id: 1046,
    title: "درخواست ویرایش زمان تکلیف",
    sender: "آقای نادری",
    role: "معلم",
    time: "۱ ساعت پیش",
    status: "باز",
    priority: "عادی",
    message: "زمان تحویل تکلیف علوم اشتباه ثبت شده و امکان ویرایش آن را ندارم.",
  },
  {
    id: 1045,
    title: "بازیابی رمز عبور",
    sender: "نورا محمدی",
    role: "دانش‌آموز",
    time: "۲ ساعت پیش",
    status: "پاسخ داده شده",
    priority: "عادی",
    message: "ایمیل بازیابی رمز عبور برای من ارسال نشده است.",
  },
]

const initialStudents: Student[] = [
  {
    id: 1,
    name: "باران زمانی",
    code: "NV-۱۴۰۳۲۱",
    className: "نهم - الف",
    status: "فعال",
  },
  {
    id: 2,
    name: "آراد فرهمند",
    code: "NV-۱۴۰۳۱۸",
    className: "هشتم - ب",
    status: "فعال",
  },
  {
    id: 3,
    name: "یسنا محمودی",
    code: "NV-۱۴۰۲۹۵",
    className: "دهم - تجربی",
    status: "فعال",
  },
  {
    id: 4,
    name: "سام یوسفی",
    code: "NV-۱۴۰۲۸۰",
    className: "هفتم - الف",
    status: "غیرفعال",
  },
  {
    id: 5,
    name: "رستا کریمی",
    code: "NV-۱۴۰۲۵۱",
    className: "نهم - ب",
    status: "فعال",
  },
]

const pageMeta: Record<Page, { title: string; subtitle: string }> = {
  dashboard: {
    title: "صبح بخیر، سرپرست نوا",
    subtitle: "همه‌چیز تحت کنترل است؛ این هم نمای امروز پلتفرم.",
  },
  health: {
    title: "سلامت پلتفرم",
    subtitle: "وضعیت لحظه‌ای سرویس‌ها، مصرف منابع و رخدادهای نوا.",
  },
  tickets: {
    title: "مرکز پشتیبانی",
    subtitle: "گفت‌وگو با معلم‌ها و دانش‌آموزان، بدون شلوغی.",
  },
  students: {
    title: "مدیریت دانش‌آموزان",
    subtitle: "ثبت‌نام، جست‌وجو و مدیریت اعضای مدرسه.",
  },
}

function Avatar({ name, dark = false }: { name: string; dark?: boolean }) {
  return (
    <div className={`avatar ${dark ? "avatar-dark" : ""}`}>
      {name.trim().charAt(0)}
    </div>
  )
}

function StatusDot({ status = "good" }: { status?: "good" | "warn" | "bad" }) {
  return <span className={`status-dot ${status}`} />
}

export default function App() {
  const [page, setPage] = useState<Page>("dashboard")
  const [menuOpen, setMenuOpen] = useState(false)
  const [tickets, setTickets] = useState(initialTickets)
  const [selectedTicket, setSelectedTicket] = useState<Ticket>(
    initialTickets[0],
  )
  const [reply, setReply] = useState("")
  const [students, setStudents] = useState(initialStudents)
  const [search, setSearch] = useState("")
  const [showAddStudent, setShowAddStudent] = useState(false)
  const [notice, setNotice] = useState("")

  const revisions=useRef<Record<string,number>>({});
  useEffect(()=>{Promise.all(['students','tickets'].map(async section=>{
    const result=await api('/sample-state/'+section);
    revisions.current[section]=result.revision;
    if(result.value===null)return;
    if(section==='students')setStudents(result.value);
    else {setTickets(result.value);if(result.value.length)setSelectedTicket(result.value[0])}
  })).catch(e=>setNotice(e.message))},[]);
  async function persist(section:string,value:unknown){
    if(revisions.current[section]===undefined)throw Error('ابتدا داده‌ها را بارگذاری کنید.');
    const result=await api('/sample-state/'+section,{value,revision:revisions.current[section]});
    revisions.current[section]=result.revision;
  }
  const navigate = (next: Page) => {
    setPage(next)
    setMenuOpen(false)
  }

  const toast = (message: string) => {
    setNotice(message)
    window.setTimeout(() => setNotice(""), 2600)
  }

  const submitReply = async (e: FormEvent) => {
    e.preventDefault()
    if (!reply.trim()) return
    const updated={...selectedTicket,status:'پاسخ داده شده' as const,message:selectedTicket.message+'\n'+reply.trim()};
    const next=tickets.map(t=>t.id===updated.id?updated:t);
    try{await persist('tickets',next);setTickets(next);setSelectedTicket(updated)}catch(e){toast(String(e));return}
    setReply("")
    toast("پاسخ شما با موفقیت ثبت شد")
  }

  const addStudent = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const name = String(form.get("name") || "")
    const className = String(form.get("className") || "")
    if (!name || !className) return
    const next:Student[] = [
      {
        id: Date.now(),
        name,
        className,
        code: `NV-${Math.floor(140300 + Math.random() * 699)}`,
        status: "فعال",
      },
      ...students,
    ];
    try{await persist("students",next);setStudents(next)}catch(e){toast(String(e));return}
    setShowAddStudent(false)
    toast("دانش‌آموز جدید ثبت شد")
  }

  return (
    <div className="app-shell" dir="rtl">
      <aside className={`sidebar ${menuOpen ? "sidebar-open" : ""}`}>
        <div className="brand">
          <div className="brand-mark">
            <Sparkles size={21} />
          </div>
          <div>
            <strong>نوا</strong>
            <span>مرکز فرماندهی</span>
          </div>
        </div>
        <button
          className="close-menu"
          onClick={() => setMenuOpen(false)}
          aria-label="بستن منو"
        >
          <X />
        </button>
        <nav>
          <p className="nav-label">فضای کار</p>
          <NavButton
            active={page === "dashboard"}
            icon={<LayoutDashboard />}
            label="نمای کلی"
            onClick={() => navigate("dashboard")}
          />
          <NavButton
            active={page === "health"}
            icon={<Activity />}
            label="سلامت سامانه"
            onClick={() => navigate("health")}
          />
          <NavButton
            active={page === "tickets"}
            icon={<LifeBuoy />}
            label="تیکت‌ها"
            badge={tickets.filter((t) => t.status === "باز").length}
            onClick={() => navigate("tickets")}
          />
          <NavButton
            active={page === "students"}
            icon={<Users />}
            label="دانش‌آموزان"
            onClick={() => navigate("students")}
          />
          <p className="nav-label nav-label-second">تنظیمات</p>
          <NavButton
            icon={<Settings />}
            label="تنظیمات سامانه"
            onClick={() => toast("این بخش در نسخه نمایشی غیرفعال است")}
          />
        </nav>
        <div className="sidebar-bottom">
          <div className="online-box">
            <span>
              <StatusDot /> سامانه پایدار است
            </span>
            <b>۹۹.۹٪</b>
          </div>
          <div className="admin-profile">
            <Avatar name="سارا" dark />
            <div>
              <b>سارا کیانی</b>
              <span>سرپرست سامانه</span>
            </div>
            <MoreHorizontal size={19} />
          </div>
        </div>
      </aside>

      {menuOpen && (
        <button
          className="overlay"
          onClick={() => setMenuOpen(false)}
          aria-label="بستن منو"
        />
      )}

      <main>
        <header>
          <div className="header-title">
            <div className="greeting-icon">
              <span />
              <Settings />
            </div>
            <div>
              <h1>{pageMeta[page].title}</h1>
              <p>{pageMeta[page].subtitle}</p>
            </div>
          </div>
          <div className="header-actions">
            <button className="icon-button notification" aria-label="اعلان‌ها">
              <Bell size={20} />
              <i />
            </button>
            <div className="today">
              <Clock3 size={18} />
              <span>امروز، ۲۴ خرداد</span>
            </div>
            <button
              className="mobile-menu"
              onClick={() => setMenuOpen(true)}
              aria-label="باز کردن منو"
            >
              <Menu />
            </button>
          </div>
        </header>

        <div className="page-content">
          {page === "dashboard" && (
            <Dashboard navigate={navigate} tickets={tickets} />
          )}
          {page === "health" && <HealthPage />}
          {page === "tickets" && (
            <TicketsPage
              tickets={tickets}
              selected={selectedTicket}
              setSelected={setSelectedTicket}
              reply={reply}
              setReply={setReply}
              onSubmit={submitReply}
            />
          )}
          {page === "students" && (
            <StudentsPage
              students={students}
              setStudents={async next=>{await persist('students',next);setStudents(next)}}
              search={search}
              setSearch={setSearch}
              openAdd={() => setShowAddStudent(true)}
              toast={toast}
            />
          )}
        </div>
      </main>

      {showAddStudent && (
        <div
          className="modal-backdrop"
          onMouseDown={() => setShowAddStudent(false)}
        >
          <form
            className="modal"
            onSubmit={addStudent}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="modal-close"
              onClick={() => setShowAddStudent(false)}
            >
              <X />
            </button>
            <div className="modal-icon">
              <UserRound />
            </div>
            <h2>ثبت دانش‌آموز جدید</h2>
            <p>مشخصات اولیه را وارد کنید؛ کد عضویت خودکار ساخته می‌شود.</p>
            <label>
              نام و نام خانوادگی
              <input
                name="name"
                required
                placeholder="مثلاً نیما شریفی"
                autoFocus
              />
            </label>
            <label>
              کلاس
              <select name="className" required defaultValue="">
                <option value="" disabled>
                  انتخاب کلاس
                </option>
                <option>هفتم - الف</option>
                <option>هشتم - ب</option>
                <option>نهم - الف</option>
                <option>دهم - تجربی</option>
              </select>
            </label>
            <button className="primary-button full" type="submit">
              <Plus size={18} /> ثبت دانش‌آموز
            </button>
          </form>
        </div>
      )}
      {notice && (
        <div className="toast">
          <Check size={18} />
          {notice}
        </div>
      )}
    </div>
  )
}

function NavButton({
  icon,
  label,
  active,
  badge,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  active?: boolean
  badge?: number
  onClick: () => void
}) {
  return (
    <button className={`nav-item ${active ? "active" : ""}`} onClick={onClick}>
      {icon}
      <span>{label}</span>
      {badge ? <b>{badge}</b> : null}
    </button>
  )
}

function Dashboard({
  navigate,
  tickets,
}: {
  navigate: (page: Page) => void
  tickets: Ticket[]
}) {
  return (
    <>
      <section className="stats-grid">
        <StatCard
          className="paper-yellow tilt-right"
          icon={<Users />}
          value="۱,۲۸۴"
          label="دانش‌آموز فعال"
          change="۱۲٪ بیشتر از ماه قبل"
        />
        <StatCard
          className="paper-blue tilt-left"
          icon={<GraduationCap />}
          value="۸۶"
          label="معلم فعال"
          change="۴ نفر تازه پیوسته‌اند"
        />
        <StatCard
          className="paper-coral tilt-right-sm"
          icon={<MessageSquareText />}
          value={String(
            tickets.filter((t) => t.status !== "پاسخ داده شده").length,
          ).replace("3", "۳")}
          label="تیکت نیازمند توجه"
          change="۱ مورد با اولویت فوری"
          alert
        />
        <StatCard
          className="paper-green tilt-left-sm"
          icon={<CircleGauge />}
          value="۹۹.۹٪"
          label="آپ‌تایم این ماه"
          change="همه‌چیز روبه‌راه است"
        />
      </section>

      <section className="dashboard-grid">
        <div className="panel health-summary">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">نبض نوا</span>
              <h2>سلامت سامانه</h2>
            </div>
            <button onClick={() => navigate("health")}>
              جزئیات کامل <ChevronLeft size={17} />
            </button>
          </div>
          <div className="health-score">
            <div className="score-ring">
              <span>۹۴</span>
              <small>از ۱۰۰</small>
            </div>
            <div>
              <h3>عملکرد عالی</h3>
              <p>تمام سرویس‌های اصلی در دسترس هستند.</p>
              <span className="live-label">
                <StatusDot /> پایش زنده
              </span>
            </div>
          </div>
          <div className="service-row">
            <Service
              icon={<Server />}
              name="API اصلی"
              status="فعال"
              percent="۹۹.۹٪"
            />
            <Service
              icon={<Bot />}
              name="موتور هوش مصنوعی"
              status="فعال"
              percent="۹۸.۷٪"
            />
            <Service
              icon={<Zap />}
              name="پردازش تکالیف"
              status="کمی کند"
              percent="۸۷.۲٪"
              warn
            />
          </div>
        </div>

        <div className="panel tickets-summary">
          <div className="tape" />
          <div className="panel-heading">
            <div>
              <span className="eyebrow">صندوق ورودی</span>
              <h2>آخرین تیکت‌ها</h2>
            </div>
            <button onClick={() => navigate("tickets")}>
              مشاهده همه <ChevronLeft size={17} />
            </button>
          </div>
          <div className="mini-ticket-list">
            {tickets.slice(0, 3).map((ticket) => (
              <button key={ticket.id} onClick={() => navigate("tickets")}>
                <Avatar name={ticket.sender} />
                <div>
                  <b>{ticket.title}</b>
                  <span>
                    {ticket.sender} · {ticket.time}
                  </span>
                </div>
                <span
                  className={
                    ticket.priority === "فوری" ? "priority urgent" : "priority"
                  }
                >
                  {ticket.priority}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="activity-strip">
        <div className="activity-title">
          <span>
            <Activity />
          </span>
          <div>
            <b>امروز در نوا</b>
            <small>تا این لحظه</small>
          </div>
        </div>
        <ActivityItem value="۳,۸۴۲" label="ورود موفق" />
        <ActivityItem value="۷۲۱" label="تکلیف تحویل‌شده" />
        <ActivityItem value="۴,۶۹۰" label="پرسش از دستیار هوشمند" />
        <ActivityItem value="۱۲" label="کلاس آنلاین برگزارشده" />
      </section>
    </>
  )
}

function StatCard({
  icon,
  value,
  label,
  change,
  className,
  alert,
}: {
  icon: React.ReactNode
  value: string
  label: string
  change: string
  className: string
  alert?: boolean
}) {
  return (
    <article className={`stat-card ${className}`}>
      <div className="pin" />
      <div className="stat-top">
        <span>{icon}</span>
        {alert && <i>نیاز به اقدام</i>}
      </div>
      <strong>{value}</strong>
      <h3>{label}</h3>
      <p>{change}</p>
    </article>
  )
}

function Service({
  icon,
  name,
  status,
  percent,
  warn,
}: {
  icon: React.ReactNode
  name: string
  status: string
  percent: string
  warn?: boolean
}) {
  return (
    <div className="service">
      <span className="service-icon">{icon}</span>
      <div>
        <b>{name}</b>
        <span>
          <StatusDot status={warn ? "warn" : "good"} />
          {status}
        </span>
      </div>
      <strong>{percent}</strong>
    </div>
  )
}

function ActivityItem({ value, label }: { value: string; label: string }) {
  return (
    <div className="activity-item">
      <b>{value}</b>
      <span>{label}</span>
    </div>
  )
}

function HealthPage() {
  return (
    <>
      <div className="health-hero">
        <div className="score-ring large">
          <span>۹۴</span>
          <small>امتیاز سلامت</small>
        </div>
        <div>
          <span className="live-label">
            <StatusDot /> به‌روزرسانی همین حالا
          </span>
          <h2>نوا سرحال و آماده است</h2>
          <p>
            تمام سرویس‌های حیاتی فعال‌اند. یک افت جزئی در صف پردازش تکالیف دیده
            می‌شود.
          </p>
        </div>
        <div className="uptime-note">
          <ShieldCheck />
          <div>
            <b>۲۷ روز</b>
            <span>بدون قطعی جدی</span>
          </div>
        </div>
      </div>
      <div className="service-grid">
        <HealthService
          icon={<Server />}
          title="API اصلی"
          value="۹۹.۹٪"
          detail="پاسخ‌گویی ۱۸۰ میلی‌ثانیه"
          color="green"
        />
        <HealthService
          icon={<Bot />}
          title="هوش مصنوعی نوا"
          value="۹۸.۷٪"
          detail="۱,۲۰۸ درخواست در ساعت"
          color="blue"
        />
        <HealthService
          icon={<Zap />}
          title="پردازش تکالیف"
          value="۸۷.۲٪"
          detail="صف انتظار: ۲۴ درخواست"
          color="orange"
        />
        <HealthService
          icon={<ShieldCheck />}
          title="ورود و امنیت"
          value="۱۰۰٪"
          detail="بدون رخداد مشکوک"
          color="purple"
        />
      </div>
      <div className="lower-grid">
        <div className="panel usage-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">۷ روز گذشته</span>
              <h2>مصرف سامانه</h2>
            </div>
            <span className="metric-up">+ ۸.۴٪</span>
          </div>
          <div className="chart">
            <div className="chart-line" />
            <div className="chart-fill" />
            {["ش", "ی", "د", "س", "چ", "پ", "ج"].map((d, i) => (
              <span key={i}>{d}</span>
            ))}
          </div>
        </div>
        <div className="panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">گزارش رخداد</span>
              <h2>آخرین هشدارها</h2>
            </div>
          </div>
          <div className="incident">
            <span className="incident-icon warn">
              <Clock3 />
            </span>
            <div>
              <b>کندی پردازش فایل‌ها</b>
              <p>صف پردازش به‌صورت خودکار در حال تخلیه است.</p>
              <small>۱۸ دقیقه پیش</small>
            </div>
          </div>
          <div className="incident">
            <span className="incident-icon ok">
              <Check />
            </span>
            <div>
              <b>به‌روزرسانی API تکمیل شد</b>
              <p>نسخه جدید بدون قطعی مستقر شد.</p>
              <small>دیروز، ۲۳:۴۰</small>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

function HealthService({
  icon,
  title,
  value,
  detail,
  color,
}: {
  icon: React.ReactNode
  title: string
  value: string
  detail: string
  color: string
}) {
  return (
    <article className={`health-service ${color}`}>
      <div className="health-service-top">
        <span>{icon}</span>
        <StatusDot status={color === "orange" ? "warn" : "good"} />
      </div>
      <h3>{title}</h3>
      <b>{value}</b>
      <p>{detail}</p>
      <div className="progress">
        <i style={{ width: value }} />
      </div>
    </article>
  )
}

function TicketsPage({
  tickets,
  selected,
  setSelected,
  reply,
  setReply,
  onSubmit,
}: {
  tickets: Ticket[]
  selected: Ticket
  setSelected: (t: Ticket) => void
  reply: string
  setReply: (v: string) => void
  onSubmit: (e: FormEvent) => void
}) {
  const [filter, setFilter] = useState<"همه" | "باز">("همه")
  const shown =
    filter === "باز" ? tickets.filter((t) => t.status === "باز") : tickets
  return (
    <div className="tickets-layout">
      <section className="ticket-inbox">
        <div className="inbox-header">
          <div>
            <h2>تیکت‌ها</h2>
            <span>
              {tickets.filter((t) => t.status === "باز").length} تیکت باز
            </span>
          </div>
          <div className="segmented">
            <button
              className={filter === "همه" ? "active" : ""}
              onClick={() => setFilter("همه")}
            >
              همه
            </button>
            <button
              className={filter === "باز" ? "active" : ""}
              onClick={() => setFilter("باز")}
            >
              باز
            </button>
          </div>
        </div>
        <div className="ticket-list">
          {shown.map((ticket) => (
            <button
              key={ticket.id}
              className={selected.id === ticket.id ? "selected" : ""}
              onClick={() => setSelected(ticket)}
            >
              <Avatar name={ticket.sender} />
              <div>
                <div>
                  <b>{ticket.title}</b>
                  <small>{ticket.time}</small>
                </div>
                <p>
                  {ticket.sender} · {ticket.role}
                </p>
                <span
                  className={`ticket-status ${
                    ticket.status === "باز" ? "open" : ""
                  }`}
                >
                  {ticket.status}
                </span>
              </div>
            </button>
          ))}
        </div>
      </section>
      <section className="conversation">
        <div className="conversation-header">
          <div>
            <span className="ticket-code">#{selected.id}</span>
            <h2>{selected.title}</h2>
            <p>
              {selected.sender} · {selected.role}
            </p>
          </div>
          <span
            className={`ticket-status ${
              selected.status === "باز" ? "open" : ""
            }`}
          >
            {selected.status}
          </span>
        </div>
        <div className="messages">
          <div className="message incoming">
            <Avatar name={selected.sender} />
            <div>
              <p>{selected.message}</p>
              <span>{selected.time}</span>
            </div>
          </div>
          <div className="helper-note">
            <Sparkles size={16} />
            <span>
              پیشنهاد نوا: پیش از پاسخ، وضعیت حساب کاربر را بررسی کنید.
            </span>
          </div>
        </div>
        <form className="reply-box" onSubmit={onSubmit}>
          <textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            placeholder="پاسخ خود را اینجا بنویسید..."
          />
          <div>
            <span>پاسخ به عنوان «سرپرست نوا» ارسال می‌شود</span>
            <button type="submit">
              <Send size={17} /> ارسال پاسخ
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}

function StudentsPage({
  students,
  setStudents,
  search,
  setSearch,
  openAdd,
  toast,
}: {
  students: Student[]
  setStudents: (next:Student[])=>Promise<void>
  search: string
  setSearch: (v: string) => void
  openAdd: () => void
  toast: (s: string) => void
}) {
  const filtered = useMemo(
    () =>
      students.filter((s) =>
        `${s.name} ${s.code} ${s.className}`.includes(search),
      ),
    [students, search],
  )
  const remove = async (id: number) => {
    try{await setStudents(students.filter(student=>student.id!==id))}catch(e){toast(String(e));return}
    toast("دانش‌آموز از فهرست حذف شد")
  }
  return (
    <>
      <div className="student-actions">
        <label className="search-box">
          <Search size={19} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="جست‌وجوی نام، کد یا کلاس..."
          />
        </label>
        <button className="primary-button" onClick={openAdd}>
          <Plus size={18} /> ثبت دانش‌آموز جدید
        </button>
      </div>
      <section className="students-panel">
        <div className="table-heading">
          <div>
            <h2>فهرست دانش‌آموزان</h2>
            <p>
              {students.length.toLocaleString("fa-IR")} عضو ثبت‌شده در این نسخه
              نمایشی
            </p>
          </div>
          <span>
            <StatusDot />{" "}
            {students
              .filter((s) => s.status === "فعال")
              .length.toLocaleString("fa-IR")}{" "}
            نفر فعال
          </span>
        </div>
        <div className="student-table">
          <div className="table-row table-head">
            <span>دانش‌آموز</span>
            <span>کد عضویت</span>
            <span>کلاس</span>
            <span>وضعیت</span>
            <span>عملیات</span>
          </div>
          {filtered.map((student) => (
            <div className="table-row" key={student.id}>
              <span className="student-name">
                <Avatar name={student.name} />
                <b>{student.name}</b>
              </span>
              <span>{student.code}</span>
              <span>{student.className}</span>
              <span>
                <i
                  className={`student-status ${
                    student.status === "فعال" ? "active" : ""
                  }`}
                >
                  {student.status}
                </i>
              </span>
              <span>
                <button
                  className="delete-button"
                  onClick={() => remove(student.id)}
                  title="حذف دانش‌آموز"
                >
                  <Trash2 size={17} />
                </button>
              </span>
            </div>
          ))}
        </div>
        {!filtered.length && (
          <div className="empty-state">
            <Search />
            <h3>نتیجه‌ای پیدا نشد</h3>
            <p>عبارت دیگری را جست‌وجو کنید.</p>
          </div>
        )}
      </section>
    </>
  )
}
