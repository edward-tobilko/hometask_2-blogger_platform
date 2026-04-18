import { IsMongoId, IsString } from 'class-validator';

export class UserIdParamDto {
  @IsString()
  @IsMongoId()
  id!: string;
}
