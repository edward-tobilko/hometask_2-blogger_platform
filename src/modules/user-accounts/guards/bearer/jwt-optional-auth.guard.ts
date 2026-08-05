import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtOptionalAuthGuard extends AuthGuard('jwt') {
  handleRequest(_err: unknown, user: { id: string } | null): any {
    return user ?? null; // не бросаем исключение — просто возвращаем null для анонимных пользователей
  }
}
