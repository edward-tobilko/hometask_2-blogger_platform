import { UserPlaneObj } from "users/mongoose/user-schema.mongoose";
import { UserOutput } from "../output/user.output";

export const mapToUserOutput = (user: UserPlaneObj): UserOutput => {
  return {
    id: user._id!.toString(),
    login: user.login,
    email: user.email,
    createdAt: user.createdAt.toISOString(),
  };
};
