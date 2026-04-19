import { IsMongoId, IsString } from 'class-validator';

export class PostParamsDto {
  @IsString()
  @IsMongoId()
  id!: string;
}
