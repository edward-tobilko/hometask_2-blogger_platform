import { UserAccountOrmEntity } from '../../sql/schemas/user-orm.entity';

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
}
