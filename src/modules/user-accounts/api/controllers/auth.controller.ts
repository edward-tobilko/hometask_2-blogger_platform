import { Body, Controller, HttpCode, Post } from '@nestjs/common';

import { API_ROUTES } from 'src/core/constants/api-routes';
import { CreateUserInputDto } from '../input-dto/create-user.input-dto';
import { AuthService } from '../../application/services/auth.service';

@Controller(API_ROUTES.authorization)
export class AuthController {
  constructor(private authService: AuthService) {}

  // * POST: Registration in the system. Email with confirmation code will be send to passed email address.
  @Post('registration')
  @HttpCode(204)
  registration(@Body() dto: CreateUserInputDto): Promise<void> {
    const { login, password, email } = dto;
    return this.authService.registerUser(login, password, email);
  }
}
