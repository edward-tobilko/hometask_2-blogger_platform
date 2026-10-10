import { ApiProperty } from '@nestjs/swagger';

import { IsUUId } from 'src/core/decorators/is-object-id.decorator';

export class BlogIdParamDto {
  @ApiProperty({ description: 'Existing blog id' })
  @IsUUId()
  id!: string;
}

export class BlogIdForPostsParamDto {
  @IsUUId()
  blogId!: string;
}
