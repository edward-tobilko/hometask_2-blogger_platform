import { Express } from "express";
import request from "supertest";

import { routersPaths } from "@core/paths/paths";
import { generateBasicAuthToken } from "../generate-admin-auth-token";

export function deleteUser(app: Express, userId: string) {
  return request(app)
    .delete(`${routersPaths.users}/${userId}`)
    .set("Authorization", generateBasicAuthToken());
}
