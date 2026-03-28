import bcrypt from "bcrypt";
import { injectable } from "inversify";
import crypto from "crypto";

import { IPasswordHasher } from "auth/application/interfaces/password-hasher.interface";

const SALT_ROUNDS = Number(process.env.SALT_ROUNDS ?? 10);

@injectable()
export class CryptoPasswordHasher implements IPasswordHasher {
  async generateHash(password: string): Promise<string> {
    const saltRounds = await bcrypt.genSalt(SALT_ROUNDS);

    return bcrypt.hash(password, saltRounds);
  }

  async checkPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  async generateTokenHash(refreshToken: string): Promise<string> {
    return crypto.createHash("sha256").update(refreshToken).digest("hex");
  }
}
