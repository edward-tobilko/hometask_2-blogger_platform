export class ApplicationError extends Error {
  constructor(
    public readonly message: string,
    public readonly field: string | null,
    public readonly statusCode?: number
  ) {
    super(message);

    this.field = field;
    this.statusCode = statusCode;

    this.name = this.constructor.name; // только для логов
  }
}

export class ValidationError extends ApplicationError {
  constructor(message: string, field: string | null, statusCode: number) {
    super(message, field, statusCode);
  }
}

export class BadRequest extends ApplicationError {
  constructor(
    message: string = "Bad request",
    field: string | null = null,
    statusCode: number = 400
  ) {
    super(message, field, statusCode);
  }
}

export class NotFoundError extends ApplicationError {
  constructor(
    message: string = "Not found",
    field: string | null = null,
    statusCode: number = 404
  ) {
    super(message, field, statusCode);
  }
}

export class UnauthorizedError extends ApplicationError {
  constructor(
    message: string = "Unauthorized",
    field: string | null = null,
    statusCode: number = 401
  ) {
    super(message, field, statusCode);
  }
}

export class RepositoryNotFoundError extends ApplicationError {
  constructor(
    message = "Not found",
    field: string | null = null,
    statusCode: number = 404
  ) {
    super(message, field, statusCode);
  }
}

export class ForbiddenError extends ApplicationError {
  constructor(
    message = "Forbidden",
    field: string | null = null,
    statusCode: number = 403
  ) {
    super(message, field, statusCode);
  }
}

// ? class ApplicationError extends Error - можно бросать: throw new ApplicationError(...); можно ловить: catch (e) { ... }; будет стандартный стек (.stack); instanceof ApplicationError будет работать и можно другим кодом отличать бизнес-ошибки от технических.
