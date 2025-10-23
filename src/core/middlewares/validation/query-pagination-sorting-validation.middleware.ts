import { query } from "express-validator";

import {
  DEFAULT_PAGE_NUMBER,
  DEFAULT_PAGE_SIZE,
  DEFAULT_SORT_DIRECTION,
} from "../../helpers/set-default-sort-pagination.helper";
import { SortDirections } from "../../types/sort-directions.enum";

export function paginationAndSortingValidation<T extends string>(
  sortFieldEnum: Record<string, T>
) {
  return [
    query("sortBy")
      .customSanitizer((value) => {
        return value === undefined || value === ""
          ? Object.values(sortFieldEnum)[0]
          : value;
      })
      .isIn(Object.values(sortFieldEnum))
      .withMessage(
        `Allowed sort fields: ${Object.values(sortFieldEnum).join(", ")}`
      ),

    query("sortDirection")
      .customSanitizer((value) =>
        value === undefined || value === ""
          ? DEFAULT_SORT_DIRECTION
          : String(value).toLowerCase()
      )
      .isIn(Object.values(SortDirections))
      .withMessage(
        `Sort direction must be one of: ${Object.values(SortDirections).join(", ")}`
      ),

    query("pageNumber")
      .customSanitizer((value) =>
        value === undefined || value === "" ? DEFAULT_PAGE_NUMBER : +value
      )
      .isInt({ min: 1 })
      .toInt()
      .withMessage("Page number must be a positive integer"),

    query("pageSize")
      .customSanitizer((value) =>
        value === undefined || value === "" ? DEFAULT_PAGE_SIZE : +value
      )
      .isInt({ min: 1 })
      .toInt()
      .withMessage("Page size must be a positive integer"),
  ];
}
