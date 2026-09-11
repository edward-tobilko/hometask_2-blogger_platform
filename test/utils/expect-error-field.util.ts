import { BadRequestError } from './bad-request-error.util';

export function expectErrorField(result: BadRequestError, field: string) {
  expect(result.errorsMessages).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        message: expect.any(String),
        field,
      }),
    ]),
  );
}
