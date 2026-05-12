import { HttpStatus, INestApplication } from '@nestjs/common';
import { Server } from 'http';
import request from 'supertest';
import { randomUUID } from 'crypto';

import { CommentViewModel } from 'src/modules/bloggers-platform/comments/api/dto/view-dto/comment.view-dto';
import { GLOBAL_PREFIX } from 'src/setup/global-prefix.setup';

export class CommentTestManager {
  constructor(private readonly app: INestApplication) {}

  httpServer = this.app.getHttpServer() as Server;
  commentsPath = `/${GLOBAL_PREFIX}/comments` as string;

  getCommentInputDto(payloadValidation?: Record<string, unknown>): {
    content: string;
  } {
    const UNIQUE_CONTENT = randomUUID().slice(0, 100);

    const payloadCommentDto: { content: string } = {
      content: `Content ${UNIQUE_CONTENT}`,
    };

    return { ...payloadCommentDto, ...payloadValidation }; // если одинаковый ключ есть в обоих объектах — правый перезаписывает левый.
  }

  async getCommentById(
    id: string,
    statusCode: number = HttpStatus.OK,
  ): Promise<CommentViewModel> {
    const response = await request(this.httpServer)
      .get(`${this.commentsPath}/${id}`)
      .expect(statusCode);

    return response.body as CommentViewModel;
  }
}
