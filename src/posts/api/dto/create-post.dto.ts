import { IsMongoId, IsString } from 'class-validator';

import { CreatePostForBlogDto } from 'src/blogs/api/dto/create-post-for-blog.dto';

// * DTO model - response for db
export class CreatePostDto extends CreatePostForBlogDto {
  @IsString()
  @IsMongoId()
  blogId!: string;
}

// ? PartialType(CreatePostForBlogDto) - делает все поля из CreatePostDto опциональными, но сохраняет декораторы валидации. Это стандартный Nest-паттерн для update-DTO.
