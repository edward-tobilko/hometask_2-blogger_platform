export class AuthRepository {
  async checkUserCredentials(
    loginOrEmail: string,
    password: string
  ): Promise<boolean> {
    return true;
  }

  async loginUser(
    loginOrEmail: string,
    password: string
  ): Promise<{ accessToken: string } | null> {
    return { accessToken: "token" };
  }
}
