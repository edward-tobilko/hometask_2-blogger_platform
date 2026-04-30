import { IsString, Length } from 'class-validator';

import {
  contentConstraints,
  shortDescriptionConstraints,
  titleConstraints,
} from 'src/core/constants/constraints';

// * DTO model - response for db
export class CreatePostForBlogDto {
  @IsString()
  @Length(titleConstraints.minLength, titleConstraints.maxLength)
  title!: string;

  @IsString()
  @Length(
    shortDescriptionConstraints.minLength,
    shortDescriptionConstraints.maxLength,
  )
  shortDescription!: string;

  @IsString()
  @Length(contentConstraints.minLength, contentConstraints.maxLength)
  content!: string;
}

// ? class-validator - проверяет данные на входе в API, до попадания в бизнес-логику. Так как мы исп. ValidationPipe мы можем безопасно доверять нашим свойствам: "!".
