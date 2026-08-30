import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class IdParamDto {
  @ApiProperty({ description: 'Id of existing post' })
  @IsUUID()
  id!: string;
}
