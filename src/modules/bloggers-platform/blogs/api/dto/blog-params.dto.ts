import { IdValidation } from 'src/core/decorators/id-validation.decorator';

export class BlogIdParamDto {
  @IdValidation()
  id!: string;
}

export class BlogIdForPostsParamDto {
  // @IdValidation()
  blogId!: string;
}
