import { IsString, IsUUID } from 'class-validator';

export class PostIdParamDto {
  @IsString()
  @IsUUID()
  postId!: string;
}
