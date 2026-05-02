import { IsObjectId } from 'src/core/decorators/is-object-id.decorator';

export class BlogIdParamDto {
  @IsObjectId()
  id!: string;
}

export class BlogIdForPostsParamDto {
  @IsObjectId()
  blogId!: string;
}
