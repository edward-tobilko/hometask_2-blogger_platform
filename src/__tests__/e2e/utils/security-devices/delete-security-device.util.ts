import request, { Test } from "supertest";
import { Express } from "express";

import { routersPaths } from "@core/paths/paths";

export const securityDevicesPath = `${routersPaths.securityDevices}`;

export function deleteSecurityDeviceById(
  app: Express,
  deviceId: string,
  cookieHeader: string
): Test {
  return request(app)
    .delete(`${securityDevicesPath}/${deviceId}`)
    .set("Cookie", cookieHeader);
}

// ? Type "Test" - гарантитует, что .expect() доступный.
