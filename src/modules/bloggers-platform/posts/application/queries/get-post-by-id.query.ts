import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { PostsQueryRepository } from '../../infrastructure/repositories/posts-query.repository';
import { PostViewModel } from '../../api/dto/view-dto/post.view-dto';
import { DomainException } from 'src/core/exceptions/domain.exception';
import { DomainExceptionCode } from 'src/core/exceptions/domain.exception-codes';

export class GetPostByIdQuery {
  constructor(public id: string) {}
}

@QueryHandler(GetPostByIdQuery)
export class GetPostByIdQueryHandler implements IQueryHandler<
  GetPostByIdQuery,
  PostViewModel
> {
  constructor(private readonly postsQueryRepo: PostsQueryRepository) {}

  async execute({ id }: GetPostByIdQuery): Promise<PostViewModel> {
    const existingPost = await this.postsQueryRepo.findPostById(id);

    if (!existingPost)
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: `This post with ID:${id} was not found`,
      });

    return existingPost;
  }
}
