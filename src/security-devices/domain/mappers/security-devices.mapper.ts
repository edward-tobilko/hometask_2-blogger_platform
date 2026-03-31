import { SessionLean } from "auth/infrastructure/schemas/auth.schema";
import {
  ISecurityDevicesOutput,
  SecurityDevicesListOutput,
} from "security-devices/applications/output/security-devices-type.output";

export class SecurityDevicesMapper {
  static mapSessionToSecurityDevicesListOutput(
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
}
