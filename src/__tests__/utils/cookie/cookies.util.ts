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
  const refreshCookie = cookies.find((c) => /^refreshToken=/i.test(c.trim()));

  if (!refreshCookie) {
    throw new Error(
      `refreshToken cookie was not set. Got Set-Cookie: ${JSON.stringify(cookies)}`
    );
  }

  return refreshCookie.split(";")[0];
}
