import { UserAccountDocument } from 'src/modules/user-accounts/domain/entities/user.entity';

export class UserExternalViewDto {
  id!: string;
  login!: string;
  email!: string;
  createdAt!: Date;
  firstName!: string;
  lastName!: string | null;

  static mapToView(user: UserAccountDocument): UserExternalViewDto {
    const dto = new UserExternalViewDto();

    dto.email = user.email;
    dto.login = user.login;
    dto.id = user._id.toString();
    dto.createdAt = user.createdAt;
    dto.firstName = user.fullName.firstName;
    dto.lastName = user.fullName.lastName;

    return dto;
  }
}
