import { ICommandMeta } from "@core/helpers/create-command.helper";

// * WithMeta базируеться на ICommandMeta (один источник правды):
export type WithMeta<T, M extends ICommandMeta = ICommandMeta> = {
  meta: M;
  payload: T;
};
