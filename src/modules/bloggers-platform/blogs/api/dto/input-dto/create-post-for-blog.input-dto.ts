import {
  contentConstraints,
  shortDescriptionConstraints,
  titleConstraints,
} from 'src/core/constants/constraints.constants';
import { IsStringWithLength } from 'src/core/decorators/string-and-length.decorator';

// * DTO model - response for db
export class CreatePostForBlogDto {
  @IsStringWithLength(titleConstraints.minLength, titleConstraints.maxLength)
  title!: string;

  @IsStringWithLength(
    shortDescriptionConstraints.minLength,
    shortDescriptionConstraints.maxLength,
  )
  shortDescription!: string;

  @IsStringWithLength(
    contentConstraints.minLength,
    contentConstraints.maxLength,
  )
  content!: string;
}

// ? class-validator - проверяет данные на входе в API, до попадания в бизнес-логику. Так как мы исп. ValidationPipe мы можем безопасно доверять нашим свойствам: "!".
