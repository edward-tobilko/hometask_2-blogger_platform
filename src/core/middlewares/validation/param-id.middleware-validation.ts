import { param, body } from "express-validator";
import { ObjectId } from "mongodb";

export const paramIdValidation = param("id")
  .exists()
  .withMessage("ID is required")
  .isString()
  .withMessage("ID must be a string")
  .trim()
  .notEmpty()
  .withMessage("ID must not be empty")
  .bail()
  .custom((id) => {
    if (!ObjectId.isValid(id)) {
      throw new Error("Incorrect format of ObjectId");
    }
    return true;
  })
  .custom((id, _req) => {
    console.log("PARAM ID FROM VALIDATOR:", id); // show incorrect id

    return true;
  });

export const paramCommentIdValidation = param("commentId")
  .exists()
  .withMessage("Comment ID is required")
  .isString()
  .withMessage("Comment ID must be a string")
  .trim()
  .notEmpty()
  .withMessage("Comment ID must not be empty")
  .bail()
  .custom((id) => {
    if (!ObjectId.isValid(id)) {
      throw new Error("Incorrect format of ObjectId");
    }
    return true;
  })
  .custom((id, _req) => {
    console.log("PARAM ID FROM VALIDATOR:", id); // show incorrect id

    return true;
  });

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
