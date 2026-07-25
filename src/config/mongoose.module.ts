import { MongooseModule } from '@nestjs/mongoose';

import { CoreConfig } from 'src/core/core.config';

export const mongooseModule = MongooseModule.forRootAsync({
  inject: [CoreConfig],

  useFactory: (coreConfig: CoreConfig) => {
    const uri = coreConfig.mongoURI;
    const dbName = coreConfig.databaseName;

    return {
      uri: uri,
      dbName: dbName,
    };
  },
});
