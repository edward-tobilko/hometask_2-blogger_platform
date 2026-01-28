import { Collection } from "mongodb";

import { CustomRateLimitDB } from "db/types.db";

export class CustomRateLimitRepo {
  constructor(private readonly collection: Collection<CustomRateLimitDB>) {}

  async addRateLimit(ip: string, url: string): Promise<void> {
    await this.collection.insertOne({ ip, url, date: new Date() });
  }

  async countRateLimit(ip: string, url: string, from: Date): Promise<number> {
    return this.collection.countDocuments({ ip, url, date: { $gte: from } });
  }
}
