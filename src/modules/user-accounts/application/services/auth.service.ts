import { Injectable } from '@nestjs/common';

import { UsersRepository } from '../../infrastructure/repositories/users.repository';
import { DomainException } from 'src/core/exceptions/domain.exception';
import { DomainExceptionCode } from 'src/core/exceptions/domain.exception-codes';
import { CryptoService } from './crypto.service';
import { CreateUserInterface } from '../../domain/interfaces/create-user-interface';

@Injectable()
export class AuthService {
  constructor(
    private usersRepo: UsersRepository,
    private cryptoService: CryptoService,
  ) {}

  async registerUser(
    login: string,
    password: string,
    email: string,
  ): Promise<any> {
    const existingUserByLoginOrEmail =
      await this.usersRepo.findUserByLoginOrEmail(login, email);

    if (existingUserByLoginOrEmail)
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: `Already registered`,
      });

    const passwordHash = await this.cryptoService.createPasswordHash(password);

    const domainDto: CreateUserInterface = {
      login,
      email,
      passwordHash,

      // name: {
      //   firstName: 'linda',
      //   lastName: 'melinda',
      // },
    };

    await this.usersRepo.create(domainDto);
  }

  async validateUser(
    login: string,
    password: string,
  ): Promise<{ id: string } | null> {
    const user = await this.usersRepo.findByLogin(login);

    if (!user) return null;

    const validPassword = password;

    if (!validPassword) return null;

    return { id: user.id.toString() };
  }
}
