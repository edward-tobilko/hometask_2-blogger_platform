import { UserDomain } from "users/domain/user.domain";
import { UserDb } from "users/mongoose/users.schema";

export const mapUserDomainToDb = (domain: UserDomain): UserDb => {
  return {
    login: domain.login,
    email: domain.email,
    createdAt: domain.createdAt,
    passwordHash: domain.passwordHash,
    emailConfirmation: {
      confirmationCode: domain.emailConfirmation.confirmationCode,
      expirationDate: domain.emailConfirmation.expirationDate,
      isConfirmed: domain.emailConfirmation.isConfirmed,
    },
    recoveryPasswordInfo: domain.recoveryPasswordInfo ?? null,
  };
};
