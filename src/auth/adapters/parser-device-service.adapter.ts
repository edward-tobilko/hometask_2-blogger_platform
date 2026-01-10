import * as UAParser from "ua-parser-js";
import type { IResult } from "ua-parser-js";

export const parseDeviceTitle = (userAgent: string): string => {
  if (!userAgent) return "Unknown device";

  // * Для тестов Postman special-case
  const ua = userAgent.toLowerCase();
  if (ua.includes("postmanruntime")) return "Postman";

  const parser: IResult = new UAParser.UAParser(userAgent).getResult();

  const browserName = parser.browser.name;
  const osName = parser.os.name;

  if (browserName && osName) return `${browserName} on ${osName}`;
  if (browserName) return browserName;
  if (osName) return osName;

  return userAgent.split(" ")[0] || "Unknown device";
};
