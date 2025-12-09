import { query } from "express-validator";

import {
  DEFAULT_PAGE_NUMBER,
  DEFAULT_PAGE_SIZE,
  DEFAULT_SORT_DIRECTION,
} from "../../helpers/set-default-sort-pagination.helper";
import { SortDirections } from "../../types/sort-directions.enum";

export function queryPaginationAndSortingValidation<T extends string>(
  sortFieldEnum: Record<string, T> // Record<string, T> - тип объекта, где ключи типа string, значения типа Т
) {
  return [
    query("sortBy")
      .customSanitizer((value) => {
        return !value
          ? Object.values(sortFieldEnum)[0] // Дефолтное значение - первое поле
          : value;
      })
      .isIn(Object.values(sortFieldEnum))
      .withMessage(
        `Allowed sort fields: ${Object.values(sortFieldEnum).join(", ")}`
      ),

    query("sortDirection")
      .customSanitizer((value) => {
        if (!value) return DEFAULT_SORT_DIRECTION;

        return String(value).toLowerCase();
      })
      .isIn(Object.values(SortDirections))
      .withMessage(
        `Sort direction must be one of: ${Object.values(SortDirections).join(", ")}`
      ),

    query("pageNumber")
      .customSanitizer((value) =>
        value === undefined || value === ""
          ? DEFAULT_PAGE_NUMBER
          : Number(value)
      )
      .isInt({ min: 1 })
      .toInt()
      .withMessage("Page number must be a positive integer"),

    query("pageSize")
      .customSanitizer((value) =>
        value === undefined || value === "" ? DEFAULT_PAGE_SIZE : Number(value)
      )
      .isInt({ min: 1 })
      .toInt()
      .withMessage("Page size must be a positive integer"),

    query("searchLoginTerm")
      .optional()
      .isString()
      .trim()
      .isLength({ min: 1 })
      .withMessage("searchLoginTerm must be non empty string"),

    query("searchEmailTerm")
      .optional()
      .isString()
      .trim()
      .isLength({ min: 1 })
      .withMessage("searchEmailTerm must be non empty string"),
  ];
}
