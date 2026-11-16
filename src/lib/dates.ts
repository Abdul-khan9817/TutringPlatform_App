import { addMinutes } from 'date-fns'
import { toZonedTime, fromZonedTime, format as tzFormat } from 'date-fns-tz'

export const DEFAULT_TIMEZONE = process.env.DEFAULT_TIMEZONE ?? 'Europe/Lisbon'

/** Convert a local datetime string in a timezone to UTC Date */
export function toUTC(localDatetime: string, timezone: string = DEFAULT_TIMEZONE): Date {
  return fromZonedTime(localDatetime, timezone)
}

/** Format a UTC Date for display in a given timezone */
export function formatInTimezone(
  date: Date,
  formatStr: string,
  timezone: string = DEFAULT_TIMEZONE
): string {
  const zonedDate = toZonedTime(date, timezone)
  return tzFormat(zonedDate, formatStr, { timeZone: timezone })
}

/** Get the display time for a booking (Lisbon time) */
export function formatBookingTime(startAt: Date, endAt: Date, timezone = DEFAULT_TIMEZONE): string {
  const start = formatInTimezone(startAt, 'dd MMM yyyy, HH:mm', timezone)
  const end = formatInTimezone(endAt, 'HH:mm', timezone)
  return `${start} – ${end}`
}

/** Add duration to a start time */
export function calculateEndTime(startAt: Date, durationMinutes: number): Date {
  return addMinutes(startAt, durationMinutes)
}

/** Check if a time slot overlaps with existing bookings */
export function hasOverlap(
  newStart: Date,
  newEnd: Date,
  existingStart: Date,
  existingEnd: Date
): boolean {
  return newStart < existingEnd && newEnd > existingStart
}
