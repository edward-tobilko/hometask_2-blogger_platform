import ms, { StringValue } from "ms";

export const getSessionExpirationDate = (ttl: string): Date => {
  // * ttl может быть "7d" или число секунд
  const ttlMSec = typeof ttl === "string" ? ms(ttl as StringValue) : ttl * 1000;

  return new Date(Date.now() + ttlMSec);
};
