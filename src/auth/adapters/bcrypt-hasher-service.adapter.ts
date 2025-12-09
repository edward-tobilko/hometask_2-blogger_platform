import bcrypt from "bcrypt";

export class PasswordHasher {
  async generateHash(password: string): Promise<string> {
    const saltRounds = await bcrypt.genSalt(10);

    return bcrypt.hash(password, saltRounds);
  }

  async checkPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
