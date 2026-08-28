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
    // * проверяем и достаем инстанс блога по id с его методами
    const blogInstance = await this.blogsRepo.findById(id);

    if (!blogInstance)
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: `This blog with ID:${id} was not found`,
      });

    // * обновляем поля в памяти доменной сущности
    blogInstance.name = dto.name;
    blogInstance.description = dto.description;
    blogInstance.websiteUrl = dto.websiteUrl;

    // * сохраняем уже обновленный документ
    await this.blogsRepo.save(blogInstance);
  }
}
