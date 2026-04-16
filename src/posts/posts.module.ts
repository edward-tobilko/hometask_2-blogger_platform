import { Module } from '@nestjs/common';

import { PostsService } from './application/posts.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Post, PostSchema } from './domain/post.entity';
import { Blog, BlogSchema } from 'src/blogs/domain/blog.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Post.name, schema: PostSchema },
      { name: Blog.name, schema: BlogSchema },
    ]),
  ],
  providers: [PostsService],
  exports: [PostsService], // чтобы BlogsController мог создавать посты
})
export class PostsModule {}
