import { IsStringWithLength } from 'src/core/decorators/string-and-length.decorator';
import { contentForCommentConstraints } from '../../../constraints/posts/posts.constraints';
import { ApiProperty } from '@nestjs/swagger';

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
