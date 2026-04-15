import { IsString, Length, Matches } from 'class-validator';

export class CreateBlogDto {
  @IsString()
  @Length(1, 15)
  public name!: string;

  @IsString()
  @Length(1, 500)
  public description!: string;

  @IsString()
  @Matches(/^https:\/\/.+/i)
  public websiteUrl!: string;
}

// ? class-validator - проверяет данные на входе в API, до попадания в бизнес-логику. Так как мы исп. ValidationPipe мы можем безопасно доверять нашим свойствам: "!".
