import { DomainExceptionCode } from './domain.exception-codes';

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
    message: string;
    code: DomainExceptionCode;
    extensions?: Extension[];
  }) {
    super(errorInfo.message);

    this.message = errorInfo.message;
    this.code = errorInfo.code;
    this.extensions = errorInfo.extensions || [];
  }
}
