import { IsString } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

import { CreatePostForBlogDto } from 'src/blogs/api/dto/create-post-for-blog.dto';

// * DTO model - response for db
export class CreatePostDto extends PartialType(CreatePostForBlogDto) {
  @IsString()
  blogId?: string;

  @IsString()
  blogName?: string;

  //   extendedLikesInfo!: {
  //     likesCount: number;
  //     dislikesCount: number;

  //     newestLikes: Array<{
  //       addedAt: Date;
  //       userId: string;
  //       login: string;
  //     }>;
  //   };
}

// ? PartialType - делает все поля из CreatePostDto опциональными, но сохраняет декораторы валидации. Это стандартный Nest-паттерн для update-DTO.
