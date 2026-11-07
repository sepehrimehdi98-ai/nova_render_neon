import { useState, type ReactNode } from "react"
import type { Role } from "../api/platform"
import { Icon } from "./Icons"
import { Avatar } from "./UI"

export type NavItem = {
  id: string
  label: string
  icon: Parameters<typeof Icon>[0]["name"]
}

export function AppShell({
  role,
  page,
  setPage,
  nav,
  title,
  subtitle,
  headerVisual,
  children,
  onRoleChange,
  theme,
  onTheme,
}: {
  role: Role
  page: string
  setPage: (page: string) => void
  nav: NavItem[]
  title: string
  subtitle: string
  headerVisual?: ReactNode
  children: ReactNode
  onRoleChange: (role: Role) => void
  theme: string
  onTheme: () => void
}) {
  const [roleOpen, setRoleOpen] = useState(false)
  const roleLabels = { student: "دانش‌آموز", teacher: "مدرس", admin: "مدیر" }
  return (
    <div className={`app-shell role-${role}`}>
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">N</span>
          <div>
            <strong>نُوا</strong>
            <small>یادگیری، روشن‌تر</small>
          </div>
        </div>
        <nav aria-label="ناوبری اصلی">
          {nav.map((item) => (
            <button
              key={item.id}
              className={page === item.id ? "active" : ""}
              onClick={() => setPage(item.id)}
            >
              <Icon name={item.icon} />
              <span>{item.label}</span>
              {page === item.id && <i />}
            </button>
          ))}
        </nav>
        <div className="sidebar-foot">
          <button
            className="profile-mini"
            onClick={() => setRoleOpen(!roleOpen)}
            aria-expanded={roleOpen}
          >
            <Avatar
              seed={role === "student" ? 1 : role === "teacher" ? 2 : 3}
            />
            <span>
              <strong>آرین رضایی</strong>
              <small>{roleLabels[role]}</small>
            </span>
            <Icon name="chevronDown" />
          </button>
          {roleOpen && (
            <div className="role-menu">
              {(Object.keys(roleLabels) as Role[]).map((r) => (
                <button
                  key={r}
                  onClick={() => {
                    onRoleChange(r)
                    setRoleOpen(false)
                  }}
                >
                  {roleLabels[r]}
                </button>
              ))}
            </div>
          )}
        </div>
      </aside>
      <main>
        <header className="topbar">
          <div className="mobile-brand">
            <span className="brand-mark">N</span>
            <strong>نُوا</strong>
          </div>
          <div className="page-heading">
            <p>{subtitle}</p>
            <h1>{title}</h1>
          </div>
          {headerVisual}
          <div className="header-actions">
            <button
              className="icon-button"
              onClick={onTheme}
              aria-label="تغییر پوسته"
            >
              <Icon name={theme === "dark" ? "sun" : "moon"} />
            </button>
            <button className="icon-button notification" aria-label="اعلان‌ها">
              <Icon name="bell" />
              <i />
            </button>
            <button
              className="mobile-avatar"
              onClick={() => setRoleOpen(!roleOpen)}
              aria-label="تغییر نقش"
            >
              <Avatar seed={2} />
            </button>
            {roleOpen && (
              <div className="role-menu mobile-role-menu">
                {(Object.keys(roleLabels) as Role[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => {
                      onRoleChange(r)
                      setRoleOpen(false)
                    }}
                  >
                    {roleLabels[r]}
                  </button>
                ))}
              </div>
            )}
          </div>
        </header>
        <div className="page-content">{children}</div>
      </main>
      <nav className="bottom-nav" aria-label="ناوبری موبایل">
        {nav.slice(0, 5).map((item) => (
          <button
            key={item.id}
            className={page === item.id ? "active" : ""}
            onClick={() => setPage(item.id)}
          >
            <Icon name={item.icon} />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
