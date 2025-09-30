import { body } from "express-validator";

import { blogsRepository } from "../../../blogs/repositories/blogs.repository";

const titleValidation = body("title")
  .isString()
  .withMessage("Title should be a string")
  .trim()
  .isLength({ max: 30 })
  .withMessage("Title must not exceed 30 characters");

const shortDescription = body("shortDescription")
  .isString()
  .withMessage("Short description should be a string")
  .trim()
  .isLength({ max: 100 })
  .withMessage("Short description must not exceed 100 characters");

const content = body("content")
  .isString()
  .withMessage("Content should be a string")
  .trim()
  .isLength({ max: 1000 })
  .withMessage("Content must not exceed 1000 characters");

const blogId = body("blogId")
  .trim()
  .isNumeric()
  .withMessage("Blog id must be a positive integer")
  .notEmpty()
  .withMessage("Blog id is required")
  .bail()
  .custom((id: string) => {
    const exists = blogsRepository.findBlogById(id);

    if (!exists) throw new Error(`Blog with id=${id} does not exist`);

    return true;
  });

export const postBodyInputValidationMiddleware = [
  titleValidation,
  shortDescription,
  content,
  blogId,
];
