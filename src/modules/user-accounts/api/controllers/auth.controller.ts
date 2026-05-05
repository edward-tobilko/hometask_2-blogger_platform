import { Body, Controller, HttpCode, Post } from '@nestjs/common';

import { API_ROUTES } from 'src/core/constants/api-routes';
import { CreateUserInputDto } from '../input-dto/create-user.input-dto';
import { AuthService } from '../../application/services/auth.service';
import { RegistrationConfirmInputDto } from '../input-dto/registration-confirm.input-dto';
import { RegistrationEmailResendingInputDto } from '../input-dto/registration-email-resending.input-dto';
import { PasswordRecoveryInputDto } from '../input-dto/password-recovery.input-dto';

@Controller(API_ROUTES.authorization)
export class AuthController {
  constructor(private authService: AuthService) {}

  // * POST: Password recovery via email confirmation. Email should be sent with RecoveryCode inside.
  @Post('password-recovery')
  @HttpCode(204)
  passwordRecovery(@Body() dto: PasswordRecoveryInputDto): Promise<void> {
    return this.authService.setNewPasswordRecovery(dto.email);
  }

  // * POST: Confirm registration.
  @Post('registration-confirmation')
  @HttpCode(204)
  confirmRegistration(@Body() dto: RegistrationConfirmInputDto): Promise<void> {
    return this.authService.setConfirmRegister(dto.code);
  }

  // * POST: Registration in the system. Email with confirmation code will be send to passed email address.
  @Post('registration')
  @HttpCode(204)
  registration(@Body() dto: CreateUserInputDto): Promise<void> {
    const { login, password, email } = dto;

    return this.authService.registerUser(login, password, email);
  }

  // * POST: Resend confirmation registration  email if user exist.
  @Post('registration-email-resending')
  @HttpCode(204)
  registrationEmailResending(
    @Body() dto: RegistrationEmailResendingInputDto,
  ): Promise<void> {
    return this.authService.resendConfirmationEmail(dto.email);
  }
}
