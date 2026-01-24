import { SessionDB } from "db/types.db";
import {
  ISecurityDevicesOutput,
  SecurityDevicesListOutput,
} from "../output/security-devices-type.output";

export function mapSessionToSecurityDevicesListOutput(
  sessions: SessionDB[]
): SecurityDevicesListOutput {
  return sessions.map(
    (session): ISecurityDevicesOutput => ({
      ip: session.ip,
      title: session.userDeviceName,
      lastActiveDate: session.lastActiveDate.toISOString(),
      deviceId: session.deviceId,
    })
  );
}
