import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { PostViewModel } from '../../api/dto/view-dto/post.view-dto';
import { DomainException } from 'src/core/exceptions/domain.exception';
import { DomainExceptionCode } from 'src/core/exceptions/domain.exception-codes';
import { PostsQuerySqlRepository } from '../../infrastructure/sql/repositories/posts-query-sql.repository';
export class GetPostByIdQuery {
  constructor(
    public id: string,
    public userId?: string,
  ) {}
}

@QueryHandler(GetPostByIdQuery)
export class GetPostByIdQueryHandler implements IQueryHandler<
  GetPostByIdQuery,
  PostViewModel
> {
  constructor(private readonly postsQueryRepo: PostsQuerySqlRepository) {}

  async execute({ id, userId }: GetPostByIdQuery): Promise<PostViewModel> {
    const existingPost = await this.postsQueryRepo.findPostById(id, userId);

    if (!existingPost)
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: `This post with ID:${id} was not found`,
      });

    return existingPost;
  }
}
