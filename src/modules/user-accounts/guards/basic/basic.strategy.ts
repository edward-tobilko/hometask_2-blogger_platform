import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { BasicStrategy as Strategy } from 'passport-http';

import { CoreConfig } from 'src/core/core.config';
import { DomainException } from 'src/core/exceptions/domain.exception';
import { DomainExceptionCode } from 'src/core/exceptions/domain.exception-codes';

// * Нужно инжектировать в контроллер или стратегию или гард.
@Injectable()
export class BasicStrategy extends PassportStrategy(Strategy, 'basic') {
  constructor(private coreConfig: CoreConfig) {
    super();
  }

  validate(username: string, password: string): boolean {
    if (
      username !== this.coreConfig.adminUserName ||
      password !== this.coreConfig.adminPassword
    ) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'Unauthorized',
      });
    } else {
      return true;
    }
  }
}
