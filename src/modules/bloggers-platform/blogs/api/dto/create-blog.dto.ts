import { IsString, Length, Matches } from 'class-validator';

import {
  descriptionConstraints,
  nameConstraints,
  websiteUrlConstraints,
} from 'src/core/constants/constraints';

export class CreateBlogDto {
  @IsString()
  @Length(nameConstraints.minLength, nameConstraints.maxLength)
  public name!: string;

  @IsString()
  @Length(descriptionConstraints.minLength, descriptionConstraints.maxLength)
  public description!: string;

  @IsString()
  @Length(websiteUrlConstraints.minLength, websiteUrlConstraints.maxLength)
  @Matches(websiteUrlConstraints.match)
  public websiteUrl!: string;
}

// ? class-validator - проверяет данные на входе в API, до попадания в бизнес-логику. Так как мы исп. ValidationPipe мы можем безопасно доверять нашим свойствам: "!".
