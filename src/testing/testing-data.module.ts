import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Blog, BlogSchema } from 'src/blogs/domain/blog.entity';
import { Post, PostSchema } from 'src/posts/domain/post.entity';
import { User, UserSchema } from 'src/users/domain/user.entity';
import { TestingDataController } from './testing-data.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Blog.name, schema: BlogSchema },
      { name: Post.name, schema: PostSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],

  controllers: [TestingDataController],
})
export class TestingDataModule {}
