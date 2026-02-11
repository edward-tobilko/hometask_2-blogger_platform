import { injectable } from "inversify";

import { ICustomRateLimitRepo } from "@core/interfaces/ICustomRateLimitRepo";
import { CustomRateLimitModel } from "@core/mongoose/custom-rate-limiter.schema";

@injectable()
export class CustomRateLimitRepo implements ICustomRateLimitRepo {
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
