import { NestFactory } from '@nestjs/core';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';

import { AppModule } from '../../app.module';
import { BlogOrmEntity } from 'src/modules/bloggers-platform/blogs/infrastructure/sql/schemas/blog-orm.entity';

async function createSeedBlog() {
  if (process.env.NODE_ENV === 'production') {
    console.error('❌ Seed scripts are forbidden in production');

    process.exit(1);
  }

  const app = await NestFactory.createApplicationContext(AppModule); // поднимает Nest-приложение без HTTP-сервера. Нам нужен только DI-контейнер, чтобы достать BlogEntity. Это стандартный паттерн для CLI-скриптов в Nest.

  const blogRepo = app.get<Repository<BlogOrmEntity>>(
    getRepositoryToken(BlogOrmEntity), // получаем токен, по которому достаем BlogOrmEntity из DI
  );

  const COUNT = 100_000; // кол-во елементов
  const PAGE_SIZE = 5_000; // кол-во записей за одну итерацию

  console.log(`Seeding ${COUNT} blogs...`);
  console.time('seed'); // замер реального времени выполнения

  await blogRepo.delete({}); // удаляем старые записи

  for (let i = 0; i < COUNT; i += PAGE_SIZE) {
    const batch = Array.from({ length: PAGE_SIZE }, (_, j) => ({
      name: `Blog ${i + j}`,
      description: `Description for blog ${i + j}`,
      websiteUrl: `https://example-${i + j}.com`,
      createdAt: new Date(
        Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 365, // раандомный createdAt, чтобы сортировка была осмысленной, иначе все записи с одним timestamp и индекс бесполезен.
      ),
      isMembership: false,
    }));

    await blogRepo.insert(batch);

    console.log(`inserted ${i + PAGE_SIZE}/${COUNT}`);
  }

  console.timeEnd('seed'); // замер реального времени выполнения

  await app.close();
}

createSeedBlog().catch((error: unknown) => {
  console.error(error);

  process.exit(1);
});

// ? Тест на то как быстро создать 100 000 блогов.

// ? yarn ts-node src/scripts/seed-blogs.ts - запуск
