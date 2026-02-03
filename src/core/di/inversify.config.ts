import { Container } from "inversify";

import { Types } from "./types";
import { IUsersRepository } from "users/interfaces/IUsersRepository";
import { UsersRepository } from "users/repositories/user.repository";
import { IUsersQueryRepository } from "users/interfaces/IUsersQueryRepository";
import { IUsersService } from "users/interfaces/IUsersService";
import { IUsersQueryService } from "users/interfaces/IUsersQueryService";
import { UsersQueryRepository } from "users/repositories/users-query.repository";
import { UsersService } from "users/applications/user.service";
import { UsersQueryService } from "users/applications/users-query.service";

export const container = new Container({ defaultScope: "Singleton" });

// * Users
container.bind<IUsersRepository>(Types.IUsersRepository).to(UsersRepository);
container
  .bind<IUsersQueryRepository>(Types.IUsersQueryRepository)
  .to(UsersQueryRepository);
container.bind<IUsersService>(Types.IUsersService).to(UsersService);
container
  .bind<IUsersQueryService>(Types.IUsersQueryService)
  .to(UsersQueryService);

// * Auth
container.bind(Types.IPasswordHasher).to();
