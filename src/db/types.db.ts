import { ObjectId } from "mongodb";

export type UserDB = {
  _id?: ObjectId;
  login: string;
  email: string;
  createdAt: Date;

  passwordHash: string;

  emailConfirmation: {
    confirmationCode: string;
    expirationDate: Date | null;
    isConfirmed: boolean;
  };
};

export type SessionDB = {
  _id?: ObjectId;
  userId: ObjectId;

  login: string;

  sessionId: string; // будет в cookie refreshToken (refreshToken = sessionId)
  deviceId: string; // uuid
  ip: string;
  userDeviceName: string; // user-agent title ("Chrome", "Jest", "iPhone"...)
  refreshToken: string;

  lastActiveDate: Date; // обновляем при refresh / при запросах, где нужно
  expiresAt: Date; // дата окончания (когда токен протухнет сам)
  createdAt: Date; // дата создания

  refreshIat: number; // проверяет, последний ли был выданий токен
};

export type PostCommentDB = {
  _id?: ObjectId;
  content: string;
  postId: ObjectId;

  commentatorInfo: {
    userId: ObjectId;
    userLogin: string;
  };

  createdAt: Date;
};

export type PostDB = {
  _id?: ObjectId;
  title: string;
  shortDescription: string;
  content: string;
  blogId: ObjectId;
  blogName: string;
  createdAt: Date;
};

export type BlogDB = {
  _id?: ObjectId;
  name: string;
  description: string;
  websiteUrl: string;
  createdAt: Date;
  isMembership: boolean;
};

export type CustomRateLimitDB = {
  _id?: ObjectId;
  ip: string;
  url: string;
  date: Date;
};
