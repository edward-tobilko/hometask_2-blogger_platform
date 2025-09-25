import { body } from "express-validator";

const nameValidation = body("name")
  .isString()
  .withMessage("name should be string")
  .trim()
  .isLength({ max: 15 })
  .withMessage("Name must not exceed 15 characters");

const descriptionValidation = body("description")
  .isString()
  .withMessage("description should be string")
  .trim()
  .isLength({ max: 500 })
  .withMessage("Description must not exceed 500 characters");

const websiteUrlValidation = body("websiteUrl")
  .isString()
  .withMessage("websiteUrl should be string")
  .trim()
  .isLength({ max: 100 })
  .withMessage("WebsiteUrl must not exceed 100 characters")
  .matches(
    /^https:\/\/([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$/
  )
  .withMessage("websiteUrl must be a valid https URL");

export const blogBodyInputValidationMiddleware = [
  nameValidation,
  descriptionValidation,
  websiteUrlValidation,
];
