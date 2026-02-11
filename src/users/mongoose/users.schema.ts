import { Schema, model } from "mongoose";

import { IRecoveryPasswordInfo } from "users/interfaces/IUsersRepository";

// * Schema + Model
export type UserDocument = {
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
    recoveryCode: { type: String, require: true },
    expirationDate: { type: Date, require: true },
  },
  { _id: false }
);

const UserSchema = new Schema<UserDocument>(
  {
    login: {
      type: String,
      require: true,
      minLength: 3,
      maxLength: 10,
      match: /^[a-zA-Z0-9_-]*$/,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      toLowerCase: true,
      unique: true,
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

export const UserModel = model<UserDocument>("UserCollection", UserSchema);
