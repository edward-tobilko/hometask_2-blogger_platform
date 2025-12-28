import { ApplicationResultStatus } from "./types/application-result-status.enum";
import { HTTP_STATUS_CODES } from "./types/http-status-codes.enum";

export function resultCodeToHttpException(
  resultCode: ApplicationResultStatus
): number {
  switch (resultCode) {
    case ApplicationResultStatus.BadRequest: // если к нам пришел код 400
      return HTTP_STATUS_CODES.BAD_REQUEST_400; // то на фронт мы отсылаем 400
    case ApplicationResultStatus.Forbidden:
      return HTTP_STATUS_CODES.FORBIDDEN_403;
    case ApplicationResultStatus.NotAllowed:
      return HTTP_STATUS_CODES.NOT_ALLOWED;
    case ApplicationResultStatus.Unauthorized:
      return HTTP_STATUS_CODES.UNAUTHORIZED_401;
    case ApplicationResultStatus.UnprocessableEntity:
      return HTTP_STATUS_CODES.UNPROCESSABLE_ENTITY_422;
    case ApplicationResultStatus.NotFound:
      return HTTP_STATUS_CODES.NOT_FOUND_404;

    default:
      return HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR_500;
  }
}
