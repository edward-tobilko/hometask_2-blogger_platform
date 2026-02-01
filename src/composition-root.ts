import { BcryptPasswordHasher } from "auth/adapters/bcrypt-hasher-service.adapter";
import { UsersService } from "users/applications/user.service";
import { UsersRepository } from "users/repositories/user.repository";
import { UsersQueryRepository } from "users/repositories/users-query.repository";
import { UsersController } from "users/routes/users-controller";

// * Repositories
const usersRepo = new UsersRepository();
const usersQueryRepo = new UsersQueryRepository();
const passwordHasher = new BcryptPasswordHasher();

// * Services
const usersService = new UsersService(
  usersRepo,
  usersQueryRepo,
  passwordHasher
);

// * Controllers
export const usersController = new UsersController(usersService);
