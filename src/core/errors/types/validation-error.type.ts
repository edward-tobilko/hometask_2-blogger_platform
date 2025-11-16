import { HTTP_STATUS_CODES } from "../../utils/http-status-codes.util";

// * Type for createErrorMessages helper func
export type ValidationErrorType = {
  status: HTTP_STATUS_CODES;
  detail: string;
  source?: string;
  code?: string;
};
