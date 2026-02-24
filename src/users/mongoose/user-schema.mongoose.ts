import { USERS_COLLECTION_NAME } from "db/collection-names.db";
import {
  HydratedDocument,
  Schema,
  model,
  Types as MongooseTypes,
} from "mongoose";

import { IRecoveryPasswordInfo } from "users/interfaces/IUsersRepository";

// * Date base type
export type UserDb = {
  login: string;
  email: string;
  createdAt: Date;

  passwordHash: string;

  emailConfirmation: {
    confirmationCode: string | null;
    expirationDate: Date | null;
    isConfirmed: boolean;
  };

  recoveryPasswordInfo?: IRecoveryPasswordInfo | null;
};

// * Создание типов для plain objects нужны только для чтения (read), то есть, для query запроссов, для .lean() в query repositories. Нужно для маппинга, что бы не работать с доменом.
export type UserReadModelType = UserDb & { _id: MongooseTypes.ObjectId };

// * Добавляем _id к UserDb
export type UserDocument = HydratedDocument<UserDb>;

// * Schema + Model
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

    // * Так как у нас user может создаваться админом (по дефолту isConfirmed = true) поля: confirmationCode -> required и expirationDate -> required нужно зделать опциональным, но для пользователя: isConfirmed = false.
    emailConfirmation: {
      confirmationCode: {
        type: String,
        default: null,
        required: function (this: any) {
          return this.emailConfirmation.isConfirmed === false;
        },
      },
      expirationDate: {
        type: Date,
        default: null,
        required: function (this: any) {
          return this.emailConfirmation.isConfirmed === false;
        },
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

// * Создаем коллекцию "user" в БД с проверкою типизации с пом. схемы (UserSchema)
export const UserModel = model<UserDb>(
  "User",
  UserSchema,
  USERS_COLLECTION_NAME
);

// ? HydratedDocument - описывает какой объект я получаю с БД после запросса: HydratedDocument<T> = T(UserDb) + _id + mongoose methods(.save().populate().deleteOne()).

// ? model<UserDb> - model это умный класс, через который мы можем работать с коллекцией и объекты в этой коллекции буду соответсвовать конкретной схеме.
