export interface IJWTAccessPayload {
  userId: string;
  deviceId?: string;
}

export interface IJWTRefreshPayload {
  userId: string;
  deviceId: string;
  sessionId: string;
  iat: number; // jwt.sign сам его сгенерирует в createRefreshToken
}

export interface IJWTService {
  createAccessToken(userId: string, deviceId?: string): Promise<string>;

  verifyAccessToken(token: string): Promise<IJWTAccessPayload | null>;

  createRefreshToken(
    userId: string,
    deviceId: string,
    sessionId: string
  ): Promise<string>;

  verifyRefreshToken(token: string): Promise<IJWTRefreshPayload | null>;

  getExpirationDate(token: string): Date | null;
}
