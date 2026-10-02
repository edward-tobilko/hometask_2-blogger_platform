import { Injectable } from '@nestjs/common';
import bcrypt from 'bcrypt';

import { UserAccountsConfig } from '../../config/user-accounts.config';

@Injectable()
export class CryptoService {
  constructor(private config: UserAccountsConfig) {}

  async generateHash(password: string): Promise<string> {
    const saltRounds = await bcrypt.genSalt(this.config.saltRounds);

    return bcrypt.hash(password, saltRounds);
  }

  compareHash(pass: string, hash: string): Promise<boolean> {
    return bcrypt.compare(pass, hash);
  }
}
