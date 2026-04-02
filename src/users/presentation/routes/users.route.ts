import { Router } from "express";
import { query } from "express-validator";

import { UserSortFieldRP } from "../request-payload-types/user-sort-field.request-payload-types";
import { createUserDtoMiddlewareValidations } from "../request-payload-validations/create-user-dto.middleware-validation";
import { baseAuthGuard } from "@auth/presentation/guards/base-auth.guard";
import { UsersController } from "../controllers/users-controller";
import { inputResultMiddlewareValidation } from "@core/middlewares/validation/input-result.middleware-validation";
import { queryPaginationAndSortingValidation } from "@core/middlewares/validation/query-pagination-sorting.middleware-validation";
import { paramIdValidation } from "@core/middlewares/validation/param-id.middleware-validation";

export const createUsersRouter = (usersController: UsersController) => {
  const usersRoute = Router({});

  // * GET: Returns all users
  usersRoute.get(
    "",
    baseAuthGuard,
    queryPaginationAndSortingValidation<UserSortFieldRP>(UserSortFieldRP),
    query("searchLoginTerm").optional({ checkFalsy: true }).isString().trim(),
    query("searchEmailTerm").optional({ checkFalsy: true }).isString().trim(),

    inputResultMiddlewareValidation,

    usersController.getUsersListHandler.bind(usersController)
  );

  // * POST: Add new user to the system
  usersRoute.post(
    "",
    baseAuthGuard,
    createUserDtoMiddlewareValidations,
    inputResultMiddlewareValidation,

    usersController.createUserHandler.bind(usersController)
  );

  // * DELETE: Delete user specified by id
  usersRoute.delete(
    "/:id",
    baseAuthGuard,
    paramIdValidation,
    inputResultMiddlewareValidation,

    usersController.deleteUserHandler.bind(usersController)
  );

  return usersRoute;
};

// ? Если мы не вызываем метод класса, а передаем его как свойство (через точку и без скобок), то этот метод теряет контекст класса usersController, и что бы этого не было, нам нужно забиндить все методы этого класса (.bind(usersController)).

// ? Или же мы можем воспользоваться arrow func, что бы не биндить: Если в контроллере метод объявлен так: getUsersListHandler = async (req, res) => { ... } то он автоматически «захватывает» this из инстанса класса. И тогда можно передавать так: usersController.getUsersListHandler и контекст не потеряется, но если метод объявлен через обычную ф-ю (async getUsersListHandler(req, res) { ... }), то нужно биндить.
