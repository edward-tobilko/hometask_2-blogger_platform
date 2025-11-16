import { ApplicationError } from "../errors/application.error";
import { ApplicationResultBody } from "./types/application-result-body.type";
import { ApplicationResultStatus } from "./types/application-result-status.enum";

export class ApplicationResult<D> {
  status: ApplicationResultStatus;
  data: D | null;
  errors?: ApplicationError[];

  constructor(args: ApplicationResultBody<D>) {
    if (args.errors && args.errors.length) {
      this.status = ApplicationResultStatus.Error;
      this.data = null;
      this.errors = args.errors;
    } else {
      this.status = ApplicationResultStatus.Success;
      this.data = args.data;
    }
  }

  hasError() {
    return this.status === ApplicationResultStatus.Error;
  }
}
