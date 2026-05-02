import { Matches } from 'class-validator';

import {
  descriptionConstraints,
  nameConstraints,
  websiteUrlConstraints,
} from 'src/core/constants/constraints';
import { IsStringWithLength } from 'src/core/decorators/string-and-length.decorator';

export class CreateBlogDto {
  @IsStringWithLength(nameConstraints.minLength, nameConstraints.maxLength)
  public name!: string;

  @IsStringWithLength(
    descriptionConstraints.minLength,
    descriptionConstraints.maxLength,
  )
  public description!: string;

  @IsStringWithLength(
    websiteUrlConstraints.minLength,
    websiteUrlConstraints.maxLength,
  )
  @Matches(websiteUrlConstraints.match)
  public websiteUrl!: string;
}

// ? class-validator - проверяет данные на входе в API, до попадания в бизнес-логику. Так как мы исп. ValidationPipe мы можем безопасно доверять нашим свойствам: "!".
