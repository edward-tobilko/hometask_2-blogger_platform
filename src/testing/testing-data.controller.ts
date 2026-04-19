import { Controller, Delete, HttpCode, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Blog, BlogModelType } from 'src/blogs/domain/blog.entity';
import { API_ROUTES } from 'src/core/constants/api-routes';
import { Post, PostModel } from 'src/posts/domain/post.entity';
import { User, UserModel } from 'src/users/domain/user.entity';

@Controller(API_ROUTES.testing)
export class TestingDataController {
  constructor(
    @InjectModel(Blog.name) protected blogModel: BlogModelType,
    @InjectModel(Post.name) protected postModel: PostModel,
    @InjectModel(User.name) protected userModel: UserModel,
  ) {}

  // * Remove all date
  @Delete()
  @HttpCode(204)
  async deleteAllData(): Promise<void> {
    await Promise.all([
      // this.sessionModel.deleteMany(),
      this.blogModel.deleteMany({}).exec(),
      this.postModel.deleteMany({}).exec(),
      this.userModel.deleteMany({}).exec(),
      // this.postCommentsModel.deleteMany(),
      // this.postLikeModel.deleteMany(),
      // this.commentLikeModel.deleteMany(),
    ]);
  }
}
