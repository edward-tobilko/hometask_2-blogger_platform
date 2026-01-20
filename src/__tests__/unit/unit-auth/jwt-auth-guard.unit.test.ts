import type { Request, Response, NextFunction } from "express";

import { jwtAuthGuard } from "auth/api/guards/jwt-auth.guard";
import { JWTService } from "auth/adapters/jwt-service.adapter";
import { HTTP_STATUS_CODES } from "@core/result/types/http-status-codes.enum";

jest.mock("auth/adapters/jwt-service.adapter");

describe("jwtAuthGuard unit tests", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  let jwt: jest.Mocked<typeof JWTService>;

  beforeEach(() => {
    req = { headers: {}, user: undefined };
    res = { sendStatus: jest.fn() };
    next = jest.fn();

    jwt = JWTService as jest.Mocked<typeof JWTService>;
  });

  it("401 if Authorization header is missing", async () => {
    await jwtAuthGuard(req as Request, res as Response, next);

    expect(res.sendStatus).toHaveBeenCalledWith(
      HTTP_STATUS_CODES.UNAUTHORIZED_401
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("401 if authType is not Bearer", async () => {
    req.headers = { authorization: "Basic token" };

    await jwtAuthGuard(req as Request, res as Response, next);

    expect(res.sendStatus).toHaveBeenCalledWith(401);
    expect(jwt.verifyAccessToken).not.toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  it("401 if token is missing", async () => {
    req.headers = { authorization: "Bearer " };

    await jwtAuthGuard(req as Request, res as Response, next);

    expect(res.sendStatus).toHaveBeenCalledWith(401);
    expect(jwt.verifyAccessToken).not.toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  it("calls verifyAccessToken with trimmed token even with extra spaces", async () => {
    req.headers = { authorization: "Bearer     token123   " };
    jwt.verifyAccessToken.mockResolvedValue({ userId: "u1" });

    await jwtAuthGuard(req as Request, res as Response, next);

    expect(jwt.verifyAccessToken).toHaveBeenCalledWith("token123");
    expect(next).toHaveBeenCalled();
  });

  it("401 if verifyAccessToken returns null", async () => {
    req.headers = { authorization: "Bearer bad" };
    jwt.verifyAccessToken.mockResolvedValue(null);

    await jwtAuthGuard(req as Request, res as Response, next);

    expect(res.sendStatus).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
    expect(req.user).toBeUndefined();
  });

  it("401 if payload exists but userId is missing", async () => {
    req.headers = { authorization: "Bearer token" };
    jwt.verifyAccessToken.mockResolvedValue({} as any);

    await jwtAuthGuard(req as Request, res as Response, next);

    expect(res.sendStatus).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
    expect(req.user).toBeUndefined();
  });

  it("success: sets req.user and calls next()", async () => {
    req.headers = { authorization: "Bearer token" };
    jwt.verifyAccessToken.mockResolvedValue({ userId: "user-123" });

    await jwtAuthGuard(req as Request, res as Response, next);

    expect(jwt.verifyAccessToken).toHaveBeenCalledWith("token");
    expect(req.user).toEqual({ id: "user-123" });
    expect(next).toHaveBeenCalledTimes(1);
    expect(res.sendStatus).not.toHaveBeenCalled();
  });

  it("401 if verifyAccessToken throws", async () => {
    req.headers = { authorization: "Bearer token" };
    jwt.verifyAccessToken.mockRejectedValue(new Error("boom"));

    await jwtAuthGuard(req as Request, res as Response, next);

    expect(res.sendStatus).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
    expect(req.user).toBeUndefined();
  });
});
