import { Controller, Delete, HttpCode } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { API_ROUTES } from 'src/core/constants/api-routes';
import {
  Blog,
  BlogModelType,
} from 'src/modules/bloggers-platform/blogs/domain/entities/blog.entity';
import {
  Comment,
  CommentModel,
} from 'src/modules/bloggers-platform/comments/domain/entities/comment.entity';
import {
  Post,
  PostModel,
} from 'src/modules/bloggers-platform/posts/domain/entities/post.entity';
import {
  UserAccount,
  UserAccountModel,
} from 'src/modules/user-accounts/domain/entities/user.entity';

@Controller(API_ROUTES.testing)
export class TestingDataController {
  constructor(
    @InjectModel(Blog.name) protected blogModel: BlogModelType,
    @InjectModel(Post.name) protected postModel: PostModel,
    @InjectModel(UserAccount.name) protected userAccountModel: UserAccountModel,
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
      this.userAccountModel.deleteMany({}).exec(),
      // this.postLikeModel.deleteMany(),
      // this.commentLikeModel.deleteMany(),
    ]);
  }
}
