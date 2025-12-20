export class ApplicationError extends Error {
  constructor(
    public readonly field: string | null,
    message: string,
    public readonly statusCode: number = 422 // default
  ) {
    super(message);
    this.name = this.constructor.name;
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
