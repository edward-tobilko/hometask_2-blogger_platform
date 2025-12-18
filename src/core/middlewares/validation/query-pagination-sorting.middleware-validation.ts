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
      .optional({ checkFalsy: true }) // "", undefined → по дэфолту
      .isInt({ min: 1 })
      .withMessage("Page number must be a positive integer")
      .toInt()
      .default(DEFAULT_PAGE_NUMBER),

    query("pageSize")
      .optional({ checkFalsy: true })
      .isInt({ min: 1 })
      .withMessage("Page size must be a positive integer")
      .toInt()
      .default(DEFAULT_PAGE_SIZE),
  ];
}
