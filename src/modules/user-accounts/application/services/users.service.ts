import { Injectable } from '@nestjs/common';

import {
  DomainException,
  Extension,
} from 'src/core/exceptions/domain.exception';
import { DomainExceptionCode } from 'src/core/exceptions/domain.exception-codes';
import { UsersSqlRepository } from '../../infrastructure/sql/repositories/users-sql.repository';

@Injectable()
export class UsersService {
  constructor(private usersRepo: UsersSqlRepository) {}

  async ensureLoginAndEmailUnique(login: string, email: string): Promise<void> {
    const existingUserByLogin = await this.usersRepo.findByLogin(login);

    if (existingUserByLogin)
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: `Already registered`,
        extensions: [new Extension('Already registered', 'login')], // just for status code 400 (bad request)
      });

    const existingUserByEmail = await this.usersRepo.findByEmail(email);

    if (existingUserByEmail)
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: `Already registered`,
        extensions: [new Extension('Already registered', 'email')], // just for status code 400 (bad request)
      });
  }
}
