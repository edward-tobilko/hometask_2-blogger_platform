import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { UpdateBlogDto } from '../../api/dto/input-dto/update-blog.input-dto';
import { BlogsRepository } from '../../infrastructure/repositories/blogs.repository';
import { DomainException } from 'src/core/exceptions/domain.exception';
import { DomainExceptionCode } from 'src/core/exceptions/domain.exception-codes';

export class UpdateBlogCommand {
  constructor(
    public id: string,
    public dto: UpdateBlogDto,
  ) {}
}

@CommandHandler(UpdateBlogCommand)
export class UpdateBlogUseCase implements ICommandHandler<
  UpdateBlogCommand,
  void
> {
  constructor(private blogsRepo: BlogsRepository) {}

  async execute({ id, dto }: UpdateBlogCommand): Promise<void> {
    // * достаем инстанс блога по id с его методами
    const blogInstance = await this.blogsRepo.findById(id);

    if (!blogInstance)
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: `This blog with ID:${id} was not found`,
      });

    // * обновляем поля в памяти доменной сущности
    blogInstance.update(dto);

    // * сохраняем уже обновленный документ
    await this.blogsRepo.save(blogInstance);
  }
}
