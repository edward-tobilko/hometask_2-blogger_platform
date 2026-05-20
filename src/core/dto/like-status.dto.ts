import { IsEnum } from 'class-validator';

import { LikeStatus } from '../enums/like-status.enum';

export class LikeStatusDto {
  @IsEnum(LikeStatus)
  likeStatus!: LikeStatus;
}
