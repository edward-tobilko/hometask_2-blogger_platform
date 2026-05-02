import { IsObjectId } from 'src/core/decorators/is-object-id.decorator';

import { CreatePostForBlogDto } from 'src/modules/bloggers-platform/blogs/api/dto/input-dto/create-post-for-blog.input-dto';

// * DTO model - response for db
export class CreatePostDto extends CreatePostForBlogDto {
  @IsObjectId()
  blogId!: string;
}

// ? PartialType(CreatePostForBlogDto) - делает все поля из CreatePostDto опциональными, но сохраняет декораторы валидации. Это стандартный Nest-паттерн для update-DTO.
