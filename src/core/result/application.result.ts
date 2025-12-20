import { ApplicationError } from "../errors/application.error";
import { ApplicationResultBody } from "./types/application-result-body.type";
import { ApplicationResultStatus } from "./types/application-result-status.enum";

export class ApplicationResult<D = null> {
  status: ApplicationResultStatus;
  data: D | null;
  extensions: ApplicationError[];
  errorMessage?: string;

  constructor(args: ApplicationResultBody<D>) {
    if (args.extensions && args.extensions.length) {
      this.status = ApplicationResultStatus.BadRequest;
      this.data = null;
      this.extensions = args.extensions;
    } else {
      this.status = ApplicationResultStatus.Success;
      this.data = args.data;
      this.extensions = args.extensions;
    }
  }

  hasError() {
    return this.status !== ApplicationResultStatus.Success;
  }
}
