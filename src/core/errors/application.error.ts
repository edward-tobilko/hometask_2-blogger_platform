export class ApplicationError extends Error {
  constructor(
    public readonly field: string | null,
    public readonly message: string,
    public readonly statusCode: number
  ) {
    super(message);

    this.field = field;
    this.statusCode = statusCode;

    this.name = this.constructor.name; // только для логов
  }
}

export class ValidationError extends ApplicationError {
  constructor(field: string | null, message: string, statusCode: number) {
    super(field, message, statusCode);
  }
}

export class NotFoundError extends ApplicationError {
  constructor(
    field: string | null = null,
    message: string = "Not found",
    statusCode: number = 404
  ) {
    super(field, message, statusCode);
  }
}

export class UnauthorizedError extends ApplicationError {
  constructor(
    field: string | null = null,
    message: string = "Unauthorized",
    statusCode: number = 401
  ) {
    super(field, message, statusCode);
  }
}

export class RepositoryNotFoundError extends ApplicationError {
  constructor(
    field: string | null = null,
    message = "Not found",
    statusCode: number = 404
  ) {
    super(field, message, statusCode);
  }
}

export class ForbiddenError extends ApplicationError {
  constructor(
    field: string | null = null,
    message = "Forbidden",
    statusCode: number = 403
  ) {
    super(field, message, statusCode);
  }
}

// ? class ApplicationError extends Error - можно бросать: throw new ApplicationError(...); можно ловить: catch (e) { ... }; будет стандартный стек (.stack); instanceof ApplicationError будет работать и можно другим кодом отличать бизнес-ошибки от технических.
