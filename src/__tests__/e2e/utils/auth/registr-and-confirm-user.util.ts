import { Express } from "express";

import { getUserDto } from "../users/get-user-dto.util";
import { createAuthRegisterUser } from "./auth-registr.util";
import { HTTP_STATUS_CODES } from "@core/result/types/http-status-codes.enum";
import { createAuthConfirmRegistration } from "./auth-confirm-registr.util";
import { container } from "@core/di/inversify.config";
import { Types } from "@core/di/types";
import { IUsersQueryRepository } from "users/application/interfaces/users-query-repo.interface";

type RegisterUserTestResult = {
  email: string;
  login: string;
  password: string;
};

export async function setRegisterAndConfirmUser(
  app: Express,
  _options?: { email: string; login: string; password: string }
): Promise<RegisterUserTestResult> {
  // * get mock data
  const userDto = getUserDto();

  const { email, login, password } = userDto;

  // * register
  await createAuthRegisterUser(app, userDto).expect(
    HTTP_STATUS_CODES.NO_CONTENT_204
  );

  // * get confirmation code from mongo by IoC
  const usersQueryRepo = container.get<IUsersQueryRepository>(
    Types.IUsersQueryRepository
  );

  // * take status code from db
  const user = await usersQueryRepo.findByEmail(email);

  const confirmCode = user?.emailConfirmation.confirmationCode;

  if (!confirmCode) throw new Error("Email confirmation code not found in DB");

  // * confirm email
  await createAuthConfirmRegistration(app, {
    code: confirmCode,
  }).expect(HTTP_STATUS_CODES.NO_CONTENT_204);

  return {
    email,
    login,
    password,
  };
}
