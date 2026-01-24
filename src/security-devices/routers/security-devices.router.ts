import { Router } from "express";

import { getSecurityDevicesHandler } from "./http-handlers/get-security-devices.handler";
import { removeSecurityDevicesSessionsHandler } from "./http-handlers/remove-sd-sessions.handler";
import { removeDeviceByIdHandler } from "./http-handlers/remove-sd-by-deviceId.handler";

export const securityDevicesRouter = Router({});

// * GET: Returns all devices with active sessions for current user.
securityDevicesRouter.get("", getSecurityDevicesHandler);

// * DELETE: Terminate all other (exclude current) device's sessions.
securityDevicesRouter.delete("", removeSecurityDevicesSessionsHandler);

// * DELETE: Terminate specified device session.
securityDevicesRouter.delete("/:deviceId", removeDeviceByIdHandler);
