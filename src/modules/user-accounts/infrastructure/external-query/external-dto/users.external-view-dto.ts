import { UserAccountDocument } from 'src/modules/user-accounts/domain/entities/user.entity';

export class UserExternalViewDto {
  id!: string;
  login!: string;
  email!: string;
  createdAt!: Date;

  static mapToView(user: UserAccountDocument): UserExternalViewDto {
    const dto = new UserExternalViewDto();

    dto.id = user._id.toString();
    dto.login = user.login;
    dto.email = user.email;
    dto.createdAt = user.createdAt;

    return dto;
  }
}
