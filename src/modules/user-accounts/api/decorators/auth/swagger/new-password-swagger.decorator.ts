import { applyDecorators } from '@nestjs/common';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';

import { NewPassword } from '../../../input-dto/new-password.input-dto';

export const ApiNewPasswordSwagger = (summary: string) => {
  return applyDecorators(
    ApiOperation({ summary }),

    ApiConsumes('application/json', 'text/json', 'application/*+json'),

    ApiBody({ type: NewPassword }),

    ApiResponse({
      status: 204,
      description: 'If code is valid and new password is accepted',
    }),
    ApiResponse({
      status: 400,
      description: `If the inputModel has incorrect value (for incorrect password length) or RecoveryCode is incorrect or expired`,
    }),
    ApiResponse({
      status: 429,
      description: 'More than 5 attempts from one IP-address during 10 seconds',
    }),
  );
};
