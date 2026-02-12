import { HydratedDocument, Schema, model } from "mongoose";

import { IRecoveryPasswordInfo } from "users/interfaces/IUsersRepository";

// * добавляем _id к UserDb
export type UserDocument = HydratedDocument<UserDb>;

// * Schema + Model
export type UserDb = {
  login: string;
  email: string;
  createdAt: Date;

  passwordHash: string;

  emailConfirmation: {
    confirmationCode: string;
    expirationDate: Date | null;
    isConfirmed: boolean;
  };

  recoveryPasswordInfo?: IRecoveryPasswordInfo | null;
};

const RecoveryPasswordInfoSchema = new Schema(
  {
    recoveryCode: { type: String, required: true },
    expirationDate: { type: Date, required: true },
  },
  { _id: false }
);

const UserSchema = new Schema<UserDb>(
  {
    login: {
      type: String,
      required: true,
      minLength: [3, "Login must be at least 3 characters"],
      maxLength: [10, "Login must be at most 10 characters"],
      match: /^[a-zA-Z0-9_-]*$/,
      trim: true,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      //   unique: true,
      match: [
        /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/,
        "Email must be a valid email",
      ],
    },

    createdAt: {
      type: Date,
      required: true,
      //   default: Date.now, // Устанавливается автоматически
      //   immutable: true, // Нельзя изменить после создания
    },

    passwordHash: {
      type: String,
      required: true,
    },

    emailConfirmation: {
      confirmationCode: {
        type: String,
        required: true,
      },
      expirationDate: {
        type: Date,
        default: null,
      },
      isConfirmed: {
        type: Boolean,
        required: true,
        default: false,
      },
    },

    recoveryPasswordInfo: {
      type: RecoveryPasswordInfoSchema,
      default: null,
    },
  },

  {
    versionKey: false,
    // timestamps: true, // автоматически добавляет createdAt та updatedAt
  }
);

export const UserModel = model<UserDb>("user", UserSchema); // создаем коллекцию user в БД с проверкою типизации с пом. схемы (UserSchema)

// ? HydratedDocument - описывает какой объект я получаю с БД после запросса: HydratedDocument<T> = T + _id + mongoose methods(.save().populate().deleteOne()).
