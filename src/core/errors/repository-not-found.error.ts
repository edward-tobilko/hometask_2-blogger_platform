import { HTTP_STATUS_CODES } from "../utils/http-status-codes.util";
import { ApplicationError } from "./application.error";

export class RepositoryNotFoundError extends ApplicationError {
  constructor(message = "Not found", field: string | null = null) {
    super(field, message, HTTP_STATUS_CODES.NOT_FOUND_404);
  }
}
