import request from "supertest";
import { Express } from "express";

import { routersPaths } from "@core/paths/paths";
import { generateBasicAuthToken } from "../generate-admin-auth-token";
import { UserOutput } from "users/applications/output/user.output";
import { HTTP_STATUS_CODES } from "@core/result/types/http-status-codes.enum";
import { CreateUserRP } from "users/routes/request-payload-types/create-user.request-payload-types";
import { getUserDto } from "./get-user-dto.util";

const defaultUserDto = getUserDto();

export function createUser(app: Express, dto: CreateUserRP) {
  return request(app)
    .post(routersPaths.users)
    .set("Authorization", generateBasicAuthToken())
    .send(dto);
}

export const createUserBodyDto = async (
  app: Express,
  dto: CreateUserRP = defaultUserDto
): Promise<UserOutput> => {
  const result = await createUser(app, dto).expect(
    HTTP_STATUS_CODES.CREATED_201
  );

  return result.body;
};

export function expectUserCreatedResponse(
  body: UserOutput,
  expected: Pick<UserOutput, "login" | "email">
) {
  expect(body).toEqual({
    id: expect.any(String),
    login: expected.login,
    email: expected.email,
    createdAt: expect.any(String),
  });
}
