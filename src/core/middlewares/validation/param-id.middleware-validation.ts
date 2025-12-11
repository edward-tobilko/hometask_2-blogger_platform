import { param } from "express-validator";

export const paramIdValidation = param("id")
  .exists()
  .withMessage("ID is required")
  .isString()
  .withMessage("ID must be a string")
  .trim()
  .notEmpty()
  .withMessage("ID must not be empty")
  .isMongoId()
  .withMessage("Incorrect format of ObjectId");

export const paramIdForPostsValidation = param("id/posts")
  .exists()
  .withMessage("ID is required")
  .isString()
  .withMessage("ID must be a string")
  .trim()
  .notEmpty()
  .withMessage("ID must not be empty")
  .isMongoId()
  .withMessage("Incorrect format of ObjectId");

//   // * добавляем id валидацию на driverId в теле post
// export const dataIdBodyValidation = body('data.id')
//   .exists()
//   .withMessage('ID in body is required')
//   .custom((value, { req }) => {
//     if (value !== req?.params?.id) {
//       throw new Error('ID in URL param and data body must match');
//     }

//     return true;
//   });

// ? exists() - существует в запросе
// ? isString() - является строкой
// ? isNumeric() - состоит только из цифр

// ? value — это значение data.id
// ? req — это объект запроса
