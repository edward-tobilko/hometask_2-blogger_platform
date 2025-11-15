export class ApplicationError extends Error {
  constructor(
    detail: string, // описание ошибки
    public readonly source?: string, // откуда ошибка
    public readonly code?: string // код ошибки
  ) {
    super(detail);
  }
}

// ? class ApplicationError extends Error - можно бросать: throw new ApplicationError(...); можно ловить: catch (e) { ... }; будет стандартный стек (.stack); instanceof ApplicationError будет работать и можно другим кодом отличать бизнес-ошибки от технических.
