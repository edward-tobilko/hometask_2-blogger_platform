import { Injectable, NotFoundException } from '@nestjs/common';

import { CommentsPaginatedViewModel } from 'src/comments/api/dto/view/comments-paginated.view';
import { PostsQueryDto } from 'src/posts/api/dto/posts-query.dto';
import { PostViewModel } from 'src/posts/api/dto/view/post.view';
import { PostsPaginatedViewModel } from 'src/posts/api/dto/view/posts-paginated.view';
import { PostsQueryRepository } from 'src/posts/infrastructure/repositories/posts-query.repository';

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
      throw new NotFoundException(`The post with ID:${id} was not found`);

    return existingPost;
  }

  getCommentsForPost(
    postId: string,
    query: PostsQueryDto,
  ): Promise<CommentsPaginatedViewModel> {
    return this.postsQueryRepo.findCommentsByPostId(postId, query);
  }
}
