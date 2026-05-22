import { IsNotEmpty, IsString, Matches } from 'class-validator';
import { applyDecorators } from '@nestjs/common';

import { Trim } from './trim.decorator';
import { emailConstraints } from 'src/modules/user-accounts/constraints/users.constraints';

export const IsValidEmail = () =>
  applyDecorators(
    Matches(emailConstraints.match, {
      message: 'Email must be a valid email address',
    }),
    Trim(),
    IsString(),
    IsNotEmpty(),
  );
