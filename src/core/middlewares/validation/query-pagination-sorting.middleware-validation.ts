import { query } from "express-validator";

const normalizeQuery = (valueQuery: unknown) => {
  const first = Array.isArray(valueQuery) ? valueQuery[0] : valueQuery;

  return typeof first === "string" ? first.trim() : first;
};

export function queryPaginationAndSortingValidation<T extends string>(
  sortFieldEnum: Record<string, T> // Record<string, T> - тип объекта, где ключи типа string, значения типа Т
) {
  const allowedSortFields = Object.values(sortFieldEnum) as T[];
  const allowedDirections = ["asc", "desc"] as const;

  return [
    query("sortBy")
      // * trim ДО optional
      .customSanitizer(normalizeQuery)
      .optional({ checkFalsy: true })
      .isString()
      .bail()
      .isIn(allowedSortFields)
      .withMessage(`Allowed sort fields: ${allowedSortFields.join(", ")}`),

    query("sortDirection")
      // * trim+lowercase ДО optional
      .customSanitizer((value) => {
        const t = normalizeQuery(value);
        return typeof t === "string" ? t.toLowerCase() : t;
      })
      .optional({ checkFalsy: true })
      .isString()
      .bail()
      .isIn(allowedDirections)
      .withMessage(
        `Sort direction must be one of: ${allowedDirections.join(", ")}`
      ),

    query("pageNumber")
      .customSanitizer(normalizeQuery)
      .optional({ checkFalsy: true }) // "", undefined → по дэфолту
      .isInt({ min: 1 })
      .withMessage("Page number must be a positive integer")
      .toInt(),

    query("pageSize")
      .customSanitizer(normalizeQuery)
      .optional({ checkFalsy: true }) // "", undefined → по дэфолту
      .isInt({ min: 1 })
      .withMessage("Page size must be a positive integer")
      .toInt(),
  ];
}
