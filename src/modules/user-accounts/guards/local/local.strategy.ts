import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { plainToInstance } from 'class-transformer';
import { validate as validateDto } from 'class-validator';

import { AuthService } from '../../application/services/auth.service';
import {
  DomainException,
  Extension,
} from 'src/core/exceptions/domain.exception';
import { DomainExceptionCode } from 'src/core/exceptions/domain.exception-codes';
import { LoginInputDto } from '../../api/input-dto/login.input-dto';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'loginOrEmail' }); // говорим что поле называется 'loginOrEmail', не 'username'!
  }

  async validate(username: string, password: string): Promise<{ id: string }> {
    const dto = plainToInstance(LoginInputDto, {
      loginOrEmail: username,
      password,
    });
    const errors = await validateDto(dto);

    if (errors.length > 0) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Validation failed',
        extensions: errors.flatMap((e) =>
          Object.values(e.constraints ?? {}).map(
            (msg) => new Extension(msg, e.property),
          ),
        ),
      });
    }

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
