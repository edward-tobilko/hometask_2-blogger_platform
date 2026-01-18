import request from "supertest";
import { Express } from "express";

import { routersPaths } from "@core/paths/paths";

export const setAuthLogout = (app: Express, refreshCookie: string) => {
  return request(app)
    .post(`${routersPaths.auth}/logout`)
    .set("Cookie", refreshCookie);
};
