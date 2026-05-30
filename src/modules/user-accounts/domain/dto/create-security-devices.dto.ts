export class CreateSecurityDevicesDomainDto {
  ip!: string;
  title!: string;
  lastActiveDate!: Date;
  deviceId!: string;

  userId!: string;
  expiresAt!: Date;
}
