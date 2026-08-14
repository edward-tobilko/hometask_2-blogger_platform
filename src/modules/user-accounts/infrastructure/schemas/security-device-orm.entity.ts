import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('security_devices_session')
export class SecurityDeviceOrmEntity {
  @PrimaryColumn({ type: 'uuid', default: () => 'gen_random_uuid()' }) // create PK id at the DB level
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
}
