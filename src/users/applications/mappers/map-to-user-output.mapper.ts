import { WithId } from "mongodb";

import { UserDomain } from "../../domain/user.domain";
import { UserOutput } from "../output/user.output";

export const mapToUserOutput = (userDB: WithId<UserDomain>): UserOutput => {
  return {
    id: userDB._id.toString(),
    login: userDB.login,
    email: userDB.email,
    createdAt: userDB.createdAt.toISOString(),
  };
};
