import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

import { BanDuration } from 'src/core/enums/ban-duration.enum';

export class BanUserInputDto {
  @IsNotEmpty()
  @IsOptional()
  @IsString()
  banReason!: string;

  @IsOptional()
  @IsEnum(BanDuration)
  banExpiresAt!: BanDuration | null;

  @IsBoolean()
  @IsOptional()
  isBanned!: boolean;
}
