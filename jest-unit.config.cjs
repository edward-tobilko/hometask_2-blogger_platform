/** @type {import("jest").Config} */

module.exports = {
  displayName: "unit", // Название для логов
  testEnvironment: "node", // Окружение виполнения
  preset: "ts-jest", // Разрешаем запускать TS напрямую, без build

  testMatch: ["<rootDir>/src/__tests__/unit/**/*.(unit.)?(spec|test).ts"], // Где искать Unit-тесты

  // Поля alias (должны соответствовать tsconfig)
  moduleNameMapper: {
    "^app$": "<rootDir>/src/app",
    "^db/(.*)$": "<rootDir>/src/db/$1",
    "^users/(.*)$": "<rootDir>/src/users/$1",
    "^auth/(.*)$": "<rootDir>/src/auth/$1",
    "^blogs/(.*)$": "<rootDir>/src/blogs/$1",
    "^posts/(.*)$": "<rootDir>/src/posts/$1",
    "^comments/(.*)$": "<rootDir>/src/comments/$1",
    "^testing/(.*)$": "<rootDir>/src/testing/$1",
    "^types/(.*)$": "<rootDir>/src/types/$1",

    "^__tests__/(.*)$": "<rootDir>/src/__tests__/$1",
    "^@core/(.*)$": "<rootDir>/src/core/$1",
  },

  // Покрываем только src (без tests)
  collectCoverageFrom: [
    "src/**/*.{ts,js}",
    "!src/**/*.d.ts",
    "!src/**/index.ts",
  ],

  coverageDirectory: "coverage/unit",

  // Чистые мокы без тестов
  clearMocks: true,
  restoreMocks: true,
  resetMocks: true,

  testTimeout: 5000, // Таймаут (unit должны быть быстрыми)
  verbose: true, // Лог-левел
};
