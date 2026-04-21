import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Blog, BlogSchema } from 'src/blogs/domain/entities/blog.entity';
import { Post, PostSchema } from 'src/posts/domain/entities/post.entity';
import { User, UserSchema } from 'src/users/domain/entities/user.entity';
import { TestingDataController } from './testing-data.controller';
import {
  Comment,
  CommentSchema,
} from 'src/comments/domain/entities/comment.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Blog.name, schema: BlogSchema },
      { name: Comment.name, schema: CommentSchema },
      { name: Post.name, schema: PostSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],

  controllers: [TestingDataController],
})
export class TestingDataModule {}
