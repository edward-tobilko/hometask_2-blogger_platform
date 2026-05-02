import { IsObjectId } from '../decorators/is-object-id.decorator';

export class IdParamDto {
  @IsObjectId()
  id!: string;
}
