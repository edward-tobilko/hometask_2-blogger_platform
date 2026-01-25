import { Router } from "express";
import { param } from "express-validator";

import { getSecurityDevicesHandler } from "./http-handlers/get-security-devices.handler";
import { removeSecurityDevicesSessionsHandler } from "./http-handlers/remove-sd-sessions.handler";
import { removeDeviceByIdHandler } from "./http-handlers/remove-sd-by-deviceId.handler";
import { inputResultMiddlewareValidation } from "@core/middlewares/validation/input-result.middleware-validation";

export const securityDevicesRouter = Router({});

// * GET: Returns all devices with active sessions for current user.
securityDevicesRouter.get("", getSecurityDevicesHandler);

// * DELETE: Terminate all other (exclude current) device's sessions.
securityDevicesRouter.delete("", removeSecurityDevicesSessionsHandler);

// * DELETE: Terminate specified device session.
securityDevicesRouter.delete(
  "/:deviceId",

  param("deviceId")
    .exists()
    .withMessage("deviceId is required")
    .isString()
    .withMessage("deviceId must be a string")
    .trim()
    .notEmpty()
    .withMessage("deviceId must not be empty")
    .isUUID()
    .withMessage("deviceId must be a valid UUID"),

  inputResultMiddlewareValidation,
  removeDeviceByIdHandler
);
