import { ObjectId } from "mongodb";

import { userCollection } from "../../db/mongo.db";
import { UserDB } from "db/types.db";

interface IEmailConfirmationUpdate {
  confirmationCode: string;
  expirationDate: Date;
  isConfirmed: boolean;
}

export class UserRepository {
  async createUserRepo(user: UserDB): Promise<UserDB> {
    const insertResult = await userCollection.insertOne(user);

    user._id = insertResult.insertedId;

    return user;
  }

  async deleteUserRepo(id: string): Promise<boolean> {
    const isDeleted = await userCollection.deleteOne({ _id: new ObjectId(id) });

    return isDeleted.deletedCount === 1;
  }

  async updateEmailUserConfirmationStatus(userId: ObjectId) {
    const result = await userCollection.updateOne(
      { _id: userId },

      {
        $set: {
          "emailConfirmation.isConfirmed": true,
        },
      }
    );

    return result.modifiedCount === 1;
  }

  async updateEmailUserConfirmation(
    userId: ObjectId,
    emailConfirmation: IEmailConfirmationUpdate
  ) {
    const result = await userCollection.updateOne(
      { _id: userId },

      {
        $set: {
          "emailConfirmation.confirmationCode":
            emailConfirmation.confirmationCode,
          "emailConfirmation.expirationDate": emailConfirmation.expirationDate,
          "emailConfirmation.isConfirmed": true,
        },
      }
    );

    return result.modifiedCount === 1;
  }
}
