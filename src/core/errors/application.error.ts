export class ApplicationError extends Error {
  public readonly field: string | null;
  public readonly statusCode: number;

  constructor(field: string | null, message: string, statusCode: number) {
    super(message);

    this.field = field;
    this.statusCode = statusCode;
    this.name = this.constructor.name; // только для логов
  }
}

export class ValidationError extends ApplicationError {
  constructor(field: string | null, message: string) {
    super(field, message, 422);
  }
}

export class NotFoundError extends ApplicationError {
  constructor(message = "Not found", field: string | null = null) {
    super(field, message, 404);
  }
}

export class UnauthorizedError extends ApplicationError {
  constructor(message = "Unauthorized", field: string | null = null) {
    super(field, message, 401);
  }
}

// ? class ApplicationError extends Error - можно бросать: throw new ApplicationError(...); можно ловить: catch (e) { ... }; будет стандартный стек (.stack); instanceof ApplicationError будет работать и можно другим кодом отличать бизнес-ошибки от технических.
