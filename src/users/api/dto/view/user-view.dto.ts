import { UserDocument, UserLean } from 'src/users/domain/entities/user.entity';

export class UserViewDto {
  id!: string;
  login!: string;
  email!: string;
  createdAt!: string;

  static mapToViewModel(
    this: void,
    user: UserDocument | UserLean,
  ): UserViewDto {
    const dto = new UserViewDto();

    dto.id = user._id.toString();
    dto.login = user.login;
    dto.email = user.email;
    dto.createdAt = user.createdAt.toISOString();

    return dto;
  }
}
