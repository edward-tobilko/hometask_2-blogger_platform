export class BanUserDto {
  userId!: string;

  isBanned!: boolean;
  banReason!: string;
  banExpiresAt!: Date | null;
}
