// * Домен не знает про HTTP-коды — это принцип DDD. DomainExceptionCode — это бизнес-коды, а маппинг на HTTP статусы делает только фильтр. Важно: NotFound = 1, а не = 404. Это правильно — домен не привязан к HTTP.
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

// * Extra fields for extensions value: "extensions": []
export class Extension {
  constructor(
    public message: string,
    public key: string,
  ) {}
}

// * Кастомный класс исключения
export class DomainException extends Error {
  message: string; // error text
  code: DomainExceptionCode; // error code
  extensions: Extension[]; // дополнительные данные ошибки

  constructor(errorInfo: {
    code: DomainExceptionCode;
    message: string;
    extensions?: Extension[];
  }) {
    super(errorInfo.message);

    this.message = errorInfo.message;
    this.code = errorInfo.code;
    this.extensions = errorInfo.extensions || [];
  }
}
