export type WithMeta<T> = {
  meta: {
    throwError: boolean;
    transaction: boolean;
  };
  payload: T;
};
