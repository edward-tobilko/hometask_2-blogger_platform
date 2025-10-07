import { body } from "express-validator";

import { blogsRepository } from "../../blogs/repositories/blogs.repository";
import { ObjectId } from "mongodb";

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

const blogId = body("blogId")
  .exists()
  .withMessage("Blog id is required")
  .bail()
  .isString()
  .withMessage("Blog id must be a string")
  .bail()
  .trim()
  .notEmpty()
  .withMessage("Blog id is required")
  .bail()
  .custom((value) => ObjectId.isValid(value))
  .withMessage("Blog id must be a valid Mongo ObjectId")
  .bail()
  .custom(async (id: string) => {
    const exists = await blogsRepository.findBlogById(id);

    if (!exists) throw new Error(`Blog with id=${id} does not exist`);

    return true;
  });

export const postBodyInputValidationMiddleware = [
  titleValidation,
  shortDescription,
  content,
  blogId,
];
