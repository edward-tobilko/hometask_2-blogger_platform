import { IsValidEmail } from 'src/core/decorators/email.decorator';

export class RegistrationEmailResendingInputDto {
  @IsValidEmail()
  email!: string;
}
