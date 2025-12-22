import { authCollection } from "../../db/mongo.db";
import { AuthDomain } from "../domain/auth.domain";

export class AuthRepository {
  async saveAuthMe(authMe: AuthDomain): Promise<void> {
    await authCollection.insertOne({
      email: authMe.email,
      login: authMe.login,
      userId: authMe.userId,
    });
  }
}
