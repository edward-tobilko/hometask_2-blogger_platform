import { ApiProperty } from '@nestjs/swagger';
import { Matches } from 'class-validator';

import { IsValidEmail } from 'src/core/decorators/email.decorator';
import { IsStringWithTrim } from 'src/core/decorators/string-and-trim.decorator';
import {
  emailConstraints,
  loginConstraints,
  passwordConstraints,
} from '../../constraints/users.constraints';

export class CreateUserInputDto {
  @ApiProperty({
    maxLength: loginConstraints.maxLength,
    minLength: loginConstraints.minLength,
    pattern: loginConstraints.match.toString(),
    uniqueItems: true,
    description: 'must be unique',
  })
  @Matches(loginConstraints.match, { message: 'Login must be a valid' })
  @IsStringWithTrim(loginConstraints.minLength, loginConstraints.maxLength)
  login!: string;

  @ApiProperty({
    maxLength: passwordConstraints.maxLength,
    minLength: passwordConstraints.minLength,
  })
  @IsStringWithTrim(
    passwordConstraints.minLength,
    passwordConstraints.maxLength,
  )
  password!: string;

  @ApiProperty({
    example: 'example@example.dev',
    uniqueItems: true,
    description: 'must be unique',
    pattern: emailConstraints.match.toString(),
  })
  @IsValidEmail()
  email!: string;
}

// ? class-validator - использует декораторы (@IsString(), @IsNotEmpty() и т.д.), которые работают через reflect-metadata — они сохраняют метаданные прямо на классе в рантайме. Если бы DTO был interface — после компиляции он исчез бы, и декораторам просто не к чему было бы "прицепиться". NestJS ValidationPipe не смог бы прочитать правила валидации.
