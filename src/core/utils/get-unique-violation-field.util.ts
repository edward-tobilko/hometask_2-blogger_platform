// * Код Postgres для нарушения уникальности (unique_violation)
const UNIQUE_VIOLATION_CODE = '23505';

export function getUniqueViolationField(error: unknown): string | null {
  // * Проверяем форму объекта, а не класс из typeorm — чтобы application не зависел от ORM.
  if (typeof error !== 'object' || error === null || !('driverError' in error))
    return null;

  const driverError = error.driverError as { code?: string; detail?: string };

  if (driverError.code !== UNIQUE_VIOLATION_CODE) return null;

  // * detail: 'Key (login)=(sam) already exists.' -> 'login'
  const match = driverError.detail?.match(/Key \((\w+)\)=/);

  return match ? match[1] : null;
}
