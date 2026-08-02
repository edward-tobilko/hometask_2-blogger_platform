import {
  IsBoolean,
  IsDate,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class BanUserInputDto {
  @IsNotEmpty()
  @IsOptional()
  @IsString()
  banReason!: string;

  @IsOptional()
  @IsDate()
  banExpiresAt!: Date | null;

  @IsBoolean()
  @IsOptional()
  isBanned!: boolean;
}
