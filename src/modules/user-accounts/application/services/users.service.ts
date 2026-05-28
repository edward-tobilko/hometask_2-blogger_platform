import { Injectable } from '@nestjs/common';

import { UsersRepository } from '../../infrastructure/repositories/users.repository';
import {
  DomainException,
  Extension,
} from 'src/core/exceptions/domain.exception';
import { DomainExceptionCode } from 'src/core/exceptions/domain.exception-codes';

@Injectable()
export class UsersService {
  constructor(private usersRepo: UsersRepository) {}

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
