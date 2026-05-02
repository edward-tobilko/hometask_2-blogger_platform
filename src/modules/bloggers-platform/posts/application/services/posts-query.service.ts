import { Injectable } from '@nestjs/common';

import { DomainException } from 'src/core/exceptions/domain.exception';
import { DomainExceptionCode } from 'src/core/exceptions/domain.exception-codes';
import { CommentsPaginatedViewModel } from 'src/modules/bloggers-platform/comments/api/dto/view-dto/comments-paginated.view-dto';
import { PostsQueryDto } from 'src/modules/bloggers-platform/posts/api/dto/input-dto/posts-query.input-dto';
import { PostViewModel } from 'src/modules/bloggers-platform/posts/api/dto/view-dto/post.view-dto';
import { PostsPaginatedViewModel } from 'src/modules/bloggers-platform/posts/api/dto/view-dto/posts-paginated.view-dto';
import { PostsQueryRepository } from 'src/modules/bloggers-platform/posts/infrastructure/repositories/posts-query.repository';

@Injectable()
export class PostsQueryService {
  constructor(private readonly postsQueryRepo: PostsQueryRepository) {}

  async getPostsList(
    queryParam: PostsQueryDto,
  ): Promise<PostsPaginatedViewModel> {
    return this.postsQueryRepo.findAllPosts(queryParam);
  }

  async getPostById(id: string): Promise<PostViewModel | null> {
    const existingPost = await this.postsQueryRepo.findPostById(id);

    if (!existingPost)
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: `This post with ID:${id} was not found`,
      });

    return existingPost;
  }

  async getCommentsForPost(
    postId: string,
    query: PostsQueryDto,
  ): Promise<CommentsPaginatedViewModel> {
    await this.getPostById(postId);

    return this.postsQueryRepo.findCommentsByPostId(postId, query);
  }
}
