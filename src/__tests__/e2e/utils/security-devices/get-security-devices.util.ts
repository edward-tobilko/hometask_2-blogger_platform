import request from "supertest";
import { Express } from "express";

import { HTTP_STATUS_CODES } from "@core/result/types/http-status-codes.enum";
import { routersPaths } from "@core/paths/paths";

export interface ISecurityDevicesTest {
  ip: string;
  title: string;
  lastActiveDate: string;
  deviceId: string;
}

export const securityDevicesPath = `${routersPaths.securityDevices}`;

export async function getSecurityDevices(
  app: Express,
  cookieHeader: string
): Promise<ISecurityDevicesTest[]> {
  const res = await request(app)
    .get(securityDevicesPath)
    .set("Cookie", cookieHeader)
    .expect(HTTP_STATUS_CODES.OK_200);

  return res.body;
}
