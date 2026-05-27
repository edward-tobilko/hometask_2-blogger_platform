import { Injectable } from '@nestjs/common';

import { API_ROUTES } from './core/constants/api-routes.constants';
import { CoreConfig } from './core/core.config';

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
  port: number;
  endpoints: ApiEndpoints;
  timestamp: string;
}

@Injectable()
export class AppService {
  constructor(private coreConfig: CoreConfig) {}

  getRootPage(): RootPageResponse {
    return {
      name: 'Blogger Platform API',
      environment: this.coreConfig.env,
      port: this.coreConfig.port,
      endpoints: { ...API_ROUTES },
      timestamp: new Date().toISOString(),
    };
  }
}
