import { Injectable } from '@nestjs/common';

import { UsersRepository } from '../../infrastructure/repositories/users.repository';

@Injectable()
export class AuthService {
  constructor(private usersRepo: UsersRepository) {}

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
