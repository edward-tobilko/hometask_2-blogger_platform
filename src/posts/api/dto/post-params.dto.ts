import { IsMongoId, IsString } from 'class-validator';

export class PostIdParamDto {
  @IsString()
  @IsMongoId()
  postId!: string;
}
