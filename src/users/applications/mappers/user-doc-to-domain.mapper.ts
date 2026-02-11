import { UserDomain } from "users/domain/user.domain";
import { UserDocument } from "users/mongoose/users.schema";

export function mapUserDocToDomain(userDoc: UserDocument): UserDomain {
  return new UserDomain({
    id: userDoc._id.toString(),
    login: userDoc.login,
    email: userDoc.email,
    createdAt: userDoc.createdAt,
    passwordHash: userDoc.passwordHash,

    emailConfirmation: {
      confirmationCode: userDoc.emailConfirmation.confirmationCode,
      expirationDate: userDoc.emailConfirmation.expirationDate,
      isConfirmed: userDoc.emailConfirmation.isConfirmed,
    },

    recoveryPasswordInfo: userDoc.recoveryPasswordInfo ?? null,
  });
}
