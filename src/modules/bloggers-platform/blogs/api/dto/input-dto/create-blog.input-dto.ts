import { ApiProperty } from '@nestjs/swagger';
import { Matches } from 'class-validator';

import {
  descriptionConstraints,
  nameConstraints,
  websiteUrlConstraints,
} from 'src/core/constants/constraints.constants';
import { IsStringWithLength } from 'src/core/decorators/string-and-length.decorator';

export class CreateBlogDto {
  @ApiProperty({
    minLength: nameConstraints.minLength,
    maxLength: nameConstraints.maxLength,
  })
  @IsStringWithLength(nameConstraints.minLength, nameConstraints.maxLength)
  public name!: string;

  @ApiProperty({
    minLength: descriptionConstraints.minLength,
    maxLength: descriptionConstraints.maxLength,
  })
  @IsStringWithLength(
    descriptionConstraints.minLength,
    descriptionConstraints.maxLength,
  )
  public description!: string;

  @ApiProperty({
    minLength: websiteUrlConstraints.minLength,
    maxLength: websiteUrlConstraints.maxLength,
    pattern: websiteUrlConstraints.match.toString(),
  })
  @IsStringWithLength(
    websiteUrlConstraints.minLength,
    websiteUrlConstraints.maxLength,
  )
  @Matches(websiteUrlConstraints.match)
  public websiteUrl!: string;
}

// ? class-validator - проверяет данные на входе в API, до попадания в бизнес-логику. Так как мы исп. ValidationPipe мы можем безопасно доверять нашим свойствам: "!".
