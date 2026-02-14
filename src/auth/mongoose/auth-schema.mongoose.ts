import {
  HydratedDocument,
  Schema,
  model,
  Types as MongooseTypes,
} from "mongoose";

export type SessionDb = {
  userId: MongooseTypes.ObjectId;
  login: string;

  sessionId: string; // будет в cookie refreshToken (refreshToken = sessionId)
  deviceId: string; // uuid
  ip: string;
  userDeviceName: string; // user-agent title ("Chrome", "Jest", "iPhone"...)
  refreshToken: string;

  lastActiveDate: Date; // обновляем только при refresh (last visit)
  expiresAt: Date; // дата окончания (когда токен протухнет сам, если установлен TTL (time-to-live) d mongodb)
  //   createdAt: Date; // дата создания

  refreshIat: number; // защита от повторного использ. токена (проверяет, последний ли был выданий токен)
};

export type SessionLean = SessionDb & { _id: MongooseTypes.ObjectId };
export type SessionDocument = HydratedDocument<SessionDb>;

const SessionSchema = new Schema<SessionDb>(
  {
    userId: { type: MongooseTypes.ObjectId, required: true, ref: "user" },

    login: {
      type: String,
      required: [true, "Login is required"],
      minLength: [3, "Login length should be from 3 to 10"],
      maxLength: [10, "Login length should be from 3 to 10"],
      match: [
        /^[a-zA-Z0-9_-]*$/,
        "Login must contain only letters, numbers, _ or -",
      ],
    },

    sessionId: { type: String, required: true },
    deviceId: {
      type: String,
      required: true,
      match:
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    },

    ip: { type: String, required: true },
    userDeviceName: { type: String, required: true, maxLength: 200 },

    refreshToken: { type: String },

    lastActiveDate: { type: Date, required: true },
    expiresAt: { type: Date, required: true },
    // createdAt: { type: Date },

    refreshIat: { type: Number, required: true },
  },
  {
    versionKey: false,
    timestamps: true, // автоматически добавляет createdAt та updatedAt
  }
);

export const SessionModel = model<SessionDb>("login-session", SessionSchema);

// * TTL что бы «протухшие» сессии убирались автоматически
SessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// * что бы не было дублировань
SessionSchema.index({ sessionId: 1 }, { unique: true });
SessionSchema.index({ userId: 1, deviceId: 1 }, { unique: true });

// ? ref - ссылка на коллекцию: ref = users collection. Без этой ссылки мы не можем использовать method populate().
