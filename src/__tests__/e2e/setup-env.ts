import "reflect-metadata";

import path from "path";
import dotenv from "dotenv";

dotenv.config({ path: path.resolve(process.cwd(), ".env.test.local") });

// ? подтягиваем .env.test

// ? запуск одного файла ->  yarn test:e2e --testPathPattern="src/__tests__/e2e/e2e-users/create-user.e2e.test.ts"
// ? запуск всех ->  yarn test:e2e --testPathPattern="src/__tests__/e2e/e2e-users"
