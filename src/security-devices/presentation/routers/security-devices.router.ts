import { Router } from "express";
import { param } from "express-validator";

import { inputResultMiddlewareValidation } from "@core/middlewares/validation/input-result.middleware-validation";
import { SecurityDevicesController } from "../controllers/security-devices.controller";
import { jwtRefreshAuthGuard } from "@auth/presentation/guards/jwt-refresh-auth.guard";
import { IJWTService } from "@auth/application/interfaces/jwt-service.interface";
import { ISessionRepository } from "@auth/application/interfaces/session-repo.interface";

export const createSecurityDevicesRouter = (
  securityDevicesController: SecurityDevicesController,
  jwtService: IJWTService,
  sessionRepo: ISessionRepository
) => {
  const securityDevicesRouter = Router({});

  // * GET: Returns all devices with active sessions for current user.
  securityDevicesRouter.get(
    "",
    jwtRefreshAuthGuard(jwtService, sessionRepo),

    securityDevicesController.getSecurityDevicesHandler.bind(
      securityDevicesController
    )
  );

  // * DELETE: Terminate all other (exclude current) device's sessions.
  securityDevicesRouter.delete(
    "",
    jwtRefreshAuthGuard(jwtService, sessionRepo),

    securityDevicesController.removeSecurityDevicesSessionsHandler.bind(
      securityDevicesController
    )
  );

  // * DELETE: Terminate specified device session.
  securityDevicesRouter.delete(
    "/:deviceId",
    jwtRefreshAuthGuard(jwtService, sessionRepo),

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
