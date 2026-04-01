import { Express } from "express";
import { createAuthLogin } from "../auth/auth-login.util";
import { HTTP_STATUS_CODES } from "@core/result/types/http-status-codes.enum";

export function extractRefreshTokenCookie(
  setCookieHeader: string[] | string | undefined
): string {
  if (!setCookieHeader || setCookieHeader.length === 0) {
    throw new Error("No Set-Cookie header found");
  }

  const cookies = Array.isArray(setCookieHeader)
    ? setCookieHeader
    : [setCookieHeader];

  // * finding refreshToken
  const refreshCookie = cookies.find((cookie) =>
    /^refreshToken=/i.test(cookie.trim())
  );

  if (!refreshCookie) {
    throw new Error(
      `refreshToken cookie was not set. Got Set-Cookie: ${JSON.stringify(cookies)}`
    );
  }

  return refreshCookie.split(";")[0];
}

export function extractCookies(headers: any): {
  refreshTokenFromCookie: string;
  cookieHeader: string;
} {
  const cookiesArray = Array.isArray(headers["set-cookie"])
    ? headers["set-cookie"]
    : headers["set-cookie"]
      ? [headers["set-cookie"]]
      : [];

  // *  Вытаскеваем refreshToken from cookie
  const refreshTokenFromCookie =
    cookiesArray
      .find((cookie: string) => cookie.startsWith("refreshToken="))
      ?.split(";")[0]
      .replace("refreshToken=", "") || "";

  // * Преобразовуем куки-массив в строку
  const cookieHeader = cookiesArray
    .map((cookie: string) => cookie.split(";")[0])
    .join("; ");

  return { refreshTokenFromCookie, cookieHeader };
}

// * Утилита для логина с извлечением токенов
export async function loginDevice(
  app: Express,
  credentials: { loginOrEmail: string; password: string },
  userAgent: string
) {
  const res = await createAuthLogin(app, credentials, userAgent).expect(
    HTTP_STATUS_CODES.OK_200
  );

  const { refreshTokenFromCookie, cookieHeader } = extractCookies(res.headers);

  return {
    accessToken: res.body.accessToken,
    refreshTokenFromCookie,
    cookies: cookieHeader,
  };
}
