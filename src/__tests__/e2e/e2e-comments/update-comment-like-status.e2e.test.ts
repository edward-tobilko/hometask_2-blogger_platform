import express from "express";
// import request from "supertest";

import { setupApp } from "app";
import { runMongoose, stopMongoose } from "db/mongoose.db";
import { clearDb } from "../utils/clear-db";

describe("E2E comments like status tests", () => {
  const app = express();

  beforeAll(async () => {
    await runMongoose();

    setupApp(app);
  });

  beforeEach(async () => {
    await clearDb();
  });

  afterAll(async () => {
    await stopMongoose();
  });

  it("Upsert like / dislike / statusLike for comments and posts", async () => {});
});
