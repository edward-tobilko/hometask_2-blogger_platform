export const Types = {
  // * Repositories
  // Users
  IUsersRepository: Symbol.for("IUsersRepository"),
  IUsersQueryRepository: Symbol.for("IUsersQueryRepository"),

  // Blogs
  IBlogsQueryRepository: Symbol.for("BlogsQueryRepository"),
  IBlogsRepository: Symbol.for("IBlogsRepository"),

  // Posts
  IPostsRepository: Symbol.for("IPostsRepository"),
  IPostsQueryRepository: Symbol.for("IPostsQueryRepository"),

  // * Services
  // Users
  IUsersService: Symbol.for("IUsersService"),
  IUsersQueryService: Symbol.for("IUsersQueryService"),
  IPasswordHasher: Symbol.for("IPasswordHasher"),

  // Posts
  IPostsService: Symbol.for("IPostsService"),
  IPostsQueryService: Symbol.for("IPostsQueryService"),

  // Blogs
  IBlogsQueryService: Symbol.for("IBlogsQueryService"),
  IBlogsService: Symbol.for("IBlogsService"),

  // * Controllers
  UsersController: Symbol.for("UsersController"),
  PostsController: Symbol.for("PostsController"),
  BlogsController: Symbol.for("BlogsController"),
} as const;

// ? Зачем нужны токены (Symbols):
// ? Потому что интерфейсы TypeScript не существуют в рантайме. То есть IUsersRepository — это только во время компиляции, а в Node.js его нет. Поэтому мы говорим Inversify: «когда видишь @inject(TYPES.IUsersRepository) — достань зависимость по этому токену».

// ? Теперь UsersController зависит только от интерфейсов, а контейнер решает, что именно подставлять.
