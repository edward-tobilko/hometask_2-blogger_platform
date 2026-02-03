import "reflect-metadata";

import express from "express";

import { setupApp } from "./app";
import { runDB } from "./db/mongo.db";
import { appConfig } from "./core/settings/config";

export const app = express();

const bootstrap = async () => {
  // * Render подставляет свой порт, локально — дефолт 8080
  const PORT = Number(process.env.PORT) || 8080;

  try {
    await runDB(appConfig.MONGO_URL);

    setupApp(app);

    const server = app.listen(PORT, "0.0.0.0", () => {
      console.log(`✅ Server running on ${PORT}`);
      console.log(`NODE_ENV=${process.env.NODE_ENV}`);
      console.log("✅ ENTRY:", __filename);
    });

    server.on("error", (err) => {
      console.error("❌ Server error:", err);
      process.exit(1);
    });
  } catch (error) {
    console.error("❌ Failed to start app:", error);
    process.exit(1);
  }
};

bootstrap();

// ? reflect-metadata - это механизм, который позволяет Inversify / декораторам читать метаданные типов.

// ? DI (Dependency injection) - внедрение зависимостей. Нужны для:
// ? - гибкости: зависимости могут быть легко заменены на другие
// ? - легко тестировать (unit): легко внедрять моки вместо реальных зависимостей приложений.
// ? - соблюдение принципа инверсии зависимостей (Dependency Inversion Principle): Код становится зависимым от абстракций, а не от конкретных реализаций.

// ? IoC (Inversion of Control) Container - это объект который занимаеться управлением жизненным циклом других граф-зависимостей (как зависят объекты друг от друга (НЕ КЛАССЫ: UsersService ЗАВИСИТ ОТ UsersRepository, А ОБЪЕКТЫ: usersService ОТ usersRepo)).
