import type { Request, Response, NextFunction } from "express";

import { baseAuthGuard } from "auth/api/guards/base-auth.guard";
import { HTTP_STATUS_CODES } from "@core/result/types/http-status-codes.enum";
// import { appConfig } from "@core/settings/config";

// * Create mock config
jest.mock("@core/settings/config", () => ({
  appConfig: {
    ADMIN_USERNAME: "testUser",
    ADMIN_PASSWORD: "testPass123",
  },
}));

describe("baseAuthGuard unit tests", () => {
  // * Создаем мокы
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    mockRequest = { headers: {} };
    mockResponse = { sendStatus: jest.fn() };

    mockNext = jest.fn();

    // Используем console.error, чтобы не загромождать вывод тестов в консоле
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks(); // Очищаем моки после каждого теста
    consoleErrorSpy.mockRestore();
  });

  describe("If authorization is success", () => {
    // * return status 200
    it("should call next() when credentials are valid", async () => {
      const credentials = Buffer.from("testUser:testPass123").toString(
        "base64"
      );

      mockRequest.headers = {
        authorization: `Basic ${credentials}`,
      };

      // * Вызываем basic auth guard middleware
      baseAuthGuard(mockRequest as Request, mockResponse as Response, mockNext);

      // * проверяем, что next() был вызван
      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockResponse.sendStatus).not.toHaveBeenCalled();
    });
  });

  describe("If authorization is not valid", () => {
    // * return status 401
    it("If no authorization header", () => {
      mockRequest.headers = {};

      baseAuthGuard(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.sendStatus).toHaveBeenCalledWith(
        HTTP_STATUS_CODES.UNAUTHORIZED_401
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("If authorization not started with 'Basic'", () => {
      mockRequest.headers!.authorization = "Bearer token"; // no Basic

      baseAuthGuard(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.sendStatus).toHaveBeenCalledWith(
        HTTP_STATUS_CODES.UNAUTHORIZED_401
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("If part of base64 messing", () => {
      mockRequest.headers = {
        authorization: "Basic ",
      };

      baseAuthGuard(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.sendStatus).toHaveBeenCalledWith(
        HTTP_STATUS_CODES.UNAUTHORIZED_401
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("If credentials without ':'", () => {
      const credentials = Buffer.from("testUserPassword").toString("base64");

      mockRequest.headers = {
        authorization: `Basic ${credentials}`,
      };

      baseAuthGuard(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.sendStatus).toHaveBeenCalledWith(
        HTTP_STATUS_CODES.UNAUTHORIZED_401
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("If invalid base64", () => {
      mockRequest.headers = {
        authorization: "Basic !!!invalid-base64!!!",
      };

      baseAuthGuard(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.sendStatus).toHaveBeenCalledWith(
        HTTP_STATUS_CODES.UNAUTHORIZED_401
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("If invalid username", () => {
      const credentials = Buffer.from("wronguser:testPass123").toString(
        "base64"
      );

      mockRequest.headers = {
        authorization: `Basic ${credentials}`,
      };

      baseAuthGuard(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.sendStatus).toHaveBeenCalledWith(
        HTTP_STATUS_CODES.UNAUTHORIZED_401
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("If invalid userpassword", () => {
      const credentials = Buffer.from("testUser:wrongpass").toString("base64");

      mockRequest.headers = {
        authorization: `Basic ${credentials}`,
      };

      baseAuthGuard(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.sendStatus).toHaveBeenCalledWith(
        HTTP_STATUS_CODES.UNAUTHORIZED_401
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("If invalid both of them (username and userpass)", () => {
      const credentials = Buffer.from("wrong:wrong").toString("base64");

      mockRequest.headers = {
        authorization: `Basic ${credentials}`,
      };

      baseAuthGuard(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.sendStatus).toHaveBeenCalledWith(
        HTTP_STATUS_CODES.UNAUTHORIZED_401
      );
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
});

// ? Unit-тесты проверяют только поведение функций.
