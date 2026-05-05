import { IsValidEmail } from 'src/core/decorators/email.decorator';

export class PasswordRecoveryInputDto {
  @IsValidEmail()
  email!: string;
}
