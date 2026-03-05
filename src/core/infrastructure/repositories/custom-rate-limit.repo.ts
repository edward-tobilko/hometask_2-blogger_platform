import { injectable } from "inversify";

import { ICustomRateLimit } from "@core/interfaces/custom-rate-limit.interface";
import { CustomRateLimitModel } from "@core/infrastructure/schemas/custom-rate-limiter.schema";

@injectable()
export class CustomRateLimitRepo implements ICustomRateLimit {
  async addRateLimit(ip: string, url: string): Promise<void> {
    await CustomRateLimitModel.create({ ip, url, date: new Date() });
  }

  async countRateLimit(ip: string, url: string, from: Date): Promise<number> {
    return CustomRateLimitModel.countDocuments({
      ip,
      url,
      date: { $gte: from },
    });
  }
}
