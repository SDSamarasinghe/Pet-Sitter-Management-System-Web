import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { formatInTimeZone } from 'date-fns-tz'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Application timezone - all bookings are in Toronto timezone
export const APP_TIMEZONE = 'America/Toronto';

// Timezone helpers
export function getUserTimeZone(defaultTz: string = APP_TIMEZONE): string {
  // Always return Toronto timezone for consistency across the app
  return APP_TIMEZONE;
}

export function formatDateTimeTZ(
  value?: string | number | Date,
  timeZone: string = APP_TIMEZONE,
  options?: Intl.DateTimeFormatOptions
): string {
  if (!value) return 'N/A'
  const d = new Date(value)
  if (isNaN(d.getTime())) return 'N/A'
  
  // Use date-fns-tz to format in the specified timezone (always Toronto)
  try {
    return formatInTimeZone(d, timeZone, 'MMM dd, yyyy, hh:mm a')
  } catch (error) {
    // Fallback to Intl if date-fns-tz fails
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
}

export function formatTimeRangeTZ(
  start?: string | number | Date,
  end?: string | number | Date,
  timeZone: string = APP_TIMEZONE
): string {
  if (!start || !end) return 'N/A'
  const s = new Date(start)
  const e = new Date(end)
  if (isNaN(s.getTime()) || isNaN(e.getTime())) return 'N/A'
  
  try {
    // Format both dates in Toronto timezone
    const sDate = formatInTimeZone(s, timeZone, 'MMM d')
    const eDate = formatInTimeZone(e, timeZone, 'MMM d')
    const sTime = formatInTimeZone(s, timeZone, 'hh:mm a')
    const eTime = formatInTimeZone(e, timeZone, 'hh:mm a')
    
    const sameDay = sDate === eDate
    return sameDay ? `${sTime} - ${eTime}` : `${sDate} ${sTime} - ${eDate} ${eTime}`
  } catch (error) {
    // Fallback to Intl
    const dateOpts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', timeZone }
    const timeOpts: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit', hour12: true, timeZone }
    const sameDay = s.toLocaleDateString('en-CA', dateOpts) === e.toLocaleDateString('en-CA', dateOpts)
    const sDate = s.toLocaleDateString('en-CA', dateOpts)
    const eDate = e.toLocaleDateString('en-CA', dateOpts)
    const sTime = s.toLocaleTimeString('en-CA', timeOpts)
    const eTime = e.toLocaleTimeString('en-CA', timeOpts)
    return sameDay ? `${sTime} - ${eTime}` : `${sDate} ${sTime} - ${eDate} ${eTime}`
  }
}
