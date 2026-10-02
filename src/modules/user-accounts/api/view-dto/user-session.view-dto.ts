import { ApiProperty } from '@nestjs/swagger';

export class UserSessionViewDto {
  @ApiProperty()
  email!: string;

  @ApiProperty()
  login!: string;

  @ApiProperty()
  userId!: string;

  static mapToViewModel(userInstance: {
    id: string;
    login: string;
    email: string;
  }): UserSessionViewDto {
    const dto = new UserSessionViewDto();

    dto.userId = userInstance.id;
    dto.login = userInstance.login;
    dto.email = userInstance.email;

    return dto;
  }
}
