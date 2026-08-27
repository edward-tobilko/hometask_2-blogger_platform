export const API_ROUTES = {
  authorization: 'auth',
  saBlogs: 'sa/blogs',
  blogs: 'blogs',
  comments: 'comments',
  posts: 'posts',
  testing: 'testing',
  users: 'sa/users',
  securityDevices: 'security/devices',

  integrations: 'integrations/telegram', // * extra path over the basic API logic
} as const;
