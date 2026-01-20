/** @type {import("jest").Config} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src"],
  moduleFileExtensions: ["ts", "tsx", "js", "json", "node"],

  // ! ищем тесты только в файлах .test.ts и .e2e.ts
  testMatch: ["**/__tests__/**/*.test.ts", "**/__tests__/**/*.e2e.ts"],

  // ! НЕ выполнять утилиты, если они остались в ../utils
  testPathIgnorePatterns: ["/node_modules/", "<rootDir>/src/../utils/"],

  clearMocks: true,
  coverageDirectory: "coverage",
  transform: {
    ...require("ts-jest").createDefaultPreset().transform,
  },

  // * сериализуем запуск (аналог -i), чтобы не было гонок с общим db
  maxWorkers: 1,
};
