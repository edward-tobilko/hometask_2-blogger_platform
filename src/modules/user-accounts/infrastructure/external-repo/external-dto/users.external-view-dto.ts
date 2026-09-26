import { UserAccountOrmEntity } from '../../sql/schemas/user-orm.entity';
import { UserExternalRaw } from '../users.external-query-repo';

export class UserExternalViewDto {
  id!: string;
  login!: string;
  email!: string;
  createdAt!: Date;

  static mapToView(userInstance: UserAccountOrmEntity): UserExternalViewDto {
    const dto = new UserExternalViewDto();

    dto.id = userInstance.id;
    dto.login = userInstance.login;
    dto.email = userInstance.email;
    dto.createdAt = userInstance.createdAt;

    return dto;
  }

  static mapRawToView(userRaw: UserExternalRaw): UserExternalViewDto {
    const dto = new UserExternalViewDto();

    dto.id = userRaw.u_id;
    dto.login = userRaw.u_login;
    dto.email = userRaw.u_email;
    dto.createdAt = userRaw.u_created_at;

    return dto;
  }
}
