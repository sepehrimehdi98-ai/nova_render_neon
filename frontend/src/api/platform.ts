export type Role = "student" | "teacher" | "admin"
export type LoadState = "loading" | "empty" | "error" | "success"

const API_ROOT = "/api/platform"

/** مسیرهای فعلی بک‌اند */
export const routes = {
  me: `${API_ROOT}/me`,
  login: `${API_ROOT}/login`,
  logout: `${API_ROOT}/logout`,
  courses: `${API_ROOT}/courses`,
  lessons: `${API_ROOT}/lessons`,
  aiJobs: `${API_ROOT}/ai/jobs`,
}

/** پیشنهادی — تا زمان پیاده‌سازی بک‌اند از mock استفاده می‌شود. */
export const proposedRoutes = {
  exams: `${API_ROOT}/exams`,
  analytics: `${API_ROOT}/analytics`,
  media: `${API_ROOT}/media`,
  accounts: `${API_ROOT}/accounts`,
  passwordRequests: `${API_ROOT}/password-requests`,
  auditLogs: `${API_ROOT}/audit-logs`,
  lessonRevisions: `${API_ROOT}/lesson-revisions`,
}

export const mock = {
  me: {
    id: "u-1024",
    name: "آرین رضایی",
    role: "student" as Role,
    streak: 12,
    progress: 68,
  },
  courses: [
    {
      id: 1,
      title: "پایتون مقدماتی",
      teacher: "سارا احمدی",
      progress: 62,
      lessons: 12,
    },
    {
      id: 2,
      title: "تفکر الگوریتمی",
      teacher: "امیر شریفی",
      progress: 34,
      lessons: 8,
    },
  ],
  exams: [
    {
      id: 1,
      title: "میان‌ترم پایتون",
      date: "2026-03-25T10:00:00",
      duration: 45,
      questions: 20,
    },
    {
      id: 2,
      title: "کوییز الگوریتم",
      date: "2026-04-02T14:30:00",
      duration: 20,
      questions: 10,
    },
  ],
}

const wait = (ms = 350) => new Promise((resolve) => setTimeout(resolve, ms))

export async function getMockData<T extends keyof typeof mock>(
  key: T,
): Promise<typeof mock[T]> {
  await wait()
  return structuredClone(mock[key])
}

export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...init?.headers },
    ...init,
  })
  if (!response.ok) throw new Error("در دریافت اطلاعات مشکلی پیش آمد.")
  return response.json() as Promise<T>
}
