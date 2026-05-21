import { ApiProperty } from '@nestjs/swagger';

import { IsStringWithLength } from 'src/core/decorators/string-and-length.decorator';
import {
  titleConstraints,
  shortDescriptionConstraints,
  contentConstraints,
} from 'src/modules/bloggers-platform/posts/constraints/posts/posts.constraints';

export class CreatePostForBlogDto {
  @ApiProperty({
    minLength: titleConstraints.minLength,
    maxLength: titleConstraints.maxLength,
  })
  @IsStringWithLength(titleConstraints.minLength, titleConstraints.maxLength)
  title!: string;

  @ApiProperty({
    minLength: shortDescriptionConstraints.minLength,
    maxLength: shortDescriptionConstraints.maxLength,
  })
  @IsStringWithLength(
    shortDescriptionConstraints.minLength,
    shortDescriptionConstraints.maxLength,
  )
  shortDescription!: string;

  @ApiProperty({
    minLength: contentConstraints.minLength,
    maxLength: contentConstraints.maxLength,
  })
  @IsStringWithLength(
    contentConstraints.minLength,
    contentConstraints.maxLength,
  )
  content!: string;
}

// ? class-validator - проверяет данные на входе в API, до попадания в бизнес-логику. Так как мы исп. ValidationPipe мы можем безопасно доверять нашим свойствам: "!".
