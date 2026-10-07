import { BanDuration } from 'src/core/enums/ban-duration.enum';

export class BanUserDomainDto {
  isBanned!: boolean;
  banReason!: string;
  banExpiresAt!: BanDuration;

  userId!: string;
}
