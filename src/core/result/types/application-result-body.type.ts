import { ApplicationError } from "../../errors/application.error";
import { ApplicationResultStatus } from "./application-result-status.enum";

export type ApplicationResultBody<D> = {
  status: ApplicationResultStatus;
  data: D | null;
  errorMessage?: string;
  extensions: ApplicationError[];
};
