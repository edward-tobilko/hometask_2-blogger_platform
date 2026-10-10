import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { CreateSecurityDevicesDomainDto } from 'src/modules/user-accounts/domain/dto/create-security-devices.dto';

@Entity('security_devices_session')
export class SecurityDeviceOrmEntity {
  @PrimaryGeneratedColumn('uuid') // create PK id at the DB level
  id!: string;

  @Column({ type: 'varchar' })
  ip!: string; // for example -> 127.0.0.1

  @Column({ type: 'varchar' })
  title!: string; // user's browser device name

  @Column({ name: 'last_active_date', type: 'timestamptz' })
  lastActiveDate!: Date; // момент выдачи текущего refresh token

  @Column({ name: 'device_id', type: 'uuid', unique: true })
  deviceId!: string; // uuid v4, генерируеться при login

  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @Column({ name: 'expires_at', type: 'timestamptz' })
  expiresAt!: Date;

  static create(dto: CreateSecurityDevicesDomainDto): SecurityDeviceOrmEntity {
    const securityDeviceInstance = new SecurityDeviceOrmEntity();

    securityDeviceInstance.ip = dto.ip;
    securityDeviceInstance.title = dto.title;
    securityDeviceInstance.lastActiveDate = dto.lastActiveDate;
    securityDeviceInstance.deviceId = dto.deviceId;
    securityDeviceInstance.userId = dto.userId;
    securityDeviceInstance.expiresAt = dto.expiresAt;

    return securityDeviceInstance;
  }
}
