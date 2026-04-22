import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { TestingDataController } from './testing-data.controller';
import {
  UserAccount,
  UserAccountSchema,
} from 'src/modules/user-accounts/domain/entities/user.entity';
import {
  Post,
  PostSchema,
} from 'src/modules/bloggers-platform/posts/domain/entities/post.entity';
import {
  Comment,
  CommentSchema,
} from 'src/modules/bloggers-platform/comments/domain/entities/comment.entity';
import {
  Blog,
  BlogSchema,
} from 'src/modules/bloggers-platform/blogs/domain/entities/blog.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Blog.name, schema: BlogSchema },
      { name: Comment.name, schema: CommentSchema },
      { name: Post.name, schema: PostSchema },
      { name: UserAccount.name, schema: UserAccountSchema },
    ]),
  ],

  controllers: [TestingDataController],
})
export class TestingDataModule {}
