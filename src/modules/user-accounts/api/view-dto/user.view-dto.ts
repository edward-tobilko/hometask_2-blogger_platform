import { UserAccountOrmEntity } from '../../infrastructure/sql/schemas/user-orm.entity';

export class UserViewDto {
  id!: string;
  login!: string;
  email!: string;
  createdAt!: Date;

  static mapToViewModel(
    this: void, // ! плохая практика прокидывать this и прокидывать класс как значения, а не вызывать этот метод в .map()!
    userInstance: UserAccountOrmEntity, // ! не очень хорошая практика прокидывать в api dto -> orm entity, лучше ясвно обьект с полями!
  ): UserViewDto {
    const dto = new UserViewDto();

    dto.id = userInstance.id;
    dto.login = userInstance.login;
    dto.email = userInstance.email;
    dto.createdAt = userInstance.createdAt;

    return dto;
  }
}
