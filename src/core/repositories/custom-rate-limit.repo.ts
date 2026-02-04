import { Collection } from "mongodb";
import { injectable, inject } from "inversify";

import { CustomRateLimitDB } from "db/types.db";
import { ICustomRateLimitRepo } from "@core/interfaces/ICustomRateLimitRepo";
import { Types } from "@core/di/types";

@injectable()
export class CustomRateLimitRepo implements ICustomRateLimitRepo {
  constructor(
    @inject(Types.CustomRateLimitCollection)
    private readonly collection: Collection<CustomRateLimitDB>
  ) {
    if (!this.collection)
      throw new Error("CustomRateLimitCollection is not initialized");
  }

  async addRateLimit(ip: string, url: string): Promise<void> {
    await this.collection.insertOne({ ip, url, date: new Date() });
  }

  async countRateLimit(ip: string, url: string, from: Date): Promise<number> {
    return this.collection.countDocuments({ ip, url, date: { $gte: from } });
  }
}
