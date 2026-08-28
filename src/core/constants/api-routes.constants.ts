export const API_ROUTES = {
  // * Super Admin
  saBlogs: 'sa/blogs',
  users: 'sa/users',

  authorization: 'auth',
  blogs: 'blogs',
  comments: 'comments',
  posts: 'posts',
  testing: 'testing',
  securityDevices: 'security/devices',

  integrations: 'integrations/telegram', // * extra path over the basic API logic
} as const;
