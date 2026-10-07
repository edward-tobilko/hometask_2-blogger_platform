import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsString,
  ValidateIf,
} from 'class-validator';

import { BanDuration } from 'src/core/enums/ban-duration.enum';

export class BanUserInputDto {
  @IsBoolean()
  isBanned!: boolean;

  @IsNotEmpty()
  @IsString()
  @ValidateIf((dto: BanUserInputDto) => dto.isBanned === true)
  banReason!: string;

  @ValidateIf((object: BanUserInputDto) => object.isBanned === true)
  @IsEnum(BanDuration)
  banExpiresAt!: BanDuration;
}
