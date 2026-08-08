// * banInfo field

module.exports = {
  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async up(db, client) {
    // TODO: write your migration here.

    await db.collection('user-accounts').updateMany(
      {
        isBanned: { $exists: true }, // filter: документ имеет старые плоские поля (достаточно только одного, все передавать не обязательно) -> нужно мигрировать.
        banInfo: { $exists: false }, // filter: фильтр должен исключать документы у которых уже есть banInfo
      },
      [
        {
          $set: {
            banInfo: {
              isBanned: '$isBanned',
              banReason: '$banReason',
              bannedAt: '$bannedAt',
              banExpiresAt: '$banExpiresAt',
            },
          },
        },

        {
          $unset: ['isBanned', 'banReason', 'bannedAt', 'banExpiresAt'],
        },
      ],
    );
  },

  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async down(db, client) {
    // TODO: write the statements to rollback your migration (if possible)

    await db.collection('user-accounts').updateMany({}, [
      {
        $set: {
          isBanned: '$banInfo.isBanned', // обращаемся к вложенному полю через точку
          banReason: '$banInfo.banReason',
          bannedAt: '$banInfo.bannedAt',
          banExpiresAt: '$banInfo.banExpiresAt',
        },
      },

      {
        $unset: ['banInfo'],
      },
    ]);
  },
};
