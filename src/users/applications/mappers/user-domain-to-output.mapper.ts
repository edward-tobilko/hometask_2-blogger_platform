import { UserReadModelType } from "users/mongoose/user-schema.mongoose";
import { UserOutput } from "../output/user.output";

export const mapToUserOutput = (user: UserReadModelType): UserOutput => {
  return {
    id: user._id.toString(),
    login: user.login,
    email: user.email,
    createdAt: user.createdAt.toISOString(),
  };
};
