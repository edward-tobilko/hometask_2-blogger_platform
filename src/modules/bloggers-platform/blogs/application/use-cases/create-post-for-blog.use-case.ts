// import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';

// import { CreatePostForBlogDto } from '../../api/dto/input-dto/create-post-for-blog.input-dto';
// import { BlogsRepository } from '../../infrastructure/repositories/blogs.repository';
// import { DomainException } from 'src/core/exceptions/domain.exception';
// import { DomainExceptionCode } from 'src/core/exceptions/domain.exception-codes';
// import { CreatePostUseCase } from 'src/modules/bloggers-platform/posts/application/use-cases/create-post.use-case';

// export class CreatePostForBlogCommand {
//   constructor(
//     public blogId: string,
//     public dto: CreatePostForBlogDto,
//   ) {}
// }

// @CommandHandler(CreatePostForBlogCommand)
// export class CreatePostForBlogUseCase implements ICommandHandler<
//   CreatePostForBlogCommand,
//   any
// > {
//   constructor(
//     // @InjectModel(Post.name) private postModel: PostModel,
//     // private postsRepo: PostsRepository,
//     private blogsRepo: BlogsRepository,
//     private commandBus: CommandBus,
//   ) {}

//   async execute({ blogId, dto }: CreatePostForBlogCommand): Promise<any> {
//     // * find blog
//     const blogInstance = await this.blogsRepo.findById(blogId);

//     if (!blogInstance)
//       throw new DomainException({
//         code: DomainExceptionCode.NotFound,
//         message: `This blog with ID:${blogId} was not found`,
//       });

//     // * create domain post
//     const domainPost: CreatePostDomainDto & { blogName: string } = {
//       title: dto.title,
//       shortDescription: dto.shortDescription,
//       content: dto.content,
//       blogId,
//       blogName: blogInstance.name,
//     };

//     // * get post from post service
//     const post = await this.commandBus.execute(new CreatePostUseCase())

//     return post;
//   }
// }
