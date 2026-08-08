// * telegramNotificationsInfo field

module.exports = {
  async up(db) {
    const filter = {
      telegramChatId: { $exists: true },
      telegramNotificationsInfo: { $exists: false },
    };

    await db.collection('user-accounts').updateMany(filter, [
      {
        $set: {
          telegramNotificationsInfo: {
            telegramChatId: '$telegramChatId',
            telegramConfirmationCode: '$telegramConfirmationCode',
          },
        },
      },

      {
        $unset: ['telegramChatId', 'telegramConfirmationCode'],
      },
    ]);
  },

  async down(db) {
    await db.collection('user-accounts').updateMany({}, [
      {
        $set: {
          telegramChatId: '$telegramNotificationsInfo.telegramChatId',
          telegramConfirmationCode:
            '$telegramNotificationsInfo.telegramConfirmationCode',
        },
      },

      {
        $unset: ['telegramNotificationsInfo'],
      },
    ]);
  },
};
