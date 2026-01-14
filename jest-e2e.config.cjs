/** @type {import('jest').Config} */

module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["<rootDir>/src/__tests__/e2e/**/*.test.ts"],
  setupFiles: ["<rootDir>/src/__tests__/e2e/setup-env.ts"],

  forceExit: false,
  detectOpenHandles: true,
  maxWorkers: 1,

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
};
