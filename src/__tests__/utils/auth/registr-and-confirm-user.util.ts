import express from "express";

import { getUserDto } from "../users/get-user-dto.util";
import { authRegisterUser } from "./auth-registr.util";
import { setupApp } from "app";
import { HTTP_STATUS_CODES } from "@core/result/types/http-status-codes.enum";
import { userCollection } from "db/mongo.db";
import { authConfirmRegistration } from "./auth-confirm-registr.util";

export async function registerAndConfirmUser() {
  const app = express();
  setupApp(app);

  const userDto = getUserDto();

  // * register
  await authRegisterUser(app, userDto).expect(HTTP_STATUS_CODES.NO_CONTENT_204);

  // * take status code from db
  const user = await userCollection.findOne({ email: userDto.email });

  if (!user) throw new Error("User was not created");

  // * confirm
  await authConfirmRegistration(app, {
    code: user.emailConfirmation.confirmationCode,
  }).expect(HTTP_STATUS_CODES.NO_CONTENT_204);

  return userDto;
}
