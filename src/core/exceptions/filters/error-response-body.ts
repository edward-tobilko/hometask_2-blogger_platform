import { DomainExceptionCode, Extension } from '../domain.exceptions';

export type ErrorResponseBody = {
  timestamp: string;
  path: string | null;
  message: string;
  extensions: Extension[];
  code: DomainExceptionCode;
};
