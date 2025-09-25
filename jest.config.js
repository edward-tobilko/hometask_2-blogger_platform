const { createDefaultPreset } = require("ts-jest");

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
const config = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src"],
  moduleFileExtensions: ["ts", "tsx", "js", "json", "node"],

  // ищем unit and e2e:
  testMatch: [
    "**/?(*.)+(spec|test).ts",
    "<rootDir>/src/__tests__/e2e/**/*.(spec|test).ts",
  ],

  clearMocks: true,
  coverageDirectory: "coverage",

  transform: {
    ...tsJestTransformCfg,
  },
};

module.exports = config;
