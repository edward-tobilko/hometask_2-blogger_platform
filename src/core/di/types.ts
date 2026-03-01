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

  // Comments
  ICommentsRepository: Symbol.for("ICommentsRepository"),
  ICommentsQueryRepo: Symbol.for("ICommentsQueryRepo"),

  // Posts
  IPostsRepository: Symbol.for("IPostsRepository"),
  IPostsQueryRepository: Symbol.for("IPostsQueryRepository"),

  // Security devices
  ISecurityDevicesQueryRepo: Symbol.for("ISecurityDevicesQueryRepo"),
  ISecurityDevicesRepo: Symbol.for("ISecurityDevicesRepo"),

  // Other
  ICustomRateLimitRepo: Symbol.for("ICustomRateLimitRepo"),

  // DB Tokens
  CustomRateLimitCollection: Symbol.for("CustomRateLimitCollection"),

  // * Services
  // Auth
  IAuthService: Symbol.for("IAuthService"),
  IJWTService: Symbol.for("IJWTService"),
  INodeMailerService: Symbol.for("INodeMailerService"),

  // Blogs
  IBlogsQueryService: Symbol.for("IBlogsQueryService"),
  IBlogsService: Symbol.for("IBlogsService"),

  // Comments
  ICommentsQueryService: Symbol.for("ICommentsQueryService"),
  ICommentsService: Symbol.for("ICommentsService"),

  // Users
  IUsersService: Symbol.for("IUsersService"),
  IUsersQueryService: Symbol.for("IUsersQueryService"),
  IPasswordHasher: Symbol.for("IPasswordHasher"),

  // Posts
  IPostsService: Symbol.for("IPostsService"),
  IPostsQueryService: Symbol.for("IPostsQueryService"),

  // Security devices
  ISecurityDevicesQueryService: Symbol.for("ISecurityDevicesQueryService"),
  ISecurityDevicesService: Symbol.for("ISecurityDevicesService"),

  // * Controllers
  AuthController: Symbol.for("AuthController"),
  BlogsController: Symbol.for("BlogsController"),
  CommentsController: Symbol.for("CommentsController"),
  PostsController: Symbol.for("PostsController"),
  SecurityDevicesController: Symbol.for("SecurityDevicesController"),
  UsersController: Symbol.for("UsersController"),
} as const;

// ? Зачем нужны токены (Symbols): потому что интерфейсы TypeScript не существуют в рантайме. То есть, IUsersRepository — это только во время компиляции, а в Node.js его нет. Поэтому мы говорим Inversify: «когда видишь @inject(TYPES.IUsersRepository) — достань зависимость по этому токену».
// ? Теперь UsersController зависит только от интерфейсов, а контейнер решает, что именно подставлять.
