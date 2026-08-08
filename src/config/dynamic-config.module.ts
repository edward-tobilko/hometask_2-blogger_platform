import { ConfigModule } from '@nestjs/config';

export const configModule = ConfigModule.forRoot({
  envFilePath: [
    process.env.ENV_FILE_PATH?.trim() || '', // внешний путь (Docker / CI передаёт переменную) - для DevOps
    `.env.${process.env.NODE_ENV}.local`, // .env.development.local / .env.testing.local
    `.env.${process.env.NODE_ENV}`, // .env.development / .env.testing
    '.env.production', // fallback — если ничего выше не нашло переменную
  ],
  isGlobal: true,
});
