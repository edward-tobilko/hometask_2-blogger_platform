export interface ICustomRateLimitRepo {
  addRateLimit(ip: string, url: string): Promise<void>;

  countRateLimit(ip: string, url: string, from: Date): Promise<number>;
}
