export interface ICustomRateLimit {
  addRateLimit(ip: string, url: string): Promise<void>;
  countRateLimit(ip: string, url: string, from: Date): Promise<number>;
}
