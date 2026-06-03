import { Injectable } from '@nestjs/common';

import { API_ROUTES } from './core/constants/api-routes.constants';
import { CoreConfig } from './core/core.config';
import { ApiProperty } from '@nestjs/swagger';

interface ApiEndpoints {
  blogs: string;
  comments: string;
  posts: string;
  testing: string;
  users: string;
}

export class RootPageResponse {
  @ApiProperty({ type: String })
  name: string;

  @ApiProperty({ type: String, nullable: true })
  environment: string | undefined;

  @ApiProperty({ type: Number, example: 5001 })
  port: number;

  @ApiProperty({
    type: 'object',
    properties: {
      blogs: { type: 'string' },
      comments: { type: 'string' },
      posts: { type: 'string' },
      testing: { type: 'string' },
      users: { type: 'string' },
    },
    title: 'Endpoints',
  })
  endpoints: ApiEndpoints;

  @ApiProperty({ type: String })
  timestamp: string;

  constructor(
    name: string,
    environment: string | undefined,
    port: number,
    endpoints: ApiEndpoints,
    timestamp: string,
  ) {
    this.name = name;
    this.environment = environment;
    this.port = port;
    this.endpoints = endpoints;
    this.timestamp = timestamp;
  }
}

@Injectable()
export class AppService {
  constructor(private coreConfig: CoreConfig) {}

  getRootPage(): RootPageResponse {
    return {
      name: 'Blogger Platform API',
      environment: this.coreConfig.env,
      port: Number(this.coreConfig.port),
      endpoints: { ...API_ROUTES },
      timestamp: new Date().toISOString(),
    };
  }
}
