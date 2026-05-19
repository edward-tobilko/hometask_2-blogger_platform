import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { PostDocument } from '../../domain/entities/post.entity';
import { PostsRepository } from '../../infrastructure/repositories/posts.repository';
import { DomainException } from 'src/core/exceptions/domain.exception';
import { DomainExceptionCode } from 'src/core/exceptions/domain.exception-codes';
import { UpdatePostDomainDto } from '../../domain/dto/update-post.domain-dto';

export class UpdatePostByIdCommand {
  constructor(
    public id: string,
    public dto: UpdatePostDomainDto,
  ) {}
}

@CommandHandler(UpdatePostByIdCommand)
export class UpdatePostByIdUseCase implements ICommandHandler<
  UpdatePostByIdCommand,
  void
> {
  constructor(private postsRepo: PostsRepository) {}

  // * private helper methods (Extract Method)
  private async findPostOrFail(id: string): Promise<PostDocument> {
    const post = await this.postsRepo.findById(id);

    if (!post) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: `The post with ID:${id} was not found`,
      });
    }

    return post;
  }

  async execute({ id, dto }: UpdatePostByIdCommand): Promise<void> {
    // * достаем инстанс поста по id с его методами
    const existingPost = await this.findPostOrFail(id);

    // * Если пост привязан к блогу навсегда — тогда нужно проверять что blogId из запроса совпадает с текущим, а если пост может менять блог — проверка не нужна.
    if (existingPost.blogId.toString() !== dto.blogId)
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Post does not exist in this blog!',
      });

    // * обновляем поля в памяти доменной сущности
    existingPost.updatePost(dto);

    // * сохраняем уже обновленный документ
    await this.postsRepo.save(existingPost);
  }
}
