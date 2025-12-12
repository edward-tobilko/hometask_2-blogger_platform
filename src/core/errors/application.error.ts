export class ApplicationError extends Error {
  constructor(
    message: string, // описание ошибки
    public readonly field?: string
  ) {
    super(message);
  }
}

// ? class ApplicationError extends Error - можно бросать: throw new ApplicationError(...); можно ловить: catch (e) { ... }; будет стандартный стек (.stack); instanceof ApplicationError будет работать и можно другим кодом отличать бизнес-ошибки от технических.
