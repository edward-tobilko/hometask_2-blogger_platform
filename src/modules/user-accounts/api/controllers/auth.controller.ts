import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  UseGuards,
} from '@nestjs/common';

import { API_ROUTES } from 'src/core/constants/api-routes.constants';
import { CreateUserInputDto } from '../input-dto/create-user.input-dto';
import { AuthService } from '../../application/services/auth.service';
import { RegistrationConfirmInputDto } from '../input-dto/registration-confirm.input-dto';
import { RegistrationEmailResendingInputDto } from '../input-dto/registration-email-resending.input-dto';
import { PasswordRecoveryInputDto } from '../input-dto/password-recovery.input-dto';
import { NewPassword } from '../input-dto/new-password.input-dto';
import { HttpStatusCodes } from 'src/core/constants/http-codes.constants';
import { CurrentUserFromRequest } from '../../guards/decorators/params/current-user.param-decorator';
import { LocalAuthGuard } from '../../guards/local/local-auth.guard';
import { JwtAuthGuard } from '../../guards/bearer/jwt-auth.guard';
import { UserSessionViewDto } from '../view-dto/user-session.view-dto';
import { ApiBody, ApiOperation } from '@nestjs/swagger';

@Controller(API_ROUTES.authorization)
export class AuthController {
  constructor(private authService: AuthService) {}

  // * POST: Try login user to the system.
  @Post('login')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        loginOrEmail: { type: 'string', example: 'string' },
        password: { type: 'string', example: 'string' },
      },
    },
  })
  @ApiOperation({ summary: 'Try login user to the system.' })
  @HttpCode(HttpStatusCodes.OK_200)
  @UseGuards(LocalAuthGuard) // LocalAuthGuard запускает LocalStrategy.validate → кладёт { id } в req.user → контроллер берёт id и генерирует токен.
  login(@CurrentUserFromRequest() currentUser: { id: string }): {
    accessToken: string;
  } {
    return this.authService.login(currentUser.id);
  }

  // * POST: Password recovery via email confirmation. Email should be sent with RecoveryCode inside.
  @Post('password-recovery')
  @HttpCode(HttpStatusCodes.NO_CONTENT_204)
  passwordRecovery(@Body() dto: PasswordRecoveryInputDto): Promise<void> {
    return this.authService.sendPasswordRecovery(dto.email);
  }

  // * POST: Confirm password recovery.
  @Post('new-password')
  @HttpCode(HttpStatusCodes.NO_CONTENT_204)
  newPassword(@Body() dto: NewPassword): Promise<void> {
    return this.authService.setNewPassword(dto);
  }

  // * POST: Confirm registration.
  @Post('registration-confirmation')
  @HttpCode(HttpStatusCodes.NO_CONTENT_204)
  confirmRegistration(@Body() dto: RegistrationConfirmInputDto): Promise<void> {
    return this.authService.setConfirmRegister(dto.code);
  }

  // * POST: Registration in the system. Email with confirmation code will be send to passed email address.
  @Post('registration')
  @HttpCode(HttpStatusCodes.NO_CONTENT_204)
  registration(@Body() dto: CreateUserInputDto): Promise<void> {
    const { login, password, email } = dto;

    return this.authService.registerUser(login, password, email);
  }

  // * POST: Resend confirmation registration  email if user exist.
  @Post('registration-email-resending')
  @HttpCode(HttpStatusCodes.NO_CONTENT_204)
  registrationEmailResending(
    @Body() dto: RegistrationEmailResendingInputDto,
  ): Promise<void> {
    return this.authService.resendConfirmationEmail(dto.email);
  }

  // * GET: Get info about current user.
  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(
    @CurrentUserFromRequest() currentUser: { id: string },
  ): Promise<UserSessionViewDto> {
    return this.authService.getMe(currentUser.id);
  }
}
