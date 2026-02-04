export const Types = {
  // * Repositories
  // Auth
  ISessionQueryRepo: Symbol.for("ISessionQueryRepo"),
  ISessionRepository: Symbol.for("ISessionRepository"),

  // Users
  IUsersRepository: Symbol.for("IUsersRepository"),
  IUsersQueryRepository: Symbol.for("IUsersQueryRepository"),

  // Blogs
  IBlogsQueryRepository: Symbol.for("IBlogsQueryRepository"),
  IBlogsRepository: Symbol.for("IBlogsRepository"),

  // Posts
  IPostsRepository: Symbol.for("IPostsRepository"),
  IPostsQueryRepository: Symbol.for("IPostsQueryRepository"),

  // Security devices
  ISecurityDevicesQueryRepo: Symbol.for("ISecurityDevicesQueryRepo"),
  ISecurityDevicesRepo: Symbol.for("ISecurityDevicesRepo"),

  // Other
  ICustomRateLimitRepo: Symbol.for("ICustomRateLimitRepo"),
  CustomRateLimitCollection: Symbol.for("CustomRateLimitCollection"),

  // * Services
  // Auth
  IAuthService: Symbol.for("IAuthService"),
  IJWTService: Symbol.for("IJWTService"),
  INodeMailerService: Symbol.for("INodeMailerService"),

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

  // Security devices
  ISecurityDevicesQueryService: Symbol.for("ISecurityDevicesQueryService"),
  ISecurityDevicesService: Symbol.for("ISecurityDevicesService"),

  // * Controllers
  UsersController: Symbol.for("UsersController"),
  PostsController: Symbol.for("PostsController"),
  BlogsController: Symbol.for("BlogsController"),
  AuthController: Symbol.for("AuthController"),
} as const;

// ? Зачем нужны токены (Symbols): потому что интерфейсы TypeScript не существуют в рантайме. То есть IUsersRepository — это только во время компиляции, а в Node.js его нет. Поэтому мы говорим Inversify: «когда видишь @inject(TYPES.IUsersRepository) — достань зависимость по этому токену».
// ? Теперь UsersController зависит только от интерфейсов, а контейнер решает, что именно подставлять.
