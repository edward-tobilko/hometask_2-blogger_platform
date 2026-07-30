export const API_ROUTES = {
  authorization: 'auth',
  blogs: 'blogs',
  comments: 'comments',
  posts: 'posts',
  testing: 'testing',
  users: 'users',
  securityDevices: 'security/devices',

  integrations: 'integrations/telegram', // * extra path over the basic API logic
} as const;
