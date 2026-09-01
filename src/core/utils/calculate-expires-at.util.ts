import { BanDuration } from '../enums/ban-duration.enum';

export function calculateExpiresAt(duration: BanDuration | null): Date | null {
  if (!duration || duration === BanDuration.PERMANENT) return null;

  const date = new Date(); // current date

  if (duration === BanDuration.DAYS_7) {
    date.setDate(date.getDate() + 7); // set current date + 7d
  } else if (duration === BanDuration.HOURS_12) {
    date.setHours(date.getHours() + 12); // set current date + 12h
  }

  return date;
}
