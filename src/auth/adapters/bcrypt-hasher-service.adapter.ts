import bcrypt from "bcrypt";

const SALT_ROUNDS = Number(process.env.SALT_ROUNDS ?? 10);
export class BcryptPasswordHasher {
  async generateHash(password: string): Promise<string> {
    const saltRounds = await bcrypt.genSalt(SALT_ROUNDS);

    return bcrypt.hash(password, saltRounds);
  }

  async checkPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
