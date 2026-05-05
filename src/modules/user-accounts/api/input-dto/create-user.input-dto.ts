import { ApiProperty } from '@nestjs/swagger';
import { Matches } from 'class-validator';

import {
  loginConstraints,
  passwordConstraints,
} from 'src/core/constants/constraints';
import { IsValidEmail } from 'src/core/decorators/email.decorator';
import { IsStringWithTrim } from 'src/core/decorators/string-and-trim.decorator';

export class CreateUserInputDto {
  @ApiProperty({ example: 'My login' })
  @Matches(loginConstraints.match, { message: 'Login must be a valid' })
  @IsStringWithTrim(loginConstraints.minLength, loginConstraints.maxLength)
  login!: string;

  @ApiProperty({ example: 'My password' })
  @IsStringWithTrim(
    passwordConstraints.minLength,
    passwordConstraints.maxLength,
  )
  password!: string;

  @ApiProperty({ example: 'My email' })
  @IsValidEmail()
  email!: string;
}

// ? class-validator - использует декораторы (@IsString(), @IsNotEmpty() и т.д.), которые работают через reflect-metadata — они сохраняют метаданные прямо на классе в рантайме. Если бы DTO был interface — после компиляции он исчез бы, и декораторам просто не к чему было бы "прицепиться". NestJS ValidationPipe не смог бы прочитать правила валидации.
