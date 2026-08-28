import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { DomainException } from 'src/core/exceptions/domain.exception';
import { DomainExceptionCode } from 'src/core/exceptions/domain.exception-codes';
import { UpdatePostDomainDto } from '../../domain/dto/update-post.domain-dto';
import { PostsSqlRepository } from '../../infrastructure/sql/repositories/posts-sql.repository';
import { PostOrmEntity } from '../../infrastructure/sql/schemas/post-orm.entity';

export class UpdatePostByIdCommand {
  constructor(
    public blogId: string,
    public postId: string,
    public dto: UpdatePostDomainDto,
  ) {}
}

@CommandHandler(UpdatePostByIdCommand)
export class UpdatePostByIdUseCase implements ICommandHandler<
  UpdatePostByIdCommand,
  void
> {
  constructor(private postsRepo: PostsSqlRepository) {}

  // * private helper methods (Extract Method)
  private async findPostOrFail(id: string): Promise<PostOrmEntity> {
    const post = await this.postsRepo.findById(id);

    if (!post) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: `The post with ID:${id} was not found`,
      });
    }

    return post;
  }

  async execute({ blogId, postId, dto }: UpdatePostByIdCommand): Promise<void> {
    // * достаем инстанс поста по id с его методами
    const existingPost = await this.findPostOrFail(postId);

    // * Если пост привязан к блогу навсегда — тогда нужно проверять что blogId из запроса совпадает с текущим, а если пост может менять блог — проверка не нужна.
    if (existingPost.blogId !== blogId)
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Post does not exist in this blog!',
      });

    // * обновляем поля в памяти доменной сущности
    existingPost.title = dto.title;
    existingPost.shortDescription = dto.shortDescription;
    existingPost.content = dto.content;

    // * сохраняем уже обновленный документ
    await this.postsRepo.save(existingPost);
  }
}
