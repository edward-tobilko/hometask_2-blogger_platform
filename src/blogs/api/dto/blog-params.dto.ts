import { IsMongoId, IsString } from 'class-validator';

export class BlogIdParamDto {
  @IsString()
  @IsMongoId()
  id!: string;
}

export class BlogIdForPostsParamDto {
  @IsString()
  @IsMongoId()
  blogId!: string;
}
