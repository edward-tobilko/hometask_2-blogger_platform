import { ConfigModule } from '@nestjs/config';

export const configModule = ConfigModule.forRoot({
  envFilePath: [
    process.env.ENV_FILE_PATH?.trim() || '', // внешний путь (Docker / CI передаёт переменную)
    `.env.${process.env.NODE_ENV}.local`, // .env.development.local / .env.testing.local
    `.env.${process.env.NODE_ENV}`, // .env.development / .env.testing
    '.env.production', // fallback — если ничего выше не нашло переменную
  ],
  isGlobal: true, // что бы не импортировать ConfigModule в каждый модуль (добавляет модуль в глобальный scope DI). Но!!! Не уго стоит использовать только для инфраструктурных модулей — ConfigModule, LoggerModule, возможно DatabaseModule. Для бизнес-модулей (BlogsModule, PostsModule) — никогда, потому что это ломает инкапсуляцию и понимание связей между модулями.
});

// ? NestJS читает файлы слева направо — переменная из более раннего файла имеет приоритет над поздним: если NODE_ENV=development и MONGO_URL есть в .env.development.local — берётся оттуда. Если нет — ищется в .env.development. Если нет — в .env.production.
