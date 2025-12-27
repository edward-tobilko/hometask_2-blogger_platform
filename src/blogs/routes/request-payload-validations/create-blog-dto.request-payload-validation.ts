import { body } from "express-validator";

const nameValidation = body("name")
  .exists()
  .withMessage("Name is required")
  .bail()
  .isString()
  .withMessage("Name should be a string")
  .bail()
  .trim()
  .notEmpty()
  .withMessage("Name is required")
  .bail()
  .isLength({ max: 15 })
  .withMessage("Name must not exceed 15 characters");

const descriptionValidation = body("description")
  .exists()
  .withMessage("Description is required")
  .bail()
  .isString()
  .withMessage("Description should be a string")
  .bail()
  .trim()
  .notEmpty()
  .withMessage("Description is required")
  .bail()
  .isLength({ max: 500 })
  .withMessage("Description must not exceed 500 characters");

const websiteUrlValidation = body("websiteUrl")
  .exists()
  .withMessage("WebsiteUrl is required")
  .bail()
  .isString()
  .withMessage("Website Url should be a string")
  .bail()
  .trim()
  .notEmpty()
  .withMessage("Website url is required")
  .bail()
  .isLength({ max: 100 })
  .withMessage("Website URL must not exceed 100 characters")
  .bail()
  .isURL({ protocols: ["https"], require_protocol: true })
  .withMessage("Website URL must be a valid https URL");

export const createBlogDtoRPValidation = [
  nameValidation,
  descriptionValidation,
  websiteUrlValidation,
];
