import { randomUUID } from "crypto";

import { CreateUserRP } from "users/routes/request-payload-types/create-user.request-payload-types";

export function getUserDto(
  payloadValidation?: Partial<CreateUserRP>
): CreateUserRP {
  const uniqueUser = randomUUID().slice(0, 6);
  const DEFAULT_PASSWORD = "qwerty123";

  const payloadDto: CreateUserRP = {
    login: `user${uniqueUser}`,
    password: DEFAULT_PASSWORD,
    email: `user${uniqueUser}@example.dev`,
  };

  return { ...payloadDto, ...payloadValidation };
}
