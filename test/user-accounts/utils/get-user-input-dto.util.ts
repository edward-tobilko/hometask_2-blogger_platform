import { randomUUID } from 'crypto';

import { CreateUserInputDto } from 'src/modules/user-accounts/api/input-dto/create-user.input-dto';

export function getUserInputDto(
  payloadValidation?: Partial<CreateUserInputDto>,
): CreateUserInputDto {
  const uniqueUser = randomUUID().slice(0, 6);
  const DEFAULT_PASSWORD = 'qwerty123';

  const payloadDto: CreateUserInputDto = {
    login: `user${uniqueUser}`,
    password: DEFAULT_PASSWORD,
    email: `user${uniqueUser}@example.dev`,
  };

  return { ...payloadDto, ...payloadValidation };
}
