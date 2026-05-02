// * Домен не знает про HTTP-коды — это принцип DDD. DomainExceptionCode — это бизнес-коды, а маппинг на HTTP статусы делает только фильтр. Важно: NotFound = 1, а не = 404. Это правильно — домен не привязан к HTTP. Маппинг 1 → 404 делает только exception filter на уровне presentation.
export enum DomainExceptionCode {
  NotFound = 1,
  BadRequest = 2,
  InternalServerError = 3,
  Forbidden = 4,
  ValidationError = 5,

  Unauthorized = 11,
  EmailNotConfirmed = 12,
  ConfirmationCodeExpired = 13,
  PasswordRecoveryCodeExpired = 14,
}
