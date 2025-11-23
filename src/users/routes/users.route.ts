import { Router } from "express";

import { GetUsersListHandler } from "./http-handlers/get-users-list.handler";

export const usersRoute = Router();

usersRoute.get("", GetUsersListHandler);
