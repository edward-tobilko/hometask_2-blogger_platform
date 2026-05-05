import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// * Этот гард вешаем на логин. Через локальную стратегию проверяются логин и пароль пользователя.
@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {}
