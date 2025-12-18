import { query } from "express-validator";

import { SortDirections } from "../../types/sort-directions.enum";

export function queryPaginationAndSortingValidation<T extends string>(
  sortFieldEnum: Record<string, T> // Record<string, T> - тип объекта, где ключи типа string, значения типа Т
) {
  const allowedSortFields = Object.values(sortFieldEnum);

  return [
    query("sortBy")
      .optional({ checkFalsy: true })
      .isString()
      .trim()
      .isIn(allowedSortFields)
      .withMessage(`Allowed sort fields: ${allowedSortFields.join(", ")}`),

    query("sortDirection")
      .optional({ checkFalsy: true })
      .isString()
      .trim()
      .toLowerCase()
      .isIn(Object.values(SortDirections))
      .withMessage(
        `Sort direction must be one of: ${Object.values(SortDirections).join(", ")}`
      ),

    query("pageNumber")
      .optional({ checkFalsy: true }) // "", undefined → по дэфолту
      .isInt({ min: 1 })
      .withMessage("Page number must be a positive integer")
      .toInt(),

    query("pageSize")
      .optional({ checkFalsy: true }) // "", undefined → по дэфолту
      .isInt({ min: 1 })
      .withMessage("Page size must be a positive integer")
      .toInt(),
  ];
}
