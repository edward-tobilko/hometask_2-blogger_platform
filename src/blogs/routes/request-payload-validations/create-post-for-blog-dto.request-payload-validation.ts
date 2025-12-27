import { body } from "express-validator";

const titleValidation = body("title")
  .exists()
  .withMessage("Title is required")
  .bail()
  .isString()
  .withMessage("Title should be a string")
  .bail()
  .trim()
  .notEmpty()
  .withMessage("Title is required")
  .bail()
  .isLength({ max: 30 })
  .withMessage("Title must not exceed 30 characters");

const shortDescription = body("shortDescription")
  .exists()
  .withMessage("Description is required")
  .bail()
  .isString()
  .withMessage("Short description should be a string")
  .bail()
  .trim()
  .notEmpty()
  .withMessage("Description is required")
  .bail()
  .isLength({ max: 100 })
  .withMessage("Description must not exceed 100 characters");

const content = body("content")
  .exists()
  .withMessage("Content is required")
  .bail()
  .isString()
  .withMessage("Content should be a string")
  .bail()
  .trim()
  .notEmpty()
  .withMessage("Content is required")
  .bail()
  .isLength({ max: 1000 })
  .withMessage("Content must not exceed 1000 characters");

export const createPostForBlogDtoRPValidation = [
  titleValidation,
  shortDescription,
  content,
];
