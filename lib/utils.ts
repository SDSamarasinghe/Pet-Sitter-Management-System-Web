import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Timezone helpers
export function getUserTimeZone(defaultTz: string = 'America/Toronto'): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || defaultTz
  } catch {
    return defaultTz
  }
}

export function formatDateTimeTZ(
  value?: string | number | Date,
  timeZone: string = getUserTimeZone(),
  options?: Intl.DateTimeFormatOptions
): string {
  if (!value) return 'N/A'
  const d = new Date(value)
  if (isNaN(d.getTime())) return 'N/A'
  const fmt: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone,
    ...options,
  }
  return d.toLocaleString('en-CA', fmt)
}

export function formatTimeRangeTZ(
  start?: string | number | Date,
  end?: string | number | Date,
  timeZone: string = getUserTimeZone()
): string {
  if (!start || !end) return 'N/A'
  const s = new Date(start)
  const e = new Date(end)
  if (isNaN(s.getTime()) || isNaN(e.getTime())) return 'N/A'
  const dateOpts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', timeZone }
  const timeOpts: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit', hour12: true, timeZone }
  const sameDay = s.toLocaleDateString('en-CA', dateOpts) === e.toLocaleDateString('en-CA', dateOpts)
  const sDate = s.toLocaleDateString('en-CA', dateOpts)
  const eDate = e.toLocaleDateString('en-CA', dateOpts)
  const sTime = s.toLocaleTimeString('en-CA', timeOpts)
  const eTime = e.toLocaleTimeString('en-CA', timeOpts)
  return sameDay ? `${sTime} - ${eTime}` : `${sDate} ${sTime} - ${eDate} ${eTime}`
}
