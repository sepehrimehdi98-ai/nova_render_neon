import { useEffect, useState, type ReactNode } from "react"
import { Icon } from "./Icons"
import { toFa } from "../lib/format"

export function ProgressRing({
  value,
  size = 64,
  label,
}: {
  value: number
  size?: number
  label?: string
}) {
  const r = 26
  const circumference = 2 * Math.PI * r
  return (
    <div
      className="progress-ring"
      style={{ width: size, height: size }}
      aria-label={`${label ?? "پیشرفت"} ${toFa(value)} درصد`}
    >
      <svg viewBox="0 0 64 64">
        <circle className="ring-track" cx="32" cy="32" r={r} />
        <circle
          className="ring-value"
          cx="32"
          cy="32"
          r={r}
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - value / 100)}
        />
      </svg>
      <strong>{toFa(value)}٪</strong>
    </div>
  )
}

export function StatCard({
  icon,
  label,
  value,
  tone = "purple",
  hint,
}: {
  icon: Parameters<typeof Icon>[0]["name"]
  label: string
  value: string
  tone?: string
  hint?: string
}) {
  return (
    <article className="stat-card card entrance">
      <span className={`icon-box ${tone}`}>
        <Icon name={icon} />
      </span>
      <div>
        <span className="muted">{label}</span>
        <strong className="stat-value">{value}</strong>
        {hint && <small className="positive">{hint}</small>}
      </div>
    </article>
  )
}

export function ProgressBar({
  value,
  tone = "purple",
}: {
  value: number
  tone?: string
}) {
  return (
    <div
      className="progress"
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <span className={tone} style={{ inlineSize: `${value}%` }} />
    </div>
  )
}

export function LineChart() {
  const points = "10,83 58,67 106,72 154,42 202,50 250,22 298,28 346,12"
  return (
    <div className="chart-wrap" aria-label="نمودار روند نمرات">
      <div className="chart-grid">
        <span>۱۰۰</span>
        <span>۷۵</span>
        <span>۵۰</span>
        <span>۲۵</span>
      </div>
      <svg viewBox="0 0 356 100" preserveAspectRatio="none">
        <defs>
          <linearGradient id="area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#5b4bc4" stopOpacity=".24" />
            <stop offset="1" stopColor="#5b4bc4" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={`M${points} L346,100 L10,100 Z`} fill="url(#area)" />
        <polyline className="chart-line" points={points} />
        {points.split(" ").map((p) => {
          const [x, y] = p.split(",")
          return <circle key={p} cx={x} cy={y} r="3.5" />
        })}
      </svg>
      <div className="chart-labels">
        <span>مهر</span>
        <span>آبان</span>
        <span>آذر</span>
        <span>دی</span>
        <span>بهمن</span>
        <span>اسفند</span>
      </div>
    </div>
  )
}

export function DataList({
  items,
}: {
  items: { title: string; meta: string; status?: string; tone?: string }[]
}) {
  return (
    <div className="data-list">
      {items.map((item, index) => (
        <div className="data-row" key={item.title}>
          <span className="row-index">{toFa(index + 1)}</span>
          <div>
            <strong>{item.title}</strong>
            <small>{item.meta}</small>
          </div>
          {item.status && (
            <span className={`chip ${item.tone ?? ""}`}>{item.status}</span>
          )}
        </div>
      ))}
    </div>
  )
}

export function Avatar({
  seed = 1,
  size = 44,
  selected = false,
}: {
  seed?: number
  size?: number
  selected?: boolean
}) {
  const palettes = [
    ["#dad5ff", "#5b4bc4"],
    ["#c8f5ee", "#0f897c"],
    ["#ffe5bf", "#d37b14"],
    ["#ffd9df", "#d44a63"],
  ]
  const [bg, fg] = palettes[seed % palettes.length]
  return (
    <span
      className={`avatar ${selected ? "selected" : ""}`}
      style={{ width: size, height: size, background: bg, color: fg }}
    >
      <svg viewBox="0 0 48 48">
        <circle cx="24" cy="19" r="9" fill="currentColor" />
        <path d="M9 44c1-11 7-16 15-16s14 5 15 16" fill="currentColor" />
        {seed % 3 === 0 && (
          <path d="M15 17c1-9 17-11 19 0-7-3-12-3-19 0" fill="#25223a" />
        )}
      </svg>
    </span>
  )
}

export function EmptyState({
  title = "هنوز چیزی اینجا نیست",
  action = "ایجاد مورد جدید",
}: {
  title?: string
  action?: string
}) {
  return (
    <div className="state-box">
      <span className="state-art">
        <Icon name="book" />
      </span>
      <h3>{title}</h3>
      <p>با اولین قدم، محتوای این بخش اینجا نمایش داده می‌شود.</p>
      <button className="btn primary">{action}</button>
    </div>
  )
}

export function ErrorState({ retry }: { retry: () => void }) {
  return (
    <div className="state-box error">
      <h3>مشکلی پیش آمد</h3>
      <p>دریافت اطلاعات ممکن نشد. اتصال خود را بررسی کنید.</p>
      <button className="btn primary" onClick={retry}>
        تلاش دوباره
      </button>
    </div>
  )
}

export function Skeleton() {
  return (
    <div className="skeleton-grid" aria-label="در حال بارگذاری">
      <i />
      <i />
      <i />
      <i />
    </div>
  )
}

export function Toast({
  message,
  onDone,
}: {
  message: string
  onDone: () => void
}) {
  useEffect(() => {
    const id = setTimeout(onDone, 2800)
    return () => clearTimeout(id)
  }, [onDone])
  return (
    <div className="toast" role="status">
      <span>
        <Icon name="check" />
      </span>
      {message}
    </div>
  )
}

export function BottomSheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
}) {
  if (!open) return null
  return (
    <div className="sheet-layer" role="presentation" onMouseDown={onClose}>
      <section
        className="bottom-sheet"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <button className="sheet-handle" aria-label="بستن" onClick={onClose} />
        <h2>{title}</h2>
        {children}
      </section>
    </div>
  )
}

export function Countdown({ target }: { target: string }) {
  const getLeft = () => Math.max(0, new Date(target).getTime() - Date.now())
  const [left, setLeft] = useState(getLeft)
  useEffect(() => {
    const id = setInterval(() => setLeft(getLeft()), 1000)
    return () => clearInterval(id)
  }, [target])
  const days = Math.floor(left / 86400000),
    hours = Math.floor(left / 3600000) % 24,
    mins = Math.floor(left / 60000) % 60
  return (
    <div className="countdown">
      <div>
        <strong>{toFa(days)}</strong>
        <span>روز</span>
      </div>
      <b>:</b>
      <div>
        <strong>{toFa(hours)}</strong>
        <span>ساعت</span>
      </div>
      <b>:</b>
      <div>
        <strong>{toFa(mins)}</strong>
        <span>دقیقه</span>
      </div>
    </div>
  )
}
