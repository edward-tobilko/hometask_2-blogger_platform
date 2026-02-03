import bcrypt from "bcrypt";
import { injectable } from "inversify";

import { IPasswordHasher } from "auth/interfaces/IPasswordHasher";

const SALT_ROUNDS = Number(process.env.SALT_ROUNDS ?? 10);

@injectable()
export class BcryptPasswordHasher implements IPasswordHasher {
  async generateHash(password: string): Promise<string> {
    const saltRounds = await bcrypt.genSalt(SALT_ROUNDS);

    return bcrypt.hash(password, saltRounds);
  }

  async checkPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
