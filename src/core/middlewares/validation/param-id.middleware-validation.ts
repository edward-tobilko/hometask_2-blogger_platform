import { param, body } from "express-validator";
import { ObjectId } from "mongodb";

const objectIdParamValidation = (paramIdName: string) => {
  return param(paramIdName)
    .exists()
    .withMessage(`${paramIdName} is required`)
    .isString()
    .withMessage(`${paramIdName} must be a string`)
    .trim()
    .notEmpty()
    .withMessage(`${paramIdName} must not be empty`)
    .bail()
    .custom((value) => ObjectId.isValid(value))
    .withMessage(`${paramIdName} must be a valid MongoDB ObjectId`);
};

export const paramIdValidation = objectIdParamValidation("id");
export const paramPostIdValidation = objectIdParamValidation("postId");
export const paramCommentIdValidation = objectIdParamValidation("commentId");

// * добавляем id валидацию на blogId в теле post
export const blogIdValidation = body("blogId")
  .exists()
  .withMessage("Blog ID in body is required")
  .custom((value, { req }) => {
    if (String(value) !== String(req?.params?.id)) {
      throw new Error("ID in URL param and data body must match");
    }

    return true;
  });

// ? exists() - существует в запросе
// ? isString() - является строкой
// ? isNumeric() - состоит только из цифр

// ? id — это значение data.id
// ? req — это объект запроса
