import { ApplicationError } from "../../errors/application.error";

export type ApplicationResultBody<D> = {
  data?: D;
  errors?: ApplicationError[];
};
