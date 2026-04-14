import { IsString, Length, Matches } from 'class-validator';

export class CreateBlogDto {
  @IsString()
  @Length(1, 15)
  public name: string;

  @IsString()
  @Length(1, 500)
  public description: string;

  @IsString()
  @Matches(/^https:\/\/.+/i)
  public websiteUrl: string;

  constructor(name: string, description: string, websiteUrl: string) {
    this.name = name;
    this.description = description;
    this.websiteUrl = websiteUrl;
  }
}

// ? class-validator - проверяет данные на входе в API, до попадания в бизнес-логику.
