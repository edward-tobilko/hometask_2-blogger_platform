import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';

import { AuthService } from '../../application/services/auth.service';
import {
  DomainException,
  DomainExceptionCode,
} from 'src/core/exceptions/domain.exception';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'login' }); // говорим что поле называется 'login', не 'username'
  }

  // * validate возвращает то, что впоследствии будет записано в req.user, а принимает свои встроенные поля: username / password.
  async validate(username: string, password: string): Promise<{ id: string }> {
    const user = await this.authService.validateUser(username, password);

    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'Invalid username or password',
      });
    }

    return user; // записывается в req.user
  }
}
