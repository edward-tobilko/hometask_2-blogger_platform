import { NestFactory } from '@nestjs/core';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { AppModule } from '../app.module';
import { Blog, BlogDocument } from '../blogs/domain/blog.entity';

async function createSeedBlog() {
  if (process.env.NODE_ENV === 'production') {
    console.error('❌ Seed scripts are forbidden in production');

    process.exit(1);
  }

  const app = await NestFactory.createApplicationContext(AppModule); // поднимает Nest-приложение без HTTP-сервера. Нам нужен только DI-контейнер, чтобы достать BlogModel. Это стандартный паттерн для CLI-скриптов в Nest.

  const blogModel = app.get<Model<BlogDocument>>(getModelToken(Blog.name)); // специальный хелпер от @nestjs/mongoose, который генерирует токен для @InjectModel. В скриптах мы не можем использовать сам декоратор, поэтому достаём модель через app.get() по токену.

  const COUNT = 100_000; // кол-во елементов
  const PAGE_SIZE = 5_000; // кол-во страниц

  console.log(`Seeding ${COUNT} blogs...`);
  console.time('seed'); // замер реального времени выполнения

  await blogModel.deleteMany({}); // удаляем старые записи

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

    await blogModel.insertMany(batch, { ordered: false }); // MongoDB-операция пачечной вставки

    console.log(`  inserted ${i + PAGE_SIZE}/${COUNT}`);
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
