import { nanoid } from 'nanoid';
import { fromZonedTime, toZonedTime, format as formatTz } from 'date-fns-tz';

/** Generate a short unique ID (e.g. for itinerary URLs) */
export function generateId(): string {
  return nanoid(12);
}

/** "Great Ocean Road Tour" → "great-ocean-road-tour" */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Format a price for display: 13500 (cents) → "A$135" */
export function formatPrice(amountCents: number, currency = 'USD'): string {
  const amount = amountCents / 100;
  const symbols: Record<string, string> = {
    AUD: 'A$', USD: '$', EUR: '€', GBP: '£', JPY: '¥', CNY: '¥',
    BRL: 'R$', CAD: 'C$', MXN: 'MX$', SGD: 'S$',
  };
  const symbol = symbols[currency] ?? currency;
  return `${symbol}${amount % 1 === 0 ? amount : amount.toFixed(2)}`;
}

/** Convert "13:30:00" or "13:30" to "1:30 PM" */
export function formatTime(time: string): string {
  const [hourStr, minuteStr] = time.split(':');
  const hour = parseInt(hourStr, 10);
  const minute = minuteStr ?? '00';
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minute} ${period}`;
}

/** "2026-03-08" → "Sunday 8 March 2026" */
export function formatDate(dateStr: string): string {
  const date = new Date(`${dateStr}T00:00:00`);
  return date.toLocaleDateString('en-AU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Convert a race-local session time to an absolute UTC Date.
 * raceDate: "2026-03-06", time: "12:30" or "12:30:00", raceTz: "Australia/Melbourne"
 */
export function sessionToUtcDate(raceDate: string, time: string, raceTz: string): Date {
  const [h, m] = time.split(':').map(s => s.padStart(2, '0'));
  const localStr = `${raceDate}T${h}:${m}:00`;
  return fromZonedTime(localStr, raceTz);
}

/** Format a UTC Date as a time string in the given timezone. Returns "12:30 PM" */
export function formatInTimezone(date: Date, tz: string): string {
  return formatTz(toZonedTime(date, tz), 'h:mm aa', { timeZone: tz });
}

/** Get the short timezone abbreviation. e.g. "Australia/Melbourne" → "AEDT" */
export function getTimezoneAbbr(tz: string, date = new Date()): string {
  return new Intl.DateTimeFormat('en', { timeZone: tz, timeZoneName: 'short' })
    .formatToParts(date)
    .find(p => p.type === 'timeZoneName')?.value ?? tz;
}

/** Check if an event is happening soon (within N days) */
export function isSoon(dateStr: string, thresholdDays = 14): { soon: boolean; daysRemaining: number } {
  const now = new Date();
  const eventDate = new Date(`${dateStr}T14:00:00`);
  const diffTime = eventDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return {
    soon: diffDays > 0 && diffDays <= thresholdDays,
    daysRemaining: diffDays
  };
}

/** Get a standard urgency message for upcoming events */
export function getUrgencyMessage(daysRemaining: number): string {
  if (daysRemaining <= 0) return 'Event in progress';
  if (daysRemaining === 1) return 'Race is tomorrow. Finalize your plans now!';
  return `Race is in ${daysRemaining} days. Book experiences and tickets before they sell out!`;
}

