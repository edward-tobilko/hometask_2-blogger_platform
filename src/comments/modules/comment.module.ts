import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { CommentsQueryService } from '../application/services/comments-query.services';
import { CommentsQueryRepository } from '../infrastructure/repositories/comments-query.repository';
import { CommentController } from '../api/controllers/comment.controller';
import { Comment, CommentSchema } from '../domain/entities/comment.entity';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Comment.name, schema: CommentSchema }]),
  ],

  controllers: [CommentController],
  providers: [CommentsQueryService, CommentsQueryRepository],

  exports: [],
})
export class CommentsModule {}
