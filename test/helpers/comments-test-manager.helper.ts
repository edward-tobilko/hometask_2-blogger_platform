import { HttpStatus, INestApplication } from '@nestjs/common';
import { Server } from 'http';
import request from 'supertest';
import { randomUUID } from 'crypto';

import { CommentViewModel } from 'src/modules/bloggers-platform/comments/api/dto/view-dto/comment.view-dto';
import { GLOBAL_PREFIX } from 'src/setup/global-prefix.setup';
import { UpdateCommentDto } from 'src/modules/bloggers-platform/comments/api/dto/input-dto/update-comment.input-dto';

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
    accessToken?: string,
    statusCode: number = HttpStatus.OK,
  ): Promise<CommentViewModel> {
    const response = await request(this.httpServer)
      .get(`${this.commentsPath}/${id}`)
      .set('Authorization', accessToken ? `Bearer ${accessToken}` : '')
      .expect(statusCode);

    return response.body as CommentViewModel;
  }

  async updateCommentById<T = CommentViewModel>(
    commentId: string,
    updatedCommentDto: UpdateCommentDto,
    accessToken?: string,
    statusCode: number = HttpStatus.NO_CONTENT,
  ): Promise<T> {
    const response = await request(this.httpServer)
      .put(`${this.commentsPath}/${commentId}`)
      .send(updatedCommentDto)
      .set('Authorization', accessToken ? `Bearer ${accessToken}` : '')
      .expect(statusCode);

    return response.body as T; // дженерик для динамического вывода в тестах типов
  }

  async setLikeStatus<T = void>(
    commentId: string,
    likeStatus: string,
    accessToken?: string,
    statusCode: number = HttpStatus.NO_CONTENT,
  ): Promise<T> {
    const response = await request(this.httpServer)
      .put(`${this.commentsPath}/${commentId}/like-status`)
      .send({ likeStatus })
      .set('Authorization', accessToken ? `Bearer ${accessToken}` : '')
      .expect(statusCode);

    return response.body as T;
  }

  async deleteCommentById(
    commentId: string,
    accessToken?: string,
    statusCode: number = HttpStatus.NO_CONTENT,
  ): Promise<void> {
    await request(this.httpServer)
      .delete(`${this.commentsPath}/${commentId}`)
      .set('Authorization', accessToken ? `Bearer ${accessToken}` : '')
      .expect(statusCode);
  }
}
