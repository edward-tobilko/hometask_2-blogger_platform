import { ApiProperty } from '@nestjs/swagger';
import { IsValidEmail } from 'src/core/decorators/email.decorator';

export class RegistrationEmailResendingInputDto {
  @ApiProperty({
    pattern: '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$',
    example: 'example@example.com',
    description: 'Email of already registered but not confirmed user',
  })
  @IsValidEmail()
  email!: string;
}
