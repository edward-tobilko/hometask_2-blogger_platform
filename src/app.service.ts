import { Injectable } from '@nestjs/common';

import { API_ROUTES } from './core/constants/api-routes';

interface ApiEndpoints {
  blogs: string;
  comments: string;
  posts: string;
  testing: string;
  users: string;
}

export interface RootPageResponse {
  name: string;
  environment: string | undefined;
  endpoints: ApiEndpoints;
  timestamp: string;
}

@Injectable()
export class AppService {
  rootPage(): RootPageResponse {
    return {
      name: 'Blogger Platform API',

      environment: process.env.NODE_ENV,

      endpoints: { ...API_ROUTES },

      timestamp: new Date().toISOString(),
    };
  }
}
