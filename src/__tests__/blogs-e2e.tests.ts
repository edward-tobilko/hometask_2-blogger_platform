import express from "express";
import request from "supertest";

import { setupApp } from "../app";

const BASE_URL = "/blogs";

describe("E2E Blogs API", () => {
  const app = express();
  setupApp(app);

  beforeAll(async () => {
    await request(app).delete("/testing/all-data").expect(204);
  });
});
