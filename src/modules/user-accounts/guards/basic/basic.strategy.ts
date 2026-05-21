import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { BasicStrategy as Strategy } from 'passport-http';

import { DomainException } from 'src/core/exceptions/domain.exception';
import { DomainExceptionCode } from 'src/core/exceptions/domain.exception-codes';

@Injectable()
export class BasicStrategy extends PassportStrategy(Strategy, 'basic') {
  constructor(private config: ConfigService) {
    super();
  }

  validate(username: string, password: string): boolean {
    const adminUsername = this.config.get<string>('ADMIN_USERNAME');
    const adminPassword = this.config.get<string>('ADMIN_PASSWORD');

    if (username !== adminUsername || password !== adminPassword) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'Unauthorized',
      });
    } else {
      return true;
    }
  }
}
