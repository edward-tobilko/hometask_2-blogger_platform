import { INestApplication, ValidationPipe } from '@nestjs/common';

export function pipesSetup(app: INestApplication) {
  // * метод для глобальной регистрации пайпов
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // разрешает @Transform декораторы работать (без этого, например, строки не превратятся в числа)
      whitelist: true, // убирает из DTO поля, которых нет в классе (защита от лишних данных в запросе)
      forbidNonWhitelisted: true, // работает в паре с whitelist — отвергает запрос с ошибкой 400, если есть лишние поля. Без этого whitelist просто проигнорит лишнее поле.
    }),
  );
}
