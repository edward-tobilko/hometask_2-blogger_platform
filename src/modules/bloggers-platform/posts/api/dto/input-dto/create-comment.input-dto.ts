import { ApiProperty } from '@nestjs/swagger';

import { IsStringWithLength } from 'src/core/decorators/string-and-length.decorator';
import { contentForCommentConstraints } from '../../constraints/posts.constraints';

export class CreateCommentInputDto {
  @ApiProperty({
    minLength: contentForCommentConstraints.minLength,
    maxLength: contentForCommentConstraints.maxLength,
  })
  @IsStringWithLength(
    contentForCommentConstraints.minLength,
    contentForCommentConstraints.maxLength,
  )
  content!: string;
}
