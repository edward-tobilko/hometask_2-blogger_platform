import { Router } from "express";
import { param } from "express-validator";

import { inputResultMiddlewareValidation } from "@core/middlewares/validation/input-result.middleware-validation";
import { SecurityDevicesController } from "./security-devices.controller";

export const createSecurityDevicesRouter = (
  securityDevicesController: SecurityDevicesController
) => {
  const securityDevicesRouter = Router({});

  // * GET: Returns all devices with active sessions for current user.
  securityDevicesRouter.get(
    "",

    securityDevicesController.getSecurityDevicesHandler.bind(
      securityDevicesController
    )
  );

  // * DELETE: Terminate all other (exclude current) device's sessions.
  securityDevicesRouter.delete(
    "",

    securityDevicesController.removeSecurityDevicesSessionsHandler.bind(
      securityDevicesController
    )
  );

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

    securityDevicesController.removeDeviceByIdHandler.bind(
      securityDevicesController
    )
  );

  return securityDevicesRouter;
};
