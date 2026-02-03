import { ApplicationResult } from "@core/result/application.result";
import { WithMeta } from "@core/types/with-meta.type";
import { CreateUserDtoCommand } from "users/applications/commands/user-dto.commands";
import { UserOutput } from "users/applications/output/user.output";

export interface IUsersService {
  createUser(
    command: WithMeta<CreateUserDtoCommand>
  ): Promise<ApplicationResult<UserOutput>>;

  deleteUser(
    command: WithMeta<{ id: string }>
  ): Promise<ApplicationResult<boolean>>;
}
