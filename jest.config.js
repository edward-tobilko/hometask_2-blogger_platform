/** @type {import("jest").Config} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src"],
  moduleFileExtensions: ["ts", "tsx", "js", "json", "node"],

  // ! шукаємо тести тільки в .test.ts та .e2e.ts файлах
  testMatch: ["**/__tests__/**/*.test.ts", "**/__tests__/**/*.e2e.ts"],

  // ! НЕ виконувати утиліти, якщо вони лишилися в ../utils
  testPathIgnorePatterns: ["/node_modules/", "<rootDir>/src/../utils/"],

  clearMocks: true,
  coverageDirectory: "coverage",
  transform: {
    ...require("ts-jest").createDefaultPreset().transform,
  },

  // серіалізуємо запуск (аналог -i), щоб не було гонок зі спільним db
  maxWorkers: 1,
};
