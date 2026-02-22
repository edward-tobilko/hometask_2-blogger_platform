import express from "express";
import type { Container } from "inversify";

import { setupApp } from "app";
import { initCompositionRoot } from "composition-root";

const createTestApp = () => {
  const app = express();

  // * создаём контейнер для тестов
  const container = initCompositionRoot();

  setupApp(app, container);
};
