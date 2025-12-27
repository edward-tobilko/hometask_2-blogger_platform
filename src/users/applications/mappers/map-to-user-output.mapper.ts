import { WithId } from "mongodb";

import { UserOutput } from "../output/user.output";
import { UserDB } from "../../../db/types.db";

export const mapToUserOutput = (userDB: WithId<UserDB>): UserOutput => {
  return {
    id: userDB._id.toString(),
    login: userDB.login,
    email: userDB.email,
    createdAt: userDB.createdAt.toISOString(),
  };
};
