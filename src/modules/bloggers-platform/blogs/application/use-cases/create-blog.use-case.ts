import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { CreateBlogDto } from '../../api/dto/input-dto/create-blog.input-dto';
import { BlogsSqlRepository } from '../../infrastructure/sql/repositories/blogs-sql.repository';
import { BlogViewModel } from '../../api/dto/view-dto/blog.view-dto';
import { SubscriptionStatus } from 'src/core/enums/subscription-status.enum';

// * Розширяем (extends) Command, что бы не типизировать .commandBus.execute в контроллере.
export class CreateBlogCommand extends Command<BlogViewModel> {
  constructor(public dto: CreateBlogDto) {
    super();
  }
}

@CommandHandler(CreateBlogCommand)
export class CreateBlogUseCase implements ICommandHandler<
  CreateBlogCommand,
  BlogViewModel
> {
  constructor(private blogsRepo: BlogsSqlRepository) {}

  async execute({ dto }: CreateBlogCommand): Promise<BlogViewModel> {
    const blogInstance = await this.blogsRepo.createByAdmin(dto);

    return BlogViewModel.mapToViewModel(
      blogInstance,
      0,
      SubscriptionStatus.None,
    );
  }
}
