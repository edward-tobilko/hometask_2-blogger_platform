import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Types } from 'mongoose';

import { CommentViewModel } from 'src/modules/bloggers-platform/comments/api/dto/view/comment.view';
import { CommentsPaginatedViewModel } from 'src/modules/bloggers-platform/comments/api/dto/view/comments-paginated.view';
import {
  Comment,
  CommentLean,
  CommentModel,
} from 'src/modules/bloggers-platform/comments/domain/entities/comment.entity';
import { PostsQueryDto } from 'src/modules/bloggers-platform/posts/api/dto/posts-query.dto';
import { PostViewModel } from 'src/modules/bloggers-platform/posts/api/dto/view/post.view';
import { PostsPaginatedViewModel } from 'src/modules/bloggers-platform/posts/api/dto/view/posts-paginated.view';
import {
  Post,
  PostLean,
  PostModel,
} from 'src/modules/bloggers-platform/posts/domain/entities/post.entity';

@Injectable()
export class PostsQueryRepository {
  constructor(
    @InjectModel(Post.name) private readonly postsModel: PostModel,
    @InjectModel(Comment.name) private readonly commentsModel: CommentModel,
  ) {}

  async findAllPosts(query: PostsQueryDto): Promise<PostsPaginatedViewModel> {
    const [items, totalCount] = await Promise.all([
      this.postsModel
        .find({})
        .sort(query.calculateSort())
        .skip(query.calculateSkip())
        .limit(query.pageSize)
        .lean<PostLean[]>()
        .exec(),

      this.postsModel.countDocuments({}),
    ]);

    return new PostsPaginatedViewModel(
      Math.ceil(totalCount / query.pageSize),
      query.pageNumber,
      query.pageSize,
      totalCount,

      items.map(PostViewModel.mapToViewModel),
    );
  }

  async findPostById(id: string): Promise<PostViewModel | null> {
    const existingPost = await this.postsModel
      .findById(id)
      .lean<PostLean>()
      .exec();

    if (!existingPost) return null;

    const postOutput = PostViewModel.mapToViewModel(existingPost);

    return postOutput;
  }

  async findCommentsByPostId(
    postId: string,
    query: PostsQueryDto,
  ): Promise<CommentsPaginatedViewModel> {
    const filter = {
      postId: new Types.ObjectId(postId),
    };

    const [items, totalCount] = await Promise.all([
      this.commentsModel
        .find(filter)
        .sort(query.calculateSort())
        .skip(query.calculateSkip())
        .limit(query.pageSize)
        .lean<CommentLean[]>()
        .exec(),

      this.commentsModel.countDocuments(filter).exec(),
    ]);

    return new CommentsPaginatedViewModel(
      Math.ceil(totalCount / query.pageSize),
      query.pageNumber,
      query.pageSize,
      totalCount,

      items.map(CommentViewModel.mapToViewModel),
    );
  }
}
