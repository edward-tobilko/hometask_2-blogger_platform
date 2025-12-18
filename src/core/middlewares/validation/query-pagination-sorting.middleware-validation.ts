import { query } from "express-validator";

import { SortDirections } from "../../types/sort-directions.enum";

const trimString = (queryValue: unknown) =>
  typeof queryValue === "string" ? queryValue.trim() : queryValue;

export function queryPaginationAndSortingValidation<T extends string>(
  sortFieldEnum: Record<string, T> // Record<string, T> - тип объекта, где ключи типа string, значения типа Т
) {
  const allowedSortFields = Object.values(sortFieldEnum);
  const allowedDirections = Object.values(SortDirections);

  return [
    query("sortBy")
      // * trim ДО optional
      .customSanitizer(trimString)
      .optional({ checkFalsy: true })
      .isIn(allowedSortFields)
      .withMessage(`Allowed sort fields: ${allowedSortFields.join(", ")}`),

    query("sortDirection")
      // * trim+lowercase ДО optional
      .customSanitizer((queryValue) => {
        const typeQuery = trimString(queryValue);

        return typeof typeQuery === "string"
          ? typeQuery.toLowerCase()
          : typeQuery;
      })
      .optional({ checkFalsy: true })
      .isIn(allowedDirections)
      .withMessage(
        `Sort direction must be one of: ${allowedDirections.join(", ")}`
      ),

    query("pageNumber")
      .customSanitizer(trimString)
      .optional({ checkFalsy: true }) // "", undefined → по дэфолту
      .isInt({ min: 1 })
      .withMessage("Page number must be a positive integer")
      .toInt(),

    query("pageSize")
      .customSanitizer(trimString)
      .optional({ checkFalsy: true }) // "", undefined → по дэфолту
      .isInt({ min: 1 })
      .withMessage("Page size must be a positive integer")
      .toInt(),
  ];
}
