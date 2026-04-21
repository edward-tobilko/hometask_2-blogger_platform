import { Controller, Delete, HttpCode } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Blog, BlogModelType } from 'src/blogs/domain/entities/blog.entity';
import {
  Comment,
  CommentModel,
} from 'src/comments/domain/entities/comment.entity';
import { API_ROUTES } from 'src/core/constants/api-routes';
import { Post, PostModel } from 'src/posts/domain/entities/post.entity';
import { User, UserModel } from 'src/users/domain/entities/user.entity';

@Controller(API_ROUTES.testing)
export class TestingDataController {
  constructor(
    @InjectModel(Blog.name) protected blogModel: BlogModelType,
    @InjectModel(Post.name) protected postModel: PostModel,
    @InjectModel(User.name) protected userModel: UserModel,
    @InjectModel(Comment.name) protected commentModel: CommentModel,
  ) {}

  // * Remove all date
  @Delete()
  @HttpCode(204)
  async deleteAllData(): Promise<void> {
    await Promise.all([
      // this.sessionModel.deleteMany(),
      this.blogModel.deleteMany({}).exec(),
      this.commentModel.deleteMany().exec(),
      this.postModel.deleteMany({}).exec(),
      this.userModel.deleteMany({}).exec(),
      // this.postLikeModel.deleteMany(),
      // this.commentLikeModel.deleteMany(),
    ]);
  }
}
