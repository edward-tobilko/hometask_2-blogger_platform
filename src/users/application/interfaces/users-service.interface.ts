import { ApplicationResult } from "@core/result/application.result";
import { WithMeta } from "@core/types/with-meta.type";
import { CreateUserDtoCommand } from "users/application/commands/user-dto.commands";
import { UserOutput } from "users/application/output/user.output";

export interface IUsersService {
  createUser(
    command: WithMeta<CreateUserDtoCommand>
  ): Promise<ApplicationResult<UserOutput | null>>;

  deleteUser(
    command: WithMeta<{ id: string }>
  ): Promise<ApplicationResult<null>>;
}
