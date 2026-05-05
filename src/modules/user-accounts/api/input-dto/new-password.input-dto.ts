import { IsNotEmpty, IsString } from 'class-validator';

import { passwordConstraints } from 'src/core/constants/constraints.constants';
import { IsStringWithTrim } from 'src/core/decorators/string-and-trim.decorator';

export class NewPassword {
  @IsStringWithTrim(
    passwordConstraints.minLength,
    passwordConstraints.maxLength,
  )
  newPassword!: string;

  @IsString()
  @IsNotEmpty()
  recoveryCode!: string;
}
