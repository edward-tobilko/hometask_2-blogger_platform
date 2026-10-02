import { BanDuration } from '../enums/ban-duration.enum';

export function calculateExpiresAt(duration: BanDuration | null): Date | null {
  if (!duration) return null;

  const date = new Date(); // current date

  switch (duration) {
    case BanDuration.PERMANENT:
      return null; // бессрочный бан — даты окончания нет

    case BanDuration.MINUTE_1:
      date.setMinutes(date.getMinutes() + 1); // set current date + 1min

      return date;

    case BanDuration.HOURS_12:
      date.setHours(date.getHours() + 12);

      return date;

    case BanDuration.DAYS_7:
      date.setDate(date.getDate() + 7);

      return date;

    default: {
      // * Exhaustive check: если в BanDuration добавят новое значение и забудут case — проект не скомпилируется!

      const unhandledDuration: never = duration;

      throw new Error(`Unknown ban duration: ${String(unhandledDuration)}`);
    }
  }
}
