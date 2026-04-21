import { IsMongoId, IsString } from 'class-validator';

export class IdParamDto {
  @IsString()
  @IsMongoId()
  id!: string;
}
