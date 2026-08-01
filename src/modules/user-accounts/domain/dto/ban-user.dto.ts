export class BanUserDto {
  userId!: string;
  banReason!: string;
  banExpiresAt!: Date | null;
}
