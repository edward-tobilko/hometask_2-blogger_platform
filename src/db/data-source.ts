import { config } from 'dotenv';
import { DataSource } from 'typeorm';

config({
  path: [
    process.env.ENV_FILE_PATH?.trim() || '', // внешний путь (Docker / CI передаёт переменную) - для DevOps
    `.env.${process.env.NODE_ENV}.local`, // .env.development.local / .env.testing.local
    `.env.${process.env.NODE_ENV}`, // .env.development / .env.testing
    '.env.development', // fallback — если ничего выше не нашло переменную
  ],
  quiet: true,
});

if (!process.env.POSTGRES_URI) {
  throw new Error(`POSTGRES_URI is empty for NODE_ENV=${process.env.NODE_ENV}`);
}

export default new DataSource({
  type: 'postgres',
  schema: 'public',
  url: process.env.POSTGRES_URI,
  entities: [__dirname + '/../**/*-orm.entity{.ts,.js}'],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  synchronize: false,
  uuidExtension: 'pgcrypto',
});

// ? __dirname - папка, где лежит текущий файл в момент выполнения (local -> src/db, prod -> dist/db).
