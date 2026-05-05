import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';

import { AuthService } from '../../application/services/auth.service';
import {
  DomainException,
  Extension,
} from 'src/core/exceptions/domain.exception';
import { DomainExceptionCode } from 'src/core/exceptions/domain.exception-codes';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'loginOrEmail' }); // говорим что поле называется 'loginOrEmail', не 'username'!
  }

  // * validate возвращает то, что впоследствии будет записано в req.user, он принимает свои встроенные поля: username / password.
  async validate(username: string, password: string): Promise<{ id: string }> {
    const validatedUser = await this.authService.validateUser(
      username,
      password,
    );

    if (!validatedUser) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'Invalid username or password',
        extensions: [new Extension('Unauthorized', 'usernameOrPassword')],
      });
    }

    return validatedUser; // записывается в req.user
  }
}

// ? LocalStrategy - это Passport-стратегия, которая перехватывает тело запроса и вытаскивает из него поля для аутентификации. (https://docs.nestjs.com/recipes/passport)
