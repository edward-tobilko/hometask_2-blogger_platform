export const Types = {
  // * Repositories
  IUsersRepository: Symbol.for("IUsersRepository"),
  IUsersQueryRepository: Symbol.for("IUsersQueryRepository"),

  // * Services
  IUsersService: Symbol.for("IUsersService"),
  IUsersQueryService: Symbol.for("IUsersQueryService"),
  IPasswordHasher: Symbol.for("IPasswordHasher"),

  // * Controllers
  UsersController: Symbol.for("UsersController"),
} as const;

// ? Зачем нужны токены (Symbols):
// ? Потому что интерфейсы TypeScript не существуют в рантайме. То есть IUsersRepository — это только во время компиляции, а в Node.js его нет. Поэтому мы говорим Inversify: «когда видишь @inject(TYPES.IUsersRepository) — достань зависимость по этому токену».

// ? Теперь UsersController зависит только от интерфейсов, а контейнер решает, что именно подставлять.
