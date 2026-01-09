import crypto from "crypto";

export class CryptoHasher {
  static generateTokenHash(refreshToken: string) {
    return crypto.createHash("sha256").update(refreshToken).digest("hex");
  }
}
