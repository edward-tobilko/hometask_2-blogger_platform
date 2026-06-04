import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

import { IsStringWithTrim } from 'src/core/decorators/string-and-trim.decorator';
import { passwordConstraints } from '../constraints/users.constraints';

export class NewPassword {
  @ApiProperty({
    maxLength: passwordConstraints.maxLength,
    minLength: passwordConstraints.minLength,
    description: 'New password',
  })
  @IsStringWithTrim(
    passwordConstraints.minLength,
    passwordConstraints.maxLength,
  )
  newPassword!: string;

  @ApiProperty({
    description: 'New password',
  })
  @IsString()
  @IsNotEmpty()
  recoveryCode!: string;
}
