import {
  ISecurityDevicesOutput,
  SecurityDevicesListOutput,
} from "../output/security-devices-type.output";
import { SessionLean } from "auth/mongoose/auth-schema.mongoose";

export function mapSessionToSecurityDevicesListOutput(
  sessions: SessionLean[]
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
