import { ApiProperty } from '@nestjs/swagger';

import { IsObjectId } from 'src/core/decorators/is-object-id.decorator';

export class BlogIdParamDto {
  @ApiProperty({ description: 'Existing blog id' })
  @IsObjectId()
  id!: string;
}

export class BlogIdForPostsParamDto {
  @IsObjectId()
  blogId!: string;
}
