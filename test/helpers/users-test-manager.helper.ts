import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { Server } from 'http';
import { randomUUID } from 'crypto';

import { GLOBAL_PREFIX } from 'src/setup/global-prefix.setup';
import { CreateUserInputDto } from 'src/modules/user-accounts/api/input-dto/create-user.input-dto';
import { UserViewDto } from 'src/modules/user-accounts/api/view-dto/user.view-dto';
import {
  UsersQueryInputDto,
  UsersSortBy,
} from 'src/modules/user-accounts/api/input-dto/users-query.input-dto';
import { SortDirections } from 'src/core/enums/sort-directions.enum';
import { UsersPaginatedViewDto } from 'src/modules/user-accounts/api/view-dto/users-paginated.view-dto';

export class UsersTestManager {
  constructor(private readonly app: INestApplication) {}

  httpServer = this.app.getHttpServer() as Server;
  usersPath = `/${GLOBAL_PREFIX}/users` as string;
  authPath = `/${GLOBAL_PREFIX}/auth` as string;

  async registrationUser(
    dto: CreateUserInputDto,
    status: number = HttpStatus.NO_CONTENT,
  ): Promise<unknown> {
    const result = await request(this.httpServer)
      .post(`${this.authPath}/registration`)
      .send(dto)
      .expect(status);

    return result.body;
  }

  async createUser(
    createModel: CreateUserInputDto,
    statusCode: number = HttpStatus.CREATED,
  ): Promise<unknown> {
    const response = await request(this.httpServer)
      .post(this.usersPath)
      .send(createModel)
      .auth('admin', 'qwerty')
      .expect(statusCode);

    return response.body;
  }

  async createSeveralUsers(count: number): Promise<UserViewDto[]> {
    const users: UserViewDto[] = [];

    for (let i = 1; i <= count; i++) {
      // * делаем последовательное создание 12-ти юзеров (лучше для тестов)
      const res = (await this.createUser({
        login: `user${i}`,
        password: 'qwerty123',
        email: `user${i}@example.dev`,
      })) as UserViewDto;

      users.push(res);
    }

    return users;
  }

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

    return { ...payloadDto, ...payloadValidation };
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
      .auth('admin', 'qwerty')
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
      .auth('admin', 'qwerty')
      .expect(statusCode);

    return response.body;
  }

  async getResendRegistrationEmail(
    email?: string,
    statusCode: number = HttpStatus.NO_CONTENT,
  ): Promise<unknown> {
    const response = await request(this.httpServer)
      .post(`${this.authPath}/registration-email-resending`)
      .send({ email })
      .expect(statusCode);

    return response.body;
  }

  async confirmRegistration(
    code: string,
    statusCode: number = HttpStatus.NO_CONTENT,
  ): Promise<unknown> {
    const response = await request(this.httpServer)
      .post(`${this.authPath}/registration-confirmation`)
      .send({ code })
      .expect(statusCode);

    return response.body;
  }
}
