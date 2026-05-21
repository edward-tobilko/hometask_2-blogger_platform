import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

import { LikeStatus } from '../enums/like-status.enum';

export class LikeStatusDto {
  @ApiProperty({
    enum: LikeStatus,
    enumName: 'LikeStatus',
    description: 'Send None if you want to unlike/undislike',
  })
  @IsEnum(LikeStatus)
  likeStatus!: LikeStatus;
}
