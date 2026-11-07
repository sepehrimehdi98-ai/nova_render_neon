const fa = new Intl.NumberFormat("fa-IR")

export const toFa = (value: number | string) =>
  String(value).replace(/\d/g, (digit) => "۰۱۲۳۴۵۶۷۸۹"[Number(digit)])

export const formatNumber = (value: number) => fa.format(value)

export const formatJalali = (
  value: Date | string | number,
  options?: Intl.DateTimeFormatOptions,
) =>
  new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
    day: "numeric",
    month: "long",
    year: "numeric",
    ...options,
  }).format(new Date(value))

export const formatClock = (value: Date | string | number) =>
  new Intl.DateTimeFormat("fa-IR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value))

export const safeHex = (value: string, fallback = "#5b4bc4") =>
  /^#[0-9a-fA-F]{6}$/.test(value) ? value : fallback

export const safeFontSize = (value: number) =>
  [14, 16, 20, 24, 32].includes(value) ? value : 16
