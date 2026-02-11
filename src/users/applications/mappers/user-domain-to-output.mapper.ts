import { UserDomain } from "users/domain/user.domain";
import { UserOutput } from "../output/user.output";

export const mapToUserOutput = (user: UserDomain): UserOutput => {
  return {
    id: user.id!.toString(),
    login: user.login,
    email: user.email,
    createdAt: user.createdAt.toISOString(),
  };
};
