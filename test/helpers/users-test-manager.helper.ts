import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { Server } from 'http';
import { randomUUID } from 'crypto';
import { Model } from 'mongoose';

import { GLOBAL_PREFIX } from 'src/setup/global-prefix.setup';
import { CreateUserInputDto } from 'src/modules/user-accounts/api/input-dto/create-user.input-dto';
import { UserViewDto } from 'src/modules/user-accounts/api/view-dto/user.view-dto';
import {
  UsersQueryInputDto,
  UsersSortBy,
} from 'src/modules/user-accounts/api/input-dto/users-query.input-dto';
import { SortDirections } from 'src/core/enums/sort-directions.enum';
import { UsersPaginatedViewDto } from 'src/modules/user-accounts/api/view-dto/users-paginated.view-dto';
import { LoginInputDto } from 'src/modules/user-accounts/api/input-dto/login.input-dto';
import { PasswordRecoveryInputDto } from 'src/modules/user-accounts/api/input-dto/password-recovery.input-dto';
import { RegistrationConfirmInputDto } from 'src/modules/user-accounts/api/input-dto/registration-confirm.input-dto';
import { RegistrationEmailResendingInputDto } from 'src/modules/user-accounts/api/input-dto/registration-email-resending.input-dto';
import { NewPassword } from 'src/modules/user-accounts/api/input-dto/new-password.input-dto';
import { UserSessionViewDto } from 'src/modules/user-accounts/api/view-dto/user-session.view-dto';
import { UserAccountDocument } from 'src/modules/user-accounts/domain/entities/user.entity';

export class UserTestManager {
  constructor(
    private readonly app: INestApplication,
    private readonly userModel: Model<UserAccountDocument>,
  ) {}

  private readonly ADMIN_LOGIN = 'admin';
  private readonly ADMIN_PASSWORD = 'qwerty';

  httpServer = this.app.getHttpServer() as Server;
  usersPath = `/${GLOBAL_PREFIX}/users` as string;
  authPath = `/${GLOBAL_PREFIX}/auth` as string;

  getUserInputDto(
    payloadValidation?: Record<string, unknown>,
  ): CreateUserInputDto {
    const uniqueUser = randomUUID().slice(0, 6);
    const DEFAULT_PASSWORD = 'qwerty123';

    const payloadDto: CreateUserInputDto = {
      login: `user${uniqueUser}`,
      password: DEFAULT_PASSWORD,
      email: `user${uniqueUser}@example.dev`,
    };

    return { ...payloadDto, ...payloadValidation }; // если одинаковый ключ есть в обоих объектах — правый перезаписывает левый.
  }

  async getMe(
    accessToken?: string,
    statusCode: number = HttpStatus.OK,
  ): Promise<UserSessionViewDto> {
    const response = await request(this.httpServer)
      .get(`${this.authPath}/me`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(statusCode);

    return response.body as UserSessionViewDto;
  }

  async login(
    dto: LoginInputDto,
    statusCode: number = HttpStatus.OK,
  ): Promise<{ accessToken: string; cookies: string[] }> {
    const response = await request(this.httpServer)
      .post(`${this.authPath}/login`)
      .send(dto)
      .expect(statusCode);

    return {
      ...response.body, // return accessToken
      cookies: response.headers['set-cookie'] ?? [],
    } as { accessToken: string; cookies: string[] };
  }

  async registrationUser(
    dto: CreateUserInputDto,
    status: number = HttpStatus.NO_CONTENT,
  ): Promise<unknown> {
    const response = await request(this.httpServer)
      .post(`${this.authPath}/registration`)
      .send(dto)
      .expect(status);

    return response.body;
  }

  async createUser(
    createModel: CreateUserInputDto,
    statusCode: number = HttpStatus.CREATED,
  ): Promise<UserViewDto> {
    const response = await request(this.httpServer)
      .post(this.usersPath)
      .send(createModel)
      .auth(this.ADMIN_LOGIN, this.ADMIN_PASSWORD)
      .expect(statusCode);

    return response.body as UserViewDto;
  }

  async createSeveralUsers(count: number): Promise<UserViewDto[]> {
    const users: UserViewDto[] = [];

    for (let i = 1; i <= count; i++) {
      // * делаем последовательное создание 12-ти юзеров (лучше для тестов)
      const res = await this.createUser({
        login: `user${i}`,
        password: 'qwerty123',
        email: `user${i}@example.dev`,
      });

      users.push(res);
    }

    return users;
  }

  async getRegisteredAndConfirmedUser() {
    // * getting dto
    const dto = this.getUserInputDto();
    const { email, login, password } = dto;

    // * registering user in the system
    await this.registrationUser(dto);

    // * finding user by email
    const userDb = await this.userModel.findOne({ email: dto.email });

    // * getting confirm code
    const confirmCode = userDb!.emailConfirmation.confirmationCode!;

    await this.getConfirmRegistration({
      code: confirmCode,
    });

    return { email, login, password, confirmCode };
  }

  async getUsersPaginatedList(
    optional: { query?: Partial<UsersQueryInputDto> } = {},
    statusCode: number = HttpStatus.OK,
  ): Promise<UsersPaginatedViewDto> {
    const { query } = optional;

    const defaultQuery = {
      sortBy: UsersSortBy.CreatedAt,
      sortDirection: SortDirections.DESC,
      pageNumber: 1,
      pageSize: 10,

      ...query,
    };

    const usersList = await request(this.httpServer)
      .get(this.usersPath)
      .auth(this.ADMIN_LOGIN, this.ADMIN_PASSWORD)
      .query(defaultQuery)
      .expect(statusCode);

    return usersList.body as UsersPaginatedViewDto;
  }

  async deleteUser(
    userId: string,
    statusCode: number = HttpStatus.NO_CONTENT,
  ): Promise<unknown> {
    const response = await request(this.httpServer)
      .delete(`${this.usersPath}/${userId}`)
      .auth(this.ADMIN_LOGIN, this.ADMIN_PASSWORD)
      .expect(statusCode);

    return response.body;
  }

  async getResendRegistrationEmail(
    email: RegistrationEmailResendingInputDto,
    statusCode: number = HttpStatus.NO_CONTENT,
  ): Promise<unknown> {
    const response = await request(this.httpServer)
      .post(`${this.authPath}/registration-email-resending`)
      .send(email)
      .expect(statusCode);

    return response.body;
  }

  async getConfirmRegistration(
    code: RegistrationConfirmInputDto,
    statusCode: number = HttpStatus.NO_CONTENT,
  ): Promise<unknown> {
    const response = await request(this.httpServer)
      .post(`${this.authPath}/registration-confirmation`)
      .send(code)
      .expect(statusCode);

    return response.body;
  }

  async getRecoveryPassword(
    email: PasswordRecoveryInputDto,
    statusCode: number = HttpStatus.NO_CONTENT,
  ): Promise<unknown> {
    const response = await request(this.httpServer)
      .post(`${this.authPath}/password-recovery`)
      .send(email)
      .expect(statusCode);

    return response.body;
  }

  async getNewPassword(
    password: NewPassword,
    statusCode: number = HttpStatus.NO_CONTENT,
  ): Promise<unknown> {
    const response = await request(this.httpServer)
      .post(`${this.authPath}/new-password`)
      .send(password)
      .expect(statusCode);

    return response.body;
  }

  async findUserByEmail(email: string): Promise<UserAccountDocument | null> {
    return this.userModel.findOne({ email });
  }
}

// ? там где мы return unknown - потому что по контракту status = 204 (без тела), а так же безопастней чем any.
