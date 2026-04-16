import { IsString, Length } from 'class-validator';

// * DTO model - response for db
export class CreatePostForBlogDto {
  @IsString()
  @Length(1, 30)
  title!: string;

  @IsString()
  @Length(1, 100)
  shortDescription!: string;

  @IsString()
  @Length(1, 1000)
  content!: string;
}

// ? class-validator - проверяет данные на входе в API, до попадания в бизнес-логику. Так как мы исп. ValidationPipe мы можем безопасно доверять нашим свойствам: "!".
