import express, { Express, Request, Response } from "express";
import { db } from "./db/mock.db";

export const setupApp = (app: Express) => {
  app.use(express.json());

  app.get("/", (_req: Request, res: Response) => {
    res.status(200).json("Hello back");
  });

  app.get("/blogs", (_req: Request, res: Response) => {
    const blogs = db.blogs;

    res.status(200).json(blogs);
  });

  app.get("/posts", (_req: Request, res: Response) => {
    const posts = db.posts;

    res.status(200).json(posts);
  });

  app.delete("/testing/all-data", (_req: Request, res: Response) => {
    db.blogs = [];
    db.posts = [];

    res.sendStatus(204);
  });

  return app;
};
