import { ApiProperty } from '@nestjs/swagger';

import { IsObjectId } from '../decorators/is-object-id.decorator';

export class IdParamDto {
  @ApiProperty({ description: 'Id of existing post' })
  @IsObjectId()
  id!: string;
}
