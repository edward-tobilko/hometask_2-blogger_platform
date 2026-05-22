import { ResendConfirmationEmailCommand } from './../../application/use-cases/users/resend-email-register.use-case';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Response } from 'express';

import { API_ROUTES } from 'src/core/constants/api-routes.constants';
import { CreateUserInputDto } from '../input-dto/create-user.input-dto';
import { RegistrationConfirmInputDto } from '../input-dto/registration-confirm.input-dto';
import { RegistrationEmailResendingInputDto } from '../input-dto/registration-email-resending.input-dto';
import { PasswordRecoveryInputDto } from '../input-dto/password-recovery.input-dto';
import { NewPassword } from '../input-dto/new-password.input-dto';
import { HttpStatusCodes } from 'src/core/constants/http-codes.constants';
import { CurrentUserFromRequest } from '../../guards/decorators/params/current-user.param-decorator';
import { LocalAuthGuard } from '../../guards/local/local-auth.guard';
import { JwtAuthGuard } from '../../guards/bearer/jwt-auth.guard';
import { UserSessionViewDto } from '../view-dto/user-session.view-dto';
import { RegisterUserCommand } from '../../application/use-cases/users/register-user.use-case';
import { ConfirmationRegistrationCommand } from '../../application/use-cases/users/confirm-register.use-case';
import { PasswordRecoveryCommand } from '../../application/use-cases/users/password-recovery.use-case';
import { NewPasswordCommand } from '../../application/use-cases/users/new-password.use-case';
import { LoginCommand } from '../../application/use-cases/users/login.use-case';
import { MeQuery } from '../../application/queries/me.query';
import { ApiLoginSwagger } from '../decorators/auth/swagger/login-swagger.decorator';
import { ApiPasswordRecoverySwagger } from '../decorators/auth/swagger/password-recovery-swagger.decorator';
import { ApiNewPasswordSwagger } from '../decorators/auth/swagger/new-password-swagger.decorator';
import { ApiRegistrationConfirmationSwagger } from '../decorators/auth/swagger/registration-confirm-swagger.decorator';
import { ApiRegistrationSwagger } from '../decorators/auth/swagger/registration-swagger.decorator';
import { ApiRegistrationEmailResendingSwagger } from '../decorators/auth/swagger/registration-email-resending-swagger.decorator';
import { ApiGetMeSwagger } from '../decorators/auth/swagger/get-me-swagger.decorator';

@Controller(API_ROUTES.authorization)
export class AuthController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  @ApiLoginSwagger('Try login user to the system')
  @Post('login')
  @HttpCode(HttpStatusCodes.OK_200)
  @UseGuards(LocalAuthGuard) // LocalAuthGuard запускает LocalStrategy.validate → кладёт { id } в req.user → контроллер берёт id и генерирует токен.
  async login(
    @CurrentUserFromRequest() currentUser: { id: string },
    @Res({ passthrough: true })
    response: Response,
  ): Promise<{
    accessToken: string;
  }> {
    const { accessToken, refreshToken, expiresAt } =
      await this.commandBus.execute<
        LoginCommand,
        { accessToken: string; refreshToken: string; expiresAt: number }
      >(new LoginCommand(currentUser.id));

    response.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: expiresAt,
    });

    return { accessToken };
  }

  @ApiPasswordRecoverySwagger(
    'Password recovery via email confirmation. Email should be sent with RecoveryCode inside',
  )
  @Post('password-recovery')
  @HttpCode(HttpStatusCodes.NO_CONTENT_204)
  passwordRecovery(@Body() dto: PasswordRecoveryInputDto): Promise<void> {
    return this.commandBus.execute(new PasswordRecoveryCommand(dto.email));
  }

  @ApiNewPasswordSwagger('Confirm password recovery')
  @Post('new-password')
  @HttpCode(HttpStatusCodes.NO_CONTENT_204)
  newPassword(@Body() dto: NewPassword): Promise<void> {
    return this.commandBus.execute(
      new NewPasswordCommand(dto.newPassword, dto.recoveryCode),
    );
  }

  @ApiRegistrationConfirmationSwagger('Confirm registration')
  @Post('registration-confirmation')
  @HttpCode(HttpStatusCodes.NO_CONTENT_204)
  confirmRegistration(@Body() dto: RegistrationConfirmInputDto): Promise<void> {
    return this.commandBus.execute(
      new ConfirmationRegistrationCommand(dto.code),
    );
  }

  @ApiRegistrationSwagger(
    'Registration in the system. Email with confirmation code will be send to passed email address',
  )
  @Post('registration')
  @HttpCode(HttpStatusCodes.NO_CONTENT_204)
  registration(@Body() dto: CreateUserInputDto): Promise<void> {
    return this.commandBus.execute(new RegisterUserCommand(dto));
  }

  @ApiRegistrationEmailResendingSwagger(
    'Resend confirmation registration  email if user exist',
  )
  @Post('registration-email-resending')
  @HttpCode(HttpStatusCodes.NO_CONTENT_204)
  registrationEmailResending(
    @Body() dto: RegistrationEmailResendingInputDto,
  ): Promise<void> {
    return this.commandBus.execute(
      new ResendConfirmationEmailCommand(dto.email),
    );
  }

  @ApiGetMeSwagger('Get info about current user')
  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(
    @CurrentUserFromRequest() currentUser: { id: string },
  ): Promise<UserSessionViewDto> {
    return this.queryBus.execute(new MeQuery(currentUser.id));
  }
}
