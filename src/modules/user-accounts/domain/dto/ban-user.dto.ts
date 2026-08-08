import { BanDuration } from 'src/core/enums/ban-duration.enum';

export class BanUserDomainDto {
  userId!: string;

  isBanned!: boolean;
  banReason!: string;
  banExpiresAt!: BanDuration | null;
}
