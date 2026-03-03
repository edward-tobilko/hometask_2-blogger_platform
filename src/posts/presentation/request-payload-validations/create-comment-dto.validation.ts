import { body, param } from "express-validator";
import { ObjectId } from "mongodb";

export const createCommentDtoRPValidation = [
  param("postId")
    .exists()
    .withMessage("Post ID is required")
    .isString()
    .withMessage("Post ID must be a string")
    .trim()
    .notEmpty()
    .withMessage("Post ID must not be empty")
    .bail()
    .custom((postId) => {
      if (!ObjectId.isValid(postId)) {
        throw new Error("Incorrect format of ObjectId");
      }
      return true;
    }),

  body("content")
    .isString()
    .withMessage("Content must be a string")
    .bail()
    .trim()
    .isLength({ min: 20, max: 300 })
    .withMessage("Content length must be between 20 and 300 symbols"),
];
