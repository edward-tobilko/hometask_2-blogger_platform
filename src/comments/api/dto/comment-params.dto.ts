import { IsMongoId, IsString } from 'class-validator';

export class CommentParams {
  @IsString()
  @IsMongoId()
  id!: string;
}
