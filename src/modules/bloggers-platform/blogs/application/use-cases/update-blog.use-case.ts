import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { DomainException } from 'src/core/exceptions/domain.exception';
import { DomainExceptionCode } from 'src/core/exceptions/domain.exception-codes';
import { BlogsSqlRepository } from '../../infrastructure/sql/repositories/blogs-sql.repository';
import { UpdateBlogDomainDto } from '../../domain/dto/update-blog.domain-dto';

export class UpdateBlogCommand {
  constructor(
    public id: string,
    public dto: UpdateBlogDomainDto,
  ) {}
}

@CommandHandler(UpdateBlogCommand)
export class UpdateBlogUseCase implements ICommandHandler<
  UpdateBlogCommand,
  void
> {
  constructor(private blogsRepo: BlogsSqlRepository) {}

  async execute({ id, dto }: UpdateBlogCommand): Promise<void> {
    // * Проверяем и достаем инстанс блога по id с его методами
    const blogInstance = await this.blogsRepo.findById(id);

    if (!blogInstance)
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: `This blog with ID:${id} was not found`,
      });

    // * Обновляем поля в памяти доменной сущности
    blogInstance.update(dto);

    // * Сохраняем уже обновленный документ
    await this.blogsRepo.save(blogInstance);
  }
}
