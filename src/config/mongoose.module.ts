import { MongooseModule } from '@nestjs/mongoose';

import { CoreConfig } from 'src/core/core.config';

export const mongooseModule = MongooseModule.forRootAsync({
  inject: [CoreConfig],

  // * Паттерн (хук) который возвращает конфигурационный объект для модуля. Nest вызовет его один раз при старте приложения.
  useFactory: (coreConfig: CoreConfig) => {
    const uri = coreConfig.mongoURI;
    const dbName = coreConfig.databaseName;

    return {
      uri: uri,
      dbName: dbName,
    };
  },
});
