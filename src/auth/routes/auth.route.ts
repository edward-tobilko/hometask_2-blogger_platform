import { NextFunction, Request, Response, Router } from "express";

export const authRoute = Router();

authRoute.post("", async (req: Request, res: Response, next: NextFunction) =>
  next()
);
