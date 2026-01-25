import request from "supertest";
import { Express } from "express";

import { HTTP_STATUS_CODES } from "@core/result/types/http-status-codes.enum";
import { routersPaths } from "@core/paths/paths";

export const securityDevicesPath = `${routersPaths.securityDevices}`;

export async function deleteSecurityDeviceById(
  app: Express,
  firstUserDeviceId: string,
  anotherUserCookies: string
) {
  return await request(app)
    .delete(`${securityDevicesPath}/${firstUserDeviceId}`)
    .set("Cookie", anotherUserCookies)
    .expect(HTTP_STATUS_CODES.FORBIDDEN_403);
}
